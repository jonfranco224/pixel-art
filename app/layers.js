import { h, Component } from 'preact'
import { STATE, CANVAS } from './state'

export class Layers extends Component {
  addLayer () {
    STATE.layersCount += 1

    STATE.layers.splice(
      STATE.layersActive,
      0,
      {
        hidden: false,
        locked: false,
        name: `Layer ${STATE.layersCount}`,
        paintActive: false,
        image: ''
      }
    )

    STATE.updateAndSave()
  }

  setLayerActive (i) {
    STATE.layersActive = i
    STATE.updateAndSave()
  }

  moveLayerUp () {
    if (STATE.layersActive === 0) return

    const temp = STATE.layers[STATE.layersActive - 1]
    STATE.layers[STATE.layersActive - 1] = STATE.layers[STATE.layersActive]
    STATE.layers[STATE.layersActive] = temp

    this.setLayerActive(STATE.layersActive -= 1)
  }

  moveLayerDown () {
    if (STATE.layersActive + 1 === STATE.layers.length) return

    const temp = STATE.layers[STATE.layersActive + 1]
    STATE.layers[STATE.layersActive + 1] = STATE.layers[STATE.layersActive]
    STATE.layers[STATE.layersActive] = temp

    this.setLayerActive(STATE.layersActive + 1)
  }

  deleteLayer () {
    if (STATE.layers.length !== 1) {
      STATE.layers.splice(STATE.layersActive, 1)
      
      if (STATE.layersActive === STATE.layers.length) this.setLayerActive(STATE.layersActive - 1)

      this.setLayerActive(STATE.layersActive)
    }
  }

  toggleHidden (i) {
    STATE.layers[i].hidden = !STATE.layers[i].hidden

    STATE.updateAndSave()
  }

  render () {
    return <div>
      <div class='bg-mid bord-dark-b p-h-10 p-v-5 h-30'>
        <small style='position: relative; top: -1px;'><b>Layers</b></small>
      </div>
      <div class='flex h-30 bord-dark-b w-full'>
        <button onMouseUp={() => { this.addLayer() }} style='min-width: 30px;'>
          <img src='img/plus.svg' />
        </button>
        <button onMouseUp={() => { this.moveLayerUp() }} class='bord-dark-l' data-request='moveLayerUp' style='min-width: 30px;'>
          <img src='img/up.svg' />
        </button>
        <button onMouseUp={() => { this.moveLayerDown() }} class='bord-dark-l' data-request='moveLayerDown' style='min-width: 30px;'>
          <img src='img/down.svg' />
        </button>
        <button onMouseUp={() => { this.deleteLayer() }} class='bord-dark-l bord-dark-r' data-request='deleteLayer' style='min-width: 30px;'>
          <img src='img/trash.svg' />
        </button>
      </div>
      {
        STATE.layers.map((layer, i) => {
          return <div class='w-full flex h-30 bord-light-b' style={{ background: i === STATE.layersActive ? 'rgb(100, 100, 100)' : 'transparent' }}>
            <button onMouseUp={() => { this.toggleHidden(i) }} class={`flex flex-center w-30 no-hover ${layer.hidden ? 'bg-blue' : 'bg-transparent'}`}>
              <img src={`img/${layer.hidden ? 'eye-active.svg' : 'eye.svg'}`} />
            </button>
            <button onMouseUp={() => { this.setLayerActive(i) }} class='flex flex-center-y fl-1'>
              <b>{layer.name}</b>
            </button>
          </div>
        })
      }
    </div>
  }
}