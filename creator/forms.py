

from api import models

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, HTML
from django import forms

def submit_button(text):
    return HTML("""
    <div class="row">
        <div class="col m6 offset-m6 offset-s4">
            <br />
            <button class="btn-large waves-effect waves-light" type="submit" name="action">
              {}
              <i class="material-icons right">send</i>
            </button>
        </div>
    </div>""".format(text))


class GraphRulesForm(forms.ModelForm):
    class Meta:
        model = models.GraphParticipationRules
        exclude = ()
    def __init__(self, *args, **kwargs):
        super(GraphRulesForm, self).__init__(*args, **kwargs)

        # self.helper = FormHelper()
        # self.helper.layout = Layout(
        #     'is_directed',
        #     'is_edge_weighted',
        #     'is_vertex_weighted',
        #     'is_multi_graph',
        #     'begin_with_vertices',
        #     'begin_with_edges',
        #     'client_can_label_vertex',
        #     'client_can_label_edge',
        #     'client_can_color_vertex',
        #     'client_can_color_edge',
        #     'edge_thickness_func',
        #     'vertex_radius_func',
        #     'client_can_add_vertex',
        #     'client_can_add_edge_from',
        #     'client_can_add_edge_to',
        #
        #     'client_can_remove_vertex',
        #     'client_can_remove_edge_from',
        #     'client_can_remove_edge_to',
        #
        #     'client_num_vertices_each',
        #     'vertex_label_format_string',
        #     submit_button('Create')
        # )
