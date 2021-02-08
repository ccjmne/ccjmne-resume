import profile from './profile.json';

import { name, homepage } from '../package.json';

document.body.append(function header(): HTMLElement {
  const h = document.createElement('header');
  h.innerHTML = `<h1>Eric NICOLAS</h1>`;
  return h;
}());

document.body.append(function aside(): HTMLElement {
  const a = document.createElement('aside');
  a.innerHTML = `
    <span>mail: <a href="mailto:ccjmne@gmail.com">ccjmne@gmail.com</a></span>
    <small class="watermark">
      Generated on ${new Date().toISOString().split(/T/)[0]}<br />
      by <a href="${homepage}">${name}</a>
    </small>
  `;
  return a;
}());

function experience(e: Experience): HTMLElement {
  const d = document.createElement('div');
  d.style.display = 'flex';
  d.style.flexDirection = 'column';
  d.innerHTML = `
    <h3>${e.title} <span style="opacity: .7">at</span> ${e.company}</h3>
    <div style="padding: 0 25px; display: flex; justify-content: space-between;">
      <span>${e.dates} (${e.duration})</span>
      <span style="text-align: right;">${e.location}</span>
    </div>
    ${e.abstract ? `<p>${e.abstract}</p>` : ''}
  `;
  return d;
}

document.body.append(function main(): HTMLElement {
  const m = document.createElement('main');
  m.innerHTML = `
    <h2>Experience</h2>
    ${profile.experience.map(e => experience(e).outerHTML).join('')}
  `;
  return m;
}());
