// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 앱 초기화 함수
function initApp() {
    // 상태 (데이터)
    let count = 0;

    // DOM 요소 찾기
    const countDisplay = document.querySelector('#count');
    const increaseBtn = document.querySelector('#increaseBtn');
    const decreaseBtn = document.querySelector('#decreaseBtn');
    const resetBtn = document.querySelector('#resetBtn');

    // 화면 업데이트 함수 - 색상 기능 추가
    function updateDisplay() {
        countDisplay.textContent = count;

        // 숫자에 따라 색상 변경
        if (count > 0) {
            countDisplay.style.color = '#2ecc71';  // 양수: 초록
        } else if (count < 0) {
            countDisplay.style.color = '#e74c3c';  // 음수: 빨강
        } else {
            countDisplay.style.color = '#333';     // 0: 기본색
        }
    }

    // 증가 버튼 클릭
    increaseBtn.addEventListener('click', () => {
        count++;
        updateDisplay();
    });

    // 감소 버튼 클릭
    decreaseBtn.addEventListener('click', () => {
        count--;
        updateDisplay();
    });

    // 리셋 버튼 클릭
    resetBtn.addEventListener('click', () => {
        count = 0;
        updateDisplay();
    });
}
