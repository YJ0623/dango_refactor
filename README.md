Dango — 소상공인 카페 스탬프 적립 서비스

지갑에 쌓이던 종이 스탬프 카드를 모바일 웹으로 옮겨, 카페 재방문을 유도하는 서비스입니다. 신촌 SW 창업경진대회 출품작 (2025.10 ~ 2026.02)

<p> <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Zustand-4B3B2A?style=flat-square" /> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" /> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/AWS_S3-569A31?style=flat-square&logo=amazons3&logoColor=white" /> </p>

배포: https://dango-wine.vercel.app 
1차 개발 저장소: https://github.com/MutsaDemoDay/FrontEnd
Figma: https://www.figma.com/design/8SRYLupxiDZ27AIssh2RLR/%EB%8D%B0%EB%AA%A8%EB%8D%B0%EC%9D%B4?node-id=0-1&p=f&t=CGsIqkd0K8lshF4a-0

서비스 운영 종료 운영 비용 문제로 백엔드 인프라를 중단하여, 현재 배포본에서는 데이터 연동이 동작하지 않습니다. UI와 라우팅 구조는 그대로 확인하실 수 있습니다.

<br>
프로젝트 배경

기존에 지갑에 넣고 다니던 카페의 지류 스탬프(종이 스탬프판)들이 지갑에 꽉 차서, 더이상 다른 카페의 스탬프를 갖고 다닐 수 없었습니다. 또한, 지류 스탬프를 웹으로 옮겨 특히 자영업 카페의 재방문율을 높일 수 있게 하고자 해당 서비스를 기획했습니다.

<img width="300" alt="Dango 서비스 소개" src="https://github.com/user-attachments/assets/a41f1a3e-2094-458f-a302-a5ef38afe565" /> <br>
개발 단계와 역할
단계	기간	팀 구성	담당
1차	2025.10 ~ 2025.12	5인 (기획·디자인 1 / BE 2 / FE 2)	프론트엔드 2인 중 1인, 전체 42개 화면 중 30개 구현
2차	2026.01 ~ 2026.02	1인	아키텍처 전환, 인프라 구성, 배포 및 현장 검증

1차 개발에서는 기획 단계부터 참여해 파이프라인 설계와 백엔드·디자이너 대상 선제 제안, Vercel 배포와 도메인 연결까지 담당했습니다. 대회 출품 이후 팀이 해산한 뒤에는 혼자 서비스 운영 단계까지 이어갔습니다.

<br>
핵심 엔지니어링
1. SPA → SSR 전면 마이그레이션 (2차, 1인)

스탬프 적립 서비스는 링크 공유와 QR 스캔으로 진입하는 비중이 높아, 사용자 대부분이 콜드 스타트 상태였습니다. SPA 구조에서는 번들을 내려받고 실행한 뒤에야 첫 화면이 그려지므로 체감 지연이 그대로 이탈로 이어졌습니다.

Next.js App Router 기반 SSR로 전환 — 서버에서 초기 HTML을 내려 첫 화면 도달 시점을 단축
서버/클라이언트 컴포넌트 분리 — 상호작용이 필요한 영역만 클라이언트로 내려 번들 크기 축소
스트리밍 렌더링 — 데이터 의존 구간을 분리해 나머지 UI를 먼저 노출
스켈레톤 UI 도입 — 로딩 중 레이아웃 이동으로 발생하던 오터치 차단

측정 결과

대상	지표	결과
스탬프 화면	Lighthouse Performance	76 → 86
랜딩 화면	LCP	1.2s
랜딩 화면	CLS	0

2. 프론트엔드 범위를 넘어선 인프라 구성 (2차, 1인)

1인 개발 전환 이후 백엔드 인력이 없는 상태에서 기능 개선을 이어가야 했습니다. 프론트엔드 영역에 한계를 두지 않고 필요한 만큼 최대한 LLM을 활용하여 서비스 유지보수를 진행했습니다.

AWS S3 — 가게·프로필 이미지 업로드 아키텍처 구성
PostgreSQL — 기획 의도에 맞게 스키마 수정
Spring Boot — 변경된 스키마에 맞춰 기존 API 코드 수정

LLM은 처음 다루는 영역을 빠르게 익히는 수단으로 사용했고, 무엇을 어떻게 바꿀지에 대한 판단은 직접 내렸습니다.

