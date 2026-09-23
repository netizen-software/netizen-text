import { expect, test, _electron as electron } from '@playwright/test'
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'

test('opens a terminal file, replaces text, saves, and closes the document', async () => {
  const testResultsDirectory = resolve('test-results')
  const filePath = resolve(testResultsDirectory, 'unicode-copy.txt')
  await mkdir(testResultsDirectory, { recursive: true })
  await copyFile(resolve('tests/e2e/fixtures/unicode.txt'), filePath)

  const application = await electron.launch({ args: [resolve('out/main/index.js'), filePath] })
  const window = await application.firstWindow()

  try {
    await expect(window.locator('#document-name')).toHaveText('unicode-copy.txt')
    await expect(window.locator('.cm-content')).toContainText('Caf\u00e9 and \u00e9')

    await window.getByLabel('Find and replace').click()
    await window.locator('[data-search-find]').pressSequentially('Café')
    await window.locator('[data-search-replace]').pressSequentially('Coffee')
    await window.getByRole('button', { name: 'Replace All' }).click()
    await expect(window.locator('.cm-content')).toContainText('Coffee and Coffee')
    await expect(window.locator('.cm-content')).not.toContainText('Café')
    await window.screenshot({ path: resolve(testResultsDirectory, 'editor-workflow.png') })

    await window.locator('.cm-content').click()
    await window.keyboard.press('End')
    await window.keyboard.type('\nSaved from e2e')
    await window.getByRole('button', { name: 'Save file', exact: true }).click()
    await expect(window.locator('#status-message')).toHaveText('File saved')
    await expect(readFile(filePath, 'utf8')).resolves.toContain('Saved from e2e')

    window.once('dialog', (dialog) => void dialog.accept())
    await window.getByLabel('Close file').click()
    await expect(window.locator('#document-name')).toHaveText('Untitled')
  } finally {
    await application.evaluate(({ app }) => app.exit(0))
    await rm(filePath, { force: true })
  }
})
