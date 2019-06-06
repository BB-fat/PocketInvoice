// pages/newindex/newindex.js
import {
  checksocket,
  sendmsg,
} from "../normal.js"

var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    firstFloorHeight: 72,
    btn_sign:{
      tapFun: 'sign',
      text: "签到",
      color: "#cd5242",
      width: 150,
      mode: "mid"
    },
    singleCheck: {
      iconSrc: "../../imgs/index/tabbar_icon_singlecheck_default@2x.png",
      text: "单张查验",
      tapFun: "singleCheck"
    },
    saveInvoice: {
      iconSrc: "../../imgs/index/tabbar_icon_saveinvoice_default@2x.png",
      text: "录入发票",
      tapFun: 'saveinvoice'
    },
    manual: {
      iconSrc: "../../imgs/index/tabbar_icon_manualsave_default@2x.png",
      text: "手动录入",
      tapFun: "manual"
    },
    vip: {
      iconSrc: "../../imgs/index/tabbar_icon_purchase_default@2x.png",
      text: "额度购买",
      tapFun: "vip"
    },
    pocket: {
      iconSrc: "../../imgs/index/tabbar_icon_invoices_default@2x.png",
      text: "发票夹",
      tapFun: "toPocket",
      width: 120,
      height: 60
    },
    lineButton1: {
      iconSrc: "../../imgs/index/list_icon_folder_default@2x.png",
      text: '我的票夹',
      tapFun: "toPocket"
    },
    lineButton2: {
      iconSrc: '../../imgs/index/list_icon_email_default@2x.png',
      text: '邮箱设置',
      tapFun: 'toEmail'
    },
    lineButton3: {
      iconSrc: '../../imgs/index/list_icon_faq_default@2x.png',
      text: '使用帮助',
      tapFun: 'toHelp'
    },
    lineButton4: {
      iconSrc: '../../imgs/index/list_icon_information_default@2x.png',
      text: '关于我们',
      tapFun: 'toAbout'
    }
  },

  onShow: function(options) {
    var that = this
    //等待接收服务器回传的信息
    wx.onSocketMessage(function(res) {
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data)
      //获取用户相关状态
      if (data['cmd'] == 210) {
        var last=new Date(data['record_time']*1000).getDay()
        var now=new Date().getDay()
        if(now-last<=0){
          that.setData({
            signed:true
          })
        }else{
          that.setData({
            signed:false
          })
        }
        that.setData({
          limit: data['vip'],
          address:data['address'],
          record:data['record']
        })
        var tempUserdata = {
          'address': data['address'],
          'vip': data['vip']
        }
        app.globalData.userdata = tempUserdata
        //用户第一次使用，跳转到使用帮助
        // if (data['welcome']) {
        //   wx.navigateTo({
        //     url: '../welcome/welcome',
        //   })
        // }
      }
      //服务器带回验证码
      else if (data['cmd'] == 200) {
        //给验证码页面传送数据
        wx.navigateTo({
          url: '../yz/yz?url=' + data['verity_code_link'] + '&color=' + data['verity_code_word'],
        })
      } //end answer_no_verity
      //该发票已存在，直接拿到查验结果
      else if (data['cmd'] == 201) {
        wx.navigateTo({
          url: '../result/result?data=' + res.data,
        })
      } //end invoice exist
      //录入发票成功
      else if (data['cmd'] == 205) {
        wx.showToast({
          title: '录入成功',
          icon: 'success',
        })
      }
      //开票时间在一年以前，无法查验
      else if (data['cmd'] == 206) {
        wx.showToast({
          title: '开票时间一年以上无法查验',
          icon:'none'
        })
      }
    }) //end socketmessage
  },

  // 单张查验
  singleCheck: function() {
    var that = this
    wx.scanCode({
      scanType: ['qrCode'],
      success(res) {
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
        wx.showLoading({
          title: '正在获取验证码',
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
          "fp_qz": stringArray[1],
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

  //访问vip升级界面
  vip: function() {
    wx.navigateTo({
      url: '../vip/vip',
    })
  },

  // 跳转至发票夹
  toPocket: function() {
    wx.navigateTo({
      url: '../pocket/pocket',
    })
  },

  toEmail: function() {
    var that=this
    wx.navigateTo({
      url: '../email/email',
    })
  },

  toHelp: function() {
    wx.navigateTo({
      url: '../welcome/welcome',
    })
  },

  toAbout: function() {
    wx.navigateTo({
      url: '../about/about',
    })
  },

  // 签到
  sign:function(){
     var t_data={
       cmd:119
    }
    sendmsg(JSON.stringify(t_data))
    this.setData({
      signed:true,
      record:this.data.record+1
    })
    wx.showToast({
      title: '成功',
    });  
  },
})