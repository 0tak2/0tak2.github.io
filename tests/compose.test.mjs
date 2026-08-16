import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const compose = await readFile(new URL("../compose.yaml", import.meta.url), "utf8");
const nginx = await readFile(new URL("../infra/nginx.dev.conf", import.meta.url), "utf8");

test("개발 서버는 localhost 2345 포트와 읽기 전용 소스를 사용한다", () => {
  assert.match(compose, /127\.0\.0\.1:2345:80/);
  assert.match(compose, /nginx:1\.27-alpine/);
  assert.match(compose, /\.\/:\/usr\/share\/nginx\/html:ro/);
  assert.match(compose, /nginx\.dev\.conf:\/etc\/nginx\/conf\.d\/default\.conf:ro/);
});

test("nginx는 정적 파일과 SPA 루트만 제공하고 디렉터리 목록을 끈다", () => {
  assert.match(nginx, /listen\s+80/);
  assert.match(nginx, /root\s+\/usr\/share\/nginx\/html/);
  assert.match(nginx, /autoindex\s+off/);
  assert.match(nginx, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html/);
});
