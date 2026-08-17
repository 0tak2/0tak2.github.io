# Portfolio Typography Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 첫 화면의 자간과 행간을 넓히고 전체 글자 굵기를 Bold 이하로 제한하며, 배경과 Contact Me 너비를 승인된 값으로 보정한다.

**Architecture:** 기존 정적 한 페이지 구조와 CSS 변수 체계를 그대로 사용한다. `tests/site-content.test.mjs`에 CSS 계약 테스트를 추가한 뒤 `styles.css`의 토큰과 개별 선택자만 수정하며 HTML과 JavaScript는 변경하지 않는다.

**Tech Stack:** HTML5, SUIT CSS, Node.js 내장 test runner, Podman Compose, nginx

## Global Constraints

- 페이지 배경 `--paper`는 `#fefefe`다.
- 순수 흰색 `#ffffff`와 순수 검정 `#000000`은 CSS에서 사용하지 않는다.
- 허용하는 글자 굵기는 `300`, `400`, `500`, `700`이며 `700`을 초과하지 않는다.
- 이름은 `font-weight: 700`, `line-height: 1.2`, `letter-spacing: -0.01em`이다.
- 영문 이름의 자간은 `0.09em`이다.
- 메인 문장은 `font-weight: 700`, `line-height: 1.25`, `letter-spacing: -0.01em`이다.
- 설명 문장은 `font-weight: 400`, `line-height: 2`, `letter-spacing: 0`이다.
- 상단 외부 링크의 자간은 `0.055em`이다.
- Contact Me의 기본 너비는 `15rem`이며 뷰포트 너비 제한을 유지한다.
- 콘텐츠, 3D TV, 순택이 오버레이, JavaScript 동작과 GitHub Pages 호환 구조는 변경하지 않는다.

---

### Task 1: 중성 화이트와 타이포그래피 계약 적용

**Files:**
- Modify: `tests/site-content.test.mjs`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `styles.css`의 `--paper`, `.site-links`, `.hero__name`, `.hero__name span`, `.hero h1`, `.hero__statement` 규칙
- Produces: 승인된 색상·자간·행간·굵기를 강제하는 CSS와 회귀 테스트

- [ ] **Step 1: CSS 계약을 검증하는 실패 테스트 작성**

`tests/site-content.test.mjs`에 다음 테스트를 추가한다.

```js
test("첫 화면은 중성 화이트와 여유 있는 타이포그래피를 사용한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const siteLinksRule = css.match(/\.site-links\s*\{[\s\S]*?\}/)?.[0] ?? "";
  const nameRule = css.match(/\.hero__name\s*\{[\s\S]*?\}/)?.[0] ?? "";
  const englishNameRule = css.match(/\.hero__name span\s*\{[\s\S]*?\}/)?.[0] ?? "";
  const titleRule = css.match(/\.hero h1\s*\{[\s\S]*?\}/)?.[0] ?? "";
  const statementRule = css.match(/\.hero__statement\s*\{[\s\S]*?\}/)?.[0] ?? "";
  const fontWeights = [...css.matchAll(/font-weight:\s*(\d+)/g)].map((match) => Number(match[1]));

  assert.match(css, /--paper:\s*#fefefe/);
  assert.doesNotMatch(css, /#(?:fff|ffffff)\b/i);
  assert.ok(fontWeights.every((weight) => [300, 400, 500, 700].includes(weight)));
  assert.match(siteLinksRule, /letter-spacing:\s*0\.055em/);
  assert.match(nameRule, /font-weight:\s*700/);
  assert.match(nameRule, /line-height:\s*1\.2/);
  assert.match(nameRule, /letter-spacing:\s*-0\.01em/);
  assert.match(englishNameRule, /letter-spacing:\s*0\.09em/);
  assert.match(titleRule, /font-weight:\s*700/);
  assert.match(titleRule, /line-height:\s*1\.25/);
  assert.match(titleRule, /letter-spacing:\s*-0\.01em/);
  assert.match(statementRule, /font-weight:\s*400/);
  assert.match(statementRule, /line-height:\s*2/);
  assert.match(statementRule, /letter-spacing:\s*0/);
});
```

