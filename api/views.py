from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from .serializers import UserSerializer, GroupSerializer, BubbleSortSerializer

from .models import BubbleSort as MBubbleSort

# def index(request):
#     return HttpResponse("Hello, world. You're at the clicker index.")


class BubbleSortViewSet(viewsets.ModelViewSet):
    queryset = MBubbleSort.objects.all()
    serializer_class = BubbleSortSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
