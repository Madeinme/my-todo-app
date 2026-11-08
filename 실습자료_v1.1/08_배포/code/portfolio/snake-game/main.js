const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');
const gameOverMessage = document.getElementById('gameOverMessage');
const difficultySelect = document.getElementById('difficulty');

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;

let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = 0;
let level = 1;
let gameLoop = null;
let isGameRunning = false;
let isPaused = false;
let baseSpeed = 150;
let currentSpeed = 150;

function init() {
    loadHighScore();
    drawGrid();
}

function loadHighScore() {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) {
        highScore = parseInt(saved);
        highScoreElement.textContent = highScore;
    }
}

function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function startGame() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    level = 1;
    isPaused = false;
    scoreElement.textContent = score;
    levelElement.textContent = level;

    baseSpeed = parseInt(difficultySelect.value);
    currentSpeed = baseSpeed;

    startBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    gameOverMessage.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    pauseBtn.textContent = '일시정지';

    difficultySelect.disabled = true;

    spawnFood();
    isGameRunning = true;

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, currentSpeed);
}

function togglePause() {
    if (!isGameRunning) return;

    isPaused = !isPaused;

    if (isPaused) {
        clearInterval(gameLoop);
        gameLoop = null;
        pauseBtn.textContent = '재개';
        drawPauseScreen();
    } else {
        pauseBtn.textContent = '일시정지';
        gameLoop = setInterval(update, currentSpeed);
    }
}

function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('일시정지', canvas.width / 2, canvas.height / 2);
}

function checkLevelUp() {
    const newLevel = Math.floor(score / 50) + 1;
    if (newLevel > level) {
        level = newLevel;
        levelElement.textContent = level;

        const speedReduction = (level - 1) * 10;
        currentSpeed = Math.max(baseSpeed - speedReduction, 30);

        clearInterval(gameLoop);
        gameLoop = setInterval(update, currentSpeed);
    }
}

function spawnFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function update() {
    direction = nextDirection;

    const head = { ...snake[0] };

    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    if (checkCollision(head)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        checkLevelUp();
        spawnFood();
    } else {
        snake.pop();
    }

    draw();
}

function checkCollision(head) {
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

function gameOver() {
    isGameRunning = false;
    isPaused = false;
    clearInterval(gameLoop);
    gameLoop = null;

    saveHighScore();

    finalScoreElement.textContent = score;
    gameOverMessage.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');

    difficultySelect.disabled = false;
}

function draw() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
            segment.x * CELL_SIZE + CELL_SIZE / 2,
            segment.y * CELL_SIZE + CELL_SIZE / 2,
            0,
            segment.x * CELL_SIZE + CELL_SIZE / 2,
            segment.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 2
        );

        if (index === 0) {
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00cc6a');
        } else {
            gradient.addColorStop(0, '#00dd77');
            gradient.addColorStop(1, '#00aa55');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );

        if (index === 0) {
            ctx.fillStyle = '#fff';
            const eyeSize = 3;
            let eyeOffsetX = 0;
            let eyeOffsetY = 0;

            switch (direction) {
                case 'up':
                    eyeOffsetY = -3;
                    break;
                case 'down':
                    eyeOffsetY = 3;
                    break;
                case 'left':
                    eyeOffsetX = -3;
                    break;
                case 'right':
                    eyeOffsetX = 3;
                    break;
            }

            ctx.beginPath();
            ctx.arc(
                segment.x * CELL_SIZE + CELL_SIZE / 3 + eyeOffsetX,
                segment.y * CELL_SIZE + CELL_SIZE / 3 + eyeOffsetY,
                eyeSize,
                0,
                Math.PI * 2
            );
            ctx.arc(
                segment.x * CELL_SIZE + (CELL_SIZE * 2) / 3 + eyeOffsetX,
                segment.y * CELL_SIZE + CELL_SIZE / 3 + eyeOffsetY,
                eyeSize,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
}

document.addEventListener('keydown', (e) => {
    if (!isGameRunning || isPaused) return;

    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

init();
