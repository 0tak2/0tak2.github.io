import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("핵심 문구와 이름을 첫 화면에 둔다", () => {
  assert.match(html, /<header[^>]+class="hero"/);
  assert.match(html, /임영택/);
  assert.match(html, /YOUNGTAEK LIM/);
  assert.match(html, /상상을 컴파일하는[\s\S]*엔지니어/);
  assert.match(html, /기술과 비즈니스의 경계를 넘어[\s\S]*팀의 비전을 실현합니다/);
});

test("피피비스튜디오는 요청한 세 줄만 표시한다", () => {
  const section = html.match(/<article[^>]+data-company="ppb"[\s\S]*?<\/article>/)?.[0] ?? "";

  assert.match(section, /피피비스튜디오스/);
  assert.match(section, /2026\. 03 ~/);
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
  ]) {
    assert.ok(html.includes(text), `누락된 콘텐츠: ${text}`);
  }

  const academy = html.match(/<article class="experience">[\s\S]*?Apple Developer Academy @ POSTECH[\s\S]*?<\/article>/)?.[0] ?? "";
  assert.match(academy, /2025\. 03 ~ 2025\. 12/);
  assert.match(academy, /Apple 생태계 어플리케이션 개발/);
  assert.match(academy, /SwiftUI, Swift Data, ARKit, RealityKit/);
  assert.match(academy, /최종 프로젝트 &lt;찍자&gt;/);
  assert.match(academy, /상대와 연결하는 스트리밍 카메라 앱/);
  assert.match(academy, /https:\/\/apps\.apple\.com\/kr\/app\//);
});

test("기존 연락처와 링크를 보존한다", () => {
  for (const value of [
    "0tak2.code@gmail.com",
    "https://github.com/0tak2",
    "https://archiveyoung.tistory.com",
    "https://0tak2.github.io/T0L/",
    "https://www.instagram.com/0tag2/",
    "https://www.linkedin.com/in/0tag2/",
  ]) {
    assert.ok(html.includes(value), `누락된 링크 또는 연락처: ${value}`);
  }

  assert.match(html, /<address>[\s\S]*?<span>이메일<\/span>/);
  assert.doesNotMatch(html, /<span>서울<\/span>/);
  assert.doesNotMatch(html, /마포구/);

  const address = html.match(/<address>[\s\S]*?<\/address>/)?.[0] ?? "";
  assert.equal(address.match(/class="contact-row"/g)?.length, 3);
  assert.ok(address.indexOf("이메일") < address.indexOf("LinkedIn"));
  assert.ok(address.indexOf("LinkedIn") < address.indexOf("Instagram"));
  assert.match(address, /<span>LinkedIn<\/span>[\s\S]*?>@0tag2<\/a>/);
  assert.match(address, /<span>Instagram<\/span>[\s\S]*?>@0tag2<\/a>/);
});

test("별도 기술 나열 섹션을 표시하지 않는다", () => {
  assert.doesNotMatch(html, /id="stack"/);
  assert.doesNotMatch(html, /class="stack-list"/);
});

test("SUIT 고딕과 외부 스타일시트로 반응형 화면을 구성한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(html, /<link rel="stylesheet" href="\.\/styles\.css">/);
  assert.doesNotMatch(html, /cdn\.tailwindcss\.com/);
  assert.doesNotMatch(css, /font-family:[^;]*(?:Georgia|Times|(?<!-)serif)/i);
  assert.match(css, /font-family:\s*"SUIT"/);
  assert.match(css, /min-height:\s*100svh/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("Three.js import map과 모듈 진입점을 연결한다", () => {
  assert.match(html, /"three":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.180\.0\/build\/three\.module\.js"/);
  assert.match(html, /<script type="module" src="\.\/scripts\/main\.js"><\/script>/);
  assert.match(html, /id="hero-tv"/);
  assert.match(html, /class="tv-fallback"/);
});

test("정적 대체 TV도 비디오 신시사이징 화면을 제공한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

  assert.match(css, /@keyframes\s+video-synth-shift/);
  assert.match(css, /\.tv-fallback[\s\S]*background:\s*#0b0b0b/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*\.tv-fallback__screen/);
  assert.match(html, /코드와 컬러 영상이 표시되는 3D 브라운관 TV/);
});

test("Contact Me 오버레이는 기본으로 열리고 연락처 링크를 제공한다", () => {
  assert.match(html, /data-contact-card/);
  assert.match(html, /aria-controls="contact-panel"/);
  assert.match(html, /aria-expanded="true"/);
  assert.doesNotMatch(html, /id="contact-panel"[^>]*hidden/);
  assert.match(html, /href="mailto:0tak2\.code@gmail\.com"/);
  assert.match(html, /href="https:\/\/www\.instagram\.com\/0tag2\/"/);
  assert.match(html, /href="https:\/\/www\.linkedin\.com\/in\/0tag2\/"/);
  const panel = html.match(/id="contact-panel"[\s\S]*?<\/div>/)?.[0] ?? "";
  assert.ok(panel.indexOf("0tak2.code@gmail.com") < panel.indexOf("LinkedIn"));
  assert.ok(panel.indexOf("LinkedIn") < panel.indexOf("Instagram"));
});

test("Contact Me는 15rem 너비와 모바일 제한을 유지한다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const contactRule = css.match(/\.contact-card\s*\{[\s\S]*?\}/)?.[0] ?? "";

  assert.match(contactRule, /width:\s*min\(15rem,\s*calc\(100vw - 2rem\)\)/);
});

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

test("순택이 사진 세 장을 독립 오버레이로 제공한다", () => {
  assert.equal(html.match(/data-pet-overlay/g)?.length, 3);
  for (const image of ["soontaek-01.jpeg", "soontaek-02.jpeg", "soontaek-03.jpeg"]) {
    assert.match(html, new RegExp(`src="\\./assets/${image}"`));
  }
  assert.equal(html.match(/class="pet-card__handle"/g)?.length, 3);
});

test("기간을 검정색 큰 글씨로 표시하고 세 번째 순택이를 왼쪽 가장자리에 둔다", async () => {
  const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");
  const timeRule = css.match(/\.experience time\s*\{[\s\S]*?\}/)?.[0] ?? "";
  const thirdPetRule = css.match(/\.pet-card\[data-pet="3"\]\s*\{[\s\S]*?\}/)?.[0] ?? "";

  assert.match(timeRule, /color:\s*var\(--ink\)/);
  assert.match(timeRule, /font-size:\s*0\.95rem/);
  assert.match(thirdPetRule, /left:\s*0\.5rem/);
  assert.match(thirdPetRule, /top:\s*calc\(18vh \+ clamp\(/);
  assert.match(thirdPetRule, /bottom:\s*auto/);
});

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
