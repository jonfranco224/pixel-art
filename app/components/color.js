import { h, render, createRef } from 'preact'
import { RGBtoHSL, HSLtoRGB } from '../utils'
import { APP, VIEW } from '../state'
import { addToUndo, undo, redo } from '../undo-redo'

const enableActiveInput = (id, val) => {
  VIEW.activeInput.id = id
  VIEW.activeInput.val = val
  
  VIEW.render()
}

const disableActiveInput = () => {
  VIEW.activeInput.id = ''
  VIEW.activeInput.val = ''
  
  VIEW.render()
}

const setActiveInput = (val) => {
  VIEW.activeInput.val = val
}

export const setRGB = (newRGB) => {
  const rgb = newRGB
  const hsl = RGBtoHSL(rgb)

  APP.color.rgb = rgb
  APP.color.hsl = hsl

  VIEW.render()
}

const setHSL = (newHSL) => {
  const hsl = newHSL
  const rgb = HSLtoRGB(hsl)

  APP.color.hsl = hsl
  APP.color.rgb = rgb
  
  VIEW.render()
}

const setRed = (e) => {
  const r = parseInt(e.target.value)

  if (r >= 0 && r <= 255) {
    const newRGB = [r, APP.color.rgb[1], APP.color.rgb[2], APP.color.rgb[3]]
    setRGB(newRGB)
  }
}

const setGreen = (e) => {
  const g = parseInt(e.target.value)

  if (g >= 0 && g <= 255) {
    const newRGB = [APP.color.rgb[0], g, APP.color.rgb[2], APP.color.rgb[3]]
    setRGB(newRGB)
  }
}

const setBlue = (e) => {
  const b = parseInt(e.target.value)

  if (b >= 0 && b <= 255) {
    const newRGB = [APP.color.rgb[0], APP.color.rgb[1], b, APP.color.rgb[3]]
    setRGB(newRGB)
  }
}

const setHue = (e) => {
  const h = parseInt(e.target.value)
  
  if (h >= 0 && h <= 360) {
    const newHSL = [h, APP.color.hsl[1], APP.color.hsl[2], APP.color.hsl[3]]
    setHSL(newHSL)
  }
}

const setSaturation = (e) => {
  const s = parseInt(e.target.value)
  
  if (s >= 0 && s <= 100) {
    const newHSL = [APP.color.hsl[0], s, APP.color.hsl[2], APP.color.hsl[3]]
    setHSL(newHSL)
  }
}

const setLightness = (e) => {
  const l = parseInt(e.target.value)
  
  if (l >= 0 && l <= 100) {
    const newHSL = [APP.color.hsl[0], APP.color.hsl[1], l, APP.color.hsl[3]]
    setHSL(newHSL)
  }
}

const setHex = () => {}

const paletteAdd = () => {
  APP.palette.push(APP.color.rgb)
  
  VIEW.render()
}

const paletteDelete = (i) => {
  const index = APP.palette.indexOf(APP.color.rgb)

  if (index !== -1) {
    APP.palette.splice(index, 1)
    VIEW.render()
  } 
}

