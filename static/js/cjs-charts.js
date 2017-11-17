'use strict';

function makeChartScatter(cDatasets, cYear) {
    /* Returns a preformatted scatter chart given a collection of data. 

    */

    let xlabel = cDatasets[cYear].slice(0,1);
    let ctx = document.getElementById("scatter-chart").getContext('2d');
    let chartScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: cDatasets[cYear].slice(0,1),
                data: cDatasets[cYear].slice(1,cDatasets[cYear].length)
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
} // end function