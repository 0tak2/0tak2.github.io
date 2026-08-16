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
    "서울시 마포구",
    "0tak2.code@gmail.com",
    "https://github.com/0tak2",
    "https://archiveyoung.tistory.com",
    "https://0tak2.github.io/T0L/",
  ]) {
    assert.ok(html.includes(value), `누락된 링크 또는 연락처: ${value}`);
  }
});
