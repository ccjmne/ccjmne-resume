import { MatcherWGroups } from "types"
import EasyHTMLElement, { elementSVG } from "./easy-htmlelement"

type Branch = {
  depth:  number,
  events: Array<{ pos: number, type: string, label: string, xsection: number }>,
}

// TODO: Do I need the years?
const MILESTONE_PARSER = /^(?<year>\d{4}) (?<pipes>[★☆│├┘┐╷]+)\s*(?<label>.*?)\s*$/ as MatcherWGroups<'year' | 'pipes' | 'label'>
const [HIGHLIGHT, MILESTONE, NEW, MERGE, END] = ['★', '☆', '┘', '┐', '╷']
const UNIT_X = 20 // TODO: get from scss

function compute(milestones: string[]): Branch[] {
  const branches: Branch[] = [{ depth: 0, events: [] }]
  const ongoing:  Branch[] = [branches[0]]

  milestones.map(c => MILESTONE_PARSER.exec(c)!.groups).forEach(({ pipes, label }, pos) => {
    for (const { 0: type, index: depth } of pipes.matchAll(/[^│├]/g)!) {
      const branch = ongoing.find(({ depth: d }) => d === depth) ?? { depth, events: [] }
      branch.events.push({ pos, type, label, xsection: pipes.length })
      ongoing.splice(ongoing.indexOf(branch), +[MERGE, END].includes(type), ...type === NEW ? [branch] : [])
      branches.splice(0, 0, ...type === NEW ? [branch] : [])
    }
  })

  return branches
}

export function render(milestones: string[], range: number[]): EasyHTMLElement[] {
  const domain = [milestones.length, ...milestones.map((c, i) => [c, milestones.length - i] as const).filter(([c]) => c.includes(HIGHLIGHT)).map(([, i]) => i), 0]

  const map      = zip(domain, range).toReversed()
  const segments = zip(map.slice(0, -1), map.slice(1))

  function scale(at: number): number { // Piecewise linear scale
    const [[x0, y0], [x1, y1]] = segments.findLast(([[a]]) => at >= a)!
    return (at - x0) * ((y1 - y0) / (x1 - x0)) + y0
  }

  return compute(milestones.toReversed()).map(function({ depth, events }: Branch): EasyHTMLElement {
    const [first, last] = [events.at(0)!, events.at(-1)!]
    const colour = Math.floor(Math.random() * (1 << 6) + (1 << 7)) // TODO: make deterministic (also do in scss)

    return elementSVG('g').attrs({ transform: `translate(${-depth * UNIT_X})` }).content(
      elementSVG('path').attrs({
        fill: 'none', stroke: `rgb(${colour}, ${colour}, ${colour})`, 'stroke-width': '5px', d: `M0,${scale(first.pos)}`
          + (first.type === NEW ? `m${UNIT_X},0 h${-(UNIT_X - 10)} a10,10 0 0,1 ${-10}, -10` : 'v10')
          + `V${scale(last.pos) + 10}` + (last.type === MERGE ? `a10,10 0 0,1 ${10},-10 h${(UNIT_X - 10)} ` : 'v-10') // TODO: fizzle out at end
      }),
      ...events.filter(({ type }) => [MILESTONE, HIGHLIGHT].includes(type)).map(({ pos, type }) => elementSVG('circle')
        .attrs({ r: 7, cx: 0, cy: scale(pos), fill: 'white', 'stroke-width': '5', stroke: type === HIGHLIGHT ? 'hsl(185 52% 33% / 1)' : `rgb(${colour}, ${colour}, ${colour})` })),
      ...events.filter(({ label }) => !!label).flatMap(({ pos, label, xsection }) => [
        elementSVG('line').attrs({
          stroke: `red`, 'stroke-dasharray': '5 3', 'stroke-width': '1px', x2: 0 - UNIT_X / 2, x1: UNIT_X / 8 + UNIT_X * (depth - xsection), y2: scale(pos), y1: scale(pos)
        }),
        elementSVG('text')
          .styles({ 'font-size': 'smaller' })
          .attrs({ x: UNIT_X * (depth - xsection), y: scale(pos), 'text-anchor': 'end', 'dominant-baseline': 'middle' })
          .content(label)
      ]),
    )
  })
}

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}
