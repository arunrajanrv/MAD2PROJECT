#!/bin/sh

echo "======================================================================"
echo "Welcome to to the setup. This will setup the local virtual env."
echo "----------------------------------------------------------------------"
if [ -d ".env" ];
then
    echo "Enabling virtual env"
else
    echo "No Virtual env. Please run setup.sh first"
    exit N
fi

# Activate virtual env
. .env/bin/activate
export ENV=development
celery -A main.celery beat --max-interval 1 -l info
deactivate
