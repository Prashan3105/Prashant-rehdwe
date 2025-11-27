import { TUBE_CAPACITY } from "../constants";

/**
 * Calculates the best move locally using a heuristic scoring system.
 * This is much faster than calling an external AI API.
 */
export const getAIHint = async (tubes: string[][]): Promise<{ from: number; to: number } | null> => {
  // Artificial delay for UX (so it feels like calculation is happening), but fast (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  const possibleMoves = getAllValidMoves(tubes);

  if (possibleMoves.length === 0) return null;

  let bestMove = possibleMoves[0];
  let maxScore = -Infinity;

  // Evaluate all possible moves
  for (const move of possibleMoves) {
    const score = evaluateMove(tubes, move);
    if (score > maxScore) {
      maxScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

const getAllValidMoves = (tubes: string[][]): { from: number; to: number }[] => {
  const moves: { from: number; to: number }[] = [];
  
  for (let i = 0; i < tubes.length; i++) {
    if (tubes[i].length === 0) continue; // Cannot move from empty

    for (let j = 0; j < tubes.length; j++) {
      if (i === j) continue;
      if (isValidMove(tubes, i, j)) {
        moves.push({ from: i, to: j });
      }
    }
  }
  return moves;
};

const isValidMove = (tubes: string[][], fromIdx: number, toIdx: number): boolean => {
  const fromTube = tubes[fromIdx];
  const toTube = tubes[toIdx];

  if (fromTube.length === 0) return false;
  if (toTube.length >= TUBE_CAPACITY) return false;

  // Empty destination is valid
  if (toTube.length === 0) return true;

  // Must match top color
  const colorToMove = fromTube[fromTube.length - 1];
  const targetColor = toTube[toTube.length - 1];

  return colorToMove === targetColor;
};

const evaluateMove = (tubes: string[][], move: { from: number; to: number }): number => {
  const { from, to } = move;
  const fromTube = tubes[from];
  const toTube = tubes[to];
  
  const color = fromTube[fromTube.length - 1];
  
  // Count how many items of 'color' are on top of 'from'
  let countFrom = 0;
  for (let i = fromTube.length - 1; i >= 0; i--) {
    if (fromTube[i] === color) countFrom++;
    else break;
  }

  // Count consecutive items of 'color' in 'to'
  let countTo = 0;
  if (toTube.length > 0) {
      for (let i = toTube.length - 1; i >= 0; i--) {
        if (toTube[i] === color) countTo++;
        else break;
      }
  }

  // Space available in target
  const spaceTo = TUBE_CAPACITY - toTube.length;
  const moveAmount = Math.min(countFrom, spaceTo);

  // --- HEURISTICS ---
  let score = 0;

  // 1. REWARD: Completing a tube (making it full with same color)
  if (countTo + moveAmount === TUBE_CAPACITY) {
      // Check if the destination tube only has this color so far
      const isPure = toTube.every(c => c === color);
      if (isPure) score += 1000; 
  }

  // 2. REWARD: Moving onto same color (Stacking)
  if (toTube.length > 0) {
      score += 50 * moveAmount;
  }

  // 3. REWARD: Uncovering a NEW color in the source tube
  // (Only if we move ALL instances of the top color)
  if (moveAmount === countFrom && fromTube.length > countFrom) {
      score += 20;
  }

  // 4. PENALTY: Moving into an empty tube
  if (toTube.length === 0) {
      // Only good if we are moving a stack that is NOT already at the bottom of an empty/pure tube
      // i.e. Don't move a sorted stack from one empty tube to another empty tube (loop)
      const fromIsPure = fromTube.every(c => c === color);
      
      if (fromIsPure) {
          score -= 50; // Useless move
      } else {
          score -= 5; // Slight penalty, prefer stacking over emptying, unless stuck
      }
  }

  // 5. REWARD: Clearing a tube completely (if beneficial)
  if (fromTube.length === moveAmount) {
      score += 10;
  }

  return score;
};
