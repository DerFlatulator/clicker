from django.conf.urls import url, include

from rest_framework_nested import routers

import api.views as views

router = routers.SimpleRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)
router.register(r'bubblesort/view', views.BubbleSortViewSet)
router.register(r'bubblesort/swap', views.BubbleSortSwapViewSet)
# router.register(r'gameoflife/cell', views.GameOfLifeCellViewSet)

router.register(r'gameoflife', views.GameOfLifeViewSet)
gameoflife_router = routers.NestedSimpleRouter(router, r'gameoflife', lookup='gameoflife')
gameoflife_router.register(r'cell', views.GameOfLifeCellViewSet, base_name='gameoflifecell')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^', include(gameoflife_router.urls)),
    # url(
    #     r'gameoflife/(?P<game_of_life_id>[0-9]+)/cell/(?P<cell_name>\w+)/$',
    #     views.GameOfLifeCellViewSet.as_view({'get': 'retrieve'}),
    #     name='gameoflifecell-detail'
    # ),
    # url(
    #     r'gameoflife/(?P<game_of_life_id>[0-9]+)/cell/$',
    #     views.GameOfLifeCellViewSet.as_view({'get': 'list'}),
    #     name='gameoflifecell-list'
    # ),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
