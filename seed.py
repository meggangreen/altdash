""" Utility file to seed data into production and test databases. """

from sqlalchemy import func
from model import connect_to_db, db
from server import app

from model import Country, Color, Goal, Indicator, GoalIndic, Datum



