/////////////////////////////////////////////////////////////////////////////
//Very Primitive data structure//////////////////////////////////////////////
//3 chars piece:first letter if 1 then changed else not changed//////////////
////////////////second letter if 1 then Queen if 2 then super 3 then 1+2/////
////////////////thrid letter if 1 then black if 2 then white if 0 nothing////
/////////////////////////////////////////////////////////////////////////////
//move is a 4letter string: first letter source Row//////////////////////////
/////////////////////////// second letter source Collumn/////////////////////
/////////////////////////// third letter target Row//////////////////////////
/////////////////////////// fourth letter target Collumn/////////////////////
/////////////////////////////////////////////////////////////////////////////
//Is legal status is an integer: 0 - is non legal move///////////////////////
/////////////////////////////////1 - is step/////////////////////////////////
/////////////////////////////////2 - is capture//////////////////////////////
/////////////////////////////////////////////////////////////////////////////
//make a turn returns an interer: 0 - a move wasnt made//////////////////////
//////////////////////////////////1 - a move was made next players turn//////
//////////////////////////////////2 - a move was made same players turn//////
/////////////////////////////////////////////////////////////////////////////
function replaceCharachter(locationData, paramter, value) {
    let pieceAsArray = locationData.split("")
    pieceAsArray[paramter] = value
    return pieceAsArray.join("")
}

function createGameBoard() {
    board = new Array(9)
    for (let i = 1; i < 9; i++) {
        board[i] = new Array(9)
    }
}

function whoIsCaptured() {
    dirR = move[0] < move[2] ? -1 : 1
    dirC = move[1] < move[3] ? -1 : 1
    return [(+move[2]) + dirR, (+move[3]) + dirC]
}

function initializeBoard() {
    let isBlackTile = false
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            if (i >= 1 && i <= 3 && isBlackTile)
                board[i][j] = "102"
            else if (i >= 6 && i <= 8 && isBlackTile) {
                board[i][j] = "101"
            }
            else
                board[i][j] = "100"

            isBlackTile = !isBlackTile
        }
        isBlackTile = !isBlackTile
    }
}

function isLegalmove() {
    let sourcePiece = board[+move[0]][+move[1]]
    let targetPiece = board[+move[2]][+move[3]]
    let sourceR = +move[0]
    let sourceC = +move[1]
    let targetR = +move[2]
    let targetC = +move[3]
    if (targetPiece[2] == '0') {
        if (Math.abs(targetC - sourceC) == 1)
            if (player && (targetR - sourceR == 1) || !player && (targetR - sourceR == -1))
                return 1

        if (Math.abs(targetC - sourceC) == 2)
            if ((Math.abs(targetR - sourceR) === 2))
                if ((sourcePiece[1] !== '0') || (player && targetR > sourceR) || (!player && targetR < sourceR)) {
                    let capturedCords = whoIsCaptured(move)
                    let capurdedVal = (board[capturedCords[0]][capturedCords[1]])[2]
                    if (player && capurdedVal === '1' || !player && capurdedVal === '2')
                        return 2
                }

        //Queen specific logic
        if (sourcePiece[1] === '1' || sourcePiece[1] === '3')
            if (Math.abs(targetC - sourceC) === Math.abs(targetR - sourceR)) {
                let distinationFound = false
                let blockEncounterd = false
                let dirC = targetC > sourceC ? 1 : -1
                let dirR = targetR > sourceR ? 1 : -1
                let newC = sourceC
                let newR = sourceR
                while (!distinationFound && !blockEncounterd) {
                    newC += dirC
                    newR += dirR
                    if ((board[newR][newC])[2] !== '0')
                        blockEncounterd = true
                    else if (newC === targetC) // the movement can be checked only on one axis 
                        distinationFound = true
                }

                if (blockEncounterd) {
                    if (newC + dirC === targetC) {
                        blockColor = (board[newR][newC])[2]
                        if ((blockColor === '1' && player) || (blockColor === '2' && !player))
                            return 2
                    }
                }
                else
                    return 1


            }
    }
    return 0
}

function makeMove() {
    movedPiece = board[move[0]][move[1]]
    movedPiece = replaceCharachter(movedPiece, 0, '1')
    board[move[2]][move[3]] = movedPiece
    board[move[0]][move[1]] = '100'
}

function findHotPiece() {
    for (let i = 1; i < 9; i++)
        for (let j = 1; j < 9; j++)
            if ((board[i][j])[1] === '2' || (board[i][j])[1] === '3')
                return [i, j]
    return null
}

