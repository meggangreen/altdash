function scatterchart() {
    var ctx = document.getElementById("scatter-chart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '2010',
                data: [
                    {x: 1, y: 1}, 
                    {x: 2, y: 3},
                    {x: 3, y: 2},
                    {x: 4, y: 8},
                    {x: 5, y: 6},
                    {x: 6, y: 9},
                    {x: 7, y: 4},
                    {x: 8, y: 6},
                    {x: 9, y: 5},
                    {x: 10, y: 8},
                    {x: 11, y: 4}, 
                    {x: 12, y: 3},
                    {x: 13, y: 3},
                    {x: 14, y: 7},
                    {x: 15, y: 8},
                    {x: 16, y: 5},
                    {x: 17, y: 7},
                ]
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    type: 'linear',
                    scaleLabel: { display: true, labelString: '2010' },
                    position: 'bottom',
                    ticks: { min: 1, max: 18, stepSize: 1, display: false }
                }],
                yAxes: [{
                    type: 'linear',
                    ticks: {min: 0, max: 10, stepSize: 2.5, display: false}
                }]
            }
        }
    });
}