import md5 from "./md5.js"

//切回主页
export function goindex() {
  my.switchTab({
    url: '../index/index',
  })
}

//连接服务器
export function connect() {
  //登录使服务器获取用户openid
  my.getAuthCode({
    success(res) {
      var code = res.authCode
      var secret = md5('115' + code + 'kdfp')
      my.connectSocket({
        url: 'wss://www.wendau.com',
        header: {
          'cmd': 115,
          'code': code,
          'secret': secret,
        },
      })
    }
  }) //end login
  my.onSocketError(function() {
    my.showToast({
      content: '网络异常',
      icon: 'none',
      duration: 2000
    })
    return false
  })
}

//检查websocket连接
export function dochecksocket() {
  var t_data = JSON.stringify({
    "cmd": 100,
  })
  my.sendSocketMessage({
    data: t_data,
    success: function() {
      console.log("connected!")
      return true
    },
    fail: function() {
      console.log("reconnect!")
      return connect()
    }
  })
}

export function checksocket() {
  if (dochecksocket() == false) {
    goindex()
  }
}


//发送socket包，传入json字符串
export function sendmsg(t_data) {
  console.log('send:')
  console.log(t_data)
  my.sendSocketMessage({
    data: t_data,
    fail: function() {
      console.log("发送失败")
    }
  })
}

//检查发票信息的合法性
export function checkdata(t_data) {
  if (t_data['fp_dm'].length != 12) {
    my.showToast({
      content: '请输入正确的发票代码',
      icon: 'none',
    })
    return false
  } else if (t_data['fp_hm'].length != 8) {
    my.showToast({
      content: '请输入正确的发票号码',
      icon: 'none',
    })
    return false
  } else if (t_data['jy'].length != 20) {
    my.showToast({
      content: '请输入正确的校验码',
      icon: 'none',
    })
    return false
  }
  return true
}

//获取当前时间，格式YYYY-MM-DD
export function getNowFormatDate(i) {
  var date = new Date();
  var seperator1 = "-";
  if(i==0){
    var year = date.getFullYear();
  }else if(i==1){
    var year = date.getFullYear()-1;
  }
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

//检查邮箱绑定情况
export function checkEmail(app){
  if (app.globalData.userdata['address'] == 'None') {
    my.showToast({
      content: '请绑定邮箱',
    })
    setTimeout(function () {
      my.navigateTo({
        url: '../email/email',
      })
    }, 1000)
    return false
  }
  return true
}