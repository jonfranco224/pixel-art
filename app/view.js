import { h, render } from 'preact'
import { APP, colorSetHSL, colorSetRGB, setTool, paletteAdd, paletteDelete } from './app'

const UI = {
  file: {
    open: false
  },
  color: {
    open: false
  },
  frames: []
}

// Render canvases separately to conform to one way data flow
// down to view even though no direct access to ctx within html
let canvasTemp, canvasFinal, canvasView

const initCanvases = () => {
  canvasTemp = document.createElement('canvas')
  canvasFinal = document.createElement('canvas')
  canvasView = document.querySelector('#canvas-view')
}

const updateCanvases = () => {
  canvasTemp.width = APP.width
  canvasTemp.height = APP.height
  canvasFinal.width = APP.width
  canvasFinal.height = APP.height
  
  const ctxTemp = canvasTemp.getContext('2d')
  const ctxFinal = canvasFinal.getContext('2d')
  const ctxView = canvasView.getContext('2d')

  APP.frames[APP.frameActive].layers.forEach(layer => {
    ctxTemp.putImageData(layer, 0, 0)
    ctxFinal.drawImage(canvasTemp, 0, 0)
  })
  
  APP.frames[APP.frameActive].imageData = ctxFinal.getImageData(0, 0, APP.width, APP.height)
  APP.frames[APP.frameActive].base64 = canvasFinal.toDataURL()
  ctxView.drawImage(canvasFinal, 0, 0)
}

export const viewUpdate = () => {
  render(<View />, document.body, document.body.lastChild)
  
  updateCanvases()
  
  console.log('View updated.')
}

