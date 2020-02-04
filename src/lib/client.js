// import NGN from '../../../../../Software/Libraries/NGN/ngn/test/.node/index.js'

if (!NGN.INFO) {
  NGN.INFO = console.log
}

class APIClient {
  #user = null
  #referrer = null
  #db = null
  #uid = null
  #root = 'https://us-central1-metadoc-4ebc3.cloudfunctions.net/api'

  constructor () {
    this.fireAuthEvent = true

    // Initialize Firebase
    firebase.initializeApp({
      apiKey: "AIzaSyDq2ExQ1ERY16DfS2HIeLOsUPYOrtkRdKY",
      authDomain: "metadoc-4ebc3.firebaseapp.com",
      databaseURL: "https://metadoc-4ebc3.firebaseio.com",
      projectId: "metadoc-4ebc3",
      storageBucket: "metadoc-4ebc3.appspot.com",
      messagingSenderId: "99918371964",
      appId: "1:99918371964:web:5a08c71bb0e7a50634fdf9",
      measurementId: "G-W4YWGNRVCV"
    })

    firebase.analytics()

    firebase.auth().onAuthStateChanged(user => {
      NGN.INFO('AUTH STATE CHANGED')

      if (user) {
        NGN.INFO('AUTHENTICATED....');
        this.#user = user

        if (this.fireAuthEvent) {
          NGN.BUS.emit('user.authenticated', user)
        }

      } else if (this.authenticated) {
        this.#user = null
        NGN.BUS.emit('user.logout')
      }

      NGN.BUS.emit('authstate.changed')
    })
  }

  get user () {
    if (this.#user === null) {
      this.#user = firebase.auth().currentUser || null
    }

    return this.#user
  }

  get uid () {
    if (this.#user) {
      return this.#user.uid
    }

    return this.#uid
  }

  get authenticated () {
    return this.#user !== null
  }

  register (email, callback) {
    const EMAIL_PATTERN = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i

    if (!EMAIL_PATTERN.test(email)) {
      return callback('Invalid email address format')
    }

    if (typeof callback !== 'function') {
      callback = e => { throw new e }
    }

    NGN.BUS.emit('user.verifying')

    NGN.NET.post({
      url: `${this.#root}/user/register`,
      json: { email }
    }, req => {
      switch (req.status) {
        case 201: return callback()
        case 500: return alert('An error occurred. Please refresh the page and try again.')
        default: return callback(req.responseText)
      }
    })
  }
}

const API = new APIClient()

export { API as default }
