import { BrowserWindow, Menu } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type { EditorCommand } from '../shared/ipc-contract'

const sendEditorCommand = (command: EditorCommand): void => {
  BrowserWindow.getFocusedWindow()?.webContents.send(IPC_CHANNELS.editorCommand, command)
}

export const createApplicationMenu = (): void => {
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Open', accelerator: 'Ctrl+O', click: () => sendEditorCommand('open') },
        { label: 'Save', accelerator: 'Ctrl+S', click: () => sendEditorCommand('save') },
        { label: 'Save As', accelerator: 'Ctrl+Shift+S', click: () => sendEditorCommand('save-as') },
        { type: 'separator' },
        { label: 'Close File', accelerator: 'Ctrl+W', click: () => sendEditorCommand('close') }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Find', accelerator: 'Ctrl+F', click: () => sendEditorCommand('find') },
        { label: 'Replace', accelerator: 'Ctrl+H', click: () => sendEditorCommand('replace') }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
}