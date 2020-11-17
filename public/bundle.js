var n,u,i,t,o,r,f={},e=[],c=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function s(n,l){for(var u in l){ n[u]=l[u]; }return n}function a(n){var l=n.parentNode;l&&l.removeChild(n);}function v(n,l,u){var i,t,o,r=arguments,f={};for(o in l){ "key"==o?i=l[o]:"ref"==o?t=l[o]:f[o]=l[o]; }if(arguments.length>3){ for(u=[u],o=3;o<arguments.length;o++){ u.push(r[o]); } }if(null!=u&&(f.children=u),"function"==typeof n&&null!=n.defaultProps){ for(o in n.defaultProps){ void 0===f[o]&&(f[o]=n.defaultProps[o]); } }return h(n,f,i,t,null)}function h(l,u,i,t,o){var r={type:l,props:u,key:i,ref:t,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++n.__v:o};return null!=n.vnode&&n.vnode(r),r}function p(n){return n.children}function d(n,l){this.props=n,this.context=l;}function _(n,l){if(null==l){ return n.__?_(n.__,n.__.__k.indexOf(n)+1):null; }for(var u;l<n.__k.length;l++){ if(null!=(u=n.__k[l])&&null!=u.__e){ return u.__e; } }return "function"==typeof n.type?_(n):null}function w(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++){ if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break} }return w(n)}}function k(l){(!l.__d&&(l.__d=!0)&&u.push(l)&&!g.__r++||t!==n.debounceRendering)&&((t=n.debounceRendering)||i)(g);}function g(){for(var n;g.__r=u.length;){ n=u.sort(function(n,l){return n.__v.__b-l.__v.__b}),u=[],n.some(function(n){var l,u,i,t,o,r,f;n.__d&&(r=(o=(l=n).__v).__e,(f=l.__P)&&(u=[],(i=s({},o)).__v=o.__v+1,t=$(f,o,i,l.__n,void 0!==f.ownerSVGElement,null!=o.__h?[r]:null,u,null==r?_(o):r,o.__h),j(u,o),t!=r&&w(o)));}); }}function m(n,l,u,i,t,o,r,c,s,v){var y,d,w,k,g,m,b,A=i&&i.__k||e,P=A.length;for(s==f&&(s=null!=r?r[0]:P?_(i,0):null),u.__k=[],y=0;y<l.length;y++){ if(null!=(k=u.__k[y]=null==(k=l[y])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k?h(null,k,null,null,k):Array.isArray(k)?h(p,{children:k},null,null,null):null!=k.__e||null!=k.__c?h(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(w=A[y])||w&&k.key==w.key&&k.type===w.type){ A[y]=void 0; }else { for(d=0;d<P;d++){if((w=A[d])&&k.key==w.key&&k.type===w.type){A[d]=void 0;break}w=null;} }g=$(n,k,w=w||f,t,o,r,c,s,v),(d=k.ref)&&w.ref!=d&&(b||(b=[]),w.ref&&b.push(w.ref,null,k),b.push(d,k.__c||g,k)),null!=g?(null==m&&(m=g),s=x(n,k,w,A,r,g,s),v||"option"!=u.type?"function"==typeof u.type&&(u.__d=s):n.value=""):s&&w.__e==s&&s.parentNode!=n&&(s=_(w));} }if(u.__e=m,null!=r&&"function"!=typeof u.type){ for(y=r.length;y--;){ null!=r[y]&&a(r[y]); } }for(y=P;y--;){ null!=A[y]&&L(A[y],A[y]); }if(b){ for(y=0;y<b.length;y++){ I(b[y],b[++y],b[++y]); } }}function x(n,l,u,i,t,o,r){var f,e,c;if(void 0!==l.__d){ f=l.__d,l.__d=void 0; }else if(t==u||o!=r||null==o.parentNode){ n:if(null==r||r.parentNode!==n){ n.appendChild(o),f=null; }else {for(e=r,c=0;(e=e.nextSibling)&&c<i.length;c+=2){ if(e==o){ break n; } }n.insertBefore(o,r),f=r;} }return void 0!==f?f:o.nextSibling}function A(n,l,u,i,t){var o;for(o in u){ "children"===o||"key"===o||o in l||C(n,o,null,u[o],i); }for(o in l){ t&&"function"!=typeof l[o]||"children"===o||"key"===o||"value"===o||"checked"===o||u[o]===l[o]||C(n,o,l[o],u[o],i); }}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||c.test(l)?u:u+"px";}function C(n,l,u,i,t){var o,r,f;if(t&&"className"==l&&(l="class"),"style"===l){ if("string"==typeof u){ n.style.cssText=u; }else {if("string"==typeof i&&(n.style.cssText=i=""),i){ for(l in i){ u&&l in u||P(n.style,l,""); } }if(u){ for(l in u){ i&&u[l]===i[l]||P(n.style,l,u[l]); } }} }else { "o"===l[0]&&"n"===l[1]?(o=l!==(l=l.replace(/Capture$/,"")),(r=l.toLowerCase())in n&&(l=r),l=l.slice(2),n.l||(n.l={}),n.l[l+o]=u,f=o?N:z,u?i||n.addEventListener(l,f,o):n.removeEventListener(l,f,o)):"list"!==l&&"tagName"!==l&&"form"!==l&&"type"!==l&&"size"!==l&&"download"!==l&&"href"!==l&&!t&&l in n?n[l]=null==u?"":u:"function"!=typeof u&&"dangerouslySetInnerHTML"!==l&&(l!==(l=l.replace(/xlink:?/,""))?null==u||!1===u?n.removeAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase()):n.setAttributeNS("http://www.w3.org/1999/xlink",l.toLowerCase(),u):null==u||!1===u&&!/^ar/.test(l)?n.removeAttribute(l):n.setAttribute(l,u)); }}function z(l){this.l[l.type+!1](n.event?n.event(l):l);}function N(l){this.l[l.type+!0](n.event?n.event(l):l);}function T(n,l,u){var i,t;for(i=0;i<n.__k.length;i++){ (t=n.__k[i])&&(t.__=n,t.__e&&("function"==typeof t.type&&t.__k.length>1&&T(t,l,u),l=x(u,t,t,n.__k,null,t.__e,l),"function"==typeof n.type&&(n.__d=l))); }}function $(l,u,i,t,o,r,f,e,c){var a,v,h,y,_,w,k,g,b,x,A,P=u.type;if(void 0!==u.constructor){ return null; }null!=i.__h&&(c=i.__h,e=u.__e=i.__e,u.__h=null,r=[e]),(a=n.__b)&&a(u);try{n:if("function"==typeof P){if(g=u.props,b=(a=P.contextType)&&t[a.__c],x=a?b?b.props.value:a.__:t,i.__c?k=(v=u.__c=i.__c).__=v.__E:("prototype"in P&&P.prototype.render?u.__c=v=new P(g,x):(u.__c=v=new d(g,x),v.constructor=P,v.render=M),b&&b.sub(v),v.props=g,v.state||(v.state={}),v.context=x,v.__n=t,h=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=P.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=s({},v.__s)),s(v.__s,P.getDerivedStateFromProps(g,v.__s))),y=v.props,_=v.state,h){ null==P.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount); }else {if(null==P.getDerivedStateFromProps&&g!==y&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(g,x),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(g,v.__s,x)||u.__v===i.__v){v.props=g,v.state=v.__s,u.__v!==i.__v&&(v.__d=!1),v.__v=u,u.__e=i.__e,u.__k=i.__k,v.__h.length&&f.push(v),T(u,e,l);break n}null!=v.componentWillUpdate&&v.componentWillUpdate(g,v.__s,x),null!=v.componentDidUpdate&&v.__h.push(function(){v.componentDidUpdate(y,_,w);});}v.context=x,v.props=g,v.state=v.__s,(a=n.__r)&&a(u),v.__d=!1,v.__v=u,v.__P=l,a=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(t=s(s({},t),v.getChildContext())),h||null==v.getSnapshotBeforeUpdate||(w=v.getSnapshotBeforeUpdate(y,_)),A=null!=a&&a.type==p&&null==a.key?a.props.children:a,m(l,Array.isArray(A)?A:[A],u,i,t,o,r,f,e,c),v.base=u.__e,u.__h=null,v.__h.length&&f.push(v),k&&(v.__E=v.__=null),v.__e=!1;}else { null==r&&u.__v===i.__v?(u.__k=i.__k,u.__e=i.__e):u.__e=H(i.__e,u,i,t,o,r,f,c); }(a=n.diffed)&&a(u);}catch(l){u.__v=null,(c||null!=r)&&(u.__e=e,u.__h=!!c,r[r.indexOf(e)]=null),n.__e(l,u,i);}return u.__e}function j(l,u){n.__c&&n.__c(u,l),l.some(function(u){try{l=u.__h,u.__h=[],l.some(function(n){n.call(u);});}catch(l){n.__e(l,u.__v);}});}function H(n,l,u,i,t,o,r,c){var s,a,v,h,y,p=u.props,d=l.props;if(t="svg"===l.type||t,null!=o){ for(s=0;s<o.length;s++){ if(null!=(a=o[s])&&((null===l.type?3===a.nodeType:a.localName===l.type)||n==a)){n=a,o[s]=null;break} } }if(null==n){if(null===l.type){ return document.createTextNode(d); }n=t?document.createElementNS("http://www.w3.org/2000/svg",l.type):document.createElement(l.type,d.is&&{is:d.is}),o=null,c=!1;}if(null===l.type){ p===d||c&&n.data===d||(n.data=d); }else {if(null!=o&&(o=e.slice.call(n.childNodes)),v=(p=u.props||f).dangerouslySetInnerHTML,h=d.dangerouslySetInnerHTML,!c){if(null!=o){ for(p={},y=0;y<n.attributes.length;y++){ p[n.attributes[y].name]=n.attributes[y].value; } }(h||v)&&(h&&(v&&h.__html==v.__html||h.__html===n.innerHTML)||(n.innerHTML=h&&h.__html||""));}A(n,d,p,t,c),h?l.__k=[]:(s=l.props.children,m(n,Array.isArray(s)?s:[s],l,u,i,"foreignObject"!==l.type&&t,o,r,f,c)),c||("value"in d&&void 0!==(s=d.value)&&(s!==n.value||"progress"===l.type&&!s)&&C(n,"value",s,p.value,!1),"checked"in d&&void 0!==(s=d.checked)&&s!==n.checked&&C(n,"checked",s,p.checked,!1));}return n}function I(l,u,i){try{"function"==typeof l?l(u):l.current=u;}catch(l){n.__e(l,i);}}function L(l,u,i){var t,o,r;if(n.unmount&&n.unmount(l),(t=l.ref)&&(t.current&&t.current!==l.__e||I(t,null,u)),i||"function"==typeof l.type||(i=null!=(o=l.__e)),l.__e=l.__d=void 0,null!=(t=l.__c)){if(t.componentWillUnmount){ try{t.componentWillUnmount();}catch(l){n.__e(l,u);} }t.base=t.__P=null;}if(t=l.__k){ for(r=0;r<t.length;r++){ t[r]&&L(t[r],u,i); } }null!=o&&a(o);}function M(n,l,u){return this.constructor(n,u)}function O(l,u,i){var t,r,c;n.__&&n.__(l,u),r=(t=i===o)?null:i&&i.__k||u.__k,l=v(p,null,[l]),c=[],$(u,(t?u:i||u).__k=l,r||f,f,void 0!==u.ownerSVGElement,i&&!t?[i]:r?null:u.childNodes.length?e.slice.call(u.childNodes):null,c,i||f,t),j(c,l);}n={__e:function(n,l){for(var u,i,t,o=l.__h;l=l.__;){ if((u=l.__c)&&!u.__){ try{if((i=u.constructor)&&null!=i.getDerivedStateFromError&&(u.setState(i.getDerivedStateFromError(n)),t=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),t=u.__d),t){ return l.__h=o,u.__E=u }}catch(l){n=l;} } }throw n},__v:0},d.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=s({},this.state),"function"==typeof n&&(n=n(s({},u),this.props)),n&&s(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),k(this));},d.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),k(this));},d.prototype.render=p,u=[],i="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,g.__r=0,o=f,r=0;

