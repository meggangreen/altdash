'use strict';

let cCountries, cCountry, cGoalsRaw, cGoals = new Map ([]);
let cYear, cYears, cMin, cMax, yearI, scrollStop;
let chartScatter, cDatasets, cTileVals, cInformation;

$(document).ready(function() {
    /* ALLLLL THE JS -- not indented */

cCountries = $('.opt-country').toArray();
cGoalsRaw = $('.tile-sm').toArray();
cGoalsRaw.forEach(storeGoalAttrs);
selectCountry();


// Event listeners
$('#select-country').on('change', selectCountry);
$('#btn-random').on('click', selectCountry);
$('.btn').on('click', swapDivs);


function scrollScatter() {
    /* Controls the chartScroll setInterval. */
        
    cYears = Object.keys(cDatasets);
    yearI = 0;

    let chartScroll = setInterval(function() {
        cYear = cYears[yearI];
        makeChartScatter(cYear);
        yearI += 1;
        if (yearI === cYears.length) {
            yearI = 0;
        }
        if (scrollStop === true) {
            clearInterval(chartScroll);
        }
    },
    500);

    
}


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
    let toGoal = '#' + $(this).data('goalA');  // #gEEd or #gEEm or #undefined
    
    // hide all 3rd level divs when navigating away from 3rd level
    if (toHide === '#row-body-goal-minutiae') {
        $('.goal-minutiae').addClass("extra-hidden");
    }

    $(toHide).addClass("extra-hidden");
    $(toShow).removeClass("extra-hidden");

    // unhide appropriate goal row(s)
    if (toShow === '#row-body-goal-minutiae') {
        if (toHide === '#row-body-gm-showall') {
            $('#row-goalminutiae').children().removeClass("extra-hidden");
        } else {
            $(toGoal).parent().removeClass("extra-hidden");
        }
    }

    if ( toGoal !== '#undefined' ) {
        $('html, body').animate(
            { scrollTop: $(toGoal).offset().top -65 }, 
            500, 'linear');
    } // end if
}


function selectCountry(evt) {
    /* Handles new country selection and resets page. Calls getCountryData. */

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

    // Reset page scroll to top
    $('html, body').animate(
        { scrollTop: $('body').offset().top },
        500, 'linear');

    getCountryData(cCountry);
}


function getCountryData(cCountry) {
    /* Retrieves country data and calls initializeChartTiles. */

    $.get('/country-data.json', { 'country_id': cCountry }, function(results) {
        cDatasets = results.cDatasets;
        cTileVals = results.cTileVals;
        cInformation = results.cInformation;
        scrollStop = false;  // only reset if the country has changed
        initializeChartTiles();
    } // end func
    ); // end .get
    
}

function initializeChartTiles() {
    /*  */

    // On page load, the map has to be displayed to EVER be displayed
    // #map_holder should have its width by now, so let's hide it
    // unfortunately, this is a weird place to keep this bit of code
    // fortunately, there is no negative consequence to that
    if ( !chartScatter ) { 
        $('#row-body-worldmap').addClass("extra-hidden");
        $('#row-body-worldmap').removeClass("kinda-hidden");
        console.log("hid the map!"); 
    }

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
    if (scrollStop === false) {
        scrollScatter();
    }

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
    } // end if
    
    $('.countryinfo').html(formatHTML);

}


