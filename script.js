function hexAToRGBA(h) { // https://css-tricks.com/converting-color-spaces-in-javascript/
  let r = 0, g = 0, b = 0, a = 1;

  r = "0x" + h[1] + h[2];
  g = "0x" + h[3] + h[4];
  b = "0x" + h[5] + h[6];
  a = "0x" + h[7] + h[8];
  a = (+(a / 255).toFixed(3)) || 255;

  return "rgba(" + +r + "," + +g + "," + +b + "," + a + ")";
}
function createElement (tag, attrs, text) {
  const elem = document.createElement(tag)

  if (attrs) {
    for (attr in attrs) elem.setAttribute(attr, attrs[attr])
  }

  if (text) elem.append(document.createTextNode(text))

  return elem
}
function make (action, start, end) {
  let points = []

  let dx = Math.abs(end.x - start.x)
  let dy = Math.abs(end.y - start.y)

  let xDir = end.x - start.x >= 0 ? 1 : -1
  let yDir = end.y - start.y >= 0 ? 1 : -1

  let i = 0
  let lineX = start.x
  let lineY = start.y

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
    points.push({ x: start.x, y: start.y, color: i % 2 === 0 ? 'rgba(255, 255, 255, 255)' : 'rgba(0, 0, 0, 255)' })

    while (i < dx) {
      lineX += (1 * xDir)
      points.push({ x: lineX, y: start.y, color: i % 2 === 0 ? 'rgba(255, 255, 255, 255)' : 'rgba(0, 0, 0, 255)' })
      points.push({ x: lineX, y: start.y + (dy * yDir), color: i % 2 === 0 ? 'rgba(255, 255, 255, 255)' : 'rgba(0, 0, 0, 255)' })
      i += 1
    }

    i = 0

    while (i < dy) {
      lineY += (1 * yDir)
      points.push({ y: lineY, x: start.x, color: i % 2 === 0 ? 'rgba(255, 255, 255, 255)' : 'rgba(0, 0, 0, 255)' })
      points.push({ y: lineY, x: start.x + (dx * xDir), color: i % 2 === 0 ? 'rgba(255, 255, 255, 255)' : 'rgba(0, 0, 0, 255)' })
      i += 1
    }
  }

  return points
}

function squareFilled (start, end) {
  let points = []

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
      points.push({ x: lineX, y: lineY })

      lineY += (1 * yDir)
      yStep += 1
    }

    lineX += (1 * xDir)
    xStep += 1
  }

  return points
}
function paintBucket (start, pixelArr, targetColor) {
  const width = CANVAS.w
  const height = CANVAS.h

  let points = []

  function floodFill (x, y, prevC, newC) {
    if (y >= height || y === -1 || x >= width || x === -1) {
      return
    }

    if (prevC === newC) {
      return
    } else if (pixelArr[x + CANVAS.w * y] !== prevC) {
      return
    }

    pixelArr[x + CANVAS.w * y] = newC

    floodFill(x + 1, y, prevC, newC)  // then i can either go south
    floodFill(x - 1, y, prevC, newC)  // or north
    floodFill(x, y + 1, prevC, newC)  // or east
    floodFill(x, y - 1, prevC, newC)  // or west
  }

  floodFill(start.x, start.y, pixelArr[start.x + CANVAS.w * start.y], targetColor)

  return points
}
function getDist (x1, x2, y1, y2) {
  return Math.floor(Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)))
}
function circle (xc, yc, r) { // Function for circle-generation using Bresenham's algorithm
    let x = 0
    let y = r
    let d = 3 - 2 * r

    let pts = []

    pts.push({ x: xc+x, y: yc+y })
    pts.push({ x: xc-x, y: yc+y })
    pts.push({ x: xc+x, y: yc-y })
    pts.push({ x: xc-x, y: yc-y })
    pts.push({ x: xc+y, y: yc+x })
    pts.push({ x: xc-y, y: yc+x })
    pts.push({ x: xc+y, y: yc-x })
    pts.push({ x: xc-y, y: yc-x })

    while (y >= x) { // for each pixel we will draw all eight pixels
      x++;

      // check for decision parameter and correspondingly update d, x, y
      if (d > 0) {
          y--
          d = d + 4 * (x - y) + 10
      } else {
        d = d + 4 * x + 6
      }

      pts.push({ x: xc+x, y: yc+y })
      pts.push({ x: xc-x, y: yc+y })
      pts.push({ x: xc+x, y: yc-y })
      pts.push({ x: xc-x, y: yc-y })
      pts.push({ x: xc+y, y: yc+x })
      pts.push({ x: xc-y, y: yc+x })
      pts.push({ x: xc+y, y: yc-x })
      pts.push({ x: xc-y, y: yc-x })
    }

    return pts
}

