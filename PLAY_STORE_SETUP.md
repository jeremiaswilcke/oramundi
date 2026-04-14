# Play Store Setup (Android TWA)

Ora Mundi wird im Play Store als Trusted Web Activity (TWA) verpackt: dein
PWA läuft in einer Chrome-Shell ohne Browser-UI. Kein zweiter Code, keine
zweite Auth, keine zweite Push-Infrastruktur — alles bleibt im Next.js-Projekt.

## Was vorher getan ist

- [x] `public/manifest.json` mit `id`, `scope`, Icons, Theme
- [x] Service Worker via `@serwist/next` (wird beim Production-Build erzeugt)
- [x] `public/.well-known/assetlinks.json` als Platzhalter (muss nach dem
      ersten Build mit echtem SHA-256 gefüllt werden)

## Was du brauchst

- Google Play Console Account (einmalig 25 $)
- JDK 17+ (für Bubblewrap)
- Node 18+ (schon da)

## Schritt 1 — Bubblewrap installieren

```bash
npm install -g @bubblewrap/cli
```

Wenn Bubblewrap fehlende JDK/Android-SDK-Komponenten meldet: `bubblewrap doctor`
führt durch die Installation (macOS: JDK via Homebrew, Android SDK wird in
`~/.bubblewrap/` geladen).

## Schritt 2 — TWA-Projekt initialisieren

In einem **separaten** Verzeichnis außerhalb des Next-Repos (z. B.
`~/ora-mundi-android/`):

```bash
cd ~
mkdir ora-mundi-android
cd ora-mundi-android
bubblewrap init --manifest=https://ora-mundi.vercel.app/manifest.json
```

Bubblewrap stellt Fragen. Empfohlene Antworten:

| Prompt                          | Antwort                                |
| ------------------------------- | -------------------------------------- |
| Application Id                  | `online.oramundi.twa`                  |
| Application Name                | `Ora Mundi`                            |
| Launcher Name                   | `Ora Mundi`                            |
| Display Mode                    | `standalone`                           |
| Orientation                     | `portrait`                             |
| Theme Color                     | `#f2f0e9`                              |
| Background Color                | `#f2f0e9`                              |
| Icon URL                        | `https://ora-mundi.vercel.app/icons/icon-512.png` |
| Maskable Icon URL               | gleich                                  |
| Include Monochrome Icon         | `No` (später via Vector Asset Studio)  |
| Shortcut support                | `No` fürs erste                         |
| Signing Key Path                | `./android.keystore` (Default)         |
| Key Alias                       | `android`                              |
| Keystore Password / Key Password| **sicher notieren, nicht verlieren** — ohne diese Passwörter kann später kein Update mehr signiert werden |
| Key Validity Period             | `25 years`                             |
| First Name / Last Name / Org    | deine Daten                            |

→ Bubblewrap erzeugt das Android-Projekt und den Signing Key. Das Keystore-
File (`android.keystore`) und die Passwörter gehören **niemals** ins Git-Repo.

## Schritt 3 — SHA-256 Fingerprint ermitteln

Nach `bubblewrap init` gibt es den Fingerprint über:

```bash
bubblewrap fingerprint
```

oder direkt:

```bash
keytool -list -v -keystore android.keystore -alias android
```

Die Zeile `SHA256:` (ohne das `SHA256:` Präfix, Doppelpunkte behalten) kopieren.

## Schritt 4 — assetlinks.json aktualisieren

In diesem Repo: `public/.well-known/assetlinks.json` öffnen und
`REPLACE_WITH_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE` durch den Fingerprint
aus Schritt 3 ersetzen. Commit + Push → Vercel deployt → Datei ist dann
unter `https://ora-mundi.vercel.app/.well-known/assetlinks.json` abrufbar.

> Ohne valide `assetlinks.json` zeigt die TWA einen Chrome-URL-Bar an — der
> Nutzer erkennt die App als Webseite. Also erst nach diesem Schritt weiter.

## Schritt 5 — AAB bauen

Im Android-Projekt:

```bash
bubblewrap build
```

Output: `app-release-bundle.aab` und `app-release-signed.apk`. Die `.aab` ist
was Play Console will.

## Schritt 6 — Play Console

1. Neues App-Listing anlegen, Name `Ora Mundi`, Kategorie `Lifestyle`.
2. App-Details ausfüllen: Kurzbeschreibung, vollständige Beschreibung,
   Screenshots (Mindestens 2 Telefon-Screenshots, 1024×500 Feature-Grafik,
   512×512 App-Icon).
3. Datenschutzerklärung verlinken (Pflicht): z. B. `https://ora-mundi.vercel.app/legal/privacy`.
4. `.aab` in **Interner Test** hochladen. Review dauert bei TWAs meist 1–2 Tage.
5. Wenn Test grün: Produktion veröffentlichen.

## Google Play App Signing

Play Console signiert deine Releases ab Upload mit einem eigenen Schlüssel
und gibt dir **einen zweiten SHA-256** (unter „Release → Setup → App-Integrität").
Diesen Fingerprint **zusätzlich** in `assetlinks.json` eintragen (Array erweitern):

```json
[
  { "relation": [...], "target": {
      "package_name": "online.oramundi.twa",
      "sha256_cert_fingerprints": [
        "DEIN_UPLOAD_KEY_FINGERPRINT",
        "DEIN_PLAY_SIGNING_KEY_FINGERPRINT"
      ]
  }}
]
```

## Release-Update später

Wenn du Änderungen deployst, bleibt die TWA automatisch aktuell (lädt ja die
Live-Webseite). Ein neuer Play-Store-Upload ist nur nötig bei:
- Manifest-Änderungen (Scope, Icons, Name)
- Package-Name-Änderung
- Bubblewrap/Chrome-Engine-Update (Security)

Dafür in `ora-mundi-android/`:

```bash
bubblewrap update
bubblewrap build
```

und neue `.aab` ins Play Console hochladen. Dabei `versionCode` inkrementieren
(geschieht meist automatisch).

## Bekannte Fallstricke

- **URL-Bar sichtbar trotz Asset Links**: Cache bei Chrome. Gerät neu starten
  oder `chrome://flags` → Digital Asset Links Verification neu laden.
- **Play Review lehnt als „Webview-App" ab**: Beschreibung deutlich machen
  dass es eine echte App mit Gebets-Features, Push-Notifications und sozialen
  Funktionen ist, nicht nur Content-Viewer. Screenshots zeigen dies.
- **iOS-Nutzer finden App nicht**: Das hier ist nur Play Store. Für iOS
  braucht es Capacitor (siehe CLAUDE.md-Roadmap, Phase 3).

## Nicht ins Git einchecken

- `android.keystore`
- `*.jks` Dateien
- Bubblewrap-Config mit eingebetteten Passwörtern (Bubblewrap speichert
  Passwörter in `twa-manifest.json` nicht mehr ab Version 1.19, prüfen!)
