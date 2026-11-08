// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 전역 변수
let todos = [];
let currentFilter = 'all';

// DOM 요소 참조
const todoInput = document.querySelector('#todoInput');
const addBtn = document.querySelector('#addBtn');
const todoList = document.querySelector('#todoList');

// 앱 초기화 함수
function initApp() {
    console.log('Todo App이 시작되었습니다!');

    // LocalStorage에서 데이터 불러오기
    loadTodos();

    // 화면에 표시
    renderTodos();

    // 이벤트 리스너 등록
    addBtn.addEventListener('click', addTodo);

    // Enter 키로도 추가 가능
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // 필터 버튼 이벤트
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterTodos(e.target.dataset.filter);
        });
    });

    // 완료된 항목 삭제 버튼
    document.querySelector('#clearCompleted')
        .addEventListener('click', clearCompleted);
}

// 할 일 추가 함수
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('할 일을 입력하세요!');
        return;
    }

    // 중복 체크
    const isDuplicate = todos.some(todo => todo.text === text);
    if (isDuplicate) {
        alert('이미 등록된 할 일입니다!');
        return;
    }

    // 새 할 일 객체 생성
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    // 배열에 추가
    todos.push(newTodo);

    // 입력창 비우기
    todoInput.value = '';
    todoInput.focus();

    // 화면 업데이트 및 저장
    renderTodos();
    saveTodos();
}

// 완료 상태 토글 함수
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);

    if (todo) {
        todo.completed = !todo.completed;
        renderTodos();
        saveTodos();
    }
}

// 할 일 수정 함수
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    const newText = prompt('새로운 내용을 입력하세요:', todo.text);

    if (newText && newText.trim() !== '') {
        todo.text = newText.trim();
        renderTodos();
        saveTodos();
    }
}

// 할 일 삭제 함수
function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    todos = todos.filter(t => t.id !== id);
    renderTodos();
    saveTodos();
}

// 필터 설정 함수
function filterTodos(filter) {
    currentFilter = filter;

    // 버튼 활성화 상태 업데이트
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// 완료된 항목 삭제 함수
function clearCompleted() {
    const remaining = todos.filter(t => !t.completed);

    if (todos.length === remaining.length) {
        alert('완료된 항목이 없습니다!');
        return;
    }

    if (confirm(`완료된 ${todos.length - remaining.length}개 항목을 삭제하시겠습니까?`)) {
        todos = remaining;
        renderTodos();
        saveTodos();
    }
}

// 화면에 할 일 목록 표시 함수
function renderTodos() {
    todoList.innerHTML = '';

    // 필터에 따라 표시할 항목 선택
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 필터링된 항목만 표시
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <input type="checkbox"
                   ${todo.completed ? 'checked' : ''}
                   onchange="toggleTodo(${todo.id})">
            <span ondblclick="editTodo(${todo.id})">${todo.text}</span>
            <button onclick="deleteTodo(${todo.id})">삭제</button>
        `;

        todoList.appendChild(li);
    });

    // 개수 업데이트
    updateCount();
}

// 할 일 개수 업데이트 함수
function updateCount() {
    const count = document.querySelector('#todoCount');
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    count.textContent = `전체: ${total}개, 완료: ${completed}개`;
}

// LocalStorage에 데이터 저장
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// LocalStorage에서 데이터 불러오기
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');

    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    } else {
        todos = [];
    }
}
