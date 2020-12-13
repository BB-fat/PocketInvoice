const app = getApp();
import {
  checksocket,
  sendmsg,
  checkEmail,
} from "../normal"

Page({
  data: {
    data: {},
    allstyle: '',//控制mainview高度
    fp_height: 900,
  },

  //预览图片
  previewing: function () {
    my.previewImage({
      urls: ['http://62.234.137.114/image/' + this.data.data['fpdm'] + this.data.data['fphm']],
    })
  },

  //返回发票夹
  back: function () {
    my.offSocketMessage()
    my.switchTab({
      url: '../mine/mine',
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
    my.showLoading({
      content: '正在获取验证码',
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
    my.showLoading({
      content: '正在发送',
    })
  },

  onLoad: function (options) {
    var that = this;
    this.setData({
      windowHeight: app.globalData.windowHeight
    })
    that.setData({
      data: JSON.parse(options.data),
    })
    //以查验的发票请求详细信息
    if (this.data.data['state'] == 1) {
      //更换背景图片，重新设定fp高度
      this.setData({
        fp_height: 1200,
      })
      var t_data = {
        'cmd': 116,
        'key': this.data.data['fp_dm'] + this.data.data['fp_hm'],
      }
      sendmsg(JSON.stringify(t_data))
    } else {
      // 控制mainview高度
      this.setData({
        allstyle: 'height:' + this.data.windowHeight * 1.1 + 'px'
      })
    }
  },


  onShow: function () {
    var that = this
    my.onSocketMessage(function (res) {
      //隐藏加载图标
      my.hideLoading({
        page: that
      })
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data);
      //发送成功
      if (data['cmd'] == 205) {
        my.showToast({
          content: '已发送',
          type: "success",
          duration: 1000,
        })
      }
      //发送失败，没有绑定邮箱
      else if (data['cmd'] == 207) {
        my.offSocketMessage()
        my.showToast({
          content: '请绑定邮箱',
          duration: 1000,
        })
        setTimeout(function () {
          my.navigateTo({
            url: '../email/email',
          })
        }, 1000)
      }
      //查验
      else if (data['cmd'] == 200) {
        my.offSocketMessage()
        my.redirectTo({
          url: '../yz/yz',
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