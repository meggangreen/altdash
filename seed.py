""" Utility file to seed data into production and test databases. """

from model import *
from functions import *
from server import app


def load_groups_and_countries():
    """ Seed groups_countries records from csv file. Creates records in groups
        AND countries AND groups_countries.

    """

    # WikiURL constant
    WIKIURL = "https://en.wikipedia.org/wiki/"

    # Delete all rows to start fresh
    Group.query.delete()
    Country.query.delete()
    GroupCountry.query.delete()

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


def load_goals_and_targets():
    """ Seed goal_design and goals records from csv file. Must run before
        creating goals_indicators records. * csv delimited by '|'.

    """

    # Delete all rows to start fresh
    Goal.query.delete()
    GoalDesign.query.delete()

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
    GoalIndic.query.delete
    Indicator.query.delete

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
            indic = Indicator(indicator_id=m[1][0]['id'],
                              title=m[1][0]['name'],
                              method=m[1][0]['sourceNote'],
                              wburl=URL + m[1][0]['id'])
            db.session.add(indic)
            goal_indic.append(GoalIndic(indicator_id=m[1][0]['id'],
                                        goal_id=goal_id))
        db.session.commit()
        print goal_indic
        print '\n\n'
        import pdb; pdb.set_trace()
        db.session.add(goal_indic)
        db.session.commit()


###########################
# Helper Functions
###########################

if __name__ == "__main__":
    connect_to_db(app)

    # In case tables haven't been created, create them
    db.create_all()

    # Import different types of data
    # load_groups_and_countries()
    load_goals_and_targets()
    load_indicators()
