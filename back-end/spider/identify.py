import hashlib

def identify(scope):
    code=dict(scope['headers'])[b'code'].decode('utf-8')
    secret=dict(scope['headers'])[b'secret'].decode('utf-8')
    cmd=str(dict(scope['headers'])[b'cmd'].decode('utf-8'))
    newcode=cmd+code+'kdfp'
    m = hashlib.md5()
    m.update(newcode.encode("utf-8"))
    md5str = m.hexdigest()
    if secret==md5str:
        return True
    else:
        return False