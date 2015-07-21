from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^(?P<class_name>[\w-]+)/$', views.class_detail)
]
