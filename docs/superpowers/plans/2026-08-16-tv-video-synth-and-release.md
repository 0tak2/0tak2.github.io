# TV Video Synth and Safe Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 검은 CRT 중앙 화면에 백남준 영감의 비디오 신시사이징 모션을 추가하고 이름·교육 콘텐츠를 보정한 뒤, 기존 최종 리뷰 문제와 GPS 노출을 해결해 안전한 PR을 만든다.

**Architecture:** 시간 기반 화면 파라미터는 새 순수 모듈 `tv-screen-motion.js`에서 계산하고, CanvasTexture 그리기와 Three.js 수명주기는 `tv-scene.js`가 담당한다. 이름·대체 TV·모바일 레이아웃은 기존 HTML/CSS 패턴을 유지하며, 오버레이 키보드 이동은 기존 위치 계산 모듈에 작은 순수 헬퍼를 추가한다. JPEG 위치정보는 외부 도구에 의존하지 않는 파서 테스트로 차단하고, 최종 트리 검증 후 기능 브랜치의 공개될 커밋 기록도 GPS가 없는 이미지로 재작성한다.

**Tech Stack:** HTML5, SUIT CSS, Canvas 2D, Three.js 0.180.0, vanilla ES modules, Node.js built-in test runner, ExifTool, Git, GitHub CLI, Podman Compose, nginx

## Global Constraints

- TV는 제목 오른쪽의 현재 두 열 레이아웃에 남는다.
- TV 본체는 `#0b0b0b`/`0x0b0b0b` 계열의 무광 검정이며 순수 검정 `#000000`은 사용하지 않는다.
- 유리 화면의 가로 중심은 본체의 기하학적 중심 `x = 0`이다.
- 90년대 한국 CRT의 낮고 두꺼운 사각 실루엣, 하단 버튼과 측면 스피커를 유지하며 안테나·다리·상단 다이얼은 추가하지 않는다.
- 비디오 신시사이징은 마젠타·시안·옐로·블루 컬러 필드, 피드백 잔상, 약한 RGB 글리치, 주사선과 노이즈를 포함한다.
- 기존 코드는 컬러 모션 위에 남으며 완전한 가독성보다 코드의 존재 인식을 우선한다.
- 화면 프레임 간격은 최소 `33ms`이고, 화면 밖과 모션 감소 환경에서는 연속 갱신하지 않는다.
- `임영택`과 `YOUNGTAEK LIM`은 같은 행에서 높이 중앙을 맞춘다.
- `.hero__name`은 `align-items: center`와 `margin-left: -0.04em`, 영문 이름은 `margin-left: 0.65rem`과 `transform: none`을 사용한다.
- Apple Developer Academy 기술 목록은 `SwiftUI, Swift Data, ARKit, RealityKit, AVFoundation`이다.
- 세 JPEG에서는 GPS/위치정보만 제거하고 카메라 모델, 촬영 시각과 다른 비위치 EXIF를 보존한다. 이미지를 재압축·리사이즈·색상 보정하지 않는다.
- 기존 배경 `#fefefe`, 허용 글자 굵기 `300`/`400`/`500`/`700`, Contact Me 너비 `15rem`, 링크와 콘텐츠를 유지한다.
- 정적 GitHub Pages 구조와 빌드 도구 없는 브라우저 ES module 구성을 유지한다.

---

### Task 1: 이름 정렬과 교육 콘텐츠 보정

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: `.hero__name`, `.hero__name span`, Apple Developer Academy의 기존 목록
- Produces: 같은 행의 한국어·영문 이름과 AVFoundation을 포함한 교육 콘텐츠

- [ ] **Step 1: 실패하는 콘텐츠·CSS 계약 테스트 작성**

```js
test("영문 이름을 한국어 이름 오른쪽에 높이 중앙 정렬한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const nameRule = css.match(/\.hero__name\s*\{[\s\S]*?\}/)?.[0] ?? "";
  const englishRule = css.match(/\.hero__name span\s*\{[\s\S]*?\}/)?.[0] ?? "";

  assert.match(nameRule, /flex-direction:\s*row/);
  assert.match(nameRule, /align-items:\s*center/);
  assert.match(nameRule, /margin-left:\s*-0\.04em/);
  assert.match(englishRule, /margin-left:\s*0\.65rem/);
  assert.match(englishRule, /transform:\s*none/);
  assert.match(html, /SwiftUI, Swift Data, ARKit, RealityKit, AVFoundation/);
});
```

