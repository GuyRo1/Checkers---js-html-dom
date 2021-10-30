//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Very Primitive data structure//////////////////////////////////////////////Object name = Piece/////////////////////////////////
//3 chars piece:first letter if 1 then changed else not changed//////////////////// color(number)////0:empty,1:black,2white/
////////////////second letter if 1 then Queen if 2 then super 3 then 1+2/////////// isQueen /////////////////////////////////////
////////////////thrid letter if 1 then black if 2 then white if 0 nothing////////// isHot  //////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////// needsUpdate /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//move is a 4letter string: first letter source Row//////////////////////////Object name = move/////////////////////////////////
/////////////////////////// second letter source Collumn/////////////////////////// sourceRow //////////////////////////////////
/////////////////////////// third letter target Row//////////////////////////////// sourceCollumn///////////////////////////////
/////////////////////////// fourth letter target Collumn/////////////////////////// targetRow//////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////// target collumn/////////////////////////////
//Is legal status is an integer: 0 - is non legal move/////////////////////////////////////////////////////////////////////////
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

function getOriginalMove(){
    let originalMove = {
        sourceRow : move['sourceRow'],
        sourceCollumn : move['sourceCollumn'],
        targetRow : move['targetRow'],
        targetCollumn : move['targetCollumn']
    } 
    return originalMove
}

function getEmptyPiece(){
    let emptyPiece = {
        color:0,
        isQueen:false,
        isHot:false,
        needsUpdate:true
    }
    return emptyPiece
}

function createGameBoard() {
    board = new Array(9)
    for (let i = 1; i < 9; i++) {
        board[i] = new Array(9)
    }
}

function whoIsCaptured() {
    dirR = move['sourceRow'] < move['targertRow'] ? -1 : 1
    dirC = move['sourceCollumn'] < move['targetCollumn'] ? -1 : 1
    return [(+move[2]) + dirR, (+move[3]) + dirC]
}

function initializeBoard() {
    let isBlackTile = false
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            if (i >= 1 && i <= 3 && isBlackTile)
                board[i][j] = {
                    color:2,
                    isQueen:false,
                    isHot:false,
                    needsUpdate:true
                }
            else if (i >= 6 && i <= 8 && isBlackTile) {
                board[i][j] = {
                    color:1,
                    isQueen:false,
                    isHot:false,
                    needsUpdate:true
                }
            }
            else
            board[i][j] = {
                color:0,
                isQueen:false,
                isHot:false,
                needsUpdate:true
            }

            isBlackTile = !isBlackTile
        }
        isBlackTile = !isBlackTile
    }
}

