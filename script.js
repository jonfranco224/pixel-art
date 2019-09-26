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

let $ = {
  FRAMES: [],
  frameActive: 0,
  layerActive: 25,
  colorActive: 8,
  toolActive: 'pencil'
}

const FRAMES = []

function toggleActiveTool (e) {
  e.target.parentNode.querySelector(`[data-tool="${$.toolActive}"]`).classList.remove('active')
  $.toolActive = e.target.dataset.tool
  e.target.parentNode.querySelector(`[data-tool="${$.toolActive}"]`).classList.add('active')
}

// INIT COLORS
const bufColors = new ArrayBuffer(100)
const COLORS = new Uint8ClampedArray(bufColors)

COLORS[0] = 0 // Empty
COLORS[1] = 0
COLORS[2] = 0
COLORS[3] = 0

COLORS[4] = 0 // Empty
COLORS[5] = 0
COLORS[6] = 0
COLORS[7] = 255
// Need black blend here

COLORS[8] = 0 // Green
COLORS[9] = 255
COLORS[10] = 0
COLORS[11] = 255

COLORS[12] = 255 // Red
COLORS[13] = 0
COLORS[14] = 0
COLORS[15] = 255

const CANVAS_DOM = document.querySelector('#main-canvas')
CANVAS_DOM.addEventListener('mousemove', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', canvasPaint)
CANVAS_DOM.addEventListener('mouseup', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', (e) => { CANVAS.mouseDown = true })
CANVAS_DOM.addEventListener('mouseup', (e) => { CANVAS.mouseDown = false })
CANVAS_DOM.addEventListener('mouseleave', (e) => { CANVAS.mouseDown = false })

CANVAS = {
  w: 0,
  h: 0,
  curr: { x: 0, y: 0 },
  start: { x: 0, y: 0 },
  prev: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
  mouseDown: false,
  toRevertPreview: []
}

// INIT CANVAS
const canvas = document.querySelector('canvas')
const pixelResTotal = canvas.width * canvas.height
const ctx = canvas.getContext('2d')

CANVAS.w = canvas.width
CANVAS.h = canvas.height
CANVAS.buffer = new ImageData(CANVAS.w, CANVAS.h)

// canvas final draw buffer
const buf = new ArrayBuffer(CANVAS.buffer.data.length);
const buf8 = new Uint8ClampedArray(buf);
const buf32 = new Uint32Array(buf);

// canvas layer/pixel buffer
const CURR_FRAME = new Uint8Array(pixelResTotal * 36)

// canvas preview buffer
const emptyPrevBuffer = new Int16Array(pixelResTotal)
const previewBuffer = new Int16Array(pixelResTotal)

// canvas selection buffer
const emptySelBuffer = new Int16Array(pixelResTotal * 3)
const selectionBuffer = new Int16Array(pixelResTotal * 3)

function canvasSetPixel(pixelIndex, colorIndex) {
  const offset = pixelIndex * 36
  CURR_FRAME[offset + $.layerActive] = colorIndex
  if (colorIndex === 0) {
    CURR_FRAME[offset + 32 + (~~($.layerActive / 8))] &= ~(128 >> ($.layerActive & 7))
  } else {
    CURR_FRAME[offset + 32 + (~~($.layerActive / 8))] |= (128 >> ($.layerActive & 7))
  }
}

function setSelectedPoint (x, y) {
  const pixI = x + CANVAS.w * y
  const color = CURR_FRAME[(pixI * 36) + $.layerActive]

  canvasSetPixel(pixI, 0)

  const index = pixI * 3
  selectionBuffer[index] = color
  selectionBuffer[index + 1] = x
  selectionBuffer[index + 2] = y
}

function setPreviewPoint (x, y, color) {
  const index = (~~(x) + CANVAS.w * ~~(y))
  previewBuffer[index] = color
}

function setCanvasPoint (x, y, color) {
  const index = (~~(x)) + CANVAS.w * (~~(y))
  canvasSetPixel(index, color)
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
function squareFilled (action, start, end, color) {
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
      setSelectedPoint(lineX, lineY)

      lineY += (1 * yDir)
      yStep += 1
    }

    lineX += (1 * xDir)
    xStep += 1
  }
}

// translate selection buffer, write to preview buffer
function selectionTranslate (xStep, yStep) {
  previewBuffer.set(emptyPrevBuffer)

  for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx += 3) {
    selectionBuffer[idx + 1] += xStep
    selectionBuffer[idx + 2] += yStep

    const x = selectionBuffer[idx + 1]
    const y = selectionBuffer[idx + 2]

    if (x >= 0 && x < CANVAS.w && y >= 0 && y < CANVAS.h) {
      setPreviewPoint (x, y, selectionBuffer[idx])
    }
  }
}

