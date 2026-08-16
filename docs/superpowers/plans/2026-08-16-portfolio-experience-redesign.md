# 포트폴리오 경험 리디자인 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 임영택의 기존 이력과 링크를 보존하면서, 이름·핵심 문장·3D 브라운관을 전면에 둔 한 페이지 포트폴리오를 구현한다.

**Architecture:** 정적 HTML과 CSS를 콘텐츠의 기준으로 두고, JavaScript가 없어도 모든 이력과 링크를 읽을 수 있게 한다. 브라우저 ES module로 Three.js 장면과 순수 모션 계산을 분리하며, WebGL 실패·모션 감소 환경에서는 정적인 CSS 대체 TV를 사용한다.

**Tech Stack:** HTML5, CSS, vanilla JavaScript ES modules, Three.js 0.180.0, Node.js built-in test runner

## Global Constraints

- 한 페이지 구성을 유지한다.
- SUIT 고딕을 기본 서체로 사용하고 세리프 서체를 사용하지 않는다.
- 배경은 흰색 범주, 구분은 얇은 중립 회색 선으로 제한한다.
- 영문은 `YOUNGTAEK LIM`, 고유 링크명, 코드와 기술명처럼 필요한 경우에만 사용한다.
- 피피비스튜디오는 `피피비스튜디오스`, `2026. 03 ~`, `컬러렌즈 O2O 서버 및 백오피스 풀스택 개발`만 표시한다.
- 티맥스 클라우드, 솔트룩스, 한국소프트웨어산업협회, 홍익대학교의 기존 원문과 링크 URL을 유지한다.
- Apple Developer Academy 기간은 `2025. 03 ~ 2025. 12`로 표시한다.
- 빌드 도구와 프레임워크를 추가하지 않고 브라우저 ES module을 사용한다.
- `prefers-reduced-motion: reduce`와 WebGL 실패 환경에서 정적인 대체 TV를 표시한다.

---

## 파일 구조

- Modify: `index.html` — 시맨틱 콘텐츠, 외부 링크, SEO 메타데이터, import map, 모듈 진입점
- Create: `styles.css` — SUIT 기반 타이포그래피, 첫 화면, 경력·기술·교육·연락처 레이아웃, 정적 TV 대체 요소
- Create: `scripts/main.js` — 기능 감지, 장면 초기화, 실패 시 대체 상태 유지
- Create: `scripts/tv-motion.js` — 스크롤과 포인터 값을 TV 변환값으로 바꾸는 순수 함수
- Create: `scripts/tv-scene.js` — Three.js 장면, procedural TV, CanvasTexture, 렌더링 생명주기
- Create: `tests/site-content.test.mjs` — 콘텐츠 보존, 메타데이터, 시맨틱 구조, 모듈 연결 검증
- Create: `tests/tv-motion.test.mjs` — 모션 계산 경계값과 모션 감소 처리 검증
- Create: `assets/og-image.svg` — 공유 이미지의 편집 가능한 원본
- Create: `assets/og-image.png` — Open Graph/Twitter 공유 이미지

---

### Task 1: 시맨틱 콘텐츠와 회귀 테스트

**Files:**
- Create: `tests/site-content.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Consumes: 기존 `index.html`의 이력, 연락처, GitHub·Blog·TIL URL
- Produces: `#hero-tv` 컨테이너, `.tv-fallback`, `scripts/main.js` 모듈 진입점, 모든 후속 스타일과 스크립트가 사용하는 시맨틱 섹션 ID

- [ ] **Step 1: 콘텐츠 회귀 테스트 작성**

`tests/site-content.test.mjs`에 Node 내장 테스트를 작성한다.

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("핵심 문구와 이름을 첫 화면에 둔다", () => {
  assert.match(html, /<section[^>]+class="hero"/);
  assert.match(html, /임영택/);
  assert.match(html, /YOUNGTAEK LIM/);
  assert.match(html, /상상을 컴파일하는[\s\S]*엔지니어/);
  assert.match(html, /기술과 비즈니스의 경계를 넘어[\s\S]*팀의 비전을 실현합니다/);
});

