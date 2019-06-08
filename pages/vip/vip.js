// pages/vip/vip.js
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseOne:0,
    btn_pay: {
      tapFun: 'pay',
      text: "点击购买",
      color: "#EF9E1E",
      width: 620,
      mode: "mid"
    },
    btn_120:{
      count:120,
      price:200,
    },
    btn_60:{
      count:60,
      price:100,
    },
    btn_35:{
      count:35,
      price:50,
    },
    btn_12:{
      count:12,
      price:20,
    },
    btn_6:{
      count:6,
      price:10,
    },
    btn_1:{
      count:1,
      price:2,
    },
  },

onLoad:function(){
  this.setData({
    windowHeight: app.globalData.windowHeight
  })
},
  // 微信支付
  pay: function() {
    // var time = new Date()
    // wx.requestPayment({
    //   timeStamp: time.getTime(),
    //   nonceStr: 'kdfp',
    //   package: '',
    //   paySign: '',
    //   success: function() {

    //   },
    //   fail: function() {

    //   }
    // })
    wx.showModal({
      title: '亲',
      content: '很抱歉，我们暂时没有支付能力',
      showCancel:false,
      confirmText:'给予谅解'
    })
  },

  tapFun:function(e){
    wx.vibrateShort()
    this.setData({
      chooseOne:e.currentTarget.dataset.count
    })
  }
})