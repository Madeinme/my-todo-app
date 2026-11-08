# 03차시: Claude Code 기본 - 코드 폴더 구조

이 폴더는 03차시 "Claude Code 기본 사용" 실습에서 사용하는 예제 코드를 포함합니다.

## 📁 폴더 구조

```
code/
├── step1-hello/        # 첫 번째 Hello World 프로젝트 (클립 2)
│   ├── index.html      # 기본 HTML 페이지
│   ├── style.css       # 스타일시트
│   └── main.js         # JavaScript
├── step2-profile/      # 자기소개 페이지 (클립 3)
│   └── index.html      # 자기소개 페이지 (CSS 포함)
├── _archive/           # 원본 폴더 백업
└── README.md           # 이 파일
```

## 🎬 클립별 사용 코드

| 클립 | 제목 | 사용 코드 |
|------|------|-----------|
| 1 | VS Code & Claude Code 설치 | (설치 과정) |
| 2 | 첫 프로젝트 생성, 슬래시 명령 | `step1-hello/` |
| 3 | Claude와 대화하는 법 | `step2-profile/` |
| 4 | Claude.md 맛보기 | (개념 설명) |

## 📝 각 단계별 설명

### step1-hello (클립 2)
Claude Code로 첫 번째 프로젝트를 생성하는 실습입니다.
- Hello World 출력하는 기본 HTML
- 간단한 CSS 스타일 (그라데이션 배경)
- JavaScript 콘솔 로그

### step2-profile (클립 3)
Claude와 대화하며 점진적으로 개선하는 자기소개 페이지입니다.
- 프로필 카드 레이아웃
- 취미 섹션
- 현대적인 디자인 (애니메이션 포함)

## 🚀 실행 방법

```bash
cd step1-hello
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

또는 VS Code의 Live Server 확장 사용
