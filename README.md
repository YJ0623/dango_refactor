Dango
>신촌 SW 창업경진대회 출품작, 지류 스탬프 적립 웹 애플리케이션 'Dango'입니다.
>1차 제작의 깃허브 링크는 다음과 같습니다. https://github.com/MutsaDemoDay/FrontEnd

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
- 회원은 유저 회원과 점주 회원으로 구분됩니다. 유저 회원은 스탬프를 적립하는 회원, 점주 회원은 스탬프를 적립해주는 회원입니다. 회원가입은 카카오 혹은 일반 회원가입으로 진행됩니다.
- 유저 회원은 점주 회원이 등록한 가게를 찾고, 해당 가게의 스탬프 판을 본인의 스탬프 지갑에 등록할 수 있습니다. 등록된 스탬프 판의 스탬프는 QR코드 혹은 아이디를 이용하여 적립 가능합니다.
- 점주 회원은 대시보드에서 본인 가게의 스탬프 현황을 일간/주간/월간 타임스탬프로 조회할 수 있고, 누적 적립 횟수를 대시보드 내의 그래프로 이동하여 가시화된 데이터를 제공받습니다.
- 유저, 점주 회원 모두 마이페이지에서 주소나 프로필 등을 수정하여 노출되는 정보를 수정할 수 있습니다.

### -유저의 대략적 플로우-
<img width="390" height="843" alt="메인화면" src="https://github.com/user-attachments/assets/6230fbb1-d849-4723-98da-7ba804a9dc31" />
<img width="387" height="843" alt="스크린샷 2026-02-11 오전 10 40 24" src="https://github.com/user-attachments/assets/546e8ecc-d33a-4bb6-925b-6f9268efe95d" />
<img width="387" height="843" alt="스탬프화면 메인" src="https://github.com/user-attachments/assets/23443373-2ab4-4983-b1cb-ac7dfe3926bf" />
<img width="387" height="843" alt="지도 메인" src="https://github.com/user-attachments/assets/2d16b2b9-f772-4c55-a459-71deb48f70d8" />
<img width="387" height="843" alt="유저프로필 메인" src="https://github.com/user-attachments/assets/2922d5e7-e3c9-4b7f-9d1c-83d223c88b12" />

### -점주의 대략적 플로우-
<img width="387" height="840" alt="매장프로필 설정" src="https://github.com/user-attachments/assets/ae2298b4-fc88-43bd-a778-4a36eaffdb99" />
<img width="387" height="840" alt="점주 대시보드" src="https://github.com/user-attachments/assets/81c32b57-c6fe-4817-93cd-f2170f3fc0f5" />
<img width="387" height="840" alt="점주 qr" src="https://github.com/user-attachments/assets/a443e20b-8e31-4bc1-b4d9-fedcd2678631" />
