import pymongo
# from bson.objectid import ObjectId
class DB():
    """
    处理用户相关的数据
    """
    def __init__(self,openid,mongohost):
        """
        查找openid（创建用户）
        """
        client=pymongo.MongoClient(host=mongohost,port=27017)
        db=client.invoice
        users=db.users
        self.users=users
        self.invoices=db.invoices
        self.openid={'openid':openid}
    def find_and_insert_openid(self,openid):
        """
        接收openid,根据openID插入用户信息
        """
        res=self.users.find_one(self.openid)
        if res==None:
            self.users.insert_one({'openid':openid,'invoices':[],'email':'None','vip':5})
            return False
        return True
    def update(self,data):
        """
        内部函数，用于更新用户数据
        """
        self.users.update_one(self.openid,{'$set':data})
    
    def set_email(self,address):
        """
        设定用户的邮箱
        """
        data={'email':address}
        self.update(data)
    def check_vip(self):
        """
        检查用户是否是VIP客户
        """
        vip_mode=self.users.find_one(self.openid)['vip']
        return vip_mode
    def check_avatar_and_nickname(self):
        user_data=self.users.find_one(self.openid)
        avatar=user_data.get('avatar')
        nickName=user_data.get('nickName')
        if avatar==None and nickName==None:
            return None
        else:
            return {'avatar':avatar,'nickName':nickName}
    def check_email(self):
        """
        检查用户是否绑定过邮箱
        """
        res=self.users.find_one(self.openid)['email']
        return res

    def add_invoice(self,fp_dm,fp_hm):
        """
        接收发票号码发票代码，添加发票到用户的发票夹
        """
        #抓取发票夹字典
        info=self.users.find_one(self.openid)
        if not (info ==  None):
            invoices = info['invoices']
        if fp_dm+fp_hm not in invoices:
            #添加记录
            invoices.append(fp_dm+fp_hm)
            data={'invoices':invoices}
            self.update(data)

    def update_invoice(self,invo):
        self.invoices.update_one({"fp_dm":invo["fp_dm"],"fp_hm":invo["fp_hm"]},{'$set':invo})
    
    def new_invoice(self,data):
        """
        添加发票到发票库
        数据包包括：fp_zl fp_dm fp_hm kp_rq kp_je jy  
        """
        res=self.search_invoice(data['fp_dm'],data['fp_hm'])
        if res==None:
            self.invoices.insert_one(data)
            data.pop('_id')

    def search_invoice(self,fp_dm,fp_hm):
        """
        通过发票号码发票代码在发票库中查找发票，如果有返回发票字典，若无返回false
        """
        res=self.invoices.find_one({'fp_hm':fp_hm,'fp_dm':fp_dm})
        if res==None:
            return None
        else:
            res.pop('_id')
            return res

    def get_invoices_fromwarehouse(self):
        """
        返回全部发票信息列表
        """
        items = self.users.find_one(self.openid)['invoices']
        if items == None:
            return {'pocket':[]}
        res=[]
        for item in items:
            fp_dm = item[:12]
            fp_hm = item[12:]
            result = self.search_invoice(fp_dm,fp_hm)
            try:
                result.pop('_id')
                result.pop('pic_base64')
            except:
                pass
            res.append(result)
        res_dict = {'pocket':res[-1::-1]}
        return res_dict
    def search_invoice_from_user(self,fp_dm,fp_hm):
        """
        通过发票号码发票代码在user表中查找发票，如果有返回发票列表，若无返回false
        """
        invoices = self.users.find_one(self.openid)['invoices']
        if fp_dm+fp_hm in invoices:
            return invoices
        else:
            return False
    def delete_invoice_from_user(self,fp_dm,fp_hm):
        """
        通过发票号码发票代码在user表中删除发票
        """
        invoices=self.search_invoice_from_user(fp_dm,fp_hm)
        #删除记录
        invoices.pop(invoices.index(fp_dm+fp_hm))
        data={'invoices':invoices}
        self.users.update_one(self.openid,{'$set':data})
    def subtract_one(self):
        """
        通过openid在user表中vip字段减1
        """
        data = self.users.find_one(self.openid)
        if data['vip']:
            data['vip'] -= 1 
            # print(data['vip'])
            self.users.update_one(self.openid,{'$set':data})
        else:
            pass 

