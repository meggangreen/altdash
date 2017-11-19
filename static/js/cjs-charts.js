'use strict';

let cYear;
let cDatasets = {
    '2010': [{x: 2, y: 3}, {x: 2, y: 7}],
    '2011': [{x: 3, y: 2}, {x: 3, y: 5}],
};

let cTileVals = new Map ([
    ['2010', ([ ['g01', 5.2], ['g02', 7.9] ]) ],
    ['2011', ([ ['g01', 7.1], ['g02', 8.2] ]) ],
]);


function updateChartTiles(evt) {
    cYear = $('#slider').val();
    makeChartScatter(cYear);
    updateTiles(cYear);
} // end updateChartTiles


function makeChartScatter(cYear) {
    /* Returns a preformatted scatter chart given a year. The data is loaded at
       page load as dictionaries with the year as the key whose values are a
       list of dictionaries of cartesian coordinates.

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
    /* 

    */
    
    for ( let [tileId, tileVal] of cTileVals.get(cYear) ) {
        $('#' + tileId).html('<p class="tile-score">' + tileVal + '</p>');
    } // end for

} // end updateTiles
