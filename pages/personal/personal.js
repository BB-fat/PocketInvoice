// pages/personal/personal.js

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  //绑定邮箱
  bindemail: function() {
    wx.navigateTo({
      url: '../email/email',
    })
  },

  //访问帮助文档
  gowelcome: function() {
    wx.navigateTo({
      url: '../welcome/welcome',
    })
  },

  //访问vip升级界面
  vip: function() {
    wx.navigateTo({
      url: '../vip/vip',
    })
  },

//跳转到about
  about: function() {
    wx.navigateTo({
      url: '../about/about',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      windowHeight: app.globalData.windowHeight,
      windowWidth: app.globalData.windowWidth,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 更新邮箱状态
    this.setData({
      userdata: app.globalData.userdata
    })
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
  },
})