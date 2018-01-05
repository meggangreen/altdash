""" Models and db functions for SDG db. """

from flask_sqlalchemy import SQLAlchemy
import pdb

db = SQLAlchemy()

###########################
# ORM Models
###########################

### Countries ###

class Country(db.Model):
    """ Country model.

        World Bank doesn't calculate world, region, or income numbers on the
        fly; they are their own values. Weighted? Who knows. But I'm sticking
        with their methods, albeit with a reduced number of groupings.

    """

    __tablename__ = 'countries'

    country_id = db.Column(db.String(3), primary_key=True)
    char2 = db.Column(db.String(2), unique=True, nullable=False)
    name = db.Column(db.Text, unique=True, nullable=False)
    region = db.Column(db.Text, nullable=True)
    income = db.Column(db.Text, nullable=True)
    wikiurl = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return ('<Country "{}" id={} region="{}" income="{}" (c.groups) >\n'
                .format(self.name, self.country_id, self.region, self.income))

    @classmethod
    def get_db_objs(cls, country_id=None, name=None, region=None,
                         income=None, limit=None):
        """ Returns list of db objects from Country table ordered by name.
            Optionally, can inclusively filter and order by id, name, region,
            and/or income as well.

        """

        query = cls.query.order_by(cls.name)

        if country_id:
            country_id = "%" + str(country_id) + "%"
            query = (query.filter(cls.country_id.ilike(country_id))
                          .order_by(cls.country_id))

        if name:
            name = "%" + str(name) + "%"
            query = (query.filter(cls.name.ilike(name))
                          .order_by(cls.name))

        if region:
            region = "%" + str(region) + "%"
            query = (query.filter(cls.region.ilike(region))
                          .order_by(cls.region))

        if income:
            income = "%" + str(income) + "%"
            query = (query.filter(cls.income.ilike(income))
                          .order_by(cls.income))

        if limit:
            limit = int(limit)
            query = query.limit(limit)

        db_objs = query.all()

        return db_objs


class Group(db.Model):
    """ Group model.

        Region, income, and other classifications based on economic, geographic,
        and cultural characteristics. Eg: Arab World, Small States, Pacific
        Island Small States.

    """

    __tablename__ = 'groups'

    group_id = db.Column(db.String(3), primary_key=True)
    char2 = db.Column(db.String(2), unique=True, nullable=False)
    name = db.Column(db.Text, unique=True, nullable=False)

    countries = db.relationship('Country',
                                secondary='groups_countries',
                                order_by='Country.name',
                                backref=db.backref('groups',
                                                   order_by=group_id))

    def __repr__(self):
        return ('<Group "{}" id={} (g.countries) >\n'
                .format(self.name, self.group_id))

    @classmethod
    def get_db_objs(cls, group_id=None, name=None, char2=None, limit=None):
        """ Returns list of db objects from Country table ordered by name.
            Optionally, can inclusively filter and order by id, name, and/or
            char2 as well.

        """

        query = cls.query.order_by(cls.name)

        if group_id:
            group_id = "%" + str(group_id) + "%"
            query = (query.filter(cls.group_id.ilike(group_id))
                          .order_by(cls.group_id))

        if name:
            name = "%" + str(name) + "%"
            query = (query.filter(cls.name.ilike(name))
                          .order_by(cls.name))

        if char2:
            char2 = "%" + str(char2) + "%"
            query = (query.filter(cls.char2.ilike(char2))
                          .order_by(cls.char2))

        if limit:
            limit = int(limit)
            query = query.limit(limit)

        db_objs = query.all()

        return db_objs


class GroupCountry(db.Model):
    """ Association table for group-country pairs. """

    __tablename__ = 'groups_countries'

    gc_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_id = db.Column(db.String(3),
                         db.ForeignKey('groups.group_id'),
                         nullable=False)
    country_id = db.Column(db.String(3),
                           db.ForeignKey('countries.country_id'),
                           nullable=False)


### Goals and Indicators ###