var RGBtoHSL = function (rgb) {
  // Make r, g, and b fractions of 1
  var r = rgb[0] / 255;
  var g = rgb[1] / 255;
  var b = rgb[2] / 255;

  // Find greatest and smallest channel values
  var cmin = Math.min(r, g, b);
  var cmax = Math.max(r, g, b);
  var delta = cmax - cmin;
  var h = 0;
  var s = 0;
  var l = 0;

  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) { h += 360; }

  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [ Math.floor(h), Math.floor(s), Math.floor(l), 255 ]
};

var HSLtoRGB = function (hsl) {
  var h = hsl[0];
  var s = hsl[1] / 100;
  var l = hsl[2] / 100;

  var c = (1 - Math.abs(2 * l - 1)) * s;
  var x = c * (1 - Math.abs((hsl[0] / 60) % 2 - 1));
  var m = l - c / 2;
  var r = 0;
  var g = 0;
  var b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [ r, g, b, 255 ]
};

var ENV = window.location.href.includes('localhost:4000') ? 'DEV' : 'PROD';
var APP = {};
var VIEW = { render: undefined };
var canvases = ['canvasSelection', 'canvasPreview', 'canvasTemp', 'canvasFinal', 'canvasView'];

var initAppDefault = function (w, h) {
  APP.width = w;
  APP.height = h;
  APP.tool = 'pencil';

  APP.frameActive = 0;
  APP.layerActive = 0;
  APP.frameCount = 1; 
  APP.layerCount = 1;  
  APP.layers = [
    {
      name: 'Layer 1',
      hidden: false,
      frames: [new ImageData(w, h)]
    }
  ];
  
  APP.color = {};
  APP.color.rgb = [100, 188, 156, 255];
  APP.color.hsl = RGBtoHSL(APP.color.rgb);

  APP.palette = [
    [26, 188, 156, 255],
    [46, 204, 113, 255],
    [52, 152, 219, 255],
    [155, 89, 182, 255],
    [52, 73, 94, 255],
    [22, 160, 133, 255],
    [39, 174, 96, 255],
    [41, 128, 185, 255],
    [142, 68, 173, 255],
    [44, 62, 80, 255],
    [241, 196, 15, 255],
    [230, 126, 34, 255],
    [231, 76, 60, 255],
    [236, 240, 241, 255],
    [149, 165, 166, 255],
    [243, 156, 18, 255],
    [211, 84, 0, 255],
    [192, 57, 43, 255],
    [189, 195, 199, 255],
    [127, 140, 141, 255]
  ];
  
  Object.seal(APP);
};

var initCanvases = function () {
  canvases.forEach(function (canvas) {
    VIEW[canvas].dom = canvas === 'canvasView' ? document.querySelector('#canvas-view') : document.createElement('canvas');
    VIEW[canvas].dom.width = APP.width;
    VIEW[canvas].dom.height = APP.height;
    VIEW[canvas].ctx = VIEW[canvas].dom.getContext('2d');
    VIEW[canvas].imgData = VIEW[canvas].ctx.getImageData(0, 0, APP.width, APP.height);
  });

  VIEW.canvasTimeline = document.querySelector('#timeline-canvas');
  VIEW.canvasTimelineTemp = document.createElement('canvas');
};

var initViewDefault = function (preventOnMount) {
  VIEW.activeInput = {
    id: '',
    val: ''
  };

  VIEW.window = {
    request: '',
    mouseDown: false,
    startX: 0,
    startY: 0,
    prevX: 0,
    prevY: 0,
    currX: 0,
    currY: 0
  };

  VIEW.file = { open: false };
  VIEW.newCanvas = { open: false, w: 32, h: 32 };
  VIEW.downloadCanvas = { open: false, size: 2, type: 'frame' };

  VIEW.brushSize = 0;

  VIEW.timerID = undefined;
  VIEW.isPlaying = false;
  VIEW.onionSkinning = false;

  VIEW.undo = [];
  VIEW.undoPos = -1;
  VIEW.currUndoRef = {};
  
  VIEW.canvasTimeline = undefined;
  VIEW.canvasTimelineTemp = undefined;

  // need to reset these on new project
  canvases.forEach(function (canvas) {
    VIEW[canvas] = {
      dom: undefined,
      ctx: undefined,
      imgData: undefined
    };
  });

  if (preventOnMount !== true) {
    initCanvases();
  }

  Object.seal(VIEW);
};

var newData = function (w, h, preventOnMount) {
  initAppDefault(w, h);
  initViewDefault(preventOnMount);
};

var addToUndo = function (action, type) {
  if ( type === void 0 ) type = '';

  VIEW.undo.splice(0, VIEW.undoPos + 1, {
    icon: (action + ".svg"),
    action: (action + " " + type),
    undo: undo,
    redo: redo
  });

  if (VIEW.undoPos >= 0) { VIEW.undoPos = -1; }  
  if (VIEW.undo.length > 50) { VIEW.undo.pop(); }

  VIEW.currUndoRef = VIEW.undo[VIEW.undoPos + 1];
};

var undo = function () {
  if (VIEW.undoPos + 1 === VIEW.undo.length) { return }

  VIEW.undoPos += 1;
  VIEW.undo[VIEW.undoPos].undo();

  VIEW.render();
};

var redo = function () {
  if (VIEW.undoPos - 1 === -2) { return }

  if (VIEW.undo[VIEW.undoPos].redo) { VIEW.undo[VIEW.undoPos].redo(); }
  VIEW.undoPos -= 1;

  VIEW.render();
};

var setTool = function (tool) {
  APP.tool = tool;
  VIEW.render();
};

var Toolbar = function () {
  return v( 'div', { class: 'w-40 bg-light bord-dark-r' },
    ['pencil', 'eraser', 'line', 'circle', 'square', 'fill', 'eye-dropper', 'move'].map(function (tool) { return v( 'button', {
          onClick: function () { setTool(tool); }, class: "fl fl-center m-0 p-0 w-40 h-40 bord-dark-r", style: ("" + (APP.tool === tool ? 'background: rgba(52, 152, 219, 255);' : '')) },
          v( 'img', { src: ("img/" + tool + ".svg") })
        ); }
      )
  )
};

var keyMap = {
  metaKey: {
    z: undo
  },
  shiftKey: {
    metaKey: {
      z: redo
    }
  },
  b: function () {
    setTool('pencil');
  },
  e: function () {
    setTool('eraser');
  },
  u: function () {
    setTool('line');
  },
  g: function () {
    setTool('fill');
  },
  l: function () {
    setTool('eye-dropper');
  },
  v: function () {
    setTool('move');
  }
};

var shiftKeyMark = Date.now();
var metaKeyMark = Date.now();
var alphaKeyMark = Date.now();

var setupKeyListeners = function () {
  window.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT') {
      return
    }

    var key = e.key.toLowerCase();
    
    if (!e.repeat && key === 'meta') {
      metaKeyMark = Date.now();
    } 

    if (!e.repeat && key === 'shift') {
      shiftKeyMark = Date.now();
    } 

    if (!e.repeat && key === 'z') {
      alphaKeyMark = Date.now();
    }

    if (e.shiftKey && e.metaKey) {
      if ((shiftKeyMark < metaKeyMark < alphaKeyMark) && key === 'z') {
        keyMap.shiftKey.metaKey['z']();
      }
    }
    
    if (!e.shiftKey && e.metaKey) {
      if ((metaKeyMark < alphaKeyMark) && key === 'z') {
        keyMap.metaKey['z']();
      }
    }

    if (e.shiftKey && !e.metaKey) ;

    if (!e.shiftKey && !e.metaKey && keyMap[e.key.toLowerCase()]) {
      keyMap[e.key.toLowerCase()]();
    }
  });
};

