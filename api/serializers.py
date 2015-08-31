from django.contrib.auth.models import User, Group
from django.core import serializers as core_serializers
from django.contrib.contenttypes.models import ContentType

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


class BubbleSortSerializer(serializers.HyperlinkedModelSerializer):
    list_size = serializers.IntegerField(source='get_list_size', read_only=True)
    sorted_list = serializers.CharField(source='get_list_sorted', read_only=True)
    current_list = serializers.ListField(source='get_list_current', read_only=True)
    swaps_lower_index = serializers.SlugRelatedField(many=True,
                                                     slug_field='lower_index',
                                                     source='swaps',
                                                     read_only=True)
    description = serializers.CharField(source='get_info', read_only=True)

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
    description = serializers.CharField(source='get_info', read_only=True)

    class Meta:
        model = models.GameOfLife


class RegressionPlotPointSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = models.RegressionPlotItem

class RegressionEstimateSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = models.RegressionEstimate

class RegressionSerializer(serializers.HyperlinkedModelSerializer):
    estimates = serializers.HyperlinkedRelatedField(view_name='regressionestimate-detail',
                                                    read_only=True,
                                                    many=True)
    plot_items = serializers.HyperlinkedRelatedField(view_name='regressionplotitem-detail',
                                                     read_only=True,
                                                     many=True)

    class Meta:
        model = models.Regression


class GraphSerializer(serializers.HyperlinkedModelSerializer):
    # rules = serializers.HyperlinkedRelatedField(view_name='graphrules-detail',
    #                                             read_only=True,
    #                                             many=False)
    class Meta:
        model = models.Graph


class GraphVertexSerializer(serializers.HyperlinkedModelSerializer):
    assigned_to = serializers.HyperlinkedRelatedField(
        view_name='connect-detail',
        queryset=models.RegisteredDevice.objects.all())

    class Meta:
        model = models.GraphVertex


class GraphEdgeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.GraphEdge


class GraphParticipationRulesSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = models.GraphParticipationRules


class CreatorSerializer(serializers.ModelSerializer):

    user = UserSerializer()

    class Meta:
        model = models.Creator


# noinspection PyAbstractClass
# class GenericRelatedFieldSerializer(serializers.RelatedField):
#     def to_representation(self, value):
#         if isinstance(value, models.GameOfLife):
#             serializer = GameOfLifeSerializer(value)
#         elif isinstance(value, models.BubbleSort):
#             serializer = BubbleSortSerializer(value)
#         else:
#             raise Exception('Unexpected type of generic related object')
#
#         return serializer.data

class CreatorNameSerializer(serializers.RelatedField):
    def to_representation(self, value):
        if isinstance(value, models.Creator):
            return value.user.username
        else:
            raise Exception('Unexpected type of related field')


# noinspection PyMethodMayBeStatic
class ClickerClassSerializer(serializers.HyperlinkedModelSerializer):

    connected_devices = serializers.IntegerField(source='get_connected_devices', read_only=True)
    creator = CreatorNameSerializer(read_only=True)

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

    classes = ClickerClassSerializer(many=True, read_only=True)
    classes_url = serializers.HyperlinkedRelatedField(source='pk',
                                                      view_name='connect-classes',
                                                      read_only=True)
    device_id = serializers.CharField(source='pk', read_only=True)

    class Meta:
        depth = 1
        read_only = ('device_id', )
        model = models.RegisteredDevice
        extra_kwargs = {
            'url': {
                'view_name': 'connect-detail',
            }
        }


#
# class ContentTypeField(serializers.WritableField):
#     def field_from_native(self, data, files, field_name, into):
#         into[field_name] = self.from_native(data[field_name])
#
#     def from_native(self, data):
#         app_label, model = data.split('.')
#         return ContentType.objects.get(app_label=app_label, model=model)
#
#     # If content_type is write_only, there is no need to have field_to_native here.
#     def field_to_native(self, obj, field_name):
#         if self.write_only:
#             return None
#         if obj is None:
#             return self.empty
#         ct = getattr(obj, field_name)
#         return '.'.join(ct.natural_key())


class InteractionTypeSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = models.InteractionType
        extra_kwargs = {
            'url': {
                'view_name': 'type-detail'
            }
        }
        fields = ('url', 'slug_name', 'long_name', 'interactions')


class InteractionSerializer(serializers.HyperlinkedModelSerializer):

    clicker_class = serializers.HyperlinkedRelatedField(view_name='class-detail', read_only=True)
    bubblesort = BubbleSortSerializer(read_only=True)
    gameoflife = GameOfLifeSerializer(read_only=True)
    creator = CreatorNameSerializer(read_only=True)
    interaction_slug = serializers.SlugRelatedField(source='interaction_type',
                                                    slug_field='slug_name',
                                                    queryset=models.Interaction.objects.all())
    long_name = serializers.SlugRelatedField(source='interaction_type',
                                             slug_field='long_name',
                                             queryset=models.Interaction.objects.all())

    state_name = serializers.CharField(read_only=True)
    instance_url = serializers.URLField(read_only=True)

    class Meta:
        model = models.Interaction
        exclude = ('interaction_type',)
        extra_kwargs = {
            'url': {
                'view_name': 'interaction-detail'
            }
        }


class InteractionGeneratorSerializer(serializers.HyperlinkedModelSerializer):

    class_name = serializers.SlugRelatedField(slug_field='class_name',
                                              source='clicker_class',
                                              queryset=models.ClickerClass.objects.all())

    interaction_slug = serializers.SlugRelatedField(slug_field='slug_name',
                                                    source='interaction_type',
                                                    queryset=models.InteractionType.objects.all())

    class Meta:
        fields = ('class_name', 'interaction_slug')
        model = models.Interaction
