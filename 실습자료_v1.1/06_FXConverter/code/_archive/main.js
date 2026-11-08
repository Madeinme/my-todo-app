// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// API 설정
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/';

// 전역 변수
let exchangeRates = {};
let conversionHistory = [];

// 앱 초기화
function initApp() {
    console.log('환율 변환기가 시작되었습니다!');

    // LocalStorage에서 기록 불러오기
    loadHistory();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 초기 환율 데이터 로드
    fetchInitialRates();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 변환 버튼
    document.querySelector('#convertBtn').addEventListener('click', convertCurrency);

    // 스왑 버튼
    document.querySelector('#swapBtn').addEventListener('click', swapCurrencies);

    // 금액 입력 Enter 키
    document.querySelector('#amount').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convertCurrency();
        }
    });

    // 금액 입력 시 실시간 변환 (디바운스 적용)
    document.querySelector('#amount').addEventListener('input', debounce(() => {
        const amount = document.querySelector('#amount').value;
        if (amount && amount > 0) {
            convertCurrency();
        }
    }, 500));

    // 통화 선택 변경 시 자동 변환
    document.querySelector('#fromCurrency').addEventListener('change', convertCurrency);
    document.querySelector('#toCurrency').addEventListener('change', convertCurrency);

    // 즐겨찾기 버튼들
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fromCurrency = btn.dataset.from;
            const toCurrency = btn.dataset.to;
            document.querySelector('#fromCurrency').value = fromCurrency;
            document.querySelector('#toCurrency').value = toCurrency;
            convertCurrency();
        });
    });

    // 기록 삭제 버튼
    document.querySelector('#clearHistoryBtn').addEventListener('click', clearHistory);
}

