from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter
# from rest_framework_nested.routers import NestedSimpleRouter
# from rest_framework_extensions.routers import ExtendedDefaultRouter

import api.views as views

router = DefaultRouter()

urlpatterns = [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

view_sets = [
    views.UserViewSet,
    views.GroupViewSet,
    (views.ClickerClassViewSet, "class"),
    (views.ConnectionViewSet, "connect"),
    views.GameOfLifeViewSet,
    views.GameOfLifeCellViewSet,
    views.BubbleSortViewSet,
    views.BubbleSortSwapViewSet
]


for view_set in view_sets:
    if isinstance(view_set, tuple):
        view_name = view_set[1]
        view_set = view_set[0]
    else:
        view_name = view_set.__name__.replace("ViewSet", "").lower()

    router.register(view_name, view_set, base_name=view_name)


#
# Begin nested routes
#

# router.register(r'gameoflife',
#                 views.GameOfLifeViewSet,
#                 base_name='gameoflife') \
#       .register(r'cell', views.GameOfLifeCellViewSet,
#                 base_name='gameoflife-cell',
#                 parents_query_lookups=['cell_name'])
#
# router.register(r'bubblesort',
#                 views.BubbleSortViewSet,
#                 base_name='bubblesort') \
#       .register(r'swap',
#                 views.BubbleSortSwapViewSet,
#                 base_name='bubblesort-swap',
#                 parents_query_lookups=['bubble_sort'])


urlpatterns.append(url(r'^', include(router.urls)))
