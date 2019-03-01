// pages/mine/mine.js
const app = getApp();
import {
  checksocket,
  sendmsg,
  checkEmail
} from "../normal.js"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pocket: [],       //发票夹
    date: 0,          //筛选月份
    shaixuan: false,  //筛选开关
    piliang: false,   //批量开关
    fun_one: 'one',   //单个发票绑定的点击函数（两种状态）
    checked: [],      //选框列表
    chooseall: false, //全选开关
  },
  //筛选按钮
  shaixuan: function() {
    //发票夹是空的或筛选结果为空时不允许切换筛选状态
    if (this.data.pocket == '') {
      return
    } else if (this.data.shaixuan) {
      this.setData({
        shaixuan: false,
        scroll_height: this.data.scroll_height + this.data.windowHeight * 0.08,
      })
    } else {
      this.setData({
        shaixuan: true,
        scroll_height: this.data.scroll_height - this.data.windowHeight * 0.08,
      })
    }
  },
  //批量按钮
  piliang: function() {
    //发票夹为空时不能打开批量
    if (this.data.pocket == '') {
      return
    }
    if (this.data.piliang) {
      var temp = this.data.checked
      for (var i = 0; i < temp.length; i++) {
        temp[i] = false
      }
      //关闭批量
      this.setData({
        piliang: !this.data.piliang,
        fun_one: 'one',
        checked: temp,
        scroll_height: this.data.scroll_height + this.data.windowHeight * 0.08,
        chooseall: false,
      })
    }
    //打开批量 
    else {
      this.setData({
        piliang: !this.data.piliang,
        fun_one: 'changecheckbox',
        scroll_height: this.data.scroll_height - this.data.windowHeight * 0.08,
      })
    }
  },

  //恢复显示全部
  all: function() {
    this.setData({
      date: 0
    })
    var t_data = JSON.stringify({
      "cmd": 111,
      "date": this.data.date,
    })
    sendmsg(t_data)
  },

  //时间筛选模块
  changedate: function(e) {
    this.setData({
      date: e.detail['value']
    })
    console.log('changedate:' + this.data.date)
    var t_data = JSON.stringify({
      "cmd": 111,
      "date": this.data.date,
    })
    sendmsg(t_data)
  },

  //进入一张发票的result页
  one: function(e) {
    //向result界面传送发票数据
    var data = JSON.stringify(this.data.pocket[e.currentTarget.dataset.id])
    wx.navigateTo({
      url: '../result/result?data=' + data,
    })
  },

  //点击选框
  changecheckbox: function(e) {
    wx.vibrateShort() //选择一张震动
    var temp = this.data.checked
    temp[e.currentTarget.dataset.id] = !temp[e.currentTarget.dataset.id]
    //更新选择状态
    this.setData({
      checked: temp
    })
  },

  //批量查验
  checkall: function() {
    //检查vip状态
    if(app.globalData.userdata['vip']==0){
      wx.showModal({
        title: '温馨提示',
        content: '您的批量查验额度已用完，是否充值？',
        confirmText:"立刻充值",
        confirmColor:"#368299",
        success:function(res){
          if(res.confirm){
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
  deleteall: function(e) {
    var that = this
    var t_data = {
      'cmd': 113,
      'list': []
    }
    var temp=[]//用以储存删除后的选框状态列表
    //生成已选信息列表
    for (var i = 0; i < that.data.checked.length; i++) {
      if (that.data.checked[i]) {
        t_data['list'].push(that.data.pocket[i]['fp_dm'] + that.data.pocket[i]['fp_hm'])
      }else{
        temp.pop(false)   //重设选中状态
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
            piliang: false,
            scroll_height: that.data.scroll_height + that.data.windowHeight * 0.08,
            fun_one: 'one',
            checked:temp    //还原选择状态列表
          })
        }
      }
    })
  },

  //生成统计表
  excel: function() {
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

  //全选
  chooseall: function() {
    if (!this.data.chooseall) {
      for (var i = 0; i < this.data.checked.length; i++) {
        this.data.checked[i] = true
      }
    } else {
      for (var i = 0; i < this.data.checked.length; i++) {
        this.data.checked[i] = false
      }
    }
    this.setData({
      checked: this.data.checked,
      chooseall: !this.data.chooseall
    })
  },

//全选已查验过的发票
  choosechecked:function(){
    for(var i=0;i<this.data.pocket.length;i++){
      if(this.data.pocket[i]['state']==1){
        this.data.checked[i]=true
      }else{
        this.data.checked[i]=false
      }
    }
    this.setData({
      checked:this.data.checked,
      chooseall:true
    })
  },

//全选未查验的发票
  chooseunchecked:function(){
    for (var i = 0; i < this.data.pocket.length; i++) {
      if (this.data.pocket[i]['state'] == 0) {
        this.data.checked[i] = true
      } else {
        this.data.checked[i] = false
      }
    }
    this.setData({
      checked: this.data.checked,
      chooseall: true
    })
  },

  onLoad: function() {
    this.setData({
      windowHeight: app.globalData.windowHeight
    })
    wx.showLoading({
      title: '加载中',
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    //初始化各种状态
    this.setData({
      pocket: this.data.pocket,
      date: 0,
      shaixuan: false,
      piliang: false,
      scroll_height: this.data.windowHeight * 0.92,
      fun_one: 'one',
      checked: [],
      chooseall: false,
    })
    var t_data = JSON.stringify({
      "cmd": 111,
      "date": this.data.date,
    })
    sendmsg(t_data)
    wx.onSocketMessage(function(res) {
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
            'pocket': data['pocket']
          })
          for (var i = 0; i < Object.keys(data['pocket']).length; i++) {
            that.data.checked[i] = false
          }
        }
      }
      //更新批量查验的结果
      else if (data['cmd'] == 209) {
        //减少批量查验额度
        app.globalData.userdata['vip'] = app.globalData.userdata['vip']-1
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
        //还原页面状态
        that.setData({
          checked: that.data.checked,
          piliang: false,
          scroll_height: that.data.scroll_height + that.data.windowHeight * 0.08,
          fun_one: 'one',
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
        //初始化各种状态
        that.setData({
          date: 0,
          shaixuan: false,
          piliang: false,
          scroll_height: that.data.windowHeight * 0.92,
          fun_one: 'one',
          checked: [],
          chooseall: false,
        })
      }
      //在此添加后续指令
    })
  },//end onShow

  onPullDownRefresh:function(){
    var t_data = JSON.stringify({
      "cmd": 111,
      "date": this.data.date,
    })
    sendmsg(t_data)
  },
})