var enableActiveInput = function (id, val) {
  VIEW.activeInput.id = id;
  VIEW.activeInput.val = val;
  
  VIEW.render();
};

var disableActiveInput = function () {
  VIEW.activeInput.id = '';
  VIEW.activeInput.val = '';
  
  VIEW.render();
};

var setActiveInput = function (val) {
  VIEW.activeInput.val = val;
};

var setRGB = function (newRGB) {
  var rgb = newRGB;
  var hsl = RGBtoHSL(rgb);

  APP.color.rgb = rgb;
  APP.color.hsl = hsl;

  VIEW.render();
};

var setHSL = function (newHSL) {
  var hsl = newHSL;
  var rgb = HSLtoRGB(hsl);

  APP.color.hsl = hsl;
  APP.color.rgb = rgb;
  
  VIEW.render();
};

var setRed = function (e) {
  var r = parseInt(e.target.value);

  if (r >= 0 && r <= 255) {
    var newRGB = [r, APP.color.rgb[1], APP.color.rgb[2], APP.color.rgb[3]];
    setRGB(newRGB);
  }
};

var setGreen = function (e) {
  var g = parseInt(e.target.value);

  if (g >= 0 && g <= 255) {
    var newRGB = [APP.color.rgb[0], g, APP.color.rgb[2], APP.color.rgb[3]];
    setRGB(newRGB);
  }
};

var setBlue = function (e) {
  var b = parseInt(e.target.value);

  if (b >= 0 && b <= 255) {
    var newRGB = [APP.color.rgb[0], APP.color.rgb[1], b, APP.color.rgb[3]];
    setRGB(newRGB);
  }
};

var setHue = function (e) {
  var h = parseInt(e.target.value);
  
  if (h >= 0 && h <= 360) {
    var newHSL = [h, APP.color.hsl[1], APP.color.hsl[2], APP.color.hsl[3]];
    setHSL(newHSL);
  }
};

var setSaturation = function (e) {
  var s = parseInt(e.target.value);
  
  if (s >= 0 && s <= 100) {
    var newHSL = [APP.color.hsl[0], s, APP.color.hsl[2], APP.color.hsl[3]];
    setHSL(newHSL);
  }
};

var setLightness = function (e) {
  var l = parseInt(e.target.value);
  
  if (l >= 0 && l <= 100) {
    var newHSL = [APP.color.hsl[0], APP.color.hsl[1], l, APP.color.hsl[3]];
    setHSL(newHSL);
  }
};

var paletteAdd = function () {
  APP.palette.push(APP.color.rgb);
  
  VIEW.render();
};

var paletteDelete = function (i) {
  var index = APP.palette.indexOf(APP.color.rgb);

  if (index !== -1) {
    APP.palette.splice(index, 1);
    VIEW.render();
  } 
};

var Color = function () {
  return (
    v( 'div', { class: 'bord-dark-b fl-1' },
      v( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
        v( 'small', null, v( 'b', null, "Color" ) )
      ),
      v( 'div', { class: 'fl-column overflow-none p-10' },
        v( 'div', { class: 'b-r-2 overflow-none fl-column' },
          [
              {
                id: 'color-hue-range',
                min: 0,
                max: 360,
                func: setHue,
                style: "min-height: 26px; background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);"
              }, {
                id: 'color-saturation-range',
                min: 0,
                max: 100,
                func: setSaturation,
                style: ("min-height: 26px; background: linear-gradient(to right, hsl(" + (APP.color.hsl[0]) + ", 0%, 50%) 0%,hsl(" + (APP.color.hsl[0]) + ", 100%, 50%) 100%);")
              }, {
                id: 'color-lightness-range',
                min: 0,
                max: 100,
                func: setLightness,
                style: ("min-height: 26px; background: linear-gradient(to right, hsl(" + (APP.color.hsl[0]) + ", 100%, 0%) 0%, hsl(" + (APP.color.hsl[0]) + ", 100%, 50%) 50%, hsl(" + (APP.color.hsl[0]) + ", 100%, 100%) 100%)")
              }
            ].map(function (item, i) {
              return v( 'input', {
                type: 'range', min: item.min, max: item.max, style: item.style, class: 'fl-1 m-0', onFocus: function (e) {
                  enableActiveInput(item.id, APP.color.hsl[i]);
                }, onFocusOut: function () {
                  disableActiveInput();
                }, onInput: function (e) {
                  setActiveInput(e.target.value);
                  item.func(e);
                }, value: VIEW.activeInput.id === item.id ? VIEW.activeInput.val : APP.color.hsl[i] })
            })
        ),
        v( 'div', { class: 'p-v-10' },
          v( 'div', { class: 'fl fl-center-y', style: 'margin-bottom: 2px;' },
            v( 'small', { style: 'width: 50px; font-size: 11px;' }, "HSL"),
            [
                {
                  id: 'color-hue-text',
                  func: setHue
                }, {
                  id: 'color-saturation-text',
                  func: setSaturation
                }, {
                  id: 'color-lightness-text',
                  func: setLightness
                }
              ].map(function (item, i) {
                return v( 'input', {
                  class: 'fl-1', type: 'number', style: ("margin-right: " + (i === 2 ? 0 : 2) + "px;"), onFocus: function (e) {
                    enableActiveInput(item.id, APP.color.hsl[i]);
                  }, onFocusOut: function () {
                    disableActiveInput();
                  }, onInput: function (e) {
                    setActiveInput(e.target.value);
                    item.func(e);
                  }, value: VIEW.activeInput.id === item.id ? VIEW.activeInput.val : APP.color.hsl[i] })
              })
          ),
          v( 'div', { class: 'fl fl-center-y', style: 'margin-bottom: 2px;' },
            v( 'small', { style: 'width: 50px; font-size: 11px;' }, "RGB"),
            [
                {
                  id: 'color-red-text',
                  func: setRed
                }, {
                  id: 'color-green-text',
                  func: setGreen
                }, {
                  id: 'color-blue-text',
                  func: setBlue
                }
              ].map(function (item, i) {
                return v( 'input', {
                  class: 'fl-1', type: 'number', style: ("margin-right: " + (i === 2 ? 0 : 2) + "px;"), onFocus: function (e) {
                    enableActiveInput(item.id, APP.color.rgb[i]);
                  }, onFocusOut: function () {
                    disableActiveInput();
                  }, onInput: function (e) {
                    setActiveInput(e.target.value);
                    item.func(e);
                  }, value: VIEW.activeInput.id === item.id ? VIEW.activeInput.val : APP.color.rgb[i] })
              })
          )
          /* <div class='fl fl-center-y'>
            <small style='width: 50px; font-size: 11px;'>HEX</small>
            <input class='fl-1' type='text' />
          </div> */
        ),
        v( 'div', { class: 'fl' },
          v( 'div', {
            class: 'fl-1 no-ptr h-25 b-r-2', style: ("margin-right: 10px; background: rgba(" + (APP.color.rgb[0]) + ", " + (APP.color.rgb[1]) + ", " + (APP.color.rgb[2]) + ", 255); margin-bottom: 10px; ") }
          ),
          APP.palette.filter(function (c) { return APP.color.rgb[0] === c[0] &&
            APP.color.rgb[1] === c[1] &&
            APP.color.rgb[2] === c[2] &&
            APP.color.rgb[3] === c[3]; })
            .length === 0
            ? v( 'button', {
                onClick: function () { paletteAdd(); }, class: 'w-30 h-25 fl fl-center bg-dark bord-dark b-r-2' },
                v( 'img', { src: "img/insert.svg" })
              )
            : v( 'button', {
              onClick: function () { paletteDelete(); }, class: 'w-30 h-25 fl fl-center bg-dark bord-dark b-r-2' },
              v( 'img', { src: "img/delete.svg" })
            )
        ),
        v( 'div', { class: 'fl fl-wrap overflow-none b-r-2', style: 'align-content: baseline;' },
          APP.palette.map(function (c) { return v( 'button', {
                onClick: function () {
                  setRGB(c);
                }, class: 'm-0', style: ("\n                  width: 44px;\n                  min-height: 25px;\n                  background: rgba(" + (c[0]) + ", " + (c[1]) + ", " + (c[2]) + ", " + (c[3]) + ");\n                  border: " + (APP.color.rgb[0] === c[0] &&
                    APP.color.rgb[1] === c[1] &&
                    APP.color.rgb[2] === c[2] &&
                    APP.color.rgb[3] === c[3] ? '2px solid rgba(61,61,61, 1)' : '2px solid rgba(61,61,61, 0)') + ";\n                  box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, " + (APP.color.rgb[0] === c[0] &&
                    APP.color.rgb[1] === c[1] &&
                    APP.color.rgb[2] === c[2] &&
                    APP.color.rgb[3] === c[3] ? '255' : '0') + ");\n                ") }); }
            )
        )
      )
    )
  )
};

var setTargetCanvas = function (frame, layer) {
  if (frame === undefined) { console.error('setTargetCanvas - no frame given'); }
  if (layer === undefined) { console.error('setTargetCanvas - no layer given'); }

  if (frame >= 0 && frame < APP.frameCount && layer >= 0 && layer <= APP.layerCount) {
    APP.frameActive = frame;
    APP.layerActive = layer;

    VIEW.render();
  }
};

