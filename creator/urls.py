from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='creator'),
    url(r'^graph_ruleset/$', views.NewGraphRules.as_view()),
    url(r'^(?P<class_name>[\w-]+)/$', views.class_detail)
]
