import { h, Component, createRef } from 'preact'
import { STATE, CANVAS } from './state'
import { RGBtoHSL, getColorAtPixel, setPoint, line, circle, square, fill, base64ToImage } from './utils'

export class Canvas extends Component {
  constructor () {
    super()
    // Canvas + Canvas Container
    this.padding = 0
    this.width = 500
    this.height = 500

    // Orientation
    this.gestureStartScale = 0
    this.canvasContainer = createRef()
  }

  componentDidUpdate () {
    this.setCanvas()
  }

  async componentDidMount () {
    this.setCanvas()

    const container = this.canvasContainer.current
    container.scrollTop = (container.scrollHeight - container.offsetHeight) / 2
    container.scrollLeft = (container.scrollWidth - container.offsetWidth) / 2

    const WINDOW = {}
    const resetWindow = () => {
      WINDOW.REQUEST = ''
      WINDOW.MOUSE_DOWN = false
      WINDOW.START_X = 0
      WINDOW.START_Y = 0
      WINDOW.PREV_X = 0
      WINDOW.PREV_Y = 0
      WINDOW.CURR_X = 0
      WINDOW.CURR_Y = 0
    }
    resetWindow()

    const gestureDown = (e) => {
      WINDOW.REQUEST = e.target.dataset.request
      WINDOW.MOUSE_DOWN = true
      WINDOW.START_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
      WINDOW.START_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
      WINDOW.PREV_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
      WINDOW.PREV_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
      WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
      WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

      this.paintCanvas('down', WINDOW)
    }

    window.addEventListener('mousedown', gestureDown)
    window.addEventListener('touchstart', gestureDown, { passive: false }) // allow prevent default

    const gestureMove = (e) => {
      WINDOW.PREV_X = WINDOW.CURR_X
      WINDOW.PREV_Y = WINDOW.CURR_Y
      WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
      WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

      this.paintCanvas('move', WINDOW)

      if (e.target.tagName !== 'INPUT') { // prevent block on input range elements
        e.preventDefault() // block pull to refresh on mobile browsers
      }
    }

    window.addEventListener('mousemove', gestureMove)
    window.addEventListener('touchmove', gestureMove, { passive: false }) // allow prevent default

    const gestureEnd = (e) => {
      this.paintCanvas('up', WINDOW)
      resetWindow()
    }

    window.addEventListener('mouseup', gestureEnd)
    window.addEventListener('touchend', gestureEnd)

    // Resize Canvas
    const resizeCanvas = () => {
      if (window.innerWidth < 600) {
        // CANVAS.main.dom.parentNode.style.width = `${window.innerWidth}px`
        // CANVAS.main.dom.parentNode.style.height = `${window.innerHeight}px`
      }
    }

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('contextmenu', (e) => { e.preventDefault() }, { passive: false })

    resizeCanvas()
  }

  setCanvas () {
    CANVAS.main.dom = document.querySelector(`#canvas-main`)
    CANVAS.main.ctx = CANVAS.main.dom.getContext('2d')
    CANVAS.main.imageData = CANVAS.main.ctx.getImageData(0, 0, STATE.width, STATE.height)

    CANVAS.preview.dom = document.querySelector(`#canvas-preview`)
    CANVAS.preview.ctx = CANVAS.preview.dom.getContext('2d')
    CANVAS.preview.imageData = CANVAS.preview.ctx.getImageData(0, 0, STATE.width, STATE.height)

    CANVAS.emptyImageData = new window.ImageData(STATE.width, STATE.height)
  }

