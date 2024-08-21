import { element } from "utils/easy-htmlelement";

element(document.body).content(element('h1').content('Page Two!').styles({ color: 'white' }))
