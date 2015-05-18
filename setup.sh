#!/bin/bash

python_module_installed() {
    python -c "__import__('$1')"
}

npm_module_installed() {
    hash $1 2>/dev/null
}

install_or_die_python() {
    if ! python_module_installed "$1"; then
        echo "Installing $1"
        if ! sudo pip install Django ; then
            echo "Failed to install $1"; exit
        fi
    fi
}

install_or_die_npm() {
    if ! npm_module_installed "$1"; then
        echo "Installing $1"
        if ! sudo npm install "$1" -g; then
            echo "Failed ot install $1"; exit
        fi
    fi
}

echo "Setting up, this may take a little while..."

install_or_die_python "django"
install_or_die_python "rest_framework"

echo "Installing node modules"
if ! npm install; then
    echo "Failed to install npm modules"; exit
fi

install_or_die_npm "bower"
install_or_die_npm "bower-installer"
install_or_die_npm "gulp"

echo "Installing bower components"
if ! bower install && bower-installer; then
    echo "Failed to install bower components"; exit
fi

echo "Migrating database"
if ! python manage.py migrate; then
    echo "Failed to migrate database"; exit
fi

echo -n "Do you want to create a Django super-user? (yes/no) "
read l; if [[ $l =~ "yes" ]] ; then
    python manage.py createsuperuser
fi

gulp default