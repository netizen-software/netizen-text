import { readFile, stat, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { BrowserWindow, dialog, ipcMain } from 'electron'
import type { OpenDialogOptions } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-contract'
import type { FileDocument, FileResult, FileWriteRequest } from '../../shared/ipc-contract'

const fileResult = <T>(operation: () => Promise<T>): Promise<FileResult<T>> =>
  operation()
    .then((value): FileResult<T> => ({ ok: true, value }))
    .catch((error: unknown): FileResult<T> => ({
      ok: false,
      message: error instanceof Error ? error.message : 'The file operation failed.'
    }))

export const readTextFile = async (filePath: string): Promise<FileDocument> => ({
  path: filePath,
  contents: await readFile(filePath, 'utf8')
})

const writeTextFile = async ({ path, contents }: FileWriteRequest): Promise<FileDocument> => {
  if (path.length === 0) {
    throw new Error('A file path is required.')
  }

  await writeFile(path, contents, 'utf8')
  return { path, contents }
}

export const findFileArgument = async (arguments_: string[]): Promise<string | undefined> => {
  for (const argument of arguments_.slice(1)) {
    if (argument.startsWith('-')) {
      continue
    }

    const filePath = resolve(argument)
    try {
      if ((await stat(filePath)).isFile()) {
        return filePath
      }
    } catch {
      continue
    }
  }

  return undefined
}

export const registerFileIpc = (): void => {
  ipcMain.handle(IPC_CHANNELS.openFile, async (): Promise<FileResult<FileDocument | null>> => {
    const window = BrowserWindow.getFocusedWindow()
    const options: OpenDialogOptions = {
      title: 'Open File',
      properties: ['openFile']
    }
    const result =
      window === null ? await dialog.showOpenDialog(options) : await dialog.showOpenDialog(window, options)

    if (result.canceled || result.filePaths.length === 0) {
      return { ok: true, value: null }
    }

    return fileResult(() => readTextFile(result.filePaths[0]))
  })

  ipcMain.handle(
    IPC_CHANNELS.openFromPath,
    (_event, filePath: string): Promise<FileResult<FileDocument>> => fileResult(() => readTextFile(filePath))
  )

  ipcMain.handle(
    IPC_CHANNELS.saveFile,
    (_event, request: FileWriteRequest): Promise<FileResult<FileDocument>> => fileResult(() => writeTextFile(request))
  )

  ipcMain.handle(
    IPC_CHANNELS.saveFileAs,
    async (_event, contents: string, defaultPath?: string): Promise<FileResult<FileDocument | null>> => {
      const window = BrowserWindow.getFocusedWindow()
      const options = {
        title: 'Save File As',
        defaultPath: defaultPath === undefined ? undefined : basename(defaultPath)
      }
      const result =
        window === null ? await dialog.showSaveDialog(options) : await dialog.showSaveDialog(window, options)

      if (result.canceled || result.filePath === undefined) {
        return { ok: true, value: null }
      }

      return fileResult(() => writeTextFile({ path: result.filePath, contents }))
    }
  )
}