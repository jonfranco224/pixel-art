import { STATE } from './state'

const areRGBAsEqual = (c1, a, c2, b) => {
  return (
    c1[a + 0] === c2[b + 0] &&
    c1[a + 1] === c2[b + 1] &&
    c1[a + 2] === c2[b + 2] &&
    c1[a + 3] === c2[b + 3]
  )
}

export const line = (startX, startY, endX, endY, func) => {
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

export const circle = (xCenter, yCenter, currX, currY, func) => {
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

export const square = (startX, startY, endX, endY, func) => {
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

export const getColorAtPixel = (imageData, x, y) => {
  const {width, data} = imageData
  const linearCord = (y * width + x) * 4

  return [
    data[linearCord + 0],
    data[linearCord + 1],
    data[linearCord + 2],
    data[linearCord + 3]
  ]
}

export const fill = (canvasCTX, canvasImgData, w, h, startX, startY, color) => { // http://www.williammalone.com/articles/html5-canvas-javascript-paint-bucket-tool/
  let linear_cords = (startY * w + startX) * 4

  const pixel_stack = [{ x: startX, y: startY }]
  const original_color = getColorAtPixel(canvasImgData, startX, startY)

  if (areRGBAsEqual(color, 0, original_color, 0)) return

  while (pixel_stack.length > 0) {
    let new_pixel = pixel_stack.shift()
    let x = new_pixel.x
    let y = new_pixel.y

    linear_cords = (y * w + x) * 4

    while (
      y-- >= 0 &&
      canvasImgData.data[linear_cords + 0] === original_color[0] &&
      canvasImgData.data[linear_cords + 1] === original_color[1] &&
      canvasImgData.data[linear_cords + 2] === original_color[2] &&
      canvasImgData.data[linear_cords + 3] === original_color[3]) {
        linear_cords -= w * 4
    }

    linear_cords += w * 4
    y++

    let reached_left = false
    let reached_right = false

    while (
      y++ < h &&
      canvasImgData.data[linear_cords + 0] === original_color[0] &&
      canvasImgData.data[linear_cords + 1] === original_color[1] &&
      canvasImgData.data[linear_cords + 2] === original_color[2] &&
      canvasImgData.data[linear_cords + 3] === original_color[3]
    ) {
      canvasImgData.data[linear_cords + 0] = color[0]
      canvasImgData.data[linear_cords + 1] = color[1]
      canvasImgData.data[linear_cords + 2] = color[2]
      canvasImgData.data[linear_cords + 3] = color[3]

      if (x > 0) {
        if (
          canvasImgData.data[linear_cords - 4 + 0] === original_color[0] &&
          canvasImgData.data[linear_cords - 4 + 1] === original_color[1] &&
          canvasImgData.data[linear_cords - 4 + 2] === original_color[2] &&
          canvasImgData.data[linear_cords - 4 + 3] === original_color[3]
        ) {
          if (!reached_left) {
            pixel_stack.push({ x: x - 1, y: y })
            reached_left = true
          }
        } else if (reached_left) {
          reached_left = false
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
            pixel_stack.push({ x: x + 1, y: y })
            reached_right = true
          }
        } else if (reached_right) {
          reached_right = false
        }
      }
      
      linear_cords += w * 4
    }
  }
}

const assignRGBATo = (arr1, i1, arr2, i2) => {
  arr1[i1 + 0] = arr2[i2 + 0]
  arr1[i1 + 1] = arr2[i2 + 1]
  arr1[i1 + 2] = arr2[i2 + 2]
  arr1[i1 + 3] = arr2[i2 + 3]
}

export const setPoint = (imgData, x, y, w, h, color) => {
  if (!imgData) throw Error(`setPoint: ${imgData} undefined`)
  if (!imgData.length) throw Error(`setPoint: ${imgData} not a valid array`)

  if (x >= 0 && x < w && y >= 0 && y < h) { // check bounds
    const i = (x + w * y) * 4
    assignRGBATo(imgData, i, color, 0)
  }
}

export const HSLtoRGB = (hue, saturation, lightness) => {
  const h = hue
  const s = saturation / 100
  const l = lightness / 100

  let c = (1 - Math.abs(2 * l - 1)) * s
  let x = c * (1 - Math.abs((hue / 60) % 2 - 1))
  let m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return { r, g, b }
}

export const RGBtoHSL = (red, green, blue) => {
  // Make r, g, and b fractions of 1
  let r = red / 255
  let g = green / 255
  let b = blue / 255

  // Find greatest and smallest channel values
  let cmin = Math.min(r, g, b)
  let cmax = Math.max(r, g, b)
  let delta = cmax - cmin
  let h = 0
  let s = 0
  let l = 0

  if (delta === 0) {
    h = 0
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6
  } else if (cmax === g) {
    h = (b - r) / delta + 2
  } else {
    h = (r - g) / delta + 4
  }

  h = Math.round(h * 60)

  // Make negative hues positive behind 360°
  if (h < 0) h += 360

  l = (cmax + cmin) / 2

  // Calculate saturation
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  return { h, s, l }
}

export const base64ToImage = async (base64Frame) => {
  if (!base64Frame) throw Error(`base64ToImage: ${base64Frame}`)

  const loadBase64 = (base64) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => { return resolve(img) }
      img.onerror = (err) => { return resolve(err) }
      img.src = base64
    })
  }

  const img = await loadBase64(base64Frame)

  return img
}