3. 모바일 웹 반응형 재설계

모바일 해상도에서 레이아웃이 깨지는 구간을 발견해, CSS Flexbox·Grid 구조를 전면 재설계했습니다. WebView와 모바일 브라우저 환경에서 동일하게 동작하도록 크로스 브라우징을 함께 검증했습니다.

<br>
주요 기능
위치 기반 가게 탐색
Kakao Map API 연동으로 실시간 위치 기반 제휴 카페 마커 렌더링
마커 선택 시 가게 상세 정보를 모달·바텀시트로 동적 렌더링
오프라인 ↔ 온라인 스탬프 파이프라인
화면에 QR 코드를 생성하고 스캐너와 연동해, 오프라인 방문이 웹 애플리케이션의 스탬프 적립으로 실시간 반영
외부 라이브러리 없는 데이터 시각화
Chart.js 등 외부 차트 라이브러리 없이 DOM 제어와 CSS만으로 점주 대시보드의 적립 현황 시각화
번들 크기를 늘리지 않고 렌더링 성능 확보
인증 / 인가
OAuth 2.0 기반 카카오 소셜 로그인, JWT 토큰 관리로 로그인·로그아웃 흐름 구성
<br>
사용자 흐름

회원은 유저(적립하는 쪽)와 점주(적립해주는 쪽)로 구분됩니다.

유저 — 점주가 등록한 가게를 탐색해 스탬프 판을 지갑에 담고, QR 코드 또는 아이디로 적립합니다. 점주 — 대시보드에서 일간·주간·월간 적립 현황과 누적 적립 그래프를 확인합니다.

가입은 카카오 소셜 로그인 또는 일반 회원가입으로 진행되며, 두 회원 유형 모두 마이페이지에서 주소·프로필 등 노출 정보를 수정할 수 있습니다.

유저 흐름 — 가게 탐색 → 스탬프 판 등록 → QR 적립 → 프로필 관리

<p> <img width="240" alt="메인화면" src="https://github.com/user-attachments/assets/6230fbb1-d849-4723-98da-7ba804a9dc31" /> <img width="240" alt="가게 목록" src="https://github.com/user-attachments/assets/546e8ecc-d33a-4bb6-925b-6f9268efe95d" /> <img width="240" alt="스탬프 화면" src="https://github.com/user-attachments/assets/23443373-2ab4-4983-b1cb-ac7dfe3926bf" /> <img width="240" alt="지도 화면" src="https://github.com/user-attachments/assets/2d16b2b9-f772-4c55-a459-71deb48f70d8" /> <img width="240" alt="유저 프로필" src="https://github.com/user-attachments/assets/2922d5e7-e3c9-4b7f-9d1c-83d223c88b12" /> </p>

점주 흐름 — 매장 프로필 설정 → 대시보드에서 적립 현황 확인 → QR 코드로 적립

<p> <img width="240" alt="매장 프로필 설정" src="https://github.com/user-attachments/assets/ae2298b4-fc88-43bd-a778-4a36eaffdb99" /> <img width="240" alt="점주 대시보드" src="https://github.com/user-attachments/assets/81c32b57-c6fe-4817-93cd-f2170f3fc0f5" /> <img width="240" alt="점주 QR" src="https://github.com/user-attachments/assets/a443e20b-8e31-4bc1-b4d9-fedcd2678631" /> </p> <br>
회고

배포 이후 학교 주변 카페 5곳의 사장님을 직접 찾아가 도입을 제안했으나, 한 곳도 성사되지 않았습니다. 다섯 분 모두 같은 이유를 말씀하셨습니다. 바쁜 시간에 손님의 화면을 확인하는 것 자체가 결제 응대에 부담을 더한다는 것이었습니다.

문제는 앱의 완성도가 아니었습니다. 소상공인 대상 서비스는 새로운 프로세스를 만드는 것이 아니라 기존 프로세스의 편의성을 높이는 방향이어야 채택된다는 것을 확인했습니다.

페인포인트를 정확히 정의하지 못하면 그 위에 만든 기능은 완결된 제품이 되지 못합니다. 이 경험 이후로는 개발에 착수하기 전에 무엇을 만드는지, 그것이 누구의 어떤 부담을 줄이는지를 먼저 정의하게 되었습니다.
