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

	function createRef() {
		return {};
	}
	//# sourceMappingURL=preact.mjs.map

	var CANVAS = Object.seal({
	  offscreen: document.createElement('canvas'),
	  main: {
	    dom: undefined,
	    ctx: undefined,
	    imageData: undefined
	  },
	  preview: {
	    dom: undefined,
	    ctx: undefined,
	    imageData: undefined
	  },
	  emptyImageData: undefined
	});

	var defaultWidth = 50;
	var defaultHeight = 50;

	CANVAS.offscreen.width = defaultWidth;
	CANVAS.offscreen.height = defaultHeight;
	var base64 = CANVAS.offscreen.toDataURL();

	var STATE = Object.seal({
	  // Canvas
	  width: defaultWidth,
	  height: defaultHeight,
	  scale: 0.75,
	  translateX: 0,
	  translateY: 0,
	  tool: 0,

	  currentFrame: base64,

	  // Layers
	  layersActive: 0,
	  layersCount: 1,
	  layers: [
	    {
	      hidden: false,
	      locked: false,
	      name: 'Layer 1',
	      paintActive: false,
	      image: base64
	    }
	  ],

	  // Palette
	  palette: [
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
	  ],

	  // Color Picker
	  color: [191, 61, 64, 255],
	  hue: 0,
	  saturation: 50,
	  lightness: 50,

	  // UI
	  colorPickerOpen: false,
	  fileOpen: false,
	  modalOpen: false,
	  modalIndex: 0,

	  // Update utility functions
	  update: undefined,
	  updateAndSave: undefined,
	  save: undefined
	});

	var areRGBAsEqual = function (c1, a, c2, b) {
	  return (
	    c1[a + 0] === c2[b + 0] &&
	    c1[a + 1] === c2[b + 1] &&
	    c1[a + 2] === c2[b + 2] &&
	    c1[a + 3] === c2[b + 3]
	  )
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

	var getColorAtPixel = function (imageData, x, y) {
	  var width = imageData.width;
	  var data = imageData.data;
	  var linearCord = (y * width + x) * 4;

	  return [
	    data[linearCord + 0],
	    data[linearCord + 1],
	    data[linearCord + 2],
	    data[linearCord + 3]
	  ]
	};

	var fill = function (canvasImgData, w, h, startX, startY, color) { // http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
	  var linear_cords = (startY * w + startX) * 4;

	  var pixel_stack = [{ x: startX, y: startY }];
	  var original_color = getColorAtPixel(canvasImgData, startX, startY);

	  if (areRGBAsEqual(color, 0, original_color, 0)) { return }

	  while (pixel_stack.length > 0) {
	    var new_pixel = pixel_stack.shift();
	    var x = new_pixel.x;
	    var y = new_pixel.y;

	    linear_cords = (y * w + x) * 4;

	    while (
	      y-- >= 0 &&
	      canvasImgData.data[linear_cords + 0] === original_color[0] &&
	      canvasImgData.data[linear_cords + 1] === original_color[1] &&
	      canvasImgData.data[linear_cords + 2] === original_color[2] &&
	      canvasImgData.data[linear_cords + 3] === original_color[3]) {
	        linear_cords -= w * 4;
	    }

	    linear_cords += w * 4;
	    y++;

	    var reached_left = false;
	    var reached_right = false;

	    while (
	      y++ < h &&
	      canvasImgData.data[linear_cords + 0] === original_color[0] &&
	      canvasImgData.data[linear_cords + 1] === original_color[1] &&
	      canvasImgData.data[linear_cords + 2] === original_color[2] &&
	      canvasImgData.data[linear_cords + 3] === original_color[3]
	    ) {
	      canvasImgData.data[linear_cords + 0] = color[0];
	      canvasImgData.data[linear_cords + 1] = color[1];
	      canvasImgData.data[linear_cords + 2] = color[2];
	      canvasImgData.data[linear_cords + 3] = color[3];

	      if (x > 0) {
	        if (
	          canvasImgData.data[linear_cords - 4 + 0] === original_color[0] &&
	          canvasImgData.data[linear_cords - 4 + 1] === original_color[1] &&
	          canvasImgData.data[linear_cords - 4 + 2] === original_color[2] &&
	          canvasImgData.data[linear_cords - 4 + 3] === original_color[3]
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
	          canvasImgData.data[linear_cords + 4 + 0] === original_color[0] &&
	          canvasImgData.data[linear_cords + 4 + 1] === original_color[1] &&
	          canvasImgData.data[linear_cords + 4 + 2] === original_color[2] &&
	          canvasImgData.data[linear_cords + 4 + 3] === original_color[3]
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

	var assignRGBATo = function (arr1, i1, arr2, i2) {
	  arr1[i1 + 0] = arr2[i2 + 0];
	  arr1[i1 + 1] = arr2[i2 + 1];
	  arr1[i1 + 2] = arr2[i2 + 2];
	  arr1[i1 + 3] = arr2[i2 + 3];
	};

	var setPoint = function (imgData, x, y, w, h, color) {
	  if (!imgData) { throw Error(("setPoint: " + imgData + " undefined")) }
	  if (!imgData.length) { throw Error(("setPoint: " + imgData + " not a valid array")) }

	  if (x >= 0 && x < w && y >= 0 && y < h) { // check bounds
	    var i = (x + w * y) * 4;
	    assignRGBATo(imgData, i, color, 0);
	  }
	};

	var HSLtoRGB = function (hue, saturation, lightness) {
	  var h = hue;
	  var s = saturation / 100;
	  var l = lightness / 100;

	  var c = (1 - Math.abs(2 * l - 1)) * s;
	  var x = c * (1 - Math.abs((hue / 60) % 2 - 1));
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

	  return { r: r, g: g, b: b }
	};

	var RGBtoHSL = function (red, green, blue) {
	  // Make r, g, and b fractions of 1
	  var r = red / 255;
	  var g = green / 255;
	  var b = blue / 255;

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

	  return { h: h, s: s, l: l }
	};

	var Canvas = /*@__PURE__*/(function (Component$$1) {
	  function Canvas () {
	    Component$$1.call(this);
	    // Canvas + Canvas Container
	    this.padding = 0;
	    this.width = 500;
	    this.height = 500;

	    // Orientation
	    this.gestureStartScale = 0;
	    this.canvasContainer = createRef();
	  }

	  if ( Component$$1 ) Canvas.__proto__ = Component$$1;
	  Canvas.prototype = Object.create( Component$$1 && Component$$1.prototype );
	  Canvas.prototype.constructor = Canvas;

	  Canvas.prototype.componentDidUpdate = function componentDidUpdate () {
	    this.setCanvas();
	  };

	  Canvas.prototype.componentDidMount = async function componentDidMount () {
	    var this$1 = this;

	    this.setCanvas();

	    var container = this.canvasContainer.current;
	    container.scrollTop = (container.scrollHeight - container.offsetHeight) / 2;
	    container.scrollLeft = (container.scrollWidth - container.offsetWidth) / 2;

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

	    var gestureDown = function (e) {
	      WINDOW.REQUEST = e.target.dataset.request;
	      WINDOW.MOUSE_DOWN = true;
	      WINDOW.START_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
	      WINDOW.START_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
	      WINDOW.PREV_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
	      WINDOW.PREV_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;
	      WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
	      WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;

	      this$1.paintCanvas('down', WINDOW);
	    };

	    window.addEventListener('mousedown', gestureDown);
	    window.addEventListener('touchstart', gestureDown, { passive: false }); // allow prevent default

	    var gestureMove = function (e) {
	      WINDOW.PREV_X = WINDOW.CURR_X;
	      WINDOW.PREV_Y = WINDOW.CURR_Y;
	      WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX;
	      WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY;

	      this$1.paintCanvas('move', WINDOW);

	      if (e.target.tagName !== 'INPUT') { // prevent block on input range elements
	        e.preventDefault(); // block pull to refresh on mobile browsers
	      }
	    };

	    window.addEventListener('mousemove', gestureMove);
	    window.addEventListener('touchmove', gestureMove, { passive: false }); // allow prevent default

	    var gestureEnd = function (e) {
	      this$1.paintCanvas('up', WINDOW);
	      resetWindow();
	    };

	    window.addEventListener('mouseup', gestureEnd);
	    window.addEventListener('touchend', gestureEnd);

	    // Resize Canvas
	    var resizeCanvas = function () {
	      if (window.innerWidth < 600) ;
	    };

	    window.addEventListener('resize', resizeCanvas);

	    resizeCanvas();
	  };

	  Canvas.prototype.setCanvas = function setCanvas () {
	    CANVAS.main.dom = document.querySelector("#canvas-main");
	    CANVAS.main.ctx = CANVAS.main.dom.getContext('2d');
	    CANVAS.main.imageData = CANVAS.main.ctx.getImageData(0, 0, STATE.width, STATE.height);

	    CANVAS.preview.dom = document.querySelector("#canvas-preview");
	    CANVAS.preview.ctx = CANVAS.preview.dom.getContext('2d');
	    CANVAS.preview.imageData = CANVAS.preview.ctx.getImageData(0, 0, STATE.width, STATE.height);

	    CANVAS.emptyImageData = new window.ImageData(STATE.width, STATE.height);
	  };

	  Canvas.prototype.setOrientation = function setOrientation (e, zoom) {
	    // const offsetX = (window.innerWidth / 2) - (e.target.children[0].clientWidth / 2)
	    // const offsetY = (window.innerHeight / 2) - (e.target.children[0].clientHeight / 2) + 18

	    // const mouseX = Math.floor(e.pageX - offsetX)
	    // const mouseY = Math.floor(e.pageY - offsetY)
	    // const bb = this.canvasContainer.current.children[0].children[0].getBoundingClientRect()

	    // const maxWidth = this.canvasContainer.current.children[0].clientWidth
	    // const currWidth = bb.width

	    // const scaleCurr = STATE.scale
	    // const scaleNext = zoom || STATE.scale

	    // if (scaleNext > scaleCurr && currWidth >= maxWidth - 50) return

	    // // STATE.translateX -= (-((mouseX / scaleNext) - (mouseX / scaleCurr)))
	    // // STATE.translateY -= (-((mouseY / scaleNext) - (mouseY / scaleCurr)))
	    // STATE.scale = scaleNext

	    // STATE.updateAndSave()
	  };

	  Canvas.prototype.zoom = function zoom (e) {
	    if (e.type === 'wheel') {
	      var deltaYDir = e.deltaY < 0 ? 1 : -1;
	      var deltaXDir = e.deltaX < 0 ? 1 : -1;
	      var deltaY = Math.exp(deltaYDir * 0.01);

	      if (e.ctrlKey) {
	        e.preventDefault();

	        this.setOrientation(e, STATE.scale * deltaY);
	      } else {
	        // prevent accidental browser back behavior
	        if (deltaXDir === 1 && this.canvasContainer.current.scrollLeft === 0) { e.preventDefault(); }
	      }
	    }

	    if (e.type === 'gesturestart') {
	      e.preventDefault();
	      this.gestureStartScale = STATE.scale;
	    }

	    if (e.type === 'gesturechange') {
	      e.preventDefault();

	      this.setOrientation(e, this.gestureStartScale * e.scale);
	    }

	    if (e.type === 'gestureend') {
	      e.preventDefault();
	    }
	  };

	  Canvas.prototype.paintCanvas = function paintCanvas (type, WINDOW) {
	    if (STATE.modalOpen) { return }

	    var PENCIL = 0;
	    var ERASER = 1;
	    var LINE = 2;
	    var CIRCLE = 3;
	    var SQUARE = 4;
	    var FILL = 5;
	    var EYE_DROPPER = 6;

	    // CANVAS specific, transforming points to canvas
	    var bb = CANVAS.main.dom.getBoundingClientRect();

	    var scaleX = bb.width / CANVAS.main.dom.width;
	    var scaleY = bb.height / CANVAS.main.dom.height;

	    var startX = Math.floor((WINDOW.START_X - bb.x) / scaleX);
	    var startY = Math.floor((WINDOW.START_Y - bb.y) / scaleY);
	    var prevX = Math.floor((WINDOW.PREV_X - bb.x) / scaleX);
	    var prevY = Math.floor((WINDOW.PREV_Y - bb.y) / scaleY);
	    var currX = Math.floor((WINDOW.CURR_X - bb.x) / scaleX);
	    var currY = Math.floor((WINDOW.CURR_Y - bb.y) / scaleY);

	    CANVAS.preview.imageData.data.set(CANVAS.emptyImageData.data);

	    // Hover
	    if (STATE.tool !== ERASER && STATE.tool !== EYE_DROPPER) {
	      setPoint(
	        CANVAS.preview.imageData.data,
	        currX,
	        currY,
	        STATE.width,
	        STATE.height,
	        STATE.color
	      );
	    }

	    CANVAS.preview.ctx.putImageData(CANVAS.preview.imageData, 0, 0);

	    if (WINDOW.REQUEST !== 'paintCanvas' || STATE.layers[STATE.layersActive].hidden) { return }

	    if (type === 'down') {
	      var img = CANVAS.main.dom.parentNode.children[0];
	      CANVAS.main.ctx.drawImage(img, 0, 0);
	      CANVAS.main.imageData = CANVAS.main.ctx.getImageData(0, 0, STATE.width, STATE.height);

	      STATE.layers[STATE.layersActive].paintActive = true;
	      STATE.update();
	    }

	    // Tools
	    if (STATE.tool === PENCIL || STATE.tool === ERASER) {
	      line(prevX, prevY, currX, currY, function (x, y) {
	        setPoint(
	          CANVAS.main.imageData.data,
	          x,
	          y,
	          STATE.width,
	          STATE.height,
	          STATE.tool === PENCIL ? STATE.color : [0, 0, 0, 0]
	        );
	      });
	    }

	    if (STATE.tool === LINE || STATE.tool === CIRCLE || STATE.tool === SQUARE) {
	      var toolFunctionMap = {
	        2: line,
	        3: circle,
	        4: square
	      };

	      toolFunctionMap[STATE.tool](startX, startY, currX, currY, function (x, y) {
	        setPoint(
	          (type === 'down' || type === 'move')
	            ? CANVAS.preview.imageData.data
	            : CANVAS.main.imageData.data,
	          x,
	          y,
	          STATE.width,
	          STATE.height,
	          STATE.color
	        );
	      });
	    }

	    if (STATE.tool === FILL && type === 'up') {
	      fill(CANVAS.main.imageData, STATE.width, STATE.height, currX, currY, STATE.color);
	    }

	    if (STATE.tool === EYE_DROPPER && type === 'up') {
	      var sampled = getColorAtPixel(CANVAS.main.imageData, currX, currY);

	      if (
	        sampled[0] === undefined || sampled[0] === null ||
	        sampled[1] === undefined || sampled[1] === null ||
	        sampled[2] === undefined || sampled[2] === null
	      ) {
	        return
	      }

	      if (sampled[3] === 0) { return } // don't do anything if empty pixel

	      STATE.color = sampled;

	      var hsl = RGBtoHSL(STATE.color[0], STATE.color[1], STATE.color[2]);

	      STATE.hue = Math.floor(hsl.h);
	      STATE.saturation = Math.floor(hsl.s);
	      STATE.lightness = Math.floor(hsl.l);
	    }

	    CANVAS.preview.ctx.putImageData(CANVAS.preview.imageData, 0, 0);
	    CANVAS.main.ctx.putImageData(CANVAS.main.imageData, 0, 0);

	    if (type === 'up') {
	      STATE.currentFrame = CANVAS.main.dom.toDataURL();
	      STATE.layers[STATE.layersActive].image = CANVAS.main.dom.toDataURL();
	      STATE.layers[STATE.layersActive].paintActive = false;

	      CANVAS.preview.ctx.putImageData(CANVAS.emptyImageData, 0, 0);
	      CANVAS.main.ctx.putImageData(CANVAS.emptyImageData, 0, 0);

	      STATE.updateAndSave();
	    }
	  };

	  Canvas.prototype.render = function render$$1 () {
	    var this$1 = this;

	    return (
	      h( 'div', {
	        onGestureStart: function (e) { this$1.zoom(e); }, onGestureChange: function (e) { this$1.zoom(e); }, onGestureEnd: function (e) { this$1.zoom(e); }, onWheel: function (e) { this$1.zoom(e); }, ref: this.canvasContainer, 'data-request': 'paintCanvas', class: 'txt-center w-full overflow', style: 'cursor: crosshair;' },
	        h( 'div', { class: 'w-full h-full flex flex-center', 'data-request': 'paintCanvas', style: 'min-width: 1200px; min-height: 1200px;' },
	          h( 'div', { style: ("position: relative; pointer-events: none; width: " + (STATE.width * (800 / STATE.width)) + "px; height: 800px; transform: scale(" + (STATE.scale) + ") translateX(" + (STATE.translateX) + "px) translateY(" + (STATE.translateY) + "px); transform-origin: 50% 50%; background: white;") },
	            STATE.layers.map(function (layer, i) {
	                return h( 'div', { class: 'absolute', style: ("z-index: " + (STATE.layers.length - 1 - i) + "; width: calc(100% - " + (this$1.padding * 2) + "px); height: calc(100% - " + (this$1.padding * 2) + "px); top: " + (this$1.padding) + "px; left: " + (this$1.padding) + "px;") },
	                  h( 'div', {
	                    class: 'relative w-full h-full image-container', style: layer.hidden ? "visibility: hidden; pointer-events: none;" : '' },
	                    h( 'img', { width: STATE.width, height: STATE.height, class: 'frame-img w-full h-full', src: ("" + (layer.image)), style: ("visibility: " + (layer.paintActive || layer.hidden ? 'hidden' : 'visible') + ";") }),
	                    i === STATE.layersActive &&
	                      h( 'canvas', { id: 'canvas-main', width: STATE.width, height: STATE.height, class: 'absolute w-full h-full', style: 'top: 0px; left: 0px; z-index: 1;' }),
	                    i === STATE.layersActive &&
	                      h( 'canvas', { id: 'canvas-preview', width: STATE.width, height: STATE.height, class: 'absolute w-full h-full', style: 'top: 0px; left: 0px; z-index: 2;' })
	                  )
	                )
	              })
	          )
	        )
	      )
	    )
	  };

	  return Canvas;
	}(Component));

	var Layers = /*@__PURE__*/(function (Component$$1) {
	  function Layers () {
	    Component$$1.apply(this, arguments);
	  }

	  if ( Component$$1 ) Layers.__proto__ = Component$$1;
	  Layers.prototype = Object.create( Component$$1 && Component$$1.prototype );
	  Layers.prototype.constructor = Layers;

	  Layers.prototype.addLayer = function addLayer () {
	    STATE.layersCount += 1;

	    CANVAS.offscreen.width = STATE.width;
	    CANVAS.offscreen.height = STATE.height;
	    var ctx = CANVAS.offscreen.getContext('2d');
	    ctx.clearRect(0, 0, STATE.width, STATE.height);

	    STATE.layers.splice(
	      STATE.layersActive,
	      0,
	      {
	        hidden: false,
	        locked: false,
	        name: ("Layer " + (STATE.layersCount)),
	        paintActive: false,
	        image: CANVAS.offscreen.toDataURL()
	      }
	    );

	    STATE.updateAndSave();
	  };

	  Layers.prototype.setLayerActive = function setLayerActive (i) {
	    STATE.layersActive = i;
	    STATE.updateAndSave();
	  };

	  Layers.prototype.moveLayerUp = function moveLayerUp () {
	    if (STATE.layersActive === 0) { return }

	    var temp = STATE.layers[STATE.layersActive - 1];
	    STATE.layers[STATE.layersActive - 1] = STATE.layers[STATE.layersActive];
	    STATE.layers[STATE.layersActive] = temp;

	    this.setLayerActive(STATE.layersActive -= 1);
	  };

	  Layers.prototype.moveLayerDown = function moveLayerDown () {
	    if (STATE.layersActive + 1 === STATE.layers.length) { return }

	    var temp = STATE.layers[STATE.layersActive + 1];
	    STATE.layers[STATE.layersActive + 1] = STATE.layers[STATE.layersActive];
	    STATE.layers[STATE.layersActive] = temp;

	    this.setLayerActive(STATE.layersActive + 1);
	  };

	  Layers.prototype.deleteLayer = function deleteLayer () {
	    if (STATE.layers.length !== 1) {
	      STATE.layers.splice(STATE.layersActive, 1);
	      
	      if (STATE.layersActive === STATE.layers.length) { this.setLayerActive(STATE.layersActive - 1); }

	      this.setLayerActive(STATE.layersActive);
	    }
	  };

	  Layers.prototype.toggleHidden = function toggleHidden (i) {
	    STATE.layers[i].hidden = !STATE.layers[i].hidden;

	    STATE.updateAndSave();
	  };

	  Layers.prototype.render = function render$$1 () {
	    var this$1 = this;

	    return h( 'div', { class: 'fl-column', style: 'max-height: calc(100% - 200px); min-height: calc(100% - 200px);' },
	      h( 'div', { class: 'bg-mid bord-dark-b bord-dark-t p-h-10 p-v-5 h-30' },
	        h( 'small', { style: 'position: relative; top: -1px;' }, h( 'b', null, "Layers" ))
	      ),
	      h( 'div', { class: 'flex h-30 bord-dark-b w-full fl-justify-between' },
	        h( 'div', { class: 'flex' },
	          h( 'button', { onMouseUp: function () { this$1.addLayer(); }, class: 'w-30 flex flex-center' },
	            h( 'img', { src: 'img/plus.svg' })
	          ),
	          h( 'button', { onMouseUp: function () { this$1.moveLayerUp(); }, class: 'w-30 flex flex-center bord-dark-l', 'data-request': 'moveLayerUp' },
	            h( 'img', { src: 'img/up.svg' })
	          ),
	          h( 'button', { onMouseUp: function () { this$1.moveLayerDown(); }, class: 'w-30 flex flex-center bord-dark-l bord-dark-r', 'data-request': 'moveLayerDown' },
	            h( 'img', { src: 'img/down.svg' })
	          )
	        ),
	        h( 'div', { class: 'flex' },
	          h( 'button', { onMouseUp: function () { this$1.deleteLayer(); }, class: 'w-30 flex flex-center bord-dark-l ', 'data-request': 'deleteLayer' },
	            h( 'img', { src: 'img/trash.svg' })
	          )
	        )
	        
	      ),
	      h( 'div', { class: 'fl-1 overflow' },
	        STATE.layers.map(function (layer, i) {
	            return h( 'div', { class: 'w-full flex h-30 bord-light-b', style: { background: i === STATE.layersActive ? 'rgb(100, 100, 100)' : 'transparent' } },
	              h( 'button', { onMouseUp: function () { this$1.toggleHidden(i); }, class: ("flex flex-center w-30 no-hover " + (layer.hidden ? 'bg-blue' : 'bg-transparent')) },
	                h( 'img', { src: ("img/" + (layer.hidden ? 'eye-active.svg' : 'eye.svg')) })
	              ),
	              h( 'button', { onMouseUp: function () { this$1.setLayerActive(i); }, class: 'flex flex-center-y fl-1' },
	                h( 'b', null, layer.name )
	              )
	            )
	          })
	      )
	      
	    )
	  };

	  return Layers;
	}(Component));

	var ColorPalette = /*@__PURE__*/(function (Component$$1) {
	  function ColorPalette () {
	    Component$$1.apply(this, arguments);
	  }

	  if ( Component$$1 ) ColorPalette.__proto__ = Component$$1;
	  ColorPalette.prototype = Object.create( Component$$1 && Component$$1.prototype );
	  ColorPalette.prototype.constructor = ColorPalette;

	  ColorPalette.prototype.setColor = function setColor (i) {
	    if (areRGBAsEqual(STATE.color, 0, STATE.palette[i], 0)) { return }

	    assignRGBATo(STATE.color, 0, STATE.palette[i], 0);

	    var hsl = RGBtoHSL(STATE.color[0], STATE.color[1], STATE.color[2]);

	    STATE.hue = Math.floor(hsl.h);
	    STATE.saturation = Math.floor(hsl.s);
	    STATE.lightness = Math.floor(hsl.l);

	    STATE.update();
	  };

	  ColorPalette.prototype.addColor = function addColor () { 
	    for (var i = 0; i < STATE.palette.length; i++) {
	      if (areRGBAsEqual(STATE.palette[i], 0, STATE.color, 0)) { return }
	    }
	    var newColor = [0, 0, 0, 0];
	    assignRGBATo(newColor, 0, STATE.color, 0);

	    STATE.palette.push(newColor);

	    STATE.updateAndSave();
	  };

	  ColorPalette.prototype.deleteColor = function deleteColor () {
	    for (var i = 0; i < STATE.palette.length; i++) {
	      if (areRGBAsEqual(STATE.palette[i], 0, STATE.color, 0)) {
	        STATE.palette.splice(i, 1);
	        STATE.updateAndSave();
	      }
	    }
	  };

	  ColorPalette.prototype.render = function render$$1 () {
	    var this$1 = this;

	    return h( 'div', { class: 'fl-column', style: 'min-height: 200px; max-height: 200px;' },
	      h( 'div', { class: 'bg-mid bord-dark-b p-h-10 p-v-5 h-30' },
	        h( 'small', { style: 'position: relative; top: -1px;' }, h( 'b', null, "Color Palette" ))
	      ),
	      h( 'div', { class: 'flex h-30 bord-dark-b w-full fl-justify-between' },
	        h( 'button', { onMouseUp: function () { this$1.addColor(); }, class: 'bord-dark-r', style: 'min-width: 30px;' },
	          h( 'img', { src: 'img/plus.svg' })
	        ),
	        h( 'button', { onMouseUp: function () { this$1.deleteColor(); }, class: 'bord-dark-l', 'data-request': 'deleteLayer', style: 'min-width: 30px;' },
	          h( 'img', { src: 'img/trash.svg' })
	        )
	      ),
	      h( 'div', { class: 'fl-1 overflow flex fl-wrap', style: 'align-content: flex-start;' },
	        STATE.palette.map(function (color, i) {
	            var isActive = areRGBAsEqual(color, 0, STATE.color, 0);
	            return h( 'button', {
	              onMouseUp: function () {
	                  this$1.setColor(i);
	                }, class: 'm-0 p-0 relative', style: {
	                minWidth: '30px',
	                minHeight: '30px',
	                background: ("rgba(" + (color[0]) + ", " + (color[1]) + ", " + (color[2]) + ", " + (color[3]) + ")"),
	                border: isActive ? '2px solid rgba(61,61,61, 1)' : '2px solid rgba(61,61,61, 0)',
	                boxShadow: ("inset 0px 0px 0px 1px rgba(255, 255, 255, " + (isActive ? '255' : '0') + ")")
	              } })
	          })
	      )
	    )
	  };

	  return ColorPalette;
	}(Component));

	var ToolBarButton = function (ref) {
	  var action = ref.action;
	  var icon = ref.icon;
	  var active = ref.active;
	  var children = ref.children;

	  return (
	    h( 'button', {
	      onMouseUp: action, class: 'flex flex-center m-0 p-0 relative', style: ("width: 38px; height: 38px; background: " + (active ? '#3498db' : '') + ";") },
	      children.length > 0 ? children : h( 'img', { src: ("img/" + icon) })
	    )
	  )
	};

	var MenuButton = function (ref) {
	  var action = ref.action;
	  var icon = ref.icon;
	  var label = ref.label;

	  return (
	    h( 'button', {
	      onMouseUp: action, onTouchEnd: action, class: 'm-0 p-h-10 h-35 flex flex-center-y' },
	      h( 'img', { src: ("img/" + icon) }),
	      h( 'small', { class: 'bold p-h-10' }, label)
	    )
	  )
	};

	var ColorSlider = function (ref) {
	  var label = ref.label;
	  var hue = ref.hue;
	  var value = ref.value;
	  var action = ref.action;
	  var onTouchInput = ref.onTouchInput;
	  var min = ref.min;
	  var max = ref.max;

	  var bgMap = {
	    'Hue': function () { return 'background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);' },
	    'Saturation': function (hue) { return ("background: linear-gradient(to right, hsl(" + hue + ", 0%, 50%) 0%,hsl(" + hue + ", 100%, 50%) 100%);") },
	    'Lightness': function (hue) { return ("background: linear-gradient(to right, hsl(" + hue + ", 100%, 0%) 0%, hsl(" + hue + ", 100%, 50%) 50%, hsl(" + hue + ", 100%, 100%) 100%);") }
	  };

	  return (
	    h( 'div', { style: 'padding: 5px 0px;' },
	      h( 'div', { class: 'flex', style: 'justify-content: space-between; padding-bottom: 2px;' },
	        h( 'small', { class: 'bold', style: 'display: block; margin-bottom: 2px;' }, label),
	        h( 'small', { class: 'txt-center', style: 'padding-left: 10px; width: 30px;' }, value)
	      ),
	      h( 'div', {
	        class: 'fl-1 b-r-2 flex flex-center-y relative', style: ("cursor: pointer; " + (bgMap[label](hue))) },
	        h( 'input', { type: 'range', class: 'w-full m-0', min: min, max: max, value: value, onInput: action, onTouchStart: onTouchInput, onTouchMove: onTouchInput })
	      )
	    )
	  )
	};

	var App = /*@__PURE__*/(function (Component$$1) {
	  function App () {
	    Component$$1.call(this);
	    this.updateAndSave = this.updateAndSave.bind(this);
	    this.update = this.update.bind(this);
	    this.save = this.save.bind(this);

	    this.history = [];
	  }

	  if ( Component$$1 ) App.__proto__ = Component$$1;
	  App.prototype = Object.create( Component$$1 && Component$$1.prototype );
	  App.prototype.constructor = App;

	  App.prototype.componentWillMount = async function componentWillMount () {
	    STATE.updateAndSave = this.updateAndSave;
	    STATE.update = this.update;
	    STATE.save = this.save;

	    if (window.localStorage.length > 0) {
	      this.load();
	    }

	    this.save();
	  };

	  App.prototype.undoAdd = function undoAdd (changes) {
	    if (this.history.length > 30) { this.history.splice(0, 1); }

	    this.history.push(changes);
	  };

	  App.prototype.undoRevert = function undoRevert (key, previousValue) {
	    var lastItem = this.history[this.history.length - 1];

	    lastItem.forEach(function (change) {
	      STATE[change.key] = JSON.parse(change.prev);
	      window.localStorage.setItem(change.key, change.prev);
	    });

	    STATE.update();

	    if (this.history.length > 1) { this.history.splice(this.history.length - 1, 1); }
	  };

	  App.prototype.validateState = function validateState () {
	    Object.keys(STATE).forEach(function (key) {
	      if (key === 'update') { return }
	      if (key === 'save') { return }
	      if (key === 'updateAndSave') { return }

	      if (STATE[key] === null || STATE[key] === undefined) {
	        console.error(("STATE: Setting " + key + " is being set to undefined"));
	      }
	    });
	  };

	  App.prototype.save = function save () {
	    var changes = [];

	    Object.keys(STATE).forEach(function (key) {
	      if (key === 'update') { return }
	      if (key === 'save') { return }
	      if (key === 'updateAndSave') { return }

	      var prev = window.localStorage.getItem(key);
	      var next = JSON.stringify(STATE[key]);

	      if (prev !== next) {
	        changes.push({ key: key, prev: prev === null ? JSON.stringify(STATE[key]) : prev }); // default to ram value if localStorage is empty
	        window.localStorage.setItem(key, next);
	      }
	    });

	    this.undoAdd(changes);
	  };

	  App.prototype.load = function load () {
	    Object.keys(window.localStorage).forEach(function (key) {
	      STATE[key] = JSON.parse(window.localStorage.getItem(key));
	    });
	  };

	  App.prototype.update = function update () {
	    this.validateState();

	    this.setState();
	  };

	  App.prototype.updateAndSave = function updateAndSave () {
	    this.validateState();

	    this.save();
	    this.setState();
	  };

	  App.prototype.setTool = function setTool (tool) {
	    STATE.tool = tool;

	    this.update();
	  };

	  App.prototype.setHSL = function setHSL (ref) {
	    var hue = ref.hue;
	    var saturation = ref.saturation;
	    var lightness = ref.lightness;

	    var RGB = HSLtoRGB(hue, saturation, lightness);

	    STATE.hue = hue;
	    STATE.saturation = saturation;
	    STATE.lightness = lightness;

	    STATE.color[0] = RGB.r;
	    STATE.color[1] = RGB.g;
	    STATE.color[2] = RGB.b;

	    this.update();
	  };

	  App.prototype.toggleView = function toggleView (view) {
	    STATE[view] = !STATE[view];

	    this.update();
	  };

	  App.prototype.newCanvas = function newCanvas (w, h$$1) {
	    CANVAS.offscreen.width = w;
	    CANVAS.offscreen.height = h$$1;

	    var base64 = CANVAS.offscreen.toDataURL();

	    STATE.width = w;
	    STATE.height = h$$1;
	    STATE.scale = 0.75;
	    STATE.translateX = 0;
	    STATE.translateY = 0;
	    STATE.tool = 0;
	  
	    STATE.currentFrame = '';
	  
	    // Layers
	    STATE.layersActive = 0;
	    STATE.layersCount = 1;
	    STATE.layers = [
	      {
	        hidden: false,
	        locked: false,
	        name: 'Layer 1',
	        paintActive: false,
	        image: base64
	      }
	    ];

	    STATE.modalOpen = false;

	    STATE.updateAndSave();
	  };

	  App.prototype.downloadCanvas = function downloadCanvas (e, scaleFactor) {
	    console.log('here');
	    //const scaleFactor = parseInt(document.querySelector('#config-download-size').value)
	    var c = document.createElement('canvas');
	    var ctx = c.getContext('2d');

	    c.width = STATE.width * scaleFactor;
	    c.height = STATE.height * scaleFactor;
	    ctx.webkitImageSmoothingEnabled = false;
	    ctx.mozImageSmoothingEnabled = false;
	    ctx.imageSmoothingEnabled = false;
	    var images = document.querySelectorAll('.image-container');

	    for (var i = images.length - 1; i >= 0; i--) {
	      ctx.drawImage(images[i].children[0], 0, 0, c.width, c.height);
	    }

	    var image = c.toDataURL('image/png').replace('image/png', 'image/octet-stream');
	    e.target.setAttribute('href', image);
	  };

	  App.prototype.render = function render$$1 () {
	    var this$1 = this;

	    console.log('View Rendered');
	    return (
	      h( 'div', { class: 'h-full relative' },
	        h( 'div', { class: 'bg-light bord-dark-b flex', style: 'min-height: 39px; max-height: 39px;' },
	          h( 'div', { class: 'flex w-full' },
	            h( 'div', { class: 'fl-1 flex' },
	              h( 'div', { class: 'flex bord-dark-r', style: 'position: relative;' },
	                h( ToolBarButton, { action: function () { this$1.toggleView('fileOpen'); }, icon: 'bars.svg' }),
	                h( 'div', { class: 'bg-light fl-column bord-dark', style: ("visibility: " + (STATE.fileOpen ? 'visible' : 'hidden') + "; position: absolute; top: 100%; left: 0px; z-index: 5;") },
	                  [
	                    {
	                      icon: 'folder-plus.svg',
	                      label: 'New',
	                      action: function () {
	                        // launch modal
	                        this$1.toggleView('fileOpen');
	                        STATE.modalIndex = 0;
	                        this$1.toggleView('modalOpen');
	                      }
	                    }, {
	                      icon: 'download.svg',
	                      label: 'Download',
	                      action: function () {
	                        // launch modal
	                        this$1.toggleView('fileOpen');
	                        STATE.modalIndex = 1;
	                        this$1.toggleView('modalOpen');
	                      }
	                    } ].map(function (item, i) {
	                    return h( MenuButton, { action: item.action, icon: item.icon, label: item.label })
	                  })
	                )
	              )
	            ),
	            h( 'div', { class: 'flex', style: 'max-width: 248px; min-width: 248px;' },
	              h( 'div', { class: 'bord-dark-l bord-dark-r flex' },
	                h( ToolBarButton, { action: function () { this$1.undoRevert(); }, icon: 'undo.svg' })
	              )
	            )
	          )
	        ),
	        h( 'div', { class: 'flex', style: 'height: calc(100% - 39px);' },
	          h( 'div', { class: 'bg-light bord-dark-r', style: 'min-width: 39px; max-width: 39px;' },
	            h( 'div', { class: 'fl-column', style: 'position: relative;' },
	              [
	                'pencil.svg',
	                'eraser.svg',
	                'line.svg',
	                'circle.svg',
	                'square.svg',
	                'fill.svg',
	                'eye-dropper.svg'
	              ].map(function (icon, i) {
	                return h( ToolBarButton, { action: function () { this$1.setTool(i); }, icon: icon, active: i === STATE.tool })
	              }),
	              h( 'div', { class: 'bord-dark-t bord-dark-b' },
	                h( ToolBarButton, { action: function () { this$1.toggleView('colorPickerOpen'); } },
	                  h( 'div', { class: 'b-r-2', style: ("min-width: 15px; min-height: 15px; background: rgb(" + (STATE.color[0]) + ", " + (STATE.color[1]) + ", " + (STATE.color[2]) + ");") })
	                )
	              ),
	              h( 'div', { class: 'bg-light bord-dark', style: ("visibility:" + (STATE.colorPickerOpen ? 'visible' : 'hidden') + "; padding: 10px 15px; position: absolute; left: 100%; bottom: 0px; width: 250px; z-index: 5;") },
	                h( ColorSlider, {
	                  label: 'Hue', hue: STATE.hue, value: STATE.hue, min: '0', max: '359', onTouchInput: function (e) {
	                    e.preventDefault(); // prevent scroll down
	                    // More responsive action on mobile than default
	                    var bb = e.target.getBoundingClientRect();
	                    var offset = e.touches ? e.touches[0].pageX - bb.left : e.offsetX;
	                    var val = Math.floor(offset * (360 / e.target.clientWidth)) | 0;

	                    if (val < 0 || val >= 360) { return }

	                    this$1.setHSL({ hue: val, saturation: STATE.saturation, lightness: STATE.lightness });
	                  }, action: function (e) {
	                    this$1.setHSL({ hue: parseInt(e.target.value), saturation: STATE.saturation, lightness: STATE.lightness });
	                  } }),
	                h( ColorSlider, {
	                  label: 'Saturation', hue: STATE.hue, value: STATE.saturation, min: '0', max: '100', onTouchInput: function (e) {
	                    e.preventDefault(); // prevent scroll down
	                    // More responsive action on mobile than default
	                    var bb = e.target.getBoundingClientRect();
	                    var offset = e.touches ? e.touches[0].pageX - bb.left : e.offsetX;
	                    var val = Math.floor(offset * (100 / e.target.clientWidth)) | 0;

	                    if (val < 0 || val >= 100) { return }

	                    this$1.setHSL({ hue: STATE.hue, saturation: val, lightness: STATE.lightness });
	                  }, action: function (e) {
	                    this$1.setHSL({ hue: STATE.hue, saturation: parseInt(e.target.value), lightness: STATE.lightness });
	                  } }),
	                h( ColorSlider, {
	                  label: 'Lightness', hue: STATE.hue, value: STATE.lightness, min: '0', max: '100', onTouchInput: function (e) {
	                    e.preventDefault(); // prevent scroll down
	                    // More responsive action on mobile than default
	                    var bb = e.target.getBoundingClientRect();
	                    var offset = e.touches ? e.touches[0].pageX - bb.left : e.offsetX;
	                    var val = Math.floor(offset * (100 / e.target.clientWidth)) | 0;

	                    if (val < 0 || val >= 100) { return }

	                    this$1.setHSL({ hue: STATE.hue, saturation: STATE.saturation, lightness: val });
	                  }, action: function (e) {
	                    this$1.setHSL({ hue: STATE.hue, saturation: STATE.saturation, lightness: parseInt(e.target.value) });
	                  } })
	              )
	            )
	          ),
	          h( Canvas, null ),
	          h( 'div', { class: 'bg-light bord-dark-l h-full', style: 'max-width: 248px; min-width: 248px;' },
	            h( ColorPalette, null ),
	            h( Layers, null )
	          )
	        ),
	        STATE.modalOpen && h( 'div', { class: 'absolute top left w-full h-full flex flex-center-x', style: 'z-index: 10;' },
	          STATE.modalIndex === 0 &&
	            h( 'div', { class: 'bord-r-2 w-full', style: 'max-width: 300px; overflow: hidden; margin-top: 175px; ' },
	              h( 'div', { class: 'flex flex-center bg-mid bord-dark p-v-5' },
	                h( 'small', { class: 'bold' }, "New Canvas")
	              ),
	              h( 'div', { class: 'p-10 bg-light' },
	                h( 'div', { class: 'm-5 p-v-5' },
	                  h( 'div', { class: 'flex flex-center' },
	                    h( 'small', { style: 'width: 150px;', class: 'bold' }, "Dimensions"),
	                    h( 'select', { id: 'config-canvas-dimensions', class: 'w-full' },
	                      h( 'option', { value: '32x32' }, "32x32"),
	                      h( 'option', { value: '50x50' }, "50x50"),
	                      h( 'option', { value: '64x64' }, "64x64"),
	                      h( 'option', { value: '100x100' }, "100x100"),
	                      h( 'option', { value: '128x128' }, "128x128"),
	                      h( 'option', { value: '256x256' }, "256x256")
	                    )
	                  )
	                ),
	                h( 'div', { class: 'flex', style: 'padding-top: 5px;' },
	                  h( 'button', {
	                    class: 'b-r-2 bold p-5 w-full bg-red m-5', onClick: function () {
	                      this$1.toggleView('modalOpen');
	                    } }, "Cancel"),
	                  h( 'button', {
	                    class: 'b-r-2 bold p-5 w-full bg-green m-5', onClick: function () {
	                      var val = document.querySelector('#config-canvas-dimensions').value;
	                      var wh = val.split('x');

	                      this$1.newCanvas(parseInt(wh[0]), parseInt(wh[1]));
	                    } }, "Confirm")
	                )
	              )
	            ),
	          STATE.modalIndex === 1 &&
	            h( 'div', { class: 'bord-r-2 w-full', style: 'max-width: 300px; overflow: hidden; margin-top: 175px; ' },
	              h( 'div', { class: 'flex flex-center bg-mid bord-dark p-v-5' },
	                h( 'small', { class: 'bold' }, "Download")
	              ),
	              h( 'div', { class: 'p-10 bg-light' },
	                h( 'div', { class: 'm-5 p-v-5' },
	                  h( 'div', { class: 'flex flex-center' },
	                    h( 'small', { style: 'width: 150px;', class: 'bold' }, "Size"),
	                    h( 'select', { id: 'config-download-size', class: 'w-full' },
	                      h( 'option', { value: '2' }, "2x"),
	                      h( 'option', { value: '4' }, "4x"),
	                      h( 'option', { value: '8' }, "8x"),
	                      h( 'option', { value: '16' }, "16x"),
	                      h( 'option', { value: '32' }, "32x"),
	                      h( 'option', { value: '64' }, "64x")
	                    )
	                  )
	                ),
	                h( 'div', { class: 'flex', style: 'padding-top: 5px;' },
	                  h( 'button', {
	                    class: 'b-r-2 bold p-5 w-full bg-red m-5', onClick: function () {
	                      this$1.toggleView('modalOpen');
	                    } }, "Cancel"),

	                  h( 'a', {
	                    class: "w-full m-5 clickable", style: "display: inline-block;", download: "pixel-art.png", onClick: function (e) {
	                      var val = parseInt(document.querySelector('#config-download-size').value);
	                      this$1.downloadCanvas(e, val);
	                    } },
	                    h( 'button', { class: "b-r-2 bold p-5 w-full bg-green", style: "pointer-events: none;" }, "Download")
	                  )
	                  /*<button
	                    class='b-r-2 bold p-5 w-full bg-green m-5'
	                    download='pixel-art.png'
	                    onClick={(e) => {
	                      const val = parseInt(document.querySelector('#config-download-size').value)
	                      this.downloadCanvas(e, val)
	                    }}
	                  >Confirm</button>*/
	                )
	              )
	            )
	        )
	      )
	    )
	  };

	  return App;
	}(Component));

	render(h( App, null ), document.body);

}());
