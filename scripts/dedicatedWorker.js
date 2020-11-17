importScripts('./sobel.js');

self.onmessage = function (event) {
    const index = event.data.index;
    const sobelData = Sobel(event.data.data);

    self.postMessage({ result: sobelData, index: index});
};