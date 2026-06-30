import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const services = new Set([
  "workspace", "jobs", "projects", "network",
  "interview", "profile", "hr-studio", "scale"
]);

export default defineConfig(({ mode }) => {
  const component = services.has(mode) ? mode : "gateway";
  const root = component === "gateway" ? "." : `services/${component}`;

  return {
    root,
    base: "./",
    publicDir: component === "workspace"
      ? fileURLToPath(new URL("./assets", import.meta.url))
      : false,
    plugins: [react()],
    server: { port: 5173 },
    build: {
      outDir: fileURLToPath(new URL(`./.build/${component}`, import.meta.url)),
      emptyOutDir: true,
      sourcemap: false
    }
  };
});
