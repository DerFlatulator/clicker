from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter

import api.views as views

router = DefaultRouter()

urlpatterns = [
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

view_sets = [
    views.UserViewSet,
    views.GroupViewSet,
    (views.ClickerClassViewSet, "class"),
    views.BubbleSortViewSet,
    views.GameOfLifeViewSet,
    (views.ConnectionViewSet, "connect")
]


for view_set in view_sets:
    if isinstance(view_set, tuple):
        view_name = view_set[1]
        view_set = view_set[0]
    else:
        view_name = view_set.__name__.replace("ViewSet", "").lower()

    router.register(view_name, view_set)

urlpatterns.append(url(r'^', include(router.urls)))

#
# Begin nested routes
#


def nested(view, uri=None, parent=None):
    nested_simple_router = NestedSimpleRouter(router, parent, lookup=parent)
    nested_simple_router.register(uri, view, base_name=(parent + uri))
    return nested_simple_router

nested_routers = [
    nested(views.GameOfLifeCellViewSet, uri="cell", parent="gameoflife"),
    nested(views.BubbleSortSwapViewSet, uri="swap", parent="bubblesort"),
]

for nested_router in nested_routers:
    urlpatterns.append(url(r'^', include(nested_router.urls)))


# gameoflife_router = NestedSimpleRouter(router, r'gameoflife', lookup='gameoflife')
# gameoflife_router.register(r'cell', views.GameOfLifeCellViewSet, base_name='gameoflifecell')

