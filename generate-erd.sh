#!/bin/sh
python manage.py graph_models -a -g -o ./docs/all-models.png
python manage.py graph_models api |\
    grep -v "App ready()" |\
    tee ./docs/api-models.dot |\
    dot -Tpdf > ./docs/api-models.pdf

python manage.py graph_models api -g -o ./docs/api-models.png

