from django.contrib.auth.models import User, Group

from rest_framework import serializers

import re

from . import models


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'name')


class BubbleSortSwapSerializer(serializers.HyperlinkedModelSerializer):

    def validate(self, data):
        if data['lower_index'] < 0 or data['lower_index'] >= data['bubble_sort'].get_list_size:
            raise serializers.ValidationError({'lower_index': 'Must be a valid index'})
        return data

    class Meta:
        model = models.BubbleSortSwap


class BubbleSortSerializer(serializers.ModelSerializer):
    list_size = serializers.IntegerField(source='get_list_size', read_only=True)
    sorted_list = serializers.CharField(source='get_list_sorted', read_only=True)
    current_list = serializers.ListField(source='get_list_current', read_only=True)
    swaps_lower_index = serializers.SlugRelatedField(many=True,
                                                     slug_field='lower_index',
                                                     source='swaps',
                                                     read_only=True)

    class Meta:
        model = models.BubbleSort


class GameOfLifeCellSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = models.GameOfLifeCell
        exclude = ('changed', )
        unique_together = ('game_of_life', 'cell_name')


class GameOfLifeSerializer(serializers.HyperlinkedModelSerializer):
    serialized = serializers.CharField(source='__unicode__', read_only=True)
    cells = serializers.HyperlinkedRelatedField(view_name='gameoflifecell-detail',
                                                read_only=True,
                                                many=True)

    class Meta:
        model = models.GameOfLife


# noinspection PyMethodMayBeStatic
class ClickerClassSerializer(serializers.HyperlinkedModelSerializer):

    connected_devices = serializers.IntegerField(source='get_connected_devices', read_only=True)

    def validate_class_name(self, class_name):
        if not re.match(r"^[a-z\-_0-9]+$", class_name):
            raise serializers.ValidationError('Must be all lower-case with hyphens or underscores.')
        return class_name

    class Meta:
        model = models.ClickerClass
        extra_kwargs = {
            'url': {
                'view_name': 'class-detail'
            }
        }


class ConnectionSerializer(serializers.HyperlinkedModelSerializer):

    classes = ClickerClassSerializer(many=True)

    class Meta:
        depth = 1
        read_only = ('device_id', )
        model = models.RegisteredDevice
        extra_kwargs = {
            'url': {
                'view_name': 'connect-detail'
            }
        }
