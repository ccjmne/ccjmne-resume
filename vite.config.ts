import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import process from 'node:process'
import { JSDOM } from 'jsdom'
import { defineConfig, loadEnv  } from 'vite'

import { author, description, homepage, keywords, name, title } from './package.json'
import renderer from './tooling/renderer-plugin'

const src = resolve(__dirname, 'src')
const dist = resolve(__dirname, 'dist')
const pages = preparePages()

export default defineConfig(({ mode }) => {
  const { DATE, PORT, HYPHENATE, OUTPUT } = loadEnv(mode, process.cwd(), '')
  const port = Number(PORT) ?? 8042
  return {
    root:  src,
    base:  './', // Relative paths for assets, so I can navigate there through Puppeteer w/o a Web server
    build: {
      outDir:        dist,
      emptyOutDir:   true,
      target:        'esnext',
      rollupOptions: {
        input: pages.reduce((acc, page) => ({ ...acc, [page]: `/${page}.html` }), {}),
      },
    },
    plugins: [
      renderer({
        port,
        output:     resolve(dist, OUTPUT ?? `${name}.pdf`),
        properties: { title, author, subject: description, keywords: keywords.join(', ') },
        ...mode === 'production'
          ? { scheme: 'file', paths: pages.map(name => resolve(dist, `${name}.html`)) }
          : { port, paths: pages.map(name => `${name}.html`) },
      }),
    ],
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
      preprocessorOptions: { scss: {} },
    },
    server: {
      port,
      open: `/${pages[0]}.html`,
    },
    define: Object
      .entries({ DATE, HYPHENATE })
      .reduce((acc, [k, v]) => ({ ...acc, [`process.env.${k}`]: JSON.stringify(v) }), {}),
    resolve: {
      alias:      { src },
      extensions: ['.tsx', '.ts', '.js'],
    },
  }
})

function preparePages() {
  const pages = readdirSync(src, { withFileTypes: true })
    .filter(({ name }) => /^\d+\.ts$/.test(name))
    .map(({ name }) => name.replace(/\.ts$/, ''))
  const dom = new JSDOM(readFileSync(resolve(src, 'index.html')).toString())
  const doc = dom.window.document
  doc.head.append(...Object
    .entries({ author, description, homepage, keywords, title })
    .map(([k, v]) => (e => (e.setAttribute(k, String(v)), e))(doc.createElement('meta'))),
  )
  const H = doc.head
  for (const page of pages) {
    const s = doc.createElement('script')
    s.setAttribute('defer', 'defer')
    s.setAttribute('type', 'module')
    s.setAttribute('src', `/${page}.ts`)
    const h = H.cloneNode(true) as HTMLHeadElement
    h.append(s)
    doc.head.replaceWith(h)
    writeFileSync(resolve(src, `${page}.html`), dom.serialize())
  }
  return pages
}
