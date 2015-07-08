from django.contrib import admin

from .models import (
    BubbleSort,
    BubbleSortSwap,
    GameOfLife,
    GameOfLifeCell
)

admin.site.register(BubbleSort)
admin.site.register(BubbleSortSwap)
admin.site.register(GameOfLife)
admin.site.register(GameOfLifeCell)