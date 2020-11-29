// Boostrap Tooltip Config
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

// DOM Elements
let hardwareConcurrency;
let mainContent;


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
}

function startPlayer(id) {
    let playerName = document.getElementById(`playerName-${id}`).value;
    window.open(`/battleship.html?id=${id}&name=${playerName}`, `Battleship - Player ${id}`, "menubar=0");
}