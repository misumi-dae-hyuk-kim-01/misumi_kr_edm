// 의존성 없는 정적 파일 서버 (EDM 로컬 기동용)
//
// admin/index.html은 <script type="module">을 쓰기 때문에 file:// 로 직접 열면
// CORS 정책에 막혀 모듈이 로딩되지 않습니다. 반드시 http:// 로 서빙해야 합니다.
//
// 사용법 (프로젝트 루트에서):
//   node tools/serve.js              → 루트를 5173 포트로 서빙
//   node tools/serve.js . 5174       → 포트 지정
// 그 후 브라우저에서 http://localhost:5173/admin/index.html 접속
const http = require("http");
const fs = require("fs");
const path = require("path");

// path.resolve로 정규화 — 인자로 받은 슬래시 경로와 path.join의 백슬래시가 섞이면
// 아래 디렉터리 탈출 검사가 항상 실패해서 전부 403이 됩니다.
const ROOT = path.resolve(process.argv[2] || process.cwd());
const PORT = Number(process.argv[3] || 5173);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjml": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = path.resolve(path.join(ROOT, urlPath));

    // 디렉터리 탈출 방지
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.log(`404 ${urlPath}`);
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not Found: " + urlPath);
        return;
      }
      const type = MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      // no-store: 로컬 개발 중 JS/CSS 수정이 새로고침에 바로 반영되도록
      res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" }).end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`Serving ${ROOT}`);
    console.log(`  http://localhost:${PORT}/admin/index.html`);
  });
