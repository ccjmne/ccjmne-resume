import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('ccjmne-resume')
export class Resume extends LitElement {
  @property() version = ''
  @property() pdf = ''
  @property() thumbnail = ''

  render() {
    return html`
      <a href="${this.pdf}" target="_blank">
        <figure class="resume">
            <img src="${this.thumbnail}" alt="Thumbnail for ${this.version}" />
          <figcaption>Version ${this.version}</figcaption>
        </figure>
      </a>
    `
  }

  static styles = css`
    a {
      text-decoration: none;
      color: inherit;
      display: inline-block;

      &:hover {
        font-weight: bold;
        transform: translateY(-5px);
      }

      transition: transform .1s ease-out;
    }

    figure {
      margin: 0;
    }

    figcaption {
      text-align: center;
      transition: transform .1s ease-out;
      :host a:hover & {
        transform: translateY(10px);
      }
    }

    img {
      border-radius: 5px;
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.12),
        0 1px 2px rgba(0, 0, 0, 0.24);
      transition:
        all 0.1s ease-out;

      :host :hover & {
        box-shadow:
          0 14px 28px rgba(0, 0, 0, 0.25),
          0 10px 10px rgba(0, 0, 0, 0.22);
      }
    }`
}