export const Color = () => {
  return (
    <div class='bord-dark-b fl-1'>
      <div class='h-30 bg-mid bord-dark-b fl fl-center-y p-h-10'>
        <small><b>Color</b></small>
      </div>
      <div class='fl-column overflow-none p-10'>
        <div class='b-r-2 overflow-none fl-column'>
          {
            [
              {
                id: 'color-hue-range',
                min: 0,
                max: 360,
                func: setHue,
                style: `min-height: 26px; background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);`
              }, {
                id: 'color-saturation-range',
                min: 0,
                max: 100,
                func: setSaturation,
                style: `min-height: 26px; background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 0%, 50%) 0%,hsl(${APP.color.hsl[0]}, 100%, 50%) 100%);`
              }, {
                id: 'color-lightness-range',
                min: 0,
                max: 100,
                func: setLightness,
                style: `min-height: 26px; background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 100%, 0%) 0%, hsl(${APP.color.hsl[0]}, 100%, 50%) 50%, hsl(${APP.color.hsl[0]}, 100%, 100%) 100%)`
              }
            ].map((item, i) => {
              return <input
                type='range'
                min={item.min}
                max={item.max}
                style={item.style}
                class='fl-1 m-0'
                onFocus={(e) => {
                  enableActiveInput(item.id, APP.color.hsl[i])
                }}
                onFocusOut={() => {
                  disableActiveInput()
                }}
                onInput={(e) => {
                  setActiveInput(e.target.value)
                  item.func(e)
                }}
                value={VIEW.activeInput.id === item.id ? VIEW.activeInput.val : APP.color.hsl[i]}
              />
            })
          }
        </div>
        <div class='p-v-10'>
          <div class='fl fl-center-y' style='margin-bottom: 2px;'>
            <small style='width: 50px; font-size: 11px;'>HSL</small>
            {
              [
                {
                  id: 'color-hue-text',
                  func: setHue
                }, {
                  id: 'color-saturation-text',
                  func: setSaturation
                }, {
                  id: 'color-lightness-text',
                  func: setLightness
                }
              ].map((item, i) => {
                return <input
                  class='fl-1'
                  type='number'
                  style={`margin-right: ${i === 2 ? 0 : 2}px;`}
                  onFocus={(e) => {
                    enableActiveInput(item.id, APP.color.hsl[i])
                  }}
                  onFocusOut={() => {
                    disableActiveInput()
                  }}
                  onInput={(e) => {
                    setActiveInput(e.target.value)
                    item.func(e)
                  }}
                  value={VIEW.activeInput.id === item.id ? VIEW.activeInput.val : APP.color.hsl[i]}
                />
              })
            }
          </div>
          <div class='fl fl-center-y' style='margin-bottom: 2px;'>
            <small style='width: 50px; font-size: 11px;'>RGB</small>
            {
              [
                {
                  id: 'color-red-text',
                  func: setRed
                }, {
                  id: 'color-green-text',
                  func: setGreen
                }, {
                  id: 'color-blue-text',
                  func: setBlue
                }
              ].map((item, i) => {
                return <input
                  class='fl-1'
                  type='number'
                  style={`margin-right: ${i === 2 ? 0 : 2}px;`}
                  onFocus={(e) => {
                    enableActiveInput(item.id, APP.color.rgb[i])
                  }}
                  onFocusOut={() => {
                    disableActiveInput()
                  }}
                  onInput={(e) => {
                    setActiveInput(e.target.value)
                    item.func(e)
                  }}
                  value={VIEW.activeInput.id === item.id ? VIEW.activeInput.val : APP.color.rgb[i]}
                />
              })
            }
          </div>
          {/* <div class='fl fl-center-y'>
            <small style='width: 50px; font-size: 11px;'>HEX</small>
            <input class='fl-1' type='text' />
          </div> */}
        </div>
        <div class='fl'>
          <div
            class='fl-1 no-ptr h-25 b-r-2'
            style={`margin-right: 10px; background: rgba(${APP.color.rgb[0]}, ${APP.color.rgb[1]}, ${APP.color.rgb[2]}, 255); margin-bottom: 10px; `}>
          </div>
          {APP.palette.filter(c =>
            APP.color.rgb[0] === c[0] &&
            APP.color.rgb[1] === c[1] &&
            APP.color.rgb[2] === c[2] &&
            APP.color.rgb[3] === c[3])
            .length === 0
            ? <button
                onClick={() => { paletteAdd() }}
                class='w-30 h-25 fl fl-center bg-dark bord-dark b-r-2'>
                <img src={`img/insert.svg`} />
              </button>
            : <button
              onClick={() => { paletteDelete() }}
              class='w-30 h-25 fl fl-center bg-dark bord-dark b-r-2'>
              <img src={`img/delete.svg`} />
            </button>
          }
        </div>
        <div class='fl fl-wrap overflow-none b-r-2' style='align-content: baseline;'>
          {
            APP.palette.map(c =>
              <button
                onClick={() => {
                  setRGB(c)
                }}
                class='m-0'
                style={`
                  width: 44px;
                  min-height: 25px;
                  background: rgba(${c[0]}, ${c[1]}, ${c[2]}, ${c[3]});
                  border: ${
                    APP.color.rgb[0] === c[0] &&
                    APP.color.rgb[1] === c[1] &&
                    APP.color.rgb[2] === c[2] &&
                    APP.color.rgb[3] === c[3] ? '2px solid rgba(61,61,61, 1)' : '2px solid rgba(61,61,61, 0)'};
                  box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, ${
                    APP.color.rgb[0] === c[0] &&
                    APP.color.rgb[1] === c[1] &&
                    APP.color.rgb[2] === c[2] &&
                    APP.color.rgb[3] === c[3] ? '255' : '0'});
                `} />
            )
          }
        </div>
      </div>
    </div>
  )
}