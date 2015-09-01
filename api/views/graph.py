import json

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

        title = data.get('rules_title', None)

        if not title:
            return Response({'detail': 'rules_title not provided'},
                            status=status.HTTP_404_NOT_FOUND)

        rules = get_object_or_404(interaction_type.graph_rulesets,
                                  title=title)

        graph = models.Graph(interaction=interaction,
                             rules=rules)
        graph.save()

        interaction_data = {
            'assignments': {},
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


