'use strict'

const MINE = '💣'
const FLAG = '⛳️'

var gBoard
var gTimerInterval
var maxPoints

var gLevel = {
	SIZE: 4,
	MINES: 2
}
var gGame = {
	isOn: false,
	shownCount: 0,
	markedCount: 0,
	secsPassed: 0,
	lives: 0,
	points: 0
}

function onInit() {
	gBoard = buildBoard()
	renderBoard(gBoard)
}

function buildBoard() {
	const board = []
	for (var i = 0; i < gLevel.SIZE; i++) {
		board[i] = []
		for (var j = 0; j < gLevel.SIZE; j++) {
			board[i][j] = {
				minesAroundCount: 0,
				isShown: false,
				isMine: false,
				isMarked: false
			}
		}
	}
	return board
}

function setMines(safeRow, safeCol) {
	//Randomized
	for (var i = 0; i < gLevel.MINES; i++) {
		do {
			var row = getRandomInt(0, gBoard.length)
			var col = getRandomInt(0, gBoard.length)
		} while (gBoard[row][col].isMine ||
			row === safeRow && col === safeCol)

		gBoard[row][col].isMine = true
	}

	//Count Mines around count and store them
	for (var i = 0; i < gLevel.SIZE; i++) {
		for (var j = 0; j < gLevel.SIZE; j++) {
			gBoard[i][j].minesAroundCount = setMinesNegsCount(i, j)
		}
	}
}

function setMinesNegsCount(rowIdx, colIdx) {
	var count = 0
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (i === rowIdx && j === colIdx) continue
			if (j < 0 || j >= gBoard.length) continue
			var currCell = gBoard[i][j]
			if (currCell.isMine) count++
		}
	}
	return count
}

function renderBoard(board) {
	var strHTML = ''
	for (var i = 0; i < gLevel.SIZE; i++) {
		strHTML += '<tr>'
		for (var j = 0; j < gLevel.SIZE; j++) {
			const currCell = board[i][j]
			var className = ''
			var cellContent = ''

			if (currCell.isShown === false) className = 'closed'

			if (currCell.isShown && !currCell.isMine)
				cellContent = currCell.minesAroundCount
			if (cellContent === 0) cellContent = ''

			if (currCell.isShown && currCell.isMine) {
				cellContent = MINE
				className = 'mine'
			}

			//Test without !currCell.isShown
			if (currCell.isMarked && !currCell.isShown)
				cellContent = FLAG

			strHTML += `<td class="cell ${className}"
						onclick="onCellClicked(this, ${i}, ${j})"
						oncontextmenu="event.preventDefault(); onCellMarked(this, ${i}, ${j})">
						${cellContent}</td>`
		}
		strHTML += '</tr>'
	}
	const elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

function onCellClicked(elCell, i, j) {
	const clickedCell = gBoard[i][j]

	//First Verifications
	if (clickedCell.isShown || clickedCell.isMarked) return

	//Check if it's user's first click
	if (gGame.isOn === false) {
		gGame.isOn = true
		document.querySelector('.game-state span').innerText = 'On'
		setMines(i, j)
		setMinesNegsCount(i, j)
		gTimerInterval = setInterval(updateTimer, 1000)
	}

	if (clickedCell.isMine) {
		if (checkGameOver() === false) {
			gGame.lives--
			document.querySelector('.lives span').innerText = gGame.lives
			gLevel.points++
		}
	}

	if (clickedCell.isShown === false) {
		clickedCell.isShown = true
		gGame.points++
		gGame.shownCount++
		document.querySelector('.open-cells span').innerText = gGame.shownCount

		if (clickedCell.minesAroundCount === 0 &&
			!clickedCell.isMine &&
			!clickedCell.isMarked) {
			clickedCell.isShown
			expandShown(i, j)
		}

	}
	console.log('gGame.points = ', gGame.points)

	checkVictory()
	renderBoard(gBoard)
}

function onCellMarked(elCell, i, j) {
	const clickedCell = gBoard[i][j]

	if (!gGame.isOn || clickedCell.isShown) return

	if (clickedCell.isMarked) {
		clickedCell.isMarked = false
		gGame.markedCount--
		gGame.points--
		console.log('gGame.points = ', gGame.points)
	}
	else {
		clickedCell.isMarked = true
		gGame.markedCount++
	}
	document.querySelector('.marked-cells span').innerText = gGame.markedCount

	if (clickedCell.isMarked && clickedCell.isMine) {
		gGame.points++
		console.log('gGame.points = ', gGame.points)
		checkVictory()
	}
	renderBoard(gBoard)
}

function expandShown(rowIdx, colIdx) {
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i >= gBoard.length) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (i === rowIdx && j === colIdx) continue
			if (j < 0 || j >= gBoard.length) continue
			if (!gBoard[i][j].isMine &&
				!gBoard[i][j].isShown &&
				!gBoard[i][j].isMarked) {
				gBoard[i][j].isShown = true
				gGame.shownCount++
				gGame.points++
			}
		}
	}
	//renderBoard(gBoard)
}

function checkGameOver() {
	if (gGame.lives === 1) {
		clearInterval(gTimerInterval)
		var elModal = document.querySelector('.modal')
		elModal.classList.remove('hidden')
		elModal.innerText = 'Game over, you lost!'
		showAllCells()
		return true
	}
	return false
}

function showAllCells() {
	for (var i = 0; i < gLevel.SIZE; i++) {
		for (var j = 0; j < gLevel.SIZE; j++) {
			gBoard[i][j].isShown = true
		}
	}
}

function resetGame() {
	initializeCounters()
	onInit()
}

function checkVictory() {
	if (gGame.points === maxPoints) {
		clearInterval(gTimerInterval)
		var elModal = document.querySelector('.modal')
		elModal.classList.remove('hidden')
		elModal.innerText = 'YOU WON !'
	}
}

function initializeCounters() {
	clearInterval(gTimerInterval)
	gGame.isOn = false
	gGame.shownCount = 0
	gGame.markedCount = 0
	gGame.secsPassed = 0
	gGame.lives = 3
	gGame.points = 0
	maxPoints = (gLevel.SIZE * gLevel.SIZE)

	document.querySelector('.game-state span').innerText = 'Off'
	document.querySelector('.timer span').innerText = gGame.secsPassed
	document.querySelector('.open-cells span').innerText = gGame.shownCount
	document.querySelector('.marked-cells span').innerText = gGame.markedCount
	document.querySelector('.lives span').innerText = gGame.lives

	document.querySelector('.modal').classList.add('hidden')

}

function updateTimer() {
	gGame.secsPassed++
	document.querySelector('.timer span').innerText = gGame.secsPassed
}

function onChangeLevel(level) {
	switch (level) {
		case 'Beginner':
			gLevel.SIZE = 4
			gLevel.MINES = 2
			break
		case 'Intermediate':
			gLevel.SIZE = 8
			gLevel.MINES = 14
			break
		case 'Advanced':
			gLevel.SIZE = 12
			gLevel.MINES = 32
			break
	}
	resetGame()
}

function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min) + min)
}