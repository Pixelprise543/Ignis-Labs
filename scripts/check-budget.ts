/**
 * Bundle budget gate: run after `npm run build`.
 *
 *   node scripts/check-budget.ts
 *
 * Reads `dist/` produced by Vite and enforces:
 *   * the entry chunk(s) loaded by index.html stay at or under 90 KB gzip,
 *   * every lazy route chunk stays at or under 250 KB gzip.
 *
 * Route chunks are every asset under `dist/assets/*.js` that index.html does
 * not reference directly. Exits 1 on any breach so CI (or a local gate) can
 * fail a release before it ships.
 */

import { gzipSync } from 'node:zlib'
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const DIST = 'dist'
const ENTRY_MAX_KB = 90
const ROUTE_MAX_KB = 250

function gzipKb(bytes: Buffer): number {
  return gzipSync(bytes).byteLength / 1024
}

async function main(): Promise<void> {
  const indexHtml = await readFile(join(DIST, 'index.html'), 'utf8')
  const entrySrcs = [...indexHtml.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map(
    (match) => match[1],
  )
  const entryNames = new Set(
    entrySrcs.map((src) => src.split('/').pop() ?? src),
  )

  const assets = (await readdir(join(DIST, 'assets'))).filter((name) =>
    name.endsWith('.js'),
  )

  let failed = false

  console.log(`Entry budget (<= ${ENTRY_MAX_KB} KB gzip):`)
  for (const name of assets) {
    const bytes = await readFile(join(DIST, 'assets', name))
    const gzKb = gzipKb(bytes)
    const isEntry = entryNames.has(name)
    const budget = isEntry ? ENTRY_MAX_KB : ROUTE_MAX_KB
    const kind = isEntry ? 'entry' : 'route'
    const over = gzKb > budget
    if (over) failed = true
    console.log(
      `  ${kind.padEnd(6)} ${(gzKb).toFixed(1)} KB / ${budget} KB  ${name} ${over ? 'OVER BUDGET' : 'ok'}`,
    )
  }

  if (entrySrcs.length === 0) {
    console.error('  (no entry script found in index.html)')
    failed = true
  }

  if (failed) {
    console.error(`\nBundle budget FAILED: entry <= ${ENTRY_MAX_KB} KB gzip, routes <= ${ROUTE_MAX_KB} KB gzip.`)
    process.exitCode = 1
  } else {
    console.log(`\nBundle budget OK: entry <= ${ENTRY_MAX_KB} KB gzip, routes <= ${ROUTE_MAX_KB} KB gzip.`)
  }
}

main().catch((error) => {
  console.error('bundle budget check crashed:', error)
  process.exitCode = 1
})
