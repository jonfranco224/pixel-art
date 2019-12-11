var Adom = (function (exports) {

function Adom(config) {
  config = config || {};
  this.opcode_cache = {};
  this.cache = config.cache || false;
  this.dirname = config.rootDir || "";
  this.runtimeTransform = config.runtimeTransform;
  this.files = {};
}

function throw_adom_error (err) {
  err.origin = 'adom';
  throw err;
};

Adom.prototype.tokenize = function(prog, file) {
  let cursor = 0,
    end_pos = prog.length - 1;
  let tokens = [{ type: "file_begin", data: file, pos: 0, file: file }];

  let keywords = [
    "tag",
    "doctype",
    "each",
    "if",
    "in",
    "else",
    "import",
    "yield",
    "on",
    "null",
    "export",
    "file",
    "var",
    "const",
    "def"
  ];

  let symbols = [
    ".",
    "#",
    "=",
    "[",
    "]",
    ";",
    "{",
    "}",
    "(",
    ")",
    ":",
    "$",
    ",",
    ">",
    "<",
    "?",
    "@"
  ];

  function break_into_chunks(text, cursor) {
    let chunks = [];
    let chunk = "";
    let i = 0,
      max = text.length;
    let in_expr = false;
    let pos = cursor;
    while (i < max) {
      if (text[i] === "{" && text[i+1] === "{" && in_expr === false) {
        in_expr = true;
        chunks.push({ type: "chunk", data: chunk, pos: pos, file: file });
        chunk = "{";
        i+=2;
        pos = cursor + i;
      } else if (text[i] === "}" && text[i+1] === "}" && in_expr === true) {
        in_expr = false;
        chunk += "}";
        let toks = this.tokenize(chunk, file);
        toks.shift(); //file_begin
        toks.pop(); //eof
        toks.forEach(function(t) {
          t.pos += pos;
          chunks.push(t);
        });
        chunk = "";
        i+=2;
        pos = cursor + i + 1;
      } else {
        chunk += text[i++];
      }
    }
    chunks.push({ type: "chunk", data: chunk, pos: pos, file: file });
    return chunks;
  }

  while (true) {
    let c = prog[cursor];
    let tok = { type: "", data: "", pos: cursor, file: file };

    if (cursor > end_pos) {
      tok.type = "eof";
      tokens.push(tok);
      break;
    } else if (c === " " || c === "\n" || c === "\t") {
      let i = cursor;
      while (
        i <= end_pos &&
        (prog[i] === " " || prog[i] === "\t" || prog[i] === "\n")
      ) {
        i++;
      }
      cursor = i;
      continue;
    } else if (c === "/" && prog[cursor + 1] === "/") {
      let i = cursor;
      while (c !== "\n" && i <= end_pos) c = prog[++i];
      cursor = i;
      continue;
    } else if (c >= "0" && c <= "9") {
      let neg = tokens[tokens.length - 1].type === "-";
      let num = "";
      let i = cursor;
      let dot = false;
      while ((c >= "0" && c <= "9") || c === ".") {
        if (c === ".") {
          if (dot) break;
          else dot = true;
        }
        num += c;
        c = prog[++i];
      }
      cursor = i;
      tok.type = "number";
      tok.data = parseFloat(num);
      if (neg) {
        tok.data *= -1;
        tokens.pop();
      }
    } else if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) {
      let i = cursor;
      tok.data = "";
      while (
        (c >= "a" && c <= "z") ||
        (c >= "A" && c <= "Z") ||
        (c >= "0" && c <= "9") ||
        c === "_" ||
        c === "-"
      ) {
        tok.data += c;
        c = prog[++i];
      }
      cursor = i;
      let idx = keywords.indexOf(tok.data);
      if (idx !== -1) {
        tok.type = keywords[idx];
      } else {
        tok.type = "ident";
      }
      if (tok.data === "true" || tok.data === "false") {
        tok.type = "bool";
        tok.data = tok.data === "true";
      } else if (tok.data === "null") {
        tok.data = null;
      }
    } else if (c === "<" && prog[cursor + 1] === "=") {
      tok.type = "<=";
      tok.data = "<=";
      cursor += 2;
    } else if (c === ">" && prog[cursor + 1] === "=") {
      tok.type = ">=";
      tok.data = ">=";
      cursor += 2;
    } else if (c === "=" && prog[cursor + 1] === "=") {
      tok.type = "==";
      tok.data = "==";
      cursor += 2;
    } else if (c === "!" && prog[cursor + 1] === "=") {
      tok.type = "!=";
      tok.data = "!=";
      cursor += 2;
    } else if (c === "&" && prog[cursor + 1] === "&") {
      tok.type = "&&";
      tok.data = "&&";
      cursor += 2;
    } else if (c === "|" && prog[cursor + 1] === "|") {
      tok.type = "||";
      tok.data = "||";
      cursor += 2;
    } else if (symbols.indexOf(c) !== -1) {
      tok.type = c;
      tok.data = c;
      cursor++;
    } else if (
      c === '"' &&
      prog[cursor + 1] === '"' &&
      prog[cursor + 2] === '"'
    ) {
      let str = "";
      let i = cursor + 3;
      while (true) {
        if (i > end_pos) {
          throw_adom_error({ msg: "unterminated long string", pos: cursor, file: file });
        } else if (
          prog[i] === '"' &&
          prog[i + 1] === '"' &&
          prog[i + 2] === '"'
        ) {
          i += 3;
          break;
        }
        str += prog[i++];
      }
      tokens.push({ type: 'string', pos: cursor, file: file });
      tokens.push({ type: 'chunk', data: str, pos: cursor, file: file })
      cursor = i;
      continue;
    } else if (c === '"' || c === "'") {
      let del = c;
      let i = cursor + 1;
      let text = '';

      while (true) {
        if (i > end_pos || prog[i] === "\n") {
          throw_adom_error({ msg: "unterminated string", pos: cursor, file: file });
        }
        if (prog[i] === del) {
          i++;
          break;
        }
        if (prog[i] === "\\" && prog[i + 1] === del) {
          text += prog[i + 1];
          i += 2;
        }
        text += prog[i++];
      }

      let chunks = break_into_chunks.call(this, text, cursor);
      tokens.push({ type: 'string', pos: cursor, file: file });
      if (chunks.length > 1) {
        chunks.forEach(function(c) {
          tokens.push(c);
        });
      } else {
        tokens.push({ type: 'chunk', data: text, pos: cursor, file: file })
      }
      cursor = i;
      continue;
    } else if (
      c === "-" &&
      prog[cursor + 1] === ">"
    ) {
      let i = cursor + 2;
      while (i <= end_pos) {
        if (
          prog[i] === "\n" &&
          prog[i + 1] === "<" &&
          prog[i + 2] === "-"
        ) {
          i += 4;
          break;
        }
        tok.data += prog[i++];
      }
      if (i > end_pos) {
        throw_adom_error({ msg: "expected closing <-", pos: cursor, file: file });
      }
      cursor = i;
      tok.type = "module_body";
    } else {
      tok.type = tok.data = c;
      cursor++;
    }
    tokens.push(tok);
  }

  return tokens;
};

Adom.prototype.parse = function(tokens) {
  let tok = tokens[0];
  let cursor = 0;
  let files = [];
  let ops = [];
  let dont_emit = false;
  let yield_stack = [];
  let tag_scopes = [];

  function new_context() {
    files.push({
      tags: {},
      modules: {},
      exports: []
    });
  }

  function get_custom_tag(name) {
    let t = files[files.length - 1].tags[name];
    if (!t && tag_scopes.length > 0) {
      t = tag_scopes[tag_scopes.length - 1].tags[name];
    }
    return t;
  }

  function get_module (name) {
    let t = files[files.length - 1].modules[name];
    if (!t && tag_scopes.length > 0) {
      t = tag_scopes[tag_scopes.length - 1].modules[name];
    }
    return t;
  }

  function emit(op, data) {
    if (dont_emit) return;
    let i = { type: op };
    if (data) i.data = data;
    ops.push(i);
    return ops.length - 1;
  }

  function next() {
    tok = tokens[++cursor];
  }

  function set_tok(i) {
    cursor = i - 1;
    next();
  }

  function unexpected() {
    throw_adom_error({ msg: "unexpected " + tok.type, pos: tok.pos, file: tok.file });
  }

  function expect(t) {
    if (tok.type === t) {
      next();
    } else {
      throw_adom_error({
        msg: "expected: " + t + " found: " + tok.type,
        pos: tok.pos,
        file: tok.file
      });
    }
  }

  function accept(t) {
    if (tok.type === t) {
      next();
      return true;
    }
    return false;
  }

  function peek(t) {
    if (tok.type === t) {
      return true;
    }
    return false;
  }

  function parse_string () {
    let data = [];
    let pos = tok.pos;
    let file = tok.file;
    expect('string');
    while (true) {
      let d = tok.data;
      if (accept('chunk')) {
        data.push({ type: 'chunk', data: d });
      } else if (accept('{')) {
        data.push(parse_expr());
        expect('}');
      } else {
        break;
      }
    }
    return { type: 'string', data: data, pos: pos, file: file }
  }

  function parse_acc () {
    let acc = null;

    while (true) {
      if (accept('.')) {
        let p = tok.pos, f = tok.file;
        if (!acc)  acc = [];
        // because .ident is short for ['ident'] as in javascript
        acc.push({
          type: "string",
          data: [{
            type: "chunk",
            data: tok.data
          }],
          pos: p,
          file: f 
        });
        expect('ident');
      } else if (accept('[')) {
        if (!acc) acc = [];
        acc.push(parse_expr());
        expect(']');
      } else {
        break;
      }
    }

    return acc;
  }

  function is_comparison () {
    return peek('==') ||
      peek('<=') ||
      peek('>=') ||
      peek('!=') ||
      peek('>') ||
      peek('<');
  }

  function parse_variable () {
    let ident = tok.data;
    let v = { pos: tok.pos, file: tok.file };
    expect('ident');
    let acc = parse_acc();
    if (acc) {
      acc.unshift({
        type: 'ident',
        data: ident,
        pos: v.pos, file: v.file
      });
      v.type = 'accumulator';
      v.data = acc;
    } else {
      v.type = "ident";
      v.data = ident;
    }
    return v;
  }

  function parse_expr (prec) {
    if (prec == null) prec = 0;
    let expr = { pos: tok.pos, file: tok.file };
    if (peek('number') || peek('bool') || peek('null')) {
      expr.type = tok.type;
      expr.data = tok.data;
      next();
    } else if (peek('string')) {
      expr = parse_string();
    } else if (peek('ident')) {
      expr = parse_variable();
    } else if (accept('(')) {
      let ex = parse_expr();
      expect(')');
      let acc = parse_acc();
      if (acc) {
        acc.unshift(ex);
        expr.type = 'accumulator';
        expr.data = acc;
      } else {
        expr.type = 'parenthetical'
        expr.data = ex;
      }
    } else if (peek('{')) {
      expr.type = 'object';
      expr.data = parse_object();
    } else if (peek('[')) {
      expr.type = 'array';
      expr.data = parse_array();
    } else {
      unexpected();
    }
    if (is_comparison()) {
      let cmp = tok.type;
      let lhs = expr;
      next();
      let rhs = parse_expr(2);
      expr = {
        type: 'comparison',
        op: cmp,
        data: [ lhs, rhs ],
        pos: expr.pos,
        file: expr.file
      };
    }
    if (prec < 2 && (peek('&&') || peek('||'))) {
      let cmp = tok.type;
      let lhs = expr;
      next();
      let rhs = parse_expr(1);
      expr = {
        type: 'comparison',
        op: cmp,
        data: [ lhs, rhs ],
        pos: expr.pos,
        file: expr.file
      };
    }
    if (prec < 1 && accept('?')) {
      expr = {
        type: 'ternary',
        data: [expr],
        pos: expr.pos,
        file: expr.file
      };
      expr.data.push(parse_expr());
      expect(':');
      expr.data.push(parse_expr());
    }
    return expr;
  }

  function parse_object() {
    let obj = {};
    expect("{");
    if (!peek('}')) {
      while (true) {
      	let key = tok.data;
      	expect("ident");
      	expect(":");
        obj[key] = parse_expr();
      	if (!accept(",")) break;
      }
    }
    expect("}");
    return obj;
  }

  function parse_array() {
    let arr = [];
    expect("[");
    if (!peek(']')) {
      while (true) {
        arr.push(parse_expr());
        if (!accept(",")) break;
      }
    }
    expect("]");
    return arr;
  }

  function parse_textnode() {
    let chunks = [];
    while (true) {
      chunks.push(tok.data);
      expect("chunk");
      if (!accept("{")) break;
      chunks.push(parse_expr());
      expect("}");
    }
    return chunks;
  }

  function parse_class_list() {
    let classes = [];
    while (true) {
      if (!accept(".")) break;
      classes.push({
        type: "string",
        data: [{
          type: 'chunk',
          data: tok.data
        }],
        pos: tok.pos,
        file: tok.file
      });
      expect("ident");
    }
    return {
      type: "array",
      data: classes
    };
  }

  function parse_attributes() {
    let attr = {};
    let events = [];
    while (true) {
      let key = tok.data;
      if (accept("#")) {
        let pos = tok.pos;
        let file = tok.file;
        let mname = tok.data;
        let m = get_module(mname);
        expect("ident");
        if (!m && !dont_emit) {
          throw_adom_error({ msg: "unknown controller: " + mname, pos: pos, file: file });
        }
        if (!dont_emit) {
          attr.controller = {
            name: m.name,
            body: m.body,
            deps: m.deps,
            pos: pos,
            file: file
          };
        }
      } else if (accept("ident")) {
        if (accept("=")) {
          if (accept("{")) {
            attr[key] = parse_expr();
            expect("}");
          } else if (peek("string")) {
            attr[key] = parse_string();
          } else {
            throw_adom_error({
              msg: "unexpected " + tok.type,
              pos: tok.pos,
              file: tok.file
            });
          }
        } else {
          attr[key] = { type: "bool", data: true };
        }
      } else if (accept("on")) {
        expect(":");
        let evt = tok.data;
        expect("ident");
        expect("=");
        expect("{");
        let handler = tok.data
        let sync = false;
        if (accept('@')) {
          handler = tok.data;
          sync = true;
        }
        expect("ident");
        expect("}");
        events.push({ type: evt, handler: handler, sync: sync });
      } else {
        break;
      }
    }
    return [attr, events];
  }

  function end_tag(name, attr, events) {
    if (accept(";")) {
      emit("begin_tag", {
        name: name,
        self_close: true,
        attributes: attr,
        events: events
      });
    } else if (accept("[")) {
      emit("begin_tag", { name: name, attributes: attr, events: events });
      parse_tag_list();
      expect("]");
      emit("end_tag");
    } else if (peek("string")) {
      let str = parse_string();
      emit("begin_tag", { name: name, attributes: attr, events: events });
      if (str.data.length > 1 || str.data[0] !== '')
        emit("textnode", str);
      emit("end_tag");
    } else {
      unexpected();
    }
  }

  function parse_tag() {
    let name = tok.data;
    expect("ident");
    let classlist = parse_class_list();
    let attr_data = parse_attributes();
    let events = attr_data[1];
    let attr = attr_data[0];
    let custom = get_custom_tag(name);
    if (classlist.data.length > 0) attr.class = classlist;
    if (custom && !dont_emit) {
      if (accept("[")) {
        let ret = cursor;
        dont_emit = true;
        parse_tag_list();
        dont_emit = false;
        expect("]");
        let end_ret = cursor;
        set_tok(custom.pos);
        emit("push_props", { props: attr, events: events });
	      tag_scopes.push(custom.scope);
	      yield_stack.push(function(y) {
          set_tok(ret);
          parse_tag_list();
          expect("]");
          set_tok(y);
        });
        parse_tag_list();
	      yield_stack.pop();
	      tag_scopes.pop();
        emit("pop_props");
        set_tok(end_ret);
      } else {
        expect(";");
        let ret = cursor;
        set_tok(custom.pos);
        emit("push_props", { props: attr, events: events });
	      yield_stack.push(null);
        tag_scopes.push(custom.scope);
        parse_tag_list();
	      yield_stack.pop();
        tag_scopes.pop();
        emit("pop_props");
        set_tok(ret);
      }
    } else {
      end_tag(name, attr, events);
    }
  }

  function parse_if_statement() {
    expect("(");
    let condition = parse_expr();
    expect(")");
    let op = emit("if", { condition: condition, jmp: 0 });
    if (accept("[")) {
      parse_tag_list();
      expect("]");
    } else {
      parse_tag();
    }
    let jmp = emit("jump", 0);
    if (!dont_emit) ops[op].data.jmp = ops.length - 1 - op;
    emit("else");
    if (accept("else")) {
      if (accept("[")) {
        parse_tag_list();
        expect("]");
      } else if (accept("if")) {
        parse_if_statement();
      } else {
        parse_tag();
      }
    }
    if (!dont_emit) ops[jmp].data = ops.length - 1 - jmp;
    emit("end_if");
  }

  function parse_tag_list() {
    let list;
    if (accept("doctype")) {
      let type = tok.data;
      expect("ident");
      emit("doctype", type);
      parse_tag_list();
    } else if (accept("if")) {
      parse_if_statement();
      parse_tag_list();
    } else if (accept("each")) {
      expect("(");
      let iter1,
        iter0 = tok.data;
      expect("ident");
      let op = emit("each", {});
      if (accept(",")) {
        iter1 = tok.data;
        expect("ident");
      }
      if (!dont_emit) ops[op].data.iterators = [iter0, iter1];
      expect("in");
      list = parse_expr();
      if (!dont_emit) ops[op].data.list = list;
      expect(")");
      if (accept("[")) {
        parse_tag_list();
        expect("]");
      } else {
        parse_tag();
      }
      // iterate back to one instruction after the each instruction
      emit("iterate", op - ops.length);
      if (!dont_emit) ops[op].data.jmp = ops.length - 1 - op;
      parse_tag_list();
    } else if (peek("ident")) {
      parse_tag();
      parse_tag_list();
    } else if (peek("string")) {
      let str = parse_string();
      if (str.data.length > 1 || str.data[0] !== '')
        emit("textnode", str);
      parse_tag_list();
    } else if (accept("yield")) {
      let y = yield_stack[yield_stack.length - 1];
      if (y) y(cursor);
      parse_tag_list();
    }
  }

  function parse_custom_tag() {
    expect("tag");
    let tag = tok.data;
    expect("ident");
    expect("[");
    dont_emit = true;
    files[files.length - 1].tags[tag] = { pos: cursor, scope: files[files.length - 1] };
    parse_tag_list();
    dont_emit = false;
    expect("]");
  }

  function parse_file() {
    while (true) {
      if (tok.type === "file_begin") {
        new_context();
        next();
      } else if (tok.type === "eof") {
        let fctx = files.pop();
        fctx.exports.forEach(function(ex) {
          let e = ex.val;
          if (!fctx.modules[e] && !fctx.tags[e])
            throw_adom_error({ msg: "no such tag or module", pos: ex.pos, file: ex.file });
          if (fctx.modules[e] && fctx.tags[e])
            throw_adom_error({ msg: "export is ambiguous", pos: ex.pos, file: ex.file });
          if (fctx.modules[e])
            files[files.length - 1].modules[e] = fctx.modules[e];
          if (fctx.tags[e]) files[files.length - 1].tags[e] = fctx.tags[e];
        });
        if (files.length === 0) {
          break;
        } else {
          next();
        }
      } else if (accept("export")) {
        files[files.length - 1].exports.push({
          val: tok.data,
          pos: tok.pos,
          file: tok.file
        });
        expect("ident");
      } else if (tok.type === "ident" || tok.type === "doctype") {
        parse_tag_list();
      } else if (tok.type === "tag") {
        parse_custom_tag();
      } else if (peek('var') || peek('const')) {
      	let isConst = (tok.data === 'const');
      	next();
        let dst = { data: tok.data, pos: tok.pos, file: tok.file };
        let val;
        next();
        expect("=");
        if (accept("file")) {
          val = parse_string();
        } else {
          val = parse_expr();
        }
        emit("set", { dst: dst, val: val, isConst: isConst });
      } else if (accept("def")) {
        let mname = tok.data;
        expect("ident");
        let deps = [];
        let pos = tok.pos, file = tok.file;
        if (accept('[')) {
          if (!accept(']')) {
            while (true) {
              deps.push(tok.data);
              expect('ident');
              if (!accept(',')) break;
            }
            expect(']');
          }
        }
        let module_body = tok.data;
        expect("module_body");
        deps.forEach(function (dep) {
          if (!files[files.length - 1].modules[dep]) {
            throw_adom_error({ msg: 'unknown module ' + dep, pos: pos, file: file });
          } else {
            let m = files[files.length - 1].modules[dep];
            emit('declare_module', {
              name: m.name,
              body: m.body,
              deps: m.deps
            });
          }
        });
        files[files.length - 1].modules[mname] = { name: mname, body: module_body, deps: deps };
      } else {
        throw_adom_error({ msg: "unexpected: " + tok.type, pos: tok.pos, file: tok.file });
      }
    }
  }

  parse_file();

  return ops;
};

Adom.prototype.execute = function(ops, initial_state) {
  let html = "";
  let ptr = 0;
  let state = initial_state;
  let open_tags = [];
  let pretty = false;
  let props = [];
  let iterators = [];
  let constVars = {};

  function escapeHTML (txt) {
    return txt.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function check_props(list) {
    if (list[0] === "props") {
      if (props.length < 1)
        throw_adom_error({
          msg: "props can only be used inside a custom tag",
          pos: pos,
          file: file
        });
      let v = props[props.length - 1];
      list.shift();
      return v;
    }
    return null;
  }

  function check_iterators(ptr, list) {
    let check = list[0];
    let i = iterators.length - 1;
    while (i >= 0) {
      if (iterators[i].data[check] != null) {
        list.shift();
        return iterators[i].data[check];
      }
      i--;
    }
    return ptr;
  }

  function assemble_attributes(attr) {
    return Object.keys(attr).map(function (k) {
      if (k === 'controller') return '';
      let v = evaluate(attr[k]);
      return ` ${k}="${Array.isArray(v) ? v.join(' ') : v}"`
    }).join('');
  }

  function evaluate(expr){
    switch (expr.type) {
      case 'null':
      case 'number':
      case 'bool':
      case 'chunk':
        return expr.data
      case 'string': {
        return expr.data.map(function (c) {
           return evaluate(c)
        }).join('');
      } break;
      case 'accumulator': {
        let v = expr.data[0];
        let prev = v.data;
        let ptr = evaluate(v);
        for (let i = 1; i < expr.data.length; i++) {
          v = expr.data[i];
          let str = evaluate(v);
          if (ptr[str] !== undefined) {
            prev = str;
            ptr = ptr[str];
          } else {
            throw_adom_error({ msg: str + ' is not a property of ' + prev, pos: v.pos, file: v.file });
          }
        }
        return ptr;
      } break;
      case 'ident': {
        let v = expr.data;
        if (v === 'props') {
          return props[props.length - 1]
        }
        for (let i = iterators.length - 1; i >= 0; i--) {
          let it = iterators[i];
          if (it.iterators[0] === v) {
            return it.list[it.index];
          }
          if (it.iterators[1] === v) {
            return it.type === 'object' ?
              it.object[it.list[it.index]] : it.index;
          }
        }
        if (state[v] !== undefined) return state[v];
        if (constVars[v] !== undefined) return constVars[v];
        throw_adom_error({ msg: v + ' is undefined.', pos: expr.pos, file: expr.file });
      } break;
      case 'array': {
        return expr.data.map(function (i) {
          return evaluate(i);
        })
      } break;
      case 'object': {
        let keys = Object.keys(expr.data);
        let obj = {};
        keys.forEach(function (k) {
          obj[k] = evaluate(expr.data[k]);
        });
        return obj;
      } break;
      case 'ternary': {
        let v = expr.data;
        return evaluate(v[0]) ? evaluate(v[1]) : evaluate(v[2]);
      } break;
      case 'comparison': {
        let v1 = evaluate(expr.data[0]);
        let v2 = evaluate(expr.data[1]);
        if (expr.op === '==') return v1 === v2;
        if (expr.op === '!=') return v1 !== v2;
        if (expr.op === '<=') return v1 <= v2;
        if (expr.op === '>=') return v1 >= v2;
        if (expr.op === '>') return v1 > v2;
        if (expr.op === '<') return v1 < v2;
        if (expr.op === '&&') return v1 && v2;
        if (expr.op === '||') return v1 || v2;
      } break;
      case 'parenthetical': {
        return evaluate(expr.data);
      } break;
    }
  }

  function fmt() {
    return pretty
      ? "\n" +
          open_tags
            .map(function() {
              return "    ";
            })
            .join("")
      : "";
  }

  function exec() {
    let iter;
    let scope_depth = 0;
    let fragments = [];
    let controller = undefined;
    let following_textnode = false;

    function current_tag () {
      return open_tags[open_tags.length - 1];
    }

    function current_frag () {
      if (fragments.length > 0) {
	      return fragments[fragments.length - 1];
      }
      return null;
    }

    function end_script () {
      return ['<', '/', 'script', '>'].join('')
    }

    while (ptr < ops.length) {
      let op = ops[ptr++];
      switch (op.type) {
        case "begin_tag":
          {
            html +=
              fmt() +
              "<" +
              op.data.name +
              assemble_attributes(op.data.attributes);
      	    let f = current_frag();
      	    if (f && current_tag().id === f.parent && scope_depth > 0) f.length++;
            if (op.data.self_close) {
              html += ">"; // configure based on doctype
	            following_textnode = false;
            } else {
      	      let a = op.data.attributes;
      	      let id = a['data-adom-id'];
              html += ">";
  	          if (a.controller) controller = a.controller;
              open_tags.push({ name: op.data.name, id: id ? evaluate(id) : undefined, controller: a.controller });
            }
          }
          break;
        case "end_tag":
          {
            let t = open_tags.pop();
      	    if (t.controller === controller) controller = undefined;
      	    html += fmt() + "</" + t.name + ">";
      	    following_textnode = false;
      	    if (op.data) {
      	      let frag_lengths = [];
      	      fragments.forEach(function (f) {
            		// the runtime relies on the order of the fragments initial lengths
            		if (f.controller) frag_lengths.push(f.length);
            	})
      	      html += fmt() + `<script id="adom-initial-frag-lengths" type="text/template">${JSON.stringify(frag_lengths)}${end_script()}`;
      	      html += fmt() + `<script id="adom-state" type="text/template">${JSON.stringify(state)}${end_script()}<script>${op.data}${end_script()}`;
      	    }
          }
          break;
        case "set":
          {
            let dst = op.data.dst;
            if (constVars[dst.data] != null || state[dst.data] != null) {
              throw_adom_error({ msg: dst.data + ' is already defined', pos: dst.pos, file: dst.file });
            }
            if (op.data.isConst) {
              constVars[dst.data] = evaluate(op.data.val);
            } else {
              state[dst.data] = evaluate(op.data.val);
            }
          }
          break;
        case "textnode":
          {
      	    let f = current_frag();
      	    if (!following_textnode && f && current_tag().id === f.parent && scope_depth > 0) f.length++;
            if (current_tag().name === 'script') {
              html += fmt() + evaluate(op.data);
            } else {
              html += fmt() + escapeHTML(evaluate(op.data));
            }
	          following_textnode = true;
	        }
          break;
        case "push_props":
          {
            let pctx = {};
            Object.keys(op.data.props).forEach(function(k) {
              pctx[k] = evaluate(op.data.props[k]);
            });
            props.push(pctx);
          }
          break;
        case "pop_props":
          {
            props.pop();
          }
          break;
        case "if":
          {
  	        scope_depth++;
      	    if (scope_depth === 1) {
      	      let t = current_tag();
      	      fragments.push({ parent: t.id, length: 0, controller: controller });
      	    }
            if (!evaluate(op.data.condition)) {
              ptr += op.data.jmp;
            }
          }
          break;
        case "end_if":
          {
	          scope_depth--;
          }
          break;
        case "jump":
          {
            ptr += op.data;
          }
          break;
        case "each":
          {
      	    scope_depth++;
      	    if (scope_depth === 1) {
      	      let t = current_tag();
      	      fragments.push({ parent: t.id, length: 0, controller: controller });
      	    }
            let list = evaluate(op.data.list);
            if (Array.isArray(list)) {
              if (list.length === 0) {
                ptr += op.data.jmp;
		            scope_depth--;
                break;
              }
              iter = {
                type: "array",
                iterators: op.data.iterators,
                list: list,
                index: 0,
                data: {}
              };
              iter.data[op.data.iterators[0]] = list[0];
              if (op.data.iterators[1] != null)
                iter.data[op.data.iterators[1]] = 0;
              iterators.push(iter);
            } else if (typeof list === "object" && list !== null) {
              let keys = Object.keys(list);
              if (keys.length === 0) {
                ptr += op.data.jmp;
                break;
              }
              iter = {
                type: "object",
                list: keys,
                iterators: op.data.iterators,
                object: list,
                index: 0,
                data: {}
              };
              iter.data[op.data.iterators[0]] = keys[0];
              if (op.data.iterators.length > 1)
                iter.data[op.data.iterators[1]] = iter.object[iter.list[0]];
              iterators.push(iter);
            } else {
              throw_adom_error({
                msg: "each statements can only operate on arrays or objects",
                pos: op.data.list.pos,
                file: op.data.list.file
              });
            }
          }
          break;
        case "iterate":
          {
            iter = iterators[iterators.length - 1];
            if (iter.index < iter.list.length - 1) {
              if (iter.type === "array") {
                iter.data[iter.iterators[0]] = iter.list[++iter.index];
                if (iter.iterators[1] != null)
                  iter.data[iter.iterators[1]] = iter.index;
              } else {
                iter.data[iter.iterators[0]] = iter.list[++iter.index];
                if (iter.iterators[1] != null)
                  iter.data[iter.iterators[1]] =
                    iter.object[iter.data[iter.iterators[0]]];
              }
              ptr += op.data;
            } else {
              iterators.pop();
	            scope_depth--;
            }
          }
          break;
        default:
          break;
      }
    }
  }

  exec();

  return html;
};

Adom.prototype.get_error_text = function(prog, c) {
  let i = c;
  let buf = "",
    pad = "";
  let pos = c;
  let line = 1;
  while (pos >= 0) if (prog[pos--] === "\n") line++;
  buf += line + "| ";
  let np = line.toString().length + 2;
  for (let k = 0; k < np; k++) pad += " ";
  while (prog[i - 1] !== "\n" && i > 0) i--;
  while (prog[i] !== "\n" && i < prog.length) {
    if (i < c) {
      if (prog[i] === "\t") pad += "\t";
      else pad += " ";
    }
    buf += prog[i++];
  }
  buf += "\n" + pad + "^\n";
  return buf;
};

Adom.prototype.runtime = function (modules, controllers) {
  return `
function $adom () {
  this.frag_lengths = [];
  this.props = [];
}

$adom.prototype.push_props = function (obj) {
  this.props.push(obj);
  return [];
};

$adom.prototype.pop_props = function () {
  this.props.pop();
  return [];
};

$adom.prototype.id = function (id, all) {
  var a = document.querySelectorAll('[data-adom-id="' + id + '"]');
  return all ? a : a[0];
};

$adom.prototype.setAttributes = function (e, attr) {
  Object.keys(attr).forEach(function (att) {
    var a = attr[att];
    var v = a.constructor === Array ? a.join(' ') : a;
    if (att === 'value') {
      e.value = v;
    } else {
      e.setAttribute(att, v);
    }
  });
};

$adom.prototype.addEventListener = function (id, event, handler) {
  var elements = this.id(id, true);
  for (var i = 0; i < elements.length; i++) {
    var e = elements[i];
    if (!e.dataset['on' + event]) {
      e.dataset['on' + event] = true;
      e.addEventListener(event, handler);
    }
  }
};

$adom.prototype.if = function (cond, pass, fail) {
  var elements = [];
  var children;
  if (cond) {
    children = pass;
  } else {
    children = fail;
  }
  children.forEach(function (child) {
    if (Array.isArray(child)) {
      child.forEach(function (c) {
        elements.push(c);
      });
    } else {
      elements.push(child);
    }
  });
  return elements;
};

$adom.prototype.each = function (list, fn) {
  var elements = [];
  function addChildren (children) {
    children.forEach(function (child) {
      if (Array.isArray(child)) {
        child.forEach(function (c) {
          elements.push(c);
        })
      } else {
        elements.push(child);
      }
    })
  }
  if (Array.isArray(list)) {
    list.forEach(function (item, i) {
      var children = fn(item, i);
      addChildren(children);
    })
  } else if (typeof list === 'object') {
    var keys = Object.keys(list);
    keys.forEach(function (key) {
      var children = fn(key, list[key]);
      addChildren(children);
    })
  } else {
    throw new Error(list + ' is not iterable');
  }
  return elements;
};

$adom.prototype.el = function (tag, attributes, children) {
  if (tag === 'text') {
    return { type: 'text', text: attributes };
  }
  var els = [];
  children.forEach(function (child) {
    if (Array.isArray(child)) {
      child.forEach(function (c) {
        els.push(c);
      })
    } else {
      els.push(child);
    }
  });
  return {
    type: 'node',
    name: tag,
    attributes: attributes,
    children: els
  };
};

$adom.prototype.insertAtIndex = function (child, par, index) {
  if (index >= par.childNodes.length) {
    par.appendChild(child);
  } else {
    par.insertBefore(child, par.childNodes[index]);
  }
}

$adom.prototype.setText = function (id, text, index) {
  var el = this.id(id);
  var children = el.childNodes;
  if (index >= children.length) {
    el.appendChild(document.createTextNode(text));
  } else if (children[index].nodeType === Node.TEXT_NODE) {
    children[index].nodeValue = text;
  } else {
    this.insertAtIndex(document.createTextNode(text), el, index);
  }
};

$adom.prototype.insertFrag = function (elements, par, index, lidx) {
  var frag = document.createDocumentFragment();
  var prevLen = this.frag_lengths[lidx];
  var setAttr = this.setAttributes.bind(this);

  function walk (elements, par, domPtr) {
    elements.forEach(function (el) {
      var e;

      if (el.type === 'text') {
        e = document.createTextNode(el.text);
      } else {
        e = document.createElement(el.name);
        setAttr(e, el.attributes);
        if (el.children.length) {
          walk(el.children, e);
        }
      }
      par.appendChild(e);
    })
  }

  walk(elements, frag, par.childNodes[index]);

  for (var i = index; i < (index + prevLen); i++) {
    par.removeChild(par.childNodes[index]);
  }

  this.insertAtIndex(frag, par, index);

  return (this.frag_lengths[lidx] = elements.length);
};

var $$adom_modules = [];

${modules}

window.onload = function () {
  var $$adom_input_state = JSON.parse(window['adom-state'].innerHTML);
  var $$adom_initial_frag_lengths = JSON.parse(window['adom-initial-frag-lengths'].innerHTML);
  var $$adom_events = [];

  function $dispatch (event, data) {
    for (var i = 0; i < $$adom_events.length; i++) {
      if ($$adom_events[i].event === event) {
        $$adom_events[i].fn(data);
      }
    }
  }

  function $on (event, fn) {
    $$adom_events.push({ event: event, fn: fn });
  }

  ${controllers}
}
`
}

Adom.prototype.attach_runtime = function(ops, input_state, fn) {
  let ptr = 0;
  let in_controller = false;
  let prop_depth = -1;
  let scope_depth = 0;
  let ids = 0;
  let updates = [];
  let events = [];
  let tag_info = [];
  let frag_index = 0;
  let frag_id = 0;
  let lindex = -1;
  let init = [];
  let controllers = [];
  let modules = [];
  let runtime_location = -1;
  let state_keys = Object.keys(input_state);
  let prop_events = undefined;

  function print_expression (expr) {
    switch (expr.type) {
      case 'ident':
      case 'null':
      case 'number':
      case 'bool':
        return expr.data.toString();
      case 'chunk':
        return `"${expr.data.replace(/"/g, '\\"').replace(/(\r\n|\n|\r)/gm, '\\n')}"`
      case 'string': {
        return `${expr.data.map(function (c) {
           return print_expression(c)
        }).join(' + ')}`;
      } break;
      case 'accumulator': {
        let val = print_expression(expr.data[0]);
        if (val === 'props') val = `$$a.props[${prop_depth}]`;
        for (let i = 1; i < expr.data.length; i++) {
          val += `[${print_expression(expr.data[i])}]`;
        }
        return val;
      } break;
      case 'array': {
        return `[${expr.data.map(function (i) {
          return print_expression(i);
        }).join(', ')}]`
      } break;
      case 'object': {
        let keys = Object.keys(expr.data);
        return `{ ${keys.map(function (k) {
          return `"${k}": ${print_expression(expr.data[k])}`;
        }).join(', ')} }`;
      } break;
      case 'ternary': {
        let v = expr.data;
        let v1 = print_expression(v[0]);
        let v2 = print_expression(v[1]);
        let v3 = print_expression(v[2]);
        return `(${v1} ? ${v2} : ${v3})`;
      } break;
      case 'comparison': {
        let v1 = print_expression(expr.data[0]);
        let v2 = print_expression(expr.data[1]);
        return `(${v1} ${expr.op} ${v2})`
      } break;
      case 'parenthetical': {
        return `(${print_expression})`;
      } break;
    }
  }

  function stringify_object(obj) {
    let keys = Object.keys(obj);
    return (
      "{" +
      keys
        .map(function(k, i) {
          return '"' + k + '": ' + print_expression(obj[k]);
        })
        .join(", ") +
      "}"
    );
  }

  function last_tag (index) {
    return tag_info[tag_info.length - (index || 1)]
  }

  function get_frag_index (t) {
    let index = '';
    for (let i = 0; i < t.frag_count - 1; i++) {
      index += `offs${t.id}${i} + `;
    }
    index += frag_index;
    return index;
  }

  while (ptr < ops.length) {
    let op = ops[ptr++];
    switch (op.type) {
      case 'set': {
	      if (!op.data.isConst)
	        state_keys.push(op.data.dst.data);
      } break;
      case "declare_module": {
        modules.push(op.data);
      } break;
      case "begin_tag":
        if (op.data.attributes.controller) {
          let c = op.data.attributes.controller;
          let id = ids++;
          op.data.attributes['data-adom-id'] = { type: 'string', data: [{ type: 'chunk', data: id + "" }] };
          tag_info.push({ name: op.data.name, ref: op, count: 0, frag_count: 0, id: id })
          if (in_controller) {
            throw_adom_error({
              msg: "nested controllers are illegal",
              pos: c.pos,
              file: c.file
            });
          }
          in_controller = true;
          controllers.push(c);
	        op.data.attributes.controller = c.name;
        } else if (in_controller) {
          let id = ids++
          op.data.attributes['data-adom-id'] = { type: 'string', data: [{ type: 'chunk', data: id + "" }] };
          tag_info.push({ name: op.data.name, ref: op, count: 0, frag_count: 0, id: id })
          if (op.data.events.length > 0) {
            op.data.events.forEach(function(e) {
              events.push({ id: id, event: e.type, handler: e.handler, sync: e.sync });
            });
          }
          if (prop_events) {
	          // events on custom tags are attached to the first child of the tag
            prop_events.forEach(function(e) {
              events.push({ id: id, event: e.type, handler: e.handler, sync: e.sync });
            });
	          prop_events = undefined;
          }
          if (scope_depth === 0) {
            last_tag(2).count++;
            updates.push(`$$a.setAttributes($$a.id('${id}'),${stringify_object(op.data.attributes)});`);
            if (op.data.self_close) {
              tag_info.pop()
            }
          } else {
            updates.push(`$$a.el("${op.data.name}", ${stringify_object(op.data.attributes)}, [`);
            if (op.data.self_close) {
              updates.push(']),')
              tag_info.pop()
            }
          }
        }
        break;
      case "end_tag":
        if (in_controller) {
          tag_info.pop()
          if (scope_depth > 0) {
            updates.push(']),')
          }
          if (!tag_info.length) {
            let c = controllers[controllers.length - 1];
            c.updates = updates;
            c.init = init;
            c.events = events;
            controller = undefined;
            in_controller = false;
            events = [];
            updates = [];
            init = [];
            runtime_location = ptr - 1;
            frag_index = 0;
            frag_id = 0;
            lindex = -1;
          }
        }
        break;
      case "textnode":
        if (in_controller) {
          let parent = last_tag();
          if (scope_depth === 0) {
            let i = parent.count++;
            let id = parent.id;
            updates.push(`$$a.setText("${id}", ${print_expression(op.data)}, ${i});`);
          } else {
            updates.push(`$$a.el("text", ${print_expression(op.data)}),`);
          }
        }
        break;
      case "each":
        if (in_controller) {
          let c = op.data;
          let i = c.iterators;
          if (scope_depth === 0) {
            lindex++;
            let t = last_tag() 
            frag_id = t.frag_count++;
            frag_index = t.count
            updates.push(
              `var frag${t.id}${frag_id} = $$a.each(${print_expression(op.data.list)}, function(${i[0]}${
                i[1] ? `, ${i[1]}` : ''
              }) { return [`
            )
          } else {
            updates.push(
              `$$a.each(${print_expression(op.data.list)}, function(${i[0]}${
                i[1] ? `, ${i[1]}` : ''
              }) { return [`
            )
          }
          scope_depth++;
        }
        break;
      case "iterate":
        if (in_controller) {
          scope_depth--;
          if (scope_depth === 0) {
            init.push(`$$a.frag_lengths.push($$adom_initial_frag_lengths.shift());`)
            updates.push(`] });`);
            let t = last_tag();
            let id = t.id;
            let index = get_frag_index(t);
            updates.push(`var offs${t.id}${frag_id} = $$a.insertFrag(frag${t.id}${frag_id}, $$a.id('${id}'),${index},${lindex});`);
          } else {
            updates.push(`] }),`);
          }
        }
        break;
      case "push_props":
        if (in_controller) {
          if (scope_depth === 0) {
            updates.push(`$$a.push_props(${stringify_object(op.data.props)});`);
          } else {
            updates.push(`$$a.push_props(${stringify_object(op.data.props)}),`);
          }
	  prop_events = op.data.events;
          prop_depth++;
        }
        break;
      case "pop_props":
        if (in_controller) {
          if (scope_depth === 0) {
            updates.push(`$$a.pop_props();`);
          } else {
            updates.push(`$$a.pop_props(),`);
          }
          prop_depth--;
        }
        break;
      case "if":
        if (in_controller) {
          let c = op.data.condition;
          if (scope_depth === 0) {
            lindex++;
            let t = last_tag();
            frag_id = t.frag_count++;
            frag_index = t.count;
            updates.push(`var frag${t.id}${frag_id} = $$a.if(${print_expression(c)}, [`)
          } else {
            updates.push(`$$a.if(${print_expression(c)}, [`)
          }
          scope_depth++;
        }
        break;
      case "else":
        if (in_controller) {
          updates.push('],[');
        }
        break;
      case "end_if":
        if (in_controller) {
          scope_depth--;
          if (scope_depth === 0) {
            init.push(`$$a.frag_lengths.push($$adom_initial_frag_lengths.shift());`)
            updates.push(']);')
            let t = last_tag();
            let id = t.id;
            let index = get_frag_index(t);
            updates.push(`var offs${t.id}${frag_id} = $$a.insertFrag(frag${t.id}${frag_id}, $$a.id('${id}'),${index},${lindex});`);
          } else {
            updates.push(']),')
          }
        }
        break;
      default:
        break;
    }
  }

  let moduleCode = '';
  let controllerCode = '';

  modules.forEach(function (m) {
    moduleCode += `
$$adom_modules.${m.name} = (function () {
  ${m.body}
})(${m.deps.map(function (d) {
  return `$$adom_modules.${d}`
}).join(',')});`;
  });

  controllers.forEach(function (c) {
    controllerCode += `
(function ${c.name} (${c.deps.join(',')}) {
  var $$a = new $adom();
  var $ = JSON.parse(JSON.stringify($$adom_input_state));

  ${c.init.join('\n')}

  (function (${state_keys.join(',')}) {
    function $addEventListeners () {
      ${c.events.map(function (e) {
        return `$$a.addEventListener("${e.id}", "${e.event}", function ($event) {
          ${e.handler}($event);
          ${e.sync ? '$sync();' : ''}
        });`
      }).join('\n')}
    }

    function $sync () {
      ${c.updates.join('\n')}
        $addEventListeners();
    }

    function $call () {
      var args = Array.clice.call(arguments);
      var fn = args.shift(); fn.apply(null, args);
      $sync();
    }

    $addEventListeners();
    ${c.body}
  })(${state_keys.map(function (k) {
    return `$.${k}`; 
  }).join(',')});
})(${c.deps.map(function (d) {
  return `$$adom_modules.${d}`;
}).join(',')});
    `    
  });

  if (runtime_location > -1) {
    let r = this.runtime(moduleCode, controllerCode);
    if (this.runtimeTransform) {
      r = this.runtimeTransform(r);
    }
    ops[runtime_location].data = r;
  }
};

Adom.prototype.getPath = function (p) {
  try {
    let path = require("path");
    return path.resolve(this.dirname, p);
  } catch (e) {
    return p;
  }
};

Adom.prototype.openFile = function(p, filter) {
  let fs;

  try {
    fs = require("fs");
  } catch (e) {
    return ['', p]
  }

  let f = this.getPath(p);
  let t;
  if (filter === 'base64') {
    t = fs.readFileSync(f).toString('base64');
  } else {
    t = fs.readFileSync(f).toString();
  }
  this.files[f] = t;
  return [t, f];
};

Adom.prototype.resolve_imports = function(tokens, file) {
  let out_toks = [];
  let ptr = 0;

  while (ptr < tokens.length) {
    switch (tokens[ptr].type) {
      case "import":
        {
          ptr+=2;
          let path = tokens[ptr].data;
          let fileData = this.openFile(path);
          let f = fileData[1];
          let toks = this.resolve_imports(this.tokenize(fileData[0], f), f);
          toks.forEach(function(t) {
            out_toks.push(t);
          });
        }
        break;
      case "file": {
        let filter = undefined;
        ptr++;
        if (tokens[ptr].type === 'ident') {
          filter = tokens[ptr].data;
          ptr++;
        }
        if (tokens[ptr].type === 'string') {
          ptr++; // the next token is where the string begins
          let path = tokens[ptr].data;
          let fileData = this.openFile(path, filter);
          out_toks.push({
            type: "string",
            pos: tokens[ptr].pos,
            file: tokens[ptr].file
          });
          out_toks.push({
            type: "chunk",
            data: fileData[0],
            pos: tokens[ptr].pos,
            file: tokens[ptr].file
          });
        }
      } break;
      default:
        out_toks.push(tokens[ptr]);
        break;
    }
    ptr++;
  }

  return out_toks;
};

Adom.prototype.renderString = function (str, input_state) {
  try {
    let tokens = this.tokenize(str, 'main');
    tokens = this.resolve_imports(tokens, 'main');
    let ops = this.parse(tokens);
    this.attach_runtime(ops, input_state || {});
    return this.execute(ops, input_state || {});
  } catch (e) {
    console.log(e.msg);
    console.log(this.get_error_text(str, e.pos));
  }
};

Adom.prototype.render = function(file, input_state) {
  try {
    let cacheKey = this.getPath(file);
    if (this.cache && this.opcode_cache[cacheKey]) {
      return this.execute(this.opcode_cache[cacheKey], input_state || {});
    } else {
      let fileData = this.openFile(file);
      let f = fileData[1];
      let tokens = this.tokenize(fileData[0], f);
      tokens = this.resolve_imports(tokens, f);
      let ops = this.parse(tokens);
      this.attach_runtime(ops, input_state || {});
      let html = this.execute(ops, input_state || {});
      if (this.cache) {
        this.opcode_cache[f] = ops;
      }
      return html;
    }
  } catch (e) {
    if (e.origin === 'adom') {
      console.log("Error: ", e.file);
      console.log(e.msg);
      console.log(this.get_error_text(this.files[e.file], e.pos));
    } else {
      console.log(e);
    }
    return "";
  }
};

return Adom;

})();

if (typeof module !== 'undefined') {
  module.exports = Adom
} else {
  window.Adom = Adom
}
