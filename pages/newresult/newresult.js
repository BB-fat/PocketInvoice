import {
  checksocket,
  sendmsg,
  checkEmail
} from "../normal"

import {imgURL} from "../../settings.js"

const app = getApp()

Page({
  data: {
    btn_check: {
      tapFun: 'check',
      text: "立即查验",
      color: "#5087c8",
      width: 620,
      mode: "mid"
    },
    btn_nativePic: {
      tapFun: 'previewing',
      text: "查看原图",
      color: "#5087c8",
      width: 620,
      mode: "mid"
    },
    btn_sendEmail: {
      tapFun: 'send_email',
      text: "发送邮箱",
      color: "#5087c8",
      width: 620,
      mode: "mid"
    },
    btn_delete: {
      tapFun: 'delete',
      text: "删除",
      color: "#e77a72",
      width: 620,
      mode: "mid"

    }
  },

  //预览图片
  previewing: function () {
    wx.previewImage({
      urls: [imgURL+'/image/' + this.data.data['fpdm'] + this.data.data['fphm']],
    })
  },

  //返回主页
  toPocket: function () {
    wx.redirectTo({
      url: '../pocket/pocket',
    })
  },

  check: function () {
    var t_data = this.data.data
    // 将发票数据退格式化
    t_data['kp_je'] = t_data['kp_je'].replace('¥', '')
    t_data['kp_rq'] = t_data['kp_rq'].replace('年', '')
    t_data['kp_rq'] = t_data['kp_rq'].replace('月', '')
    t_data['kp_rq'] = t_data['kp_rq'].replace('日', '')
    delete t_data['fp_zl']
    t_data['cmd'] = 102
    sendmsg(JSON.stringify(t_data))
    wx.showLoading({
      title: '正在获取验证码',
      mask: true,
    })
  },

  //发送邮箱
  send_email: function () {
    if (!checkEmail(app)) {
      return
    }
    var t_data = JSON.stringify({
      "cmd": 108,
      "fp_dm": this.data.data['fpdm'],
      "fp_hm": this.data.data['fphm'],
    })
    sendmsg(t_data)
    wx.showLoading({
      title: '正在发送',
      mask: true
    })
  },

  delete: function () {
    var that=this
    //显示删除提示
    wx.showModal({
      title: '删除',
      content: '确定删除所选发票？',
      success(res) {
        if (res.cancel) {
          return
        } else {
          var t_data = {
            cmd: 113,
            list: []
          }
          if(that.data.data.state==1){
            t_data.list.push(that.data.data.fpdm+that.data.data.fphm)
          }else{
            t_data.list.push(that.data.data.fp_dm+that.data.data.fp_hm)
          }
          sendmsg(JSON.stringify(t_data))
          wx.showToast({
            title: '完成',
            icon: 'success',
          })
          setTimeout(function(){
            wx.navigateBack()
          },1000)
        }
      }
    })
  },

  onLoad: function (options) {
    var that = this;
    var windowHeight = 0;
    that.setData({
      data: JSON.parse(options.data),
    })
    // 获取窗口高度
    wx.getSystemInfo({
      success(res) {
        windowHeight = res.windowHeight
      }
    })
    //以查验的发票请求详细信息
    if (this.data.data['state'] == 1) {
      that.setData({
        pageViewHeight: windowHeight + 230
      })
      var t_data = {
        'cmd': 116,
        'key': this.data.data['fp_dm'] + this.data.data['fp_hm'],
      }
      sendmsg(JSON.stringify(t_data))
    } else {
      that.setData({
        pageViewHeight: windowHeight
      })
    }
  },


  onShow: function () {
    var that = this
    wx.onSocketMessage(function (res) {
      wx.hideLoading()
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data);
      //发送成功
      if (data['cmd'] == 205) {
        wx.showToast({
          title: '已发送',
          duration: 1000,
        })
      }
      //查验
      else if (data['cmd'] == 200) {
        wx.redirectTo({
          url: '../yz/yz?url=' + data['verity_code_link'] + '&color=' + data['verity_code_word'],
        })
      }
      //接受详细的发票信息
      else if (data['cmd'] == 212) {
        data['data']['state'] = 1
        data['data']['time'] = data['data']['time'].replace('查验时间：', '')
        that.setData({
          data: data['data']
        })
      }
    }) //end onsocketmessage
  },
})