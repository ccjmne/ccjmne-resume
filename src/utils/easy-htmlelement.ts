import externalLink from 'src/assets/external-link.svg?template';

import { RegExpGroups } from 'src/types';

const SVGNS = 'http://www.w3.org/2000/svg';

export type EasyHTMLElement = (HTMLElement | SVGElement) & {
  classed: (...classes: string[]) => EasyHTMLElement;
  attrs: (a: { [key: string]: { toString: () => string } }) => EasyHTMLElement;
  styles: (a: { [key: string]: { toString: () => string } }) => EasyHTMLElement;
  content: (...c: (string | EasyHTMLElement)[]) => EasyHTMLElement;
  html: (html: string) => EasyHTMLElement;
  at: (area: string) => EasyHTMLElement;
  lighter: () => EasyHTMLElement;
  lightest: () => EasyHTMLElement;
};

export function element(base: string | (HTMLElement | SVGElement) = 'span'): EasyHTMLElement {
  return Object.assign(typeof base === 'string' ? document.createElement(base) : base, {
    classed(this: EasyHTMLElement, ...classes: string[]): EasyHTMLElement {
      this.classList.add(...classes.filter(c => !!c));
      return this;
    },

    attrs(this: EasyHTMLElement, a: { [key: string]: { toString: () => string } }): EasyHTMLElement {
      Object.entries(a).forEach(([k, v]) => this.setAttribute(k, String(v)));
      return this;
    },

    styles(this: EasyHTMLElement, s: { [key: string]: { toString: () => string } }): EasyHTMLElement {
      Object.entries(s).forEach(([k, v]) => this.style.setProperty(k, String(v)));
      return this;
    },

    /**
     * Parses contents and replace:
     * - linefeeds with `<br />`
     * - markdown-style links with `<a href="...">...</a>`
     * - ellipses ("[...]") with a specifically-style element
     */
    content(this: EasyHTMLElement, ...c: (string | EasyHTMLElement)[]): EasyHTMLElement {
      return this.html(c
        .map(s => (typeof s === 'string'
          ? s
            .replaceAll('[...]', String(element('span').classed('ellipsis')))
            .replace(/\n/g, String(element('br')))
            .replace(/\[(?<text>[^\]]+)\]\((?<href>[^)]+)\)/g, (...args) => {
              const { text, href } = args.pop() as RegExpGroups<'text' | 'href'>;
              // TODO: rewrite everything here with an actual class anyways
              // and don't just Stringify anything. Use Document#createTextNode and Node#appendChild
              return String(link({ text, href }));
            })
          : String(s)))
        .join(''));
    },

    html(this: EasyHTMLElement, html: string): EasyHTMLElement {
      this.innerHTML = html;
      return this;
    },

    at(this: EasyHTMLElement, area: string): EasyHTMLElement {
      this.style.gridArea = area;
      return this.attrs({ 'grid-area': area }); // for ease of use with css selectors
    },

    lighter(this: EasyHTMLElement): EasyHTMLElement {
      return this.classed('lighter');
    },

    lightest(this: EasyHTMLElement): EasyHTMLElement {
      return this.classed('lightest');
    },

    toString(this: EasyHTMLElement): string {
      return this.outerHTML;
    },
  });
}

export function elementSVG(type = 'svg'): EasyHTMLElement {
  return element(document.createElementNS(SVGNS, type)).attrs(type === 'svg' ? { xmlns: SVGNS } : {});
}

export type ElementContent = (string | EasyHTMLElement)[];

export function span(...content: ElementContent): EasyHTMLElement {
  return element().content(...content);
}

export function div(...content: ElementContent): EasyHTMLElement {
  return element('div').content(...content);
}

export function link({ text, href }: { text: string, href: string }): EasyHTMLElement {
  const a = element('a').attrs({ href }).content(text.trim());
  a.appendChild(externalLink.content.cloneNode(true));
  return a;
}

export function section(id: string, ...content: ElementContent): EasyHTMLElement {
  return element('section').attrs({ id }).content(...content);
}

export function article(cls: string, ...content: ElementContent): EasyHTMLElement {
  return element('article').classed(cls).content(...content);
}

/**
 * Creates a new `<span />` element with the supplied `content`,
 * unless the content already is a *single EasyHTMLElement*, in which case
 * it won't be wrapped into a (meaningless) span.
 */
export function make(...content: ElementContent): EasyHTMLElement {
  return (content.length === 1 && typeof content[0] !== 'string')
    ? content[0]
    : span(...content);
}

export function lighter(...content: ElementContent): EasyHTMLElement {
  return make(...content).lighter();
}

export function lightest(...content: ElementContent): EasyHTMLElement {
  return make(...content).lightest();
}
