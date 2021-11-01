const myEnum = {
    white: "white",
    black: "black",
    empty: "empty",
    step: "step",
    captrue: "capture",
    noMove: "noMove",
    win: "win",
    draw: "draw",
    regular: "regular",
    nextPlayer: "nextPlayer",
    samePlayer: "samePlayer",
    noTurn: "noTurn",
    queen: "queen",
    hotPiece: "hotPiece",
    regularPiece: "regularPiece"
}

class Cordinates {
    constructor(row, collumn) {
        this.row = row
        this.collumn = collumn
    }

    isSameLocation(cordinates) {
        reutrn(this.row === cordinates.row && this.collumn === cordinates.collumn)

    }
}

class Move {
    constructor(sourceRow, sourceCollumn, targetRow, targetCollumn) {
        this.sourceRow = sourceRow
        this.sourceCollumn = sourceCollumn
        this.targetRow = targetRow
        this.targetCollumn = targetCollumn
    }

    cloneMove() {
        return new Move(this.sourceRow, this.sourceCollumn, this.targetRow, this.targetCollumn)
    }

    turnToCords() {
        return [new Cordinates(this.sourceRow, this.sourceCollumn), new Cordinates(this.targetRow, this.targetCollumn)]
    }

}

class Checker {
    constructor(color) {
        this.color = color
        this.isQueen = false
        this.isHot = false
        this.needsUpdate = true
    }

    static getEmptyPiece() {
        return new Checker(myEnum.empty)
    }

    clonePiece() {
        let clone = new Checker(this.color)
        clone.isHot = this.isHot
        clone.isQueen = this.isQueen
        clone.needsUpdate = true
        return clone

    }
}

class CheckersGame {
    constructor() {
        this.multi = false
        this.multiPiece = null
        this.move = null
        this.multi = false
        this.gameEnded = false
        this.player = false
        this.board = this.createBoard()
        this.initializeBoard()
    }

    newGame() {
        this.multi = false
        this.multiPiece = null
        this.move = null
        this.multi = false
        this.gameEnded = false
        this.player = false
        this.board = this.createBoard()
        this.initializeBoard()
    }

    createBoard() {
        const board = new Array(9)
        for (let i = 1; i < 9; i++) {
            board[i] = new Array(9)
        }
        return board
    }

    createInitPiece(gameBoard, row, collumn) {

        if ((row + collumn) % 2 == 1) {
            if (row > 0 && row < 4)
                gameBoard[row][collumn] = new Checker(myEnum.white)
            else if (row > 5 && row < 9)
                gameBoard[row][collumn] = new Checker(myEnum.black)
            else
                gameBoard[row][collumn] = new Checker(myEnum.empty)
        }
        else gameBoard[row][collumn] = new Checker(myEnum.empty)

    }

    scanBoard(callBack, anyObject) {
        for (let i = 1; i < 9; i++)
            for (let j = 1; j < 9; j++) {
                if (callBack(i, j, anyObject)) {
                    return new Cordinates(i, j)
                }
            }
        return null
    }

    initializeBoard() {
        this.scanBoard((row, collumn) => {
            if ((row + collumn) % 2 == 1) {
                if (row > 0 && row < 4)
                    this.board[row][collumn] = new Checker(myEnum.white)
                else if (row > 5 && row < 9)
                    this.board[row][collumn] = new Checker(myEnum.black)
                else
                    this.board[row][collumn] = new Checker(myEnum.empty)
            }
            else this.board[row][collumn] = new Checker(myEnum.empty)
        })
    }

    whoIsCaptured() {
        let oppositMovementRow = (this.move.sourceRow < this.move.targetRow) ? -1 : 1
        let oppositMovementCollumn = (this.move.sourceCollumn < this.move.targetCollumn) ? -1 : 1
        return new Cordinates(this.move.targetRow + oppositMovementRow, this.move.targetCollumn + oppositMovementCollumn)
    }

    makeAMove() {
        let movedPiece = this.board[this.move.sourceRow][this.move.sourceCollumn].clonePiece()
        this.board[this.move.targetRow][this.move.targetCollumn] = movedPiece
        this.board[this.move.sourceRow][this.move.sourceCollumn] = Checker.getEmptyPiece()
    }

