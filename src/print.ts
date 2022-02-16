import { promises as fs } from 'fs';
import { resolve } from 'path';

import { DocumentProperties, Document, ExternalDocument } from 'pdfjs';
import Puppeteer, { PDFOptions } from 'puppeteer';

export default async function compile(
  { host = '127.0.0.1', port }: { host?: string, port: number },
  output: string,
  { options, properties }: { options?: PDFOptions, properties?: DocumentProperties },
): Promise<void> {
  const browser = await Puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disabled-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`http://${host}:${port}`, { waitUntil: 'networkidle0' });
  const content = await page.pdf({ format: 'a4', landscape: false, printBackground: true, ...options });
  await browser.close();
  // TODO: maybe simply use an EXIF editor and drop pdfjs
  // Unless we need multiple pages and want to merge them into one document eventually.
  const doc = new Document({ properties, font: null as unknown as Font });
  doc.addPagesOf(new ExternalDocument(content));
  const buffer = await doc.asBuffer();
  await fs.writeFile(resolve(output), buffer);
}