const $ = {
  history: [],
  framePreview: undefined,
  animFrames: [[[]]],
  canvasWidth: 100,
  timeline: {
    isPlaying: 0,
    activeFrame: 0,
    activeLayer: 0,
    layers: [{ name: 'Layer 1', hidden: false, locked: false }]
  },
  toolsActive: 0,
  tools: ['pencil', 'eraser', 'line', 'paintbucket', 'square', 'circle', 'move', 'select'],
  colorsActive: 0,
  colors: ['rgba(246, 229, 141, 255)', 'rgba(255, 190, 118, 255)', 'rgba(255, 121, 121, 255)', 'rgba(186, 220, 88, 255)', 'rgba(223, 249, 251, 255)', 'rgba(249, 202, 36, 255)', 'rgba(240, 147, 43, 255)', 'rgba(235, 77, 75, 255)', 'rgba(106, 176, 76, 255)', 'rgba(106, 176, 76, 255)', 'rgba(199, 236, 238, 255)', 'rgba(126, 214, 223, 255)', 'rgba(224, 86, 253, 255)', 'rgba(104, 109, 224, 255)', 'rgba(104, 109, 224, 255)', 'rgba(104, 109, 224, 255)', 'rgba(48, 51, 107, 255)', 'rgba(149, 175, 192, 255)', 'rgba(34, 166, 179, 255)', 'rgba(190, 46, 221, 255)', 'rgba(72, 52, 212, 255)', 'rgba(19, 15, 64, 255)', 'rgba(19, 15, 64, 255)', 'rgba(83, 92, 104, 255)'],
  timeout: undefined
}

function cloneAnimState () {
  let newAnimFrames = []

  $.animFrames.forEach((frame, frameI) => {
    newAnimFrames[frameI] = []
    frame.forEach((layer, layerI) => {
      newAnimFrames[frameI][layerI] = $.animFrames[frameI][layerI].slice()
    })
  })

  return newAnimFrames
}
function historyReset () {
  if ($.currUndo <= $.history.length - 1) {
    let newHistory = []

    for (let i = 0; i < $.currUndo; i++) newHistory[i] = $.history[i]

    $.history = newHistory

    historyPush()
    $.currUndo--
  }

  // canvasDraw()
}
function historyPush () {
  $.history.push(cloneAnimState())

  $.currUndo = $.currUndo + 1 || 0
}
function historyUndo () {
  $.prevTool = $.tools[$.toolsActive]

  const prev = $.currUndo - 1

  if ($.history[prev]) {
    $.animFrames = $.history[prev]
    $.currUndo--

    if ($.tools[$.toolsActive] === 'move' || $.tools[$.toolsActive] === 'select') {
      CANVAS.selected = []
      CANVAS.framePreview = []
    }
  }

  // TODO: this is a hack to prevent bugs on frame undo, need to mirror state in undo's
  if ($.timeline.activeFrame === $.animFrames[0].length) $.timeline.activeFrame -= 1

  // canvasDraw()
}
function historyRedo () {
  const next = $.currUndo + 1

  if ($.history[next]) {
    $.animFrames = $.history[next]
    $.currUndo++
  }

  // canvasDraw()
}

let icons = {}
const iconList = ['lock', 'eye', 'pencil', 'eraser', 'line', 'paintbucket', 'square', 'play', 'pause', 'nextframe', 'lastframe', 'x']
iconList.forEach(name => {
  const img = new Image();
  img.src = `img/${name}.svg`;
  icons[name] = img
})

const COLOR_LIGHT = 'rgb(61, 61, 61)'
const COLOR_HOVER = '#6e6e6e'
const COLOR_HILITE = 'rgb(72, 72, 72)'
const COLOR_ACTIVE = '#3498db'
const COLOR_DARK = '#282828'

const font = '22px -apple-system, BlinkMacSystemFont'
const color = 'rgb(236, 236, 236)'

function draw_text(ctx, text, x, y, style) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = style.align
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
}

const TL_CANVAS = document.querySelector('#tl-cells-canvas')
const TL_CANVAS_CTX = TL_CANVAS.getContext('2d')

const TL_FRAMES_CANVAS = document.querySelector('#tl-frames-canvas')
const TL_FRAMES_CTX = TL_FRAMES_CANVAS.getContext('2d')

const TL_LAYERS = document.querySelector('#tl-layers')
const TL_CELLS = document.querySelector('#tl-cells')
const TL_FRAMES = document.querySelector('#tl-frames')

const cellHeight = 25 // TL Constants
const cellWidth = 30
const canv_w = cellWidth * 2
const canv_h = cellHeight * 2

let TL = {
  curr_y: -1,
  curr_x: -1
}

