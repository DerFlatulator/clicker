from django.contrib.admin.utils import lookup_field
from django.contrib.auth.models import User, Group
from rest_framework import viewsets, serializers
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from .serializers import (
    UserSerializer,
    GroupSerializer,
    BubbleSortSerializer,
    GameOfLifeSerializer,
    GameOfLifeCellSerializer
)

from .models import (
    BubbleSort,
    BubbleSortSwap,
    GameOfLife,
    GameOfLifeCell,
)


def generic_serializer_view_set_factory(_model, _serializer=serializers.HyperlinkedModelSerializer):
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

BubbleSortSwapViewSet = generic_serializer_view_set_factory(BubbleSortSwap)


class BubbleSortViewSet(viewsets.ModelViewSet):
    queryset = BubbleSort.objects.all()
    serializer_class = BubbleSortSerializer


class GameOfLifeViewSet(viewsets.ModelViewSet):
    queryset = GameOfLife.objects.all()
    serializer_class = GameOfLifeSerializer


class GameOfLifeCellViewSet(viewsets.ModelViewSet):
    serializer_class = GameOfLifeCellSerializer
    queryset = GameOfLifeCell.objects.all()
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
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
