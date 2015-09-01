from collections import OrderedDict
from django.shortcuts import redirect
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import detail_route, list_route
from rest_framework.metadata import SimpleMetadata
from rest_framework.reverse import reverse_lazy
from rest_framework.response import Response

from api import serializers
from api import models

import json
import math
import random


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


class AsyncGameOfLifeViewSet(viewsets.GenericViewSet):
    serializer_class = serializers.GameOfLifeSerializer

    def list(self, request):
        return redirect('gameoflife-list')

    @list_route(methods=['post'])
    def generate(self, request, *args, **kwargs):
        request.data[u'async'] = True
        vs = GameOfLifeViewSet.as_view({'post': 'generate'})
        return vs(request, *args, **kwargs)
