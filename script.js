const createChessboardButton = document.getElementById('create-chessboard');
const killChessboardButton = document.getElementById('kill-chessboard');

const windows = {};
const squareSize = 50;
const boardSize = 8;
const spacing = 100;

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

let board = [];
let selectedSquare = null;
let currentTurn = 'white'; // Track whose turn it is
let gameMode = 'normal'; // normal, fog, unused
let aiEnabled = false;

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
    // Get selected game mode
    gameMode = document.querySelector('input[name="gameMode"]:checked').value;
    aiEnabled = document.getElementById('aiEnabled').checked;
    
    console.log('Creating board with mode:', gameMode, 'AI:', aiEnabled);
    
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
            
            // Skip window creation in fog mode for non-visible squares
            if (gameMode === 'fog') {
                console.log('Skipping window for', name, 'in fog mode');
                // Will be created dynamically based on piece positions
                continue;
            }
            
            console.log('Creating window for', name, 'mode:', gameMode);

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
        const piece = board[row][col];
        if (piece !== null) {
            const pieceColor = piece.split('-')[0];
            if (pieceColor === currentTurn) {
                selectedSquare = { row, col, name: squareName };
                windows[squareName].document.body.style.border = '3px solid yellow';
                
                // Show available moves
                showAvailableMoves(row, col, piece);
            }
        }
    } else {
        const fromRow = selectedSquare.row;
        const fromCol = selectedSquare.col;
        const fromSquare = selectedSquare.name;
        const toSquare = squareName;
        
        const movingPiece = board[fromRow][fromCol];
        
        // Clear move indicators
        clearMoveIndicators();
        
        // Validate the move
        if (!isValidMove(fromRow, fromCol, row, col, movingPiece)) {
            // Invalid move - just deselect
            windows[fromSquare].document.body.style.border = '';
            selectedSquare = null;
            return;
        }
        
        // Check if move would leave king in check
        if (!isMoveSafe(fromRow, fromCol, row, col, currentTurn)) {
            // Move would leave king in check - deselect
            windows[fromSquare].document.body.style.border = '';
            selectedSquare = null;
            return;
        }
        
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
        
        // Get destination color
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
        
        // Check for pawn promotion
        const pieceType = movingPiece.split('-')[1];
        const pieceColor = movingPiece.split('-')[0];
        if (pieceType === 'pawn') {
            const promotionRow = pieceColor === 'white' ? 7 : 0;
            if (row === promotionRow) {
                // Show promotion UI in the window
                handlePromotion(toSquare, row, col, pieceColor);
                return; // Don't switch turns yet
            }
        }
        
        // Switch turns
        currentTurn = currentTurn === 'white' ? 'black' : 'white';
        
        selectedSquare = null;
        
        // Trigger AI move if enabled and it's black's turn
        if (aiEnabled && currentTurn === 'black') {
            setTimeout(makeAIMove, 500);
        }
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol, piece) {
    // Can't move to same square
    if (fromRow === toRow && fromCol === toCol) return false;
    
    // Can't capture own piece
    const targetPiece = board[toRow][toCol];
    if (targetPiece !== null) {
        const movingColor = piece.split('-')[0];
        const targetColor = targetPiece.split('-')[0];
        if (movingColor === targetColor) return false;
    }
    
    const pieceType = piece.split('-')[1];
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);
    
    switch(pieceType) {
        case 'pawn':
            const direction = piece.startsWith('white') ? 1 : -1;
            const startRow = piece.startsWith('white') ? 1 : 6;
            
            // Move forward one square
            if (colDiff === 0 && rowDiff === direction && targetPiece === null) {
                return true;
            }
            
            // Move forward two squares from start
            if (colDiff === 0 && rowDiff === 2 * direction && fromRow === startRow && targetPiece === null && board[fromRow + direction][fromCol] === null) {
                return true;
            }
            
            // Capture diagonally
            if (absColDiff === 1 && rowDiff === direction && targetPiece !== null) {
                return true;
            }
            return false;
            
        case 'rook':
            if (rowDiff === 0 || colDiff === 0) {
                return isPathClear(fromRow, fromCol, toRow, toCol);
            }
            return false;
            
        case 'knight':
            if ((absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2)) {
                return true;
            }
            return false;
            
        case 'bishop':
            if (absRowDiff === absColDiff) {
                return isPathClear(fromRow, fromCol, toRow, toCol);
            }
            return false;
            
        case 'queen':
            if (rowDiff === 0 || colDiff === 0 || absRowDiff === absColDiff) {
                return isPathClear(fromRow, fromCol, toRow, toCol);
            }
            return false;
            
        case 'king':
            if (absRowDiff <= 1 && absColDiff <= 1) {
                return true;
            }
            // Castling
            if (absRowDiff === 0 && absColDiff === 2) {
                const color = piece.split('-')[0];
                const kingSide = colDiff > 0;
                return canCastle(color, kingSide);
            }
            return false;
    }
    
    return false;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
    const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
        if (board[currentRow][currentCol] !== null) {
            return false;
        }
        currentRow += rowStep;
        currentCol += colStep;
    }
    
    return true;
}

