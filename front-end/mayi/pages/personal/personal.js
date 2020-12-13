// pages/personal/personal.js

import {
  sendmsg
} from "../normal.js"

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userdata: ''
  },

  //用户授权
  getAuth: function () {
    var that = this
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        my.getAuthUserInfo({
          success: (res) => {
            that.setData({
              avatar: res.avatar,
              nickName: res.nickName,
              haveUserInfo: true
            })
            //储存用户头像和昵称
            var t_data = {
              'cmd': 117,
              'avatar': res.avatar,
              'nickName': res.nickName,
            }
            sendmsg(JSON.stringify(t_data))
          },
        })
      },
    })
  },

  //绑定邮箱
  bindemail: function () {
    my.offSocketMessage()
    my.navigateTo({
      url: '../email/email',
    })
  },

  //访问帮助文档
  gowelcome: function () {
    my.offSocketMessage()
    my.navigateTo({
      url: '../welcome/welcome',
    })
  },

  //访问vip升级界面
  vip: function () {
    my.offSocketMessage()
    my.navigateTo({
      url: '../vip/vip',
    })
  },

  //跳转到about
  about: function () {
    my.offSocketMessage()
    my.navigateTo({
      url: '../about/about',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //向数据库请求头像和昵称
    var t_data = {
      'cmd': 118,
    }
    sendmsg(JSON.stringify(t_data))
    this.setData({
      windowHeight: app.globalData.windowHeight,
      windowWidth: app.globalData.windowWidth,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    // 更新邮箱状态
    this.setData({
      userdata: app.globalData.userdata
    })
    try {
      //设定用户绑定的邮箱状态
      if (this.data.userdata['address'] == "None") {
        this.setData({
          haveBindEmail: false
        })
      } else {
        this.setData({
          haveBindEmail: true
        })
      }
    } catch (e) {
      //重新获取邮箱和额度
      my.showLoading({});
      sendmsg(JSON.stringify({
        'cmd': 115,
      }))
    }
    my.onSocketMessage(function (res) {
      my.hideLoading()
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data)
      //接收到用户信息
      if (data['cmd'] == 213) {
        that.setData({
          avatar: data['avatar'],
          nickName: data['nickName'],
          haveUserInfo: true
        })
      }
      //没有用户信息
      else if (data['cmd'] == 214) {
        that.setData({
          haveUserInfo: false
        })
      }
      //获取用户相关状态
      else if (data['cmd'] == 210) {
        var tempUserdata = {
          'address': data['address'],
          'vip': data['vip']
        }
        app.globalData.userdata = tempUserdata
        that.setData({
          userdata: app.globalData.userdata
        })
        //设定用户绑定的邮箱状态
        if (that.data.userdata['address'] == "None") {
          that.setData({
            haveBindEmail: false
          })
        } else {
          that.setData({
            haveBindEmail: true
          })
        }
      }
    })
  },

  onHide: function () {
    my.offSocketMessage()
  },
})