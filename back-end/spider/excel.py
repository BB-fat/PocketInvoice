import xlsxwriter as xww
import re
class excel():
    def __init__(self,name):
        self.workbook=xww.Workbook('C:\\Users\\Administrator\\Desktop\\invoice\\spider\\xlsx\\'+name+'.xlsx')
        self.sum=0
        self.title=self.workbook.add_format(
            {
            'bold':True,#字体加粗
            'align':'center',#水平位置设置：居中
            'valign':'vcenter',#垂直位置设置，居中
            'font_size':20,#'字体大小设置'
            'font_name':'Courier New',#字体设置
            }
        )
        self.item=self.workbook.add_format(
            {
                    
            'bold':True,#字体加粗
            'align':'center',#水平位置设置：居中
            'valign':'vcenter',#垂直位置设置，居中
            'font_name':'Courier New',#字体设置
            }
        )
        self.node=self.workbook.add_format(
            {
                'font_size':10,
                'font_color':'#ff0000',
                'align':'left',
                'valign':'vcenter',

            }
        )
        self.worksheet=self.workbook.add_worksheet('Sheet1')
        self.worksheet.merge_range("A1:H3","发票出纳总账目单",self.title)
        self.worksheet.write("A4","序号",self.item)
        self.worksheet.write("B4","发票代码",self.item)
        self.worksheet.write("C4","发票号码",self.item)
        self.worksheet.write("D4","开票日期",self.item)
        self.worksheet.write("E4","开票金额",self.item)
        self.worksheet.write("F4","查验时间",self.item)
        self.worksheet.write("G4","发票抬头",self.item)
        self.worksheet.write("H4","销售方信息",self.item)
        self.worksheet.write("I4","商品属性",self.item)
        self.worksheet.write("J4","商品数量",self.item)
        self.worksheet.write("K4","其他信息",self.item)
        self.worksheet.set_column('B:E',25)  
        self.worksheet.set_column('F:H',32)
        self.worksheet.set_column('I:I',20)
        self.worksheet.set_column('K:K',100)  
        #self.workbook.close()
    def insert_data(self,invoice,index,move_lenght):
        data=invoice.get("data")
        move_index=index+move_lenght
        if data!=None and len(data['goodsData'])!=1:
            data_len=len(data['goodsData'])
            self.worksheet.merge_range("A"+str(move_index+5)+":A"+str(move_index+5+data_len-1),index+1,self.item)
            self.worksheet.merge_range("B"+str(move_index+5)+":B"+str(move_index+5+data_len-1),invoice['fp_dm'],self.item)
            self.worksheet.merge_range("C"+str(move_index+5)+":C"+str(move_index+5+data_len-1),invoice['fp_hm'],self.item)
            self.worksheet.merge_range("D"+str(move_index+5)+":D"+str(move_index+5+data_len-1),invoice['kp_rq'],self.item)
            self.worksheet.merge_range("E"+str(move_index+5)+":E"+str(move_index+5+data_len-1),invoice['kp_je'][:-1],self.item)
        else:
            data_len=1
            self.worksheet.write("A"+str(move_index+5),index+1,self.item)
            self.worksheet.write("B"+str(move_index+5),invoice['fp_dm'],self.item)
            self.worksheet.write("C"+str(move_index+5),invoice['fp_hm'],self.item)
            self.worksheet.write("D"+str(move_index+5),invoice['kp_rq'],self.item)
            self.worksheet.write("E"+str(move_index+5),invoice['kp_je'][:-1],self.item)
        if data!=None:
            if len(data['goodsData'])!=1:
                self.worksheet.merge_range("F"+str(move_index+5)+":F"+str(move_index+5+data_len-1),data.get('time')[5:],self.item)
                self.worksheet.merge_range("G"+str(move_index+5)+":G"+str(move_index+5+data_len-1),data.get('gfMc'),self.item)
                self.worksheet.merge_range("H"+str(move_index+5)+":H"+str(move_index+5+data_len-1),data.get('xfMc'),self.item)
            else:
                self.worksheet.write("F"+str(move_index+5),data.get('time')[5:],self.item)
                self.worksheet.write("G"+str(move_index+5),data.get('gfMc'),self.item)
                self.worksheet.write("H"+str(move_index+5),data.get('xfMc'),self.item)
        
            for i in range(data_len):
                name=re.findall(r'\*(.*?)\*',data.get('goodsData')[i]['name'] )[0]
                self.worksheet.write("I"+str(move_index+5+i),name,self.item)
                self.worksheet.write("J"+str(move_index+5+i),data.get('goodsData')[i]['amount'],self.item)
                self.worksheet.write("K"+str(move_index+5+i),data.get('goodsData')[i]['name'] ,self.item)
        self.sum+=float(invoice['kp_je'][:-2])
        return data_len-1
    def over_xlsx(self,len):
        self.worksheet.write("D"+str(len+5),"总计金额：",self.item)
        self.worksheet.write("E"+str(len+5),float(self.sum),self.item)
        self.worksheet.merge_range("A"+str(len+7)+":H"+str(len+7),"注:未查验发票暂不提供:“查验时间”、“发票抬头”、“销售方信息”等信息",self.node)
        self.workbook.close()