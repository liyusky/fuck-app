<template>
  <!-- s  我要借款-->
  <section class="borrow padding-top-126">
    <TitleComponent :title="title"></TitleComponent>
    <div class="borrow-tip">
      <div class="tip-icon">
        <i class="iconfont icon-dunpai"></i>
      </div>
      <p class="tip-text" id="tip">警惕"扫码退款"转账到安全账户"等骗术",请保护好你的资金安全</p>
    </div>
    <div class="borrow-form-top">
      <div class="form-item">
        <div class="item-left">
          <i class="iconfont icon-yuandian"></i>
          <span>借款金额</span>
        </div>
        <div class="itme-default">
          <input type="number" v-model="borrowAmount" placeholder="10的倍数" @keyup="limitBorrowAmount">
          <span>元</span>
        </div>
      </div>
      <div class="form-item">
        <div class="item-left">
          <i class="iconfont icon-yuandian"></i>
          <span>年华利率</span>
        </div>
        <div class="item-rate">
          <input type="number" placeholder="0~24" v-model="ratePercent" @keyup="limitRatePercent">
          <span>%</span>
          <input type="number" placeholder="利率金额" v-model="rateAmount">
          <span>￥</span>
        </div>
      </div>
      <div class="form-item">
        <div class="item-left">
          <i class="iconfont icon-yuandian"></i>
          <span>还款期限</span>
        </div>
        <div class="itme-deadline">
          <span class="deadline-date" @click="openDeadlineModal">{{borrowDate}}</span>
          <span>{{borrowDeadline}}</span>
          <span>天</span>
        </div>
      </div>
    </div>
    <div class="borrow-form-bottom">
      <div class="form-item">
        <div class="item-left">
          <i class="iconfont icon-yuandian"></i>
          <span>借款用途</span>
        </div>
        <div class="itme-default" @click="gotoPage('purpose')">
          <span class="default-value">{{borrowPurpose}}</span>
          <i class="iconfont icon-arrow-right"></i>
        </div>
      </div>
      <div class="form-item">
        <div class="item-left">
          <i class="iconfont icon-yuandian"></i>
          <span>发布对象</span>
        </div>
        <div class="itme-default" @click="gotoPage('publish-object')">
          <span class="default-value">{{borrowObject}}</span>
          <i class="iconfont icon-arrow-right"></i>
        </div>
      </div>
      <div class="form-item">
        <div class="item-left">
          <i class="iconfont icon-yuandian"></i>
          <span>借款发布期</span>
        </div>
        <div class="itme-default" @click="openPublishMadol">
          <span class="default-value">{{borrowPublish}}</span>
          <i class="iconfont icon-arrow-right"></i>
        </div>
      </div>
      <div class="form-refund">
        <span>实际到账金额</span>
        <span class="refund-actual">{{borrowAmount ? borrowAmount : 0.00}}元</span>
        <span>到期还款总额</span>
        <span class="refund-total">{{paymentTotl ? paymentTotl : 0.00}}元</span>
      </div>
    </div>
    <div class="borrow-potocol">
      <TipComponent :tip="tip" @TOGGLE_SELECTED_EVENT="getTipSelected"></TipComponent>
    </div>
    <div class="borrow-submit">
      <ButtonComponent :button="button" @SUBMIT_EVENT="publishSubmit"></ButtonComponent>
    </div>
    <DeadlineComponent v-show="deadLineShow" @SELECT_DATA_EVENT="getDeadline" @CANCEL_EVENT="closeModal"></DeadlineComponent>
    <PublishComponent v-show="purposeShow" @SELECT_PUBLISH_EVENT="getPublish" @CANCEL_PUBLISH_EVENT="closeModal"></PublishComponent>
  </section>
  <!-- e  我要借款-->
</template>

