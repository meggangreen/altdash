""" Helper functions for display. """

###########################
# Main Scatter Chart
###########################

def get_country_list():
    """ Get list of countries organized by region. """

    countries = (Country.query
                        .get(Country.country_id, Country.name, Country.region)
                        .filter(Country.region != null)
                        .order_by(Country.region)
                        .order_by(Country.name)
                        .all())

    return countries
