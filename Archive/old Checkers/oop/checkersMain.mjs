import { CheckersGame, Constants } from "./CheckersClasses.mjs"
const checkerGameElements = {
  container: { nodeName: 'container', type: 'div', htmlId: 'container', cssClass: 'checker-containers__container' },
  gameUi: { nodeName: 'gameUi', type: 'div', htmlId: 'gameUi', cssClass: '.container__ui' },
  dataBox: { nodeName: 'dataBox', type: 'div', htmlId: 'dataBox', cssClass: 'ui__data-box' },
  checkersBoard: { nodeName: 'checkersBoard', type: 'div', htmlId: 'checkersBoard', cssClass: 'container__checkers-board' },
  nextPlayer: { nodeName: 'nextPlayer', type: 'button', htmlId: 'nextPlayerButton', cssClass: '' },
  restartButton: { nodeName: 'restart', type: 'button', htmlId: 'restartButton', cssClass: '' }
}
let dragSource = null
const checkerGames = []


const addNewGame = document.getElementById('addNew')
addNewGame.addEventListener('click', () => {
  const gamesLocation = document.getElementById('checker-containers')
  let gameNumber = checkerGames.length
  const gameNodes = createCheckersGameElements(gameNumber)
  gameNodes.checkersBoard = addTilesToBoard(gameNodes.checkersBoard, gameNumber)
  gameNodes.restart.textContent = "Restart Game"
  gameNodes.restart.addEventListener('click', (event) => {
    gameNumber = +getGameFromId(event.target.id)
    checkerGames[gameNumber].newGame()
    drawBoard(gameNumber)
    setPlayerPiecesToDraggable(gameNumber)
  })
  gameNodes.nextPlayer.textContent = "next player"
  gameNodes.nextPlayer.classList.add('invisible')
  gameNodes.nextPlayer.addEventListener('click', (event) => {
    gameNumber = +getGameFromId(event.target.id)
    checkerGames[gameNumber].nextPlayer()
    drawBoard(gameNumber)
    setPlayerPiecesToDraggable(gameNumber)
    event.target.classList.add('invisible')
  })
  gameNodes.gameUi.append(gameNodes.dataBox, gameNodes.restart, gameNodes.nextPlayer)
  gameNodes.container.append(gameNodes.checkersBoard, gameNodes.gameUi)
  gamesLocation.append(gameNodes.container)
  checkerGames[gameNumber] = new CheckersGame()
  gameNodes.dataBox.textContent = `${checkerGames[gameNumber].getPlayer() ? "white" : "black"}'s turn`
  addDraggableEventListeners()
  drawBoard(gameNumber)
  setPlayerPiecesToDraggable(gameNumber)
})

function addTilesToBoard(checkersBoard, gameNumber) {
  let tile
  let piece
  let color = true
  for (let i = 1; i < 9; i++) {
    for (let j = 1; j < 9; j++) {
      tile = createNodeWithClass('div', 'checkers-board__tile')
      if (color)
        tile.classList.add('white')
      else {
        tile.classList.add('brown')
        piece = createNodeWithClass('div', 'tile__piece')
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
  checkerGames[gameNumber].scanBoard((row, column, gameData) => {
    let gameBoard = gameData[0]
    let gameNumber = gameData[1]
    const piece = gameBoard[row][column]
    if (piece.needsUpdate && !(piece.color === Constants.neverPiece)) {

      let graphicPiece = document.getElementById("" + gameNumber + "-" + row + column)
      graphicPiece.className = "tile__piece"
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

function addDraggableEventListeners() {

  let items = document.querySelectorAll('.tile__piece')
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
    this.classList.add('over')
}

function handleDragLeave(e) {
  this.classList.remove('over')
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }
  if (dragSource != this) {
    makeATurn(dragSource, this)
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

function makeATurn(sourcePiece, targetPiece) {

  if (getGameFromId(sourcePiece.id) === getGameFromId(targetPiece.id)) {

    let gameID = getGameFromId(sourcePiece.id)
    let dataBox = document.getElementById(gameID + "-" + checkerGameElements.dataBox.htmlId)
    let nextPlayerButton = document.getElementById(gameID + "-" + checkerGameElements.nextPlayer.htmlId)
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
        nextPlayerButton.classList.remove('invisible')
        break;
    }

    if (status === Constants.draw || status === Constants.win)
      setAllPiecesNonDraggable(gameID)
    else
      setPlayerPiecesToDraggable(gameID)

    if (status === Constants.samePlayer)
      nextPlayerButton.classList.remove('invisible')
  }
}

function setPlayerPiecesToDraggable(gameNumber) {
  let playerBool = checkerGames[gameNumber].getPlayer()
  let playerVal = playerBool ? Constants.white : Constants.black
  let allPieces = document.getElementsByClassName("tile__piece")
  for (let i = 0; i < allPieces.length; i++) {
    if (getGameFromId(allPieces[i].id) === "" + gameNumber) {
      if (allPieces[i].classList.contains(playerVal))
        allPieces[i].draggable = true
      else
        allPieces[i].draggable = false
    }
  }
}

function setAllPiecesNonDraggable(gameNumber) {
  let allPieces = document.getElementsByClassName("tile__piece")
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

function createCheckersGameElements(gameId) {
  let gameElements = {}
  let gameElementsArray =[]
  let i=0
  for(const element in checkerGameElements){
    gameElementsArray[i++] = checkerGameElements[element]
  }
  for (const element of gameElementsArray) {
    gameElements[element.nodeName] = document.createElement(element.type)
    gameElements[element.nodeName].id = gameId + "-" + element.htmlId
    if (element.cssClass !== '')
      gameElements[element.nodeName].classList.add(element.cssClass)
  }
  return gameElements
}

function createNodeWithClass(nodeType, className) {
  let node = document.createElement(nodeType)
  node.classList.add(className)
  return node
}










