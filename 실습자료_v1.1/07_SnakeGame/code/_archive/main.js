// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 게임 상수
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

// 방향 상수
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// 게임 변수
let canvas, ctx;
let snake = [];
let direction = DIRECTIONS.RIGHT;
let nextDirection = DIRECTIONS.RIGHT;
let food = {};
let bonusFood = null;
let score = 0;
let highScore = 0;
let level = 1;
let gameRunning = false;
let gamePaused = false;
let gameLoop = null;
let soundEnabled = true;
let gameSpeed = 150;

// 앱 초기화
function initApp() {
    console.log('Snake Game이 시작되었습니다!');

    // Canvas 설정
    setupCanvas();

    // 최고 점수 불러오기
    loadHighScore();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 게임 초기 화면 표시
    showStartScreen();
}

// Canvas 설정
function setupCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 키보드 입력
    document.addEventListener('keydown', handleKeyPress);

    // 버튼 이벤트
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('playPauseBtn').addEventListener('click', togglePause);
    document.getElementById('soundBtn').addEventListener('click', toggleSound);

    // 난이도 변경
    document.getElementById('difficulty').addEventListener('change', (e) => {
        gameSpeed = parseInt(e.target.value);
        if (gameRunning && !gamePaused) {
            stopGame();
            startGameLoop();
        }
    });

    // 모바일 컨트롤
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const dir = btn.dataset.direction;
            handleMobileControl(dir);
        });
    });

    // 터치 스와이프 (모바일)
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });

    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning || gamePaused) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                handleMobileControl('right');
            } else {
                handleMobileControl('left');
            }
        } else {
            if (dy > 0) {
                handleMobileControl('down');
            } else {
                handleMobileControl('up');
            }
        }
    });
}

// 키보드 입력 처리
function handleKeyPress(e) {
    if (!gameRunning || gamePaused) return;

    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) {
                nextDirection = DIRECTIONS.UP;
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                nextDirection = DIRECTIONS.DOWN;
            }
            break;
        case 'ArrowLeft':
            if (direction.x === 0) {
                nextDirection = DIRECTIONS.LEFT;
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                nextDirection = DIRECTIONS.RIGHT;
            }
            break;
    }

    e.preventDefault();
}

// 모바일 컨트롤 처리
function handleMobileControl(dir) {
    if (!gameRunning || gamePaused) return;

    switch(dir) {
        case 'up':
            if (direction.y === 0) {
                nextDirection = DIRECTIONS.UP;
            }
            break;
        case 'down':
            if (direction.y === 0) {
                nextDirection = DIRECTIONS.DOWN;
            }
            break;
        case 'left':
            if (direction.x === 0) {
                nextDirection = DIRECTIONS.LEFT;
            }
            break;
        case 'right':
            if (direction.x === 0) {
                nextDirection = DIRECTIONS.RIGHT;
            }
            break;
    }
}

// 게임 시작
function startGame() {
    // 시작 화면 숨기기
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');

    // 게임 초기화
    initGame();

    // 게임 루프 시작
    gameRunning = true;
    gamePaused = false;
    startGameLoop();
}

// 게임 재시작
function restartGame() {
    document.getElementById('gameOver').classList.add('hidden');
    startGame();
}

// 게임 초기화
function initGame() {
    // 뱀 초기화 (중앙에서 시작)
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];

    // 방향 초기화
    direction = DIRECTIONS.RIGHT;
    nextDirection = DIRECTIONS.RIGHT;

    // 점수 초기화
    score = 0;
    level = 1;
    updateScore();

    // 난이도 초기화
    gameSpeed = parseInt(document.getElementById('difficulty').value);

    // 음식 생성
    generateFood();
    bonusFood = null;
}

// 게임 루프 시작
function startGameLoop() {
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameUpdate, gameSpeed);
}

// 게임 업데이트
function gameUpdate() {
    if (gamePaused) return;

    // 방향 업데이트
    direction = nextDirection;

    // 뱀 이동
    moveSnake();

    // 충돌 검사
    if (checkCollision()) {
        gameOver();
        return;
    }

    // 음식 섭취 확인
    checkFoodCollision();

    // 보너스 음식 생성 (10% 확률)
    if (!bonusFood && Math.random() < 0.1) {
        generateBonusFood();
    }

    // 보너스 음식 시간 제한
    if (bonusFood) {
        bonusFood.ttl--;
        if (bonusFood.ttl <= 0) {
            bonusFood = null;
        }
    }

    // 화면 그리기
    draw();
}

