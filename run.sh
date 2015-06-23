#!/bin/bash

redis-server &
node observer/nodejs/push & 
python manage.py runserver 
