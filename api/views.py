from collections import OrderedDict
from django.contrib.auth.models import User, Group
from django.core import exceptions
from django.shortcuts import redirect
from rest_framework import viewsets
from rest_framework import status
from rest_framework import permissions
from rest_framework.decorators import detail_route, list_route
from rest_framework.metadata import SimpleMetadata
from rest_framework.reverse import reverse_lazy
from rest_framework.serializers import HyperlinkedModelSerializer
from rest_framework.response import Response

from . import serializers
from . import models
from .permissions import DeviceIsRegisteredPermission

import json
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

    @detail_route(methods=['post'])
    def cleardevices(self, request, pk):
        clk = models.ClickerClass.objects.get(class_name=pk)
        clk.registereddevice_set.clear()
        return Response({}, status=status.HTTP_202_ACCEPTED)

class BubbleSortViewSet(viewsets.ModelViewSet):
    queryset = models.BubbleSort.objects.all()
    serializer_class = serializers.BubbleSortSerializer

    def get_serializer_class(self, *args, **kwargs):
        if 'post' in self.action_map and self.action_map['post'] == 'generate':
            if self.request.accepted_renderer.format == 'api':
                return serializers.InteractionGeneratorSerializer

        return serializers.BubbleSortSerializer

    @list_route(methods=['post', 'get'])
    def generate(self, request, **kwargs):
        """
        :param class_name: the class this interaction will be associated with

        """
        if request.method == 'GET':
            return Response({}, status=status.HTTP_200_OK)

        if not hasattr(request.user, 'creator'):
            return Response({'detail': 'you are not a creator'}, status=status.HTTP_403_FORBIDDEN)

        creator = request.user.creator

        class_name = request.data['class_name']
        clicker_class = models.ClickerClass.objects.get(class_name=class_name)
        class_size = clicker_class.get_connected_devices()

        if class_size == 0:
            return Response({'detail': 'class size is zero'}, status=status.HTTP_403_FORBIDDEN)

        # if 'interaction_slug' not in request.data:
        #     return Response({'detail': 'please specify an interaction type'}, status=status.HTTP_400_BAD_REQUEST)

        # interaction_slug = request.data['interaction_slug']
        interaction_type = models.InteractionType.objects.get(slug_name='bubblesort')

        for m in models.Interaction.objects.all():
            m.state = models.Interaction.COMPLETE
            m.save()

        # create game of life instance and corresponding interaction
        interaction = models.Interaction.objects.create(clicker_class=clicker_class,
                                                        state=models.Interaction.READY,
                                                        creator=creator,
                                                        interaction_type=interaction_type)
        interaction.save()

        list_len = class_size + 1
        items = range(1, list_len + 1)
        for _ in range(class_size * 2):
            i = random.randrange(0, list_len - 1)
            items[i], items[i + 1] = items[i + 1], items[i]

        csv = ",".join(map(str, items))
        bubblesort = models.BubbleSort(shuffled=csv)
        bubblesort.interaction = interaction
        bubblesort.save()

        interaction.state = models.Interaction.ACTIVE
        interaction.save()

        interaction_data = {'assignments': {}}
        clients = map(lambda d: d.device_id, clicker_class.registereddevice_set.all())
        i = 0
        for client in clients:
            interaction_data['assignments'][client] = {
                'lower_index': i,
                'swap_url': '/api/bubblesortswap/'
            }
            i += 1

        interaction_data['bubble_sort'] = bubblesort.id
        interaction_data['interaction'] = interaction.id
        interaction_data['instance_script'] = '/static/js/:type:/bubblesort.bundle.js'
        interaction_data['instance_component_name'] = 'BubbleSort'

        interaction.data_json = json.dumps(interaction_data)
        interaction.save()

        return Response(serializers.BubbleSortSerializer(bubblesort, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)


class GenerateMetadata(SimpleMetadata):
    def determine_metadata(self, request, view):
        metadata = super(GenerateMetadata, self).determine_metadata(request, view)

        if 'post' in view.action_map and view.action_map['post'] == 'generate':
            fields = OrderedDict()
            fields['class_name'] = OrderedDict()
            fields['class_name']['label'] = u'Class Name'
            fields['class_name']['read_only'] = False
            fields['class_name']['required'] = True
            fields['class_name']['type'] = False
            fields['class_name']['read_only'] = u'field'

            metadata['actions']['POST'] = fields

        return metadata


class GameOfLifeViewSet(viewsets.ModelViewSet):
    DEFAULT_PATTERN = 'glider'
    DEFAULT_ACTIVATE = True

    def get_serializer_class(self, *args, **kwargs):
        if 'post' in self.action_map and self.action_map['post'] == 'generate':
            if self.request.accepted_renderer.format == 'api':
                return serializers.InteractionGeneratorSerializer

        return serializers.GameOfLifeSerializer

    queryset = models.GameOfLife.objects.all()

    # lookup_field = 'game_of_life'
    metadata_class = GenerateMetadata

    @detail_route(methods=['post'])
    def swap_buffers(self, request, pk):
        gol = models.GameOfLife.objects.get(pk=pk)
        if gol.is_async:
            return Response({'detail': 'this is an async. game of life'}, status=status.HTTP_400_BAD_REQUEST)
        if gol.is_buffer:
            return Response({'detail': 'this is an buffer game of life'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            buff = gol.buffer
            for buff_cell, source_cell in zip(buff.cells.all(), gol.cells.all()):
                source_cell.alive = buff_cell.alive
                source_cell.save()

        gol.save()

        return Response({}, status=status.HTTP_202_ACCEPTED)

    @list_route(methods=['post', 'get'])
    def generate(self, request, **kwargs):
        """
        :param class_name: the class this interaction will be associated with

        """
        try:
            if request.DATA:
                data = request.DATA
            else:
                data = request.stream.DATA
        except Exception:
            data = request.stream.DATA

        async = data.get('async', False) is True

        if request.method == 'GET':
            return Response({}, status=status.HTTP_200_OK)

        if not hasattr(request.user, 'creator'):
            return Response({'detail': 'you are not a creator'}, status=status.HTTP_403_FORBIDDEN)

        creator = request.user.creator

        class_name = data['class_name']
        clicker_class = models.ClickerClass.objects.get(class_name=class_name)
        class_size = clicker_class.get_connected_devices()

        if class_size == 0:
            return Response({'detail': 'class size is zero'}, status=status.HTTP_403_FORBIDDEN)

        # if 'interaction_slug' not in request.data:
        #     return Response({'detail': 'please specify an interaction type'}, status=status.HTTP_400_BAD_REQUEST)

        activate = data.get('activate', GameOfLifeViewSet.DEFAULT_ACTIVATE)

        # interaction_slug = request.data['interaction_slug']
        interaction_type = models.InteractionType.objects.get(slug_name='gameoflife')

        for m in models.Interaction.objects.all():
            if activate:
                m.state = models.Interaction.COMPLETE
                m.save()

        # create game of life instance and corresponding interaction
        interaction = models.Interaction.objects.create(clicker_class=clicker_class,
                                                        state=models.Interaction.READY,
                                                        creator=creator,
                                                        interaction_type=interaction_type)
        interaction.save()

        rows = max(4, int(math.ceil(math.sqrt(class_size))))
        cols = max(4, int(math.ceil(float(class_size) / rows)))  # more-or-less square
        game = models.GameOfLife(num_rows=rows, num_cols=cols, interaction=interaction, is_async=async)
        game.save()
        if not async:
            gol_buffer = models.GameOfLife(num_rows=rows, num_cols=cols, is_async=False, is_buffer=True)
            gol_buffer.save()
            game.buffer = gol_buffer
            game.save()

        interaction.gameoflife = game
        if activate:
            interaction.state = models.Interaction.ACTIVE
        interaction.save()

        # allocate clients to cells

        def rand_bool():
            return random.randrange(2) == 0

        clients = map(lambda d: d.device_id, clicker_class.registereddevice_set.all())
        ai = [True] * ((rows * cols) - class_size)
        everything = clients + ai
        random.shuffle(everything)

        # assign cell states randomly

        interaction_data = {'assignments': {}}

        patterns = {
            'glider': (
                (0, 0, 1, 0),
                (1, 0, 1, 0),
                (0, 1, 1, 0),
                (0, 0, 0, 0),
            )
        }

        pattern_name = data.get('pattern', GameOfLifeViewSet.DEFAULT_PATTERN)
        if pattern_name in patterns:
            pattern = patterns[pattern_name]
        else:
            pattern = None

        for col in range(cols):
            for row in range(rows):
                cell = game.cells.filter(game_of_life=game, row=row, col=col)[0]
                if pattern:
                    if row < len(pattern) and col < len(pattern[0]):
                        cell.alive = bool(pattern[row][col])
                    else:
                        cell.alive = False  # could use rand_bool() here.
                else:
                    cell.alive = rand_bool()

                if not async:
                    buff_cell = gol_buffer.cells.filter(game_of_life=gol_buffer, row=row, col=col)[0]
                something = everything.pop()
                if isinstance(something, unicode):
                    device_id = something
                    cell.save()
                    cell_data = serializers.GameOfLifeCellSerializer(cell,
                                                                     context={'request': request}).data
                    if async:
                        interaction_data['assignments'][device_id] = cell_data
                    else:
                        buff_cell_data = serializers.GameOfLifeCellSerializer(buff_cell,
                                                                              context={'request': request}).data
                        interaction_data['assignments'][device_id] = {
                            'source': cell_data,
                            'buffer': buff_cell_data
                        }
                else:
                    cell.is_ai = True
                    cell.save()

                if not async:
                    buff_cell.is_ai = cell.is_ai
                    buff_cell.alive = cell.alive
                    buff_cell.save()

        interaction_data['urls'] = {
            'source': str(reverse_lazy('gameoflife-detail', args=[game.id])),
        }
        if not async:
            interaction_data['urls']['buffer'] = str(reverse_lazy('gameoflife-detail', args=[gol_buffer.id]))

        interaction_data['urls']['next_state'] = "{}swap_buffers/".format(interaction_data['urls']['source'])
        interaction_data['interaction'] = interaction.id
        interaction_data['game_of_life'] = game.id
        if async:
            interaction_data['instance_script'] = '/static/js/:type:/asyncgameoflife.bundle.js'
            interaction_data['instance_component_name'] = 'AsyncGameOfLife'
        else:
            # interaction_data['game_of_life_buffer'] = game_buffer.id
            interaction_data['instance_script'] = '/static/js/:type:/gameoflife.bundle.js'
            interaction_data['instance_component_name'] = 'GameOfLife'

        interaction.data_json = json.dumps(interaction_data)
        interaction.save()

        return Response(serializers.GameOfLifeSerializer(game, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)


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


class InteractionTypeViewSet(viewsets.ModelViewSet):
    queryset = models.InteractionType.objects.all()
    serializer_class = serializers.InteractionTypeSerializer


class InteractionViewSet(viewsets.ModelViewSet):
    queryset = models.Interaction.objects.all()
    serializer_class = serializers.InteractionSerializer

    def filter_queryset(self, queryset):
        creator = self.request.query_params.get('creator', None)
        if creator:
            queryset = queryset.filter(creator__user__username=creator)

        clicker_class = self.request.query_params.get('class', None)
        if clicker_class:
            queryset = queryset.filter(clicker_class__class_name=clicker_class)

        state_name = self.request.query_params.get('state', None)
        if state_name:
            states = [state for state, _state_name in models.Interaction.INTERACTION_STATES
                      if state_name == _state_name.lower()]
            if not len(states):
                return queryset.none()

            state = states[0]
            queryset = queryset.filter(state=state)

        return queryset


# Admin

class CreatorViewSet(viewsets.ModelViewSet):
    queryset = models.Creator.objects.all()
    serializer_class = serializers.CreatorSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = (permissions.IsAdminUser,)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer
    permission_classes = (permissions.IsAdminUser,)


class AsyncGameOfLifeViewSet(viewsets.GenericViewSet):
    serializer_class = serializers.GameOfLifeSerializer

    def list(self, request):
        return redirect('gameoflife-list')

    @list_route(methods=['post'])
    def generate(self, request, *args, **kwargs):
        request.data[u'async'] = True
        vs = GameOfLifeViewSet.as_view({'post': 'generate'})
        return vs(request, *args, **kwargs)