function selectionWrite () {
  previewBuffer.set(emptyPrevBuffer)

  for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx += 3) {
    const c = selectionBuffer[idx]
    const x = selectionBuffer[idx + 1]
    const y = selectionBuffer[idx + 2]

    if (x >= 0 && x < CANVAS.w && y >= 0 && y < CANVAS.h) {
      setCanvasPoint (x, y, c)
    }
  }
}

function canvasPaint (e) {
  CANVAS.prev.x = CANVAS.curr.x
  CANVAS.prev.y = CANVAS.curr.y
  CANVAS.curr.x = Math.floor(e.offsetX)
  CANVAS.curr.y = Math.floor(e.offsetY)
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
        canvasSetPixel(pixelIndex, color)
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

  if ($.toolActive === 'move') {
    const xStep = CANVAS.end.x - CANVAS.prev.x
    const yStep = CANVAS.end.y - CANVAS.prev.y

    if (e.type === 'mousedown') {
      selectionLift({ x: 0, y: 0 }, { x: CANVAS.w - 1, y: CANVAS.h - 1 })
    }

    if (CANVAS.mouseDown) selectionTranslate(xStep, yStep)

    if (e.type === 'mouseup') selectionWrite()
  }
}
function canvasGetTopColor (pixelIndex) {
  let index = 0, v
  const offset = pixelIndex * 36

  if (CURR_FRAME[offset + 32] !== 0) {
    v = CURR_FRAME[offset + 32]|0 // make sure its an integer
    index = 0
  } else if (CURR_FRAME[offset + 33] > 0) {
    v = CURR_FRAME[offset + 33]|0
    index = 8
  } else if (CURR_FRAME[offset + 34] > 0) {
    v = CURR_FRAME[offset + 34]|0
    index = 16
  } else if (CURR_FRAME[offset + 35] > 0) {
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
    return 0
  }
}
function canvasDraw () {
  let toggle = 0
  let previewColorIndex = 0
  let colorIndex = 0

  // Draw final frame buffer
  function draw () {
    toggle = toggle === 0 ? 1 : 0

    if (toggle === 1) {
      requestAnimationFrame(draw)
      return
    }

    //console.time('draw loop')
    for (let pixI = 0, idx = 0; pixI < pixelResTotal; pixI++, idx+=36) {
      colorIndex = CURR_FRAME[idx + canvasGetTopColor(pixI)] // step 1: grab index of first visible layer
      previewColorIndex = previewBuffer[pixI]

      buf32[pixI] =
       (COLORS[colorIndex + 3] << 24) |    // alpha
       (COLORS[colorIndex + 2] << 16) |    // blue
       (COLORS[colorIndex + 1] <<  8) |    // green
        COLORS[colorIndex];

      if (previewColorIndex !== 0) {
        buf32[pixI] =
         (COLORS[previewColorIndex + 3] << 24) |    // alpha
         (COLORS[previewColorIndex + 2] << 16) |    // blue
         (COLORS[previewColorIndex + 1] <<  8) |    // green
          COLORS[previewColorIndex];
      }
    }
    //console.timeEnd('draw loop')
    CANVAS.buffer.data.set(buf8);
    ctx.putImageData(CANVAS.buffer, 0, 0)

    requestAnimationFrame(draw)
  }

  draw()
}

function main () {
  canvasDraw()
}

main()
