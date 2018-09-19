export default class Router {
  unauthorized = ['account-balance', 'my-bank-card']
  certification = ['add-contact', 'bind-bank-card', 'zhima-credit', 'identity-verification', 'operator-credit']
  mine = ['mine']
  static mark () {
    console.log(window.app)
    window.app.$store.commit('saveOrigin', window.app._route)
  }

  static push (params) {
    this.mark()
    let account = window.app.$store.state.account
    if (typeof params === 'string') {
      params = {
        name: params
      }
    }
    if (account.certification.bank && this.unauthorized.includes(params.name)) {
      params = {
        name: 'credit'
      }
    }
    window.app.$router.push(params)
  }

  static back (params) {
    let origin = null
    if (!params) {
      origin = window.app.$store.state.origin
      params = {...origin}
    }
    if (this.unauthorized.includes(params.name)) {
      params = {
        name: 'credit'
      }
    } else if (this.mine.includes(params.name)) {
      params = {
        name: 'mine'
      }
    }
    window.app.$router.back()
  }
}
