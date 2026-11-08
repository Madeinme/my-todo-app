// 페이지가 준비되면 실행되는 함수
function initApp() {
    // LocalStorage에 저장할 때 쓰는 이름(키)
    // (파일로 연 다른 페이지들과 저장 공간을 같이 쓸 수 있어서 이름을 구체적으로 지음)
    const STORAGE_KEY = "todo-app.todos";

    // 할 일들을 저장하는 배열 (LocalStorage에서 불러온 값으로 시작)
    // 각 항목 모양: { id: 숫자, text: "내용", completed: true/false }
    let todos = loadTodos();

    // 항목마다 겹치지 않는 번호를 붙이기 위한 변수
    // 불러온 항목 중 가장 큰 id 다음 번호부터 시작
    let nextId = 1;
    todos.forEach(function (todo) {
        if (todo.id >= nextId) {
            nextId = todo.id + 1;
        }
    });

    // 화면에서 필요한 요소들을 찾아 둠
    const form = document.getElementById("todo-form");
    const input = document.getElementById("todo-input");
    const list = document.getElementById("todo-list");
    const totalCountEl = document.getElementById("total-count");
    const doneCountEl = document.getElementById("done-count");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const emptyMessageEl = document.getElementById("empty-message");
    const clearDoneBtn = document.getElementById("clear-done-btn");

    // 현재 선택된 필터: "all"(전체) / "active"(진행중) / "done"(완료)
    let currentFilter = "all";

    // 필터별로 목록이 비었을 때 보여줄 안내 문구
    const EMPTY_MESSAGES = {
        all: "아직 할 일이 없어요.",
        active: "진행중인 할 일이 없어요.",
        done: "완료된 할 일이 없어요."
    };

    // LocalStorage에서 할 일 목록을 불러오는 함수
    function loadTodos() {
        const saved = localStorage.getItem(STORAGE_KEY);

        // 저장된 값이 없으면 빈 배열
        if (saved === null) {
            return [];
        }

        // 저장된 값이 깨져 있어도 앱이 멈추지 않도록 try/catch 사용
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    // 현재 할 일 목록을 LocalStorage에 저장하는 함수
    // (LocalStorage는 문자열만 저장할 수 있어서 JSON 문자열로 바꿔 저장)
    function saveTodos() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }

    // 전체/완료 개수를 화면에 표시하는 함수
    function updateCount() {
        const doneCount = todos.filter(function (todo) {
            return todo.completed;
        }).length;

        totalCountEl.textContent = todos.length;
        doneCountEl.textContent = doneCount;

        // 완료된 항목이 없으면 일괄 삭제 버튼을 누를 수 없게 함
        clearDoneBtn.disabled = doneCount === 0;
    }

    // 현재 필터에 맞는 할 일만 골라 돌려주는 함수
    function getFilteredTodos() {
        return todos.filter(function (todo) {
            if (currentFilter === "active") {
                return !todo.completed;
            }
            if (currentFilter === "done") {
                return todo.completed;
            }
            return true; // "all"이면 전부
        });
    }

    // 선택된 필터 버튼에만 active 클래스를 붙여 강조
    function updateFilterButtons() {
        filterBtns.forEach(function (btn) {
            btn.classList.toggle("active", btn.dataset.filter === currentFilter);
        });
    }

    // 배열에 있는 할 일들을 화면에 다시 그리는 함수
    // 추가/완료/삭제 후에는 항상 이 함수가 불리므로 여기서 저장과 개수 갱신도 함께 함
    function render() {
        saveTodos();
        updateCount();
        updateFilterButtons();

        // 기존 목록을 비우고 처음부터 다시 그림
        list.innerHTML = "";

        const visibleTodos = getFilteredTodos();

        // 보여줄 항목이 없으면 필터에 맞는 안내 문구 표시
        emptyMessageEl.textContent = EMPTY_MESSAGES[currentFilter];
        emptyMessageEl.hidden = visibleTodos.length > 0;

        visibleTodos.forEach(function (todo) {
            // <li class="todo-item">
            const li = document.createElement("li");
            li.className = "todo-item";
            if (todo.completed) {
                li.classList.add("completed");
            }

            // 완료 여부를 바꾸는 체크박스
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "todo-check";
            checkbox.checked = todo.completed;
            checkbox.addEventListener("change", function () {
                toggleTodo(todo.id);
            });

            // 할 일 내용 (textContent를 써서 입력한 글자가 그대로 표시되게 함)
            const span = document.createElement("span");
            span.className = "todo-text";
            span.textContent = todo.text;

            // 삭제 버튼
            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.className = "delete-btn";
            deleteBtn.textContent = "삭제";
            deleteBtn.addEventListener("click", function () {
                deleteTodo(todo.id);
            });

            li.append(checkbox, span, deleteBtn);
            list.appendChild(li);
        });
    }

    // 할 일 추가
    function addTodo() {
        // 앞뒤 공백을 지운 입력값
        const text = input.value.trim();

        // 빈 값이면 알림을 띄우고 중단
        if (text === "") {
            alert("할 일을 입력하세요");
            input.focus();
            return;
        }

        // 이미 같은 내용이 있으면 알림을 띄우고 중단
        // (영어 대소문자는 구분하지 않음: "Study"와 "study"는 같은 할 일로 봄)
        const isDuplicate = todos.some(function (todo) {
            return todo.text.toLowerCase() === text.toLowerCase();
        });
        if (isDuplicate) {
            alert("이미 등록된 할 일입니다");
            input.focus();
            return;
        }

        todos.push({ id: nextId, text: text, completed: false });
        nextId = nextId + 1;

        // 입력창을 비우고 다시 입력할 수 있게 포커스
        input.value = "";
        input.focus();
        render();
    }

    // 완료/미완료 토글
    function toggleTodo(id) {
        todos.forEach(function (todo) {
            if (todo.id === id) {
                todo.completed = !todo.completed;
            }
        });
        render();
    }

    // 할 일 삭제 (해당 id만 빼고 새 배열을 만듦)
    function deleteTodo(id) {
        todos = todos.filter(function (todo) {
            return todo.id !== id;
        });
        render();
    }

    // 완료된 항목만 한꺼번에 삭제 (완료되지 않은 항목만 남김)
    function clearDoneTodos() {
        todos = todos.filter(function (todo) {
            return !todo.completed;
        });
        render();
    }

    // 필터 버튼 클릭: 선택한 필터로 바꾸고 다시 그림
    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            currentFilter = btn.dataset.filter;
            render();
        });
    });

    // 완료된 항목 삭제 버튼 클릭
    clearDoneBtn.addEventListener("click", clearDoneTodos);

    // 추가 버튼 클릭과 Enter 키 모두 form의 submit 이벤트로 들어옴
    form.addEventListener("submit", function (event) {
        // 페이지가 새로고침되는 기본 동작을 막음
        event.preventDefault();
        addTodo();
    });

    // 처음 화면 그리기
    render();
}

// HTML을 모두 읽은 뒤 initApp 실행
document.addEventListener("DOMContentLoaded", initApp);
