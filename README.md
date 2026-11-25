# API Key Tester

Eine kleine statische Webseite zum Testen eines API-Keys gegen einen API-Endpunkt.

## Verwendung

1. GitHub Pages für dieses Repository aktivieren.
2. Webseite öffnen.
3. Den **API-Endpunkt** eintragen, z. B. die Test-/Health-Endpoint deiner API.
4. Den API-Key in das Feld **API-Key** einfügen.
5. Auswählen, wie die API den Key erwartet:
   - `Authorization: Bearer <API-Key>`
   - `Authorization: <API-Key>`
   - `x-api-key: <API-Key>`
   - `api-key: <API-Key>`
   - `X-API-Key: <API-Key>`
6. **API-Key testen** klicken.

Das Tool zeigt HTTP-Status, Antwortzeit und den Response-Body an.

## Wichtig zur Sicherheit

Der API-Key wird **nicht im Repository gespeichert** und ist nicht fest im JavaScript hinterlegt. Er wird erst beim Klick auf den Test-Button aus dem Browser an den angegebenen API-Endpunkt gesendet.

Trotzdem gilt: Eine reine GitHub-Pages-Webseite ist **kein sicherer Ort für geheime API-Keys**. Der Key ist im Browser vorhanden und kann vom Nutzer bzw. von Browser-Tools ausgelesen werden.

Wenn der API-Key, den du testen möchtest, echt und produktiv ist und bereits öffentlich geteilt wurde, solltest du ihn aus Sicherheitsgründen **widerrufen/rotieren** und einen neuen Key verwenden.

## CORS

Da die Anfrage direkt aus dem Browser kommt, muss die Ziel-API Browserzugriffe erlauben. Wenn die API kein passendes CORS-Header zurückgibt, kann der Browser die Anfrage blockieren. Das bedeutet nicht automatisch, dass der API-Key ungültig ist.

Für APIs ohne CORS-Unterstützung ist ein kleines serverseitiges Backend die bessere Lösung.

## GitHub Pages

Repository öffnen → **Settings → Pages** → **Deploy from a branch** → Branch **main** und Ordner **/(root)** → **Save**.

## Hinweis

Dieses Repository wurde von einem Tic-Tac-Toe-Projekt zu einem kleinen API-Key-Testtool umgebaut.