    findHotPiece() {
        return this.scanBoard((row, collumn) => {
            return this.board[row][collumn].isHot
        })
    }

    makePieceHot() {
        this.board[this.move.targetRow][this.move.targetCollumn].isHot = true
    }

    removeHotPiece() {
        let hotPieceCords = this.findHotPiece()
        this.board[hotPieceCords.row][hotPieceCords.collumn].isHot = false
    }

    removeCaptured() {
        let capturedPiece = this.whoIsCaptured()
        this.removePiece(capturedPiece.row, capturedPiece)
    }

    removePiece(row, collumn) {
        this.board[row][collumn] = Checker.getEmptyPiece()
    }

    isLegalMove() {
        let targetPiece = this.board[this.move.targetRow][this.move.targetCollumn]
        let sourcePiece = this.board[this.move.targetRow][this.move.targetCollumn]
        if (targetPiece.color !== empty) {
            let rowDistance = Math.abs(this.move.targetRow - this.move.sourceRow)
            let collumnDistance = Math.abs(this.move.targetCollumn - this.move.sourceCollumn)
            if (rowDistance === collumnDistance) {
                const moveToCords = this.move.turnToCords()
                const target = moveToCords[1]
                const source = moveToCords[0]
                let pieceRank
                if (sourcePiece.isQueen === true)
                    pieceRank = myEnum.queen
                else if (sourcePiece.isHot)
                    pieceRank = myEnum.hotPiece
                else
                    pieceRank = myEnum.regular
                switch (pieceRank) {
                    case myEnum.queen:
                        return this.tryMovingTheQueen(source,target)
                    case myEnum.hotPiece:
                        return this.tryMovingHotPiece(rowDistance)
                    case myEnum.regular:
                        return this.tryMovingRegular(rowDistance,source,target)
                    default:
                        return myEnum.noMove 
                }
            }
        }
        return myEnum.noMove
    }

    tryMovingRegular(rowDistance,source,target){
        if(this.player&&target.row>source.row||!this.player&&target.row<source.row)
            return canHotPieceCapture(rowDistance)
        else
            return myEnum.noMove
    }

    tryMovingTheQueen(target,source) {

        let directionCollumn = target.collumn > source.collumn ? 1 : -1
        let directionRow = target.row > source.row ? 1 : -1
        let newRow = source.row
        let newCollumn = souece.collumn
        let blockEncounterd = false
        let foundDistination
        while (!blockEncounterd || foundDistination) {
            newRow += directionRow
            newCollumn += directionCollumn
            if (this.board[newRow][newCollumn].color !== myEnum.empty)
                blockEncounterd = true
            else if (newRow === target.row)
                foundDistination = true
        }
        if (blockEncounterd) {
            if (target.isSameLocation(new Cordinates(newRow + directionRow, newCollumn + directionCollumn)))
                if (!this.isPlayersPiece(board[newRow][newCollumn]))
                    return myEnum.captrue
        }
        else return myEnum.step

        return myEnum.noMove
    }



    tryMovingHotPiece(rowDistance) {
        switch (rowDistance) {
            case 2:
                if(!this.isPlayersPiece(this.whoIsCaptured()))
                return myEnum.captrue
                else return myEnum.noTurn
            case 1:
                return myEnum.step
            default:
                return myEnum.noMove
        }
    }
    tryTakingThePath(source, target) {
        let directionCollumn = target.collumn > source.collumn ? 1 : -1
        let directionRow = target.row > source.row ? 1 : -1
        let newRow = source.row
        let newCollumn = souece.collumn
        let blockEncounterd = false
        while (!blockEncounterd) {
            newRow += directionRow
            newCollumn += directionCollumn
            if (this.board[newRow][newCollumn].color !== myEnum.empty)
                blockEncounterd = true
            else if (newRow === target.row)
                blockEncounterd = true
        }
        return new Cordinates(newRow, newCollumn)
    }

