// Constants
const ROWS = 6;
const COLS = 7;
const EMPTY = 0;
const PLAYER = 1;
const AI = 2;

// Power-ups
const NONE = 0;
const BOMB = 1;
const WILDCARD = 2;
const FREEZE = 3;
const DOUBLE = 4;

// Board class
class Board {
    constructor() {
        this.grid = Array.from({length: ROWS}, () => Array(COLS).fill(EMPTY));
        this.wildcard = Array.from({length: ROWS}, () => Array(COLS).fill(false));
    }

    isValid(col) {
        return col >= 0 && col < COLS && this.grid[0][col] === EMPTY;
    }

    drop(col, player) {
        if (!this.isValid(col)) return -1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (this.grid[r][col] === EMPTY) {
                this.grid[r][col] = player;
                return r;
            }
        }
        return -1;
    }

    undoTop(col) {
        for (let r = 0; r < ROWS; r++) {
            if (this.grid[r][col] !== EMPTY) {
                this.grid[r][col] = EMPTY;
                this.wildcard[r][col] = false;
                return;
            }
        }
    }

    applyBomb(row, col) {
        for (let r = Math.max(0, row - 1); r <= Math.min(ROWS - 1, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(COLS - 1, col + 1); c++) {
                this.grid[r][c] = EMPTY;
                this.wildcard[r][c] = false;
            }
        }
        this.applyGravity();
    }

    applyGravity() {
        for (let c = 0; c < COLS; c++) {
            let pieces = [];
            let wcs = [];
            for (let r = ROWS - 1; r >= 0; r--) {
                if (this.grid[r][c] !== EMPTY) {
                    pieces.push(this.grid[r][c]);
                    wcs.push(this.wildcard[r][c]);
                }
            }
            for (let r = 0; r < ROWS; r++) {
                this.grid[r][c] = EMPTY;
                this.wildcard[r][c] = false;
            }
            for (let i = 0; i < pieces.length; i++) {
                this.grid[ROWS - 1 - i][c] = pieces[i];
                this.wildcard[ROWS - 1 - i][c] = wcs[i];
            }
        }
    }

    isFull() {
        return this.grid[0].every(cell => cell !== EMPTY);
    }

    checkWin(player) {
        const counts = (r, c) => this.grid[r][c] === player || this.wildcard[r][c];

        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (counts(r, c) && counts(r, c + 1) && counts(r, c + 2) && counts(r, c + 3)) {
                    if (this.grid[r][c] === player || this.grid[r][c + 1] === player ||
                        this.grid[r][c + 2] === player || this.grid[r][c + 3] === player) {
                        return true;
                    }
                }
            }
        }

        // Vertical
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c < COLS; c++) {
                if (counts(r, c) && counts(r + 1, c) && counts(r + 2, c) && counts(r + 3, c)) {
                    if (this.grid[r][c] === player || this.grid[r + 1][c] === player ||
                        this.grid[r + 2][c] === player || this.grid[r + 3][c] === player) {
                        return true;
                    }
                }
            }
        }

        // Diagonal ↘
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                if (counts(r, c) && counts(r + 1, c + 1) && counts(r + 2, c + 2) && counts(r + 3, c + 3)) {
                    if (this.grid[r][c] === player || this.grid[r + 1][c + 1] === player ||
                        this.grid[r + 2][c + 2] === player || this.grid[r + 3][c + 3] === player) {
                        return true;
                    }
                }
            }
        }

        // Diagonal ↙
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 3; c < COLS; c++) {
                if (counts(r, c) && counts(r + 1, c - 1) && counts(r + 2, c - 2) && counts(r + 3, c - 3)) {
                    if (this.grid[r][c] === player || this.grid[r + 1][c - 1] === player ||
                        this.grid[r + 2][c - 2] === player || this.grid[r + 3][c - 3] === player) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    scoreWindow(window, player) {
        const opp = player === AI ? PLAYER : AI;
        const pCount = window.filter(cell => cell === player).length;
        const eCount = window.filter(cell => cell === EMPTY).length;
        const oCount = window.filter(cell => cell === opp).length;

        if (pCount === 4) return 1000;
        if (pCount === 3 && eCount === 1) return 10;
        if (pCount === 2 && eCount === 2) return 3;
        if (oCount === 3 && eCount === 1) return -80;
        return 0;
    }

    heuristic(player) {
        let score = 0;
        // Center column preference
        for (let r = 0; r < ROWS; r++) {
            if (this.grid[r][3] === player) score += 4;
        }

        // Horizontal
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                const w = [this.grid[r][c], this.grid[r][c + 1], this.grid[r][c + 2], this.grid[r][c + 3]];
                score += this.scoreWindow(w, player);
            }
        }

        // Vertical
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r <= ROWS - 4; r++) {
                const w = [this.grid[r][c], this.grid[r + 1][c], this.grid[r + 2][c], this.grid[r + 3][c]];
                score += this.scoreWindow(w, player);
            }
        }

        // Diagonal ↘
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 0; c <= COLS - 4; c++) {
                const w = [this.grid[r][c], this.grid[r + 1][c + 1], this.grid[r + 2][c + 2], this.grid[r + 3][c + 3]];
                score += this.scoreWindow(w, player);
            }
        }

        // Diagonal ↙
        for (let r = 0; r <= ROWS - 4; r++) {
            for (let c = 3; c < COLS; c++) {
                const w = [this.grid[r][c], this.grid[r + 1][c - 1], this.grid[r + 2][c - 2], this.grid[r + 3][c - 3]];
                score += this.scoreWindow(w, player);
            }
        }

        return score;
    }
}

