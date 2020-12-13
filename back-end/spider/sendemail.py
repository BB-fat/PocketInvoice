import smtplib
from email.header import Header 
from email.mime.text import MIMEText 
from email.mime.multipart import MIMEMultipart
import random

#pic是图片的二进制
def make_email(pic,name):
	message = MIMEMultipart()
	#发送者
	message['From'] ='口袋发票'
	#标题
	message['Subject'] = Header('您的发票！', 'utf-8')
	#正文
	message.attach(MIMEText('请你查收发票！', 'plain', 'utf-8'))
	att = MIMEText(pic, 'base64', 'utf-8')
	att["Content-Type"] = 'application/octet-stream'
	att["Content-Disposition"] = 'attachment; filename="'+name+'"'
	message.attach(att)
	return message.as_string()

#发送图片邮件
def send_email(target,pic_data,pic_name):
	smtp=smtplib.SMTP_SSL('smtp.qq.com',465)
	username='1056871944@qq.com'
	password='snjpnnztwsnxbbbf'
	smtp.login(username, password)
	receiver=target
	email=make_email(pic_data,pic_name)
	smtp.sendmail(username, receiver, email)
	smtp.quit()


#生成并发送验证码
def send_verity(target):
	smtp=smtplib.SMTP_SSL('smtp.qq.com',465)
	username='1056871944@qq.com'
	password='snjpnnztwsnxbbbf'
	smtp.login(username, password)
	receiver=target
	verity=random.randint(100000,999999)
	message = MIMEMultipart()
	#标题
	message['Subject'] = Header('口袋发票验证码', 'utf-8')
	#正文
	message.attach(MIMEText(str(verity), 'plain', 'utf-8'))
	smtp.sendmail(username, receiver,message.as_string())
	smtp.quit()
	return str(verity)
