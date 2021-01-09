class MDLoaderElement extends AuthorBaseElement(HTMLElement) {
  constructor () {
    super(`
      <template>
        <style>
          :host {
            display: inline-flex;
          }

          :host *,
          :host *:before,
          :host *:after {
            box-sizing: border-box;
          }
        </style>

        <div id="loader">
          <slot></slot>
        </div>
      </template>
    `)

    this.UTIL.registerListeners(this, {
      connected: () => {
        let ring = document.createElement('div')
        ring.classList.add('ring')

        for (var i = 0; i < 12; i++) {
          ring.appendChild(document.createElement('div'))
        }

        this.appendChild(ring)
      }
    })
  }
}

customElements.define('md-loader', MDLoaderElement)
