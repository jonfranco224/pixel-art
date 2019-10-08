function HSLtoRGB (hue, saturation, lightness) {
	let sat = saturation / 100;
	let light = lightness / 100;
	let C = sat * (1 - Math.abs(2 * light - 1));
	let H = hue / 60;
	let X = C * (1 - Math.abs(H % 2 - 1));
	let m = light - C/2;
	let precision = 255;

	C = (C + m) * precision | 0;
	X = (X + m) * precision | 0;
	m = m * precision | 0;

	if (H >= 0 && H < 1) {	setRGBA(C, X, m);	return; }
	if (H >= 1 && H < 2) {	setRGBA(X, C, m);	return; }
	if (H >= 2 && H < 3) {	setRGBA(m, C, X);	return; }
	if (H >= 3 && H < 4) {	setRGBA(m, X, C);	return; }
	if (H >= 4 && H < 5) {	setRGBA(X, m, C);	return; }
	if (H >= 5 && H < 6) {	setRGBA(C, m, X);	return; }
}
function RGBToHex(r,g,b) {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}
function hexToRGB(h) {
  let r = 0, g = 0, b = 0;

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

  // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return { r: +r, g: +g, b: +b }
}
function make (action, start, end, r) {
  let points = []

  let dx = Math.abs(end.x - start.x)
  let dy = Math.abs(end.y - start.y)

  let xDir = end.x - start.x >= 0 ? 1 : -1
  let yDir = end.y - start.y >= 0 ? 1 : -1

  let i = 0
  let lineX = start.x
  let lineY = start.y

  let xStep = 0
  let yStep = 0

  if (action === 'line') {
    let step = dx >= dy ? dx : dy

    dx = dx / step
    dy = dy / step

    while (i < step) {
      points.push({ x: Math.floor(lineX), y: Math.floor(lineY) })
      lineX += (dx * xDir)
      lineY += (dy * yDir)
      i += 1
    }

    points.push({ x: end.x, y: end.y })
  }

  if (action === 'square') {
    points.push({ x: start.x, y: start.y })

    while (i < dx) {
      lineX += (1 * xDir)
      points.push({ x: lineX, y: start.y })
      points.push({ x: lineX, y: start.y + (dy * yDir) })
      i += 1
    }

    i = 0

    while (i < dy) {
      lineY += (1 * yDir)
      points.push({ y: lineY, x: start.x })
      points.push({ y: lineY, x: start.x + (dx * xDir) })
      i += 1
    }
  }

  if (action === 'square-filled') {
    while (xStep <= dx) {
      yStep = 0
      lineY = start.y

      while (yStep <= dy) {
        points.push({ x: lineX, y: lineY })

        lineY += (1 * yDir)
        yStep += 1
      }

      lineX += (1 * xDir)
      xStep += 1
    }
  }

  if (action === 'circle') { // Function for circle-generation using Bresenham's algorithm
    let x = 0
    let y = r
    let d = 3 - 2 * r

    points.push({ x: start.x+x, y: start.y+y })
    points.push({ x: start.x-x, y: start.y+y })
    points.push({ x: start.x+x, y: start.y-y })
    points.push({ x: start.x-x, y: start.y-y })
    points.push({ x: start.x+y, y: start.y+x })
    points.push({ x: start.x-y, y: start.y+x })
    points.push({ x: start.x+y, y: start.y-x })
    points.push({ x: start.x-y, y: start.y-x })

    while (y >= x) { // for each pixel we will draw all eight pixels
      x++;

      // check for decision parameter and correspondingly update d, x, y
      if (d > 0) {
          y--
          d = d + 4 * (x - y) + 10
      } else {
        d = d + 4 * x + 6
      }

      points.push({ x: start.x+x, y: start.y+y })
      points.push({ x: start.x-x, y: start.y+y })
      points.push({ x: start.x+x, y: start.y-y })
      points.push({ x: start.x-x, y: start.y-y })
      points.push({ x: start.x+y, y: start.y+x })
      points.push({ x: start.x-y, y: start.y+x })
      points.push({ x: start.x+y, y: start.y-x })
      points.push({ x: start.x-y, y: start.y-x })
    }
  }

  return points
}
function dist (x1, x2, y1, y2) {
  return Math.floor(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)))
}
function blend (r1, g1, b1, r2, g2, b2) {
  let inv = 1.0 / 255.0

  let r1f = r1 * inv
  let g1f = g1 * inv
  let b1f = b1 * inv

  let r2f = r2 * inv
  let g2f = g2 * inv
  let b2f = b2 * inv

  return {
    r: parseInt(r1f * r2f * 255),
    g: parseInt(g1f * g2f * 255),
    b: parseInt(b1f * b2f * 255),
  }
}

// canvas layer/pixel buffer
let pixelBuffer, pixelResTotal;
// canvas preview buffer
let emptyPrevBuffer, previewBuffer;
// canvas selection buffer
let emptySelBuffer, selectionBuffer;
// canvas final draw buffer
let buf, buf8, buf32;

let CURR_FRAME

let $

function resetState () {
	$ = {}
	$ = {
	  FRAMES: [],
	  LAYERS: [],
	  isPlaying: 0,
	  frameActive: 0,
	  layerActive: 31,
	  colorActive: 20,
	  toolActive: 'pencil'
	}
}

function setToolActive (e, tool) {
  document.querySelector('#tools').querySelector(`[data-tool="${$.toolActive}"]`).classList.remove('active')
  $.toolActive = e ? e.target.dataset.tool : tool
  document.querySelector('#tools').querySelector(`[data-tool="${$.toolActive}"]`).classList.add('active')
}
function setColorActive (e, i) {
  document.querySelector(`[data-colorindex="${$.colorActive}"]`).classList.remove('active')
  $.colorActive = e ? parseInt(e.target.dataset.colorindex) : i
  document.querySelector(`[data-colorindex="${$.colorActive}"]`).classList.add('active')
}

