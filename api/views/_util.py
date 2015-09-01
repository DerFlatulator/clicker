import abc
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import list_route
from rest_framework.response import Response
from rest_framework.serializers import HyperlinkedModelSerializer

from api import models

def generic_serializer_view_set_factory(_model,
                                        _serializer=HyperlinkedModelSerializer):
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


class InteractionGeneratorViewSet(viewsets.ModelViewSet):
    __metaclass__ = abc.ABCMeta

    def get_data(self, request):
        try:
            if request.DATA:
                data = request.DATA
            else:
                data = request.stream.DATA
        except Exception:
            data = request.POST
        return data

    def do_generate(self, request):
        if request.method == 'GET':
            return Response({}, status=status.HTTP_200_OK)

        if not hasattr(request.user, 'creator'):
            return Response({'detail': 'you are not a creator'},
                            status=status.HTTP_403_FORBIDDEN)

        creator = request.user.creator

        class_name = request.data['class_name']
        clicker_class = models.ClickerClass.objects.get(class_name=class_name)

        interaction_type = self.get_interaction_type()

        for m in models.Interaction.objects.filter(clicker_class=clicker_class):
            m.state = models.Interaction.COMPLETE
            m.save()

        interaction = models.Interaction.objects.create(clicker_class=clicker_class,
                                                        state=models.Interaction.ACTIVE,
                                                        creator=creator,
                                                        interaction_type=interaction_type)
        interaction.save()
        return interaction

    @abc.abstractmethod
    def get_interaction_type(self):
        """
        Get the interaction type for this ViewSet
        """
        pass
