import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import http from "node:http";
import { MongoClient } from "mongodb";
import pg from "pg";

const { Pool } = pg;
const port = Number(process.env.PORT || 8080);
const sessionSecret = String(process.env.SESSION_SECRET || "");
const cookieSecure = process.env.COOKIE_SECURE === "true";
const allowedOrigin = String(process.env.APP_ORIGIN || "").replace(/\/$/, "");
const mongoDatabase = process.env.MONGODB_DATABASE || "hiresphere";

if (sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters");
}

const postgres = new Pool({
  host: process.env.POSTGRES_HOST || "database",
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DATABASE || "hiresphere",
  user: process.env.POSTGRES_USERNAME || "hiresphere",
  password: process.env.POSTGRES_PASSWORD,
  max: Number(process.env.POSTGRES_POOL_SIZE || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
});

const mongoUsername = encodeURIComponent(process.env.MONGODB_ROOT_USERNAME || "hiresphere_admin");
const mongoPassword = encodeURIComponent(process.env.MONGODB_ROOT_PASSWORD || "");
const mongoHost = process.env.MONGODB_HOST || "database";
const mongoPort = Number(process.env.MONGODB_PORT || 27017);
const mongo = new MongoClient(`mongodb://${mongoUsername}:${mongoPassword}@${mongoHost}:${mongoPort}/?authSource=admin`, {
  connectTimeoutMS: 5_000,
  serverSelectionTimeoutMS: 5_000,
  maxPoolSize: 10
});
let mongoConnection;
let schemaConnection;

const requestBuckets = new Map();
const defaultProfile = {
  name: "Rahul Tiple",
  role: "DevOps Engineer",
  company: "Alyssum Global Services Pvt Ltd",
  bio: "DevOps engineer focused on reliable cloud platforms, Kubernetes, automation, and observability."
};

function json(response, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    ...extraHeaders
  });
  response.end(body);
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const separator = part.indexOf("=");
    return separator < 0 ? [part, ""] : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
  }));
}

function signature(value) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function validSignature(value, supplied) {
  const expected = signature(value);
  if (expected.length !== supplied.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}

function sessionId(request, response) {
  const token = parseCookies(request.headers.cookie).hiresphere_session || "";
  const [id, suppliedSignature] = token.split(".");
  if (id && suppliedSignature && /^[0-9a-f-]{36}$/i.test(id) && validSignature(id, suppliedSignature)) return id;

  const nextId = randomUUID();
  const secure = cookieSecure ? "; Secure" : "";
  response.setHeader("Set-Cookie", `hiresphere_session=${nextId}.${signature(nextId)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=2592000${secure}`);
  return nextId;
}

function rateLimited(request) {
  const forwarded = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const key = forwarded || request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = requestBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    requestBuckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 120;
}

function mutationAllowed(request) {
  if (request.headers["x-hiresphere-csrf"] !== "1") return false;
  if (!allowedOrigin) return true;
  return String(request.headers.origin || "").replace(/\/$/, "") === allowedOrigin;
}

async function requestBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 32_768) throw Object.assign(new Error("Request body is too large"), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON"), { status: 400 });
  }
}

function textField(value, label, maxLength, required = true) {
  const normalized = String(value ?? "").trim();
  if (required && !normalized) throw Object.assign(new Error(`${label} is required`), { status: 400 });
  if (normalized.length > maxLength) throw Object.assign(new Error(`${label} must be ${maxLength} characters or fewer`), { status: 400 });
  return normalized;
}