// Minimax
function minimax(board, depth, alpha, beta, maximizing) {
    if (board.checkWin(AI)) return 100000 + depth;
    if (board.checkWin(PLAYER)) return -100000 - depth;
    if (board.isFull() || depth === 0) return board.heuristic(AI) - board.heuristic(PLAYER);

    if (maximizing) {
        let best = -Infinity;
        for (let c = 0; c < COLS; c++) {
            if (!board.isValid(c)) continue;
            const nb = new Board();
            Object.assign(nb.grid, board.grid.map(row => [...row]));
            Object.assign(nb.wildcard, board.wildcard.map(row => [...row]));
            nb.drop(c, AI);
            best = Math.max(best, minimax(nb, depth - 1, alpha, beta, false));
            alpha = Math.max(alpha, best);
            if (alpha >= beta) break;
        }
        return best;
    } else {
        let best = Infinity;
        for (let c = 0; c < COLS; c++) {
            if (!board.isValid(c)) continue;
            const nb = new Board();
            Object.assign(nb.grid, board.grid.map(row => [...row]));
            Object.assign(nb.wildcard, board.wildcard.map(row => [...row]));
            nb.drop(c, PLAYER);
            best = Math.min(best, minimax(nb, depth - 1, alpha, beta, true));
            beta = Math.min(beta, best);
            if (alpha >= beta) break;
        }
        return best;
    }
}

function bestAIMove(board, difficulty) {
    let bestScore = -Infinity;
    let bestCol = 3;
    const colOrder = [3, 2, 4, 1, 5, 0, 6];
    for (const c of colOrder) {
        if (!board.isValid(c)) continue;
        const nb = new Board();
        Object.assign(nb.grid, board.grid.map(row => [...row]));
        Object.assign(nb.wildcard, board.wildcard.map(row => [...row]));
        nb.drop(c, AI);
        const score = minimax(nb, difficulty - 1, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            bestCol = c;
        }
    }
    return bestCol;
}

// Power-up names and descriptions
const powerUpNames = {
    [BOMB]: "💣 BOMB",
    [WILDCARD]: "⭐ WILDCARD",
    [FREEZE]: "❄️ FREEZE",
    [DOUBLE]: "⚡ DOUBLE"
};

const powerUpDescs = {
    [BOMB]: "Blast a 3x3 area — pieces above fall down",
    [WILDCARD]: "Counts as BOTH colors — blocks AI wins & extends yours",
    [FREEZE]: "The AI skips its next turn",
    [DOUBLE]: "Drop TWO pieces this turn"
};

// Game state
let board = new Board();
let currentPlayer = PLAYER;
let gameOver = false;
let winner = 0;
let difficulty = 5; // Medium
let powerUpsOn = true;
let powerUps = [];
let freezeAI = false;
let doubleTurn = false;
let undosLeft = 2;
let stats = { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, powerUpsUsed: 0, totalMoves: 0 };

// DOM elements
const boardEl = document.getElementById('board');
const messageEl = document.getElementById('message');
const newGameBtn = document.getElementById('new-game');
const undoBtn = document.getElementById('undo');
const powerUpsEl = document.getElementById('power-ups');
const statsEl = document.getElementById('stats');

