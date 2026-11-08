/** Pin the original OFL-licensed font and place it in the renderer build.
 *  The EXE embeds the downloaded files: user devices need no font download.
 *  This intentionally fails closed if a required asset cannot be fetched.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const destination = fileURLToPath(new URL('../../src/renderer/static/fonts/', import.meta.url))
const release = 'v33.003'
const base = `https://raw.githubusercontent.com/rastikerdar/vazirmatn/${release}/`
const files = [
  ['fonts/webfonts/Vazirmatn-Regular.woff2', 'Vazirmatn-Regular.woff2'],
  ['fonts/webfonts/Vazirmatn-Bold.woff2', 'Vazirmatn-Bold.woff2'],
  ['OFL.txt', 'OFL-Vazirmatn.txt'],
]

function checkContents(filename, data) {
  if (filename.endsWith('.woff2')) {
    if (data.length < 10_000 || data.toString('ascii', 0, 4) !== 'wOF2') {
      throw new Error(`Invalid woff2 from upstream: ${filename}`)
    }
  } else if (!data.toString('utf8').includes('SIL OPEN FONT LICENSE')) {
    throw new Error('Vazirmatn font license could not be verified')
  }
}

async function getFile(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(45_000) })
  if (!response.ok) throw new Error(`Font download failed: ${response.status} ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

await mkdir(destination, { recursive: true })
const manifest = { source: 'https://github.com/rastikerdar/vazirmatn', version: release, license: 'OFL-1.1', files: {} }
for (const [sourceName, filename] of files) {
  const output = path.join(destination, filename)
  let data
  try {
    data = await readFile(output)
    checkContents(filename, data)
  } catch {
    // Source is fetched only while building, never when the user runs the app.
    data = await getFile(base + sourceName)
    checkContents(filename, data)
    const tmp = output + '.download'
    await writeFile(tmp, data)
    try { await rename(tmp, output) } finally { await rm(tmp, { force: true }) }
  }
  const sha256 = createHash('sha256').update(data).digest('hex')
  manifest.files[filename] = { sha256, bytes: data.length }
  console.log(`[Vazirmatn] ${filename} sha256=${sha256}`)
}
await writeFile(path.join(destination, 'Vazirmatn-source.json'), JSON.stringify(manifest, null, 2) + '\n')
