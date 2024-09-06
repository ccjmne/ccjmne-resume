import { RegExpWGroups } from "types"
import EasyHTMLElement, { elementSVG } from "./easy-htmlelement"

export type Range = number[]
export function draw(milestones: string[], range: Range): EasyHTMLElement[] {
  const domain = milestones.map((c, i) => [c, i] as const).filter(([c]) => c.includes(HIGHLIGHT)).map(([, i]) => i)
  return compute(milestones).map(contextualise([0, ...domain, milestones.length], range))
}

type Branch = {
  depth: number,
  events: Array<{ pos: number, type: string, label: string }>,
}

// TODO: Do I need the years?
// TODO: Also, wouldn't I rather have the milestones in reverse chronological order in profile.json?
const MILESTONE_PARSER = /^(?<year>\d{4}) (?<pipes>[☆★│├┐┘╵]+)\s*(?<label>.*?)\s*$/v
const [NEW, MILESTONE, HIGHLIGHT, MERGE, END] = ['┐', '☆', '★', '┘', '╵']

function compute(milestones: string[]): Branch[] {
  const branches: Branch[] = [{ depth: 0, events: [] }]
  const ongoing: Branch[] = [branches[0]]

  // TODO: I don't like mutating arrays
  milestones.map(c => (MILESTONE_PARSER.exec(c) as RegExpWGroups<'pipes' | 'label'>).groups).forEach(({ year, pipes, label }, pos) => {
    [...pipes.matchAll(/[^│├]/g)!].forEach(({ 0: type, index: c }) => {
      if (type === NEW) {
        const branch = { depth: c!, events: [{ pos, type, label: '' }] }
        branches.push(branch)
        ongoing.push(branch)
        return
      }

      const branch = ongoing.find(({ depth: col }) => col === c)!
      branch.events.push({ pos, type, label: label })

      if ([MERGE, END].includes(type)) {
        ongoing.splice(ongoing.indexOf(branch), 1)
      }
    })
  })

  return branches
}

function contextualise(domain: Range, range: Range): (branch: Branch) => EasyHTMLElement {
  const unitX = 20; // TODO: get from scss
  const scale = piecewise(domain, range)

  return function draw({ depth: col, events }: Branch): EasyHTMLElement {
    const [first, last] = [events.at(0)!, events.at(-1)!]
    const colour = Math.floor(Math.random() * (1 << 6) + (1 << 7)) // TODO: make deterministic (also do in scss)

    return elementSVG('g').attrs({ transform: `translate(${-col * unitX})` }).content(
      elementSVG('path').attrs({
        fill: 'none', stroke: `rgb(${colour}, ${colour}, ${colour})`, 'stroke-width': '5px', d: `M0,${scale(first.pos)}`
          + (first.type === NEW ? `m${unitX},0 h${-(unitX - 10)} a10,10 0 0,1 ${-10}, -10` : 'v10')
          + `V${scale(last.pos) + 10}` + (last.type === MERGE ? `a10,10 0 0,1 ${10},-10 h${(unitX - 10)} ` : 'v-10') // TODO: fizzle out at end
      }),
      ...events.filter(({ type }) => [MILESTONE, HIGHLIGHT].includes(type)).map(({ pos: at, type }) => elementSVG('circle')
        .attrs({ r: 7, cx: 0, cy: scale(at), fill: 'white', 'stroke-width': '5', stroke: type === HIGHLIGHT ? 'hsl(185 52% 33% / 1)' : `rgb(${colour}, ${colour}, ${colour})` })),
      ...events.map(({ pos: at, label: label }) => elementSVG('text')
        .styles({ 'font-size': 'smaller' })
        .attrs({ x: -unitX / 2, y: scale(at), 'text-anchor': 'end', 'dominant-baseline': 'middle' })
        .content(label)),
    )
  }
}

function piecewise(domain: Range, range: Range): (at: number) => number {
  const map = zip(domain, range)
  const segments = zip(map.slice(0, -1), map.slice(1))

  return function scale(at: number): number {
    const [[x0, y0], [x1, y1]] = segments.findLast(([[a]]) => at >= a)!
    return (at - x0) * ((y1 - y0) / (x1 - x0)) + y0
  }
}

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}
