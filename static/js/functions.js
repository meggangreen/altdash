'use strict';

let cCountries, cCountry, cGoalsRaw, cGoals = new Map ([]);
let cYear, cYears, cMin, cMax, yearI, scrollStop;
let chartScatter, cDatasets, cTileVals, cInformation;
let chartGoals = new Set ([]), chartIndicators = new Set ([]);

$(document).ready(function() {
    /* When the page loads, sets up some variables and event listeners, calls
       the 'conductorLoadWholePage' function. */

    cCountries = $('.opt-country').toArray();
    cGoalsRaw = $('.tile-sm').toArray();
    cGoalsRaw.forEach(storeGoalAttrs);
    $('.goal-chart').each(function() { chartGoals.add(this.id); });
    $('.indicator-chart').each(function() { chartIndicators.add(this.id); });

    // Start the data-to-chart flow
    selectCountry();

    // Event listeners
    $('#select-country').on('change', selectCountry);
    $('#btn-random').on('click', selectCountry);
    $('.btn').on('click', swapDivs);

}); // end doc.ready


/*******************/
/**** FUNCTIONS ****/
/*******************/

function storeGoalAttrs(element, index, array) {
    /* Populate map of goal ids-colors for use in charts. */

    let g_id = element.id.slice(0,3);  // '00'
    let g_color = element.style['background-color'];  // '#EEEEEE'
    let g_descr = element.title.slice(9);  // ' ... '
    cGoals.set(g_id, [g_color, g_descr]);

} // end storeGoalAttrs


function swapDivs(evt) {
    /* Show and hide appropriate div elements after button click. Makes goal and
       indicator (second- and third-level) charts on first use.

    */

    scrollStop = true;  // stop scrolling scatter chart

    if ( $(this).data('toggle') !== 'extra-hidden' ) {
        return null;
    }

    let toHide = $(this).data('sender');
    let toShow = $(this).data('target');
    let toGoal = '#' + $(this).data('goalA');  // #gEEd or #gEEm or #undefined

    $(toHide).addClass("extra-hidden");
    
    // hide all 3rd level divs when navigating away from 3rd level
    if (toHide === '#row-body-goal-minutiae') {
        $('.goal-minutiae').addClass("extra-hidden");
    }

    if (toShow === '#row-body-tiledetails') {
        if ($(toShow).find('.chartjs-size-monitor').length === 0) {
            chartGoals.forEach( function callback(chartGoalID, junk, Set) {
                makeChartGoal(chartGoalID);
            });
        } // end if
        if ( toGoal !== '#undefined' ) {
            console.log('not scrolling!');
            $('html, body').animate(
                { scrollTop: $(toGoal).offset().top -65 }, 
                500, 'linear');
        } // end if
    } // end if

    if (toShow === '#row-body-goal-minutiae') {
        if ($(toShow).find('.chartjs-size-monitor').length === 0) {
            chartIndicators.forEach( function callback(chartIndicID, junk, Set) {
                makeChartIndicator(chartIndicID);
            });
        } // end if
    } // end if

    // unhide appropriate goal row(s)
    if (toShow === '#row-body-goal-minutiae') {
        if (toHide === '#row-body-gm-showall') {
            $('#row-goalminutiae').children().removeClass("extra-hidden");
        } else {
            $(toGoal).parent().removeClass("extra-hidden");
        }
    }

    // history.pushState(data, title, 'level-two');
    $(toShow).removeClass("extra-hidden");

} // end swapDivs


function selectCountry(evt) {
    /* Handles new country selection. Calls 'destroyGoalIndicCharts' and
       'getCountryData'. 

    */

    // Stop scatter scroll
    scrollStop = true;

    // Start loading screen
    $('#loading-overlay').fadeIn();

    // Destroy existing goal and indicator charts
    destroyGoalIndicCharts();

    // Scroll to the top of the page
    $('html, body').animate({scrollTop: $('body').offset().top}, 500, 'linear');

    // Where did the country selection come from?
    // URL, drop-down list, map (not written), no where OR random button
    if ( true === false /* url contained country, pull from url */ ) {
        // pull from url
        // stick in data-country
    } else if ( $(this).attr('id') === "select-country" ) {
        $('#select-country').data('country', $(this).val()); 
    } else {  // Pick randomized country
        let r = Math.floor(Math.random() * cCountries.length);
        let rCountry = cCountries[r].value;
        $('#select-country').data('country', rCountry);
    } // end if
    
    cCountry = $('#select-country').data('country');
    $('#select-country').val(cCountry);

    getCountryData(cCountry);

} // end selectCountry


