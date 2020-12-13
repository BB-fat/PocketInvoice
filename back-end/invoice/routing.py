#-*- coding:utf-8 -*-
import spider.routing
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack



application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': AuthMiddlewareStack(
    URLRouter(
            spider.routing.websocket_urlpatterns
        )
    ), 
})