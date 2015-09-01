from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions

from api import serializers
from api import models


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
