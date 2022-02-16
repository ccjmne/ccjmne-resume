import { RegExpWGroups } from 'src/types';

import css from '../scss/exported-vars.scss';

import { EasyHTMLElement, elementSVG } from './easy-htmlelement';

/**
 * Generates the `d` attribute for a `path` SVG element that draws a diamond.
 * Conserves initial cursor position.
 * @param r Circumradius of the diamond
 * @param align Whether the current location shall correspond to the left or center of the diamond
 */
function diamondPath(r: number, align: 'center' | 'left' = 'center'): string {
  return `
    ${align === 'center' ? `m-${r},0` : ''}
    l${r},-${r}l${r},${r}l-${r},${r}l-${r},-${r}z
    ${align === 'center' ? `m${r},0` : ''}`;
}

// Inspired by https://stackoverflow.com/a/19303725
function seededRandom(): () => number {
  let seed = 1990 - 5 - 15;
  // eslint-disable-next-line no-plusplus
  return () => (r => r - Math.floor(r))(Math.sin(++seed) * 10000);
}

/**
 * JS implementation of the GLSL `smoothstep` function, as described here:
 * https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/smoothstep.xhtml
 */
function smoothstep(e0: number, e1: number): (x: number) => number {
  return (x: number) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); // clamp and linear interpolation
    return t * t * (3 - 2 * t); // smoothen through cubic interpolation
  };
}

export function hr(height = 10, reverse = false): EasyHTMLElement {
  const [gap, d1, d2, d3] = [height / 2, height / 2, height / 2.75, height / 3.5];
  return elementSVG('svg')
    .attrs({
      viewBox: `-1 -1 ${height + 2} ${height + 2}`,
      preserveAspectRatio: `${reverse ? 'xMaxYMid' : 'xMinYMid'} meet`,
      height,
    })
    .styles({ flex: '1', fill: 'none', stroke: 'currentColor' })
    .lighter()
    .content(
      elementSVG('g').attrs({ transform: `translate(${height / 2} ${height / 2}) rotate(${reverse ? 180 : 0})` }).content(
        elementSVG('path').attrs({
          d: `M0,0      ${diamondPath(d1, 'center')} m${d1},0
              m${gap},0 ${diamondPath(d2, 'left')} m${2 * d2},0
              m${gap},0 ${diamondPath(d3, 'left')}`,
        }),
        elementSVG('path').styles({ 'shape-rendering': 'crispEdges' }).attrs({ d: `M${-d1 + 2 * (d1 + d2 + d3) + 3 * gap},0 h9999` }),
      ),
    );
}

export function h2bg(size = 24): EasyHTMLElement {
  const [half, cols, rows] = [size / 2, 100, 7];
  const random = seededRandom();
  const ss = smoothstep(48, 12); // smoothly steps *down* over [12, 48]

  /**
   * Generates slight variations of the given colour.
   * @param hsl A css-style hsl representation of the base colour, like: `hsl(208deg 56% 26%)`
   */
  function colour(hsl: string): string {
    const { groups: { h, s, l } } = /^hsl\((?<h>\d+)(?:deg)?,? (?<s>\d+)%,? (?<l>\d+)%\)$/.exec(hsl) as RegExpWGroups<'h' | 's' | 'l'>;
    const [sat, lit] = [Number(s), Number(l)];
    return `hsl(${h}deg ${Math.floor(sat / 2 + (sat / 2) * random())}% ${Math.floor(lit + 20 * (random() - 0.5))}%)`;
  }

  /**
   * A diamond of diagonal `diag` centered around `(x, y)`.
   */
  function diamond({ x, y, diag }: { x: number, y: number, diag: number }): EasyHTMLElement {
    return elementSVG('path')
      .attrs({ transform: `translate(${x} ${y})`, d: diamondPath(diag / 2) })
      .styles({ fill: colour(css.primary) });
  }

  return elementSVG('svg')
    .attrs({ viewBox: `0 0 ${size * cols} ${half * (rows - 1)}`, preserveAspectRatio: 'xMaxYMid meet' })
    .styles({ 'position': 'absolute', 'top': 0, 'left': 0, 'height': '100%', 'z-index': -1 })
    .content(...Array.from({ length: rows }).flatMap((_, r) => Array.from(
      { length: cols },
      (_, c) => diamond({ x: size * (c + (r % 2) / 2), y: r * half, diag: Math.max(2, size * ss(c + (r % 2) / 2)) }),
    )));
}
