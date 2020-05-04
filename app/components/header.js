import { h } from 'preact'
import { VIEW } from '../state'
import { undo, redo } from '../undo-redo'

export const Header = () => {
  return <div class='h-40 bg-light bord-dark-b fl'>
    <div class="fl w-full">
      <div class="fl-1 fl">
        <div class="fl bord-dark-r rel w-40"
          onMouseLeave={() => {
            VIEW.file.open = false
            VIEW.render()
          }}>
          <button
            onClick={() => {
              VIEW.file.open = !VIEW.file.open
              VIEW.render()
            }}
            class="fl fl-center m-0 p-0 w-40">
            <img src="img/bars.svg" />
          </button>
          <div
            class="bg-light fl-column bord-dark abs z-5"
            style={`visibility: ${VIEW.file.open ? 'visible' : 'hidden'}; top: 10px; left: 10px;`}>
              <button
                onClick={() => {
                  VIEW.newCanvas.open = true
                  VIEW.file.open = false
                  VIEW.render()
                }}
                class="m-0 p-h-15 h-40 fl fl-center-y">
                <img src={`img/new.svg`} />
                <small class="bold p-h-10" style='text-transform: capitalize;'>New</small>
              </button>
              <button
                onClick={() => {
                  VIEW.downloadCanvas.open = true
                  VIEW.file.open = false
                  VIEW.render()
                }}
                class="m-0 p-h-15 h-40 fl fl-center-y">
                <img src={`img/download.svg`} />
                <small class="bold p-h-10" style='text-transform: capitalize;'>download</small>
              </button>
          </div>
        </div>
        <div class='fl-1 fl fl-justify-center'>
          <button
            onClick={() => { undo() }}
            class="fl fl-center m-0 p-0 w-40 bord-dark-l bord-dark-r">
            <img src="img/undo.svg" />
          </button>
          <button
            onClick={() => { redo() }}
            class="fl fl-center m-0 p-0 w-40 bord-dark-r">
            <img src="img/redo.svg" />
          </button>
        </div>
      </div>
      <div class="fl" style="max-width: 241px; min-width: 241px;">
        
      </div>
    </div>
  </div>

}