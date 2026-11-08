import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('../../', import.meta.url))
const out = path.join(root, 'release/build')
const files = await readdir(out)
const manifest = files.find((f) => f === 'latest.yml')
const installer = files.find((f) => /^Chatbox-Persian-.*-Setup\.exe$/i.test(f))
if (!manifest || !installer) throw Error(`Missing installer/latest.yml in ${out}: ${files.join(', ')}`)
const meta = await readFile(path.join(out, manifest), 'utf8')
const version = JSON.parse(await readFile(path.join(root, 'release/app/package.json'), 'utf8')).version
if (!meta.includes(`version: ${version}`) || !meta.includes(installer)) {
  throw Error('Update metadata does not match the installer version or filename')
}
const text = await readFile(path.join(root, 'release/build/win-unpacked/resources/app-update.yml'), 'utf8')
const repo = process.env.PERSIAN_GITHUB_REPOSITORY || process.env.GITHUB_REPOSITORY
const [owner, repository] = repo.split('/')
if (!text.includes('provider: github') || !text.includes(`owner: ${owner}`) || !text.includes(`repo: ${repository}`)) {
  throw Error('Packaged update feed does not match the personal GitHub repository')
}
const licenseFile = path.join(root, 'release/build/win-unpacked/resources/licenses/Vazirmatn-OFL.txt')
if (!(await readFile(licenseFile, 'utf8')).includes('SIL OPEN FONT LICENSE')) {
  throw Error('Vazirmatn license was not bundled in the application resources')
}
const rendererDir = path.join(root, 'release/app/dist/renderer')
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return (await Promise.all(entries.map(async (e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  }))).flat()
}
const renderer = await walk(rendererDir)
for (const font of ['Vazirmatn-Regular', 'Vazirmatn-Bold']) {
  if (!renderer.some((f) => f.includes(font) && f.endsWith('.woff2'))) {
    throw Error(`Required local font missing in compiled renderer: ${font}`)
  }
}
const size = (await stat(path.join(out, installer))).size
if (size < 1_000_000) throw Error('Installer size is suspiciously small')
console.log('Installer and personal update channel verified:', { installer, version, bytes: size })
