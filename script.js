const createChessboardButton = document.getElementById('create-chessboard');
const killChessboardButton = document.getElementById('kill-chessboard');

const windows = {};
const squareSize = 50;
const boardSize = 8;
const spacing = 100;

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

let board = [];
let selectedSquare = null;

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
                pieceWindow.document.write(`<!DOCTYPE html><html lang="en"><head><title>${name}</title><style>body { margin: 0; background-color: ${color}; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; padding: 1%; box-sizing: border-box; cursor: pointer; }</style></head><body><img id="piece" style="width: 100%; height: 100%; display: none; object-fit: contain;"></body></html>`);
                
                // Force consistent window size
                pieceWindow.resizeTo(40, 152);
                
                windows[name] = pieceWindow;
                
                pieceWindow.addEventListener('click', () => {
                    handleSquareClick(name);
                });
            }
        }
    }
    
    // Store actual window dimensions after creation
    setTimeout(() => {
        const firstWindow = windows['a1'];
        if (firstWindow) {
            window.actualSquareWidth = firstWindow.outerWidth;
            window.actualSquareHeight = firstWindow.outerHeight;
        }
        setupPieces();
    }, 100);
});

function setupPieces() {
    board = [
        ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook'],
        ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
        ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook']
    ];
    
    updateDisplay();
}

function updateDisplay() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            const squareName = files[col] + (row + 1);
            if (windows[squareName]) {
                const img = windows[squareName].document.getElementById('piece');
                if (img) {
                    if (piece) {
                        img.src = pieceMap[piece];
                        img.style.display = 'block';
                    } else {
                        img.style.display = 'none';
                    }
                }
            }
        }
    }
}

function handleSquareClick(squareName) {
    const col = files.indexOf(squareName[0]);
    const row = parseInt(squareName[1]) - 1;
    
    if (selectedSquare === null) {
        if (board[row][col] !== null) {
            selectedSquare = { row, col, name: squareName };
            windows[squareName].document.body.style.border = '3px solid yellow';
        }
    } else {
        const fromRow = selectedSquare.row;
        const fromCol = selectedSquare.col;
        const fromSquare = selectedSquare.name;
        const toSquare = squareName;
        
        // Get positions of both windows
        const fromWindow = windows[fromSquare];
        const toWindow = windows[toSquare];
        const fromX = fromWindow.screenX;
        const fromY = fromWindow.screenY;
        const toX = toWindow.screenX;
        const toY = toWindow.screenY;
        
        // Use stored dimensions from original board creation
        const actualWidth = window.actualSquareWidth || squareSize;
        const actualHeight = window.actualSquareHeight || squareSize;
        
        // Get the piece being moved and destination color
        const movingPiece = board[fromRow][fromCol];
        const toColor = (row + col) % 2 === 0 ? '#769656' : '#ebecd0';
        
        // Clear selection border
        fromWindow.document.body.style.border = '';
        
        // Remove piece from source square
        const fromImg = fromWindow.document.getElementById('piece');
        if (fromImg) {
            fromImg.style.display = 'none';
        }
        
        // Close destination window
        toWindow.close();
        delete windows[toSquare];
        
        // Create new window at source position with piece
        const features = `popup,width=${actualWidth},height=${actualHeight},left=${fromX},top=${fromY},menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no`;
        const movingWindow = window.open('', toSquare, features);
        
        if (movingWindow) {
            movingWindow.document.write(`<!DOCTYPE html><html lang="en"><head><title>${toSquare}</title><style>body { margin: 0; background-color: ${toColor}; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; padding: 1%; box-sizing: border-box; cursor: pointer; }</style></head><body><img id="piece" src="${pieceMap[movingPiece]}" style="width: 100%; height: 100%; object-fit: contain;"></body></html>`);
            
            // Force same size as other windows
            movingWindow.resizeTo(40, 152);
            // Animate the window movement
            let currentX = fromX;
            let currentY = fromY;
            const steps = 20;
            const deltaX = (toX - fromX) / steps;
            const deltaY = (toY - fromY) / steps;
            let step = 0;
            
            const animate = setInterval(() => {
                if (step >= steps) {
                    clearInterval(animate);
                    movingWindow.moveTo(toX, toY);
                    movingWindow.resizeTo(40, 152);
                } else {
                    currentX += deltaX;
                    currentY += deltaY;
                    movingWindow.moveTo(Math.round(currentX), Math.round(currentY));
                    movingWindow.resizeTo(40, 152); // Maintain size during movement
                    step++;
                }
            }, 20);
            
            // Update windows registry and add click handler
            windows[toSquare] = movingWindow;
            movingWindow.addEventListener('click', () => {
                handleSquareClick(toSquare);
            });
        }
        
        // Update board state
        board[row][col] = movingPiece;
        board[fromRow][fromCol] = null;
        
        selectedSquare = null;
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