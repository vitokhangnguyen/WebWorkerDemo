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
let serialResults;
let parallelResults;


// Assign values on load
function loadData() {
    mainContent =  document.getElementById('MainContent');

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



function performSerialSobel() {

    let start = window.performance.now();

    const tempContext = serialCanvas.getContext("2d");
    var canvasData = tempContext.getImageData(0, 0, serialCanvas.width, serialCanvas.height);

    const sobelData = Sobel(canvasData);
    const sobelImageData = sobelData.toImageData();

    tempContext.putImageData(sobelImageData, 0, 0);

    let end = window.performance.now();
    const difference = `${end-start} ms`;
    serialResults.textContent = difference;
    console.log(`Execution time: ${end-start} ms`);
}



function performParallelSobel() {
    let start = window.performance.now();
    let end;
    const numOfWorkers = 8;
    let finished = 0;
    const blockSize = parallelCanvas.height / numOfWorkers; // Height of the picture chunck for every worker
    const tempContext = parallelCanvas.getContext("2d");

    // Function called when a job is finished
    var onWorkEnded = function (e) {
        // Data is retrieved using a memory clone operation
        const sobelData = e.data.result;
        const index = e.data.index;

        // Copying back canvas data to canvas
        var sobelImageData = Sobel.toImageData(sobelData, parallelCanvas.width, blockSize);
        tempContext.putImageData(sobelImageData, 0, blockSize * index);

        finished++;

        if (finished == numOfWorkers) {
            end = window.performance.now();
            const difference = `${end-start} ms`;
            parallelResults.textContent = difference;
            console.log(`Execution time: ${end-start} ms`);
        }
    };


    // Launch n numbers of workers
    for (let i = 0; i < numOfWorkers; i++) {
        const worker = new Worker('./scripts/dedicatedWorker.js');
        worker.onmessage = onWorkEnded;

        // Get Image chunk
        const canvasData = tempContext.getImageData(0, blockSize * i, parallelCanvas.width, blockSize);

        worker.postMessage({
            data: canvasData,
            index: i,
        });
    }
}
