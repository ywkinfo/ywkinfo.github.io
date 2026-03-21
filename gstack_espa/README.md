# Hola Diario

모바일 우선으로 만든 스페인어 단어 학습 웹앱 MVP입니다. 사용자가 직접 단어를 추가하고, 브라우저 로컬 저장소에 진도와 복습 상태를 유지하면서 간단한 SRS 플래시카드 루프를 반복할 수 있습니다.

## Current MVP

- 수동 입력 기반 단어 추가와 수정
- `IndexedDB` 로컬 저장
- `again / good / easy` 3단계 평점 기반 단순 SRS 스케줄러
- 오늘 due 카드 복습 세션
- 세션 요약과 기본 학습 통계
- JSON 백업 내보내기
- 새로고침 후 진행 중 세션 복원

비목표:

- 로그인과 클라우드 동기화
- AI 단어 생성
- CSV import
- 음성/TTS
- 게임화, 소셜 기능

## Tech Stack

- `Vite`
- `React 19`
- `TypeScript`
- `react-router-dom`
- `idb`
- `Vitest` + Testing Library

## Quick Start

```bash
npm install
npm run dev
```

기본 검증 명령:

```bash
npm run lint
npm run test
npm run build
```

## Routes

- `/` 홈 대시보드와 온보딩
- `/add` 단어 추가 및 수정
- `/deck` 내 단어장
- `/review` 오늘의 복습 세션
- `/summary` 마지막 세션 요약
- `/settings` 로컬 저장 안내와 JSON 내보내기

## Project Structure

- `src/context/StudyContext.tsx`: 앱 상태, 세션, 저장소 연동
- `src/lib/storage.ts`: `IndexedDB` repository 구현
- `src/lib/srs.ts`: 단순 복습 간격 계산
- `src/pages/*`: 주요 화면
- `src/test/setup.ts`: 테스트 환경 초기화

## Product Notes

- 학습 방향은 `스페인어 -> 한국어` 이해 중심입니다.
- 새 카드의 `again`은 10분 뒤 다시 due 상태가 됩니다.
- 첫 `good`은 1일, 첫 `easy`는 7일 뒤로 넘깁니다.
- 모든 학습 데이터는 현재 브라우저에만 저장됩니다.

## Repo Workflow Notes

이 저장소는 앱 코드와 함께 Codex workflow 스킬 파일도 포함합니다.

- `AGENTS.md`: 항상 적용되는 저장소 규칙
- `.codex/skills/office-hours`: 문제 재정의
- `.codex/skills/plan-product-review`: 제품 범위 검토
- `.codex/skills/plan-eng-review`: 구현 계획 검토
- `.codex/skills/review`: 구현 후 코드 리뷰
- `.codex/skills/qa`: QA와 회귀 점검
- `.codex/skills/ship`: 릴리스 준비 검토
- `.codex/skills/document-release`: 문서 동기화

Codex가 repo-local skills를 자동 인식하게 하려면:

```bash
./scripts/codex-local
```

또는:

```bash
CODEX_HOME="$PWD/.codex" codex
```
