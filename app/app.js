import { h, Component, createRef } from 'preact'
import { HSLtoRGB, RGBtoHSL, getColorAtPixel, setPoint, line, circle, square, fill, base64ToImage } from './utils'
import { STATE, CANVAS } from './state'
import { timingSafeEqual } from 'crypto'

const ToolBarButton = ({ action, icon, active, children }) => {
  return (
    <button
      onMouseUp={action}
      class='flex flex-center m-0 p-0 relative h-35'
      style={`width: 35px; background: ${active ? '#3498db' : ''};`}>
      {children.length > 0 ? children : <img src={`img/${icon}`} />}
    </button>
  )
}

const MenuButton = ({ action, icon, label }) => {
  return (
    <button
      onMouseUp={action}
      onTouchEnd={action}
      class='m-0 p-h-10 h-35 flex flex-center-y'>
      <img src={`img/${icon}`} />
      <small class='bold p-h-10'>{label}</small>
    </button>
  )
}

const ColorSlider = ({ label, hue, value, action, onTouchInput, min, max }) => {
  // label
  // val - current val of label
  // hue - STATE
  // action is to setHSL
  
  const bgMap = {
    'Hue': () => { return 'background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);' },
    'Saturation': (hue) => { return `background: linear-gradient(to right, hsl(${hue}, 0%, 50%) 0%,hsl(${hue}, 100%, 50%) 100%);` },
    'Lightness': (hue) => { return `background: linear-gradient(to right, hsl(${hue}, 100%, 0%) 0%, hsl(${hue}, 100%, 50%) 50%, hsl(${hue}, 100%, 100%) 100%);` }
  }

  return (
    <div style='margin-bottom: 10px;'>
      <div class='flex' style='justify-content: space-between; padding-bottom: 2px;'>
        <small class='bold' style='display: block; margin-bottom: 2px;'>{label}</small>
        <small class='txt-center' style='padding-left: 10px; width: 30px;'>{value}</small>
      </div>
      <div
        class='fl-1 b-r-2 flex flex-center-y relative'
        style={`cursor: pointer; ${bgMap[label](hue)}`}
      >
        <input type='range' class='w-full m-0' min={min} max={max} value={value} onInput={action} onTouchStart={onTouchInput} onTouchMove={onTouchInput} />
      </div>
    </div>
  )
}

export default class App extends Component {
  constructor () {
    super()
    this.updateAndSave = this.updateAndSave.bind(this)
    this.update = this.update.bind(this)
    this.save = this.save.bind(this) 
  }

  async componentWillMount () {
    STATE.updateAndSave = this.updateAndSave
    STATE.update = this.update
    STATE.save = this.save

    if (window.localStorage.length > 0) {
      this.load()
    }
  }

  async componentDidMount () { // main
    CANVAS.main.dom = document.querySelector('#canvas-main')
    CANVAS.preview.dom = document.querySelector('#canvas-preview')

    // if we're loading from URL
      // new canvas loaded from URL
      // this needs its own undo history and such
      // clean up if not saved locally
    // if not, do below
    if (window.localStorage.length === 0) {
      this.newCanvas(STATE.width, STATE.height)
    } else {
      this.setupCanvases(STATE.width, STATE.height)
    
      const img = await base64ToImage(STATE.currentFrame)
      CANVAS.main.ctx.drawImage(img, 0, 0)
      CANVAS.main.imageData = CANVAS.main.ctx.getImageData(0, 0, STATE.width, STATE.height)
  
      this.updateAndSave()
    }
  }

  setupCanvases (width, height) {
    const canvasList = [CANVAS.main, CANVAS.preview]

    canvasList.forEach(canvas => {
      canvas.dom.width = width
      canvas.dom.height = height
      canvas.ctx = canvas.dom.getContext('2d')
      canvas.imageData = canvas.ctx.getImageData(0, 0, width, height)
    })

    CANVAS.emptyImageData = new window.ImageData(width, height)
  }

  newCanvas (width, height) {
    this.setupCanvases(width, height)
  }

  save () {
    Object.keys(STATE).forEach(key => {
      if (key === 'update') return
      if (key === 'save') return
      if (key === 'updateAndSave') return

      if (STATE[key] === null || STATE[key] === undefined) {
        console.error(`STATE: Setting undefined to ${key}`)
      }

      window.localStorage.setItem(key, JSON.stringify(STATE[key]))
    })
  }

