import { promises as fs } from 'fs'
import { dirname, resolve } from 'path'

import { mkdirp } from 'mkdirp'
import { Document, ExternalDocument, type DocumentProperties } from 'pdfjs'
import Puppeteer, { type Browser, type PDFOptions } from 'puppeteer'
import { type Compiler, type WebpackPluginInstance } from 'webpack'

type Concrete<T> = { [P in keyof T]-?: NonNullable<T[P]> }

export type PDFPrinterConfig = {
  output: string;
  scheme?: 'http' | 'file';
  host?: string;
  port?: string;
  path?: string;
  options?: PDFOptions;
  properties?: DocumentProperties;
  /** Whether the rest of the compilation should wait for PDF compilation to go through */
  blocking?: boolean;
}

export class PDFPrinter implements WebpackPluginInstance {

  private static readonly PLUGIN_ID = 'pdf-printer'

  private browser?: Browser

  public constructor(private readonly config: PDFPrinterConfig) {}

  public apply(compiler: Compiler): void {
    const logger = compiler.getInfrastructureLogger(PDFPrinter.PLUGIN_ID)
    logger.info('Reading contents from', this.uri)
    logger.info('Compiling PDF at', this.config.output)

    compiler.hooks.done[this.config.blocking === true ? 'tapPromise' : 'tap'](`${PDFPrinter.PLUGIN_ID}:compile`, async () => {
      try {
        await this.print()
        logger.info('Successfully printed', this.config.output)
      } catch (trace) {
        logger.error('An error occurred while attempting to compile PDF document')
        logger.error(trace)
      }
    })

    compiler.hooks.shutdown.tapPromise(`${PDFPrinter.PLUGIN_ID}:close`, () => this.close())
  }

  private async launch(): Promise<void> {
    this.browser ??= await Puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disabled-setuid-sandbox'] })
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
    const { output, options, properties } = this.config
    const page = await this.browser.newPage()
    await page.goto(this.uri, { waitUntil: 'networkidle0' })
    const content = await page.pdf({ format: 'a4', landscape: false, printBackground: true, ...options })
    await page.close()

    // TODO: maybe simply use an EXIF editor and drop pdfjs
    // Unless we need multiple pages and want to merge them into one document eventually.
    const doc = new Document({ properties, font: null as unknown as Font })
    doc.addPagesOf(new ExternalDocument(content))
    const buffer = await doc.asBuffer()

    await mkdirp(dirname(resolve(output)))
    await fs.writeFile(resolve(output), buffer)
  }

  private get uri(): string {
    const { scheme = 'http', host = 'localhost', port = '80', path = '' } = this.config
    return `${scheme}://${host}${scheme === 'http' ? `:${port}` : ''}/${path}`
  }

  // @ts-expect-error 'browser' isn't `keyof PDFPrinter` because it is a private property.
  // See https://github.com/microsoft/TypeScript/issues/46802
  private assertBrowser(): asserts this is PDFPrinter & Concrete<Pick<PDFPrinter, 'browser'>> {
    if (!this.browser) {
      throw new Error('Assertion failed: Browser is not ready')
    }
  }

}
