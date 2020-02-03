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
        REGISTER: 'loading'
      }
    },

    loading: {
      on () {
        this.emit('render', true)
      },

      transitions: {
        TRYAGAIN: 'idle',
        DUPLICATE: 'duplicate',
        REGISTERED: 'registered'
      }
    },

    duplicate: {
      transitions: {
        TRYAGAIN: 'idle'
      },

      on (previous, email) {
        this.replaceHTML([
          ['div', { class: 'duplicate result' }, [
            ['p', { class: 'text-bold' }, [
              `${email} is already signed up for updates!`
            ]],

            ['footer', [
              ['a', { href: '#' }, {
                click: evt => {
                  evt.preventDefault()
                  this.transition('TRYAGAIN')
                }
              }, [
                'Sign up with another email address'
              ]]
            ]]
          ]]
        ])
      }
    },

    registered: {
      transitions: {
        TRYAGAIN: 'idle'
      },

      on (previous, email) {
        this.replaceHTML([
          ['div', { class: 'registered result' }, [
            // ['button', { class: 'bare close icon' }, {
            //   click: evt => {
            //     evt.preventDefault()
            //     this.self.classList.add('hidden')
            //   }
            // }, [
            //   ['author-icon', { src: 'assets/icons/close.svg' }]
            // ]],

            ['p', { class: 'text-bold' }, [
              'Thank you for registering! You will receive updates at:'
            ]],

            ['div', { class: 'email' }, [email]],

            ['footer', [
              'Wrong email? ',
              ['a', {
                class: 'reset',
                href: '#'
              }, {
                click: evt => {
                  evt.preventDefault()
                  this.transition('TRYAGAIN')
                }
              }, ['Try Again']]
            ]]
          ]]
        ])
      }
    }
  },

  on: {
    email: {
      submit (email) {
//         if (!window.confirm(`
// You will be signed up for Metadoc updates at the following email address:
//
//           ${email}
//
// Is this correct?
// `)) {
//           return
//         }

        this.transition('REGISTER')

        NGN.NET.post({
          url: 'https://us-central1-metadoc-4ebc3.cloudfunctions.net/api/user',
          json: { email }
        }, req => {
          switch (req.status) {
            case 400:
            case 403: return this.transition('TRYAGAIN', req.responseText)
            case 201:
              API.register(email, NGN.DATA.util.GUID(), (err, user) => {
                if (err) {
                  switch (err.code) {
                    case 'auth/email-already-in-use':
                      this.transition('DUPLICATE', email)
                      break
                  }

                  return console.log(err)
                }

                this.transition('REGISTERED', email)
              })
          }
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
