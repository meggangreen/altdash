""" World Bank Sustainable Development Goals Dashboard """

from model import *
from functions import *

import requests
import json
from random import choice

from flask import Flask, render_template, redirect, request
from flask import jsonify, flash, session
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "WBSDG-Dashboards"

# Normally, if you use an undefined variable in Jinja2, it fails silently.
# This is horrible. Make it raise an error instead.
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """ Index

        'index2.html' will render until React works.

    """

    countries = Country.get_db_objs()
    selected = choice(countries).country_id
    goals = GoalDesign.get_db_objs()

    return render_template("index2.html", countries=countries,
                                          selected=selected,
                                          goals=goals)


@app.route('/country-data.json', methods=['GET'])
def get_country_data():
    """ Manages request for data -- request, math and scale manipulation, and
        packaging -- about a provided country and returns it packaged to the
        chart and tiles.

    """

    # pull id from GET request arguments
    country_id = request.args.get('country_id')

    # send request for data, receive all objects
    data_objs = Datum.get_db_objs(country_id=country_id)

    # send data to math manip, receive revised objects
    # send data for unpacking and repackaging, receive packages
    data_pkg = None  # but will be the packaged-up data

    return jsonify(message=country_id)


#########
# Helper Functions
#########

if __name__ == "__main__":
    import sys

    # app.debug has to be True at the point we invoke the DebugToolbarExtension
    app.debug = True

    # Ensure templates, etc. are not cached in debug mode
    app.jinja_env.auto_reload = app.debug

    # connect to test db if testing
    if 'test' in sys.argv[-1]:
        connect_to_db(app, 'postgres:///sdgTEST')
    else:
        connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    # Set server to localhost:5000
    app.run(port=5000, host='0.0.0.0')