function makeChartScatter(cYear) {
    /* Returns a preformatted scatter chart given a year. The data is loaded at
       page load as an object with the year as the identifier whose value is an
       array of objects containing cartesian coordinates.

    */

    // cDatasets = { '2011': [{x: 3, y: 2, i: "name"}, {x: 3, y: 5, i: "name"}] };

    if ( chartScatter ) { chartScatter.destroy(); console.log("chart DESTROYED!"); }

    let xlabel = cYear;
    let ctx = document.getElementById("scatter-chart").getContext('2d');
    chartScatter = new Chart(ctx, {
        type: 'scatter',
        data: {
            labels: [],
            datasets: [
                {label: '1: No Poverty',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 1),
                 backgroundColor: cGoals.get('g01'),},
                {label: '2: Zero Hunger',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 2),
                 backgroundColor: cGoals.get('g02'),},
                {label: '3: Good Health and Well-Being',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 3),
                 backgroundColor: cGoals.get('g03'),},
                {label: '4: Quality Education',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 4),
                 backgroundColor: cGoals.get('g04'),},
                {label: '5: Gender Equality',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 5),
                 backgroundColor: cGoals.get('g05'),},
                {label: '6: Clean Water and Sanitation',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 6),
                 backgroundColor: cGoals.get('g06'),},
                {label: '7: Affordable and Clean Energy',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 7),
                 backgroundColor: cGoals.get('g07'),},
                {label: '8: Decent Work and Economic Growth',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 8),
                 backgroundColor: cGoals.get('g08'),},
                {label: '9: Industry, Innovation, and Infrastructure',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 9),
                 backgroundColor: cGoals.get('g09'),},
                {label: '10: Reduced Inequalities',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 10),
                 backgroundColor: cGoals.get('g10'),},
                {label: '11: Sustainable Cities and Communities',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 11),
                 backgroundColor: cGoals.get('g11'),},
                {label: '12: Responsible Consumption and Production',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 12),
                 backgroundColor: cGoals.get('g12'),},
                {label: '13: Climate Action',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 13),
                 backgroundColor: cGoals.get('g13'),},
                {label: '14: Life Below Water',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 14),
                 backgroundColor: cGoals.get('g14'),},
                {label: '15: Life On Land',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 15),
                 backgroundColor: cGoals.get('g15'),},
                {label: '16: Peace, Justice, and Strong Institutions',
                 data: cDatasets[cYear].filter(cData => cData['x'] === 16),
                 backgroundColor: cGoals.get('g16'),},
                {label: '17: Partnerships for the Goals',
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
                bodyFontColor: 'rgb(51, 51, 51)',  // #333
                backgroundColor: 'rgb(238, 238, 238)',  // #eee
                callbacks: {
                    beforeLabel: function(tooltipItem, data) {
                        let dsi = tooltipItem.datasetIndex;
                        let dpti = tooltipItem.index;  // datapoint index
                        let goal_label = data.datasets[dsi].label;
                        let indic_label = data.datasets[dsi].data[dpti]['i'];
                        indic_label = splitTextIntoLines(indic_label, 30);
                        let ttBeforeLabel = new Array(goal_label, '');
                        indic_label.forEach(function(item) {
                            ttBeforeLabel.push(item);
                        });
                        ttBeforeLabel.push('');
                        return ttBeforeLabel;
                    }, // end beforeLabel
                    label: function(tooltipItem, data) {
                        return tooltipItem.yLabel;
                    }, // end label
                    afterLabel: function(tooltipItem, data) {
                        return
                    }, // end afterLabel
                } // end callbacks
            }, // end tooltips
            // Really good custom tooltip:
            // https://jsfiddle.net/patrickactivatr/ytLtmLgs/
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
                    ticks: {min: 0, max: 100, stepSize: 25, display: false},
                    // thanks to L Bahr 'https://stackoverflow.com/questions/37451905/how-to-set-static-value-in-y-axis-in-chart-js'
                    afterBuildTicks: function(scale) {
                      scale.ticks = [0, 10, 30, 70, 90, 100]; // set y-axis values exactly
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

function splitTextIntoLines(fullText, chars) {
    /* Splits a fullText into lines of chars or shorter length, taking care to
       split only on spaces.

    */

    let ftWords = fullText.split(' ');
    let ftLines = new Array();
    let j = 0;

    do {
        let currLine = '';
        for (let i = j; i < ftWords.length; i++) {
            if (currLine.length + ftWords[i].length + 1 > chars) {
                ftLines.push(currLine);
                j = i;
                break;
            } else {
                currLine += " " + ftWords[i];
                if (i === ftWords.length - 1) {
                    ftLines.push(currLine);
                    j = ftWords.length;
                    break;
                } // end if
            }// end if
        } // end for
    } // end do
    while (j < ftWords.length);

    return ftLines;

}


function updateTiles(cYear) {
    /* Changes the 'score' on each goal tile given a year. The scores are loaded
       at page load as a map with the year as the key whose value is a map with
       'goal_pre' ids (key) and 'score' (value). First all scores are cleared,
       then the updated scores placed, to ensure that data is for chosen year.

    */

    // cTileVals = { '2010', {g01: 5.2, g02: 7.9} };

    $('.tile-sm').html('<p class="tile-score"></p>');
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