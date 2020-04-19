import { h, render } from 'preact'
import { RGBtoHSL, HSLtoRGB } from './utils'
import { APP, VIEW, canvases } from './data'
import { addToUndo, undo, redo } from './undo-redo'

// Colors
const colorSetHSL = (hsl) => {
  APP.color.hsl = hsl
  APP.color.rgb = HSLtoRGB(hsl)

  VIEW.render()
}

export const colorSetRGB = (rgb) => {
  APP.color.rgb = rgb
  APP.color.hsl = RGBtoHSL(rgb)

  VIEW.render()
}

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
    <div>
      <div class='h-30 bg-mid bord-dark-b fl fl-center-y p-h-10'>
        <small><b>Color</b></small>
      </div>
      <div class='fl fl-justify-between'>
        <div class='fl-1 fl fl-center-y p-h-10 bord-dark-b h-30 bord-dark-b'>
          <div
            class='no-ptr h-30'
            style={`min-height: 18px; width: 18px; border-radius: 100%; background: rgba(${APP.color.rgb[0]}, ${APP.color.rgb[1]}, ${APP.color.rgb[2]}, 255);`} />
        </div>
        <div class='fl bord-dark-b h-30'>
          {APP.palette.filter(c =>
            APP.color.rgb[0] === c[0] &&
            APP.color.rgb[1] === c[1] &&
            APP.color.rgb[2] === c[2] &&
            APP.color.rgb[3] === c[3])
            .length === 0 &&
              <button
                onClick={() => { paletteAdd() }}
                class='w-30 fl fl-center rel bord-dark-l'>
                <img src={`img/insert.svg`} />
              </button>
          }
          {APP.palette.filter(c =>
            APP.color.rgb[0] === c[0] &&
            APP.color.rgb[1] === c[1] &&
            APP.color.rgb[2] === c[2] &&
            APP.color.rgb[3] === c[3])
            .length !== 0 &&
            <button
              onClick={() => { paletteDelete() }}
              class='w-30 fl fl-center bord-dark-l'>
              <img src={`img/delete.svg`} />
            </button>
          }
        </div>
          
      </div>
      <div
        onInput={(e) => {
          const hsl = [APP.color.hsl[0], APP.color.hsl[1], APP.color.hsl[2], APP.color.hsl[3]]
          hsl[parseInt(e.target.dataset.index)] = parseInt(e.target.value)
          
          colorSetHSL(hsl)
        }}
        class='bg-light fl-column p-10 b-r-2 overflow-none'>
        <div class='b-r-2 overflow-none'>
          <div class='fl-column'>
            <form class='fl-column' autocomplete='off'>
              <input
                id='hsl'
                data-index='0'
                type='range'
                class='w-full m-0'
                style='height: 25px; background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);'
                min='0'
                max='359'
                value={APP.color.hsl[0]}/>
            </form>
          </div>
          <div class='fl-column'>
            <form class='fl-column' autocomplete='off'>
              <input
                value={APP.color.hsl[1]}
                data-index='1'
                type='range'
                class='w-full m-0'
                style={`height: 25px; background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 0%, 50%) 0%,hsl(${APP.color.hsl[0]}, 100%, 50%) 100%);`}/>
            </form>
          </div>
          <div class='fl-column'>
            <form class='fl-column' autocomplete='off'>
              <input
                value={APP.color.hsl[2]}
                data-index='2'
                type='range'
                class='w-full m-0'
                style={`height: 25px; background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 100%, 0%) 0%, hsl(${APP.color.hsl[0]}, 100%, 50%) 50%, hsl(${APP.color.hsl[0]}, 100%, 100%) 100%)`}/>
            </form>
        </div>
        </div>
      </div>
      <div class='p-h-10 bord-dark-b' style='padding-bottom: 10px;'>
        <div class='fl fl-wrap b-r-2 overflow-none' style='align-content: baseline;'>
          {
            APP.palette.map(c =>
              <button
                onClick={() => {
                  colorSetRGB(c)
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