  setOrientation (e, zoom) {
    // const offsetX = (window.innerWidth / 2) - (e.target.children[0].clientWidth / 2)
    // const offsetY = (window.innerHeight / 2) - (e.target.children[0].clientHeight / 2) + 18

    // const mouseX = Math.floor(e.pageX - offsetX)
    // const mouseY = Math.floor(e.pageY - offsetY)
    // const bb = this.canvasContainer.current.children[0].children[0].getBoundingClientRect()

    // const maxWidth = this.canvasContainer.current.children[0].clientWidth
    // const currWidth = bb.width

    // const scaleCurr = STATE.scale
    // const scaleNext = zoom || STATE.scale

    // if (scaleNext > scaleCurr && currWidth >= maxWidth - 50) return

    // // STATE.translateX -= (-((mouseX / scaleNext) - (mouseX / scaleCurr)))
    // // STATE.translateY -= (-((mouseY / scaleNext) - (mouseY / scaleCurr)))
    // STATE.scale = scaleNext

    // STATE.updateAndSave()
  }

  zoom (e) {
    if (e.type === 'wheel') {
      var deltaYDir = e.deltaY < 0 ? 1 : -1
      var deltaXDir = e.deltaX < 0 ? 1 : -1
      const deltaY = Math.exp(deltaYDir * 0.01)

      if (e.ctrlKey) {
        e.preventDefault()

        this.setOrientation(e, STATE.scale * deltaY)
      } else {
        // prevent accidental browser back behavior
        if (deltaXDir === 1 && this.canvasContainer.current.scrollLeft === 0) e.preventDefault()
      }
    }

    if (e.type === 'gesturestart') {
      e.preventDefault()
      this.gestureStartScale = STATE.scale
    }

    if (e.type === 'gesturechange') {
      e.preventDefault()

      this.setOrientation(e, this.gestureStartScale * e.scale)
    }

    if (e.type === 'gestureend') {
      e.preventDefault()
    }
  }

  paintCanvas (type, WINDOW) {
    if (STATE.modalOpen) return

    const PENCIL = 0
    const ERASER = 1
    const LINE = 2
    const CIRCLE = 3
    const SQUARE = 4
    const FILL = 5
    const EYE_DROPPER = 6

    // CANVAS specific, transforming points to canvas
    const bb = CANVAS.main.dom.getBoundingClientRect()

    const scaleX = bb.width / CANVAS.main.dom.width
    const scaleY = bb.height / CANVAS.main.dom.height

    const startX = Math.floor((WINDOW.START_X - bb.x) / scaleX)
    const startY = Math.floor((WINDOW.START_Y - bb.y) / scaleY)
    const prevX = Math.floor((WINDOW.PREV_X - bb.x) / scaleX)
    const prevY = Math.floor((WINDOW.PREV_Y - bb.y) / scaleY)
    const currX = Math.floor((WINDOW.CURR_X - bb.x) / scaleX)
    const currY = Math.floor((WINDOW.CURR_Y - bb.y) / scaleY)

    CANVAS.preview.imageData.data.set(CANVAS.emptyImageData.data)

    // Hover
    if (STATE.tool !== ERASER && STATE.tool !== EYE_DROPPER) {
      setPoint(
        CANVAS.preview.imageData.data,
        currX,
        currY,
        STATE.width,
        STATE.height,
        STATE.color
      )
    }

    CANVAS.preview.ctx.putImageData(CANVAS.preview.imageData, 0, 0)

    if (WINDOW.REQUEST !== 'paintCanvas' || STATE.layers[STATE.layersActive].hidden) return

    if (type === 'down') {
      const img = CANVAS.main.dom.parentNode.children[0]
      CANVAS.main.ctx.drawImage(img, 0, 0)
      CANVAS.main.imageData = CANVAS.main.ctx.getImageData(0, 0, STATE.width, STATE.height)

      STATE.layers[STATE.layersActive].paintActive = true
      STATE.update()
    }

    // Tools
    if (STATE.tool === PENCIL || STATE.tool === ERASER) {
      line(prevX, prevY, currX, currY, (x, y) => {
        setPoint(
          CANVAS.main.imageData.data,
          x,
          y,
          STATE.width,
          STATE.height,
          STATE.tool === PENCIL ? STATE.color : [0, 0, 0, 0]
        )
      })
    }

    if (STATE.tool === LINE || STATE.tool === CIRCLE || STATE.tool === SQUARE) {
      const toolFunctionMap = {
        2: line,
        3: circle,
        4: square
      }

      toolFunctionMap[STATE.tool](startX, startY, currX, currY, (x, y) => {
        setPoint(
          (type === 'down' || type === 'move')
            ? CANVAS.preview.imageData.data
            : CANVAS.main.imageData.data,
          x,
          y,
          STATE.width,
          STATE.height,
          STATE.color
        )
      })
    }

    if (STATE.tool === FILL && type === 'up') {
      fill(CANVAS.main.imageData, STATE.width, STATE.height, currX, currY, STATE.color)
    }

    if (STATE.tool === EYE_DROPPER && type === 'up') {
      let sampled = getColorAtPixel(CANVAS.main.imageData, currX, currY)

      if (
        sampled[0] === undefined || sampled[0] === null ||
        sampled[1] === undefined || sampled[1] === null ||
        sampled[2] === undefined || sampled[2] === null
      ) {
        return
      }

      if (sampled[3] === 0) return // don't do anything if empty pixel

      STATE.color = sampled

      const hsl = RGBtoHSL(STATE.color[0], STATE.color[1], STATE.color[2])

      STATE.hue = Math.floor(hsl.h)
      STATE.saturation = Math.floor(hsl.s)
      STATE.lightness = Math.floor(hsl.l)
    }

    CANVAS.preview.ctx.putImageData(CANVAS.preview.imageData, 0, 0)
    CANVAS.main.ctx.putImageData(CANVAS.main.imageData, 0, 0)

    if (type === 'up') {
      STATE.currentFrame = CANVAS.main.dom.toDataURL()
      STATE.layers[STATE.layersActive].image = CANVAS.main.dom.toDataURL()
      STATE.layers[STATE.layersActive].paintActive = false

      CANVAS.preview.ctx.putImageData(CANVAS.emptyImageData, 0, 0)
      CANVAS.main.ctx.putImageData(CANVAS.emptyImageData, 0, 0)

      STATE.updateAndSave()
    }
  }

