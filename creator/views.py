from django.shortcuts import render


def index(request):
    """
    :path: /creator/
    :param request: the Django Request object
    :return: rendered HTML
    """
    return render(request, 'creator/creator_index.html', {})


def class_detail(request, class_name):
    """
    :path: /creator/<class_name>/
    :param request: the Django Request object
    :return: rendered HTML
    """
    return render(request, 'creator/class_detail.html', {
        'class_name': class_name
    })
