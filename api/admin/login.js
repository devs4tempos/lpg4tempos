"use strict";

const crypto = require("node:crypto");
const {
  audit, fingerprint, handleError, loginRate, readJson, redisCommand, rejectWrongHost,
  sameOrigin, secureHeaders, sendJson, sessionCookie, sessionKey, verifyCredentials
} = require("../../lib/vercel-core");

const SESSION_IDLE_SECONDS = 30 * 60;

module.exports = async function loginHandler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Método não permitido." });
  }
  if (rejectWrongHost(request, response) || !sameOrigin(request)) {
    if (!response.headersSent) sendJson(response, 403, { error: "Origem não autorizada." });
    return;
  }

  try {
    const body = readJson(request);
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    if (!username || !password) return sendJson(response, 400, { error: "Informe usuário e senha." });

    const rate = await loginRate(request);
    if (rate.count > 8) return sendJson(response, 429, { error: "Muitas tentativas. Aguarde alguns minutos." });
    if (!(await verifyCredentials(username, password))) {
      await audit("login_failed", request).catch(() => {});
      return sendJson(response, 401, { error: "Usuário ou senha inválidos." });
    }

    const sessionToken = crypto.randomBytes(32).toString("base64url");
    const csrfToken = crypto.randomBytes(24).toString("base64url");
    const session = {
      createdAt: Date.now(),
      csrf: csrfToken,
      userAgent: fingerprint(request.headers["user-agent"] || ""),
      username
    };
    await redisCommand(["SET", sessionKey(sessionToken), JSON.stringify(session), "EX", SESSION_IDLE_SECONDS]);
    await audit("login_success", request, { username }).catch(() => {});
    secureHeaders(response, true);
    response.setHeader("Set-Cookie", sessionCookie(sessionToken));
    response.status(200).json({ authenticated: true, csrfToken, username });
  } catch (error) {
    handleError(response, error);
  }
};
