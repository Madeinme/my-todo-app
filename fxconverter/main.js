// 환율 정보를 가져올 API 주소 (뒤에 통화코드를 붙여서 사용)
const API_URL = "https://api.exchangerate-api.com/v4/latest/";

// 입력이 멈춘 뒤 이 시간(ms)이 지나면 자동 변환
const INPUT_DELAY = 300;

// 기록을 저장할 LocalStorage 키와 최대 개수
const HISTORY_KEY = "fxconverter.history";
const HISTORY_MAX = 5;

// 페이지 로직을 시작하는 함수
function initApp() {
    const amountInput = document.getElementById("amount");
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");
    const convertBtn = document.getElementById("convert");
    const swapBtn = document.getElementById("swap-btn");
    const result = document.getElementById("result");
    const historySection = document.getElementById("history-section");
    const historyList = document.getElementById("history");
    const deleteSelectedBtn = document.getElementById("delete-selected");
    const deleteAllBtn = document.getElementById("delete-all");

    // 한 번 받아온 환율표를 기준 통화별로 저장해 두고 다시 사용 (예: ratesCache.USD)
    const ratesCache = {};
    // 가장 최근 변환 요청 번호. 늦게 도착한 옛 요청의 결과는 무시하는 데 사용
    let latestRequest = 0;
    // 자동 변환 대기 타이머
    let inputTimer = null;
    // 최근 변환 기록 (0번이 가장 최근). 저장된 기록을 불러와서 시작
    let history = loadHistory();
    // 체크된 기록의 시각(time) 모음. 기록마다 시각이 달라서 구분용 값으로 사용
    const selectedTimes = new Set();

    // 숫자 입력창에서 허용되는 e, +, - 문자는 막아서 숫자만 입력되게 함
    amountInput.addEventListener("keydown", (event) => {
        if (["e", "E", "+", "-"].includes(event.key)) {
            event.preventDefault();
        }
    });

    // 결과 영역에 글자를 표시 (isError가 true면 빨간 오류 스타일)
    function showResult(text, isError) {
        result.textContent = text;
        result.classList.toggle("error", Boolean(isError));
    }

    // 숫자를 천 단위 쉼표와 소수점 둘째 자리까지 표시
    function formatNumber(value) {
        return value.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
    }

    // 환율은 아주 작은 값(예: 1 KRW = 0.000725 USD)도 있어서 소수점 여섯째 자리까지 표시
    function formatRate(value) {
        return value.toLocaleString("ko-KR", { maximumFractionDigits: 6 });
    }

    // 기록 시각을 "11. 9. 오후 02:05" 형식으로 표시
    function formatTime(time) {
        return new Date(time).toLocaleString("ko-KR", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    // LocalStorage에서 기록을 불러옴 (없거나 깨져 있으면 빈 배열)
    function loadHistory() {
        try {
            const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
            if (!Array.isArray(saved)) {
                return [];
            }
            // 값이 빠지거나 잘못된 기록은 버림 (화면에 그릴 때 오류가 나지 않도록)
            return saved
                .filter((entry) => entry
                    && ["amount", "rate", "converted", "time"].every((key) => typeof entry[key] === "number")
                    && typeof entry.from === "string"
                    && typeof entry.to === "string")
                .slice(0, HISTORY_MAX);
        } catch (error) {
            return [];
        }
    }

    // 기록을 바꾼 뒤 저장하고 다시 그림
    function updateHistory(newHistory) {
        history = newHistory;

        // 목록에서 사라진 기록은 선택 목록에서도 뺌
        const remaining = new Set(history.map((entry) => entry.time));
        selectedTimes.forEach((time) => {
            if (!remaining.has(time)) {
                selectedTimes.delete(time);
            }
        });

        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            // 저장에 실패해도 화면의 기록은 그대로 보여 줌
            console.error(error);
        }
        renderHistory();
    }

    // 체크한 기록이 있을 때만 선택 삭제 버튼을 누를 수 있게 함
    function updateDeleteSelectedBtn() {
        deleteSelectedBtn.disabled = selectedTimes.size === 0;
    }

    // 기록 목록을 화면에 다시 그림
    function renderHistory() {
        historySection.hidden = history.length === 0;
        historyList.textContent = "";

        history.forEach((entry) => {
            const isSelected = selectedTimes.has(entry.time);

            const item = document.createElement("li");
            item.className = "history-item";
            item.classList.toggle("selected", isSelected);

            // 라벨로 감싸서 줄 어디를 눌러도 체크박스가 바뀌게 함
            const label = document.createElement("label");
            label.className = "history-label";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = isSelected;
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    selectedTimes.add(entry.time);
                } else {
                    selectedTimes.delete(entry.time);
                }
                item.classList.toggle("selected", checkbox.checked);
                updateDeleteSelectedBtn();
            });

            const text = document.createElement("span");
            text.className = "history-text";

            const main = document.createElement("span");
            main.className = "history-main";
            main.textContent = `${formatNumber(entry.amount)} ${entry.from} = ${formatNumber(entry.converted)} ${entry.to}`;

            const meta = document.createElement("span");
            meta.className = "history-meta";
            meta.textContent = `1 ${entry.from} = ${formatRate(entry.rate)} ${entry.to} · ${formatTime(entry.time)}`;

            text.append(main, meta);
            label.append(checkbox, text);
            item.append(label);
            historyList.append(item);
        });

        updateDeleteSelectedBtn();
    }

    // 기록을 맨 앞에 추가 (바로 앞 기록과 같은 변환이면 남기지 않음)
    function addHistory(entry) {
        const last = history[0];
        if (last && last.amount === entry.amount && last.from === entry.from && last.to === entry.to) {
            return;
        }
        updateHistory([entry, ...history].slice(0, HISTORY_MAX));
    }

    // 선택 삭제: 체크한 기록만 지움
    function deleteSelected() {
        updateHistory(history.filter((entry) => !selectedTimes.has(entry.time)));
    }

    // 전체 삭제: 확인을 받은 뒤 기록을 모두 지움
    function deleteAll() {
        if (!confirm("변환 기록을 모두 삭제할까요?")) {
            return;
        }
        updateHistory([]);
    }

    // 기준 통화의 환율표를 가져옴 (저장된 것이 있으면 API를 다시 부르지 않음)
    async function getRates(base) {
        if (ratesCache[base]) {
            return ratesCache[base];
        }
        const response = await fetch(API_URL + base);
        if (!response.ok) {
            throw new Error("응답 오류: " + response.status);
        }
        const data = await response.json();
        ratesCache[base] = data.rates;
        return data.rates;
    }

    // 변환 실행. 실시간 변환(isLive)일 때는 금액이 비어 있으면 오류 대신 결과를 비우고, 기록도 남기지 않음
    async function convert(isLive) {
        // 대기 중인 자동 변환이 있으면 취소 (지금 바로 변환하므로)
        clearTimeout(inputTimer);

        const amount = Number(amountInput.value);
        const from = fromSelect.value;
        const to = toSelect.value;
        const requestId = ++latestRequest;

        if (amountInput.value.trim() === "") {
            showResult(isLive ? "" : "금액을 올바르게 입력해 주세요.", !isLive);
            return;
        }
        // 금액이 숫자가 아니거나 음수면 오류 표시
        if (!Number.isFinite(amount) || amount < 0) {
            showResult("금액을 올바르게 입력해 주세요.", true);
            return;
        }

        // 환율표가 아직 없을 때만 진행 상태를 표시
        if (!ratesCache[from]) {
            showResult("변환 중...", false);
        }

        try {
            const rates = await getRates(from);
            // 그 사이 새 변환이 시작됐으면 이 결과는 버림
            if (requestId !== latestRequest) {
                return;
            }
            const rate = rates[to];
            if (typeof rate !== "number") {
                throw new Error("환율 정보 없음: " + to);
            }

            const converted = amount * rate;
            showResult(`${formatNumber(amount)} ${from} = ${formatNumber(converted)} ${to}`, false);

            // 기록은 변환 버튼을 눌렀을 때만 남김 (자동 변환은 화면에만 표시)
            if (!isLive) {
                addHistory({ amount, from, to, rate, converted, time: Date.now() });
            }
        } catch (error) {
            if (requestId !== latestRequest) {
                return;
            }
            console.error(error);
            showResult("환율 정보를 불러오지 못했습니다.", true);
        }
    }

    // 금액을 입력하면 입력이 잠시 멈췄을 때 자동 변환
    amountInput.addEventListener("input", () => {
        clearTimeout(inputTimer);
        inputTimer = setTimeout(() => convert(true), INPUT_DELAY);
    });

    // 통화를 바꾸면 바로 자동 변환
    fromSelect.addEventListener("change", () => convert(true));
    toSelect.addEventListener("change", () => convert(true));

    // 통화 교환 버튼: From과 To를 서로 바꾸고, 금액이 있으면 바로 변환
    function swapCurrencies() {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;

        convert(true);
    }

    convertBtn.addEventListener("click", () => convert(false));
    swapBtn.addEventListener("click", swapCurrencies);
    deleteSelectedBtn.addEventListener("click", deleteSelected);
    deleteAllBtn.addEventListener("click", deleteAll);

    // 저장돼 있던 기록을 처음 한 번 화면에 표시
    renderHistory();
}

// HTML을 다 읽은 뒤 initApp 실행
document.addEventListener("DOMContentLoaded", initApp);
