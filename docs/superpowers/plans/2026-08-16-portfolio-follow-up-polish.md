# 포트폴리오 후속 시각 보정 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사용자 피드백에 따라 콘텐츠를 정리하고, 오버레이 기본 상태와 90년대 한국 가정용 CRT 외형을 보정한다.

**Architecture:** 기존 정적 HTML, CSS, 브라우저 ES module 구조를 유지한다. 콘텐츠·기본 상태는 HTML 회귀 테스트로 보호하고, TV 형상은 순수 프로필 모듈과 Three.js scene을 분리해 수치와 배치를 독립 검증한다.

**Tech Stack:** HTML5, CSS, vanilla JavaScript ES modules, Three.js 0.180.0, Node.js built-in test runner, Podman Compose, nginx

## Global Constraints

- 기술 섹션을 완전히 제거한다.
- 연락처의 위치 정보 대신 `이메일` 라벨을 사용한다.
- Contact Me는 기본 확장 상태이며 접기와 다시 펼치기를 유지한다.
- Contact Me와 하단 연락처에 Instagram `https://www.instagram.com/0tag2/` 및 LinkedIn `https://www.linkedin.com/in/0tag2/`을 추가한다.
- 세 번째 순택이 오버레이는 본문 열을 가리지 않도록 왼쪽 화면 가장자리에 둔다.
- 경력 기간은 검정색이며 기존보다 큰 글씨로 표시한다.
- TV는 은회색 사각 본체, 볼록한 대형 화면, 하단 버튼, 전원 버튼, 측면 스피커를 사용한다.
- TV에서 안테나, 다리, 상단 다이얼을 제거한다.
- GitHub Pages 정적 호스팅과 localhost:2345 Compose 개발 서버를 모두 유지한다.

---

### Task 1: 콘텐츠와 Contact Me 기본 상태 수정

**Files:**
- Modify: `index.html`
- Modify: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: 기존 `[data-contact-card]`, `#contact-panel`, `#stack`, `footer address`
- Produces: 기본 확장 Contact Me, 이메일·Instagram·LinkedIn 연락처, 기술 섹션이 없는 문서

- [ ] **Step 1: 실패하는 콘텐츠 테스트 수정**

```js
test("기술 섹션을 표시하지 않는다", () => {
  assert.doesNotMatch(html, /id="stack"/);
  assert.doesNotMatch(html, />기술<\/h2>/);
});

test("연락처는 이메일 라벨과 소셜 링크를 제공한다", () => {
  assert.match(html, /<address>[\s\S]*?<span>이메일<\/span>/);
  assert.match(html, /https:\/\/www\.instagram\.com\/0tag2\//);
  assert.match(html, /https:\/\/www\.linkedin\.com\/in\/0tag2\//);
  assert.doesNotMatch(html, /<span>서울<\/span>/);
});

test("Contact Me는 기본 확장 상태이며 다시 접을 수 있다", () => {
  assert.match(html, /aria-controls="contact-panel"[\s\S]*?aria-expanded="true"/);
  assert.match(html, /id="contact-panel" class="contact-card__panel">/);
  assert.doesNotMatch(html, /id="contact-panel"[^>]*hidden/);
});
```

- [ ] **Step 2: 테스트가 기존 콘텐츠와 기본 접힘 상태 때문에 실패하는지 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: 기술 섹션, `서울`, `aria-expanded="false"`, 누락된 소셜 링크 때문에 FAIL.

- [ ] **Step 3: HTML을 최소 수정**

`#stack` section을 삭제한다. footer address와 Contact Me panel은 다음 실제 값으로 바꾼다.

```html
<address>
  <span>이메일</span>
  <div class="contact-links">
    <a href="mailto:0tak2.code@gmail.com">0tak2.code@gmail.com</a>
    <a href="https://www.instagram.com/0tag2/" target="_blank" rel="noopener noreferrer">Instagram</a>
    <a href="https://www.linkedin.com/in/0tag2/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
  </div>
</address>
```

Contact Me button은 `aria-expanded="true"`로 바꾸고 `#contact-panel`의 `hidden` 속성을 제거한다. 패널에도 동일한 세 링크를 넣는다. 기존 `contact-card.js`의 토글 로직은 `aria-expanded`과 `hidden` 현재 상태를 읽으므로 변경하지 않는다.

- [ ] **Step 4: 콘텐츠 테스트 통과 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: 모든 site content tests PASS.

- [ ] **Step 5: 콘텐츠 커밋**

