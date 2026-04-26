export const LEVELS = [
  { level: 1, minScore: 0, obstacleCount: 0, tickMs: 120 },
  { level: 2, minScore: 5, obstacleCount: 4, tickMs: 105 },
  { level: 3, minScore: 10, obstacleCount: 8, tickMs: 92 },
  { level: 4, minScore: 15, obstacleCount: 12, tickMs: 80 },
  { level: 5, minScore: 20, obstacleCount: 16, tickMs: 70 },
];

export function getLevelByScore(currentScore, levels = LEVELS) {
  let resolvedLevel = levels[0];

  for (const levelConfig of levels) {
    if (currentScore >= levelConfig.minScore) {
      resolvedLevel = levelConfig;
    } else {
      break;
    }
  }

  return resolvedLevel;
}

export function isOppositeDirection(next, current) {
  return next.x + current.x === 0 && next.y + current.y === 0;
}

export function toCellKey(cell) {
  return `${cell.x},${cell.y}`;
}

export function getRandomCell(gridSize, random = Math.random) {
  return {
    x: Math.floor(random() * gridSize),
    y: Math.floor(random() * gridSize),
  };
}

export function findRandomEmptyCell({
  gridSize,
  occupied,
  random = Math.random,
  maxAttempts = gridSize * gridSize * 2,
}) {
  const occupiedSet = new Set(occupied.map(toCellKey));

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = getRandomCell(gridSize, random);
    if (!occupiedSet.has(toCellKey(candidate))) {
      return candidate;
    }
  }

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const candidate = { x, y };
      if (!occupiedSet.has(toCellKey(candidate))) {
        return candidate;
      }
    }
  }

  return null;
}

export function generateObstacles({ gridSize, count, blockedCells, random = Math.random }) {
  const nextObstacles = [];
  const blockedSet = new Set(blockedCells.map(toCellKey));

  while (nextObstacles.length < count) {
    const nextCell = findRandomEmptyCell({
      gridSize,
      occupied: [...nextObstacles, ...blockedCells],
      random,
    });

    if (!nextCell) {
      break;
    }

    const key = toCellKey(nextCell);
    if (blockedSet.has(key)) {
      break;
    }

    nextObstacles.push(nextCell);
    blockedSet.add(key);
  }

  return nextObstacles;
}
