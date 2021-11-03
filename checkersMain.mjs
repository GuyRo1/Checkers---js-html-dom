import { CheckersGame, Constants } from "./CheckersClasses.mjs"
let dragSource = null
const checkerGames = []
const addNewGame = document.getElementById('addNew')
addNewGame.addEventListener('click', () => {
  const gamesLocation = document.getElementById('checker-containers')

  let gameNumber = checkerGames.length
  const container = document.createElement('div')
  container.classList.add('container')

  const other = document.createElement('div')
  other.classList.add('checkerOther')

  const data = document.createElement('div')
  data.classList.add('data-box')
  other.append(data)
  data.id = gameNumber + "-" + "data box"

  const checkerBoard = createAndDrawEmptyBoard(gameNumber)
  checkerBoard.id = gameNumber + "-" + "checkersGame"

  let restartGame = document.createElement('button')
  restartGame.id = gameNumber + "-" + "RestartButton"
  restartGame.textContent = "Restart Game"
  restartGame.addEventListener('click', (event) => {
    gameNumber = +getGameFromId(event.target.id)
    checkerGames[gameNumber].newGame()
    drawBoard(gameNumber)
    setPlayerPiecesToDragabale(gameNumber)
  })
  let nextPlayer = document.createElement('button')
  nextPlayer.textContent = "next player"
  nextPlayer.id = gameNumber + "-" + "NextPlayer"
  nextPlayer.classList.add('invisibale')
  nextPlayer.addEventListener('click', (event) => {
    gameNumber = +getGameFromId(event.target.id)
    checkerGames[gameNumber].nextPlayer()
    drawBoard(gameNumber)
    setPlayerPiecesToDragabale(gameNumber)
    event.target.classList.add('invisibale')
  })

  other.append(restartGame)
  other.append(nextPlayer)

  container.append(other)
  container.append(checkerBoard)
  gamesLocation.append(container)
  checkerGames[gameNumber] = new CheckersGame()
  drawBoard(gameNumber)
  data.textContent = `${checkerGames[gameNumber].getPlayer() ? "white" : "black"}'s turn`
  addDragableEventListiners()
  setPlayerPiecesToDragabale(gameNumber)
})

function createAndDrawEmptyBoard(gameNumber) {
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
  return checkersBoard
}

function drawBoard(gameNumber) {
  const gameBoard = checkerGames[gameNumber].getBoard()
  checkerGames[gameNumber].scanBoard((row, collumn, gameData) => {
    let gameBoard = gameData[0]
    let gameNumber = gameData[1]
    const piece = gameBoard[row][collumn]
    if (piece.needsUpdate && !(piece.color === Constants.neverPiece)) {

      let graphicPiece = document.getElementById("" + gameNumber + "-" + row + collumn)
      graphicPiece.className = "piece"
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

      if (piece.isQueen)
        graphicPiece.classList.add('queen')
      piece.needsUpdate = false
    }

  }, [gameBoard, gameNumber])



}

function addDragableEventListiners() {

  let items = document.querySelectorAll('.piece')
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

  dragSource = this;
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
  if (dragSource != this) {
    makeAturn(dragSource, this)
    this.classList.remove('faded')
    dragSource.classList.remove('faded')
    this.classList.remove('over')

  }
  return false;
}

function handleDragEnd(e) {
  this.style.opacity = '1';


}

function checkIfEmptySpot(target) {
  return !(target.classList.contains("white") || target.classList.contains("black"))
}

function makeAturn(sourcePiece, targetPiece) {

  if (getGameFromId(sourcePiece.id) === getGameFromId(targetPiece.id)) {

    let gameID = getGameFromId(sourcePiece.id)
    let dataBox = document.getElementById(gameID + "-" + "data box")
    let nextPlayerButton = document.getElementById(gameID + "-" + "NextPlayer")
    let sourcePieceCords = getCordsFromId(sourcePiece.id)
    let targetPieceCords = getCordsFromId(targetPiece.id)
    let status = checkerGames[gameID].setTurn(sourcePieceCords + targetPieceCords)
    let player = checkerGames[gameID].getPlayer()
    let playerText = player ? "white" : "black"
    drawBoard(gameID)
    switch (status) {
      case Constants.win:
        dataBox.textContent = `The game is over, ${playerText} won`
        break;
      case Constants.draw:
        dataBox.textContent = `The game is over its a draw`
        break;
      case Constants.nextPlayer:
        dataBox.textContent = `${playerText}'s turn`
        break;
      case Constants.samePlayer:
        nextPlayerButton.classList.remove('invisibale')
        break;
    }

    if (status === Constants.draw || status === Constants.win)
      setAllPiecesNonDragable(gameID)
    else
      setPlayerPiecesToDragabale(gameID)

    if (status === Constants.samePlayer)
      nextPlayerButton.classList.remove('invisibale')
  }
}

function setPlayerPiecesToDragabale(gameNumber) {
  let playerBool = checkerGames[gameNumber].getPlayer()
  let playerVal = playerBool ? Constants.white : Constants.black
  let allPieces = document.getElementsByClassName("piece")
  for (let i = 0; i < allPieces.length; i++) {
    if (getGameFromId(allPieces[i].id) === "" + gameNumber) {
      if (allPieces[i].classList.contains(playerVal))
        allPieces[i].draggable = true
      else
        allPieces[i].draggable = false
    }
  }
}

function setAllPiecesNonDragable(gameNumber) {
  let allPieces = document.getElementsByClassName("piece")
  for (let i = 0; i < allPieces.length; i++) {
    if (getGameFromId(allPieces[i].id) === "" + gameNumber)
      allPieces[i].draggable = false
  }
}

function splitID(id) {
  return id.split('-', 2)
}

function getGameFromId(id) {
  return splitID(id)[0]
}

function getCordsFromId(id) {
  return splitID(id)[1]
}



