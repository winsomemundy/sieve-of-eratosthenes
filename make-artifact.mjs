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

// The artifact viewer can't open a print window, so the worksheet button becomes a link that opens
// the live Sieve on the same number (and answer-key choice), ready to print there
const swaps = [
  ['<button class="wm-btn wm-btn--ghost button" id="print" type="button">Print a worksheet for 50</button>',
   '<a class="wm-btn wm-btn--ghost button" id="print" href="https://sieve.winsomemundy.com/?n=50" target="_blank" rel="noopener">Print a worksheet for 50 ↗</a>'],
  ['Students sieve the grid by hand. To download it, choose “Save as PDF” in the print window.',
   'Opens the Sieve at sieve.winsomemundy.com on this number, ready to print. Students sieve the grid by hand. To download it, choose “Save as PDF” in the print window.'],
  ["$('print').textContent = `Print a worksheet for ${fmt(n)}`;",
   "$('print').textContent = `Print a worksheet for ${fmt(n)} ↗`;\n    liveLink();"],
  [/  \$\('print'\)\.onclick = \(\) => \{[\s\S]*?window\.print\(\);\n  \};\n/,
   "  const liveLink = () => { $('print').href = `https://sieve.winsomemundy.com/?n=${n}${$('wsKey').checked ? '&key=1' : ''}`; };\n  $('wsKey').onchange = liveLink;\n"],
]
let artifactBody = body
for (const [from, to] of swaps) {
  if (!(typeof from === 'string' ? artifactBody.includes(from) : from.test(artifactBody))) throw new Error(`make-artifact: not found: ${from}`)
  artifactBody = artifactBody.replace(from, to)
}

writeFileSync('sieve.html', `${title}
${fontLinks}
<style>
${dsCss}
${ownCss}</style>

<div class="wm-surface">
${artifactBody.replace('<script>', "<script>\ndocument.documentElement.lang = 'en';")}
</div>
`)
console.log('Wrote sieve.html from index.html')
