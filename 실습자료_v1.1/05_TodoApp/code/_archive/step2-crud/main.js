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
    // 입력값 가져오기
    const text = todoInput.value.trim();

    // 빈 값 체크
    if (text === '') {
        alert('할 일을 입력하세요!');
        return;
    }

    // 새 할 일 객체 생성
    const newTodo = {
        id: Date.now(),        // 고유 ID (현재 시간을 밀리초로)
        text: text,            // 할 일 내용
        completed: false       // 완료 여부
    };

    // 배열에 추가
    todos.push(newTodo);

    // 입력창 비우기
    todoInput.value = '';

    // 화면 업데이트
    renderTodos();
}

// 완료 상태 토글 함수
function toggleTodo(id) {
    // ID로 할 일 찾기
    const todo = todos.find(t => t.id === id);

    if (todo) {
        // 완료 상태 반전
        todo.completed = !todo.completed;

        // 화면 업데이트
        renderTodos();
    }
}

// 할 일 삭제 함수
function deleteTodo(id) {
    // 확인 메시지
    if (!confirm('정말 삭제하시겠습니까?')) {
        return;
    }

    // ID가 일치하지 않는 항목만 남기기
    todos = todos.filter(t => t.id !== id);

    // 화면 업데이트
    renderTodos();
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
}
