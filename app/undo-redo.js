import { VIEW } from './state'

export const addToUndo = (action, type = '') => {
  VIEW.undo.splice(0, VIEW.undoPos + 1, {
    icon: `${action}.svg`,
    action: `${action} ${type}`,
    undo: undo,
    redo: redo
  })

  if (VIEW.undoPos >= 0) VIEW.undoPos = -1  
  if (VIEW.undo.length > 50) VIEW.undo.pop()

  VIEW.currUndoRef = VIEW.undo[VIEW.undoPos + 1]
}

export const undo = () => {
  if (VIEW.undoPos + 1 === VIEW.undo.length) return

  VIEW.undoPos += 1
  VIEW.undo[VIEW.undoPos].undo()

  VIEW.render()
}

export const redo = () => {
  if (VIEW.undoPos - 1 === -2) return

  if (VIEW.undo[VIEW.undoPos].redo) VIEW.undo[VIEW.undoPos].redo()
  VIEW.undoPos -= 1

  VIEW.render()
}