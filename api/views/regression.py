from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import list_route
from rest_framework.reverse import reverse_lazy
from rest_framework.response import Response

from api import serializers
from api import models

import json


class RegressionViewSet(viewsets.ModelViewSet):
    queryset = models.Regression.objects.all()
    serializer_class = serializers.RegressionSerializer

    @list_route(methods=['post', 'get'])
    def generate(self, request):

        if request.method == 'GET':
            return Response({}, status=status.HTTP_200_OK)

        if not hasattr(request.user, 'creator'):
            return Response({'detail': 'you are not a creator'}, status=status.HTTP_403_FORBIDDEN)

        creator = request.user.creator

        class_name = request.data['class_name']
        clicker_class = models.ClickerClass.objects.get(class_name=class_name)
        # class_size = clicker_class.get_connected_devices()

        # if class_size == 0:
        #     return Response({'detail': 'class size is zero'}, status=status.HTTP_403_FORBIDDEN)

        interaction_type = models.InteractionType.objects.get(slug_name='regression')

        for m in models.Interaction.objects.filter(clicker_class=clicker_class):
            m.state = models.Interaction.COMPLETE
            m.save()

        # create game of life instance and corresponding interaction
        interaction = models.Interaction.objects.create(clicker_class=clicker_class,
                                                        state=models.Interaction.ACTIVE,
                                                        creator=creator,
                                                        interaction_type=interaction_type)
        interaction.save()

        regression = models.Regression(interaction=interaction,
                                       x_label="Height (cm)",
                                       y_label="Weight (kg)")
        regression.save()

        interaction_data = {
            'assignments': {},
            'urls': {
                'source': str(reverse_lazy('regression-detail', args=[regression.id])),
                'plot_items': str(reverse_lazy('regressionplotitem-list'))
            },
            'interaction': interaction.id,
            'instance_script': '/static/js/:type:/regression.bundle.js',
            'instance_component_name': 'Regression'
        }

        interaction.data_json = json.dumps(interaction_data)
        interaction.save()

        return Response(serializers.RegressionSerializer(regression, context={'request': request}).data,
                        status=status.HTTP_201_CREATED)


class RegressionEstimateViewSet(viewsets.ModelViewSet):
    queryset = models.RegressionEstimate.objects.all()
    serializer_class = serializers.RegressionEstimateSerializer


class RegressionPlotItemViewSet(viewsets.ModelViewSet):
    queryset = models.RegressionPlotItem.objects.all()
    serializer_class = serializers.RegressionPlotPointSerializer

