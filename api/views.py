from django.contrib.auth.models import User, Group
from rest_framework import viewsets, serializers
from .serializers import UserSerializer, GroupSerializer, BubbleSortSerializer

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
        GenericSerializerViewSet.__name__ = _model.__name__
    finally:
        return GenericSerializerViewSet

BubbleSortSwapViewSet = generic_serializer_view_set_factory(BubbleSortSwap)


class BubbleSortViewSet(viewsets.ModelViewSet):
    queryset = BubbleSort.objects.all()
    serializer_class = BubbleSortSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
