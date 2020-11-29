const urlParams = new URLSearchParams(window.location.search);
if (urlParams.keys().next().done) {
	window.close();
}

const playerId = urlParams.get('id');
const playerName = urlParams.get('name');
document.addEventListener('DOMContentLoaded', function() {
	let playerTitleElem = document.getElementById('player-title');
	playerTitleElem.textContent = playerName && playerName.trim() !== '' ? `Player ${playerId} - ${playerName}` : `Player ${playerId}`;
});

let gameBoard;
let enemyGameboard;
let maxHitCount;
let enemyHitCount = 0;
let myHitCount = 0;

const worker = new SharedWorker('./scripts/sharedWorker.js');
worker.port.__originalPostMessage__ = worker.port.postMessage;
worker.port.postMessage = function(data) {
	return worker.port.__originalPostMessage__({ source: playerId, ...data });
};

worker.port.onmessage = function(event) {
	if (event.data.source === playerId) return;

	switch (event.data.type) {
		case 'begin':
			setupGameBoard(event.data.gameBoard);
			break;
		case 'fire':
			onBeingFiredAt(event.data);
			break;
		case 'hit':
			onHitEnemyShip(event.data);
	}
};

function setupGameBoard(data) {
	gameBoard = data;
	enemyGameboard = [];
	maxHitCount = gameBoard.reduce((prevRow, curRow) => prevRow += curRow.reduce((prev, cur) => prev += cur, 0), 0);

	let rows = gameBoard.length;
	let cols = gameBoard[0].length;

	let gameBoardContainer = document.getElementById("my-gameboard");
	for (let i = 0; i < cols; i++) {
		enemyGameboard.push([]);
		for (let j = 0; j < rows; j++) {
			let square = document.createElement("div");
			gameBoardContainer.appendChild(square);
			square.id = 'm' + j + i;			
			let squareSize = square.offsetHeight;
			let topPosition = j * squareSize;
			let leftPosition = i * squareSize;			
			square.style.top = topPosition + 'px';
			square.style.left = leftPosition + 'px';	
			if (gameBoard[j][i] === 1) {
				square.style.backgroundColor = '#777';
			}
			enemyGameboard[i].push(0);
		}
	}
	
	gameBoardContainer = document.getElementById("enemy-gameboard");
	gameBoardContainer.onclick = fireTorpedo;
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			let square = document.createElement("div");
			gameBoardContainer.appendChild(square);
			square.id = 'e' + j + i;			
			let squareSize = square.offsetHeight;
			let topPosition = j * squareSize;
			let leftPosition = i * squareSize;			
			square.style.top = topPosition + 'px';
			square.style.left = leftPosition + 'px';
		}
	}
}

function fireTorpedo(evemt) {
	// if item clicked (e.target) is not the parent element on which the event listener was set (e.currentTarget)
	if (evemt.target !== evemt.currentTarget) {
        // extract row and column # from the HTML element's id
		let row = evemt.target.id.substring(1,2);
		let col = evemt.target.id.substring(2,3);

		if (enemyGameboard[row][col] === 2) {
			resultPopupMegElem.textContent = "You already fired at this position.";
			$('#resultPopup').modal('show');
		} else {
			let targetedSquare = document.getElementById(`e${row}${col}`);
			targetedSquare.style.background = '#003D7A';
			enemyGameboard[row][col] = 2;
			worker.port.postMessage({ type: 'fire', row, col });
		}
    }
	evemt.stopPropagation();
}

let resultPopupMegElem = document.querySelector('#resultPopup').getElementsByClassName('modal-message')[0];

function onBeingFiredAt({ row, col }) {
	let targetedSquare = document.getElementById(`m${row}${col}`);
	if (gameBoard[row][col] == 1) {
		targetedSquare.style.backgroundColor = '#222';
		gameBoard[row][col] = 4;
		worker.port.postMessage({ type: 'hit', row, col });
		myHitCount++;
		if (myHitCount === maxHitCount) {
			resultPopupMegElem.textContent = "All of your battleships have been defeated. You lost.";
			$('#resultPopup').modal('show');
		}
	}
}

function onHitEnemyShip({ row, col }) {
	let targetedSquare = document.getElementById(`e${row}${col}`);
	targetedSquare.style.backgroundColor = 'red';
	gameBoard[row][col] = 3;
	enemyHitCount++;
	if (enemyHitCount === maxHitCount) {
		resultPopupMegElem.textContent = "All enemy battleships have been defeated. You won!";
		$("#resultPopup").modal('show');
	}
}
