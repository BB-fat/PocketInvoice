from django.shortcuts import render
from django.http import HttpResponse
import os

# Create your views here.

def my_image(request,pic_name):

    d = os.path.dirname(__file__)    #parent_path = path.dirname(d)
    print("d="+str(d))
    imagepath = os.path.join(d,"images/"+str(pic_name)+".png")
    print("imagepath="+str(imagepath))
    image_data = open(imagepath,"rb").read()

    return HttpResponse(image_data,content_type="image/png") #注意旧版的资料使用mimetype,现在已经改为content_type