- [ ] **Step 2: RED 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: 기존 세로 이름 구조와 AVFoundation 누락 때문에 FAIL

- [ ] **Step 3: 이름 배치와 교육 문구 수정**

```css
.hero__name {
  flex-direction: row;
  align-items: center;
  margin-left: -0.04em;
}

.hero__name span {
  margin-left: 0.65rem;
  transform: none;
}
```

`index.html`의 기술 목록 한 줄을 다음 값으로 바꾼다.

```html
<li>SwiftUI, Swift Data, ARKit, RealityKit, AVFoundation</li>
```

- [ ] **Step 4: GREEN과 전체 회귀 확인**

Run: `node --test tests/site-content.test.mjs && node --test tests/*.test.mjs && git diff --check`

Expected: 모든 테스트 PASS, diff whitespace 오류 없음

- [ ] **Step 5: 커밋**

```bash
git add -- index.html styles.css tests/site-content.test.mjs
git commit -m "style: 이름 정렬과 교육 기술 목록 보정" -m "영문 이름을 한국어 이름 오른쪽 위에 배치하고 글리프 시작선을 보정했습니다.
Apple Developer Academy 기술 목록에 AVFoundation을 추가했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 2: 비디오 신시사이징 프레임 계산

**Files:**
- Create: `scripts/tv-screen-motion.js`
- Create: `tests/tv-screen-motion.test.mjs`

**Interfaces:**
- Produces: `VIDEO_SYNTH_COLORS: readonly string[]`
- Produces: `getVideoSynthFrame(elapsedMs: number): { fields, feedbackScale, glitch, scanlineOffset }`
- Produces: `shouldRenderScreenFrame({ elapsedMs, lastFrameMs, reducedMotion, hasRendered }): boolean`

- [ ] **Step 1: 순수 계산 실패 테스트 작성**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { VIDEO_SYNTH_COLORS, getVideoSynthFrame, shouldRenderScreenFrame } from "../scripts/tv-screen-motion.js";

test("비디오 신시사이징 프레임은 결정적이고 값 범위를 지킨다", () => {
  assert.deepEqual(VIDEO_SYNTH_COLORS, ["#ff2fb3", "#16e7ff", "#ffe94a", "#4937ff"]);
  assert.deepEqual(getVideoSynthFrame(1234), getVideoSynthFrame(1234));
  const frame = getVideoSynthFrame(987654);
  assert.equal(frame.fields.length, 4);
  for (const field of frame.fields) {
    assert.ok(field.x >= 0 && field.x <= 1);
    assert.ok(field.y >= 0 && field.y <= 1);
    assert.ok(field.radius >= 0.2 && field.radius <= 0.75);
  }
  assert.ok(frame.feedbackScale >= 0.96 && frame.feedbackScale <= 1.02);
  assert.ok(frame.glitch >= 0 && frame.glitch <= 1);
});

test("화면 프레임은 33ms 간격과 모션 감소를 지킨다", () => {
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 32, lastFrameMs: 0, reducedMotion: false, hasRendered: true }), false);
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 33, lastFrameMs: 0, reducedMotion: false, hasRendered: true }), true);
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 100, lastFrameMs: 0, reducedMotion: true, hasRendered: true }), false);
  assert.equal(shouldRenderScreenFrame({ elapsedMs: 0, lastFrameMs: 0, reducedMotion: true, hasRendered: false }), true);
});
```

- [ ] **Step 2: RED 확인**

Run: `node --test tests/tv-screen-motion.test.mjs`

Expected: `scripts/tv-screen-motion.js`가 없어 FAIL

- [ ] **Step 3: 순수 모션 모듈 구현**

