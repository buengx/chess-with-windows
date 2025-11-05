window.addEventListener('DOMContentLoaded', () => {
    if (window.squareColor) {
        document.body.style.backgroundColor = window.squareColor;
    }
    
    if (window.squareName) {
        document.title = window.squareName;
    }
});

window.addEventListener('message', (event) => {
    if (event.data.type === 'setPiece') {
        const piece = event.data.piece;
        const pieceImg = document.getElementById('piece');
        
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
        
        if (pieceMap[piece]) {
            pieceImg.src = pieceMap[piece];
            pieceImg.style.display = 'block';
        }
    }
});
