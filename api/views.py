from django.contrib.admin.utils import lookup_field
from django.contrib.auth.models import User, Group
from django.core import exceptions
from rest_framework import viewsets
from rest_framework import status
from rest_framework import permissions
from rest_framework.decorators import detail_route, list_route
from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from . import serializers
from . import models
from rest_framework_extensions.mixins import NestedViewSetMixin


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

    # def filter_queryset(self, _):
    #     bubblesort_pk = self.kwargs['bubblesort_pk']
    #     return self.queryset.filter(bubble_sort_id=bubblesort_pk)


class ClickerClassViewSet(viewsets.ModelViewSet):
    queryset = models.ClickerClass.objects.all()
    serializer_class = serializers.ClickerClassSerializer


class BubbleSortViewSet(viewsets.ModelViewSet):
    queryset = models.BubbleSort.objects.all()
    serializer_class = serializers.BubbleSortSerializer

class GameOfLifeViewSet(viewsets.ModelViewSet):
    queryset = models.GameOfLife.objects.all()
    serializer_class = serializers.GameOfLifeSerializer
    # lookup_field = 'game_of_life'


class GameOfLifeCellViewSet(viewsets.ModelViewSet):
    queryset = models.GameOfLifeCell.objects.all()
    serializer_class = serializers.GameOfLifeCellSerializer
    # lookup_field = 'id'


class ConnectionViewSet(viewsets.ModelViewSet):
    """
    TODO find a way to bind serializer / document the `@detail_route`s
    """

    serializer_class = serializers.ConnectionSerializer
    queryset = models.RegisteredDevice.objects.all()

    def filter_queryset(self, queryset):
        print self.request.data
        return queryset

    def create(self, request, *args, **kwargs):

        # if 'DEVICE_ID' in request.COOKIES:
        #     if 'classes' not in request.data:
        #         raise Exception("request did not contain `classes` field")
        #
        #     try:
        #         device = models.RegisteredDevice.objects.get(device_id=request.COOKIES['DEVICE_ID'])
        #     except exceptions.ObjectDoesNotExist:
        #         return Response({'error': 'Device ID not found'}, status=status.HTTP_404_NOT_FOUND)
        #
        #     try:
        #         for clicker_class in request.data['classes']:
        #             clicker_class = models.ClickerClass.objects.get(class_name=clicker_class)
        #             if not len(device.classes.filter(class_name=clicker_class)):
        #                 device.classes.add(clicker_class)
        #
        #     except exceptions.ObjectDoesNotExist:
        #         return Response({'error': '`clicker_class` not found'}, status=status.HTTP_404_NOT_FOUND)

        if 'HTTP_USER_AGENT' in request.META:
            request.data['user_agent'] = request.META['HTTP_USER_AGENT']

        return super(ConnectionViewSet, self).create(request, *args, **kwargs)

    @detail_route(methods=['get', 'patch', 'put', 'delete'])
    def classes(self, request, **kwargs):
        """
        POST was throwing an exception in DRF's template... TODO investigate that.
        POST can be accomplished with DELETE/PATCH anyway
        """

        collection = self.get_object()
        serializer = serializers.ClickerClassSerializer

        if request.method == 'DELETE':
            collection.classes.clear()

        if request.method == 'PATCH' or request.method == 'PUT':
            add_items_id = request.DATA.pop('add', [])
            items_add = models.ClickerClass.objects.filter(class_name__in=add_items_id).all()
            collection.classes.add(*items_add)

        if request.method == 'PATCH':
            remove_items_id = request.DATA.pop('remove', [])
            items_remove = models.ClickerClass.objects.filter(class_name__in=remove_items_id).all()
            collection.classes.remove(*items_remove)

        # if request.method == 'POST':
        #     add_items_id = request.DATA.pop('only', [])
        #     items_add = models.ClickerClass.objects.filter(class_name__in=add_items_id).all()
        #     collection.classes = items_add

        if request.method == 'GET':
            pass

        return Response(serializer(collection.classes, many=True).data, status=status.HTTP_202_ACCEPTED)


# Admin


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer
    permission_classes = (permissions.IsAdminUser,)
