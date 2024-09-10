import { MatcherWGroups } from "types"
import EasyHTMLElement, { elementSVG } from "./easy-htmlelement"

// TODO: return HTML elements correctly positioned instead of SVG Text nodes for labels
export function render(timeline: string[], pivots: number[], height: number): EasyHTMLElement {
  const domain   = [timeline.length, ...timeline.map((c, i) => [c, timeline.length - i - 1] as const).filter(([c]) => c.includes(HIGHLIGHT)).map(([, i]) => i), 0]
  const range    = [0, ...pivots, height]
  const map      = zip(domain, range).toReversed()
  const segments = zip(map.slice(0, -1), map.slice(1))

  function scale(at: number): number { // Piecewise linear scale
    const [[x0, y0], [x1, y1]] = segments.findLast(([[a]]) => at >= a)!
    return (at - x0) * ((y1 - y0) / (x1 - x0)) + y0
  }

  return elementSVG()
    .attrs({ height, width: '100%', viewBox: `0 0 10 ${height}`, preserveAspectRatio: 'xMaxYMin meet' })
    .content(elementSVG('g').attrs({ 'mask': 'url(#git-clip)' }).content(...graph(compute(timeline.toReversed()), scale)))
}

type Branch = {
  depth:  number,
  events: Array<{ pos: number, type: string, label: string, xsection: number }>,
}

// TODO: Do I need the years?
const MILESTONE_PARSER = /^(?<year>\d{4}) (?<pipes>[★☆│├┘┐╷]+)\s*(?<label>.*?)\s*$/ as MatcherWGroups<'year' | 'pipes' | 'label'>
const [HIGHLIGHT, MILESTONE, NEW, MERGE, END] = ['★', '☆', '┘', '┐', '╷']
const UNIT_X = 20 // TODO: get from scss

function compute(timeline: string[]): Branch[] {
  const branches: Branch[] = [{ depth: 0, events: [] }]
  const ongoing:  Branch[] = [branches[0]]

  timeline.map(c => MILESTONE_PARSER.exec(c)!.groups).forEach(({ pipes, label }, pos) => {
    for (const { 0: type, index: depth } of pipes.matchAll(/[^│├]/g)!) {
      const branch = ongoing.find(({ depth: d }) => d === depth) ?? { depth, events: [] }
      branch.events.push({ pos, type, label, xsection: pipes.length })
      ongoing.splice(ongoing.indexOf(branch), +[MERGE, END].includes(type), ...type === NEW ? [branch] : [])
      branches.splice(0, 0, ...type === NEW ? [branch] : [])
    }
  })

  return branches
}

function graph(branches: Branch[], scale: (at: number) => number): EasyHTMLElement[] {
  const colours = branches.map(() => Math.floor(Math.random() * (1 << 6) + (1 << 7))) // TODO: make deterministic (also do in scss)
  const mask = elementSVG('mask').attrs({ id: 'timeline-mask' }).content(
    elementSVG('rect').attrs({ x: -10000, y: 0, width: 20000, height: 10000, fill: '#fff' }),
    ...branches.flatMap(({ events, depth }) => events.map(e => ({ depth, ...e }))
      .filter(({ type }) => [MILESTONE, HIGHLIGHT].includes(type))
      .flatMap(({ pos, type }) => [
        elementSVG('circle').attrs({ r: 2.5, cx: -depth * UNIT_X, cy: scale(pos), fill: '#000' }),
        ...type === HIGHLIGHT ? [] : [elementSVG('path').attrs({ d: `M${-depth * UNIT_X - 10},${scale(pos)} h-200`, stroke: '#000', 'stroke-width': '10px' })],
      ])
    ))

  const g = elementSVG('g').attrs({ mask: `url(#timeline-mask)` }).content(...branches.flatMap(function({ depth, events }: Branch, i): EasyHTMLElement[] {
    const [first, last] = [events.at(0)!, events.at(-1)!]
    const colour = colours[i]
    return [elementSVG('path').attrs({
      'stroke-linecap': 'round', fill: 'none', transform2: `translate(${-depth * UNIT_X})`, stroke: `rgb(${colour}, ${colour}, ${colour})`, 'stroke-width': '4px',
      d: `M${-depth * UNIT_X},${scale(first.pos)}`
        + (first.type === NEW ? `m${UNIT_X},0 h${-(UNIT_X - 10)} a10,10 0 0,1 ${-10},-10` : 'v10')
        + `V${scale(last.pos) + 10}` + (last.type === MERGE ? `a10,10 0 0,1 ${10},-10 h${(UNIT_X - 10)} ` : 'v-10') // TODO: fizzle out at end
    }),
    ...events.filter(({ type }) => [MILESTONE, HIGHLIGHT].includes(type)).map(({ pos, type }) => elementSVG('circle')
      .attrs({ r: 7, cx: -depth * UNIT_X, cy: scale(pos), fill: type === HIGHLIGHT ? 'hsl(185 52% 33% / 1)' : `rgb(${colour}, ${colour}, ${colour})` })),
    ]
  }))

  const labels = branches.flatMap(function({ depth, events }: Branch, i): EasyHTMLElement[] {
    const colour = colours[i]
    return events.filter(({ label }) => !!label).flatMap(({ pos, label, xsection }) => [
      elementSVG('path').attrs({
        d: `M${-depth * UNIT_X - UNIT_X / 2},${scale(pos)} h${(depth - xsection) * UNIT_X + 1.5 * UNIT_X / 2}`,
        stroke: `rgb(${colour}, ${colour}, ${colour})`, 'stroke-dasharray': '5 0', 'stroke-width': '2px',
      }),
      elementSVG('text')
        .styles({ 'font-size': 'smaller' })
        .attrs({ x: UNIT_X * -xsection, y: scale(pos), 'text-anchor': 'end', 'dominant-baseline': 'middle' })
        .content(label)
    ])
  })

  return [mask, g, ...labels]
}

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}
