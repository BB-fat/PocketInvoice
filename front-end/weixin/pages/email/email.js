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
    btn_send: {
      tapFun: 'send',
      text: "确定",
      color: "#EF9E1E",
      width: 620,
      mode: "mid"
    },
    btn_verity: {
      tapFun: 'get_verity',
      text: "点击发送验证码",
      color: "#5087C8",
      width: 300,
      mode: "mid"
    },
    btn_changebind: {
      tapFun: 'changeBind',
      text: "更改绑定",
      color: "#EF9E1E",
      width: 620,
      mode: "mid"
    },
    binded:false,
    changebind:false,
    address: '', //邮箱地址
    verity: '', //邮箱验证码
    disable_input: false,
    wait_time: 60,
    verity_send: false,
  },

onLoad:function(options){
  if (app.globalData.userdata.address!='None'){
    this.setData({
      binded:true,
      address: app.globalData.userdata.address
    })
  }
},

  //接收邮箱地址
  address: function(e) {
    this.setData({
      address: e.detail.value
    })
  },
  //接收验证码
  verity: function(e) {
    this.setData({
      verity: e.detail.value
    })
  },

  //获取验证码
  get_verity: function() {
    var that = this
    //使用正则表达式验证邮箱地址
    var email = that.data.address
    if (!(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(email))) {
      wx.showToast({
        title: '邮箱格式不正确！',
        icon: 'none',
        duration: 1000,
      })
      that.setData({
        address: ''
      })
      return;
    }
    //禁用邮箱地址输入
    that.data.btn_verity.tapFun=''
    that.data.btn_verity.color='#9E9E9E'
    that.setData({
      btn_verity:that.data.btn_verity,
      verity_send: true,
      disable_input: true,
    })
    var t_data = JSON.stringify({
      'address': this.data.address,
      "cmd": 106,
    })
    sendmsg(t_data)
    //60秒验证码冷却
    var currentTime = that.data.wait_time
    var interval = setInterval(function() {
      currentTime--;
      that.data.btn_verity.text=currentTime + 's'
      that.setData({
        btn_verity:that.data.btn_verity
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.data.btn_verity.tapFun='send'
        that.data.btn_verity.text='再次获取'
        that.setData({
          btn_verity:that.data.btn_verity,
          disable_input: false,
          wait_time: 60,
          verity_send: false,
        })
      }
    }, 1000)
  },

  //发送验证码
  send: function() {
    if (this.data.address == '') {
      wx.showToast({
        title: '请输入邮箱地址',
        icon: 'none',
        duration: 1100
      })
      return
    } else if (this.data.verity_send == false) {
      wx.showToast({
        title: '请先获取验证码',
        icon: 'none',
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

  changeBind:function(){
    var that=this
    wx.showModal({
      title:"提示",
      content:"您确定要更改邮箱绑定吗？",
      showCancel:true,
      success(res){
        if(res.confirm){
          that.setData({
            changebind:true,
            address:'',
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    wx.onSocketMessage(function(res) {
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data);
      //服务器带回验证码
      if (data['cmd'] == 205) {
        wx.showToast({
          title: '绑定成功',
          icon: 'success'
        })
        //更新用户数据
        app.globalData.userdata['address']=that.data.address
        setTimeout(function() {
          wx.navigateBack()
        },1000)
      } else if (data['cmd'] == 206) {
        wx.showToast({
          title: '验证码错误',
          icon: 'none',
          duration: 1000
        })
      }
    }) //end socketmessage
  }, //end onShow
})