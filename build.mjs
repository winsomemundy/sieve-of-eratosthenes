// Assembles the deployable tool in dist/: the page and the design system's
// stylesheets from the pinned @winsomemundy/design-system package.
// DS_DIR=<folder> builds against a local design-system checkout instead.
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const out = 'dist'
const ds = process.env.DS_DIR ?? 'node_modules/@winsomemundy/design-system'

rmSync(out, { recursive: true, force: true })
mkdirSync(join(out, 'ds'), { recursive: true })

cpSync('index.html', join(out, 'index.html'))
cpSync(join(ds, 'tokens.css'), join(out, 'ds', 'tokens.css'))
cpSync(join(ds, 'components', 'bundle.css'), join(out, 'ds', 'bundle.css'))

console.log(`Built ${out}/ with design system from ${ds}`)
