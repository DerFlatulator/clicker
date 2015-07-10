from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.clicker_index),
    url(r'^(?P<class_name>[\w]+)/$', views.clicker_app),
]