`elapsedMs / 1000`을 시간값으로 사용하고 `Math.sin`/`Math.cos`로 네 필드의 `x`, `y`, `radius`를 계산한다. 반환값은 테스트 범위를 만족하도록 중심과 진폭을 고정하고 `Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0`으로 입력을 정규화한다. `shouldRenderScreenFrame`은 첫 프레임은 항상 허용하고, 모션 감소에서 두 번째 프레임부터 거부하며, 일반 모드에서는 `elapsedMs - lastFrameMs >= 33`일 때만 허용한다.

- [ ] **Step 4: GREEN 확인**

Run: `node --test tests/tv-screen-motion.test.mjs && node --check scripts/tv-screen-motion.js && git diff --check`

Expected: 2 tests PASS, 문법 및 diff 검사 통과

- [ ] **Step 5: 커밋**

```bash
git add -- scripts/tv-screen-motion.js tests/tv-screen-motion.test.mjs
git commit -m "feat: TV 비디오 신시사이징 모션 계산 추가" -m "시간 기반 컬러 필드와 피드백, 글리치 파라미터를 결정적으로 계산합니다.
33ms 프레임 제한과 모션 감소 동작을 테스트합니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 3: 검은 CRT와 동적 CanvasTexture 통합

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `scripts/tv-profile.js`
- Modify: `scripts/tv-scene.js`
- Modify: `tests/tv-profile.test.mjs`
- Modify: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: `getVideoSynthFrame(elapsedMs)`와 `shouldRenderScreenFrame(options)`
- Produces: `createTvScene(container, { reducedMotion })`의 기존 `update`, `resize`, `setActive`, `destroy` 계약을 유지하는 애니메이션 화면

- [ ] **Step 1: 검은 본체·중앙 화면·대체 화면 계약의 실패 테스트 작성**

```js
test("검은 CRT 본체와 중앙 유리 화면 프로필을 사용한다", () => {
  assert.equal(TV_PROFILE.bodyColor, 0x0b0b0b);
  assert.equal(TV_PROFILE.screenCenterX, 0);
});

test("정적 대체 TV도 비디오 신시사이징 화면을 제공한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(css, /@keyframes\s+video-synth-shift/);
  assert.match(css, /\.tv-fallback[\s\S]*background:\s*#0b0b0b/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*\.tv-fallback__screen/);
  assert.match(html, /코드와 컬러 영상이 표시되는 3D 브라운관 TV/);
});
```

- [ ] **Step 2: RED 확인**

Run: `node --test tests/tv-profile.test.mjs tests/site-content.test.mjs`

Expected: 기존 실버 본체, 누락된 중앙값과 CSS 애니메이션 때문에 FAIL

- [ ] **Step 3: 프로필과 3D 화면 중앙 정렬**

`TV_PROFILE`에 `bodyColor: 0x0b0b0b`, `screenCenterX: 0`을 지정한다. `tv-scene.js`의 bezel과 screen `position.x`를 모두 `TV_PROFILE.screenCenterX`로 변경하고 나머지 본체 실루엣, 버튼, 스피커, 카메라 거리를 유지한다.

- [ ] **Step 4: 동적 CanvasTexture 구현**

`createScreenMaterial({ reducedMotion })`이 `{ material, update, dispose }`를 반환하게 바꾼다. `update(elapsedMs)`는 Task 2의 프레임 파라미터로 다음 순서대로 그린다.

```js
context.globalCompositeOperation = "source-over"; // 어두운 반투명 이전 프레임
context.globalCompositeOperation = "screen";      // 네 radial gradient 컬러 필드
context.globalCompositeOperation = "source-over"; // RGB 흔들림, 코드, 주사선, 노이즈
texture.needsUpdate = true;
```

장면 내부 RAF는 `active`일 때만 실행하고 `shouldRenderScreenFrame`이 true인 프레임에만 texture와 renderer를 갱신한다. `setActive(false)`는 RAF를 취소하고, `setActive(true)`는 다시 시작한다. `destroy()`는 RAF와 texture를 정리한다. 모션 감소는 한 프레임만 그린다.

- [ ] **Step 5: CSS 대체 화면과 접근 가능한 설명 수정**

대체 본체를 `#0b0b0b`로 바꾸고 유리 영역의 좌우 inset을 같은 값으로 지정해 3D 화면처럼 가로 중앙에 맞춘다. 화면 배경에는 네 색상의 radial-gradient를 겹친다. `@keyframes video-synth-shift`로 `background-position`과 `filter: hue-rotate()`를 움직이고, 모션 감소 media query에서 `animation: none`을 명시한다. 기존 실버 폴백 스타일은 남기지 않는다. `index.html`의 TV 설명은 `코드와 컬러 영상이 표시되는 3D 브라운관 TV`로 바꾼다.

