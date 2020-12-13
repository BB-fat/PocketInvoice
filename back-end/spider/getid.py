import requests
import json
# from alipay.aop.api.DefaultAlipayClient import DefaultAlipayClient
# from alipay.aop.api.request.AlipaySystemOauthTokenRequest import AlipaySystemOauthTokenRequest 
# from alipay.aop.api.AlipayClientConfig import AlipayClientConfig

def Wgetid(code):
    appid='wx6c0281a98ee67ef9'
    secret='704af7eba1cbfc43bcb17e7f39133240'
    grant_type='authorization_code'
    data={}
    data['appid']=appid
    data['secret']=secret
    data['grant_type']=grant_type
    data['js_code']=code
    r=requests.get('https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&grant_type='+grant_type+'&js_code='+code)
    return(json.loads(r.text)['openid'])

# def Agetid(code_id):
# 	"""
# 	接收前段授权码,返回唯一用户id-user_id
# 	"""
# 	alipay_client_config = AlipayClientConfig()
# 	alipay_client_config.server_url = 'https://openapi.alipay.com/gateway.do'
# 	alipay_client_config.app_id = '2019020263223067'
# 	alipay_client_config.app_private_key = 'MIIEpQIBAAKCAQEA0o8CRXcxW7bhMPB0X38zmYdSK4Ibq1/4MBLP3VA7VxCW7nWVTuPQHXWe3yVRvkgNE/Z89EKpuiN1muNJh6gNU21zNwwf7Wb75dsUoxzSz8m7sCkUOcR0ZzY+Dy5q/DAeViGfNLpulMRn+FJDRPtssabkRAgJEsdibjDTyi+joSSp1lkw/YQR01qouObXKtc5F92RZxIj1YddwKtyxlB0cto4j9F/b0OQdFk5t8se6lz1tpvSFzOFYLMVsrjLxnvDPZfIa3Ix6KcL90/XYjuBP+rsxF7wsKnQL9wcWOdgQhbT+ngHyjfQBed9w/M1JTnwZ0XXSUcql1wEGXSKfboCrQIDAQABAoIBAQC+BA7xr4IcmWqZ5rWupLVlPOibmPvtaVspzyBFQi17Ad6jbfuDSTW8EDSCfkRJqu4acNwM9sgC0hNE5w6pXLBB9MkACXIapVB3+4ChPtbEa/J0JG47P54ospvIyYQE+Eu4QPlS9Vfr619EisBoVVme7NSczH+bsdGTTX8jvGA3f6K1s0kz0bAjeDP2MWGl1TvgQbpyQudWHodMsoF9FN7auSYWrlfuUHqTU5wrJmzox5hjG/XiXqFit4Vjh+PMGR5xYMLiOtVfJ+FwogOMP8rGUujdoz/m4dzd06ZasiBTRkV8MQy0MbKgdTGrHkPycjMn4fsyF4DslaOka8m0UaDFAoGBAOjLlywxjvuGOQjFOPfrHA0x9Oz23MeQtHgHzMeTz96pKKTt4E11njkUSgop0KTXacPvD8NGXfpvWnQXsoY/eMZY8l5PFf8PddFxQ9MS41SuxN5sv3pSenTNp3gt472ZMTo4+8695PiwnHju4tmafZR5FTz5tdZ7Gs28iL0SIM9DAoGBAOeL/Ua15UDwykc/EkWqGrYR8JzErW0GOuaKDKHXQqzKjhV4hEHlmDI3SdflIC6dUi63WBO5C/8JJiSuRIxrYzmnhK+Fw7Uj8J+Ptv7tsTK1Z8z4lOp0AqCegyRb8P8vEaKpbfPHOeR6ZugkRXEiOmBPfUtusNty7itUUqazlG9PAoGAK5hc0hDh1uaW7baJaZwk36+4T1wXkmPd+BB13/YlWmxRSTmm5LqfC89p4idchFI241N0nzwhQ1HxHYaGjy95vaNQmCq1UtOhW7ybV/7UhbpI8eJppU2m0xLkRtRJLutuVZnwRhI3u/7O/rK11sxgshpOyOF2lRjutxKUhNvNOyMCgYEA3IfdRAKsheyQi8kLiyRXan+trnI4RzV+1eI349DU5SPKrbJqLSUSjwlPoHvO6fbWtj3Ten1taot5M8hy61bAW8IsQsxhON4xKJfFkAotEgHrCjLcCm1Rr08p0nBrGXDoGAfM/DkM74qRBpq9NOKHvQEYccbMVUaihsw6KCGzx0sCgYEAs+Cnw+IIqzzvn1WIshGre3UF4WaBwEZS/P79h3yyIrGwG9wkSgUZEZgAk2uSiP/Mfi7IsPpQ7O/ikT2dZcP5H96amj7CF0lpk5R1rTh2lpKXce9Zaigz3k3oPHeTZYU2yQFzUgYkfIyDGGmIN4f0JYkbg7VX0Lcq4mMiuQGjitY='
# 	alipay_client_config.alipay_public_key = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnuRua01KUdGHpnFsi2Qz/36sd5N1rLqX1gMAXBn541nA1lzvsVetOcbTbhauIyDMD4pkjN9nzp9gkTHkh0AWKFcVMUTdVs0A3Px89OUKTy1O8JdcfgSnO1fP6XcgA8oV9JJmCdpUdQyncQbbKklfYy4mPboYoCD8AHEiPvF7+0vFKbpNRWDr6n2g8h4rfGE6T03M/QYsgyjJeDlosLHBL70gYCO5oEuvMYZ1Fj3mnZu5kf/MhMhPMNBS8BcJKhAzkQidDRVxXpc2oOgV7UVmyd/GRyCoM3qFZ/27kwor0WiHA5GuGrgdeat6QND0TCmo8Eh6JBW/ISshD+dPWR2YbwIDAQAB'
# 	AlipayClient = DefaultAlipayClient(alipay_client_config)
# 	request = AlipaySystemOauthTokenRequest()
# 	request.grant_type='authorization_code'
# 	request.code = code_id
# 	user_info_dict = AlipayClient.execute(request)
# 	return (json.loads(user_info_dict)['user_id'])