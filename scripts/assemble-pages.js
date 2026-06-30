import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const services = ["workspace", "jobs", "projects", "network", "interview", "profile", "hr-studio", "scale"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, ".build/gateway"), output, { recursive: true });

for (const service of services) {
  await cp(resolve(root, `.build/${service}`), resolve(output, service), { recursive: true });
}

await cp(resolve(output, "index.html"), resolve(output, "404.html"));
await writeFile(resolve(output, ".nojekyll"), "");
