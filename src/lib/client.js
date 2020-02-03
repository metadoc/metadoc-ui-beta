// import NGN from '../../../../../Software/Libraries/NGN/ngn/test/.node/index.js'

if (!NGN.INFO) {
  NGN.INFO = console.log
}

class APIClient {
  #user = null
  #referrer = null
  #db = null
  #uid = null

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

  register (email, password, callback) {
    if (typeof callback !== 'function') {
      callback = e => { throw new e }
    }

    NGN.BUS.emit('user.verifying')
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.#user = firebase.auth().currentUser
        callback(null, this.user)
      })
      .catch(err => {
        console.error(err)
        callback(err)
      })
  }
}

const API = new APIClient()

export { API as default }
