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
});

test("기존 연락처와 링크를 보존한다", () => {
  for (const value of [
    "0tak2.code@gmail.com",
    "https://github.com/0tak2",
    "https://archiveyoung.tistory.com",
    "https://0tak2.github.io/T0L/",
  ]) {
    assert.ok(html.includes(value), `누락된 링크 또는 연락처: ${value}`);
  }

  assert.match(html, /<address>[\s\S]*?<span>서울<\/span>/);
  assert.doesNotMatch(html, /마포구/);
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

test("Contact Me 오버레이는 이메일과 접근 가능한 토글을 제공한다", () => {
  assert.match(html, /data-contact-card/);
  assert.match(html, /aria-controls="contact-panel"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /id="contact-panel"[^>]*hidden/);
  assert.match(html, /href="mailto:0tak2\.code@gmail\.com"/);
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
