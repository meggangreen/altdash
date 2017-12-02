""" Sort indicators into _norm, _inv, or _math. """


def sort_indicators(indicators):
    """ Sorter """

    try_again = []
    indic_norm = []
    indic_inv = []
    indic_math = []

    for indic in indicators:
        print indic
        location = raw_input("(N)ormal, (I)nverted, or (M)ath? ")
        if location.upper() == "N":
            indic_norm.append(indic)
        elif location.upper() == "I":
            indic_inv.append(indic)
        elif location.upper() == "M":
            indic_math.append(indic)
        else:
            try_again.append(indic)

    if try_again:
        sort_indicators(try_again)

    f = open('sortedindic.txt', 'a')
    f.write('\n######### NORMAL #########')
    for indic in indic_norm:
        f.write('\n' + indic.indicator_id)
    f.write('\n######### INVERSE #########')
    for indic in indic_inv:
        f.write('\n' + indic.indicator_id)
    f.write('\n######### MATH #########')
    for indic in indic_math:
        f.write('\n' + indic.indicator_id)
    f.close()