var seq = function (request, type, data) {
  var inserting = request === 'insert' || request === 'duplicate';
  
  function action (req, ref, target, entry) {
    if (req === 'insert') { ref.splice(target + 1, 0, entry); }
    if (req === 'delete') { ref.splice(target, 1); }
  }

  if (type === 'layer') {
    if (request === 'insert') {
      action(request, APP.layers, APP.layerActive, data);
    }

    if (request === 'delete') {
      action(request, APP.layers, APP.layerActive);
    }
  }

  if (type === 'frame') {
    if (request === 'insert') {
      APP.layers.forEach(function (layer, i) {
        var entry = new ImageData(APP.width, APP.height);
        entry.data.set(data[i].data);
        action(request, layer.frames, APP.frameActive, entry);
      });
    }

    if (request === 'delete') {
      APP.layers.forEach(function (layer) {
        action(request, layer.frames, APP.frameActive);
      });
    }
  }

  APP[(type + "Count")] += (inserting ? 1 : -1);

  if (inserting) {
    APP[(type + "Active")] += 1;
  } 
  
  if (request === 'delete') {
    if (APP[(type + "Active")] === APP[(type + "Count")]) {
      APP[(type + "Active")] -= 1;
    } 
  }
};

var timelineManager = function (ref) {
  var type = ref.type;
  var request = ref.request;
  var requestType = ref.requestType;
  var data = ref.data;
  var disableUndoRedo = ref.disableUndoRedo;

  var layerActive = APP.layerActive;
  var frameActive = APP.frameActive;
  var layerCount = APP.layerCount;
  var frameCount = APP.frameCount;

  if (!disableUndoRedo) {
    addToUndo(request, type);

    VIEW.currUndoRef.redo = function () {
      APP.frameCount = frameCount;
      APP.layerCount = layerCount;
      APP.frameActive = frameActive;
      APP.layerActive = layerActive;
      timelineManager({ type: type, request: request, requestType: requestType, data: data, disableUndoRedo: true });
    };
  }

  var newData = type === 'layer' ? {
    name: ("Layer " + (layerCount + 1)),
    hidden: false,
    frames: new Array(frameCount).fill(undefined).map(function (frame) { return new ImageData(APP.width, APP.height); })
  } : new Array(APP.layerCount)
    .fill(undefined)
    .map(function (item) {
      return new ImageData(APP.width, APP.height)
    });
  
  var cloneData = type === 'layer' ? {
    name: ((APP.layers[layerActive].name) + " " + (requestType === 'clone' ? '(Copy)' : '')),
    hidden: false,
    frames: new Array(frameCount)
      .fill(undefined)
      .map(function (frame, frameI) {
        var imgData = new ImageData(APP.width, APP.height);
        imgData.data.set(APP.layers[layerActive].frames[frameI].data);
        return imgData
      })
  } : new Array(layerCount)
      .fill(undefined)
      .map(function (item, i) {
        var copy = new ImageData(APP.width, APP.height);
        copy.data.set(APP.layers[i].frames[frameActive].data);
        return copy
      });
  
  if ((type === 'layer' || type === 'frame') && (requestType === 'new' || requestType === 'clone')) {
    seq('insert', type, requestType === 'new' ? newData : cloneData);
  }

  if ((type === 'layer' || type === 'frame') && request === 'delete') {
    if (APP[(type + "Count")] - 1 === 0) {
      seq('delete', type);
      if (type === 'layer') { newData.name = 'Layer 1'; }
      seq('insert', type, newData);
    } else {
      seq('delete', type);
    }
  }

  var layerActiveAfter = APP.layerActive;
  var frameActiveAfter = APP.frameActive;
  var layerCountAfter = APP.layerCount;
  var frameCountAfter = APP.frameCount;
  
  if (!disableUndoRedo) {
    VIEW.currUndoRef.undo = function () {
      APP.frameCount = frameCountAfter;
      APP.layerCount = layerCountAfter;
  
      if (type === 'layer') {
        APP.frameActive = frameActiveAfter;
        
        if (request === 'insert') {
          APP.layerActive = layerActiveAfter;
          seq('delete', type);
        }
  
        if (request === 'delete' && layerCount !== 1) {
          APP.layerActive = layerActive - 1;
          seq('insert', type, cloneData);
        }

        if (request === 'delete' && layerCount === 1) {
          seq('delete', type);
          seq('insert', type, cloneData);
        }
      }

      if (type === 'frame') {
        APP.layerActive = layerActiveAfter;
        
        if (request === 'insert') {
          APP.frameActive = frameActiveAfter;
          seq('delete', type);
        }
  
        if (request === 'delete' && frameCount !== 1) {
          APP.frameActive = frameActive - 1;
          seq('insert', type, cloneData);
        }

        if (request === 'delete' && frameCount === 1) {
          seq('delete', type);
          seq('insert', type, cloneData);
        }
      }
    };
  }

  VIEW.render();
};

var swap = function (type, dir) {
  var step = dir === 'up' ? -1 : 1;
  var active = type === 'layer' ? 'layerActive' : 'frameActive';
  var length = type === 'layer' ? APP.layerCount : APP.frameCount;

  if (APP[active] + step === -1) { return }
  if (APP[active] + step === length) { return }

  if (type === 'layer') {
    var temp = APP.layers[APP.layerActive + step];
    APP.layers[APP.layerActive + step] = APP.layers[APP.layerActive];
    APP.layers[APP.layerActive] = temp;
  }

  if (type === 'frame') {
    APP.layers.forEach(function (layer) {
      var temp = layer.frames[APP.frameActive + step];
      layer.frames[APP.frameActive + step] = layer.frames[APP.frameActive];
      layer.frames[APP.frameActive] = temp;
    });
  }

  APP[active] += step;

  VIEW.render();
};

var layersEditHidden = function (i) {
  APP.layers[i].hidden = !APP.layers[i].hidden;
  VIEW.render();
};

var nextFrame = function () {
  APP.frameActive = (APP.frameActive + 1) % APP.frameCount;
  VIEW.render();
};

var lastFrame = function () {
  APP.frameActive = APP.frameActive - 1 === -1 ? APP.frameCount - 1 : APP.frameActive - 1;
  VIEW.render();
};

// Animation
var scheduler = function () {
  APP.frameActive = (APP.frameActive + 1) % APP.frameCount;
  VIEW.render();
  VIEW.timerID = setTimeout(scheduler, 100);
};

var togglePlay = function () {
  if (APP.frameCount === 1) { return }

  if (VIEW.isPlaying) {
    clearTimeout(VIEW.timerID);
  } else {
    scheduler();
  }
  
  VIEW.isPlaying = !VIEW.isPlaying;
  VIEW.render();
};

