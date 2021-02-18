const domParser = new DOMParser();

export type EasyHTMLElement = HTMLElement & {
  classed: (...classes: string[]) => EasyHTMLElement,
  attrs: (a: { [key: string]: string }) => EasyHTMLElement,
  content: (...c: (string | EasyHTMLElement)[]) => EasyHTMLElement,
  html: (html: string) => EasyHTMLElement,
  at: (area: string) => EasyHTMLElement,
  lighter: () => EasyHTMLElement,
  lightest: () => EasyHTMLElement,
};

export function element(base: string | HTMLElement = 'span'): EasyHTMLElement {
  return Object.assign(typeof base === 'string' ? document.createElement(base) : base, {
    classed(this: EasyHTMLElement, ...classes: string[]): EasyHTMLElement {
      this.classList.add(...classes.filter(c => !!c));
      return this;
    },

    attrs(this: EasyHTMLElement, a: { [key: string]: string }): EasyHTMLElement {
      Object.entries(a).forEach(([k, v]) => this.setAttribute(k, v));
      return this;
    },

    /**
     * Parses contents and replace:
     * - linefeeds with `<br />`
     * - markdown-style links with `<a href="...">...</a>`
     */
    content(this: EasyHTMLElement, ...c: (string | EasyHTMLElement)[]): EasyHTMLElement {
      return this.html(c
        .map(s => (typeof s === 'string'
          ? s
            .replace(/\n/g, String(element('br')))
            .replace(/\[(?<text>[^\]]+)\]\((?<href>[^)]+)\)/g, (...args) => {
              const { text, href } = args.pop();
              return String(element('a').attrs({ href }).content(text));
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

export type ElementContent = (string | EasyHTMLElement)[];

export function span(...content: ElementContent): EasyHTMLElement {
  return element().content(...content);
}

export function div(...content: ElementContent): EasyHTMLElement {
  return element('div').content(...content);
}

export function lighter(...content: ElementContent): EasyHTMLElement {
  return span(...content).lighter();
}

export function lightest(...content: ElementContent): EasyHTMLElement {
  return span(...content).lightest();
}
