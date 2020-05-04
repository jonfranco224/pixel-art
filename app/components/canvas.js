import { h, render } from 'preact'
import { APP, VIEW } from '../state'
import { addToUndo } from '../undo-redo'
import { setRGB } from './color'

const getPoint = (imgDataArr, x, y, w, h) => {
  if (!imgDataArr) throw Error(`setPoint: ${imgDataArr} undefined`)
  if (!imgDataArr.length) throw Error(`setPoint: ${imgDataArr} not a valid array`)

  if (x >= 0 && x < w && y >= 0 && y < h) { // check bounds
    const i = (x + w * y) * 4
    return [
      imgDataArr[i + 0],
      imgDataArr[i + 1],
      imgDataArr[i + 2],
      imgDataArr[i + 3]
    ]
  }

  return [0, 0, 0, 0]
}

const setPoint = (imgDataArr, x, y, w, h, color) => {
  if (!imgDataArr) throw Error(`setPoint: ${imgDataArr} undefined`)
  if (!imgDataArr.length) throw Error(`setPoint: ${imgDataArr} not a valid array`)
  
  if (x >= 0 && x < w && y >= 0 && y < h) { // check bounds
    const i = (x + w * y) * 4
    imgDataArr[i + 0] = color[0]
    imgDataArr[i + 1] = color[1]
    imgDataArr[i + 2] = color[2]
    imgDataArr[i + 3] = color[3]
  }
}

const areRGBAsEqual = (c1, a, c2, b) => {
  return (
    c1[a + 0] === c2[b + 0] &&
    c1[a + 1] === c2[b + 1] &&
    c1[a + 2] === c2[b + 2] &&
    c1[a + 3] === c2[b + 3]
  )
}

const getColorAtPixel = (data, x, y, w) => {
  const linearCord = (y * w + x) * 4

  return [
    data[linearCord + 0],
    data[linearCord + 1],
    data[linearCord + 2],
    data[linearCord + 3]
  ]
}

const fill = (canvasImgData, startX, startY, w, h, color) => { // http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
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
}

const line = (startX, startY, endX, endY, func) => {
  let dx = Math.abs(endX - startX)
  let dy = Math.abs(endY - startY)

  let xDir = endX - startX >= 0 ? 1 : -1
  let yDir = endY - startY >= 0 ? 1 : -1
  
  let lineX = startX
  let lineY = startY

  let step = dx >= dy ? dx : dy

  dx = dx / step
  dy = dy / step
  
  let i = 0
  while (i < step) {
    func(Math.floor(lineX), Math.floor(lineY))

    lineX += (dx * xDir)
    lineY += (dy * yDir)
    i += 1
  }

  func(Math.floor(lineX), Math.floor(lineY))
}

const circle = (xCenter, yCenter, currX, currY, func) => {
  let radius = Math.floor(Math.sqrt(Math.pow((currX - xCenter), 2) + Math.pow((currY - yCenter), 2)))

  if (radius <= 0) return

  let x = 0
  let y = radius
  let p = 1 - radius

  const circlePlot = () => {
    func(xCenter + x, yCenter + y)
    func(xCenter + y, yCenter + x)
    func(xCenter - x, yCenter + y)
    func(xCenter - y, yCenter + x)
    func(xCenter + x, yCenter - y)
    func(xCenter + y, yCenter - x)
    func(xCenter - x, yCenter - y)
    func(xCenter - y, yCenter - x)
  }

  // Plot first set of points
  circlePlot(xCenter, yCenter, x, y)

  while (x <= y) {
    x++
    if (p < 0) {
      p += 2 * x + 1 // Mid point is inside therefore y remains same
    } else { // Mid point is outside the circle so y decreases
      y--
      p += 2 * (x - y) + 1
    }

    circlePlot(xCenter, yCenter, x, y)
  }
}

const squareFilled = (startX, startY, endX, endY, w, h, color, func) => {
  let points = []

  let dx = Math.abs(endX - startX)
  let dy = Math.abs(endY - startY)

  let xDir = endX - startX >= 0 ? 1 : -1
  let yDir = endY - startY >= 0 ? 1 : -1

  let lineX = startX
  let lineY = startY

  let xStep = 0
  let yStep = 0

  while (xStep <= dx) {
    yStep = 0
    lineY = startY

    while (yStep <= dy) {
      func(lineX, lineY)
      //points.push({ x: lineX, y: lineY })

      lineY += (1 * yDir)
      yStep += 1
    }

    lineX += (1 * xDir)
    xStep += 1
  }

  return points
}

const square = (startX, startY, endX, endY, func) => {
  let dx = Math.abs(endX - startX)
  let dy = Math.abs(endY - startY)

  let xDir = endX - startX >= 0 ? 1 : -1
  let yDir = endY - startY >= 0 ? 1 : -1

  let lineX = startX
  let lineY = startY
  let i = 0

  func(lineX, lineY)

  while (i < dx) {
    lineX += (1 * xDir)
    func(lineX, startY)
    func(lineX, (startY + (dy * yDir)))
    i += 1
  }

  i = 0

  while (i < dy) {
    lineY += (1 * yDir)
    func(startX, lineY)
    func((startX + (dx * xDir)), lineY)
    i += 1
  }
}

