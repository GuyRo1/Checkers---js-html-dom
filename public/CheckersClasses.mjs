const Constants = {
    white: "white",
    black: "black",
    empty: "empty",
    neverPiece: "neverPiece",
    step: "step",
    capture: "capture",
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

class Coordinates {
    constructor(row, column) {
        this.row = row
        this.column = column
    }

    isSameLocation(coordinates) {
        return (this.row === coordinates.row && this.column === coordinates.column)
    }

    turnNoSpot() {
        this.row = 0
        this.column = 0
    }

    getEmptySpot() {
        return new Coordinates(0, 0)
    }
}

class Move {
    constructor(sourceRow, sourceColumn, targetRow, targetColumn) {
        this.sourceRow = sourceRow
        this.sourceColumn = sourceColumn
        this.targetRow = targetRow
        this.targetColumn = targetColumn
    }

    cloneMove() {
        return new Move(this.sourceRow, this.sourceColumn, this.targetRow, this.targetColumn)
    }

    turnToCords() {
        return [new Coordinates(this.sourceRow, this.sourceColumn), new Coordinates(this.targetRow, this.targetColumn)]
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
        return new Checker(Constants.empty)
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
        this.multiPiece = new Coordinates(0, 0)
        this.move = null
        this.multi = false
        this.gameEnded = false
        this.player = false
        this.board = this.createBoard()
        this.initializeBoard()
    }

    newGame() {
        this.multi = false
        this.multiPiece = new Coordinates(0, 0)
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

    scanBoard(callBack, anyObject) {
        for (let i = 1; i < 9; i++)
            for (let j = 1; j < 9; j++) {
                if (callBack(i, j, anyObject)) {
                    return new Coordinates(i, j)
                }
            }
        return null
    }

    initializeBoard() {
        this.scanBoard((row, column) => {
            if ((row + column) % 2 == 1) {
                if (row > 0 && row < 4)
                    this.board[row][column] = new Checker(Constants.white)
                else if (row > 5 && row < 9)
                    this.board[row][column] = new Checker(Constants.black)
                else
                    this.board[row][column] = new Checker(Constants.empty)
            }
            else {
                this.board[row][column] = new Checker(Constants.neverPiece)
                this.board[row][column].needsUpdate = false
            }
        })
    }

    whoIsCaptured() {
        let oppositeMovementRow = (this.move.sourceRow < this.move.targetRow) ? -1 : 1
        let oppositeMovementColumn = (this.move.sourceColumn < this.move.targetColumn) ? -1 : 1
        return new Coordinates(this.move.targetRow + oppositeMovementRow, this.move.targetColumn + oppositeMovementColumn)
    }

    makeAMove() {
        let movedPiece = this.board[this.move.sourceRow][this.move.sourceColumn].clonePiece()
        this.board[this.move.targetRow][this.move.targetColumn] = movedPiece
        this.board[this.move.sourceRow][this.move.sourceColumn] = Checker.getEmptyPiece()
    }

    findHotPiece() {
        return this.scanBoard((row, column) => {
            return this.board[row][column].isHot
        })
    }

    makePieceHot() {
        this.board[this.move.targetRow][this.move.targetColumn].isHot = true
    }

    removeHotPiece() {
        let hotPieceCords = this.findHotPiece()
        this.board[hotPieceCords.row][hotPieceCords.column].isHot = false
    }

    removeCaptured() {
        let capturedPiece = this.whoIsCaptured()
        this.removePiece(capturedPiece.row, capturedPiece.column)
    }

    removePiece(row, column) {
        this.board[row][column] = Checker.getEmptyPiece()
    }

    isLegalMove() {
        let targetPiece = this.board[this.move.targetRow][this.move.targetColumn]
        let sourcePiece = this.board[this.move.sourceRow][this.move.sourceColumn]
        if (targetPiece.color === Constants.empty) {

            let rowDistance = Math.abs(this.move.targetRow - this.move.sourceRow)
            let columnDistance = Math.abs(this.move.targetColumn - this.move.sourceColumn)
            if (rowDistance === columnDistance) {
                const moveToCords = this.move.turnToCords()
                const target = moveToCords[1]
                const source = moveToCords[0]
                let pieceRank
                if (sourcePiece.isQueen === true)
                    pieceRank = Constants.queen
                else if (sourcePiece.isHot)
                    pieceRank = Constants.hotPiece
                else
                    pieceRank = Constants.regular
                switch (pieceRank) {
                    case Constants.queen:
                        return this.tryMovingTheQueen(source, target)
                    case Constants.hotPiece:
                        return this.tryMovingHotPiece(rowDistance)
                    case Constants.regular:
                        return this.tryMovingRegular(rowDistance, source, target)
                    default:
                        return Constants.noMove
                }
            }
        }
        return Constants.noMove
    }

    tryMovingRegular(rowDistance, source, target) {
        if (this.player && target.row > source.row || !this.player && target.row < source.row)
            return this.tryMovingHotPiece(rowDistance)
        else
            return Constants.noMove
    }

    tryMovingTheQueen(source, target) {

        let directionColumn = target.column > source.column ? 1 : -1
        let directionRow = target.row > source.row ? 1 : -1
        let newRow = source.row
        let newColumn = source.column
        let blockEncountered = false
        let foundDestination = false
        while (!blockEncountered && !foundDestination) {
            newRow += directionRow
            newColumn += directionColumn
            if (this.board[newRow][newColumn].color !== Constants.empty)
                blockEncountered = true
            else if (newRow === target.row)
                foundDestination = true
        }
        if (blockEncountered) {
            if (target.isSameLocation(new Coordinates(newRow + directionRow, newColumn + directionColumn)))
                if (!this.isPlayersPiece(this.board[newRow][newColumn]))
                    return Constants.capture
        }
        else return Constants.step

        return Constants.noMove
    }

    tryMovingHotPiece(rowDistance) {
        switch (rowDistance) {
            case 2:
                let capturedCords = this.whoIsCaptured()
                let rivalPiece = this.player ? Constants.black : Constants.white
                if (this.board[capturedCords.row][capturedCords.column].color === rivalPiece)
                    return Constants.capture
                else return Constants.noMove
            case 1:
                return Constants.step
            default:
                return Constants.noMove
        }
    }

    tryTakingThePath(source, target) {
        let directionColumn = target.column > source.column ? 1 : -1
        let directionRow = target.row > source.row ? 1 : -1
        let newRow = source.row
        let newColumn = source.column
        let blockEncountered = false
        while (!blockEncountered) {
            newRow += directionRow
            newColumn += directionColumn
            if (this.board[newRow][newColumn].color !== Constants.empty)
                blockEncountered = true
            else if (newRow === target.row)
                blockEncountered = true
        }
        return new Coordinates(newRow, newColumn)
    }

    turnPieceToQueen() {
        if (this.player && this.move.targetRow === 8 || !this.player && this.move.targetRow === 1)
            this.board[this.move.targetRow][this.move.targetColumn].isQueen = true
    }

    isWin() {
        this.player = !this.player // isWin actually checks if next player loose
        let originalMove = this.move.cloneMove()
        if (this.scanBoard((row, column) => {
            let pieceColor = this.board[row][column].color
            if (this.player && pieceColor === Constants.white || !this.player && pieceColor === Constants.black) {
                if (this.scanBoard((row, column, sourceCoordinates) => {
                    this.move = new Move(sourceCoordinates.row, sourceCoordinates.column, row, column)
                    if (this.isLegalMove() !== Constants.noMove) {
                        return true
                    }
                }, new Coordinates(row, column)))
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
        let pieceValue
        for (let i = 1; i < 9; i++)
            for (let j = 1; j < 9; j++) {
                pieceValue = this.board[i][j]
                if (pieceValue.color !== Constants.empty)
                    if (!pieceValue.isQueen)
                        return false
                    else if (pieceValue.color === Constants.white)
                        if (!oneBlackQueen)
                            oneBlackQueen = true
                        else
                            return false
                    else if (pieceValue.color === Constants.black)
                        if (!oneWhiteQueen)
                            oneWhiteQueen = true
                        else
                            return false
            }
    }

    endGameChecks() {
        if (this.isWin())
            return Constants.win
        else if (this.isDraw())
            return Constants.draw
        else
            return Constants.regular
    }

    makeATurn() {
        const chosenPiece = this.board[this.move.sourceRow][this.move.sourceColumn]
        let isMultiAndMultiPiece = this.multi && this.multiPiece.isSameLocation(new Coordinates(this.move.sourceRow, this.move.sourceColumn))
        if (isMultiAndMultiPiece || !this.multi && this.isPlayersPiece(chosenPiece)) {
            let moveStatus = this.isLegalMove()
            switch (moveStatus) {
                case Constants.step:
                    if (!(this.multi || this.canPlayerCapture()))
                        break;
                    else
                        return Constants.noTurn
                case Constants.capture:
                    break;
                default:
                    return Constants.noTurn
            }
            this.makeAMove()
            this.turnPieceToQueen()
            if (moveStatus === Constants.capture) {
                this.multi = true
                this.multiPiece = new Coordinates(this.move.targetRow, this.move.targetColumn)
                this.removeCaptured()
                this.makePieceHot()
                if (this.canPieceCapture(this.multiPiece, true))
                    return Constants.samePlayer
                else {
                    this.multi = false;
                    this.multiPiece = this.multiPiece.turnNoSpot()
                    return Constants.nextPlayer
                }

            }
            else
                return Constants.nextPlayer
        }
    }

    isPlayersPiece(piece) {
        return this.player && piece.color == Constants.white || !this.player && piece.color == Constants.black
    }

    canPieceCapture(coordinates, originalSaveNeeded) {
        let originalMove
        if (originalSaveNeeded)
            originalMove = this.move.cloneMove()
        let canThisCapture = this.scanBoard((row, column, coordinates) => {
            this.move = new Move(coordinates.row, coordinates.column, row, column)
            return this.isLegalMove() === Constants.capture
        }, coordinates) !== null
        if (originalSaveNeeded)
            this.move = originalMove.cloneMove()
        return canThisCapture
    }

    canPlayerCapture() {
        let originalMove = this.move.cloneMove()
        if (this.scanBoard((row, column) => {
            let pieceColor = this.board[row][column].color
            if (this.player && pieceColor === Constants.white || !this.player && pieceColor === Constants.black) {
                return this.canPieceCapture(new Coordinates(row, column), false)
            }
        }) !== null) {
            this.move = originalMove.cloneMove()
            return true
        }
        this.move = originalMove.cloneMove()
        return false
    }

    setTurn(turn) {
        if (typeof turn === 'string' && turn.length === 4) {
            this.move = new Move(+turn[0], +turn[1], +turn[2], +turn[3])
            let turnStatus = this.makeATurn()
            if (turnStatus !== Constants.noTurn) {
                let endGameStatus = this.endGameChecks()
                if (endGameStatus === Constants.regular) {
                    if (turnStatus === Constants.nextPlayer)
                        this.player = !this.player
                    return turnStatus
                }
                else
                    return endGameStatus
            }
        }
        return Constants.noTurn
    }

    getBoard() {
        return this.board
    }

    getPlayer() {
        return this.player
    }

    checkImport() {
        alert("CheckerGame Class Imported correctly")
    }

}
export { CheckersGame, Constants }


