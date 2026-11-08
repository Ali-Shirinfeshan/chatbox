import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const load = (path) => readFile(fileURLToPath(new URL(path, import.meta.url)), 'utf8')
test('personal updater is compiled with a separate non-fallback feed switch', async () => {
  const updater = await load('../../src/main/app-updater.ts')
  const vite = await load('../../electron.vite.config.ts')
  assert.match(vite, /'process\.env\.CHATBOX_PERSIAN_BUILD'/)
  const personalBranch = updater.indexOf("if (process.env.CHATBOX_PERSIAN_BUILD === '1')")
  const officialUrls = updater.indexOf("const feedUrls = [")
  assert.ok(personalBranch >= 0 && officialUrls > personalBranch)
  assert.match(updater.slice(personalBranch, officialUrls), /return await autoUpdater\.checkForUpdates\(\)/)
  assert.doesNotMatch(updater.slice(personalBranch, officialUrls), /setFeedURL/)
})
test('runtime dependency packing hooks remain enabled', async () => {
  const builder = await load('../../electron-builder.yml')
  assert.match(builder, /^beforePack: \.erb\/scripts\/ensure-app-deps\.cjs/m)
  assert.match(builder, /^afterPack: \.erb\/scripts\/after-pack\.cjs/m)
})
test('RTL markdown/streaming modifications are retained', async () => {
  const markdown = await load('../../src/renderer/components/Markdown.tsx')
  const streaming = await load('../../src/renderer/components/StreamingTextFade.tsx')
  const rtlPlugin = await load('../../src/renderer/components/markdown-content-direction.ts')
  assert.match(markdown, /rehypeContentDirection/)
  assert.match(streaming, /dir="auto"/)
  assert.match(rtlPlugin, /TEXT_BLOCKS/)
})
test('local Arabic-script-only Vazirmatn and monospace fallback CSS', async () => {
  const css = await load('../../src/renderer/static/index.css')
  assert.match(css, /Vazirmatn-Regular\.woff2/)
  assert.match(css, /Vazirmatn-Bold\.woff2/)
  assert.match(css, /unicode-range: U\+0600-06FF/)
  assert.match(css, /code \{[\s\S]*?monospace;/)
})
