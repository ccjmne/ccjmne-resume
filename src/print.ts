import { promises as fs } from 'fs';
import { resolve } from 'path';
import { Document, DocumentProperties, ExternalDocument } from 'pdfjs';
import { launch, PDFOptions } from 'puppeteer';

export default async function compile(
  input: string,
  output: string,
  { options, properties }: { options?: PDFOptions, properties?: DocumentProperties },
): Promise<void> {
  const browser = await launch({ headless: true, args: ['--no-sandbox', '--disabled-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file://${resolve(input)}`, { waitUntil: 'networkidle0' });
  const content = await page.pdf({ format: 'A4', landscape: false, printBackground: true, ...options, path: null });
  await browser.close();
  const doc = new Document({ font: null, properties });
  doc.addPagesOf(new ExternalDocument(content));
  const buffer = await doc.asBuffer();
  await fs.writeFile(resolve(output), buffer);
}