  load () {
    Object.keys(window.localStorage).forEach(key => {
      STATE[key] = JSON.parse(window.localStorage.getItem(key))
    })
  }

  update () {
    this.setState()
  }

  updateAndSave () {
    this.save()
    this.setState()
  }

  setTool (tool) {
    STATE.tool = tool

    this.updateAndSave()
  }

  setHSL ({ hue, saturation, lightness }) {
    const RGB = HSLtoRGB(hue, saturation, lightness)

    STATE.hue = hue
    STATE.saturation = saturation
    STATE.lightness = lightness

    STATE.color[0] = RGB.r
    STATE.color[1] = RGB.g
    STATE.color[2] = RGB.b

    this.updateAndSave()
  }

  toggleView (view) {
    STATE[view] = !STATE[view]

    this.updateAndSave()
  }

  render () {
    console.log('View Rendered')
    return (
      <div class='h-full'>
        <div class='bg-light bord-dark-b' style='min-height: 36px; max-height: 36px;'>
          <div class='flex w-full' style='max-width: 580px; margin: 0 auto;'>
            <div class='fl-1 flex'>
              <div class='flex bord-dark-l' style='position: relative;'>
                <ToolBarButton action={() => { this.toggleView('fileOpen') }} icon={'bars.svg'} />
                <div class='bg-light fl-column bord-dark' style={`visibility: ${STATE.fileOpen ? 'visible' : 'hidden'}; position: absolute; top: 100%; left: 0px; z-index: 5;`}>
                  {[
                    {
                      icon: 'folder-plus.svg',
                      label: 'New',
                      action: () => {
                        // launch modal
                        this.toggleView('fileOpen')
                      }
                    }, {
                      icon: 'download.svg',
                      label: 'Download',
                      action: () => {
                        // launch modal
                        this.toggleView('fileOpen')
                      }
                    }, {
                      icon: 'link.svg',
                      label: 'Share',
                      action: () => {
                        // laundch modal
                        this.toggleView('fileOpen')
                      }
                    }
                  ].map((item, i) => {
                    return <MenuButton action={item.action} icon={item.icon} label={item.label} />
                  })}
                </div>
              </div>
              <div class='bord-dark-l bord-dark-r flex'>
                <ToolBarButton action={() => { this.undo() }} icon={'undo.svg'} />
              </div>
            </div>
            <div class='flex bord-dark-r bord-dark-l' style='position: relative;'>
              {[
                'pencil.svg',
                'eraser.svg',
                'line.svg',
                'circle.svg',
                'square.svg',
                'fill.svg',
                'eye-dropper.svg'
              ].map((icon, i) => {
                return <ToolBarButton action={() => { this.setTool(i) }} icon={icon} active={i === STATE.tool} />
              })}
              <div class='bord-dark-l'>
                <ToolBarButton action={() => { this.toggleView('colorPickerOpen') }}>
                  <div class='b-r-2' style={`min-width: 15px; min-height: 15px; background: rgb(${STATE.color[0]}, ${STATE.color[1]}, ${STATE.color[2]});`} />
                </ToolBarButton>
              </div>
              <div class='bg-light bord-dark-t' style={`visibility:${STATE.colorPickerOpen ? 'visible' : 'hidden'}; padding: 10px 15px; position: absolute; top: 100%; right: 0px; width: 100%; z-index: 5;`}>
                <ColorSlider
                  label='Hue'
                  hue={STATE.hue}
                  value={STATE.hue}
                  min='0'
                  max='359'
                  onTouchInput={(e) => {
                    e.preventDefault() // prevent scroll down
                    // More responsive action on mobile than default
                    const bb = e.target.getBoundingClientRect()
                    const offset = e.touches ? e.touches[0].pageX - bb.left : e.offsetX
                    const val = Math.floor(offset * (360 / e.target.clientWidth)) | 0

                    if (val < 0 || val >= 360) return

                    this.setHSL({ hue: val, saturation: STATE.saturation, lightness: STATE.lightness })
                  }}
                  action={(e) => {
                    this.setHSL({ hue: parseInt(e.target.value), saturation: STATE.saturation, lightness: STATE.lightness })
                  }}
                />
                <ColorSlider
                  label='Saturation'
                  hue={STATE.hue}
                  value={STATE.saturation}
                  min='0'
                  max='100'
                  onTouchInput={(e) => {
                    e.preventDefault() // prevent scroll down
                    // More responsive action on mobile than default
                    const bb = e.target.getBoundingClientRect()
                    const offset = e.touches ? e.touches[0].pageX - bb.left : e.offsetX
                    const val = Math.floor(offset * (100 / e.target.clientWidth)) | 0

                    if (val < 0 || val >= 100) return

                    this.setHSL({ hue: STATE.hue, saturation: val, lightness: STATE.lightness })
                  }}
                  action={(e) => {
                    this.setHSL({ hue: STATE.hue, saturation: parseInt(e.target.value), lightness: STATE.lightness })
                  }}
                />
                <ColorSlider
                  label='Lightness'
                  hue={STATE.hue}
                  value={STATE.lightness}
                  min='0'
                  max='100'
                  onTouchInput={(e) => {
                    e.preventDefault() // prevent scroll down
                    // More responsive action on mobile than default
                    const bb = e.target.getBoundingClientRect()
                    const offset = e.touches ? e.touches[0].pageX - bb.left : e.offsetX
                    const val = Math.floor(offset * (100 / e.target.clientWidth)) | 0

                    if (val < 0 || val >= 100) return

                    this.setHSL({ hue: STATE.hue, saturation: STATE.saturation, lightness: val })
                  }}
                  action={(e) => {
                    this.setHSL({ hue: STATE.hue, saturation: STATE.saturation, lightness: parseInt(e.target.value) })
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <Canvas />
      </div>
    )
  }
}

class Canvas extends Component {
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

  componentDidMount () {
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

    resizeCanvas()
  }

  setOrientation (e, zoom) {
    // const offsetX = (window.innerWidth / 2) - (e.target.children[0].clientWidth / 2)
    // const offsetY = (window.innerHeight / 2) - (e.target.children[0].clientHeight / 2) + 18

    // const mouseX = Math.floor(e.pageX - offsetX)
    // const mouseY = Math.floor(e.pageY - offsetY)
    const bb = this.canvasContainer.current.children[0].children[0].getBoundingClientRect()
    
    const maxWidth = this.canvasContainer.current.children[0].clientWidth
    const currWidth = bb.width

    const scaleCurr = STATE.scale
    const scaleNext = zoom || STATE.scale

    if (scaleNext > scaleCurr && currWidth >= maxWidth - 50) return

    // STATE.translateX -= (-((mouseX / scaleNext) - (mouseX / scaleCurr)))
    // STATE.translateY -= (-((mouseY / scaleNext) - (mouseY / scaleCurr)))
    STATE.scale = scaleNext

    STATE.updateAndSave()
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

    if (WINDOW.REQUEST !== 'paintCanvas') return

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
      fill(CANVAS.main.ctx, CANVAS.main.imageData, STATE.width, STATE.height, currX, currY, STATE.color)
    }

    if (STATE.tool === EYE_DROPPER && type === 'up') {
      let sampled = getColorAtPixel(CANVAS.main.imageData, currX, currY)

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
      CANVAS.preview.imageData.data.set(CANVAS.emptyImageData.data)
      STATE.currentFrame = CANVAS.main.dom.toDataURL()
      STATE.updateAndSave()
    }
  }

  render () {
    // overflow: scroll; overflow: overlay;
    return (
      <div
        onGestureStart={(e) => { this.zoom(e) }}
        onGestureChange={(e) => { this.zoom(e) }}
        onGestureEnd={(e) => { this.zoom(e) }}
        onWheel={(e) => { this.zoom(e) }}
        ref={this.canvasContainer}
        data-request='paintCanvas'
        class='txt-center'
        style='crosshair; height: calc(100% - 36px); overflow: overlay; overflow: scroll;'>
        <div class='w-full h-full flex flex-center' data-request='paintCanvas' style='min-width: 1200px; min-height: 1200px;'>
          <div style={`position: relative; pointer-events: none; width: ${STATE.width * (800 / STATE.width)}px; height: 800px; transform: scale(${STATE.scale}) translateX(${STATE.translateX}px) translateY(${STATE.translateY}px); transform-origin: 50% 50%;`}>
            <canvas id='canvas-main' class='absolute' style={`width: calc(100% - ${this.padding * 2}px); height: calc(100% - ${this.padding * 2}px); top: ${this.padding}px; left: ${this.padding}px; z-index: 1; background: white;`} />
            <canvas id='canvas-preview' class='absolute' style={`width: calc(100% - ${this.padding * 2}px); height: calc(100% - ${this.padding * 2}px); top: ${this.padding}px; left: ${this.padding}px; z-index: 2;`} />
          </div>
        </div>
      </div>
    )
  }
}
