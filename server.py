""" World Bank Sustainable Development Goals Dashboard """

from model import *
from functions import *

import requests
import json
from random import choice
from collections import defaultdict

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
    query_objs = Datum.get_db_objs(country_id=country_id)

    # send data to math manip, receive revised objects
    # right now, this just cleans out inverted-scale and math-having values
    to_del = []
    for i, q_obj in enumerate(query_objs):
        if ((q_obj.indicator.display_math == "m") or
            (q_obj.indicator.scale_inverse is True)):
            to_del.append(i)
    to_del.sort(reverse=True)
    for n in to_del:
        del query_objs[n]

    # define a list of all of the years possible
    # BUT i only want to do this once ever
    y_start = Datum.query.order_by(Datum.year).first().year  # 1960
    y_end = Datum.query.order_by(Datum.year.desc()).first().year  # 2016

    # maybe i have to do this part a lot
    c_datasets = {}
    c_tilevals = {}
    for i in range(y_start, y_end + 1):
        c_datasets[str(i)] = []
        c_tilevals[str(i)] = {}

    # send data for unpacking and repackaging, receive packages
    # makes 'cDatasets'
    for q_obj in query_objs:
        x = q_obj.indicator.goals[0].goal_pre
        y = q_obj.value
        year = str(q_obj.year)
        c_datasets[year].append((int(x), y))  # this is a tuple; needs to be an obj
    c_datasets.sort()

    # makes 'cTileVals'
    for year in c_tilevals.iterkeys():
        sum_dict = defaultdict(float)
        count_dict = defaultdict(int)
        for goal, value in c_datasets[year]:
            sum_dict[goal] += value
            count_dict[goal] += 1

        # use numpy mean? this is a generator and has no len or count
        # goal_sum = sum(v for g, v in c_datasets[year] if g == int(goal_pre))



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
