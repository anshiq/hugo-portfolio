// Inserting the Images
function insertImage() {

    document.querySelectorAll('.box').forEach(image => {

        if (image.innerText.length !== 0) {
            if (image.innerText == 'Wpawn' || image.innerText == 'Bpawn') {
                image.innerHTML = `${image.innerText} <img class='allimg allpawn' src="${image.innerText}.png" alt="">`
                image.style.cursor = 'pointer'

            }

            else {

                image.innerHTML = `${image.innerText} <img class='allimg' src="${image.innerText}.png" alt="">`
                image.style.cursor = 'pointer'
            }
        }
    })
}

// Track pawn first move (store as object with row info)
let pawnFirstMove = {}

function checkPawnFirstMove(piece, row) {
    if (piece === 'Wpawn' && row === 2) return true
    if (piece === 'Bpawn' && row === 7) return true
    return false
}

function getPieceColor(piece) {
    if (!piece) return null
    return piece.charAt(0)
}

function isEnemyPiece(targetPiece, currentPiece) {
    if (!targetPiece || !currentPiece) return false
    const targetColor = getPieceColor(targetPiece)
    const currentColor = getPieceColor(currentPiece)
    return targetColor !== currentColor && targetColor !== null
}

insertImage()



//Coloring

function coloring() {
    const color = document.querySelectorAll('.box')

    color.forEach(color => {

        getId = color.id
        arr = Array.from(getId)
        arr.shift()
        aside = eval(arr.pop())
        aup = eval(arr.shift())
        a = aside + aup

        if (a % 2 == 0) {
            color.style.backgroundColor = 'rgb(240, 201, 150)'
        }
        if (a % 2 !== 0) {
            color.style.backgroundColor = 'rgb(100, 75, 43)'
        }

    })
}
coloring()




//function to not remove the same team element

function reddish() {
    document.querySelectorAll('.box').forEach(i1 => {
        if (i1.style.backgroundColor == 'pink') {

            document.querySelectorAll('.box').forEach(i2 => {

                if (i2.style.backgroundColor == 'green' && i2.innerText.length !== 0) {


                    greenText = i2.innerText

                    pinkText = i1.innerText

                    pinkColor = ((Array.from(pinkText)).shift()).toString()
                    greenColor = ((Array.from(greenText)).shift()).toString()

                    getId = i2.id
                    arr = Array.from(getId)
                    arr.shift()
                    aside = eval(arr.pop())
                    aup = eval(arr.shift())
                    a = aside + aup
            
                    if (a % 2 == 0 && pinkColor == greenColor) {
                        i2.style.backgroundColor = 'rgb(240, 201, 150)'
                    }
                    if (a % 2 !== 0 && pinkColor == greenColor) {
                        i2.style.backgroundColor = 'rgb(100, 75, 43)'
                    }

                    // if (pinkColor == greenColor) {
                    //     i2.style.backgroundColor = 'rgb(253, 60, 60)'
                    // }
                }
            })
        }
    })
}










tog = 1