- [ ] **Step 6: 통합 검증**

Run: `node --test tests/tv-screen-motion.test.mjs tests/tv-profile.test.mjs tests/site-content.test.mjs && node --check scripts/tv-scene.js && git diff --check`

Expected: 모든 대상 테스트 PASS, 문법과 diff 검사 통과

- [ ] **Step 7: 커밋**

```bash
git add -- index.html styles.css scripts/tv-profile.js scripts/tv-scene.js tests/tv-profile.test.mjs tests/site-content.test.mjs
git commit -m "feat: 검은 CRT 비디오 신시사이징 화면 구현" -m "CRT 유리 화면을 본체 중앙에 맞추고 검은 본체로 변경했습니다.
코드 뒤에 컬러 필드와 피드백, 글리치가 움직이는 CanvasTexture를 추가했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 4: GPS·모바일·키보드 접근성 최종 수정

**Files:**
- Modify binary: `assets/soontaek-01.jpeg`
- Modify binary: `assets/soontaek-02.jpeg`
- Modify binary: `assets/soontaek-03.jpeg`
- Create: `scripts/jpeg-metadata.js`
- Create: `scripts/page-lifecycle.js`
- Create: `tests/image-metadata.test.mjs`
- Create: `tests/page-lifecycle.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `scripts/contact-card.js`
- Modify: `scripts/main.js`
- Modify: `tests/contact-card.test.mjs`
- Modify: `tests/site-content.test.mjs`

**Interfaces:**
- Produces: `hasLocationMetadata(bytes: Uint8Array): boolean`
- Produces: `getKeyboardDelta(key: string, step?: number): { x: number, y: number } | null`
- Produces: `shouldDestroyOnPageHide(persisted: boolean): boolean`

- [ ] **Step 1: GPS와 비위치 EXIF 보존 실패 테스트 작성**

`hasLocationMetadata`는 JPEG APP1 Exif의 TIFF IFD0에서 `GPSInfoIFDPointer(0x8825)`를 감지하고 XMP의 `GPSLatitude`, `GPSLongitude`, `GPSPosition`, `exif:GPS` 토큰도 감지한다.

```js
for (const name of ["soontaek-01.jpeg", "soontaek-02.jpeg", "soontaek-03.jpeg"]) {
  test(`${name}은 GPS가 없고 비위치 EXIF를 유지한다`, async () => {
    const bytes = await readFile(new URL(`../assets/${name}`, import.meta.url));
    const text = bytes.toString("latin1");
    assert.equal(hasLocationMetadata(bytes), false);
    assert.match(text, /iPhone 14 Pro/);
    assert.match(text, /20\d{2}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}/);
  });
}
```

- [ ] **Step 2: 모바일·키보드·수명주기 실패 테스트 작성**

```js
test("키보드 화살표를 이동량으로 변환한다", () => {
  assert.deepEqual(getKeyboardDelta("ArrowLeft"), { x: -12, y: 0 });
  assert.deepEqual(getKeyboardDelta("ArrowDown", 24), { x: 0, y: 24 });
  assert.equal(getKeyboardDelta("Enter"), null);
});

test("BFCache 진입에서는 TV를 파괴하지 않는다", () => {
  assert.equal(shouldDestroyOnPageHide(true), false);
  assert.equal(shouldDestroyOnPageHide(false), true);
});
```

`site-content.test.mjs`에는 `.pet-overlays`의 모바일 비고정 레이아웃, 짧은 화면의 hero/TV 축소 규칙, `aria-keyshortcuts`, 링크 `min-height: 2.75rem` 계약을 추가한다.

- [ ] **Step 3: RED 확인**

Run: `node --test tests/image-metadata.test.mjs tests/contact-card.test.mjs tests/page-lifecycle.test.mjs tests/site-content.test.mjs`

