""" Helper functions for display. """

from model import *

###########################
# Main Scatter Chart
###########################

def get_country_list(order_field=0):
    """ Get list of Country objects ordered by name within 'order_field'. """

    query = Country.query

    if order_field != 0:
        order_field = 'countries.' + order_field
        query = query.order_by(order_field)

    query = query.order_by(Country.name)

    countries = query.all()

    return countries


def get_region_list():
    """ Get list of regions in alphabetical order. """

    regions = (db.session.query(Country.region)
                         .filter(Country.region is not None)
                         .order_by(Country.region)
                         .distinct())

    return regions
