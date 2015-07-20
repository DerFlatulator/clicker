from django.shortcuts import render
from django.core.serializers import serialize

from api import models


def index(request):
    """
    :path: /creator/
    :param request: the Django Request object
    :return: rendered HTML
    """
    classes = models.ClickerClass.objects.filter(creator__user__username=request.user.username)

    return render(request, 'creator/creator_index.html', {
        'classes': classes,
        'classes_json': serialize('json', classes),
        'username': request.user.username
    })


def class_detail(request, class_name):
    """
    :path: /creator/<class_name>/
    :param request: the Django Request object
    :return: rendered HTML
    """
    cls = models.ClickerClass.objects.get(class_name=class_name)
    interactions = cls.interactions.all()
    types = models.InteractionType.objects.all()

    return render(request, 'creator/class_detail.html', {
        'class_name': class_name,
        'class': cls,
        'class_json': serialize('json', [cls])[1:-1],  # strip [ and ]
        'interactions': interactions,
        'interactions_json': serialize('json', interactions),
        'interaction_types_json': serialize('json', types),
        'username': request.user.username
    })
