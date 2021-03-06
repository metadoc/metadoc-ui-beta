import Signup from './Signup.js'

const Beta = new JET.Interface({
  selector: 'body.metadoc',
  namespace: 'beta',

  references: {
    signup: 'section.signup',
    copyright: 'footer .copyright .year'
  },

  states: {
    idle () {
      this.renderHTML(this.refs.signup, [
        Signup.bind(['div', { class: 'width constraint' }])
      ])

      this.renderHTML(this.refs.copyright, [new Date().getFullYear()])
    }
  }
})

JET.ready(() => Beta.initialize())
