from django.db.models.signals import post_save
from django.conf import settings
from django.dispatch import receiver

from api import models


@receiver(post_save, sender=settings.AUTH_USER_MODEL, dispatch_uid="api:User#post_save")
def user_post_save(sender, instance, created, **kwargs):
    if created:
        models.Creator(user=instance).save()

@receiver(post_save, sender=models.GameOfLife, dispatch_uid="api:GameOfLife#post_save")
def gol_post_save(sender, instance, created, **kwargs):
    if created:
        return

    if instance.is_async  or instance.is_buffer:
        return

    perform_update(instance.buffer)

@receiver(post_save, sender=models.GameOfLifeCell, dispatch_uid="api:GameOfLifeCell#post_save")
def cell_post_save(sender, instance, created, **kwargs):
    if created:
        return

    if instance.is_ai:
        return  # don't want infinite tail-calls, do we?

    gol = instance.game_of_life

    if not instance.changed:
        return

    if not gol.is_async:
        return

    perform_update(gol)

def perform_update(gol):
    # fetch adjacent cells
    # col, row = instance.col, instance.row
    cell_2d = {}
    for cell in gol.cells.all():
        if cell.row not in cell_2d:
            cell_2d[cell.row] = {}
        cell_2d[cell.row][cell.col] = cell

    cells_to_make_live = []
    cells_to_make_die = []

    # for cell in generate_all_cells(cell_2d, row, col, gol.num_rows, gol.num_cols):
    for cell in gol.cells.filter(is_ai=True):
        num_neighbours = len(filter(lambda n: n.alive,
                                    generate_neighbours(cell_2d, cell.row, cell.col, gol.num_rows, gol.num_cols)))

        if cell.alive and (num_neighbours < 2 or num_neighbours > 3):
            # cells_to_make_die.append(cell)
            cell.alive = False
            cell.save()
        elif num_neighbours == 3:
            # cells_to_make_live.append(cell)
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
