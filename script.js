const createChessboardButton = document.getElementById('create-chessboard');
const killChessboardButton = document.getElementById('kill-chessboard');

const windows = {};
const squareSize = 50;
const boardSize = 8;
const spacing = 100;

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

createChessboardButton.addEventListener('click', () => {
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
            const pieceWindow = window.open('', name, features);

            if (pieceWindow) {
                const color = (row + col) % 2 === 0 ? '#769656' : '#ebecd0';
                pieceWindow.document.write(`<!DOCTYPE html><html lang="en"><head><title>${name}</title><style>body { margin: 0; background-color: ${color}; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; padding: 1%; box-sizing: border-box; }</style></head><body><img id="piece" style="width: 100%; height: 100%; display: none; object-fit: contain;"></body></html>`);
                windows[name] = pieceWindow;
            }
        }
    }
    
    setTimeout(() => {
        setupPieces();
    }, 100);
});

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
    
    const pieceMap = {
        'white-pawn': 'pieces/WHITE_CHESS_PAWN.svg',
        'white-rook': 'pieces/WHITE_CHESS_ROOK.svg',
        'white-knight': 'pieces/WHITE_CHESS_KNIGHT.svg',
        'white-bishop': 'pieces/WHITE_CHESS_BISHOP.svg',
        'white-queen': 'pieces/WHITE_CHESS_QUEEN.svg',
        'white-king': 'pieces/WHITE_CHESS_KING.svg',
        'black-pawn': 'pieces/BLACK_CHESS_PAWN.svg',
        'black-rook': 'pieces/BLACK_CHESS_ROOK.svg',
        'black-knight': 'pieces/BLACK_CHESS_KNIGHT.svg',
        'black-bishop': 'pieces/BLACK_CHESS_BISHOP.svg',
        'black-queen': 'pieces/BLACK_CHESS_QUEEN.svg',
        'black-king': 'pieces/BLACK_CHESS_KING.svg'
    };
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = startPosition[row][col];
            if (piece) {
                const squareName = files[col] + (row + 1);
                if (windows[squareName]) {
                    const img = windows[squareName].document.getElementById('piece');
                    if (img) {
                        img.src = pieceMap[piece];
                        img.style.display = 'block';
                    }
                }
            }
        }
    }
}

killChessboardButton.addEventListener('click', () => {
    for (const name in windows) {
        if (windows.hasOwnProperty(name)) {
            windows[name].close();
            delete windows[name];
        }
    }
});