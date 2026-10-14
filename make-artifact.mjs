// Writes sieve.html, the self-contained version of index.html published as a
// Claude artifact. The artifact viewer supplies its own <html>/<head>/<body>
// and cannot load the design-system package, so its stylesheets are inlined.
// Run `npm install` first; DS_DIR=<folder> uses a local design-system checkout.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ds = process.env.DS_DIR ?? 'node_modules/@winsomemundy/design-system'
const page = readFileSync('index.html', 'utf8')
const between = (s, a, b) => s.slice(s.indexOf(a) + a.length, s.indexOf(b, s.indexOf(a)))

const head = between(page, '<head>', '</head>')
const body = between(page, '<body class="wm-surface">', '</body>').trim()
const title = head.match(/<title>.*?<\/title>/)[0]
const fontLinks = head.match(/<link rel="(preconnect|stylesheet)" href="https:[^>]*>/g).join('\n')
const ownCss = between(head, '<style>', '</style>')
const dsCss = ['tokens.css', join('components', 'bundle.css')]
  .map(f => readFileSync(join(ds, f), 'utf8')).join('\n')

writeFileSync('sieve.html', `${title}
${fontLinks}
<style>
${dsCss}
${ownCss}</style>

<div class="wm-surface">
${body.replace('<script>', "<script>\ndocument.documentElement.lang = 'en';")}
</div>
`)
console.log('Wrote sieve.html from index.html')
