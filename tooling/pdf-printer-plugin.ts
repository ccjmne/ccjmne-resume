import { promises as fs } from 'fs';
import { resolve } from 'path';

import { Document, ExternalDocument, type DocumentProperties } from 'pdfjs';
import Puppeteer, { type Browser, type PDFOptions } from 'puppeteer';
import { type Compiler, type WebpackPluginInstance } from 'webpack';

export type PDFPrinterConfig = {
  scheme?: 'http' | 'file';
  host?: string;
  port?: string;
  path?: string;
  output: string;
  options?: PDFOptions;
  properties?: DocumentProperties;
};

export class PDFPrinter implements WebpackPluginInstance {

  private browser: Browser;

  public constructor(private config: PDFPrinterConfig) {}

  public apply(compiler: Compiler): void {
    compiler.hooks.watchRun.tap('Launch Puppeteer', () => this.launch());
    compiler.hooks.done.tap('Print PDF', () => this.print());
    compiler.hooks.watchClose.tap('Gracefully Close Puppeteer', () => this.close());
  }

  private async launch(): Promise<void> {
    this.browser ||= await Puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disabled-setuid-sandbox'] });
  }

  private async close(): Promise<void> {
    return this.browser?.close();
  }

  private async print(): Promise<void> {
    if (!this.browser) {
      await this.launch();
    }

    const { scheme = 'http', host = 'localhost', port = '80', path = '', output, options, properties } = this.config;
    const page = await this.browser.newPage();
    await page.goto(`${scheme}://${host}${scheme === 'http' ? `:${port}` : ''}/${path}`, { waitUntil: 'networkidle0' });
    const content = await page.pdf({ format: 'a4', landscape: false, printBackground: true, ...options });
    await page.close();

    // TODO: maybe simply use an EXIF editor and drop pdfjs
    // Unless we need multiple pages and want to merge them into one document eventually.
    const doc = new Document({ properties, font: null as unknown as Font });
    doc.addPagesOf(new ExternalDocument(content));
    const buffer = await doc.asBuffer();
    await fs.writeFile(resolve(output), buffer);
  }

}