export const paintCanvas = (gestureEvent) => {
  // Reset
  VIEW.canvasPreview.ctx.clearRect(0, 0, APP.width, APP.height)
  VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height)

  // Whole or Selection
  const target = APP.layers[APP.layerActive].frames[APP.frameActive].data // or selection buffer
  const preview = VIEW.canvasPreview.imgData.data

  // Translate coordinates based on current screen position and canvas scale
  const bb = VIEW.canvasView.dom.getBoundingClientRect()

  const scaleX = bb.width / VIEW.canvasView.dom.width
  const scaleY = bb.height / VIEW.canvasView.dom.height

  const startX = Math.floor((VIEW.window.startX - bb.x) / scaleX)
  const startY = Math.floor((VIEW.window.startY - bb.y) / scaleY)
  const prevX = Math.floor((VIEW.window.prevX - bb.x) / scaleX)
  const prevY = Math.floor((VIEW.window.prevY - bb.y) / scaleY)
  const currX = Math.floor((VIEW.window.currX - bb.x) / scaleX)
  const currY = Math.floor((VIEW.window.currY - bb.y) / scaleY)

  const setBrushPoints = (canvas, x, y, w, h, color) => {
    squareFilled(x - VIEW.brushSize, y - VIEW.brushSize, x + VIEW.brushSize, y + VIEW.brushSize, w, h, color, (x, y) => {
      setPoint(canvas, x, y, w, h, color)
    })
  }

  if (gestureEvent === 'hover' && APP.tool !== 'eye-dropper' && APP.tool !== 'move') {
    setBrushPoints(preview, currX, currY, APP.width, APP.height, APP.tool !== 'eraser' ? APP.color.rgb : [0, 0, 0, 50])
    VIEW.render()

    return
  }

  // Setup Undo
  if (gestureEvent === 'start' && APP.tool !== 'eye-dropper') {
    const copy = new ImageData(APP.width, APP.height)
    copy.data.set(APP.layers[APP.layerActive].frames[APP.frameActive].data)
    const layerActive = APP.layerActive
    const frameActive = APP.frameActive
    
    addToUndo(APP.tool)

    VIEW.currUndoRef.undo = () => {
      APP.frameActive = frameActive
      APP.layerActive = layerActive
      APP.layers[layerActive].frames[frameActive].data.set(copy.data)
    }
  }
  
  // Eye dropper
  if (gestureEvent === 'end' && APP.tool === 'eye-dropper') {
    const color = getPoint(target, currX, currY, APP.width, APP.height)
    
    if (color[3] !== 0) {
      setRGB(color)
    }
  }

  // Fill
  if (gestureEvent === 'end' && APP.tool === 'fill') {
    fill(target, currX, currY, APP.width, APP.height, APP.color.rgb)
  }

  // Points
  if (APP.tool === 'pencil' || APP.tool === 'eraser') {
    if (APP.tool === 'eraser') {
      setBrushPoints(preview, currX, currY, APP.width, APP.height, [0, 0, 0, 50])
    }
    
    line(prevX, prevY, currX, currY, (x, y) => {
      setBrushPoints(target, x, y, APP.width, APP.height, APP.tool === 'pencil' ? APP.color.rgb : [0, 0, 0, 0])
    })
  }

  // Geometry
  if (APP.tool === 'line' || APP.tool === 'circle' || APP.tool === 'square') {
    const funcs = { 'line': line, 'circle': circle, 'square': square }
    
    funcs[APP.tool](startX, startY, currX, currY, (x, y) => {
      setBrushPoints(gestureEvent === 'start' || gestureEvent === 'resume' ? preview : target, x, y, APP.width, APP.height, APP.color.rgb)
    })
  }

  // Move
  if (APP.tool === 'move') {
    if (gestureEvent === 'start') {
      // Frame to Selection
      VIEW.canvasSelection.ctx.putImageData(APP.layers[APP.layerActive].frames[APP.frameActive], 0, 0)
      VIEW.canvasSelection.imgData = VIEW.canvasSelection.ctx.getImageData(0, 0, APP.width, APP.height)

      // Selection to Preview
      VIEW.canvasPreview.ctx.putImageData(VIEW.canvasSelection.imgData, 0, 0)
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height)

      // Clear main canvas
      APP.layers[APP.layerActive].frames[APP.frameActive] = new ImageData(APP.width, APP.height)
    }

    if (gestureEvent === 'resume') {
      // Selection to Preview
      VIEW.canvasPreview.ctx.putImageData(VIEW.canvasSelection.imgData, prevX - startX, prevY - startY)
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height)
    }

    if (gestureEvent === 'end') {
      // Selection to Preview
      VIEW.canvasPreview.ctx.putImageData(VIEW.canvasSelection.imgData, prevX - startX, prevY - startY)
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height)

      // Preview to Main
      APP.layers[APP.layerActive].frames[APP.frameActive] = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height)

      VIEW.canvasPreview.ctx.clearRect(0, 0, APP.width, APP.height)
      VIEW.canvasPreview.imgData = VIEW.canvasPreview.ctx.getImageData(0, 0, APP.width, APP.height)
    }
  }

  // Setup Redo
  if (gestureEvent === 'end' && APP.tool !== 'eye-dropper') {
    const copy = new ImageData(APP.width, APP.height)
    copy.data.set(APP.layers[APP.layerActive].frames[APP.frameActive].data)
    const layerActive = APP.layerActive
    const frameActive = APP.frameActive

    VIEW.currUndoRef.redo = () => {
      APP.frameActive = frameActive
      APP.layerActive = layerActive
      APP.layers[layerActive].frames[frameActive].data.set(copy.data)
    }
  }

  VIEW.render()
}

export const Canvas = () => {
  return <div id='canvas-outer-scroll' class={`overflow fl-1 cursor-${APP.tool}`}>
    <div id='canvas-inner-scroll' data-request='paintCanvas' data-hover='paintCanvas' class='fl fl-center fl-1' style='width: 1920px; height: 1920px;'>
      <canvas                      
        id='canvas-view'
        width={APP.width}
        height={APP.height}
        style='width: 1920px; height: 1920px; transform: scale(.25); pointer-events: none;' />
    </div>  
  </div>
}