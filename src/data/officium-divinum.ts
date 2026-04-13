// Officium Divinum (vor-konziliares Stundengebet)
// Texte aus Breviarium Romanum 1962 (Latein gemeinfrei) und Allioli-Bibel (deutsch, gemeinfrei)
// Quelle: divinumofficium.com

export type OfficiumHour =
  | "matutinum" | "laudes" | "prima" | "tertia" | "sexta" | "nona"
  | "vesperae" | "completorium";

export interface OfficiumStep {
  type: "rubric" | "verse" | "psalm" | "antiphon" | "hymn" | "capitulum" | "versicle" | "magnificat" | "benedictus" | "oratio" | "conclusion";
  title?: { la: string; de: string };
  reference?: string;
  la: string;
  de: string;
}

export interface OfficiumOffice {
  hour: OfficiumHour;
  name: { la: string; de: string };
  description: { la: string; de: string };
  icon: string;
  steps: OfficiumStep[];
}

// === Sonntag-Vesper (Tempus per Annum) ===
export const VESPERAE_DOMINICAE: OfficiumOffice = {
  hour: "vesperae",
  name: { la: "Vesperae Dominicae", de: "Sonntags-Vesper" },
  description: {
    la: "Hora vespertina diei dominicae secundum Breviarium Romanum 1962",
    de: "Abendgebet am Sonntag nach dem Römischen Brevier 1962",
  },
  icon: "wb_twilight",
  steps: [
    {
      type: "rubric",
      title: { la: "Inchoatio", de: "Eröffnung" },
      la: "Pater noster, Ave Maria. (silentio)",
      de: "Vater unser, Ave Maria. (still)",
    },
    {
      type: "verse",
      la: "V. Deus, in adiutorium meum intende.\nR. Domine, ad adiuvandum me festina.\nGloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen. Alleluia.",
      de: "V. O Gott, komm mir zu Hilfe.\nR. Herr, eile mir zu helfen.\nEhre sei dem Vater und dem Sohne und dem Heiligen Geiste, wie es war im Anfang, jetzt und immerdar und in Ewigkeit. Amen. Halleluja.",
    },

    // Psalm 109 (110)
    {
      type: "antiphon",
      title: { la: "Antiphona 1", de: "Antiphon 1" },
      la: "Dixit Dominus * Domino meo: Sede a dextris meis.",
      de: "Es sprach der Herr * zu meinem Herrn: Setze dich zu meiner Rechten.",
    },
    {
      type: "psalm",
      title: { la: "Psalmus 109", de: "Psalm 109 (110)" },
      reference: "Ps 109",
      la: "Dixit Dominus Domino meo: * Sede a dextris meis,\nDonec ponam inimicos tuos, * scabellum pedum tuorum.\nVirgam virtutis tuae emittet Dominus ex Sion: * dominare in medio inimicorum tuorum.\nTecum principium in die virtutis tuae in splendoribus sanctorum: * ex utero ante luciferum genui te.\nIuravit Dominus, et non poenitebit eum: * Tu es sacerdos in aeternum secundum ordinem Melchisedech.\nDominus a dextris tuis, * confregit in die irae suae reges.\nIudicabit in nationibus, implebit ruinas: * conquassabit capita in terra multorum.\nDe torrente in via bibet: * propterea exaltabit caput.\nGloria Patri, et Filio, * et Spiritui Sancto.\nSicut erat in principio, et nunc, et semper, * et in saecula saeculorum. Amen.",
      de: "Es sprach der Herr zu meinem Herrn: * Setze dich zu meiner Rechten,\nbis ich deine Feinde * lege als Schemel zu deinen Füßen.\nDas Zepter deiner Macht wird der Herr aus Sion senden: * herrsche inmitten deiner Feinde.\nBei dir ist die Herrschaft am Tage deiner Macht im Glanze der Heiligen: * aus dem Schoße vor dem Morgenstern habe ich dich gezeugt.\nDer Herr hat geschworen, und es wird ihn nicht gereuen: * Du bist Priester in Ewigkeit nach der Ordnung Melchisedechs.\nDer Herr zu deiner Rechten * wird zerschmettern Könige am Tage seines Zornes.\nEr wird richten unter den Völkern, er wird Trümmer häufen, * er wird Häupter zerschmettern auf weiter Erde.\nVon dem Bache am Wege wird er trinken: * darum wird er das Haupt erheben.\nEhre sei dem Vater und dem Sohne * und dem Heiligen Geiste,\nwie es war im Anfang, jetzt und immerdar * und in Ewigkeit. Amen.",
    },
    {
      type: "antiphon",
      la: "Dixit Dominus Domino meo: Sede a dextris meis.",
      de: "Es sprach der Herr zu meinem Herrn: Setze dich zu meiner Rechten.",
    },

    // Psalm 110 (111)
    {
      type: "antiphon",
      title: { la: "Antiphona 2", de: "Antiphon 2" },
      la: "Magna opera Domini: * exquisita in omnes voluntates eius.",
      de: "Groß sind die Werke des Herrn: * köstlich für alle, die sie betrachten.",
    },
    {
      type: "psalm",
      title: { la: "Psalmus 110", de: "Psalm 110 (111)" },
      reference: "Ps 110",
      la: "Confitebor tibi, Domine, in toto corde meo: * in consilio iustorum, et congregatione.\nMagna opera Domini: * exquisita in omnes voluntates eius.\nConfessio et magnificentia opus eius: * et iustitia eius manet in saeculum saeculi.\nMemoriam fecit mirabilium suorum, misericors et miserator Dominus: * escam dedit timentibus se.\nMemor erit in saeculum testamenti sui: * virtutem operum suorum annuntiabit populo suo:\nUt det illis hereditatem gentium: * opera manuum eius veritas, et iudicium.\nFidelia omnia mandata eius: confirmata in saeculum saeculi, * facta in veritate et aequitate.\nRedemptionem misit populo suo: * mandavit in aeternum testamentum suum.\nSanctum, et terribile nomen eius: * initium sapientiae timor Domini.\nIntellectus bonus omnibus facientibus eum: * laudatio eius manet in saeculum saeculi.\nGloria Patri, et Filio, * et Spiritui Sancto.\nSicut erat in principio, et nunc, et semper, * et in saecula saeculorum. Amen.",
      de: "Ich will dir danken, Herr, von ganzem Herzen: * im Rate der Gerechten und in der Gemeinde.\nGroß sind die Werke des Herrn: * köstlich für alle, die sie betrachten.\nLob und Hoheit ist sein Werk: * und seine Gerechtigkeit bleibt in Ewigkeit.\nGedächtnis stiftete er seinen Wundern, der barmherzige und milde Herr: * Speise hat er gegeben denen, die ihn fürchten.\nEr wird gedenken in Ewigkeit seines Bundes: * die Macht seiner Werke wird er kundtun seinem Volke.\nUm ihm das Erbe der Heiden zu geben: * die Werke seiner Hände sind Wahrheit und Gericht.\nGetreu sind alle seine Gebote, fest in alle Ewigkeit, * gegeben in Wahrheit und Recht.\nErlösung sandte er seinem Volke: * für ewig hat er seinen Bund bestimmt.\nHeilig und furchtbar ist sein Name: * der Anfang der Weisheit ist die Furcht des Herrn.\nGute Einsicht haben alle, die danach tun: * sein Lob bleibt in Ewigkeit.\nEhre sei dem Vater und dem Sohne * und dem Heiligen Geiste,\nwie es war im Anfang, jetzt und immerdar * und in Ewigkeit. Amen.",
    },
    {
      type: "antiphon",
      la: "Magna opera Domini: exquisita in omnes voluntates eius.",
      de: "Groß sind die Werke des Herrn: köstlich für alle, die sie betrachten.",
    },

    // Psalm 111 (112)
    {
      type: "antiphon",
      title: { la: "Antiphona 3", de: "Antiphon 3" },
      la: "Qui timet Dominum, * in mandatis eius cupit nimis.",
      de: "Selig der Mann, der den Herrn fürchtet: * an seinen Geboten hat er große Freude.",
    },
    {
      type: "psalm",
      title: { la: "Psalmus 111", de: "Psalm 111 (112)" },
      reference: "Ps 111",
      la: "Beatus vir, qui timet Dominum: * in mandatis eius volet nimis.\nPotens in terra erit semen eius: * generatio rectorum benedicetur.\nGloria, et divitiae in domo eius: * et iustitia eius manet in saeculum saeculi.\nExortum est in tenebris lumen rectis: * misericors, et miserator, et iustus.\nIucundus homo qui miseretur et commodat, disponet sermones suos in iudicio: * quia in aeternum non commovebitur.\nIn memoria aeterna erit iustus: * ab auditione mala non timebit.\nParatum cor eius sperare in Domino, confirmatum est cor eius: * non commovebitur donec despiciat inimicos suos.\nDispersit, dedit pauperibus: iustitia eius manet in saeculum saeculi: * cornu eius exaltabitur in gloria.\nPeccator videbit, et irascetur, dentibus suis fremet et tabescet: * desiderium peccatorum peribit.\nGloria Patri, et Filio, * et Spiritui Sancto.\nSicut erat in principio, et nunc, et semper, * et in saecula saeculorum. Amen.",
      de: "Selig der Mann, der den Herrn fürchtet: * an seinen Geboten hat er große Freude.\nMächtig auf Erden wird sein Same sein: * das Geschlecht der Gerechten wird gesegnet.\nEhre und Reichtum ist in seinem Hause: * und seine Gerechtigkeit bleibt in Ewigkeit.\nDen Aufrichtigen geht Licht auf in Finsternis: * der barmherzige, milde und gerechte Mann.\nLieblich ist der Mensch, der Erbarmen hat und leiht, der seine Reden wohl ordnet: * denn ewig wird er nicht wanken.\nEwig wird man des Gerechten gedenken: * vor übler Kunde fürchtet er sich nicht.\nBereit ist sein Herz zu hoffen auf den Herrn, gefestigt ist sein Herz: * er wird nicht wanken, bis er auf seine Feinde herabblickt.\nEr spendet, gibt den Armen: seine Gerechtigkeit bleibt in Ewigkeit: * sein Horn wird erhöht in Herrlichkeit.\nDer Sünder sieht es und ergrimmt, knirscht mit den Zähnen und vergeht: * der Wunsch der Sünder wird zunichte.\nEhre sei dem Vater und dem Sohne * und dem Heiligen Geiste,\nwie es war im Anfang, jetzt und immerdar * und in Ewigkeit. Amen.",
    },
    {
      type: "antiphon",
      la: "Qui timet Dominum, in mandatis eius cupit nimis.",
      de: "Selig der Mann, der den Herrn fürchtet: an seinen Geboten hat er große Freude.",
    },

    // Psalm 112 (113)
    {
      type: "antiphon",
      title: { la: "Antiphona 4", de: "Antiphon 4" },
      la: "Sit nomen Domini * benedictum in saecula.",
      de: "Gepriesen sei der Name des Herrn * von nun an bis in Ewigkeit.",
    },
    {
      type: "psalm",
      title: { la: "Psalmus 112", de: "Psalm 112 (113)" },
      reference: "Ps 112",
      la: "Laudate, pueri, Dominum: * laudate nomen Domini.\nSit nomen Domini benedictum, * ex hoc nunc, et usque in saeculum.\nA solis ortu usque ad occasum, * laudabile nomen Domini.\nExcelsus super omnes gentes Dominus, * et super caelos gloria eius.\nQuis sicut Dominus Deus noster, qui in altis habitat, * et humilia respicit in caelo et in terra?\nSuscitans a terra inopem, * et de stercore erigens pauperem:\nUt collocet eum cum principibus, * cum principibus populi sui.\nQui habitare facit sterilem in domo, * matrem filiorum laetantem.\nGloria Patri, et Filio, * et Spiritui Sancto.\nSicut erat in principio, et nunc, et semper, * et in saecula saeculorum. Amen.",
      de: "Lobet, ihr Diener, den Herrn: * lobet den Namen des Herrn.\nGepriesen sei der Name des Herrn, * von nun an bis in Ewigkeit.\nVom Aufgang der Sonne bis zum Untergang * sei gelobt der Name des Herrn.\nErhaben über alle Völker ist der Herr, * über die Himmel reicht seine Herrlichkeit.\nWer ist wie der Herr, unser Gott, der in der Höhe thront, * und der herabschaut auf das Niedrige im Himmel und auf Erden?\nDer den Geringen aufrichtet aus dem Staube, * aus dem Kote den Armen erhebt:\nUm ihn zu setzen unter Fürsten, * unter Fürsten seines Volkes.\nDer die Unfruchtbare wohnen läßt im Hause, * als frohe Mutter von Söhnen.\nEhre sei dem Vater und dem Sohne * und dem Heiligen Geiste,\nwie es war im Anfang, jetzt und immerdar * und in Ewigkeit. Amen.",
    },
    {
      type: "antiphon",
      la: "Sit nomen Domini benedictum in saecula.",
      de: "Gepriesen sei der Name des Herrn von nun an bis in Ewigkeit.",
    },

    // Psalm 113 (114-115)
    {
      type: "antiphon",
      title: { la: "Antiphona 5", de: "Antiphon 5" },
      la: "Deus autem noster * in caelo: omnia quaecumque voluit, fecit.",
      de: "Unser Gott ist im Himmel: * alles, was er wollte, hat er getan.",
    },
    {
      type: "psalm",
      title: { la: "Psalmus 113", de: "Psalm 113 (114-115)" },
      reference: "Ps 113",
      la: "In exitu Israel de Aegypto, * domus Iacob de populo barbaro:\nFacta est Iudaea sanctificatio eius, * Israel potestas eius.\nMare vidit, et fugit: * Iordanis conversus est retrorsum.\nMontes exsultaverunt ut arietes: * et colles sicut agni ovium.\nQuid est tibi, mare, quod fugisti: * et tu, Iordanis, quia conversus es retrorsum?\nMontes, exsultastis sicut arietes, * et colles, sicut agni ovium.\nA facie Domini mota est terra, * a facie Dei Iacob.\nQui convertit petram in stagna aquarum, * et rupem in fontes aquarum.\nNon nobis, Domine, non nobis: * sed nomini tuo da gloriam.\nSuper misericordia tua, et veritate tua: * nequando dicant gentes: Ubi est Deus eorum?\nDeus autem noster in caelo: * omnia quaecumque voluit, fecit.\nGloria Patri, et Filio, * et Spiritui Sancto.\nSicut erat in principio, et nunc, et semper, * et in saecula saeculorum. Amen.",
      de: "Beim Auszug Israels aus Ägypten, * des Hauses Jakob aus dem fremden Volke:\nWurde Juda sein Heiligtum, * Israel sein Reich.\nDas Meer sah es und floh: * der Jordan wandte sich zurück.\nDie Berge hüpften wie Widder, * und die Hügel wie Lämmer der Schafe.\nWas ist dir, Meer, daß du flohest: * und du, Jordan, daß du dich zurückwandtest?\nIhr Berge, hüpftet ihr wie Widder, * und ihr Hügel wie Lämmer der Schafe?\nVor dem Antlitz des Herrn erbebt die Erde, * vor dem Antlitz des Gottes Jakobs.\nDer den Felsen wandelt in Wasserteiche, * und das Gestein in Wasserquellen.\nNicht uns, Herr, nicht uns: * sondern deinem Namen gib die Ehre.\nUm deiner Barmherzigkeit und Wahrheit willen: * damit die Heiden nicht sagen: Wo ist ihr Gott?\nUnser Gott aber ist im Himmel: * alles, was er wollte, hat er getan.\nEhre sei dem Vater und dem Sohne * und dem Heiligen Geiste,\nwie es war im Anfang, jetzt und immerdar * und in Ewigkeit. Amen.",
    },
    {
      type: "antiphon",
      la: "Deus autem noster in caelo: omnia quaecumque voluit, fecit.",
      de: "Unser Gott ist im Himmel: alles, was er wollte, hat er getan.",
    },

    // Capitulum
    {
      type: "capitulum",
      title: { la: "Capitulum (2 Cor 1, 3-4)", de: "Kurzlesung (2 Kor 1,3-4)" },
      la: "Benedictus Deus, et Pater Domini nostri Iesu Christi, Pater misericordiarum, et Deus totius consolationis, qui consolatur nos in omni tribulatione nostra.\nR. Deo gratias.",
      de: "Gepriesen sei Gott, der Vater unseres Herrn Jesus Christus, der Vater der Erbarmungen und Gott alles Trostes, der uns tröstet in all unserer Trübsal.\nR. Dank sei Gott.",
    },

    // Hymn: Lucis Creator Optime
    {
      type: "hymn",
      title: { la: "Hymnus: Lucis Creator optime", de: "Hymnus: Schöpfer des Lichts" },
      la: "Lucis Creator optime,\nlucem dierum proferens,\nprimordiis lucis novae,\nmundi parans originem:\n\nQui mane iunctum vesperi\ndiem vocari praecipis:\nillabitur tetrum chaos,\naudi preces cum fletibus.\n\nNe mens gravata crimine,\nvitae sit exsul munere,\ndum nil perenne cogitat,\nseseque culpis illigat.\n\nCaeleste pulset ostium,\nvitale tollat praemium:\nvitemus omne noxium,\npurgemus omne pessimum.\n\nPraesta, Pater piissime,\nPatrique compar Unice,\ncum Spiritu Paraclito\nregnans per omne saeculum. Amen.",
      de: "O bester Schöpfer alles Lichts,\nder du der Tage Licht hervorbringst,\nzu den Anfängen des neuen Lichts\nbereitend der Welt Beginn:\n\nDer du befiehlst, daß Morgen zum Abend gefügt\nein Tag genannt werde:\nhinab gleitet das düstere Chaos,\nhöre unsre Gebete mit Tränen.\n\nDaß nicht die Seele, durch Schuld beladen,\nder Lebensgabe verlustig gehe,\nwenn nichts Bleibendes sie bedenkt\nund sich in Schuld verstrickt.\n\nSie poche an des Himmels Tor,\ntrage davon den Lebenslohn:\nvermeiden wollen wir alles Schädliche,\nreinigen wollen wir uns von allem Bösen.\n\nGewähr es, allgütiger Vater,\ndu eingeborner Sohn dem Vater gleich,\nmit dem Heiligen Geist, dem Tröster,\nherrschend in alle Ewigkeit. Amen.",
    },

    // Versicle
    {
      type: "versicle",
      la: "V. Dirigatur, Domine, oratio mea.\nR. Sicut incensum in conspectu tuo.",
      de: "V. Es steige auf, o Herr, mein Gebet.\nR. Wie Weihrauch vor dein Angesicht.",
    },

    // Magnificat with antiphon
    {
      type: "antiphon",
      title: { la: "Antiphona ad Magnificat", de: "Antiphon zum Magnificat" },
      la: "Magnificat * anima mea Dominum.",
      de: "Hoch preiset * meine Seele den Herrn.",
    },
    {
      type: "magnificat",
      title: { la: "Canticum BMV (Lc 1, 46-55)", de: "Lobgesang Mariens (Lk 1,46-55)" },
      la: "Magnificat * anima mea Dominum.\nEt exsultavit spiritus meus * in Deo, salutari meo.\nQuia respexit humilitatem ancillae suae: * ecce enim ex hoc beatam me dicent omnes generationes.\nQuia fecit mihi magna qui potens est: * et sanctum nomen eius.\nEt misericordia eius a progenie in progenies * timentibus eum.\nFecit potentiam in brachio suo: * dispersit superbos mente cordis sui.\nDeposuit potentes de sede, * et exaltavit humiles.\nEsurientes implevit bonis: * et divites dimisit inanes.\nSuscepit Israel puerum suum, * recordatus misericordiae suae.\nSicut locutus est ad patres nostros, * Abraham et semini eius in saecula.\nGloria Patri, et Filio, * et Spiritui Sancto.\nSicut erat in principio, et nunc, et semper, * et in saecula saeculorum. Amen.",
      de: "Hoch preiset meine Seele den Herrn.\nUnd mein Geist frohlockt * in Gott, meinem Heile.\nDenn er hat angesehen die Niedrigkeit seiner Magd: * siehe, von nun an werden mich selig preisen alle Geschlechter.\nDenn Großes hat an mir getan, der mächtig ist: * und heilig ist sein Name.\nUnd seine Barmherzigkeit währt von Geschlecht zu Geschlecht * über die, so ihn fürchten.\nEr übte Macht mit seinem Arm: * er zerstreute, die hoffärtig sind in ihres Herzens Sinn.\nEr stürzte Mächtige vom Thron, * und erhöhte Niedrige.\nDie Hungernden erfüllte er mit Gütern: * und die Reichen ließ er leer ausgehen.\nEr nahm sich Israels an, seines Knechtes, * eingedenk seiner Barmherzigkeit.\nWie er geredet hat zu unsern Vätern, * Abraham und seinem Samen in Ewigkeit.\nEhre sei dem Vater und dem Sohne * und dem Heiligen Geiste,\nwie es war im Anfang, jetzt und immerdar * und in Ewigkeit. Amen.",
    },
    {
      type: "antiphon",
      la: "Magnificat anima mea Dominum.",
      de: "Hoch preiset meine Seele den Herrn.",
    },

    // Oratio
    {
      type: "oratio",
      title: { la: "Oratio", de: "Tagesgebet" },
      la: "V. Dominus vobiscum.\nR. Et cum spiritu tuo.\n\nOremus.\nDeus, refugium nostrum et virtus, adesto piis Ecclesiae tuae precibus, auctor ipse pietatis, et praesta; ut, quod fideliter petimus, efficaciter consequamur. Per Dominum nostrum Iesum Christum, Filium tuum: qui tecum vivit et regnat in unitate Spiritus Sancti Deus, per omnia saecula saeculorum.\nR. Amen.",
      de: "V. Der Herr sei mit euch.\nR. Und mit deinem Geiste.\n\nLasset uns beten.\nO Gott, unsere Zuflucht und Stärke, sei zugegen den frommen Bitten deiner Kirche, du selbst Urheber der Frömmigkeit, und gib, daß wir wirksam erlangen, was wir gläubig erbitten. Durch unsern Herrn Jesus Christus, deinen Sohn, der mit dir lebt und herrscht in der Einheit des Heiligen Geistes, Gott von Ewigkeit zu Ewigkeit.\nR. Amen.",
    },

    // Conclusion
    {
      type: "conclusion",
      la: "V. Dominus vobiscum.\nR. Et cum spiritu tuo.\n\nV. Benedicamus Domino.\nR. Deo gratias.\n\nV. Fidelium animae per misericordiam Dei requiescant in pace.\nR. Amen.\n\nPater noster (silentio).",
      de: "V. Der Herr sei mit euch.\nR. Und mit deinem Geiste.\n\nV. Lasset uns preisen den Herrn.\nR. Dank sei Gott.\n\nV. Die Seelen der Verstorbenen mögen durch die Barmherzigkeit Gottes ruhen in Frieden.\nR. Amen.\n\nVater unser (still).",
    },
  ],
};

export const OFFICIUM_OFFICES: OfficiumOffice[] = [
  VESPERAE_DOMINICAE,
];
