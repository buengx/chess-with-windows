const createChessboardButton = document.getElementById('create-chessboard');
const killChessboardButton = document.getElementById('kill-chessboard');

const windows = {};
window.chessWindows = windows;
const squareSize = 50;
const boardSize = 8;
const spacing = 100;
const verticalPadding = 20;
const horizontalPadding = 20;

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const verticalOffset = -50; // Adjust this value to move the board up or down

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

// Preload images
const uniquePieceNames = new Set();
initialBoardSetup.forEach(row => {
    row.forEach(piece => {
        if (piece) {
            uniquePieceNames.add(piece);
        }
    });
});

uniquePieceNames.forEach(pieceName => {
    const img = new Image();
    img.src = `images/${pieceName}.svg`;
});

createChessboardButton.addEventListener('click', async () => {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    const boardWidth = boardSize * (squareSize + spacing + horizontalPadding) - (spacing + horizontalPadding);
    const boardHeight = boardSize * (squareSize + spacing + verticalPadding) - (spacing + verticalPadding);

    const startX = (screenWidth - boardWidth) / 2;
    const startY = (screenHeight - boardHeight) / 2 + verticalOffset;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = startX + col * (squareSize + spacing + horizontalPadding);
            const y = startY + row * (squareSize + spacing + verticalPadding);
            const name = files[col] + (boardSize - row);

            const features = `popup,width=${squareSize},height=${squareSize},left=${x},top=${y},menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no`;
            const pieceWindow = window.open('', name, features);

            if (pieceWindow) {
                const color = (row + col) % 2 === 0 ? '#FFFFFF' : '#00FF00';
                let pieceHTML = '';
                const pieceName = initialBoardSetup[row][col];
                if (pieceName) {
                    pieceHTML = `<img src="images/${pieceName}.svg" style="width: 100%; height: 100%;">`;
                }
                pieceWindow.document.write(`<!DOCTYPE html><html lang="en"><head><title>${name}</title><style>body { margin: 0; background-color: ${color}; display: flex; justify-content: center; align-items: center; } .highlight-circle { width: 30px; height: 30px; background-color: yellow; border-radius: 50%; position: absolute; }</style></head><body onclick="window.opener.postMessage({ squareName: '${name}' }, '*')">${pieceHTML}<script>
                    window.addEventListener('message', (event) => {
                        if (event.data.type === 'highlight' && event.data.squareName === '${name}') {
                            const circle = document.querySelector('.highlight-circle');
                            if (event.data.highlight) {
                                if (!circle) {
                                    const newCircle = document.createElement('div');
                                    newCircle.classList.add('highlight-circle');
                                    document.body.appendChild(newCircle);
                                }
                            } else {
                                if (circle) {
                                    circle.remove();
                                }
                            }
                        } else if (event.data.type === 'updatePiece' && event.data.squareName === '${name}') {
                            const newPieceName = event.data.pieceName;
                            let newPieceHTML = '';
                            if (newPieceName) {
                                newPieceHTML = `<img src="images/${newPieceName}.svg" style="width: 100%; height: 100%;">`;
                            }
                            document.body.innerHTML = newPieceHTML;
                        }
                    });
                </script></body></html>`);
                windows[name] = pieceWindow;
            }
        }
    }
});

killChessboardButton.addEventListener('click', () => {
    for (const name in windows) {
        if (windows.hasOwnProperty(name)) {
            windows[name].close();
            delete windows[name];
        }
    }
});