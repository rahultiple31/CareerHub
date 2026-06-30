import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const buildRoot = path.join(root, ".build");
const pagesRoot = path.join(buildRoot, "pages");
const services = [
  "workspace",
  "jobs",
  "projects",
  "network",
  "interview",
  "profile",
  "hr-studio",
  "scale"
];

await rm(pagesRoot, { recursive: true, force: true });
await mkdir(pagesRoot, { recursive: true });
await cp(path.join(buildRoot, "gateway"), pagesRoot, { recursive: true });

for (const service of services) {
  await cp(path.join(buildRoot, service), path.join(pagesRoot, service), { recursive: true });
}

await writeFile(path.join(pagesRoot, ".nojekyll"), "");
