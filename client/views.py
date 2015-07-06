from django.shortcuts import render


def bubble_sort(request):
    return render(request, 'client/bubblesort.html', {})


def game_of_life(request):
    return render(request, 'client/gameoflife.html', {})