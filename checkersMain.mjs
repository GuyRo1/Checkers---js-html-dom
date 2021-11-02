import { CheckersGame, Constants } from "./CheckersClasses.mjs"
let dragSrcEl = this; // dnd
const checkerGames = []
checkerGames[0] = new CheckersGame()
checkerGames[0].checkImport()
createAndDrawEmptyBoard(0)
drawBoard(0)
addDragableEventListiners()
setPlayerPiecesToDragabale(0)



function createAndDrawEmptyBoard(gameNumber) {
  const container = document.getElementById("container")
  const checkersBoard = document.createElement('div')
  checkersBoard.classList.add('checkersBoard')
  let tile
  let piece
  let color = true
  for (let i = 1; i < 9; i++) {
    for (let j = 1; j < 9; j++) {
      tile = document.createElement('div')
      tile.classList.add('tile')
      if (color)
        tile.classList.add('white')
      else {
        tile.classList.add('brown')
        piece = document.createElement('div')
        piece.classList.add('piece')
        piece.draggable = true
        piece.id = '' + gameNumber + "-" + i + j
        tile.appendChild(piece)
      }
      checkersBoard.appendChild(tile)
      color = !color
    }
    color = !color
  }
  container.appendChild(checkersBoard)
}

function drawBoard(gameNumber) {
  const gameBoard = checkerGames[gameNumber].getBoard()
  checkerGames[gameNumber].scanBoard((row, collumn, gameData) => {
    let gameBoard = gameData[0]
    let gameNumber = gameData[1]
    const piece = gameBoard[row][collumn]
    if (piece.needsUpdate && !(piece.color === Constants.neverPiece)) {

      let graphicPiece = document.getElementById("" + gameNumber + "-" + row + collumn)
      switch (piece.color) {
        case Constants.white:
          graphicPiece.classList.add('white')
          break;
        case Constants.black:
          graphicPiece.classList.add('black')
          break;
        default:
          graphicPiece.classList.add('brown')
          break;
      }
      piece.needsUpdate = false
    }

  }, [gameBoard, gameNumber])



}

function addDragableEventListiners() {

  let items = document.querySelectorAll('.piece');
  items.forEach(function (item) {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
}

function handleDragStart(e) {
  this.style.opacity = '0.4';

  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.classList);

}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';

  return false;
}

function handleDragEnter(e) {
  if (checkIfEmptySpot(this))
    this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }
  if (dragSrcEl != this) {
    dragSrcEl.classList = this.classList;
    dragSrcEl.classList.remove('over')
    this.classList = e.dataTransfer.getData('text/html');
  }
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';


}

function checkIfEmptySpot(target) {
  return !(target.classList.contains("white") || target.classList.contains("black"))
}

function makeTurn() {

}

function setPlayerPiecesToDragabale(gameNumber) {
  let playerBool = checkerGames[gameNumber].getPlayer()
  let playerVal = playerBool ? Constants.white:Constants.black
  let allPieces = document.getElementsByClassName("piece")
  for (let i = 0; i < allPieces.length; i++) {
    let tileValues = allPieces[i].id.split('-', 2)
    if (tileValues[0] === ""+gameNumber) {
      if (allPieces[i].classList.contains(playerVal))
        allPieces[i].draggable = true
      else
        allPieces[i].draggable = false
    }
    allPieces[i].draggable = false
  }

}



