# TickiKaki

Einfache Tic-Tac-Toe-Webseite mit Login und Admin-Modus.

## Login

- Normaler Benutzer: Benutzername `player`, Passwort `132`
- Admin: Benutzername `admin`, Passwort `maio`

Der Admin-Modus enthält einen Button, mit dem der Admin-Sieg erzwungen werden kann.

## GitHub Pages

1. Repository öffnen.
2. **Settings → Pages** öffnen.
3. Bei **Build and deployment** als Quelle **Deploy from a branch** wählen.
4. Branch **main** und Ordner **/(root)** auswählen.
5. **Save** drücken.
6. Nach dem Deployment zeigt GitHub die öffentliche Website-Adresse an.

## Hinweis zur Sicherheit

Diese Version ist als einfache Demo für GitHub Pages gedacht. Die Passwörter stehen im JavaScript-Code und sind deshalb **nicht geheim**. Für eine echte öffentliche Anwendung sollte die Anmeldung serverseitig erfolgen, mit gehashten Passwörtern und einer Session/Auth-Lösung.

## Dateien

- `index.html` – Oberfläche
- `style.css` – Design
- `script.js` – Login und Spiel
