import { article, div, element, lightest, section, span } from "utils/easy-htmlelement"

import './scss/2/2.scss'
import profile from './profile.json'
import qrcode from 'qrcode'
import { MatchArrayWGroups } from "types"
import { render } from "utils/timeline"
import { rhombus } from "utils/svg-elements"

const { highlights, timeline } = profile

const graph = element()
const qcode = element('img')

element(document.body).content(
  element('main').content(
    graph.at('graph'),
    element().at('highlights').content(
      //element('h1').content('Page Header!'),
      //element('h2').content('Career Highlights'),
      section('highlights').content(
        ...highlights.map(({ content, dates, numbers, headline }) => article('highlight').content(
          element('h3').content(headline).at('headline'),
          span(dates).at('dates'),
          element('p').content(content).at('content'),
          div(
            // TODO: Something nicer, with the tail near the *top*
            // lightest(hr().styles({ transform: 'rotate(180deg)' })),
            ...numbers
              .map(num => (/^(?<pre>.*)[*](?<n>.*)[*](?<post>.*)$/s.exec(num) as MatchArrayWGroups<'pre' | 'n' | 'post'>).groups)
              .map(({ pre, n, post }) => span(pre, element('strong').content(n), post).cls('stat'))
              .flatMap(n => [lightest(rhombus(6)), n]).slice(1)
          ).at('numbers'),
        ))
      ),
    ),
  ),
  element('footer').cls('inverse').content(
    span('find latest at:').at('qrcode-hint'),
    qcode.at('qrcode'),
  ),
)

document.fonts.ready.then(async function() {
  // TODO: prefix with https://, move/rename project to github.com/ccjmne/resume (drop ccjmne- prefix in project name)
  const data = await qrcode.toString('ccjmne.github.io/ccjmne-resume', { type: 'svg', errorCorrectionLevel: 'L', version: 2, margin: 0 })
  qcode.attrs({ height: 'auto', src: `data:image/svg+xml;utf8,${(data.replace(/#f+/, 'transparent').replace(/#0+/, encodeURIComponent('#eee')))}` })

document.fonts.ready.then(async function () {
  const { top, height } = document.querySelector('[grid-area=highlights]')!.getBoundingClientRect()
  const highlights = [...document.querySelectorAll('[grid-area=headline]')]
    .map(e => e.getBoundingClientRect())
    .map(({ top: t, height: h }) => t - top + h / 2)

  graph.content(render(timeline, highlights, height))
})
