from django.conf.urls import url

import views

urlpatterns = [
    url(r'^$', views.LandingView.as_view(), name='home'),
    url(r'^signup/', views.SignUpView.as_view(), name='signup'),
    url(r'^login/', views.LoginView.as_view(), name='login'),
    url(r'^logout/', views.LogOutView.as_view(), name='logout'),
]