import { h, render } from 'preact'
import { APP, VIEW } from '../state'
import { addToUndo } from '../undo-redo'

const setTargetCanvas = (frame, layer) => {
  if (frame === undefined) console.error('setTargetCanvas - no frame given')
  if (layer === undefined) console.error('setTargetCanvas - no layer given')

  if (frame >= 0 && frame < APP.frameCount && layer >= 0 && layer <= APP.layerCount) {
    APP.frameActive = frame
    APP.layerActive = layer

    VIEW.render()
  }
}

const seq = (request, type, data) => {
  const inserting = request === 'insert' || request === 'duplicate'
  
  function action (req, ref, target, entry) {
    if (req === 'insert') ref.splice(target + 1, 0, entry)
    if (req === 'delete') ref.splice(target, 1)
  }

  if (type === 'layer') {
    if (request === 'insert') {
      action(request, APP.layers, APP.layerActive, data)
    }

    if (request === 'delete') {
      action(request, APP.layers, APP.layerActive)
    }
  }

  if (type === 'frame') {
    if (request === 'insert') {
      APP.layers.forEach((layer, i) => {
        const entry = new ImageData(APP.width, APP.height)
        entry.data.set(data[i].data)
        action(request, layer.frames, APP.frameActive, entry)
      })
    }

    if (request === 'delete') {
      APP.layers.forEach(layer => {
        action(request, layer.frames, APP.frameActive)
      })
    }
  }

  APP[`${type}Count`] += (inserting ? 1 : -1)

  if (inserting) {
    APP[`${type}Active`] += 1
  } 
  
  if (request === 'delete') {
    if (APP[`${type}Active`] === APP[`${type}Count`]) {
      APP[`${type}Active`] -= 1
    } 
  }
}

export const timelineManager = ({ type, request, requestType, data, disableUndoRedo }) => {
  const layerActive = APP.layerActive
  const frameActive = APP.frameActive
  const layerCount = APP.layerCount
  const frameCount = APP.frameCount

  if (!disableUndoRedo) {
    addToUndo(request, type)

    VIEW.currUndoRef.redo = () => {
      APP.frameCount = frameCount
      APP.layerCount = layerCount
      APP.frameActive = frameActive
      APP.layerActive = layerActive
      timelineManager({ type, request, requestType, data, disableUndoRedo: true })
    }
  }

  const newData = type === 'layer' ? {
    name: `Layer ${layerCount + 1}`,
    hidden: false,
    frames: new Array(frameCount).fill(undefined).map(frame => new ImageData(APP.width, APP.height))
  } : new Array(APP.layerCount)
    .fill(undefined)
    .map(item => {
      return new ImageData(APP.width, APP.height)
    })
  
  const cloneData = type === 'layer' ? {
    name: `${APP.layers[layerActive].name} ${requestType === 'clone' ? '(Copy)' : ''}`,
    hidden: false,
    frames: new Array(frameCount)
      .fill(undefined)
      .map((frame, frameI) => {
        const imgData = new ImageData(APP.width, APP.height)
        imgData.data.set(APP.layers[layerActive].frames[frameI].data)
        return imgData
      })
  } : new Array(layerCount)
      .fill(undefined)
      .map((item, i) => {
        const copy = new ImageData(APP.width, APP.height)
        copy.data.set(APP.layers[i].frames[frameActive].data)
        return copy
      })
  
  if ((type === 'layer' || type === 'frame') && (requestType === 'new' || requestType === 'clone')) {
    seq('insert', type, requestType === 'new' ? newData : cloneData)
  }

  if ((type === 'layer' || type === 'frame') && request === 'delete') {
    if (APP[`${type}Count`] - 1 === 0) {
      seq('delete', type)
      if (type === 'layer') newData.name = 'Layer 1'
      seq('insert', type, newData)
    } else {
      seq('delete', type)
    }
  }

  const layerActiveAfter = APP.layerActive
  const frameActiveAfter = APP.frameActive
  const layerCountAfter = APP.layerCount
  const frameCountAfter = APP.frameCount
  
  if (!disableUndoRedo) {
    VIEW.currUndoRef.undo = () => {
      APP.frameCount = frameCountAfter
      APP.layerCount = layerCountAfter
  
      if (type === 'layer') {
        APP.frameActive = frameActiveAfter
        
        if (request === 'insert') {
          APP.layerActive = layerActiveAfter
          seq('delete', type)
        }
  
        if (request === 'delete' && layerCount !== 1) {
          APP.layerActive = layerActive - 1
          seq('insert', type, cloneData)
        }

        if (request === 'delete' && layerCount === 1) {
          seq('delete', type)
          seq('insert', type, cloneData)
        }
      }

      if (type === 'frame') {
        APP.layerActive = layerActiveAfter
        
        if (request === 'insert') {
          APP.frameActive = frameActiveAfter
          seq('delete', type)
        }
  
        if (request === 'delete' && frameCount !== 1) {
          APP.frameActive = frameActive - 1
          seq('insert', type, cloneData)
        }

        if (request === 'delete' && frameCount === 1) {
          seq('delete', type)
          seq('insert', type, cloneData)
        }
      }
    }
  }

  VIEW.render()
}

