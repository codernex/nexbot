/// <reference types="vite/client" />

declare module '*.css?inline' {
  const content: string
  export default content
}

declare namespace JSX {
  interface IntrinsicElements {
    'nex-chat': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'api-url'?: string
      token?: string
      'bot-name'?: string
      'welcome-message'?: string
      position?: string
      theme?: string
    }
  }
}