function isLegalmove() {
    let sourcePiece = board[move['sourceRow']][move['sourceCollumn']]
    let targetPiece = board[move['targetRow']][move['targetCollumn']]
    let sourceR = move['sourceRow']
    let sourceC = move['sourceCollumn']
    let targetR = move['targetRow']
    let targetC = move['targetCollumn']
    if (targetPiece['color'] ===0) {
        if (Math.abs(targetC - sourceC) == 1)
            if (player && (targetR - sourceR == 1) || !player && (targetR - sourceR == -1))
                return 1

        if (Math.abs(targetC - sourceC) == 2)
            if ((Math.abs(targetR - sourceR) === 2))
                if ((sourcePiece['isQueen']||sourcePiece['isHot']) || (player && targetR > sourceR) || (!player && targetR < sourceR)) {
                    let capturedCords = whoIsCaptured(move)
                    let capurdedVal = (board[capturedCords[0]][capturedCords[1]])[2]
                    if (player && capurdedVal === '1' || !player && capurdedVal === '2')
                        return 2
                }

        //Queen specific logic
        if (sourcePiece['isQueen'])
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
                    if (board[newR][newC]['color'] !== 0)
                        blockEncounterd = true
                    else if (newC === targetC) // the movement can be checked only on one axis 
                        distinationFound = true
                }

                if (blockEncounterd) {
                    if (newC + dirC === targetC) {
                        blockColor = board[newR][newC]['color']
                        if ((blockColor === 1 && player) || (blockColor === 2 && !player))
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
    board[move['targetCollumn']][move['targetCollumn']] ={
        color : board[move['sourceRow']][move['sourceCollumn']]['color'],
        isQueen:board[move['sourceRow']][move['sourceCollumn']]['isQueen'],
        isHot:board[move['sourceRow']][move['sourceCollumn']]['isHot'],
        needsUpdate:true
    }
    board[move['sourceRow']][move['sourceCollumn']] = getEmptyPiece()
}

function findHotPiece() {
    for (let i = 1; i < 9; i++)
        for (let j = 1; j < 9; j++)
            if ((board[i][j])['isHot'])
                return [i, j]
    return null
}

function makePieceHot() {
    board[move['targetRow']]['targetCollumn']['isHot'] = true
}

function RemoveHotPiece() {
    let hotPieceCord = findHotPiece()
    if (hotPieceCord !== null) {
        board[hotPieceCord[0]][hotPieceCord[1]]['isHot']=false
    }
}

function canHotPieceCapture() {
    let originalMove = getOriginalMove()
    let hotPieceCord = findHotPiece()
    for (let i = 1; i < 9; i++)
        for (let j = 1; j < 9; j++) {
            move ={
                sourceRow: hotPieceCord[0],
                sourceCollumn : hotPieceCord[1],
                targetRow : i,
                targetCollumn : j
            }
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
    RemoveHotPiece(capturedPiece[0],capturedPiece[1])
}

function removPiece(row, collumn) {
    board[row][collumn] = getEmptyPiece()
}

function removeAllPacifists() {
    let pacifitGuilty = false
    let originalMove = getOriginalMove()
    let relevantPieceChar = player ? '2' : '1'
    let pacifists = new Array(8)
    let pacifistsCount = 0
    for (let i = 1; i < 9; i++)
        for (let j = 1; j < 9; j++)
            if ((board[i][j])[2] === relevantPieceChar) {
                pacifitGuilty = false
                for (let k = 1; k < 9 && !pacifitGuilty; k++)
                    for (let l = 1; l < 9 && !pacifitGuilty; l++) {
                        //move = "" + i + j + k + l
                        move = {
                            sourceRow : i,
                            sourceCollumn : j,
                            targetRow : k,
                            targetCollumn : l
                        }
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
    if ((firstTurnFaseVal['color'] === 2 && player) || ((firstTurnFaseVal['color'] === 1 && !player))) {
        move = {
            sourceRow : +firstTurnFase[0],
            sourceCollumn : +firstTurnFase[0],
            targertRow : 0,
            sourceRow : 0
        }
        return true
    }
    return false
}

function setSecondTurnFase(secondTurnFase) {
    move['targetRow'] = +secondTurnFase[0]
    move['targetCollumn'] = +secondTurnFase[1]
    return true
}

function turnPieceIntoQueen() {
    if (player && move['targetRow'] === '8' || !player && move['targetRow'] === '1') {
        board['targetRow'][move['targetCollumn']]['isQueen']=true
    }

}

function isWin() {
    let originalMove = getOriginalMove()
    let relevantPieceChar = player ? 2 : 1
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            if ((board[i][j])['color'] === relevantPieceChar) {
                for (let k = 1; k < 9; k++)
                    for (let l = 1; l < 9; l++) {
                       move = {
                           sourceRow : i,
                           sourceCollumn : j,
                           targetRow : k,
                           targetCollumn : l
                       }
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
            if (pieceValue['color'] !==0)
                if (!pieceValue['isQueen'])
                    return false
                else if (pieceValue['color'] === 1)
                    if (!oneBlackQueen)
                        oneBlackQueen = true
                    else
                        return false
                else if (pieceValue['color'] === 2)
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
        pieceRender = element.lastChild
        cords = element.id
        row = +cords[0]
        collumn = +cords[1]
        tileValue = board[row][collumn]
        if (tileValue['needsUpdate']) {
            //tileValue = replaceCharachter(tileValue, 0, '0')
            tileValue['needsUpdate'] = false
            pieceRender.className = "circle"
            if (tileValue['color'] === 0) {
                pieceRender.classList.add('empty')
            }
            else {
                if (tileValue['color'] === 1)
                    element.lastChild.classList.add('black')
                else
                    element.lastChild.classList.add('white')
                if (tileValue['isQueen'])
                    pieceRender.classList.add('queen')
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

