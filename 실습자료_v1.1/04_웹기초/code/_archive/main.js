// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 앱 초기화 함수
function initApp() {
    console.log('웹 기초 실습 앱이 시작되었습니다!');

    // 각 섹션의 기능 초기화
    initCounter();
    initGreeting();
    initColorChanger();
    initListManager();
    initMouseEvents();
}

// 1. 카운터 기능
function initCounter() {
    let count = 0;
    const countDisplay = document.querySelector('#count');
    const increaseBtn = document.querySelector('#increaseBtn');
    const decreaseBtn = document.querySelector('#decreaseBtn');
    const resetBtn = document.querySelector('#resetBtn');

    // 카운터 화면 업데이트
    function updateDisplay() {
        countDisplay.textContent = count;

        // 숫자에 따라 색상 변경
        if (count > 0) {
            countDisplay.style.color = '#2ecc71';
        } else if (count < 0) {
            countDisplay.style.color = '#e74c3c';
        } else {
            countDisplay.style.color = '#3498db';
        }
    }

    // 증가 버튼
    increaseBtn.addEventListener('click', () => {
        count++;
        updateDisplay();
    });

    // 감소 버튼
    decreaseBtn.addEventListener('click', () => {
        count--;
        updateDisplay();
    });

    // 리셋 버튼
    resetBtn.addEventListener('click', () => {
        count = 0;
        updateDisplay();
    });
}

// 2. 인사말 생성기
function initGreeting() {
    const nameInput = document.querySelector('#nameInput');
    const greetBtn = document.querySelector('#greetBtn');
    const greeting = document.querySelector('#greeting');

    greetBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();

        if (name === '') {
            greeting.textContent = '이름을 입력해주세요!';
            greeting.style.color = '#e74c3c';
        } else {
            const hour = new Date().getHours();
            let timeGreeting;

            if (hour < 12) {
                timeGreeting = '좋은 아침이에요';
            } else if (hour < 18) {
                timeGreeting = '좋은 오후에요';
            } else {
                timeGreeting = '좋은 저녁이에요';
            }

            greeting.textContent = `${timeGreeting}, ${name}님! 반갑습니다! 😊`;
            greeting.style.color = '#27ae60';
        }
    });

    // Enter 키로도 인사말 생성
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            greetBtn.click();
        }
    });
}

// 3. 색상 변경기
function initColorChanger() {
    const colorButtons = document.querySelectorAll('.color-btn');
    const randomColorBtn = document.querySelector('#randomColorBtn');
    const colorBox = document.querySelector('#colorBox');

    // 색상 버튼들
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.dataset.color;
            colorBox.style.backgroundColor = color;
            colorBox.querySelector('p').textContent = `색상: ${color}`;
        });
    });

    // 랜덤 색상 버튼
    randomColorBtn.addEventListener('click', () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const randomColor = `rgb(${r}, ${g}, ${b})`;

        colorBox.style.backgroundColor = randomColor;
        colorBox.querySelector('p').textContent = `RGB(${r}, ${g}, ${b})`;
    });
}

// 4. 리스트 관리
function initListManager() {
    const itemInput = document.querySelector('#itemInput');
    const addItemBtn = document.querySelector('#addItemBtn');
    const itemList = document.querySelector('#itemList');
    const clearListBtn = document.querySelector('#clearListBtn');

    // 항목 추가 함수
    function addItem() {
        const text = itemInput.value.trim();

        if (text === '') {
            alert('항목을 입력해주세요!');
            return;
        }

        // 리스트 아이템 생성
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${text}</span>
            <button class="delete-item">삭제</button>
        `;

        // 삭제 버튼 이벤트
        li.querySelector('.delete-item').addEventListener('click', () => {
            li.remove();
            checkEmptyList();
        });

        itemList.appendChild(li);
        itemInput.value = '';
        itemInput.focus();
        checkEmptyList();
    }

    // 빈 리스트 체크
    function checkEmptyList() {
        if (itemList.children.length === 0) {
            clearListBtn.style.display = 'none';
        } else {
            clearListBtn.style.display = 'block';
        }
    }

    // 항목 추가 버튼
    addItemBtn.addEventListener('click', addItem);

    // Enter 키로 항목 추가
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addItem();
        }
    });

    // 전체 삭제 버튼
    clearListBtn.addEventListener('click', () => {
        if (confirm('모든 항목을 삭제하시겠습니까?')) {
            itemList.innerHTML = '';
            checkEmptyList();
        }
    });

    // 초기 상태
    checkEmptyList();
}

// 5. 마우스 이벤트
function initMouseEvents() {
    const mouseBox = document.querySelector('#mouseBox');
    const mouseStatus = document.querySelector('#mouseStatus');
    let clickCount = 0;

    // 마우스 오버
    mouseBox.addEventListener('mouseenter', () => {
        mouseStatus.textContent = '마우스가 들어왔어요! 👋';
    });

    // 마우스 나감
    mouseBox.addEventListener('mouseleave', () => {
        mouseStatus.textContent = '마우스가 나갔어요! 👋';
    });

    // 클릭
    mouseBox.addEventListener('click', () => {
        clickCount++;
        mouseStatus.textContent = `클릭 ${clickCount}번! 🎯`;
    });

    // 더블클릭
    mouseBox.addEventListener('dblclick', () => {
        clickCount = 0;
        mouseStatus.textContent = '더블클릭! 카운트 리셋! 🔄';
    });

    // 우클릭 방지 및 커스텀 메시지
    mouseBox.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        mouseStatus.textContent = '우클릭은 안돼요! 🚫';
        return false;
    });
}