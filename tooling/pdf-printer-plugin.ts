import { execSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { mkdirp } from 'mkdirp'
import { Document, ExternalDocument, type DocumentProperties } from 'pdfjs'
import Puppeteer, { type Browser, type PDFOptions, type ScreenshotOptions } from 'puppeteer'
import sharp from 'sharp'
import { type Compiler, type WebpackPluginInstance } from 'webpack'

type Concrete<T> = { [P in keyof T]-?: NonNullable<T[P]> }

export type PDFPrinterConfig = {
  output:      string
  scheme?:     'http' | 'file'
  host?:       string
  port?:       string
  paths?:      string[]
  options?:    PDFOptions | ScreenshotOptions
  properties?: DocumentProperties
  /** Whether the rest of the compilation should wait for PDF compilation to go through */
  blocking?:   boolean
}

// TODO: Consider renaming to PrinterPlugin, together with its file name.
export class PDFPrinter implements WebpackPluginInstance {

  private static readonly PLUGIN_ID = 'pdf-printer'

  private browser?: Browser

  public constructor(private readonly config: PDFPrinterConfig) { }

  public apply(compiler: Compiler): void {
    const logger = compiler.getInfrastructureLogger(PDFPrinter.PLUGIN_ID)
    this.uris.map(uri => logger.info('Reading contents from', uri))
    logger.info('Compiling', this.type, 'at', this.output)

    compiler.hooks.done[this.config.blocking === true ? 'tapPromise' : 'tap'](`${PDFPrinter.PLUGIN_ID}:compile`, async () => {
      try {
        await this.print()
        logger.info('Successfully printed', this.output)
      } catch (trace) {
        logger.error('An error occurred compiling', this.type, 'document')
        logger.error(trace)
      }
    })

    compiler.hooks.shutdown.tapPromise(`${PDFPrinter.PLUGIN_ID}:close`, () => this.close())
  }

  private async launch(): Promise<void> {
    this.browser ??= await Puppeteer.launch({
      executablePath: execSync('ls /usr/bin/*chrom* | head -1').toString().trim(),
      headless: true,
      args: ['--no-sandbox', '--disabled-setuid-sandbox'],
    })
  }

  private async close(): Promise<void> {
    return this.browser?.close()
  }

  private async print(): Promise<void> {
    if (!this.browser) {
      await this.launch()
    }

    // TODO: prefer simple block-scoped type-narrowing when implemented in TS
    // See https://github.com/microsoft/TypeScript/issues/10421
    this.assertBrowser()
    const { config: { options }, type, output, uris } = this
    const contents = await (uris.reduce(async (b4, uri) => {
      const compiled = await b4 // Parallelised screenshot is broken w/ Puppeteer or Chrome
      const page = await this.browser.newPage()
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 }) // A4 Portrait @ 96 DPI
      await page.goto(uri, { waitUntil: 'networkidle0' })
      const content = await (type === 'PDF'
        ? page.pdf({ format: 'a4', landscape: false, printBackground: true, ...options })
        : page.screenshot({ fullPage: true, omitBackground: false, optimizeForSpeed: true, ...options }))
      await page.close()
      return [...compiled, content]
    }, Promise.resolve([])))

    await mkdirp(dirname(output))
    await writeFile(output, await (type === 'PDF' ? this.combinePDFs(contents) : this.combinePNGs(contents)))
  }

  private get uris(): string[] {
    const { scheme = 'http', host = 'localhost', port = '80', paths = [''] } = this.config
    return paths.map(path => `${scheme}://${host}${scheme === 'http' ? `:${port}` : ''}/${path.replace(/^[/]/, '')}`)
  }

  private get output(): string {
    return resolve(this.config.output.replace(/([.][a-w]{2,4})?$/i, ext => /^[.]png$/i.test(ext) ? '.png' : '.pdf'))
  }

  private get type(): 'PDF' | 'PNG' {
    return /[.]pdf$/i.test(this.output) ? 'PDF' : 'PNG'
  }

  private async combinePNGs(imgs: Uint8Array[]): Promise<Buffer> {
    const meta = await Promise.all(imgs.map(img => sharp(img).metadata()))
    const { maxh: height, w: width } = meta.reduce(({ maxh, w }, { width, height }) => ({ maxh: Math.max(maxh, height ?? 0), w: (width ?? 0) + w }), { maxh: 0, w: 0 })
    return await sharp({ create: { width, height, channels: 3, background: 'white' } }).composite(imgs.map((data, i) => ({
      input: Buffer.from(data),
      top: 0,
      left: meta.slice(0, i).reduce((sum, { width }) => sum + (width ?? 0), 0),
    }))).png().toBuffer()
  }

  private async combinePDFs(pdfs: Uint8Array[]): Promise<Buffer> {
    const doc = new Document({ properties: this.config.properties, font: null! })
    pdfs.forEach(content => doc.addPagesOf(new ExternalDocument(Buffer.from(content))))
    return doc.asBuffer()
  }

  // @ts-expect-error 'browser' isn't `keyof PDFPrinter` because it is a private property.
  // See https://github.com/microsoft/TypeScript/issues/46802
  private assertBrowser(): asserts this is PDFPrinter & Concrete<Pick<PDFPrinter, 'browser'>> {
    if (!this.browser) {
      throw new Error('Assertion failed: Browser is not ready')
    }
  }

}