function timelineBindListeners () {

  // Mirror scrolling on multiple canvases
  TL_CELLS_ACTIVE = 0
  TL_CELLS.addEventListener('mouseover', (e) => { TL_CELLS_ACTIVE = 1 })
  TL_CELLS.addEventListener('mouseleave', (e) => { TL_CELLS_ACTIVE = 0 })
  TL_CELLS.addEventListener('scroll', (e) => {
    if (TL_CELLS_ACTIVE !== 1) return
    TL_FRAMES.scrollLeft = e.target.scrollLeft
    TL_LAYERS.scrollTop = e.target.scrollTop
  })

  TL_LAYERS_ACTIVE = 0
  TL_LAYERS.addEventListener('mouseover', (e) => { TL_LAYERS_ACTIVE = 1 })
  TL_LAYERS.addEventListener('mouseleave', (e) => { TL_LAYERS_ACTIVE = 0 })
  TL_LAYERS.addEventListener('scroll', (e) => {
    if (TL_LAYERS_ACTIVE === 1) TL_CELLS.scrollTop = e.target.scrollTop
  })

  TL_FRAMES_ACTIVE = 0
  TL_FRAMES.addEventListener('mouseover', (e) => { TL_FRAMES_ACTIVE = 1 })
  TL_FRAMES.addEventListener('mouseleave', (e) => { TL_FRAMES_ACTIVE = 0 })
  TL_FRAMES.addEventListener('scroll', (e) => {
    if (TL_FRAMES_ACTIVE === 1) TL_CELLS.scrollLeft = e.target.scrollLeft
  })

  // Selection/Mouse listeners
  TL_CANVAS.addEventListener('mousemove', (e) => {
    TL.curr_y = Math.floor(e.offsetY / cellHeight)
    TL.curr_x = Math.floor(e.offsetX / cellWidth)
  })

  TL_CANVAS.addEventListener('mouseleave', (e) => {
    TL.curr_y = -5
    TL.curr_x = -5
  })

  TL_CANVAS.addEventListener('click', (e) => {
    $.timeline.activeFrame = TL.curr_x
    $.timeline.activeLayer = TL.curr_y

    timelineLayersUpdate()
  })

  TL_FRAMES.addEventListener('click', (e) => {
    $.timeline.activeFrame = Math.floor(e.offsetX / cellWidth)
  })
}
function timelineLayersUpdate () {
  for (let i = 0; i < 30; i++) {
    TL_LAYERS.children[i].style.display = 'none'
    TL_LAYERS.children[i].style.background = 'transparent'

    if ($.timeline.layers[i]) {
      TL_LAYERS.children[i].querySelector('[data-name="lock"]').src = $.timeline.layers[i].locked ? `img/lock.svg` : `img/unlock.svg`
      TL_LAYERS.children[i].querySelector('[data-name="eye"]').src = $.timeline.layers[i].hidden ? `img/eye.svg` : `img/eye-active.svg`
      TL_LAYERS.children[i].querySelector('[data-type="name"]').innerText = $.timeline.layers[i].name
    }
  }

  for (let i = 0; i < 30; i++) {
    if ($.timeline.layers[i]) {
      TL_LAYERS.children[i].style.display = 'flex'
      if (i === $.timeline.activeLayer) TL_LAYERS.children[i].style.background = COLOR_HILITE
    }
  }

  // if (CANVAS.w) // canvasDraw()

}
function timelineUpdate () {
  const w = $.animFrames.length
  const h = $.animFrames[0].length

  function setAttrs (canv, w, h, canvW, canvH) {
    canv.setAttribute('style', `width: ${w}px; height: ${h}px;`)
    canv.setAttribute('width', canvW)
    canv.setAttribute('height', canvH)
  }

  setAttrs(TL_CANVAS, w * cellWidth, h * cellHeight, w * cellWidth * 2, h * cellHeight * 2)
  setAttrs(TL_FRAMES_CANVAS, w * cellWidth, 30, w * cellWidth * 2, 60)
}
function timelineDraw () {
  TL_CANVAS_CTX.clearRect(0, 0, TL_CANVAS.width, TL_CANVAS.height)
  TL_FRAMES_CTX.clearRect(0, 0, TL_FRAMES_CANVAS.width, TL_FRAMES_CANVAS.height)

  // Draw Frames
  $.animFrames.forEach((frame, row) => {
    if (row === $.timeline.activeFrame) {
      TL_FRAMES_CTX.fillStyle = COLOR_HILITE
      TL_FRAMES_CTX.fillRect(row * 60, 0, 60, 60)
    }
    const centerX = (row * canv_w) + canv_w / 2
    draw_text(TL_FRAMES_CTX, row + 1, centerX, 30, { align: 'center' })
  })

  // Draw Grid
  $.animFrames.forEach((frame, row) => {
    frame.forEach((layer, col) => {
      // Borders
      TL_CANVAS_CTX.strokeStyle = 'rgba(94,94,94)';
      TL_CANVAS_CTX.lineWidth = 1;
      TL_CANVAS_CTX.strokeRect(row * canv_w, col * canv_h, canv_w, canv_h)

      const x = row * canv_w
      const y = col * canv_h

      // Highlight active layer/column/cell
      TL_CANVAS_CTX.fillStyle = 'transparent'
      if (row === $.timeline.activeFrame || col === $.timeline.activeLayer) TL_CANVAS_CTX.fillStyle = COLOR_HILITE
      if (row === $.timeline.activeFrame && col === $.timeline.activeLayer) TL_CANVAS_CTX.fillStyle = COLOR_ACTIVE

      TL_CANVAS_CTX.fillRect(x, y, canv_w, canv_h)
    })
  })

  // Hover
  TL_CANVAS_CTX.fillStyle = COLOR_HOVER
  TL_CANVAS_CTX.fillRect(TL.curr_x * canv_w, TL.curr_y * canv_h, canv_w, canv_h)

  if (TL.curr_x === $.timeline.activeFrame && TL.curr_y === $.timeline.activeLayer) {
    TL_CANVAS_CTX.strokeStyle = COLOR_ACTIVE
    TL_CANVAS_CTX.lineWidth = 5;
    TL_CANVAS_CTX.strokeRect((TL.curr_x * canv_w) + 2, (TL.curr_y * canv_h) + 2, canv_w - 4, canv_h - 4)
  }
}
function renameLayer (e) {
  const newName = MODAL_DOM.querySelector('#rename-new-name').value

  $.timeline.layers[$.timeline.activeLayer].name = newName

  modalClose()
  timelineLayersUpdate()
}
function newLayer () {
  historyReset()

  const nextLayerNum = $.animFrames[0].length + 1
  $.timeline.layers.unshift({ name: `Layer ${nextLayerNum}`, locked: false, hidden: false })
  $.animFrames.forEach(frame => {
    frame.unshift(canvasInitGrid())
  })

  historyPush()

  timelineLayersUpdate()
  timelineUpdate()
}
function newFrame () {
  historyReset()

  const numOfLayers = $.animFrames[0].length
  $.animFrames[$.animFrames.length] = []

  for (let i = 0; i < numOfLayers; i++) {
    const copy = $.animFrames[$.animFrames.length - 2][i].slice()
    $.animFrames[$.animFrames.length - 1][i] = copy
  }

  historyPush()

  timelineUpdate()
  nextFrame()
}

