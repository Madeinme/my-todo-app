# 06_FXConverter 코드 폴더

환율 변환기 프로젝트의 단계별 코드입니다.

## 폴더 구조

```
code/
├── step1-basic/       # 클립 2: 기본 환율 변환
├── step2-enhanced/    # 클립 3: 기능 개선 (통화 스왑 등)
├── _archive/          # 기존 완성 코드 백업
└── README.md
```

## 각 단계별 내용

### step1-basic (클립 2: 기본 구현)
- 금액 입력, From/To 통화 선택
- 변환 버튼으로 API 호출
- 결과 표시 (숫자 포맷팅)
- try/catch 에러 처리
- 로딩 상태 표시
- Enter 키 지원

### step2-enhanced (클립 3: 기능 개선)
- 통화 스왑 버튼 (🔄)
- 개선된 에러 메시지 표시
- 같은 통화 선택 시 처리
- 모던 UI 스타일

## 실행 방법

각 폴더에서:
```bash
python3 -m http.server 8000
```
http://localhost:8000 접속

## API 정보

- **API**: https://api.exchangerate-api.com/v4/latest/
- **사용법**: `${API_URL}${통화코드}` (예: USD 기준 환율 → `API_URL + 'USD'`)
- **무료**: 회원가입/API 키 불필요