function getCountryData(cCountry) {
    /* Retrieves country data and calls 'mapExtraHidden', 'makeSlider', and
       'updateChartTiles'.

    */

    $.get('/country-data.json', { 'country_id': cCountry }, function(results) {
        cDatasets = results.cDatasets;
        cTileVals = results.cTileVals;
        cInformation = results.cInformation;

        // All have to stay inside callback for now, until promise implemented
        scrollStop = false;
        mapExtraHidden();
        makeSlider();
        updateChartTiles();
    } // end func
    ); // end .get
    
} // end getCountryData


function mapExtraHidden() {
    /* Sets the map div to 'extra-hidden'. 

       On page load, the map has to be displayed to EVER be displayed;
       #map_holder should have its width by now, so let's hide it.
       Unfortunately, this is a weird place to keep this bit of code.
       Fortunately, there is no negative consequence to that.

    */

    if ( !chartScatter ) { 
        $('#row-body-worldmap').addClass("extra-hidden");
        $('#row-body-worldmap').removeClass("kinda-hidden");
        console.log("hid the map!"); 
    }

} // end mapExtraHidden


function makeSlider() {
    /* Make the slider to control the first level scatter chart and tiles.
       Define the functions that get called when the slider is moved.

    */

    if ( $('#slider').slider() ) { // always created on page load
        $('#slider').slider('destroy'); console.log("slider DESTROYED!");
    } // end if

    cMax = $('#slider').data('max');
    cMin = $('#slider').data('min');
    cYear = cMax; // first time cYear is set

    let sliderTooltip = function(event, ui) {
        let ttYear = ui.value || cMax;
        let tooltip = '<div class="slider-tt"><div class="slider-tt-inner">' +
                      ttYear +
                      '</div><div class="slider-tt-arrow"></div></div>';
        $('.ui-slider-handle').html(tooltip);
    }; // end sliderTooltip

    let sliderSelectYear = function(event, ui) {
        scrollStop = true;  // stop scrolling scatter chart
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

} // end makeSlider


function updateChartTiles(evt) {
    /* Call the functions to make / update the first level chart and tiles.
       'getCountryData' and the slider stop event both call this function.

    */

    makeCountryInfo();
    updateTiles(cYear);
    if (scrollStop === false) {
        scrollScatter();
    } else {
        makeChartScatter(cYear);
    }
    $('.btn').removeAttr('disabled');
    $('#loading-overlay').fadeOut();

} // end updateChartTiles


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
            // set overlay with 'play' button on chart div
        }
    },
    500);

} // end scrollScatter


function makeCountryInfo() {
    /* Populate the divs reserved in each level for the country information. */

    let cName = cInformation.name;
    let cIncome = cInformation.income;
    let cRegion = cInformation.region;
    let cWikiurl = cInformation.wikiurl;
    let cGroups = cInformation.groups;
    let formatHTML, formatH4, formatPHead;

    if ( (cIncome && cRegion && cWikiurl) === null ) {

        formatH4 = `<h4>${cName}</h4>`;
        formatPHead = 'Member Countries';

                      // <div id="col-tiles-push" class="hidden-xs col-md-4" 
                      //      style="height: 17px;"></div>`;
        
    } else {
        
        formatH4 = `<h4>
                      <a href="${cWikiurl}" target="_blank" 
                        title="${cName} at Wikipedia">${cName}</a>
                      | ${cIncome} | ${cRegion}
                    </h4>`;
        formatPHead = 'Other groups';

    } // end if

    console.log(formatH4);

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

    let formatP = `<p>${formatPHead}: ${cGroupList}</p>`;

    formatHTML = formatH4 + formatP;
    
    $('.countryinfo').html(formatHTML);

} // end makeCountryInfo


function updateTiles(cYear) {
    /* Changes the 'score' on each goal tile given a year. The scores are loaded
       at page load as a map with the year as the key whose value is a map with
       'goal_pre' ids (key) and 'score' (value). First all scores are cleared,
       then the updated scores placed, to ensure that data is for chosen year.

       These are the "first level small tiles".

    */

    // cTileVals = { '2010', {g01: 5.2, g02: 7.9} };

    $('.tile-sm').html('<p class="tile-score"></p>');
    for ( let tileId in cTileVals[cYear] ) {
        let tileVal = cTileVals[cYear][tileId];
        $('#' + tileId + 'sm').html('<p class="tile-score">' + tileVal + '</p>');
    } // end for

} // end updateTiles


