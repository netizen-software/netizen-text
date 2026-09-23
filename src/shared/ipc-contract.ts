export const IPC_CHANNELS = {
  openFile: 'file:open',
  saveFile: 'file:save',
  saveFileAs: 'file:save-as',
  openFromPath: 'file:open-from-path',
  requestOpenFile: 'file:open-request',
  editorCommand: 'editor:command',
  requestWindowClose: 'window:request-close',
  allowWindowClose: 'window:allow-close',
} as const

export type EditorCommand = 'open' | 'save' | 'save-as' | 'close' | 'find' | 'replace'

export interface FileDocument {
  path: string
  contents: string
}

export interface FileWriteRequest {
  path: string
  contents: string
}

export type FileResult<T> = { ok: true; value: T } | { ok: false; message: string }

export interface NetizenTextApi {
  openFile: () => Promise<FileResult<FileDocument | null>>
  openFileFromPath: (filePath: string) => Promise<FileResult<FileDocument>>
  saveFile: (request: FileWriteRequest) => Promise<FileResult<FileDocument>>
  saveFileAs: (contents: string, defaultPath?: string) => Promise<FileResult<FileDocument | null>>
  onFileOpenRequested: (callback: (filePath: string) => void) => () => void
  onEditorCommand: (callback: (command: EditorCommand) => void) => () => void
  onWindowCloseRequested: (callback: () => void) => () => void
  allowWindowClose: () => void
}