killChessboardButton.addEventListener('click', () => {
    for (const name in windows) {
        if (windows.hasOwnProperty(name)) {
            windows[name].close();
            delete windows[name];
        }
    }
});

// Game mode and AI event listeners
document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        gameMode = e.target.value;
    });
});

document.getElementById('aiEnabled').addEventListener('change', (e) => {
    aiEnabled = e.target.checked;
    if (aiEnabled && currentTurn === 'black') {
        setTimeout(makeAIMove, 500);
    }
});

// Simple Min-Max AI
function makeAIMove() {
    if (!aiEnabled || currentTurn !== 'black') return;
    
    const allMoves = getAllPossibleMoves('black');
    if (allMoves.length === 0) return;
    
    // Simple evaluation: pick a random valid move (basic AI)
    // For a real min-max, this would evaluate board positions
    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    
    // Trigger the move
    simulateMove(randomMove.fromRow, randomMove.fromCol, randomMove.toRow, randomMove.toCol);
}

function getAllPossibleMoves(color) {
    const moves = [];
    for (let fromRow = 0; fromRow < 8; fromRow++) {
        for (let fromCol = 0; fromCol < 8; fromCol++) {
            const piece = board[fromRow][fromCol];
            if (piece && piece.startsWith(color)) {
                for (let toRow = 0; toRow < 8; toRow++) {
                    for (let toCol = 0; toCol < 8; toCol++) {
                        if (isValidMove(fromRow, fromCol, toRow, toCol, piece)) {
                            // Only include move if it doesn't leave king in check
                            if (isMoveSafe(fromRow, fromCol, toRow, toCol, color)) {
                                moves.push({ fromRow, fromCol, toRow, toCol, piece });
                            }
                        }
                    }
                }
            }
        }
    }
    return moves;
}

function simulateMove(fromRow, fromCol, toRow, toCol) {
    const fromSquare = files[fromCol] + (fromRow + 1);
    const toSquare = files[toCol] + (toRow + 1);
    
    // Simulate clicking the from square then to square
    selectedSquare = { row: fromRow, col: fromCol, name: fromSquare };
    windows[fromSquare].document.body.style.border = '3px solid yellow';
    
    setTimeout(() => {
        handleSquareClick(toSquare);
    }, 300);
}

// Show available moves with yellow and red dots
function showAvailableMoves(fromRow, fromCol, piece) {
    const opponentColor = currentTurn === 'white' ? 'black' : 'white';
    
    for (let toRow = 0; toRow < 8; toRow++) {
        for (let toCol = 0; toCol < 8; toCol++) {
            const squareName = files[toCol] + (toRow + 1);
            if (!windows[squareName]) continue;
            
            const isValid = isValidMove(fromRow, fromCol, toRow, toCol, piece);
            const wouldBeInCheck = !isMoveSafe(fromRow, fromCol, toRow, toCol, currentTurn);
            
            if (isValid && !wouldBeInCheck) {
                // Yellow dot for valid moves
                addDotToWindow(squareName, 'yellow');
            } else if (board[toRow][toCol] && board[toRow][toCol].startsWith(opponentColor)) {
                // Check if opponent can attack this square
                const opponentPiece = board[toRow][toCol];
                if (canPieceAttack(toRow, toCol, opponentPiece)) {
                    addDotToWindow(squareName, 'red');
                }
            }
        }
    }
}

function addDotToWindow(squareName, color) {
    if (!windows[squareName]) return;
    const doc = windows[squareName].document;
    const existingDot = doc.querySelector('.move-indicator');
    if (!existingDot) {
        const dot = doc.createElement('div');
        dot.className = 'move-indicator';
        dot.style.cssText = `position: absolute; width: 10px; height: 10px; background-color: ${color}; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;`;
        doc.body.appendChild(dot);
    }
}

