const endpointEl = document.getElementById("endpoint");
const methodEl = document.getElementById("method");
const apiKeyEl = document.getElementById("apiKey");
const headerNameEl = document.getElementById("headerName");
const authPrefixEl = document.getElementById("authPrefix");
const authorizationFormatEl = document.getElementById("authorizationFormat");
const bodySectionEl = document.getElementById("bodySection");
const requestBodyEl = document.getElementById("requestBody");
const testBtn = document.getElementById("testBtn");
const clearBtn = document.getElementById("clearBtn");

const resultCard = document.getElementById("resultCard");
const resultSummary = document.getElementById("resultSummary");
const statusBadge = document.getElementById("statusBadge");
const httpStatus = document.getElementById("httpStatus");
const duration = document.getElementById("duration");
const responseOutput = document.getElementById("responseOutput");

methodEl.addEventListener("change", updateMethodUI);
headerNameEl.addEventListener("change", updateHeaderUI);
testBtn.addEventListener("click", testApi);
clearBtn.addEventListener("click", clearForm);

updateMethodUI();
updateHeaderUI();

function updateMethodUI() {
  bodySectionEl.classList.toggle("hidden", !["POST", "PUT", "PATCH"].includes(methodEl.value));
}

function updateHeaderUI() {
  const isAuthorization = headerNameEl.value.toLowerCase() === "authorization";
  authorizationFormatEl.classList.toggle("hidden", !isAuthorization);
}

function clearForm() {
  endpointEl.value = "";
  apiKeyEl.value = "";
  requestBodyEl.value = "";
  resultCard.classList.add("hidden");
  responseOutput.textContent = "";
}

async function testApi() {
  const endpoint = endpointEl.value.trim();
  const apiKey = apiKeyEl.value.trim();
  const method = methodEl.value;
  const headerName = headerNameEl.value;

  if (!endpoint) {
    showError("Bitte einen API-Endpunkt eingeben.");
    return;
  }

  if (!apiKey) {
    showError("Bitte einen API-Key eingeben.");
    return;
  }

  try {
    new URL(endpoint);
  } catch {
    showError("Der API-Endpunkt ist keine gültige URL.");
    return;
  }

  let body = undefined;

  if (["POST", "PUT", "PATCH"].includes(method)) {
    const rawBody = requestBodyEl.value.trim();

    if (rawBody) {
      try {
        JSON.parse(rawBody);
      } catch {
        showError("Der JSON-Body ist ungültig.");
        return;
      }
      body = rawBody;
    }
  }

  const headers = {};

  if (headerName.toLowerCase() === "authorization") {
    headers[headerName] = authPrefixEl.value === "Bearer"
      ? `Bearer ${apiKey}`
      : apiKey;
  } else {
    headers[headerName] = apiKey;
  }

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  setLoading(true);
  resultCard.classList.remove("hidden");
  statusBadge.className = "status loading";
  statusBadge.textContent = "TESTE";
  resultSummary.textContent = "Anfrage wird gesendet …";
  httpStatus.textContent = "–";
  duration.textContent = "–";
  responseOutput.textContent = "";

  const started = performance.now();

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body
    });

    const elapsed = Math.round(performance.now() - started);
    const text = await response.text();

    httpStatus.textContent = `${response.status} ${response.statusText}`;
    duration.textContent = `${elapsed} ms`;
    responseOutput.textContent = formatResponse(text);

    if (response.ok) {
      statusBadge.className = "status success";
      statusBadge.textContent = "AKZEPTIERT";
      resultSummary.textContent = "Die API hat eine erfolgreiche HTTP-Antwort zurückgegeben.";
    } else {
      statusBadge.className = "status error";
      statusBadge.textContent = "ABGELEHNT";
      resultSummary.textContent = "Die API hat den Request mit einem Fehlerstatus beantwortet.";
    }
  } catch (error) {
    const elapsed = Math.round(performance.now() - started);
    httpStatus.textContent = "Keine Antwort";
    duration.textContent = `${elapsed} ms`;
    statusBadge.className = "status error";
    statusBadge.textContent = "FEHLER";

    if (error instanceof TypeError) {
      resultSummary.textContent = "Die Anfrage konnte nicht aus dem Browser gesendet werden. Häufige Ursache: CORS oder eine nicht erreichbare URL.";
      responseOutput.textContent = error.message || "Network error";
    } else {
      resultSummary.textContent = "Beim Testen ist ein Fehler aufgetreten.";
      responseOutput.textContent = String(error);
    }
  } finally {
    setLoading(false);
  }
}

function formatResponse(text) {
  if (!text) return "(Leere Antwort)";

  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

function showError(message) {
  resultCard.classList.remove("hidden");
  statusBadge.className = "status error";
  statusBadge.textContent = "FEHLER";
  resultSummary.textContent = message;
  httpStatus.textContent = "–";
  duration.textContent = "–";
  responseOutput.textContent = "";
}

function setLoading(loading) {
  testBtn.disabled = loading;
  testBtn.textContent = loading ? "Teste …" : "API-Key testen";
}