document.querySelectorAll('.box').forEach(item => {



    item.addEventListener('click', function () {

        // Don't allow clicking on empty squares (unless they're green - valid move targets)
        if (item.innerText.length === 0 && item.style.backgroundColor !== 'green') {
            return
        }

        // Get the piece color to check if it's this player's turn
        let pieceColor = getPieceColor(item.innerText)
        let isWhiteTurn = tog % 2 !== 0

        // Check if it's the correct player's turn
        if (pieceColor) {
            let pieceIsWhite = pieceColor === 'W'
            if ((isWhiteTurn && !pieceIsWhite) || (!isWhiteTurn && pieceIsWhite)) {
                // Not this player's turn, clear any selection and return
                document.querySelectorAll('.box').forEach(sq => {
                    sq.style.backgroundColor = ''
                })
                coloring()
                return
            }
        }

        // Clear previous green highlights when selecting a new piece
        // Only if this square doesn't already have green or pink background
        if (item.style.backgroundColor !== 'green' && item.style.backgroundColor !== 'pink') {
            document.querySelectorAll('.box').forEach(sq => {
                sq.style.backgroundColor = ''
            })
            coloring()
        }

        getId = item.id
        arr = Array.from(getId)
        arr.shift()
        aside = eval(arr.pop())
        arr.push('0')
        aup = eval(arr.join(''))
        a = aside + aup



        // Function to display the available paths for all pieces

        function whosTurn(toggle) {

            // PAWN

            if (item.innerText == `${toggle}pawn`) {
                item.style.backgroundColor = 'pink'
                let piece = item.innerText
                let currentRow = Math.floor(a / 100)
                let isFirstMove = checkPawnFirstMove(piece, currentRow)

                if (tog % 2 !== 0 && aup < 800) {
                    // White pawn moves up (decreasing row number)

                    // Forward move - only if empty
                    if (document.getElementById(`b${a + 100}`).innerText.length == 0) {
                        document.getElementById(`b${a + 100}`).style.backgroundColor = 'green'
                        // First move - can move 2 squares if path is clear
                        if (isFirstMove && document.getElementById(`b${a + 200}`).innerText.length == 0) {
                            document.getElementById(`b${a + 200}`).style.backgroundColor = 'green'
                        }
                    }

                    // Diagonal capture - only capture enemy pieces
                    if (aside < 8) {
                        let diagonalPiece = document.getElementById(`b${a + 100 + 1}`).innerText
                        if (isEnemyPiece(diagonalPiece, item.innerText)) {
                            document.getElementById(`b${a + 100 + 1}`).style.backgroundColor = 'green'
                        }
                    }

                    if (aside > 1) {
                        let diagonalPiece = document.getElementById(`b${a + 100 - 1}`).innerText
                        if (isEnemyPiece(diagonalPiece, item.innerText)) {
                            document.getElementById(`b${a + 100 - 1}`).style.backgroundColor = 'green'
                        }
                    }
                }

                if (tog % 2 == 0 && aup > 100) {
                    // Black pawn moves down (increasing row number)

                    // Forward move - only if empty
                    if (document.getElementById(`b${a - 100}`).innerText.length == 0) {
                        document.getElementById(`b${a - 100}`).style.backgroundColor = 'green'
                        // First move - can move 2 squares if path is clear
                        if (isFirstMove && document.getElementById(`b${a - 200}`).innerText.length == 0) {
                            document.getElementById(`b${a - 200}`).style.backgroundColor = 'green'
                        }
                    }

                    // Diagonal capture - only capture enemy pieces
                    if (aside < 8) {
                        let diagonalPiece = document.getElementById(`b${a - 100 + 1}`).innerText
                        if (isEnemyPiece(diagonalPiece, item.innerText)) {
                            document.getElementById(`b${a - 100 + 1}`).style.backgroundColor = 'green'
                        }
                    }
                    if (aside > 1) {
                        let diagonalPiece = document.getElementById(`b${a - 100 - 1}`).innerText
                        if (isEnemyPiece(diagonalPiece, item.innerText)) {
                            document.getElementById(`b${a - 100 - 1}`).style.backgroundColor = 'green'
                        }
                    }
                }


            }

            // KING

            if (item.innerText == `${toggle}king`) {

                let kingMoves = [
                    { dx: 0, dy: 1 },
                    { dx: 0, dy: -1 },
                    { dx: 1, dy: 0 },
                    { dx: -1, dy: 0 },
                    { dx: 1, dy: 1 },
                    { dx: 1, dy: -1 },
                    { dx: -1, dy: 1 },
                    { dx: -1, dy: -1 }
                ]

                kingMoves.forEach(move => {
                    let newCol = aside + move.dx
                    let newRow = aup + move.dy * 100

                    if (newCol >= 1 && newCol <= 8 && newRow >= 100 && newRow < 900) {
                        let targetId = `b${newRow + newCol}`
                        let targetSquare = document.getElementById(targetId)
                        let targetPiece = targetSquare.innerText

                        if (targetPiece.length === 0 || isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                        }
                    }
                })

                item.style.backgroundColor = 'pink'

            }


            // ROOK

            if (item.innerText == `${toggle}rook`) {

                for (let i = 1; i < 9; i++) {

                    if ((a + i * 100) < 900) {
                        let targetSquare = document.getElementById(`b${a + i * 100}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i * 100) > 100) {
                        let targetSquare = document.getElementById(`b${a - i * 100}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a + i) < (aup + 9)) {
                        let targetSquare = document.getElementById(`b${a + i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i) > (aup)) {
                        let targetSquare = document.getElementById(`b${a - i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }

                item.style.backgroundColor = 'pink'
            }



            // BISHOP

            if (item.innerText == `${toggle}bishop`) {


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < 9 - aside) {
                        let targetSquare = document.getElementById(`b${a + i * 100 + i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < 9 - aside) {
                        let targetSquare = document.getElementById(`b${a - i * 100 + i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < aside) {
                        let targetSquare = document.getElementById(`b${a + i * 100 - i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }

                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < aside) {
                        let targetSquare = document.getElementById(`b${a - i * 100 - i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }



                item.style.backgroundColor = 'pink'

            }



            // QUEEN

            if (item.innerText == `${toggle}queen`) {


                for (let i = 1; i < 9; i++) {

                    if ((a + i * 100) < 900) {
                        let targetSquare = document.getElementById(`b${a + i * 100}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i * 100) > 100) {
                        let targetSquare = document.getElementById(`b${a - i * 100}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a + i) < (aup + 9)) {
                        let targetSquare = document.getElementById(`b${a + i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }

                for (let i = 1; i < 9; i++) {

                    if ((a - i) > (aup)) {
                        let targetSquare = document.getElementById(`b${a - i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }



                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < 9 - aside) {
                        let targetSquare = document.getElementById(`b${a + i * 100 + i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < 9 - aside) {
                        let targetSquare = document.getElementById(`b${a - i * 100 + i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }


                for (let i = 1; i < 9; i++) {
                    if (i < (900 - aup) / 100 && i < aside) {
                        let targetSquare = document.getElementById(`b${a + i * 100 - i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }

                }


                for (let i = 1; i < 9; i++) {
                    if (i < aup / 100 && i < aside) {
                        let targetSquare = document.getElementById(`b${a - i * 100 - i}`)
                        let targetPiece = targetSquare.innerText
                        if (targetPiece.length === 0) {
                            targetSquare.style.backgroundColor = 'green'
                        } else if (isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                            break
                        } else {
                            break
                        }
                    }
                }



                item.style.backgroundColor = 'pink'

            }

            // KNIGHT

            if (item.innerText == `${toggle}knight`) {

                // L-shape moves: +2, +1 | +2, -1 | -2, +1 | -2, -1 | +1, +2 | +1, -2 | -1, +2 | -1, -2
                let knightMoves = [
                    { dx: 2, dy: 1 },
                    { dx: 2, dy: -1 },
                    { dx: -2, dy: 1 },
                    { dx: -2, dy: -1 },
                    { dx: 1, dy: 2 },
                    { dx: 1, dy: -2 },
                    { dx: -1, dy: 2 },
                    { dx: -1, dy: -2 }
                ]

                knightMoves.forEach(move => {
                    let newCol = aside + move.dx
                    let newRow = aup + move.dy * 100

                    if (newCol >= 1 && newCol <= 8 && newRow >= 100 && newRow < 900) {
                        let targetId = `b${newRow + newCol}`
                        let targetSquare = document.getElementById(targetId)
                        let targetPiece = targetSquare.innerText

                        if (targetPiece.length === 0 || isEnemyPiece(targetPiece, item.innerText)) {
                            targetSquare.style.backgroundColor = 'green'
                        }
                    }
                })

                item.style.backgroundColor = 'pink'

            }
        }


        // Toggling the turn

        if (tog % 2 !== 0) {
            document.getElementById('tog').innerText = "White's Turn"
            whosTurn('W')
        }
        if (tog % 2 == 0) {
            document.getElementById('tog').innerText = "Black's Turn"
            whosTurn('B')
        }

        reddish()



        // winning()

        numOfKings = 0


        document.querySelectorAll('.box').forEach(win => {
            if (win.innerText == 'Wking' || win.innerText == 'Bking') {
                numOfKings += 1
            }

        })

        if (numOfKings == 1) {
            setTimeout(() => {
                // console.log(`${toggle}`)
                if (tog % 2 == 0) {
                    alert('White Wins !!')
                    location.reload()
                }
                else if (tog % 2 !== 0) {
                    alert('Black Wins !!')
                    location.reload()
                }
            }, 100)
        }

        // Handle clicking on green squares (making a move)
        if (item.style.backgroundColor == 'green') {
            // Find the selected piece (pink square)
            let selectedPiece = null
            let selectedId = null
            document.querySelectorAll('.box').forEach(sq => {
                if (sq.style.backgroundColor == 'pink') {
                    selectedPiece = sq.innerText
                    selectedId = sq.id
                }
            })

            if (selectedPiece && selectedId) {
                // Move the piece
                document.getElementById(selectedId).innerText = ''
                item.innerText = selectedPiece

                // Clear colors and redraw
                coloring()
                insertImage()

                // Switch turn
                tog++

                // Clear the pink selection
                document.querySelectorAll('.box').forEach(sq => {
                    if (sq.style.backgroundColor == 'pink') {
                        sq.style.backgroundColor = ''
                    }
                })

                // Return early to prevent showing moves for the new position
                return
            }
        }


    })

})

