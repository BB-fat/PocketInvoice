// pages/mine/mine.js
const app = getApp();
import {
  sendmsg,
  checkEmail
} from "../normal.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn_shaixuan: {
      tapFun: 'onShaixuan',
      text: "发票筛选",
      color: "#d3922b",
      width: 320,
      mode: "mid"
    },
    btn_zhuangtai: {
      tapFun: 'chooseState',
      text: "查验状态",
      color: "#E19C2E",
      width: 320,
      mode: "right"
    },
    btn_riqi:{
      width:320,
    },
    btn_piliang: {
      tapFun: 'onPiliang',
      text: "批量管理",
      color: "#6919b4",
      width: 320,
      mode: "mid"
    },
    btn_chooseall: {
      tapFun: 'chooseall',
      text: "全选",
      color: "#7250c8",
      width: 320,
      mode: "left"
    },
    btn_delete: {
      tapFun: 'deleteall',
      text: "删除",
      color: "#e65454",
      width: 320,
      mode: "left"
    },
    btn_tongji: {
      tapFun: 'excel',
      text: "统计",
      color: "#c79841",
      width: 320,
      mode: "left"
    },
    invoiceWidth: 710,
    date: 0, //筛选月份
    zl: 0, //发票种类  -1代表未筛选状态
    shaixuan: false, //筛选开关
    piliang: false, //批量开关
    fun_one: 'one', //单个发票绑定的点击函数（两种状态）
    checked: [], //选框列表
    chooseall: false, //全选开关
  },

  // 开启筛选
  onShaixuan: function () {
    var that=this
    //发票夹是空的或筛选结果为空时不允许切换筛选状态
    if (this.data.pocket == '') {
      return
    }
    this.data.btn_shaixuan.text = '发票种类'
    this.data.btn_shaixuan.tapFun = 'invoiceType'
    this.setData({
      shaixuan: true,
      btn_shaixuan: this.data.btn_shaixuan
    })
    var btn_zhuangtai = setInterval(function () {
      var data_cancel = that.data.btn_zhuangtai
      data_cancel.width = data_cancel.width + 20
      that.setData({
        btn_zhuangtai: data_cancel
      })
      if (that.data.btn_zhuangtai.width >= 487) {
        clearInterval(btn_zhuangtai)
      }
    }, 26)
    var btn_riqi = setInterval(function () {
      var data_cancel = that.data.btn_riqi
      data_cancel.width = data_cancel.width + 30
      that.setData({
        btn_riqi: data_cancel
      })
      if (that.data.btn_riqi.width >= 680) {
        clearInterval(btn_riqi)
      }
    }, 26)
  },

  offShaixuan:function(){
    var that=this
    this.data.btn_shaixuan.text = '取消筛选'
    this.data.btn_shaixuan.tapFun = 'all'
    this.setData({
      shaixuan:false,
      btn_shaixuan: this.data.btn_shaixuan
    })
    var btn_zhuangtai = setInterval(function () {
      var data_cancel = that.data.btn_zhuangtai
      data_cancel.width = data_cancel.width - 20
      that.setData({
        btn_zhuangtai: data_cancel
      })
      if (that.data.btn_zhuangtai.width <= 320) {
        clearInterval(btn_zhuangtai)
      }
    }, 26)
    var btn_riqi = setInterval(function () {
      var data_cancel = that.data.btn_riqi
      data_cancel.width = data_cancel.width - 30
      that.setData({
        btn_riqi: data_cancel
      })
      if (that.data.btn_riqi.width <= 320) {
        clearInterval(btn_riqi)
      }
    }, 26)
  },

  // 按查验状态筛选
  chooseState: function () {
    var that = this
    wx.showActionSheet({
      itemList: ['已查验', '未查验'],
      success(res) {
        that.data.pocket=[]
        if (res.tapIndex == 0) {
          for (var i = 0; i < that.data.invoices.length; i++) {
            if (that.data.invoices[i]['state'] == 1) {
              that.data.pocket.push(that.data.invoices[i])
            } 
          }
        }
        else if(res.tapIndex == 1){
          for (var i = 0; i < that.data.invoices.length; i++) {
            if (that.data.invoices[i]['state'] == 0) {
              that.data.pocket.push(that.data.invoices[i])
            }
          }
        }
        that.setData({
          pocket: that.data.pocket,
        })
      }
    })
  },

  // 发票种类筛选
  invoiceType: function () {
    var that = this
    wx.showActionSheet({
      itemList: ["增值税电子普通发票", "增值税普通发票", "增值税专用发票"],
      success(res) {
        var tempzl = 0
        if (res.tapIndex == 0) {
          tempzl = "10"
        }
        else if (res.tapIndex == 0) {
          tempzl = "04"
        }
        else {
          tempzl = "01"
        }
        that.setData({
          zl: tempzl,
        })
        //判断日期筛选是否启动
        if (that.data.date != 0) {
          var datearr = that.data.date.split('-')
        }
        var temp = []
        //增值税电子普通发票
        if (that.data.zl == "10") {
          for (var i = 0; i < that.data.invoices.length; i++) {
            if (that.data.invoices[i]['fp_qz'] == '10') {
              if (that.data.date == 0 || that.data.invoices[i]['kp_rq'].substring(0, 4) == datearr[0] && that.data.invoices[i]['kp_rq'].substring(5, 7) == datearr[1]) {
                temp.push(that.data.invoices[i])
              }
            }
          }
        }
        //增值税普通发票
        else if (that.data.zl == "04") {
          var temp = []
          for (var i = 0; i < that.data.invoices.length; i++) {
            if (that.data.invoices[i]['fp_qz'] == '04') {
              if (that.data.date == 0 || that.data.invoices[i]['kp_rq'].substring(0, 4) == datearr[0] && that.data.invoices[i]['kp_rq'].substring(5, 7) == datearr[1]) {
                temp.push(that.data.invoices[i])
              }
            }
          }
        }
        //增值税专用发票
        else if (that.data.zl == "01") {
          var temp = []
          for (var i = 0; i < that.data.invoices.length; i++) {
            if (that.data.invoices[i]['fp_qz'] == '01') {
              if (that.data.date == 0 || that.data.invoices[i]['kp_rq'].substring(0, 4) == datearr[0] && that.data.invoices[i]['kp_rq'].substring(5, 7) == datearr[1]) {
                temp.push(that.data.invoices[i])
              }
            }
          }
        }
        that.setData({
          pocket: temp
        })
      }
    })
  },

  // 开启批量
  onPiliang: function () {
    var that = this
    this.data.btn_piliang.tapFun = "checkall"
    this.data.btn_piliang.text = "一键查验"
    this.setData({
      piliang: !this.data.piliang,
      fun_one: 'changecheckbox',
      btn_piliang: this.data.btn_piliang
    })
    var move = setInterval(function () {
      that.setData({
        invoiceWidth: that.data.invoiceWidth - 5,
      })
      if (that.data.invoiceWidth <= 610) {
        clearInterval(move)
      }
    }, 26)
    var btn_chooseall = setInterval(function () {
      var data_cancel = that.data.btn_chooseall
      data_cancel.width = data_cancel.width + 20
      that.setData({
        btn_chooseall: data_cancel
      })
      if (that.data.btn_chooseall.width >= 453) {
        clearInterval(btn_chooseall)
      }
    }, 26)
    var btn_delete = setInterval(function () {
      var data_delete = that.data.btn_delete
      data_delete.width = data_delete.width + 25
      that.setData({
        btn_delete: data_delete
      })
      if (that.data.btn_delete.width >= 565) {
        clearInterval(btn_delete)
      }
    }, 26)
    var btn_tongji = setInterval(function () {
      var data_tongji = that.data.btn_tongji
      data_tongji.width = data_tongji.width + 30
      that.setData({
        btn_tongji: data_tongji
      })
      if (that.data.btn_tongji.width >= 680) {
        clearInterval(btn_tongji)
      }
    }, 26)
  },

  // 关闭批量
  offPiliang: function () {
    var that = this
    var temp = this.data.checked
    for (var i = 0; i < temp.length; i++) {
      temp[i] = false
    }
    this.data.btn_piliang.tapFun = "onPiliang"
    this.data.btn_piliang.text = "批量管理"
    //关闭批量
    this.setData({
      piliang: !this.data.piliang,
      fun_one: 'one',
      checked: temp,
      chooseall: false,
      btn_piliang: this.data.btn_piliang
    })
    var move = setInterval(function () {
      that.setData({
        invoiceWidth: that.data.invoiceWidth + 5,
      })
      if (that.data.invoiceWidth >= 710) {
        clearInterval(move)
      }
    }, 26)
    var btn_chooseall = setInterval(function () {
      var data_cancel = that.data.btn_chooseall
      data_cancel.width = data_cancel.width - 20
      that.setData({
        btn_chooseall: data_cancel
      })
      if (that.data.btn_chooseall.width <= 320) {
        clearInterval(btn_chooseall)
      }
    }, 26)
    var btn_delete = setInterval(function () {
      var data_delete = that.data.btn_delete
      data_delete.width = data_delete.width - 25
      that.setData({
        btn_delete: data_delete
      })
      if (that.data.btn_delete.width <= 320) {
        clearInterval(btn_delete)
      }
    }, 26)
    var btn_tongji = setInterval(function () {
      var data_tongji = that.data.btn_tongji
      data_tongji.width = data_tongji.width - 30
      that.setData({
        btn_tongji: data_tongji
      })
      if (that.data.btn_tongji.width <= 320) {
        clearInterval(btn_tongji)
      }
    }, 26)
  },

  //恢复显示全部
  all: function () {
    this.data.btn_shaixuan.tapFun='onShaixuan'
    this.data.btn_shaixuan.text='发票筛选'
    this.setData({
      date: 0,
      zl: 0,
      pocket: this.data.invoices,
      btn_shaixuan:this.data.btn_shaixuan
    })
  },

  //时间筛选模块
  changedate: function (e) {
    this.setData({
      date: e.detail['value']
    })
    var datearr = this.data.date.split('-')
    var temp = []
    for (var i = 0; i < this.data.invoices.length; i++) {
      if (this.data.invoices[i]['kp_rq'].substring(0, 4) == datearr[0] && this.data.invoices[i]['kp_rq'].substring(5, 7) == datearr[1]) {
        if (this.data.zl == 0 || this.data.invoices[i]['fp_qz'] == this.data.zl) {
          temp.push(this.data.invoices[i])
        }
      }
    }
    this.setData({
      pocket: temp
    })
  },

  //进入一张发票的result页
  one: function (e) {
    //向result界面传送发票数据
    var data = JSON.stringify(this.data.pocket[e.currentTarget.dataset.id])
    wx.navigateTo({
      url: '../result/result?data=' + data,
    })
  },

  //点击选框
  changecheckbox: function (e) {
    wx.vibrateShort() //选择一张震动
    var temp = this.data.checked
    temp[e.currentTarget.dataset.id] = !temp[e.currentTarget.dataset.id]
    //更新选择状态
    this.setData({
      checked: temp
    })
  },

  //批量查验
  checkall: function () {
    //检查vip状态
    if (app.globalData.userdata['vip'] == 0) {
      wx.showModal({
        title: '温馨提示',
        content: '您的批量查验额度已用完，是否充值？',
        confirmText: "立刻充值",
        confirmColor: "#368299",
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../vip/vip',
            })
          }
        }
      })
      return
    }
    var t_data = {
      'cmd': 112,
      'list': []
    }
    //生成已选择的发票信息列表
    for (var i = 0; i < this.data.checked.length; i++) {
      if (this.data.checked[i]) {
        t_data['list'].push(this.data.pocket[i]['fp_dm'] + this.data.pocket[i]['fp_hm'])
      }
    }
    //如果生成的列表为空，显示提示
    if (t_data['list'] == '') {
      wx.showToast({
        title: '请至少选择一张发票',
        icon: 'none',
      })
      return
    }
    sendmsg(JSON.stringify(t_data))
    wx.showLoading({
      title: "正在查验",
      mask: true,
    })
  },

  //批量删除
  deleteall: function (e) {
    var that = this
    var t_data = {
      'cmd': 113,
      'list': []
    }
    var temp = [] //用以储存删除后的选框状态列表
    //生成已选信息列表
    for (var i = 0; i < that.data.checked.length; i++) {
      if (that.data.checked[i]) {
        t_data['list'].push(that.data.pocket[i]['fp_dm'] + that.data.pocket[i]['fp_hm'])
      } else {
        temp.pop(false) //重设选中状态
      }
    }
    if (t_data['list'] == '') {
      wx.showToast({
        title: '请至少选择一张发票',
        icon: 'none',
      })
      return
    }
    //显示删除提示
    wx.showModal({
      title: '删除',
      content: '确定删除所选发票？',
      success(res) {
        if (res.cancel) {
          return
        } else {
          sendmsg(JSON.stringify(t_data))
          wx.showToast({
            title: '完成',
            icon: 'success',
          })
          that.setData({
            checked: temp //还原选择状态列表
          })
        }
      }
    })
  },

  //生成统计表
  excel: function () {
    if (!checkEmail(app)) {
      return
    }
    var t_data = {
      'cmd': 114,
      'list': []
    }
    for (var i = 0; i < this.data.checked.length; i++) {
      if (this.data.checked[i]) {
        t_data['list'].push(this.data.pocket[i]['fp_dm'] + this.data.pocket[i]['fp_hm'])
      }
    }
    if (t_data['list'] == '') {
      wx.showToast({
        title: '请至少选择一张发票',
        icon: 'none',
      })
      return
    }
    sendmsg(JSON.stringify(t_data))
    wx.showLoading({
      title: "正在生成",
      mask: true,
    })
  },

  //全选按钮
  chooseall: function () {
    if (!this.data.chooseall) {
      for (var i = 0; i < this.data.checked.length; i++) {
        this.data.checked[i] = true
      }
      this.data.btn_chooseall.text = '取消'
    } else {
      for (var i = 0; i < this.data.checked.length; i++) {
        this.data.checked[i] = false
      }
      this.data.btn_chooseall.text = '全选'
    }
    this.setData({
      btn_chooseall: this.data.btn_chooseall,
      checked: this.data.checked,
      chooseall: !this.data.chooseall
    })
  },

  onLoad: function () {
    var t_data = JSON.stringify({
      "cmd": 111,
    })
    sendmsg(t_data)
    wx.showLoading({
      title: '加载中',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    //初始化各种状态
    this.setData({
      date: 0,
      zl: 0,
      checked: [],
    })
    wx.onSocketMessage(function (res) {
      console.log('recieve:' + res.data)
      var data = JSON.parse(res.data)
      //接收到发票数据
      if (data['cmd'] == 208) {
        wx.hideLoading()
        wx.stopPullDownRefresh()
        if (data['pocket'] == []) {
          return
        } else {
          that.setData({
            invoices: data['pocket'],
            pocket: data['pocket'],
          })
          for (var i = 0; i < Object.keys(data['pocket']).length; i++) {
            that.data.checked[i] = false
          }
        }
      }
      //更新批量查验的结果
      else if (data['cmd'] == 209) {
        //减少批量查验额度
        app.globalData.userdata['vip'] = app.globalData.userdata['vip'] - 1
        that.data.pocket[data['index']]['state'] = 1
        that.setData({
          pocket: that.data.pocket
        })
        //检查是不是所有发票全都查验完成
        for (var i = 0; i < that.data.checked.length; i++) {
          if (that.data.checked[i] && !that.data.pocket[data['index']]['state']) {
            return
          }
        }
        //还原选框状态
        for (var i = 0; i < that.data.checked.length; i++) {
          that.data.checked[i] = false
        }
        that.setData({
          checked: that.data.checked,
        })
        wx.hideLoading()
        wx.showToast({
          title: '完成',
          icon: 'success',
        })
      }
      //统计表生成成功
      else if (data['cmd'] == 205) {
        wx.hideLoading()
        wx.showToast({
          title: '完成',
          icon: 'success',
        })
        //初始化选框列表
        that.setData({
          checked: [],
        })
      }
      //在此添加后续指令
    })
  }, //end onShow
})