function nextFrame () {
  $.timeline.activeFrame = ($.timeline.activeFrame + 1) % $.animFrames.length
  canvasDraw()
}
function prevFrame () {
  $.timeline.activeFrame = $.timeline.activeFrame - 1 === -1 ? $.animFrames.length - 1 : $.timeline.activeFrame - 1
  canvasDraw()
}

function stop() {
  $.timeline.isPlaying = 0
  clearTimeout($.timeout)
}
function play() {
  function loop() {
    $.timeline.isPlaying = 1
    nextFrame()
    $.timeout = setTimeout(loop, 100)
  }
  loop()
}
function togglePlay () {
  if ($.timeline.isPlaying === 1) stop()
  else {
    play()
  }
}

function download() {
  const CANVAS_DOM_DOWNLOAD = document.querySelector('#canvas-to-download')
  const CANVAS_CTX_DOWNLOAD = CANVAS_DOM_DOWNLOAD.getContext('2d')

  CANVAS_DOM_DOWNLOAD.width = CANVAS.w
  CANVAS_DOM_DOWNLOAD.height = CANVAS.h

  CANVAS_CTX_DOWNLOAD.clearRect(0, 0, CANVAS.w, CANVAS.h)

  const length = CANVAS.length
  const currFrame = $.animFrames[$.timeline.activeFrame]
  const numOfLayers = $.animFrames[$.timeline.activeFrame].length
  const toDraw = []
  const emptyImage = new ImageData(CANVAS.w, CANVAS.h)

  // Flatten the layers
  for (let a = numOfLayers - 1; a >= 0; a--) {
    const layer = currFrame[a]

    if ($.timeline.layers[a].hidden) continue // skip drawing anything that's hidden

    // Take the color and assign to existin array overwriting anything that exists already
    for (let b = 0; b < length; b++) {
      if (layer[b]) toDraw[b] = layer[b]
    }
  }

  for (let b = 0; b < toDraw.length; b++) {
    if (!toDraw[b]) continue

    const i = b * 4
    const rgb = toDraw[b].replace('rgba(', '').replace(')', '').split(',')


    emptyImage.data[i] = parseInt(rgb[0])
    emptyImage.data[i + 1] = parseInt(rgb[1])
    emptyImage.data[i + 2] = parseInt(rgb[2])
    emptyImage.data[i + 3] = parseInt(rgb[3])
  }

  CANVAS_CTX_DOWNLOAD.putImageData(emptyImage, 0, 0);

  const downloadBtn = document.querySelector("#download");
  const image = CANVAS_DOM_DOWNLOAD.toDataURL("image/png").replace("image/png", "image/octet-stream");
  downloadBtn.setAttribute("href", image);
}

const MODAL_DOM = document.querySelector('.modals')

function modalClose() {
  MODAL_DOM.classList.remove('disp')
  MODAL_DOM.querySelector('#create').style.display = 'none'
  MODAL_DOM.querySelector('#rename').style.display = 'none'
}
function modalOpenCreate () {
  MODAL_DOM.classList.add('disp')
  MODAL_DOM.querySelector('#create').style.display = 'block'
}
function modalOpenRename () {
  MODAL_DOM.classList.add('disp')
  MODAL_DOM.querySelector('#rename').style.display = 'block'
}

function toggleActive (group, index, stateRef) {
  group.children[$[stateRef]].classList.remove('active')
  $[stateRef] = parseInt(index)
  group.children[$[stateRef]].classList.add('active')
}

const CANVAS_CONTAINER = document.querySelector('#canvas-container')
const CANVAS_DOM = document.querySelector('#main-canvas')
const CANVAS_CTX = CANVAS_DOM.getContext('2d')

