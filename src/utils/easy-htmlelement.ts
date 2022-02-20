import externalLink from 'src/assets/external-link.svg?template';

import { RegExpGroups } from 'src/types';

const SVGNS = 'http://www.w3.org/2000/svg';

export default class EasyHTMLElement {

  private readonly e!: HTMLElement | SVGElement;

  constructor(base: string | HTMLElement | SVGElement) {
    this.e = typeof base === 'string' ? document.createElement(base) : base;
  }

  public static anchor({ href, text }: { href: string, text: string }): EasyHTMLElement {
    return new EasyHTMLElement('a').attrs({ href }).content(text, new EasyHTMLElement(externalLink.content.cloneNode(true) as SVGElement));
  }

  public cls(...classes: string[]): this {
    this.e.classList.add(...classes.filter(c => !!c));
    return this;
  }

  public attrs(attributes: Record<string, { toString: () => string }>): this {
    Object.entries(attributes).forEach(([k, v]) => this.e.setAttribute(k, String(v)));
    return this;
  }

  public styles(styles: Record<string, { toString: () => string }>): this {
    Object.entries(styles).forEach(([k, v]) => this.e.style.setProperty(k, String(v)));
    return this;
  }

  public at(area: string): this {
    return this.attrs({ 'grid-area': area }).styles({ 'grid-area': area }); // For ease of use with CSS selectors
  }

  /**
   * Parses contents and replace:
   * - linefeeds with `<br />`
   * - markdown-style links with `<a href="...">...</a>`
   * - "&nbsp;" with `\u00A0` (non-breaking space)
   */
  public content(...contents: ReadonlyArray<string | EasyHTMLElement>): this {
    const anchors: EasyHTMLElement[] = [];
    this.e.append(...contents.flatMap(c => (typeof c !== 'string' ? c.e : c
      .replace(/&nbsp;/g, '\u00A0') // non-breaking spaces
      .replace(
        /\[(?<text>[^\]]+)\]\((?<href>[^)]+)\)/g,
        (...args) => anchors.push(EasyHTMLElement.anchor(args.pop() as RegExpGroups<'text' | 'href'>)) as 1 && ':~:',
      )
      .split(':~:')
      .flatMap((s, i) => (!i ? s : [(anchors.shift() as EasyHTMLElement).e, s]))
      .flatMap(t => (typeof t !== 'string' ? t : t.split(/\n/g).flatMap(s => [new EasyHTMLElement('br').e, s]).slice(1)))
    )));

    return this;
  }

}

export function element(tag: keyof HTMLElementTagNameMap | HTMLElement = 'div'): EasyHTMLElement {
  return new EasyHTMLElement(tag);
}

export function elementSVG(tag: keyof SVGElementTagNameMap = 'svg'): EasyHTMLElement {
  return new EasyHTMLElement(document.createElementNS(SVGNS, tag));
}

export function div(...contents: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return new EasyHTMLElement('div').content(...contents);
}

export function span(...contents: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return new EasyHTMLElement('span').content(...contents);
}

export function anchor({ href, text }: { href: string, text: string }): EasyHTMLElement {
  return EasyHTMLElement.anchor({ href, text });
}
export function section(id: string): EasyHTMLElement {
  return new EasyHTMLElement('section').attrs({ id });
}

export function article(cls: string): EasyHTMLElement {
  return new EasyHTMLElement('article').cls(cls);
}

/**
 * Creates a new `<span />` element with the supplied `content`,
 * unless the content already is a *single EasyHTMLElement*, in which case
 * it won't be wrapped into a (meaningless) span.
 */
function make(...content: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return (content.length === 1 && typeof content[0] !== 'string') ? content[0] : span(...content);
}

export function lighter(...content: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return make(...content).cls('lighter');
}

export function lightest(...content: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return make(...content).cls('lightest');
}
