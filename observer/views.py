from django.shortcuts import render
from django.http import Http404

from api.models import ClickerClass


def observer_index(request):
    class_list = ClickerClass.objects.all()[:50]

    return render(request, 'observer/observer_index.html', {
        'class_list': class_list
    })


def react_app(request, class_name):
    class_list = ClickerClass.objects.all()[:5]

    if not filter(lambda d: d.class_name == class_name, class_list):
        raise Http404("Class does not exist.")

    return render(request, 'observer/class_app.html', {
        'class_name': class_name,
        'class_list': class_list
    })
