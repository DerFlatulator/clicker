from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response

from api import serializers
from api import models

import json
import random


class BubbleSortSwapViewSet(viewsets.ModelViewSet):
    queryset = models.BubbleSortSwap.objects.all()
    serializer_class = serializers.BubbleSortSwapSerializer

    # def filter_queryset(self, _):
    #     bubblesort_pk = self.kwargs['bubblesort_pk']
    #     return self.queryset.filter(bubble_sort_id=bubblesort_pk)


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

