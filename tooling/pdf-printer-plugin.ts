import { promises as fs } from 'fs';
import { resolve } from 'path';

import { type DocumentProperties, Document, ExternalDocument } from 'pdfjs';
import Puppeteer, { type Browser, type Page, type PDFOptions } from 'puppeteer';
import { type Compiler } from 'webpack';

export type PDFPrinterConfig = {
  host?: string;
  port: number;
  output: string;
  options?: PDFOptions;
  properties?: DocumentProperties;
};

export class PDFPrinter {

  private browser: Browser;

  public constructor(private config: PDFPrinterConfig) {}

  // from `Webpack#Plugin` type (not exported, sadly)
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

    const { host = '127.0.0.1', port, output: outputPath, options, properties } = this.config;
    const page = await this.browser.newPage();
    await page.goto(`http://${host}:${port}`, { waitUntil: 'networkidle0' });
    const content = await page.pdf({ format: 'a4', landscape: false, printBackground: true, ...options });
    await page.close();

    // TODO: maybe simply use an EXIF editor and drop pdfjs
    // Unless we need multiple pages and want to merge them into one document eventually.
    const doc = new Document({ properties, font: null as unknown as Font });
    doc.addPagesOf(new ExternalDocument(content));
    const buffer = await doc.asBuffer();
    await fs.writeFile(resolve(outputPath), buffer);
  }

}
