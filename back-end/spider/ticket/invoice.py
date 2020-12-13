from selenium import webdriver
from urllib.request import urlretrieve
import urllib
import time
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from API.data import Data
class invoice:
    def __init__(self):
        self.data_hold={}
    def new_browser(self):
        
        # options = webdriver.FirefoxOptions()
        # options.set_headless()
        # options.add_argument('--disable-gpu')
        # self.browser=webdriver.Firefox(firefox_options=options)
        self.browser=webdriver.Chrome()
        self.browser.set_window_size(1350,750)
        website_link="https://inv-veri.chinatax.gov.cn/"
        self.browser.get(website_link)
        #self.browser.save_screenshot("2.png")
    def fill(self,xpaths,nums):
        number=self.browser.find_element_by_id(xpaths)
        number.clear()
        number.send_keys(nums)  
    def fill_dm(self,nums):
        self.fill("fpdm",nums)
        #发票代码      
    def fill_hm(self,nums):
        self.fill("fphm",nums)
        #发票号码
    def fill_kp(self,nums):
        self.fill("kprq",nums)
        #开票日期       
    def fill_jy(self,nums):
        self.fill("kjje",nums)
        #校验码后六位
    def pic(self):
            try:
                js='document.getElementById("yzm_img").click();'
                self.browser.execute_script(js)
                try:
                    #扫描错误的二维码时会出现“请输入正确发票代码、发票号码”提示，以下为了应对这种情况
                    wait=WebDriverWait(self.browser,2)
                    wait.until(expected_conditions.presence_of_all_elements_located((By.ID,'popup_container')))
                    error=(self.browser.find_element_by_id("popup_message").text)
                    self.browser.find_element_by_xpath('//*[@id="popup_ok"]').click()
                    return error
                except:
                    #未出现错误，取得验证码base64编码
                    adress=self.browser.find_element_by_xpath('//img[2]')
                    link=adress.get_attribute('src')
                    return link
            except:
                return "get_yzm_error"
    
    def color_yz(self):
        try:
            try:
                #出现颜色提示
                color=self.browser.find_element_by_xpath('//*[@id="yzminfo"]/font')
                color=color.text
                tips=('请输入%s文字'%color)
            except:
                #未出现
                tips=('请输入所示验证码：')
            finally:
                return tips
        except:
            return "get_yzm_color_error"

    def num_error(self):
        judging={"error":"none"}
        if not self.browser.find_element_by_id("fpdmjy").text==" ":
            judging["error"]="fpdm errors"
        elif not self.browser.find_element_by_id("kprqjy").text==" ":
            judging["error"]="kprq errors"
        return judging
        #hm_error=self.browser.find_element_by_id("fphmjy").text
        #dm_error=self.browser.find_element_by_id("fpdmjy").text
    def main(self,jsons):
        #执行查验前的全部操作
        try:
            #正常进入不会执行，出错递归时执行
            self.browser.switch_to_window(jsons['handle'])
        except:
            pass
            fpdm=(jsons['fp_dm'])
            fphm=(jsons['fp_hm'])
            kprq=(jsons['kp_rq'])
            kjje=(jsons['jy'][-6:])
            self.fill_dm(fpdm)
            self.fill_hm(fphm)
            self.fill_kp(kprq)
            self.fill_jy(kjje)
            probable_error=self.num_error()
            if probable_error["error"]!="none":
                return probable_error
            else:
                link=self.pic()
                #句柄丢失时导致，没有填入信息，验证码链接为"get_yzm_error"
                if(link=='get_yzm_error'):
                    jsons['handle']=self.browser.current_window_handle
                    self.main(jsons)
                else:
                    color=self.color_yz()
                    dict_perior={}
                    dict_perior['verity_code_link']=link
                    dict_perior['verity_code_word']=color
                    return dict_perior

    def wrong_return (self):
        #取回错误提示
        
        try:
            wait=WebDriverWait(self.browser,2)
            wait.until(expected_conditions.presence_of_all_elements_located((By.ID,'popup_container')))
            error=(self.browser.find_element_by_xpath('//*[@id="popup_message"]').text)
            self.browser.find_element_by_xpath('//*[@id="popup_ok"]').click()
        except:
            error="none"
        return error
    def send_yz(self,dict_later):
        #将回传验证码输入
        #try:
            yz=self.browser.find_element_by_xpath('//*[@id="yzm"]')
            yz.clear()
            yz.send_keys(dict_later['verity_code'])
            A=False
            try:
                #点击查验
                wait=WebDriverWait(self.browser,2)
                wait.until(expected_conditions.presence_of_all_elements_located((By.ID,'checkfp')))
                self.browser.find_element_by_xpath('//*[@id="checkfp"]').click()
            except:
                pass
            try:
                self.browser.implicitly_wait(2)
                iframe=self.browser.find_element_by_id('dialog-body')
                self.browser.switch_to.frame(iframe)
                A=True
            except:
                pass
            if A:
                try:
                    #可能出现不一致情况
                    wait=WebDriverWait(self.browser,2)
                    wait.until(expected_conditions.presence_of_all_elements_located((By.ID,'cyjg')))
                    error=self.browser.find_element_by_id('cyjg').text
                    self.browser.refresh()
                    dict_error={}
                    dict_error["error"]=error
                    return dict_error
                except:
                    #大功告成
                    invoice_data=Data(self.browser.page_source)
                    invoice_data.getpic()
                    dict_later['error']='None'
                    dict_later['data']=invoice_data.getdata()

                    return dict_later
            else:
                #返回错误
                error=self.wrong_return()
                dict_error={}
                dict_error['error']=error

                return dict_error
        #except:
         #   return {"error":"æŸ¥éªŒå‡ºé”™"}