const swap = (type, dir) => {
  const step = dir === 'up' ? -1 : 1
  const active = type === 'layer' ? 'layerActive' : 'frameActive'
  const length = type === 'layer' ? APP.layerCount : APP.frameCount

  if (APP[active] + step === -1) return
  if (APP[active] + step === length) return

  if (type === 'layer') {
    const temp = APP.layers[APP.layerActive + step]
    APP.layers[APP.layerActive + step] = APP.layers[APP.layerActive]
    APP.layers[APP.layerActive] = temp
  }

  if (type === 'frame') {
    APP.layers.forEach(layer => {
      const temp = layer.frames[APP.frameActive + step]
      layer.frames[APP.frameActive + step] = layer.frames[APP.frameActive]
      layer.frames[APP.frameActive] = temp
    })
  }

  APP[active] += step

  VIEW.render()
}

const layersEditHidden = (i) => {
  APP.layers[i].hidden = !APP.layers[i].hidden
  VIEW.render()
}

const nextFrame = () => {
  APP.frameActive = (APP.frameActive + 1) % APP.frameCount
  VIEW.render()
}

const lastFrame = () => {
  APP.frameActive = APP.frameActive - 1 === -1 ? APP.frameCount - 1 : APP.frameActive - 1
  VIEW.render()
}

// Animation
const scheduler = () => {
  APP.frameActive = (APP.frameActive + 1) % APP.frameCount
  VIEW.render()
  VIEW.timerID = setTimeout(scheduler, 100)
}

const togglePlay = () => {
  if (APP.frameCount === 1) return

  if (VIEW.isPlaying) {
    clearTimeout(VIEW.timerID)
  } else {
    scheduler()
  }
  
  VIEW.isPlaying = !VIEW.isPlaying
  VIEW.render()
}

