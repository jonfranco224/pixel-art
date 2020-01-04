export const CANVAS = Object.seal({
  main: {
    dom: undefined,
    ctx: undefined,
    imageData: undefined
  },
  preview: {
    dom: undefined,
    ctx: undefined,
    imageData: undefined
  },
  emptyImageData: undefined
})

const defaultWidth = 50
const defaultHeight = 50

const canvas = document.createElement('canvas')
canvas.width = defaultWidth
canvas.height = defaultHeight
const base64 = canvas.toDataURL()

export const STATE = Object.seal({
  // Canvas
  width: defaultWidth,
  height: defaultHeight,
  scale: 0.75,
  translateX: 0,
  translateY: 0,
  offsetX: 0,
  offsetY: 0,
  tool: 0,

  currentFrame: base64,

  // Color Picker
  color: [191, 61, 64, 255],
  hue: 0,
  saturation: 50,
  lightness: 50,

  // UI
  colorPickerOpen: false,
  fileOpen: false,

  update: undefined,
  updateAndSave: undefined,
  save: undefined
})
