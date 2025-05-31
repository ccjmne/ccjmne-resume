import type { DocumentProperties } from 'pdfjs'
import type { PDFOptions, ScreenshotOptions } from 'puppeteer'
import type { Plugin } from 'vite'
import { Buffer } from 'node:buffer'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { mkdirp } from 'mkdirp'
import { Document, ExternalDocument } from 'pdfjs'
import sharp from 'sharp'
import { withBrowser } from './shared-browser'

export interface PDFPrinterConfig {
  output:      string
  scheme?:     'http' | 'file'
  host?:       string
  port?:       number
  paths?:      string[]
  options?:    PDFOptions | ScreenshotOptions
  properties?: DocumentProperties
}

export default function renderer({ properties, scheme = 'http', host = 'localhost', port = 80, paths = [''], output, options }: PDFPrinterConfig): Plugin {
  const out: string = resolve(output.replace(/(\.[a-w]{2,4})?$/i, ext => /^\.png$/i.test(ext) ? '.png' : '.pdf'))
  const type: 'PDF' | 'PNG' = /\.pdf$/i.test(out) ? 'PDF' : 'PNG'
  const uris: string[] = paths.map(path => `${scheme}://${host}${scheme === 'http' ? `:${port}` : ''}/${path.replace(/^\//, '')}`)

  async function writeBundle() {
    return withBrowser(async (browser) => {
      // Page#screenshot cannot be parallelised on Chromium browsers
      const contents = await (type === 'PNG' ? allSequential : allParallel)(uris, async function (uri) {
        const page = await browser.newPage()
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 }) // A4 Portrait @ 96 DPI
        await page.goto(uri, { waitUntil: 'networkidle0' })
        const content = await (type === 'PDF'
          ? page.pdf({ format: 'A4', landscape: false, printBackground: true, ...options, margin: { top: '0', right: '0', bottom: '0', left: '0' } })
          : page.screenshot({ fullPage: true, omitBackground: false, optimizeForSpeed: true, ...(options as ScreenshotOptions) }))
        await page.close()
        return content
      })
      await mkdirp(dirname(out))
      await writeFile(out, await (type === 'PDF' ? combinePDFs : combinePNGs)(contents))
      console.info('Printed', type, 'document to', out)
    }).catch((trace) => {
      console.error('An error occurred compiling', type, 'document')
      console.error(trace)
    })
  }

  async function combinePNGs(imgs: Uint8Array[]): Promise<Buffer> {
    const meta = await Promise.all(imgs.map(img => sharp(img).metadata()))
    const { maxh: height, w: width } = meta.reduce(({ maxh, w }, { width, height }) => ({ maxh: Math.max(maxh, height ?? 0), w: (width ?? 0) + w }), { maxh: 0, w: 0 })
    return await sharp({ create: { width, height, channels: 3, background: 'white' } }).composite(imgs.map((data, i) => ({
      input: Buffer.from(data),
      top:   0,
      left:  meta.slice(0, i).reduce((sum, { width }) => sum + (width ?? 0), 0),
    }))).png().toBuffer()
  }

  async function combinePDFs(pdfs: Uint8Array[]): Promise<Buffer> {
    const doc = new Document({ properties, font: null! })
    pdfs.forEach(content => doc.addPagesOf(new ExternalDocument(Buffer.from(content))))
    return doc.asBuffer()
  }

  return {
    name: 'vite-plugin:renderer',
    configureServer() { writeBundle() },
    handleHotUpdate() { writeBundle() },
    writeBundle()     { writeBundle() },
  }
}

function allParallel<I, R>(input: I[], fn: (i: I) => Promise<R>): Promise<R[]> {
  return Promise.all(input.map(fn))
}

function allSequential<I, R>(input: I[], fn: (i: I) => Promise<R>): Promise<R[]> {
  return input.reduce(
    (prev, curr) => prev.then(res => fn(curr).then(r => [...res, r])),
    Promise.resolve([] as R[]),
  )
}
