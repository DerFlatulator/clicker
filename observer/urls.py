from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^(?P<class_name>[\w]+)/$', views.react_app),
]
