import EasyHTMLElement, { article, div, element, elementSVG, section, span } from "utils/easy-htmlelement";

import './scss/2/2.scss'
import profile from './profile.json'
import { RegExpWGroups } from "types";

const { highlights, milestones: commits } = profile

const parser = /^(?<year>\d{4}) (?<pipes>[☆★│├┐┘╵]+)\s*(?<what>.*?)\s*$/v

type B = {
  col: number, // 0 is main
  events: Array<{
    at: number, // position in list,
    type: string, // TODO: better typing?
    what: string,
  }>,
}

let branches: B[] = [{ col: 0, events: [] }]
let ongoing: B[] = [branches[0]]

// TODO: I don't like mutating arrays
commits.map(c => (parser.exec(c) as RegExpWGroups<'pipes' | 'what'>).groups)
  .forEach(({ year, pipes, what }, at) => {
    [ ...pipes.matchAll(/[^│├]/g)! ].forEach(({ 0: type, index: c }) => {
      if (type === '┐') { // new
        const branch = { col: c!, events: [{ at, type, what: '' }] }
        branches.push(branch)
        ongoing.push(branch)
        return
      }

      const branch = ongoing.find(({ col }) => col === c)!
      branch.events.push({ at, type, what })
      if ([ '┘', '╵' ].includes(type)) { // merge or end
        ongoing.splice(ongoing.indexOf(branch), 1)
      }
    })
  })

const git = element().at('git')

element(document.body).content(
  element('main').content(
    git,
    element().at('highlights').content(
      //element('h1').content('Page Header!'),
      //element('h2').content('Career Highlights'),
      section('highlights').content(
        ...highlights.map(({ content, dates, numbers, headline }) => article('highlight').content(
          element('h3').content(headline).at('headline'),
          span(dates).at('dates'),
          element('p').content(content).at('content'),
          div(...numbers
            .map( num => (/^(?<pre>.*)[*](?<n>.*)[*](?<post>.*)$/.exec(num) as RegExpWGroups<'pre' | 'n' | 'post'>).groups)
            .map(({ pre, n, post }) => div(pre, element('strong').content(n), div(post)).cls('stat'))
          ).at('numbers'),
        ))
      ),
    ),
  ),
  element('footer').cls('inverse').content(
    element('h1').content('Footer')
  )
)

function zip<A, B>(a: A[], b: B[]): Array<[A, B]> {
  if (a.length !== b.length) throw new Error(`Arrays aren't of the same length`)
  return a.map((aa, i) => [aa, b[i]])
}

document.fonts.ready.then(function() {
  const [{ height, top }, ...highlights] = ([document.querySelector('section#highlights'), ...document.querySelectorAll('[grid-area=dates]')] as HTMLElement[])
    // TODO: self.top + parent.top - parent.parent.top?!
    .map(({ offsetHeight: height, offsetTop: top, parentElement }, i) => ({ top: i ? top + parentElement!.offsetTop - parentElement!.parentElement!.offsetTop: top, height }))

  const pivots = commits.map((c, i) => [c, i] as const).filter(( [ c ] ) => c.includes('★')).map(([,i]) => i)
  // TODO: rename `asdf` and `asdf2`
  const asdf = zip([0, ...pivots, commits.length], [ height, ...highlights.toReversed().map(({ top, height }) => top + height / 2), 0 ])
  const asdf2 = Object.freeze( zip(asdf.slice(0, -1), asdf.slice(1)) )

  // finds the y-position of the item at line `at`
  // This scale is piecewise linear
  function scale(at: number): number {
    const [[ x0, y0 ], [ x1, y1 ]] = asdf2.findLast(([[a]]) => at >= a)!
    return (at - x0) * ( (y1 - y0) / (x1 - x0) ) + y0
  }

  const unitX = 20;
  function draw({ col, events}: B): EasyHTMLElement {
    const [ first, last ] = [events.at(0)!, events.at(-1)!]
    const colour = Math.floor(Math.random() * (1 << 6) + (1 << 7))
    return elementSVG('g').attrs({ transform: `translate(${-col * unitX})` }).content(
      elementSVG('path').attrs({ fill: 'none', stroke: `rgb(${colour}, ${colour}, ${colour})`, 'stroke-width': '5px', d: `M0,${scale(first.at)}`
        + ( first.type === '┐' ? `m${unitX},0 h${-(unitX - 10)} a10,10 0 0,1 ${-10}, -10` : 'v10' )
        + `V${scale(last.at) + 10}` + ( last.type === '┘' ? `a10,10 0 0,1 ${10},-10 h${(unitX - 10)} ` : 'v-10' )
      }),
      ...events.filter(e => /[☆★]/.test(e.type)).map(({ at, type }) => elementSVG('circle')
        .attrs({ r: 7, cx: 0, cy: scale(at), fill: 'white', 'stroke-width': '5', stroke: type === '★' ? 'hsl(185 52% 33% / 1)' : `rgb(${colour}, ${colour}, ${colour})` })),
      ...events.map(({ at, what }) => elementSVG('text')
        .styles({ 'font-size': 'smaller' })
        .attrs({ x: -unitX / 2, y: scale(at), 'text-anchor': 'end', 'dominant-baseline': 'middle' })
        .content(what)),
    )
  }

  git.content(elementSVG()
    .attrs({ height, width: '100%',  viewBox: `0 0 10 ${height}`, preserveAspectRatio: 'xMaxYMin meet' })
    .content(elementSVG('g').attrs({ 'mask': 'url(#git-clip)' }).content(...branches.map(draw).toReversed())))
})
