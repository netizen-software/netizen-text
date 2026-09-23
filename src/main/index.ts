import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { registerFileIpc, findFileArgument } from './ipc/file'
import { closeMainWindow, createMainWindow } from './window'
import { IPC_CHANNELS } from '../shared/ipc-contract'

const gotSingleInstanceLock = app.requestSingleInstanceLock()
let rendererReady = false
let pendingFilePath: string | undefined

if (!gotSingleInstanceLock) {
  app.quit()
}

const openFileInWindow = (filePath: string): void => {
  const window = BrowserWindow.getAllWindows()[0]
  if (window === undefined || !rendererReady) {
    pendingFilePath = filePath
    return
  }

  window.webContents.send(IPC_CHANNELS.requestOpenFile, filePath)
  window.focus()
}

app.on('second-instance', (_event, commandLine) => {
  void findFileArgument(commandLine).then((filePath) => {
    if (filePath !== undefined) {
      openFileInWindow(filePath)
    }
  })
})

app.whenReady().then(async () => {
  registerFileIpc()
  ipcMain.on(IPC_CHANNELS.allowWindowClose, closeMainWindow)
  ipcMain.on(IPC_CHANNELS.rendererReady, (event) => {
    rendererReady = true
    if (pendingFilePath !== undefined) {
      event.sender.send(IPC_CHANNELS.requestOpenFile, pendingFilePath)
      pendingFilePath = undefined
    }
  })
  Menu.setApplicationMenu(null)
  createMainWindow()

  const filePath = await findFileArgument(process.argv)
  if (filePath !== undefined) {
    openFileInWindow(filePath)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})
