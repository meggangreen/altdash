# altdash
AltDash | A proposed Alternative Dashboard for examining World Bank data as it reflects progress toward the 
Sustainable Development Goals.

The UN has identified 17 goals; the attainment of which more or less ensures the world is a good place to live for everyone,
everywhere. The World Bank has a giant data catalog about our world sourced from hundreds of institutions. They’ve created a
dashboard with selected metrics attempting to show a country’s progress toward the 17 goals.

It’s rubbish. AltDash, the Alternative Dashboard, is better.

At AltDash, you can view a scatter plot for a country’s data on 132 indicators over 57 years. Each year’s data is also rolled up
into a score from 0 to 100 for each goal and displayed in these tiles. Moving the slider controls which year is shown in both the
scatter plot and the goal tiles.

Ideally, the points on the chart and the scores in the tiles move toward ‘100’ over time. For instance, we can see Lao’s overall
improvement in Clean Water and Sanitation between the years 2000 and 2015. By examining the customized data point tooltips, we see
specifically how rural access to clean drinking water increased steadily from 37 to more than 73 percent in that period.

Clicking the tile brings you to the second level of detail, in which we see how the goal attainment score has changed over time.
Clicking once more brings you to the third level of detail, which shows how each indicator value related to that goal has changed
over time. You can also look at all the indicators at once.

AltDash is a mobile-first, one-page app that improves upon the existing dashboard in two ways:
One: you are shown a larger amount of data. In any country’s 30-second bio-pic scatter chart, you’ll see around 1500 data points.
And because of the color-matching to the UN palette, it’s easy to see which data affects each goal. 
Two: You choose how deep into the minutiae you actually want to dive, depending on your interest or purpose. Letting you drive the
app reduces load times because nothing is created until it is requested. The second-level charts are generated when you ask to see
them by clicking the first-level tile. They persist in the background until you ask to see another country, so as not to be
destroyed and regenerated on each tile click. The same is true for the third-level charts.

While it would have been easy to pick all indicators that were positively-correlated percentages, doing so leaves out a lot of
illuminating data. I purposefully weighed the trade-off in my ease of data normalization versus showing information that is
important and useful. Each metric requires its own analysis to decide how it should fit. About half of the indicators required
some sort of math in order to be meaningful on the 0-to-100 scale.

In future iterations of AltDash, I’d like to finish building out the map comparison feature, allowing users to compare countries
and also to select which indicators are included in their analysis.