<script>
import PublishComponent from './publish/publish.vue'
// include dependence
import Check from '../../class/Check.class.js'
import Error from '../../class/Error.class.js'
import Http from '../../class/Http.class.js'
import Router from '../../class/Router.class.js'
import Storage from '../../class/Storage.class.js'
import ButtonComponent from '../../module/button/button.vue'
import DeadlineComponent from '../../module/deadline/deadline.vue'
import TipComponent from '../../module/tip/tip.vue'
import TitleComponent from '../../module/title/title.vue'
export default {
  name: 'BorrowComponent',
  data () {
    return {
      borrowDate: '',
      rateAmount: 0,
      ratePercent: '',
      borrowAmount: '',
      paymentTotl: '',
      borrowObject: '请选择',
      borrowPhoneStr: '',
      borrowImAccidStr: '',
      borrowDeadline: '7',
      borrowPublish: '3',
      borrowPurpose: '临时周转',
      otherCost: 0.0,
      purposeShow: false,
      deadLineShow: false,
      // start params
      'button': {
        default: [{
          type: 'primary',
          text: '发布借条'
        }]
      },
      'tip': {
        type: 'default',
        content: '已同意协议',
        protocol: '借条大师协议',
        icon: 'jindu',
        selected: 'true'
      },
      'title': {
        contentText: '我要借款'
      }
      // end params
    }
  },
  components: {
    // include components
    TitleComponent,
    ButtonComponent,
    TipComponent,
    DeadlineComponent,
    PublishComponent
  },
  mounted () {
    this.scroll()
    this.initDate(7)
    if (Storage.publishObject) this.formateData(Storage.publishObject)
    if (Storage.purpose) this.borrowPurpose = Storage.purpose
    if (Storage.wannaInfo) {
      console.log(Storage.wannaInfo)
      this.borrowAmount = Storage.wannaInfo.borrowAmount
      this.ratePercent = Storage.wannaInfo.ratePercent
      this.borrowDeadline = Storage.wannaInfo.borrowDeadline
      this.borrowPublish = Storage.wannaInfo.borrowPublish
    }
  },
  methods: {
    formateData (data) {
      if (data) {
        let borrowObjectName = []
        let borrowObjectImAccid = []
        data.forEach(ele => {
          borrowObjectName.push(ele.Name)
          borrowObjectImAccid.push(ele.imAccid)
        })
        this.borrowPhoneStr = borrowObjectName.toString()
        this.borrowImAccidStr = borrowObjectImAccid.toString()
        if (borrowObjectName.length > 1) {
          this.borrowObject = '好友'
        } else {
          this.borrowObject = this.borrowPhoneStr
        }
      }
    },
    scroll () {
      var tip = document.getElementById('tip')
      var left = tip.offsetLeft
      setInterval(() => {
        var offset = tip.offsetLeft
        var speed = 1
        tip.style.left = offset - speed + 'px'
        if (tip.offsetLeft <= (left - tip.offsetWidth)) {
          tip.style.left = (tip.offsetWidth + left - 30) + 'px'
        }
      }, 8)
    },
    initDate (AddDayCount) {
      var date = new Date()
      date.setDate(date.getDate() + AddDayCount)
      var y = date.getFullYear()
      var m = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
      var d = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      this.borrowDate = y + '-' + m + '-' + d
    },
    getDeadline (year, mouth, day) {
      var date = new Date()
      date.setHours(0)
      date.setMinutes(0)
      date.setSeconds(0)
      date.setMilliseconds(0)
      var date1 = new Date(year, mouth - 1, day)
      var timeDiff = date1.getTime() - date.getTime()
      this.borrowDeadline = parseInt(timeDiff / 1000 / 60 / 60 / 24) + 1
      this.rateAmount = parseFloat(this.borrowAmount * this.ratePercent / 100 / 365 * this.borrowDeadline).toFixed(1)
      this.borrowDate = year + '-' + (mouth < 10 ? '0' + mouth : mouth) + '-' + (day < 10 ? '0' + day : day)
      this.deadLineShow = false
    },
    gotoPage (page) {
      Storage.wannaInfo = {
        borrowAmount: this.borrowAmount,
        ratePercent: this.ratePercent,
        borrowDeadline: this.borrowDeadline,
        borrowPublish: this.borrowPublish
      }
      Router.push(page)
    },
    getPublish (publish) {
      this.purposeShow = false
      this.borrowPublish = publish
    },
    getTipSelected (selected) {
      this.tip.selected = selected
    },
    limitBorrowAmount () {
      if (parseInt(this.borrowAmount) < 0 || parseInt(this.borrowAmount) > 10000) {
        Error.show('请输入0~10000值')
        this.borrowAmount = ''
      }
    },
    limitRatePercent () {
      if (this.ratePercent < 0 || this.ratePercent > 24) {
        Error.show('请输入0~24的利率')
        this.ratePercent = ''
      }
    },
    checkPercent (percent) {
      if (isNaN(this.ratePercent)) {
        Error.show('请输入数字')
        return false
      }
      if (!this.ratePercent) {
        Error.show('请输入利率')
        return false
      }
      if (!parseInt(this.ratePercent)) {
        Error.show('请输入大于0的利率')
        return false
      }
      return true
    },
    // 发布借条
    publishSubmit () {
      if (!Check.money(this.borrowAmount)) return
      if (!this.checkPercent(this.borrowAmount)) return
      if (!this.tip.selected) {
        Error.show('请同意协议')
        return
      }
      Http.send({
        url: 'Create',
        data: {
          token: Storage.token,
          phone: Storage.phone,
          type: 1,
          amount: this.borrowAmount,
          lendPhones: this.borrowPhoneStr,
          imAccid: this.borrowImAccidStr,
          yearRate: this.ratePercent,
          Interest: this.rateAmount,
          period: this.borrowDeadline,
          otherCost: this.otherCost,
          purpose: this.borrowPurpose,
          purposeReason: Storage.opinion,
          expireDay: this.borrowPublish
          // source: Storage.borrowOrigin
        }
      }).success(data => {
        Storage.borrowId = data.Id
      }).fail(data => {
      })
    },
    openDeadlineModal () {
      this.deadLineShow = true
    },
    openPublishMadol () {
      this.purposeShow = true
    },
    closeModal () {
      this.purposeShow = false
      this.deadLineShow = false
    }
  },
  watch: {
    ratePercent (newNum, oldNum) {
      if (!this.borrowAmount) return
      this.rateAmount = parseFloat(this.borrowAmount * newNum / 100 / 365 * this.borrowDeadline).toFixed(1)
      this.paymentTotl = parseInt(this.borrowAmount) + parseFloat(this.rateAmount)
    }
  }
}
</script>

<style lang="sass" scoped>
@import "./wanna-borrow.scss";
</style>
