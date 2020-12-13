// pages/email/email.js+
var app = getApp();
import {
  checksocket,
  sendmsg
} from "../normal.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    button_text: '获取验证码',
    address: '', //邮箱地址
    verity: '', //邮箱验证码
    disable_input: false,
    disable_button: false,
    wait_time: 60,
    verity_send: false,
  },
  //接收邮箱地址
  address: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  //接收验证码
  verity: function (e) {
    this.setData({
      verity: e.detail.value
    })
  },

  //获取验证码
  get_verity: function () {
    var that = this
    //使用正则表达式验证邮箱地址
    var email = that.data.address
    if (!(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email))) {
      my.showToast({
        content: '邮箱格式不正确！',
        duration: 1000,
      })
      that.setData({
        address: ''
      })
      return;
    }
    //禁用邮箱地址输入
    that.setData({
      disable_input: true,
      verity_send: true
    })
    var t_data = JSON.stringify({
      'address': this.data.address,
      "cmd": 106,
    })
    sendmsg(t_data)
    this.setData({
      disable_button: true,
      disable_input: true,
    })
    //60秒验证码冷却
    var currentTime = that.data.wait_time
    var interval = setInterval(function () {
      currentTime--;
      that.setData({
        button_text: currentTime + 's'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          disable_button: false,
          disable_input: false,
          wait_time: 60,
          button_text: '再次获取',
          verity_send: false,
        })
      }
    }, 1000)
  },

  //发送验证码
  send: function () {
    if (this.data.address == '') {
      my.showToast({
        content: '请输入邮箱地址',
        duration: 1100
      })
      return
    } else if (this.data.verity_send == false) {
      my.showToast({
        content: '请先获取验证码',
        duration: 1000
      })
      return
    }
    var t_data = JSON.stringify({
      'verity': this.data.verity,
      "cmd": 107,
    })
    sendmsg(t_data)
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    my.onSocketMessage(function (res) {
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data);
      //服务器带回验证码
      if (data['cmd'] == 205) {
        my.showToast({
          content: '绑定成功',
          type: 'success'
        })
        app.globalData.userdata['address']=that.data.address
        my.offSocketMessage()
        setTimeout(function () {
          my.navigateBack()
        }, 1000)
      } else if (data['cmd'] == 206) {
        my.showToast({
          content: '验证码错误',
          duration: 1000
        })
      }
    }) //end socketmessage
  }, //end onShow
})