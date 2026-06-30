// initialize canvas and context
const board = document.getElementById("game-board");
let intervalId = null;
let isPlaying = false;

// initialize call size and board size
const CELL_SIZE = 20;

// standard size
let rows = 20;
let cols = 20;
let gridSize = 20;

let grid = [];

/*
function changeGridSize() {
  const gridSize = document.getElementById("grid-size");
  gridSize.addEventListener("input", (event) => {
    const curNumber = Number(event.target.value);
    if (curNumber < 8) {
      event.target.value = 8;
      curNumber = 8;
    }
    if (curNumber > 50) {
      event.target.value = 50;
      curNumber = 50;
    }
    rows = curNumber;
    cols = curNumber;
  });
}*/

document.addEventListener("DOMContentLoaded", () => {
  changeGridSize();
});

function changeGridSize() {
  const gridSizeField = document.getElementById("grid-size");
  gridSizeField.value = gridSize;
  gridSizeField.addEventListener("change", (event) => {
    const curValue = Number(event.target.value);
    console.log("curValue = " + curValue);
    console.log("gridSize = " + gridSize);
    if (curValue < 8 || curValue > 50 || !Number.isInteger(curValue)) {
      alert("The grid size is not in range! Please choose another one.");
      gridSizeField.value = gridSize;
      return;
    }
    if (curValue > gridSize) {
      console.log("Should increase");
      increaseGridSize(curValue - gridSize);
    } else if (curValue < gridSize) {
      console.log("Should decrease");
      decreaseGridSize(gridSize - curValue);
    }

    gridSize = curValue;
    rows = curValue;
    cols = curValue;
  });
}

/**
 * Increases grid array size by 1.
 */
function increaseGridSize(amount) {
  for (let j = 0; j < amount; j++) {
    rows++;
    cols++;
    gridSize++;
    grid.forEach((row) => row.push(false));
    grid.push(new Array(cols).fill(false));

    const boardRows = document.querySelectorAll(".row");
    let counter = 0;
    boardRows.forEach((row) => {
      let newCell = document.createElement("div");
      newCell.className = "cell";
      newCell.id = counter++ + "-" + (cols - 1);
      newCell.classList.add("dead");
      row.appendChild(newCell);
    });

    let newRow = document.createElement("div");
    newRow.className = "row";
    for (let i = 0; i < cols; i++) {
      let newCell = document.createElement("div");
      newCell.className = "cell";
      newCell.id = rows - 1 + "-" + i;
      newCell.classList.add("dead");
      newRow.appendChild(newCell);
    }
    board.appendChild(newRow);
  }
}

function decreaseGridSize(amount) {
  rows -= amount;
  cols -= amount;
  gridSize -= amount;
  for (let i = 0; i < amount; i++) {
    grid.forEach((row) => row.pop());
    grid.pop();

    board.removeChild(board.lastChild);
    const boardRows = document.querySelectorAll(".row");
    boardRows.forEach((row) => row.removeChild(row.lastChild));
  }
}

function initializeGrid() {
  grid = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      grid[i][j] = false;
    }
  }
}

function createGrid() {
  initializeGrid();
  for (let i = 0; i < rows; i++) {
    let newRow = document.createElement("div");
    newRow.className = "row";
    for (let j = 0; j < cols; j++) {
      let newCell = document.createElement("div");
      newCell.className = "cell";
      newCell.id = i + "-" + j;
      if (grid[i][j]) newCell.classList.add("alive");
      else newCell.classList.add("dead");
      newRow.appendChild(newCell);
    }
    board.appendChild(newRow);
  }
}

function randomizeGrid() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      grid[i][j] = Math.random() > 0.75 ? true : false;
    }
  }
}

function calculateNeighbours(row, col) {
  let count = 0;
  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      if (i === 0 && j === 0) continue;
      let r = row + i;
      let c = col + j;
      if (r < 0 || c < 0 || r >= rows || c >= cols) continue;
      if (grid[r][c]) count++;
    }
  }
  return count;
}

/**
 * Updates the grid using 'Game of Life' rules.
 */
function updateGrid() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let neighbours = calculateNeighbours(i, j);
      if (grid[i][j] && (neighbours < 2 || neighbours > 3)) {
        grid[i][j] = false;
      } else if (!grid[i][j] && neighbours === 3) {
        grid[i][j] = true;
      }
    }
  }
}

/**
 * Checks for new alive or dead cells and sets appropriate classes to them.
 */
function updateBoard() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let cell = document.getElementById(i + "-" + j);
      if (grid[i][j]) {
        cell.classList.remove("dead");
        cell.classList.add("alive");
      } else {
        cell.classList.remove("alive");
        cell.classList.add("dead");
      }
    }
  }
}

function startGame() {
  clearInterval(intervalId);
  isPlaying = true;
  intervalId = setInterval(() => {
    updateGrid();
    updateBoard();
  }, 200);
}

function pauseGame() {
  clearInterval(intervalId);
  isPlaying = false;
}

function restartGame() {
  clearInterval(intervalId);
  isPlaying = false;
  initializeGrid();
  updateBoard();
}

createGrid();

// buttons
const startBtn = document.getElementById("start-btn");
startBtn.addEventListener("click", startGame);
const pauseBtn = document.getElementById("pause-btn");
pauseBtn.addEventListener("click", pauseGame);
const restartBtn = document.getElementById("restart-btn");
restartBtn.addEventListener("click", restartGame);
const randomizeBtn = document.getElementById("randomize-btn");
randomizeBtn.addEventListener("click", () => {
  clearInterval(intervalId);
  isPlaying = false;
  randomizeGrid();
  updateBoard();
});