function modalOpen (e, target) {
  const val = e ? e.target.dataset.val : target
  document.querySelector(`#modal`).classList.add('visible')
  document.querySelector(`#modal #${val}`).classList.add('visible')
}
function modalClose (e, target) {
  const val = e ? e.target.dataset.val : target
  document.querySelector(`#modal`).classList.remove('visible')
  document.querySelector(`#modal #${val}`).classList.remove('visible')
}

// INIT COLORS
const APP_UTIL_COLORS = [
  0, 0, 0, 0, // empty
  75, 75, 75, 125, // selected
  128, 128, 128, 255, // transparency 1
  211, 211, 211, 255, // transparency 1
  124, 124, 124, 255 // transparency 1
]

const bufColors = new ArrayBuffer(300)
const COLORS = new Uint8ClampedArray(bufColors)

let i = 0;
while (i < APP_UTIL_COLORS.length) {
  COLORS[i] = APP_UTIL_COLORS[i]
  COLORS[i + 1] = APP_UTIL_COLORS[i + 1]
  COLORS[i + 2] = APP_UTIL_COLORS[i + 2]
  COLORS[i + 3] = APP_UTIL_COLORS[i + 3]
  i += 4
}

const COLOR_PAL = [
  255, 0, 0,
  0, 255, 0,
  0, 0, 255,
  128, 10, 200
]

function setColorPalette () {

  const colorsDOM = document.querySelector('#colors')

  let i = 0
  let color = 0

  while (i < colorsDOM.children.length) {
    colorsDOM.children[i].style.pointerEvents = 'none'
    colorsDOM.children[i].style.background = `rgb(${85}, ${85}, ${85})`

    // Check against colors look up
    if (COLOR_PAL[color] !== undefined) {
      let b = 20
      while (b < COLORS.length) {
        // if it exsits, write look upindex to button for active paiting set
        if (COLORS[b] === COLOR_PAL[color] &&
          COLORS[b + 1] === COLOR_PAL[color + 1] &&
          COLORS[b + 2] === COLOR_PAL[color + 2]) {

          colorsDOM.children[i].style.pointerEvents = 'auto'
          colorsDOM.children[i].setAttribute('data-colorindex', b)
          colorsDOM.children[i].style.background = `rgb(${COLOR_PAL[color]}, ${COLOR_PAL[color + 1]}, ${COLOR_PAL[color + 2]})`

          break
        // otherwise, set the first full 0 set of indexes to new color and set b index
        } else if (COLORS[b] === 0 &&
          COLORS[b + 1] === 0 &&
          COLORS[b + 2] === 0 &&
          COLORS[b + 3] === 0) {
          // if in frame
          COLORS[b] = COLOR_PAL[color]
          COLORS[b + 1] = COLOR_PAL[color + 1]
          COLORS[b + 2] = COLOR_PAL[color + 2]
          COLORS[b + 3] = 255

          const blended = blend(COLORS[b], COLORS[b + 1], COLORS[b + 2], 150, 150, 150)
          COLORS[b + 4] = blended.r
          COLORS[b + 5] = blended.g
          COLORS[b + 6] = blended.b
          COLORS[b + 7] = 255

          colorsDOM.children[i].style.pointerEvents = 'auto'
          colorsDOM.children[i].setAttribute('data-colorindex', b)
          colorsDOM.children[i].style.background = `rgb(${COLOR_PAL[color]}, ${COLOR_PAL[color + 1]}, ${COLOR_PAL[color + 2]})`

          break
        }

        b += 8
      }
    }

    i += 1
    color += 3
  }
}

setColorPalette()

function openColorPicker () {
  const picker = document.querySelector('#color-picker')
  picker.style.display = 'inline-block'
  picker.style.zIndex = '5'
}
function closeColorPicker () {
  const picker = document.querySelector('#color-picker')
  picker.style.display = 'none'
  picker.style.zIndex = '-1'
}
let COLOR_PICKER = {
  r: 0, g: 0, b: 0, hex: '', hue: 0, saturation: 100, value: 50
}
function addColor (e) {
  //const imageData = blockCTX.getImageData(COLOR_PICKER.blockX, COLOR_PICKER.blockY, 1, 1).data;

  COLOR_PAL.push(COLOR_PICKER.r)
  COLOR_PAL.push(COLOR_PICKER.g)
  COLOR_PAL.push(COLOR_PICKER.b)

  setColorPalette()
}
function openColorPicker () {
  const picker = document.querySelector('#color-picker')
  picker.style.display = 'inline-block'
  picker.style.zIndex = '5'
}
function closeColorPicker () {
  const picker = document.querySelector('#color-picker')
  picker.style.display = 'none'
  picker.style.zIndex = '-1'
}

function setRGB (e) {
  if (e && e.key !== 'Enter') return
  if (e && e.key === 'Enter') {
    COLOR_PICKER.r = parseInt(e.target.parentNode.children[1].value)
    COLOR_PICKER.g = parseInt(e.target.parentNode.children[2].value)
    COLOR_PICKER.b = parseInt(e.target.parentNode.children[3].value)

    COLOR_PICKER.hex = RGBToHex(COLOR_PICKER.r, COLOR_PICKER.g, COLOR_PICKER.b)

    updateColorPicker()
  }
}
function setHEX (e) {
  if (e.type === 'change' || e.key === 'Enter') {
    COLOR_PICKER.hex = e.target.value

    const rgb = hexToRGB(COLOR_PICKER.hex)

    COLOR_PICKER.r = rgb.r
    COLOR_PICKER.g = rgb.g
    COLOR_PICKER.b = rgb.b

    updateColorPicker()
  }
}
function setHue (e) {
  if (e.type === 'change') {
    COLOR_PICKER.hue = e.target.value

    const rgb = hexToRGB(COLOR_PICKER.hex)

    COLOR_PICKER.r = rgb.r
    COLOR_PICKER.g = rgb.g
    COLOR_PICKER.b = rgb.b

    updateColorPicker()
  }
}
function updateColorPicker () {
  const picker = document.querySelector('#color-picker')
  picker.querySelector('#color-picker-r').value = COLOR_PICKER.r
  picker.querySelector('#color-picker-g').value = COLOR_PICKER.g
  picker.querySelector('#color-picker-b').value = COLOR_PICKER.b
  picker.querySelector('#color-picker-hex').value = COLOR_PICKER.hex
}
function initColorPicker () {
  COLOR_PICKER.r = COLOR_PAL[0]
  COLOR_PICKER.g = COLOR_PAL[1]
  COLOR_PICKER.a = COLOR_PAL[2]

  COLOR_PICKER.hex = RGBToHex(COLOR_PICKER.r, COLOR_PICKER.g, COLOR_PICKER.b)

  updateColorPicker()
}

