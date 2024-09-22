import { MatcherWGroups } from "types"
import EasyHTMLElement, { elementSVG } from "./easy-htmlelement"
import { rhombusPath } from "./svg-elements"

// TODO: return HTML elements correctly positioned instead of SVG Text nodes for labels
export function render(timeline: string[], pivots: number[], height: number): EasyHTMLElement {
  const domain   = [-1, ...timeline.map((s, i) => [s, i] as const).filter(([s]) => HIGHLIGHT.test(s)).map(([, i]) => i), timeline.length]
  const range    = [0, ...pivots, height]
  const map      = zip(domain, range)
  const segments = zip(map.slice(0, -1), map.slice(1))

  function scale(at: number): number { // Piecewise linear scale
    const [[x0, y0], [x1, y1]] = segments.find(([, [a]]) => at <= a)!
    return (at - x0) * ((y1 - y0) / (x1 - x0)) + y0
  }

  return elementSVG()
    .attrs({ height, width: '100%', viewBox: `0 0 20 ${height}`, preserveAspectRatio: 'xMaxYMin meet' })
    .content(elementSVG('g').attrs({ 'mask': 'url(#git-clip)' }).content(...graph(compute(timeline), scale)))
}

type Branch = {
  depth:  number,
  events: Array<{ pos: number, type: string, label: string, xsection: number }>,
}

// TODO: Do I need the years?
const MILESTONE_PARSER = /^(?<year>\d{4}) (?<pipes>[★☆│├┼┘┐╷╵]+)\s*(?<label>.*?)\s*$/ as MatcherWGroups<'year' | 'pipes' | 'label'>
const [HIGHLIGHT, MILESTONE, NEW, MERGE, SPAWN, END, CROSS] = [/★/, /☆/, /┼*┘/, /┼*┐/, /╵/, /╷/, /^┼$/]
const UNIT_X = 20 // TODO: get from scss

function compute(timeline: string[]): Branch[] {
  const branches: Branch[] = [{ depth: 0, events: [] }]
  const ongoing:  Branch[] = [branches[0]]

  timeline.toReversed()
    .map(entry => entry.replace(/\S+(?=★)|(?<=☆)\S+/, ({ length }) => '┼'.repeat(length))) // "Cross" for the label pin arm
    .map(c => MILESTONE_PARSER.exec(c)!.groups).forEach(({ pipes, label }, pos, { length }) => {
      for (const { 0: type, index } of [...pipes.matchAll(/┼*[^│├┼]/g)!, ...pipes.matchAll(/┼/g)!]) {
        const branch = ongoing.find(({ depth }) => depth === index + type.length - 1) ?? { depth: index + type.length - 1, events: [] }
        branch.events.push({ pos: length - pos - 1, type, label, xsection: pipes.length })
        ongoing.splice(ongoing.indexOf(branch), +(MERGE.test(type) || END.test(type)), ...NEW.test(type) ? [branch] : [])
        branches.splice(0, 0, ...NEW.test(type) ? [branch] : [])
      }
    })

  return branches
}

function graph(branches: Branch[], scale: (at: number) => number): EasyHTMLElement[] {
  const LINEWIDTH = 4 // TODO: Should maybe be in SCSS?
  const TURNSIZE = 10
  const GAPSIZE = 8

  function handleEvent({ type, pos }: Branch['events'][0]): string {
    switch (true) {
      case NEW.test(type):
        return `m${UNIT_X * type.length},0 h${-(UNIT_X * type.length - TURNSIZE)} a${TURNSIZE},${TURNSIZE} 0 0,1 ${-TURNSIZE},${-TURNSIZE}`
      case MERGE.test(type):
        return `V${scale(pos) + 10} a${TURNSIZE},${TURNSIZE} 0 0,1 ${+TURNSIZE},${-TURNSIZE} h${+(UNIT_X * type.length - TURNSIZE)}`
      case HIGHLIGHT.test(type):
      case MILESTONE.test(type):
      case CROSS.test(type):
        return `V${scale(pos) + GAPSIZE / 2} m0,${-GAPSIZE}`
      case END.test(type):
        return `V${scale(pos) - 10} h5h-10m5,0` // TODO: fizzle out
      case SPAWN.test(type):                    // TODO: fizzle in
      default:
        return `m0,10 h5h-10m5,0`
    }
  }

  return branches.flatMap(({ depth, events }) => {
    const colour = (c => `rgb(${c} ${c} ${c})` as const)(Math.floor(Math.random() * (1 << 6) + (1 << 7))) // TODO: make deterministic (also do in scss)

    // TODO: Possibly draw the milestones within the "line" (two `a` commands) if they're to remain the same colour
    // TODO: Use a different style for highlights
    const commits = events.filter(({ type }) => MILESTONE.test(type) || HIGHLIGHT.test(type)).map(({ type, pos })               => elementSVG('path').attrs({ d: rhombusPath({ x: -UNIT_X * depth, y: scale(pos), diag: 12}), stroke: HIGHLIGHT.test(type) ? 'hsl(185 52% 33% /1)' : colour, 'stroke-width': LINEWIDTH, fill: 'none' }))
    const pinsL   = events.filter(({ type, xsection }) => MILESTONE.test(type) && depth < xsection - 1).map(({ pos, xsection }) => elementSVG('path').attrs({ d: `M${-UNIT_X * depth - UNIT_X / 2 - 2},${scale(pos)} H${-UNIT_X * xsection + UNIT_X / 2 + 2}`, stroke: colour, 'stroke-width': LINEWIDTH / 2 }))
    const pinsR   = events.filter(({ type }) => HIGHLIGHT.test(type)).map(({ pos })                                             => elementSVG('path').attrs({ d: `M${-(UNIT_X * depth - UNIT_X / 2 - 2)},${scale(pos)} H20`, stroke: 'hsl(185 52% 33% / 1)', 'stroke-width': 2 }))
    const labels  = events.filter(({ type }) => MILESTONE.test(type)).map(({ pos, xsection, label })                            => elementSVG('text').attrs({ 'font-size': 'smaller', x: -UNIT_X * xsection + 8, y: scale(pos), 'text-anchor': 'end', 'dominant-baseline': 'middle' }).content(label))
    const line    = elementSVG('path').attrs({ transform2: `translate(${- UNIT_X * depth})`, d: `M${-UNIT_X * depth},${scale(events[0]!.pos)}` + events.map(handleEvent).join(''), stroke: colour, fill: 'none', 'stroke-width': LINEWIDTH })

    return [line, ...commits, ...pinsL, ...pinsR, ...labels]
  })
}

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}
