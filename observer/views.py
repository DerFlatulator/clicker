from django.shortcuts import render
from django.http import Http404

from api.models import ClickerClass

from itertools import ifilter


def observer_index(request):
    class_list = ClickerClass.objects.all()[:50]

    return render(request, 'observer/observer_index.html', {
        'class_list': class_list
    })


def react_app(request, class_name):
    class_list = ClickerClass.objects.all()[:5]

    context_class = next(ifilter(lambda d: d.class_name == class_name, class_list), None)
    if not context_class:
        raise Http404("Class does not exist.")

    return render(request, 'observer/class_app.html', {
        'class_name': class_name,
        'long_name': context_class.long_name,
        'class_list': class_list
    })
