import { article, div, element, section, span } from "utils/easy-htmlelement";

import './scss/2/2.scss'
import profile from './profile.json'
import { RegExpWGroups } from "types";

const { highlights } = profile

element(document.body).content(
  element('main').content(
    element('h1').content('Page Header!'),
    element('h2').content('Career Highlights'),
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
  element('footer').cls('inverse').content(
    element('h1').content('Footer')
  )
)
