FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY services/api/server.mjs ./server.mjs
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
CMD ["node", "server.mjs"]
