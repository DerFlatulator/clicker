from django.contrib.auth.models import User, Group
from rest_framework import viewsets, serializers
from .serializers import UserSerializer, GroupSerializer

from .models import BubbleSort, BubbleSortSwap


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
        GenericSerializerViewSet.__name__ = _model.__name__ + ":"
    finally:
        return GenericSerializerViewSet


# noinspection PyTypeChecker
BubbleSortViewSet = generic_serializer_view_set_factory(BubbleSort)
BubbleSortSwapViewSet = generic_serializer_view_set_factory(BubbleSortSwap)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
