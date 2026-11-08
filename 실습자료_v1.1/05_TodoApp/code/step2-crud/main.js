// 할 일 목록 앱 - Step 2: CRUD 기능 구현
// LocalStorage 없이 메모리(배열)에만 저장

// 할 일 데이터를 저장할 배열
let todos = [];

// DOM 요소 참조
let todoInput;
let addBtn;
let todoList;

// 앱 초기화
function initApp() {
    // DOM 요소 가져오기
    todoInput = document.getElementById('todo-input');
    addBtn = document.getElementById('add-btn');
    todoList = document.getElementById('todo-list');

    // 이벤트 리스너 등록
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // 초기 렌더링
    renderTodos();

    console.log('Todo 앱이 초기화되었습니다.');
}

// 할 일 추가
function addTodo() {
    const text = todoInput.value.trim();

    // 빈 값 체크
    if (!text) {
        alert('할 일을 입력하세요');
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
}

// 할 일 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    renderTodos();
}

// 완료 상태 토글
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    renderTodos();
}

// 할 일 목록 렌더링
function renderTodos() {
    // 목록 비우기
    todoList.innerHTML = '';

    // 할 일이 없으면 빈 메시지 표시
    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-message">등록된 할 일이 없습니다</li>';
        return;
    }

    // 각 할 일 항목 생성
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');

        li.innerHTML = `
            <input
                type="checkbox"
                class="todo-checkbox"
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${todo.text}</span>
            <button class="btn-delete" onclick="deleteTodo(${todo.id})">삭제</button>
        `;

        todoList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
