#!/bin/bash

#
# TODO: Check if already installed before going ahead
#

echo "Setting up, this may take a little while..."

echo "Installing Django"
sudo pip install Django || { echo "Failed to install Django"; exit }

sudo pip install djangorestframework || { echo "Failed to install Django REST Framework"; exit }

echo "Installing node modules"
npm install || { echo "Failed to install npm modules"; exit }

echo "Installing bower"
sudo npm install -g bower || { echo "Failed to install bower"; exit }

echo "Installing bower components"
bower install && bower-installer || { echo "Failed to install bower components"; exit }

echo "Migrating database"
python manage.py migrate || { echo "Failed to migrate database"; exit }
#python manage.py createsuperuser

