// 페이지가 준비되면 게임 초기화
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // 게임 설정
    const GRID_COUNT = 20;              // 가로/세로 칸 수 (20x20 격자)
    const FOOD_SCORE = 10;              // 먹이 하나당 점수
    const LEVEL_UP_SCORE = 50;          // 이 점수마다 레벨 업
    const SPEED_STEP_MS = 10;           // 레벨 업마다 줄어드는 이동 간격 (ms)
    const MIN_TICK_MS = 30;             // 이동 간격 하한 (너무 빨라져 조작이 불가능해지는 것 방지)
    const BEST_KEY = 'snakegame.best';  // 최고 점수 LocalStorage 키

    // 화면 요소
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best-score');
    const levelEl = document.getElementById('level');
    const difficultyEl = document.getElementById('difficulty');
    const pauseBtn = document.getElementById('pause-btn');
    const overlay = document.getElementById('overlay');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayText = document.getElementById('overlay-text');
    const startBtn = document.getElementById('start-btn');

    // 한 칸의 크기 (400 / 20 = 20px)
    const CELL = canvas.width / GRID_COUNT;

    // 방향키 → 이동 방향
    const DIRECTIONS = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
    };

    // 게임 상태
    let gameState = 'ready'; // 'ready'(시작 전) | 'playing' | 'paused' | 'over'
    let snake = [];          // 뱀의 몸 칸 목록 (0번이 머리)
    let direction = DIRECTIONS.ArrowRight;
    let directionQueue = []; // 다음 틱들에 적용할 방향 (빠른 연속 입력 처리용)
    let food = null;
    let score = 0;
    let level = 1;
    let best = loadBest();
    let timerId = null;      // setInterval ID (null이면 멈춘 상태)

    bestEl.textContent = best;
    resetState();
    draw();

    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    document.addEventListener('keydown', handleKeydown);
    levelEl.addEventListener('animationend', () => levelEl.classList.remove('level-up'));

    // 저장된 최고 점수 불러오기 (없거나 잘못된 값이면 0)
    function loadBest() {
        const saved = Number(localStorage.getItem(BEST_KEY));
        return Number.isFinite(saved) && saved > 0 ? saved : 0;
    }

    // 현재 난이도와 레벨에 맞는 이동 간격 (레벨마다 10ms씩 빨라짐)
    function getTickMs() {
        const base = Number(difficultyEl.value);
        return Math.max(MIN_TICK_MS, base - (level - 1) * SPEED_STEP_MS);
    }

    // 현재 속도로 타이머를 (다시) 시작
    function startTimer() {
        clearInterval(timerId);
        timerId = setInterval(tick, getTickMs());
    }

    function stopTimer() {
        clearInterval(timerId);
        timerId = null;
    }

    // 뱀을 가운데 3칸 길이로 놓고, 점수·레벨·먹이를 초기화
    function resetState() {
        const mid = Math.floor(GRID_COUNT / 2);
        snake = [
            { x: mid, y: mid },
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid },
        ];
        direction = DIRECTIONS.ArrowRight;
        directionQueue = [];
        score = 0;
        level = 1;
        scoreEl.textContent = score;
        levelEl.textContent = level;
        placeFood();
    }

    // 게임 시작 (다시 시작도 동일)
    function startGame() {
        resetState();
        gameState = 'playing';
        overlay.hidden = true;
        updateControls();
        startTimer();
        draw();
    }

    // 일시정지 ↔ 재개
    function togglePause() {
        if (gameState === 'playing') {
            gameState = 'paused';
            stopTimer();
        } else if (gameState === 'paused') {
            gameState = 'playing';
            startTimer();
        } else {
            return;
        }
        updateControls();
        draw();
    }

    // 게임 상태에 맞춰 버튼 문구와 난이도 선택 잠금 갱신
    function updateControls() {
        const inGame = gameState === 'playing' || gameState === 'paused';
        pauseBtn.disabled = !inGame;
        pauseBtn.textContent = gameState === 'paused' ? '재개' : '일시정지';
        // 게임 도중에는 난이도를 바꿀 수 없음 (시작 전·게임 오버 후에만 변경)
        difficultyEl.disabled = inGame;
    }

    // 게임 오버: 멈추고 최고 점수 갱신 후 안내 표시
    function gameOver() {
        stopTimer();
        gameState = 'over';
        updateControls();

        let message = `점수: ${score}점 · 레벨 ${level}`;
        if (score > best) {
            best = score;
            localStorage.setItem(BEST_KEY, String(best));
            bestEl.textContent = best;
            message = `🎉 최고 기록! ${score}점 · 레벨 ${level}`;
        }

        overlayTitle.textContent = '게임 오버';
        overlayText.textContent = message;
        startBtn.textContent = '다시 시작';
        overlay.hidden = false;
        startBtn.focus();
    }

    // 방향키 입력 처리
    function handleKeydown(event) {
        const next = DIRECTIONS[event.key];
        if (!next) return;

        // 난이도 선택 상자에서는 방향키로 항목을 고를 수 있게 그대로 둠
        if (event.target === difficultyEl) return;

        // 방향키로 페이지가 스크롤되지 않도록 막음
        event.preventDefault();
        // 진행 중일 때만 방향 전환 (일시정지 중 입력은 무시)
        if (gameState !== 'playing') return;

        // 마지막으로 예약된 방향 기준으로 판단해야 한 틱 안의 빠른 연속 입력도 안전함
        const last = directionQueue.length
            ? directionQueue[directionQueue.length - 1]
            : direction;

        // 같은 방향이거나 정반대(자기 몸으로 되돌아가기)면 무시
        const isSame = next.x === last.x && next.y === last.y;
        const isOpposite = next.x === -last.x && next.y === -last.y;
        if (isSame || isOpposite) return;

        // 입력이 너무 쌓이지 않도록 최대 2개까지만 예약
        if (directionQueue.length < 2) {
            directionQueue.push(next);
        }
    }

    // 한 틱: 뱀을 한 칸 이동시키고 충돌/먹이 처리
    function tick() {
        if (directionQueue.length) {
            direction = directionQueue.shift();
        }

        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };
        const ate = food && newHead.x === food.x && newHead.y === food.y;

        // 벽 충돌
        const hitWall =
            newHead.x < 0 || newHead.x >= GRID_COUNT ||
            newHead.y < 0 || newHead.y >= GRID_COUNT;

        // 몸 충돌: 먹이를 먹지 않으면 꼬리가 이번 틱에 비켜나므로 꼬리 칸은 제외
        const body = ate ? snake : snake.slice(0, -1);
        const hitSelf = body.some((part) => part.x === newHead.x && part.y === newHead.y);

        if (hitWall || hitSelf) {
            gameOver();
            return;
        }

        snake.unshift(newHead);

        if (ate) {
            // 먹이를 먹으면 꼬리를 그대로 두어 한 칸 길어짐
            score += FOOD_SCORE;
            scoreEl.textContent = score;
            checkLevelUp();
            placeFood();
        } else {
            snake.pop();
        }

        draw();
    }

    // 50점마다 레벨 업: 레벨 표시 갱신 후 빨라진 속도로 타이머 재시작
    function checkLevelUp() {
        const newLevel = Math.floor(score / LEVEL_UP_SCORE) + 1;
        if (newLevel <= level) return;

        level = newLevel;
        levelEl.textContent = level;

        // 애니메이션을 처음부터 다시 재생하기 위해 클래스를 뺐다가 다시 붙임
        levelEl.classList.remove('level-up');
        void levelEl.offsetWidth;
        levelEl.classList.add('level-up');

        startTimer();
    }

    // 뱀이 없는 빈 칸 중 하나에 무작위로 먹이 놓기
    function placeFood() {
        const empty = [];
        for (let y = 0; y < GRID_COUNT; y++) {
            for (let x = 0; x < GRID_COUNT; x++) {
                const occupied = snake.some((part) => part.x === x && part.y === y);
                if (!occupied) empty.push({ x, y });
            }
        }
        // 빈 칸이 없으면(판을 다 채움) 먹이 없음
        food = empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
    }

    // 화면 전체 다시 그리기
    function draw() {
        // 배경
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 격자 무늬: 체크판처럼 한 칸 건너 살짝 밝게
        ctx.fillStyle = '#242038';
        for (let y = 0; y < GRID_COUNT; y++) {
            for (let x = 0; x < GRID_COUNT; x++) {
                if ((x + y) % 2 === 0) {
                    ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
                }
            }
        }

        // 먹이: 빨간 원
        if (food) {
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(
                food.x * CELL + CELL / 2,
                food.y * CELL + CELL / 2,
                CELL / 2 - 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // 뱀: 머리는 진한 보라, 몸통은 테마색
        snake.forEach((part, index) => {
            ctx.fillStyle = index === 0 ? '#9b7bff' : '#667eea';
            roundRect(part.x * CELL + 1, part.y * CELL + 1, CELL - 2, CELL - 2, 5);
        });

        // 일시정지 중이면 화면을 어둡게 덮고 안내 문구 표시
        if (gameState === 'paused') {
            ctx.fillStyle = 'rgba(30, 27, 46, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 28px "Malgun Gothic", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('일시정지', canvas.width / 2, canvas.height / 2);
        }
    }

    // 둥근 모서리 사각형 채우기
    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    }
}
