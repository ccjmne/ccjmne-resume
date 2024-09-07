import { MatcherWGroups } from "types"
import EasyHTMLElement, { elementSVG } from "./easy-htmlelement"

export type Range = number[]
export function draw(milestones: string[], range: Range): EasyHTMLElement[] {
  const domain = milestones.map((c, i) => [c, i] as const).filter(([c]) => c.includes(HIGHLIGHT)).map(([, i]) => i)
  return compute(milestones).map(contextualise([0, ...domain, milestones.length], range))
}

type Branch = {
  depth:  number,
  events: Array<{ pos: number, type: string, label: string, xsection: number }>,
}

// TODO: Do I need the years?
const MILESTONE_PARSER = /^(?<year>\d{4}) (?<pipes>[★☆│├┘┐╷]+)\s*(?<label>.*?)\s*$/ as MatcherWGroups<'year' | 'pipes' | 'label'>
const [HIGHLIGHT, MILESTONE, NEW, MERGE, END] = ['★', '☆', '┘', '┐', '╷']

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

function contextualise(domain: Range, range: Range): (branch: Branch) => EasyHTMLElement {
  const unitX = 20 // TODO: get from scss

  const map      = zip(domain, range)
  const segments = zip(map.slice(0, -1), map.slice(1))

  function scale(at: number): number { // Piecewise linear scale
    const [[x0, y0], [x1, y1]] = segments.findLast(([[a]]) => at >= a)!
    return (at - x0) * ((y1 - y0) / (x1 - x0)) + y0
  }

  return function draw({ depth, events }: Branch): EasyHTMLElement {
    const [first, last] = [events.at(0)!, events.at(-1)!]
    const colour = Math.floor(Math.random() * (1 << 6) + (1 << 7)) // TODO: make deterministic (also do in scss)

    return elementSVG('g').attrs({ transform: `translate(${-depth * unitX})` }).content(
      elementSVG('path').attrs({
        fill: 'none', stroke: `rgb(${colour}, ${colour}, ${colour})`, 'stroke-width': '5px', d: `M0,${scale(first.pos)}`
          + (first.type === NEW ? `m${unitX},0 h${-(unitX - 10)} a10,10 0 0,1 ${-10}, -10` : 'v10')
          + `V${scale(last.pos) + 10}` + (last.type === MERGE ? `a10,10 0 0,1 ${10},-10 h${(unitX - 10)} ` : 'v-10') // TODO: fizzle out at end
      }),
      ...events.filter(({ type }) => [MILESTONE, HIGHLIGHT].includes(type)).map(({ pos, type }) => elementSVG('circle')
        .attrs({ r: 7, cx: 0, cy: scale(pos), fill: 'white', 'stroke-width': '5', stroke: type === HIGHLIGHT ? 'hsl(185 52% 33% / 1)' : `rgb(${colour}, ${colour}, ${colour})` })),
      ...events.filter(({ label }) => !!label).flatMap(({ pos, label, xsection }) => [
        elementSVG('line').attrs({
          stroke: `red`, 'stroke-dasharray': '5 3', 'stroke-width': '1px', x2: 0 - unitX / 2, x1: unitX / 8 + unitX * (depth - xsection), y2: scale(pos), y1: scale(pos)
        }),
        elementSVG('text')
          .styles({ 'font-size': 'smaller' })
          .attrs({ x: unitX * (depth - xsection), y: scale(pos), 'text-anchor': 'end', 'dominant-baseline': 'middle' })
          .content(label)
      ]),
    )
  }
}

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}
