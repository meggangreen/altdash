'use strict';

let cCountries, cCountry, cYear, cDatasets, cTileVals;

cDatasets = {
    '2010': [{x: 2, y: 3}, {x: 2, y: 7}],
    '2011': [{x: 3, y: 2}, {x: 3, y: 5}],
};

cTileVals = new Map ([
    ['2010', ([ ['g01', 5.2], ['g02', 7.9] ]) ],
    ['2011', ([ ['g01', 7.1], ['g02', 8.2] ]) ],
]);


function selectCountry(evt) {
    /* Handles new country selection and resets page. Calls getCountryData. */

    // set animation to 'play'
    $('#slider').val($('#slider').attr('max'));
    
    if ( $(this).attr('id') === "btn-random" ) {
        // Pick randomized country
        cCountry = cCountries[Math.floor(Math.random()*cCountries.length)].value;
    } else {
        cCountry = $(this).val();
    } // end if

    getCountryData(cCountry);
}


function getCountryData(cCountry) {
    /* Retrieves country data and calls updateChartTiles. On page load, cCountry
       is the selected country assigned by the server. On update, it is selected
       in selectCountry.

    */

    $('#select-country').val(cCountry);
    $.get('/country-data.json', { 'country_id': cCountry }, updateChartTiles);

}


function tileGraphic(evt) {
    let styleCurrent = $(this).attr('style');
    let styleModified = styleCurrent.replace("_blank.png", ".png");
    $(this).attr('style', styleModified);
}


function tileBlank(evt) {
    let styleCurrent = $(this).attr('style');
    let styleModified = styleCurrent.replace(".png", "_blank.png");
    $(this).attr('style', styleModified);
}


function updateChartTiles(evt) {
    cYear = $('#slider').val();
    makeChartScatter(cYear);
    updateTiles(cYear);
} // end updateChartTiles


function makeChartScatter(cYear) {
    /* Returns a preformatted scatter chart given a year. The data is loaded at
       page load as an object with the year as the identifier whose value is an
       array of objects containing cartesian coordinates.

    */

    let xlabel = cYear;
    let ctx = document.getElementById("scatter-chart").getContext('2d');
    let chartScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: cYear,
                data: cDatasets[cYear]
            }] // end datasets
        }, // end chart data
        options: {
            legend: { display: false },
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: { display: true, labelString: xlabel },
                    position: 'bottom',
                    ticks: { min: 1, max: 17.1, stepSize: 1, display: false }
                }], // end xAxes
                yAxes: [{
                    type: 'linear',
                    scaleLabel: { display: false },
                    ticks: {min: 0, max: 10, stepSize: 2.5, display: false},
                    // thanks to L Bahr 'https://stackoverflow.com/questions/37451905/how-to-set-static-value-in-y-axis-in-chart-js'
                    afterBuildTicks: function(scale) {
                      scale.ticks = [0, 3, 7, 10]; // set y-axis values exactly
                      return;
                    },
                    beforeUpdate: function(oScale) {
                      return;
                    }
                }] // end yAxes
            } // end scales
        } // end chart options
    }); // end chartScatter
} // end makeChartScatter


function updateTiles(cYear) {
    /* Changes the 'score' on each goal tile given a year. The scores are loaded
       at page load as a map with the year as the key whose value is a map with
       'goal_pre' ids (key) and 'score' (value). First all scores are cleared,
       then the updated scores placed, to ensure that data is for chosen year.

    */
    
    $('.tile').html('<p class="tile-score"></p>');

    for ( let [tileId, tileVal] of cTileVals.get(cYear) ) {
        $('#' + tileId).html('<p class="tile-score">' + tileVal + '</p>');
    } // end for

} // end updateTiles
