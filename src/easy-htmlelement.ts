export type EasyHTMLElement = HTMLElement & {
  classed: (...classes: string[]) => EasyHTMLElement,
  attrs: (a: { [key: string]: string }) => EasyHTMLElement,
  content: (...c: (string | EasyHTMLElement)[]) => EasyHTMLElement,
  at: (area: string) => EasyHTMLElement,
  lighter: () => EasyHTMLElement,
  lightest: () => EasyHTMLElement,
};

export function element(type = 'span'): EasyHTMLElement {
  return Object.assign(document.createElement(type), {
    classed(this: EasyHTMLElement, ...classes: string[]): EasyHTMLElement {
      this.classList.add(...classes.filter(c => !!c));
      return this;
    },

    attrs(this: EasyHTMLElement, a: { [key: string]: string }): EasyHTMLElement {
      Object.entries(a).forEach(([k, v]) => this.setAttribute(k, v));
      return this;
    },

    content(this: EasyHTMLElement, ...c: (string | EasyHTMLElement)[]): EasyHTMLElement {
      this.innerHTML = c.join('');
      return this;
    },

    at(this: EasyHTMLElement, area: string): EasyHTMLElement {
      this.style.gridArea = area;
      return this;
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
