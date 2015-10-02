import json
from django.core.urlresolvers import resolve
from django.utils.six.moves.urllib.parse import urlparse

from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.reverse import reverse_lazy

from api import serializers
from api import models

from ._util import InteractionGeneratorViewSet


class GraphViewSet(InteractionGeneratorViewSet):
    queryset = models.Graph.objects.all()
    serializer_class = serializers.GraphSerializer

    def get_interaction_type(self):
        return models.InteractionType.objects.get(slug_name='graph')

    @list_route(methods=['post', 'get'])
    def generate(self, request):

        data = self.get_data(request)
        interaction = self.do_generate(request)

        # if something went wrong in do_generate
        if isinstance(interaction, Response):
            return interaction

        interaction_type = self.get_interaction_type()

        rules = data.get('rules_url', None)

        if not rules:
            return Response({'detail': 'rules_url not provided'},
                            status=status.HTTP_404_NOT_FOUND)

        path = urlparse(rules).path
        pk = resolve(path).kwargs['pk']
        rules = get_object_or_404(models.GraphParticipationRules.objects,
                                  pk=pk)

        graph = models.Graph(interaction=interaction,
                             rules=rules)
        graph.save()

        class_name = data['class_name']
        clicker_class = models.ClickerClass.objects.get(class_name=class_name)
        clients = clicker_class.registereddevice_set.all()

        vertices = {}
        index = 0
        for client in clients:
            v = models.GraphVertex(
                is_assigned=True,
                label="vertex #" + str(index),
                graph=graph,
                assigned_to=client,
                index=index
            )
            index += 1
            v.save()
            vertices[client.device_id] = str(reverse_lazy('graphvertex-detail', args=[v.id]))

        interaction_data = {
            'assignments': {
                'vertices': vertices
            },
            'urls': {
                'source': str(reverse_lazy('graph-detail', args=[graph.id])),
            },
            'interaction': interaction.id,
            'instance_script': '/static/js/:type:/graph.bundle.js',
            'instance_component_name': 'Graph'
        }

        interaction.data_json = json.dumps(interaction_data)
        interaction.save()

        serial = serializers.GraphSerializer(graph,
                                             context={'request': request})
        return Response(serial.data,
                        status=status.HTTP_201_CREATED)


class GraphVertexViewSet(viewsets.ModelViewSet):
    queryset = models.GraphVertex.objects.all()
    serializer_class = serializers.GraphVertexSerializer


class GraphEdgeViewSet(viewsets.ModelViewSet):
    queryset = models.GraphEdge.objects.all()
    serializer_class = serializers.GraphEdgeSerializer


class GraphParticipationRulesViewSet(viewsets.ModelViewSet):
    queryset = models.GraphParticipationRules.objects.all()
    serializer_class = serializers.GraphParticipationRulesSerializer


