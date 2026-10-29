"use strict";

const { getSession, handleError, rejectWrongHost, sameOrigin, secureHeaders, sendJson, requireSession } = require("../../lib/vercel-core");

module.exports = async function sessionHandler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return sendJson(response, 405, { error: "Método não permitido." });
  }
  if (rejectWrongHost(request, response) || !sameOrigin(request)) {
    if (!response.headersSent) sendJson(response, 403, { error: "Origem não autorizada." });
    return;
  }

  try {
    const current = await requireSession(request, response);
    if (!current) return;
    secureHeaders(response, true);
    response.status(200).json({ authenticated: true, csrfToken: current.session.csrf, username: current.session.username || "Administrador" });
  } catch (error) {
    handleError(response, error);
  }
};