function makePieceHot() {
    changedPiece = board[+(move[2])][+(move[3])]
    let hotChar = (changedPiece[1] === '1' || changedPiece[1] == '3') ? '3' : '2'
    changedPiece = replaceCharachter(changedPiece, 1, hotChar)
    board[+(move[2])][+(move[3])] = changedPiece
}

function RemoveHotPiece() {
    let hotPieceCord = findHotPiece()
    if (hotPieceCord !== null) {
        let hotPieceVal = board[hotPieceCord[0]][hotPieceCord[1]]
        normalPieceChar = hotPieceVal[1] == '2' ? '0' : '1'
        board[hotPieceCord[0]][hotPieceCord[1]] = replaceCharachter(hotPieceVal, 1, normalPieceChar)
    }
}

function canHotPieceCapture() {
    let originalMove = move // check if by value or by reference
    let hotPiceCord = findHotPiece()
    for (let i = 1; i < 9; i++)
        for (let j = 1; j < 9; j++) {
            move = "" + hotPiceCord[0] + hotPiceCord[1] + i + j
            if (isLegalmove() == 2) {
                move = originalMove
                return true
            }
        }
    move = originalMove
    return false
}

function removeCaptured() {
    let capturedPiece = whoIsCaptured()
    board[capturedPiece[0]][capturedPiece[1]] = '100'
}

function removPiece(row, collumn) {
    board[row][collumn] = '100'
}

function removeAllPacifists() {
    let pacifitGuilty = false
    let originalMove = move
    let relevantPieceChar = player ? '2' : '1'
    let pacifists = new Array(8)
    let pacifistsCount = 0
    for (let i = 1; i < 9; i++)
        for (let j = 1; j < 9; j++)
            if ((board[i][j])[2] === relevantPieceChar) {
                pacifitGuilty = false
                for (let k = 1; k < 9 && !pacifitGuilty; k++)
                    for (let l = 1; l < 9 && !pacifitGuilty; l++) {
                        move = "" + i + j + k + l
                        if (isLegalmove() === 2) {
                            pacifitGuilty = true
                            pacifists[pacifistsCount] = [i, j]
                            pacifistsCount++
                        }
                    }
            }
    move = originalMove

    if (pacifistsCount !== 0)
        for (let i = 0; i < pacifistsCount; i++)
            removPiece(pacifists[i][0], pacifists[i][1])

}

function setFirstTurnFase(firstTurnFase) {
    let firstTurnFaseVal = board[+firstTurnFase[0]][+firstTurnFase[1]]
    if ((firstTurnFaseVal[2] === '2' && player) || ((firstTurnFaseVal[2] === '1' && !player))) {
        move = "" + firstTurnFase
        return true
    }
    return false
}

function setSecondTurnFase(secondTurnFase) {
    if (move.length == 2)
        move += secondTurnFase
    else {
        move = replaceCharachter(move, 2, secondTurnFase[0])
        move = replaceCharachter(move, 3, secondTurnFase[1])
    }

    return true
}

function turnPieceIntoQueen() {
    if (player && move[2] === '8' || !player && move[2] === '1') {
        movedPieceVal = board[+(move[2])][+(move[3])]
        movedPieceVal = replaceCharachter(movedPieceVal, 1, '1')
        board[+(move[2])][+(move[3])] = movedPieceVal
    }

}

function isWin() {
    let originalMove = move
    let relevantPieceChar = player ? '2' : '1'
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            if ((board[i][j])[2] === relevantPieceChar) {
                for (let k = 1; k < 9; k++)
                    for (let l = 1; l < 9; l++) {
                        move = "" + i + j + k + l
                        if (isLegalmove() !== 0) {
                            move = originalMove
                            return false
                        }
                    }
            }
        }
    }
    move = originalMove
    return true
}

function isDraw() {
    let oneBlackQueen = false
    let oneWhiteQueen = false
    for (let i = 1; i < 9; i++)
        for (let j = 1; j < 9; j++) {
            pieceValue = board[i][j]
            if (pieceValue[2] == '1' || pieceValue[2] == '2')
                if (pieceValue[1] == '0' || pieceValue[1] == '2')
                    return false
                else if (pieceValue[2] == '1')
                    if (!oneBlackQueen)
                        oneBlackQueen = true
                    else
                        return false
                else if (pieceValue[2] == '2')
                    if (!oneWhiteQueen)
                        oneWhiteQueen = true
                    else
                        return false
        }
    return oneBlackQueen & oneWhiteQueen
}

