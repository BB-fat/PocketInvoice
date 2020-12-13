
def kindsof(diction):
    import pymongo
    client=pymongo.MongoClient(host='localhost',port=27017)
    db=client.city
    citys=db.citys
    fp_dm = diction['fp_dm'][1:5]+"00"
    city=citys.find_one({"dm":fp_dm})
    invoice_type={"10":"增值税电子普通发票","04":"增值税普通发票","01":"增值税专用发票"}
    if city==None:
        return None
    else:
        if diction.get('fp_qz')==None:
            diction['fp_zl']=city['dq']+"增值税发票"
        else:
            diction['fp_zl']=city['dq']+invoice_type[diction["fp_qz"]]
    diction['kp_rq']=diction['kp_rq'][:4]+"年"+diction['kp_rq'][4:6]+"月"+diction['kp_rq'][-2:]+"日"
    diction['kp_je']=diction['kp_je']+"¥"
    return diction