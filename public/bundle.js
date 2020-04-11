(function () {
  'use strict';

  var WINDOW = {};
  var resetWindow = function () {
    WINDOW.REQUEST = '';
    WINDOW.MOUSE_DOWN = false;
    WINDOW.START_X = 0;
    WINDOW.START_Y = 0;
    WINDOW.PREV_X = 0;
    WINDOW.PREV_Y = 0;
    WINDOW.CURR_X = 0;
    WINDOW.CURR_Y = 0;
  };
  resetWindow();

  var onGestureDown = function (e) {
    WINDOW.REQUEST = e.target.dataset.request || '';
    WINDOW.MOUSE_DOWN = true;
    WINDOW.START_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    WINDOW.START_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
    WINDOW.PREV_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    WINDOW.PREV_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
    WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
  };

  var onGestureHover = function (e) {
    WINDOW.PREV_X = WINDOW.CURR_X;
    WINDOW.PREV_Y = WINDOW.CURR_Y;
    WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
  };

  var onGestureDrag = function (e) {
    WINDOW.PREV_X = WINDOW.CURR_X;
    WINDOW.PREV_Y = WINDOW.CURR_Y;
    WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
    WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;

    if (e.target.tagName !== 'INPUT') { // prevent block on input range elements
      e.preventDefault(); // block pull to refresh on mobile browsers
    }
  };

  var gestureEnd = function (e) {
    
    resetWindow();
  };

  var dragOrHover = function (e) {
    if (WINDOW.MOUSE_DOWN) {
      onGestureDrag(e);
    } else {
      onGestureHover(e);
    }
  };

  var viewSetupListeners = function () {
    window.addEventListener('mousedown', onGestureDown);
    window.addEventListener('touchstart', onGestureDown, { passive: false }); // allow prevent default

    window.addEventListener('mousemove', dragOrHover);
    window.addEventListener('touchmove', dragOrHover, { passive: false }); // allow prevent default

    window.addEventListener('mouseup', gestureEnd);
    window.addEventListener('touchend', gestureEnd);
  };

  var VNode = function VNode() {};

  var options = {};

  var stack = [];

  var EMPTY_CHILDREN = [];

  function h(nodeName, attributes) {
  	var arguments$1 = arguments;

  	var children = EMPTY_CHILDREN,
  	    lastSimple,
  	    child,
  	    simple,
  	    i;
  	for (i = arguments.length; i-- > 2;) {
  		stack.push(arguments$1[i]);
  	}
  	if (attributes && attributes.children != null) {
  		if (!stack.length) { stack.push(attributes.children); }
  		delete attributes.children;
  	}
  	while (stack.length) {
  		if ((child = stack.pop()) && child.pop !== undefined) {
  			for (i = child.length; i--;) {
  				stack.push(child[i]);
  			}
  		} else {
  			if (typeof child === 'boolean') { child = null; }

  			if (simple = typeof nodeName !== 'function') {
  				if (child == null) { child = ''; }else if (typeof child === 'number') { child = String(child); }else if (typeof child !== 'string') { simple = false; }
  			}

  			if (simple && lastSimple) {
  				children[children.length - 1] += child;
  			} else if (children === EMPTY_CHILDREN) {
  				children = [child];
  			} else {
  				children.push(child);
  			}

  			lastSimple = simple;
  		}
  	}

  	var p = new VNode();
  	p.nodeName = nodeName;
  	p.children = children;
  	p.attributes = attributes == null ? undefined : attributes;
  	p.key = attributes == null ? undefined : attributes.key;

  	return p;
  }

  function extend(obj, props) {
    for (var i in props) {
      obj[i] = props[i];
    }return obj;
  }

  function applyRef(ref, value) {
    if (ref) {
      if (typeof ref == 'function') { ref(value); }else { ref.current = value; }
    }
  }

  var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

  var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

  var items = [];

  function enqueueRender(component) {
  	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
  		(defer)(rerender);
  	}
  }

  function rerender() {
  	var p;
  	while (p = items.pop()) {
  		if (p._dirty) { renderComponent(p); }
  	}
  }

  function isSameNodeType(node, vnode, hydrating) {
  	if (typeof vnode === 'string' || typeof vnode === 'number') {
  		return node.splitText !== undefined;
  	}
  	if (typeof vnode.nodeName === 'string') {
  		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
  	}
  	return hydrating || node._componentConstructor === vnode.nodeName;
  }

  function isNamedNode(node, nodeName) {
  	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
  }

  function getNodeProps(vnode) {
  	var props = extend({}, vnode.attributes);
  	props.children = vnode.children;

  	var defaultProps = vnode.nodeName.defaultProps;
  	if (defaultProps !== undefined) {
  		for (var i in defaultProps) {
  			if (props[i] === undefined) {
  				props[i] = defaultProps[i];
  			}
  		}
  	}

  	return props;
  }

  function createNode(nodeName, isSvg) {
  	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
  	node.normalizedNodeName = nodeName;
  	return node;
  }

  function removeNode(node) {
  	var parentNode = node.parentNode;
  	if (parentNode) { parentNode.removeChild(node); }
  }

  function setAccessor(node, name, old, value, isSvg) {
  	if (name === 'className') { name = 'class'; }

  	if (name === 'key') ; else if (name === 'ref') {
  		applyRef(old, null);
  		applyRef(value, node);
  	} else if (name === 'class' && !isSvg) {
  		node.className = value || '';
  	} else if (name === 'style') {
  		if (!value || typeof value === 'string' || typeof old === 'string') {
  			node.style.cssText = value || '';
  		}
  		if (value && typeof value === 'object') {
  			if (typeof old !== 'string') {
  				for (var i in old) {
  					if (!(i in value)) { node.style[i] = ''; }
  				}
  			}
  			for (var i in value) {
  				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
  			}
  		}
  	} else if (name === 'dangerouslySetInnerHTML') {
  		if (value) { node.innerHTML = value.__html || ''; }
  	} else if (name[0] == 'o' && name[1] == 'n') {
  		var useCapture = name !== (name = name.replace(/Capture$/, ''));
  		name = name.toLowerCase().substring(2);
  		if (value) {
  			if (!old) { node.addEventListener(name, eventProxy, useCapture); }
  		} else {
  			node.removeEventListener(name, eventProxy, useCapture);
  		}
  		(node._listeners || (node._listeners = {}))[name] = value;
  	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
  		try {
  			node[name] = value == null ? '' : value;
  		} catch (e) {}
  		if ((value == null || value === false) && name != 'spellcheck') { node.removeAttribute(name); }
  	} else {
  		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

  		if (value == null || value === false) {
  			if (ns) { node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); }else { node.removeAttribute(name); }
  		} else if (typeof value !== 'function') {
  			if (ns) { node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); }else { node.setAttribute(name, value); }
  		}
  	}
  }

  function eventProxy(e) {
  	return this._listeners[e.type](e);
  }

  var mounts = [];

  var diffLevel = 0;

  var isSvgMode = false;

  var hydrating = false;

  function flushMounts() {
  	var c;
  	while (c = mounts.shift()) {
  		if (c.componentDidMount) { c.componentDidMount(); }
  	}
  }

  function diff(dom, vnode, context, mountAll, parent, componentRoot) {
  	if (!diffLevel++) {
  		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

  		hydrating = dom != null && !('__preactattr_' in dom);
  	}

  	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

  	if (parent && ret.parentNode !== parent) { parent.appendChild(ret); }

  	if (! --diffLevel) {
  		hydrating = false;

  		if (!componentRoot) { flushMounts(); }
  	}

  	return ret;
  }

  function idiff(dom, vnode, context, mountAll, componentRoot) {
  	var out = dom,
  	    prevSvgMode = isSvgMode;

  	if (vnode == null || typeof vnode === 'boolean') { vnode = ''; }

  	if (typeof vnode === 'string' || typeof vnode === 'number') {
  		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
  			if (dom.nodeValue != vnode) {
  				dom.nodeValue = vnode;
  			}
  		} else {
  			out = document.createTextNode(vnode);
  			if (dom) {
  				if (dom.parentNode) { dom.parentNode.replaceChild(out, dom); }
  				recollectNodeTree(dom, true);
  			}
  		}

  		out['__preactattr_'] = true;

  		return out;
  	}

  	var vnodeName = vnode.nodeName;
  	if (typeof vnodeName === 'function') {
  		return buildComponentFromVNode(dom, vnode, context, mountAll);
  	}

  	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

  	vnodeName = String(vnodeName);
  	if (!dom || !isNamedNode(dom, vnodeName)) {
  		out = createNode(vnodeName, isSvgMode);

  		if (dom) {
  			while (dom.firstChild) {
  				out.appendChild(dom.firstChild);
  			}
  			if (dom.parentNode) { dom.parentNode.replaceChild(out, dom); }

  			recollectNodeTree(dom, true);
  		}
  	}

  	var fc = out.firstChild,
  	    props = out['__preactattr_'],
  	    vchildren = vnode.children;

  	if (props == null) {
  		props = out['__preactattr_'] = {};
  		for (var a = out.attributes, i = a.length; i--;) {
  			props[a[i].name] = a[i].value;
  		}
  	}

  	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
  		if (fc.nodeValue != vchildren[0]) {
  			fc.nodeValue = vchildren[0];
  		}
  	} else if (vchildren && vchildren.length || fc != null) {
  			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
  		}

  	diffAttributes(out, vnode.attributes, props);

  	isSvgMode = prevSvgMode;

  	return out;
  }

  function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
  	var originalChildren = dom.childNodes,
  	    children = [],
  	    keyed = {},
  	    keyedLen = 0,
  	    min = 0,
  	    len = originalChildren.length,
  	    childrenLen = 0,
  	    vlen = vchildren ? vchildren.length : 0,
  	    j,
  	    c,
  	    f,
  	    vchild,
  	    child;

  	if (len !== 0) {
  		for (var i = 0; i < len; i++) {
  			var _child = originalChildren[i],
  			    props = _child['__preactattr_'],
  			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
  			if (key != null) {
  				keyedLen++;
  				keyed[key] = _child;
  			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
  				children[childrenLen++] = _child;
  			}
  		}
  	}

  	if (vlen !== 0) {
  		for (var i = 0; i < vlen; i++) {
  			vchild = vchildren[i];
  			child = null;

  			var key = vchild.key;
  			if (key != null) {
  				if (keyedLen && keyed[key] !== undefined) {
  					child = keyed[key];
  					keyed[key] = undefined;
  					keyedLen--;
  				}
  			} else if (min < childrenLen) {
  					for (j = min; j < childrenLen; j++) {
  						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
  							child = c;
  							children[j] = undefined;
  							if (j === childrenLen - 1) { childrenLen--; }
  							if (j === min) { min++; }
  							break;
  						}
  					}
  				}

  			child = idiff(child, vchild, context, mountAll);

  			f = originalChildren[i];
  			if (child && child !== dom && child !== f) {
  				if (f == null) {
  					dom.appendChild(child);
  				} else if (child === f.nextSibling) {
  					removeNode(f);
  				} else {
  					dom.insertBefore(child, f);
  				}
  			}
  		}
  	}

  	if (keyedLen) {
  		for (var i in keyed) {
  			if (keyed[i] !== undefined) { recollectNodeTree(keyed[i], false); }
  		}
  	}

  	while (min <= childrenLen) {
  		if ((child = children[childrenLen--]) !== undefined) { recollectNodeTree(child, false); }
  	}
  }

  function recollectNodeTree(node, unmountOnly) {
  	var component = node._component;
  	if (component) {
  		unmountComponent(component);
  	} else {
  		if (node['__preactattr_'] != null) { applyRef(node['__preactattr_'].ref, null); }

  		if (unmountOnly === false || node['__preactattr_'] == null) {
  			removeNode(node);
  		}

  		removeChildren(node);
  	}
  }

  function removeChildren(node) {
  	node = node.lastChild;
  	while (node) {
  		var next = node.previousSibling;
  		recollectNodeTree(node, true);
  		node = next;
  	}
  }

  function diffAttributes(dom, attrs, old) {
  	var name;

  	for (name in old) {
  		if (!(attrs && attrs[name] != null) && old[name] != null) {
  			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
  		}
  	}

  	for (name in attrs) {
  		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
  			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
  		}
  	}
  }

  var recyclerComponents = [];

  function createComponent(Ctor, props, context) {
  	var inst,
  	    i = recyclerComponents.length;

  	if (Ctor.prototype && Ctor.prototype.render) {
  		inst = new Ctor(props, context);
  		Component.call(inst, props, context);
  	} else {
  		inst = new Component(props, context);
  		inst.constructor = Ctor;
  		inst.render = doRender;
  	}

  	while (i--) {
  		if (recyclerComponents[i].constructor === Ctor) {
  			inst.nextBase = recyclerComponents[i].nextBase;
  			recyclerComponents.splice(i, 1);
  			return inst;
  		}
  	}

  	return inst;
  }

  function doRender(props, state, context) {
  	return this.constructor(props, context);
  }

  function setComponentProps(component, props, renderMode, context, mountAll) {
  	if (component._disable) { return; }
  	component._disable = true;

  	component.__ref = props.ref;
  	component.__key = props.key;
  	delete props.ref;
  	delete props.key;

  	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
  		if (!component.base || mountAll) {
  			if (component.componentWillMount) { component.componentWillMount(); }
  		} else if (component.componentWillReceiveProps) {
  			component.componentWillReceiveProps(props, context);
  		}
  	}

  	if (context && context !== component.context) {
  		if (!component.prevContext) { component.prevContext = component.context; }
  		component.context = context;
  	}

  	if (!component.prevProps) { component.prevProps = component.props; }
  	component.props = props;

  	component._disable = false;

  	if (renderMode !== 0) {
  		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
  			renderComponent(component, 1, mountAll);
  		} else {
  			enqueueRender(component);
  		}
  	}

  	applyRef(component.__ref, component);
  }

  function renderComponent(component, renderMode, mountAll, isChild) {
  	if (component._disable) { return; }

  	var props = component.props,
  	    state = component.state,
  	    context = component.context,
  	    previousProps = component.prevProps || props,
  	    previousState = component.prevState || state,
  	    previousContext = component.prevContext || context,
  	    isUpdate = component.base,
  	    nextBase = component.nextBase,
  	    initialBase = isUpdate || nextBase,
  	    initialChildComponent = component._component,
  	    skip = false,
  	    snapshot = previousContext,
  	    rendered,
  	    inst,
  	    cbase;

  	if (component.constructor.getDerivedStateFromProps) {
  		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
  		component.state = state;
  	}

  	if (isUpdate) {
  		component.props = previousProps;
  		component.state = previousState;
  		component.context = previousContext;
  		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
  			skip = true;
  		} else if (component.componentWillUpdate) {
  			component.componentWillUpdate(props, state, context);
  		}
  		component.props = props;
  		component.state = state;
  		component.context = context;
  	}

  	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
  	component._dirty = false;

  	if (!skip) {
  		rendered = component.render(props, state, context);

  		if (component.getChildContext) {
  			context = extend(extend({}, context), component.getChildContext());
  		}

  		if (isUpdate && component.getSnapshotBeforeUpdate) {
  			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
  		}

  		var childComponent = rendered && rendered.nodeName,
  		    toUnmount,
  		    base;

  		if (typeof childComponent === 'function') {

  			var childProps = getNodeProps(rendered);
  			inst = initialChildComponent;

  			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
  				setComponentProps(inst, childProps, 1, context, false);
  			} else {
  				toUnmount = inst;

  				component._component = inst = createComponent(childComponent, childProps, context);
  				inst.nextBase = inst.nextBase || nextBase;
  				inst._parentComponent = component;
  				setComponentProps(inst, childProps, 0, context, false);
  				renderComponent(inst, 1, mountAll, true);
  			}

  			base = inst.base;
  		} else {
  			cbase = initialBase;

  			toUnmount = initialChildComponent;
  			if (toUnmount) {
  				cbase = component._component = null;
  			}

  			if (initialBase || renderMode === 1) {
  				if (cbase) { cbase._component = null; }
  				base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
  			}
  		}

  		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
  			var baseParent = initialBase.parentNode;
  			if (baseParent && base !== baseParent) {
  				baseParent.replaceChild(base, initialBase);

  				if (!toUnmount) {
  					initialBase._component = null;
  					recollectNodeTree(initialBase, false);
  				}
  			}
  		}

  		if (toUnmount) {
  			unmountComponent(toUnmount);
  		}

  		component.base = base;
  		if (base && !isChild) {
  			var componentRef = component,
  			    t = component;
  			while (t = t._parentComponent) {
  				(componentRef = t).base = base;
  			}
  			base._component = componentRef;
  			base._componentConstructor = componentRef.constructor;
  		}
  	}

  	if (!isUpdate || mountAll) {
  		mounts.push(component);
  	} else if (!skip) {

  		if (component.componentDidUpdate) {
  			component.componentDidUpdate(previousProps, previousState, snapshot);
  		}
  	}

  	while (component._renderCallbacks.length) {
  		component._renderCallbacks.pop().call(component);
  	}if (!diffLevel && !isChild) { flushMounts(); }
  }

  function buildComponentFromVNode(dom, vnode, context, mountAll) {
  	var c = dom && dom._component,
  	    originalComponent = c,
  	    oldDom = dom,
  	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
  	    isOwner = isDirectOwner,
  	    props = getNodeProps(vnode);
  	while (c && !isOwner && (c = c._parentComponent)) {
  		isOwner = c.constructor === vnode.nodeName;
  	}

  	if (c && isOwner && (!mountAll || c._component)) {
  		setComponentProps(c, props, 3, context, mountAll);
  		dom = c.base;
  	} else {
  		if (originalComponent && !isDirectOwner) {
  			unmountComponent(originalComponent);
  			dom = oldDom = null;
  		}

  		c = createComponent(vnode.nodeName, props, context);
  		if (dom && !c.nextBase) {
  			c.nextBase = dom;

  			oldDom = null;
  		}
  		setComponentProps(c, props, 1, context, mountAll);
  		dom = c.base;

  		if (oldDom && dom !== oldDom) {
  			oldDom._component = null;
  			recollectNodeTree(oldDom, false);
  		}
  	}

  	return dom;
  }

  function unmountComponent(component) {

  	var base = component.base;

  	component._disable = true;

  	if (component.componentWillUnmount) { component.componentWillUnmount(); }

  	component.base = null;

  	var inner = component._component;
  	if (inner) {
  		unmountComponent(inner);
  	} else if (base) {
  		if (base['__preactattr_'] != null) { applyRef(base['__preactattr_'].ref, null); }

  		component.nextBase = base;

  		removeNode(base);
  		recyclerComponents.push(component);

  		removeChildren(base);
  	}

  	applyRef(component.__ref, null);
  }

  function Component(props, context) {
  	this._dirty = true;

  	this.context = context;

  	this.props = props;

  	this.state = this.state || {};

  	this._renderCallbacks = [];
  }

  extend(Component.prototype, {
  	setState: function setState(state, callback) {
  		if (!this.prevState) { this.prevState = this.state; }
  		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
  		if (callback) { this._renderCallbacks.push(callback); }
  		enqueueRender(this);
  	},
  	forceUpdate: function forceUpdate(callback) {
  		if (callback) { this._renderCallbacks.push(callback); }
  		renderComponent(this, 2);
  	},
  	render: function render() {}
  });

  function render(vnode, parent, merge) {
    return diff(merge, vnode, {}, false, parent, false);
  }
  //# sourceMappingURL=preact.mjs.map

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

    return [ h, s, l, 255 ]
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

  var APP = {};

  var defaultData = function () {
    APP.width = 128;
    APP.height = 128;
    APP.tool = 'pencil';

    APP.frameActive = 0;
    APP.layerActive = 0;

    APP.layers = [
      {
        name: 'Layer 1',
        hidden: false
      }
    ],
    APP.frames = [
      {
        base64: '',
        imageData: new ImageData(128, 128),
        layers: [new ImageData(128, 128)]
      }
    ];
    
    APP.color = {
      rgb: [100, 188, 156, 255],
      hsl: [168, 76, 42, 255]
    };
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

  var setTool = function (tool) {
    APP.tool = tool;
    
    viewUpdate();
  };

  var colorSetHSL = function (hsl) {
    APP.color.hsl = hsl;
    APP.color.rgb = HSLtoRGB(hsl);

    viewUpdate();
  };

  var colorSetRGB = function (rgb) {
    APP.color.rgb = rgb;
    APP.color.hsl = RGBtoHSL(rgb);

    viewUpdate();
  };

  var paletteAdd = function () {
    APP.palette.push(APP.color.rgb);
    
    viewUpdate();
  };

  var paletteDelete = function (i) {
    var index = APP.palette.indexOf(APP.color.rgb);

    if (index !== -1) {
      APP.palette.splice(index, 1);
      viewUpdate();
    }
    
  };

  var UI = {
    file: {
      open: false
    },
    color: {
      open: false
    },
    frames: []
  };

  // Render canvases separately to conform to one way data flow
  // down to view even though no direct access to ctx within html
  var canvasTemp, canvasFinal, canvasView;

  var initCanvases = function () {
    canvasTemp = document.createElement('canvas');
    canvasFinal = document.createElement('canvas');
    canvasView = document.querySelector('#canvas-view');
  };

  var updateCanvases = function () {
    canvasTemp.width = APP.width;
    canvasTemp.height = APP.height;
    canvasFinal.width = APP.width;
    canvasFinal.height = APP.height;
    
    var ctxTemp = canvasTemp.getContext('2d');
    var ctxFinal = canvasFinal.getContext('2d');
    var ctxView = canvasView.getContext('2d');

    APP.frames[APP.frameActive].layers.forEach(function (layer) {
      ctxTemp.putImageData(layer, 0, 0);
      ctxFinal.drawImage(canvasTemp, 0, 0);
    });
    
    APP.frames[APP.frameActive].imageData = ctxFinal.getImageData(0, 0, APP.width, APP.height);
    APP.frames[APP.frameActive].base64 = canvasFinal.toDataURL();
    ctxView.drawImage(canvasFinal, 0, 0);
  };

  var viewUpdate = function () {
    render(h( View, null ), document.body, document.body.lastChild);
    
    updateCanvases();
    
    console.log('View updated.');
  };

  var View = function () {
    return h( 'div', { class: 'h-full' },
      h( 'div', { class: 'h-40 bg-light bord-dark-b fl' },
        h( 'div', { class: "fl w-full" },
          h( 'div', { class: "fl-1 fl" },
            h( 'div', { class: "fl bord-dark-r rel w-40", onMouseLeave: function () {
                UI.file.open = false;
                viewUpdate();
              } },
              h( 'button', {
                onClick: function () {
                  UI.file.open = !UI.file.open;
                  viewUpdate();
                }, class: "fl fl-center m-0 p-0 w-40" },
                h( 'img', { src: "img/bars.svg" })
              ),
              h( 'div', {
                class: "bg-light fl-column bord-dark abs z-5", style: ("visibility: " + (UI.file.open ? 'visible' : 'hidden') + "; top: 10px; left: 10px;") },
                ['new', 'download'].map(function (id) { return h( 'button', { class: "m-0 p-h-15 h-40 fl fl-center-y" },
                      h( 'img', { src: ("img/" + id + ".svg") }),
                      h( 'small', { class: "bold p-h-10", style: 'text-transform: capitalize;' }, id)
                    ); }
                  )
              )
            ),
            h( 'div', { class: 'fl-1 fl fl-justify-center' },
              h( 'button', { class: "fl fl-center m-0 p-0 w-40 bord-dark-l bord-dark-r" },
                h( 'img', { src: "img/undo.svg" })
              ),
              h( 'button', { class: "fl fl-center m-0 p-0 w-40 bord-dark-r" },
                h( 'img', { src: "img/redo.svg" })
              )
            )
          ),
          h( 'div', { class: "fl", style: "max-width: 241px; min-width: 241px;" }
            
          )
        )
      ),
      h( 'div', { class: 'fl', style: 'height: calc(100% - 40px);' },
        h( 'div', { class: 'w-40 bg-light bord-dark-r' },
          ['pencil', 'eraser', 'line', 'circle', 'square', 'fill', 'eye-dropper', 'select'].map(function (tool) { return h( 'button', { onClick: function () { setTool(tool); }, class: "fl fl-center m-0 p-0 w-40 h-40 bord-dark-r", style: ("" + (APP.tool === tool ? 'background: rgba(52, 152, 219, 255);' : '')) },
                h( 'img', { src: ("img/" + tool + ".svg") })
              ); }
            )
        ),
        h( 'div', { class: 'w-full overflow fl-column', style: 'cursor: crosshair;' },
          h( 'div', { class: 'fl-1' },
            h( 'canvas', {
              id: 'canvas-view', width: APP.width, height: APP.height, style: 'width: 400px; height: 400px; background: white; margin: 10px;' })
          ),
          h( 'div', { class: 'bg-light bord-dark-t' },
            h( 'div', { class: 'fl bord-dark-b' },
              h( 'div', { class: 'fl-1 fl' },
                h( 'div', { class: 'bg-mid h-30 bord-dark-r fl fl-center-y p-h-15' },
                  h( 'small', null, h( 'b', null, "Timeline" ) )
                ),
                h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r' },
                  h( 'img', { src: "img/plus.svg" })
                ),
                h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r' },
                  h( 'img', { src: "img/clone.svg" })
                ),
                h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r' },
                  h( 'img', { src: "img/up.svg" })
                ),
                h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r' },
                  h( 'img', { src: "img/down.svg" })
                ),
                h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r' },
                  h( 'img', { src: "img/trash.svg" })
                )
              ),
              h( 'div', { class: 'fl-1 fl fl-justify-center' },
                h( 'button', { class: "fl fl-center m-0 p-0 w-30 h-30 bord-dark-l" },
                  h( 'img', { src: "img/lastframe.svg" })
                ),
                h( 'button', { class: "fl fl-center m-0 p-0 w-30 h-30 bord-dark-r bord-dark-l" },
                  h( 'img', { src: "img/play.svg" })
                ),
                h( 'button', { class: "fl fl-center m-0 p-0 w-30 h-30 bord-dark-r" },
                  h( 'img', { src: "img/nextframe.svg" })
                )
              ),
              h( 'div', { class: 'fl-1' }
              )  
            ),
            h( 'div', { class: 'fl p-10' },
              APP.frames.map(function (frame) {
                  return h( 'button', { class: 'p-5 no-hover', style: 'background: rgba(52, 152, 219, 255);' }
                    /* <div class='fl p-5' style='padding-bottom: 5px; background: rgba(52, 152, 219, 255);'>
                      <small><b>1</b></small>
                    </div> */,
                    h( 'img', { style: 'width: 60px; height: 60px;', src: frame.base64 })
                  )
                })

              
              
            )
          )
        ),
        h( 'div', { class: 'bg-light bord-dark-l', style: "max-width: 249px; min-width: 249px;" },
          h( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
            h( 'small', null, h( 'b', null, "Color" ) )
          ),
          h( 'div', { class: 'h-30 bord-dark-b fl fl-justify-between' },
            h( 'div', { class: 'fl rel' },
              h( 'div', {
                onInput: function (e) {
                  var hsl = [APP.color.hsl[0], APP.color.hsl[1], APP.color.hsl[2], APP.color.hsl[3]];
                  hsl[parseInt(e.target.dataset.index)] = parseInt(e.target.value);
                  
                  colorSetHSL(hsl);
                }, class: 'abs bg-light bord-dark fl-column', style: ("visibility: " + (UI.color.open ? 'visible' : 'hidden') + "; width: 225px; left: -225px; top: -1px; padding: 15px;") },
                h( 'div', { class: 'fl-column', style: 'padding-bottom: 5px;' },
                  h( 'div', { class: 'fl fl-justify-between', style: 'padding-bottom: 5px;' },
                    h( 'small', null, h( 'b', null, "Hue" ) ),
                    h( 'small', null, APP.color.hsl[0] )
                  ),
                  h( 'input', {
                    value: APP.color.hsl[0], 'data-index': '0', type: 'range', class: 'b-r-2 w-full m-0', style: 'background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);', min: '0', max: '359' })
                ),
                h( 'div', { class: 'fl-column', style: 'padding-bottom: 5px;' },
                  h( 'div', { class: 'fl fl-justify-between', style: 'padding-bottom: 5px;' },
                    h( 'small', null, h( 'b', null, "Saturation" ) ),
                    h( 'small', null, APP.color.hsl[1] )
                  ),
                  h( 'input', {
                    value: APP.color.hsl[1], 'data-index': '1', type: 'range', class: 'b-r-2 w-full m-0', style: ("background: linear-gradient(to right, hsl(" + (APP.color.hsl[0]) + ", 0%, 50%) 0%,hsl(" + (APP.color.hsl[0]) + ", 100%, 50%) 100%);") })
                ),
                h( 'div', { class: 'fl-column', style: 'padding-bottom: 5px;' },
                  h( 'div', { class: 'fl fl-justify-between', style: 'padding-bottom: 5px;' },
                    h( 'small', null, h( 'b', null, "Lightness" ) ),
                    h( 'small', null, APP.color.hsl[2] )
                  ),
                  h( 'input', {
                    value: APP.color.hsl[2], 'data-index': '2', type: 'range', class: 'b-r-2 w-full m-0', style: ("background: linear-gradient(to right, hsl(" + (APP.color.hsl[0]) + ", 100%, 0%) 0%, hsl(" + (APP.color.hsl[0]) + ", 100%, 50%) 50%, hsl(" + (APP.color.hsl[0]) + ", 100%, 100%) 100%)") })
                )
              ),
              h( 'button', {
                onClick: function () {
                  UI.color.open = !UI.color.open;
                  viewUpdate();
                }, class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b' },
                h( 'div', {
                  class: 'b-r-2 w-15 h-15 no-ptr', style: ("background: rgba(" + (APP.color.rgb[0]) + ", " + (APP.color.rgb[1]) + ", " + (APP.color.rgb[2]) + ", 255);") })
              ),
              APP.palette.indexOf(APP.color.rgb) === -1 &&
                h( 'button', {
                  onClick: function () { paletteAdd(); }, class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b' },
                  h( 'img', { src: "img/plus.svg" })
                )
            ),
            h( 'div', { class: 'fl bord-dark-l' },
              h( 'button', {
                onClick: function () { paletteDelete(); }, class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b' },
                h( 'img', { src: "img/trash.svg" })
              )
            )
          ),
          h( 'div', { class: 'fl fl-wrap overflow', style: 'min-height: 135px; max-height: 135px; align-content: baseline;' },
            APP.palette.map(function (color) { return h( 'button', {
                  onClick: function () {
                    colorSetRGB(color);
                  }, class: 'w-30 h-30 m-0', style: ("\n                  background: rgba(" + (color[0]) + ", " + (color[1]) + ", " + (color[2]) + ", " + (color[3]) + ");\n                  border: " + (color === APP.color.rgb ? '2px solid rgba(61,61,61, 1)' : '2px solid rgba(61,61,61, 0)') + ";\n                  box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, " + (color === APP.color.rgb ? '255' : '0') + ");\n                ") }); }
              )
          ),
          h( 'div', { class: 'h-30 bg-mid bord-dark-b bord-dark-t fl fl-center-y p-h-10' },
            h( 'small', null, h( 'b', null, "Layers" ) )
          ),
          h( 'div', { class: 'h-30 bord-dark-b fl fl-justify-between' },
            h( 'div', { class: 'fl' },
              h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b' },
                h( 'img', { src: "img/plus.svg" })
              ),
              h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b' },
                h( 'img', { src: "img/up.svg" })
              ),
              h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b' },
                h( 'img', { src: "img/down.svg" })
              )
            ),
            h( 'div', { class: 'fl bord-dark-l' },
              h( 'button', { class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b' },
                h( 'img', { src: "img/trash.svg" })
              )
            )
          ),
          h( 'div', { style: 'min-height: 120px; max-height: 120px;' },
            APP.layers.map(function (layer) { return h( 'div', { class: 'h-30 fl' },
                  h( 'button', { class: 'w-30 fl fl-center', style: 'border-right: 1px solid rgb(61, 61, 61);' },
                    h( 'img', { src: "img/eye-active.svg" })
                  ),
                  h( 'button', { class: 'w-full txt-left p-h-10' },
                    h( 'small', { style: 'font-size: 11px;' }, h( 'b', null, layer.name ))
                  )
                ); }
              )
          )
        )
      )
      
    )
  };

  var viewInit = function () {
    render(h( View, null ), document.body);
    
    initCanvases();
    updateCanvases();

    console.log('View started.');
  };

  var onProgramEnd = function () {
    console.log('Program ended.');
  };

  var onProgramStart = function () {
    console.log('Program started.');

    // if (false) {
    //   // loadFromDisk()
    //   // need to load from disk here if this exists 
    // } else {
    //   newProject(50, 50)
    // }
    
    viewSetupListeners();
    defaultData();
    viewInit();
  };

  window.addEventListener('unload', onProgramEnd);
  window.addEventListener('load', onProgramStart);

  //window.addEventListener('contextmenu', (e) => { e.preventDefault() }, { passive: false })

}());