CANVAS = {
  w: 0,
  h: 0,
  curr: { x: 0, y: 0 },
  start: { x: 0, y: 0 },
  prev: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
  mouseDown: false,
  customSelection: false,
  isSelected: false,
  zoom: 4
}

const CANVAS_DOM = document.querySelector('#main-canvas')

// INIT CANVAS
const canvas = document.querySelector('#main-canvas')
const CANVAS_CONTAINER = document.querySelector('#canvas-container')
const ctx = canvas.getContext('2d')

function timelineInit (total) {
	$.FRAMES = []

	let i = 1
	while (i < 50) {
    $.FRAMES[i] = undefined
    i += 1
  }

  $.FRAMES[0] = new Uint8Array(total * 36)
  CURR_FRAME = $.FRAMES[0]

	// Fill out layers metadata state array
	for (let i = 0; i < 32; i++) {
		if (i === 31) {
			$.LAYERS[i] = { name: 'Layer 1', hidden: false, locked: false }
		} else {
			$.LAYERS[i] = { name: undefined, hidden: undefined, locked: undefined }
		}
	}

	timelineUpdate()
}

function timelineUpdate () {
	// FRAMES TILES UPDATE
	const frameWrapper = document.querySelector("#tl-frames")

  let framesLen = framesGetLength()
  let layersLen = layersGetLength()
  let f = 0
  let l = 0

  FRAMES_CANVAS.style.width = `${framesLen * 30}px`
  FRAMES_CANVAS.style.height = `${layersLen * 25}px`

  FRAMES_CANVAS.width = framesLen * 60
  FRAMES_CANVAS.height = layersLen * 50

  while (f < framesLen) {
    l = 0

    frameWrapper.children[f].style.display = 'block'
		if (f === $.frameActive) {
			frameWrapper.children[f].style.background = 'rgb(110, 110, 110)'
		} else {
			frameWrapper.children[f].style.background = ''
		}

    while (l < layersLen) {
      FRAMES_CTX.fillStyle = 'rgba(61, 61, 61)'
      // Color gray to active layer row , active frame column
      if (f === $.frameActive || l === ($.layerActive - 31 + layersLen - 1)) { // screwy math to reverse the order of the layers tracking
        FRAMES_CTX.fillStyle = 'rgba(110, 110, 110)'
      }

      if (f === UI.curr.x && l === UI.curr.y) { // screwy math to reverse the order of the layers tracking
        FRAMES_CTX.fillStyle = 'rgba(110, 110, 110)'
      }

      // Blue to active drawing frame
      if (f === $.frameActive && l === ($.layerActive - 31 + layersLen - 1)) {
        FRAMES_CTX.fillStyle = 'rgba(81, 151, 213)'
      }

      FRAMES_CTX.fillRect((f * 60) + 2, (l * 50) + 2, 60 - 2, 50 - 2)
      l++
    }
    f++
  }

	// Set remaining frames to hidden
  while (f < 50) {
    frameWrapper.children[f].style.display = 'none'
    f++
  }

	// LAYERS UPDATE
	const layerWrapper = document.querySelector("#tl-layers")

	for (let i = $.LAYERS.length - 1; i >= 0 ; i--) {
		if ($.LAYERS[i].name !== undefined && $.LAYERS[i].hidden !== undefined && $.LAYERS[i].locked !== undefined) {
			layerWrapper.children[i].style.display = 'flex'

			if ($.layerActive === i) {
				layerWrapper.children[i].style.background = 'rgb(110, 110, 110)'
			} else {
				layerWrapper.children[i].style.background = 'transparent'
			}

			layerWrapper.children[i].querySelector(`[data-name="name"]`).innerText = $.LAYERS[i].name
			layerWrapper.children[i].querySelector(`[data-name="lock"]`).src = $.LAYERS[i].locked ? 'img/lock.svg' : 'img/unlock.svg'
			layerWrapper.children[i].querySelector(`[data-name="lock"]`).parentNode.style.background = $.LAYERS[i].locked ? 'rgb(81, 151, 213)' : ''
			layerWrapper.children[i].querySelector(`[data-name="hide"]`).src = $.LAYERS[i].hidden ? 'img/eye-active.svg' : 'img/eye.svg'
			layerWrapper.children[i].querySelector(`[data-name="hide"]`).parentNode.style.background = $.LAYERS[i].hidden ? 'rgb(81, 151, 213)' : ''
		} else {
			layerWrapper.children[i].style.display = 'none'
			//layerWrapper.children[i].querySelector(`[data-name="name"]`).classList.remove('active')
		}
	}
}

