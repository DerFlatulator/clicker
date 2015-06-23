from django.db import models
from django.core.exceptions import ValidationError


class BubbleSort(models.Model):
    shuffled = models.CommaSeparatedIntegerField(null=False, max_length=1000, default="1,3,2")  # CSV

    def __init__(self, *args, **kwargs):
        super(self.__class__, self).__init__(*args, **kwargs)

    def save(self, **kwargs):
            super(BubbleSort, self).save(**kwargs)

    @property
    def get_list_size(self):
        return len(self.shuffled.split(','))

    @property
    def get_list_sorted(self):
        return ','.join(sorted(self.shuffled.split(',')))

    @property
    def get_list_current(self):
        """
        Get the current representation of the list by querying `BubbleSortSwap`
        :todo: Cache the result and timestamp before re-querying
        :return: A str representation of the current list
        """
        current = self.shuffled.split(',')
        swaps = BubbleSortSwap.objects.filter(bubble_sort=self.id)
        for swap in swaps:
            tmp = current[swap.lower_index]
            current[swap.lower_index] = current[swap.lower_index + 1]
            current[swap.lower_index + 1] = tmp

        self._current = current
        return current

    def __unicode__(self):
        return ','.join(self._current) if hasattr(self, '_current') else self.shuffled


class BubbleSortSwap(models.Model):
    lower_index = models.IntegerField(null=False)
    bubble_sort = models.ForeignKey(BubbleSort)

    def clean(self):
        if self.lower_index < 0 or self.lower_index >= self.bubble_sort.size:
            raise ValidationError({'lower_index': 'Must be a valid index'})

    def __unicode__(self):
        return "[{}] Swap {} and {}.".format(self.bubble_sort_id, self.lower_index, self.lower_index + 1)