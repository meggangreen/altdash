""" World Bank Sustainable Development Goals Dashboard """

from model import connect_to_db, db
# from model import Country, Group, GroupCountry, Datum
# from model import Color, Goal, Indicator, GoalIndic
from functions import *
import pdb

from jinja2 import StrictUndefined

from flask import Flask, render_template, redirect, request
from flask import jsonify, flash, session
# from flask_sqlalchemy import SQLAlchemy
from flask_debugtoolbar import DebugToolbarExtension


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "WBSDG-Dashboards"

# Normally, if you use an undefined variable in Jinja2, it fails silently.
# This is horrible. Make it raise an error instead.
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def knowngood():
    """ When ish goes wrong, this is right. """

    return render_template("knowngood.html")


@app.route('/index')
def index():
    """ Index """

    countries = get_country_list()
    selected = 'Cuba'  # need to make this randomly selected

    return render_template("index.html", countries=countries, selected=selected)

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
