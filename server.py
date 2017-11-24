""" World Bank Sustainable Development Goals Dashboard """

from model import *
from functions import *

import requests
import json
from random import choice
# from collections import defaultdict
import pdb

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
    y_lbound, y_ubound = get_year_bounds()

    return render_template("index2.html", countries=countries,
                                          selected=selected,
                                          goals=goals,
                                          slider_min=y_lbound,
                                          slider_max=y_ubound)


@app.route('/country-data.json', methods=['GET'])
def get_country_data():
    """ Manages request for data -- request, math and scale manipulation, and
        packaging -- about a provided country and returns it packaged to the
        chart and tiles.

    """

    print "\n\n"
    # pull id from GET request arguments
    country_id = request.args.get('country_id')
    print "   ", country_id

    if not country_id:
        return jsonify(message="No Country Sent")

    # send request for data, receive all objects
    query_objs = Datum.get_db_objs(country_id=country_id)
    print "   ", len(query_objs)

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
    print "   ", len(query_objs)

    # Get least- and most-recent years
    y_lbound, y_ubound = get_year_bounds()

    c_datasets = {}
    c_tilevals = {}
    for i in range(y_lbound, y_ubound + 1):
        c_datasets[str(i)] = []
        c_tilevals[str(i)] = {}

    # Clear the values from the c_ dictionaries
    c_datasets.update((year, []) for year in c_datasets)
    c_tilevals.update((year, {}) for year in c_tilevals)
    print "   ", c_datasets['2011'], c_tilevals['2011']

    # send data for unpacking and repackaging, receive packages
    # makes 'cDatasets'
    for q_obj in query_objs:
        x = q_obj.indicator.goals[0].goal_pre
        y = q_obj.value
        i = q_obj.indicator.title
        year = str(q_obj.year)
        c_datasets[year].append({'x': int(x), 'y': y, 'i': i})
    print "   ", len(c_datasets['2011'])

    # makes 'cTileVals'
    for year in c_tilevals.iterkeys():      # for each year
        sum_dict = {}                       # make empty sum & count
        count_dict = {}
        for xy_dict in c_datasets[year]:    # for each set of coords
            goal = xy_dict['x']             # set the g-v to x-y
            value = xy_dict['y']            # then update sum & count
            sum_dict[goal] = sum_dict.get(goal, 0) + float(value)
            count_dict[goal] = count_dict.get(goal, 0) + 1
        for goal in count_dict.keys():      # for each goal
            try:                            # try to get the average
                goal_avg = sum_dict[goal] / count_dict[goal]
            except:
                # if there's a prob with the math, just skip it
                # this also prevents 0-value goal scores
                continue
            goal_id = "g{:0>2}".format(str(goal))
            c_tilevals[year][goal_id] = goal_avg
    print "   ", c_tilevals['2011']
    print "\n\n"

    return jsonify(cDatasets=c_datasets, cTileVals=c_tilevals)


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
        connect_to_db(app, 'postgres:///sdgTEST')  # Didn't ever implement
    else:
        connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    # Set server to localhost:5000
    app.run(port=5000, host='0.0.0.0')

    #
