import { viewUpdate } from './view'
import { RGBtoHSL, HSLtoRGB }  from './utils'

export const APP = {}

export const defaultData = () => {
  APP.width = 128
  APP.height = 128
  APP.tool = 'pencil'

  APP.frameActive = 0
  APP.layerActive = 0

  APP.layers = [
    {
      name: 'Layer 1',
      hidden: false
    }
  ],
  APP.frames = [
    {
      base64: '',
      imageData: new ImageData(128, 128),
      layers: [new ImageData(128, 128)]
    }
  ]
  
  APP.color = {
    rgb: [100, 188, 156, 255],
    hsl: [168, 76, 42, 255]
  }
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
  ]
  
  Object.seal(APP)
}

const newData = (w, h) => {

}

const loadData = (data) => {

}

const layersAdd = (i) => {}
const layersDelete = (i) => {}
const layersSwap = (i1, i2) => {}
const layersEditName = (i, name) => {}
const layersEditHidden = (i) => {}

const framesAdd = (i) => {}
const framesDelete = (i) => {}
const framesSwap = (i) => {}

export const setTool = (tool) => {
  APP.tool = tool
  
  viewUpdate()
}

export const colorSetHSL = (hsl) => {
  APP.color.hsl = hsl
  APP.color.rgb = HSLtoRGB(hsl)

  viewUpdate()
}

export const colorSetRGB = (rgb) => {
  APP.color.rgb = rgb
  APP.color.hsl = RGBtoHSL(rgb)

  viewUpdate()
}

export const paletteAdd = () => {
  APP.palette.push(APP.color.rgb)
  
  viewUpdate()
}

export const paletteDelete = (i) => {
  const index = APP.palette.indexOf(APP.color.rgb)

  if (index !== -1) {
    APP.palette.splice(index, 1)
    viewUpdate()
  }
  
}

const canvasSetTarget = (layer, frame) => {} // send index data from UI
const canvasLine = (start, end) => {}
const canvasSquare = (start, end) => {}
const canvasCircle = (start, end) => {}
const canvasFill = (start) => {}

const Canvas = {
  state: '', // pts
  process: () => {},
  exit: () => {}
}

const Selection = {
  state: '', // pts
  process: () => {},
  exit: () => {}
}

const Animate = {
  state: '', // currentFrame
  process: () => {},
  exit: () => {}
}


