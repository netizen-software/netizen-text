import { join } from 'node:path'
import { BrowserWindow, nativeTheme } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'

let allowClose = false

export const createMainWindow = (): BrowserWindow => {
  nativeTheme.themeSource = 'dark'

  const window = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 720,
    minHeight: 500,
    backgroundColor: '#17191d',
    autoHideMenuBar: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.on('close', (event) => {
    if (!allowClose) {
      event.preventDefault()
      window.webContents.send(IPC_CHANNELS.requestWindowClose)
    }
  })

  if (process.env.ELECTRON_RENDERER_URL !== undefined) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}

export const closeMainWindow = (): void => {
  const window = BrowserWindow.getFocusedWindow()
  if (window === null) {
    return
  }

  allowClose = true
  window.close()
}
