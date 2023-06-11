export default function templateElementLoader(content: string | Buffer): string {
  return `
    const template = document.createElement('template');
    template.innerHTML = ${JSON.stringify(content)};
    export default template;
  `
}
