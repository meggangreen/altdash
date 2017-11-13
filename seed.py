""" Utility file to seed data into production and test databases. """

from model import *
from server import app


def load_groups_and_countries():
    """ Load groups_countries records from csv file. Creates records in groups
        AND countries AND groups_countries.

    """

    # Delete all rows to start fresh
    Group.query.delete()
    Country.query.delete()
    GroupCountry.query.delete()

    # Empty dictionaries that will populate the countries and groups
    countries = {}
    groups = {}
    groups_countries = {}

    # WikiURL constant
    WIKIURL = "https://en.wikipedia.org/wiki/"

    # Read csv file and parse data
    gc_csv = open('rawdata/groups_countries.csv').readlines()
    for row in gc_csv:
        row = row.rstrip()

        # Unpack row
        g_id, g_name, c_id, c_name = row.split(",")

        # Add group-country pair to 'groups_countries'
        groups_countries[g_id] = groups_countries.get(g_id, [])
        groups_countries[g_id].append(c_id)

        # Add group to 'groups'
        if not groups.get(g_id):
            groups[g_id] = groups.get(g_id, g_name)

        # Add group to 'countries'
        if not countries.get(g_id):
            countries[g_id] = {'name': g_name, 'income': None,
                               'region': None, 'wikiurl': None}

        # Add country to 'countries' if new
        if not countries.get(c_id):
            countries[c_id] = {'name': c_name, 'income': None,
                               'region': None, 'wikiurl': WIKIURL + c_name}

        # IFF group is also an income or a region, update country
        if g_name in ['High Income',
                      'Upper-Middle Income',
                      'Lower-Middle Income',
                      'Low Income']:
            countries[c_id]['income'] = g_name
        if g_name in ['East Asia & Pacific',
                      'Europe & Central Asia',
                      'Latin America & Caribbean',
                      'Middle East & North Africa',
                      'North America',
                      'South Asia',
                      'Sub-Saharan Africa']:
            countries[c_id]['region'] = g_name

    # Create and insert each new item in 'countries'
    for c_id in countries:
        name = countries[c_id]['name']
        region = countries[c_id]['region']
        income = countries[c_id]['income']
        wikiurl = countries[c_id]['wikiurl']
        country = Country(country_id=c_id,
                          name=name,
                          region=region,
                          income=income,
                          wikiurl=wikiurl)
        db.session.add(country)
    db.session.commit()  # Commit new country records

    # Each group has its own data,
    # so each needs to be a country (with no groups)
    for g_id, g_name in groups.items():
        group = Group(group_id=g_id, name=g_name)
        db.session.add(group)
    db.session.commit()  # Commit new country and group records

    # Lastly, create and insert each group-country pair
    for g_id in groups_countries:
        for c_id in groups_countries[g_id]:
            gc = GroupCountry(group_id=g_id, country_id=c_id)
            db.session.add(gc)
    db.session.commit()  # Must commit 'gc' AFTER countries and groups

###########################
# Helper Functions
###########################

if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    load_groups_and_countries()
