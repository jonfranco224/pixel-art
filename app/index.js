import { viewSetupListeners } from './ui'
import { viewInit, viewUpdate } from './view'
import { defaultData } from './app'

const onProgramEnd = () => {
  console.log('Program ended.')
}

const onProgramStart = () => {
  console.log('Program started.')

  // if (false) {
  //   // loadFromDisk()
  //   // need to load from disk here if this exists 
  // } else {
  //   newProject(50, 50)
  // }
  
  viewSetupListeners()
  defaultData()
  viewInit()
}

window.addEventListener('unload', onProgramEnd)
window.addEventListener('load', onProgramStart)

//window.addEventListener('contextmenu', (e) => { e.preventDefault() }, { passive: false })


