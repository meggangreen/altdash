""" World Bank Sustainable Development Goals Dashboard """

from jinja2 import StrictUndefined

from flask import Flask, jsonify, render_template, redirect, request, flash, session
from flask_debugtoolbar import DebugToolbarExtension

from sqlalchemy.sql import func

from model import connect_to_db, db, User, Rating, Movie



app = Flask(__name__)

# Required to use Flask sessions and the debug toolbar
app.secret_key = "WBSDG"

# Normally, if you use an undefined variable in Jinja2, it fails silently. 
# This is horrible. Make it raise an error instead.
app.jinja_env.undefined = StrictUndefined


@app.route('/')
def index():
    """ Index """

    return render_template("index.html")

#########
# Helper Functions
#########

if __name__ == "__main__":
    # We have to set debug=True here; it has to be True at the point we invoke 
    # the DebugToolbarExtension
    app.debug = True
    # Ensure templates, etc. are not cached in debug mode
    app.jinja_env.auto_reload = app.debug

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    # Set server to localhost:5000
    app.run(port=5000, host='0.0.0.0')
