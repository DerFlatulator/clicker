from django.contrib.admin.utils import lookup_field
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from . import serializers
from . import models


def generic_serializer_view_set_factory(_model, _serializer=HyperlinkedModelSerializer):
    class GenericSerializerViewSet(viewsets.ModelViewSet):
        queryset = _model.objects.all()

        def get_serializer_class(self):
            class GenericSerializer(_serializer):
                class Meta:
                    model = _model

            self.serializer_class = GenericSerializer
            return self.serializer_class
    try:
        GenericSerializerViewSet.__name__ = _model.__name__
    finally:
        return GenericSerializerViewSet


class BubbleSortSwapViewSet(viewsets.ModelViewSet):
    queryset = models.BubbleSortSwap.objects.all()
    serializer_class = serializers.BubbleSortSwapSerializer

    def filter_queryset(self, _):
        bubblesort_pk = self.kwargs['bubblesort_pk']
        return self.queryset.filter(bubble_sort_id=bubblesort_pk)


class ClickerClassViewSet(viewsets.ModelViewSet):
    queryset = models.ClickerClass.objects.all()
    serializer_class = serializers.ClickerClassSerializer


class BubbleSortViewSet(viewsets.ModelViewSet):
    queryset = models.BubbleSort.objects.all()
    serializer_class = serializers.BubbleSortSerializer


class GameOfLifeViewSet(viewsets.ModelViewSet):
    queryset = models.GameOfLife.objects.all()
    serializer_class = serializers.GameOfLifeSerializer


class GameOfLifeCellViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.GameOfLifeCellSerializer
    queryset = models.GameOfLifeCell.objects.all()
    lookup_field = 'cell_name'

    def filter_queryset(self, _):
        gameoflife_pk = self.kwargs['gameoflife_pk']
        return self.queryset.filter(game_of_life_id=gameoflife_pk)

# Admin


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer
    permission_classes = (permissions.IsAdminUser,)