function makeAturn() {

    let nextPlayer = true
    let moveStatus
    moveStatus = isLegalmove()
    if (moveStatus > 0) {
        if (moveStatus === 1)
            removeAllPacifists()
        makeMove()
        turnPieceIntoQueen()
        if (moveStatus === 2) {
            removeCaptured()
            makePieceHot()
            if (canHotPieceCapture())
                nextPlayer = false
            else
                RemoveHotPiece()
        }
        return nextPlayer?1:2
    }
    return 0

}
///////////////Render Engine///////////
function drow() {

    let tiles = document.getElementsByClassName('tile')
    let tilesLength = tiles.length
    let row
    let collumn
    let tileValue
    let cords
    let element
    for (let i = 0; i < tilesLength; i++) {
        element = tiles[i]
        cords = element.id
        row = +cords[0]
        collumn = +cords[1]
        tileValue = board[row][collumn]
        if (tileValue[0] === '1') {
            tileValue = replaceCharachter(tileValue, 0, '0')
            element.lastChild.className = "circle"
            if (tileValue[2] === '0') {
                element.lastChild.classList.add('empty')
                board[row][collumn] = tileValue
            }
            else {
                if (tileValue[2] === '1')
                    element.lastChild.classList.add('black')
                else
                    element.lastChild.classList.add('white')
                if (tileValue[1] === '1' || tileValue[1] === '3')
                    element.lastChild.classList.add('queen')
            }
            board[row][collumn] = tileValue
        }
    }
}
//////////////////////-Script starts here /////////////////////
let board
let move
let player = false
let pieceWasntChosen = true
const startNewGameButton = document.getElementById("start")
const checkersContainer = document.getElementById("checks-container")
const nav = document.getElementById("nav")
let gameEnded = false
start.textContent = "Start game"
start.addEventListener('click', () => {
    if (checkersContainer.lastChild) {
        createGameBoard()
        initializeBoard()
        let highlighted = document.getElementsByClassName('highlight')
        let highlightedLength = highlighted.length
        for (let i = 0; i < highlightedLength; i++)
            highlighted[i].classList.remove('highlight')
        drow()
        player = false
        pieceWasntChosen = true
        gameEnded = false
    }

    else {
        checkersContainer.classList.remove("checkers-container-empty")
        checkersContainer.classList.add("checkers-container-full")
        const chessBoard = document.createElement('div')
        chessBoard.classList.add('Chess__Board')
        let tile
        let color = true
        for (let i = 1; i < 9; i++) {
            for (let j = 1; j < 9; j++) {
                circle = document.createElement('div')
                circle.classList.add('circle')
                tile = document.createElement('div')
                tile.classList.add('tile')
                if (color)
                    tile.classList.add('white-smoke')
                else
                    tile.classList.add('brown')
                circle.classList.add("empty")
                circle.addEventListener('click', (event) => {
                    event.stopPropagation()
                    if (!gameEnded) {
                        if (!pieceWasntChosen) {
                            let highlighted = document.getElementsByClassName('highlight')
                            let highlightedLength = highlighted.length
                            for (let i = 0; i < highlightedLength; i++)
                                highlighted[i].classList.remove('highlight')
                        }
                        if (setFirstTurnFase(event.currentTarget.parentElement.id)) {
                            event.currentTarget.classList.add('highlight')
                            pieceWasntChosen = false
                        }
                    }
                })
                tile.appendChild(circle)
                tile.addEventListener('click', (event) => {
                    //////////////////////////////////////all the code of clicking an empty tile is here
                    if (!pieceWasntChosen && !gameEnded) {
                        if (setSecondTurnFase(event.currentTarget.id)) {
                            let nextPlayer = true
                            let moveStatus = makeAturn()
                            if (moveStatus > 0) {
                                let sourceTile = document.getElementById(move.substr(0, 2))
                                sourceTile.classList.remove('highlight')
                                drow()
                                pieceWasntChosen = true
                                if(moveStatus===2)
                                    nextPlayer = false
                            }
                            let winner = ""
                            if (nextPlayer) {
                                player = !player
                                if (isWin()) {
                                    gameEnded = true
                                    winner = player ? "Black won" : "White won"
                                }

                                else if (isDraw()) {
                                    gameEnded = true
                                    winner = "with a draw"
                                }

                                if (gameEnded)
                                    setTimeout(() => { alert(`The game was ended, ${winner}`) }, 2000)
                            }
                        }

                    }
                })

                tile.id = "" + i + j
                chessBoard.appendChild(tile)
                color = !color
            }
            color = !color
        }
        let padding = document.createElement('div')
        padding.className = "checkers-padding-left"
        checkersContainer.appendChild(padding)
        checkersContainer.appendChild(chessBoard)
        padding = document.createElement('div')
        padding.className = "checkers-padding-right"
        checkersContainer.appendChild(padding)
        createGameBoard()
        initializeBoard()
        drow()
        start.textContent = "Start new game"
    }
})
////////////Testing area/////////////////////////////////////////////////////////////////////////
