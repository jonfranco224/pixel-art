export const CANVAS = Object.seal({
  offscreen: document.createElement('canvas'),
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

CANVAS.offscreen.width = defaultWidth
CANVAS.offscreen.height = defaultHeight
const base64 = CANVAS.offscreen.toDataURL()

export const STATE = Object.seal({
  // Canvas
  width: defaultWidth,
  height: defaultHeight,
  scale: 0.75,
  translateX: 0,
  translateY: 0,
  tool: 0,

  currentFrame: base64,

  // Layers
  layersActive: 0,
  layersCount: 1,
  layers: [
    {
      hidden: false,
      locked: false,
      name: 'Layer 1',
      paintActive: false,
      image: base64
    }
  ],

  // Palette
  palette: [
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
  ],

  // Color Picker
  color: [191, 61, 64, 255],
  hue: 0,
  saturation: 50,
  lightness: 50,

  // UI
  colorPickerOpen: false,
  fileOpen: false,

  // Update utility functions
  update: undefined,
  updateAndSave: undefined,
  save: undefined
})
