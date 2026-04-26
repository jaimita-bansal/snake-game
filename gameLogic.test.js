import { describe, expect, it } from "vitest";
import {
  LEVELS,
  findRandomEmptyCell,
  generateObstacles,
  getLevelByScore,
  isOppositeDirection,
} from "./gameLogic.js";

describe("getLevelByScore", () => {
  it("resolves expected levels at score thresholds", () => {
    expect(getLevelByScore(0, LEVELS).level).toBe(1);
    expect(getLevelByScore(5, LEVELS).level).toBe(2);
    expect(getLevelByScore(10, LEVELS).level).toBe(3);
    expect(getLevelByScore(15, LEVELS).level).toBe(4);
    expect(getLevelByScore(20, LEVELS).level).toBe(5);
    expect(getLevelByScore(999, LEVELS).level).toBe(5);
  });
});

describe("isOppositeDirection", () => {
  it("detects opposite vectors", () => {
    expect(isOppositeDirection({ x: 1, y: 0 }, { x: -1, y: 0 })).toBe(true);
    expect(isOppositeDirection({ x: 0, y: 1 }, { x: 0, y: -1 })).toBe(true);
  });

  it("allows non-opposite vectors", () => {
    expect(isOppositeDirection({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(false);
    expect(isOppositeDirection({ x: 0, y: -1 }, { x: 0, y: -1 })).toBe(false);
  });
});

describe("findRandomEmptyCell", () => {
  it("returns null when board is fully occupied", () => {
    const occupied = [];
    for (let y = 0; y < 2; y += 1) {
      for (let x = 0; x < 2; x += 1) {
        occupied.push({ x, y });
      }
    }

    expect(findRandomEmptyCell({ gridSize: 2, occupied })).toBeNull();
  });

  it("falls back to deterministic scan when random fails", () => {
    const occupied = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
    const badRandom = () => 0;
    const result = findRandomEmptyCell({ gridSize: 2, occupied, random: badRandom, maxAttempts: 3 });
    expect(result).toEqual({ x: 1, y: 1 });
  });
});

describe("generateObstacles", () => {
  it("never places obstacles on blocked cells", () => {
    const blockedCells = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    const obstacles = generateObstacles({ gridSize: 6, count: 10, blockedCells });

    for (const cell of obstacles) {
      const overlapsBlocked = blockedCells.some((blocked) => blocked.x === cell.x && blocked.y === cell.y);
      expect(overlapsBlocked).toBe(false);
    }
  });

  it("caps obstacle count when space is exhausted", () => {
    const blockedCells = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
    const obstacles = generateObstacles({ gridSize: 2, count: 20, blockedCells, random: () => 0 });
    expect(obstacles.length).toBe(1);
  });
});
