import type EasyHTMLElement from 'utils/easy-htmlelement';
import { elementSVG } from 'utils/easy-htmlelement';

import caustics from './assets/caustics.jpg?dataURI';

export default function logo(): EasyHTMLElement {
  const stroke = 5;
  const size = 30;
  const gap = 3;

  const [w, h] = [(size + stroke) * 3 + gap * 2, (size + stroke) * 2 + gap]; // bounding box of "ccj-mne"
  const [maskID, gradientID] = ['logo-mask', 'logo-gradient'];

  const span = Math.sqrt((w + stroke * 2) ** 2 * 2); // dimensions of the entire logo

  return elementSVG()
    .attrs({ viewBox: `${-span / 2} ${-span / 2} ${span} ${span}` })
    .content(
      elementSVG('defs').content(
        elementSVG('mask').attrs({ id: maskID }).content(
          elementSVG('rect').attrs({
            fill: '#fff',
            x: -w / 2 + stroke,
            y: -w / 2 + stroke,
            width: w - stroke * 2,
            height: w - stroke * 2,
            transform: 'rotate(45)',
          }),
          elementSVG('g').attrs({
            'fill': 'none',
            'stroke': '#000',
            'stroke-width': stroke,
            'stroke-linecap': 'square',
            'transform': `translate(${-(w - stroke) / 2} ${-(h - stroke) / 2}) rotate(45 ${(w - stroke) / 2} ${(h - stroke) / 2})`,
            // 'transform': `translate(${-(w - stroke) / 2} ${-(h - stroke) / 2})`,
          }).content(
            // c
            elementSVG('g').content(
              elementSVG('path').attrs({ 'stroke-linejoin': 'bevel', 'd': `M${size},0h${-size}v${size}h${size}` }),
              elementSVG('path').attrs({ d: `M0,${size / 2} v${size / 2} h${size}` }),
            ),
            // c
            elementSVG('g').attrs({ transform: `translate(${size + stroke + gap})` }).content(
              elementSVG('path').attrs({ 'stroke-linejoin': 'bevel', 'd': `M${size},0h${-size}v${size}h${size}` }),
              elementSVG('path').attrs({ d: `M0,${size / 2} v${size / 2} h${size}` }),
            ),
            // j
            elementSVG('g').attrs({ transform: `translate(${(size + stroke + gap) * 2})` }).content(
              elementSVG('path').attrs({ 'stroke-linejoin': 'bevel', 'd': `M0,0 h${size} v${size} h${-size}` }),
              elementSVG('path').attrs({ d: `M${size / 2},0 h${size / 2} v${size / 2}` }),
            ),
            // m
            elementSVG('g').attrs({ transform: `translate(0 ${size + stroke + gap})` }).content(
              elementSVG('path').attrs({ 'stroke-linejoin': 'bevel', 'd': `M0,${size} v${-size} h${size / 2} v6 v-6 h${size / 2} v${size}` }),
              elementSVG('path').attrs({ d: `M0,${size / 2} v${-size / 2} h${size / 2}` }),
            ),
            // n
            elementSVG('g').attrs({ transform: `translate(${size + stroke + gap} ${size + stroke + gap})` }).content(
              elementSVG('path').attrs({ 'stroke-linejoin': 'bevel', 'd': `M0,${size} v${-size} h${size} v${size}` }),
              elementSVG('path').attrs({ d: `M0,${size / 2} v${-size / 2} h${size / 2}` }),
            ),
            // e
            elementSVG('g').attrs({ transform: `translate(${(size + stroke + gap) * 2} ${size + stroke + gap})` }).content(
              elementSVG('path').attrs({ 'stroke-linejoin': 'bevel', 'd': `M${size},0 h${-size} v${size / 2} h6 h-6 v${size / 2} h${size}` }),
              elementSVG('path').attrs({ d: `M${size / 2},0 h${-size / 2} v${size / 2}` }),
            ),
          ),
          elementSVG('rect').attrs({
            'x': -(w / 2 + stroke / 2),
            'y': -(w / 2 + stroke / 2),
            'width': w + stroke,
            'height': w + stroke,
            'fill': 'none',
            'stroke': '#fff',
            'stroke-width': stroke,
            'transform': 'rotate(45)',
          }),
        ),
        elementSVG('linearGradient').attrs({
          id: gradientID,
          gradientUnits: 'userSpaceOnUse',
          x1: -span / 4,
          y1: -span / 4,
          x2: span / 4,
          y2: span / 4,
        }).content(
          elementSVG('stop').attrs({ 'offset': 0, 'stop-color': '#2c7f87', 'stop-opacity': .75 }),
          elementSVG('stop').attrs({ 'offset': 1, 'stop-color': '#213d5a', 'stop-opacity': .75 }),
        ),
      ), // </defs>
      elementSVG('image').attrs({ href: caustics, x: -380, y: -380, mask: `url(#${maskID})` }),
      elementSVG('rect').attrs({ x: -span / 2, y: -span / 2, width: span, height: span, fill: `url(#${gradientID})`, mask: `url(#${maskID})` }),
    );
}
