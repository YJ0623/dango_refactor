Dango
>신촌 SW 창업경진대회 출품작, 지류 스탬프 적립 웹 애플리케이션 'Dango'입니다.

## 프로젝트의 목적
기존에 지갑에 넣고 다니던 카페의 지류 스탬프(종이 스탬프판)가 버려지고 재방문율이 낮아지는 현상을 개선하고자 해당 서비스를 기획했습니다.
<img width="300" height="220" alt="스크린샷 2026-02-22 오후 8 23 33" src="https://github.com/user-attachments/assets/a41f1a3e-2094-458f-a302-a5ef38afe565" />

## Key Features & Engineering

### 1. 위치 기반 가게 탐색 및 동적 UI 연동
- **Kakao Map API 연동:** 실시간 위치 기반으로 주변 제휴 카페 마커 렌더링
- **모달/바텀시트 연동:** 지도 위의 마커 클릭 시 해당 가게의 상세 정보를 보여주는 모달(Modal) UI를 RESTful API 데이터와 매핑하여 동적으로 렌더링

### 2. 오프라인-온라인 스탬프 파이프라인 (QR)
- 화면에 QR 코드를 생성하고 스캐너와 연동하여, 오프라인 방문 및 결제가 실제 웹 애플리케이션 내의 스탬프 적립으로 실시간 반영되는 핵심 비즈니스 로직 구현

### 3. 외부 라이브러리 없는 커스텀 데이터 시각화
- 무거운 외부 차트 라이브러리(Chart.js 등)에 의존하지 않고, DOM 제어와 CSS만을 활용하여 사용자 스탬프 적립 현황 및 리워드 데이터를 가볍고 직관적으로 시각화하여 렌더링 성능 확보

### 4. 매끄러운 인증/인가 (Auth) 프로세스
- OAuth 2.0 기반의 카카오 소셜 로그인 연동 및 JWT 토큰 관리를 통해 사용자 경험을 해치지 않는 부드러운 로그인/로그아웃 흐름(Flow) 구축

## Refactoring & Collaboration (모바일 웹 최적화)
- **반응형 UI 트러블슈팅:** 기존 1차 개발 당시, 모바일 디바이스 해상도에서 레이아웃이 깨지는 팀원의 코드를 식별
- **코드 리뷰 및 개선:** CSS Flexbox 및 Grid 구조를 전면 재설계하여, WebView 및 모바일 브라우저 환경에서 어색함 없이 정상적으로 노출되도록 크로스 브라우징 및 반응형 웹 리팩토링 주도

## UI Designs

<img width="390" height="843" alt="회원가입2_수정" src="https://github.com/user-attachments/assets/94196ec4-f40c-4c6b-b695-2403201be5a4" />
<img width="387" height="840" alt="스크린샷 2026-02-27 오후 1 18 39" src="https://github.com/user-attachments/assets/096db2d6-929e-46ac-8b7c-1b7c1def70c2" />
<img width="387" height="840" alt="스크린샷 2026-02-27 오후 1 18 31" src="https://github.com/user-attachments/assets/45ee5cea-88a7-4ef0-be4d-1572920394d5" />
<img width="387" height="840" alt="스크린샷 2026-02-27 오후 1 18 26" src="https://github.com/user-attachments/assets/01269267-c7ee-4b05-a38c-6d8e99342ff0" />
<img width="387" height="843" alt="스크린샷 2026-02-14 오후 9 22 34" src="https://github.com/user-attachments/assets/aed567fa-5260-4567-94a3-016eda797c4a" />
<img width="387" height="843" alt="스크린샷 2026-02-11 오후 5 23 22" src="https://github.com/user-attachments/assets/8f3e9b5b-b45b-4a8a-a3fb-cd80a6015bd9" />
<img width="390" height="843" alt="스크린샷 2026-02-07 오후 7 06 58" src="https://github.com/user-attachments/assets/07f3e268-97fd-4cdc-82d2-f2b28f7eba26" />
<img width="390" height="843" alt="스크린샷 2026-02-07 오후 7 06 52" src="https://github.com/user-attachments/assets/2793f8fc-3b8c-402e-a15b-84cf79de6394" />
<img width="390" height="843" alt="메인화면" src="https://github.com/user-attachments/assets/07a87c8a-07d4-4f14-b767-efe0e2bfd064" />