function canvasInit (w, h) {
	resetState()

  CANVAS.w = w || parseInt(document.querySelector('#modal #create-w').value) || 0
  CANVAS.h = h || parseInt(document.querySelector('#modal #create-h').value) || 0
  CANVAS.l = CANVAS.w * CANVAS.h

  pixelBuffer = new ImageData(CANVAS.w, CANVAS.h)
  pixelResTotal = CANVAS.l
  CANVAS.pixelResTotal = CANVAS.l
  // canvas preview buffer
  emptyPrevBuffer = new Int16Array(pixelResTotal)
  previewBuffer = new Int16Array(pixelResTotal)
  // canvas selection buffer
  emptySelBuffer = new Int16Array(pixelResTotal * 3)
  selectionBuffer = new Int16Array(pixelResTotal * 3)
  // canvas final draw buffer
  buf = new ArrayBuffer(pixelBuffer.data.length)
  buf8 = new Uint8ClampedArray(buf)
  buf32 = new Uint32Array(buf)

  timelineInit(pixelResTotal)

  // scale the canvas to be just short of the height of the view window
  const containerHeight = parseInt(window.getComputedStyle(CANVAS_CONTAINER.parentNode).height.replace('px', '')) - 100
  CANVAS.scaleRatio = (containerHeight / CANVAS.h) * CANVAS.zoom

  const wrapper = CANVAS_CONTAINER

  wrapper.style.minWidth = `${CANVAS.w * CANVAS.scaleRatio + 20}px`
  wrapper.style.minHeight = `${CANVAS.h * CANVAS.scaleRatio + 20}px`

  for (let i = 0; i < wrapper.children.length; i++) {
    wrapper.children[i].width = CANVAS.w
    wrapper.children[i].height = CANVAS.h

    wrapper.children[i].style.width = `${CANVAS.w * CANVAS.scaleRatio}px`
    wrapper.children[i].style.height = `${CANVAS.h * CANVAS.scaleRatio}px`
    wrapper.children[i].style.transformOrigin = `center center`
    wrapper.children[i].style.transform = `scale(${1 / CANVAS.zoom})`
    wrapper.children[i].style.cursor = 'crosshair'
  }

  // Center canvas
  wrapper.parentNode.scrollLeft = ((CANVAS.w * CANVAS.scaleRatio) / 2) - (wrapper.parentNode.offsetWidth / 2) + 20
  wrapper.parentNode.scrollTop = ((CANVAS.h * CANVAS.scaleRatio) / 2) - (wrapper.parentNode.offsetHeight / 2) + 20

	drawTransparencyBG()
  modalClose(undefined, 'create')
}

function getBlendedColorAtPt (x, y) {
  const i = x + CANVAS.w * y
  return CURR_FRAME[(i * 36) + $.layerActive] + 4
}
function getColorAtPt (x, y) {
  const i = x + CANVAS.w * y
  return CURR_FRAME[(i * 36) + $.layerActive]
}
function setCanvasIndex (pixelIndex, colorIndex) {
  const offset = pixelIndex * 36
  CURR_FRAME[offset + $.layerActive] = colorIndex
  if (colorIndex === 0) {
    CURR_FRAME[offset + 32 + (~~($.layerActive / 8))] &= ~(128 >> ($.layerActive & 7))
  } else {
    CURR_FRAME[offset + 32 + (~~($.layerActive / 8))] |= (128 >> ($.layerActive & 7))
  }
}
function setSelectedPoint (x, y, color) {
  const pixI = x + CANVAS.w * y

  setCanvasIndex(pixI, 0) // when lifting to selection buffer, 0 out the actual canvas to prep for move

  const index = pixI * 3
  selectionBuffer[index] = color
  selectionBuffer[index + 1] = x
  selectionBuffer[index + 2] = y
}
function setPreviewPoint (x, y, color, blended) {
  const index = x + CANVAS.w * y
  previewBuffer[index] = color
}
function setCanvasPoint (x, y, color) {
  const index = x + CANVAS.w * y
  setCanvasIndex(index, color)
}

function line (action, start, end, color) {
  previewBuffer.set(emptyPrevBuffer)

  let dx = Math.abs(end.x - start.x)
  let dy = Math.abs(end.y - start.y)

  let xDir = end.x - start.x >= 0 ? 1 : -1
  let yDir = end.y - start.y >= 0 ? 1 : -1

  let i = 0
  let lineX = start.x
  let lineY = start.y

  let xStep = 0
  let yStep = 0

  let step = dx >= dy ? dx : dy

  dx = dx / step
  dy = dy / step

  while (i < step) {
    if (action === 'preview') setPreviewPoint(Math.floor(lineX), Math.floor(lineY), color)
    if (action === 'print') setCanvasPoint(Math.floor(lineX), Math.floor(lineY), color)

    lineX += (dx * xDir)
    lineY += (dy * yDir)
    i += 1
  }

  if (action === 'preview') setPreviewPoint(end.x, end.y, color)
  if (action === 'print') setCanvasPoint(end.x, end.y, color)
}
function square (action, start, end, color) {
  previewBuffer.set(emptyPrevBuffer)

  let points = []

  let dx = Math.abs(end.x - start.x)
  let dy = Math.abs(end.y - start.y)

  let xDir = end.x - start.x >= 0 ? 1 : -1
  let yDir = end.y - start.y >= 0 ? 1 : -1

  let i = 0
  let lineX = start.x
  let lineY = start.y

  if (action === 'preview') setPreviewPoint(start.x, start.y, color)
  if (action === 'print') setCanvasPoint(start.x, start.y, color)

  while (i < dx) {
    lineX += (1 * xDir)
    if (action === 'preview') {
      setPreviewPoint(lineX, start.y, color)
      setPreviewPoint(lineX, (start.y + (dy * yDir)), color)
    }
    if (action === 'print') {
      setCanvasPoint(lineX, start.y, color)
      setCanvasPoint(lineX, (start.y + (dy * yDir)), color)
    }
    i += 1
  }

  i = 0

  while (i < dy) {
    lineY += (1 * yDir)
    if (action === 'preview') {
      setPreviewPoint(start.x, lineY, color)
      setPreviewPoint((start.x + (dx * xDir)), lineY, color)
    }
    if (action === 'print') {
      setCanvasPoint(start.x, lineY, color)
      setCanvasPoint((start.x + (dx * xDir)), lineY, color)
    }
    i += 1
  }
}
function squareSolid (action, start, end, color) {
  //
  previewBuffer.set(emptyPrevBuffer)

  let dx = Math.abs(end.x - start.x)
  let dy = Math.abs(end.y - start.y)

  let xDir = end.x - start.x >= 0 ? 1 : -1
  let yDir = end.y - start.y >= 0 ? 1 : -1

  let lineX = start.x
  let lineY = start.y

  let xStep = 0
  let yStep = 0

  while (xStep <= dx) {
    yStep = 0
    lineY = start.y

    while (yStep <= dy) {
      if (action === 'preview') setPreviewPoint(lineX, lineY, color)
      if (action === 'print') setCanvasPoint(lineX, lineY, color)
      if (action === 'selection') {
        setPreviewPoint(lineX, lineY, getBlendedColorAtPt(lineX, lineY))
      }

      lineY += (1 * yDir)
      yStep += 1
    }

    lineX += (1 * xDir)
    xStep += 1
  }
}

