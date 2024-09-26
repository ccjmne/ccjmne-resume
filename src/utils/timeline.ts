import { MatcherWGroups } from "types"
import EasyHTMLElement, { element, elementSVG } from "./easy-htmlelement"
import { rhombusPath } from "./svg-elements"

// TODO: return HTML elements correctly positioned instead of SVG Text nodes for labels
export function render(timeline: string[], pivots: number[], height: number): [graph: EasyHTMLElement, labels: Array<EasyHTMLElement>] {
  const domain   = [-1, ...timeline.map((s, i) => [s, i] as const).filter(([s]) => HIGHLIGHT.test(s)).map(([, i]) => i), timeline.length]
  const range    = [0, ...pivots, height]
  const map      = zip(domain, range)
  const segments = zip(map.slice(0, -1), map.slice(1))

  function scale(at: number): number { // Piecewise linear scale
    const [[x0, y0], [x1, y1]] = segments.find(([, [a]]) => at <= a)!
    return (at - x0) * ((y1 - y0) / (x1 - x0)) + y0
  }

  return [
    elementSVG()
      .attrs({ height, width: '100%', viewBox: `0 0 20 ${height}`, preserveAspectRatio: 'xMaxYMin meet' })
      .content(...graph(compute(timeline), scale)),
    labels(compute(timeline), scale)
  ]
}

type Event = { pos: number, type: string, label: string, xsection: number }
type Branch = {
  depth:  number,
  events: Event[],
}

// TODO: Do I need the years?
// TODO: Support the following (allowing whitespace characters in the pipes):
//   ★
// ☆ │
// │☆│
// ││★
const MILESTONE_PARSER = /^(?<year>\d{4}) (?<pipes>[★☆│├┼┘┐╷╵]+)\s*(?<label>.*?)\s*$/s as MatcherWGroups<'year' | 'pipes' | 'label'>
const [HIGHLIGHT, MILESTONE, NEW, MERGE, SPAWN, END, CROSS] = [/★/, /☆/, /┼*┘/, /┼*┐/, /╵/, /╷/, /^┼$/]

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

const UNIT_X   = 18 // TODO: get from scss
const TURNSIZE = 10
const GAPSIZE  = 8

function graph(branches: Branch[], scale: (at: number) => number): EasyHTMLElement[] {
  function handleEvent({ type, pos }: Event): string {
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

  // λ is MILESTONE, Λ is HIGHLIGHT
  function preprocess({ events, depth }: Branch): { depth: number, events: (Event & { λ: boolean, Λ: boolean })[] } {
    return ({ depth, events: events.map(e => ({ ...e, λ: MILESTONE.test(e.type), Λ: HIGHLIGHT.test(e.type) })) })
  }

  return branches.map(preprocess).flatMap(({ depth, events }, i) => [
    // line
    elementSVG('path').cls(`colour-${i}`)
      .attrs({ d: `M${-UNIT_X * depth},${scale(events[0]!.pos)}` + events.map(handleEvent).join('') }),

    // commits
    ...events.filter(({ λ, Λ }) => λ || Λ).map(({ Λ, pos }) => elementSVG('path').cls(`colour-${Λ ? 'accent' : i}`)
      .attrs({ d: rhombusPath({ x: -UNIT_X * depth, y: scale(pos), diag: 12 }) })),

    // pins
    ...events.filter(({ λ, Λ, xsection }) => (λ && depth < xsection - 1) || Λ).map(({ Λ, pos, xsection }) => elementSVG('path').cls(`colour-${Λ ? 'accent' : i}`, 'thin')
      .attrs({ d: `M${-UNIT_X * depth + (Λ ? 1 : -1) * (UNIT_X / 2 + 2)},${scale(pos)} H${Λ ? 20 : -UNIT_X * xsection + UNIT_X / 2 + 2}` })),
  ])
}

function labels(branches: Branch[], scale: (at: number) => number): EasyHTMLElement[] {
  return branches.flatMap(({ events }) => events
    .filter(({ type }) => MILESTONE.test(type))
    .map(({ pos, xsection, label }) => element().content(label).cls('label')
      .styles({ right: UNIT_X * xsection + 8 + 'px', top: scale(pos) + 'px' }))
  )
}

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}