CANVAS_DOM.addEventListener('mousemove', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', canvasPaint)
CANVAS_DOM.addEventListener('mouseup', canvasPaint)
CANVAS_DOM.addEventListener('mouseleave', canvasPaint)
CANVAS_DOM.addEventListener('mouseenter', canvasPaint)
CANVAS_DOM.parentNode.addEventListener('mousedown', (e) => {
  CANVAS.mouseDown = true
})
CANVAS_DOM.parentNode.addEventListener('mouseup', (e) => {
  CANVAS.mouseDown = false
})
CANVAS_DOM.parentNode.addEventListener('mouseleave', (e) => {
  CANVAS.mouseDown = false
})

CANVAS = {
  w: 0,
  h: 0,
  length: 0,
  scaleRatio: 0,
  zoom: 4,
  bgData: undefined,
  finalData: undefined,
  prevData: [],
  framePreview: [],
  frameHover: [],
  mouseDown: false,
  selected: [],
  curr: { x: 0, y: 0 },
  start: { x: 0, y: 0 },
  prev: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
}

function canvasZoomIn () {
  if (CANVAS.zoom === 1) return

  CANVAS.zoom /= 2

  CANVAS_DOM.style.transform = `scale(${1 / CANVAS.zoom})`
}
function canvasZoomOut () {
  if (CANVAS.zoom === 16) return

  CANVAS.zoom *= 2

  CANVAS_DOM.style.transform = `scale(${1 / CANVAS.zoom})`

  CANVAS_CONTAINER.scrollLeft = ((CANVAS.w * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.offsetWidth / 2)
  CANVAS_CONTAINER.scrollTop = ((CANVAS.h * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.offsetHeight / 2) + 20
}
function canvasSetPreview (points) {
  for (let i = 0; i < CANVAS.framePreview.length; i++) {
    CANVAS.framePreview[i] = undefined
  }

  points.forEach(point => {
    CANVAS.framePreview[point.x + CANVAS.w * point.y] = $.colors[$.colorsActive]
  })
}
function canvasInit (w, h) {
  //
  CANVAS.w = w || parseInt(MODAL_DOM.querySelector('#create-w').value) || 0
  CANVAS.h = h || parseInt(MODAL_DOM.querySelector('#create-h').value) || 0
  CANVAS.length = CANVAS.w * CANVAS.h

  const containerHeight = parseInt(window.getComputedStyle(CANVAS_CONTAINER).height.replace('px', '')) - 100
  CANVAS.scaleRatio = (containerHeight / CANVAS.h) * CANVAS.zoom

  CANVAS_DOM.width = CANVAS.w
  CANVAS_DOM.height = CANVAS.h

  CANVAS_DOM.style.width = `${CANVAS.w * CANVAS.scaleRatio}px`
  CANVAS_DOM.style.height = `${CANVAS.h * CANVAS.scaleRatio}px`
  CANVAS_DOM.style.background = 'rgb(211, 211, 211)'
  CANVAS_DOM.style.transformOrigin = `center center`
  CANVAS_DOM.style.transform = `scale(${1 / CANVAS.zoom})`
  CANVAS_DOM.style.cursor = 'crosshair'

  CANVAS_CONTAINER.children[0].style.minWidth = `${CANVAS.w * CANVAS.scaleRatio + 40}px`
  CANVAS_CONTAINER.children[0].style.minHeight = `${CANVAS.h * CANVAS.scaleRatio + 40}px`

  // Center canvas
  CANVAS_CONTAINER.scrollLeft = ((CANVAS.w * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.offsetWidth / 2)
  CANVAS_CONTAINER.scrollTop = ((CANVAS.h * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.offsetHeight / 2) + 20

  CANVAS.bgData = new ImageData(CANVAS.w, CANVAS.h);
  CANVAS.finalData = new ImageData(CANVAS.w, CANVAS.h);

  let pixelIndex = 0

  // Setup BG transparency grid
  for (let val = 0; val < (CANVAS.length * 4); val += 4) {
    const x = Math.floor(pixelIndex % CANVAS.w)
    const y = Math.floor(pixelIndex / CANVAS.w)

    // DRAW TRANSPARENCY LAYER
    let paintBGTile = false
    if (y % 2 === 0) {
      if (x % 2 === 0) paintBGTile = true
    } else if (x % 2 !== 0) {
      paintBGTile = true
    }

    if (paintBGTile) {
      CANVAS.bgData.data[val] = 128
      CANVAS.bgData.data[val + 1] = 128
      CANVAS.bgData.data[val + 2] = 128
      CANVAS.bgData.data[val + 3] = 255
    }

    pixelIndex++
  }

  // TODO: prep to remove when supports multiple canvases, just erasers project for now
  $.animFrames = [[[]]]
  $.timeline.layers = []
  $.timeline.layers = [{ name: 'Layer 1', hidden: false, locked: false }]
  timelineUpdate()
  timelineLayersUpdate()

  $.animFrames[$.timeline.activeFrame][$.timeline.activeLayer] = canvasInitGrid()

  CANVAS.prevFrameVals = canvasInitGrid()
  CANVAS.framePreview = canvasInitGrid()
  CANVAS.frameHover = canvasInitGrid()

  modalClose()
  historyPush()

  canvasDraw()

  drawAll()
}
function canvasWriteSelected () {
  CANVAS.selected.forEach(pt => {
    const newX = pt.x
    const newY = pt.y
    const newIndex = newX + CANVAS.w * newY

    if (CANVAS.framePreview[newIndex]) canvasPutPixel(newX, newY, CANVAS.framePreview[newIndex])
  })

  CANVAS.framePreview = []
  CANVAS.selected = []

  // canvasDraw()
}
function canvasPutPixel (x, y, color) {
  const i = x + CANVAS.w * y

  $.animFrames.forEach((frame, frameI) => {
    frame[$.timeline.activeLayer][i] = color
  })
}
function canvasPutPixelPreview (x, y, color) {
  const i = x + CANVAS.w * y
  CANVAS.framePreview[x + CANVAS.w * y] = color
}
function canvasPaint (e) {
  // Prevent draw on hidden/locked layers. TODO: make a small modal next to cursor as reminder.
  if ($.timeline.layers[$.timeline.activeLayer].locked || $.timeline.layers[$.timeline.activeLayer].hidden) {
    CANVAS_DOM.style.cursor = 'not-allowed'
    return
  } else if ($.tools[$.toolsActive] === 'move') {
    CANVAS_DOM.style.cursor = 'move'
  } else if (CANVAS_DOM.style.cursor !== 'crosshair') {
    CANVAS_DOM.style.cursor = 'crosshair'
  }

  CANVAS.prev.x = CANVAS.curr.x
  CANVAS.prev.y = CANVAS.curr.y
  CANVAS.curr.x = Math.floor(e.offsetX / CANVAS.scaleRatio)
  CANVAS.curr.y = Math.floor(e.offsetY / CANVAS.scaleRatio)
  CANVAS.end.x = CANVAS.curr.x
  CANVAS.end.y = CANVAS.curr.y

  if ($.tools[$.toolsActive] !== 'eraser') {
    canvasPutPixelPreview(CANVAS.prev.x, CANVAS.prev.y, undefined)
    canvasPutPixelPreview(CANVAS.curr.x, CANVAS.curr.y, $.colors[$.colorsActive])
  }


  if (e.type === 'mousedown') {
    historyReset()

    CANVAS.mouseDown = true
    CANVAS.start.x = CANVAS.curr.x
    CANVAS.start.y = CANVAS.curr.y

    if (CANVAS.selected.length > 0 && $.tools[$.toolsActive] !== 'select' && $.tools[$.toolsActive] !== 'move') {
      canvasWriteSelected()
    }
  }

  if (e.type === 'mouseup') {
    CANVAS.mouseDown = false
  }

  const activeTool = $.tools[$.toolsActive]
  const activeColor = $.colors[$.colorsActive]

  if (activeTool === 'pencil' || activeTool === 'eraser') {
    const c = activeTool === 'pencil' ? activeColor : undefined

    if (e.type === 'mousedown') canvasPutPixel(CANVAS.curr.x, CANVAS.curr.y, c)

    if (e.type === 'mousemove' && CANVAS.mouseDown) {
      make('line', CANVAS.prev, CANVAS.curr).forEach(pt => {
        canvasPutPixel(pt.x, pt.y, c)
      })
    }

    if (e.type === 'mouseup') {
      historyPush()
    }
  }

  if (activeTool === 'line') {
    if (CANVAS.mouseDown && e.type === 'mousemove') {
      const preview = make('line', CANVAS.start, CANVAS.end)
      canvasSetPreview(preview)
    }

    if (e.type === 'mouseup') {
      canvasSetPreview([])
      make('line', CANVAS.start, CANVAS.end).forEach(pt => {
        canvasPutPixel(pt.x, pt.y, activeColor)
      })

      historyPush()
    }
  }

  if (activeTool === 'paintbucket' && e.type === 'mouseup') {
    paintBucket(CANVAS.start, $.animFrames[$.timeline.activeFrame][$.timeline.activeLayer], activeColor)

    historyPush()
  }

  if (activeTool === 'square') {
    if (CANVAS.mouseDown && e.type === 'mousemove') {
      const preview = make('square', CANVAS.start, CANVAS.end)
      canvasSetPreview(preview)
    }

    if (e.type === 'mouseup') {
      canvasSetPreview([])
      make('square', CANVAS.start, CANVAS.end).forEach(pt => {
        canvasPutPixel(pt.x, pt.y, activeColor)
      })

      historyPush()
    }
  }

  if (activeTool === 'circle') {
    const dist = getDist(CANVAS.start.x, CANVAS.end.x, CANVAS.start.y, CANVAS.end.y)

    if (CANVAS.mouseDown && e.type === 'mousemove') {
      const preview = circle(CANVAS.start.x, CANVAS.start.y, dist)
      canvasSetPreview(preview)
    }

    if (e.type === 'mouseup') {
      canvasSetPreview([])
      circle(CANVAS.start.x, CANVAS.start.y, dist).forEach(pt => {
        canvasPutPixel(pt.x, pt.y, activeColor)
      })
    }
  }

  if (CANVAS.selected.length > 0 && !CANVAS.mouseDown) {
    let withinBounds = false

    for (let i = 0; i < CANVAS.selected.length; i++) {
      if (CANVAS.curr.x === CANVAS.selected[i].x && CANVAS.curr.y === CANVAS.selected[i].y) {
        withinBounds = true
      }
    }

    if (withinBounds && $.tools[$.toolsActive] !== 'move') {
      toggleActive(tools, $.tools.indexOf('move'), 'toolsActive')
    } else if (!withinBounds && $.tools[$.toolsActive] === 'move') {
      toggleActive(tools, $.tools.indexOf('select'), 'toolsActive')
    }
  }

  if (activeTool === 'select') {
    if (e.type === 'mousedown' && CANVAS.selected.length > 0) {
      canvasWriteSelected()
    }

    if (CANVAS.mouseDown && e.type === 'mousemove') {
      canvasSetPreview([])

      const TL = { x: CANVAS.start.x - 1, y: CANVAS.start.y - 1 }
      const BR = { x: CANVAS.end.x + 1, y: CANVAS.end.y + 1 }
      const boundaries = make('square', TL, BR)

      boundaries.forEach((pt, i) => {
        canvasPutPixelPreview(pt.x, pt.y, pt.color)
      })
    }

    if (e.type === 'mouseup') {
      historyPush() // TODO: causes bug to have an extra undo where select was placed but removed when undo'ed back to

      const selected = squareFilled(CANVAS.start, CANVAS.end)

      selected.forEach((pt, i) => {
        CANVAS.selected.push({ x: pt.x, y: pt.y })

        // Life color from canvas to preview
        const index = pt.x + CANVAS.w * pt.y
        const color = $.animFrames[$.timeline.activeFrame][$.timeline.activeLayer][index]

        canvasPutPixel(pt.x, pt.y, undefined)
        canvasPutPixelPreview(pt.x, pt.y, color)
      })
    }
  }

  if (activeTool === 'move') {
    const currCanvCopy = $.animFrames[$.timeline.activeFrame][$.timeline.activeLayer].slice()

    const xStep = CANVAS.end.x - CANVAS.prev.x
    const yStep = CANVAS.end.y - CANVAS.prev.y

    if (e.type === 'mousedown') {
      historyPush()

      const historyLatest = $.history[$.history.length - 2][$.timeline.activeFrame][$.timeline.activeLayer]

      // Print the preview to history
      CANVAS.selected.forEach(pt => {
        const index = pt.x + CANVAS.w * pt.y

        if (CANVAS.framePreview[index]) {
          historyLatest[index] = CANVAS.framePreview[index]

          console.log(historyLatest[index])
        }
      })
    }

    if (CANVAS.selected.length === 0 && CANVAS.mouseDown && e.type === 'mousemove') {
      $.animFrames[$.timeline.activeFrame][$.timeline.activeLayer].forEach((pixelColor, i) => {
        const x = Math.floor(i % CANVAS.w)
        const y = Math.floor(i / CANVAS.w)

        const newIndex = (x + xStep) + CANVAS.w * (y + yStep)

        currCanvCopy[newIndex] = pixelColor

        $.animFrames[$.timeline.activeFrame][$.timeline.activeLayer] = currCanvCopy
      })
    }

    if (CANVAS.selected.length > 0) {
      if (CANVAS.mouseDown && e.type === 'mousemove') {
        const newPreview = []
        const newSelected = []

        // Move frame preview to new position each mousemove event
        CANVAS.framePreview.forEach((pixelColor, i) => {
          const x = Math.floor(i % CANVAS.w)
          const y = Math.floor(i / CANVAS.w)

          const newIndex = (x + xStep) + CANVAS.w * (y + yStep)

          newPreview[newIndex] = pixelColor
        })

        // Move selected pixels to new position each mousemove event
        CANVAS.selected.forEach(pt => {
          const newX = pt.x + xStep // Get new positions
          const newY = pt.y + yStep // Get new positions
          newSelected.push({ x: newX, y: newY })
        })

        CANVAS.selected = []
        CANVAS.selected = newSelected
        CANVAS.framePreview = []
        CANVAS.framePreview = newPreview
      }
    }
  }

  canvasDraw()
}
function canvasDraw () {
  const length = CANVAS.length
  const currFrame = $.animFrames[$.timeline.activeFrame]
  const numOfLayers = $.animFrames[$.timeline.activeFrame].length
  const toDraw = []

  for (let b = 0; b < length; b++) {
    toDraw[b] = undefined
  }

  // Flatten the layers
  for (let a = numOfLayers - 1; a >= 0; a--) {
    const layer = currFrame[a]

    if ($.timeline.layers[a].hidden) {
      continue // skip drawing anything that's hidden
    }

    // Take the color and assign to existin array overwriting anything that exists already
    for (let b = 0; b < length; b++) {
      if (layer[b]) toDraw[b] = layer[b]
    }

    if (a === $.timeline.activeLayer) {
      for (let b = 0; b < length; b++) {
        if (CANVAS.framePreview[b]) toDraw[b] = CANVAS.framePreview[b]
      }
    }
  }

  for (let b = 0; b < length; b++) {
    if (CANVAS.frameHover[b]) toDraw[b] = CANVAS.frameHover[b]
  }

  console.time('Write Buffer');

  for (let b = 0; b < toDraw.length; b++) {
    const i = b * 4

    CANVAS.finalData.data[i] = CANVAS.bgData.data[i]
    CANVAS.finalData.data[i + 1] = CANVAS.bgData.data[i + 1]
    CANVAS.finalData.data[i + 2] = CANVAS.bgData.data[i + 2]
    CANVAS.finalData.data[i + 3] = CANVAS.bgData.data[i + 3]

    if (toDraw[b]) {
      const rgb = toDraw[b].replace('rgba(', '').replace(')', '').split(',')

      CANVAS.finalData.data[i] = parseInt(rgb[0])
      CANVAS.finalData.data[i + 1] = parseInt(rgb[1])
      CANVAS.finalData.data[i + 2] = parseInt(rgb[2])
      CANVAS.finalData.data[i + 3] = parseInt(rgb[3])
    }
  }

  console.timeEnd('Write Buffer');

  CANVAS_CTX.putImageData(CANVAS.finalData, 0, 0);

}
function canvasInitGrid () {
  const empty = []
  const length = CANVAS.length

  for (let i = 0; i < length; i++) empty[i] = undefined

  return empty
}

function initColors () {
  const colors = document.querySelector('#colors')
  const colorsActive = document.querySelector('#colors-active')
  const colorsPicker = document.querySelector('#colors-picker')

  colorsActive.addEventListener('click', (e) => {
    colorsPicker.click()
  })

  colorsPicker.addEventListener('change', (e) => {
    $.colors[$.colorsActive] = hexAToRGBA(e.target.value)

    colors.children[$.colorsActive].style.background =  e.target.value
    colorsActive.style.background = $.colors[$.colorsActive]
  })

  colorsActive.style.background = $.colors[$.colorsActive]

  for (let i = 0; i < 35; i++) {
    const btn = createElement('div', {
      'class': `clickable w-30 h-30 colors-btn ${i === $.colorsActive && 'active'}`,
      'style': `background: ${$.colors[i] || 'gray'};`,
      'data-index': `${i}`
    })

    btn.addEventListener('click', (e) => {
      toggleActive(colors, e.target.dataset.index, 'colorsActive')
      colorsActive.style.background = $.colors[$.colorsActive] || 'gray'
    })

    colors.append(btn)
  }
}
function initTools () {
  const tools = document.querySelector('#tools')

  $.tools.forEach((tool, i) => {
    const btn = createElement('button', {
      'class': `w-full h-30 w-30 tools-btn hover ${i === $.colorsActive ? 'active' : ''}`,
      'data-index': `${i}`
    })

    const img = createElement('img', { 'src': `img/${tool}.svg`, 'style': 'height: 13px; pointer-events: none;' })

    btn.addEventListener('click', (e) => {
      toggleActive(tools, e.target.dataset.index, 'toolsActive')
    })

    btn.append(img)
    tools.append(btn)
  })
}
function initTimeline () {
  // INIT PLAY/PAUSE
  const playPause = document.querySelector('#play-pause')

  playPause.append(icons['play'])
  playPause.children[0].setAttribute('style', 'height: 13px; pointer-events: none;')
  playPause.append(icons['pause'])
  playPause.children[1].setAttribute('style', 'height: 13px; pointer-events: none;')

  playPause.addEventListener('click', (e) => {
    e.target.classList = $.timeline.isPlaying ? 'stop-active' : 'play-active'
  })

  let mousedown = 0
  let start = 0
  let end = 0

  // INIT layers and their respective logic
  const list = TL_LAYERS.children

  TL_LAYERS.addEventListener('mousedown', (e) => {
    mousedown = 1
    start = parseInt(e.target.dataset.i)
    end = parseInt(e.target.dataset.i)
  })

  TL_LAYERS.addEventListener('mouseup', (e) => {
    mousedown = 0

    for (let i = 0; i <= list.length; i++) {
      if (list[i]) list[i].style.boxShadow = 'none'
    }

    // Swap pos's in both layers object and animation frames
    let temp = $.timeline.layers[start]
    $.timeline.layers[start] =  $.timeline.layers[end]
    $.timeline.layers[end] = temp

    $.animFrames.forEach(frame => {
      let temp = frame[start]
      frame[start] =  frame[end]
      frame[end] = temp
    })

    timelineLayersUpdate()
  })

  TL_LAYERS.addEventListener('mousemove', (e) => {
    if (mousedown === 1) {
      if (!e.target.dataset.i) return

      const index = parseInt(e.target.dataset.i)
      const list = e.target.parentNode.parentNode.children
      end = index

      for (let i = 0; i < list.length; i++) {
        if (list[i]) list[i].style.boxShadow = ''
      }

      e.target.parentNode.style.boxShadow = 'inset 0px -1px 0px 0px white'
    }
  })

  TL_LAYERS.addEventListener('mouseleave', (e) => {
    mousedown = 0
    for (let i = 0; i <= list.length; i++) {
      if (list[i]) list[i].style.boxShadow = 'none'
    }
  })

  for (let i = 0; i < 30; i++) {
    const div = createElement('div', { 'data-layerindex': i, 'class': 'fl h-25' })

    const layerBtns = [
      { name: 'eye', img: 'eye-active.svg', attr: 'hidden', domElem: undefined },
      { name: 'lock', img: 'unlock.svg', attr: 'locked', domElem: undefined }
    ]

    layerBtns.forEach(layer => {
      const name = createElement('img', { 'src': `img/${layer.img}`, 'data-name': layer.name, 'style': 'pointer-events: none;'})
      const nameBtn = createElement('button', { 'data-i': i })

      nameBtn.addEventListener('click', (e) => {
        const index = e.target.dataset.i
        $.timeline.layers[index][layer.attr] = !$.timeline.layers[index][layer.attr]
        timelineLayersUpdate()
      })

      nameBtn.append(name)

      layer.domElem = nameBtn
    })

    const nameBtn = createElement('button', { 'data-i': i, 'data-type': 'name', 'style': 'text-align: left;', 'class': 'w-full', 'text': 'No Name' })

    nameBtn.addEventListener('mouseup', (e) => {
      const index = e.target.dataset.i
      $.timeline.activeLayer = parseInt(index)
      timelineLayersUpdate()
    })

    nameBtn.addEventListener('dblclick', (e) => {
      modalOpenRename()
    })

    layerBtns.forEach(btn => { div.append(btn.domElem) })
    div.append(nameBtn)

    TL_LAYERS.append(div)
  }

  timelineBindListeners()
  timelineLayersUpdate()
  timelineUpdate()
}

function drawAll () {
  if (CANVAS.length) {
    timelineDraw()
    //// canvasDraw()

    requestAnimationFrame(drawAll)
  }
}

window.addEventListener('keyup', (e) => {
  // TODO: log previous tool before select and move to bring back original tool
  if (e.key === 'Escape') {
    canvasWriteSelected()
  }

  if (e.key === 'Backspace') {

  }
})

window.addEventListener('click', (e) => {
  canvasDraw()
})

function initUI() {
  //
  initColors()
  initTools()
  initTimeline()
  canvasInit(50, 50)

  drawAll()
}

initUI()
