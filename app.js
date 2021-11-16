/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const displayTurn = document.getElementById("displayTurn"); // Used to store the h1 element which displays whose turn it is and messages when the game ends.
let topRowHoverDivs; // Used to store the top row indicator divs, for styling them to the appropriate player whose turn it is.

const WIDTH = 7; // Width of the game board
const HEIGHT = 6; // Height of the game board

let currPlayer = 1; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])
let gameOver = false;

// Generates the CSS for piece animations
// Each row has its own animation so that the pieces always look like they are coming from the top
const css = window.document.styleSheets[0];
for(let i = 0; i < HEIGHT; i++) {
  css.insertRule(`
  @keyframes fallDown${i} {
    from { transform: translateY(-${((i + 1) * 50)}px); }
    to { transform: translateY(0px); }
  }`, css.cssRules.length);
  css.insertRule(`
  #board tr:nth-child(${i + 2}) div:not(.top) {
    animation: fallDown${i} .5s;
  }`, css.cssRules.length);
}


// makeBoard - creates the JS representation of the game board, an array of rows, each row is an array of cells. (board[y][x])
function makeBoard() {
  board = [];
  for (let y = 0; y < HEIGHT; y++) {
    let column = [];
    for (let x = 0; x < WIDTH; x++) {
      column.push(null);
    }
    board.push(column);
  }
}

// makeHtmlBoard: make HTML table and row of column tops.
function makeHtmlBoard() {
  let htmlBoard = document.getElementById("board");

  // This code creates the top row above the board, where the players can click to place pieces on the board.
  // First the tr element is create, then it is set to the id "column-top" and finally the click event listener is added
  let top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  // This for loop creates all of the table cells for the top row
  // Each one gets an id which is an index number for that column
  // The cells are appended to the top row, which is appended to the htmlBoard
  for (let x = 0; x < WIDTH; x++) {
    let headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);

    // Adding a div inside for showing which player is about to play
    let topPiece = document.createElement("div");
    topPiece.classList.add("piece");
    topPiece.classList.add("top");
    topPiece.classList.add(`p${currPlayer}`);
    headCell.append(topPiece);
  }
  htmlBoard.append(top);

  // This for loop creates all of the table rows for the rest of the board by iterating over the board array
  // Each row element is created, then has cells for each location created and appended to it.
  // Each cell is given an id which contains the cell's position, formatted as y-x
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }

  // Set up the display at the top
  displayTurn.classList.add("p1");
  displayTurn.innerText = "Player 1's turn!";
}

// findSpotForCol: given column x, return top empty y (null if filled)
function findSpotForCol(x) {
  for(let y = HEIGHT - 1; y >= 0; y--) {
    if(board[y][x] === null) return y;
  }
  return null;
}

// placeInTable: update DOM to place piece into HTML table of board
function placeInTable(y, x) {
  let newPiece = document.createElement("div");
  newPiece.classList.add("piece");
  newPiece.classList.add("p" + currPlayer);

  let pieceLocation = document.getElementById(`${y}-${x}`);
  pieceLocation.append(newPiece);
}

// endGame: announce game end
function endGame(msg) {
  gameOver = true;
  displayTurn.innerText = msg;
  if(msg === "TIE!") {
    displayTurn.classList.remove("p1");
    displayTurn.classList.remove("p2");
  }
  topRowHoverDivs = document.querySelectorAll("#column-top td div");
  topRowHoverDivs.forEach(div => {
    div.classList.remove("p1");
    div.classList.remove("p2");
  });
}

// handleClick: handle click of column top to play piece
function handleClick(evt) {
  if(gameOver) return;

  let target = evt.target;
  if(target.classList.contains("top")) {
    target = target.parentElement;
  }

  // get x from ID of clicked cell
  let x = +target.id;

  // get next spot in column (if none, ignore click)
  let y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place the piece in the board and update the DOM
  board[y][x] = currPlayer;
  placeInTable(y, x);

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie by checking every cell in every row for a falsy value
  if(board.every(r => r.every(c => c))) {
    return endGame("TIE!");
  }

  // switch players
  if(currPlayer === 1) currPlayer = 2;
  else currPlayer = 1;

  // update the hover of the top row for the current player
  topRowHoverDivs = document.querySelectorAll("#column-top td div");
  topRowHoverDivs.forEach(div => {
    div.classList.remove("p1");
    div.classList.remove("p2");
    div.classList.add(`p${currPlayer}`);
  });
  
  // update the heading to display which player's turn it is
  displayTurn.innerText = `Player ${currPlayer}'s turn!`;
  displayTurn.classList.remove("p1");
  displayTurn.classList.remove("p2");
  displayTurn.classList.add(`p${currPlayer}`);
}

// checkForWin: check board cell-by-cell for "does a win start here?"
function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // These two nested for loops iterate through every cell
  // For each cell, we generate an array of four cells to check for a horizontal, vertical, diagonal right, or diagonal left victory
  // We then run the _win function on each array - if any of them return true, then return true
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();