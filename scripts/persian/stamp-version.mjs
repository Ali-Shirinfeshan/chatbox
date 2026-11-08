/** Stamp a personal version, without misrepresenting the upstream code version.
 * Usage: node scripts/persian/stamp-version.mjs 1.24.2-persian.1
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const dir = fileURLToPath(new URL('../../release/app/', import.meta.url))
const version = process.argv[2]
const match = /^(\d+\.\d+\.\d+)-persian\.([1-9]\d*)$/.exec(version || '')
if (!match) throw Error('Version must be like 1.24.2-persian.1')
const manifestFile = dir + 'package.json'
const manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
const upstreamVersion = match[1]
if (manifest.version !== upstreamVersion) {
  throw Error(`Refusing to brand ${manifest.version} source as ${upstreamVersion}. Merge the matching upstream version first.`)
}
const lockFile = dir + 'package-lock.json'
const lock = JSON.parse(await readFile(lockFile, 'utf8'))
if (lock.version && lock.version !== upstreamVersion) throw Error(`Unexpected lockfile version ${lock.version}`)
lock.version = version
if (lock.packages?.['']) {
  if (lock.packages[''].version && lock.packages[''].version !== upstreamVersion) {
    throw Error('Unexpected lockfile root version')
  }
  lock.packages[''].version = version
}
manifest.version = version
await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + '\n')
await writeFile(lockFile, JSON.stringify(lock, null, 2) + '\n')
console.log('Stamped personal version', version)
