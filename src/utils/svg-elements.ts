import * as css from '../scss/exported-vars.module.scss'

import type EasyHTMLElement from './easy-htmlelement'
import { elementSVG } from './easy-htmlelement'

/**
 * Generates the `d` attribute for a `path` SVG element that draws a rhombus.
 * Preserves initial cursor position.
 * @param r Circumradius of the rhombus
 * @param align Whether the current location shall correspond to the left or center of the rhombus
 * @deprecated
 */
function rhombusPathD(r: number, align: 'center' | 'left' = 'center'): string {
  return `
    ${align === 'center' ? `m-${r},0` : ''}
    l${r},-${r}l${r},${r}l-${r},${r}l-${r},-${r}z
    ${align === 'center' ? `m${r},0` : ''}`
}

/**
 * Generates the `d` attribute for a `path` SVG element that draws a rhombus.
 * Overwrites cursor position.
 * @param x abscissa of the rhombus's centre
 * @param y ordinate of the rhombus's centre
 * @param diag Diagonal of the rhombus
 */
function rhombusPathAt({ x, y, diag }: { x: number, y: number, diag: number }): string {
  const r = diag / 2
  return `M${x},${y} m0,${-r} l${r},${r} l${-r},${r} l${-r},${-r} l${r},${-r} z`
}

// See https://stackoverflow.com/a/19303725
function seededRandom(seed?: number): () => number {
  let s = seed ?? 1990 - 5 - 15

  // eslint-disable-next-line no-plusplus
  return () => (r => r - Math.floor(r))(Math.sin(++s) * 10000)
}

/**
 * TS implementation of Ken Perlin's suggestion for a variation of GLSL `smoothstep` function, described here:
 * https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/smoothstep.xhtml
 */
function smootherstep(e0 = 0, e1 = 1): (x: number) => number {
  return (x: number) => {
    const t = Math.max(0, Math.min(1, ((x - e0) / (e1 - e0))))
    return t * t * t * (3 * t * (2 * t - 5) + 10)
  }
}

// TODO: rewrite using `rhombusPathAt`
export function rhombus(height = 10): EasyHTMLElement {
  return elementSVG()
    .cls('lighter')
    .attrs({ viewBox: `${-height / 2 - 1} ${-height / 2 - 1} ${height + 2} ${height + 2}`, height })
    .styles({ fill: 'none', stroke: 'currentColor' })
    .content(elementSVG('path').attrs({ d: rhombusPathD(height / 2) }))
}

// TODO: rewrite using `rhombusPathAt`
export function hr(height = 10, reverse = false): EasyHTMLElement {
  const [gap, d1, d2, d3] = [height / 2, height / 2, height / 2.75, height / 3.5]
  return elementSVG()
    .cls('lighter')
    .attrs({ viewBox: `-1 -1 ${height + 2} ${height + 2}`, preserveAspectRatio: `${reverse ? 'xMaxYMid' : 'xMinYMid'} meet`, height })
    .styles({ flex: '1', fill: 'none', stroke: 'currentColor' })
    .content(
      elementSVG('g').attrs({ transform: `translate(${height / 2} ${height / 2}) rotate(${reverse ? 180 : 0})` }).content(
        elementSVG('path').attrs({
          d: `M0,0      ${rhombusPathD(d1, 'center')} m${d1},0
              m${gap},0 ${rhombusPathD(d2, 'left')} m${2 * d2},0
              m${gap},0 ${rhombusPathD(d3, 'left')}`,
        }),
        elementSVG('path').styles({ 'shape-rendering': 'crispEdges' }).attrs({ d: `M${-d1 + 2 * (d1 + d2 + d3) + 3 * gap},0 h9999` }),
      ),
    )
}

export function h2bg(seed?: number): EasyHTMLElement {
  const HEIGHT = 100
  const random = seededRandom(seed)

  function visible(t: number): boolean {
    return (1 - (t - 1) ** 2) * .7 + .2 > random()
  }

  function disintegrate(rows: number, cols: number): string {
    if (rows < 2) {
      throw new Error('Requires at least two rows')
    }

    const size = HEIGHT / ((rows - 1) / 2)
    const step = smootherstep(size * cols, 0) // steps DOWN over [0, size * cols]

    return Array.from({ length: rows })
      .map((_, r) => Array.from({ length: cols })
        .map((_, c) => ({ x: (c + (r % 2) / 2) * size, y: (r * size) / 2 }))
        .filter(({ x }) => visible(step(x)))
        .map(({ x, y }) => rhombusPathAt({ x, y, diag: step(x) * size }))
        .join(' '))
      .join(' ')
  }

  const maskId = `h2bg-mask-${Math.floor(random() * 1000)}`
  return elementSVG()
    .attrs({ preserveAspectRatio: 'xMinYMid meet', viewBox: `0 0 1 ${HEIGHT}` })
    .styles({ position: 'absolute', top: 0, right: 0, height: '100%', width: '50%' })
    .content(
      elementSVG('defs').content(
        elementSVG('mask')
          .attrs({ id: maskId })
          .content(
            elementSVG('rect').attrs({ fill: 'white', x: 0, y: 0, width: 9999, height: HEIGHT }),
            elementSVG('path').attrs({ fill: 'black', d: disintegrate(7, 18) }),
          ),
      ),
      elementSVG('rect').attrs({ x: 0, y: 0, width: 9999, height: HEIGHT, fill: css['light-bg'], mask: `url(#${maskId})` }),
    )
}
