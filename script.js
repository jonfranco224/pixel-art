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

  console.log({
    r: parseInt(r1f * r2f * 255),
    g: parseInt(g1f * g2f * 255),
    b: parseInt(b1f * b2f * 255),
  })
}

let $ = {
  FRAMES: [],
  frameActive: 0,
  layerActive: 31,
  colorActive: 20,
  toolActive: 'pencil'
}

const FRAMES = []

function setToolActive (e, tool) {
  document.querySelector('#tools').querySelector(`[data-tool="${$.toolActive}"]`).classList.remove('active')
  $.toolActive = e ? e.target.dataset.tool : tool
  document.querySelector('#tools').querySelector(`[data-tool="${$.toolActive}"]`).classList.add('active')
}

function setLayerActive (e, i) {
  document.querySelector(`[data-layerindex="${$.layerActive}"]`).classList.remove('active')
  $.layerActive = e ? parseInt(e.target.dataset.i) : i
  document.querySelector(`[data-layerindex="${$.layerActive}"]`).classList.add('active')
}

function setColorActive (e, i) {
  document.querySelector(`[data-colorindex="${$.colorActive}"]`).classList.remove('active')
  $.colorActive = e ? parseInt(e.target.dataset.colorindex) : i
  document.querySelector(`[data-colorindex="${$.colorActive}"]`).classList.add('active')
}

function modalOpen (e) {
  document.querySelector(`#modal`).classList.add('visible')
  document.querySelector(`#modal #${e.target.dataset.val}`).classList.add('visible')
}

function modalClose (e, str) {
  const id = e ? e.target.dataset.val : str
  document.querySelector(`#modal`).classList.remove('visible')
  document.querySelector(`#modal #${id}`).classList.remove('visible')
}

// INIT COLORS
const bufColors = new ArrayBuffer(100)
const COLORS = new Uint8ClampedArray(bufColors)

COLORS[0] = 0 // Empty
COLORS[1] = 0
COLORS[2] = 0
COLORS[3] = 0

COLORS[4] = 75 // Selected
COLORS[5] = 75
COLORS[6] = 75
COLORS[7] = 125

COLORS[8] = 128 // Transparency 1
COLORS[9] = 128
COLORS[10] = 128
COLORS[11] = 255

COLORS[12] = 211 // Transparency 2
COLORS[13] = 211
COLORS[14] = 211
COLORS[15] = 255

COLORS[16] = 124 // Transparency Blended 2
COLORS[17] = 124
COLORS[18] = 124
COLORS[19] = 255
// Need black blend here

COLORS[20] = 0 // Green
COLORS[21] = 255
COLORS[22] = 0
COLORS[23] = 255

COLORS[24] = 0 // Green blended
COLORS[25] = 150
COLORS[26] = 0
COLORS[27] = 255

COLORS[28] = 0 // Blue
COLORS[29] = 0
COLORS[30] = 255
COLORS[31] = 255

COLORS[32] = 0 // Blue
COLORS[33] = 0
COLORS[34] = 150
COLORS[35] = 255

COLORS[36] = 255 // Red
COLORS[37] = 0
COLORS[38] = 0
COLORS[39] = 255