var Timeline= function () {
  return (
    v( 'div', { class: 'bg-light bord-dark-t fl-column', style: 'height: 250px;' },
        v( 'div', { class: 'fl w-full bord-dark-b h-30' },
          v( 'div', { class: 'fl fl-justify-between bord-dark-r', style: 'width: 210px;' }
            /* <div style='width: 90px;' class='p-h-10 fl fl-center-y bord-dark-r'>
              <small><b>Layers</b></small>
            </div> */,
            v( 'div', { class: 'fl' },
              v( 'button', {
                onClick: function () { if (APP.layerCount < 30) { timelineManager({ type:'layer', request: 'insert', requestType: 'new' }); } }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/insert.svg" })
              ),
              v( 'button', {
                onClick: function () { timelineManager({ type:'layer', request: 'insert', requestType: 'clone' }); }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/clone.svg" })
              ),
              v( 'button', {
                onClick: function () { swap('layer', 'down'); }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/up.svg" })
              ),
              v( 'button', {
                onClick: function () { swap('layer', 'up'); }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/down.svg" })
              ),
              v( 'button', {
                onClick: function () { timelineManager({ type:'layer', request: 'delete' }); }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/delete.svg" })
              )
            )
          ),
          v( 'div', { class: 'fl fl-1' },
            v( 'div', { class: 'fl' },
              v( 'button', {
                onClick: function () { VIEW.onionSkinning = !VIEW.onionSkinning; VIEW.render(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r", style: VIEW.onionSkinning ? 'background: rgba(52, 152, 219, 255);' : '' },
                v( 'img', { src: "img/onion.svg" })
              )
            ),
            v( 'div', { class: 'fl-1 fl fl-justify-center' },
              v( 'div', { class: 'fl' },
                v( 'button', {
                  onClick: function () { lastFrame(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r bord-dark-l" },
                  v( 'img', { src: "img/lastframe.svg" })
                ),
                v( 'button', {
                  onClick: function () { togglePlay(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r" },
                  v( 'img', { src: ("img/" + (VIEW.isPlaying ? 'stop.svg' : 'play.svg')) })
                ),
                v( 'button', {
                  onClick: function () { nextFrame(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r" },
                  v( 'img', { src: "img/nextframe.svg" })
                )
              )
            ),
            v( 'div', { class: 'fl' },
              v( 'button', {
                onClick: function () { if (!VIEW.isPlaying && APP.frameCount < 50) { timelineManager({ type: 'frame', request: 'insert', requestType: 'new' }); } }, class: 'w-30 fl fl-center bord-dark-r bord-dark-l' },
                v( 'img', { src: "img/insert.svg" })
              ),
              v( 'button', {
                onClick: function () { timelineManager({ type:'frame', request: 'insert', requestType: 'clone' }); }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/clone.svg" })
              ),
              v( 'button', {
                onClick: function () { if (!VIEW.isPlaying) { swap('frame', 'up'); } }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/up.svg", style: 'transform: rotate(-90deg);' })
              ),
              v( 'button', {
                onClick: function () { if (!VIEW.isPlaying) { swap('frame', 'down'); } }, class: 'w-30 fl fl-center bord-dark-r' },
                v( 'img', { src: "img/down.svg", style: 'transform: rotate(-90deg);' })
              ),
              v( 'button', {
                onClick: function () { if (!VIEW.isPlaying) { timelineManager({ type:'frame', request: 'delete' }); } }, class: 'w-30 fl fl-center' },
                v( 'img', { src: "img/delete.svg" })
              )
            )
          )
        ),
        v( 'div', { class: 'fl bg-mid', style: 'height: calc(100% - 30px);' },
          v( 'div', { id: 'layers', class: 'overflow hide-scroll', style: 'padding-bottom: 30px;' },
            v( 'div', { class: 'bord-dark-r fl-col-reverse', style: 'width: 210px;' },
              APP.layers.map(function (layer, li) {
                  return v( 'div', {
                    class: 'fl bord-dark-b h-30', style: ("background: " + (APP.layerActive === li ? 'rgb(100, 100, 100)' :'') + ";") },
                    v( 'button', {
                      style: ("" + (layer.hidden ? 'background: rgba(52, 152, 219, 255);' : '')), onClick: function () { layersEditHidden(li); }, class: 'w-30 h-30 fl fl-center bord-dark-b' },
                      v( 'img', { src: ("img/" + (layer.hidden ? 'eye-active.svg' : 'eye.svg')) })
                    ),
                    v( 'button', {
                      onClick: function () { setTargetCanvas(APP.frameActive, li); }, class: 'fl-1 txt-left' },
                      v( 'small', { style: 'font-size: 11px;' }, v( 'b', null, layer.name ))
                    )
                  )
                })
            )
          ),
          v( 'div', { id: 'frames', class: 'fl-1 overflow hide-scroll', style: 'padding-bottom: 30px;' },
            v( 'canvas', { id: 'timeline-canvas', style: 'cursor: pointer;', onClick: function (e) {
              var x = Math.floor(e.offsetX / 30);
              var y = (APP.layerCount - 1) - Math.floor(e.offsetY / 30);
              
              setTargetCanvas(x, y);
            } })
          )
        )
      )
  )
};

var getPoint = function (imgDataArr, x, y, w, h) {
  if (!imgDataArr) { throw Error(("setPoint: " + imgDataArr + " undefined")) }
  if (!imgDataArr.length) { throw Error(("setPoint: " + imgDataArr + " not a valid array")) }

  if (x >= 0 && x < w && y >= 0 && y < h) { // check bounds
    var i = (x + w * y) * 4;
    return [
      imgDataArr[i + 0],
      imgDataArr[i + 1],
      imgDataArr[i + 2],
      imgDataArr[i + 3]
    ]
  }

  return [0, 0, 0, 0]
};

var setPoint = function (imgDataArr, x, y, w, h, color) {
  if (!imgDataArr) { throw Error(("setPoint: " + imgDataArr + " undefined")) }
  if (!imgDataArr.length) { throw Error(("setPoint: " + imgDataArr + " not a valid array")) }
  
  if (x >= 0 && x < w && y >= 0 && y < h) { // check bounds
    var i = (x + w * y) * 4;
    imgDataArr[i + 0] = color[0];
    imgDataArr[i + 1] = color[1];
    imgDataArr[i + 2] = color[2];
    imgDataArr[i + 3] = color[3];
  }
};

var areRGBAsEqual = function (c1, a, c2, b) {
  return (
    c1[a + 0] === c2[b + 0] &&
    c1[a + 1] === c2[b + 1] &&
    c1[a + 2] === c2[b + 2] &&
    c1[a + 3] === c2[b + 3]
  )
};

var getColorAtPixel = function (data, x, y, w) {
  var linearCord = (y * w + x) * 4;

  return [
    data[linearCord + 0],
    data[linearCord + 1],
    data[linearCord + 2],
    data[linearCord + 3]
  ]
};

var fill = function (canvasImgData, startX, startY, w, h, color) { // http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
  var linear_cords = (startY * w + startX) * 4;

  var pixel_stack = [{ x: startX, y: startY }];
  var original_color = getColorAtPixel(canvasImgData, startX, startY, w);

  if (areRGBAsEqual(color, 0, original_color, 0)) {
    return
  }

  while (pixel_stack.length > 0) {
    var new_pixel = pixel_stack.shift();
    var x = new_pixel.x;
    var y = new_pixel.y;

    linear_cords = (y * w + x) * 4;

    while (
      y-- >= 0 &&
      canvasImgData[linear_cords + 0] === original_color[0] &&
      canvasImgData[linear_cords + 1] === original_color[1] &&
      canvasImgData[linear_cords + 2] === original_color[2] &&
      canvasImgData[linear_cords + 3] === original_color[3]) {
        linear_cords -= w * 4;
    }

    linear_cords += w * 4;
    y++;

    var reached_left = false;
    var reached_right = false;

    while (
      y++ < h &&
      canvasImgData[linear_cords + 0] === original_color[0] &&
      canvasImgData[linear_cords + 1] === original_color[1] &&
      canvasImgData[linear_cords + 2] === original_color[2] &&
      canvasImgData[linear_cords + 3] === original_color[3]
    ) {
      canvasImgData[linear_cords + 0] = color[0];
      canvasImgData[linear_cords + 1] = color[1];
      canvasImgData[linear_cords + 2] = color[2];
      canvasImgData[linear_cords + 3] = color[3];

      if (x > 0) {
        if (
          canvasImgData[linear_cords - 4 + 0] === original_color[0] &&
          canvasImgData[linear_cords - 4 + 1] === original_color[1] &&
          canvasImgData[linear_cords - 4 + 2] === original_color[2] &&
          canvasImgData[linear_cords - 4 + 3] === original_color[3]
        ) {
          if (!reached_left) {
            pixel_stack.push({ x: x - 1, y: y });
            reached_left = true;
          }
        } else if (reached_left) {
          reached_left = false;
        }
      }
  
      if (x < w - 1) {
        if (
          canvasImgData[linear_cords + 4 + 0] === original_color[0] &&
          canvasImgData[linear_cords + 4 + 1] === original_color[1] &&
          canvasImgData[linear_cords + 4 + 2] === original_color[2] &&
          canvasImgData[linear_cords + 4 + 3] === original_color[3]
        ) {
          if (!reached_right) {
            pixel_stack.push({ x: x + 1, y: y });
            reached_right = true;
          }
        } else if (reached_right) {
          reached_right = false;
        }
      }
      
      linear_cords += w * 4;
    }
  }
};

var line = function (startX, startY, endX, endY, func) {
  var dx = Math.abs(endX - startX);
  var dy = Math.abs(endY - startY);

  var xDir = endX - startX >= 0 ? 1 : -1;
  var yDir = endY - startY >= 0 ? 1 : -1;
  
  var lineX = startX;
  var lineY = startY;

  var step = dx >= dy ? dx : dy;

  dx = dx / step;
  dy = dy / step;
  
  var i = 0;
  while (i < step) {
    func(Math.floor(lineX), Math.floor(lineY));

    lineX += (dx * xDir);
    lineY += (dy * yDir);
    i += 1;
  }

  func(Math.floor(lineX), Math.floor(lineY));
};

var circle = function (xCenter, yCenter, currX, currY, func) {
  var radius = Math.floor(Math.sqrt(Math.pow((currX - xCenter), 2) + Math.pow((currY - yCenter), 2)));

  if (radius <= 0) { return }

  var x = 0;
  var y = radius;
  var p = 1 - radius;

  var circlePlot = function () {
    func(xCenter + x, yCenter + y);
    func(xCenter + y, yCenter + x);
    func(xCenter - x, yCenter + y);
    func(xCenter - y, yCenter + x);
    func(xCenter + x, yCenter - y);
    func(xCenter + y, yCenter - x);
    func(xCenter - x, yCenter - y);
    func(xCenter - y, yCenter - x);
  };

  // Plot first set of points
  circlePlot();

  while (x <= y) {
    x++;
    if (p < 0) {
      p += 2 * x + 1; // Mid point is inside therefore y remains same
    } else { // Mid point is outside the circle so y decreases
      y--;
      p += 2 * (x - y) + 1;
    }

    circlePlot();
  }
};

var squareFilled = function (startX, startY, endX, endY, w, h, color, func) {
  var points = [];

  var dx = Math.abs(endX - startX);
  var dy = Math.abs(endY - startY);

  var xDir = endX - startX >= 0 ? 1 : -1;
  var yDir = endY - startY >= 0 ? 1 : -1;

  var lineX = startX;
  var lineY = startY;

  var xStep = 0;
  var yStep = 0;

  while (xStep <= dx) {
    yStep = 0;
    lineY = startY;

    while (yStep <= dy) {
      func(lineX, lineY);
      //points.push({ x: lineX, y: lineY })

      lineY += (1 * yDir);
      yStep += 1;
    }

    lineX += (1 * xDir);
    xStep += 1;
  }

  return points
};

var square = function (startX, startY, endX, endY, func) {
  var dx = Math.abs(endX - startX);
  var dy = Math.abs(endY - startY);

  var xDir = endX - startX >= 0 ? 1 : -1;
  var yDir = endY - startY >= 0 ? 1 : -1;

  var lineX = startX;
  var lineY = startY;
  var i = 0;

  func(lineX, lineY);

  while (i < dx) {
    lineX += (1 * xDir);
    func(lineX, startY);
    func(lineX, (startY + (dy * yDir)));
    i += 1;
  }

  i = 0;

  while (i < dy) {
    lineY += (1 * yDir);
    func(startX, lineY);
    func((startX + (dx * xDir)), lineY);
    i += 1;
  }
};

var paintCanvas = function (gestureEvent) {
  // Reset
  VIEW.canvasPreview.ctx.clearRect(0, 0, APP.width, APP.height);
  VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height);

  // Whole or Selection
  var target = APP.layers[APP.layerActive].frames[APP.frameActive].data; // or selection buffer
  var preview = VIEW.canvasPreview.imgData.data;

  // Translate coordinates based on current screen position and canvas scale
  var bb = VIEW.canvasView.dom.getBoundingClientRect();

  var scaleX = bb.width / VIEW.canvasView.dom.width;
  var scaleY = bb.height / VIEW.canvasView.dom.height;

  var startX = Math.floor((VIEW.window.startX - bb.x) / scaleX);
  var startY = Math.floor((VIEW.window.startY - bb.y) / scaleY);
  var prevX = Math.floor((VIEW.window.prevX - bb.x) / scaleX);
  var prevY = Math.floor((VIEW.window.prevY - bb.y) / scaleY);
  var currX = Math.floor((VIEW.window.currX - bb.x) / scaleX);
  var currY = Math.floor((VIEW.window.currY - bb.y) / scaleY);

  var setBrushPoints = function (canvas, x, y, w, h, color) {
    squareFilled(x - VIEW.brushSize, y - VIEW.brushSize, x + VIEW.brushSize, y + VIEW.brushSize, w, h, color, function (x, y) {
      setPoint(canvas, x, y, w, h, color);
    });
  };

  if (gestureEvent === 'hover' && APP.tool !== 'eye-dropper' && APP.tool !== 'move') {
    setBrushPoints(preview, currX, currY, APP.width, APP.height, APP.tool !== 'eraser' ? APP.color.rgb : [0, 0, 0, 50]);
    VIEW.render();

    return
  }

  // Setup Undo
  if (gestureEvent === 'start' && APP.tool !== 'eye-dropper') {
    var copy = new ImageData(APP.width, APP.height);
    copy.data.set(APP.layers[APP.layerActive].frames[APP.frameActive].data);
    var layerActive = APP.layerActive;
    var frameActive = APP.frameActive;
    
    addToUndo(APP.tool);

    VIEW.currUndoRef.undo = function () {
      APP.frameActive = frameActive;
      APP.layerActive = layerActive;
      APP.layers[layerActive].frames[frameActive].data.set(copy.data);
    };
  }
  
  // Eye dropper
  if (gestureEvent === 'end' && APP.tool === 'eye-dropper') {
    var color = getPoint(target, currX, currY, APP.width, APP.height);
    
    if (color[3] !== 0) {
      setRGB(color);
    }
  }

  // Fill
  if (gestureEvent === 'end' && APP.tool === 'fill') {
    fill(target, currX, currY, APP.width, APP.height, APP.color.rgb);
  }

  // Points
  if (APP.tool === 'pencil' || APP.tool === 'eraser') {
    if (APP.tool === 'eraser') {
      setBrushPoints(preview, currX, currY, APP.width, APP.height, [0, 0, 0, 50]);
    }
    
    line(prevX, prevY, currX, currY, function (x, y) {
      setBrushPoints(target, x, y, APP.width, APP.height, APP.tool === 'pencil' ? APP.color.rgb : [0, 0, 0, 0]);
    });
  }

  // Geometry
  if (APP.tool === 'line' || APP.tool === 'circle' || APP.tool === 'square') {
    var funcs = { 'line': line, 'circle': circle, 'square': square };
    
    funcs[APP.tool](startX, startY, currX, currY, function (x, y) {
      setBrushPoints(gestureEvent === 'start' || gestureEvent === 'resume' ? preview : target, x, y, APP.width, APP.height, APP.color.rgb);
    });
  }

  // Move
  if (APP.tool === 'move') {
    if (gestureEvent === 'start') {
      // Frame to Selection
      VIEW.canvasSelection.ctx.putImageData(APP.layers[APP.layerActive].frames[APP.frameActive], 0, 0);
      VIEW.canvasSelection.imgData = VIEW.canvasSelection.ctx.getImageData(0, 0, APP.width, APP.height);

      // Selection to Preview
      VIEW.canvasPreview.ctx.putImageData(VIEW.canvasSelection.imgData, 0, 0);
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height);

      // Clear main canvas
      APP.layers[APP.layerActive].frames[APP.frameActive] = new ImageData(APP.width, APP.height);
    }

    if (gestureEvent === 'resume') {
      // Selection to Preview
      VIEW.canvasPreview.ctx.putImageData(VIEW.canvasSelection.imgData, prevX - startX, prevY - startY);
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height);
    }

    if (gestureEvent === 'end') {
      // Selection to Preview
      VIEW.canvasPreview.ctx.putImageData(VIEW.canvasSelection.imgData, prevX - startX, prevY - startY);
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height);

      // Preview to Main
      APP.layers[APP.layerActive].frames[APP.frameActive] = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height);

      VIEW.canvasPreview.ctx.clearRect(0, 0, APP.width, APP.height);
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height);
    }
  }

  // Setup Redo
  if (gestureEvent === 'end' && APP.tool !== 'eye-dropper') {
    var copy$1 = new ImageData(APP.width, APP.height);
    copy$1.data.set(APP.layers[APP.layerActive].frames[APP.frameActive].data);
    var layerActive$1 = APP.layerActive;
    var frameActive$1 = APP.frameActive;

    VIEW.currUndoRef.redo = function () {
      APP.frameActive = frameActive$1;
      APP.layerActive = layerActive$1;
      APP.layers[layerActive$1].frames[frameActive$1].data.set(copy$1.data);
    };
  }

  VIEW.render();
};

var Canvas = function () {
  return v( 'div', { id: 'canvas-outer-scroll', class: ("overflow fl-1 cursor-" + (APP.tool)) },
    v( 'div', { id: 'canvas-inner-scroll', 'data-request': 'paintCanvas', 'data-hover': 'paintCanvas', class: 'fl fl-center fl-1', style: 'width: 1920px; height: 1920px;' },
      v( 'canvas', {                      
        id: 'canvas-view', width: APP.width, height: APP.height, style: 'width: 1920px; height: 1920px; transform: scale(.25); pointer-events: none;' })
    )  
  )
};

var Header = function () {
  return v( 'div', { class: 'h-40 bg-light bord-dark-b fl' },
    v( 'div', { class: "fl w-full" },
      v( 'div', { class: "fl-1 fl" },
        v( 'div', { class: "fl bord-dark-r rel w-40", onMouseLeave: function () {
            VIEW.file.open = false;
            VIEW.render();
          } },
          v( 'button', {
            onClick: function () {
              VIEW.file.open = !VIEW.file.open;
              VIEW.render();
            }, class: "fl fl-center m-0 p-0 w-40" },
            v( 'img', { src: "img/bars.svg" })
          ),
          v( 'div', {
            class: "bg-light fl-column bord-dark abs z-5", style: ("visibility: " + (VIEW.file.open ? 'visible' : 'hidden') + "; top: 10px; left: 10px;") },
              v( 'button', {
                onClick: function () {
                  VIEW.newCanvas.open = true;
                  VIEW.file.open = false;
                  VIEW.render();
                }, class: "m-0 p-h-15 h-40 fl fl-center-y" },
                v( 'img', { src: "img/new.svg" }),
                v( 'small', { class: "bold p-h-10", style: 'text-transform: capitalize;' }, "New")
              ),
              v( 'button', {
                onClick: function () {
                  VIEW.downloadCanvas.open = true;
                  VIEW.file.open = false;
                  VIEW.render();
                }, class: "m-0 p-h-15 h-40 fl fl-center-y" },
                v( 'img', { src: "img/download.svg" }),
                v( 'small', { class: "bold p-h-10", style: 'text-transform: capitalize;' }, "download")
              )
          )
        ),
        v( 'div', { class: 'fl-1 fl fl-justify-center' },
          v( 'button', {
            onClick: function () { undo(); }, class: "fl fl-center m-0 p-0 w-40 bord-dark-l bord-dark-r" },
            v( 'img', { src: "img/undo.svg" })
          ),
          v( 'button', {
            onClick: function () { redo(); }, class: "fl fl-center m-0 p-0 w-40 bord-dark-r" },
            v( 'img', { src: "img/redo.svg" })
          )
        )
      ),
      v( 'div', { class: "fl", style: "max-width: 241px; min-width: 241px;" }
        
      )
    )
  )

};

var downloadCanvas = function (e) {
  var c = document.createElement('canvas');
  var ctx = c.getContext('2d');
  var height = APP.height * VIEW.downloadCanvas.size;
  var width = APP.width * VIEW.downloadCanvas.size;

  if (VIEW.downloadCanvas.type === 'frame') {
    c.width = width;
    c.height = height;

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    APP.layers.forEach(function (layer) {
      VIEW.canvasTemp.ctx.putImageData(layer.frames[APP.frameActive], 0, 0);
      ctx.drawImage(VIEW.canvasView.dom, 0, 0, c.width, c.height);
    });

    var image = c.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    e.target.setAttribute('href', image);
  }

  if (VIEW.downloadCanvas.type === 'spritesheet') {
    var totalWidth = APP.width * VIEW.downloadCanvas.size * APP.frameCount;
    c.width = totalWidth;
    c.height = height;

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    var loop = function ( frameI ) {
      APP.layers.forEach(function (layer) {
        VIEW.canvasTemp.ctx.putImageData(layer.frames[frameI], 0, 0);
        ctx.drawImage(VIEW.canvasTemp.dom, frameI * width, 0, width, height);
      });
    };

    for (var frameI = 0; frameI < APP.frameCount; frameI++) loop( frameI );

    var image$1 = c.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    e.target.setAttribute('href', image$1);
  }

  if (VIEW.downloadCanvas.type === 'numgrid') {
    c.width = APP.width;
    c.height = APP.height;

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    APP.layers.forEach(function (layer) {
      VIEW.canvasTemp.ctx.putImageData(layer.frames[APP.frameActive], 0, 0);
      ctx.drawImage(VIEW.canvasView.dom, 0, 0, c.width, c.height);
    });

    var finalImage = ctx.getImageData(0, 0, c.width, c.height);

    var areRGBAsEqual = function (c1, a, c2, b) {
      return (
        c1[a + 0] === c2[b + 0] &&
        c1[a + 1] === c2[b + 1] &&
        c1[a + 2] === c2[b + 2] &&
        c1[a + 3] === c2[b + 3]
      )
    };

    var newCanvas = document.createElement('canvas');
    newCanvas.width = APP.width * 40;
    newCanvas.height = (APP.height * 40) + 40;
    var newCanvasCtx = newCanvas.getContext('2d');

    var index = 0;

    var includedColors = [];

    var loop$1 = function ( i ) {
      var x = index % APP.width;
      var y = Math.floor(index / APP.height);

      APP.palette.forEach(function (color, paletteIndex) {
        if (areRGBAsEqual(color, 0, [finalImage.data[i + 0], finalImage.data[i + 1], finalImage.data[i + 2], finalImage.data[i + 3]], 0)) {
          newCanvasCtx.fillStyle = 'rgba(5, 5, 5, .3)';
          newCanvasCtx.font = '20px serif';
          newCanvasCtx.fillText(paletteIndex, (x * 40) + 15, ((y + 2) * 40) - 15);
          newCanvasCtx.strokeStyle = 'rgba(5, 5, 5, .2)';
          newCanvasCtx.strokeRect(x * 40, (y + 1) * 40, 40, 40);

          console.log(paletteIndex);

          var includeColor = true;
      
          includedColors.forEach(function (colorPrep) {
            if (areRGBAsEqual(colorPrep.color, 0, [finalImage.data[i + 0], finalImage.data[i + 1], finalImage.data[i + 2], finalImage.data[i + 3]], 0)) {
              includeColor = false;
            }
          });

          if (includeColor) {
            includedColors.push({
              paletteIndex: paletteIndex,
              color: [finalImage.data[i + 0], finalImage.data[i + 1], finalImage.data[i + 2], finalImage.data[i + 3]]
            });
          }
        }
      });

      includedColors.forEach(function (includedColor, includedColorI){
        newCanvasCtx.fillStyle = "rgba(" + (includedColor.color[0]) + ", " + (includedColor.color[1]) + ", " + (includedColor.color[2]) + ", 255)";
        newCanvasCtx.font = '20px serif';
        newCanvasCtx.fillText(includedColor.paletteIndex, (includedColorI * 80) + 15, 40);
        newCanvasCtx.fillRect((includedColorI * 80) + 40, 0, 40, 40);
      });

      index += 1;
    };

    for (var i = 0; i < finalImage.data.length; i += 4) loop$1( i );

    var image$2 = newCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    e.target.setAttribute('href', image$2);
  }
};

var View = /*@__PURE__*/(function (Component) {
  function View () {
    Component.apply(this, arguments);
  }

  if ( Component ) View.__proto__ = Component;
  View.prototype = Object.create( Component && Component.prototype );
  View.prototype.constructor = View;

  View.prototype.componentDidMount = function componentDidMount () {
    var this$1 = this;

    VIEW.render = function () {
      this$1.setState({}, function () {
        VIEW.canvasTemp.ctx.clearRect(0, 0, APP.width, APP.height);
        VIEW.canvasFinal.ctx.clearRect(0, 0, APP.width, APP.height);
        VIEW.canvasView.ctx.clearRect(0, 0, APP.width, APP.height);

        APP.layers.forEach(function (layer, i) {
          VIEW.canvasView.ctx.globalAlpha = 1;

          if (layer.hidden) { return }

          // Onion skinning
          if (APP.layerActive === i && VIEW.onionSkinning && !VIEW.isPlaying) {
            var framesAhead = 3;
            var framesBehind = 3;
            var framesTotal = framesBehind + framesAhead;

            VIEW.canvasView.ctx.globalAlpha = .5;

            for (var a = framesAhead - framesTotal; a < framesAhead; a++) {
              if (!layer.frames[APP.frameActive - a]) { continue }

              var target$1 = layer.frames[APP.frameActive - a]; 
              VIEW.canvasTemp.ctx.putImageData(target$1, 0, 0);
              VIEW.canvasView.ctx.drawImage(VIEW.canvasTemp.dom, 0, 0);
            }
          }

          // Regular frame render
          VIEW.canvasView.ctx.globalAlpha = 1;

          var target = layer.frames[APP.frameActive];

          for (var b = 0; b < 2; b++) { // For whatever reason safari makes me do this twice
            // Target Canvas
            VIEW.canvasTemp.ctx.putImageData(target, 0, 0);
            VIEW.canvasView.ctx.drawImage(VIEW.canvasTemp.dom, 0, 0);
            
            // Preview Canvas
            if (APP.layerActive === i) {
              VIEW.canvasTemp.ctx.putImageData(VIEW.canvasPreview.imgData, 0, 0);
              VIEW.canvasView.ctx.drawImage(VIEW.canvasTemp.dom, 0, 0);
            }
          }
        });
        
        var tile = 30;

        VIEW.canvasTimeline.width = APP.frameCount * tile * 2;
        VIEW.canvasTimeline.height = APP.layerCount * tile * 2;
        VIEW.canvasTimeline.style.width = (APP.frameCount * tile) + "px";
        VIEW.canvasTimeline.style.height = (APP.layerCount * tile) + "px";
        var ctx = VIEW.canvasTimeline.getContext('2d');

        VIEW.canvasTimelineTemp.width = APP.frameCount * tile * 2;
        VIEW.canvasTimelineTemp.height = APP.layerCount * tile * 2;
        var ctxTemp = VIEW.canvasTimelineTemp.getContext('2d');

        APP.layers.map(function (layer, li) {
          layer.frames.map(function (canvas, fi) {
            var w = tile * 2;
            var h = tile * 2;
            var x = fi * w;
            var y = li * h;
            var BG = APP.frameActive === fi && APP.layerActive === li
                        ? 'rgba(52, 152, 219, 255)'
                        : (APP.frameActive === fi || APP.layerActive === li)
                          ? 'rgba(100, 100, 100, 255)'
                          : 'rgba(50, 50, 50, 255)';


            ctx.fillStyle = 'rgba(33, 33, 33, 255)';
            ctx.fillRect(x, ((APP.layerCount - 1) * h) - y, w, h);
            
            ctx.fillStyle = BG;
            ctx.fillRect(x, ((APP.layerCount - 1) * h) - y, w - 2, h - 2);
            
            ctxTemp.putImageData(canvas, x + 5, (((APP.layerCount - 1) * h) - y) + 5, 0, 0, w - 13, h - 13);    
          });
        });

        ctx.drawImage(VIEW.canvasTimelineTemp, 0, 0);
      });
    };

    initCanvases();

    this.funcs = { paintCanvas: paintCanvas };

    // View control customization
    this.canvasOuterScroll = document.querySelector('#canvas-outer-scroll');
    this.canvasInnerScroll = document.querySelector('#canvas-inner-scroll');

    this.timelineScroll = {
      isSyncingLeftScroll: false,
      isSyncingRightScroll: false,
      leftDiv: document.querySelector('#layers'),
      rightDiv: document.querySelector('#frames')
    };

    this.timelineScrollController();
    this.centerCanvas();

    // Adding google analytics
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'UA-144729452-1');
  };

  View.prototype.centerCanvas = function centerCanvas () {
    var outerW = this.canvasOuterScroll.offsetWidth;
    var innerW = this.canvasInnerScroll.offsetWidth;
    var outerH = this.canvasOuterScroll.offsetHeight;
    var innerH = this.canvasInnerScroll.offsetHeight;
    
    this.canvasOuterScroll.scrollLeft = Math.floor((innerW - outerW) / 2) + 8;
    this.canvasOuterScroll.scrollTop = Math.floor((innerH - outerH) / 2) + 8;
  };

  View.prototype.timelineScrollController = function timelineScrollController () {
    var this$1 = this;

    this.timelineScroll.leftDiv.addEventListener('scroll', function (e) {
      if (!this$1.timelineScroll.isSyncingLeftScroll) {
        this$1.timelineScroll.isSyncingRightScroll = true;
        this$1.timelineScroll.rightDiv.scrollTop = e.target.scrollTop;
      }
      this$1.timelineScroll.isSyncingLeftScroll = false;
    });
    
    this.timelineScroll.rightDiv.addEventListener('scroll', function (e) {
      if (!this$1.timelineScroll.isSyncingRightScroll) {
        this$1.timelineScroll.isSyncingLeftScroll = true;
        this$1.timelineScroll.leftDiv.scrollTop = e.target.scrollTop;
      }
      this$1.timelineScroll.isSyncingRightScroll = false;
    });
  };

  View.prototype.onGestureDown = function onGestureDown (e) {
    if (!VIEW.isPlaying) 

    { VIEW.window.request = e.target.dataset.request || ''; }
    VIEW.window.mouseDown = true;
    VIEW.window.startX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    VIEW.window.startY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
    VIEW.window.prevX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    VIEW.window.prevY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
    VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    VIEW.window.currY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;

    if (VIEW.window.request) { this.funcs[VIEW.window.request]('start'); }
  };
  
  View.prototype.onGestureDrag = function onGestureDrag (e) {
    if (!VIEW.isPlaying) 

    { VIEW.window.prevX = VIEW.window.currX; }
    VIEW.window.prevY = VIEW.window.currY;
    VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    VIEW.window.currY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
    
    if (VIEW.window.request) { this.funcs[VIEW.window.request]('resume'); }
  
    if (e.target.tagName !== 'INPUT') { // prevent block on input range elements
      e.preventDefault(); // block pull to refresh on mobile browsers
    }
  };

  View.prototype.onGestureEnd = function onGestureEnd (e) {
    if (!VIEW.isPlaying)

    { if (VIEW.window.request) { this.funcs[VIEW.window.request]('end'); } }

    VIEW.window.request = '';
    VIEW.window.mouseDown = false;
    VIEW.window.startX = 0;
    VIEW.window.startY = 0;
    VIEW.window.prevX = 0;
    VIEW.window.prevY = 0;
    VIEW.window.currX = 0;
    VIEW.window.currY = 0;
  };

  View.prototype.onGestureHover = function onGestureHover (e) {
    if (!VIEW.isPlaying)

    { VIEW.window.prevX = VIEW.window.currX; }
    VIEW.window.prevY = VIEW.window.currY;
    VIEW.window.currX = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    VIEW.window.currY = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;

    if (e.target.dataset.hover) { this.funcs[e.target.dataset.hover]('hover'); }
  };
  
  View.prototype.dragOrHover = function dragOrHover (e) {
    if (VIEW.window.mouseDown) {
      this.onGestureDrag(e);
    } else {
      this.onGestureHover(e);
    }
  };

  View.prototype.render = function render () {
    var this$1 = this;

    return (
      v( 'div', {
        class: 'h-full relative', onMouseDown: function (e) { if (e.which === 1) { this$1.onGestureDown(e); } }, onMouseMove: function (e) { this$1.dragOrHover(e); }, onMouseUp: function (e) { this$1.onGestureEnd(e); }, onMouseLeave: function (e) { this$1.onGestureEnd(e); } }
        /* {ENV === 'DEV' && <div id='debugger' class='abs' style='right: 0px; left: 0px; width: 100px; height: 100px; background: white; z-index: 1000;'>
          <canvas />
        </div>} */,
        v( Header, null ),
        v( 'div', { class: 'fl', style: 'height: calc(100% - 40px); ' },
          v( Toolbar, null ),
          v( 'div', { class: 'fl-column', style: 'width: calc(100% - 281px);' },
            v( Canvas, null ),
            v( Timeline, null )
          ),
          v( 'div', { class: 'bg-light bord-dark-l fl-column', style: "max-width: 241px; min-width: 241px;" },
            v( 'div', { class: 'bord-dark-b fl-column overflow' },
              v( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
                v( 'small', null, v( 'b', null, "Tool" ) )
              ),
              v( 'div', { class: 'fl-1 overflow' },
                v( 'div', { class: "fl fl-center p-10" },
                  v( 'small', { style: "width: 150px; font-size: 11px;" }, "Brush Size"),
                  v( 'div', { class: 'fl-1 select' },
                    v( 'select', {
                      onInput: function (e) {
                        VIEW.brushSize = parseInt(e.target.value);
                      }, value: VIEW.brushSize, class: "w-full" },
                        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (size, i) {
                            return v( 'option', { value: i }, size)
                          })
                    )
                  )
                )
              )
            ),
            v( Color, null ),
            v( 'div', { class: 'bord-dark-b fl-column overflow', style: 'min-height: 249px; max-height: 249px;' },
              v( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
                v( 'small', null, v( 'b', null, "History" ) )
              ),
              v( 'div', { class: 'fl-1 overflow' },
                VIEW.undo.map(function (entry, i) {
                    return v( 'button', { class: ("p-h-10 h-30 w-full txt-left fl fl-center-y no-ptr " + (VIEW.undoPos === i ? 'bg-xlight' : '')) },
                      v( 'img', { width: '10', height: '10', style: 'margin-right: 10px;', src: ("img/" + (entry.icon)) }),
                      v( 'small', { style: 'text-transform: capitalize; font-size: 11px;' }, v( 'b', null, entry.action ))
                    )
                  })
              )
            )
          )
        ),
        VIEW.newCanvas.open && v( 'div', { class: "abs top left w-full h-full fl fl-justify-center", style: "z-index: 10;" },
          v( 'div', { class: "w-full overflow-hidden", style: "max-width: 300px; margin-top: 175px;" },
            v( 'div', { class: "fl fl-center bg-mid bord-dark p-v-5", style: 'border-top-right-radius: 5px; border-top-left-radius: 5px;' }, v( 'small', null, v( 'b', null, "New Canvas" ) )),
            v( 'div', { class: "p-10 bg-light bord-dark-l bord-dark-r bord-dark-b", style: 'border-bottom-right-radius: 5px; border-bottom-left-radius: 5px;' },
              v( 'div', { class: "m-5 p-v-5" },
                v( 'div', { class: "fl fl-center" },
                  v( 'small', { class: "bold", style: "width: 100px;" }, "Dimensions"),
                  v( 'div', { class: 'fl-1 select' },
                    v( 'select', {
                      onInput: function (e) {
                        var val = e.target.value.split('x');
                        VIEW.newCanvas.w = parseInt(val[0]);
                        VIEW.newCanvas.h = parseInt(val[1]);
                      }, class: "w-full" },
                      v( 'option', { value: "32x32" }, "32x32"),
                      v( 'option', { value: "50x50" }, "50x50"),
                      v( 'option', { value: "64x64" }, "64x64"),
                      v( 'option', { value: "100x100" }, "100x100"),
                      v( 'option', { value: "128x128" }, "128x128")
                    )
                  )
                )
              ),
              v( 'div', { class: "fl", style: "padding-top: 5px;" },
                v( 'button', {
                  onClick: function () {
                    VIEW.newCanvas.open = false;
                    VIEW.render();
                  }, class: "b-r-2 bold p-5 w-full bg-red m-5" }, "Cancel"),
                v( 'button', {
                  onClick: function () {
                    newData(VIEW.newCanvas.w, VIEW.newCanvas.h);
                    VIEW.newCanvas.open = false;
                    VIEW.render();
                  }, class: "b-r-2 bold p-5 w-full bg-green m-5" }, "Confirm")
              )
            )
          )
        ),
        VIEW.downloadCanvas.open && v( 'div', { class: "abs top left w-full h-full fl fl-center-x", style: "z-index: 10;" },
          v( 'div', { class: "w-full", style: "max-width: 300px; overflow: hidden; margin-top: 175px;" },
              v( 'div', { class: "fl fl-center bg-mid bord-dark p-v-5", style: 'border-top-right-radius: 5px; border-top-left-radius: 5px;' }, v( 'small', { class: "bold" }, "Download")),
              v( 'div', { class: "p-10 bg-light bord-dark-l bord-dark-r bord-dark-b", style: 'border-bottom-right-radius: 5px; border-bottom-left-radius: 5px;' },
                v( 'div', { class: "m-5 p-v-5" },
                  v( 'div', { class: "fl fl-center" },
                    v( 'small', { class: "bold", style: "width: 100px;" }, "Type"),
                    v( 'div', { class: 'fl-1 select' },
                      v( 'select', {
                        onInput: function (e) {
                          VIEW.downloadCanvas.type = e.target.value;
                        }, value: VIEW.downloadCanvas.type, id: "config-download-size", class: "w-full" },
                          v( 'option', { value: "frame" }, "Frame"),
                          v( 'option', { value: "spritesheet" }, "Spritesheet"),
                          v( 'option', { value: "numgrid" }, "Number Grid")
                      )
                    )
                  )
                ),
                v( 'div', { class: "m-5 p-v-5" },
                    v( 'div', { class: "fl fl-center" },
                      v( 'small', { class: "bold", style: "width: 100px;" }, "Size"),
                      v( 'div', { class: 'fl-1 select' },
                        v( 'select', {
                          onInput: function (e) {
                            VIEW.downloadCanvas.size = parseInt(e.target.value);
                          }, value: VIEW.downloadCanvas.size, id: "config-download-size", class: "w-full" },
                            v( 'option', { value: "2" }, "2x"),
                            v( 'option', { value: "4" }, "4x"),
                            v( 'option', { value: "8" }, "8x"),
                            v( 'option', { value: "16" }, "16x"),
                            v( 'option', { value: "32" }, "32x"),
                            v( 'option', { value: "64" }, "64x")
                        )
                      )
                    )
                ),
                v( 'div', { class: "fl", style: "padding-top: 5px;" },
                  v( 'button', {
                    onClick: function () {
                      VIEW.downloadCanvas.open = false;
                      VIEW.render();
                    }, class: "b-r-2 bold p-5 w-full bg-red m-5" }, "Cancel"),
                  v( 'a', {
                    onClick: function (e) {
                      downloadCanvas(e);
                    }, class: "w-full m-5 clickable", download: "pixel-art.png", style: "display: inline-block;" },
                    v( 'button', { class: "b-r-2 bold p-5 w-full bg-green no-ptr" }, "Download")
                  )
                )
              )
          )
        )
      )
    )
  };

  return View;
}(d));

var loadData = function (ref) {
  var onLoaded = ref.onLoaded;
  var onError = ref.onError;

  //console.time('startRead')
  localforage.getItem('pixel-art-app').then(function (stored) {
    //console.timeEnd('startRead')
    for (var key in stored) {
      APP[key] = stored[key];
    }

    onLoaded();
  }).catch(function(err) {
    console.log(err);
    onError();
  });
};

var saveData = function () {
  setTimeout(function () {
    console.time('startwrite');
    localforage.setItem('pixel-art-app', APP).then(function(value) {
      console.timeEnd('startwrite');
    }).catch(function(err) {
      console.log(err);
    });
  }, 50);
};

var onProgramStart = function () {
  console.log('Program started.');

  newData(64, 64, true);
  O(v( View, null ), document.body);
  
  loadData({
    onLoaded: function () {
      initCanvases();
      VIEW.render();
    },
    onError: function () {}
  });

  setupKeyListeners();
  
  window.addEventListener('keyup', saveData);
  window.addEventListener('mouseup', saveData);
};

window.addEventListener('load', onProgramStart);
if (ENV === 'PROD') {
  window.addEventListener('beforeunload', function (event) {
    event.returnValue = "Are you sure you want to leave?";
  });
}
//# sourceMappingURL=bundle.js.map