test("피피비스튜디오는 요청한 세 줄만 표시한다", () => {
  const section = html.match(/<article[^>]+data-company="ppb"[\s\S]*?<\/article>/)?.[0] ?? "";
  assert.match(section, /피피비스튜디오스/);
  assert.match(section, /2026\. 03 ~|2026\. 03 — 현재/);
  assert.match(section, /컬러렌즈 O2O 서버 및 백오피스 풀스택 개발/);
  assert.doesNotMatch(section, /상품|발주|인증|더보기|details|summary/);
});

test("기존 경력과 교육 내용을 보존한다", () => {
  for (const text of [
    "티맥스 클라우드",
    "CL2연구본부",
    "화상회의 서버 개발",
    "앱서버(NodeJS/Express) 개발, 유지보수",
    "자료공유서버(Java/Spring) 개발, 유지보수",
    "솔트룩스",
    "자사 언어모델 LUXIA(루시아) 파인튜닝을 위한 지도학습 데이터 셋 구축",
    "한국소프트웨어산업협회",
    "우수인재상 수상 (한국소프트웨어산업협회장)",
    "홍익대학교",
    "미술대학 예술학과",
    "융합 문화예술경영전공",
  ]) assert.ok(html.includes(text), `누락된 콘텐츠: ${text}`);
  assert.match(html, /Apple Developer Academy @ POSTECH[\s\S]*2025\. 03 ~ 2025\. 12/);
});

