'use strict';

// Uncomment the next lines to use your game instance in the browser
// const Game = require('../modules/Game.class');
// const game = new Game();

class Game {
  constructor(initialState = null) {
    this.board = initialState || this.createEmptyBoard();
    this.score = 0;
    this.status = 'idle';
  }

  createEmptyBoard() {
    return [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  }

  getState() {
    return this.board;
  }

  getScore() {
    return this.score;
  }

  getStatus() {
    return this.status;
  }

  addRandomTile() {
    const emptyCells = [];

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) {
          emptyCells.push({ row: r, col: c });
        }
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];

    this.board[row][col] = Math.random() < 0.1 ? 4 : 2;
  }

  start() {
    if (this.status !== 'idle') {
      return;
    }

    this.status = 'playing';

    this.addRandomTile();
    this.addRandomTile();
  }

  restart() {
    if (this.status === 'idle') {
      return;
    }

    this.board = this.createEmptyBoard();
    this.score = 0;
    this.status = 'playing';

    this.addRandomTile();
    this.addRandomTile();
  }

  moveLeft() {
    let moved = false;

    for (let r = 0; r < this.board.length; r++) {
      const row = this.board[r];
      const newRow = this.processRowLeft(row);

      if (row.join() !== newRow.join()) {
        moved = true;
      }

      this.board[r] = newRow;
    }

    if (moved) {
      this.addRandomTile();
      this.checkStatus();
    }
  }

  processRowLeft(row) {
    let newRow = row.filter((val) => val !== 0);

    for (let i = 0; i < newRow.length - 1; i++) {
      if (newRow[i] === newRow[i + 1]) {
        newRow[i] *= 2;
        this.score += newRow[i];
        newRow[i + 1] = 0;
      }
    }

    newRow = newRow.filter((val) => val !== 0);

    while (newRow.length < 4) {
      newRow.push(0);
    }

    return newRow;
  }

  moveRight() {
    let moved = false;

    for (let r = 0; r < this.board.length; r++) {
      const row = this.board[r];

      const reversed = row.slice().reverse();
      const processed = this.processRowLeft(reversed);
      const finalRow = processed.reverse();

      if (row.join() !== finalRow.join()) {
        moved = true;
      }

      this.board[r] = finalRow;
    }

    if (moved) {
      this.addRandomTile();
      this.checkStatus();
    }
  }

  moveUp() {
    this.transpose();
    this.moveLeft();
    this.transpose();

    this.checkStatus();
  }

  moveDown() {
    this.transpose();
    this.moveRight();
    this.transpose();

    this.checkStatus();
  }

  transpose() {
    const newBoard = [];

    for (let c = 0; c < 4; c++) {
      newBoard[c] = [];

      for (let r = 0; r < 4; r++) {
        newBoard[c][r] = this.board[r][c];
      }
    }

    this.board = newBoard;
  }

  checkWin() {
    if (this.board.flat().some((cell) => cell >= 2048)) {
      this.status = 'win';

      return true;
    }

    return false;
  }

  checkGameOver() {
    if (this.board.flat().some((cell) => cell === 0)) {
      return false;
    }

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (c < 3 && this.board[r][c] === this.board[r][c + 1]) {
          return false;
        }

        if (r < 3 && this.board[r][c] === this.board[r + 1][c]) {
          return false;
        }
      }
    }

    this.status = 'gameover';

    return true;
  }

  checkStatus() {
    if (this.checkWin()) {
      return;
    }

    this.checkGameOver();
  }
}

// === Ініціалізація гри ===
const game = new Game();
// Селектори
const boardEl = document.querySelector('.game-field tbody');
const scoreEl = document.querySelector('.game-score');
const msgWin = document.querySelector('.message-win');
const msgLose = document.querySelector('.message-lose');
const msgStart = document.querySelector('.message-start');
const startBtn = document.querySelector('.start');
const restartBtn = document.querySelector('.restart');

// === Рендер дошки ===
function renderBoard() {
  const state = game.getState();
  const rows = boardEl.querySelectorAll('tr');

  rows.forEach((tr, r) => {
    const cells = tr.querySelectorAll('td');

    cells.forEach((td, c) => {
      td.textContent = state[r][c] === 0 ? '' : state[r][c];
      td.className = 'field-cell';

      if (state[r][c] > 0) {
        td.classList.add(`field-cell--${state[r][c]}`);
      }
    });
  });

  // рахунок
  scoreEl.textContent = game.getScore();

  // повідомлення
  if (game.getStatus() === 'win') {
    msgWin.classList.remove('hidden');
    msgLose.classList.add('hidden');
    msgStart.classList.add('hidden');
  } else if (game.getStatus() === 'gameover') {
    msgLose.classList.remove('hidden');
    msgWin.classList.add('hidden');
    msgStart.classList.add('hidden');
  } else {
    msgStart.classList.remove('hidden');
    msgWin.classList.add('hidden');
    msgLose.classList.add('hidden');
  }
}

// === Клавіатура ===
document.addEventListener('keydown', (e) => {
  if (game.getStatus() !== 'playing') {
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
      game.moveLeft();
      break;
    case 'ArrowRight':
      game.moveRight();
      break;
    case 'ArrowUp':
      game.moveUp();
      break;
    case 'ArrowDown':
      game.moveDown();
      break;
    default:
      return;
  }
  renderBoard();
});

// === Кнопка Start ===
startBtn.addEventListener('click', () => {
  game.start();
  renderBoard();
});

// === Кнопка Restart ===
restartBtn.addEventListener('click', () => {
  game.restart();
  renderBoard();
});

// === Початковий рендер ===
renderBoard();