async function ensureSchema() {
  schemaConnection ||= postgres.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      account_type TEXT NOT NULL CHECK (account_type IN ('candidate', 'employer', 'interviewer', 'owner')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      headline TEXT NOT NULL,
      company TEXT,
      bio TEXT,
      location TEXT,
      completion SMALLINT NOT NULL DEFAULT 0 CHECK (completion BETWEEN 0 AND 100),
      profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `).catch((error) => {
    schemaConnection = undefined;
    throw error;
  });
  await schemaConnection;
}

async function ensureSessionUser(id) {
  await ensureSchema();
  await postgres.query(
    `INSERT INTO users (id, email, password_hash, account_type)
     VALUES ($1, $2, $3, 'candidate')
     ON CONFLICT (id) DO NOTHING`,
    [id, `${id}@session.hiresphere.local`, "managed-http-only-session"]
  );
}

function mapProfile(row) {
  if (!row) return defaultProfile;
  return {
    name: row.full_name,
    role: row.headline,
    company: row.company || "",
    bio: row.bio || ""
  };
}

async function readProfile(id) {
  await ensureSessionUser(id);
  const result = await postgres.query(
    "SELECT full_name, headline, company, bio FROM candidate_profiles WHERE user_id = $1",
    [id]
  );
  return mapProfile(result.rows[0]);
}

async function saveProfile(id, input) {
  const profile = {
    name: textField(input.name, "Full name", 120),
    role: textField(input.role, "Role", 160),
    company: textField(input.company, "Company", 180),
    bio: textField(input.bio, "About", 2_000, false)
  };

  const connection = await postgres.connect();
  try {
    await connection.query("BEGIN");
    await connection.query(
      `INSERT INTO users (id, email, password_hash, account_type)
       VALUES ($1, $2, $3, 'candidate')
       ON CONFLICT (id) DO NOTHING`,
      [id, `${id}@session.hiresphere.local`, "managed-http-only-session"]
    );
    await connection.query(
      `INSERT INTO candidate_profiles (user_id, full_name, headline, company, bio, completion, updated_at)
       VALUES ($1, $2, $3, $4, $5, 100, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         headline = EXCLUDED.headline,
         company = EXCLUDED.company,
         bio = EXCLUDED.bio,
         completion = EXCLUDED.completion,
         updated_at = NOW()`,
      [id, profile.name, profile.role, profile.company, profile.bio]
    );
    await connection.query("COMMIT");
  } catch (error) {
    await connection.query("ROLLBACK");
    throw error;
  } finally {
    connection.release();
  }

  try {
    mongoConnection ||= mongo.connect();
    const client = await mongoConnection;
    await client.db(mongoDatabase).collection("activity_events").insertOne({
      eventType: "profile.updated",
      actorId: id,
      subjectId: id,
      payload: { fields: ["name", "role", "company", "bio"] },
      occurredAt: new Date()
    });
  } catch (error) {
    mongoConnection = undefined;
    console.error("MongoDB activity write failed", error.message);
  }

  return profile;
}

async function ready() {
  await ensureSchema();
  await postgres.query("SELECT 1");
  mongoConnection ||= mongo.connect();
  const client = await mongoConnection;
  await client.db("admin").command({ ping: 1 });
}

const server = http.createServer(async (request, response) => {
  try {
    if (rateLimited(request)) return json(response, 429, { error: "Too many requests" }, { "Retry-After": "60" });

    const url = new URL(request.url, "http://api.internal");
    if (request.method === "GET" && url.pathname === "/healthz") return json(response, 200, { status: "ok" });
    if (request.method === "GET" && url.pathname === "/readyz") {
      try {
        await ready();
        return json(response, 200, { status: "ready" });
      } catch {
        return json(response, 503, { status: "not-ready" });
      }
    }

    if (url.pathname === "/api/v1/profile" && request.method === "GET") {
      const id = sessionId(request, response);
      return json(response, 200, { profile: await readProfile(id) });
    }

    if (url.pathname === "/api/v1/profile" && request.method === "PUT") {
      if (!mutationAllowed(request)) return json(response, 403, { error: "Request origin or CSRF header is invalid" });
      const id = sessionId(request, response);
      const profile = await saveProfile(id, await requestBody(request));
      return json(response, 200, { profile });
    }

    return json(response, 404, { error: "Not found" });
  } catch (error) {
    const status = Number(error.status) || 500;
    if (status >= 500) console.error("API request failed", error.message);
    return json(response, status, { error: status >= 500 ? "Internal server error" : error.message });
  }
});

server.listen(port, "0.0.0.0", () => console.log(`HireSphere API listening on ${port}`));

async function shutdown() {
  server.close();
  await Promise.allSettled([postgres.end(), mongo.close()]);
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
