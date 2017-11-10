""" Utility file to seed data into production and test databases. """

from sqlalchemy import func
from model import connect_to_db, db
from server import app

from model import Group, Country, GroupCountry, Datum
from model import Color, Goal, Indicator, GoalIndic


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


def load_groups_and_countries():
    """ Load groups_countries records from csv file. Creates records in groups
        AND countries AND groups_countries.

    """

    # Delete all rows to start fresh
    Group.query.delete()
    Country.query.delete()
    GroupCountry.query.delete()

    # Empty dictionary that will populate the countries' attributes
    countries = {}
    wikiurl = "https://en.wikipedia.org/wiki/"

    # Read csv file and insert data
    gc_csv = open('rawdata/groups_countries.csv').readlines()
    for row in gc_csv:
        row = row.rstrip()

        # Unpack row
        g_id, g_name, c_id, c_name = row.split(",")

        # Instantiate 'GroupCountry' object and supply attributes
        group_country = GroupCountry(group_id=g_id, country_id=c_id)
        db.session.add(group_country)  # stage for insertion

        # Create and stage for insertion each new group
        if not Group.query.filter(Group.group_id == g_id).first():
            group = Group(group_id=g_id, name=g_name)
            db.session.add(group)  # stage for insertion

        # Start country object if new
        if not countries.get(c_id):
            countries[c_id] = countries.get(c_id, {'name': c_name})

        # IFF group is also an income or a region, create or update country
        if g_name in ['High income',
                      'Upper middle income',
                      'Lower middle income',
                      'Low income']:
            countries[c_id]['income'] = countries[c_id].get('income', g_name)
        if g_name in ['East Asia & Pacific',
                      'Europe & Central Asia',
                      'Latin America & Caribbean',
                      'Middle East & North Africa',
                      'North America',
                      'South Asia',
                      'Sub-Saharan Africa']:
            countries[c_id]['region'] = countries[c_id].get('region', g_name)

        # Create and stage for insertion each new country
        for c_id in countries:
            country = Country(country_id=c_id,
                              name=c_id['name'],
                              region=c_id['region'],
                              income=c_id['income'],
                              wikiurl=wikiurl + c_id['name'])
            db.session.add(country)

    # Commit all new records
    db.session.commit()

###########################
# Helper Functions
###########################

if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    load_countries()
