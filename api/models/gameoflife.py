from django.db import models
import string

class GameOfLife(models.Model):
    num_rows = models.IntegerField(null=False, default=3)
    num_cols = models.IntegerField(null=False, default=4)
    interaction = models.OneToOneField('Interaction', related_name='gameoflife', null=True)  # null if is_buffer
    is_async = models.BooleanField(default=True)
    is_buffer = models.BooleanField(default=False)
    buffer = models.OneToOneField('GameOfLife', null=True, related_name='source')

    def save(self, *args, **kwargs):
        is_new = not self.pk  # new if instance hasn't been assigned a p.k.
        if not is_new:
            old_self = GameOfLife.objects.get(pk=self.pk)
            (old_rows, old_cols) = (old_self.num_rows, old_self.num_cols)
        else:
            (old_rows, old_cols) = (None, None)

        super(GameOfLife, self).save(*args, **kwargs)

        if is_new:
            for y in range(self.num_rows):
                for x in range(self.num_cols):
                    GameOfLifeCell(alive=False, col=x, row=y, game_of_life=self).save()
        else:
            # Insertions
            if self.num_rows > old_rows or self.num_cols > old_cols:
                for x in range(0, self.num_cols):
                    for y in range(0, self.num_rows):
                        if x >= old_cols or y >= old_rows:
                            GameOfLifeCell(alive=False, col=x, row=y, game_of_life=self).save()

            # Deletions
            if self.num_rows < old_rows or self.num_cols < old_cols:
                for x in range(0, old_cols):
                    for y in range(0, old_rows):
                        if x >= self.num_cols or y >= self.num_rows:
                            GameOfLifeCell.objects.get(col=x, row=y, game_of_life=self).delete()

    @property
    def get_cells(self):
        return GameOfLifeCell.objects.filter(game_of_life=self.id)

    @property
    def get_current_state(self):
        cells = self.get_cells
        gol = [[False] * self.num_cols for _ in range(self.num_rows)]
        for cell in cells:
            if cell.alive:
                gol[cell.row][cell.col] = True

        return gol

    def get_info(self):
        return "({} x {})".format(self.num_cols, self.num_rows)

    def __unicode__(self):
        str_list = [''.join(map(lambda v: "1" if v else "0", row)) for row in self.get_current_state]
        return '\n'.join(str_list)


class GameOfLifeCell(models.Model):
    alive = models.BooleanField(null=False, default=False)
    col = models.IntegerField(null=False, default=0, editable=False)
    row = models.IntegerField(null=False, default=0, editable=False)
    cell_name = models.CharField(max_length=10, editable=False)
    changed = models.NullBooleanField(null=True)
    game_of_life = models.ForeignKey(GameOfLife, related_name='cells', editable=False)
    is_ai = models.BooleanField(default=False, blank=True, editable=False)

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

