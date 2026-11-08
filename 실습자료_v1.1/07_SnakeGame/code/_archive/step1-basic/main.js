// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 게임 상수
const GRID_SIZE = 20;
const CELL_SIZE = 20;

// 게임 변수
let canvas, ctx;
let snake = [];
let direction = { x: 1, y: 0 };
let food = {};
let score = 0;
let highScore = 0;
let gameRunning = false;
let gameLoop = null;

// 앱 초기화
function initApp() {
    console.log('Snake Game이 시작되었습니다!');

    // Canvas 설정
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // 최고 점수 불러오기
    highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    document.getElementById('highScore').textContent = highScore;

    // 이벤트 리스너 설정
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);

    // 초기 화면 그리기
    draw();
}

// 게임 시작
function startGame() {
    // 게임 초기화
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    score = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('gameOver').classList.add('hidden');

    // 음식 생성
    generateFood();

    // 게임 시작
    gameRunning = true;
    document.getElementById('startBtn').textContent = '게임 중...';
    gameLoop = setInterval(update, 150);
}

// 게임 재시작
function restartGame() {
    document.getElementById('gameOver').classList.add('hidden');
    startGame();
}

// 키보드 입력 처리
function handleKeyPress(e) {
    if (!gameRunning) return;

    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
    }
    e.preventDefault();
}

// 게임 업데이트
function update() {
    // 뱀 이동
    moveSnake();

    // 충돌 검사
    if (checkCollision()) {
        gameOver();
        return;
    }

    // 음식 섭취 확인
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatFood();
    }

    // 화면 그리기
    draw();
}

// 뱀 이동
function moveSnake() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    snake.unshift(head);

    // 음식을 먹지 않았으면 꼬리 제거
    if (head.x !== food.x || head.y !== food.y) {
        snake.pop();
    }
}

// 충돌 검사
function checkCollision() {
    const head = snake[0];

    // 벽 충돌
    if (head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    // 자기 몸 충돌
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// 음식 생성
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
}

// 음식 섭취
function eatFood() {
    score += 10;
    document.getElementById('score').textContent = score;
    generateFood();
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);

    // 최고 점수 업데이트
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
    }

    // 게임 오버 화면 표시
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('startBtn').textContent = '게임 시작';
}

// 그리기
function draw() {
    // 캔버스 지우기
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 음식 그리기
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // 뱀 그리기
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });
}
