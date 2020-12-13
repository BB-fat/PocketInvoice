from channels.generic.websocket import WebsocketConsumer
import json
from spider.ticket import invoice
from spider.getid import getid
import os
import base64
from threading import Thread
import time
from spider.Mysql_manage import check_ticket
from spider.Mysql_manage import insert_ticket
from spider.Mysql_manage import insert_email
from spider.Mysql_manage import search_email
from spider.sendemail import send_email
from spider.sendemail import send_verity
from spider.userdata import DB
from API.API import useAPI


def offline(openid):
    # 关联driver池
    global pool
    time.sleep(120)
    # 判断用户状态
    try:
        if pool[openid]['alive'] == False:
            # 关闭浏览器
            pool[openid]['object'].browser.quit()
            pool.pop(openid)
    except:
        pass


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # 连接
        global pool
        try:
            if pool['none'] == 'none':
                pass
        except:
            pool = {'none': 'none'}
        self.accept()
        #self.invo = invoice.invoice()
        

    def disconnect(self, close_code):
        global pool
        try:

            print(pool[self.openid]['alive'])
            pool[self.openid]['alive'] = False
            Thread(target=offline, args=(self.openid,)).start()
        except:
            self.invo.browser.close()

    def receive(self, text_data):
        global pool
        jsons = json.loads(text_data)
        
        #客户端检查网络连接
        if jsons['cmd'] == 100: #ckeck_socket
            return 0
        #接受用户连接时传入的openid
        elif jsons['cmd'] == 101: #ask_with_id
            self.openid = getid(jsons['code'])
            # 通过openid创建DB类，交互数据库操作
            self.DB = DB(self.openid)
            if (self.openid) in pool:
                self.invo = pool[self.openid]['object']
                pool[self.openid]['alive'] = True
            else:
                self.invo=invoice.invoice()
                self.invo.new_browser()
                temp_dict = {'object': self.invo, 'alive': True}
                pool[self.openid] = temp_dict

        #接受用户普通查验请求
        elif jsons['cmd'] == 102: #ask_no_verity
            # 在发票库中查找发票
            result = self.DB.search_invoice(jsons['fp_hm'])
            if(result == False):
                invo_dict = self.invo.main(jsons)
                invo_dict['cmd'] = 200 #ask_no_verity
            else:
                invo_dict = {}
                invo_dict['cmd'] = 201 #exist
                #返回用户的字典中储存的是发票的字符串base64
                invo_dict['pic_base64'] = result['pic_base64']
                #编码截图为二进制
                self.base64=base64.b64decode(bytes(result['pic_base64'], encoding="utf-8"))
                #保存发票号码用于图片命名
                self.fp_hm=result['fp_hm']
                # 将发票放入发票夹
                self.DB.add_invoice(jsons['fp_hm'])
            self.send(text_data=json.dumps(invo_dict))

        #接受客户端验证码并查验
        elif jsons['cmd'] == 103: #ask_with_verity
            invo_dict = self.invo.send_yz(jsons)
            if invo_dict['error'] == 'None':
                #编码截图为二进制
                self.base64=base64.b64decode(bytes(invo_dict['pic_base64'], encoding="utf-8"))
                #保存发票号码用于图片命名
                self.fp_hm=invo_dict['fp_hm']
                invo_dict['cmd'] = 202 #answer_snip
                self.send(text_data=json.dumps(invo_dict))
                # 将发票放入发票夹
                self.DB.add_invoice(jsons['fp_hm'])
                #弹出字典中的无关数据
                invo_dict.pop('verity_code')
                invo_dict.pop('cmd')
                invo_dict.pop('error')
                #将字典存入发票库
                self.DB.new_invoice(jsons)
            else:
                invo_dict['cmd'] = 203 #wrong_verity
                self.send(text_data=json.dumps(invo_dict))

        #更换验证码
        elif jsons['cmd'] == 104 :#'ask_change_verity':
            verity_dict = {}
            verity_dict['cmd'] = 204#'answer_with_verity'
            verity_dict['verity_code_link'] = self.invo.pic()
            verity_dict['verity_code_word'] = self.invo.color_yz()
            self.send(text_data=json.dumps(verity_dict))

        #刷新浏览器
        elif jsons['cmd'] == 105:#'refresh':
            self.invo.browser.refresh()

        #检查是否绑定过邮箱
        elif jsons['cmd'] == 106:#'bind_email':
            self.verity = send_verity(jsons['address'])
            self.address = jsons['address']
            return 0

        #检查绑定邮箱验证码
        elif jsons['cmd'] == 107:#'check_verity':
            if self.verity == jsons['verity']:
                # 验证通过,绑定邮箱
                self.DB.set_email(self.address)
                self.send(text_data=json.dumps({"cmd": 205}))
            else:
                self.send(text_data=json.dumps({"cmd": 206}))

        #发送邮件
        elif jsons["cmd"] == 108:#"send_email":
            #检查用户是否绑定过邮箱
            re = self.DB.check_email()
            if re == False:
                self.send(text_data=json.dumps({"cmd": 207}))
            else:
                send_email(re, self.base64, self.fp_hm+'.jpg')
                self.send(text_data=json.dumps({"cmd": 205}))

        #快速查询
        elif jsons["cmd"] == 109:#"fast_check":
            # 在发票库中查找发票
            result = self.DB.search_invoice(jsons['fp_hm'])
            if(result == False):
                #使用API查询发票
                invo_dict=useAPI(jsons)
                #返回结果
                invo_dict['cmd'] = 201#'exist'
                self.send(text_data=json.dumps(invo_dict))
                #编码截图为二进制
                self.base64=base64.b64decode(bytes(invo_dict['pic_base64'], encoding="utf-8"))
                #保存发票号码用于图片命名
                self.fp_hm=invo_dict['fp_hm']
                # 将发票放入发票夹
                self.DB.add_invoice(jsons['fp_hm'])
                #弹出字典中的无关数据
                invo_dict.pop('cmd')
                #将字典存入发票库
                self.DB.new_invoice(invo_dict)
            else:
                invo_dict = {}
                invo_dict['cmd'] = 201#'exist'
                #返回用户的字典中储存的是发票的字符串base64
                invo_dict['pic_base64'] = result['pic_base64']
                self.send(text_data=json.dumps(invo_dict))
                #编码截图为二进制
                self.base64=base64.b64decode(bytes(result['pic_base64'], encoding="utf-8"))
                #保存发票号码用于图片命名
                self.fp_hm=result['fp_hm']
                # 将发票放入发票夹
                self.DB.add_invoice(jsons['fp_hm'])