#! /bin/sh
echo "======================================================================"
echo "Welcome to to the setup. This will setup the local virtual env."
echo "----------------------------------------------------------------------"
if [ -d ".env" ];
then
    echo "Enabling virtual env"
else
    echo "creating .env and install using pip"
    python3 -m venv .env
fi

# Activate virtual env
. .env/bin/activate

# Activate virtual env
pip install --upgrade pip
pip install -r requirements.txt
deactivate
