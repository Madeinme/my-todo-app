// 포트폴리오 메인 페이지 스크립트

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 카드에 마우스 효과 추가
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
        // 카드 진입 시 효과
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });

        // 카드 이탈 시 효과
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}