- [ ] **Step 2: 테스트를 실행해 현재 값 때문에 실패하는지 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: `--paper: #fdfdfd`, `font-weight: 850` 또는 기존 첫 화면 간격 중 하나 이상 때문에 FAIL

- [ ] **Step 3: 승인된 색상과 타이포그래피를 최소 변경으로 적용**

`styles.css`를 다음 값으로 변경한다.

```css
:root {
  --paper: #fefefe;
}

.site-links {
  letter-spacing: 0.055em;
}

.hero__name {
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.hero__name span {
  letter-spacing: 0.09em;
}

.hero h1 {
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.hero__statement {
  font-weight: 400;
  line-height: 2;
  letter-spacing: 0;
}
```

`styles.css`에 남아 있는 `760`, `800`, `830`, `850`은 역할을 바꾸지 않고 `700`으로 낮춘다. 허용 목록에 없는 `520`은 `500`으로 낮추며 기존 `500` 이하는 그대로 둔다.

- [ ] **Step 4: 콘텐츠 테스트와 CSS 문법성 검사를 실행**

Run: `node --test tests/site-content.test.mjs && git diff --check`

Expected: 모든 테스트 PASS, `git diff --check` 출력 없음

- [ ] **Step 5: 타이포그래피 변경 커밋**

```bash
git add styles.css tests/site-content.test.mjs
git commit -m "style: 첫 화면 타이포그래피와 배경 보정" -m "첫 화면의 자간과 행간을 넓히고 전체 글자 굵기를 Bold 이하로 제한했습니다.
배경을 중성 화이트로 변경했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

### Task 2: Contact Me 너비 축소와 전체 회귀 검증

**Files:**
- Modify: `tests/site-content.test.mjs`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `.contact-card`의 기존 `min()` 기반 반응형 너비
- Produces: 데스크톱 기본 너비가 `15rem`이고 작은 화면에서 넘치지 않는 Contact Me 오버레이

- [ ] **Step 1: Contact Me 너비 계약의 실패 테스트 작성**

`tests/site-content.test.mjs`에 다음 테스트를 추가한다.

```js
test("Contact Me는 15rem 너비와 모바일 제한을 유지한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const contactRule = css.match(/\.contact-card\s*\{[\s\S]*?\}/)?.[0] ?? "";

  assert.match(contactRule, /width:\s*min\(15rem,\s*calc\(100vw - 2rem\)\)/);
});
```

- [ ] **Step 2: 테스트를 실행해 기존 18rem 때문에 실패하는지 확인**

Run: `node --test tests/site-content.test.mjs`

Expected: `.contact-card`의 `18rem` 값 때문에 FAIL

- [ ] **Step 3: Contact Me 너비만 수정**

`styles.css`의 `.contact-card`를 다음과 같이 변경한다.

```css
.contact-card {
  width: min(15rem, calc(100vw - 2rem));
}
```

- [ ] **Step 4: 전체 테스트와 정적 검사를 실행**

Run: `node --test tests/*.test.mjs && node --check scripts/main.js && node --check scripts/tv-scene.js && node --check scripts/tv-profile.js && git diff --check`

Expected: 0 failures, JavaScript 문법 오류 없음, `git diff --check` 출력 없음

- [ ] **Step 5: Contact Me 변경 커밋**

```bash
git add styles.css tests/site-content.test.mjs
git commit -m "style: Contact Me 오버레이 너비 축소" -m "Contact Me 기본 너비를 15rem으로 줄이고 모바일 뷰포트 제한을 유지했습니다.

Co-authored-by: Codex <noreply@openai.com>"
```

- [ ] **Step 6: 개발 서버와 제공 콘텐츠 확인**

Run: `podman compose up -d --force-recreate`

Expected: `0tak2githubio_portfolio_1` 컨테이너가 실행 상태

Run: `curl -fsS -D - http://127.0.0.1:2345/ -o /tmp/portfolio-typography-final.html`

Expected: `HTTP/1.1 200 OK`, nginx 정적 HTML 응답

Run: `open http://localhost:2345`

Expected: 기본 브라우저에서 갱신된 포트폴리오가 열림
