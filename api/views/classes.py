from django.core import exceptions
from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response

from api import serializers
from api import models

class ClickerClassViewSet(viewsets.ModelViewSet):
    queryset = models.ClickerClass.objects.all()
    serializer_class = serializers.ClickerClassSerializer

    @detail_route(methods=['post'])
    def cleardevices(self, request, pk):
        clk = models.ClickerClass.objects.get(class_name=pk)
        clk.registereddevice_set.clear()
        return Response({}, status=status.HTTP_202_ACCEPTED)

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
