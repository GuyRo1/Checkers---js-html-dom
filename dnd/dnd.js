function uiGameBoard() {
  let container = document.getElementById("checkers-container")
  let checkersBoard = document.createElement('div')
  checkersBoard.classList.add("checkers-board")
  let circle
  let tile
  let color = true
  for (let i = 1; i < 9; i++) {
    for (let j = 1; j < 9; j++) {
      circle = document.createElement('div')
      circle.classList.add('piece')
      tile = document.createElement('div')
      tile.classList.add('tile')
      if (color)
        tile.classList.add('white-smoke')
      else
        tile.classList.add('brown')
      circle.classList.add("empty")
      tile.appendChild(circle)
      tile.id = ""+i+j
      checkersBoard.appendChild(tile)
      color=!color
    }
    color=!color
  }
  container.appendChild(checkersBoard)
}

uiGameBoard()
alert("!!!!!!!!!!")