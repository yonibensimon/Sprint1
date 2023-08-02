'use strict'

var gBoard
var gLevel = {
	SIZE: 4,
	MINES: 2
}
var gGame = {
	isOn: false,
	showCount: 0,
	markedCount: 0,
	secsPassed: 0
}

function onInit() {
	gBoard = buildBoard()
	//setMines()
	renderBoard(gBoard)
}

function buildBoard() {
	const board = []

	for (var i = 0; i < gLevel.SIZE; i++) {
		board[i] = []
		for (var j = 0; j < gLevel.SIZE; j++) {
			const currCell = {
				minesAroundCount: 0,
				isShown: false,
				isMine: false,
				isMarked: false
			}
			board[i][j] = currCell
		}
	}
	//hard-coded
	board[0][0].isMine = true;
	board[3][3].isMine = true;
	return board
}

function renderBoard(board) {
	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>'
		for (var j = 0; j < board.length; j++) {
			const currCell = board[i][j]

			var cellClass = (currCell.isMine) ? 'mine' : ''

			strHTML += `<td class="cell ${cellClass}"
						data-i="${i}" data-j="${j}"
						onclick="onCellClicked(this, ${i}, ${j})"></td>\n`
		}
		strHTML += '</tr>'

	}
	const elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}