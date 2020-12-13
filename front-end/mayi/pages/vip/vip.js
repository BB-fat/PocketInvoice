// pages/vip/vip.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onLoad: function () {
    this.setData({
      windowHeight: app.globalData.windowHeight
    })
  },
  //微信支付
  pay: function () {
    //   var time = new Date()
    //   wx.requestPayment({
    //     timeStamp: time.getTime(),
    //     nonceStr: 'kdfp',
    //     package: '',
    //     paySign: '',
    //     success: function() {

    //     },
    //     fail: function() {

    //     }
    //   })
    my.alert({
      title:'亲',
      content:'抱歉，我们暂时没有支付能力',
      buttonText:'给予谅解'
    })
  },

})