test("기존 연락처와 링크를 보존한다", () => {
  for (const value of [
    "서울시 마포구",
    "0tak2.code@gmail.com",
    "https://github.com/0tak2",
    "https://archiveyoung.tistory.com",
    "https://0tak2.github.io/T0L/",
  ]) assert.ok(html.includes(value), `누락된 링크 또는 연락처: ${value}`);
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: FAIL. 새 hero 구조, 피피비스튜디오스, Academy 종료일이 아직 없다.

- [ ] **Step 3: `index.html`을 시맨틱 한 페이지 구조로 교체**

다음 골격과 실제 원문 콘텐츠를 사용한다. 기존 Tailwind CDN과 인라인 설정은 제거한다.

```html
<body>
  <header class="hero" aria-labelledby="hero-title">
    <nav class="site-links" aria-label="외부 링크">
      <a href="https://github.com/0tak2" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://archiveyoung.tistory.com" target="_blank" rel="noopener noreferrer">Blog</a>
      <a href="https://0tak2.github.io/T0L/" target="_blank" rel="noopener noreferrer">TIL</a>
    </nav>
    <div class="hero__content">
      <div class="hero__copy">
        <p class="hero__name">임영택 <span>YOUNGTAEK LIM</span></p>
        <h1 id="hero-title">상상을 컴파일하는 엔지니어.</h1>
        <p>기술과 비즈니스의 경계를 넘어<br>팀의 비전을 실현합니다.</p>
      </div>
      <div id="hero-tv" class="hero__tv" role="img" aria-label="코드가 표시되는 3D 브라운관 TV">
        <div class="tv-fallback" aria-hidden="true">
          <div class="tv-fallback__screen"><code>const vision = team.idea;<br>compile(vision);</code></div>
          <span class="tv-fallback__dial"></span><span class="tv-fallback__dial"></span>
        </div>
      </div>
    </div>
    <a class="scroll-cue" href="#work">아래로</a>
  </header>
  <main>
    <section id="work" class="section" aria-labelledby="work-title">
      <h2 id="work-title">경력</h2>
      <article class="experience" data-company="ppb"><time>2026. 03 ~</time><div><h3>피피비스튜디오스</h3><p>컬러렌즈 O2O 서버 및 백오피스 풀스택 개발</p></div></article>
      <article class="experience"><time>2023. 10 ~ 2024. 11</time><div><h3>티맥스 클라우드</h3><p>CL2연구본부</p><ul><li>화상회의 서버 개발</li><li>앱서버(NodeJS/Express) 개발, 유지보수</li><li>자료공유서버(Java/Spring) 개발, 유지보수</li><li>테스트 자동화 (미디어서버 성능 테스트 - WebRTC, HLS 등)</li></ul></div></article>
      <article class="experience"><time>2023. 06 ~ 2023. 09</time><div><h3>솔트룩스</h3><p>인턴십</p><ul><li>자사 언어모델 LUXIA(루시아) 파인튜닝을 위한 지도학습 데이터 셋 구축</li><li>프롬프트 엔지니어링</li><li>팀내 업무 도구 작성 및 운영</li></ul></div></article>
    </section>
    <section id="stack" class="section" aria-labelledby="stack-title"><h2 id="stack-title">기술</h2><p class="stack-list">JavaScript / TypeScript · Go · Node.js · NestJS · Java · Spring</p></section>
    <section id="education" class="section" aria-labelledby="education-title">
      <h2 id="education-title">교육</h2>
      <article class="experience"><time>2025. 03 ~ 2025. 12</time><div><h3>Apple Developer Academy @ POSTECH<br>Cohort 2025</h3></div></article>
      <article class="experience"><time>2022. 11 ~ 2023. 06</time><div><h3>한국소프트웨어산업협회<br>기업멤버십 SW캠프</h3><ul><li>Java, Java EE(Servlet, JSP), Spring Framework, MySQL 등 Java 기반 웹 개발</li><li>JavaScript, jQuery, Vue.js</li><li>우수인재상 수상 (한국소프트웨어산업협회장)</li></ul></div></article>
      <article class="experience"><time>2017. 03 ~ 2023. 02</time><div><h3>홍익대학교</h3><p>미술대학 예술학과</p><p>융합 문화예술경영전공</p></div></article>
    </section>
  </main>
  <footer id="contact" class="section"><h2>연락처</h2><address><span>서울시 마포구</span><a href="mailto:0tak2.code@gmail.com">0tak2.code@gmail.com</a></address></footer>
  <script type="module" src="./scripts/main.js"></script>
</body>
```

경력의 PPB article에는 `data-company="ppb"`를 지정하고 세 줄만 넣는다. 나머지 경력과 교육은 기존 `li` 원문을 그대로 옮긴다. 기술 환경에는 해설 없이 `JavaScript / TypeScript · Go · Node.js · NestJS · Java · Spring` 한 줄만 넣는다. 모든 외부 링크에 `target="_blank" rel="noopener noreferrer"`를 지정한다.

- [ ] **Step 4: 콘텐츠 테스트 통과 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: 4 tests PASS.

- [ ] **Step 5: 콘텐츠 구조 커밋**

```bash
git add index.html tests/site-content.test.mjs
git commit -m "feat: 포트폴리오 이력과 첫 화면 구조 개편" -m "기존 경력·교육·연락처를 보존하고 피피비스튜디오스 경력을 추가했습니다.
첫 화면에 이름과 핵심 문장을 배치할 시맨틱 구조를 구성했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 2: 화이트 기반 고딕 편집 디자인

**Files:**
- Create: `styles.css`
- Modify: `index.html`
- Modify: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: Task 1의 `.hero`, `.hero__content`, `.hero__copy`, `.hero__tv`, `.section`, `.experience` 클래스
- Produces: JS 없이도 완성된 레이아웃과 `.tv-fallback`, `body.is-webgl .tv-fallback` 상태 스타일

- [ ] **Step 1: 스타일 연결과 금지 요소 테스트 추가**

```js
test("외부 스타일시트를 사용하고 Tailwind와 세리프를 제거한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(html, /<link rel="stylesheet" href="\.\/styles\.css">/);
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com/);
  assert.doesNotMatch(css, /font-family:[^;]*(?:Georgia|Times|(?<!-)serif)/i);
  assert.match(css, /font-family:\s*"SUIT"/);
  assert.match(css, /min-height:\s*100svh/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: 새 테스트 실패 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: FAIL because `styles.css` does not exist.

- [ ] **Step 3: `styles.css` 구현**

SUIT CDN의 동적 subset CSS를 `@import`하고 다음 토큰과 레이아웃을 구현한다.

```css
@import url("https://cdn.jsdelivr.net/gh/sunn-us/SUIT@2.0.1/fonts/static/woff2/SUIT.css");

:root {
  --paper: #ffffff;
  --ink: #111111;
  --muted: #5f5f5f;
  --line: #d8d8d8;
  --line-strong: #a8a8a8;
  --content: 72rem;
}

body { margin: 0; background: var(--paper); color: var(--ink); font-family: "SUIT", sans-serif; }
.hero { box-sizing: border-box; min-height: 100svh; display: grid; grid-template-rows: auto 1fr auto; }
.hero__content { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: center; }
.section { border-top: 1px solid var(--line-strong); }
@media (max-width: 48rem) { .hero__content { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; } }
```

이 토큰을 확장해 최대 폭, 여백, 이름과 제목 크기, 두 열 hero, 한 열 모바일, 얇은 선으로 구분된 이력 행, 키보드 `:focus-visible`, 정적 TV 본체·화면·다이얼을 작성한다. 카드 배경, 베이지, 세리프, 굵은 그림자는 사용하지 않는다.

- [ ] **Step 4: 정적 테스트 통과 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: 5 tests PASS.

- [ ] **Step 5: 브라우저에서 정적 페이지 확인**

Run: `python3 -m http.server 4173`

Expected: `http://localhost:4173`에서 첫 화면이 뷰포트를 채우고, JavaScript 오류가 생겨도 정적 TV와 모든 이력이 보인다. 확인 후 서버에 `Ctrl-C`를 보낸다.

- [ ] **Step 6: 스타일 커밋**

```bash
git add index.html styles.css tests/site-content.test.mjs
git commit -m "feat: 화이트 기반 포트폴리오 스타일 적용" -m "SUIT 고딕과 얇은 구분선을 사용해 첫 화면과 이력 레이아웃을 구성했습니다.
모바일과 모션 감소 환경의 정적 표시를 포함했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 3: TV 모션 계산 모듈

**Files:**
- Create: `scripts/tv-motion.js`
- Create: `tests/tv-motion.test.mjs`

**Interfaces:**
- Produces: `clamp(value, min, max): number`, `getTvTransform(input): { x: number, y: number, rotationX: number, rotationY: number, scale: number }`
- Consumes: `{ scrollProgress: number, pointerX: number, pointerY: number, reducedMotion: boolean }`

- [ ] **Step 1: 순수 함수 테스트 작성**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { clamp, getTvTransform } from "../scripts/tv-motion.js";

test("clamp는 값을 범위 안에 둔다", () => {
  assert.equal(clamp(-1, 0, 1), 0);
  assert.equal(clamp(0.4, 0, 1), 0.4);
  assert.equal(clamp(2, 0, 1), 1);
});

test("TV는 진입 후 머물고 스크롤 시 퇴장한다", () => {
  assert.ok(getTvTransform({ scrollProgress: 0, pointerX: 0, pointerY: 0, reducedMotion: false }).x > 1);
  assert.equal(getTvTransform({ scrollProgress: 0.25, pointerX: 0, pointerY: 0, reducedMotion: false }).x, 0);
  assert.ok(getTvTransform({ scrollProgress: 1, pointerX: 0, pointerY: 0, reducedMotion: false }).x < -1);
});

test("포인터 값은 회전을 제한한다", () => {
  const value = getTvTransform({ scrollProgress: 0.25, pointerX: 9, pointerY: -9, reducedMotion: false });
  assert.ok(value.rotationY <= 0.18);
  assert.ok(value.rotationX >= -0.12);
});

test("모션 감소 환경은 정적인 중앙값을 반환한다", () => {
  assert.deepEqual(getTvTransform({ scrollProgress: 1, pointerX: 1, pointerY: 1, reducedMotion: true }), {
    x: 0, y: 0, rotationX: 0, rotationY: -0.08, scale: 1,
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test tests/tv-motion.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: 모션 계산 최소 구현**

```js
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function getTvTransform({ scrollProgress, pointerX, pointerY, reducedMotion }) {
  if (reducedMotion) return { x: 0, y: 0, rotationX: 0, rotationY: -0.08, scale: 1 };
  const progress = clamp(scrollProgress, 0, 1);
  const enter = clamp(progress / 0.2, 0, 1);
  const exit = clamp((progress - 0.55) / 0.45, 0, 1);
  return {
    x: 1.35 * (1 - enter) - 1.55 * exit,
    y: 0.08 * (1 - enter) + 0.22 * exit,
    rotationX: clamp(pointerY, -1, 1) * -0.12,
    rotationY: -0.08 + clamp(pointerX, -1, 1) * 0.18,
    scale: 0.94 + 0.06 * enter - 0.08 * exit,
  };
}
```

- [ ] **Step 4: 모션 테스트 통과 확인**

Run: `node --test tests/tv-motion.test.mjs`

Expected: 4 tests PASS.

- [ ] **Step 5: 모션 모듈 커밋**

```bash
git add scripts/tv-motion.js tests/tv-motion.test.mjs
git commit -m "feat: 브라운관 진입과 퇴장 모션 계산 추가" -m "스크롤과 포인터 값을 제한된 3D 변환값으로 계산합니다.
모션 감소 환경에서는 정적인 변환값을 반환합니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 4: Three.js 브라운관 장면과 실패 대체

**Files:**
- Create: `scripts/tv-scene.js`
- Create: `scripts/main.js`
- Modify: `index.html`
- Modify: `tests/site-content.test.mjs`

**Interfaces:**
- Consumes: `getTvTransform()` from `scripts/tv-motion.js`, `#hero-tv`, `.tv-fallback`
- Produces: `createTvScene(container, options): { update(transform): void, resize(): void, setActive(active): void, destroy(): void }`

- [ ] **Step 1: 모듈 연결 정적 테스트 추가**

```js
test("Three.js import map과 모듈 진입점을 고정 버전으로 연결한다", () => {
  assert.match(html, /"three":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.180\.0\/build\/three\.module\.js"/);
  assert.match(html, /<script type="module" src="\.\/scripts\/main\.js"><\/script>/);
  assert.match(html, /id="hero-tv"/);
  assert.match(html, /class="tv-fallback"/);
});
```

- [ ] **Step 2: 정적 테스트 실패 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: FAIL because import map is absent.

- [ ] **Step 3: `index.html`에 import map 추가**

```html
<script type="importmap">
  {"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js"}}
</script>
```

- [ ] **Step 4: `tv-scene.js`에 procedural TV 구현**

`THREE.Scene`, `PerspectiveCamera`, `WebGLRenderer`를 만들고 `THREE.Group` 아래에 다음 mesh를 배치한다.

```js
import * as THREE from "three";

function createScreenMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  context.fillStyle = "#101711";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#a6edb1";
  context.font = "36px monospace";
  ["const vision = team.idea;", "", "export default", "  compile(vision);", "", "// rendering..."].forEach((line, index) => context.fillText(line, 70, 100 + index * 72));
  context.fillStyle = "rgba(0, 0, 0, 0.18)";
  for (let y = 0; y < canvas.height; y += 8) context.fillRect(0, y, canvas.width, 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture });
}

export function createTvScene(container, { reducedMotion = false } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.append(renderer.domElement);

  const tv = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.35, 1.35, 5, 5, 3), new THREE.MeshStandardMaterial({ color: 0x242424, roughness: 0.72 }));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.45, 12, 8), createScreenMaterial());
  screen.position.set(-0.28, 0.12, 0.69);
  const dialMaterial = new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: 0.45 });
  for (const y of [0.48, -0.32]) {
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24), dialMaterial);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(1.18, y, 0.75);
    tv.add(dial);
  }
  tv.add(body, screen);
  scene.add(tv);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 2.2));

  let active = true;
  let destroyed = false;
  let frame = 0;

  function resize() {
    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function render() {
    if (!active || destroyed) return;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  }

  function update({ x, y, rotationX, rotationY, scale }) {
    tv.position.set(x * 3.5, y * 2, 0);
    tv.rotation.set(rotationX, rotationY, 0);
    tv.scale.setScalar(scale);
  }

  function setActive(nextActive) {
    if (active === nextActive || destroyed) return;
    active = nextActive;
    cancelAnimationFrame(frame);
    if (active) render();
  }

  function destroy() {
    destroyed = true;
    cancelAnimationFrame(frame);
    scene.traverse((object) => {
      object.geometry?.dispose();
      if (object.material?.map) object.material.map.dispose();
      object.material?.dispose();
    });
    renderer.dispose();
    renderer.domElement.remove();
  }

  resize();
  update({ x: reducedMotion ? 0 : 1.35, y: reducedMotion ? 0 : 0.08, rotationX: 0, rotationY: -0.08, scale: reducedMotion ? 1 : 0.94 });
  render();
  return { update, resize, setActive, destroy };
}
```

`createScreenMaterial()`은 1024×640 canvas에 짙은 녹색 배경, 옅은 녹색 코드, scanline을 그리고 `THREE.CanvasTexture`와 `MeshBasicMaterial`을 반환한다. `update()`는 Task 3의 정규화된 `x`, `y`, 회전, 크기를 TV group에 적용한다. `setActive(false)`일 때 `requestAnimationFrame`을 중단한다.

- [ ] **Step 5: `main.js`에서 기능 감지와 수명주기 연결**

```js
import { createTvScene } from "./tv-scene.js";
import { getTvTransform } from "./tv-motion.js";

const container = document.querySelector("#hero-tv");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (container) {
  try {
    const scene = createTvScene(container, { reducedMotion });
    document.body.classList.add("is-webgl");
    const hero = container.closest(".hero");
    const pointer = { x: 0, y: 0 };

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const scrollProgress = -rect.top / Math.max(rect.height, 1);
      scene.update(getTvTransform({
        scrollProgress,
        pointerX: pointer.x,
        pointerY: pointer.y,
        reducedMotion,
      }));
    };

    const onPointerMove = (event) => {
      pointer.x = (event.clientX / innerWidth) * 2 - 1;
      pointer.y = (event.clientY / innerHeight) * 2 - 1;
      update();
    };
    const onScroll = () => update();
    addEventListener("pointermove", onPointerMove, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => { scene.resize(); update(); });
    resizeObserver.observe(container);
    const visibilityObserver = new IntersectionObserver(([entry]) => scene.setActive(entry.isIntersecting), { rootMargin: "20%" });
    visibilityObserver.observe(container);
    update();

    addEventListener("pagehide", () => {
      removeEventListener("pointermove", onPointerMove);
      removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.destroy();
    }, { once: true });
  } catch (error) {
    console.warn("3D 브라운관을 표시하지 못해 정적 화면으로 대체합니다.", error);
  }
}
```

- [ ] **Step 6: 전체 자동 테스트 통과 확인**

Run: `node --test tests/*.test.mjs`

Expected: 10 tests PASS.

- [ ] **Step 7: 브라우저 동작 확인**

Run: `python3 -m http.server 4173`

Expected: 새로고침 시 TV가 화면 안으로 들어오고, 경력 섹션으로 스크롤하면 반대편으로 빠져나간다. 포인터에 작게 반응하고 DevTools 콘솔에 오류가 없다. `prefers-reduced-motion` 에뮬레이션에서는 TV가 움직이지 않는다. 확인 후 서버에 `Ctrl-C`를 보낸다.

- [ ] **Step 8: 3D 장면 커밋**

```bash
git add index.html scripts/main.js scripts/tv-scene.js tests/site-content.test.mjs
git commit -m "feat: Three.js 브라운관 오브젝트 구현" -m "코드 화면이 렌더링되는 3D 브라운관과 스크롤 진입·퇴장 동작을 연결했습니다.
WebGL 실패와 모션 감소 환경에서는 정적 화면을 유지합니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 5: SEO 메타데이터와 공유 이미지

**Files:**
- Modify: `index.html`
- Modify: `tests/site-content.test.mjs`
- Create: `assets/og-image.svg`
- Create: `assets/og-image.png`

**Interfaces:**
- Consumes: 첫 화면의 이름, 핵심 문장, 흰 배경과 무채색 TV 시각 언어
- Produces: canonical, Open Graph, Twitter Card, Person JSON-LD, 1200×630 PNG

- [ ] **Step 1: SEO 메타데이터 테스트 추가**

```js
test("검색과 공유 메타데이터를 제공한다", () => {
  assert.match(html, /<title>임영택 \| 상상을 컴파일하는 엔지니어<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/0tak2\.github\.io\/">/);
  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    assert.match(html, new RegExp(`<meta property="${property}"`));
  }
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /"@type":\s*"Person"/);
  assert.match(html, /"alternateName":\s*"Youngtaek Lim"/);
});
```

- [ ] **Step 2: SEO 테스트 실패 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: FAIL because canonical, social metadata, and JSON-LD are absent.

- [ ] **Step 3: 메타데이터와 JSON-LD 구현**

`index.html` head에 다음 값을 사용한다.

```html
<title>임영택 | 상상을 컴파일하는 엔지니어</title>
<meta name="description" content="JavaScript와 Go 생태계에서 서버와 제품을 개발하는 임영택의 포트폴리오입니다.">
<link rel="canonical" href="https://0tak2.github.io/">
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="임영택 | 상상을 컴파일하는 엔지니어">
<meta property="og:description" content="기술과 비즈니스의 경계를 넘어 팀의 비전을 실현합니다.">
<meta property="og:url" content="https://0tak2.github.io/">
<meta property="og:image" content="https://0tak2.github.io/assets/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Person","name":"임영택","alternateName":"Youngtaek Lim","url":"https://0tak2.github.io/","sameAs":["https://github.com/0tak2","https://archiveyoung.tistory.com"]}
</script>
```

- [ ] **Step 4: 공유 이미지 원본과 PNG 생성**

`assets/og-image.svg`를 1200×630 흰 배경으로 만들고, 왼쪽에 `임영택`, `상상을 컴파일하는 엔지니어.`, 오른쪽에 무채색 브라운관을 배치한다. 시스템 고딕과 monospace만 사용하고 베이지색과 세리프를 사용하지 않는다.

Run: `sips -s format png assets/og-image.svg --out assets/og-image.png`

Expected: `assets/og-image.png` is created at 1200×630.

- [ ] **Step 5: SEO 테스트와 이미지 크기 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: all site content tests PASS.

Run: `sips -g pixelWidth -g pixelHeight assets/og-image.png`

Expected: `pixelWidth: 1200`, `pixelHeight: 630`.

- [ ] **Step 6: SEO 커밋**

```bash
git add index.html tests/site-content.test.mjs assets/og-image.svg assets/og-image.png
git commit -m "feat: 포트폴리오 SEO와 공유 이미지 추가" -m "검색 메타데이터, Open Graph, Twitter Card와 Person 구조화 데이터를 추가했습니다.
첫 화면의 시각 언어를 반영한 공유 이미지를 포함했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 6: 최종 반응형·접근성·회귀 검증

**Files:**
- Modify: `index.html` only if validation finds a concrete markup issue
- Modify: `styles.css` only if visual inspection finds overflow, overlap, or focus issues
- Modify: `scripts/main.js` or `scripts/tv-scene.js` only if browser console or lifecycle inspection finds an error

**Interfaces:**
- Consumes: Tasks 1–5의 완성 페이지
- Produces: 데스크톱·모바일·모션 감소·WebGL 실패에서 검증된 정적 사이트

- [ ] **Step 1: 전체 자동 테스트 실행**

Run: `node --test tests/*.test.mjs`

Expected: all tests PASS, 0 failures.

- [ ] **Step 2: 정적 오류 검사**

Run: `git diff --check`

Expected: no output.

- [ ] **Step 3: 로컬 서버에서 데스크톱과 모바일 시각 검증**

Run: `python3 -m http.server 4173`

다음 뷰포트를 확인한다.

- 1440×900: 이름·핵심 문장·TV가 첫 화면에 보이고 경력은 첫 스크롤 뒤 시작한다.
- 768×1024: hero 두 요소가 겹치지 않고 링크가 잘리지 않는다.
- 390×844: 한 열 hero, 모든 경력·교육 원문, 연락처가 가로 스크롤 없이 보인다.

- [ ] **Step 4: 접근성과 실패 상태 검증**

- 키보드 Tab 이동 시 GitHub, Blog, TIL, 이메일, 아래로 링크의 포커스가 보이는지 확인한다.
- 브라우저의 reduced motion 에뮬레이션에서 TV 진입·퇴장·포인터 회전이 멈추는지 확인한다.
- DevTools에서 Three.js 요청을 차단한 뒤 정적 TV와 전체 본문이 남는지 확인한다.
- 콘솔 오류와 접근 불가능한 링크가 없는지 확인한다.

- [ ] **Step 5: 콘텐츠 최종 대조**

Run: `node --test tests/site-content.test.mjs`

Expected: PPB 세 줄 제한, Academy 종료일, 기존 경력·교육·연락처·URL 보존 테스트가 모두 PASS.

- [ ] **Step 6: 검증에서 수정이 발생한 경우에만 커밋**

```bash
git add index.html styles.css scripts/main.js scripts/tv-scene.js
git commit -m "fix: 포트폴리오 반응형과 접근성 보완" -m "최종 브라우저 검증에서 확인한 레이아웃과 상호작용 문제를 수정했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```
