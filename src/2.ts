import EasyHTMLElement, { article, div, element, elementSVG, section, span } from "utils/easy-htmlelement"

import './scss/2/2.scss'
import profile from './profile.json'
import { RegExpWGroups } from "types"
import { draw } from "utils/milestones-graph"

const { highlights, milestones } = profile

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
            .map(num => (/^(?<pre>.*)[*](?<n>.*)[*](?<post>.*)$/.exec(num) as RegExpWGroups<'pre' | 'n' | 'post'>).groups)
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

document.fonts.ready.then(function() {
  const [{ h: height }, ...highlights] = ([document.querySelector('section#highlights'), ...document.querySelectorAll('[grid-area=dates]')] as HTMLElement[])
    // TODO: self.top + parent.top - parent.parent.top?!
    .map(({ offsetHeight: h, offsetTop: y, parentElement: p }, i) => ({ y: i ? y + p!.offsetTop - p!.parentElement!.offsetTop : y, h }))

  git.content(elementSVG()
    .attrs({ height, width: '100%', viewBox: `0 0 10 ${height}`, preserveAspectRatio: 'xMaxYMin meet' })
    .content(elementSVG('g').attrs({ 'mask': 'url(#git-clip)' }).content(
      ...draw(milestones, [height, ...highlights.toReversed().map(({ y, h }) => y + h / 2), 0]).toReversed()
    )))
})