function clearMoveIndicators() {
    for (const name in windows) {
        if (windows[name]) {
            const doc = windows[name].document;
            const dots = doc.querySelectorAll('.move-indicator');
            dots.forEach(dot => dot.remove());
        }
    }
}

function canPieceAttack(row, col, piece) {
    // Check if this piece can attack any opponent piece
    const targetColor = currentTurn; // Check if opponent can attack current player's pieces
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] && board[r][c].startsWith(targetColor)) {
                if (isValidMove(row, col, r, c, piece)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check detection
function isInCheck(color) {
    // Find king position
    let kingRow, kingCol;
    let foundKing = false;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === `${color}-king`) {
                kingRow = r;
                kingCol = c;
                foundKing = true;
                break;
            }
        }
        if (foundKing) break;
    }
    
    // If king not found, can't be in check
    if (!foundKing) return false;
    
    // Check if any opponent piece can attack the king
    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.startsWith(opponentColor)) {
                if (isValidMove(r, c, kingRow, kingCol, piece)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function isMoveSafe(fromRow, fromCol, toRow, toCol, color) {
    // Simulate the move
    const originalPiece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    
    board[toRow][toCol] = originalPiece;
    board[fromRow][fromCol] = null;
    
    const safe = !isInCheck(color);
    
    // Undo the move
    board[fromRow][fromCol] = originalPiece;
    board[toRow][toCol] = capturedPiece;
    
    return safe;
}

// Castling
function canCastle(color, kingSide) {
    const row = color === 'white' ? 0 : 7;
    const kingCol = 4;
    const rookCol = kingSide ? 7 : 0;
    const direction = kingSide ? 1 : -1;
    
    // Check if king and rook are in starting positions
    if (board[row][kingCol] !== `${color}-king`) return false;
    if (board[row][rookCol] !== `${color}-rook`) return false;
    
    // Check if path is clear
    const start = Math.min(kingCol, rookCol) + 1;
    const end = Math.max(kingCol, rookCol);
    for (let col = start; col < end; col++) {
        if (board[row][col] !== null) return false;
    }
    
    // Check if king is in check or passes through check
    if (isInCheck(color)) return false;
    for (let i = 0; i <= 2; i++) {
        const testCol = kingCol + (i * direction);
        if (!isMoveSafe(row, kingCol, row, testCol, color)) return false;
    }
    
    return true;
}

// Pawn promotion
function handlePromotion(squareName, row, col, color) {
    const promotionWindow = windows[squareName];
    if (!promotionWindow) return;
    
    const promotionPieces = ['queen', 'rook', 'bishop', 'knight'];
    
    // Widen the window to show all promotion options
    promotionWindow.resizeTo(180, 152);
    
    // Clear the window and show promotion choices
    const doc = promotionWindow.document;
    doc.body.innerHTML = '';
    doc.body.style.display = 'flex';
    doc.body.style.justifyContent = 'space-around';
    doc.body.style.alignItems = 'center';
    doc.body.style.padding = '5px';
    
    promotionPieces.forEach(pieceType => {
        const img = doc.createElement('img');
        img.src = pieceMap[`${color}-${pieceType}`];
        img.style.width = '35px';
        img.style.height = '35px';
        img.style.cursor = 'pointer';
        img.style.margin = '2px';
        img.title = pieceType;
        
        img.addEventListener('click', () => {
            // Set the promoted piece
            board[row][col] = `${color}-${pieceType}`;
            
            // Resize window back to normal
            promotionWindow.resizeTo(40, 152);
            
            // Update the window display
            doc.body.innerHTML = '';
            doc.body.style.display = 'flex';
            doc.body.style.justifyContent = 'center';
            doc.body.style.alignItems = 'center';
            doc.body.style.padding = '1%';
            
            const pieceImg = doc.createElement('img');
            pieceImg.id = 'piece';
            pieceImg.src = pieceMap[`${color}-${pieceType}`];
            pieceImg.style.width = '100%';
            pieceImg.style.height = '100%';
            pieceImg.style.objectFit = 'contain';
            doc.body.appendChild(pieceImg);
            
            // Switch turns after promotion
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
            selectedSquare = null;
            
            // Trigger AI move if enabled and it's black's turn
            if (aiEnabled && currentTurn === 'black') {
                setTimeout(makeAIMove, 500);
            }
        });
        
        doc.body.appendChild(img);
    });
}