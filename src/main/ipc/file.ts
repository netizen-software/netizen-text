import { BrowserWindow, dialog, ipcMain } from 'electron'
import type { OpenDialogOptions } from 'electron'
import { readTextFile, writeTextFile } from '../file-service'
export { findFileArgument } from '../file-service'
import { IPC_CHANNELS } from '../../shared/ipc-contract'
import type { FileDocument, FileResult, FileWriteRequest } from '../../shared/ipc-contract'

const fileResult = <T>(operation: () => Promise<T>): Promise<FileResult<T>> =>
  operation()
    .then((value): FileResult<T> => ({ ok: true, value }))
    .catch((error: unknown): FileResult<T> => ({
      ok: false,
      message: error instanceof Error ? error.message : 'The file operation failed.',
    }))

export const registerFileIpc = (): void => {
  ipcMain.handle(IPC_CHANNELS.openFile, async (): Promise<FileResult<FileDocument | null>> => {
    const window = BrowserWindow.getFocusedWindow()
    const options: OpenDialogOptions = {
      title: 'Open File',
      properties: ['openFile'],
    }
    const result =
      window === null
        ? await dialog.showOpenDialog(options)
        : await dialog.showOpenDialog(window, options)

    if (result.canceled || result.filePaths.length === 0) {
      return { ok: true, value: null }
    }

    return fileResult(() => readTextFile(result.filePaths[0]))
  })

  ipcMain.handle(
    IPC_CHANNELS.openFromPath,
    (_event, filePath: string): Promise<FileResult<FileDocument>> =>
      fileResult(() => readTextFile(filePath)),
  )

  ipcMain.handle(
    IPC_CHANNELS.saveFile,
    (_event, request: FileWriteRequest): Promise<FileResult<FileDocument>> =>
      fileResult(() => writeTextFile(request)),
  )

  ipcMain.handle(
    IPC_CHANNELS.saveFileAs,
    async (
      _event,
      contents: string,
      defaultPath?: string,
    ): Promise<FileResult<FileDocument | null>> => {
      const window = BrowserWindow.getFocusedWindow()
      const options = {
        title: 'Save File As',
        defaultPath,
      }
      const result =
        window === null
          ? await dialog.showSaveDialog(options)
          : await dialog.showSaveDialog(window, options)

      if (result.canceled || result.filePath === undefined) {
        return { ok: true, value: null }
      }

      return fileResult(() => writeTextFile({ path: result.filePath, contents }))
    },
  )
}
