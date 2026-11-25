// Minimal static server for checking the production build locally with the
// same clean-URL behaviour as Vercel (/projets -> projets.html).
// Usage: node scripts/serve.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve("dist");
const port = Number(process.argv[2] || 4180);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const p = path.join(root, clean);
  if (!p.startsWith(root)) return null;
  const candidates = clean.endsWith("/") ? [path.join(p, "index.html")] : [p, `${p}.html`, path.join(p, "index.html")];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) || null;
}

http
  .createServer((req, res) => {
    const file = resolve(req.url || "/");
    const target = file || path.join(root, "404.html");
    const ext = path.extname(target);
    const headers = { "Content-Type": types[ext] || "application/octet-stream" };
    if (target.includes(`${path.sep}assets${path.sep}`)) headers["Cache-Control"] = "public, max-age=31536000, immutable";
    const gzip = /gzip/.test(req.headers["accept-encoding"] || "") && [".html", ".js", ".css", ".svg", ".txt", ".xml"].includes(ext);
    if (gzip) headers["Content-Encoding"] = "gzip";
    res.writeHead(file ? 200 : 404, headers);
    const stream = fs.createReadStream(target);
    // during a rebuild dist/ is briefly empty: answer 503 instead of crashing
    stream.on("error", () => res.end());
    (gzip ? stream.pipe(zlib.createGzip()) : stream).pipe(res);
  })
  .listen(port, () => console.log(`http://localhost:${port}`));
