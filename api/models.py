from django.db import models
from django.core.exceptions import ValidationError


class BubbleSort(models.Model):
    values = models.CommaSeparatedIntegerField(null=False, max_length=1000, default="1,3,2")  # CSV
    size = models.IntegerField(blank=True, default=-1)

    def save(self, **kwargs):
        super(BubbleSort, self).save(**kwargs)
        values = self.values.split(',')
        self.size = len(values)

    def clean(self):
        values = self.values.split(',')
        self.size = len(values)

    def __unicode__(self):
        return self.values


class BubbleSortSwap(models.Model):
    lower_index = models.IntegerField(null=False)
    bubble_sort = models.ForeignKey(BubbleSort)

    def clean(self):
        if self.lower_index < 0 or self.lower_index >= self.bubble_sort.size:
            raise ValidationError({'lower_index': 'Must be a valid index'})

    def __unicode__(self):
        return "Swap {} and {}.".format(self.lower_index, self.lowest_index + 1)