// 뱀 이동
function moveSnake() {
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    snake.unshift(head);

    // 음식을 먹지 않았으면 꼬리 제거
    if (head.x !== food.x || head.y !== food.y) {
        // 보너스 음식 체크
        if (bonusFood && head.x === bonusFood.x && head.y === bonusFood.y) {
            eatBonusFood();
        } else {
            snake.pop();
        }
    } else {
        eatFood();
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

// 음식 섭취
function eatFood() {
    score += 10;
    updateScore();

    // 레벨 업 (50점마다)
    if (score % 50 === 0) {
        levelUp();
    }

    // 새 음식 생성
    generateFood();

    // 사운드 재생
    if (soundEnabled) {
        playSound(440, 0.1);
    }
}

// 보너스 음식 섭취
function eatBonusFood() {
    score += 20;
    updateScore();
    bonusFood = null;

    if (soundEnabled) {
        playSound(880, 0.15);
    }
}

// 레벨 업
function levelUp() {
    level++;
    document.getElementById('level').textContent = level;

    // 속도 증가
    if (gameSpeed > 50) {
        gameSpeed -= 10;
        stopGame();
        startGameLoop();
    }

    if (soundEnabled) {
        playSound(660, 0.2);
    }
}

// 음식 생성
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (isOnSnake(food.x, food.y));
}

// 보너스 음식 생성
function generateBonusFood() {
    do {
        bonusFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
            ttl: 50  // Time to live (50 프레임)
        };
    } while (isOnSnake(bonusFood.x, bonusFood.y) ||
             (bonusFood.x === food.x && bonusFood.y === food.y));
}

// 뱀 위치 체크
function isOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// 그리기
function draw() {
    // 캔버스 지우기
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 격자 그리기 (선택사항)
    drawGrid();

    // 음식 그리기
    drawFood();

    // 보너스 음식 그리기
    if (bonusFood) {
        drawBonusFood();
    }

    // 뱀 그리기
    drawSnake();
}

// 격자 그리기
function drawGrid() {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= GRID_SIZE; i++) {
        // 세로선
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();

        // 가로선
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }
}

// 뱀 그리기
function drawSnake() {
    snake.forEach((segment, index) => {
        // 머리는 밝게
        if (index === 0) {
            ctx.fillStyle = '#10b981';
        } else {
            ctx.fillStyle = '#059669';
        }

        // 세그먼트 그리기
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );

        // 머리에 눈 그리기
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = 3;
            // 왼쪽 눈
            ctx.fillRect(
                segment.x * CELL_SIZE + 5,
                segment.y * CELL_SIZE + 5,
                eyeSize,
                eyeSize
            );
            // 오른쪽 눈
            ctx.fillRect(
                segment.x * CELL_SIZE + CELL_SIZE - 8,
                segment.y * CELL_SIZE + 5,
                eyeSize,
                eyeSize
            );
        }
    });
}

// 음식 그리기
function drawFood() {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 보너스 음식 그리기
function drawBonusFood() {
    // 깜빡임 효과
    if (bonusFood.ttl % 10 < 5) {
        ctx.fillStyle = '#fbbf24';
    } else {
        ctx.fillStyle = '#f59e0b';
    }

    ctx.beginPath();
    ctx.arc(
        bonusFood.x * CELL_SIZE + CELL_SIZE / 2,
        bonusFood.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 게임 오버
function gameOver() {
    gameRunning = false;
    stopGame();

    // 최고 점수 업데이트
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }

    // 게임 오버 화면 표시
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').classList.remove('hidden');

    // 게임 오버 사운드
    if (soundEnabled) {
        playSound(200, 0.3);
    }
}

// 게임 일시정지
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    const btn = document.getElementById('playPauseBtn');

    if (gamePaused) {
        btn.textContent = '▶️ 계속하기';
    } else {
        btn.textContent = '⏸️ 일시정지';
    }
}

// 소리 토글
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundBtn');
    btn.textContent = soundEnabled ? '🔊 소리 켜기/끄기' : '🔇 소리 켜기/끄기';
}

// 게임 중지
function stopGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
}

// 점수 업데이트
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
}

// 최고 점수 저장
function saveHighScore() {
    localStorage.setItem('snakeHighScore', highScore);
    document.getElementById('highScore').textContent = highScore;
}

// 최고 점수 불러오기
function loadHighScore() {
    highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    document.getElementById('highScore').textContent = highScore;
}

// 시작 화면 표시
function showStartScreen() {
    document.getElementById('startScreen').classList.remove('hidden');
}

// 간단한 사운드 재생
function playSound(frequency, duration) {
    if (!soundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + duration
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        // 오디오 컨텍스트가 지원되지 않는 경우 무시
    }
}