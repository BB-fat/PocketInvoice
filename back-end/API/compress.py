from PIL import Image


def size(jpg,now_size):
    im = Image.open(jpg)
    width, height = im.size
    if width>now_size:
        n=width/now_size
        w=int(width/n)
        h=int(height/n)
        resizedIm = im.resize((w,h))
        resizedIm.save(jpg)
    else:
        print('无需缩放')