function selectionLift (start, end) {
  // lift to selection buffer
  previewBuffer.set(emptyPrevBuffer)

  let dx = Math.abs(end.x - start.x)
  let dy = Math.abs(end.y - start.y)

  let xDir = end.x - start.x >= 0 ? 1 : -1
  let yDir = end.y - start.y >= 0 ? 1 : -1

  let lineX = start.x
  let lineY = start.y

  let xStep = 0
  let yStep = 0

  while (xStep <= dx) {
    yStep = 0
    lineY = start.y

    while (yStep <= dy) {
      setPreviewPoint(lineX, lineY, getBlendedColorAtPt(lineX, lineY))
      setSelectedPoint(lineX, lineY, getBlendedColorAtPt(lineX, lineY))

      lineY += (1 * yDir)
      yStep += 1
    }

    lineX += (1 * xDir)
    xStep += 1
  }
}
function selectionTranslate (xStep, yStep) {
  // translate selection buffer, write to preview buffer
  previewBuffer.set(emptyPrevBuffer)

  for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx += 3) {
    selectionBuffer[idx + 1] += xStep
    selectionBuffer[idx + 2] += yStep


    const x = selectionBuffer[idx + 1]
    const y = selectionBuffer[idx + 2]

    // If the selection buffer index is empty, just get the blended existing color in the frame, otherwise use the color in the buffer
    //const c = selectionBuffer[idx] === 4 ? getBlendedColorAtPt(x, y) : selectionBuffer[idx]
    const c = selectionBuffer[idx]

    if (x >= 0 && x < CANVAS.w && y >= 0 && y < CANVAS.h) {
      setPreviewPoint (x, y, c)
    }
  }
}
function selectionWrite () {
  previewBuffer.set(emptyPrevBuffer)

  for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx += 3) {
    const x = selectionBuffer[idx + 1]
    const y = selectionBuffer[idx + 2]

    // If the selection buffer index is empty, just get the existing color in the frame, otherwise get the unblended the color in the buffer
    //const c = selectionBuffer[idx] === 4 ? getColorAtPt(x, y) : selectionBuffer[idx] - 4
    if (selectionBuffer[idx] !== 4 && selectionBuffer[idx] !== 0) {
      const c = selectionBuffer[idx] - 4

      if (x >= 0 && x < CANVAS.w && y >= 0 && y < CANVAS.h) {
        setCanvasPoint (x, y, c)
      }
    }
  }

  selectionBuffer.set(emptySelBuffer)
  CANVAS.customSelection = false
  CANVAS.isSelected = false
}

