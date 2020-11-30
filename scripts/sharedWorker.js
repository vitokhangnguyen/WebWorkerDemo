/* Total points: 17
 * Carrier     - 5 hits
 * Battleship  - 4 hits
 * Destroyer   - 3 hits
 * Submarine   - 3 hits
 * Patrol Boat - 2 hits
 *
 * Status codes:
 * 0 - water
 * 1 - your ship
 * 2 - already fire
 * 3 - hit
 * 4 - sunken ship
 */
const allGameBoards = [
    [
        [0,0,0,1,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,0,0,0],
        [0,0,0,0,0,0,1,0,0,0],
        [1,0,0,0,0,0,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0],
        [1,0,0,1,0,0,0,0,0,0],
        [1,0,0,1,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0],
    ],
    [
        [0,0,0,0,0,0,0,0,0,0],
        [0,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,0],
        [0,0,0,0,0,0,0,0,1,0],
        [1,0,0,0,0,0,0,0,1,0],
        [1,0,0,0,0,0,0,0,0,0],
        [1,0,1,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0,0,0],
    ],
    [
        [0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1],
        [0,0,1,1,0,0,0,0,0,0],
        [0,0,1,1,0,0,0,0,0,0],
        [0,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
    ],
    [
        [0,0,0,0,0,0,1,1,1,1],
        [0,1,0,0,0,0,0,0,0,0],
        [0,1,0,0,0,0,0,0,0,0],
        [0,1,0,0,0,0,0,0,0,0],
        [0,1,0,0,0,0,0,0,0,0],
        [0,1,0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,0,1,1,1],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,1,1,1],
    ],
    [
        [0,0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,0],
        [0,0,0,1,0,1,0,0,0,0],
        [0,0,0,1,0,1,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [1,1,1,0,0,0,0,1,1,1],
        [0,0,0,0,0,0,0,0,0,0],
    ],
];

let lastRandomBoardIndex;

function getRandomGameboard() {
    let randomBoardIndex = lastRandomBoardIndex;
    while (lastRandomBoardIndex === randomBoardIndex) {
        randomBoardIndex = Math.floor(Math.random() * allGameBoards.length);
    }
    lastRandomBoardIndex = randomBoardIndex;
    return allGameBoards[randomBoardIndex];
}

let gameReady;
let allPorts = [];

function checkAndAlertWhenGameReady() {
    if (!gameReady) {
        gameReady = allPorts.length > 0;
        if (gameReady) {
            allPorts.forEach(p => p.postMessage({ type: 'ready' }));
        }
    }
}

onconnect = function(connectEvent) {
    let port = connectEvent.ports[0];
    port.onmessage = function(messageEvent) {
        allPorts.forEach(p => p.postMessage(messageEvent.data));
    };
    port.postMessage({ type: 'begin', ready: allPorts.length > 0, gameBoard: getRandomGameboard() });
    checkAndAlertWhenGameReady();
    allPorts.push(port);
}