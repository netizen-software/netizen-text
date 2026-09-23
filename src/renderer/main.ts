import { createIcons, icons } from 'lucide'
import { TextEditor } from './editor/editor'
import './styles/theme-dark.css'
import type { EditorCommand, FileDocument } from '../shared/ipc-contract'

const editorHost = document.querySelector<HTMLElement>('#editor')
const documentName = document.querySelector<HTMLElement>('#document-name')
const dirtyIndicator = document.querySelector<HTMLElement>('#dirty-indicator')
const statusMessage = document.querySelector<HTMLElement>('#status-message')

if (
  editorHost === null ||
  documentName === null ||
  dirtyIndicator === null ||
  statusMessage === null
) {
  throw new Error('The editor interface could not be initialized.')
}

let filePath: string | undefined
let fileDirty = false

const setStatus = (message: string): void => {
  statusMessage.textContent = message
}

const updateDocumentTitle = (): void => {
  const name = filePath === undefined ? 'Untitled' : (filePath.split('/').at(-1) ?? filePath)
  documentName.textContent = name
  dirtyIndicator.hidden = !fileDirty
  document.title = `${fileDirty ? '* ' : ''}${name} - Netizen Text Editor`
}

const editor = new TextEditor(editorHost, () => {
  fileDirty = true
  updateDocumentTitle()
  setStatus('Unsaved changes')
})

const discardChanges = (): boolean => !fileDirty || window.confirm('Discard unsaved changes?')

const loadDocument = (documentToLoad: FileDocument): void => {
  filePath = documentToLoad.path
  editor.setContents(documentToLoad.contents)
  fileDirty = false
  updateDocumentTitle()
  setStatus('File opened')
}

const showError = (message: string): void => {
  setStatus(message)
}

const openFile = async (): Promise<void> => {
  if (!discardChanges()) {
    return
  }

  const result = await window.netizenText.openFile()
  if (!result.ok) {
    showError(result.message)
    return
  }
  if (result.value !== null) {
    loadDocument(result.value)
  }
}

const openFileFromPath = async (path: string): Promise<void> => {
  if (!discardChanges()) {
    return
  }

  const result = await window.netizenText.openFileFromPath(path)
  if (!result.ok) {
    showError(result.message)
    return
  }
  loadDocument(result.value)
}

const saveFileAs = async (): Promise<boolean> => {
  const result = await window.netizenText.saveFileAs(editor.getContents(), filePath)
  if (!result.ok) {
    showError(result.message)
    return false
  }
  if (result.value === null) {
    return false
  }

  loadDocument(result.value)
  setStatus('File saved')
  return true
}

const saveFile = async (): Promise<boolean> => {
  if (filePath === undefined) {
    return saveFileAs()
  }

  const result = await window.netizenText.saveFile({
    path: filePath,
    contents: editor.getContents(),
  })
  if (!result.ok) {
    showError(result.message)
    return false
  }

  loadDocument(result.value)
  setStatus('File saved')
  return true
}

const closeDocument = (): void => {
  if (!discardChanges()) {
    return
  }

  editor.setContents('')
  filePath = undefined
  fileDirty = false
  updateDocumentTitle()
  setStatus('File closed')
}

const closeWindow = (): void => {
  if (discardChanges()) {
    window.netizenText.allowWindowClose()
  }
}

const runCommand = (command: EditorCommand): void => {
  switch (command) {
    case 'open':
      void openFile()
      break
    case 'save':
      void saveFile()
      break
    case 'save-as':
      void saveFileAs()
      break
    case 'close':
      closeDocument()
      break
    case 'find':
      editor.openFind()
      break
    case 'replace':
      editor.openReplace()
      break
  }
}

document.querySelectorAll<HTMLButtonElement>('[data-command]').forEach((button) => {
  button.addEventListener('click', () => runCommand(button.dataset.command as EditorCommand))
})

document.addEventListener('contextmenu', (event) => event.preventDefault())
window.netizenText.onEditorCommand(runCommand)
window.netizenText.onFileOpenRequested((path) => void openFileFromPath(path))
window.netizenText.onWindowCloseRequested(closeWindow)
window.netizenText.notifyRendererReady()

createIcons({ icons })
updateDocumentTitle()
