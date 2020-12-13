from channels.generic.websocket import WebsocketConsumer
import json
from spider.ticket import invoice
from spider.getid import *
from spider.kindsof import kindsof
from spider.identify import identify
import os
import base64
from threading import Thread
import time
from spider.sendemail import send_email
from spider.sendemail import send_verity
from spider.userdata import DB
from API.API import useAPI
from spider.excel import excel
import copy



def offline(openid):
    # 关联driver池
    global pool
    time.sleep(60)
    # 判断用户状态
    try:
        if pool[openid]['alive'] == False:
            # 关闭浏览器
            pool[openid]['object'].browser.quit()
            print("CLOSE")
            pool.pop(openid)
    except:
        pass



class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # 连接
        global pool
        if identify(self.scope)==True:
            self.accept()
            try:
                if pool['none'] == 'none':
                    pass
            except:
                pool = {'none': 'none'}
            '''
            微信小程序用户
            '''
            if int(dict(self.scope['headers'])[b'cmd'].decode('utf-8')) == 101: #ask_with_id
                # 通过openid创建DB类，交互数据库操作
                self.openid = Wgetid(dict(self.scope['headers'])[b'code'].decode('utf-8'))
                self.DB = DB(self.openid,'localhost')
            # '''
            # 支付宝小程序用户
            # '''
            # if int(dict(self.scope['headers'])[b'cmd'].decode('utf-8')) ==115:
            # # 通过openid创建DB类，交互数据库操作
            #     self.openid = Agetid(dict(self.scope['headers'])[b'code'].decode('utf-8'))
            #     self.DB = DB(self.openid,'39.105.217.150')
            first_using = self.DB.find_and_insert_openid(self.openid)
            user_mode={'cmd':210,'address':self.DB.check_email(),'vip':self.DB.check_vip()}
            #用户第一次访问
            if not first_using:
                user_mode['welcome']=True
            else:
                user_mode['welcome']=False
            self.send(json.dumps(user_mode))
            
        #尝试捡回线程
        try:
            if (self.openid) in pool:
                self.invo = pool[self.openid]['object']
                pool[self.openid]['alive'] = True
        except:
            print("connect，捡回线程失败")
        
    def disconnect(self, close_code):
        global pool
        try:
            print('openid alive:',pool[self.openid]['alive'])
            pool[self.openid]['alive'] = False
            #线程开始计时
            Thread(target=offline, args=(self.openid,)).start()
        except:
            pass

    def receive(self, text_data):
        """
        线程池变量
        """
        global pool

        jsons = json.loads(text_data)
        
        #客户端检查网络连接
        if jsons['cmd'] == 100: #ckeck_socket
            return 0
           
        #发票夹存入数据
        elif jsons['cmd']==110:
            temp_dict=copy.deepcopy(jsons)
            #kindsof 失败意味着fp_dm错误
            if kindsof(temp_dict)==None:
                self.send(text_data=json.dumps({'cmd':206}))
            else:
                res = self.DB.search_invoice(jsons['fp_dm'],jsons['fp_hm'])
                if res==None:
                    jsons['state'] = 0
                    jsons.pop('cmd')
                    self.DB.new_invoice(jsons)
                    self.DB.add_invoice(jsons['fp_dm'],jsons['fp_hm'])
                else:
                    search_res = self.DB.search_invoice_from_user(jsons['fp_dm'],jsons['fp_hm'])#检查user表里有没有这张发票
                    if not search_res:
                        self.DB.add_invoice(jsons['fp_dm'],jsons['fp_hm'])
                self.send(text_data=json.dumps({'cmd':205}))

           
        #数据库取出数据，显示在发票夹中
        elif jsons['cmd']==111:
            All_invoices_info_dict = self.DB.get_invoices_fromwarehouse()
            result_list = []
            result_dict = All_invoices_info_dict.copy()
            if All_invoices_info_dict['pocket']:
                #if jsons['date'] == 0:
                for info in All_invoices_info_dict['pocket']:
                    if info['state']==1:
                        info.pop("data")
                    result_list.append(kindsof(info))  
            result_dict['pocket'] = result_list
            result_dict['cmd']=208
            self.send(text_data=json.dumps(result_dict))

        #返回单张发票的详细信息
        elif jsons['cmd']==116:
            result=self.DB.search_invoice(jsons['key'][:12],jsons['key'][12:])
            result['cmd']=212
            self.send(text_data=json.dumps(result))
        #接受用户普通查验请求
        elif jsons['cmd'] == 102: #ask_no_verity
            # 在发票库中查找发票
            result = self.DB.search_invoice(jsons['fp_dm'],jsons['fp_hm'])
            if result == None or result['state']==0:
                #根据ID放入线程池
                try:
                    if (self.openid) in pool:
                        self.invo = pool[self.openid]['object']
                        pool[self.openid]['alive'] = True
                    else:
                        self.invo=invoice.invoice()
                        self.invo.new_browser()
                        print("浏览器")
                        temp_dict = {'object': self.invo, 'alive': True}
                        pool[self.openid] = temp_dict
                except:
                    print('普通查验，捡回线程失败')
                #在查验之前首先记录下发票基本信息
                jsons.pop('cmd')
                self.invo.data_hold=copy.deepcopy(jsons)
                #执行操作
                back_send_dict = self.invo.main(jsons)
                if back_send_dict.get('error')==None:
                    back_send_dict['cmd'] = 200 #ask_no_verity
                else:
                    back_send_dict['cmd']=206
            else:
                back_send_dict = {'fp_dm':result['fp_dm'],'fp_hm':result['fp_hm']}
                back_send_dict['cmd'] = 201 #exist
                back_send_dict['state']=1
                #保存发票号码用于图片命名
                self.fp_hm = back_send_dict['fp_hm']
                self.fp_dm = back_send_dict['fp_dm']
                # 将发票放入发票夹
                self.DB.add_invoice(back_send_dict['fp_dm'],back_send_dict['fp_hm'])
            self.send(text_data=json.dumps(back_send_dict))

        #接受客户端验证码并查验
        elif jsons['cmd'] == 103: #ask_with_verity
            temp_dict=copy.deepcopy(self.invo.data_hold)
            temp_dict['verity_code']=jsons['verity_code']
            all_data = self.invo.send_yz(temp_dict)
            if all_data['error'] == 'None':
                #刷新浏览器
                self.invo.browser.refresh()
                #保存发票号码用于图片命名
                self.fp_hm=self.invo.data_hold['fp_hm']
                self.fp_dm=self.invo.data_hold['fp_dm']
                #弹出字典中的无关数据
                all_data.pop('error')
                all_data.pop('verity_code')
                # 将发票放入发票夹
                all_data['state']=1
                self.DB.add_invoice(self.invo.data_hold['fp_dm'],self.invo.data_hold['fp_hm'])
                self.DB.update_invoice(all_data)
                #将字典存入发票库
                self.DB.new_invoice(all_data)
                back_send_dict={'fp_dm':self.fp_dm,'fp_hm':self.fp_hm}
                back_send_dict['cmd'] = 202 #answer_snip
                back_send_dict['state']=1
                self.send(text_data=json.dumps(back_send_dict))
            else:
                #wrong_verity
                back_send_dict={'cmd':203,'error':all_data['error']}
                self.send(text_data=json.dumps(back_send_dict))


        #利用API批量快查发票    
        elif jsons['cmd']==112:
            #接受一个列表，列表中数据由fp_dm+fp_hm组成
            for each in jsons['list']:
                result_fast=self.DB.search_invoice(each[:12],each[12:])
                #发票序号
                num=jsons['list'].index(each)
                #若没有查验过
                if (result_fast['state']==0):
                    result_fast['data']=useAPI(result_fast)
                    result_fast['state']=1
                    #更新发票状态
                    self.DB.update_invoice(result_fast)
                    self.DB.subtract_one() #vip减1
                    self.send(text_data=json.dumps({"cmd":209,"index":num}))
                else:
                    self.send(text_data=json.dumps({"cmd":209,"index":num}))
                    
        #接收客户端发票list,批量删除发票
        elif jsons['cmd']==113:
            for each in jsons['list']:
                num=jsons['list'].index(each)
                try:
                    self.DB.delete_invoice_from_user(each[:12],each[12:])
                except:
                    pass
                final = self.DB.get_invoices_fromwarehouse()
                for item in final['pocket']:
                    if item.get('data')!=None:
                        item.pop('data')
                    item=kindsof(item)
                final["cmd"] = 208
                self.send(text_data=json.dumps(final))
        #更换验证码
        elif jsons['cmd'] == 104 :
            verity_dict = {}
            verity_dict['cmd'] = 204
            verity_dict['verity_code_link'] = self.invo.pic()
            verity_dict['verity_code_word'] = self.invo.color_yz()
            self.send(text_data=json.dumps(verity_dict))

        #绑定邮箱
        elif jsons['cmd'] == 106:#'bind_email':
            self.verity = send_verity(jsons['address'])
            self.address = jsons['address']

        #检查绑定邮箱验证码
        elif jsons['cmd'] == 107:#'check_verity':
            if self.verity == jsons['verity']:
                # 验证通过,绑定邮箱
                self.DB.set_email(self.address)
                self.send(text_data=json.dumps({"cmd": 205}))
            else:
                self.send(text_data=json.dumps({"cmd": 206}))

        #发送图片邮件
        elif jsons["cmd"] == 108:#"send_email":
            address = self.DB.check_email()
            with open("C:\\Users\\Administrator\\Desktop\\invoice\\spider\\images\\"+jsons['fp_dm']+jsons['fp_hm']+".png","rb") as f:
                pic_data=f.read()
            send_email(address, pic_data, jsons['fp_hm']+jsons['fp_dm']+'.png')
            self.send(text_data=json.dumps({"cmd": 205}))

        #发送EXCLE邮件
        elif jsons['cmd']==114:
            #初始化excle()类
            ex=excel(self.openid)
            #计算数据数量，便于计算插入位置
            lenght=len(jsons['list'])
            #插入表格
            move_lenght=0
            for each in jsons['list']:
                #查询完整信息
                result=self.DB.search_invoice(each[:12],each[12:])
                #序号
                num=jsons['list'].index(each)
                #插入信息
                if result:
                    move_lenght+=ex.insert_data(kindsof(result),num,move_lenght)
            #保存文件
            ex.over_xlsx(lenght+move_lenght)
            address = self.DB.check_email()
            with open("C:\\Users\\Administrator\\Desktop\\invoice\\spider\\xlsx\\"+self.openid+".xlsx","rb") as f:
                xlsx_data=f.read()
            send_email(address, xlsx_data, 'invoice paper.xlsx')#命名不能使用英文
            self.send(text_data=json.dumps({"cmd": 205}))

        #过快点击时补救
        elif jsons['cmd']==115:
            user_mode={'cmd':210,'address':self.DB.check_email(),'vip':self.DB.check_vip()}
            self.send(json.dumps(user_mode))

        #更新用户昵称、头像数据
        elif jsons['cmd']==117:
            jsons.pop('cmd')
            self.DB.update(jsons)
        #获取用户昵称、头像数据
        elif jsons['cmd']==118:
            avatar_and_nickname=self.DB.check_avatar_and_nickname()
            if avatar_and_nickname==None:
                self.send(json.dumps({'cmd':214}))
            else:
                avatar_and_nickname['cmd']=213
                self.send(json.dumps(avatar_and_nickname))
                 

