from django.contrib import contenttypes

from .models import (
    BubbleSort,
    BubbleSortSwap,
    GameOfLife,
    GameOfLifeCell,
    Interaction,
    Creator,
    ClickerClass,
    RegisteredDevice
)

from django.contrib.contenttypes import admin as django_admin

from django.contrib import admin

class InteractionAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {
            'fields': (
                'clicker_class',
                'data_json',
                'state',
                'creator'
                # ...
            )
        }),
        ('bubblesort/gameoflife', {
            'fields': ('content_type', 'object_id', )
        }),
    )
    autocomplete_lookup_fields = {
        'generic': [['content_type', 'object_id']],
    }

admin.site.register(BubbleSort)
admin.site.register(BubbleSortSwap)
admin.site.register(GameOfLife)
admin.site.register(GameOfLifeCell)
admin.site.register(Interaction, InteractionAdmin)
admin.site.register(Creator)
admin.site.register(ClickerClass)
admin.site.register(RegisteredDevice)