    removeAllPacifists() {

        let originalMove = this.move.cloneMove()
        this.scanBoard((row, collumn) => {
            let pieceColor = this.board[row][collumn].color
            if (this.player && pieceColor === myEnum.white || !this.player && pieceColor === myEnum.black)
                this.scanBoard((row, collumn, sourceCordinates) => {
                    this.move = new Move(sourceCordinates.row, sourceCordinates.collumn, row, collumn)
                    if (this.isLegalMove() !== myEnum.captrue) {
                        this.removePiece(sourceCordinates.row, sourceCordinates.collumn)
                        return true
                    }
                }, new Cordinates(row, collumn))
        })
        this.move = originalMove.cloneMove()
    }

    turnPieceToQueen() {
        if (this.player && this.move.targetRow === 8 && !this.player && this.move.targetRow === 1)
            board[this.move.targetRow][this.move.targetCollumn].isQueen = true
    }

    isWin() {
        this.player = !this.player // isWin actually checks if next player loose
        let originalMove = this.move.cloneMove()
        if (this.scanBoard((row, collumn) => {
            let pieceColor = this.board[row][collumn].color
            if (this.player && pieceColor === myEnum.white || !this.player && pieceColor === myEnum.black) {
                if (this.scanBoard((row, collumn, sourceCordinates) => {
                    this.move = new Move(sourceCordinates.row, sourceCordinates.collumn, row, collumn)
                    if (this.isLegalMove() !== myEnum.noMove) {
                        return true
                    }
                }, new Cordinates(row, collumn)))
                    return true
            }
        }) !== null) {
            this.move = originalMove.cloneMove()
            this.player = !this.player
            return false
        }
        this.move = originalMove.cloneMove()
        this.player = !this.player
        return true
    }

    isDraw() {
        for (let i = 1; i < 9; i++)
            for (let j = 1; j < 9; j++) {
                pieceValue = this.board[i][j]
                if (pieceValue.color !== myEnum.empty)
                    if (!pieceValue.isQueen)
                        return false
                    else if (pieceValue.color === myEnum.white)
                        if (!oneBlackQueen)
                            oneBlackQueen = true
                        else
                            return false
                    else if (pieceValue.color === myEnum.black)
                        if (!oneWhiteQueen)
                            oneWhiteQueen = true
                        else
                            return false
            }
    }

    endGameChecks() {
        if (this.isWin())
            return myEnum.win
        else if (isDraw())
            return myEnum.draw
        else
            return myEnum.regular
    }

    makeAturn() {
        const chosenPiece = this.board[this.move.sourceRow][this.move.sourceCollumn]
        let isMultiAndMultiPiece = this.multi && chosenPiece.isSameLocation(new Cordinates(move.sourceRow, move.sourceCollumn))
        if (isMultiAndMultiPiece || !this.multi && this.isPlayersPiece(chosenPiece)) {
            let nextPlayer = true
            let moveStatus
            moveStatus = this.isLegalmove()
            if (moveStatus === myEnum.captrue || !this.multi && moveStatus !== myEnum.noMove) {
                if (moveStatus === myEnum.step)
                    this.removeAllPacifists()
                this.makeMove()
                this.turnPieceIntoQueen()
                if (moveStatus === myEnum.captrue) {
                    this.removeCaptured()
                    this.makePieceHot()
                    nextPlayer = false
                }
                return nextPlayer ? myEnum.nextPlayer : myEnum.samePlayer
            }
            return myEnum.noTurn
        }
    }

    isPlayersPiece(piece) {
        return this.player && piece.color == myEnum.white || !this.player && piece.color == myEnum.black
    }

    nextPlayer() {
        this.removeAllPacifists()
        this.RemoveHotPiece()
        this.multi = false
    }

    setTurn(turn) {
        if (typeof turn === 'string' && turn.length === 4)
            this.move = new Move(turn[0], turn[1], turn[2], turn[3])
        let turnStatus = this.makeAMove()
        let endGamestatus = this.endGameChecks()
        if (endGamestatus === myEnum.regular)
            return turnStatus
        else
            return endGamestatus


    }
}

g = new CheckersGame()
console.log(g.board[1][2]);
g.removePiece(1, 2)
console.log(g.board[1][2]);
g.newGame()
console.log(g.board[1][2]);



