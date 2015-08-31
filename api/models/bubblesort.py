from django.db import models

class BubbleSort(models.Model):
    shuffled = models.CommaSeparatedIntegerField(null=False, max_length=1000, default="1,3,2")  # CSV
    interaction = models.OneToOneField('Interaction', related_name='bubblesort')

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
    def get_swaps(self):
        return self.swaps.all()

    @property
    def get_list_current(self):
        """
        Get the current representation of the list by querying `BubbleSortSwap`
        :todo: Cache the result and timestamp before re-querying
        :return: A str representation of the current list
        """
        current = self.shuffled.split(',')
        for swap in self.get_swaps:
            tmp = current[swap.lower_index]
            current[swap.lower_index] = current[swap.lower_index + 1]
            current[swap.lower_index + 1] = tmp

        self._current = current
        return current

    def get_info(self):
        return "({})".format(",".join(self.get_list_current))

    def __unicode__(self):
        return ','.join(self._current) if hasattr(self, '_current') else self.shuffled


class BubbleSortSwap(models.Model):
    lower_index = models.IntegerField(null=False)
    bubble_sort = models.ForeignKey(BubbleSort, related_name='swaps')

    def __unicode__(self):
        return "[{}] Swap {} and {}.".format(self.bubble_sort_id, self.lower_index, self.lower_index + 1)
