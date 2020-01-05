import { h, Component } from 'preact'
import { HSLtoRGB, base64ToImage } from './utils'
import { STATE, CANVAS } from './state'
import { Canvas } from './canvas'
import { Layers } from './layers'

const ToolBarButton = ({ action, icon, active, children }) => {
  return (
    <button
      onMouseUp={action}
      class='flex flex-center m-0 p-0 relative'
      style={`width: 38px; height: 38px; background: ${active ? '#3498db' : ''};`}>
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
    <div style='padding: 5px 0px;'>
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
        <div class='bg-light bord-dark-b flex' style='min-height: 39px; max-height: 39px;'>
          <div class='flex w-full'>
            <div class='fl-1 flex'>
              <div class='flex bord-dark-r' style='position: relative;'>
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
              <div class='bord-dark-r flex'>
                <ToolBarButton action={() => { this.undo() }} icon={'undo.svg'} />
              </div>
            </div>

          </div>
        </div>
        <div class='flex' style='height: calc(100% - 39px);'>
          <div class='bg-light bord-dark-r' style='min-width: 39px; max-width: 39px;'>
            <div class='fl-column' style='position: relative;'>
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
              <div class='bord-dark-t bord-dark-b'>
                <ToolBarButton action={() => { this.toggleView('colorPickerOpen') }}>
                  <div class='b-r-2' style={`min-width: 15px; min-height: 15px; background: rgb(${STATE.color[0]}, ${STATE.color[1]}, ${STATE.color[2]});`} />
                </ToolBarButton>
              </div>
              <div class='bg-light bord-dark' style={`visibility:${STATE.colorPickerOpen ? 'visible' : 'hidden'}; padding: 10px 15px; position: absolute; left: 100%; bottom: 0px; width: 250px; z-index: 5;`}>
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
          <Canvas />
          <div class='bg-light bord-dark-l' style='width: 300px;'>
            <Layers />
          </div>
        </div>
      </div>
    )
  }
}
