import { RGBtoHSL } from './utils'

export const ENV = window.location.href.includes('localhost:4000') ? 'DEV' : 'PROD'
export const APP = {}
export const VIEW = { render: undefined }
export const canvases = ['canvasSelection', 'canvasPreview', 'canvasTemp', 'canvasFinal', 'canvasView']

const initAppDefault = (w, h) => {
  APP.width = w
  APP.height = h
  APP.tool = 'pencil'

  APP.frameActive = 0
  APP.layerActive = 0
  APP.frameCount = 1 
  APP.layerCount = 1  
  APP.layers = [
    {
      name: 'Layer 1',
      hidden: false,
      frames: [new ImageData(w, h)]
    }
  ]
  
  APP.color = {}
  APP.color.rgb = [100, 188, 156, 255]
  APP.color.hsl = RGBtoHSL(APP.color.rgb)

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

export const initCanvases = () => {
  canvases.forEach(canvas => {
    VIEW[canvas].dom = canvas === 'canvasView' ? document.querySelector('#canvas-view') : document.createElement('canvas')
    VIEW[canvas].dom.width = APP.width
    VIEW[canvas].dom.height = APP.height
    VIEW[canvas].ctx = VIEW[canvas].dom.getContext('2d')
    VIEW[canvas].imgData = VIEW[canvas].ctx.getImageData(0, 0, APP.width, APP.height)
  })

  VIEW.canvasTimeline = document.querySelector('#timeline-canvas')
  VIEW.canvasTimelineTemp = document.createElement('canvas')
}

const initViewDefault = (preventOnMount) => {
  VIEW.activeInput = {
    id: '',
    val: ''
  }

  VIEW.window = {
    request: '',
    mouseDown: false,
    startX: 0,
    startY: 0,
    prevX: 0,
    prevY: 0,
    currX: 0,
    currY: 0
  }

  VIEW.file = { open: false }
  VIEW.newCanvas = { open: false, w: 32, h: 32 }
  VIEW.downloadCanvas = { open: false, size: 2, type: 'frame' }

  VIEW.brushSize = 0

  VIEW.timerID = undefined
  VIEW.isPlaying = false
  VIEW.onionSkinning = false

  VIEW.undo = []
  VIEW.undoPos = -1
  VIEW.currUndoRef = {}
  
  VIEW.canvasTimeline = undefined
  VIEW.canvasTimelineTemp = undefined

  // need to reset these on new project
  canvases.forEach(canvas => {
    VIEW[canvas] = {
      dom: undefined,
      ctx: undefined,
      imgData: undefined
    }
  })

  if (preventOnMount !== true) {
    initCanvases()
  }

  Object.seal(VIEW)
}

export const newData = (w, h, preventOnMount) => {
  initAppDefault(w, h)
  initViewDefault(preventOnMount)
}