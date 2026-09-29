"use strict";

const path = require("node:path");
const crypto = require("node:crypto");
const { promises: fs } = require("node:fs");
const { promisify } = require("node:util");

const scrypt = promisify(crypto.scrypt);
const ROOT = path.resolve(__dirname, "..");
const SESSION_IDLE_SECONDS = 30 * 60;
const SESSION_MAX_MS = 8 * 60 * 60 * 1000;
const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_CONTENT_BYTES = 1_000_000;
const KEY_PREFIX = process.env.ADMIN_STORAGE_PREFIX || "m4t";
const EDITABLE_FILES = Object.freeze([
  "index.html", "blog/index.html", "cursos/index.html", "cartao/index.html",
  "blog/ALTERAÇÕES-blog.txt", "blog/ARTIGOS-blog.txt",
  "assets/css/base.css", "assets/css/blog.css", "assets/css/card.css",
  "assets/css/courses.css", "assets/css/home.css",
  "assets/js/courses.js", "assets/js/site.js"
]);
const editableSet = new Set(EDITABLE_FILES);
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".txt", "text/plain; charset=utf-8"]
]);

class ConfigurationError extends Error {}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function timingSafeTextEqual(left, right) {
  const leftHash = crypto.createHash("sha256").update(String(left), "utf8").digest();
  const rightHash = crypto.createHash("sha256").update(String(right), "utf8").digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function secret() {
  const value = process.env.SESSION_SECRET || "";
  if (value.length < 32) throw new ConfigurationError("SESSION_SECRET ausente ou muito curto.");
  return value;
}

function fingerprint(value) {
  return crypto.createHmac("sha256", secret()).update(String(value)).digest("hex");
}

function redisConfiguration(required = true) {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
  if ((!url || !token) && required) throw new ConfigurationError("O armazenamento Redis não está conectado ao projeto.");
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

async function redisCommand(command, options = {}) {
  const configuration = redisConfiguration(options.required !== false);
  if (!configuration) return null;
  const endpoint = options.pipeline ? "/pipeline" : options.transaction ? "/multi-exec" : "";
  const response = await fetch(`${configuration.url}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "User-Agent": "mecanica-4-tempos-admin/1.0"
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(8_000)
  });
  if (!response.ok) throw new Error(`Falha no armazenamento (${response.status}).`);
  const data = await response.json();
  if (data && !Array.isArray(data) && data.error) throw new Error("Falha ao executar uma operação no armazenamento.");
  return data;
}

function unwrap(result) {
  if (result && typeof result === "object" && Object.hasOwn(result, "error")) throw new Error("Falha ao executar uma operação no armazenamento.");
  return result && typeof result === "object" && Object.hasOwn(result, "result") ? result.result : result;
}

function hashToObject(value) {
  const output = {};
  const list = unwrap(value);
  if (!Array.isArray(list)) return output;
  for (let index = 0; index < list.length; index += 2) output[list[index]] = list[index + 1];
  return output;
}

function normalizeEditablePath(value) {
  if (typeof value !== "string" || value.length > 240 || value.includes("\0") || value.includes("\\")) return null;
  const normalized = value.replace(/^\/+/, "");
  return editableSet.has(normalized) ? normalized : null;
}

async function baseFile(filePath) {
  const normalized = normalizeEditablePath(filePath);
  if (!normalized) return null;
  const absolute = path.resolve(ROOT, ...normalized.split("/"));
  if (!absolute.startsWith(`${ROOT}${path.sep}`)) return null;
  const stats = await fs.lstat(absolute).catch(() => null);
  if (!stats?.isFile() || stats.isSymbolicLink() || stats.size > MAX_CONTENT_BYTES) return null;
  const content = await fs.readFile(absolute, "utf8");
  return { path: normalized, content, revision: sha256(content), updatedAt: stats.mtime.toISOString(), size: stats.size };
}

function contentKey(filePath) { return `${KEY_PREFIX}:content:${filePath}`; }
function backupKey(filePath) { return `${KEY_PREFIX}:backups:${filePath}`; }

async function getFile(filePath, options = {}) {
  const base = await baseFile(filePath);
  if (!base) return null;
  const stored = await redisCommand(["HGETALL", contentKey(base.path)], { required: options.requireStorage === true }).catch(error => {
    if (options.requireStorage) throw error;
    console.error("Conteúdo persistente indisponível; usando arquivo publicado.", error.message);
    return null;
  });
  const override = stored ? hashToObject(stored) : {};
  if (typeof override.content !== "string" || !override.revision) return base;
  return {
    path: base.path, content: override.content, revision: override.revision,
    updatedAt: override.updatedAt || base.updatedAt,
    size: Number.parseInt(override.size || "0", 10) || Buffer.byteLength(override.content, "utf8")
  };
}

async function listFiles() {
  redisConfiguration(true);
  const baseFiles = await Promise.all(EDITABLE_FILES.map(baseFile));
  const commands = baseFiles.map(file => ["HMGET", contentKey(file.path), "size", "updatedAt"]);
  const results = await redisCommand(commands, { pipeline: true });
  return baseFiles.map((file, index) => {
    const stored = unwrap(results[index]);
    return {
      path: file.path,
      size: Array.isArray(stored) && stored[0] ? Number.parseInt(stored[0], 10) : file.size,
      updatedAt: Array.isArray(stored) && stored[1] ? stored[1] : file.updatedAt
    };
  }).sort((a, b) => a.path.localeCompare(b.path, "pt-BR"));
}

async function saveFile(filePath, content, expectedRevision) {
  redisConfiguration(true);
  const base = await baseFile(filePath);
  if (!base || typeof content !== "string" || typeof expectedRevision !== "string") return { status: "invalid" };
  const size = Buffer.byteLength(content, "utf8");
  if (size > MAX_CONTENT_BYTES) return { status: "too_large" };
  const previous = await getFile(base.path, { requireStorage: true });
  const nextRevision = sha256(content);
  const now = new Date().toISOString();
  const backup = JSON.stringify({ at: now, revision: expectedRevision, content: previous.content });
  const script = [
    "local current = redis.call('HGET', KEYS[1], 'revision')",
    "if not current then current = ARGV[1] end",
    "if current ~= ARGV[2] then return {0, current} end",
    "redis.call('LPUSH', KEYS[2], ARGV[3])",
    "redis.call('LTRIM', KEYS[2], 0, 19)",
    "redis.call('HSET', KEYS[1], 'content', ARGV[4], 'revision', ARGV[5], 'updatedAt', ARGV[6], 'size', ARGV[7])",
    "return {1, ARGV[5]}"
  ].join("\n");
  const result = unwrap(await redisCommand([
    "EVAL", script, 2, contentKey(base.path), backupKey(base.path),
    base.revision, expectedRevision, backup, content, nextRevision, now, String(size)
  ]));
  if (!Array.isArray(result) || Number(result[0]) !== 1) return { status: "conflict", revision: Array.isArray(result) ? result[1] : "" };
  return { status: "saved", revision: nextRevision, updatedAt: now };
}

function requestIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  return (Array.isArray(forwarded) ? forwarded[0] : String(forwarded || "").split(",")[0]).trim() || request.socket?.remoteAddress || "unknown";
}

function parseCookies(request) {
  const cookies = {};
  for (const pair of String(request.headers.cookie || "").split(";")) {
    const separator = pair.indexOf("=");
    if (separator < 1) continue;
    try { cookies[pair.slice(0, separator).trim()] = decodeURIComponent(pair.slice(separator + 1).trim()); } catch { /* ignorado */ }
  }
  return cookies;
}

function allowedHost(request) {
  const host = String(request.headers.host || "").split(":")[0].toLowerCase();
  const configured = new Set((process.env.ALLOWED_HOSTS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean));
  for (const vercelHost of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) {
    if (vercelHost) configured.add(vercelHost.toLowerCase());
  }
  return configured.size > 0 && configured.has(host);
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return request.headers["sec-fetch-site"] === "same-origin";
  try { return new URL(origin).host === request.headers.host; } catch { return false; }
}

function secureHeaders(response, isAdmin = true) {
  const csp = isAdmin
    ? "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
    : "default-src 'self'; script-src 'self' https://cdn.vercel-insights.com; style-src 'self' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'";
  response.setHeader("Content-Security-Policy", csp);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Robots-Tag", isAdmin ? "noindex, nofollow, noarchive" : "index, follow");
}

function sendJson(response, status, payload) {
  secureHeaders(response, true);
  response.status(status).json(payload);
}

function rejectWrongHost(request, response) {
  if (allowedHost(request)) return false;
  sendJson(response, 421, { error: "Host não permitido." });
  return true;
}

function readJson(request) {
  if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    const error = new Error("Envie dados no formato JSON."); error.status = 415; throw error;
  }
  let body;
  try { body = typeof request.body === "string" ? JSON.parse(request.body) : request.body; }
  catch { const error = new Error("JSON inválido."); error.status = 400; throw error; }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    const error = new Error("JSON inválido."); error.status = 400; throw error;
  }
  return body;
}

function sessionCookie(token, maxAge = SESSION_MAX_MS / 1000) {
  return `admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(maxAge)}`;
}

async function audit(event, request, details = {}) {
  const record = JSON.stringify({ at: new Date().toISOString(), event, client: fingerprint(requestIp(request)).slice(0, 16), ...details });
  await redisCommand([["LPUSH", `${KEY_PREFIX}:audit`, record], ["LTRIM", `${KEY_PREFIX}:audit`, 0, 999]], { transaction: true });
}

function sessionKey(token) { return `${KEY_PREFIX}:session:${sha256(token)}`; }

async function getSession(request) {
  const token = parseCookies(request).admin_session;
  if (!token || token.length > 200) return null;
  const raw = unwrap(await redisCommand(["GET", sessionKey(token)]));
  if (typeof raw !== "string") return null;
  let session;
  try { session = JSON.parse(raw); } catch { return null; }
  const expired = Date.now() - session.createdAt > SESSION_MAX_MS;
  const userAgentChanged = !timingSafeTextEqual(session.userAgent, fingerprint(request.headers["user-agent"] || ""));
  if (expired || userAgentChanged) {
    await redisCommand(["DEL", sessionKey(token)]);
    return null;
  }
  await redisCommand(["EXPIRE", sessionKey(token), SESSION_IDLE_SECONDS]);
  return { token, session };
}

async function requireSession(request, response) {
  const current = await getSession(request);
  if (!current) {
    sendJson(response, 401, { error: "Sua sessão expirou. Entre novamente." });
    return null;
  }
  return current;
}

function requireCsrf(request, response, session) {
  const token = request.headers["x-csrf-token"];
  if (typeof token !== "string" || !timingSafeTextEqual(token, session.csrf)) {
    sendJson(response, 403, { error: "A verificação de segurança falhou. Atualize a página e tente novamente." });
    return false;
  }
  return true;
}

async function verifyCredentials(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL || "";
  const [saltEncoded, hashEncoded, ...extra] = String(process.env.ADMIN_PASSWORD_HASH || "").split(":");
  const salt = Buffer.from(saltEncoded || "", "base64url");
  const expected = Buffer.from(hashEncoded || "", "base64url");
  const protectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!adminEmail) throw new ConfigurationError("Credenciais administrativas não configuradas.");
  if (!extra.length && salt.length >= 16 && expected.length === 64) {
    const derived = await scrypt(String(password), salt, expected.length, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    return timingSafeTextEqual(email, adminEmail) && crypto.timingSafeEqual(derived, expected);
  }
  if (protectedPassword.length < 12) throw new ConfigurationError("Credenciais administrativas não configuradas.");
  return timingSafeTextEqual(email, adminEmail) && timingSafeTextEqual(password, protectedPassword);
}

async function loginRate(request) {
  const key = `${KEY_PREFIX}:login:${fingerprint(requestIp(request))}`;
  const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n";
  const count = Number(unwrap(await redisCommand(["EVAL", script, 1, key, LOGIN_WINDOW_SECONDS])));
  return { key, count };
}

function handleError(response, error) {
  console.error(error);
  if (error instanceof ConfigurationError) return sendJson(response, 503, { error: "O painel ainda precisa concluir a configuração segura na Vercel." });
  return sendJson(response, error.status || 500, { error: error.status ? error.message : "Ocorreu um erro interno." });
}

module.exports = {
  audit, getFile, getSession, handleError, listFiles, loginRate, mimeTypes,
  normalizeEditablePath, readJson, redisCommand, rejectWrongHost, requireCsrf,
  requireSession, sameOrigin, saveFile, secureHeaders, sendJson, sessionCookie,
  sessionKey, sha256, unwrap, verifyCredentials, fingerprint
};
