import Link from "next/link";

export const metadata = {
  title: "Datenschutzerklärung — Ora Mundi",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 max-w-3xl mx-auto">
      <Link href="/" className="text-primary text-sm mb-8 inline-block">
        &larr; Zurück
      </Link>
      <h1 className="font-headline italic text-4xl text-on-surface mb-2">
        Datenschutzerklärung
      </h1>
      <p className="text-on-surface-variant text-sm mb-8">
        Stand: April 2026
      </p>

      <div className="prose prose-sm max-w-none space-y-6 text-on-surface-variant">
        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            1. Verantwortlicher
          </h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der
            Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <p>
            Jeremias C. H. F. J. Wilcke
            <br />
            Wilcke Web
            <br />
            Grenzgasse 4, 3001 Mauerbach, Österreich
            <br />
            E-Mail:{" "}
            <a href="mailto:info@oramundi.online" className="text-primary">
              info@oramundi.online
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            2. Zweck der Datenverarbeitung
          </h2>
          <p>
            Ora Mundi ist eine Plattform zum gemeinsamen Beten. Wir verarbeiten
            personenbezogene Daten, um:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Nutzerkonten zu verwalten (Registrierung, Anmeldung)</li>
            <li>Gebetsaktivitäten zu speichern (Statistiken, Verlauf)</li>
            <li>Anonyme Echtzeit-Präsenz auf der Weltkarte darzustellen</li>
            <li>Gebetsanliegen zu teilen (optional anonym)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            3. Welche Daten wir verarbeiten
          </h2>
          <h3 className="text-on-surface font-semibold mb-1">Registrierungsdaten</h3>
          <p>E-Mail-Adresse, Anzeigename, verschlüsseltes Passwort (bei E-Mail-Login).</p>

          <h3 className="text-on-surface font-semibold mb-1 mt-4">Google-Login</h3>
          <p>
            Wenn du dich mit Google anmeldest, erhalten wir von Google deine E-Mail-Adresse,
            deinen Namen und deine Profil-ID. Es gilt zusätzlich die Datenschutzerklärung von Google.
          </p>

          <h3 className="text-on-surface font-semibold mb-1 mt-4">Standortdaten</h3>
          <p>
            Wenn du es erlaubst, wird dein ungefährer Standort (auf ca. 10 km gerundet)
            erfasst, um deine Anwesenheit auf der Weltkarte anzuzeigen. Exakte Koordinaten
            werden nie gespeichert oder geteilt.
          </p>

          <h3 className="text-on-surface font-semibold mb-1 mt-4">Gebetsaktivitäten</h3>
          <p>
            Zeitpunkt, Dauer, gewähltes Geheimnis und Modus deiner Gebete.
            Gebetsanliegen, die du freiwillig teilst.
          </p>

          <h3 className="text-on-surface font-semibold mb-1 mt-4">Technische Daten</h3>
          <p>
            IP-Adresse (kurzzeitig für Sicherheit), Browsertyp, Zeitstempel.
            Diese Daten werden nicht dauerhaft gespeichert.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            4. Rechtsgrundlage
          </h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
            (Vertragserfüllung) für die Kontoführung und lit. a (Einwilligung) für
            optionale Funktionen wie Standort und Gebetsanliegen.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">5. Dienstleister</h2>
          <p>
            Wir nutzen folgende Auftragsverarbeiter, die auf Basis von Verträgen
            gemäß Art. 28 DSGVO Daten für uns verarbeiten:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong className="text-on-surface">Supabase</strong> (USA/EU) &ndash;
              Datenbank und Authentifizierung, Hosting im EU-Raum (Stockholm)
            </li>
            <li>
              <strong className="text-on-surface">Vercel Inc.</strong> (USA) &ndash;
              Web-Hosting und Bereitstellung der App
            </li>
            <li>
              <strong className="text-on-surface">MapTiler AG</strong> (Schweiz) &ndash;
              Kartendaten
            </li>
            <li>
              <strong className="text-on-surface">Google LLC</strong> (USA) &ndash;
              OAuth-Anmeldung (nur bei Nutzung von &bdquo;Login mit Google&ldquo;)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            6. Cookies und lokale Speicherung
          </h2>
          <p>
            Wir verwenden technisch notwendige Cookies und lokalen Speicher für die
            Authentifizierung (Session-Cookie von Supabase) und die Spracheinstellung.
            Wir verwenden <strong>keine</strong> Tracking- oder Werbe-Cookies.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            7. Deine Rechte
          </h2>
          <p>Du hast jederzeit folgende Rechte:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Auskunft (Art. 15 DSGVO)</li>
            <li>Berichtigung (Art. 16 DSGVO)</li>
            <li>Löschung (Art. 17 DSGVO) &ndash; &bdquo;Recht auf Vergessenwerden&ldquo;</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen Verarbeitung (Art. 21 DSGVO)</li>
            <li>
              Beschwerderecht bei der Datenschutzbehörde (
              <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer" className="text-primary">
                www.dsb.gv.at
              </a>
              )
            </li>
          </ul>
          <p>
            Kontakt zur Ausübung deiner Rechte:{" "}
            <a href="mailto:info@oramundi.online" className="text-primary">
              info@oramundi.online
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            8. Speicherdauer
          </h2>
          <p>
            Wir speichern deine personenbezogenen Daten nur so lange, wie dein Konto besteht.
            Nach Löschung deines Kontos werden alle personenbezogenen Daten innerhalb von 30 Tagen
            vollständig gelöscht.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            9. Änderungen dieser Datenschutzerklärung
          </h2>
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
            aktuellen rechtlichen Anforderungen entspricht. Die jeweils aktuelle Version ist hier abrufbar.
          </p>
        </section>
      </div>
    </div>
  );
}
