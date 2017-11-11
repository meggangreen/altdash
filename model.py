""" Models and db functions for SDG db. """

from flask_sqlalchemy import SQLAlchemy

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
    name = db.Column(db.Text, unique=True, nullable=False)
    region = db.Column(db.Text, nullable=True)
    income = db.Column(db.Text, nullable=True)
    wikiurl = db.Column(db.Text, unique=False, nullable=True)

    def __repr__(self):
        return ('\n<Country "{}" id={} region="{}" income="{}" groups="{}" >'
                .format(self.name, self.country_id,
                        self.region, self.income, self.groups))


class Group(db.Model):
    """ Group model.

        Region, income, and other classifications based on economic, geographic,
        and cultural characteristics. Eg: Arab World, Small States, Pacific
        Island Small States.

    """

    __tablename__ = 'groups'

    group_id = db.Column(db.String(3), primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)

    countries = db.relationship('Country',
                                secondary='groups_countries',
                                order_by='Country.country_id',
                                backref=db.backref('groups',
                                                   order_by=group_id))

    def __repr__(self):
        return ('\n<Group "{}" id={} countries="{}" >'
                .format(self.name, self.group_id, self.countries))


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

class Color(db.Model):
    """ Color model.

        Most importantly, this table holds the goal prefix ('goal_pre' 2-char
        value from 01 to 17) used by the 'goal' table.

        Also, each goal has a color and icon associated with it on the World
        Bank site; this front end 'might' replicate those and therefore stores
        them very simply as a goal number-hex value pair. The 'hexval' includes
        the '#'.

    """

    __tablename__ = 'colors'

    goal_pre = db.Column(db.String(2), primary_key=True)
    hexval = db.Column(db.String(7), unique=True, nullable=False)

    def __repr__(self):
        return ('\n<Color goal_pre={} hex="{}" >'
                .format(self.goal_pre, self.hexval))


class Goal(db.Model):
    """ Goal model.

        Each goal has sub-goals. Main goals are 'EE00' where 'EE' is the 'goal_pre',
        (01 to 17). Sub-goals are 'EEZZ' where 'EE' is the 'goal_pre' and 'ZZ'
        is the 'goal_suf' -- 2-char code either a number ('03', '11') or a letter
        and single 0 ('a0'). Not every goal/sub-goal detailed by the World Bank
        is accounted for here.

    """

    __tablename__ = 'goals'

    goal_id = db.Column(db.String(4), primary_key=True)
    goal_pre = db.Column(db.String(2),
                         db.ForeignKey('colors.goal_pre'),
                         nullable=False)
    goal_suf = db.Column(db.String(2), nullable=False)
    description = db.Column(db.Text, unique=True, nullable=False)
    wburl = db.Column(db.Text, unique=True, nullable=True)

    indicators = db.relationship('Indicator',
                                 order_by='Indicator.indicator_id',
                                 secondary='goals_indicators',
                                 backref=db.backref('goals', order_by=goal_id))
    color = db.relationship('Color')

    def __repr__(self):
        return ('\n<Goal id={} descr="{}" indicators="{}" >'
                .format(self.goal_id, self.description[:50], self.indicators))


class Indicator(db.Model):
    """ Indicator model. An indicator is a World Bank metric.

        World Bank has assigned each metric a code which serves as the
        'indicator_id'. Not every metric detailed by the World Bank is accounted
        for here.

    """

    __tablename__ = 'indicators'

    indicator_id = db.Column(db.Text, primary_key=True)
    title = db.Column(db.Text, unique=True, nullable=False)
    method = db.Column(db.Text, unique=False, nullable=True)
    wburl = db.Column(db.Text, unique=True, nullable=True)

    def __repr__(self):
        return ('\n<Indicator title="{}" id={} >'
                .format(self.title[:50], self.indicator_id))


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
                           nullable=False)
    indicator_id = db.Column(db.Text,
                             db.ForeignKey('indicators.indicator_id'),
                             nullable=False)
    year = db.Column(db.Integer, nullable=False)
    value = db.Column(db.Float, nullable=False)

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
        return ('\n<Datum id={} val={} country="{}" indic="{}" year={} >'
                .format(self.datum_id, self.value, self.country.name,
                        self.indicator.title, self.year))


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
    print "Connected to DB."
