'use strict';

$(document).ready(function() {
    /* ALLLLL THE JS -- not indented */

let cCountries, cCountry, cGoalsRaw, cGoals = new Map ([]);
let chartScatter, cYear, cDatasets, cTileVals;

cCountries = $('.opt-country').toArray();
cGoalsRaw = $('.tile').toArray();
cGoalsRaw.forEach(storeGoalAttrs);
selectCountry();

// Event listeners
$('#select-country').on('change', selectCountry);
$('#btn-random').on('click', selectCountry);
$('#slider').on('change', updateChartTiles);
//$('.tile').hover( tileGraphic, tileBlank);

function storeGoalAttrs(element, index, array) {
    let g_id = element.id;
    let g_color = element.style['background-color'];
    cGoals.set(g_id, g_color);
}

function selectCountry(evt) {
    /* Handles new country selection and resets page. Calls getCountryData. */

    // Reset container defaults
    // set animation to 'play'
    $('#slider').val($('#slider').attr('max'));
    
    if ( $(this).attr('id') === "btn-random" ) {
        // Pick randomized country
        let rando = cCountries[Math.floor(Math.random()*cCountries.length)].value;
        //this updates codewise but not in the page
        $('#select-country').data('country', rando);
    } else if ( $(this).attr('id') === "select-country" ) {
        $('#select-country').data('country', $(this).val()); 
    } // end if

    cCountry = $('#select-country').data('country');
    $('#select-country').val(cCountry);
    getCountryData(cCountry);
}


function getCountryData(cCountry) {
    /* Retrieves country data and calls updateChartTiles. On page load, cCountry
       is the selected country assigned by the server. On update, it is selected
       in selectCountry.

    */

    $.get('/country-data.json', { 'country_id': cCountry }, function(results) {
        cDatasets = results.cDatasets;
        cTileVals = results.cTileVals;
        updateChartTiles();
    } // end func
    ); // eng .get
    
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

    // cDatasets = { '2011': [{x: 3, y: 2}, {x: 3, y: 5}] };

    console.log("made it to mCS");
    if ( chartScatter ) { chartScatter.destroy(); console.log("DESTROY!"); }

    let xlabel = cYear;
    let ctx = document.getElementById("scatter-chart").getContext('2d');
    chartScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            labels: [],
            datasets: [
                {label: 'No Poverty',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 1),
                 backgroundColor: cGoals.get('g01'),},
                {label: 'Zero Hunger',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 2),
                 backgroundColor: cGoals.get('g02'),},
                {label: 'Good Health and Well-Being',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 3),
                 backgroundColor: cGoals.get('g03'),},
                {label: 'Quality Education',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 4),
                 backgroundColor: cGoals.get('g04'),},
                {label: 'Gender Equality',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 5),
                 backgroundColor: cGoals.get('g05'),},
                {label: 'Clean Water and Sanitation',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 6),
                 backgroundColor: cGoals.get('g06'),},
                {label: 'Affordable and Clean Energy',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 7),
                 backgroundColor: cGoals.get('g07'),},
                {label: 'Decent Work and Economic Growth',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 8),
                 backgroundColor: cGoals.get('g08'),},
                {label: 'Industry, Innovation, and Infrastructure',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 9),
                 backgroundColor: cGoals.get('g09'),},
                {label: 'Reduced Inequalities',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 10),
                 backgroundColor: cGoals.get('g10'),},
                {label: 'Sustainable Cities and Communities',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 11),
                 backgroundColor: cGoals.get('g11'),},
                {label: 'Responsible Consumption and Production',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 12),
                 backgroundColor: cGoals.get('g12'),},
                {label: 'Climate Action',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 13),
                 backgroundColor: cGoals.get('g13'),},
                {label: 'Life Below Water',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 14),
                 backgroundColor: cGoals.get('g14'),},
                {label: 'Life On Land',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 15),
                 backgroundColor: cGoals.get('g15'),},
                {label: 'Peace, Justice, and Strong Institutions',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 16),
                 backgroundColor: cGoals.get('g16'),},
                {label: 'Partnerships for the Goals',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 17),
                 backgroundColor: cGoals.get('g17'),},
            ] // end datasets
        }, // end chart data
        options: {
            animation: { duration: 0 },
            legend: { display: false },
            elements: { point: { 
                radius: 7, 
                hoverRadius: 10,
                borderColor: '#ccc',
            } }, // end elements
            tooltips: {
                displayColors: false,
                bodyFontColor: 'rgb(0, 0, 0)',  // #000
                backgroundColor: 'rgb(204, 204, 204)',  // #ccc
                callbacks: {
                    beforeLabel: function(tooltipItem, data) {
                        let goal_label = data.datasets[tooltipItem.datasetIndex].label;
                        let indic_label = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]['i'];
                        return [goal_label, indic_label];
                    }, // end beforeLabel
                    label: function(tooltipItem, data) {
                        return tooltipItem.yLabel;
                    }, // end label
                } // end callbacks
            }, // end tooltips
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: { display: true, labelString: xlabel },
                    position: 'bottom',
                    ticks: { min: 1, max: 17.2, stepSize: 1, display: false }
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

    // cTileVals = { '2010', {g01: 5.2, g02: 7.9} };

    $('.tile').html('<p class="tile-score"></p>');
    for ( let tileId in cTileVals[cYear] ) {
        let tileVal = cTileVals[cYear][tileId];
        $('#' + tileId).html('<p class="tile-score">' + tileVal + '</p>');
    } // end for

} // end updateTiles


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



}); // end doc.ready