CANVAS_DOM.addEventListener('mousemove', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', canvasPaint)
CANVAS_DOM.addEventListener('mouseup', canvasPaint)
CANVAS_DOM.addEventListener('mouseleave', canvasPaint)

function canvasPaint (e) {
  if (e.type === 'mousedown' && e.target.id !== 'main-canvas') {
    return
  }

  if (CANVAS.mouseDown && e.type === 'mouseleave') {
    return
  }

  if ($.LAYERS[$.layerActive].locked || $.LAYERS[$.layerActive].hidden) {
    CANVAS_DOM.style.cursor = 'not-allowed'
    return
  } else {
    CANVAS_DOM.style.cursor = 'crosshair'
  }

  CANVAS.prev.x = CANVAS.curr.x
  CANVAS.prev.y = CANVAS.curr.y
  CANVAS.curr.x = Math.floor(e.offsetX / CANVAS.scaleRatio)
  CANVAS.curr.y = Math.floor(e.offsetY / CANVAS.scaleRatio)

  CANVAS.end.x = CANVAS.curr.x
  CANVAS.end.y = CANVAS.curr.y

  // Hover
  // CANVAS.activeHover = CANVAS.curr.x + CANVAS.w * CANVAS.curr.y
  //
  // if (e.type === 'mouseleave') {
  //   CANVAS.activeHover = -1
  // }

  if (e.type === 'mousedown') {
    CANVAS.mouseDown = true
    CANVAS.start.x = CANVAS.curr.x
    CANVAS.start.y = CANVAS.curr.y
  }

  if ($.toolActive === 'pencil' || $.toolActive === 'eraser') {
    const color = $.toolActive === 'pencil' ? $.colorActive : 0

    if (CANVAS.mouseDown) {
      make('line', CANVAS.prev, CANVAS.curr).forEach(pt => {
        const pixelIndex = pt.x + CANVAS.w * pt.y
        setCanvasIndex(pixelIndex, color)
      })
    }
  }

  if ($.toolActive === 'line' || $.toolActive === 'square' || $.toolActive === 'circle' ) {
    let distance = 0

    if ($.toolActive === 'circle') {
      distance = dist(CANVAS.start.x, CANVAS.end.x, CANVAS.start.y, CANVAS.end.y)
    }

    if (CANVAS.mouseDown) {
      if ($.toolActive === 'line') line('preview', CANVAS.start, CANVAS.end, $.colorActive)
      if ($.toolActive === 'square') square('preview', CANVAS.start, CANVAS.end, $.colorActive)
    }
  }

  if ($.toolActive === 'select') {
    if (e.type === 'mousedown') {
      CANVAS.isSelected = true
      squareSolid('selection', CANVAS.start, CANVAS.end)
    }

    if (CANVAS.mouseDown) {
      squareSolid('selection', CANVAS.start, CANVAS.end)
    }
  }

  else if ($.toolActive === 'move') {
    CANVAS_DOM.style.cursor = 'move'

    const xStep = CANVAS.end.x - CANVAS.prev.x
    const yStep = CANVAS.end.y - CANVAS.prev.y

    if (e.type === 'mousedown') {
      if (!CANVAS.customSelection) {
        CANVAS.isSelected = true
        selectionLift({ x: 0, y: 0 }, { x: CANVAS.w - 1, y: CANVAS.h - 1 })
      }
    }

    if (CANVAS.mouseDown) {
      selectionTranslate(xStep, yStep)
    }
  }
}
function canvasGetTopColor (pixelIndex, offset) {
  let index = -1, v

  if (CURR_FRAME[offset + 32] !== 0) {
    v = CURR_FRAME[offset + 32]|0 // make sure its an integer
    index = 0
  } else if (CURR_FRAME[offset + 33] !== 0) {
    v = CURR_FRAME[offset + 33]|0
    index = 8
  } else if (CURR_FRAME[offset + 34] !== 0) {
    v = CURR_FRAME[offset + 34]|0
    index = 16
  } else if (CURR_FRAME[offset + 35] !== 0) {
    v = CURR_FRAME[offset + 35]|0
    index = 24
  }

  if ((v >> 4) !== 0) {
    if ((v & 128) !== 0) index += 0 // to set the first bit: v |= 128, CURR_FRAME[0] = colorIndex
    else if ((v & 64) !== 0) index += 1 // to set the second: v |= 64, CURR_FRAME[1] = colorIndex
    else if ((v & 32) !== 0) index += 2
    else if ((v & 16) !== 0) index += 3
  } else {
    if ((v & 8) !== 0) index += 4
    else if ((v & 4) !== 0) index += 5
    else if ((v & 2) !== 0) index += 6
    else if ((v & 1) !== 0) index += 7
  }

  return index
}
function canvasSetBuf32 (pixel, color) {
  buf32[pixel] =
   (COLORS[color + 3] << 24) |    // alpha
   (COLORS[color + 2] << 16) |    // blue
   (COLORS[color + 1] <<  8) |    // green
    COLORS[color];
}
function canvasDraw () {
  let toggle = 0

  let colorPrev = 0
  let colorMain = 0
  let colorVisible = 0

  let pixel = 0
  let idx = 0
  let activeHover = -1

  // Draw final frame buffer
  function draw () {
    toggle = toggle === 0 ? 1 : 0

    if (toggle === 1) {
      requestAnimationFrame(draw)
      return
    }

    pixel = 0
    pixel36 = 0

    //console.time('draw loop')
    while (pixel < pixelResTotal) {
      colorVisible = canvasGetTopColor(pixel, pixel36)
      colorPrev = previewBuffer[pixel]

      if (colorPrev === 0 && colorVisible === -1) {
        canvasSetBuf32(pixel, 0)
      } else if (colorPrev === 4 && colorVisible === -1) {
        canvasSetBuf32(pixel, 4)
      } else {
        colorMain = CURR_FRAME[pixel36 + colorVisible] // step 1: grab index of first visible layer // if (colorMain === 1) console.log('possible bug here')

        canvasSetBuf32(pixel, colorMain)

        // Preview is being written directly to by translated selection so
        // if there is a color at this preview index, write the preview color
        // else if there is no color at preview index, write blended version of what the point is in the frame
        if (colorPrev !== 0 && colorPrev !== 4 && ($.layerActive <= colorVisible || colorVisible === -1)) {
          canvasSetBuf32(pixel, colorPrev)
        } else if (colorPrev !== 0 && colorPrev === 4 && ($.layerActive <= colorVisible || colorVisible === -1)) {
          canvasSetBuf32(pixel, colorMain + 4)
        }
      }

      pixel += 1
      pixel36 += 36
    }

    canvasSetBuf32(CANVAS.activeHover, $.colorActive)

    //console.timeEnd('draw loop')

    pixelBuffer.data.set(buf8);
    ctx.putImageData(pixelBuffer, 0, 0)

    requestAnimationFrame(draw)
  }

  draw()
}

function canvasZoomIn () {
  if (CANVAS.zoom === 1) return

  CANVAS.zoom /= 2

  CANVAS_CONTAINER.children[0].style.transform = `scale(${1 / CANVAS.zoom})`
  CANVAS_CONTAINER.children[1].style.transform = `scale(${1 / CANVAS.zoom})`
}
function canvasZoomOut () {
  if (CANVAS.zoom === 16) return

  CANVAS.zoom *= 2

  CANVAS_CONTAINER.children[0].style.transform = `scale(${1 / CANVAS.zoom})`
  CANVAS_CONTAINER.children[1].style.transform = `scale(${1 / CANVAS.zoom})`

  CANVAS_CONTAINER.parentNode.scrollLeft = ((CANVAS.w * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.parentNode.offsetWidth / 2) + 20
  CANVAS_CONTAINER.parentNode.scrollTop = ((CANVAS.h * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.parentNode.offsetHeight / 2) + 20
}

function layersGetLength () {
  let a = 0
  for (let i = $.LAYERS.length - 1; i >= 0 ; i--) {
    if ($.LAYERS[i].name === undefined && $.LAYERS[i].hidden === undefined && $.LAYERS[i].locked === undefined) {
      return a
    }
    a++
  }
}
function layersSetActive (event, i) {
  $.layerActive = event ? parseInt(event.target.dataset.i) : i

  timelineUpdate()
}
function layersAdd () {
  for (let i = $.LAYERS.length - 1; i >= 0 ; i--) {
    if ($.LAYERS[i].name === undefined && $.LAYERS[i].hidden === undefined && $.LAYERS[i].locked === undefined) {
      $.LAYERS[i].name = `Layer ${Math.abs(i - $.LAYERS.length)}`
      $.LAYERS[i].hidden = false
      $.LAYERS[i].locked = false

      timelineUpdate()

      return
    }
  }

  console.log('max layers hit')
}
function layersHide (e) {
  const index = parseInt(e.target.dataset.i)
  $.LAYERS[index].hidden = !$.LAYERS[index].hidden

  const hidden = $.LAYERS[index].hidden

  for (let i = 0; i < pixelResTotal; i++) {
    const offset = i * 36

    // Only toggle spots with color, otherwise we toggle empty indexes as well with no color
    if (hidden && CURR_FRAME[offset + index] > 19) {
      CURR_FRAME[offset + 32 + (~~(index / 8))] &= ~(128 >> (index & 7))
    }

    if (!hidden && CURR_FRAME[offset + index] > 19) {
      CURR_FRAME[offset + 32 + (~~(index / 8))] |= (128 >> (index & 7))
    }
  }

  timelineUpdate()
}
function layersLock (e) {
  const index = parseInt(e.target.dataset.i)
  $.LAYERS[index].locked = !$.LAYERS[index].locked

  timelineUpdate()
}
function layersSwap (i1, i2) {
  // swap temp refs in layers arr
  const temp = $.LAYERS[i1]
  $.LAYERS[i1] = $.LAYERS[i2]
  $.LAYERS[i2] = temp

  for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx+=36) { // for every pixel
    // swap the respective i1, i2 layer index colors
    const temp = CURR_FRAME[idx + i1]
    CURR_FRAME[idx + i1] = CURR_FRAME[idx + i2]
    CURR_FRAME[idx + i2] = temp

    // for every color byte, if there is a number greater than 0 at this index, set respective bit to 1, otherwise set to 0
    for (var i = 0; i < 32; i++) {
      if (CURR_FRAME[idx + i] === 0) {
        CURR_FRAME[idx + 32 + (~~(i / 8))] &= ~(128 >> (i & 7)) // flip down
      } else {
        CURR_FRAME[idx + 32 + (~~(i / 8))] |= (128 >> (i & 7)) // flip up
      }
    }
  }

  timelineUpdate()
}
function layersInsertFromTo(from, to) {
  if ($.LAYERS[from].name === undefined && $.LAYERS[from].hidden === undefined && $.LAYERS[from].locked === undefined) {
    return
  }

  if ($.LAYERS[to].name === undefined && $.LAYERS[to].hidden === undefined && $.LAYERS[to].locked === undefined) {
    return
  }

  if (from === to) return

  // if from is less than to, its going up so
  if (from < to) {
    // swap with every next plus index after from until we've completed to
    for (let i = from; i < to; i++) {
      layersSwap(i, i + 1)
    }
  }

  // if from is greater than to, we're going down
  if (from > to) {
    // swap with every next index minus 1 until to is reached
    for (let i = from; i > to; i--) {
      layersSwap(i, i - 1)
    }
  }

  timelineUpdate()
}
function layersDelete (e, index) {
  const i = e ? $.layerActive : index

  if ($.LAYERS[i].name === undefined && $.LAYERS[i].hidden === undefined && $.LAYERS[i].locked === undefined) {
    return
  }

  let last
  // If there there is layer above, so index minus 1
  if ($.LAYERS[i - 1].name !== undefined || $.LAYERS[i - 1].hidden !== undefined || $.LAYERS[i - 1].locked !== undefined) {
    // End is first layer index minus 1 that has all undefined
    for (var a = 31; a >= 0; a--) {
      if ($.LAYERS[a].name === undefined && $.LAYERS[a].hidden === undefined && $.LAYERS[a].locked === undefined) {
        last = a + 1
        break
      }
    }

    layersInsertFromTo(i, last) // push this layer to the end
  } else {
    // Otherwise just delete curr index
    last = i
    $.layerActive = i === 31 ? 31 : i + 1 // it only one element, keep layeractive current, otherwise ,move it up one
  }

  // Then, delete it
  $.LAYERS[last].name = last === 31 ? 'Layer 1' : undefined
  $.LAYERS[last].hidden = last === 31 ? false : undefined
  $.LAYERS[last].locked = last === 31 ? false : undefined

  // For every pixel, set this particular layer index to 0 and flip the flag down
  for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx+=36) {
    CURR_FRAME[idx + last] = 0
    CURR_FRAME[idx + 32 + (~~(last / 8))] &= ~(128 >> (last & 7))
  }

  timelineUpdate()
}
function layersRename (e) {
  // TODO: fix this query selector, lazy
  const newName = document.querySelector('#rename-new-name').value

  $.LAYERS[$.layerActive].name = newName

  modalClose(undefined, 'rename')
  timelineUpdate()
}

const FRAMES_CANVAS = document.querySelector('#tl-cells-canvas')
const FRAMES_CTX = FRAMES_CANVAS.getContext('2d')

function framesSetActive (i) {
	$.frameActive = i

  CURR_FRAME = $.FRAMES[$.frameActive]

  timelineUpdate()
}
function framesSetActiveDOM (e) {
	const i = parseInt(e.target.dataset.i)
	framesSetActive(i)
}
function framesGetLength () {
  let a = 0
  while (a <= $.FRAMES.length) {
    if ($.FRAMES[a] === undefined) {
      return a
    }
    a++
  }
}
function framesSwap (i1, i2) {
  // swap temp refs in layers arr
  const temp = $.FRAMES[i1]
  $.FRAMES[i1] = $.FRAMES[i2]
  $.FRAMES[i2] = temp

  timelineUpdate()
}
function framesAdd () {
  if ($.FRAMES[$.frameActive + 1] === undefined) {
    // If frame is last, just set next to empty array
    $.FRAMES[$.frameActive + 1] = new Uint8Array(CANVAS.pixelResTotal * 36)
    framesSetActive($.frameActive + 1)
  } else {
    // If frame is in middle, swap every frame starting from the end to this index and assign this undefined spot to an empty array
    let i = framesGetLength()
    while (i > $.frameActive + 1) {
      framesSwap(i, i - 1)
      i--
    }

    $.FRAMES[i] = new Uint8Array(CANVAS.pixelResTotal * 36)
    framesSetActive(i)
  }

  timelineUpdate()
}
function framesDelete (e, index) {
  const i = e ? $.frameActive : index

  // if out of range in fixed array, just ignore
  if ($.FRAMES[i] === undefined) {
    return
  }

  let last = framesGetLength()
  // If there there is layer above, so index minus 1
  if ($.FRAMES[i + 1] !== undefined) {
    // End is first layer index minus 1 that has all undefined
    $.FRAMES[i] = undefined

    let track = i

    while (track < last) {
      framesSwap(track, track + 1)
      track += 1
    }
  } else {
    // Otherwise just delete curr index
    $.FRAMES[i] = i === 0 ? new Uint8Array(CANVAS.pixelResTotal * 36) : undefined
    framesSetActive(i === 0 ? 0 : i - 1) // it only one element, keep layeractive current, otherwise ,move it up one
  }

  timelineUpdate()
}
function framesDuplicate () {
  framesAdd()

  const length = $.FRAMES[$.frameActive].length
  let i = 0

  while (i < length) {
    $.FRAMES[$.frameActive][i] = $.FRAMES[$.frameActive - 1][i]
    i++
  }
}
function framesNext (event) {
  if (event && $.isPlaying === 1) return // prevent button click during animation

  const next = ($.frameActive + 1) % framesGetLength()
  framesSetActive(next)
}
function framesPrevious (event) {
  if (event && $.isPlaying === 1) return // prevent button click during animation

  const prev = $.frameActive - 1 === -1 ? (framesGetLength() - 1) : $.frameActive - 1
  framesSetActive(prev)
}

function stop() {
  $.isPlaying = 0
  clearTimeout($.timeout)
}
function play() {
  function loop() {
    $.isPlaying = 1
    framesNext()
    $.timeout = setTimeout(loop, 100)
  }
  loop()
}
function togglePlay (e) {

  if (framesGetLength() === 1) return

  if ($.isPlaying === 1) {
    stop()
    e.target.children[0].src = 'img/play.svg'
  } else {
    play()
    e.target.children[0].src = 'img/stop.svg'
  }
}

window.addEventListener('mousedown', handleWindowEvents, false)
window.addEventListener('mousemove', handleWindowEvents, false)
window.addEventListener('mouseup', handleWindowEvents, false)
window.addEventListener('dblclick', handleWindowEvents, false)

let UI = {
  mouseDown: false,
  start: -1,
  end: -1,
  curr: { x: -30, y: -25 },
  prev: { x: -30, y: -25 }
}

function handleWindowEvents (e) {
  if (e.type === 'mousedown') {
    UI.mouseDown = true
  }

  // If over timeline, set hover
  if (e.target.id === 'tl-cells-canvas') {
    UI.prev.x = UI.curr.x
    UI.prev.y = UI.curr.y
    UI.curr.x = Math.floor(e.offsetX / 30)
    UI.curr.y = Math.floor(e.offsetY / 25)

    timelineUpdate()
  } else {
    if (UI.curr.x !== -30 && UI.curr.y !== -25) { // onleave
      UI.prev.x = -30
      UI.prev.y = -25
      UI.curr.x = -30
      UI.curr.y = -25

      timelineUpdate()
    }
  }


	if (e.target.hasAttribute('data-tllayers') && e.type === 'dblclick') {
		modalOpen(undefined, 'rename')
	}

  if (e.type === 'mouseup') {
		if (e.target.id === 'tl-cells-canvas') {
	    framesSetActive(UI.curr.x)
	    layersSetActive(undefined, 31 - (layersGetLength() - 1) + UI.curr.y )
	  }
    // TODO: clean flag below to be tied to window
    if (!CANVAS.mouseDown) return

    if ($.LAYERS[$.layerActive].locked || $.LAYERS[$.layerActive].hidden) {
       return
    }

    if ($.toolActive === 'line' || $.toolActive === 'square' || $.toolActive === 'circle') {
      if ($.toolActive === 'line') line('print', CANVAS.start, CANVAS.end, $.colorActive)
      if ($.toolActive === 'square') square('print', CANVAS.start, CANVAS.end, $.colorActive)
    }

    if ($.toolActive === 'move' && CANVAS.isSelected) {
      selectionWrite()
    }

    if ($.toolActive === 'select') {
      selectionLift(CANVAS.start, CANVAS.end)
      CANVAS.customSelection = true
      setToolActive(undefined, 'move')
    }

    CANVAS.mouseDown = false
  }
}

function drawTransparencyBG () {

  const canvasBG = document.querySelector('#bg-canvas')
  const ctxBG = canvasBG.getContext('2d')

	// Draw Transparency layer
	for (let x = 0; x < CANVAS.w; x++) {
		for (let y = 0; y < CANVAS.h; y++) {
			if (y % 2 === 0) {
				if (x % 2 === 0) {
					ctxBG.fillStyle = `rgb(${COLORS[8]}, ${COLORS[8]}, ${COLORS[8]})`
					ctxBG.fillRect(x, y, 1, 1)
				} else {
					ctxBG.fillStyle = `rgb(${COLORS[12]}, ${COLORS[12]}, ${COLORS[12]})`
					ctxBG.fillRect(x, y, 1, 1)
				}
			} else if (x % 2 !== 0) {
				ctxBG.fillStyle = `rgb(${COLORS[8]}, ${COLORS[8]}, ${COLORS[8]})`
				ctxBG.fillRect(x, y, 1, 1)
			} else {
				ctxBG.fillStyle = `rgb(${COLORS[12]}, ${COLORS[12]}, ${COLORS[12]})`
				ctxBG.fillRect(x, y, 1, 1)
			}
		}
	}
}
function initFramesDOM () {
	const frameTemplate = document.querySelector("#tl-frames-button")
	const frameWrapper = document.querySelector("#tl-frames")

	let i = 1
	while (i < 50) {
		const clone = frameTemplate.cloneNode(true)
		clone.setAttribute('data-frameindex', i)
		clone.style.display = 'none'
		clone.setAttribute('data-i', i)
		clone.innerText = i + 1

		frameWrapper.appendChild(clone, frameWrapper.children[0])

		i += 1
	}
}
function initLayersDOM () {
	// Insert DOM placeholders
	const layerTemplate = document.querySelector("[data-layerindex='31']")
	const layerWrapper = document.querySelector("#tl-layers")

	for (let i = 30; i >= 0; i--) {
		const clone = layerTemplate.cloneNode(true)
		clone.setAttribute('data-layerindex', i)
		clone.style.display = 'none'

		for (let a = 0; a < clone.children.length; a++) {
			clone.children[a].setAttribute('data-i', i)
		}

		layerWrapper.insertBefore(clone, layerWrapper.children[0])
	}
}

function main () {
	initLayersDOM()
	initFramesDOM()
	initColorPicker()

  canvasInit(50, 50)
  canvasDraw()
}

main()
