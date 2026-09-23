import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { findFileArgument, readTextFile, writeTextFile } from '../../src/main/file-service'

const temporaryDirectories: string[] = []

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'netizen-text-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  )
})

describe('text file service', () => {
  test('reads UTF-8 text containing ASCII and Unicode', async () => {
    const directory = await createTemporaryDirectory()
    const path = join(directory, 'sample.txt')
    const contents = 'Plain ASCII\nCaf\u00e9\n\u3053\u3093\u306b\u3061\u306f\n\ud83d\ude80'
    await writeFile(path, contents, 'utf8')

    await expect(readTextFile(path)).resolves.toEqual({ path, contents })
  })

  test('writes UTF-8 text and returns the saved document', async () => {
    const directory = await createTemporaryDirectory()
    const path = join(directory, 'written.txt')
    const contents = 'Unicode survives: \u0442\u0435\u043a\u0441\u0442 \ud83d\udc4b'

    await expect(writeTextFile({ path, contents })).resolves.toEqual({ path, contents })
    await expect(readFile(path, 'utf8')).resolves.toBe(contents)
  })

  test('finds a valid terminal file argument after Electron arguments', async () => {
    const directory = await createTemporaryDirectory()
    const path = join(directory, 'terminal.txt')
    await writeFile(path, 'terminal input', 'utf8')

    await expect(findFileArgument(['electron', 'application', '--inspect', path])).resolves.toBe(
      path,
    )
  })

  test('rejects an empty save path', async () => {
    await expect(writeTextFile({ path: '', contents: 'text' })).rejects.toThrow(
      'A file path is required.',
    )
  })
})
