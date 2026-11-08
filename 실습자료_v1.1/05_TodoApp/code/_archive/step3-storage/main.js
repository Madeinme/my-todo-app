// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// 전역 변수: 할 일 목록을 저장할 배열
let todos = [];

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
}

// 할 일 추가 함수
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('할 일을 입력하세요!');
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

    // 화면 업데이트
    renderTodos();

    // LocalStorage에 저장
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

// 할 일 삭제 함수
function deleteTodo(id) {
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    todos = todos.filter(t => t.id !== id);
    renderTodos();
    saveTodos();
}

// 화면에 할 일 목록 표시 함수
function renderTodos() {
    // 기존 목록 비우기
    todoList.innerHTML = '';

    // 각 할 일 항목을 화면에 추가
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <input type="checkbox"
                   ${todo.completed ? 'checked' : ''}
                   onchange="toggleTodo(${todo.id})">
            <span>${todo.text}</span>
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
    // 배열을 JSON 문자열로 변환하여 저장
    localStorage.setItem('todos', JSON.stringify(todos));
    console.log('저장됨:', todos);
}

// LocalStorage에서 데이터 불러오기
function loadTodos() {
    // LocalStorage에서 데이터 가져오기
    const savedTodos = localStorage.getItem('todos');

    // 데이터가 있으면 파싱, 없으면 빈 배열
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        console.log('불러옴:', todos);
    } else {
        todos = [];
    }
}
