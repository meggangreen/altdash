""" Utility file to seed data into production and test databases. """

from sqlalchemy import func
from model import Group, Country, GroupCountry, Datum
from model import Color, Goal, Indicator, GoalIndic
from model import connect_to_db, db
from server import app



def load_countries():
    """ Load countries records from csv file. """

    # Delete all rows to start fresh
    Country.query.delete()

    # Read csv file and insert data
    countries_csv = open('rawdata/countries.csv').readlines()
    for row in countries_csv:
        row = row.rstrip()

        country_id, name, region, income, wikiurl = row.split(",")

        # Instantiate 'Country' object and supply attributes
        country = Country(country_id=country_id,
                          name=name,
                          region=region,
                          income=income,
                          wikiurl=wikiurl)

        db.session.add(country)  # stage for insertion

    # Commit all countries to 'countries'
    db.session.commit()


if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    load_countries()
