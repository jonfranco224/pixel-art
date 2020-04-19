(function () {
	'use strict';

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
	};

	var initViewDefault = function (preventOnMount) {
	  VIEW.file = { open: false };
	  VIEW.color = { open: false };
	  VIEW.newCanvas = { open: false, w: 32, h: 32 };
	  VIEW.downloadCanvas = { open: false, size: 2, type: 'frame' };

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

	  VIEW.brushSize = 0;

	  VIEW.timerID = undefined;
	  VIEW.isPlaying = false;
	  VIEW.onionSkinning = false;

	  VIEW.undo = [];
	  VIEW.undoPos = -1;
	  VIEW.currUndoRef = {};

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

	// Colors
	var colorSetHSL = function (hsl) {
	  APP.color.hsl = hsl;
	  APP.color.rgb = HSLtoRGB(hsl);

	  VIEW.render();
	};

	var colorSetRGB = function (rgb) {
	  APP.color.rgb = rgb;
	  APP.color.hsl = RGBtoHSL(rgb);

	  VIEW.render();
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
	    h( 'div', null,
	      h( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
	        h( 'small', null, h( 'b', null, "Color" ) )
	      ),
	      h( 'div', { class: 'fl fl-justify-between' },
	        h( 'div', { class: 'fl-1 fl fl-center-y p-h-10 bord-dark-b h-30 bord-dark-b' },
	          h( 'div', {
	            class: 'no-ptr h-30', style: ("min-height: 18px; width: 18px; border-radius: 100%; background: rgba(" + (APP.color.rgb[0]) + ", " + (APP.color.rgb[1]) + ", " + (APP.color.rgb[2]) + ", 255);") })
	        ),
	        h( 'div', { class: 'fl bord-dark-b h-30' },
	          APP.palette.filter(function (c) { return APP.color.rgb[0] === c[0] &&
	            APP.color.rgb[1] === c[1] &&
	            APP.color.rgb[2] === c[2] &&
	            APP.color.rgb[3] === c[3]; })
	            .length === 0 &&
	              h( 'button', {
	                onClick: function () { paletteAdd(); }, class: 'w-30 fl fl-center rel bord-dark-l' },
	                h( 'img', { src: "img/insert.svg" })
	              ),
	          APP.palette.filter(function (c) { return APP.color.rgb[0] === c[0] &&
	            APP.color.rgb[1] === c[1] &&
	            APP.color.rgb[2] === c[2] &&
	            APP.color.rgb[3] === c[3]; })
	            .length !== 0 &&
	            h( 'button', {
	              onClick: function () { paletteDelete(); }, class: 'w-30 fl fl-center bord-dark-l' },
	              h( 'img', { src: "img/delete.svg" })
	            )
	        )
	          
	      ),
	      h( 'div', {
	        onInput: function (e) {
	          var hsl = [APP.color.hsl[0], APP.color.hsl[1], APP.color.hsl[2], APP.color.hsl[3]];
	          hsl[parseInt(e.target.dataset.index)] = parseInt(e.target.value);
	          
	          colorSetHSL(hsl);
	        }, class: 'bg-light fl-column p-10 b-r-2 overflow-none' },
	        h( 'div', { class: 'b-r-2 overflow-none' },
	          h( 'div', { class: 'fl-column' },
	            h( 'form', { class: 'fl-column', autocomplete: 'off' },
	              h( 'input', {
	                id: 'hsl', 'data-index': '0', type: 'range', class: 'w-full m-0', style: 'height: 25px; background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);', min: '0', max: '359', value: APP.color.hsl[0] })
	            )
	          ),
	          h( 'div', { class: 'fl-column' },
	            h( 'form', { class: 'fl-column', autocomplete: 'off' },
	              h( 'input', {
	                value: APP.color.hsl[1], 'data-index': '1', type: 'range', class: 'w-full m-0', style: ("height: 25px; background: linear-gradient(to right, hsl(" + (APP.color.hsl[0]) + ", 0%, 50%) 0%,hsl(" + (APP.color.hsl[0]) + ", 100%, 50%) 100%);") })
	            )
	          ),
	          h( 'div', { class: 'fl-column' },
	            h( 'form', { class: 'fl-column', autocomplete: 'off' },
	              h( 'input', {
	                value: APP.color.hsl[2], 'data-index': '2', type: 'range', class: 'w-full m-0', style: ("height: 25px; background: linear-gradient(to right, hsl(" + (APP.color.hsl[0]) + ", 100%, 0%) 0%, hsl(" + (APP.color.hsl[0]) + ", 100%, 50%) 50%, hsl(" + (APP.color.hsl[0]) + ", 100%, 100%) 100%)") })
	            )
	        )
	        )
	      ),
	      h( 'div', { class: 'p-h-10 bord-dark-b', style: 'padding-bottom: 10px;' },
	        h( 'div', { class: 'fl fl-wrap b-r-2 overflow-none', style: 'align-content: baseline;' },
	          APP.palette.map(function (c) { return h( 'button', {
	                onClick: function () {
	                  colorSetRGB(c);
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

	var setTool = function (tool) {
	  APP.tool = tool;
	  VIEW.render();
	};

	var getPoint = function (imgDataArr, x, y, w, h$$1) {
	  if (!imgDataArr) { throw Error(("setPoint: " + imgDataArr + " undefined")) }
	  if (!imgDataArr.length) { throw Error(("setPoint: " + imgDataArr + " not a valid array")) }

	  if (x >= 0 && x < w && y >= 0 && y < h$$1) { // check bounds
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

	var setPoint = function (imgDataArr, x, y, w, h$$1, color) {
	  if (!imgDataArr) { throw Error(("setPoint: " + imgDataArr + " undefined")) }
	  if (!imgDataArr.length) { throw Error(("setPoint: " + imgDataArr + " not a valid array")) }
	  
	  if (x >= 0 && x < w && y >= 0 && y < h$$1) { // check bounds
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

	var fill = function (canvasImgData, startX, startY, w, h$$1, color) { // http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
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
	      y++ < h$$1 &&
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
	  circlePlot(xCenter, yCenter, x, y);

	  while (x <= y) {
	    x++;
	    if (p < 0) {
	      p += 2 * x + 1; // Mid point is inside therefore y remains same
	    } else { // Mid point is outside the circle so y decreases
	      y--;
	      p += 2 * (x - y) + 1;
	    }

	    circlePlot(xCenter, yCenter, x, y);
	  }
	};

	function squareFilled (startX, startY, endX, endY, w, h$$1, color, func) {
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
	}

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

	  var setBrushPoints = function (canvas, x, y, w, h$$1, color) {
	    squareFilled(x - VIEW.brushSize, y - VIEW.brushSize, x + VIEW.brushSize, y + VIEW.brushSize, w, h$$1, color, function (x, y) {
	      setPoint(canvas, x, y, w, h$$1, color);
	    });
	  };

	  if (gestureEvent === 'hover' && APP.tool !== 'eye-dropper' && APP.tool !== 'fill' && APP.tool !== 'move') {
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
	      colorSetRGB(color);
	    }
	  }

	  // Fill
	  if (gestureEvent === 'end' && APP.tool === 'fill') {
	    fill(target, currX, currY, APP.width, APP.height, APP.color.rgb);
	  }

	  // Points
	  if (APP.tool === 'pencil' || APP.tool === 'eraser') {
	    line(prevX, prevY, currX, currY, function (x, y) {
	      setBrushPoints(target, x, y, APP.width, APP.height, APP.tool === 'pencil' ? APP.color.rgb : [0, 0, 0, 0]);
	    });
	  }

	  // Geometry
	  if (APP.tool === 'line' || APP.tool === 'circle' || APP.tool === 'square') {
	    var funcs = { 'line': line, 'circle': circle, 'square': square };
	    
	    funcs[APP.tool](startX, startY, currX, currY, function (x, y) {
	      setBrushPoints(gestureEvent === 'start' || gestureEvent === 'resume' ? preview : target, x, y, APP.width, APP.height, APP.color.rgb);
	      // setPoint(gestureEvent === 'start' || gestureEvent === 'resume' ? preview : target, x, y, APP.width, APP.height, APP.color.rgb)
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
	  return h( 'div', { id: 'canvas-inner-scroll', 'data-request': 'paintCanvas', 'data-hover': 'paintCanvas', class: 'fl fl-center fl-1', style: 'width: 1920px; height: 1920px;' },
	    h( 'canvas', {                      
	      id: 'canvas-view', width: APP.width, height: APP.height, style: 'width: 1920px; height: 1920px; transform: scale(.25); pointer-events: none;' })
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

	var setTargetCanvas = function (frame, layer) {
	  if (frame === undefined) { console.error('setTargetCanvas - no frame given'); }
	  if (layer === undefined) { console.error('setTargetCanvas - no layer given'); }

	  APP.frameActive = frame;
	  APP.layerActive = layer;

	  VIEW.render();
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

	  var newData$$1 = type === 'layer' ? {
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
	    seq('insert', type, requestType === 'new' ? newData$$1 : cloneData);
	  }

	  if ((type === 'layer' || type === 'frame') && request === 'delete') {
	    if (APP[(type + "Count")] - 1 === 0) {
	      seq('delete', type);
	      if (type === 'layer') { newData$$1.name = 'Layer 1'; }
	      seq('insert', type, newData$$1);
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
	    h( 'div', { class: 'bg-light bord-dark-t fl-column', style: 'height: 250px;' },
	        h( 'div', { class: 'fl w-full bord-dark-b h-30' },
	          h( 'div', { class: 'fl fl-justify-between bord-dark-r', style: 'width: 210px;' }
	            /* <div style='width: 90px;' class='p-h-10 fl fl-center-y bord-dark-r'>
	              <small><b>Layers</b></small>
	            </div> */,
	            h( 'div', { class: 'fl' },
	              h( 'button', {
	                onClick: function () { if (APP.layerCount < 30) { timelineManager({ type:'layer', request: 'insert', requestType: 'new' }); } }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/insert.svg" })
	              ),
	              h( 'button', {
	                onClick: function () { timelineManager({ type:'layer', request: 'insert', requestType: 'clone' }); }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/clone.svg" })
	              ),
	              h( 'button', {
	                onClick: function () { swap('layer', 'down'); }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/up.svg" })
	              ),
	              h( 'button', {
	                onClick: function () { swap('layer', 'up'); }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/down.svg" })
	              ),
	              h( 'button', {
	                onClick: function () { timelineManager({ type:'layer', request: 'delete' }); }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/delete.svg" })
	              )
	            )
	          ),
	          h( 'div', { class: 'fl fl-1' },
	            h( 'div', { class: 'fl' },
	              h( 'button', {
	                onClick: function () { VIEW.onionSkinning = !VIEW.onionSkinning; VIEW.render(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r", style: VIEW.onionSkinning ? 'background: rgba(52, 152, 219, 255);' : '' },
	                h( 'img', { src: "img/onion.svg" })
	              )
	            ),
	            h( 'div', { class: 'fl-1 fl fl-justify-center' },
	              h( 'div', { class: 'fl' },
	                h( 'button', {
	                  onClick: function () { lastFrame(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r bord-dark-l" },
	                  h( 'img', { src: "img/lastframe.svg" })
	                ),
	                h( 'button', {
	                  onClick: function () { togglePlay(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r" },
	                  h( 'img', { src: ("img/" + (VIEW.isPlaying ? 'stop.svg' : 'play.svg')) })
	                ),
	                h( 'button', {
	                  onClick: function () { nextFrame(); }, class: "fl fl-center m-0 p-0 w-30 bord-dark-r" },
	                  h( 'img', { src: "img/nextframe.svg" })
	                )
	              )
	            ),
	            h( 'div', { class: 'fl' },
	              h( 'button', {
	                onClick: function () { if (!VIEW.isPlaying && APP.frameCount < 50) { timelineManager({ type: 'frame', request: 'insert', requestType: 'new' }); } }, class: 'w-30 fl fl-center bord-dark-r bord-dark-l' },
	                h( 'img', { src: "img/insert.svg" })
	              ),
	              h( 'button', {
	                onClick: function () { timelineManager({ type:'frame', request: 'insert', requestType: 'clone' }); }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/clone.svg" })
	              ),
	              h( 'button', {
	                onClick: function () { if (!VIEW.isPlaying) { swap('frame', 'up'); } }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/up.svg", style: 'transform: rotate(-90deg);' })
	              ),
	              h( 'button', {
	                onClick: function () { if (!VIEW.isPlaying) { swap('frame', 'down'); } }, class: 'w-30 fl fl-center bord-dark-r' },
	                h( 'img', { src: "img/down.svg", style: 'transform: rotate(-90deg);' })
	              ),
	              h( 'button', {
	                onClick: function () { if (!VIEW.isPlaying) { timelineManager({ type:'frame', request: 'delete' }); } }, class: 'w-30 fl fl-center' },
	                h( 'img', { src: "img/delete.svg" })
	              )
	            )
	          )
	        ),
	        h( 'div', { class: 'fl bg-mid', style: 'height: calc(100% - 30px);' },
	          h( 'div', { id: 'layers', class: 'overflow hide-scroll', style: 'padding-bottom: 30px;' },
	            h( 'div', { class: 'bord-dark-r fl-col-reverse', style: 'width: 210px;' },
	              APP.layers.map(function (layer, li) {
	                  return h( 'div', {
	                    class: 'fl bord-dark-b h-30', style: ("background: " + (APP.layerActive === li ? 'rgb(100, 100, 100)' :'') + ";") },
	                    h( 'button', {
	                      style: ("" + (layer.hidden ? 'background: rgba(52, 152, 219, 255);' : '')), onClick: function () { layersEditHidden(li); }, class: 'w-30 h-30 fl fl-center bord-dark-b' },
	                      h( 'img', { src: ("img/" + (layer.hidden ? 'eye-active.svg' : 'eye.svg')) })
	                    ),
	                    h( 'button', {
	                      onClick: function () { setTargetCanvas(APP.frameActive, li); }, class: 'fl-1 txt-left' },
	                      h( 'small', { style: 'font-size: 11px;' }, h( 'b', null, layer.name ))
	                    )
	                  )
	                })
	            )
	          ),
	          h( 'div', { id: 'frames', class: 'fl-1 overflow hide-scroll', style: 'padding-bottom: 30px;' },
	            h( 'div', { class: 'fl-col-reverse' },
	              APP.layers.map(function (layer, li) {
	                  return h( 'div', {
	                    class: 'fl' },
	                    layer.frames.map(function (canvas, fi) {
	                        return h( 'button', {
	                          onClick: function () { setTargetCanvas(fi, li); }, class: 'w-30 h-30 fl fl-center bord-dark-r bord-dark-b bg-light rel', style: ("\n                            background: " + (APP.frameActive === fi && APP.layerActive === li
	                                ? 'rgba(52, 152, 219, 255)'
	                                : (APP.frameActive === fi || APP.layerActive === li)
	                                  ? 'rgba(100, 100, 100, 255)'
	                                  : 'rgba(0, 0, 0, 0)') + ";") },
	                          h( 'div', { class: 'abs bottom right p-5' }, h( 'small', { style: 'font-size: 8px;' }, h( 'b', null, fi + 1 )))
	                          /* <div class='bg-white' style='border-radius: 100%; width: 8px; height: 8px;' /> */
	                        )
	                      })
	                  )
	                })
	            )
	          )
	        )
	      )
	  )
	};

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
	  //console.time('startwrite')
	  localforage.setItem('pixel-art-app', APP).then(function(value) {
	    // This will output `1`.
	    //console.timeEnd('startwrite')
	  }).catch(function(err) {
	    // This code runs if there were any errors
	    console.log(err);
	  });
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
	  }

	  if (VIEW.downloadCanvas.type === 'spritesheet') {
	    var totalWidth = APP.width * VIEW.downloadCanvas.size * APP.frameCount;
	    c.width = totalWidth;
	    c.height = height;

	    ctx.webkitImageSmoothingEnabled = false;
	    ctx.mozImageSmoothingEnabled = false;
	    ctx.imageSmoothingEnabled = false;

	    console.log(APP.frameCount);
	    var loop = function ( frameI ) {
	      APP.layers.forEach(function (layer) {
	        VIEW.canvasTemp.ctx.putImageData(layer.frames[frameI], 0, 0);
	        ctx.drawImage(VIEW.canvasTemp.dom, frameI * width, 0, width, height);
	      });
	    };

	    for (var frameI = 0; frameI < APP.frameCount; frameI++) loop( frameI );
	  }

	  var image = c.toDataURL('image/png').replace('image/png', 'image/octet-stream');
	  e.target.setAttribute('href', image);
	};

	var View = /*@__PURE__*/(function (Component$$1) {
	  function View () {
	    Component$$1.apply(this, arguments);
	  }

	  if ( Component$$1 ) View.__proto__ = Component$$1;
	  View.prototype = Object.create( Component$$1 && Component$$1.prototype );
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

	    setTimeout(function () {
	      saveData();
	    }, 50);
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

	  View.prototype.render = function render$$1 () {
	    var this$1 = this;

	    return (
	      h( 'div', {
	        class: 'h-full relative', onMouseDown: function (e) { if (e.which === 1) { this$1.onGestureDown(e); } }, onMouseMove: function (e) { this$1.dragOrHover(e); }, onMouseUp: function (e) { this$1.onGestureEnd(e); } },
	        h( 'div', { class: 'h-40 bg-light bord-dark-b fl' },
	          h( 'div', { class: "fl w-full" },
	            h( 'div', { class: "fl-1 fl" },
	              h( 'div', { class: "fl bord-dark-r rel w-40", onMouseLeave: function () {
	                  VIEW.file.open = false;
	                  VIEW.render();
	                } },
	                h( 'button', {
	                  onClick: function () {
	                    VIEW.file.open = !VIEW.file.open;
	                    VIEW.render();
	                  }, class: "fl fl-center m-0 p-0 w-40" },
	                  h( 'img', { src: "img/bars.svg" })
	                ),
	                h( 'div', {
	                  class: "bg-light fl-column bord-dark abs z-5", style: ("visibility: " + (VIEW.file.open ? 'visible' : 'hidden') + "; top: 10px; left: 10px;") },
	                    h( 'button', {
	                      onClick: function () {
	                        VIEW.newCanvas.open = true;
	                        VIEW.file.open = false;
	                        VIEW.render();
	                      }, class: "m-0 p-h-15 h-40 fl fl-center-y" },
	                      h( 'img', { src: "img/new.svg" }),
	                      h( 'small', { class: "bold p-h-10", style: 'text-transform: capitalize;' }, "New")
	                    ),
	                    h( 'button', {
	                      onClick: function () {
	                        VIEW.downloadCanvas.open = true;
	                        VIEW.file.open = false;
	                        VIEW.render();
	                      }, class: "m-0 p-h-15 h-40 fl fl-center-y" },
	                      h( 'img', { src: "img/download.svg" }),
	                      h( 'small', { class: "bold p-h-10", style: 'text-transform: capitalize;' }, "download")
	                    )
	                )
	              ),
	              h( 'div', { class: 'fl-1 fl fl-justify-center' },
	                h( 'button', {
	                  onClick: function () { undo(); }, class: "fl fl-center m-0 p-0 w-40 bord-dark-l bord-dark-r" },
	                  h( 'img', { src: "img/undo.svg" })
	                ),
	                h( 'button', {
	                  onClick: function () { redo(); }, class: "fl fl-center m-0 p-0 w-40 bord-dark-r" },
	                  h( 'img', { src: "img/redo.svg" })
	                )
	              )
	            ),
	            h( 'div', { class: "fl", style: "max-width: 241px; min-width: 241px;" }
	              
	            )
	          )
	        ),
	        h( 'div', { class: 'fl', style: 'height: calc(100% - 40px); ' },
	          h( 'div', { class: 'w-40 bg-light bord-dark-r' },
	            ['pencil', 'eraser', 'line', 'circle', 'square', 'fill', 'eye-dropper', 'move'].map(function (tool) { return h( 'button', {
	                  onClick: function () { setTool(tool); }, class: "fl fl-center m-0 p-0 w-40 h-40 bord-dark-r", style: ("" + (APP.tool === tool ? 'background: rgba(52, 152, 219, 255);' : '')) },
	                  h( 'img', { src: ("img/" + tool + ".svg") })
	                ); }
	              )
	          ),
	          h( 'div', { class: 'fl-column', style: 'width: calc(100% - 281px);' },
	            h( 'div', { id: 'canvas-outer-scroll', class: 'overflow fl-1', style: 'cursor: crosshair;' },
	              h( Canvas, null )
	            ),
	            h( Timeline, null )
	            /* <div class='fl-1 h-full fl'>
	              <div class='fl-1 fl-column h-full' style='width: calc(100% - 281px);'>
	                <Canvas />
	                <Timeline />
	              </div>
	            </div> */
	          ),
	          h( 'div', { class: 'bg-light bord-dark-l fl-column', style: "max-width: 241px; min-width: 241px;" },
	            h( 'div', { class: 'bord-dark-b fl-column overflow' },
	              h( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
	                h( 'small', null, h( 'b', null, "Tool" ) )
	              ),
	              h( 'div', { class: 'fl-1 overflow' },
	                h( 'div', { class: "fl fl-center p-10" },
	                  h( 'small', { class: "bold", style: "width: 150px;" }, "Brush Size"),
	                  h( 'select', {
	                    onInput: function (e) {
	                      VIEW.brushSize = parseInt(e.target.value);
	                    }, value: VIEW.brushSize, class: "w-full" },
	                      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (size, i) {
	                          return h( 'option', { value: i }, size)
	                        })
	                  )
	                )
	              )
	            ),
	            h( Color, null ),
	            h( 'div', { class: 'fl-1 bord-dark-b fl-column overflow' },
	              h( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
	                h( 'small', null, h( 'b', null, "History" ) )
	              ),
	              h( 'div', { class: 'fl-1 overflow' },
	                VIEW.undo.map(function (entry, i) {
	                    return h( 'button', { class: ("p-h-10 h-30 w-full txt-left fl fl-center-y " + (VIEW.undoPos === i ? 'bg-xlight' : '')) },
	                      h( 'img', { width: '10', height: '10', style: 'margin-right: 10px;', src: ("img/" + (entry.icon)) }),
	                      h( 'small', { style: 'text-transform: capitalize; font-size: 11px;' }, h( 'b', null, entry.action ))
	                    )
	                  })
	              )
	            ),
	            h( 'div', { style: 'min-height: 249px; max-height: 249px;' },
	              h( 'div', { class: 'h-30 bg-mid bord-dark-b fl fl-center-y p-h-10' },
	                h( 'small', null, h( 'b', null, "Timeline" ) )
	              ),
	              h( 'div', { class: 'overflow fl-1' }
	                
	              )
	            )
	          )
	        ),
	        VIEW.newCanvas.open && h( 'div', { class: "abs top left w-full h-full fl fl-justify-center", style: "z-index: 10;" },
	          h( 'div', { class: "w-full overflow-hidden", style: "max-width: 300px; margin-top: 175px;" },
	            h( 'div', { class: "fl fl-center bg-mid bord-dark p-v-5", style: 'border-top-right-radius: 5px; border-top-left-radius: 5px;' }, h( 'small', null, h( 'b', null, "New Canvas" ) )),
	            h( 'div', { class: "p-10 bg-light bord-dark-l bord-dark-r bord-dark-b", style: 'border-bottom-right-radius: 5px; border-bottom-left-radius: 5px;' },
	              h( 'div', { class: "m-5 p-v-5" },
	                h( 'div', { class: "fl fl-center" },
	                  h( 'small', { class: "bold", style: "width: 150px;" }, "Dimensions"),
	                  h( 'select', {
	                    onInput: function (e) {
	                      var val = e.target.value.split('x');
	                      VIEW.newCanvas.w = parseInt(val[0]);
	                      VIEW.newCanvas.h = parseInt(val[1]);
	                    }, class: "w-full" },
	                    h( 'option', { value: "32x32" }, "32x32"),
	                    h( 'option', { value: "50x50" }, "50x50"),
	                    h( 'option', { value: "64x64" }, "64x64"),
	                    h( 'option', { value: "100x100" }, "100x100"),
	                    h( 'option', { value: "128x128" }, "128x128")
	                  )
	                )
	              ),
	              h( 'div', { class: "fl", style: "padding-top: 5px;" },
	                h( 'button', {
	                  onClick: function () {
	                    VIEW.newCanvas.open = false;
	                    VIEW.render();
	                  }, class: "b-r-2 bold p-5 w-full bg-red m-5" }, "Cancel"),
	                h( 'button', {
	                  onClick: function () {
	                    newData(VIEW.newCanvas.w, VIEW.newCanvas.h);
	                    VIEW.newCanvas.open = false;
	                    VIEW.render();
	                  }, class: "b-r-2 bold p-5 w-full bg-green m-5" }, "Confirm")
	              )
	            )
	          )
	        ),
	        VIEW.downloadCanvas.open && h( 'div', { class: "abs top left w-full h-full fl fl-center-x", style: "z-index: 10;" },
	          h( 'div', { class: "w-full", style: "max-width: 300px; overflow: hidden; margin-top: 175px;" },
	              h( 'div', { class: "fl fl-center bg-mid bord-dark p-v-5", style: 'border-top-right-radius: 5px; border-top-left-radius: 5px;' }, h( 'small', { class: "bold" }, "Download")),
	              h( 'div', { class: "p-10 bg-light bord-dark-l bord-dark-r bord-dark-b", style: 'border-bottom-right-radius: 5px; border-bottom-left-radius: 5px;' },
	                h( 'div', { class: "m-5 p-v-5" },
	                  h( 'div', { class: "fl fl-center" },
	                    h( 'small', { class: "bold", style: "width: 150px;" }, "Type"),
	                    h( 'select', {
	                      onInput: function (e) {
	                        VIEW.downloadCanvas.type = e.target.value;
	                      }, value: VIEW.downloadCanvas.type, id: "config-download-size", class: "w-full" },
	                        h( 'option', { value: "frame" }, "Frame"),
	                        h( 'option', { value: "spritesheet" }, "Spritesheet")
	                    )
	                  )
	                ),
	                h( 'div', { class: "m-5 p-v-5" },
	                    h( 'div', { class: "fl fl-center" },
	                      h( 'small', { class: "bold", style: "width: 150px;" }, "Size"),
	                      h( 'select', {
	                        onInput: function (e) {
	                          VIEW.downloadCanvas.size = parseInt(e.target.value);
	                        }, value: VIEW.downloadCanvas.size, id: "config-download-size", class: "w-full" },
	                          h( 'option', { value: "2" }, "2x"),
	                          h( 'option', { value: "4" }, "4x"),
	                          h( 'option', { value: "8" }, "8x"),
	                          h( 'option', { value: "16" }, "16x"),
	                          h( 'option', { value: "32" }, "32x"),
	                          h( 'option', { value: "64" }, "64x")
	                      )
	                    )
	                ),
	                h( 'div', { class: "fl", style: "padding-top: 5px;" },
	                  h( 'button', {
	                    onClick: function () {
	                      VIEW.downloadCanvas.open = false;
	                      VIEW.render();
	                    }, class: "b-r-2 bold p-5 w-full bg-red m-5" }, "Cancel"),
	                  h( 'a', {
	                    onClick: function (e) {
	                      downloadCanvas(e);
	                    }, class: "w-full m-5 clickable", download: "pixel-art.png", style: "display: inline-block;" },
	                    h( 'button', { class: "b-r-2 bold p-5 w-full bg-green no-ptr" }, "Download")
	                  )
	                )
	              )
	          )
	        )
	      )
	    )
	  };

	  return View;
	}(Component));

	var onProgramStart = function () {
	  console.log('Program started.');

	  newData(64, 64, true);
	  render(h( View, null ), document.body);
	  
	  loadData({
	    onLoaded: function () {
	      initCanvases();
	      VIEW.render();
	    },
	    onError: function () {}
	  });

	  setupKeyListeners();
	  
	  window.addEventListener('keyup', function () {
	    saveData();
	  });  
	};

	window.addEventListener('load', onProgramStart);

	window.addEventListener('beforeunload', function (event) {
	  event.returnValue = "Are you sure you want to leave?";
	});

}());
