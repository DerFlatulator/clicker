from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^bubblesort', views.bubble_sort),
    url(r'^gameoflife', views.game_of_life),
]
