from django.db import models
from django.core.exceptions import ValidationError

import string


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


class GameOfLife(models.Model):
    num_rows = models.IntegerField(null=False, default=3)
    num_cols = models.IntegerField(null=False, default=4)

    def save(self, *args, **kwargs):
        is_new = not self.pk  # new if instance hasn't been assigned a p.k.

        super(GameOfLife, self).save(*args, **kwargs)

        if is_new:
            for y in range(self.num_rows):
                for x in range(self.num_cols):
                    GameOfLifeCell(alive=False, col=x, row=y, game_of_life=self).save()

    @property
    def get_current_state(self):
        cells = GameOfLifeCell.objects.filter(game_of_life=self.id)
        gol = [[False] * self.num_cols for _ in range(self.num_rows)]
        for cell in cells:
            if cell.alive:
                gol[cell.row][cell.col] = True

        return gol

    def __unicode__(self):
        str_list = [''.join(map(lambda v: "1" if v else "0", row)) for row in self.get_current_state]
        return '\n'.join(str_list)


class GameOfLifeCell(models.Model):
    alive = models.BooleanField(null=False, default=False)
    col = models.IntegerField(null=False, default=0)
    row = models.IntegerField(null=False, default=0)
    cell_name = models.CharField(max_length=10)
    changed = models.NullBooleanField(null=True)
    game_of_life = models.ForeignKey(GameOfLife)

    def get_cell_name(self):
        cell_name = ""
        c = self.col
        while c >= 0:
            cell_name += string.uppercase[c]
            c -= 26

        return cell_name + str(self.row + 1)

    @property
    def get_uid(self):
        return str(self.game_of_life_id) + "," + self.cell_name

    def save(self, *args, **kwargs):
        is_new = not self.pk  # new if instance hasn't been assigned a p.k.
        self.changed = False
        if is_new:
            self.cell_name = self.get_cell_name()
            self.changed = True
        else:
            was_alive = GameOfLifeCell.objects.get(pk=self.pk).alive
            if self.alive != was_alive:
                self.changed = True

        super(GameOfLifeCell, self).save(*args, **kwargs)

    def __unicode__(self):
        return "Game of life cell: instance={}, @({}, {}), alive={}".format(
            self.game_of_life_id, self.col, self.row, self.alive)

