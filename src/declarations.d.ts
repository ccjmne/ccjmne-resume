declare module '*.svg?template' {
  const template: HTMLTemplateElement
  export default template
}

declare module '*.svg' {
  const dataURI: string
  export default dataURI
}

declare module '*.jpg?dataURI' {
  const dataURI: string
  export default dataURI
}
