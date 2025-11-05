const windows = {};
const squareSize = 50;
const boardSize = 8;
const spacing = 100;

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function createChessboard() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const boardWidth = boardSize * (squareSize + spacing) - spacing;
    const boardHeight = boardSize * (squareSize + 100) - 100;

    const startX = (screenWidth - boardWidth) / 2;
    const startY = (screenHeight - boardHeight) / 2 - 75;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = startX + col * (squareSize + spacing);
            const y = startY + row * (squareSize + 100);
            const name = files[col] + (row + 1);

            const features = `popup,width=${squareSize},height=${squareSize},left=${x},top=${y},menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no`;
            const pieceWindow = window.open('square.html', name, features);

            if (pieceWindow) {
                const color = (row + col) % 2 === 0 ? '#769656' : '#ebecd0';
                pieceWindow.squareColor = color;
                pieceWindow.squareName = name;
                windows[name] = pieceWindow;
            }
        }
    }
    
    setTimeout(() => {
        setupPieces();
    }, 500);
}

function setupPieces() {
    const startPosition = [
        ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook'],
        ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
        ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook']
    ];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = startPosition[row][col];
            if (piece) {
                const squareName = files[col] + (row + 1);
                if (windows[squareName]) {
                    windows[squareName].postMessage({ type: 'setPiece', piece: piece }, '*');
                }
            }
        }
    }
}

function closeChessboard() {
    for (const name in windows) {
        if (windows.hasOwnProperty(name)) {
            windows[name].close();
            delete windows[name];
        }
    }
}
