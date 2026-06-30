import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "../dist");
const mount = "/hiresphere";
const services = ["workspace", "jobs", "projects", "network", "interview", "profile", "hr-studio", "scale"];
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png"
};

function safePath(pathname) {
  const relative = pathname === mount || pathname === `${mount}/`
    ? ""
    : pathname.startsWith(`${mount}/`)
      ? pathname.slice(mount.length + 1)
      : null;
  if (relative === null) return null;
  const target = resolve(root, relative || ".");
  return target === root || target.startsWith(`${root}${sep}`) ? target : null;
}

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  let target = safePath(pathname);
  if (!target) {
    response.writeHead(400).end("Bad request");
    return;
  }

  try {
    const details = await stat(target);
    if (details.isDirectory()) {
      if (!pathname.endsWith("/")) {
        response.writeHead(308, { Location: `${pathname}/` }).end();
        return;
      }
      target = resolve(target, "index.html");
    }
    const body = await readFile(target);
    response.writeHead(200, { "Content-Type": contentTypes[extname(target)] || "application/octet-stream" }).end(body);
  } catch {
    const fallback = await readFile(resolve(root, "404.html"));
    response.writeHead(404, { "Content-Type": contentTypes[".html"] }).end(fallback);
  }
});

await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
const { port } = server.address();
const origin = `http://127.0.0.1:${port}`;

try {
  const rootResponse = await fetch(`${origin}${mount}/`);
  if (!rootResponse.ok) throw new Error(`Gateway returned ${rootResponse.status}`);

  for (const service of services) {
    const direct = await fetch(`${origin}${mount}/${service}`, { redirect: "manual" });
    if (direct.status !== 308 || direct.headers.get("location") !== `${mount}/${service}/`) {
      throw new Error(`${service} did not redirect to its trailing-slash route`);
    }

    const pageUrl = `${origin}${mount}/${service}/`;
    const page = await fetch(pageUrl);
    const html = await page.text();
    if (!page.ok || !html.includes("type=\"module\"")) {
      throw new Error(`${service} page returned ${page.status} or has no module bundle`);
    }

    const source = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
    if (!source) throw new Error(`${service} page has no script source`);
    const bundle = await fetch(new URL(source, pageUrl));
    if (!bundle.ok) throw new Error(`${service} bundle returned ${bundle.status}`);
  }

  const missing = await fetch(`${origin}${mount}/missing-page`, { redirect: "manual" });
  if (missing.status !== 404) throw new Error(`Missing page returned ${missing.status}, expected 404`);
  console.log(`Pages routes verified: gateway + ${services.length} microservices`);
} finally {
  await new Promise((resolveClose) => server.close(resolveClose));
}