```bash
git add index.html tests/site-content.test.mjs
git commit -m "feat: 연락처와 콘텐츠 기본 상태 보정" -m "기술 섹션을 제거하고 이메일·Instagram·LinkedIn 연락처를 추가했습니다.
Contact Me를 기본 확장 상태로 변경했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 2: 기간 타이포그래피와 순택이 위치 보정

**Files:**
- Modify: `styles.css`
- Modify: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: `.experience time`, `.pet-card[data-pet="3"]`, `.contact-links`
- Produces: 검정색 0.95rem 기간, 왼쪽 가장자리의 세 번째 오버레이, 세로 연락처 링크

- [ ] **Step 1: 스타일 계약 테스트 추가**

```js
test("경력 기간과 세 번째 순택이 창의 보정 스타일을 제공한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(css, /\.experience time\s*{[\s\S]*?color:\s*var\(--ink\)/);
  assert.match(css, /\.experience time\s*{[\s\S]*?font-size:\s*0\.95rem/);
  assert.match(css, /\.pet-card\[data-pet="3"\]\s*{[\s\S]*?left:\s*0\.5rem/);
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: 기간이 muted 0.78rem이고 세 번째 창이 본문 쪽에 있어 FAIL.

- [ ] **Step 3: CSS 수정**

```css
.experience time { color: var(--ink); font-size: 0.95rem; }
.pet-card[data-pet="3"] { left: 0.5rem; bottom: 1.25rem; }
.contact-links { display: flex; flex-wrap: wrap; gap: 0.65rem 1.5rem; }
.contact-card__panel { display: grid; gap: 0.65rem; }
```

모바일의 세 번째 창도 `left: 0.5rem`을 유지한다.

- [ ] **Step 4: 전체 콘텐츠·스타일 테스트 통과 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: all site content tests PASS.

- [ ] **Step 5: 스타일 커밋**

```bash
git add styles.css tests/site-content.test.mjs
git commit -m "fix: 기간과 오버레이 배치 보정" -m "경력 기간을 더 크고 검게 표시하고 세 번째 순택이 창을 화면 가장자리로 옮겼습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 3: 90년대 한국 가정용 CRT 모델로 교체

**Files:**
- Create: `scripts/tv-profile.js`
- Create: `tests/tv-profile.test.mjs`
- Modify: `scripts/tv-scene.js`
- Modify: `styles.css`

**Interfaces:**
- Produces: `TV_PROFILE`, `getBottomButtonPositions(count, spacing)` from `scripts/tv-profile.js`
- Consumes: `TV_PROFILE` in `scripts/tv-scene.js` for body, screen, buttons, power button, side speaker

- [ ] **Step 1: TV 프로필과 버튼 배치의 실패 테스트 작성**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { TV_PROFILE, getBottomButtonPositions } from "../scripts/tv-profile.js";

test("90년대 한국 CRT 형상을 정의한다", () => {
  assert.equal(TV_PROFILE.bodyColor, 0xb9bab6);
  assert.equal(TV_PROFILE.buttonCount, 6);
  assert.equal(TV_PROFILE.hasSideSpeaker, true);
  assert.equal(TV_PROFILE.hasAntenna, false);
  assert.equal(TV_PROFILE.hasLegs, false);
  assert.equal(TV_PROFILE.hasTopDials, false);
});

test("하단 버튼을 화면 중심 아래에 균등 배치한다", () => {
  assert.deepEqual(getBottomButtonPositions(4, 0.28), [-0.42, -0.14, 0.14, 0.42]);
});
```

- [ ] **Step 2: 모듈이 없어 테스트가 실패하는지 확인**

Run: `node --test tests/tv-profile.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: 순수 프로필 모듈 구현**

```js
export const TV_PROFILE = Object.freeze({
  bodyColor: 0xb9bab6,
  bodyWidth: 4.35,
  bodyHeight: 3.25,
  bodyDepth: 1.75,
  screenWidth: 3.48,
  screenHeight: 2.25,
  buttonCount: 6,
  hasSideSpeaker: true,
  hasAntenna: false,
  hasLegs: false,
  hasTopDials: false,
});

export function getBottomButtonPositions(count, spacing) {
  const start = -((count - 1) * spacing) / 2;
  return Array.from({ length: count }, (_, index) => Number((start + index * spacing).toFixed(2)));
}
```

- [ ] **Step 4: 프로필 테스트 통과 확인**

Run: `node --test tests/tv-profile.test.mjs`

Expected: 2 tests PASS.

- [ ] **Step 5: Three.js 모델과 정적 대체 TV를 같은 형태로 변경**

`createTvModel()`은 `TV_PROFILE`을 import한다. 기존 다이얼, 다리, 안테나 생성 블록을 삭제하고 다음 요소를 만든다.

- 은회색 extruded rounded rectangle body
- 폭 3.48, 높이 2.25의 볼록한 screen을 본체 상단에 배치
- `getBottomButtonPositions(6, 0.28)` 위치의 작은 원형 하단 버튼
- 버튼 열 오른쪽의 큰 전원 버튼
- 오른쪽 측면의 원형 speaker와 concentric ring 4개

CSS `.tv-fallback`도 은회색 사각 본체, 큰 화면, 하단 버튼 열로 바꾸고 다리 pseudo-element를 제거한다.

- [ ] **Step 6: 자동 검증**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS.

Run: `for file in scripts/*.js; do node --check "$file" || exit 1; done`

Expected: exit 0 with no output.

- [ ] **Step 7: TV 모델 커밋**

```bash
git add scripts/tv-profile.js scripts/tv-scene.js styles.css tests/tv-profile.test.mjs
git commit -m "feat: 브라운관을 90년대 한국 TV 형태로 변경" -m "은회색 사각 본체, 볼록한 화면, 하단 버튼과 측면 스피커를 적용했습니다.
기존 안테나와 다리, 상단 다이얼을 제거했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 4: 개발 서버 갱신과 최종 검증

**Files:**
- No source changes expected

**Interfaces:**
- Consumes: Tasks 1–3의 완성 정적 사이트와 기존 `compose.yaml`
- Produces: localhost:2345에서 확인 가능한 후속 수정 결과

- [ ] **Step 1: 전체 테스트와 작업 트리 검사**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS, 0 failures.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 2: Compose 서버 재생성**

Run: `podman compose up -d --force-recreate`

Expected: portfolio container is recreated and running.

- [ ] **Step 3: HTTP 응답과 주요 콘텐츠 확인**

Run: `curl --fail --silent http://127.0.0.1:2345/`

Expected: HTML contains `이메일`, `Instagram`, `LinkedIn`, three `data-pet-overlay` elements, and no `id="stack"`.

- [ ] **Step 4: 브라우저 확인**

Run: `open http://localhost:2345`

Expected: Contact Me가 열린 상태이고, 세 번째 순택이 창이 본문을 가리지 않으며, 은회색 90년대 CRT가 첫 화면에 표시된다.
