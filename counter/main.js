// 페이지가 준비되면 실행되는 함수
function initApp() {
    // 현재 숫자를 저장하는 변수 (초기값 0)
    let count = 0;

    // 화면에서 필요한 요소들을 찾아 둠
    const countEl = document.getElementById("count");
    const increaseBtn = document.getElementById("increase");
    const decreaseBtn = document.getElementById("decrease");
    const resetBtn = document.getElementById("reset");

    // 변수에 저장된 숫자를 화면에 표시하는 함수
    function render() {
        countEl.textContent = count;

        // 숫자의 부호에 따라 색상 클래스를 붙이거나 뗌
        // (조건이 참이면 클래스 추가, 거짓이면 제거)
        countEl.classList.toggle("positive", count > 0);
        countEl.classList.toggle("negative", count < 0);
    }

    // + 버튼: 1 증가
    increaseBtn.addEventListener("click", function () {
        count = count + 1;
        render();
    });

    // − 버튼: 1 감소
    decreaseBtn.addEventListener("click", function () {
        count = count - 1;
        render();
    });

    // 리셋 버튼: 0으로 초기화
    resetBtn.addEventListener("click", function () {
        count = 0;
        render();
    });

    // 처음 화면에 0 표시
    render();
}

// HTML을 모두 읽은 뒤 initApp 실행
document.addEventListener("DOMContentLoaded", initApp);
