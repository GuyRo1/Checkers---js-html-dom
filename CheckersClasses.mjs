const Constants = {
    white: "white",
    black: "black",
    empty: "empty",
    neverPiece: "neverPiece",
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

class Coordinates {
    constructor(row, collumn) {
        this.row = row
        this.collumn = collumn
    }

    isSameLocation(cordinates) {
        return (this.row === cordinates.row && this.collumn === cordinates.collumn)
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
        return [new Coordinates(this.sourceRow, this.sourceCollumn), new Coordinates(this.targetRow, this.targetCollumn)]
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
        this.scanBoard((row, collumn) => {
            if ((row + collumn) % 2 == 1) {
                if (row > 0 && row < 4)
                    this.board[row][collumn] = new Checker(Constants.white)
                else if (row > 5 && row < 9)
                    this.board[row][collumn] = new Checker(Constants.black)
                else
                    this.board[row][collumn] = new Checker(Constants.empty)
            }
            else {
                this.board[row][collumn] = new Checker(Constants.neverPiece)
                this.board[row][collumn].needsUpdate = false
            }
        })
    }

    whoIsCaptured() {
        let oppositMovementRow = (this.move.sourceRow < this.move.targetRow) ? -1 : 1
        let oppositMovementCollumn = (this.move.sourceCollumn < this.move.targetCollumn) ? -1 : 1
        return new Coordinates(this.move.targetRow + oppositMovementRow, this.move.targetCollumn + oppositMovementCollumn)
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
        this.removePiece(capturedPiece.row, capturedPiece.collumn)
    }

    removePiece(row, collumn) {
        this.board[row][collumn] = Checker.getEmptyPiece()
    }

    isLegalMove() {
        let targetPiece = this.board[this.move.targetRow][this.move.targetCollumn]
        let sourcePiece = this.board[this.move.sourceRow][this.move.sourceCollumn]
        if (targetPiece.color === Constants.empty) {

            let rowDistance = Math.abs(this.move.targetRow - this.move.sourceRow)
            let collumnDistance = Math.abs(this.move.targetCollumn - this.move.sourceCollumn)
            if (rowDistance === collumnDistance) {
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

        let directionCollumn = target.collumn > source.collumn ? 1 : -1
        let directionRow = target.row > source.row ? 1 : -1
        let newRow = source.row
        let newCollumn = source.collumn
        let blockEncounterd = false
        let foundDistination = false
        while (!blockEncounterd && !foundDistination) {
            newRow += directionRow
            newCollumn += directionCollumn
            if (this.board[newRow][newCollumn].color !== Constants.empty)
                blockEncounterd = true
            else if (newRow === target.row)
                foundDistination = true
        }
        if (blockEncounterd) {
            if (target.isSameLocation(new Coordinates(newRow + directionRow, newCollumn + directionCollumn)))
                if (!this.isPlayersPiece(this.board[newRow][newCollumn]))
                    return Constants.captrue
        }
        else return Constants.step

        return Constants.noMove
    }

    tryMovingHotPiece(rowDistance) {
        switch (rowDistance) {
            case 2:
                let capturedCords = this.whoIsCaptured()
                let rivalPiece = this.player ? Constants.black : Constants.white
                if (this.board[capturedCords.row][capturedCords.collumn].color === rivalPiece)
                    return Constants.captrue
                else return Constants.noMove
            case 1:
                return Constants.step
            default:
                return Constants.noMove
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
            if (this.board[newRow][newCollumn].color !== Constants.empty)
                blockEncounterd = true
            else if (newRow === target.row)
                blockEncounterd = true
        }
        return new Coordinates(newRow, newCollumn)
    }

    removeAllPacifists() {
        let originalMove = this.move.cloneMove()
        this.scanBoard((row, collumn) => {
            let pieceColor = this.board[row][collumn].color
            if (this.player && pieceColor === Constants.white || !this.player && pieceColor === Constants.black)
                this.scanBoard((row, collumn, sourceCordinates) => {
                    this.move = new Move(sourceCordinates.row, sourceCordinates.collumn, row, collumn)
                    if (this.isLegalMove() === Constants.captrue) {
                        this.removePiece(sourceCordinates.row, sourceCordinates.collumn)
                        return true
                    }
                }, new Coordinates(row, collumn))
        })
        this.move = originalMove.cloneMove()
    }

    turnPieceToQueen() {
        if (this.player && this.move.targetRow === 8 || !this.player && this.move.targetRow === 1)
            this.board[this.move.targetRow][this.move.targetCollumn].isQueen = true
    }

    isWin() {
        this.player = !this.player // isWin actually checks if next player loose
        let originalMove = this.move.cloneMove()
        if (this.scanBoard((row, collumn) => {
            let pieceColor = this.board[row][collumn].color
            if (this.player && pieceColor === Constants.white || !this.player && pieceColor === Constants.black) {
                if (this.scanBoard((row, collumn, sourceCordinates) => {
                    this.move = new Move(sourceCordinates.row, sourceCordinates.collumn, row, collumn)
                    if (this.isLegalMove() !== Constants.noMove) {
                        return true
                    }
                }, new Coordinates(row, collumn)))
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

    makeAturn() {
        const chosenPiece = this.board[this.move.sourceRow][this.move.sourceCollumn]
        let isMultiAndMultiPiece = this.multi && chosenPiece.isSameLocation(new Coordinates(move.sourceRow, move.sourceCollumn))
        if (isMultiAndMultiPiece || !this.multi && this.isPlayersPiece(chosenPiece)) {
            let nextPlayer = true
            let moveStatus
            moveStatus = this.isLegalMove()
            if (moveStatus === Constants.captrue || !this.multi && moveStatus !== Constants.noMove) {
                if (moveStatus === Constants.step)
                    this.removeAllPacifists()
                this.makeAMove()
                this.turnPieceToQueen()
                if (moveStatus === Constants.captrue) {
                    this.removeCaptured()
                    this.makePieceHot()
                    nextPlayer = false
                }
                return nextPlayer ? Constants.nextPlayer : Constants.samePlayer
            }
            return Constants.noTurn
        }
    }

    isPlayersPiece(piece) {
        return this.player && piece.color == Constants.white || !this.player && piece.color == Constants.black
    }

    nextPlayer() {
        this.removeAllPacifists()
        this.removeHotPiece()
        this.multi = false
        this.player=!this.player
    }

    setTurn(turn) {
        if (typeof turn === 'string' && turn.length === 4) {
            this.move = new Move(+turn[0], +turn[1], +turn[2], +turn[3])
            let turnStatus = this.makeAturn()
            if (turnStatus !== Constants.noTurn) {
                let endGamestatus = this.endGameChecks()
                if (endGamestatus === Constants.regular) {
                    if (turnStatus === Constants.nextPlayer)
                        this.player = !this.player
                    return turnStatus
                }
                else
                    return endGamestatus
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
        alert("CheckerGame Class Imported currectly")
    }


}
export { CheckersGame, Constants }


