from django.shortcuts import render
from django.core.serializers import serialize
from braces import views

from api import serializers

from api import models
import forms

import json


def index(request):
    """
    :path: /creator/
    :param request: the Django Request object
    :return: rendered HTML
    """
    classes_model = models.ClickerClass.objects.filter(creator__user__username=request.user.username)

    classes = []
    for cls in classes_model:
        classes.append({
            'class_name': cls.class_name,
            'long_name': cls.long_name,
            'num_interactions': len(cls.interactions.all()),
            'connected_devices': cls.get_connected_devices()
        })

    return render(request, 'creator/creator_index.html', {
        'classes': classes,
        'classes_json': json.dumps(classes),
        'username': request.user.username
    })


def class_detail(request, class_name):
    """
    :path: /creator/<class_name>/
    :param request: the Django Request object
    :return: rendered HTML
    """
    cls_model = models.ClickerClass.objects.get(class_name=class_name)
    interactions_model = cls_model.interactions.all()
    types_model = models.InteractionType.objects.all()

    cls = {
        'class_name': cls_model.class_name,
        'long_name': cls_model.long_name,
        'num_interactions': len(interactions_model),
        'connected_devices': cls_model.get_connected_devices()
    }

    interactions = serializers.InteractionSerializer(interactions_model,
                                                     many=True,
                                                     context={'request': request}).data
    for interaction in interactions:
        obj = interaction.pop('bubblesort', None)
        obj = interaction.pop('gameoflife', obj)
        if obj:
            interaction['description'] = obj['description']

    # interactions = [
    #     {
    #         'interaction_type': {
    #             'long_name': x.interaction_type.long_name,
    #             'slug_name': x.interaction_type.slug_name,
    #             'gameoflife': x.gameoflife.get_info() if hasattr(x, 'gameoflife') else None,
    #             'bubblesort': x.bubblesort.get_info() if hasattr(x, 'bubblesort') else None
    #         },
    #         'state_name': x.state_name,
    #
    #     } for x in interactions_model
    # ]

    types = serializers.InteractionTypeSerializer(types_model, many=True,
                                                  context={'request': request}).data

    return render(request, 'creator/class_detail.html', {
        'class_name': class_name,
        'class': cls,
        'class_json': json.dumps(cls),
        'interactions': interactions,
        'interaction_types_json': json.dumps(types),
        'interactions_json': json.dumps(interactions),
        'username': request.user.username
    })

from django.core.urlresolvers import reverse_lazy
from django.views import generic
from django.conf import settings

class NewGraphRules(generic.CreateView, views.LoginRequiredMixin, views.FormValidMessageMixin):
    form_class = forms.GraphRulesForm
    model = models.GraphParticipationRules
    template_name = 'creator/new_graph_rules.html'
    form_valid_message = 'All information is valid.'

    def get_success_url(self):
        self.messages.success("Rule set created.")
