# 05차시: TodoApp - 예제 코드

각 폴더는 강의 진행 순서에 맞춰 단계별로 구성되어 있습니다.

## 폴더 구조

| 폴더 | 클립 | 설명 |
|------|------|------|
| `step1-ui/` | 클립 1 | 기본 HTML/CSS UI 구조 (기능 없음) |
| `step2-crud/` | 클립 2 | 추가/삭제/완료 토글 기능 구현 |
| `step3-storage/` | 클립 3 | LocalStorage 저장/불러오기 적용 |
| `step4-enhanced/` | 클립 4 | 필터링, 중복 방지, 수정 기능, 스타일 개선 |
| `_archive/` | - | 기존 완성 코드 (참고용) |

## 실행 방법

1. 각 폴더의 `index.html`을 브라우저에서 열기
2. 또는 VS Code Live Server 사용
3. 또는 터미널에서:
   ```bash
   cd step1-ui
   python3 -m http.server 8000
   ```
   → http://localhost:8000 접속

## 학습 순서

### 1. step1-ui (클립 1)
기본 HTML/CSS 구조만 있는 상태입니다.
- 제목, 입력창, 추가 버튼 UI
- JavaScript는 초기화 로그만 출력
- **목표**: To-Do 앱의 기본 구조 이해

### 2. step2-crud (클립 2)
핵심 기능이 구현된 버전입니다.
- 할 일 추가 (`addTodo`)
- 완료 토글 (`toggleTodo`)
- 삭제 (`deleteTodo`)
- 화면 렌더링 (`renderTodos`)
- **목표**: 배열 관리와 동적 DOM 조작 이해

### 3. step3-storage (클립 3)
LocalStorage가 적용된 버전입니다.
- 데이터 저장 (`saveTodos`)
- 데이터 불러오기 (`loadTodos`)
- 새로고침해도 데이터 유지
- 할 일 개수 표시
- **목표**: LocalStorage API 사용법 이해

### 4. step4-enhanced (클립 4)
개선된 최종 버전입니다.
- 중복 입력 방지
- 필터링 (전체/진행중/완료)
- 더블클릭으로 수정
- 완료된 항목 일괄 삭제
- 모던한 스타일 (그라데이션, 애니메이션)
- **목표**: Claude에게 기능/디자인 개선 요청 실습

## 주요 학습 개념

| 단계 | 핵심 개념 |
|------|----------|
| step1 | HTML 구조, CSS 기본 스타일링 |
| step2 | 배열 (`push`, `filter`, `find`), DOM 조작 (`createElement`, `innerHTML`) |
| step3 | LocalStorage, JSON (`stringify`, `parse`) |
| step4 | 이벤트 위임, 필터링, UX 개선 |
