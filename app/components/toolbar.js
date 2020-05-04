import { h } from 'preact'
import { APP, VIEW } from '../state'

export const setTool = (tool) => {
  APP.tool = tool
  VIEW.render()
}

export const Toolbar = () => {
  return <div class='w-40 bg-light bord-dark-r'>
    {
      ['pencil', 'eraser', 'line', 'circle', 'square', 'fill', 'eye-dropper', 'move'].map(tool => 
        <button
          onClick={() => { setTool(tool) }}
          class="fl fl-center m-0 p-0 w-40 h-40 bord-dark-r"
          style={`${APP.tool === tool ? 'background: rgba(52, 152, 219, 255);' : ''}`}>
          <img src={`img/${tool}.svg`} />
        </button>
      )
    }
  </div>
}