class GoalDesign(db.Model):
    """ GoalDesign model.

        Most importantly, this table holds the goal prefix ('goal_pre' 2-char
        value from 01 to 17) used by the 'goal' table.

        Also, each goal has a color and icon associated with it on the UN site;
        this front end 'might' replicate those and therefore stores them very
        simply as the goal number, hex value, and icon urls. The field 'hexval'
        includes the leading '#'.

    """

    __tablename__ = 'goal_design'

    goal_pre = db.Column(db.String(2), primary_key=True)
    title = db.Column(db.Text, unique=True, nullable=False)
    hexval = db.Column(db.String(7), unique=True, nullable=False)
    iurl_blank = db.Column(db.Text, unique=True, nullable=False)
    iurl_full = db.Column(db.Text, unique=True, nullable=False)
    unurl = db.Column(db.Text, unique=True, nullable=False)

    def __repr__(self):
        return ('<GoalDesign goal_pre={} hex="{}" >\n'
                .format(self.goal_pre, self.hexval))

    @classmethod
    def get_db_objs(cls, goal_pre=None):
        """ Returns list of db objects from GoalDesign table ordered by goal
            prefix. Has no additional filter or order by fields.

        """

        query = cls.query.order_by(cls.goal_pre)

        if goal_pre:
            goal_pre = "%" + str(goal_pre) + "%"
            query = (query.filter(cls.goal_pre.ilike(goal_pre))
                          .order_by(cls.goal_pre))

        db_objs = query.all()

        return db_objs


class Goal(db.Model):
    """ Goal model.

        Each goal has targets. Main goals are 'EE00' where 'EE' is the
        'goal_pre' (01 to 17). Targets are 'EEZZ' where 'EE' is the 'goal_pre'
        and 'ZZ' is the 'goal_suf' -- 2-char code either a number ('03', '11')
        or a single 0 and the letter ('0a'). Not every goal/target detailed
        by the SDG accord is accounted for here.

    """

    __tablename__ = 'goals'

    goal_id = db.Column(db.String(4), primary_key=True)
    goal_pre = db.Column(db.String(2),
                         db.ForeignKey('goal_design.goal_pre'),
                         nullable=False)
    goal_suf = db.Column(db.String(2), nullable=False)
    description = db.Column(db.Text, unique=True, nullable=False)

    indicators = db.relationship('Indicator',
                                 order_by='Indicator.indicator_id',
                                 secondary='goals_indicators',
                                 backref=db.backref('goals', order_by=goal_id))

    design = db.relationship('GoalDesign',
                             backref=db.backref('goals', order_by=goal_id))

    def __repr__(self):
        return ('<Goal id={} descr="{}" (g.indicators) (g.design) >\n'
                .format(self.goal_id, self.description[:50]))


