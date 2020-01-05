import { h, Component } from 'preact'
import { STATE, CANVAS } from './state'
import { areRGBAsEqual, assignRGBATo, RGBtoHSL } from './utils'

export class ColorPalette extends Component {
  setColor (i) {
    if (areRGBAsEqual(STATE.color, 0, STATE.palette[i], 0)) return

    assignRGBATo(STATE.color, 0, STATE.palette[i], 0)

    const hsl = RGBtoHSL(STATE.color[0], STATE.color[1], STATE.color[2])

    STATE.hue = Math.floor(hsl.h)
    STATE.saturation = Math.floor(hsl.s)
    STATE.lightness = Math.floor(hsl.l)

    STATE.update()
  }

  addColor () { 
    for (let i = 0; i < STATE.palette.length; i++) {
      if (areRGBAsEqual(STATE.palette[i], 0, STATE.color, 0)) return
    }
    const newColor = [0, 0, 0, 0]
    assignRGBATo(newColor, 0, STATE.color, 0)

    STATE.palette.push(newColor)

    STATE.updateAndSave()
  }

  deleteColor () {
    for (let i = 0; i < STATE.palette.length; i++) {
      if (areRGBAsEqual(STATE.palette[i], 0, STATE.color, 0)) {
        STATE.palette.splice(i, 1)
        STATE.updateAndSave()
      }
    }
  }

  render () {
    return <div class='fl-column' style='min-height: 200px; max-height: 200px;'>
      <div class='bg-mid bord-dark-b p-h-10 p-v-5 h-30'>
        <small style='position: relative; top: -1px;'><b>Color Palette</b></small>
      </div>
      <div class='flex h-30 bord-dark-b w-full fl-justify-between'>
        <button onMouseUp={() => { this.addColor() }} class='bord-dark-r' style='min-width: 30px;'>
          <img src='img/plus.svg' />
        </button>
        <button onMouseUp={() => { this.deleteColor() }} class='bord-dark-l' data-request='deleteLayer' style='min-width: 30px;'>
          <img src='img/trash.svg' />
        </button>
      </div>
      <div class='fl-1 overflow flex fl-wrap' style='align-content: flex-start;'>
        {
          STATE.palette.map((color, i) => {
            const isActive = areRGBAsEqual(color, 0, STATE.color, 0)
            return <button
              onMouseUp={
                () => {
                  this.setColor(i)
                }
              }
              class='m-0 p-0 relative'
              style={{
                minWidth: '30px',
                minHeight: '30px',
                background: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
                border: isActive ? '2px solid rgba(61,61,61, 1)' : '2px solid rgba(61,61,61, 0)',
                boxShadow: `inset 0px 0px 0px 1px rgba(255, 255, 255, ${isActive ? '255' : '0'})`
              }} />
          })
        }
      </div>
    </div>
  }
}