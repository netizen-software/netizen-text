import { app, BrowserWindow, ipcMain } from 'electron'
import { registerFileIpc, findFileArgument } from './ipc/file'
import { createApplicationMenu } from './menu'
import { closeMainWindow, createMainWindow } from './window'
import { IPC_CHANNELS } from '../shared/ipc-contract'

const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
}

const openFileInWindow = (filePath: string): void => {
  const window = BrowserWindow.getAllWindows()[0]
  if (window === undefined) {
    return
  }

  const sendOpenRequest = (): void => {
    window.webContents.send(IPC_CHANNELS.requestOpenFile, filePath)
    window.focus()
  }

  if (window.webContents.isLoading()) {
    window.webContents.once('did-finish-load', sendOpenRequest)
  } else {
    sendOpenRequest()
  }
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
  createApplicationMenu()
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
