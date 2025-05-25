import type { RegExpGroups } from '/types'
import { hyphenateSync as hyphenate } from 'hyphen/en-gb'
import externalLink from '/assets/external-link.svg?raw'

const SVGNS = 'http://www.w3.org/2000/svg'
const HYPHENATE = /^y/i.test(process.env.HYPHENATE ?? 'no')

const anchorSVG = template(externalLink)
export default class EasyHTMLElement {
  private readonly elem!: HTMLElement | SVGElement

  constructor(base: string | HTMLElement | SVGElement) {
    this.elem = typeof base === 'string' ? document.createElement(base) : base
  }

  public static anchor({ href, text }: { href: string, text: string }): EasyHTMLElement {
    return new EasyHTMLElement('a').attrs({ href }).content(text, new EasyHTMLElement(anchorSVG.content.cloneNode(true) as SVGElement))
  }

  public cls(...classes: string[]): this {
    this.elem.classList.add(...classes.filter(cls => !!cls))
    return this
  }

  public attrs(attributes: Record<string, { toString: () => string }>): this {
    Object.entries(attributes).forEach(([k, v]) => this.elem.setAttribute(k, String(v)))
    return this
  }

  public styles(styles: Record<string, { toString: () => string }>): this {
    Object.entries(styles).forEach(([k, v]) => this.elem.style.setProperty(k, String(v)))
    return this
  }

  public at(area: string): this {
    return this.attrs({ 'grid-area': area }).styles({ 'grid-area': area }) // For ease of use with CSS selectors
  }

  public content(...contents: ReadonlyArray<string | EasyHTMLElement>): this {
    this.elem.replaceChildren(...EasyHTMLElement.prepare(contents))
    return this
  }

  public append(...contents: ReadonlyArray<string | EasyHTMLElement>): this {
    this.elem.append(...EasyHTMLElement.prepare(contents))
    return this
  }

  /**
   * Parses contents and:
   * - discard empty strings
   * - replace linefeeds (literal `\n` or `<br>`) with `<br />` elements
   * - replace markdown-style hyperlinks with `<a href="...">...</a>` elements
   * - replace `&nbsp;` with `\u00A0` (non-breaking space)
   *
   * Additionally, when the HYPHENATE environment variable starts with `y`,
   * automatically mark for hyphenation (for `en-gb`) with `\u00AD` (soft
   * hyphen).
   *
   * The idea is to use HYPHENATE=yes only in order to identify the adequate
   * hyphenating locations, then eventually manually hyphenate there, so as to
   * avoid needlessly confusing crawlers and possible ATSs (Applicant Tracking
   * System).
   */
  private static prepare(elements: ReadonlyArray<string | EasyHTMLElement>): ReadonlyArray<string | HTMLElement | SVGElement> {
    return elements
      .filter(content => !!content)
      .flatMap(content => (typeof content !== 'string' ? content.elem : content
        .replace(/&nbsp;/g, '\u00A0')
        .split(/(\[[^\]]+\]\([^)]+\))/) // split around markdown-style hyperlinks
        .map(fragment => fragment.match(/^\[(?<text>[^\]]+)\]\((?<href>[^)]+)\)$/)?.groups as RegExpGroups<'text' | 'href'> | undefined ?? fragment)
        .flatMap(fragment => (typeof fragment === 'string'
          ? fragment.split(/\n|<br>/g).flatMap(t => [new EasyHTMLElement('br').elem, HYPHENATE ? hyphenate(t) : t]).slice(1)
          : EasyHTMLElement.anchor(fragment).elem))
      ))
  }
}

export function element(tag: keyof HTMLElementTagNameMap | HTMLElement | SVGElement = 'div'): EasyHTMLElement {
  return new EasyHTMLElement(tag)
}

export function elementSVG(tag: keyof SVGElementTagNameMap = 'svg'): EasyHTMLElement {
  return new EasyHTMLElement(document.createElementNS(SVGNS, tag))
}

export function div(...contents: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return new EasyHTMLElement('div').content(...contents)
}

export function span(...contents: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return new EasyHTMLElement('span').content(...contents)
}

export function anchor({ href, text }: { href: string, text: string }): EasyHTMLElement {
  return EasyHTMLElement.anchor({ href, text })
}

export function section(id: string): EasyHTMLElement {
  return new EasyHTMLElement('section').attrs({ id })
}

export function article(cls: string): EasyHTMLElement {
  return new EasyHTMLElement('article').cls(cls)
}

/**
 * Creates a new `<span />` element with the supplied `content`,
 * unless the content already is a *single EasyHTMLElement*, in which case
 * it won't be wrapped into a (meaningless) span.
 */
function make(...content: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return (content.length === 1 && typeof content[0] !== 'string') ? content[0] : span(...content)
}

export function light(...content: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return make(...content).cls('light')
}

export function lighter(...content: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return make(...content).cls('lighter')
}

export function lightest(...content: ReadonlyArray<string | EasyHTMLElement>): EasyHTMLElement {
  return make(...content).cls('lightest')
}

function template(content: string): HTMLTemplateElement {
  const tmpl = document.createElement('template')
  tmpl.innerHTML = content.trim()
  return tmpl
}
