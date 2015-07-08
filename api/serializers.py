from django.contrib.auth.models import User, Group
from rest_framework import serializers

from .models import (
    BubbleSort,
    GameOfLife,
    GameOfLifeCell,
)


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')


class BubbleSortSerializer(serializers.HyperlinkedModelSerializer):
    list_size = serializers.IntegerField(source='get_list_size', read_only=True)
    sorted_list = serializers.CharField(source='get_list_sorted', read_only=True)
    current_list = serializers.ListField(source='get_list_current', read_only=True)

    class Meta:
        model = BubbleSort


class GameOfLifeSerializer(serializers.HyperlinkedModelSerializer):
    serialized = serializers.CharField(source='__unicode__', read_only=True)

    class Meta:
        model = GameOfLife


class GameOfLifeCellSerializer(serializers.ModelSerializer):
    # game_of_life = serializers.HyperlinkedRelatedField(view_name='gameoflife-detail', read_only=True)

    class Meta:
        model = GameOfLifeCell
        exclude = ('id', 'changed')
        extra_kwargs = {
            'url': {'view_name': 'gameoflifecell-detail', 'lookup_field': 'cell_name'}
        }