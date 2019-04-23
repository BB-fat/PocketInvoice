import {
  checksocket,
  sendmsg,
  checkEmail
} from "../normal"

const app = getApp()

Page({
  data: {
    data: {},
    allstyle: '', //控制mainview高度
    fp_height: 900,
  },

  //预览图片
  previewing: function() {
    wx.previewImage({
      urls: ['http://106.13.44.41/image/' + this.data.data['fpdm'] + this.data.data['fphm']],
    })
  },

  //返回主页
  toPocket: function() {
    wx.redirectTo({
      url: '../pocket/pocket',
    })
  },

  check: function() {
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
  send_email: function() {
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
      mask:true
    })
  },

  onLoad: function(options) {
    var that = this;
    that.setData({
      data: JSON.parse(options.data),
    })
    //以查验的发票请求详细信息
    if (this.data.data['state'] == 1) {
      //更换背景图片，重新设定fp高度
      var t_data = {
        'cmd': 116,
        'key': this.data.data['fp_dm'] + this.data.data['fp_hm'],
      }
      sendmsg(JSON.stringify(t_data))
    }
  },


  onShow: function() {
    var that = this
    wx.onSocketMessage(function(res) {
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