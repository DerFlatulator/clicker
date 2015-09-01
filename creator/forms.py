
from api import models
from django import forms


class GraphRulesForm(forms.ModelForm):
    class Meta:
        model = models.GraphParticipationRules
        exclude = ('creator', 'interaction_type')

    def __init__(self, *args, **kwargs):
        super(GraphRulesForm, self).__init__(*args, **kwargs)

class InteractionTypeForm(forms.ModelForm):
    class Meta:
        model = models.InteractionType
        exclude = ('graph_rules', )