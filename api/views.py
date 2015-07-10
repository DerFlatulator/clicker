from django.contrib.admin.utils import lookup_field
from django.contrib.auth.models import User, Group
from rest_framework import viewsets
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

    def list(self, request, gameoflife_pk=None, **kwargs):
        qs = self.queryset.filter(game_of_life=gameoflife_pk)
        sz = self.serializer_class(qs, many=True, context={'request': request})
        return Response(sz.data)

    def retrieve(self, request, cell_name=None, gameoflife_pk=None):
        qs = get_object_or_404(self.queryset, cell_name=cell_name, game_of_life=gameoflife_pk)
        sz = self.serializer_class(qs, context={'request': request})
        return Response(sz.data)


# Admin


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer
