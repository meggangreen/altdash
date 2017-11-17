""" Utility file to seed data into production and test databases. """

from model import *
from functions import *
from server import app

import pdb


def load_groups_and_countries():
    """ Seed groups_countries records from csv file. Creates records in groups
        AND countries AND groups_countries.

    """

    # WikiURL constant
    WIKIURL = "https://en.wikipedia.org/wiki/"

    # Delete all rows to start fresh
    # Group.query.delete()
    # Country.query.delete()
    # GroupCountry.query.delete()

    # Empty dictionaries that will populate the countries and groups
    countries = {}
    groups = {}
    groups_countries = {}

    # Read csv file and parse data
    gc_csv = open('rawdata/groups_countries.csv').readlines()
    for row in gc_csv:
        row = row.rstrip()

        # Unpack row
        g_id, g_name, c_id, c_name = row.split(",")

        # Add group-country pair to 'groups_countries'
        groups_countries[g_id] = groups_countries.get(g_id, [])
        groups_countries[g_id].append(c_id)

        # Add group to 'groups' if new
        if not groups.get(g_id):
            groups[g_id] = g_name

        # Add group to 'countries'
        if not countries.get(g_id):
            countries[g_id] = {'id': g_id, 'name': g_name, 'income': None,
                               'region': None, 'wikiurl': None}

        # Add country to 'countries' if new
        if not countries.get(c_id):
            countries[c_id] = {'id': c_id, 'name': c_name, 'income': None,
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

    # Get dict of 3- and 2-char country codes
    c_dict = {}
    f = open('rawdata/countryconverter.txt', 'r')
    for row in f:
        row.rstrip()
        c3, c2 = row.split("|")
        c_dict[c3] = c2[:2]
    f.close()

    # Create and insert each new item in 'countries'
    for c_id in countries.itervalues():
        c_c2 = c_dict[c_id['id']]
        country = Country(country_id=c_id['id'],
                          name=c_id['name'],
                          char2=c_c2,
                          region=c_id['region'],
                          income=c_id['income'],
                          wikiurl=c_id['wikiurl'])
        db.session.add(country)
    db.session.commit()  # Commit new country records

    # Create and insert each new item in 'groups'
    for g_id, g_name in groups.items():
        g_c2 = c_dict[g_id]
        group = Group(group_id=g_id, name=g_name, char2=g_c2)
        db.session.add(group)
    db.session.commit()  # Commit new group records

    # Lastly, create and insert each group-country pair
    for g_id in groups_countries:
        for c_id in groups_countries[g_id]:
            gc = GroupCountry(group_id=g_id, country_id=c_id)
            db.session.add(gc)
    db.session.commit()  # Must commit 'gc' AFTER countries and groups


def load_goals_and_targets():
    """ Seed goal_design and goals records from csv file. Must run before
        creating goals_indicators records. * csv delimited by '|'.

    """

    # Delete all rows to start fresh
    # GoalDesign.query.delete()
    # Goal.query.delete()

    # Empty dictionaries that will populate the countries and groups
    g_designs = {}
    goals = {}

    # Read csv file and parse data
    goal_csv = open('rawdata/goals.csv').readlines()
    for row in goal_csv:
        row = row.rstrip()

        # Unpack row
        pre, suf, descr, hexval, iurlb, iurlf, unurl = row.split("|")
        g_id = pre + suf

        # Add goal to goal_design; goals depends on goal_design
        if suf == '00':  # Only the main goal
            g_designs[pre] = {'hexval': hexval, 'iurlb': iurlb,
                              'iurlf': iurlf, 'unurl': unurl}

        # Add goal/target to goals
        goals[g_id] = {'pre': pre, 'suf': suf, 'descr': descr}

    # Create and insert each new item in 'goal_design'
    for pre in g_designs:
        hexval = g_designs[pre]['hexval']
        iurlb = g_designs[pre]['iurlb']
        iurlf = g_designs[pre]['iurlf']
        unurl = g_designs[pre]['unurl']
        g_design = GoalDesign(goal_pre=pre,
                              hexval=hexval,
                              iurl_blank=iurlb,
                              iurl_full=iurlf,
                              unurl=unurl)
        db.session.add(g_design)
    db.session.commit()  # Commit goal_designs

    # Create and insert each new item in 'goals'
    for g_id in goals:
        pre = goals[g_id]['pre']
        suf = goals[g_id]['suf']
        descr = goals[g_id]['descr']
        goal = Goal(goal_id=g_id, goal_pre=pre, goal_suf=suf, description=descr)
        db.session.add(goal)
    db.session.commit()  # Must commit goals AFTER goal_designs


def load_indicators():
    """ Seed indicator meta data via World Bank API from supplied list of
        indicator IDs. Seed goals_indicators table.

    """

    # WB URL constant
    URL = "https://data.worldbank.org/indicator/"

    # Delete all rows to start fresh
    # GoalIndic.query.delete
    # Indicator.query.delete

    # Read csv file and parse data
    indic_csv = open('rawdata/indicators.csv').readlines()
    for row in indic_csv:
        row = row.rstrip()

        # Goal pre is always 1st value, but nothing else is guaranteed
        cells = row.split(',')
        goal_id = cells[0] + "00"
        goal_indic = []
        indicators = cells[1:]

        # Retrieve and parse meta data
        meta = get_wbmeta_by_indicator(indicators)

        for m in meta.itervalues():
            indic_id = m['id']
            if not (Indicator.query
                             .filter(Indicator.indicator_id == indic_id)
                             .first()):
                indic = Indicator(indicator_id=indic_id,
                                  title=m['name'],
                                  description=m['sourceNote'],
                                  wburl=URL + indic_id)
                db.session.add(indic)
            if not (GoalIndic.query
                             .filter(GoalIndic.indicator_id == indic_id,
                                     GoalIndic.goal_id == goal_id)
                             .first()):
                goal_indic.append(GoalIndic(indicator_id=indic_id,
                                            goal_id=goal_id))
        # pdb.set_trace()
        db.session.commit()
        db.session.add_all(goal_indic)
        db.session.commit()


def load_data():
    """ Seed indicator data via World Bank API from IDs in 'indicators' table.

    """
    
    # Delete all rows to start fresh
    # Datum.query.delete

    # Get dict of 3- and 2-char country codes
    c_dict = {}
    f = open('rawdata/countryconverter.txt', 'r')
    for row in f:
        row.rstrip()
        c3, c2 = row.split("|")
        c_dict[c2[:2]] = c3
    f.close()

    # Get list of indicator codes from db
    indicators = [i.indicator_id for i in Indicator.query.all()]

    # Get data dictionary for all indicators
    i = 0
    for j in range(len(indicators)):
        if i > len(indicators):
            break
        indic = indicators[i:i+15]  # trying to do just 15 at a time
        data = get_wbdata_by_indicator(indic)

        print "\n    Let's parse some data!", i, i + 15

        # Parse datum in data
        for indicator in data:  # indicator code
            for d_pt in data[indicator]:  # 'd_pt' is a dict about one data point
                if ((d_pt['value'] is None) or
                    (c_dict.get(d_pt['country']['id']) is None)):
                    continue
                country = c_dict[d_pt['country']['id']]
                datum = Datum(indicator_id=indicator,
                              country_id=country,
                              year=int(d_pt['date']),
                              value=float(d_pt['value']))
                db.session.add(datum)
                db.session.commit()  # Is there a limit to the amt of obj to commit?

        i = i + 15

        # Invert scale -- put on indicator


###########################
# Helper Functions
###########################

if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    print '\n\nLoading Groups and Countries now ...'
    load_groups_and_countries()
    print '\nGroups and Countries loaded.'
    print '\n\nLoading Goals and Targets now ...'
    load_goals_and_targets()
    print '\nGoals and Targets loaded.'
    print '\n\nLoading Indicators (meta) now ...'
    load_indicators()
    print '\nIndicators loaded.'
    print '\n\nLoading Data now ...'
    load_data()
    print '\nData loaded.'