// 초기 환율 데이터 로드
async function fetchInitialRates() {
    try {
        // USD 기준 환율 가져오기
        const response = await fetch(API_BASE_URL + 'USD');
        if (!response.ok) {
            throw new Error('환율 데이터를 가져올 수 없습니다');
        }

        const data = await response.json();
        exchangeRates = data.rates;

        // 마지막 업데이트 시간 표시
        updateLastUpdateTime();

        // 초기 변환 실행
        convertCurrency();
    } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        showError('환율 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
}

// 환율 변환
async function convertCurrency() {
    // UI 요소 가져오기
    const amountInput = document.querySelector('#amount');
    const fromCurrency = document.querySelector('#fromCurrency').value;
    const toCurrency = document.querySelector('#toCurrency').value;
    const amount = parseFloat(amountInput.value) || 1;

    // 유효성 검사
    if (amount <= 0) {
        showError('올바른 금액을 입력해주세요');
        return;
    }

    // 같은 통화인 경우
    if (fromCurrency === toCurrency) {
        displayResult(amount, fromCurrency, amount, toCurrency, 1);
        return;
    }

    // 로딩 상태 표시
    showLoading(true);
    hideError();

    try {
        // API 호출
        const response = await fetch(API_BASE_URL + fromCurrency);

        if (!response.ok) {
            throw new Error('환율 정보를 가져올 수 없습니다');
        }

        const data = await response.json();
        const rate = data.rates[toCurrency];

        if (!rate) {
            throw new Error('해당 통화의 환율 정보가 없습니다');
        }

        // 결과 계산
        const result = amount * rate;

        // 결과 표시
        displayResult(amount, fromCurrency, result, toCurrency, rate);

        // 기록에 추가
        addToHistory(amount, fromCurrency, result, toCurrency, rate);

        // 마지막 업데이트 시간 갱신
        updateLastUpdateTime();

    } catch (error) {
        console.error('변환 실패:', error);
        showError(error.message || '변환 중 오류가 발생했습니다');
    } finally {
        showLoading(false);
    }
}

// 결과 표시
function displayResult(fromAmount, fromCurrency, toAmount, toCurrency, rate) {
    const resultDiv = document.querySelector('#result');

    // 금액 포맷팅
    const formattedFromAmount = formatNumber(fromAmount);
    const formattedToAmount = formatNumber(toAmount);
    const formattedRate = formatNumber(rate, 4);

    // 결과 업데이트
    document.querySelector('#fromAmount').textContent = formattedFromAmount;
    document.querySelector('#fromCurrencyText').textContent = fromCurrency;
    document.querySelector('#toAmount').textContent = formattedToAmount;
    document.querySelector('#toCurrencyText').textContent = toCurrency;
    document.querySelector('#rateInfo').textContent =
        `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;

    // 결과 표시
    resultDiv.classList.remove('hidden');
}

// 통화 교환
function swapCurrencies() {
    const fromCurrency = document.querySelector('#fromCurrency');
    const toCurrency = document.querySelector('#toCurrency');

    // 값 교환
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    // 자동 변환
    convertCurrency();
}

// 변환 기록 추가
function addToHistory(fromAmount, fromCurrency, toAmount, toCurrency, rate) {
    const historyItem = {
        fromAmount,
        fromCurrency,
        toAmount,
        toCurrency,
        rate,
        timestamp: new Date().getTime()
    };

    // 배열 앞에 추가 (최신이 위로)
    conversionHistory.unshift(historyItem);

    // 최대 10개만 유지
    if (conversionHistory.length > 10) {
        conversionHistory = conversionHistory.slice(0, 10);
    }

    // LocalStorage에 저장
    saveHistory();

    // UI 업데이트
    renderHistory();
}

// 기록 렌더링
function renderHistory() {
    const historyList = document.querySelector('#historyList');

    if (conversionHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">아직 변환 기록이 없습니다</p>';
        return;
    }

    historyList.innerHTML = conversionHistory.map(item => {
        const timeAgo = getTimeAgo(item.timestamp);
        return `
            <div class="history-item" onclick="loadFromHistory('${item.fromCurrency}', '${item.toCurrency}', ${item.fromAmount})">
                <div class="history-conversion">
                    ${formatNumber(item.fromAmount)} ${item.fromCurrency} → ${formatNumber(item.toAmount)} ${item.toCurrency}
                </div>
                <div class="history-time">${timeAgo}</div>
            </div>
        `;
    }).join('');
}

// 기록에서 불러오기
function loadFromHistory(fromCurrency, toCurrency, amount) {
    document.querySelector('#fromCurrency').value = fromCurrency;
    document.querySelector('#toCurrency').value = toCurrency;
    document.querySelector('#amount').value = amount;
    convertCurrency();
}

// 기록 삭제
function clearHistory() {
    if (confirm('모든 변환 기록을 삭제하시겠습니까?')) {
        conversionHistory = [];
        saveHistory();
        renderHistory();
    }
}

// LocalStorage 저장
function saveHistory() {
    localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
}

// LocalStorage 불러오기
function loadHistory() {
    const saved = localStorage.getItem('conversionHistory');
    if (saved) {
        conversionHistory = JSON.parse(saved);
        renderHistory();
    }
}

// 로딩 상태 표시
function showLoading(show) {
    const loadingDiv = document.querySelector('#loading');
    const convertBtn = document.querySelector('#convertBtn');

    if (show) {
        loadingDiv.classList.remove('hidden');
        convertBtn.disabled = true;
        convertBtn.textContent = '변환 중...';
    } else {
        loadingDiv.classList.add('hidden');
        convertBtn.disabled = false;
        convertBtn.textContent = '변환하기';
    }
}

// 에러 표시
function showError(message) {
    const errorDiv = document.querySelector('#error');
    const errorMessage = document.querySelector('#errorMessage');

    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');

    // 3초 후 자동으로 숨기기
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 3000);
}

// 에러 숨기기
function hideError() {
    document.querySelector('#error').classList.add('hidden');
}

// 마지막 업데이트 시간 갱신
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');
    document.querySelector('#lastUpdate').textContent =
        `마지막 업데이트: ${timeString}`;
}

// 유틸리티 함수들

// 숫자 포맷팅
function formatNumber(number, decimals = 2) {
    return number.toLocaleString('ko-KR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// 시간 표시
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}시간 전`;
    } else if (minutes > 0) {
        return `${minutes}분 전`;
    } else {
        return '방금 전';
    }
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}