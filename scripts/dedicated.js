// Boostrap Tooltip Config
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});


// DOM Elements
let hardwareConcurrency;
let mainContent;
let image;
let serialCanvas;
let parallelCanvas;
let barGraph;
let slider;
let sliderNum;
let serialResults;
let parallelResults;


// Assign values on load
function loadData() {
    mainContent = document.getElementById('MainContent');

    // Check compatibility
    if (!window.Worker) {
        let msg = 'Web Worker API is not supported. Consider updating or using another browser.';
        mainContent.innerHTML = `<div class="container"><p class="text-center">${msg}</p></div>`;
        throw Error(msg);
    }

    // Display the hardware concurrency
    hardwareConcurrency = document.getElementById("hardwareConcurrency");
    hardwareConcurrency.textContent = window.navigator.hardwareConcurrency;

    image = document.getElementById('imageSource');
    serialCanvas = document.getElementById('serialCanvas');
    parallelCanvas = document.getElementById('parallelCanvas');
    serialResults = document.getElementById('serialResults');
    parallelResults = document.getElementById('parallelResults');
    slider = document.getElementById('slider');
    sliderNum = document.getElementById('sliderNum')
    slider.value = 2;
    slider.max = window.navigator.hardwareConcurrency;
    sliderNum.textContent = slider.value;

    // Copy image onto canvas (serial)
    let context = serialCanvas.getContext("2d");
    serialCanvas.height = image.clientHeight;
    serialCanvas.width = image.clientWidth;
    context.drawImage(image, 0, 0);

    // Copy image onto canvas (parallel)
    context = parallelCanvas.getContext("2d");
    parallelCanvas.height = image.clientHeight;
    parallelCanvas.width = image.clientWidth;
    context.drawImage(image, 0, 0);
}





/**
 * 
 * Chart
 * 
 */
const chart = new Chart("myChart", {
    type: 'bar',
    data: {
        labels: [],
        datasets: []
    },
    options: {
        events: false,
        tooltips: {
            enabled: false
        },
        hover: {
            animationDuration: 0
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Time taken (ms)'
                }
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: true
                },
                scaleLabel: {
                    display: true,
                    labelString: '# Logical Processors Used'
                }
            }]
        },
        animation: {
            onComplete: function () {
                let chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                this.data.datasets.forEach(function (dataset, i) {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function (bar, index) {
                        var data = dataset.data[index];
                        ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                });
            }
        }
    }
});



// Add data to chart
function updateChart(processors = 1, difference, backgroundColor, label) {

    // Create a dataset with parameter value
    const dataset = {
        label,
        backgroundColor,
        data: [difference],
        processors,
    };

    // No datasets exist
    if (chart.data.datasets.length === 0) {
        chart.data.datasets.push(dataset);
    } else {
        let index = 0;
        for (let i = 0; i < chart.data.datasets.length; i++) {
            if (chart.data.datasets[i].processors === dataset.processors) {
                index = i;
            }
        }

        if (index === 0) {
            chart.data.datasets.push(dataset);
        }
    }

    // Order dataset
    chart.data.datasets.sort((dataset1, dataset2) => {
        if (dataset1.label.includes('Serial')) return -1;
        if (dataset2.label.includes('Serial')) return 1;
        return dataset1.processors - dataset2.processors;
    });

    chart.update();
}





// On slider input, update the number displayed
function updateSliderDisplay(value) {
    sliderNum.textContent = value;
}



// Perform Serial Sobel 
function performSerialSobel() {

    // Reset image
    const tempContext = serialCanvas.getContext("2d");
    tempContext.drawImage(image, 0, 0);

    const start = window.performance.now();

    let canvasData = tempContext.getImageData(0, 0, serialCanvas.width, serialCanvas.height);

    const sobelData = Sobel(canvasData);
    const sobelImageData = sobelData.toImageData();

    tempContext.putImageData(sobelImageData, 0, 0);

    const end = window.performance.now();
    const difference = `${end-start} ms`;
    serialResults.textContent = difference;
    console.log(`Execution time: ${end-start} ms`);
    updateChart(1, end - start, '#ffb1c1', 'Serial (1)');
}



function performParallelSobel() {
    // Reset image
    const tempContext = parallelCanvas.getContext("2d");
    tempContext.drawImage(image, 0, 0);

    // Check if web workers are compatible (All browsers that follow HTML5 standards are compatible)
    if (window.Worker) {

        // Record starting time
        let start = window.performance.now();
        let end;
        const numOfWorkers = slider.value;
        let finished = 0;

        // Height of the picture chunck for every worker
        const blockSize = parallelCanvas.height / numOfWorkers;

        // Function called when a worker has finished
        let onWorkEnded = function (e) {
            // Data is retrieved using a memory clone operation
            const sobelData = e.data.result;
            const index = e.data.index;

            // Copying back canvas data to canvas
            let sobelImageData = Sobel.toImageData(sobelData, parallelCanvas.width, blockSize);
            tempContext.putImageData(sobelImageData, 0, blockSize * index);

            finished++;

            if (finished == numOfWorkers) {
                // Calculate Time difference
                end = window.performance.now();
                const difference = `${end-start} ms`;
                parallelResults.textContent = difference;
                console.log(`Execution time: ${end-start} ms`);
                const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                updateChart(numOfWorkers, end - start, color, `Parallel (${numOfWorkers})`);
            }
        };

        // Launch n numbers of workers
        for (let i = 0; i < numOfWorkers; i++) {
            const worker = new Worker('./scripts/dedicatedWorker.js');
            worker.onmessage = onWorkEnded;

            // Get Image chunk
            const canvasData = tempContext.getImageData(0, blockSize * i, parallelCanvas.width, blockSize);

            // Start Working
            worker.postMessage({
                data: canvasData,
                index: i,
            });
        }
    }
}