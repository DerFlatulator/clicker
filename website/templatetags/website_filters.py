from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()

MESSAGE_TAG_TO_MATERIALIZE_CLASS = {
    'success': 'green',
    'error': 'red',
    'warning': 'orange',
    'debug': 'blue',
    'info': ''
}

@register.filter
@stringfilter
def message_class(tags):
    return MESSAGE_TAG_TO_MATERIALIZE_CLASS.get(tags, '')