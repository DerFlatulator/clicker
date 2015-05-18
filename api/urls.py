from django.conf.urls import url, include

from rest_framework import routers

import api.views as views

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'bubblesort/view', views.BubbleSortViewSet)
router.register(r'bubblesort/swap', views.BubbleSortSwapViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
