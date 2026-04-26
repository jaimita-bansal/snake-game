import {
  LEVELS,
  findRandomEmptyCell,
  generateObstacles,
  getLevelByScore,
  isOppositeDirection,
} from "./gameLogic.js";

const canvas = document.getElementById("game-canvas");
const context = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const statusText = document.getElementById("status");
const celebrationText = document.getElementById("celebration");
const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");
const restartButton = document.getElementById("restart-button");
const shadowButton = document.getElementById("shadow-button");

const gridSize = 20;
const cellSize = canvas.width / gridSize;
const shadowTrailTtlTicks = 8;
const maxShadowTrailLength = 40;
const confettiTtlTicks = 14;
const confettiBurstCount = 24;

const directionVectors = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

let snake;
let direction;
let pendingDirection;
let food;
let gameLoopId;
let isGameOver;
let isPaused;
let hasStarted;
let score;
let currentLevel;
let currentTickMs;
let obstacles;
let isShadowMode = false;
let shadowTrail = [];
let celebrationTimeoutId;
let confettiParticles = [];

function placeFood() {
  const nextFood = findRandomEmptyCell({
    gridSize,
    occupied: [...snake, ...obstacles],
  });

  if (!nextFood) {
    stopGameLoop();
    isGameOver = true;
    isPaused = false;
    statusText.textContent = `You Win! You reached Level ${currentLevel}`;
    pauseButton.disabled = true;
    return false;
  }

  food = nextFood;
  return true;
}

function placeObstacles(count) {
  obstacles = generateObstacles({
    gridSize,
    count,
    blockedCells: [...snake, ...(food ? [food] : [])],
  });
}

function applyLevel(levelConfig) {
  currentLevel = levelConfig.level;
  currentTickMs = levelConfig.tickMs;
  levelText.textContent = `Level: ${currentLevel}`;
  placeObstacles(levelConfig.obstacleCount);
}

function resetState() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  pendingDirection = { x: 1, y: 0 };
  isGameOver = false;
  isPaused = false;
  hasStarted = false;
  score = 0;
  obstacles = [];
  shadowTrail = [];
  confettiParticles = [];
  scoreText.textContent = "Score: 0";
  applyLevel(LEVELS[0]);
  statusText.textContent = "Press Play to start";
  pauseButton.disabled = true;
  clearCelebration();
  placeFood();
  updateShadowButtonText();
}

function clearCelebration() {
  if (celebrationTimeoutId) {
    clearTimeout(celebrationTimeoutId);
    celebrationTimeoutId = null;
  }
  celebrationText.textContent = "";
  celebrationText.classList.remove("show");
}

function showLevelUpCelebration(level) {
  clearCelebration();
  celebrationText.textContent = `Nice! You reached Level ${level}!`;
  celebrationText.classList.add("show");
  spawnConfettiBurst();
  celebrationTimeoutId = setTimeout(() => {
    celebrationText.classList.remove("show");
    celebrationText.textContent = "";
    celebrationTimeoutId = null;
  }, 1300);
}

function spawnConfettiBurst() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  confettiParticles = [];
  for (let i = 0; i < confettiBurstCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.2 + Math.random() * 2.4;
    confettiParticles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      ttl: confettiTtlTicks,
      size: 3 + Math.random() * 3,
      hue: 240 + Math.random() * 120,
    });
  }
}

function updateConfetti() {
  confettiParticles = confettiParticles
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vy: particle.vy + 0.08,
      ttl: particle.ttl - 1,
    }))
    .filter((particle) => particle.ttl > 0);
}

