import { createRoot, type Root } from 'react-dom/client'
import { ChatWidget, type ChatWidgetProps } from './components/ChatWidget'
import styles from './index.css?inline'

class NexChatElement extends HTMLElement {
  private root: Root | null = null
  private shadow: ShadowRoot

  static get observedAttributes() {
    return ['api-url', 'token', 'bot-name', 'welcome-message', 'position', 'theme']
  }

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const styleEl = document.createElement('style')
    styleEl.textContent = styles
    this.shadow.appendChild(styleEl)

    const mountPoint = document.createElement('div')
    this.shadow.appendChild(mountPoint)

    this.root = createRoot(mountPoint)
    this.render()
  }

  attributeChangedCallback() {
    if (this.root) {
      this.render()
    }
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
  }

  private render() {
    if (!this.root) return

    const props: ChatWidgetProps = {
      apiUrl: this.getAttribute('api-url') || undefined,
      token: this.getAttribute('token') || undefined,
      botName: this.getAttribute('bot-name') || undefined,
      welcomeMessage: this.getAttribute('welcome-message') || undefined,
      position: (this.getAttribute('position') as 'bottom-right' | 'bottom-left') || undefined,
      theme: (this.getAttribute('theme') as 'dark' | 'light') || undefined,
    }

    this.root.render(<ChatWidget {...props} />)
  }
}

if (!customElements.get('nex-chat')) {
  customElements.define('nex-chat', NexChatElement)
}

export default NexChatElement
