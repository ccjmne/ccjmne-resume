import type { MatcherWGroups } from 'types'
import type EasyHTMLElement from './easy-htmlelement'
import { element, elementSVG } from './easy-htmlelement'
import { rhombusPath } from './svg-elements'

const UNIT_X   = 18
const TURNSIZE = 10
const GAPSIZE  = 6
const PADDING  = 25 // TODO: Obtain from SCSS

// TODO: Support the following (allowing whitespace characters in the pipes):
//   ★
// ☆ │
// │☆│
// ││★
const MILESTONE_PARSER = /^(?<pipes>[★☆│├┼┘┐╷╵]+)\s*(?<label>.*?)\s*$/s as MatcherWGroups<'year' | 'pipes' | 'label'>
const [HIGHLIGHT, MILESTONE, NEW, MERGE, SPAWN, END, CROSS] = [/★/, /☆/, /┼*┘/, /┼*┐/, /╵/, /╷/, /^┼$/]

export function render(timeline: string[], pivots: number[], height: number): [graph: EasyHTMLElement, labels: Array<EasyHTMLElement>] {
  const domain   = [0, 1, ...timeline.map((s, i) => [s, i] as const).filter(([s]) => HIGHLIGHT.test(s)).map(([, i]) => i), timeline.length - 2, timeline.length - 1]
  const range    = [0, PADDING + GAPSIZE * 3 / 2, ...pivots, height - (PADDING + GAPSIZE * 3 / 2), height]
  const map      = zip(domain, range)
  const segments = zip(map.slice(0, -1), map.slice(1))

  function scale(at: number): number { // Piecewise linear scale
    const [[x0, y0], [x1, y1]] = segments.find(([, [a]]) => at <= a)!
    return (at - x0) * (y1 - y0) / (x1 - x0) + y0
  }

  return [
    elementSVG()
      .attrs({ height, width: '100%', viewBox: `0 0 20 ${height}`, preserveAspectRatio: 'xMaxYMin meet' })
      .content(...graph(compute(timeline), scale)),
    labels(compute(timeline), scale),
  ]
}

interface Event { pos: number, type: string, label: string, xsection: number }
interface Branch {
  depth:  number
  events: Event[]
}

function compute(timeline: string[]): Branch[] {
  const branches: Branch[] = [{ depth: 0, events: [] }]
  const ongoing:  Branch[] = [branches[0]]

  timeline.toReversed()
    .map(entry => entry.replace(/\S+(?=★)|(?<=☆)\S+/, ({ length }) => '┼'.repeat(length))) // "Cross" for the label pin arm
    .map(c => MILESTONE_PARSER.exec(c)!.groups)
    .forEach(({ pipes, label }, pos, { length }) => {
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
  function handleEvent({ type, y, pos }: Event & { y: number, λ: boolean, Λ: boolean }): string {
    switch (true) {
      case NEW.test(type):
        return `m${UNIT_X * type.length},0 h${-(UNIT_X * type.length - TURNSIZE)} a${TURNSIZE},${TURNSIZE} 0 0,1 ${-TURNSIZE},${-TURNSIZE}`
      case MERGE.test(type):
        return `V${y + 10} a${TURNSIZE},${TURNSIZE} 0 0,1 ${+TURNSIZE},${-TURNSIZE} h${+(UNIT_X * type.length - TURNSIZE)}`
      case HIGHLIGHT.test(type):
        return `V${y + 10} m0,-20`
      case MILESTONE.test(type):
      case CROSS.test(type):
        return `V${y + GAPSIZE / 2} m0,${-GAPSIZE}`
      case END.test(type):
        return pos ? '' : `V${y}`
      case SPAWN.test(type):
      default:
        return ''
    }
  }

  // λ is MILESTONE, Λ is HIGHLIGHT
  function preprocess({ events, depth }: Branch): { depth: number, x: number, events: (Event & { y: number, λ: boolean, Λ: boolean })[] } {
    return ({ depth, x: -UNIT_X * depth, events: events.map(e => ({ ...e, y: scale(e.pos), λ: MILESTONE.test(e.type), Λ: HIGHLIGHT.test(e.type) })) })
  }

  const [[, Ωy], Ωx] = branches // Spawn point's branch (x) and position (y)
    .map(({ events }, i) => [events.map(({ type, pos }) => [SPAWN.test(type), pos]).find(([spawn]) => spawn), i])
    .find(([spawn]) => spawn) as [[any, number], number]

  return [
    elementSVG('defs').content(
      elementSVG('linearGradient').attrs({ id: 'highlight-gradient' })
        .content(...[0, .3, 1].map(offset => elementSVG('stop').attrs({ offset }))),
      elementSVG('linearGradient').cls(`colour-${Ωx}`)
        .attrs({ gradientUnits: 'userSpaceOnUse', id: 'branch-spawn', x1: 0, x2: 0, y1: scale(Ωy - 1), y2: scale(Ωy) })
        .content(...[.25, 1].map(offset => elementSVG('stop').attrs({ offset }))),
    ),
  ].concat(branches.map(preprocess).flatMap(({ depth, events, x }, i) => [
    // line
    elementSVG('path').cls(`colour-${i === Ωx ? 'spawn' : i}`).attrs({ d: `M${x},${events[0].y}` + events.map(handleEvent).join('') }),

    // milestones
    ...events.filter(({ λ }) => λ).map(({ y, xsection }) => elementSVG('g').cls(`colour-${i}`).content(
      elementSVG('path').attrs({ d: rhombusPath({ x, y, diag: 12 }) }),
      ...depth === xsection - 1 ? [] : [elementSVG('path').cls('thin').attrs({ d: `M${x - (UNIT_X / 2 - 1)},${y} H${-UNIT_X * xsection + UNIT_X / 2}` })],
    )),

    // highlights
    ...events.filter(({ Λ }) => Λ).map(({ y }) => elementSVG('path').cls('colour-accent', 'fill').attrs({
      d:  rhombusPath({ x, y, diag: GAPSIZE * 3, clockwise: true })
        + rhombusPath({ x, y, diag: GAPSIZE,     clockwise: false })
        + `M${x + (UNIT_X / 2 - 1)},${y - 1} H20 v2 H${x + (UNIT_X / 2 - 1)} z`,
    })),

    // highlights contouring
    ...events.filter(({ Λ }) => Λ).map(({ y }) => elementSVG('path').cls(`colour-${i}`, 'fill')
      .attrs({ d: `M${x - 2},${y - 10} v2 l2,-2 l2,2 v-2 z M${x - 2},${y + 10} v-2 l2,2 l2,-2 v2 z` })),
  ]))
}

function labels(branches: Branch[], scale: (at: number) => number): EasyHTMLElement[] {
  return branches.flatMap(({ events }) => events
    .filter(({ type }) => MILESTONE.test(type))
    .map(({ pos, xsection, label }) => element().content(label).cls('label')
      .styles({ right: UNIT_X * xsection + 8 + 'px', top: scale(pos) + 'px' })),
  )
}

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}
