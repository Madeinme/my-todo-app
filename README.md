# 바이브 코딩 실습 프로젝트

Claude Code로 만든 작은 웹 페이지 모음입니다.
HTML, CSS, 순수 JavaScript만 사용했고, 빌드 과정이나 설치할 패키지가 없습니다.

## 실행 방법

각 폴더의 `index.html` 파일을 브라우저로 열면 바로 실행됩니다. 서버는 필요 없습니다.

## 프로젝트 목록

| 폴더 | 설명 |
| --- | --- |
| [`profile/`](profile/) | 자기소개 카드 페이지 |
| [`counter/`](counter/) | +, −, 초기화 버튼이 있는 카운터 |
| [`to-do/`](to-do/) | 할 일 목록 (추가·완료·삭제, 전체/진행 중/완료 필터, 브라우저에 자동 저장) |
| [`fxconverter/`](fxconverter/) | 환율 계산기 (USD·EUR·KRW·JPY, 입력하는 즉시 변환, 최근 변환 기록 5개 저장) |
| [`snakegame/`](snakegame/) | 스네이크 게임 (난이도 선택, 50점마다 레벨 업, 일시정지, 최고 점수 저장) |
| [`my-todo-app/`](my-todo-app/) | 실습용 폴더 |

`실습자료_v1.1/` 폴더에는 강의 단계별 실습 자료가 들어 있습니다.

## 폴더 구조

모든 페이지는 같은 구조로 되어 있습니다.

```
폴더/
├── index.html   # 화면 구조
├── style.css    # 디자인 (보라색 그라디언트 테마)
└── main.js      # 동작 (initApp()에서 시작)
```

## 사용 기술

- HTML5
- CSS3
- JavaScript (ES6+)
- LocalStorage (할 일, 환율 기록, 최고 점수 저장)
- [ExchangeRate-API](https://www.exchangerate-api.com/) (환율 정보)