class Indicator(db.Model):
    """ Indicator model. An indicator is a World Bank metric.

        World Bank has assigned each metric a code which serves as the
        'indicator_id'. Not every metric detailed by the World Bank is accounted
        for here.

    """

    __tablename__ = 'indicators'

    indicator_id = db.Column(db.Text, primary_key=True)
    title = db.Column(db.Text, unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    scale_inverse = db.Column(db.Boolean, nullable=True, default=False)
    display_math = db.Column(db.Text, nullable=True)
    wburl = db.Column(db.Text, unique=True, nullable=True)

    def __repr__(self):
        return ('<Indicator id={} title="{}" (i.goals) >\n'
                .format(self.indicator_id, self.title[:50]))

    @classmethod
    def get_db_objs(cls, indicator_id=None, title=None,
                         scale_inverse=None, display_math=None):
        """ Returns list of db objects from Datum table ordered by indicator id.
            Optionally, can filter and order by country id, year, and/or value
            as well.

        """

        query = cls.query.order_by(cls.indicator_id)

        if indicator_id:
            indicator_id = "%" + str(indicator_id) + "%"
            query = (query.filter(cls.indicator_id.ilike(indicator_id))
                          .order_by(cls.indicator_id))

        if title:
            title = "%" + str(title) + "%"
            query = (query.filter(cls.title.ilike(title))
                          .order_by(cls.title))

        if scale_inverse:
            scale_inverse = "%" + str(scale_inverse) + "%"
            query = (query.filter(cls.scale_inverse.ilike(scale_inverse))
                          .order_by(cls.scale_inverse))

        if display_math:
            display_math = "%" + str(display_math) + "%"
            query = (query.filter(cls.display_math.ilike(display_math))
                          .order_by(cls.display_math))

        db_objs = query.all()

        return db_objs


class GoalIndic(db.Model):
    """ Association table for goal-indicator pairs. """

    __tablename__ = 'goals_indicators'

    gi_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    goal_id = db.Column(db.String(4),
                        db.ForeignKey('goals.goal_id'),
                        nullable=False)
    indicator_id = db.Column(db.Text,
                             db.ForeignKey('indicators.indicator_id'),
                             nullable=False)


### Data ###

class Datum(db.Model):
    """ Data point model.

        Data points for each country-indicator-year combination.

    """

    __tablename__ = 'data_points'

    datum_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    country_id = db.Column(db.String(3),
                           db.ForeignKey('countries.country_id'),
                           index=True,
                           nullable=False)
    indicator_id = db.Column(db.Text,
                             db.ForeignKey('indicators.indicator_id'),
                             index=True,
                             nullable=False)
    year = db.Column(db.Integer, nullable=False)
    value = db.Column(db.Float, nullable=False)
    scaled_value = db.Column(db.Float, nullable=True)
    display_value = db.Column(db.Float, nullable=True)

    country = db.relationship('Country',
                              backref=db.backref('data_points',
                                                 order_by=indicator_id))
    indicator = db.relationship('Indicator',
                                backref=db.backref('data_points',
                                                   order_by=country_id))
    # goals = db.relationship('Goal',
    #                         backref=db.backref('data_points',
    #                                            order_by='country_id'))

    def __repr__(self):
        return ('<Datum id={} val={} country="{}" indic="{}" year={} >\n'
                .format(self.datum_id, self.value, self.country.name,
                        self.indicator.title, self.year))

    @classmethod
    def get_db_objs(cls, country_id=None, indicator_id=None,
                         year=None, value=None, display_value=None):
        """ Returns list of db objects from Datum table ordered by indicator id.
            Optionally, can filter and order by country id, year, and/or value
            as well.

        """

        query = cls.query.order_by(cls.indicator_id)

        if indicator_id:
            indicator_id = "%" + str(indicator_id) + "%"
            query = (query.filter(cls.indicator_id.ilike(indicator_id))
                          .order_by(cls.indicator_id))

        if country_id:
            country_id = "%" + str(country_id) + "%"
            query = (query.filter(cls.country_id.ilike(country_id))
                          .order_by(cls.country_id))

        if year:
            query = (query.filter(cls.year == year)
                          .order_by(cls.year))

        if value:
            value_f = float(value[2:])
            if value[0:2] == '==':
                query = (query.filter(cls.value == value_f)
                              .order_by(cls.value))

        if display_value == 'None':
            query = query.filter(cls.display_value == None)

        db_objs = query.all()

        return db_objs


###########################
# Helper functions
###########################

def connect_to_db(app):
    """ Connect the database to the Flask app. """

    # Configure to use PostgreSQL production database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///sdgdash'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)


if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # us in a state of being able to work with the database directly.

    from server import app
    connect_to_db(app)
    print "\n\nConnected to DB.\n"


###########################
### DEPRECATED
###########################

# def update_indicator_scale():
#     """ After ALTER TABLE, set scale_inverse value for each indicator and note
#         which indicators will have math in order to display on 0-10 scale.

#     """

#     # Get dict of indicator and scale
#     scale_dict = {}
#     f = open('sortedindic.txt', 'r')
#     for row in f:
#         row.rstrip()
#         s, indic = row.split("|")
#         scale_dict[indic[:-1]] = s
#     f.close()

#     indicators = Indicator.query.all()
#     for indic in indicators:
#         if scale_dict.get(indic.indicator_id) == 'i':
#             indic.scale_inverse = True
#         elif scale_dict.get(indic.indicator_id) == 'm':
#             indic.display_math = 'm'
#     db.session.commit()


# def sort_indicators(indicators):
#     """ Sort indicators into _norm, _inv, or _math. """

#     try_again = []

#     f = open('sortedindic.txt', 'a')

#     for indic in indicators:
#         print
#         print indic
#         location = raw_input("(N)ormal, (I)nverted, or (M)ath? ")
#         if location.upper() in ("N", "I", "M"):
#             f.write("\n" + location + "|" + indic.indicator_id)
#         else:
#             try_again.append(indic)

#     f.close()

#     if try_again:
#         sort_indicators(try_again)