export const Timeline= () => {
  return (
    <div class='bg-light bord-dark-t fl-column' style='height: 250px;'>
        <div class='fl w-full bord-dark-b h-30'>
          <div class='fl fl-justify-between bord-dark-r' style='width: 210px;'>
            {/* <div style='width: 90px;' class='p-h-10 fl fl-center-y bord-dark-r'>
              <small><b>Layers</b></small>
            </div> */}
            <div class='fl'>
              <button
                onClick={() => { if (APP.layerCount < 30) timelineManager({ type:'layer', request: 'insert', requestType: 'new' }) }}
                class='w-30 fl fl-center bord-dark-r' >
                <img src={`img/insert.svg`} />
              </button>
              <button
                onClick={() => { timelineManager({ type:'layer', request: 'insert', requestType: 'clone' }) }}
                class='w-30 fl fl-center bord-dark-r' >
                <img src={`img/clone.svg`} />
              </button>
              <button
                onClick={() => { swap('layer', 'down') }}
                class='w-30 fl fl-center bord-dark-r'>
                <img src={`img/up.svg`} />
              </button>
              <button
                onClick={() => { swap('layer', 'up') }}
                class='w-30 fl fl-center bord-dark-r'>
                <img src={`img/down.svg`} />
              </button>
              <button
                onClick={() => { timelineManager({ type:'layer', request: 'delete' }) }}
                class='w-30 fl fl-center bord-dark-r'>
                <img src={`img/delete.svg`} />
              </button>
            </div>
          </div>
          <div class='fl fl-1'>
            <div class='fl'>
              <button
                onClick={() => { VIEW.onionSkinning = !VIEW.onionSkinning; VIEW.render() }}
                class="fl fl-center m-0 p-0 w-30 bord-dark-r"
                style={VIEW.onionSkinning ? 'background: rgba(52, 152, 219, 255);' : ''}>
                <img src="img/onion.svg" />
              </button>
            </div>
            <div class='fl-1 fl fl-justify-center'>
              <div class='fl'>
                <button
                  onClick={() => { lastFrame() }}
                  class="fl fl-center m-0 p-0 w-30 bord-dark-r bord-dark-l" >
                  <img src="img/lastframe.svg" />
                </button>
                <button
                  onClick={() => { togglePlay() }}
                  class="fl fl-center m-0 p-0 w-30 bord-dark-r" >
                  <img src={`img/${VIEW.isPlaying ? 'stop.svg' : 'play.svg'}`} />
                </button>
                <button
                  onClick={() => { nextFrame() }}
                  class="fl fl-center m-0 p-0 w-30 bord-dark-r" >
                  <img src="img/nextframe.svg" />
                </button>
              </div>
            </div>
            <div class='fl'>
              <button
                onClick={() => { if (!VIEW.isPlaying && APP.frameCount < 50) timelineManager({ type: 'frame', request: 'insert', requestType: 'new' }) }}
                class='w-30 fl fl-center bord-dark-r bord-dark-l'>
                <img src={`img/insert.svg`} />
              </button>
              <button
                onClick={() => { timelineManager({ type:'frame', request: 'insert', requestType: 'clone' }) }}
                class='w-30 fl fl-center bord-dark-r' >
                <img src={`img/clone.svg`} />
              </button>
              <button
                onClick={() => { if (!VIEW.isPlaying) swap('frame', 'up') }}
                class='w-30 fl fl-center bord-dark-r'>
                <img src={`img/up.svg`} style='transform: rotate(-90deg);'/>
              </button>
              <button
                onClick={() => { if (!VIEW.isPlaying) swap('frame', 'down') }}
                class='w-30 fl fl-center bord-dark-r'>
                <img src={`img/down.svg`} style='transform: rotate(-90deg);' />
              </button>
              <button
                onClick={() => { if (!VIEW.isPlaying) timelineManager({ type:'frame', request: 'delete' }) }}
                class='w-30 fl fl-center'>
                <img src={`img/delete.svg`} />
              </button>
            </div>
          </div>
        </div>
        <div class='fl bg-mid' style='height: calc(100% - 30px);'>
          <div id='layers' class='overflow hide-scroll' style='padding-bottom: 30px;'>
            <div class='bord-dark-r fl-col-reverse' style='width: 210px;'>
              {
                APP.layers.map((layer, li) => {
                  return <div
                    class='fl bord-dark-b h-30'
                    style={`background: ${APP.layerActive === li ? 'rgb(100, 100, 100)' :''};`}>
                    <button
                      style={`${layer.hidden ? 'background: rgba(52, 152, 219, 255);' : ''}`}
                      onClick={() => { layersEditHidden(li) }}
                      class='w-30 h-30 fl fl-center bord-dark-b'>
                      <img src={`img/${layer.hidden ? 'eye-active.svg' : 'eye.svg'}`} />
                    </button>
                    <button
                      onClick={() => { setTargetCanvas(APP.frameActive, li) }}
                      class='fl-1 txt-left'>
                      <small style='font-size: 11px;'><b>{layer.name}</b></small>
                    </button>
                  </div>
                })
              }
            </div>
          </div>
          <div id='frames' class='fl-1 overflow hide-scroll' style='padding-bottom: 30px;'>
            <canvas id='timeline-canvas' style='cursor: pointer;' onClick={(e) => {
              const x = Math.floor(e.offsetX / 30)
              const y = (APP.layerCount - 1) - Math.floor(e.offsetY / 30)
              
              setTargetCanvas(x, y)
            }}/>
          </div>
        </div>
      </div>
  )
}