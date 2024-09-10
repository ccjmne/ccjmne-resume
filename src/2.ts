import EasyHTMLElement, { article, div, element, elementSVG, section, span } from "utils/easy-htmlelement"

import './scss/2/2.scss'
import profile from './profile.json'
import qrcode from 'qrcode'
import { MatchArrayWGroups } from "types"
import { render } from "utils/timeline"

const { highlights, timeline } = profile

const git = element().at('git')
const qcode = element('img').attrs({ height: '100px' })

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
            .map(num => (/^(?<pre>.*)[*](?<n>.*)[*](?<post>.*)$/.exec(num) as MatchArrayWGroups<'pre' | 'n' | 'post'>).groups)
            .map(({ pre, n, post }) => div(pre, element('strong').content(n), div(post)).cls('stat'))
          ).at('numbers'),
        ))
      ),
    ),
  ),
  element('footer').cls('inverse').content(
    //element('h1').at('title').content('Footer'),
    span('find latest at:').at('qrcode-hint'),
    qcode.at('qrcode'),
  )
)

document.fonts.ready.then(async function() {
  // TODO: prefix with https://, move/rename project to github.com/ccjmne/resume (drop ccjmne- prefix in project name)
  const data = await qrcode.toString('ccjmne.github.io/ccjmne-resume', { type: 'svg', errorCorrectionLevel: 'L', version: 2, margin: 0 })
  qcode.attrs({ height: 'auto', src: `data:image/svg+xml;utf8,${(data.replace(/#f+/, 'transparent').replace(/#0+/, encodeURIComponent('#eee')))}` })

  const [{ h: height }, ...highlights] = ([document.querySelector('section#highlights'), ...document.querySelectorAll('[grid-area=dates]')] as HTMLElement[])
    // TODO: self.top + parent.top - parent.parent.top?!
    .map(({ offsetHeight: h, offsetTop: y, parentElement: p }, i) => ({ y: i ? y + p!.offsetTop - p!.parentElement!.offsetTop : y, h }))

  git.content(elementSVG()
    .attrs({ height, width: '100%', viewBox: `0 0 10 ${height}`, preserveAspectRatio: 'xMaxYMin meet' })
    .content(elementSVG('g').attrs({ 'mask': 'url(#git-clip)' }).content(
      ...render(timeline, [0, ...highlights.map(({ y, h }) => y + h / 2), height])
    )))
})
