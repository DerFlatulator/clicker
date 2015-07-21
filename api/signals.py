from django.db.models.signals import post_save
from django.conf import settings
from django.dispatch import receiver

from api import models


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def user_post_save(sender, instance, created, **kwargs):
    if created:
        models.Creator(user=instance).save()


@receiver(post_save, sender=models.GameOfLifeCell)
def cell_post_save(sender, instance, created, **kwargs):
    if created:
        return

    if instance.is_ai:
        return  # don't want infinite tail-calls, do we?

    gol = instance.game_of_life

    if not instance.changed:
        return

    # fetch adjacent cells
    col, row = instance.col, instance.row
    cell_2d = {}
    for cell in gol.cells.all():
        if cell.row not in cell_2d:
            cell_2d[cell.row] = {}
        cell_2d[cell.row][cell.col] = cell

    # for cell in generate_all_cells(cell_2d, row, col, gol.num_rows, gol.num_cols):
    for cell in gol.cells.filter(is_ai=True):
        num_neighbours = len(filter(lambda n: n.alive, [
            neighbour
            for neighbour
            in generate_neighbours(cell_2d, cell.row, cell.col, gol.num_rows, gol.num_cols)]))

        if cell.alive and (num_neighbours < 2 or num_neighbours > 3):
            cell.alive = False
            cell.save()
        elif num_neighbours == 3:
            cell.alive = True
            cell.save()


neighbours = (
    (-1, +1), (+0, +1), (+1, +1),
    (-1, +0), (+1, +0),
    (-1, -1), (+0, -1), (+1, -1),
)


def generate_neighbours(cell_2d, row, col, n_rows, n_cols):
    for c_o, r_o in neighbours:
        c, r = c_o + col, r_o + row
        if 0 <= c < n_cols and 0 <= r < n_rows:
            yield cell_2d[r][c]
