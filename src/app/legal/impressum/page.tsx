import Link from "next/link";

export const metadata = {
  title: "Impressum — Ora Mundi",
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 max-w-3xl mx-auto">
      <Link href="/" className="text-primary text-sm mb-8 inline-block">
        &larr; Zurück
      </Link>
      <h1 className="font-headline italic text-4xl text-on-surface mb-8">
        Impressum
      </h1>

      <div className="prose prose-sm max-w-none space-y-6 text-on-surface-variant">
        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            Offenlegung gemäß §§ 24, 25 Mediengesetz und § 5 E-Commerce-Gesetz
          </h2>
          <p>
            <strong className="text-on-surface">Medieninhaber, Herausgeber und Diensteanbieter:</strong>
            <br />
            Jeremias C. H. F. J. Wilcke
            <br />
            Wilcke Web
            <br />
            Grenzgasse 4
            <br />
            3001 Mauerbach
            <br />
            Österreich
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">Kontakt</h2>
          <p>
            E-Mail:{" "}
            <a href="mailto:info@oramundi.online" className="text-primary">
              info@oramundi.online
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            Unternehmensgegenstand
          </h2>
          <p>
            Betrieb der Web-Anwendung &bdquo;Ora Mundi&ldquo; &ndash; eine Plattform zum gemeinsamen Beten
            des Rosenkranzes und zum Teilen von Gebetsanliegen.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">
            Online-Streitbeilegung
          </h2>
          <p>
            Verbraucher, die in Österreich oder in einem anderen Vertragsstaat der ODR-VO niedergelassen sind,
            haben die Möglichkeit, Probleme bezüglich des entgeltlichen Kaufs von Waren oder Dienstleistungen
            im Rahmen einer Online-Streitbeilegung zu lösen. Die Europäische Kommission stellt eine Plattform
            hierfür bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr" className="text-primary" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
            Für externe Links zu fremden Inhalten ist ausschließlich der jeweilige Anbieter verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl text-on-surface mb-2">Urheberrecht</h2>
          <p>
            Die auf dieser Website veröffentlichten Inhalte unterliegen dem österreichischen Urheberrecht.
            Die verwendeten Gebetstexte (Rosenkranz, Litaneien, Komplet) sind gemeinfreie traditionelle Texte.
          </p>
        </section>
      </div>
    </div>
  );
}
