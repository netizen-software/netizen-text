import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '../shared/ipc-contract'
import type {
  EditorCommand,
  FileDocument,
  FileResult,
  FileWriteRequest,
  NetizenTextApi,
} from '../shared/ipc-contract'

const subscribe = <T>(channel: string, callback: (value: T) => void): (() => void) => {
  const listener = (_event: IpcRendererEvent, value: T): void => callback(value)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const api: NetizenTextApi = {
  openFile: () =>
    ipcRenderer.invoke(IPC_CHANNELS.openFile) as Promise<FileResult<FileDocument | null>>,
  openFileFromPath: (filePath) =>
    ipcRenderer.invoke(IPC_CHANNELS.openFromPath, filePath) as Promise<FileResult<FileDocument>>,
  saveFile: (request: FileWriteRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveFile, request) as Promise<FileResult<FileDocument>>,
  saveFileAs: (contents, defaultPath) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveFileAs, contents, defaultPath) as Promise<
      FileResult<FileDocument | null>
    >,
  onFileOpenRequested: (callback) => subscribe<string>(IPC_CHANNELS.requestOpenFile, callback),
  onEditorCommand: (callback) => subscribe<EditorCommand>(IPC_CHANNELS.editorCommand, callback),
  onWindowCloseRequested: (callback) => subscribe(IPC_CHANNELS.requestWindowClose, callback),
  allowWindowClose: () => ipcRenderer.send(IPC_CHANNELS.allowWindowClose),
}

contextBridge.exposeInMainWorld('netizenText', api)
