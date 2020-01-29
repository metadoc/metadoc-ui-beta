import API from './client.js'

const Signup = new JET.Interface({
  namespace: 'section.signup .width.constraint',

  properties: {
    submitDisabled: false
  },

  states: {
    idle () {
      this.emit('render')
    }
  },

  on: {
    property: {
      submitDisabled: {
        changed (change) {
          this.emit('render', change.new)
        }
      }
    },

    render () {
      this.renderHTML([
        ['p', { class: 'text-bold' }, [
          'Sign up to be the first to hear about updates!'
        ]],

        ['author-control', [
          ['div', { class: 'input-wrapper' }, [
            ['author-icon', { src: 'assets/icons/mail.svg' }],
            ['input', {
              type: 'text',
              placeholder: 'Enter your email address'
            }, {
              input: evt => this.properties.submitDisabled = evt.target.value === '' || !evt.target.value
            }]
          ]],

          ['button', {
            disabled: this.properties.submitDisabled,
            class: 'submit'
          }, {
            click: evt => {
              evt.preventDefault()

              console.log(API);
            }
          }, ['Stay Informed']]
        ]]
      ])
    }
  }
})

export default Signup
