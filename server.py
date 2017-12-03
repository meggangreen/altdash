""" World Bank Sustainable Development Goals Dashboard """

from model import *
from functions import *

import requests
import json

from flask import Flask, render_template, redirect, request
from flask import jsonify, flash, session
from flask_debugtoolbar import DebugToolbarExtension
from jinja2 import StrictUndefined


app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "AltDash SDG UN WB"

# Normally, if you use an undefined variable in Jinja2, it fails silently.
# This is horrible. Make it raise an error instead.
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """ Index (until React works). """

    countries = Country.get_db_objs()
    goals = GoalDesign.get_db_objs()

    return render_template("index.html", countries=countries,
                                          goals=goals,
                                          slider_min=y_lbound,
                                          slider_max=y_ubound)


@app.route('/country-data.json', methods=['GET'])
def get_country_data():
    """ Manages request for data -- request, math and scale manipulation, and
        packaging -- about a provided country and returns it packaged to the
        chart and tiles.

    """

    # Pull country id from GET request arguments
    country_id = request.args.get('country_id')

    if not country_id:
        return jsonify(message="No Country Sent")

    # Send request for country; receive all objects (should be all of one),
    # keep only the first
    c_obj = Country.get_db_objs(country_id=country_id)[0]

    c_information = {}
    c_information['name'] = c_obj.name
    c_information['region'] = c_obj.region
    c_information['income'] = c_obj.income
    c_information['wikiurl'] = c_obj.wikiurl
    c_information['groups'] = [g.name for g in c_obj.groups]
    if (not c_information['groups']) and (country_id != 'WLD'):
        g_obj = Group.get_db_objs(group_id=country_id)[0]
        c_information['groups'] = [c.name for c in g_obj.countries]


    # Send request for data points; receive all query objects
    query_objs = Datum.get_db_objs(country_id=country_id)

    # Eventually, all the data points will have their scaled and display values,
    # but not yet, so we need to call do_data_math for them
    do_data_math(query_objs)

    # Clear the values from the c_ dictionaries
    c_datasets.update((year, []) for year in c_datasets)
    c_tilevals.update((year, {}) for year in c_tilevals)

    # send data for unpacking and repackaging, receive packages
    # makes 'cDatasets'
    for q_obj in query_objs:
        x = q_obj.indicator.goals[0].goal_pre
        y = round(q_obj.display_value, 2)
        v = round(q_obj.value, 2)
        s = round(q_obj.scaled_value, 2)
        i = q_obj.indicator.indicator_id
        i_text = (q_obj.indicator.title if q_obj.indicator.scale_inverse is False
                                        else q_obj.indicator.title + " (inverted)")
        year = str(q_obj.year)
        c_datasets[year].append({'x': int(x),
                                 'y': y,
                                 'v': v,
                                 's': s,
                                 'i': i,
                                 'i_text': i_text})

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
            goal_id = "g{:0>2}".format(str(goal))  # gEE
            c_tilevals[year][goal_id] = round(goal_avg, 1)

    return jsonify(cDatasets=c_datasets,
                   cTileVals=c_tilevals,
                   cInformation=c_information)


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

    # Get year bounds and set up data dictionaries
    y_lbound, y_ubound = get_year_bounds()
    c_datasets = {}
    c_tilevals = {}
    for i in range(y_lbound, y_ubound + 1):
        c_datasets[str(i)] = []
        c_tilevals[str(i)] = {}

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    # Set server to localhost:5000
    app.run(port=5000, host='0.0.0.0')
