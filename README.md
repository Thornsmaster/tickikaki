# Vercel API-Key Tester

Eine kleine Webseite, die einen Vercel API-Token prüft. Du musst nur den Token eingeben und auf **Verbindung testen** klicken.

## Was der Tester macht

- Sendet den eingegebenen Token als `Authorization: Bearer <TOKEN>` an die Vercel REST API.
- Ruft automatisch `GET https://api.vercel.com/v2/user` auf.
- Zeigt an, ob Vercel den Token akzeptiert hat, sowie Kontoname, Benutzername und E-Mail (soweit von Vercel zurückgegeben).
- Zeigt HTTP-Status, Antwortzeit und die technische JSON-Antwort.

Die Authentifizierung und der Benutzer-Endpunkt entsprechen der [offiziellen Vercel-Dokumentation](https://vercel.com/docs/rest-api).

## Bereitstellung

**Wichtig:** Die Anwendung benötigt die Serverfunktion in `api/vercel-user.js`. GitHub Pages führt diese Funktion nicht aus. Die Seite muss daher auf Vercel bereitgestellt werden.

1. Öffne [Vercel](https://vercel.com/new) und melde dich an.
2. Importiere das GitHub-Repository `Thornsmaster/tickikaki`.
3. Lasse das Framework-Preset auf **Other** bzw. ohne Framework.
4. Starte das Deployment.
5. Öffne danach die von Vercel bereitgestellte URL und füge dort deinen Token ein.

Vercel stellt Dateien im Ordner `api` als serverseitige Funktionen bereit. Dafür ist keine weitere Abhängigkeit erforderlich.

## Umgang mit dem Token

- Der Token wird **nicht** in GitHub, im Quellcode, in `localStorage` oder in einer Datenbank gespeichert.
- Beim Klick auf den Test-Button wird der Token über HTTPS an die Serverfunktion dieses Vercel-Projekts gesendet. Diese fragt damit die Vercel API ab.
- Die Serverfunktion schreibt den Token nicht in Logs und speichert ihn nicht dauerhaft.
- Mit **Leeren** wird das Eingabefeld geleert. Beim Schließen der Seite geht der im Browser-Feld verbliebene Wert verloren.
- Verwende nur einen Token, den du selbst erstellt hast, und teile die bereitgestellte Tester-URL nicht unnötig. Für eine öffentlich genutzte Anwendung sollte zusätzlich ein Zugriffsschutz bzw. Rate-Limiting eingerichtet werden.

**Sicherheitshinweis:** Ein API-Token, der bereits in einem Chat, Screenshot oder an einem anderen unsicheren Ort geteilt wurde, sollte widerrufen und durch einen neuen ersetzt werden. Den Token niemals in Dateien dieses Repositories eintragen.

## Projektstruktur

```
index.html
style.css
script.js
package.json
api/
  vercel-user.js
```

## Technischer Ablauf

```
Browser (Token-Eingabe)
        |
        | POST /api/vercel-user
        v
Vercel Server Function
        |
        | GET /v2/user
        | Authorization: Bearer <TOKEN>
        v
Vercel REST API
```

Die Serverfunktion leitet nur den festen Profil-Endpunkt `/v2/user` auf, nicht beliebige URLs.
