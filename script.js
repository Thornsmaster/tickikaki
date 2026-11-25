const form = document.getElementById("testForm");
const apiKeyEl = document.getElementById("apiKey");
const testBtn = document.getElementById("testBtn");
const clearBtn = document.getElementById("clearBtn");
const toggleTokenBtn = document.getElementById("toggleTokenBtn");

const resultCard = document.getElementById("resultCard");
const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");
const statusBadge = document.getElementById("statusBadge");
const httpStatus = document.getElementById("httpStatus");
const duration = document.getElementById("duration");
const accountPanel = document.getElementById("accountPanel");
const accountName = document.getElementById("accountName");
const accountDetails = document.getElementById("accountDetails");
const responseOutput = document.getElementById("responseOutput");

form.addEventListener("submit", testVercelToken);
clearBtn.addEventListener("click", clearForm);
toggleTokenBtn.addEventListener("click", toggleTokenVisibility);

async function testVercelToken(event) {
  event.preventDefault();

  const token = apiKeyEl.value.trim();
  if (!token) {
    showResult({
      title: "Token fehlt",
      summary: "Bitte füge zuerst deinen Vercel API-Token ein.",
      status: "FEHLER",
      kind: "error",
      http: "–",
      time: "–"
    });
    return;
  }

  setLoading(true);
  resultCard.classList.remove("hidden");
  accountPanel.classList.add("hidden");
  resultTitle.textContent = "Verbindung wird geprüft";
  resultSummary.textContent = "Der Tester fragt dein Vercel-Konto ab …";
  statusBadge.className = "status loading";
  statusBadge.textContent = "TESTE";
  httpStatus.textContent = "–";
  duration.textContent = "–";
  responseOutput.textContent = "";

  const started = performance.now();

  try {
    const response = await fetch("/api/vercel-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ token })
    });

    const elapsed = Math.round(performance.now() - started);
    const contentType = response.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const rawText = await response.text();
      data = rawText ? { message: rawText.slice(0, 1500) } : {};
    }

    httpStatus.textContent = String(response.status);
    duration.textContent = elapsed + " ms";
    responseOutput.textContent = formatResponse(data);

    if (response.status === 404 && !contentType.includes("application/json")) {
      showFailure(
        "Backend nicht gefunden",
        "Diese Version muss über Vercel bereitgestellt sein. GitHub Pages kann die benötigte Serverfunktion nicht ausführen.",
        response.status,
        elapsed
      );
      return;
    }

    if (!response.ok) {
      let message = "Vercel hat die Anfrage abgelehnt.";

      if (response.status === 401) {
        message = "Der Token ist ungültig, abgelaufen oder wurde widerrufen.";
      } else if (response.status === 403) {
        message = "Der Token ist gültig, hat aber nicht die nötigen Berechtigungen für diese Anfrage.";
      } else if (response.status === 429) {
        message = "Zu viele Anfragen. Bitte warte kurz und versuche es erneut.";
      } else if (response.status >= 500) {
        message = "Bei Vercel ist ein Serverfehler aufgetreten. Versuche es später erneut.";
      } else if (data && (data.error || data.message)) {
        message = String(data.error || data.message);
      }

      showFailure("Verbindung fehlgeschlagen", message, response.status, elapsed);
      return;
    }

    const user = data && data.user;
    if (!user) {
      showFailure(
        "Unerwartete Antwort",
        "Die Anfrage war erfolgreich, aber die erwarteten Kontodaten wurden nicht gefunden.",
        response.status,
        elapsed
      );
      return;
    }

    const displayName = user.name || user.username || "Vercel-Nutzer";
    const details = [user.username, user.email].filter(Boolean).join(" · ");

    accountName.textContent = displayName;
    accountDetails.textContent = details || "Vercel-Konto erfolgreich erreicht";
    accountPanel.classList.remove("hidden");

    showResult({
      title: "Verbindung erfolgreich",
      summary: "Dein API-Token wurde von Vercel akzeptiert.",
      status: "VERBUNDEN",
      kind: "success",
      http: response.status,
      time: elapsed + " ms"
    });
  } catch {
    const elapsed = Math.round(performance.now() - started);
    showFailure(
      "Anfrage fehlgeschlagen",
      "Der Tester konnte das Backend nicht erreichen. Prüfe, ob die Website über Vercel geöffnet wurde und versuche es erneut.",
      "Keine Antwort",
      elapsed
    );
    responseOutput.textContent = "Backend nicht erreichbar.";
  } finally {
    setLoading(false);
  }
}

function showFailure(title, summary, http, elapsed) {
  showResult({
    title,
    summary,
    status: "FEHLER",
    kind: "error",
    http,
    time: elapsed + " ms"
  });
}

function showResult({ title, summary, status, kind, http, time }) {
  resultCard.classList.remove("hidden");
  resultTitle.textContent = title;
  resultSummary.textContent = summary;
  statusBadge.className = "status " + kind;
  statusBadge.textContent = status;
  httpStatus.textContent = String(http);
  duration.textContent = time;
}

function formatResponse(data) {
  return JSON.stringify(data, null, 2);
}

function setLoading(loading) {
  testBtn.disabled = loading;
  testBtn.textContent = loading ? "Prüfe Verbindung …" : "Verbindung testen";
}

function clearForm() {
  apiKeyEl.value = "";
  apiKeyEl.type = "password";
  toggleTokenBtn.textContent = "Anzeigen";
  toggleTokenBtn.setAttribute("aria-label", "Token anzeigen");
  resultCard.classList.add("hidden");
  accountPanel.classList.add("hidden");
  responseOutput.textContent = "";
  apiKeyEl.focus();
}

function toggleTokenVisibility() {
  const visible = apiKeyEl.type === "password";
  apiKeyEl.type = visible ? "text" : "password";
  toggleTokenBtn.textContent = visible ? "Verbergen" : "Anzeigen";
  toggleTokenBtn.setAttribute(
    "aria-label",
    visible ? "Token verbergen" : "Token anzeigen"
  );
}