Expected: GPS 감지, 새 모듈·키보드·모바일 계약 누락 때문에 FAIL

- [ ] **Step 4: GPS만 제거하고 파서 구현**

Run: `exiftool -overwrite_original -gps:all= assets/soontaek-01.jpeg assets/soontaek-02.jpeg assets/soontaek-03.jpeg`

`jpeg-metadata.js`는 JPEG segment 길이를 bounds-check하고 `Exif\0\0` APP1만 TIFF endian에 맞게 읽어 IFD0 tag `0x8825`를 확인한다. APP1 XMP는 위 GPS 토큰을 ASCII/UTF-8 문자열로 검색한다. 잘못된 JPEG나 범위를 벗어난 offset은 위치 메타데이터가 안전하게 제거됐다고 오판하지 않도록 `TypeError`를 던진다.

- [ ] **Step 5: 모바일 오버레이와 hero 수정**

세 figure를 `.pet-overlays` wrapper로 감싸고 DOM 순서를 1, 3, 2로 둔다. 데스크톱에서는 기존 fixed 위치를 유지한다. `<=48rem`에서는 wrapper가 footer 뒤의 일반 flow grid가 되고 pet card는 `position: relative; inset: auto;`가 된다. 첫 pointer/keyboard 이동 시 `placeCard`가 `position: fixed`를 inline으로 설정한 뒤 기존 clamp를 사용한다.

모바일 hero는 `.hero__content`의 세로 padding을 `1.25rem`, 이름의 아래 margin을 `1.25rem`으로 줄이고 TV를 `min-height: clamp(14rem, 32svh, 18rem)`로 제한한다. `max-width: 48rem`이면서 `max-height: 42rem`이면 scroll cue를 숨기고 제목을 `clamp(2rem, 9vw, 2.75rem)`, 설명 위 margin을 `0.75rem`, 설명 line-height를 `1.6`, TV min-height를 `11.5rem`으로 지정한다.

- [ ] **Step 6: 키보드 이동·BFCache·터치 영역 구현**

모든 overlay handle에 `keydown`을 연결한다. Arrow key이면 `getKeyboardDelta`로 현재 rect를 이동하고 viewport clamp를 적용하며 `preventDefault()`한다. Contact Me의 Enter/Space click toggle은 그대로 둔다. handle에 `aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"`와 한국어 이동 안내를 추가한다.

`main.js`는 `pagehide` 이벤트의 `persisted`를 `shouldDestroyOnPageHide`에 전달하고 false일 때만 기존 cleanup/destroy를 실행한다. `.site-links a`와 `.contact-card__panel a`에는 `min-height: 2.75rem`, flex 중앙 정렬과 `padding-inline: 0.35rem`을 추가한다.

- [ ] **Step 7: GREEN과 전체 검증**

Run: `node --test tests/*.test.mjs && node --check scripts/main.js && node --check scripts/contact-card.js && node --check scripts/jpeg-metadata.js && node --check scripts/page-lifecycle.js && git diff --check`

Run: `exiftool -GPS:all -Model -DateTimeOriginal assets/soontaek-01.jpeg assets/soontaek-02.jpeg assets/soontaek-03.jpeg`

Expected: 전체 테스트 PASS; GPS 출력 없음; 세 파일 모두 `iPhone 14 Pro`와 기존 촬영 시각 출력

- [ ] **Step 8: 커밋**

