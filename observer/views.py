from django.shortcuts import render
from django.http import Http404


def react_app(request, class_name):
    class_list = [
        {
            'class_name': 'bubblesort',
            'long_name': 'Bubble Sort'
        },
        {
            'class_name': 'gameoflife',
            'long_name': 'Game of Life'
        }
    ]

    if not filter(lambda d: d['class_name'] == class_name, class_list):
        raise Http404("Class does not exist.")

    return render(request, 'observer/class_app.html', {
        'class_name': class_name,
        'class_list': class_list
    })
