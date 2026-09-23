import { readFile, stat, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { FileDocument, FileWriteRequest } from '../shared/ipc-contract'

export const readTextFile = async (filePath: string): Promise<FileDocument> => ({
  path: filePath,
  contents: await readFile(filePath, 'utf8'),
})

export const writeTextFile = async ({
  path,
  contents,
}: FileWriteRequest): Promise<FileDocument> => {
  if (path.length === 0) {
    throw new Error('A file path is required.')
  }

  await writeFile(path, contents, 'utf8')
  return { path, contents }
}

export const findFileArgument = async (arguments_: string[]): Promise<string | undefined> => {
  for (const argument of arguments_.slice(2)) {
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
