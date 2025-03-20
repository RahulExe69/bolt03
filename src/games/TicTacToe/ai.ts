import { Board, Player, Difficulty } from './types';

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

export function checkWinner(board: Board): { winner: Player | null; line: number[] | null } {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line: combo };
    }
  }
  return { winner: null, line: null };
}

function getEmptyCells(board: Board): number[] {
  return board.reduce((acc, cell, index) => {
    if (!cell) acc.push(index);
    return acc;
  }, [] as number[]);
}

function minimax(board: Board, depth: number, isMax: boolean, alpha: number, beta: number): number {
  const { winner } = checkWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (getEmptyCells(board).length === 0) return 0;

  if (isMax) {
    let best = -1000;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, !isMax, alpha, beta));
        board[i] = null;
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  } else {
    let best = 1000;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, !isMax, alpha, beta));
        board[i] = null;
        beta = Math.min(beta, best);
        if (beta <= alpha) break;
      }
    }
    return best;
  }
}

export function getBestMove(board: Board, difficulty: Difficulty): number {
  const emptyCells = getEmptyCells(board);
  
  // Easy: 70% chance of random move
  if (difficulty === 'easy' && Math.random() < 0.7) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  // Normal: 30% random moves
  if (difficulty === 'normal' && Math.random() < 0.3) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  let bestVal = -1000;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const moveVal = minimax(board, 0, false, -1000, 1000);
      board[i] = null;

      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }

  return bestMove;
}