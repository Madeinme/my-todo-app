// ⚠️ 에러! DOMContentLoaded 없이 바로 실행
// 이 코드는 <head>에서 실행되므로 HTML 요소가 아직 로드되지 않음

let count = 0;

// DOM 요소 찾기 - 이 시점에 HTML이 아직 로드되지 않아서 null 반환
const countDisplay = document.querySelector('#count');
const increaseBtn = document.querySelector('#increaseBtn');
const decreaseBtn = document.querySelector('#decreaseBtn');
const resetBtn = document.querySelector('#resetBtn');

// 화면 업데이트 함수
function updateDisplay() {
    countDisplay.textContent = count;
}

// 여기서 에러 발생!
// Cannot read property 'addEventListener' of null
// (increaseBtn이 null이기 때문)
increaseBtn.addEventListener('click', () => {
    count++;
    updateDisplay();
});

decreaseBtn.addEventListener('click', () => {
    count--;
    updateDisplay();
});

resetBtn.addEventListener('click', () => {
    count = 0;
    updateDisplay();
});