function makeChartScatter(cYear) {
    /* Returns a preformatted scatter chart given a year. The data is loaded at
       page load as an object with the year as the identifier whose value is an
       array of objects containing cartesian coordinates.

       This is the "first level chart".

    */

    // cDatasets = { '2011': [{x: 3, y: 2, v: 7, s: 10, i: "id", i_text: "name"} ] };

    if ( chartScatter ) { chartScatter.destroy(); console.log("chart DESTROYED!"); }

    let ctx = $('#scatter-chart')[0].getContext('2d');
    let cYearData = new Array();
    for ( let i = 1; i < 18; i++ ) {
        let iStr = String(i).padStart(2, "0");
        let obj = {
            label: iStr + ': ' + cGoals.get('g' + iStr)[1],
            data: cDatasets[cYear].filter(cData => cData['x'] === i),
            backgroundColor: cGoals.get('g' + iStr)[0],
        }; // end obj
        cYearData.push(obj);
    } // end for

    chartScatter = new Chart(ctx, {
        type: 'scatter',
        data: { labels: [], datasets: cYearData, }, // end chart data
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
                        let indic_label = data.datasets[dsi].data[dpti]['i_text'];
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
                    scaleLabel: { display: true, labelString: cYear },
                    position: 'bottom',
                    ticks: { min: 1, max: 17.2, stepSize: 1, display: false }
                }], // end xAxes
                yAxes: [{
                    type: 'linear',
                    scaleLabel: { display: false },
                    ticks: {min: 0, max: 100, stepSize: 25, display: false},
                    // thanks to L Bahr 'https://stackoverflow.com/questions/37451905/how-to-set-static-value-in-y-axis-in-chart-js'
                    afterBuildTicks: function(scale) {
                      scale.ticks = [0, 10, 30, 70, 90, 100];  // set y-axis values exactly
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


function makeChartGoal(chartGoalID) {
    /* Returns a preformatted line chart given a goal prefix. The scores are
       loaded at page load as a map with the year as the key whose value is a 
       map with 'goal_pre' ids (key) and 'score' (value). Goal chart ids are
       saved in chartGoals.

       Only called the first time that the tile-details section is shown for the
       first time for a given country.

       This is the "second level chart" or "goal chart".

    */

    // cTileVals = { '2010', {g01: 5.2, g02: 7.9} };
    // chartGoalID = 'chart-gEE';

    let cGoalID = chartGoalID.slice(-3);
    let cGoalColor = cGoals.get(cGoalID)[0];
    let ctx = $('#' + chartGoalID + '-ctx')[0].getContext('2d');
    let cGoalData = new Array();
    for ( let yearI = cMin; yearI <= cMax; yearI++ ) {
        let yearStr = String(yearI);
        let dataY = cTileVals[yearStr][cGoalID];
        let obj = { x: yearI, y: dataY };
        cGoalData.push(obj);
    } // end for

    let chartGoal = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{
                data: cGoalData, 
                backgroundColor: cGoalColor,
            }] // end datasets
         }, // end chart data
        options: {
            animation: { duration: 0 },
            legend: { display: false },
            responsive: true,
            maintainAspectRatio: false,
            elements: { 
                point: { 
                    radius: 2, 
                    hoverRadius: 7,
                    borderColor: cGoalColor,
                }, // end points
                line: { 
                    fill: false,
                    backgroundColor: cGoalColor,
                    borderColor: cGoalColor,
                    borderWidth: 0,
                }, // end line
            }, // end elements
            tooltips: {
                displayColors: false,
                bodyFontColor: 'rgb(51, 51, 51)',  // #333
                backgroundColor: 'rgb(238, 238, 238)',  // #eee
                callbacks: {
                    label: function(tooltipItem, data) {
                        let ttYLabel = tooltipItem.yLabel;
                        let ttXLabel = tooltipItem.xLabel;
                        return ttXLabel + ": " + ttYLabel;
                    }, // end label
                } // end callbacks
            }, // end tooltips
            // Really good custom tooltip:
            // https://jsfiddle.net/patrickactivatr/ytLtmLgs/
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: { display: true, labelString: 'Year' },
                    position: 'bottom',
                    ticks: { min: cMin, max: cMax, stepSize: 20, display: true }
                }], // end xAxes
                yAxes: [{
                    type: 'linear',
                    scaleLabel: { display: false },
                    ticks: {min: 0, max: 100, stepSize: 25, display: false},
                    // thanks to L Bahr 'https://stackoverflow.com/questions/37451905/how-to-set-static-value-in-y-axis-in-chart-js'
                    afterBuildTicks: function(scale) {
                      scale.ticks = [0, 10, 30, 70, 90, 100];  // set y-axis values exactly
                      return;
                    },
                    beforeUpdate: function(oScale) {
                      return;
                    }
                }] // end yAxes
            } // end scales
        } // end chart options
    }); // end chartGoal

} // end makeChartGoal


