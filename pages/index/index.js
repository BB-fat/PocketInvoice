//index.js
import {
  checksocket,
  sendmsg,
} from "../normal.js"

var app = getApp();
Page({
  data: {
    mainhide: true,
    data: {}, //储存一张发票的基本数据
  },

  onLoad: function() {
    this.setData({
      windowHeight: app.globalData.windowHeight
    })
  },

  onShow: function() {
    var that = this
    //等待接收服务器回传的信息
    wx.onSocketMessage(function(res) {
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data)
      //获取用户相关状态
      if (data['cmd'] == 210) {
        var tempUserdata = {
          'address': data['address'],
          'vip': data['vip']
        }
        app.globalData.userdata = tempUserdata
        //用户第一次使用，跳转到使用帮助
        if (data['welcome']) {
          wx.navigateTo({
            url: '../welcome/welcome',
          })
        }
      }
      //服务器带回验证码
      else if (data['cmd'] == 200) {
        //给验证码页面传送数据
        wx.navigateTo({
          url: '../yz/yz?url=' + data['verity_code_link'] + '&color=' + data['verity_code_word'],
        })
        that.setData({
          mainhide: !that.data.mainhide
        })
      } //end answer_no_verity
      //该发票已存在，直接拿到查验结果
      else if (data['cmd'] == 201) {
        wx.navigateTo({
          url: '../result/result?data=' + res.data,
        })
        that.setData({
          mainhide: !that.data.mainhide
        })
      } //end invoice exist
      //录入发票成功
      else if (data['cmd'] == 205) {
        wx.showToast({
          title: '录入成功',
          icon: 'success',
        })
      }
    }) //end socketmessage
  },

  //驱动爬虫查验
  tapQueryEvent: function() {
    var that = this
    wx.scanCode({
      scanType: ['qrCode'],
      success(res) {
        // console.log(res.result)
        //解析二维码信息，排除错误
        try {
          var temp = res.result;
          temp = temp.substring(0, temp.length - 1);
          var stringArray = temp.split(",");
        } catch (e) {
          wx.showToast({
            title: '请扫描正确的二维码',
            duration: 1000,
            icon: 'none'
          })
          console.log('二维码错误')
          return
        }
        //验证二维码信息完整性
        if (stringArray[5] == '') {
          wx.showToast({
            title: '二维码缺少信息，请手动输入',
            duration: 1200,
            icon: 'none'
          })
          return
        }
        //通过错误检测，等待图标出现
        that.setData({
          mainhide: !that.data.mainhide
        })
        //发送资料包
        that.data.data = {
          "fp_qz": stringArray[1],
          "fp_dm": stringArray[2],
          "fp_hm": stringArray[3],
          "kp_je": stringArray[4],
          "kp_rq": stringArray[5],
          "jy": stringArray[6],
        }
        var t_data = that.data.data
        t_data['cmd'] = 102
        t_data = JSON.stringify(t_data)
        sendmsg(t_data)
      }, //end success
    }) //end scanCode
  }, //end bindtap

  //录入发票
  saveinvoice: function() {
    var that = this
    wx.scanCode({
      scanType: ['qrCode'],
      success(res) {
        // console.log(res.result)
        //解析二维码信息，排除错误
        try {
          var temp = res.result;
          temp = temp.substring(0, temp.length - 1);
          var stringArray = temp.split(",");
          if (stringArray.length != 8) {
            throw "error"
          }
        } catch (e) {
          wx.showToast({
            title: '请扫描正确的二维码',
            duration: 1500,
            icon: 'none'
          })
          console.log('二维码错误')
          return
        }
        //验证二维码信息
        if (stringArray[5] == '') {
          wx.showToast({
            title: '二维码缺少信息，请手动输入',
            duration: 1500,
            icon: 'none'
          })
          return
        }
        that.data.data = {
          "fp_qz":stringArray[1],
          "fp_dm": stringArray[2],
          "fp_hm": stringArray[3],
          "kp_je": stringArray[4],
          "kp_rq": stringArray[5],
          "jy": stringArray[6],
        }
        var t_data = that.data.data
        t_data['cmd'] = 110
        t_data = JSON.stringify(t_data)
        sendmsg(t_data)
      }, //end success
    }) //end scanCode
  },

  //跳转至手动录入
  manual: function() {
    wx.navigateTo({
      url: '../manual/manual',
    })
  },
})