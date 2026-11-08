// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 전역 변수
let todos = [];
let currentFilter = 'all';

// 앱 초기화 함수
function initApp() {
    console.log('Todo App이 시작되었습니다!');

    // LocalStorage에서 데이터 불러오기
    loadTodos();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 화면 렌더링
    renderTodos();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 추가 버튼
    document.querySelector('#addBtn').addEventListener('click', addTodo);

    // 입력 필드 Enter 키
    document.querySelector('#todoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // 필터 버튼들
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            setFilter(e.target.dataset.filter);
        });
    });

    // 삭제 버튼들
    document.querySelector('#clearCompletedBtn').addEventListener('click', clearCompleted);
    document.querySelector('#clearAllBtn').addEventListener('click', clearAll);
}

// 할 일 추가
function addTodo() {
    const input = document.querySelector('#todoInput');
    const prioritySelect = document.querySelector('#prioritySelect');
    const text = input.value.trim();

    // 빈 입력 체크
    if (text === '') {
        alert('할 일을 입력해주세요!');
        input.focus();
        return;
    }

    // 중복 체크
    const isDuplicate = todos.some(todo =>
        todo.text.toLowerCase() === text.toLowerCase()
    );

    if (isDuplicate) {
        alert('이미 동일한 할 일이 있습니다!');
        input.focus();
        return;
    }

    // 새 할 일 객체 생성
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: prioritySelect.value,
        createdAt: new Date().toISOString()
    };

    // 배열에 추가
    todos.unshift(newTodo); // 최신 항목을 위에 표시

    // 입력 필드 초기화
    input.value = '';
    prioritySelect.value = 'medium';
    input.focus();

    // 화면 업데이트
    renderTodos();

    // 저장
    saveTodos();
}

// 할 일 토글
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
        saveTodos();
    }
}

// 할 일 수정
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('할 일을 수정하세요:', todo.text);

    if (newText && newText.trim() !== '') {
        todo.text = newText.trim();
        renderTodos();
        saveTodos();
    }
}

// 할 일 삭제
function deleteTodo(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        saveTodos();
    }
}

// 필터 설정
function setFilter(filter) {
    currentFilter = filter;

    // 버튼 활성화 상태 변경
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// 완료된 항목 삭제
function clearCompleted() {
    const completedCount = todos.filter(t => t.completed).length;

    if (completedCount === 0) {
        alert('완료된 항목이 없습니다!');
        return;
    }

    if (confirm(`완료된 ${completedCount}개 항목을 삭제하시겠습니까?`)) {
        todos = todos.filter(t => !t.completed);
        renderTodos();
        saveTodos();
    }
}

// 전체 삭제
function clearAll() {
    if (todos.length === 0) {
        alert('삭제할 항목이 없습니다!');
        return;
    }

    if (confirm(`전체 ${todos.length}개 항목을 삭제하시겠습니까?`)) {
        todos = [];
        renderTodos();
        saveTodos();
    }
}

// 화면 렌더링
function renderTodos() {
    const todoList = document.querySelector('#todoList');
    const emptyState = document.querySelector('#emptyState');

    // 필터링
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 빈 상태 처리
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');

        // 할 일 목록 렌더링
        todoList.innerHTML = filteredTodos.map(todo => `
            <li class="todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}">
                <input
                    type="checkbox"
                    class="todo-checkbox"
                    ${todo.completed ? 'checked' : ''}
                    onchange="toggleTodo(${todo.id})"
                >
                <div class="todo-content">
                    <div class="todo-text">${escapeHtml(todo.text)}</div>
                    <div class="todo-meta">
                        <span class="todo-date">
                            📅 ${formatDate(todo.createdAt)}
                        </span>
                        <span class="priority-badge ${todo.priority}">
                            ${getPriorityText(todo.priority)}
                        </span>
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="btn-edit" onclick="editTodo(${todo.id})">
                        수정
                    </button>
                    <button class="btn-delete" onclick="deleteTodo(${todo.id})">
                        삭제
                    </button>
                </div>
            </li>
        `).join('');
    }

    // 통계 업데이트
    updateStats();
}

// 통계 업데이트
function updateStats() {
    const totalCount = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    const activeCount = totalCount - completedCount;

    document.querySelector('#totalCount').textContent = totalCount;
    document.querySelector('#completedCount').textContent = completedCount;
    document.querySelector('#activeCount').textContent = activeCount;
}

// LocalStorage에 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// LocalStorage에서 불러오기
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// 유틸리티 함수들

// HTML 이스케이프 (XSS 방지)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}일 전`;
    } else if (hours > 0) {
        return `${hours}시간 전`;
    } else if (minutes > 0) {
        return `${minutes}분 전`;
    } else {
        return '방금 전';
    }
}

// 우선순위 텍스트
function getPriorityText(priority) {
    const priorities = {
        high: '높음',
        medium: '보통',
        low: '낮음'
    };
    return priorities[priority] || '보통';
}