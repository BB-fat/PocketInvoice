from selenium import webdriver
from urllib.request import urlretrieve
import time
import urllib
import json
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
class invoice:
    def new_browser(self):
        self.browser = webdriver.Ie()
        self.browser.set_window_size(1350,750)
        #website_link="https://inv-veri.chinatax.gov.cn/"
        #self.browser.get(website_link)
        js='window.open("https://inv-veri.chinatax.gov.cn/","","width=1350,height=750");'
        self.browser.execute_script(js)
        handles = self.browser.window_handles
        self.browser.switch_to_window(handles[1])
    def fill(self,xpaths,nums):
        number=self.browser.find_element_by_id(xpaths)
        number.send_keys(nums)  
    def fill_dm(self,nums):
        try:
            self.fill("fpdm",nums)
        #发票代码
        except:
            return "dm_error"
        
    def fill_hm(self,nums):
        try:
            self.fill("fphm",nums)
        #发票号码
        except:
            return "hm_error"
        
    def fill_kp(self,nums):
        try:
            self.fill("kprq",nums)
        #开票日期
        except:
            return "rq_error"
        
    def fill_jy(self,nums):
        try:
            self.fill("kjje",nums)
        #校验码后六位
        except:
            return "jy_error"
        
    def pic(self):
            try:
                js='document.getElementById("yzm_img").click();'
                self.browser.execute_script(js)
                try:
                    wait=WebDriverWait(self.browser,2)
                    wait.until(expected_conditions.presence_of_all_elements_located((By.ID,'popup_container')))
                    error=(self.browser.find_element_by_id("popup_message").text)
                    self.browser.find_element_by_xpath('//*[@id="popup_ok"]').click()
                    return error

                except:
                    adress=self.browser.find_element_by_xpath('//img[2]')
                    link=adress.get_attribute('src')
                    #urllib.request.urlretrieve(link,'D:\%s.jpg'%'yz')
                    return link
            except:
                return "none"
    
    def color_yz(self):
        try:
            try:
                color=self.browser.find_element_by_xpath('//*[@id="yzminfo"]/font')
                color=color.text
                tips=('请输入%s文字'%color)
            except:
                tips=('请输入所示验证码：')
            finally:
                #print(tips)
                return tips
        except:
            return "get_yzm_color_error"
        
    def main(self,jsons):
        try:
            
            try:
                self.browser.switch_to_window(jsons['handle'])
            except:
                print('eror')
                pass
            #self.new_browser()
            fpdm=(jsons['fp_dm'])
            fphm=(jsons['fp_hm'])
            kprq=(jsons['kp_rq'])
            kjje=(jsons['jy'])
            self.fill_dm(fpdm)
            self.fill_hm(fphm)
            self.fill_kp(kprq)
            self.fill_jy(kjje)
            print('2')
            links=self.pic()#导出验证码链接，如果有需要存到本地也可以，代码已经在pic函数中注释
            print('3')
            color=self.color_yz()#显示验证码颜色
            print('4')
            dict_perior={}
          
            dict_perior['verity_code_link']=links
            dict_perior['verity_code_word']=color
            print('1')
            if links=='none':
                print('5')
                jsons['handle']=self.browser.current_window_handle
                self.main(jsons)
                print('7')
             
            else :
                print('6')
                return dict_perior
        except:
            return {"error":"other errors"}


 