COLORS[40] = 150 // Red
COLORS[41] = 0
COLORS[42] = 0
COLORS[43] = 255


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
CANVAS_DOM.addEventListener('mousemove', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', canvasPaint)
CANVAS_DOM.addEventListener('mouseup', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', (e) => { CANVAS.mouseDown = true })
CANVAS_DOM.addEventListener('mouseup', (e) => { CANVAS.mouseDown = false })
CANVAS_DOM.addEventListener('mouseleave', (e) => { CANVAS.mouseDown = false })

// INIT CANVAS
const canvas = document.querySelector('#main-canvas')
const CANVAS_CONTAINER = document.querySelector('#canvas-container')
const ctx = canvas.getContext('2d')

// canvas layer/pixel buffer
let pixelBuffer, pixelResTotal;
// canvas preview buffer
let emptyPrevBuffer, previewBuffer;
// canvas selection buffer
let emptySelBuffer, selectionBuffer;
// canvas final draw buffer
let buf, buf8, buf32;

let CURR_FRAME

function canvasInit (w, h) {
  CANVAS.w = w || parseInt(document.querySelector('#modal #create-w').value) || 0
  CANVAS.h = h || parseInt(document.querySelector('#modal #create-h').value) || 0
  CANVAS.l = CANVAS.w * CANVAS.h

  pixelBuffer = new ImageData(CANVAS.w, CANVAS.h)
  pixelResTotal = CANVAS.l
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

  CURR_FRAME = new Uint8Array(pixelResTotal * 36)

  const canvasBG = document.querySelector('#bg-canvas')
  const ctxBG = canvasBG.getContext('2d')

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
  wrapper.parentNode.scrollLeft = ((CANVAS.w * CANVAS.scaleRatio) / 2) - (wrapper.parentNode.offsetWidth / 2)
  wrapper.parentNode.scrollTop = ((CANVAS.h * CANVAS.scaleRatio) / 2) - (wrapper.parentNode.offsetHeight / 2) + 20

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

  modalClose(undefined, 'create')
}

function getBlendedColorAtPt (x, y) {
  const i = (~~(x)) + CANVAS.w * (~~(y))
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

function canvasPaint (e) {

  CANVAS_DOM.style.cursor = 'default'

  CANVAS.prev.x = CANVAS.curr.x
  CANVAS.prev.y = CANVAS.curr.y
  CANVAS.curr.x = Math.floor(e.offsetX / CANVAS.scaleRatio)
  CANVAS.curr.y = Math.floor(e.offsetY / CANVAS.scaleRatio)

  CANVAS.end.x = CANVAS.curr.x
  CANVAS.end.y = CANVAS.curr.y

  if (e.type === 'mousedown') {
    CANVAS.mouseDown = true
    CANVAS.start.x = CANVAS.curr.x
    CANVAS.start.y = CANVAS.curr.y
  }

  if (e.type === 'mouseup') {
    CANVAS.mouseDown = false
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

    if (e.type === 'mouseup') {
      if ($.toolActive === 'line') line('print', CANVAS.start, CANVAS.end, $.colorActive)
      if ($.toolActive === 'square') square('print', CANVAS.start, CANVAS.end, $.colorActive)
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

    if (e.type === 'mouseup') {
      selectionLift(CANVAS.start, CANVAS.end)
      CANVAS.customSelection = true
      setToolActive(undefined, 'move')
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

    if (CANVAS.mouseDown) selectionTranslate(xStep, yStep)

    if (e.type === 'mouseup') {
      selectionWrite()
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

  if (index !== -1) {
    return index
  } else {
    return 31
  }

}
function canvasDraw () {
  let toggle = 0
  let previewColorIndex = 0
  let colorIndex = 0
  let topVisIndex = 0

  // Draw final frame buffer
  function draw () {
    toggle = toggle === 0 ? 1 : 0

    if (toggle === 1) {
      requestAnimationFrame(draw)
      return
    }

    //console.time('draw loop')
    for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx+=36) {
      topVisIndex = canvasGetTopColor(pixI, idx)
      colorIndex = CURR_FRAME[idx + topVisIndex] // step 1: grab index of first visible layer
      previewColorIndex = previewBuffer[pixI]

      buf32[pixI] =
       (COLORS[colorIndex + 3] << 24) |    // alpha
       (COLORS[colorIndex + 2] << 16) |    // blue
       (COLORS[colorIndex + 1] <<  8) |    // green
        COLORS[colorIndex];

      // Preview is being written directly to by translated selection
      // so if there is a color at this preview index, write the preview color
      if (previewColorIndex !== 0 && previewColorIndex !== 4 && ($.layerActive <= topVisIndex)) {
        buf32[pixI] =
         (COLORS[previewColorIndex + 3] << 24) |    // alpha
         (COLORS[previewColorIndex + 2] << 16) |    // blue
         (COLORS[previewColorIndex + 1] <<  8) |    // green
          COLORS[previewColorIndex];
      // if there is no color at preview index, write blended version of what the point is in the frame
      } else if (previewColorIndex === 4 && ($.layerActive <= topVisIndex)) {
        buf32[pixI] =
          (COLORS[colorIndex + 4 + 3] << 24) |    // alpha
          (COLORS[colorIndex + 4 + 2] << 16) |    // blue
          (COLORS[colorIndex + 4 + 1] <<  8) |    // green
           COLORS[colorIndex + 4];
      }
    }
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

  CANVAS_CONTAINER.parentNode.scrollLeft = ((CANVAS.w * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.parentNode.offsetWidth / 2)
  CANVAS_CONTAINER.parentNode.scrollTop = ((CANVAS.h * CANVAS.scaleRatio) / 2) - (CANVAS_CONTAINER.parentNode.offsetHeight / 2) + 20
}

function main () {
  canvasInit(50, 50)
  canvasDraw()
}

main()
