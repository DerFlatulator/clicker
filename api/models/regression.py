from django.db import models

class Regression(models.Model):
    """
    Regression interaction model.
    stages:
     0 - initial plot point input
     1 - actual regression plotting
     2 - final output
    """
    PLOT = 0
    REGRESSION = 1
    COMPLETE = 2
    STAGES = (
        (PLOT, 'Plot Item Input'),
        (REGRESSION, 'Regression'),
        (COMPLETE, 'Complete')
    )

    interaction = models.OneToOneField('Interaction', related_name='regression')
    x_label = models.TextField(max_length=100, null=False)
    y_label = models.TextField(max_length=100, null=False)
    chart_title = models.TextField(max_length=150, null=False, default="Linear Regression")
    stage = models.IntegerField(null=False, default=0, choices=STAGES)

    def __unicode__(self):
        return "Regression: id={}, stage={}".format(self.id, self.stage)


class RegressionPlotItem(models.Model):
    x_val = models.FloatField(null=False, default=0)
    y_val = models.FloatField(null=False, default=0)
    regression = models.ForeignKey(Regression, null=False, related_name='plot_items')


class RegressionEstimate(models.Model):
    y0 = models.FloatField(null=False, default=0)
    y1 = models.FloatField(null=False, default=0)
    regression = models.ForeignKey(Regression, null=False, related_name='estimates')
