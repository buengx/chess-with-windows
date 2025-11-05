const createChessboardButton = document.getElementById('create-chessboard');
const killChessboardButton = document.getElementById('kill-chessboard');

createChessboardButton.addEventListener('click', () => {
    createChessboard();
});

killChessboardButton.addEventListener('click', () => {
    closeChessboard();
});