function drawConfetti() {
  confettiParticles.forEach((particle) => {
    const alpha = Math.max(0, particle.ttl / confettiTtlTicks);
    context.fillStyle = `hsla(${particle.hue}, 85%, 58%, ${alpha})`;
    context.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
}

function drawCell(cell, color) {
  context.fillStyle = color;
  context.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
}

function drawShadowCell(entry) {
  const alpha = Math.max(0, Math.min(1, entry.ttl / shadowTrailTtlTicks)) * 0.35;
  drawCell(entry, `rgba(34, 197, 94, ${alpha})`);
}

function ageShadowTrail() {
  shadowTrail = shadowTrail
    .map((entry) => ({ ...entry, ttl: entry.ttl - 1 }))
    .filter((entry) => entry.ttl > 0);
}

function addShadowEntry(cell) {
  if (!isShadowMode) {
    return;
  }

  const sameCellIndex = shadowTrail.findIndex((entry) => entry.x === cell.x && entry.y === cell.y);
  if (sameCellIndex >= 0) {
    shadowTrail.splice(sameCellIndex, 1);
  }

  shadowTrail.push({ x: cell.x, y: cell.y, ttl: shadowTrailTtlTicks });

  if (shadowTrail.length > maxShadowTrailLength) {
    shadowTrail = shadowTrail.slice(shadowTrail.length - maxShadowTrailLength);
  }
}

function updateShadowButtonText() {
  shadowButton.textContent = isShadowMode ? "Shadow: On" : "Shadow: Off";
}

function toggleShadowMode() {
  isShadowMode = !isShadowMode;
  updateShadowButtonText();

  if (!isShadowMode) {
    shadowTrail = [];
  }

  draw();
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  obstacles.forEach((block) => drawCell(block, "#52525b"));
  shadowTrail.forEach((entry) => drawShadowCell(entry));
  drawConfetti();
  drawCell(food, "#dc2626");
  snake.forEach((segment, index) => {
    drawCell(segment, index === 0 ? "#16a34a" : "#22c55e");
  });
}

function collideWithWall(head) {
  return head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize;
}

function collideWithSelf(head) {
  return snake.some((segment) => segment.x === head.x && segment.y === head.y);
}

function collideWithObstacle(head) {
  return obstacles.some((block) => block.x === head.x && block.y === head.y);
}

function stopGameLoop() {
  if (gameLoopId) {
    clearInterval(gameLoopId);
    gameLoopId = null;
  }
}

function step() {
  ageShadowTrail();
  updateConfetti();
  direction = pendingDirection;

  const head = snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  if (collideWithWall(nextHead) || collideWithSelf(nextHead) || collideWithObstacle(nextHead)) {
    stopGameLoop();
    isGameOver = true;
    isPaused = false;
    statusText.textContent = `Game Over - You reached Level ${currentLevel}`;
    pauseButton.disabled = true;
    return;
  }

  snake.unshift(nextHead);

  const ateFood = nextHead.x === food.x && nextHead.y === food.y;
  if (ateFood) {
    score += 1;
    scoreText.textContent = `Score: ${score}`;

    const resolvedLevel = getLevelByScore(score, LEVELS);
    if (resolvedLevel.level !== currentLevel) {
      applyLevel(resolvedLevel);
      showLevelUpCelebration(resolvedLevel.level);

      if (gameLoopId) {
        stopGameLoop();
        startGameLoop();
      }
    }

    placeFood();
  } else {
    const removedTail = snake.pop();
    addShadowEntry(removedTail);
  }

  draw();
}

function handleKeyDown(event) {
  const nextVector = directionVectors[event.key];
  if (!nextVector || isGameOver || isPaused || !hasStarted) {
    return;
  }

  if (!isOppositeDirection(nextVector, direction)) {
    pendingDirection = nextVector;
  }
}

function startGameLoop() {
  if (gameLoopId) {
    return;
  }

  gameLoopId = setInterval(step, currentTickMs);
}

function pauseGame() {
  if (!gameLoopId || isGameOver) {
    return;
  }

  stopGameLoop();
  isPaused = true;
  statusText.textContent = "Paused";
  pauseButton.disabled = true;
}

function playGame() {
  if (isGameOver || gameLoopId) {
    return;
  }

  hasStarted = true;
  isPaused = false;
  statusText.textContent = "Running";
  pauseButton.disabled = false;
  startGameLoop();
}

playButton.addEventListener("click", playGame);
pauseButton.addEventListener("click", pauseGame);
shadowButton.addEventListener("click", toggleShadowMode);

restartButton.addEventListener("click", () => {
  stopGameLoop();
  resetState();
  draw();
});

document.addEventListener("keydown", handleKeyDown);

resetState();
draw();
