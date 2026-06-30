FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build:component -- --mode projects
FROM nginxinc/nginx-unprivileged:1.27-alpine
USER root
COPY --chown=101:101 services/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/.build/projects/ /usr/share/nginx/html/
RUN chmod -R 755 /usr/share/nginx/html
USER 101:101
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
