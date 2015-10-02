from django.db import models

class Graph(models.Model):
    """
    Primary class for graph interactions.
    Delegates to predefined rule set (`GraphParticipationRules`) for constraints
    """

    rules = models.ForeignKey('GraphParticipationRules', related_name='graph')
    interaction = models.OneToOneField('Interaction', related_name='graph')

    @property
    def num_vertices(self):
        return self.vertices.count()

    @property
    def num_edges(self):
        return self.edges.count()


class GraphVertex(models.Model):
    """
    Vertex class for graphs.
    Can be assigned UI properties such as colors and labels.
    """

    is_assigned = models.BooleanField(default=False)
    index = models.IntegerField(null=False, default=0)
    weight = models.IntegerField(default=1)
    border_color = models.CharField(default='black', max_length=50)
    background_color = models.CharField(default='grey', max_length=50)
    label = models.CharField(null=True, max_length=20)
    graph = models.ForeignKey(Graph, related_name='vertices')
    deleted = models.BooleanField(default=False)

    assigned_to = models.ForeignKey('RegisteredDevice',
                                    null=True,
                                    blank=True,
                                    related_name='graph_vertices')

    @property
    def edges(self):
        return self.source_edges.all() + self.target_edges.all()

    @property
    def in_degree(self):
        return self.target_edges.count()

    @property
    def out_degree(self):
        return self.source_edges.count()

    @property
    def degree(self):
        return self.out_degree + self.in_degree


class GraphEdge(models.Model):
    """
    Edge class representing an edge between two instances of GraphVertex.
    If the graph is undirected (See `Graph#is_directed`) then source
    and target fields are obviously bi-directional.
    """

    weight = models.IntegerField(default=1)
    line_color = models.CharField(default='grey', max_length=30)
    label = models.CharField(null=True, max_length=30)
    graph = models.ForeignKey(Graph, related_name='edges')
    source = models.ForeignKey(GraphVertex, related_name='source_edges')
    target = models.ForeignKey(GraphVertex, related_name='target_edges')


class GraphParticipationRules(models.Model):
    """
    Participation rules for a given graph interaction.
    Consists of permission fields which restrict or allow clients to
    manipulate the graph's structure.
    Not all of these fields may be implemented by applications
    """

    # constants

    NONE = 'none'
    ANY = 'any'
    OWN = 'own'
    CONSTANT = 'const'
    FORCE = 'force'
    COLA = 'cola'
    CLUSTERED = 'cluster'
    WEIGHT = 'weight'
    WEIGHT_INV = 'inv_weight'
    DEGREE = 'degree'

    # permissions

    _ANY_OWN_NONE = (
        (NONE, 'None'),
        (ANY, 'Any'),
        (OWN, 'Assigned'),
    )

    _LAYOUT_TYPES = (
        (CONSTANT, 'Constant Edge Length'),
        (FORCE, 'Force Layout'),
        (COLA, 'Monash cola.js Layout'),
        (CLUSTERED, 'Clustered Layout'),
    )

    _THICKNESS_FN = (
        (CONSTANT, 'Constant Thickness'),
        (WEIGHT, 'Scale by Weight'),
        (WEIGHT_INV, 'Scale by (1/Weight)'),
    )

    _RADIUS_FN = (
        (CONSTANT, 'Constant Weight'),
        (DEGREE, 'Scale by Degree'),
        (WEIGHT, 'Scale by Weight'),
        (WEIGHT_INV, 'Scale by (1/Weight)'),
    )

    # relations

    interaction_type = models.ForeignKey('InteractionType',
                                         related_name='graph_rulesets')
    creator = models.ForeignKey('Creator',
                                related_name='graph_rules')

    # meta

    title = models.TextField(max_length=100)
    description = models.TextField(default='', blank=True, max_length=500)

    # graph layout

    layout_type = models.CharField(default=COLA, choices=_LAYOUT_TYPES, max_length=10)

    # graph structure

    is_directed = models.BooleanField(default=False)
    is_edge_weighted = models.BooleanField(default=False)
    is_vertex_weighted = models.BooleanField(default=False)
    is_multi_graph = models.BooleanField(default=False)
    is_clustered = models.BooleanField(default=False)

    # initial graph

    begin_with_vertices = models.TextField(
        blank=True,
        default='',
        help_text='Comma separated list of vertex labels. E.g. "a,b,c,d"')

    begin_with_edges = models.TextField(
        blank=True,
        default='',
        help_text='Comma separated vertex pairs, one per line. E.g. "a,b [newline] b,c"')

    # labellings

    client_can_label_vertex = models.CharField(default=OWN, choices=_ANY_OWN_NONE, max_length=5)
    client_can_label_edge = models.CharField(default=NONE, choices=_ANY_OWN_NONE, max_length=5)

    # colorings

    client_can_color_vertex = models.CharField(default=NONE, choices=_ANY_OWN_NONE, max_length=5)
    client_can_color_edge = models.CharField(default=NONE, choices=_ANY_OWN_NONE, max_length=5)

    # thickness

    edge_thickness_func = models.CharField(default=CONSTANT, choices=_THICKNESS_FN, max_length=10)
    vertex_radius_func = models.CharField(default=CONSTANT, choices=_RADIUS_FN, max_length=10)

    # additions

    client_can_add_vertex = models.BooleanField(default=False)
    client_can_add_edge_from = models.CharField(default=OWN, choices=_ANY_OWN_NONE, max_length=5)
    client_can_add_edge_to = models.CharField(default=ANY, choices=_ANY_OWN_NONE, max_length=5)

    # deletions

    client_can_remove_vertex = models.CharField(default=NONE, choices=_ANY_OWN_NONE, max_length=5)
    client_can_remove_edge_from = models.CharField(default=NONE, choices=_ANY_OWN_NONE, max_length=5)
    client_can_remove_edge_to = models.CharField(default=NONE, choices=_ANY_OWN_NONE, max_length=5)

    # assignments

    client_num_vertices_each = models.IntegerField(default=1)
    vertex_label_format_string = models.CharField(default='{1}_{2}',
                                                  max_length=20,
                                                  help_text="Use {1} for student label and {2} for number")
