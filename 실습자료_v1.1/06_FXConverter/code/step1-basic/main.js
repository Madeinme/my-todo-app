const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const convertBtn = document.getElementById('convert-btn');
const resultDiv = document.getElementById('result');

convertBtn.addEventListener('click', convertCurrency);

amountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        convertCurrency();
    }
});

async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (!amount || amount <= 0) {
        showResult('금액을 입력해주세요', true);
        return;
    }

    if (from === to) {
        showResult(`${formatNumber(amount)} ${to}`, false);
        return;
    }

    try {
        convertBtn.disabled = true;
        convertBtn.textContent = '변환 중...';

        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);

        if (!response.ok) {
            throw new Error('API 요청 실패');
        }

        const data = await response.json();
        const rate = data.rates[to];

        if (!rate) {
            throw new Error('환율 정보를 찾을 수 없습니다');
        }

        const result = amount * rate;
        showResult(`${formatNumber(result)} ${to}`, false);

    } catch (error) {
        showResult(error.message || '환율 변환 중 오류가 발생했습니다', true);
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = '변환';
    }
}

function showResult(message, isError) {
    resultDiv.textContent = message;
    resultDiv.className = isError ? 'result error' : 'result';
}

function formatNumber(num) {
    return num.toLocaleString('ko-KR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