```bash
git add -- assets/soontaek-01.jpeg assets/soontaek-02.jpeg assets/soontaek-03.jpeg scripts/jpeg-metadata.js scripts/page-lifecycle.js tests/image-metadata.test.mjs tests/page-lifecycle.test.mjs index.html styles.css scripts/contact-card.js scripts/main.js tests/contact-card.test.mjs tests/site-content.test.mjs
git commit -m "fix: 이미지 위치정보와 모바일 접근성 보완" -m "순택이 사진의 GPS EXIF만 제거하고 비위치 메타데이터를 보존했습니다.
모바일 오버레이 배치, 키보드 이동, BFCache 수명주기와 링크 터치 영역을 보완했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 5: GPS 없는 기록 재작성과 Draft PR 게시

**Files:**
- No tracked file changes expected

**Interfaces:**
- Consumes: Task 4가 GPS를 제거한 세 JPEG와 모든 통과 테스트
- Produces: 공개되는 모든 기능 브랜치 커밋에서 GPS가 제거된 원격 브랜치와 Draft PR

- [ ] **Step 1: 재작성 전 안전 조건 확인**

Run: `git status --short --branch`

Expected: clean worktree on `feat/portfolio-experience-redesign`

Run: `git ls-remote --heads origin feat/portfolio-experience-redesign`

Expected: 출력 없음. 출력이 있으면 강제 push가 필요하므로 중단하고 사용자 승인을 다시 받는다.

- [ ] **Step 2: 기능 브랜치 기록에서 GPS만 제거**

```bash
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force \
  --tree-filter 'for image in assets/soontaek-01.jpeg assets/soontaek-02.jpeg assets/soontaek-03.jpeg; do if test -f "$image"; then exiftool -overwrite_original -gps:all= "$image" >/dev/null; fi; done' \
  --prune-empty main..HEAD
```

이 명령은 기능 브랜치에서 사진이 존재하는 모든 공개 대상 커밋을 다시 만들며 다른 EXIF를 보존한다. `refs/original`은 원격에 push하지 않는다.

- [ ] **Step 3: 재작성된 전체 기록 검증**

각 `main..HEAD` 커밋에서 존재하는 세 이미지 blob을 임시 디렉터리에 추출하고 `exiftool -GPS:all` 출력이 비어 있는지 검사한다.

```bash
VERIFY_DIR=$(mktemp -d)
for commit in $(git rev-list main..HEAD); do
  for image in assets/soontaek-01.jpeg assets/soontaek-02.jpeg assets/soontaek-03.jpeg; do
    if git cat-file -e "$commit:$image" 2>/dev/null; then
      output="$VERIFY_DIR/$(basename "$image")"
      git show "$commit:$image" > "$output"
      test -z "$(exiftool -s3 -GPS:all "$output")" || exit 1
    fi
  done
done
```

현재 HEAD에서는 다음 명령으로 비위치 EXIF가 남아 있는지도 확인한다.

Run: `exiftool -Model -DateTimeOriginal assets/soontaek-01.jpeg assets/soontaek-02.jpeg assets/soontaek-03.jpeg`

Expected: 세 파일 모두 `iPhone 14 Pro`와 기존 촬영 시각 출력

Run: `node --test tests/*.test.mjs && git diff --check && git status --short --branch`

Expected: 모든 테스트 PASS, clean worktree

- [ ] **Step 4: 개발 서버 확인**

Run: `podman compose up -d --force-recreate`

Run: `curl -fsS -D - http://127.0.0.1:2345/ -o /tmp/portfolio-video-synth-final.html`

Expected: `HTTP/1.1 200 OK`

- [ ] **Step 5: 원격 브랜치 push**

Run: `git push -u origin feat/portfolio-experience-redesign`

Expected: 새 원격 브랜치 생성. `refs/original`은 push하지 않는다.

- [ ] **Step 6: 기존 PR 중복 확인 후 Draft PR 생성**

Run: `gh pr list --head feat/portfolio-experience-redesign --state all --json number,url,state,title`

Expected: 기존 matching PR 없음

Run:

```bash
gh pr create --draft --base main --head feat/portfolio-experience-redesign \
  --title "feat(portfolio): 포트폴리오 경험과 비디오 신시사이징 개편" \
  --body "## 변경 사항
- 한 페이지 포트폴리오 콘텐츠와 타이포그래피 개편
- 검은 CRT와 백남준 영감의 비디오 신시사이징 화면 구현
- 경력·교육·연락처·SEO 및 반응형 접근성 보완
- 순택이 이미지 GPS 위치정보 제거
- localhost:2345용 Podman Compose/nginx 개발 환경 추가

## 검증
- Node.js 전체 테스트 통과
- JavaScript 문법 및 git diff 검사 통과
- nginx HTTP 200 응답 확인
- 기능 브랜치 전체 JPEG GPS 메타데이터 제거 확인

🤖 이 PR은 Codex (GPT-5.6)가 작성했습니다"
```

Expected: `main` 대상 Draft PR URL 출력
