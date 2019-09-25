function make(action, start, end) {
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

let $ = {
  FRAMES: [[]],
  frameActive: 0,
  layerActive: 25,
  colorActive: 12,
  toolActive: 'pencil'
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
  toRevertPreview: [],
  toPrintPreview: []
}

function canvasPreview (action, pts, layerIndex, colorIndex) {
  // If in preview mode, revert all previous frame's pixel states
  if (action === 'preview') {
    CANVAS.toRevertPreview.forEach(pt => {
      const pixI = pt.x + CANVAS.w * pt.y
      canvasPaintPixel(pt.pixelIndex, pt.layerIndex, pt.colorIndex)
    })

    CANVAS.toRevertPreview = []
  }

  // If we're printing, we can empty the last frame's pixel states and write the new ones
  if (action === 'print') CANVAS.toRevertPreview = []

  pts.forEach(pt => {
    const pixelIndex = pt.x + CANVAS.w * pt.y

    // If in preview mode, push to an array of previous pixel states to revert to on next frame
    if (action === 'preview') {
      let color = CURR_FRAME[(pixOffsets[pixelIndex]) + layerIndex]

      CANVAS.toRevertPreview.push({
        pixelIndex: pixelIndex,
        layerIndex: layerIndex,
        colorIndex: color
      })
    }

    canvasPaintPixel(pixelIndex, layerIndex, colorIndex)
  })
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

  if ($.toolActive === 'pencil') {
    if (CANVAS.mouseDown) {
      make('line', CANVAS.prev, CANVAS.curr).forEach(pt => {
        const pixelIndex = pt.x + CANVAS.w * pt.y
        canvasPaintPixel(pixelIndex, $.layerActive, $.colorActive)
      })
    }
  }

  if ($.toolActive === 'line') {
    if (CANVAS.mouseDown) {
      const line = make('line', CANVAS.start, CANVAS.prev)
      canvasPreview('preview', line, $.layerActive, $.colorActive)
    }

    if (e.type === 'mouseup') {
      const line = make('line', CANVAS.start, CANVAS.prev)
      canvasPreview('print', line, $.layerActive, $.colorActive)
    }
  }
}

// INIT CANVAS
const canvas = document.querySelector('canvas')
const length = canvas.width * canvas.height
const ctx = canvas.getContext('2d')

CANVAS.w = canvas.width
CANVAS.h = canvas.height
CANVAS.buffer = new ImageData(CANVAS.w, CANVAS.h)

const pixelResTotal = CANVAS.w * CANVAS.h

const FRAMES = []
$.frameActive = 0

// first 32 bytes: array into COLORS table
// last 4 bytes: array into first 32 bytes
FRAMES[$.frameActive] = new Uint8Array(pixelResTotal * 36)

const CURR_FRAME = FRAMES[$.frameActive]

const pixOffsets = new Uint32Array(pixelResTotal)
for (let i = 0; i < pixelResTotal; i++) {
  pixOffsets[i] = i * 36
}

function getFirstVisibleLayerIndex (pixelIndex) {
  //console.time('draw loop get visible')

  let index = -1, v
  const offset = pixOffsets[pixelIndex]

  if (CURR_FRAME[offset + 32] > 0) {
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

  if ((v & 128) !== 0) index += 0 // to set the first bit: v |= 128, CURR_FRAME[0] = colorIndex
  else if ((v & 64) !== 0) index += 1 // to set the second: v |= 64, CURR_FRAME[1] = colorIndex
  else if ((v & 32) !== 0) index += 2
  else if ((v & 16) !== 0) index += 3
  else if ((v & 8) !== 0) index += 4
  else if ((v & 4) !== 0) index += 5
  else if ((v & 2) !== 0) index += 6
  else if ((v & 1) !== 0) index += 7

  //console.timeEnd('draw loop get visible')

  if (index !== -1) {
    return index
  } else {
    return 0
  }
}

function canvasPaintPixel(pixelIndex, layerIndex, colorIndex) {
  const offset = pixOffsets[pixelIndex]
  CURR_FRAME[offset + layerIndex] = colorIndex
  CURR_FRAME[offset + 32 + (~~(layerIndex / 8))] |= (128 >> (layerIndex % 8))
}

// Draw final frame buffer
function canvasDraw () {
  let toggle = 0

  function draw () {
    toggle = toggle === 0 ? 1 : 0

    if (toggle === 1) {
      requestAnimationFrame(draw)
      return
    }

    //console.time('draw loop')
    for (let pixI = 0; pixI < pixelResTotal; pixI++) {
      const bufI = pixI * 4 // calc pixel operation offset

      // step 1: grab index of first visible layer
      let colorIndex = CURR_FRAME[pixOffsets[pixI] + getFirstVisibleLayerIndex(pixI)]

      // step 2: grab color index from first 32 bytes
      // step 3: grab color value from COLORS
      CANVAS.buffer.data[bufI] = COLORS[colorIndex]
      CANVAS.buffer.data[bufI + 1] = COLORS[colorIndex + 1]
      CANVAS.buffer.data[bufI + 2] = COLORS[colorIndex + 2]
      CANVAS.buffer.data[bufI + 3] = COLORS[colorIndex + 3]
    }
    //console.timeEnd('draw loop')
    ctx.putImageData(CANVAS.buffer, 0, 0)

    requestAnimationFrame(draw)
  }

  draw()
}

function main () {
  canvasDraw()
}



main()
