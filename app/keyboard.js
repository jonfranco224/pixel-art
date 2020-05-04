import { undo, redo } from './undo-redo'
import { setTool } from './components/toolbar'

const keyMap = {
  metaKey: {
    z: undo
  },
  shiftKey: {
    metaKey: {
      z: redo
    }
  },
  b: () => {
    setTool('pencil')
  },
  e: () => {
    setTool('eraser')
  },
  u: () => {
    setTool('line')
  },
  g: () => {
    setTool('fill')
  },
  l: () => {
    setTool('eye-dropper')
  },
  v: () => {
    setTool('move')
  }
}

let shiftKeyMark = Date.now()
let metaKeyMark = Date.now()
let alphaKeyMark = Date.now()

export const setupKeyListeners = () => {
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') {
      return
    }

    const key = e.key.toLowerCase()
    
    if (!e.repeat && key === 'meta') {
      metaKeyMark = Date.now()
    } 

    if (!e.repeat && key === 'shift') {
      shiftKeyMark = Date.now()
    } 

    if (!e.repeat && key === 'z') {
      alphaKeyMark = Date.now()
    }

    if (e.shiftKey && e.metaKey) {
      if ((shiftKeyMark < metaKeyMark < alphaKeyMark) && key === 'z') {
        keyMap.shiftKey.metaKey['z']()
      }
    }
    
    if (!e.shiftKey && e.metaKey) {
      if ((metaKeyMark < alphaKeyMark) && key === 'z') {
        keyMap.metaKey['z']()
      }
    }

    if (e.shiftKey && !e.metaKey) {
      if ((shiftKeyMark < alphaKeyMark) && key === 'z') {
        // keyMap.shiftKey['z']()
      }
    }

    if (!e.shiftKey && !e.metaKey && keyMap[e.key.toLowerCase()]) {
      keyMap[e.key.toLowerCase()]()
    }
  })
}
