/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const displayTurn = document.getElementById("displayTurn"); // Used to store the h1 element which displays whose turn it is and messages when the game ends.
displayTurn.style.color = "white";
const startNewGame = document.getElementById("start-new-game");
const colorForm = document.getElementById("color-input");
let topRowHoverDivs; // Used to store the top row indicator divs, for styling them to the appropriate player whose turn it is.

const WIDTH = 7; // Width of the game board
const HEIGHT = 6; // Height of the game board

// Generates the CSS for piece animations
// Each row has its own animation so that the pieces always look like they are coming from the top
const css = window.document.styleSheets[0];
for (let i = 0; i < HEIGHT; i++) {
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

class Game {
  constructor(p1, p2, width = WIDTH, height = HEIGHT) {
    this.players = [p1, p2];
    this.width = width;
    this.height = height;
    this.currPlayer = p1;
    this.gameOver = false;
    this.makeBoard()
    this.makeHtmlBoard();
  }

  // makeBoard - creates the JS representation of the game board, an array of rows, each row is an array of cells. (board[y][x])
  makeBoard() {
    this.board = [];
    for (let y = 0; y < HEIGHT; y++) {
      let column = [];
      for (let x = 0; x < WIDTH; x++) {
        column.push(null);
      }
      this.board.push(column);
    }
  }

  // makeHtmlBoard: make HTML table and row of column tops.
  makeHtmlBoard() {
    let htmlBoard = document.getElementById("board");
    htmlBoard.innerHTML = "";

    // This code creates the top row above the board, where the players can click to place pieces on the board.
    // First the tr element is create, then it is set to the id "column-top" and finally the click event listener is added
    let top = document.createElement("tr");
    top.setAttribute("id", "column-top");

    this.bindHandleClick = this.handleClick.bind(this);

    top.addEventListener("click", this.bindHandleClick);

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
      topPiece.style.backgroundColor = "black";
      topPiece.onmouseover = () => topPiece.style.backgroundColor = this.currPlayer.color;
      topPiece.onmouseout = () => topPiece.style.backgroundColor = "black";
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
    displayTurn.style.color = this.currPlayer.color;
    displayTurn.innerText = "Player 1's turn!";
  }

  // findSpotForCol: given column x, return top empty y (null if filled)
  findSpotForCol(x) {
    for (let y = HEIGHT - 1; y >= 0; y--) {
      if (this.board[y][x] === null) return y;
    }
    return null;
  }

  // placeInTable: update DOM to place piece into HTML table of board
  placeInTable(y, x) {
    let newPiece = document.createElement("div");
    newPiece.classList.add("piece");
    newPiece.style.backgroundColor = this.currPlayer.color;

    let pieceLocation = document.getElementById(`${y}-${x}`);
    pieceLocation.append(newPiece);
  }

  // endGame: announce game end
  endGame(msg) {
    this.gameOver = true;
    displayTurn.innerText = msg;
    if (msg === "TIE!") {
      displayTurn.style.color = "white";
    } else {
      displayTurn.style.color = this.currPlayer.color;
    }
    topRowHoverDivs = document.querySelectorAll("#column-top td div");
    topRowHoverDivs.forEach(div => {
      div.style.backgroundColor = "black";
      div.onmouseover = null;
      div.onmouseout = null;
    });
  }

  // handleClick: handle click of column top to play piece
  handleClick(evt) {
    if (this.gameOver) return;

    let target = evt.target;
    let currentTopDiv = evt.target.children[0];
    if (target.classList.contains("top")) {
      currentTopDiv = target;
      target = target.parentElement;
    }

    // get x from ID of clicked cell
    let x = +target.id;

    // get next spot in column (if none, ignore click)
    let y = this.findSpotForCol(x);
    if (y === null) {
      return;
    }

    // place the piece in the board and update the DOM
    this.board[y][x] = this.currPlayer.playerNumber;
    this.placeInTable(y, x);

    // check for win
    if (this.checkForWin()) {
      return this.endGame(`Player ${this.currPlayer.playerNumber} won!`);
    }

    // check for tie by checking every cell in every row for a falsy value
    if (this.board.every(r => r.every(c => c))) {
      return this.endGame("TIE!");
    }

    // switch players
    if (this.currPlayer.playerNumber === 1) this.currPlayer = this.players[1];
    else this.currPlayer = this.players[0];

    // update the hover of the top row for the current player
    topRowHoverDivs = document.querySelectorAll("#column-top td div");
    topRowHoverDivs.forEach(div => {
      div.style.backgroundColor = "black";
      if(div === currentTopDiv) div.style.backgroundColor = this.currPlayer.color;
      div.onmouseover = () => div.style.backgroundColor = this.currPlayer.color;
    });

    // update the heading to display which player's turn it is
    displayTurn.innerText = `Player ${this.currPlayer.playerNumber}'s turn!`;
    displayTurn.style.color = this.currPlayer.color;
  }

  // checkForWin: check board cell-by-cell for "does a win start here?"
  checkForWin() {
    const _win = cells => {
      // Check four cells to see if they're all color of current player
      //  - cells: list of four (y, x) cells
      //  - returns true if all are legal coordinates & all match currPlayer
      return cells.every(
        ([y, x]) =>
          y >= 0 &&
          y < this.height &&
          x >= 0 &&
          x < this.width &&
          this.board[y][x] === this.currPlayer.playerNumber
      );
    }

    // These two nested for loops iterate through every cell
    // For each cell, we generate an array of four cells to check for a horizontal, vertical, diagonal right, or diagonal left victory
    // We then run the _win function on each array - if any of them return true, then return true
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
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
}

class Player {
  constructor(color, num) {
    this.color = color;
    this.playerNumber = num;
  }
}

const checkIfValidColor = (stringColor) => {
  const testDiv = document.createElement("div").style;
  testDiv.color = stringColor;
  return testDiv.color !== "";
}

document.getElementById("game-start").addEventListener('click', (event) => {
  event.preventDefault();

  let p1 = new Player(document.getElementById("color-input-p1").value, 1);
  let p2 = new Player(document.getElementById("color-input-p2").value, 2);

  if(!checkIfValidColor(p1.color) || !checkIfValidColor(p2.color)) {
    startNewGame.innerText = "Enter valid colors!";
  }
  else {
    new Game(p1, p2);
    colorForm.style.position = "absolute";
    colorForm.style.bottom = "0%";
    startNewGame.innerText = "Start a new game."
    colorForm.reset();
  }
});