  render () {
    return (
      <div
        onGestureStart={(e) => { this.zoom(e) }}
        onGestureChange={(e) => { this.zoom(e) }}
        onGestureEnd={(e) => { this.zoom(e) }}
        onWheel={(e) => { this.zoom(e) }}
        ref={this.canvasContainer}
        data-request='paintCanvas'
        class='txt-center w-full overflow'
        style='cursor: crosshair;'>
        <div class='w-full h-full flex flex-center' data-request='paintCanvas' style='min-width: 1200px; min-height: 1200px;'>
          <div style={`position: relative; pointer-events: none; width: ${STATE.width * (800 / STATE.width)}px; height: 800px; transform: scale(${STATE.scale}) translateX(${STATE.translateX}px) translateY(${STATE.translateY}px); transform-origin: 50% 50%; background: white;`}>
            {
              STATE.layers.map((layer, i) => {
                return <div class='absolute' style={`z-index: ${STATE.layers.length - 1 - i}; width: calc(100% - ${this.padding * 2}px); height: calc(100% - ${this.padding * 2}px); top: ${this.padding}px; left: ${this.padding}px;`}>
                  <div
                    class='relative w-full h-full image-container'
                    style={layer.hidden ? `visibility: hidden; pointer-events: none;` : ''}
                  >
                    <img width={STATE.width} height={STATE.height} class='frame-img w-full h-full' src={`${layer.image}`} style={`visibility: ${layer.paintActive || layer.hidden ? 'hidden' : 'visible'};`} />
                    {i === STATE.layersActive &&
                      <canvas id='canvas-main' width={STATE.width} height={STATE.height} class='absolute w-full h-full' style='top: 0px; left: 0px; z-index: 1;' />
                    }
                    {i === STATE.layersActive &&
                      <canvas id='canvas-preview' width={STATE.width} height={STATE.height} class='absolute w-full h-full' style='top: 0px; left: 0px; z-index: 2;' />
                    }
                  </div>
                </div>
              })
            }
          </div>
        </div>
      </div>
    )
  }
}
