let selectedPiece = null;
let highlightedSquares = [];

// This should ideally be managed by the controller, but for now, we'll use the one from script.js
// In a real game, the controller would have its own representation of the board state.
const initialBoardSetup = [
    ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
    ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
];

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const boardSize = 8;

function getSquareName(row, col) {
    return files[col] + (boardSize - row);
}

function getCoordsFromSquareName(squareName) {
    const file = squareName.charAt(0);
    const rank = parseInt(squareName.charAt(1));
    const col = files.indexOf(file);
    const row = boardSize - rank;
    return { row, col };
}

function highlightSquares(squaresToHighlight, highlight) {
    squaresToHighlight.forEach(squareName => {
        const squareWindow = window.chessWindows[squareName];
        if (squareWindow) {
            squareWindow.postMessage({ type: 'highlight', squareName, highlight }, '*');
        }
    });
}

function updatePieceDisplay(squareName, pieceName) {
    const squareWindow = window.chessWindows[squareName];
    if (squareWindow) {
        squareWindow.postMessage({ type: 'updatePiece', squareName, pieceName }, '*');
    }
}

function performMove(fromSquareName, toSquareName) {
    const { row: fromRow, col: fromCol } = getCoordsFromSquareName(fromSquareName);
    const { row: toRow, col: toCol } = getCoordsFromSquareName(toSquareName);

    const pieceToMove = initialBoardSetup[fromRow][fromCol];

    // Update board state
    initialBoardSetup[toRow][toCol] = pieceToMove;
    initialBoardSetup[fromRow][fromCol] = '';

    // Update display of affected squares
    updatePieceDisplay(fromSquareName, ''); // Clear source square
    updatePieceDisplay(toSquareName, pieceToMove); // Place piece on target square

    // Clear selection and highlights
    highlightSquares(highlightedSquares, false);
    selectedPiece = null;
    highlightedSquares = [];
}

function calculateValidMoves(pieceName, squareName) {
    // For now, all empty squares are valid moves
    const validMoves = [];
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const currentSquareName = getSquareName(row, col);
            // Check if the square is empty
            if (initialBoardSetup[row][col] === '') {
                validMoves.push(currentSquareName);
            }
        }
    }
    return validMoves;
}

window.addEventListener('message', (event) => {
    // Ensure the message is from a trusted origin if deployed
    // if (event.origin !== "http://localhost:8080") return;

    const { squareName, pieceName } = event.data;

    if (selectedPiece === null) {
        // No piece is currently selected
        if (pieceName) {
            // A piece was clicked, select it
            selectedPiece = { squareName, pieceName };
            console.log(`Selected piece: ${pieceName} on ${squareName}`);
            highlightedSquares = calculateValidMoves(pieceName, squareName);
            highlightSquares(highlightedSquares, true);
        } else {
            // An empty square was clicked, do nothing
            console.log(`Clicked empty square: ${squareName}`);
        }
    } else {
        // A piece is already selected
        if (squareName === selectedPiece.squareName) {
            // The same piece was clicked again, deselect it
            console.log(`Deselected piece: ${selectedPiece.pieceName} on ${selectedPiece.squareName}`);
            highlightSquares(highlightedSquares, false);
            selectedPiece = null;
            highlightedSquares = [];
        } else if (pieceName) {
            // A different piece was clicked, either a new selection or an invalid move
            console.log(`Piece ${selectedPiece.pieceName} on ${selectedPiece.squareName} wants to move to ${pieceName} on ${squareName}`);
            // For now, just deselect the current piece and select the new one
            highlightSquares(highlightedSquares, false);
            selectedPiece = { squareName, pieceName };
            highlightedSquares = calculateValidMoves(pieceName, squareName);
            highlightSquares(highlightedSquares, true);
        } else {
            // An empty square was clicked, this is a potential move
            console.log(`Piece ${selectedPiece.pieceName} on ${selectedPiece.squareName} wants to move to empty square ${squareName}`);
            
            // Check if the clicked empty square is a valid move target
            if (highlightedSquares.includes(squareName)) {
                performMove(selectedPiece.squareName, squareName);
            } else {
                // Not a valid move, just deselect
                highlightSquares(highlightedSquares, false);
                selectedPiece = null;
                highlightedSquares = [];
            }
        }
    }
});