// Initialize board
function initBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleCellClick(c));
            boardEl.appendChild(cell);
        }
    }
}

function updateBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            cell.className = 'cell';
            if (board.grid[r][c] === PLAYER) {
                cell.classList.add('player');
            } else if (board.grid[r][c] === AI) {
                cell.classList.add('ai');
            }
            if (board.wildcard[r][c]) {
                cell.classList.add('wildcard');
            }
        }
    }
}

function updateMessage(msg) {
    messageEl.textContent = msg;
}

function updatePowerUps() {
    powerUpsEl.innerHTML = '';
    powerUps.forEach((pu, idx) => {
        const btn = document.createElement('button');
        btn.className = 'power-up';
        btn.textContent = `${idx + 1}. ${powerUpNames[pu]}`;
        btn.title = powerUpDescs[pu];
        btn.addEventListener('click', () => usePowerUp(idx));
        powerUpsEl.appendChild(btn);
    });
}

function updateStats() {
    statsEl.innerHTML = `
        <h2>Stats</h2>
        <p>Wins: ${stats.wins}</p>
        <p>Losses: ${stats.losses}</p>
        <p>Draws: ${stats.draws}</p>
        <p>Win Streak: ${stats.streak}</p>
        <p>Best Streak: ${stats.bestStreak}</p>
        <p>Power-ups Used: ${stats.powerUpsUsed}</p>
        <p>Total Moves: ${stats.totalMoves}</p>
    `;
}

function handleCellClick(col) {
    if (gameOver || currentPlayer !== PLAYER) return;
    const row = board.drop(col, PLAYER);
    if (row === -1) return;
    stats.totalMoves++;
    updateBoard();
    if (board.checkWin(PLAYER)) {
        winner = PLAYER;
        gameOver = true;
        updateMessage('You win!');
        stats.wins++;
        stats.streak++;
        stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
        return;
    }
    if (board.isFull()) {
        winner = 0;
        gameOver = true;
        updateMessage('Draw!');
        stats.draws++;
        stats.streak = 0;
        return;
    }
    currentPlayer = AI;
    setTimeout(aiTurn, 500);
}

function aiTurn() {
    if (freezeAI) {
        updateMessage('AI is frozen!');
        freezeAI = false;
        currentPlayer = PLAYER;
        return;
    }
    updateMessage('AI is thinking...');
    setTimeout(() => {
        const col = bestAIMove(board, difficulty);
        board.drop(col, AI);
        updateBoard();
        updateMessage('');
        if (board.checkWin(AI)) {
            winner = AI;
            gameOver = true;
            updateMessage('AI wins!');
            stats.losses++;
            stats.streak = 0;
            return;
        }
        if (board.isFull()) {
            winner = 0;
            gameOver = true;
            updateMessage('Draw!');
            stats.draws++;
            stats.streak = 0;
            return;
        }
        currentPlayer = PLAYER;
    }, 1000);
}

function usePowerUp(idx) {
    const pu = powerUps[idx];
    powerUps.splice(idx, 1);
    stats.powerUpsUsed++;
    updatePowerUps();
    if (pu === FREEZE) {
        freezeAI = true;
        updateMessage('AI frozen next turn!');
    } else if (pu === DOUBLE) {
        doubleTurn = true;
        updateMessage('Double turn activated!');
    } else if (pu === WILDCARD) {
        // For simplicity, place in center or something, but ideally prompt
        const col = 3;
        const row = board.drop(col, PLAYER);
        if (row >= 0) {
            board.wildcard[row][col] = true;
            updateBoard();
        }
    } else if (pu === BOMB) {
        // Bomb center
        board.applyBomb(2, 3);
        updateBoard();
    }
}

function newGame() {
    board = new Board();
    currentPlayer = PLAYER;
    gameOver = false;
    winner = 0;
    freezeAI = false;
    doubleTurn = false;
    undosLeft = 2;
    updateBoard();
    updateMessage('Your turn');
    updatePowerUps();
}

newGameBtn.addEventListener('click', newGame);
undoBtn.addEventListener('click', () => {
    if (undosLeft > 0) {
        // Simple undo last move
        for (let c = 0; c < COLS; c++) {
            board.undoTop(c);
        }
        undosLeft--;
        updateBoard();
    }
});

initBoard();
updateStats();