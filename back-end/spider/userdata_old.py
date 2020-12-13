import pymongo

class DB():
    """
    处理用户相关的数据
    """
    def __init__(self,openid):
        """
        查找openid（创建用户）
        """
        client=pymongo.MongoClient(host='localhost',port=27017)
        db=client.invoice
        users=db.users
        res=users.find_one({'openid':openid})
        if res==None:
            users.insert_one({'openid':openid,'invoices':[],'email':''})
        self.openid={'openid':openid}
        self.users=users
        self.invoices=db.invoices
    
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

    def check_email(self):
        """
        检查用户是否绑定过邮箱
        """
        res=self.users.find_one(self.openid)['email']
        if res=='':
            return False
        else:
            return res

    def add_invoice(self,fp_hm):
        """
        接收发票号码，添加发票到用户的发票夹
        """
        #抓取发票夹字典
        invoices=self.users.find_one(self.openid)['invoices']
        #添加记录
        invoices.append(fp_hm)
        data={'invoices':invoices}
        self.update(data)

    def new_invoice(self,data):
        """
        添加发票到发票库
        数据包包括：fp_zl fp_dm fp_hm kp_rq kp_je jy pic_base64（二进制） 
        """
        self.invoices.insert_one(data)

    def search_invoice(self,fp_hm):
        """
        通过发票号码在发票库中查找发票，如果有返回发票字典，若无返回false
        """
        res=self.invoices.find_one({'fp_hm':fp_hm})
        if res==None:
            return False
        else:
            return res

    def get_invoices_fromcase(self):
        """
        获取用户发票夹中所有发票的发票号码，列表形式返回
        """
        return self.users.find_one(self.openid)['invoices']

    def get_invoices_fromwarehouse(self,items):
        """
        接收发票号码列表，返回全部发票信息列表
        """
        res=[]
        for item in items:
            res.append(self.invoices.find_one({'fp_hm':item}))
        return res