// Boostrap Tooltip Config
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

// DOM Elements
let hardwareConcurrency;



// Assign values on load
function loadData() {
    // Display the hardware concurrency
    hardwareConcurrency = document.getElementById("hardwareConcurrency");
    hardwareConcurrency.textContent = window.navigator.hardwareConcurrency;
}