"use strict";

const { getSession, handleError, redisCommand, rejectWrongHost, requireCsrf, requireSession, sameOrigin, secureHeaders, sendJson, sessionCookie, sessionKey } = require("../../lib/vercel-core");

module.exports = async function logoutHandler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Método não permitido." });
  }
  if (rejectWrongHost(request, response) || !sameOrigin(request)) {
    if (!response.headersSent) sendJson(response, 403, { error: "Origem não autorizada." });
    return;
  }

  try {
    const current = await getSession(request);
    if (current && !requireCsrf(request, response, current.session)) return;
    if (current) await redisCommand(["DEL", sessionKey(current.token)]);
    secureHeaders(response, true);
    response.setHeader("Set-Cookie", sessionCookie("", 0));
    response.status(200).json({ authenticated: false });
  } catch (error) {
    handleError(response, error);
  }
};
