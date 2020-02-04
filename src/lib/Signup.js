import API from './client.js'

const Signup = new JET.Interface({
  namespace: 'section.signup .width.constraint',

  properties: {
    submitDisabled: false
  },

  references: {
    emailControl: 'author-control.email'
  },

  states: {
    idle: {
      on (previous, error) {
        this.emit('render', false, error)
      },

      transitions: {
        LOADING: 'loading'
      }
    },

    loading: {
      on () {
        this.emit('render', true)
      },

      transitions: {
        TRYAGAIN: 'idle',
        SUCCESS: 'success'
      }
    },

    success: {
      transitions: {
        TRYAGAIN: 'idle'
      },

      on (previous, email) {
        this.replaceHTML([
          ['div', { class: 'registered result' }, [
            ['p', { class: 'text-bold' }, [
              'Thank you for registering! You will receive updates at:'
            ]],

            ['div', { class: 'email' }, [email]],

            ['footer', [
              ['a', {
                class: 'reset',
                href: '#'
              }, {
                click: evt => {
                  evt.preventDefault()
                  this.transition('TRYAGAIN')
                }
              }, ['Register another email address']]
            ]]
          ]]
        ])
      }
    }
  },

  on: {
    email: {
      submit (email) {
        this.transition('LOADING')

        API.register(email, err => {
          if (err) {
            return this.transition('TRYAGAIN', err)
          }

          this.transition('SUCCESS', email)
        })
      }
    },

    property: {
      submitDisabled: {
        changed (change) {
          this.emit('render')
        }
      }
    },

    render (loading = false, error) {
      let { submitDisabled } = this.properties

      this.renderHTML([
        ['p', { class: 'text-bold' }, [
          'Sign up to be the first to hear about updates!'
        ]],

        ['author-control', {
          class: [{
            disabled: loading,
            error: !!error
          }, 'email']
        }, [
          ['div', { class: 'input' }, [
            ['div', { class: 'wrapper' }, [
              ['author-icon', { src: 'assets/icons/mail.svg' }],
              ['input', {
                type: 'text',
                placeholder: 'Enter your email address'
              }, {
                keydown: evt => {
                  if (evt.key !== 'Enter') {
                    return
                  }

                  this.emit('email.submit', this.refs.emailControl.value)
                },

                input: evt => this.properties.submitDisabled = evt.target.value === '' || !evt.target.value
              }]
            ]],

            !!error && ['div', { class: 'error' }, [
              ['author-icon', { src: 'assets/icons/alert.svg' }],
              ['span', { class: 'message' }, [error]]
            ]]
          ]],

          ['button', {
            disabled: submitDisabled,
            class: [{ loading }, 'submit']
          }, {
            click: evt => {
              evt.preventDefault()
              this.emit('email.submit', this.refs.emailControl.value)
            }
          }, [
            ['span', { class: 'label' }, ['Stay Informed']],
            ['md-loader']
          ]]
        ]]
      ])
    }
  }
})

export default Signup
