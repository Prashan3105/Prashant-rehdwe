
import { COLORS, TUBE_CAPACITY } from '../constants';
import { LevelData } from '../types';

/**
 * Generates a solvable level by starting with a solved state and shuffling backwards.
 * Supports INFINITE levels.
 */
export const generateLevel = (level: number, difficultyMultiplier: number = 1): LevelData => {
  // Determine number of colors based on level
  // Logic: Start with 3 colors, add 1 color every 3 levels until max.
  const numColors = Math.min(Math.floor(level / 3) + 3, COLORS.length);
  
  // For massive levels (12+ colors), give 3 empty tubes to make it manageable.
  const numEmptyTubes = numColors > 12 ? 3 : 2;
  
  const numTubes = numColors + numEmptyTubes;

  // 1. Create Solved State
  const tubes: string[][] = [];
  
  // Fill color tubes
  for (let i = 0; i < numColors; i++) {
    const tube = [];
    for (let j = 0; j < TUBE_CAPACITY; j++) {
      tube.push(COLORS[i]);
    }
    tubes.push(tube);
  }
  
  // Add empty tubes
  for (let i = 0; i < numEmptyTubes; i++) {
    tubes.push([]);
  }

  // 2. Shuffle Backwards (Reverse Moves)
  // Ensure we don't create a state where a tube is full of mixed colors such that it's impossible (though reverse logic usually prevents this).
  // CAP the moves at 1000. Even if level is 1,000,000, we don't need 2 million shuffles. 1000 is enough entropy.
  const rawMoves = (20 + level * 4) * difficultyMultiplier;
  const movesToMake = Math.min(rawMoves, 1000); 
  
  for (let m = 0; m < movesToMake; m++) {
    const candidates: { from: number; to: number }[] = [];

    // Find all valid "reverse" moves:
    // Moving FROM a tube that is not empty
    // TO a tube that is not full
    
    for (let src = 0; src < numTubes; src++) {
      if (tubes[src].length === 0) continue; // Can't take from empty
      
      // Avoid accidentally creating a fully sorted tube during shuffle (if possible)
      // unless it's early in the shuffle
      
      for (let dst = 0; dst < numTubes; dst++) {
        if (src === dst) continue;
        if (tubes[dst].length >= TUBE_CAPACITY) continue; // Can't put into full

        // In reverse shuffle, we can pretty much move anywhere that has space.
        candidates.push({ from: src, to: dst });
      }
    }

    if (candidates.length > 0) {
      const move = candidates[Math.floor(Math.random() * candidates.length)];
      const color = tubes[move.from].pop();
      if (color) tubes[move.to].push(color);
    }
  }

  return {
    id: level,
    tubeCount: numTubes,
    colors: COLORS.slice(0, numColors),
    initialState: JSON.parse(JSON.stringify(tubes)), // Deep copy
  };
};

export const checkWin = (tubes: string[][]): boolean => {
  for (const tube of tubes) {
    if (tube.length === 0) continue; // Empty is fine
    if (tube.length !== TUBE_CAPACITY) return false; // Partially filled is not solved
    
    const firstColor = tube[0];
    for (const color of tube) {
      if (color !== firstColor) return false; // Mixed colors
    }
  }
  return true;
};

export const isValidMove = (tubes: string[][], fromIdx: number, toIdx: number): boolean => {
  if (fromIdx === toIdx) return false;
  const fromTube = tubes[fromIdx];
  const toTube = tubes[toIdx];

  if (fromTube.length === 0) return false;
  if (toTube.length >= TUBE_CAPACITY) return false;

  // Empty destination is always valid
  if (toTube.length === 0) return true;

  // Must match top color
  const colorToMove = fromTube[fromTube.length - 1];
  const targetColor = toTube[toTube.length - 1];

  return colorToMove === targetColor;
};

// Returns how many units of the top color can be moved
export const getMoveCount = (tubes: string[][], fromIdx: number, toIdx: number): number => {
    const fromTube = tubes[fromIdx];
    const toTube = tubes[toIdx];
    
    if (fromTube.length === 0) return 0;
    
    const color = fromTube[fromTube.length - 1];
    let count = 0;
    
    // Count consecutive colors at top of source
    for (let i = fromTube.length - 1; i >= 0; i--) {
        if (fromTube[i] === color) count++;
        else break;
    }

    // Cap by available space in destination
    const space = TUBE_CAPACITY - toTube.length;
    return Math.min(count, space);
}
