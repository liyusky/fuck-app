module.exports = {
  content: '忘记密码',
  router: true,
  vuex: {
    mutations: false,
    state: false
  },
  class: {
    'Account': false,
    'BM': false,
    'Btn': false,
    'Chat': false,
    'Check': true,
    'Citys': false,
    'Days': false,
    'Error': true,
    'Hasten': false,
    'Http': true,
    'Mock': false,
    'Replace': false,
    'Router': true,
    'Status': false,
    'Storage': false,
    'Time': false,
    'Type': false,
    'Url': false
  },
  components: {
    'billboard': false,
    'board': false,
    'button': `{
        default: [{
          type: 'primary',
          text: '提交'
        }]
      }`,
    'deadline': false,
    'detail-list': false,
    'image-bg': false,
    'inputs': false,
    'keyboard': false,
    'modal': false,
    'modals': false,
    'nav': false,
    'pay-password': false,
    'pull-refresh': false,
    'receipt': false,
    'tab': false,
    'tip': false,
    'title': `{
        contentText: '忘记密码'
      }`,
    'without': false,
    'work-card': false
  }
}
