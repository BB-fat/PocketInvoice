import requests
import json
import base64
from bs4 import BeautifulSoup
from selenium import webdriver
from API.chinese import digital_to_chinese
from API.compress import size
import datetime
import os
from threading import Thread

class Data():
    """快速查验"""

    def __init__(self, invoice):
        """传入发票信息字典，初始化对象"""
        self.invoice = invoice

    def API(self):
        """通过API查询并返回发票信息，返回字典"""
        host = 'https://fapiao.market.alicloudapi.com/invoice/query'
        appcode = '71c19cc49eb84f1f8e3883fdc1066761'
        querys = 'fpdm='+self.invoice['fp_dm']+'&fphm='+self.invoice['fp_hm']+'&kprq=' +self.invoice['kp_rq']+'&checkCode='+self.invoice['jy'][-6:] +'&noTaxAmount='+self.invoice['kp_je']
        url = host+'?'+querys
        headers = {
            'Authorization': 'APPCODE '+appcode
        }
        response = requests.get(url, headers=headers)
        #生成日志
        with open(r'C:\Users\Administrator\Desktop\invoice\API\logs'+'\\'+self.invoice['fp_hm']+'.txt','w') as f:
            f.write(response.text)
        self.invoice = json.loads(response.text)
        return self.invoice

    def findnode(self, nodename):
        """内部函数，查找节点，渲染用"""
        # if nodename=='查验次数':
        #     return self.soup.find(id="cycs")
        if nodename == 'time':
            return self.soup.find(id="cysj")
        elif nodename == 'fplx':
            return self.soup.find(id="fpcc_dzfp")
        elif nodename == 'fpdm':
            return self.soup.find(id="fpdm_dzfp")
        elif nodename == 'fphm':
            return self.soup.find(id="fphm_dzfp")
        elif nodename == 'kprq':
            return self.soup.find(id="kprq_dzfp")
        elif nodename == 'code':
            return self.soup.find(id="jym_dzfp")
        elif nodename == 'num':
            return self.soup.find(id="sbbh_dzfp")
        elif nodename == 'gfMc':
            return self.soup.find(id="gfmc_dzfp")
        elif nodename == 'gfNsrsbh':
            return self.soup.find(id="gfsbh_dzfp")
        elif nodename == 'gfContact':
            return self.soup.find(id="gfdzdh_dzfp")
        elif nodename == 'gfBank':
            return self.soup.find(id="gfyhzh_dzfp")
        elif nodename == 'goodsamount':
            return self.soup.find(id="je_dzfp")
        elif nodename == 'taxamount':
            return self.soup.find(id="se_dzfp")
        elif nodename == 'SUMAMOUNT':
            return self.soup.find(id="jshjdx_dzfp")
        elif nodename == 'sumamount':
            return self.soup.find(id="jshjxx_dzfp")
        elif nodename == 'xfMc':
            return self.soup.find(id="xfmc_dzfp")
        elif nodename == 'remark':
            return self.soup.find(id="bz_dzfp").p
        elif nodename == 'xfNsrsbh':
            return self.soup.find(id="xfsbh_dzfp")
        elif nodename == 'xfContact':
            return self.soup.find(id="xfdzdh_dzfp")
        elif nodename == 'xfBank':
            return self.soup.find(id="xfyhzh_dzfp")

    def writeinfo(self):
        """渲染出html"""
        # 打开模板文件
        with open(r'C:\Users\Administrator\Desktop\invoice\API\Mould\Mould.html', encoding='utf-8') as f:
            html = f.read()
        self.soup = BeautifulSoup(html, 'lxml')
        info = self.invoice
        # 构造查验时间
        info['time'] = '查验时间：' + datetime.datetime.strftime(datetime.datetime.now(), '%Y-%m-%d %H:%M:%S')
        # 构造发票头
        info['fplx'] = info['sfMc']+info['fplxName']
        # 构造大写价税合计
        info['SUMAMOUNT'] = '⊗'+digital_to_chinese(info['sumamount'])
        # 弹出未使用的数据
        useless = ['success', 'fplxName', 'sfMc', 'sfCode',
                   'del', 'updateTime', 'quantityAmount']
        for item in useless:
            info.pop(item)
        # 加人民币符号
        info['goodsamount'] = '￥'+info['goodsamount']
        info['sumamount'] = '￥'+info['sumamount']
        info['taxamount'] = '￥'+info['taxamount']
        #删除可能的错误
        error=['isGoodsList','queryCount']
        for item in error:
            try:
                info.pop(item)
            except:
                pass
        for k, i in info.items():
            if k == 'goodsData':
                continue
            self.findnode(k).string = i
        self.soup.find(id='mf').string = ''
        for i in range(0, len(info['goodsData'])):
            new_tr = self.soup.new_tag('tr')  # 新建一个tr标签

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_left borderRight"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['name']
            new_td.append(new_span)
            new_tr.append(new_td)

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_left borderRight"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['spec']
            new_td.append(new_span)
            new_tr.append(new_td)

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_left borderRight"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['unit']
            new_td.append(new_span)
            new_tr.append(new_td)

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_right borderRight"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['amount']
            new_td.append(new_span)
            new_tr.append(new_td)

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_right borderRight"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['priceUnit']
            new_td.append(new_span)
            new_tr.append(new_td)

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_right borderRight"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['priceSum']
            new_td.append(new_span)
            new_tr.append(new_td)

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_right borderRight"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['taxRate']
            new_td.append(new_span)
            new_tr.append(new_td)

            new_td = self.soup.new_tag('td')
            new_td.attrs = {'class': "align_right"}
            new_span = self.soup.new_tag('span')
            new_span.attrs = {'class': "content_td_blue"}
            new_span.string = info['goodsData'][i]['taxSum']
            new_td.append(new_span)
            new_tr.append(new_td)

            self.soup.find(id='mf').append(new_tr)

    def getpic(self):
        """生成html文件并截图"""
        with open(r'C:\Users\Administrator\Desktop\invoice\API\Mould'+'\\'+self.invoice['fphm']+'.html', 'w', encoding='utf-8') as f:
            f.write(str(self.soup))
        #启动渲染器渲染
        #wkhtmltoimage
        os.system('im.exe '+r'C:\Users\Administrator\Desktop\invoice\API\Mould'+'\\'+self.invoice['fphm']+'.html'+' C:\\Users\\Administrator\\Desktop\\invoice\\spider\\images\\'+self.invoice['fpdm']+self.invoice['fphm']+'.png')
        print("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
        size('C:\\Users\\Administrator\\Desktop\\invoice\\spider\\images\\'+self.invoice['fpdm']+self.invoice['fphm']+'.png',1100)
        os.remove(r'C:\Users\Administrator\Desktop\invoice\API\Mould'+'\\'+self.invoice['fphm']+'.html')


def useAPI(invoice):
    """
    使用API快速查询
    传入发票信息字典："fp_dm""fp_hm""kp_je""kp_rq""jy"
    返回保准化全部信息
    """
    API = Data(invoice)
    data=API.API()
    API.writeinfo()
    API.getpic()
    return data