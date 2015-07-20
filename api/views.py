import json
from django.contrib.auth.models import User, Group
from django.core import exceptions
from rest_framework import viewsets
from rest_framework import status
from rest_framework import permissions
from rest_framework.decorators import detail_route, list_route
from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework.response import Response

from . import serializers
from . import models
from .permissions import DeviceIsRegisteredPermission

import math
import random

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

    @list_route(methods=['post'])
    def generate(self, request, **kwargs):
        class_name = request.data['class_name']
        clicker_class = models.ClickerClass.objects.get(class_name=class_name)
        class_size = clicker_class.get_connected_devices()

        creator = request.user.creator.get()

        if class_size == 0:
            return Response({'detail': 'class size is zero'}, status=status.HTTP_403_FORBIDDEN)

        # create game of life instance and corresponding interaction

        rows = max(4, int(math.ceil(math.sqrt(class_size))))
        cols = max(4, int(math.ceil(float(class_size) / rows)))  # more-or-less square
        game = models.GameOfLife.objects.create(num_rows=rows, num_cols=cols)  # unsaved

        interaction = models.Interaction.objects.create(clicker_class=clicker_class,
                                                        state=models.Interaction.READY,
                                                        creator=creator)
        interaction.save()

        game.interaction = interaction
        game.save()

        # allocate clients to cells

        def rand_bool():
            return random.randrange(2) == 0

        clients = map(lambda d: d.device_id, clicker_class.registereddevice_set.get())
        ai = [True] * ((rows * cols) - class_size)
        everything = clients + ai
        random.shuffle(everything)

        # assign cell states randomly

        interaction_data = {'assignments': {}}

        for col in range(cols):
            for row in range(rows):
                cell = game.cells.filter(game_of_life=game, row=row, col=col)[0]
                cell.alive = rand_bool()
                cell.save()
                something = everything.pop()
                if isinstance(something, str):
                    device_id = something
                    interaction_data['assignments'][device_id] = cell.cell_name

        interaction.data_json = json.dumps(interaction_data)
        interaction.save()

        return Response(self.serializer_class(game).data, status=status.HTTP_201_CREATED)


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

    """
    TODO uncomment permission_classes line below
    """
    # permission_classes = (DeviceIsRegisteredPermission,)

    def filter_queryset(self, queryset):
        return queryset

    def create(self, request, *args, **kwargs):
        if 'HTTP_USER_AGENT' in request.META:
            mutable = request.data._mutable
            request.data._mutable = True
            request.data['user_agent'] = request.META['HTTP_USER_AGENT']
            request.data._mutable = mutable

        if 'device_id' in request.session:
            try:
                device = models.RegisteredDevice.objects.get(device_id=request.session['device_id'])
                return Response(self.serializer_class(device, context={'request': request}).data,
                                status=status.HTTP_200_OK)
            except exceptions.ObjectDoesNotExist:
                pass

        response = super(ConnectionViewSet, self).create(request, *args, **kwargs)
        request.session['device_id'] = response.data['device_id']
        return response

    @detail_route(methods=['get', 'patch', 'put', 'delete'])
    def classes(self, request, **kwargs):
        """
        Action to modify the ManyToMany relationship from `RegisteredDevice` to `ClickerClass`
        """

        collection = self.get_object()
        serializer = serializers.ClickerClassSerializer

        s = status.HTTP_405_METHOD_NOT_ALLOWED

        if request.method == 'DELETE':
            collection.classes.clear()
            s = status.HTTP_202_ACCEPTED

        if request.method == 'PATCH' or request.method == 'PUT':
            add_class_names = request.DATA.get('add', [])
            items_add = models.ClickerClass.objects.filter(class_name__in=add_class_names).all()
            length = len(collection.classes.all())
            collection.classes.add(*items_add)
            if len(collection.classes.all()) > length:
                s = status.HTTP_201_CREATED
            else:
                s = status.HTTP_200_OK

        if request.method == 'PATCH':
            remove_class_names = request.DATA.get('remove', [])
            items_remove = models.ClickerClass.objects.filter(class_name__in=remove_class_names).all()
            collection.classes.remove(*items_remove)
            s = status.HTTP_202_ACCEPTED

        """
        POST was throwing an exception in DRF's template... TODO investigate that.
        POST can be accomplished with DELETE/PATCH anyway
        """
        # if request.method == 'POST':
        #     add_class_names = request.DATA.pop('only', [])
        #     items_add = models.ClickerClass.objects.filter(class_name__in=add_class_names).all()
        #     collection.classes = items_add

        if request.method == 'GET':
            s = status.HTTP_200_OK

        serialized = serializer(collection.classes, many=True, context={'request': request})
        return Response(serialized.data, status=s)


class InteractionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Interaction.objects.all()
    serializer_class = serializers.InteractionSerializer


# Admin


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer
    permission_classes = (permissions.IsAdminUser,)
