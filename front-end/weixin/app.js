//app.js
import {
  checksocket,
} from "pages/normal.js"

App({
  globalData: {},
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function() {
    var that = this
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.windowHeight = res.windowHeight //屏幕可用高度
        that.globalData.screenHeight = res.screenHeight //屏幕总长度
        that.globalData.windowWidth = res.windowWidth   //屏幕可用宽度
      },
    })
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function(options) {
    checksocket()
  },
})