export const View = () => {
  return <div class='h-full'>
    <div class='h-40 bg-light bord-dark-b fl'>
      <div class="fl w-full">
        <div class="fl-1 fl">
          <div class="fl bord-dark-r rel w-40"
            onMouseLeave={() => {
              UI.file.open = false
              viewUpdate()
            }}>
            <button
              onClick={() => {
                UI.file.open = !UI.file.open
                viewUpdate()
              }}
              class="fl fl-center m-0 p-0 w-40">
              <img src="img/bars.svg" />
            </button>
            <div
              class="bg-light fl-column bord-dark abs z-5"
              style={`visibility: ${UI.file.open ? 'visible' : 'hidden'}; top: 10px; left: 10px;`}>
              {
                ['new', 'download'].map(id => 
                  <button class="m-0 p-h-15 h-40 fl fl-center-y">
                    <img src={`img/${id}.svg`} />
                    <small class="bold p-h-10" style='text-transform: capitalize;'>{id}</small>
                  </button>
                )
              }
            </div>
          </div>
          <div class='fl-1 fl fl-justify-center'>
            <button class="fl fl-center m-0 p-0 w-40 bord-dark-l bord-dark-r">
              <img src="img/undo.svg" />
            </button>
            <button class="fl fl-center m-0 p-0 w-40 bord-dark-r">
              <img src="img/redo.svg" />
            </button>
          </div>
        </div>
        <div class="fl" style="max-width: 241px; min-width: 241px;">
          
        </div>
      </div>
    </div>
    <div class='fl' style='height: calc(100% - 40px);'>
      <div class='w-40 bg-light bord-dark-r'>
        {
          ['pencil', 'eraser', 'line', 'circle', 'square', 'fill', 'eye-dropper', 'select'].map(tool => 
            <button onClick={() => { setTool(tool) }} class="fl fl-center m-0 p-0 w-40 h-40 bord-dark-r" style={`${APP.tool === tool ? 'background: rgba(52, 152, 219, 255);' : ''}`}>
              <img src={`img/${tool}.svg`} />
            </button>
          )
        }
      </div>
      <div class='w-full overflow fl-column' style='cursor: crosshair;'>
        <div class='fl-1'>
          <canvas
            id='canvas-view'
            width={APP.width}
            height={APP.height}
            style='width: 400px; height: 400px; background: white; margin: 10px;' />
        </div>
        <div class='bg-light bord-dark-t'>
          <div class='fl bord-dark-b'>
            <div class='fl-1 fl'>
              <div class='bg-mid h-30 bord-dark-r fl fl-center-y p-h-15'>
                <small><b>Timeline</b></small>
              </div>
              <button class='w-30 h-30 fl fl-center bord-dark-r'>
                <img src={`img/plus.svg`} />
              </button>
              <button class='w-30 h-30 fl fl-center bord-dark-r'>
                <img src={`img/clone.svg`} />
              </button>
              <button class='w-30 h-30 fl fl-center bord-dark-r'>
                <img src={`img/up.svg`} />
              </button>
              <button class='w-30 h-30 fl fl-center bord-dark-r'>
                <img src={`img/down.svg`} />
              </button>
              <button class='w-30 h-30 fl fl-center bord-dark-r'>
                <img src={`img/trash.svg`} />
              </button>
            </div>
            <div class='fl-1 fl fl-justify-center'>
              <button class="fl fl-center m-0 p-0 w-30 h-30 bord-dark-l">
                <img src={`img/lastframe.svg`} />
              </button>
              <button class="fl fl-center m-0 p-0 w-30 h-30 bord-dark-r bord-dark-l">
                <img src={`img/play.svg`} />
              </button>
              <button class="fl fl-center m-0 p-0 w-30 h-30 bord-dark-r">
                <img src={`img/nextframe.svg`} />
              </button>
            </div>
            <div class='fl-1'>
            </div>  
          </div>
          <div class='fl p-10'>
            {
              APP.frames.map(frame => {
                return <button class='p-5 no-hover' style='background: rgba(52, 152, 219, 255);'>
                  {/* <div class='fl p-5' style='padding-bottom: 5px; background: rgba(52, 152, 219, 255);'>
                    <small><b>1</b></small>
                  </div> */}
                  <img style='width: 60px; height: 60px;' src={frame.base64} />
                </button>
              })
            }

            
            
          </div>
        </div>
      </div>
      <div class='bg-light bord-dark-l' style="max-width: 249px; min-width: 249px;">
        <div class='h-30 bg-mid bord-dark-b fl fl-center-y p-h-10'>
          <small><b>Color</b></small>
        </div>
        <div class='h-30 bord-dark-b fl fl-justify-between'>
          <div class='fl rel'>
            <div
              onInput={(e) => {
                const hsl = [APP.color.hsl[0], APP.color.hsl[1], APP.color.hsl[2], APP.color.hsl[3]]
                hsl[parseInt(e.target.dataset.index)] = parseInt(e.target.value)
                
                colorSetHSL(hsl)
              }}
              class='abs bg-light bord-dark fl-column'
              style={`visibility: ${UI.color.open ? 'visible' : 'hidden'}; width: 225px; left: -225px; top: -1px; padding: 15px;`}>
              <div class='fl-column' style='padding-bottom: 5px;'>
                <div class='fl fl-justify-between' style='padding-bottom: 5px;'>
                  <small><b>Hue</b></small>
                  <small>{APP.color.hsl[0]}</small>
                </div>
                <input
                  value={APP.color.hsl[0]}
                  data-index='0'
                  type='range'
                  class='b-r-2 w-full m-0'
                  style='background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);'
                  min='0'
                  max='359'/>
              </div>
              <div class='fl-column' style='padding-bottom: 5px;'>
                <div class='fl fl-justify-between' style='padding-bottom: 5px;'>
                  <small><b>Saturation</b></small>
                  <small>{APP.color.hsl[1]}</small>
                </div>
                <input
                  value={APP.color.hsl[1]}
                  data-index='1'
                  type='range'
                  class='b-r-2 w-full m-0'
                  style={`background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 0%, 50%) 0%,hsl(${APP.color.hsl[0]}, 100%, 50%) 100%);`}/>
              </div>
              <div class='fl-column' style='padding-bottom: 5px;'>
                <div class='fl fl-justify-between' style='padding-bottom: 5px;'>
                  <small><b>Lightness</b></small>
                  <small>{APP.color.hsl[2]}</small>
                </div>
                <input
                  value={APP.color.hsl[2]}
                  data-index='2'
                  type='range'
                  class='b-r-2 w-full m-0'
                  style={`background: linear-gradient(to right, hsl(${APP.color.hsl[0]}, 100%, 0%) 0%, hsl(${APP.color.hsl[0]}, 100%, 50%) 50%, hsl(${APP.color.hsl[0]}, 100%, 100%) 100%)`}/>
              </div>
            </div>
            <button
              onClick={() => {
                UI.color.open = !UI.color.open
                viewUpdate()
              }}
              class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
              <div
                class='b-r-2 w-15 h-15 no-ptr'
                style={`background: rgba(${APP.color.rgb[0]}, ${APP.color.rgb[1]}, ${APP.color.rgb[2]}, 255);`} />
            </button>
            {APP.palette.indexOf(APP.color.rgb) === -1 &&
              <button
                onClick={() => { paletteAdd() }}
                class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
                <img src={`img/plus.svg`} />
              </button>
            }
          </div>
          <div class='fl bord-dark-l'>
            <button
              onClick={() => { paletteDelete() }}
              class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
              <img src={`img/trash.svg`} />
            </button>
          </div>
        </div>
        <div class='fl fl-wrap overflow' style='min-height: 135px; max-height: 135px; align-content: baseline;'>
          {
            APP.palette.map(color =>
              <button
                onClick={() => {
                  colorSetRGB(color)
                }}
                class='w-30 h-30 m-0'
                style={`
                  background: rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]});
                  border: ${color === APP.color.rgb ? '2px solid rgba(61,61,61, 1)' : '2px solid rgba(61,61,61, 0)'};
                  box-shadow: inset 0px 0px 0px 1px rgba(255, 255, 255, ${color === APP.color.rgb ? '255' : '0'});
                `} />
            )
          }
        </div>
        <div class='h-30 bg-mid bord-dark-b bord-dark-t fl fl-center-y p-h-10'>
          <small><b>Layers</b></small>
        </div>
        <div class='h-30 bord-dark-b fl fl-justify-between'>
          <div class='fl'>
            <button class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
              <img src={`img/plus.svg`} />
            </button>
            <button class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
              <img src={`img/up.svg`} />
            </button>
            <button class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
              <img src={`img/down.svg`} />
            </button>
          </div>
          <div class='fl bord-dark-l'>
            <button class='w-30 h-30 fl fl-center bord-dark-r bord-dark-b'>
              <img src={`img/trash.svg`} />
            </button>
          </div>
        </div>
        <div style='min-height: 120px; max-height: 120px;'>
          {
            APP.layers.map(layer => 
              <div class='h-30 fl'>
                <button class='w-30 fl fl-center' style='border-right: 1px solid rgb(61, 61, 61);'>
                  <img src={`img/eye-active.svg`} />
                </button>
                <button class='w-full txt-left p-h-10'>
                  <small style='font-size: 11px;'><b>{layer.name}</b></small>
                </button>
              </div>
            )
          }
        </div>
      </div>
    </div>
    
  </div>
}

export const viewInit = () => {
  render(<View />, document.body)
  
  initCanvases()
  updateCanvases()

  console.log('View started.')
}