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
                const color = (row + col) % 2 === 0 ? '#769656' : '#eeeed2';
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

function closeChessboard() {
    for (const name in windows) {
        if (windows.hasOwnProperty(name)) {
            windows[name].close();
            delete windows[name];
        }
    }
}
