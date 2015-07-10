from django.contrib.auth.models import User, Group

from rest_framework import serializers

import re

from . import models


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
        model = models.BubbleSort


class BubbleSortSwapSerializer(serializers.HyperlinkedModelSerializer):

    def validate(self, data):
        if data['lower_index'] < 0 or self['lower_index'] >= data['bubble_sort.size']:
            raise serializers.ValidationError({'lower_index': 'Must be a valid index'})
        return data

    class Meta:
        model = models.BubbleSortSwap


class GameOfLifeSerializer(serializers.HyperlinkedModelSerializer):
    serialized = serializers.CharField(source='__unicode__', read_only=True)

    class Meta:
        model = models.GameOfLife


class GameOfLifeCellSerializer(serializers.ModelSerializer):
    # game_of_life = serializers.HyperlinkedRelatedField(view_name='gameoflife-detail', read_only=True)

    class Meta:
        model = models.GameOfLifeCell
        exclude = ('id', 'changed')
        extra_kwargs = {
            'url': {'view_name': 'gameoflifecell-detail', 'lookup_field': 'cell_name'}
        }


class ClickerClassSerializer(serializers.HyperlinkedModelSerializer):

    def validate_class_name(self, class_name):
        if not re.match(r"^[a-z\-_0-9]+$", class_name):
            raise serializers.ValidationError('Must be all lower-case with hyphens or underscores.')
        return class_name

    class Meta:
        model = models.ClickerClass