'use strict';

$(document).ready(function() {
    /* ALLLLL THE JS -- not indented */

let cCountries, cCountry, cGoalsRaw, cGoals = new Map ([]);
let chartScatter, cYear, cMin, cMax, cDatasets, cTileVals, cInformation;

let divRowBodyChartTiles = $('#row-body-charttiles').html();
let divRowBodyTileDetails = $('#row-body-tiledetails').html();

cCountries = $('.opt-country').toArray();
cGoalsRaw = $('.tile-sm').toArray();
cGoalsRaw.forEach(storeGoalAttrs);
selectCountry();

// Event listeners
$('#select-country').on('change', selectCountry);
$('#btn-random').on('click', selectCountry);
$('.btn').on('click', swapDivs);


function storeGoalAttrs(element, index, array) {
    /*  */

    let g_id = element.id.slice(0,3);
    let g_color = element.style['background-color'];
    cGoals.set(g_id, g_color);
}


function swapDivs(evt) {
    /* Show and hide appropriate div elements after button click. */

    if ( $(this).data('toggle') !== 'extra-hidden' ) {
        return null;
    }

    let toHide = $(this).data('sender');
    let toShow = $(this).data('target');
    let toGoal = $(this).data('goalA');  // gEEd or gEEm

    $(toHide).addClass("extra-hidden");
    $(toShow).removeClass("extra-hidden");

    if ( toGoal ) {
        $('html, body').animate({
            scrollTop: $('#' + toGoal).offset().top -45
        }, 500, 'linear');
    } // end if
}


function selectCountry(evt) {
    /* Handles new country selection. Calls getCountryData. */

    if ( $(this).attr('id') === "select-country" ) {
        $('#select-country').data('country', $(this).val()); 
    } else {
        // Pick randomized country
        let r = Math.floor(Math.random() * cCountries.length);
        let rCountry = cCountries[r].value;
        //this updates codewise but not in the page
        $('#select-country').data('country', rCountry);
        $('#select-country').val(rCountry);
    } // end if
    
    cCountry = $('#select-country').data('country');
    $('#select-country').val(cCountry);
    $('html, body').animate({
            scrollTop: $('body').offset().top
        }, 500, 'linear');

    getCountryData(cCountry);
}


function getCountryData(cCountry) {
    /* Retrieves country data and calls initializeChartTiles. */

    $.get('/country-data.json', { 'country_id': cCountry }, function(results) {
        cDatasets = results.cDatasets;
        cTileVals = results.cTileVals;
        cInformation = results.cInformation;
        initializeChartTiles();
    } // end func
    ); // end .get
    
}

function initializeChartTiles() {
    /*  */

    makeSlider();
    updateChartTiles();
}


function makeSlider() {
    /*  */

    if ( $('#slider').slider() ) { // always created on page load
        $('#slider').slider('destroy'); console.log("slider DESTROYED!");
    } // end if
    cMax = $('#slider').data('max');
    cMin = $('#slider').data('min');
    cYear = cMax; // first time cYear is set

    let sliderTooltip = function(event, ui) {
        let ttYear = ui.value || cMax;
        let tooltip = '<div class="slider-tt"><div class="slider-tt-inner">'
                      + ttYear 
                      + '</div><div class="slider-tt-arrow"></div></div>';
        $('.ui-slider-handle').html(tooltip);
    }; // end sliderTooltip

    let sliderSelectYear = function(event, ui) {
        cYear = ui.value || cMax;
        updateChartTiles();
    }; // end sliderSelectYear

    $('#slider').slider({
        value: cYear,
        min: cMin,
        max: cMax,
        step: 1,
        create: sliderTooltip,
        slide: sliderTooltip,
        stop: sliderSelectYear,
    }); // end slider initialize
}


function updateChartTiles(evt) {
    /*  */

    makeCountryInfo();
    makeChartScatter(cYear);
    updateTiles(cYear);
} // end updateChartTiles


function makeCountryInfo() {
    /* */

    let cName = cInformation.name;
    let cIncome = cInformation.income;
    let cRegion = cInformation.region;
    let cWikiurl = cInformation.wikiurl;
    let cGroups = cInformation.groups;
    let formatHTML = '';

    if ( (cIncome && cRegion && cWikiurl) === null ) {
        let formatH4 = `<h4>` + cName + `</h4>`;
        let formatDIV = `<div id="col-tiles-push" class="hidden-xs col-md-4" 
                              style="height: 17px;"></div>`;
        formatHTML = formatH4 + formatDIV;
        
    } else {
        let formatH4 = `
            <h4>
              <a href="` + cWikiurl + `" target="_blank" 
                title="` + cName + ` at Wikipedia">` + cName + `</a>
              | ` + cIncome + ` | ` + cRegion + `
            </h4>
            `
        ;

        let IRW = [cIncome, cRegion, "World"];
        let cGroupList = new Array();
        for (let i = 0; i < cGroups.length; i++) {
            if (!IRW.includes(cGroups[i])) {
                cGroupList.push(cGroups[i]);
            } // end if
        } // end for

        if (cGroupList.length !== 0) {
            cGroupList = cGroupList.join(", ");
        } else {
            cGroupList = "None";
        } // end if

        let formatP = `
            <p>
              Other groups: ` + cGroupList + `
            </p>
            `
        ;

        formatHTML = formatH4 + formatP;
    }

    
    
    $('.countryinfo').html(formatHTML);
}


function makeChartScatter(cYear) {
    /* Returns a preformatted scatter chart given a year. The data is loaded at
       page load as an object with the year as the identifier whose value is an
       array of objects containing cartesian coordinates.

    */

    // cDatasets = { '2011': [{x: 3, y: 2, i: "name"}, {x: 3, y: 5, i: "name"}] };

    console.log("made it to mCS");
    if ( chartScatter ) { chartScatter.destroy(); console.log("chart DESTROYED!"); }

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
                bodyFontColor: 'rgb(51, 51, 51)',  // #33
                backgroundColor: 'rgb(238, 238, 238)',  // #eee
                callbacks: {
                    beforeLabel: function(tooltipItem, data) {
                        let dsi = tooltipItem.datasetIndex;
                        let dpti = tooltipItem.index;  // datapoint index
                        let goal_label = data.datasets[dsi].label;
                        let indic_label = data.datasets[dsi].data[dpti]['i'];
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
        $('#' + tileId + 'sm').html('<p class="tile-score">' + tileVal + '</p>');
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