function makeChartIndicator(chartIndicatorID) {
    /* Returns a preformatted line chart given an indicator id. The scores are
       loaded at page load as a map with the year as the key whose value is a 
       map with 'v' ids (key) whose value WILL BE the actual score but for now
       is still the display value. Indicator chart ids are saved in 
       chartIndicators.

       Only called the first time that the goal-minutiae section is shown for the
       first time for a given country.

       This is the "third level chart" or "indicator chart".

    */

    // cDatasets = { '2011': [{x: 3, y: 2, v: 7, s: 10, i: "id", i_text: "name"}] };
    // chartIndicatorID = 'chart-...';

    let cIndicID = chartIndicatorID.slice(6);
    // currently only replaces first instance
    let cIndicLookup = cIndicID.replace(/\./g, '');
    let cGoalColor = $('.chart-' + cIndicLookup).data('color');
    let ctx = $('#chart-' + cIndicLookup + '-ctx')[0].getContext('2d');
    let cIndicatorData = new Array();
    
    for ( let yearI = cMin; yearI <= cMax; yearI++ ) {
        let yearStr = String(yearI);
        let indicData = cDatasets[yearStr].filter(cData => cData['i'] === cIndicID);
        if (indicData.length > 0) {
            let dataY = indicData[0]['y'];
            let obj = { x: yearI, y: dataY };
            cIndicatorData.push(obj);
        } // end if
    } // end for

    let chartIndicator = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: [], 
            datasets: [{
                data: cIndicatorData, 
                backgroundColor: cGoalColor,
            }] // end datasets
         }, // end chart data
        options: {
            animation: { duration: 0 },
            legend: { display: false },
            responsive: true,
            maintainAspectRatio: false,
            elements: { 
                point: { 
                    radius: 2, 
                    hoverRadius: 7,
                    borderColor: cGoalColor,
                }, // end points
                line: { 
                    fill: false,
                    backgroundColor: cGoalColor,
                    borderColor: cGoalColor,
                    borderWidth: 0,
                }, // end line
            }, // end elements
            tooltips: {
                displayColors: false,
                bodyFontColor: 'rgb(51, 51, 51)',  // #333
                backgroundColor: 'rgb(238, 238, 238)',  // #eee
                callbacks: {
                    label: function(tooltipItem, data) {
                        let ttYLabel = tooltipItem.yLabel;
                        let ttXLabel = tooltipItem.xLabel;
                        return ttXLabel + ": " + ttYLabel;
                    }, // end label
                } // end callbacks
            }, // end tooltips
            // Really good custom tooltip:
            // https://jsfiddle.net/patrickactivatr/ytLtmLgs/
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: { display: true, labelString: 'Year' },
                    position: 'bottom',
                    ticks: { min: cMin, max: cMax, stepSize: 20, display: true }
                }], // end xAxes
                yAxes: [{
                    type: 'linear',
                    scaleLabel: { display: false },
                    ticks: {min: 0, max: 100, stepSize: 25, display: false},
                    // thanks to L Bahr 'https://stackoverflow.com/questions/37451905/how-to-set-static-value-in-y-axis-in-chart-js'
                    afterBuildTicks: function(scale) {
                      scale.ticks = [0, 10, 30, 70, 90, 100];  // set y-axis values exactly
                      return;
                    },
                    beforeUpdate: function(oScale) {
                      return;
                    }
                }] // end yAxes
            } // end scales
        } // end chart options
    }); // end chartIndicator

} // end makeChartIndicator


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

} // end splitTextIntoLines


function destroyGoalIndicCharts() {
    /* Replaces inner html on all goal and indicator (second and third level)
       charts with the plain canvas element only, effectively destroying
       existing charts.js-created elements, classes, and objects.
    
    */

    const htmlBefore = '<canvas id="';
    const htmlAfter = '-ctx" height="1px" width="1px"></canvas>';

    // Destroy goal and indicator charts
    $('.goal-chart').empty();
    $('.indicator-chart').empty();

    // Append canvas element to each .goal-chart with appropriate id
    for (let goal of chartGoals) {
        $('#' + goal).append(htmlBefore + goal + htmlAfter);
    }

    // Append canvas element to each .indicator-chart with appropriate id
    for (let indicator of chartIndicators) {
        let indic = indicator.replace(/\./g, '');
        $('.' + indic).append(htmlBefore + indic + htmlAfter);
    }

} // end destroyGoalIndicCharts
