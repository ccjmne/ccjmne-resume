import { css, html, LitElement } from 'lit'
import { repeat } from 'lit/directives/repeat.js'
import { customElement } from 'lit/decorators.js'
import './components/Resume.js'

@customElement('ccjmne-resume-app')
export class App extends LitElement {
  static styles = css`
    h1 {
      text-align: center;
      font-size: 3.2em;
    }
    .links {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      padding-bottom: 100px;
    }
    .resume {
      text-align: center;
    }`

  render() {
    return html`
      <main>
        <h1>ccjmne-resume</h1>
        <div class="links">
          ${repeat(resumes, (resume) => resume.version,
            ({version, pdf, thumbnail }) => html`<ccjmne-resume version="${version}" pdf="${pdf}" thumbnail="${thumbnail}"></ccjmne-resume>`
          )}
        </div>
      </main>`
  }
}

const thumbnails = import.meta.glob('/assets/*.png', {
  eager: true,
  import: 'default',
  query: { url: true, h: 250 },
});

const resumes = Object.values(
  import.meta.glob('/assets/*.ts', { eager: true })
).map(({ version, date }) => ({
  version,
  date,
  pdf: import.meta.resolve(`/assets/${version}.pdf`),
  thumbnail: thumbnails[`/assets/${version}.png`],
}))
