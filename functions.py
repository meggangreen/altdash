""" Helper functions for display. """

from model import *

import requests
import json

import pdb

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


###########################
# SEEDING DATABASE
###########################

def get_wbdata_by_indicator(indicators):
    """ Given a list of indicators, returns a dictionary of JSON data for all
        countries and all years using the World Bank API.

        The function first requests only the first result to get the 'total'
        quantity of values. It then re-requests the data with the total quantity
        on one page. In addition to returning data, returns the code for any
        indicator that didn't return data in order to be analyzed and possibly
        removed from indicator list. The indicator should be removed manually by
        a person, because each has been tested multiple times and it is a known
        issue that sometimes the World Bank database can't find its own data.

        >>>indicators = ['SP.DYN.CONM.ZS', 'notrealcode', 'SP.ADO.TFRT']
        >>>test_dict = get_wbdata_by_indicator(indicators)
        The following indicator codes are not working:
            notrealcode
        >>> test_dict.keys()
        ['SP.ADO.TFRT', 'SP.DYN.CONM.ZS']

    """

    WBAPI = 'http://api.worldbank.org/countries/all/indicators/'
    FORMAT = '?format=json&per_page='
    data_tables = {}
    bad_indic = ""

    print "\n    I'm about to make the queries. Go get a coffee.\n"

    for indic in indicators:
        if indic == '':
            continue
        qty = "1"
        for i in range(0, 2):
            url = WBAPI + indic + FORMAT + qty
            response = requests.get(url)
            data = response.json()
            qty = str(data[0].get('total', 0))
            if qty == '0':  # no results for this indicator
                if bad_indic == "":
                    bad_indic = "The following indicator codes are not working:"
                bad_indic = "{}\n    {}".format(bad_indic, indic)
                data = None
                break
            data_tables[indic] = data[1]

    if bad_indic != "":
        print "\n", bad_indic
    return data_tables


def get_wbmeta_by_indicator(indicators):
    """ Given a list of indicators, returns a dictionary of JSON data with all
        meta information needed in 'indicators' table. Follows same format as
        'get_wbdata_by_indicator(indicators)'.

    """

    WBAPI = 'http://api.worldbank.org/indicators/'
    FORMAT = '?format=json&per_page='
    meta_tables = {}
    bad_indic = ""

    for indic in indicators:
        if indic == '':
            continue
        qty = "1"
        url = WBAPI + indic + FORMAT + qty
        response = requests.get(url)
        data = response.json()
        qty = str(data[0].get('total', 0))
        if qty == '0':  # no results for this indicator
            if bad_indic == "":
                bad_indic = "The following indicator codes are not working:"
            bad_indic = "{}\n    {}".format(bad_indic, indic)
            data = None
        else:
            meta_tables[indic] = data[1][0]  # partiular bit that contains meta

    if bad_indic != "":
        print "\n", bad_indic
    return meta_tables


def get_wbtwo_for_countries():
    """ Addends 3-char and 2-char codes from WB database to file. """

    # Empty dictionaries that will populate the countries and groups
    countries = {}

    # Read csv file and parse data
    gc_csv = open('rawdata/groups_countries.csv').readlines()
    for row in gc_csv:
        row = row.rstrip()

        # Unpack row
        g_id, _, c_id, _ = row.split(",")
        if not countries.get(g_id):
            countries[g_id] = get_wbmeta_by_country(g_id)['iso2Code']
        if not countries.get(c_id):
            countries[c_id] = get_wbmeta_by_country(c_id)['iso2Code']

    f = open('rawdata/countryconverter.txt', 'a')
    for c3, c2 in countries.iteritems():
        f.write("\n{}|{}".format(c3, c2))
    f.close()


def get_wbmeta_by_country(c_id):

    WBAPI = 'http://api.worldbank.org/countries/'
    FORMAT = '?format=json&per_page='
    bad_indic = "The following country codes are not working:"

    if c_id == '':
        return None
    qty = "1"
    url = WBAPI + c_id + FORMAT + qty
    response = requests.get(url)
    data = response.json()
    qty = str(data[0].get('total', 0))
    if qty == '0':  # no results for this country
        bad_indic = "{}\n    {}".format(bad_indic, c_id)
        data = None
    else:
        return data[1][0]
