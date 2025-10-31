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
    const boardHeight = boardSize * (squareSize + spacing + 77) - spacing;

    const startX = (screenWidth - boardWidth) / 2;
    const startY = (screenHeight - boardHeight) / 2;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const x = startX + col * (squareSize + spacing);
            const y = startY + row * (squareSize + spacing + 77);
            const name = files[col] + (boardSize - row);

            const features = `popup,width=${squareSize},height=${squareSize},left=${x},top=${y},menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no`;
            const pieceWindow = window.open('', name, features);

            if (pieceWindow) {
                const color = (row + col) % 2 === 0 ? '#FFFFFF' : '#000000';
                pieceWindow.document.write(`<!DOCTYPE html><html lang="en"><head><title>${name}</title><style>body { margin: 0; background-color: ${color}; }</style></head><body></body></html>`);
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