const processInput = () => {}

const WINDOW = {}
const resetWindow = () => {
  WINDOW.REQUEST = ''
  WINDOW.MOUSE_DOWN = false
  WINDOW.START_X = 0
  WINDOW.START_Y = 0
  WINDOW.PREV_X = 0
  WINDOW.PREV_Y = 0
  WINDOW.CURR_X = 0
  WINDOW.CURR_Y = 0
}
resetWindow()

const onGestureDown = (e) => {
  WINDOW.REQUEST = e.target.dataset.request || ''
  WINDOW.MOUSE_DOWN = true
  WINDOW.START_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
  WINDOW.START_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
  WINDOW.PREV_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
  WINDOW.PREV_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY
  WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
  WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

  processInput('down', WINDOW)
}

const onGestureHover = (e) => {
  WINDOW.PREV_X = WINDOW.CURR_X
  WINDOW.PREV_Y = WINDOW.CURR_Y
  WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
  WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

  processInput('hover', WINDOW)
}

const onGestureDrag = (e) => {
  WINDOW.PREV_X = WINDOW.CURR_X
  WINDOW.PREV_Y = WINDOW.CURR_Y
  WINDOW.CURR_X = (e.pageX === undefined) ? e.touches[0].pageX : e.pageX
  WINDOW.CURR_Y = (e.pageY === undefined) ? e.touches[0].pageY : e.pageY

  processInput('drag', WINDOW)

  if (e.target.tagName !== 'INPUT') { // prevent block on input range elements
    e.preventDefault() // block pull to refresh on mobile browsers
  }
}

const gestureEnd = (e) => {
  processInput('up', WINDOW)
  
  resetWindow()
}

const dragOrHover = (e) => {
  if (WINDOW.MOUSE_DOWN) {
    onGestureDrag(e)
  } else {
    onGestureHover(e)
  }
}

export const viewSetupListeners = () => {
  window.addEventListener('mousedown', onGestureDown)
  window.addEventListener('touchstart', onGestureDown, { passive: false }) // allow prevent default

  window.addEventListener('mousemove', dragOrHover)
  window.addEventListener('touchmove', dragOrHover, { passive: false }) // allow prevent default

  window.addEventListener('mouseup', gestureEnd)
  window.addEventListener('touchend', gestureEnd)
}