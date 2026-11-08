# 04차시: 웹기초 - 예제 코드

각 폴더는 강의 진행 순서에 맞춰 단계별로 구성되어 있습니다.

## 폴더 구조

| 폴더 | 클립 | 설명 |
|------|------|------|
| `step1-basic/` | 클립 2 | 기본 카운터 (기능만 동작) |
| `step2-color/` | 클립 2 | 숫자 색상 변경 기능 추가 |
| `step3-styled/` | 클립 3 | 스타일 개선 완성본 |
| `error-example-1/` | 클립 4 | 디버깅 실습: ID 오타 버그 |
| `error-example-2/` | 클립 4 | 디버깅 실습: DOMContentLoaded 누락 |
| `_archive/` | - | 기존 코드 (참고용) |

## 실행 방법

1. 각 폴더의 `index.html`을 브라우저에서 열기
2. 또는 VS Code Live Server 사용
3. 또는 터미널에서:
   ```bash
   cd step1-basic
   python3 -m http.server 8000
   ```
   → http://localhost:8000 접속

## 학습 순서

### 1. step1-basic
기본 카운터 앱입니다. +, -, 리셋 버튼이 동작합니다.

### 2. step2-color
숫자에 따라 색상이 변경되는 기능이 추가됩니다.
- 양수: 초록색
- 음수: 빨간색
- 0: 기본색

### 3. step3-styled
Claude에게 스타일 개선을 요청한 결과물입니다.
- 그라데이션 배경
- 모던한 버튼 디자인
- 호버/클릭 애니메이션

### 4. error-example-1
**ID 오타 버그**: `#increaseBtn` 대신 `#increaseButton`으로 잘못 작성한 예제입니다.

에러 메시지:
```
Uncaught TypeError: Cannot read property 'addEventListener' of null
```

### 5. error-example-2
**DOMContentLoaded 누락**: `<script>`가 `<head>`에 있고 DOMContentLoaded 없이 실행되는 예제입니다.

에러 메시지:
```
Uncaught TypeError: Cannot read property 'addEventListener' of null
```

## 디버깅 실습 방법

1. `error-example-1/` 또는 `error-example-2/`의 `index.html`을 브라우저에서 열기
2. F12를 눌러 개발자 도구 열기
3. Console 탭에서 에러 메시지 확인
4. 에러 메시지를 복사하여 Claude에게 디버깅 요청하기

예시 프롬프트:
```
버튼을 클릭해도 동작하지 않아.
콘솔에 다음 에러가 나와:

Uncaught TypeError: Cannot read property 'addEventListener' of null
    at main.js:24

어떻게 수정하면 될까?
```
