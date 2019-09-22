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
  layerActive: 0,
  colorActive: 8
}

// INIT COLORS
const bufColors = new ArrayBuffer(100)
const COLORS = new Uint8ClampedArray(bufColors)

COLORS[0] = 0 // Empty
COLORS[1] = 0
COLORS[2] = 0
COLORS[3] = 0

COLORS[4] = 0 // Black
COLORS[5] = 0
COLORS[6] = 0
COLORS[7] = 255
// Need black blend here

COLORS[8] = 0 // Green
COLORS[9] = 255
COLORS[10] = 0
COLORS[11] = 255

const CANVAS_DOM = document.querySelector('#main-canvas')
CANVAS_DOM.addEventListener('mousemove', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', canvasPaint)
CANVAS_DOM.addEventListener('mouseup', canvasPaint)
CANVAS_DOM.addEventListener('mousedown', (e) => { CANVAS.mouseDown = true })
CANVAS_DOM.addEventListener('mouseup', (e) => { CANVAS.mouseDown = false })
CANVAS_DOM.addEventListener('mouseleave', (e) => { CANVAS.mouseDown = false })

CANVAS = {
  scaleRatio: 0,
  w: 0,
  h: 0,
  curr: { x: 0, y: 0 },
  start: { x: 0, y: 0 },
  prev: { x: 0, y: 0 },
  end: { x: 0, y: 0 },
  mouseDown: false,
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

  if (CANVAS.mouseDown) {
    make('line', CANVAS.prev, CANVAS.curr).forEach(pt => {
      const index = (pt.x + CANVAS.w * pt.y) * 4

      $.FRAMES[$.frameActive][$.layerActive].data[index] = COLORS[$.colorActive]
      $.FRAMES[$.frameActive][$.layerActive].data[index + 1] = COLORS[$.colorActive + 1]
      $.FRAMES[$.frameActive][$.layerActive].data[index + 2] = COLORS[$.colorActive + 2]
      $.FRAMES[$.frameActive][$.layerActive].data[index + 3] = COLORS[$.colorActive + 3]

      for (let i = $.FRAMES[$.frameActive].length; i >= 0; i--) {
        const topColor = $.FRAMES[$.frameActive][$.layerActive] > 0
      }

      CANVAS.buffer.data[index] = $.FRAMES[$.frameActive][$.layerActive].data[index]
      CANVAS.buffer.data[index + 1] = $.FRAMES[$.frameActive][$.layerActive].data[index + 1]
      CANVAS.buffer.data[index + 2] = $.FRAMES[$.frameActive][$.layerActive].data[index + 2]
      CANVAS.buffer.data[index + 3] = $.FRAMES[$.frameActive][$.layerActive].data[index + 3]
    })
  }
}

// INIT CANVAS
const canvas = document.querySelector('canvas')
const length = canvas.width * canvas.height
const ctx = canvas.getContext('2d')

CANVAS.w = canvas.width
CANVAS.h = canvas.height

CANVAS.buffer = new ImageData(CANVAS.w, CANVAS.h)

for (let i = 0; i < CANVAS.buffer.data.length; i += 4) { // Default to black for now, need to change to BG
  CANVAS.buffer.data[i] = 0
  CANVAS.buffer.data[i + 1] = 0
  CANVAS.buffer.data[i + 2] = 0
  CANVAS.buffer.data[i + 3] = 255
}

// INIT LAYERS
for (let i = 0; i < 10; i++) {
  $.FRAMES[$.frameActive].push(new ImageData(CANVAS.w, CANVAS.h))
}

// Draw final frame buffer
let toggle = 0

function draw () {
	toggle = toggle === 0 ? 1 : 0

  if (toggle === 1) {
    requestAnimationFrame(draw)
    return
  }

  ctx.putImageData(CANVAS.buffer, 0, 0)

	requestAnimationFrame(draw)
}

draw()
