# TickiKaki

Tic-Tac-Toe mit Passwort-Login, KI und Online-Spiel gegen einen Freund.

## Passwörter

- Normaler Spieler: `132`
- Admin: `maio`
- Kein Benutzername nötig.

## Spielmodi

### Gegen KI
- **Leicht:** macht einfache Zufallszüge.
- **Mittel:** greift an und blockiert häufig.
- **Schwer:** verwendet Minimax und spielt optimal.

### Mit Freund
1. Eine Person wählt **Mit Freund → Spiel erstellen**.
2. Der angezeigte Raum-Code wird an den Freund geschickt.
3. Der Freund wählt **Mit Freund**, gibt den Code ein und klickt **Beitreten**.
4. Der Ersteller spielt X, der Beitretende O.

Die Freundes-Partie läuft direkt zwischen den beiden Browsern über PeerJS/WebRTC. Dafür muss auf beiden Geräten Internetzugang vorhanden sein.

## GitHub Pages

1. Repository öffnen.
2. **Settings → Pages** öffnen.
3. Bei **Build and deployment**: **Deploy from a branch** auswählen.
4. Branch **main** und Ordner **/(root)** auswählen.
5. **Save** drücken.

## Sicherheit

Diese Version ist eine einfache Demo für GitHub Pages. Die Passwörter und die Admin-Logik stehen im JavaScript-Code und sind deshalb im Browser einsehbar. Für eine echte öffentliche Anwendung sollte die Authentifizierung serverseitig umgesetzt werden.
