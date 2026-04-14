export interface PrayerEntry {
  slug: string;
  category: "litany" | "hour" | "novena" | "devotion";
  title: { de: string; en: string };
  description: { de: string; en: string };
  icon: string;
  // Sequential text blocks shown step-by-step
  steps: Array<{
    title?: { de: string; en: string };
    text: { de: string; en: string };
    // For litanies: alternating invocations and responses
    repeat?: number;
  }>;
}

export const PRAYER_LIBRARY: PrayerEntry[] = [
  {
    slug: "loreto",
    category: "litany",
    icon: "favorite",
    title: { de: "Lauretanische Litanei", en: "Litany of Loreto" },
    description: { de: "Litanei zu Ehren der seligen Jungfrau Maria", en: "Litany in honor of the Blessed Virgin Mary" },
    steps: [
      {
        title: { de: "Anrufungen", en: "Invocations" },
        text: {
          de: "Herr, erbarme dich unser.\nChristus, erbarme dich unser.\nHerr, erbarme dich unser.\n\nChristus, höre uns.\nChristus, erhöre uns.\n\nGott Vater vom Himmel, erbarme dich unser.\nGott Sohn, Erlöser der Welt, erbarme dich unser.\nGott Heiliger Geist, erbarme dich unser.\nHeilige Dreifaltigkeit, ein einiger Gott, erbarme dich unser.",
          en: "Lord, have mercy.\nChrist, have mercy.\nLord, have mercy.\n\nChrist, hear us.\nChrist, graciously hear us.\n\nGod the Father of heaven, have mercy on us.\nGod the Son, Redeemer of the world, have mercy on us.\nGod the Holy Spirit, have mercy on us.\nHoly Trinity, one God, have mercy on us.",
        },
      },
      {
        title: { de: "Heilige Maria", en: "Holy Mary" },
        text: {
          de: "Heilige Maria, — bitte für uns.\nHeilige Gottesgebärerin,\nHeilige Jungfrau der Jungfrauen,\nMutter Christi,\nMutter der Kirche,\nMutter der Barmherzigkeit,\nMutter der göttlichen Gnade,\nMutter der Hoffnung,\nMutter, voll der Reinheit,\nMutter, voll der Keuschheit,\nUnversehrte Mutter,\nUnbefleckte Mutter,\nLiebenswürdige Mutter,\nWunderbare Mutter,\nMutter des guten Rates,\nMutter des Schöpfers,\nMutter des Erlösers,",
          en: "Holy Mary, — pray for us.\nHoly Mother of God,\nHoly Virgin of virgins,\nMother of Christ,\nMother of the Church,\nMother of Mercy,\nMother of divine grace,\nMother of hope,\nMother most pure,\nMother most chaste,\nMother inviolate,\nMother undefiled,\nMother most amiable,\nMother most admirable,\nMother of good counsel,\nMother of our Creator,\nMother of our Savior,",
        },
      },
      {
        title: { de: "Jungfrau", en: "Virgin" },
        text: {
          de: "Jungfrau, voll der Weisheit, — bitte für uns.\nJungfrau, würdig aller Ehre,\nJungfrau, würdig allen Lobes,\nJungfrau, mächtig auf Erden,\nJungfrau, voll der Güte,\nJungfrau, voll der Treue,\nDu Spiegel der Heiligkeit,\nDu Sitz der Weisheit,\nDu Ursache unserer Freude,\nDu Wohnung des Heiligen Geistes,\nDu kostbares Gefäß der Gnade,\nDu Gefäß unserer Hingabe,\nDu geheimnisvolle Rose,\nDu Turm Davids,\nDu Elfenbeinerner Turm,\nDu Goldenes Haus,\nDu Bundeslade,\nDu Pforte des Himmels,\nDu Morgenstern,",
          en: "Virgin most prudent, — pray for us.\nVirgin most venerable,\nVirgin most renowned,\nVirgin most powerful,\nVirgin most merciful,\nVirgin most faithful,\nMirror of justice,\nSeat of wisdom,\nCause of our joy,\nSpiritual vessel,\nVessel of honor,\nSingular vessel of devotion,\nMystical rose,\nTower of David,\nTower of ivory,\nHouse of gold,\nArk of the covenant,\nGate of heaven,\nMorning star,",
        },
      },
      {
        title: { de: "Heil der Kranken", en: "Health of the sick" },
        text: {
          de: "Heil der Kranken, — bitte für uns.\nZuflucht der Sünder,\nHelferin der Ausgewanderten,\nTrösterin der Betrübten,\nHilfe der Christen,\nKönigin der Engel,\nKönigin der Patriarchen,\nKönigin der Propheten,\nKönigin der Apostel,\nKönigin der Märtyrer,\nKönigin der Bekenner,\nKönigin der Jungfrauen,\nKönigin aller Heiligen,\nKönigin, ohne Erbschuld empfangen,\nKönigin, aufgenommen in den Himmel,\nKönigin des heiligen Rosenkranzes,\nKönigin der Familien,\nKönigin des Friedens.",
          en: "Health of the sick, — pray for us.\nRefuge of sinners,\nConsoler of migrants,\nComforter of the afflicted,\nHelp of Christians,\nQueen of angels,\nQueen of patriarchs,\nQueen of prophets,\nQueen of apostles,\nQueen of martyrs,\nQueen of confessors,\nQueen of virgins,\nQueen of all saints,\nQueen conceived without original sin,\nQueen assumed into heaven,\nQueen of the most holy Rosary,\nQueen of families,\nQueen of peace.",
        },
      },
      {
        title: { de: "Schlussgebet", en: "Closing Prayer" },
        text: {
          de: "Lamm Gottes, du nimmst hinweg die Sünden der Welt: — verschone uns, o Herr.\nLamm Gottes, du nimmst hinweg die Sünden der Welt: — erhöre uns, o Herr.\nLamm Gottes, du nimmst hinweg die Sünden der Welt: — erbarme dich unser.\n\nBitte für uns, o heilige Gottesgebärerin, — auf dass wir würdig werden der Verheißungen Christi.\n\nLasset uns beten.\nAllmächtiger, ewiger Gott, du hast den Leib und die Seele der glorreichen Jungfrau und Mutter Maria bereitet, damit sie eine würdige Wohnung deines Sohnes werde. Gib, dass wir auf ihre Fürsprache von allem Übel und vom ewigen Tod befreit werden. Durch Christus, unseren Herrn. Amen.",
          en: "Lamb of God, who takes away the sins of the world, — spare us, O Lord.\nLamb of God, who takes away the sins of the world, — graciously hear us, O Lord.\nLamb of God, who takes away the sins of the world, — have mercy on us.\n\nPray for us, O holy Mother of God, — that we may be made worthy of the promises of Christ.\n\nLet us pray.\nAlmighty and everlasting God, who by the cooperation of the Holy Spirit, didst prepare the body and soul of the glorious Virgin-Mother Mary to become a dwelling-place meet for Thy Son: grant that as we rejoice in her commemoration so by her fervent intercession we may be delivered from present evils and from everlasting death. Through Christ our Lord. Amen.",
        },
      },
    ],
  },
  {
    slug: "sacred-heart",
    category: "litany",
    icon: "volunteer_activism",
    title: { de: "Herz-Jesu-Litanei", en: "Litany of the Sacred Heart" },
    description: { de: "Litanei vom Heiligsten Herzen Jesu", en: "Litany of the Most Sacred Heart of Jesus" },
    steps: [
      {
        title: { de: "Anrufungen", en: "Invocations" },
        text: {
          de: "Herr, erbarme dich unser.\nChristus, erbarme dich unser.\nHerr, erbarme dich unser.\n\nGott Vater vom Himmel, erbarme dich unser.\nGott Sohn, Erlöser der Welt, erbarme dich unser.\nGott Heiliger Geist, erbarme dich unser.\nHeilige Dreifaltigkeit, ein einiger Gott, erbarme dich unser.",
          en: "Lord, have mercy. Christ, have mercy. Lord, have mercy.\n\nGod the Father of heaven, have mercy on us.\nGod the Son, Redeemer of the world, have mercy on us.\nGod the Holy Spirit, have mercy on us.\nHoly Trinity, one God, have mercy on us.",
        },
      },
      {
        title: { de: "Herz Jesu", en: "Heart of Jesus" },
        text: {
          de: "Herz Jesu, Sohn des ewigen Vaters, — erbarme dich unser.\nHerz Jesu, im Schoße der jungfräulichen Mutter vom Heiligen Geist gebildet,\nHerz Jesu, mit dem Wort Gottes wesenhaft vereint,\nHerz Jesu, von unendlicher Majestät,\nHerz Jesu, heiliger Tempel Gottes,\nHerz Jesu, Wohnung des Allerhöchsten,\nHerz Jesu, Haus Gottes und Pforte des Himmels,\nHerz Jesu, flammender Herd der Liebe,\nHerz Jesu, Hort der Gerechtigkeit und Liebe,\nHerz Jesu, voll Güte und Liebe,\nHerz Jesu, Abgrund aller Tugenden,\nHerz Jesu, allen Lobes würdig,\nHerz Jesu, König und Mittelpunkt aller Herzen,\nHerz Jesu, Inbegriff aller Weisheit und Wissenschaft,\nHerz Jesu, in dem die ganze Fülle der Gottheit wohnt,\nHerz Jesu, an dem der Vater sein Wohlgefallen hat,\nHerz Jesu, aus dessen Fülle wir alle empfangen haben,",
          en: "Heart of Jesus, Son of the Eternal Father, — have mercy on us.\nHeart of Jesus, formed by the Holy Spirit in the womb of the Virgin Mother,\nHeart of Jesus, substantially united to the Word of God,\nHeart of Jesus, of infinite majesty,\nHeart of Jesus, sacred temple of God,\nHeart of Jesus, tabernacle of the Most High,\nHeart of Jesus, house of God and gate of heaven,\nHeart of Jesus, burning furnace of charity,\nHeart of Jesus, abode of justice and love,\nHeart of Jesus, full of goodness and love,\nHeart of Jesus, abyss of all virtues,\nHeart of Jesus, most worthy of all praise,\nHeart of Jesus, king and center of all hearts,\nHeart of Jesus, in whom are all the treasures of wisdom and knowledge,\nHeart of Jesus, in whom dwells the fullness of divinity,\nHeart of Jesus, in whom the Father was well pleased,\nHeart of Jesus, of whose fullness we have all received,",
        },
      },
      {
        title: { de: "Herz Jesu, Quelle des Lebens", en: "Heart of Jesus, fount of life" },
        text: {
          de: "Herz Jesu, du Sehnsucht der ewigen Hügel, — erbarme dich unser.\nHerz Jesu, geduldig und reich an Erbarmen,\nHerz Jesu, freigebig gegen alle, die dich anrufen,\nHerz Jesu, Quelle des Lebens und der Heiligkeit,\nHerz Jesu, Sühne für unsere Sünden,\nHerz Jesu, mit Schmähungen gesättigt,\nHerz Jesu, um unserer Missetaten willen zerschlagen,\nHerz Jesu, gehorsam bis zum Tode,\nHerz Jesu, von der Lanze durchbohrt,\nHerz Jesu, Quelle alles Trostes,\nHerz Jesu, unser Leben und unsere Auferstehung,\nHerz Jesu, unser Friede und unsere Versöhnung,\nHerz Jesu, Opfer für die Sünder,\nHerz Jesu, Heil der auf dich Hoffenden,\nHerz Jesu, Hoffnung der in dir Sterbenden,\nHerz Jesu, Wonne aller Heiligen.",
          en: "Heart of Jesus, desire of the everlasting hills, — have mercy on us.\nHeart of Jesus, patient and rich in mercy,\nHeart of Jesus, generous to all who call upon You,\nHeart of Jesus, fount of life and holiness,\nHeart of Jesus, propitiation for our sins,\nHeart of Jesus, filled with reproaches,\nHeart of Jesus, bruised for our offenses,\nHeart of Jesus, obedient unto death,\nHeart of Jesus, pierced with a lance,\nHeart of Jesus, source of all consolation,\nHeart of Jesus, our life and resurrection,\nHeart of Jesus, our peace and reconciliation,\nHeart of Jesus, victim for our sins,\nHeart of Jesus, salvation of those who trust in You,\nHeart of Jesus, hope of those who die in You,\nHeart of Jesus, delight of all the saints.",
        },
      },
      {
        title: { de: "Schlussgebet", en: "Closing Prayer" },
        text: {
          de: "Lamm Gottes, du nimmst hinweg die Sünden der Welt, — verschone uns, o Herr.\nLamm Gottes, — erhöre uns, o Herr.\nLamm Gottes, — erbarme dich unser.\n\nJesus, sanftmütig und von Herzen demütig, — bilde unser Herz nach deinem Herzen.\n\nLasset uns beten.\nAllmächtiger, ewiger Gott, schau auf das Herz deines geliebten Sohnes und auf das Lob und die Genugtuung, die er dir darbringt. Sei den Sündern gnädig, die ihn um Barmherzigkeit anrufen, und gewähre ihnen im Namen Jesu Christi, deines Sohnes, Vergebung. Der mit dir lebt und herrscht in Ewigkeit. Amen.",
          en: "Lamb of God, who takes away the sins of the world, — spare us, O Lord.\nLamb of God, — graciously hear us, O Lord.\nLamb of God, — have mercy on us.\n\nJesus, meek and humble of heart, — make our hearts like unto Thine.\n\nLet us pray.\nAlmighty and eternal God, look upon the Heart of Your dearly beloved Son and upon the praise and satisfaction He offers You on behalf of sinners; and, appeased, grant pardon to those who seek Your mercy, in the name of the same Jesus Christ, Your Son, who lives and reigns forever. Amen.",
        },
      },
    ],
  },
  {
    slug: "all-saints",
    category: "litany",
    icon: "groups",
    title: { de: "Allerheiligenlitanei", en: "Litany of the Saints" },
    description: { de: "Anrufung der Heiligen um ihre Fürsprache", en: "Calling upon the saints for their intercession" },
    steps: [
      {
        title: { de: "Anrufungen", en: "Invocations" },
        text: {
          de: "Herr, erbarme dich unser.\nChristus, erbarme dich unser.\nHerr, erbarme dich unser.\n\nHeilige Maria, Mutter Gottes, — bitte für uns.\nHeiliger Michael,\nHeilige Engel Gottes,\nHeiliger Johannes der Täufer,\nHeiliger Josef,\nHeilige Patriarchen und Propheten,",
          en: "Lord, have mercy. Christ, have mercy. Lord, have mercy.\n\nHoly Mary, Mother of God, — pray for us.\nSaint Michael,\nHoly angels of God,\nSaint John the Baptist,\nSaint Joseph,\nHoly patriarchs and prophets,",
        },
      },
      {
        title: { de: "Apostel und Jünger", en: "Apostles and disciples" },
        text: {
          de: "Heiliger Petrus und Paulus, — bittet für uns.\nHeiliger Andreas,\nHeiliger Johannes,\nHeilige Maria Magdalena,\nHeiliger Stephanus,\nHeiliger Ignatius von Antiochien,\nHeiliger Laurentius,\nHeilige Perpetua und Felizitas,\nHeilige Agnes,\nHeiliger Gregor,\nHeiliger Augustinus,\nHeiliger Athanasius,\nHeiliger Basilius,\nHeiliger Martin,\nHeiliger Benedikt,\nHeiliger Franz und Dominikus,\nHeiliger Franz Xaver,\nHeiliger Johannes Maria Vianney,\nHeilige Katharina von Siena,\nHeilige Theresia von Ávila,",
          en: "Saints Peter and Paul, — pray for us.\nSaint Andrew,\nSaint John,\nSaint Mary Magdalene,\nSaint Stephen,\nSaint Ignatius of Antioch,\nSaint Lawrence,\nSaints Perpetua and Felicity,\nSaint Agnes,\nSaint Gregory,\nSaint Augustine,\nSaint Athanasius,\nSaint Basil,\nSaint Martin,\nSaint Benedict,\nSaints Francis and Dominic,\nSaint Francis Xavier,\nSaint John Vianney,\nSaint Catherine of Siena,\nSaint Teresa of Ávila,",
        },
      },
      {
        title: { de: "Bitten", en: "Petitions" },
        text: {
          de: "Alle heiligen Männer und Frauen Gottes, — bittet für uns.\n\nSei uns gnädig, — erlöse uns, o Herr.\nVon allem Bösen,\nVon jeder Sünde,\nVon den Nachstellungen des Teufels,\nVon Zorn, Hass und jedem bösen Willen,\nVom Geist der Unreinheit,\nVom ewigen Tod,\n\nWir Sünder — wir bitten dich, erhöre uns.\nRegiere und behüte deine heilige Kirche,\nBewahre den Papst und alle Diener der Kirche in treuem Dienst,\nSchenke allen Völkern Einheit und Frieden,\nSei ein starker Halt für uns in deinem Dienst.",
          en: "All holy men and women, saints of God, — pray for us.\n\nLord, be merciful, — Lord, deliver us, we pray.\nFrom all evil,\nFrom every sin,\nFrom the snares of the devil,\nFrom anger, hatred, and all ill-will,\nFrom the spirit of uncleanness,\nFrom everlasting death,\n\nWe sinners, — we beseech You to hear us.\nGovern and preserve Your holy Church,\nGrant peace and true concord to all nations,\nComfort and enlighten Your Church.",
        },
      },
      {
        title: { de: "Schluss", en: "Conclusion" },
        text: {
          de: "Christus, höre uns.\nChristus, erhöre uns.\n\nLasset uns beten.\nGott, du Zuflucht aller, die zu dir beten: erhöre die Fürbitte deiner Heiligen und schenke uns, worum wir im Vertrauen auf deine Liebe bitten. Durch Christus, unseren Herrn. Amen.",
          en: "Christ, hear us. Christ, graciously hear us.\n\nLet us pray.\nO God, our refuge and our strength, hear the prayers of Your Church, for You Yourself are the source of all devotion, and grant, we beseech You, that what we ask in faith we may truly obtain. Through Christ our Lord. Amen.",
        },
      },
    ],
  },
  {
    slug: "compline",
    category: "hour",
    icon: "bedtime",
    title: { de: "Komplet", en: "Night Prayer (Compline)" },
    description: { de: "Das Nachtgebet der Kirche", en: "The Church's night prayer" },
    steps: [
      {
        title: { de: "Eröffnung", en: "Opening" },
        text: {
          de: "O Gott, komm mir zu Hilfe.\nHerr, eile mir zu helfen.\n\nEhre sei dem Vater und dem Sohn und dem Heiligen Geist, wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen. Halleluja.",
          en: "O God, come to my assistance.\nO Lord, make haste to help me.\n\nGlory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen. Alleluia.",
        },
      },
      {
        title: { de: "Gewissenserforschung", en: "Examination of conscience" },
        text: {
          de: "Lasst uns einkehren in uns selbst und Gott unsere Sünden bekennen.\n\nIch bekenne Gott, dem Allmächtigen, und allen Brüdern und Schwestern, dass ich Gutes unterlassen und Böses getan habe — ich habe gesündigt in Gedanken, Worten und Werken, durch meine Schuld, durch meine Schuld, durch meine große Schuld. Darum bitte ich die selige Jungfrau Maria, alle Engel und Heiligen und euch, Brüder und Schwestern, für mich zu beten bei Gott, unserem Herrn.\n\nDer allmächtige Gott erbarme sich unser, er lasse uns die Sünden nach und führe uns zum ewigen Leben. Amen.",
          en: "Let us reflect in silence and confess our sins to God.\n\nI confess to almighty God and to you, my brothers and sisters, that I have greatly sinned, in my thoughts and in my words, in what I have done and in what I have failed to do, through my fault, through my fault, through my most grievous fault; therefore I ask blessed Mary ever-Virgin, all the Angels and Saints, and you, my brothers and sisters, to pray for me to the Lord our God.\n\nMay almighty God have mercy on us, forgive us our sins, and bring us to everlasting life. Amen.",
        },
      },
      {
        title: { de: "Hymnus", en: "Hymn" },
        text: {
          de: "Bevor des Tages Licht vergeht,\no Herr der Welt, hör dies Gebet:\nBehüte uns in dieser Nacht\ndurch deine große Güt und Macht.\n\nHalt fern, o Herr, von unserm Haus\ndie Ängste und die Träume aus.\nGib unserm Herzen Fried und Ruh\nund schließ der Feinde Listen zu.\n\nErhör uns, Vater voll der Macht,\nder du mit Christus herrschst in Pracht,\nder du mit Christ und Geist zugleich\nregierst in Ewigkeit dein Reich. Amen.",
          en: "Before the ending of the day,\nCreator of the world, we pray\nThat with Thy wonted favor Thou\nWouldst be our guard and keeper now.\n\nFrom all ill dreams defend our eyes,\nFrom nightly fears and fantasies;\nTread under foot our ghostly foe,\nThat no pollution we may know.\n\nO Father, that we ask be done,\nThrough Jesus Christ, Thine only Son;\nWho, with the Holy Ghost and Thee,\nDoth live and reign eternally. Amen.",
        },
      },
      {
        title: { de: "Psalm 91", en: "Psalm 91" },
        text: {
          de: "Wer im Schutz des Höchsten wohnt\nund ruht im Schatten des Allmächtigen,\nder sagt zum Herrn:\n„Du bist für mich Zuflucht und Burg,\nmein Gott, dem ich vertraue.\"\n\nEr rettet dich aus der Schlinge des Jägers\nund aus allem Verderben.\nEr beschirmt dich mit seinen Flügeln,\nunter seinen Schwingen findest du Zuflucht,\nSchild und Schutz ist dir seine Treue.\n\nDu brauchst dich vor dem Schrecken der Nacht nicht zu fürchten,\nnoch vor dem Pfeil, der am Tag dahinfliegt.\nKein Unheil wird dich treffen,\nkeine Plage wird nahen deinem Zelt.\n\nDenn seinen Engeln hat er befohlen,\ndich zu behüten auf all deinen Wegen.\n\nEhre sei dem Vater und dem Sohn und dem Heiligen Geist,\nwie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen.",
          en: "He who dwells in the shelter of the Most High,\nwho abides in the shade of the Almighty,\nsays to the Lord: \"My refuge, my stronghold,\nmy God in whom I trust.\"\n\nIt is He who will free you from the snare\nof the fowler who seeks to destroy you;\nHe will conceal you with His pinions\nand under His wings you will find refuge.\n\nYou will not fear the terror of the night\nnor the arrow that flies by day,\nnor the plague that prowls in the darkness.\n\nFor He has commanded His angels\nto keep you in all your ways.\n\nGlory to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
        },
      },
      {
        title: { de: "Kurzlesung", en: "Short Reading" },
        text: {
          de: "Offb 22,4-5\nSie werden das Angesicht Gottes schauen, und sein Name wird auf ihrer Stirn sein. Es wird keine Nacht mehr geben und sie brauchen weder das Licht einer Lampe noch das Licht der Sonne. Denn der Herr, ihr Gott, wird über ihnen leuchten, und sie werden herrschen in alle Ewigkeit.",
          en: "Revelation 22:4-5\nThey will see His face, and His name will be on their foreheads. There will be no more night; they will not need the light of a lamp or the light of the sun. For the Lord God will give them light, and they will reign for ever and ever.",
        },
      },
      {
        title: { de: "Nunc dimittis", en: "Nunc dimittis" },
        text: {
          de: "Nun lässt du, Herr, deinen Knecht, wie du gesagt hast, in Frieden scheiden.\nDenn meine Augen haben das Heil gesehen,\ndas du vor allen Völkern bereitet hast,\nein Licht, das die Heiden erleuchtet,\nund Herrlichkeit für dein Volk Israel.\n\nEhre sei dem Vater und dem Sohn und dem Heiligen Geist,\nwie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen.",
          en: "Lord, now You let Your servant go in peace; Your word has been fulfilled.\nMy own eyes have seen the salvation\nwhich You have prepared in the sight of every people:\na light to reveal You to the nations\nand the glory of Your people Israel.\n\nGlory to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
        },
      },
      {
        title: { de: "Oration", en: "Prayer" },
        text: {
          de: "Lasset uns beten.\nHerr, gib uns eine ruhige Nacht und lass uns am Ende ein seliges Ende finden. Darum bitten wir durch Christus, unseren Herrn. Amen.\n\nEs segne und behüte uns der allmächtige und barmherzige Gott, der Vater und der Sohn und der Heilige Geist. Amen.",
          en: "Let us pray.\nGrant, Lord, we pray, that we may keep so faithful a vigil in this night that, when we sleep in peace, we may rejoice to keep watch with Christ. Through Christ our Lord. Amen.\n\nMay the all-powerful Lord grant us a restful night and a peaceful death. Amen.",
        },
      },
      {
        title: { de: "Marianische Antiphon", en: "Marian Antiphon" },
        text: {
          de: "Salve Regina\n\nSei gegrüßt, o Königin, Mutter der Barmherzigkeit, unser Leben, unsre Wonne und unsre Hoffnung, sei gegrüßt! Zu dir rufen wir verbannte Kinder Evas; zu dir seufzen wir trauernd und weinend in diesem Tal der Tränen. Wohlan denn, unsre Fürsprecherin, wende deine barmherzigen Augen uns zu, und nach diesem Elend zeige uns Jesus, die gebenedeite Frucht deines Leibes. O gütige, o milde, o süße Jungfrau Maria!",
          en: "Salve Regina\n\nHail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To you do we cry, poor banished children of Eve; to you do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, your eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of your womb, Jesus. O clement, O loving, O sweet Virgin Mary.",
        },
      },
    ],
  },

  // ===================== Devotions / Daily Prayers =====================

  {
    slug: "totus-tuus",
    category: "devotion",
    icon: "favorite",
    title: { de: "Totus Tuus — Weihe an Maria", en: "Totus Tuus — Consecration to Mary" },
    description: {
      de: "Persönliches Weihegebet des hl. Johannes Paul II. an die Gottesmutter",
      en: "Personal Marian consecration prayer of St. John Paul II",
    },
    steps: [
      {
        text: {
          de: "Ganz dein, Maria.\nTotus tuus ego sum, Maria, et omnia mea tua sunt.\n\nIch bin ganz dein, Maria, und alles, was mein ist, gehört dir. Du bist mir in allem Beispiel. O Maria, meine Mutter, nimm mich zu deinem Kind an. Leite mich, bewahre mich, bete für mich als deine Tochter, deinen Sohn, in der Stunde meines Todes. Amen.",
          en: "I am all yours, Mary.\nTotus tuus ego sum, Maria, et omnia mea tua sunt.\n\nI am all yours, Mary, and all that I have is yours. You are my model in all things. O Mary, my Mother, take me as your child. Guide me, keep me, pray for me as your daughter, your son, at the hour of my death. Amen.",
        },
      },
    ],
  },

  {
    slug: "thomas-aquinas-before-study",
    category: "devotion",
    icon: "menu_book",
    title: {
      de: "Gebet vor dem Studium — hl. Thomas von Aquin",
      en: "Prayer Before Study — St. Thomas Aquinas",
    },
    description: {
      de: "Um Erleuchtung des Verstandes und Klarheit des Denkens",
      en: "For illumination of the intellect and clarity of thought",
    },
    steps: [
      {
        text: {
          de: "Unaussprechlicher Schöpfer, du hast aus den Schätzen deiner Weisheit drei Ordnungen von Engeln eingerichtet und sie in wunderbarer Ordnung über den erhabenen Himmel gesetzt, die Teile des Weltalls vortrefflich geordnet: Du, den man den wahren Quell des Lichtes und der Weisheit, den erhabenen Ursprung nennt, gieße gnädig in die Finsternis meines Verstandes einen Strahl deiner Klarheit, nimm die zweifache Finsternis von mir, unter der ich geboren bin: die Finsternis der Sünde und die der Unwissenheit.\n\nDu, der du die Zungen der Kinder beredt machst, bilde meine Zunge, und gieße auf meine Lippen die Gnade deines Segens. Verleihe mir Schärfe des Verstandes beim Begreifen, Fähigkeit des Behaltens, Leichtigkeit im Lernen, Tiefe des Erkennens, Überfluss an Ausdruck. Lehre mich anfangen, leite mich voran, vollende, was ich beginne, durch Christus, unsern Herrn. Amen.",
          en: "Ineffable Creator, You who are the true fount of light and wisdom, pour forth a ray of Your brightness into the darkened places of my mind; disperse from my soul the twofold darkness into which I was born: sin and ignorance.\n\nYou make eloquent the tongues of infants. Refine my speech and pour forth upon my lips the goodness of Your blessing. Grant me keenness of mind, capacity to remember, skill in learning, subtlety to interpret, and eloquence in speech. May You guide the beginning of my work, direct its progress, and bring it to completion, through Christ our Lord. Amen.",
        },
      },
    ],
  },

  {
    slug: "morning-offering",
    category: "devotion",
    icon: "wb_sunny",
    title: { de: "Morgenaufopferung", en: "Morning Offering" },
    description: {
      de: "Den Tag in Gottes Hände legen",
      en: "Offering the day into God's hands",
    },
    steps: [
      {
        text: {
          de: "Herr, mein Gott, ich bete dich an und danke dir für diesen neuen Tag. Ich schenke dir meine Gedanken, Worte und Taten, meine Freuden und Leiden, meine Arbeit und mein Gebet. Vereinige sie mit dem heiligen Opfer deines Sohnes, unseres Herrn Jesus Christus, das auf unzähligen Altären der Erde dargebracht wird. Ich bringe sie dir dar für deine heilige Kirche, für den Heiligen Vater, für alle meine Lieben und für die Anliegen, die mir heute besonders am Herzen liegen.\n\nMaria, meine Mutter, heiliger Joseph, mein Schutzengel — begleitet mich durch diesen Tag. Amen.",
          en: "Lord my God, I adore You and thank You for this new day. I offer You my thoughts, words, and actions, my joys and sufferings, my work and my prayer. Unite them with the Holy Sacrifice of Your Son, our Lord Jesus Christ, offered on altars throughout the world. I offer them for Your Holy Church, for the Holy Father, for those I love, and for the intentions I carry today.\n\nMary, my Mother, St. Joseph, my Guardian Angel — walk with me this day. Amen.",
        },
      },
    ],
  },

  {
    slug: "evening-prayer",
    category: "devotion",
    icon: "bedtime",
    title: { de: "Traditionelles Abendgebet", en: "Traditional Evening Prayer" },
    description: {
      de: "Gewissenserforschung und Hingabe vor dem Schlaf",
      en: "Examination of conscience and entrustment before sleep",
    },
    steps: [
      {
        title: { de: "Dank", en: "Thanksgiving" },
        text: {
          de: "Herr, mein Gott, ich danke dir für alle Gnaden dieses Tages: für das Leben, für die Menschen, die du mir geschenkt hast, für jedes gute Wort und jede kleine Freude.",
          en: "Lord my God, I thank You for every grace of this day: for life, for the people You have given me, for every good word and every small joy.",
        },
      },
      {
        title: { de: "Gewissenserforschung", en: "Examination of Conscience" },
        text: {
          de: "Ich betrachte diesen Tag in deiner Gegenwart. Wo habe ich gegen die Liebe zu dir und zum Nächsten gefehlt? In Gedanken, Worten und Werken? Was habe ich Gutes unterlassen?\n\n(Stille)",
          en: "I look back on this day in Your presence. Where did I fail in love — toward You or my neighbor? In thought, word, or deed? What good did I neglect?\n\n(Silence)",
        },
      },
      {
        title: { de: "Reuegebet", en: "Act of Contrition" },
        text: {
          de: "Mein Gott und Vater, ich habe Unrecht getan und dich beleidigt. Es tut mir leid. Verzeih mir, ich will mich bessern. Hilf mir mit deiner Gnade. Amen.",
          en: "My God and Father, I have done wrong and offended You. I am sorry. Forgive me, I want to amend my life. Help me with Your grace. Amen.",
        },
      },
      {
        title: { de: "Hingabe", en: "Entrustment" },
        text: {
          de: "In deine Hände, o Herr, lege ich meinen Geist. Du hast mich erlöst, Herr, du treuer Gott. Maria, Mutter Gottes, heiliger Joseph, heiliger Schutzengel — bittet für mich.\n\nIm Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.",
          en: "Into Your hands, O Lord, I commend my spirit. You have redeemed me, O Lord, faithful God. Mary, Mother of God, St. Joseph, Guardian Angel — pray for me.\n\nIn the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
        },
      },
    ],
  },

  {
    slug: "memorare",
    category: "devotion",
    icon: "favorite",
    title: { de: "Memorare — Gedenke", en: "Memorare" },
    description: {
      de: "Zuflucht zur Fürsprache der Gottesmutter (hl. Bernhard v. Clairvaux)",
      en: "A prayer of refuge in Our Lady's intercession (St. Bernard of Clairvaux)",
    },
    steps: [
      {
        text: {
          de: "Gedenke, o gütigste Jungfrau Maria, es ist noch nie gehört worden, dass jemand, der zu dir seine Zuflucht genommen, deine Hilfe angerufen und um deine Fürsprache gebeten hat, von dir verlassen worden sei.\n\nVon solchem Vertrauen beseelt, eile ich zu dir, Jungfrau der Jungfrauen. Zu dir komme ich; vor dir stehe ich als sündiger Mensch und seufze. Du Mutter des Ewigen Wortes, verschmähe nicht meine Worte, sondern höre sie gnädig und erhöre sie. Amen.",
          en: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to your protection, implored your help, or sought your intercession was left unaided.\n\nInspired with this confidence, I fly unto you, O Virgin of virgins, my Mother. To you do I come, before you I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in your mercy hear and answer me. Amen.",
        },
      },
    ],
  },

  {
    slug: "anima-christi",
    category: "devotion",
    icon: "local_fire_department",
    title: { de: "Anima Christi — Seele Christi", en: "Anima Christi — Soul of Christ" },
    description: {
      de: "Klassisches eucharistisches Dankgebet",
      en: "Classical eucharistic prayer of thanksgiving",
    },
    steps: [
      {
        text: {
          de: "Seele Christi, heilige mich.\nLeib Christi, rette mich.\nBlut Christi, tränke mich.\nWasser der Seite Christi, reinige mich.\nLeiden Christi, stärke mich.\nO guter Jesus, erhöre mich.\nBirg in deinen Wunden mich.\nVon dir lass nimmer scheiden mich.\nVor dem bösen Feind beschütze mich.\nIn meiner Todesstunde rufe mich,\nund lass zu dir kommen mich,\ndass ich mit deinen Heiligen lobe dich\nin alle Ewigkeit. Amen.",
          en: "Soul of Christ, sanctify me.\nBody of Christ, save me.\nBlood of Christ, inebriate me.\nWater from the side of Christ, wash me.\nPassion of Christ, strengthen me.\nO good Jesus, hear me.\nWithin Thy wounds, hide me.\nSeparated from Thee let me never be.\nFrom the malignant enemy, defend me.\nIn the hour of my death, call me,\nand bid me come unto Thee,\nThat with Thy Saints I may praise Thee\nforever and ever. Amen.",
        },
      },
    ],
  },

  {
    slug: "st-michael",
    category: "devotion",
    icon: "shield",
    title: {
      de: "Gebet zum hl. Erzengel Michael",
      en: "Prayer to St. Michael the Archangel",
    },
    description: {
      de: "Um Schutz gegen das Böse (Leo XIII.)",
      en: "For protection against evil (Leo XIII)",
    },
    steps: [
      {
        text: {
          de: "Heiliger Erzengel Michael, verteidige uns im Kampfe; gegen die Bosheit und die Nachstellungen des Teufels sei unser Schutz.\n\nGott gebiete ihm, so bitten wir flehentlich; du aber, Fürst der himmlischen Heerscharen, stoße den Satan und die anderen bösen Geister, die in der Welt umhergehen, um die Seelen zu verderben, durch die Kraft Gottes in die Hölle hinab. Amen.",
          en: "Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil.\n\nMay God rebuke him, we humbly pray; and do thou, O Prince of the Heavenly Host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.",
        },
      },
    ],
  },

  {
    slug: "guardian-angel",
    category: "devotion",
    icon: "auto_awesome",
    title: { de: "Schutzengelgebet", en: "Guardian Angel Prayer" },
    description: {
      de: "Tägliches Gebet an den eigenen Schutzengel",
      en: "Daily prayer to one's guardian angel",
    },
    steps: [
      {
        text: {
          de: "Heiliger Schutzengel mein,\nlass mich dir empfohlen sein.\nIn allem Tun und allem Lauf\nhalte deine Hand auf mich.\nBehüte mich bei Tag und Nacht,\nbis Gott mich in sein Reich gebracht. Amen.",
          en: "Angel of God, my guardian dear,\nto whom God's love commits me here:\never this day be at my side,\nto light and guard, to rule and guide. Amen.",
        },
      },
    ],
  },

  {
    slug: "veni-creator",
    category: "devotion",
    icon: "local_fire_department",
    title: { de: "Veni Creator Spiritus", en: "Veni Creator Spiritus" },
    description: {
      de: "Anrufung des Heiligen Geistes (Hrabanus Maurus)",
      en: "Invocation of the Holy Spirit (Rabanus Maurus)",
    },
    steps: [
      {
        text: {
          de: "Komm, Schöpfer Geist, kehr bei uns ein,\nbesuch das Herz der Kinder dein:\ndie deine Macht erschaffen hat,\nerfülle nun mit deiner Gnad.\n\nDer du der Tröster wirst genannt,\nvom höchsten Gott ein Gnadenpfand,\ndu Lebensbrunn, Licht, Lieb und Glut,\nder Seele Salbung, höchstes Gut.\n\nO Schatz, der siebenfältig ziert,\no Finger Gottes, der uns führt,\nGeschenk, vom Vater zugesagt,\ndu, der die Zungen reden macht.\n\nZünd an in uns des Lichtes Schein,\ngieß Liebe in die Herzen ein,\nstärk unsres Leibes Schwachheit an\nmit deiner Kraft zu jeder Zeit.\n\nDen Feind vertreibe weit hinaus,\nden Frieden bring in unser Haus;\nund da du gehst uns selbst voran,\nmeid unser Fuß des Bösen Bahn.\n\nAmen.",
          en: "Come, Creator Spirit, come,\nfrom Thy bright heavenly throne;\ncome, take possession of our souls,\nand make them all Thine own.\n\nThou who art called the Paraclete,\nbest gift of God above,\nthe living spring, the living fire,\nsweet unction, and true love.\n\nKindle our senses from above,\nand make our hearts o'erflow\nwith love in every word and deed,\nthat we Thy peace may know.\n\nAmen.",
        },
      },
    ],
  },

  {
    slug: "st-joseph",
    category: "devotion",
    icon: "carpenter",
    title: { de: "Gebet zum hl. Josef", en: "Prayer to St. Joseph" },
    description: {
      de: "Um Fürsprache des Kirchenpatrons (Leo XIII.)",
      en: "For the intercession of the Patron of the Church (Leo XIII)",
    },
    steps: [
      {
        text: {
          de: "Zu dir, heiliger Josef, nehmen wir unsere Zuflucht in unserer Not. Wir rufen deine mächtige Fürsprache an, nach der deiner heiligsten Braut, und bitten voll Vertrauen um deinen Schutz.\n\nBei der Liebe, die dich mit der unbefleckten Jungfrau und Gottesmutter verband, und bei der väterlichen Zuneigung, mit der du das Jesuskind umfingst, flehen wir dich an: Blicke gnädig auf das Erbe, das Jesus Christus sich durch sein Blut erworben hat, und hilf uns in unseren Nöten durch deine Macht und deinen Beistand.\n\nBeschütze, o gütigster Hüter der Heiligen Familie, die auserwählte Nachkommenschaft Jesu Christi. Halte, o liebreichster Vater, alle Irrtümer und Verderben von uns fern. Steh uns vom Himmel aus gnädig bei in diesem Kampf gegen die Macht der Finsternis, du unser starker Schutz; und wie du einst das Jesuskind aus höchster Lebensgefahr gerettet hast, so verteidige jetzt die heilige Kirche Gottes vor den Nachstellungen aller Feinde und allem Unheil; uns aber alle nimm in deinen beständigen Schutz, auf dass wir nach deinem Beispiel und durch deinen Beistand heilig leben, selig sterben und die ewige Glückseligkeit im Himmel erlangen. Amen.",
          en: "To you, O blessed Joseph, we come in our afflictions, and having asked the help of your most holy spouse, we confidently ask your patronage also. Through that love which bound you to the Immaculate Virgin Mother of God and through the paternal love with which you embraced the Child Jesus, we beseech you to look graciously upon the inheritance which Jesus Christ purchased by His blood, and to help us in our needs by your power and strength.\n\nMost watchful guardian of the Holy Family, defend the chosen people of Jesus Christ. Keep from us, most loving father, all blight of error and corruption. Aid us from on high, most valiant defender, in this conflict with the powers of darkness. As once you rescued the Child Jesus from deadly peril, so now defend God's Holy Church from the snares of the enemy and from all adversity. Shield each one of us by your constant protection, so that, supported by your example and your aid, we may be able to live a holy life, die a happy death, and attain everlasting happiness in Heaven. Amen.",
        },
      },
    ],
  },

  // ===== Marian =====

  {
    slug: "angelus",
    category: "devotion",
    icon: "notifications_active",
    title: { de: "Der Engel des Herrn (Angelus)", en: "The Angelus" },
    description: { de: "Morgens, mittags und abends — das Geheimnis der Menschwerdung", en: "Morning, noon, and evening — the mystery of the Incarnation" },
    steps: [
      { title: { de: "V./R.", en: "V./R." }, text: { de: "V: Der Engel des Herrn brachte Maria die Botschaft,\nR: und sie empfing vom Heiligen Geist.\n\nGegrüßet seist du, Maria, voll der Gnade, der Herr ist mit dir. Du bist gebenedeit unter den Frauen, und gebenedeit ist die Frucht deines Leibes, Jesus. Heilige Maria, Mutter Gottes, bitte für uns Sünder, jetzt und in der Stunde unseres Todes. Amen.", en: "V: The Angel of the Lord declared unto Mary,\nR: and she conceived of the Holy Spirit.\n\nHail Mary, full of grace..." } },
      { text: { de: "V: Maria sprach: Siehe, ich bin die Magd des Herrn;\nR: mir geschehe nach deinem Wort.\n\nGegrüßet seist du, Maria...", en: "V: Behold the handmaid of the Lord.\nR: Be it done unto me according to thy word.\n\nHail Mary..." } },
      { text: { de: "V: Und das Wort ist Fleisch geworden\nR: und hat unter uns gewohnt.\n\nGegrüßet seist du, Maria...", en: "V: And the Word was made flesh\nR: and dwelt among us.\n\nHail Mary..." } },
      { title: { de: "Schlussgebet", en: "Closing" }, text: { de: "V: Bitte für uns, o heilige Gottesgebärerin,\nR: auf dass wir würdig werden der Verheißungen Christi.\n\nLasset uns beten.\nAllmächtiger Gott, gieße deine Gnade in unsere Herzen ein. Durch die Botschaft des Engels haben wir die Menschwerdung Christi, deines Sohnes, erkannt. Lass uns durch sein Leiden und Kreuz zur Herrlichkeit der Auferstehung gelangen. Darum bitten wir durch Christus, unseren Herrn. Amen.", en: "V: Pray for us, O holy Mother of God.\nR: That we may be made worthy of the promises of Christ.\n\nLet us pray. Pour forth, we beseech Thee, O Lord, Thy grace into our hearts, that we, to whom the Incarnation of Christ Thy Son was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen." } },
    ],
  },

  {
    slug: "regina-caeli",
    category: "devotion",
    icon: "celebration",
    title: { de: "Regina Caeli — Freu dich, du Himmelskönigin", en: "Regina Caeli" },
    description: { de: "Osterantiphon — ersetzt den Angelus in der Osterzeit", en: "Easter antiphon, replaces the Angelus during Eastertide" },
    steps: [
      { text: { de: "Freu dich, du Himmelskönigin, Halleluja!\nDen du zu tragen würdig warst, Halleluja,\ner ist auferstanden, wie er gesagt, Halleluja.\nBitt Gott für uns, Maria, Halleluja.\n\nV: Freu dich und frohlocke, Jungfrau Maria, Halleluja.\nR: Denn der Herr ist wahrhaft auferstanden, Halleluja.\n\nLasset uns beten.\nAllmächtiger Gott, durch die Auferstehung deines Sohnes, unseres Herrn Jesus Christus, hast du die Welt mit Jubel erfüllt. Lass uns durch seine jungfräuliche Mutter Maria zur unvergänglichen Osterfreude gelangen. Darum bitten wir durch Christus, unseren Herrn. Amen.", en: "Queen of Heaven, rejoice, alleluia.\nFor He whom you did merit to bear, alleluia,\nhas risen as He said, alleluia.\nPray for us to God, alleluia.\n\nV: Rejoice and be glad, O Virgin Mary, alleluia.\nR: For the Lord has truly risen, alleluia.\n\nLet us pray. O God, who by the Resurrection of Your Son, our Lord Jesus Christ, granted joy to the whole world, grant that through His Virgin Mother we may obtain the joys of everlasting life. Through Christ our Lord. Amen." } },
    ],
  },

  {
    slug: "sub-tuum",
    category: "devotion",
    icon: "shield_moon",
    title: { de: "Sub tuum praesidium — Unter deinen Schutz", en: "Sub tuum praesidium" },
    description: { de: "Ältestes bekanntes Gebet zur Gottesmutter (3. Jh.)", en: "The oldest known prayer to the Mother of God (3rd c.)" },
    steps: [
      { text: { de: "Unter deinen Schutz und Schirm fliehen wir, heilige Gottesgebärerin. Verschmähe nicht unser Gebet in unseren Nöten, sondern erlöse uns jederzeit von allen Gefahren, o du glorreiche und gebenedeite Jungfrau. Amen.", en: "We fly to your patronage, O holy Mother of God; despise not our petitions in our necessities, but deliver us always from all dangers, O glorious and blessed Virgin. Amen." } },
    ],
  },

  {
    slug: "magnificat",
    category: "devotion",
    icon: "volunteer_activism",
    title: { de: "Magnificat — Lobgesang Marias", en: "Magnificat — Canticle of Mary" },
    description: { de: "Marias Lobpreis (Lk 1,46-55), Herzstück der Vesper", en: "Mary's song of praise (Luke 1:46-55), heart of Vespers" },
    steps: [
      { text: { de: "Meine Seele preist die Größe des Herrn,\nund mein Geist jubelt über Gott, meinen Retter.\nDenn auf die Niedrigkeit seiner Magd hat er geschaut.\nSiehe, von nun an preisen mich selig alle Geschlechter.\nDenn der Mächtige hat Großes an mir getan,\nund sein Name ist heilig.\nEr erbarmt sich von Geschlecht zu Geschlecht\nüber alle, die ihn fürchten.\nEr vollbringt mit seinem Arm machtvolle Taten:\nEr zerstreut, die im Herzen voll Hochmut sind.\nEr stürzt die Mächtigen vom Thron\nund erhöht die Niedrigen.\nDie Hungernden beschenkt er mit seinen Gaben\nund lässt die Reichen leer ausgehen.\nEr nimmt sich seines Knechtes Israel an\nund denkt an sein Erbarmen,\ndas er unseren Vätern verheißen hat,\nAbraham und seinen Nachkommen auf ewig.\n\nEhre sei dem Vater und dem Sohn und dem Heiligen Geist,\nwie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen.", en: "My soul magnifies the Lord,\nand my spirit rejoices in God my Savior,\nfor He has looked upon the lowliness of His handmaid.\nBehold, from now on all generations shall call me blessed,\nfor the Mighty One has done great things for me,\nand holy is His name.\nHis mercy is from age to age on those who fear Him.\nHe has shown might with His arm,\ndispersed the arrogant of mind and heart.\nHe has thrown down the rulers from their thrones\nbut lifted up the lowly.\nThe hungry He has filled with good things;\nthe rich He has sent away empty.\nHe has helped Israel His servant,\nremembering His mercy,\naccording to His promise to our fathers,\nto Abraham and his descendants forever.\n\nGlory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen." } },
    ],
  },

  // ===== Eucharistic =====

  {
    slug: "tantum-ergo",
    category: "devotion",
    icon: "star",
    title: { de: "Tantum Ergo", en: "Tantum Ergo" },
    description: { de: "Eucharistischer Hymnus (Thomas v. Aquin)", en: "Eucharistic hymn (Thomas Aquinas)" },
    steps: [
      { text: { de: "Gottheit tief verborgen, betend nah ich dir.\nUnter diesen Zeichen bist du wirklich hier.\nSieh, mit ganzem Herzen schenk ich mich dir hin,\nweil vor solchem Wunder ich nur Armut bin.\n\nTantum ergo Sacramentum veneremur cernui:\net antiquum documentum novo cedat ritui:\npraestet fides supplementum sensuum defectui.\n\nGenitori, Genitoque laus et iubilatio,\nsalus, honor, virtus quoque sit et benedictio:\nprocedenti ab utroque compar sit laudatio. Amen.\n\nV: Brot des Himmels hast du ihnen gegeben, Halleluja.\nR: Das alle Labsal in sich birgt, Halleluja.", en: "Down in adoration falling, lo! the sacred Host we hail,\nlo! o'er ancient forms departing, newer rites of grace prevail:\nfaith for all defects supplying, where the feeble senses fail.\n\nTo the everlasting Father, and the Son who reigns on high,\nwith the Holy Spirit proceeding forth from each eternally,\nbe salvation, honor, blessing, might and endless majesty. Amen." } },
    ],
  },

  {
    slug: "adoro-te-devote",
    category: "devotion",
    icon: "star",
    title: { de: "Adoro Te Devote", en: "Adoro Te Devote" },
    description: { de: "Anbetungshymnus (Thomas v. Aquin)", en: "Adoration hymn (Thomas Aquinas)" },
    steps: [
      { text: { de: "Dich Gottheit, tief verborgen, demütig bet ich an,\ndie unter den Gestalten sich wahrhaft bergen kann.\nDir gebe sich mein Herze zu eigen ganz und gar,\nweil vor dir, angebet'ter, es nur wie nichts noch war.\n\nVor dir getäuscht wird Auge, Getast und Zunge ganz,\nnur das Gehör bringt Kunde von deines Wesens Glanz.\nIch glaub, was Gottes Sohn uns zu lehren sich entschloss;\nes gibt nicht Wort des Wahren, das gleich dem Worte groß.\n\nAm Kreuz war nur verborgen die Gottheit, doch nicht mehr;\nhier ist zumal verborgen die Menschheit auch so sehr.\nDoch beide fest bekennend, glaub ich, gewiss und fest,\nwie einst der reuige Schächer um Gnade bitten lässt.\n\nDie Wunden seh ich freilich nicht, wie sie Thomas sah,\ndoch rufe ich mein Gott du, bist du mir wirklich nah.\nAch gib mir, dass ich immer mehr glauben möge dir,\nauf dich mein Hoffen gründe, in Liebe steh zu dir. Amen.", en: "I devoutly adore Thee, O hidden Deity, truly hidden beneath these appearances. My whole heart submits to Thee, and in contemplating Thee, it surrenders itself completely.\n\nSight, touch, taste are all deceived in their judgment of Thee, but hearing suffices firmly to believe. I believe all that the Son of God has spoken; there is nothing truer than this word of Truth.\n\nO Jesus, whom now I see hidden, I ask of Thee to fulfill what I so desire: That on seeing Thee face to face, I may be happy in seeing Thy glory. Amen." } },
    ],
  },

  {
    slug: "spiritual-communion",
    category: "devotion",
    icon: "favorite_border",
    title: { de: "Geistliche Kommunion", en: "Spiritual Communion" },
    description: { de: "Für Zeiten ohne Mess-Teilnahme (Alfons v. Liguori)", en: "For times when sacramental communion is not possible (Alphonsus Liguori)" },
    steps: [
      { text: { de: "Mein Jesus, ich glaube, dass du im heiligsten Sakrament wahrhaft gegenwärtig bist.\nIch liebe dich über alles und ersehne dich in meine Seele.\nDa ich dich jetzt nicht sakramental empfangen kann,\nkomm wenigstens geistlich in mein Herz.\nIch umfange dich, als seiest du schon dort, und vereinige mich ganz mit dir.\nLass nicht zu, dass ich mich je von dir trenne. Amen.", en: "My Jesus, I believe that You are truly present in the Most Holy Sacrament. I love You above all things, and I desire to receive You into my soul. Since I cannot now receive You sacramentally, come at least spiritually into my heart. I embrace You as if You were already there, and unite myself wholly to You. Never permit me to be separated from You. Amen." } },
    ],
  },

  {
    slug: "before-communion",
    category: "devotion",
    icon: "favorite_border",
    title: { de: "Gebet vor der Kommunion", en: "Prayer Before Communion" },
    description: { de: "Vorbereitung des Herzens auf den Empfang", en: "Preparing the heart to receive the Eucharist" },
    steps: [
      { text: { de: "Herr Jesus Christus, Sohn des lebendigen Gottes,\ndu hast nach dem Willen des Vaters\nin Einheit mit dem Heiligen Geist durch deinen Tod\nder Welt das Leben geschenkt.\nErlöse mich durch deinen heiligen Leib und dein Blut,\ndas ich nun empfangen darf, von allen meinen Sünden und von jedem Übel.\nHilf mir, dass ich an deinen Geboten festhalte,\nund lass nicht zu, dass ich mich auf ewig von dir trenne. Amen.", en: "Lord Jesus Christ, Son of the living God, who by the will of the Father and the work of the Holy Spirit have through Your death given life to the world: by Your most holy Body and Blood which I now am to receive, free me from all my sins and from every evil. Help me to keep Your commandments, and never let me be separated from You. Amen." } },
    ],
  },

  {
    slug: "after-communion",
    category: "devotion",
    icon: "favorite_border",
    title: { de: "Gebet nach der Kommunion", en: "Prayer After Communion" },
    description: { de: "Danksagung nach Empfang der Eucharistie", en: "Thanksgiving after receiving the Eucharist" },
    steps: [
      { text: { de: "Herr, ich danke dir für die heilige Gemeinschaft mit dir.\nDu bist in mir, und ich bin in dir.\nBleibe bei mir, wenn dieser Tag sich neigt.\nLass dein Licht durch mich leuchten,\ndeinen Frieden durch mich weitergehen,\ndeine Liebe durch mich Frucht bringen.\n\nNimm, Herr, und empfange meine ganze Freiheit,\nmein Gedächtnis, meinen Verstand und meinen ganzen Willen,\nalles, was ich habe und besitze. Du hast es mir gegeben; dir, Herr, gebe ich es zurück. Alles ist dein, verfüge darüber nach deinem Willen. Gib mir nur deine Liebe und deine Gnade, dann bin ich reich genug und ich verlange nichts weiter. Amen. (Hl. Ignatius)", en: "Lord, I thank You for this holy communion. You are in me and I am in You. Stay with me as this day unfolds. Let Your light shine through me, Your peace spread through me, Your love bear fruit in me.\n\nTake, Lord, and receive all my liberty, my memory, my understanding, and my entire will — all that I have and possess. You have given all to me; to You, Lord, I return it. All is Yours, dispose of it wholly according to Your will. Give me only Your love and Your grace; that is enough for me. Amen. (St. Ignatius)" } },
    ],
  },

  // ===== Acts and Penance =====

  {
    slug: "act-contrition",
    category: "devotion",
    icon: "water_drop",
    title: { de: "Akt der Reue", en: "Act of Contrition" },
    description: { de: "Reue und Vorsatz vor der Beichte oder am Lebensende", en: "Contrition and purpose before confession or at life's close" },
    steps: [
      { text: { de: "Mein Gott und Vater,\nich habe gesündigt in Gedanken, Worten und Werken,\ndurch meine Schuld, durch meine Schuld, durch meine große Schuld.\nEs tut mir aufrichtig leid, denn ich habe dich beleidigt,\nder du aller Liebe würdig bist und die Sünde hasst.\nIch will mit deiner Gnade nicht mehr sündigen und die Gelegenheit zur Sünde meiden.\nVerzeih mir durch die Verdienste deines Sohnes Jesus Christus\nund schenke mir ein neues Herz. Amen.", en: "O my God, I am heartily sorry for having offended You, and I detest all my sins because of Your just punishments, but most of all because they offend You, my God, who are all good and deserving of all my love. I firmly resolve, with the help of Your grace, to sin no more and to avoid the near occasions of sin. Amen." } },
    ],
  },

  {
    slug: "act-faith",
    category: "devotion",
    icon: "lightbulb",
    title: { de: "Akt des Glaubens", en: "Act of Faith" },
    description: { de: "Erneuerung des Glaubens", en: "Renewal of faith" },
    steps: [
      { text: { de: "Mein Gott, ich glaube an dich:\nan den Vater, den Sohn und den Heiligen Geist —\nan einen Gott in drei Personen.\nIch glaube, dass dein Sohn Jesus Christus Mensch geworden ist,\nfür uns gestorben, von den Toten auferstanden,\nund am Ende der Zeiten kommen wird, die Lebenden und die Toten zu richten.\nIch glaube alles, was deine heilige Kirche glaubt und lehrt,\nweil du es geoffenbart hast, der du die Wahrheit selbst bist.\nIn diesem Glauben will ich leben und sterben. Amen.", en: "O my God, I firmly believe that You are one God in three divine Persons, Father, Son, and Holy Spirit. I believe that Your Divine Son became man, died for our sins, and that He will come to judge the living and the dead. I believe these and all the truths which the Holy Catholic Church teaches, because You have revealed them, who can neither deceive nor be deceived. Amen." } },
    ],
  },

  {
    slug: "act-hope",
    category: "devotion",
    icon: "wb_twilight",
    title: { de: "Akt der Hoffnung", en: "Act of Hope" },
    description: { de: "Vertrauen auf Gottes Verheißung", en: "Trust in God's promise" },
    steps: [
      { text: { de: "Mein Gott, ich hoffe auf dich mit fester Zuversicht,\ndass du mir durch die Verdienste Jesu Christi\ndas ewige Leben und die dazu nötigen Gnaden schenkst,\nweil du es versprochen hast, der du allmächtig, gütig und treu bist. Amen.", en: "O my God, relying on Your almighty power and infinite mercy and promises, I hope to obtain pardon for my sins, the help of Your grace, and life everlasting, through the merits of Jesus Christ, my Lord and Redeemer. Amen." } },
    ],
  },

  {
    slug: "act-love",
    category: "devotion",
    icon: "favorite",
    title: { de: "Akt der Liebe", en: "Act of Love" },
    description: { de: "Liebe zu Gott und zum Nächsten", en: "Love of God and neighbor" },
    steps: [
      { text: { de: "Mein Gott, ich liebe dich über alles aus ganzem Herzen,\nweil du unendlich gut und aller Liebe würdig bist.\nAus Liebe zu dir liebe ich auch meinen Nächsten wie mich selbst\nund verzeihe allen, die mir Unrecht getan haben. Amen.", en: "O my God, I love You above all things, with my whole heart and soul, because You are all good and worthy of all love. I love my neighbor as myself for the love of You. I forgive all who have injured me and ask pardon of all whom I have injured. Amen." } },
    ],
  },

  {
    slug: "examination-of-conscience",
    category: "devotion",
    icon: "search",
    title: { de: "Gewissenserforschung", en: "Examination of Conscience" },
    description: { de: "Vorbereitung auf die Beichte entlang der Zehn Gebote", en: "Preparation for confession along the Ten Commandments" },
    steps: [
      { title: { de: "Vorbereitung", en: "Preparation" }, text: { de: "Komm, Heiliger Geist, erleuchte meinen Verstand, damit ich meine Sünden erkenne. Rühre mein Herz, damit ich sie aufrichtig bereue. Gib mir den festen Vorsatz, mich zu bessern. Amen.", en: "Come, Holy Spirit, enlighten my mind that I may know my sins, move my heart to true contrition, and give me a firm purpose of amendment. Amen." } },
      { title: { de: "1. Gebot — Du sollst an einen Gott glauben", en: "1st Commandment" }, text: { de: "Habe ich täglich gebetet? Habe ich Gott vertraut auch in Schwierigkeiten? Habe ich die Würde meines Glaubens durch Aberglaube, Esoterik, Horoskope oder okkulte Praktiken verletzt? Habe ich den Glauben aus Menschenfurcht verleugnet?", en: "Did I pray daily? Did I trust God in difficulty? Did I harm the dignity of my faith through superstition, occult practices, horoscopes? Did I deny the faith out of human respect?" } },
      { title: { de: "2. Gebot — Du sollst den Namen Gottes nicht missbrauchen", en: "2nd Commandment" }, text: { de: "Habe ich den Namen Gottes missbraucht, geflucht, falsch geschworen? Habe ich Heiliges verspottet?", en: "Did I misuse God's name, curse, or swear falsely? Did I mock the sacred?" } },
      { title: { de: "3. Gebot — Du sollst den Tag des Herrn heiligen", en: "3rd Commandment" }, text: { de: "Habe ich die Sonntagsmesse bewusst versäumt? Habe ich den Sonntag durch unnötige Arbeit, Konsum oder Zerstreuung entheiligt? Habe ich die Hochfeste geachtet?", en: "Did I deliberately miss Sunday Mass? Did I profane the Lord's Day through unnecessary work, consumption, or distraction? Did I honor the holy days?" } },
      { title: { de: "4. Gebot — Ehre deinen Vater und deine Mutter", en: "4th Commandment" }, text: { de: "Habe ich meine Eltern geachtet, auch im Alter? Habe ich als Elternteil meine Kinder im Glauben erzogen? Habe ich rechtmäßige Autoritäten respektiert? Habe ich meiner Verantwortung gegenüber Ehepartner, Familie, Nachbarn, Arbeitskollegen gerecht gelebt?", en: "Did I honor my parents, also in old age? Did I raise my children in the faith? Did I respect lawful authority? Did I live responsibly toward spouse, family, neighbors, colleagues?" } },
      { title: { de: "5. Gebot — Du sollst nicht töten", en: "5th Commandment" }, text: { de: "Habe ich durch Hass, Groll, Rache, Verachtung gesündigt? Habe ich mir oder anderen im Leib oder in der Seele geschadet? Habe ich an Abtreibung oder Sterbehilfe mitgewirkt? Habe ich Vergebung verweigert?", en: "Did I sin through hatred, resentment, revenge, contempt? Did I harm myself or others in body or soul? Did I cooperate with abortion or euthanasia? Did I refuse to forgive?" } },
      { title: { de: "6. & 9. Gebot — Reinheit", en: "6th & 9th Commandments — Purity" }, text: { de: "Habe ich meine Sexualität geachtet? Habe ich die Würde des Leibes und der Ehe verletzt durch Pornografie, Selbstbefriedigung, unreine Gedanken oder Beziehungen, Ehebruch, Unzucht? Habe ich andere zur Sünde verführt?", en: "Did I honor my sexuality? Did I wound the dignity of the body and of marriage through pornography, masturbation, impure thoughts or relationships, adultery, fornication? Did I lead others to sin?" } },
      { title: { de: "7. & 10. Gebot — Gerechtigkeit", en: "7th & 10th Commandments — Justice" }, text: { de: "Habe ich gestohlen oder Unehrliches getan? Habe ich Schulden und Verpflichtungen erfüllt? Habe ich im Beruf sorgfältig und ehrlich gearbeitet? Habe ich Bedürftige übersehen? Habe ich neidisch oder habgierig gelebt?", en: "Did I steal or act dishonestly? Did I fulfill debts and obligations? Did I work honestly? Did I ignore those in need? Did I live in envy or greed?" } },
      { title: { de: "8. Gebot — Du sollst nicht falsch Zeugnis geben", en: "8th Commandment" }, text: { de: "Habe ich gelogen, andere schlechtgemacht, Geheimnisse verletzt, üble Nachrede geführt? Habe ich den guten Ruf anderer bewahrt? Habe ich mich an der Wahrheit orientiert?", en: "Did I lie, slander, betray trust, gossip? Did I protect the good name of others? Did I live in truth?" } },
      { title: { de: "Abschluss", en: "Conclusion" }, text: { de: "Herr, ich habe erkannt. Verzeih mir, was ich bereue, gib mir Kraft zur Umkehr, führe mich zur Beichte. Amen.", en: "Lord, I have seen. Forgive what I repent of, give me strength to convert, and lead me to confession. Amen." } },
    ],
  },

  // ===== For the Deceased =====

  {
    slug: "requiem-aeternam",
    category: "devotion",
    icon: "candle",
    title: { de: "Ewige Ruhe (Requiem aeternam)", en: "Eternal Rest" },
    description: { de: "Bitte um Frieden für die Verstorbenen", en: "Prayer for peace for the departed" },
    steps: [
      { text: { de: "Herr, gib ihnen die ewige Ruhe,\nund das ewige Licht leuchte ihnen.\nLass sie ruhen in Frieden. Amen.\n\nRequiem aeternam dona eis, Domine,\net lux perpetua luceat eis.\nRequiescant in pace. Amen.", en: "Eternal rest grant unto them, O Lord,\nand let perpetual light shine upon them.\nMay they rest in peace. Amen." } },
    ],
  },

  {
    slug: "de-profundis",
    category: "devotion",
    icon: "waves",
    title: { de: "De Profundis (Psalm 130)", en: "De Profundis (Psalm 130)" },
    description: { de: "Aus der Tiefe rufe ich — Bußpsalm, besonders für Verstorbene", en: "Out of the depths — penitential psalm, especially for the deceased" },
    steps: [
      { text: { de: "Aus der Tiefe rufe ich, Herr, zu dir:\nHerr, höre meine Stimme!\nWende dein Ohr mir zu,\nachte auf mein lautes Flehen!\n\nWürdest du, Herr, unsere Sünden beachten,\nHerr, wer könnte bestehen?\nDoch bei dir ist die Vergebung,\ndamit man in Ehrfurcht dir dient.\n\nIch hoffe auf den Herrn, meine Seele hofft,\nich warte auf sein Wort.\nMeine Seele wartet auf den Herrn,\nmehr als die Wächter auf den Morgen.\n\nMehr als die Wächter auf den Morgen\nsoll Israel harren auf den Herrn.\nDenn beim Herrn ist die Huld,\nbei ihm ist Erlösung in Fülle.\n\nJa, er wird Israel erlösen\naus all seinen Sünden.\n\nEhre sei dem Vater und dem Sohn und dem Heiligen Geist,\nwie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen.", en: "Out of the depths I cry to You, O Lord;\nLord, hear my voice!\nLet Your ears be attentive\nto the voice of my supplications.\n\nIf You, O Lord, should mark iniquities,\nLord, who could stand?\nBut with You is forgiveness,\nthat You may be revered.\n\nI trust in the Lord; my soul trusts in His word.\nMy soul waits for the Lord more than sentinels wait for the dawn.\nMore than sentinels wait for the dawn,\nlet Israel wait for the Lord.\n\nFor with the Lord is kindness and with Him plenteous redemption.\nAnd He will redeem Israel from all their iniquities.\n\nGlory be to the Father... Amen." } },
    ],
  },

  // ===== Modern Popes & Saints =====

  {
    slug: "francis-to-joseph",
    category: "devotion",
    icon: "carpenter",
    title: { de: "Papst Franziskus — Gebet zum hl. Josef", en: "Pope Francis — Prayer to St. Joseph" },
    description: { de: "Aus dem Apostolischen Schreiben Patris corde (2020)", en: "From the Apostolic Letter Patris corde (2020)" },
    steps: [
      { text: { de: "Sei gegrüßt, Hüter des Erlösers,\nBräutigam der Jungfrau Maria.\nDir hat Gott seinen einzigen Sohn anvertraut;\nauf dich hat Maria ihr Vertrauen gesetzt;\nmit dir ist Christus zum Mann herangewachsen.\nO seliger Josef, erweise dich auch uns als Vater\nund geleite uns auf dem Weg des Lebens.\nErwirke uns Gnade, Barmherzigkeit und Mut\nund beschütze uns vor allem Bösen. Amen.", en: "Hail, Guardian of the Redeemer,\nSpouse of the Blessed Virgin Mary.\nTo you God entrusted His only Son;\nin you Mary placed her trust;\nwith you Christ became man.\nBlessed Joseph, to us too show yourself a father\nand guide us in the path of life.\nObtain for us grace, mercy, and courage,\nand defend us from every evil. Amen." } },
    ],
  },

  {
    slug: "benedict-xvi-vocations",
    category: "devotion",
    icon: "church",
    title: { de: "Papst Benedikt XVI. — Gebet um Berufungen", en: "Pope Benedict XVI — Prayer for Vocations" },
    description: { de: "Um geistliche Berufe in der Kirche", en: "For priestly and religious vocations" },
    steps: [
      { text: { de: "Vater, lass aus den Menschen unserer Zeit\nheilige Berufungen für das priesterliche und geweihte Leben hervorgehen,\ndamit der Glaube unter den Völkern lebendig bleibt\nund die Hoffnung nicht schwindet.\nStärke alle, die du berufst,\ndamit sie in Treue und Freude dein Evangelium verkünden\nund die Sakramente als lebensspendende Quelle ausspenden.\nMaria, Königin der Apostel, bitte für uns. Amen.", en: "Father, raise up from among the people of our time holy vocations to the priesthood and consecrated life, that faith may remain alive among the peoples and hope may not fade. Strengthen those You call to proclaim Your Gospel and to dispense the sacraments as life-giving streams. Mary, Queen of the Apostles, pray for us. Amen." } },
    ],
  },

  {
    slug: "mother-teresa-instrument",
    category: "devotion",
    icon: "volunteer_activism",
    title: { de: "Mutter Teresa — Herr, mache mich zum Werkzeug", en: "Mother Teresa — Radiating Christ" },
    description: { de: "Tägliches Gebet der Missionarinnen der Nächstenliebe", en: "Daily prayer of the Missionaries of Charity" },
    steps: [
      { text: { de: "Lieber Jesus, hilf uns, dein Leben überall auszustrahlen,\nwohin wir gehen. Überflute unsere Seele mit deinem Geist und Leben.\nDurchdringe und besitze unser ganzes Sein so vollständig,\ndass unser Leben nur noch ein Abglanz deines Lebens wird.\nLeuchte durch uns und sei so in uns,\ndass jede Seele, mit der wir in Berührung kommen,\ndeine Gegenwart in unserer Seele spürt.\nLass sie aufblicken und nicht mehr uns sehen, sondern nur noch dich, Jesus.\nBleibe bei uns, und wir werden anfangen zu leuchten, wie du leuchtest,\nso zu leuchten, dass wir ein Licht für andere werden. Amen.", en: "Dear Jesus, help us to spread Your fragrance everywhere we go.\nFlood our souls with Your spirit and life.\nPenetrate and possess our whole being so utterly that our lives may only be a radiance of Yours.\nShine through us and be so in us that every soul we come in contact with may feel Your presence in our soul.\nLet them look up and see no longer us but only Jesus.\nStay with us, and then we shall begin to shine as You shine, so to shine as to be a light to others. Amen." } },
    ],
  },

  {
    slug: "padre-pio-stay",
    category: "devotion",
    icon: "nightlight",
    title: { de: "Padre Pio — Bleib bei mir, Herr", en: "Padre Pio — Stay with Me, Lord" },
    description: { de: "Gebet nach der heiligen Kommunion", en: "Prayer after Holy Communion" },
    steps: [
      { text: { de: "Bleib bei mir, Herr, denn ich brauche deine Gegenwart, um dich nicht zu vergessen.\nDu weißt, wie leicht ich dich verlasse.\n\nBleib bei mir, Herr, denn ich bin schwach; ich bedarf deiner Kraft, um nicht zu fallen.\nBleib bei mir, Herr, denn du bist mein Leben: Ohne dich fehlt mir der Eifer.\nBleib bei mir, Herr, denn du bist mein Licht: Ohne dich versinke ich in Finsternis.\nBleib bei mir, Herr, um mir deinen Willen zu zeigen.\nBleib bei mir, Herr, damit ich deine Stimme höre und dir folge.\nBleib bei mir, Herr, denn ich will dich sehr lieben und immer in deiner Gesellschaft sein.\n\nBleib bei mir, Herr, wenn es Abend wird und der Tag sich neigt; das Leben vergeht, die Ewigkeit naht.\nIch muss die Kräfte verdoppeln, damit ich unterwegs nicht nachlasse; dazu brauche ich dich.\nEs wird Abend, und der Tod naht; ich fürchte die Finsternis, die Versuchungen, die Gefahren.\nO wie nötig habe ich dich, mein Jesus, in dieser Nacht der Verbannung.\n\nBleib bei mir, Jesus, denn in dieser Nacht des Lebens und der Gefahren habe ich dich so nötig.\nBleib bei mir, Jesus, Nahrung der starken Seelen. Amen.", en: "Stay with me, Lord, for it is necessary to have You present so that I do not forget You. You know how easily I abandon You.\n\nStay with me, Lord, because I am weak and I need Your strength, that I may not fall so often.\nStay with me, Lord, for You are my life, and without You, I am without fervor.\nStay with me, Lord, for You are my light, and without You, I am in darkness.\nStay with me, Lord, to show me Your will.\nStay with me, Lord, so that I hear Your voice and follow You.\nStay with me, Lord, for I desire to love You very much and always be in Your company.\n\nStay with me, Lord, if You wish me to be faithful to You. Stay with me, Lord, for as poor as my soul is, I want it to be a place of consolation for You, a nest of love.\n\nStay with me, Jesus, for it is getting late and the day is coming to a close, and life passes, death, judgment, eternity approach. It is necessary to renew my strength, so that I will not stop along the way; and for that, I need You.\n\nIt is getting late and death approaches, I fear the darkness, the temptations, the dryness, the cross, the sorrows. O how I need You, my Jesus, in this night of exile. Amen." } },
    ],
  },

  {
    slug: "prayer-for-pope",
    category: "devotion",
    icon: "church",
    title: { de: "Gebet für den Papst", en: "Prayer for the Pope" },
    description: { de: "Tägliche Fürbitte für den Heiligen Vater", en: "Daily intercession for the Holy Father" },
    steps: [
      { text: { de: "Allmächtiger ewiger Gott, erbarme dich deines Knechtes unseres Papstes,\nund leite ihn nach deiner Güte auf dem Weg des ewigen Heils,\ndamit er, durch deine Gnade geführt,\ndas suche, was dir wohlgefällig ist,\nund es mit ganzer Kraft vollbringe.\nDurch Christus, unseren Herrn. Amen.\n\nV: Lasst uns beten für unseren Papst.\nR: Der Herr erhalte ihn und belebe ihn, mache ihn glücklich auf Erden und gebe ihn nicht preis dem Willen seiner Feinde.", en: "Almighty and everlasting God, have mercy upon Your servant, our Pope, and direct him according to Your clemency into the way of everlasting salvation, that, by Your grace, he may desire the things that are pleasing to You, and perform them with all his strength. Through Christ our Lord. Amen.\n\nV: Let us pray for our Pope.\nR: May the Lord preserve him and give him life, make him blessed upon the earth, and deliver him not up to the will of his enemies." } },
    ],
  },

  // ===== Hymns =====

  {
    slug: "te-deum",
    category: "devotion",
    icon: "celebration",
    title: { de: "Te Deum — Großer Gott, wir loben dich", en: "Te Deum" },
    description: { de: "Feierlicher Lobgesang der Kirche", en: "Solemn hymn of praise" },
    steps: [
      { text: { de: "Dich, Gott, loben wir, dich, Herr, preisen wir.\nDir, dem ewigen Vater, huldigt das Erdenreich.\nDir rufen die Engel alle, dir Himmel und Mächte insgesamt,\ndie Cherubim dir und die Serafim mit niemals endender Stimme zu:\n\nHeilig, heilig, heilig der Herr, der Gott der Scharen!\nVoll sind Himmel und Erde von deiner hohen Herrlichkeit.\n\nDich preist der glorreiche Chor der Apostel;\ndich der Propheten lobwürdige Zahl;\ndich der Märtyrer leuchtendes Heer;\ndich preist über das Erdenrund die heilige Kirche;\ndich, den Vater unermessbarer Majestät;\ndeinen wahren und einzigen Sohn;\nund den Heiligen Fürsprecher Geist.\n\nDu König der Herrlichkeit, Christus.\nDu bist des Vaters allewiger Sohn.\nDu hast der Jungfrau Schoß nicht verschmäht,\nbist Mensch geworden, den Menschen zu befreien.\nDu hast bezwungen des Todes Stachel\nund denen, die glauben, die Reiche der Himmel aufgetan.\nDu sitzest zur Rechten Gottes in deines Vaters Herrlichkeit.\nAls Richter, so glauben wir, kehrst du einst wieder.\n\nDich bitten wir denn, komm deinen Dienern zu Hilfe,\ndie du erlöst mit kostbarem Blut.\nIn der ewigen Herrlichkeit zähle uns deinen Heiligen zu. Amen.", en: "You are God: we praise You; You are the Lord: we acclaim You. You are the eternal Father: all creation worships You. To You all angels, all the powers of heaven, the cherubim and seraphim, sing in endless praise:\n\nHoly, holy, holy Lord, God of power and might, heaven and earth are full of Your glory.\n\nThe glorious company of apostles praise You. The noble fellowship of prophets praise You. The white-robed army of martyrs praise You. Throughout the world the holy Church acclaims You: Father, of majesty unbounded; Your true and only Son, worthy of all worship; and the Holy Spirit, advocate and guide.\n\nYou, Christ, are the king of glory, the eternal Son of the Father. When You became man to set us free You did not spurn the Virgin's womb. You overcame the sting of death and opened the kingdom of heaven to all believers. You are seated at God's right hand in glory. We believe that You will come to be our judge.\n\nCome then, Lord, and help Your people, bought with the price of Your own blood, and bring us with Your saints to glory everlasting. Amen." } },
    ],
  },

  {
    slug: "veni-sancte-spiritus",
    category: "devotion",
    icon: "local_fire_department",
    title: { de: "Veni Sancte Spiritus — Komm, Heiliger Geist", en: "Veni Sancte Spiritus" },
    description: { de: "Pfingstsequenz", en: "Pentecost sequence" },
    steps: [
      { text: { de: "Komm herab, o Heilger Geist, der die finstre Nacht zerreißt,\nstrahle Licht in diese Welt.\nKomm, der alle Armen liebt, komm, der gute Gaben gibt,\nkomm, der jedes Herz erhellt.\n\nHöchster Tröster in der Zeit, Gast, der Herz und Sinn erfreut,\nköstlich Labsal in der Not.\nIn der Unrast schenkst du Ruh, hauchst in Hitze Kühlung zu,\nspendest Trost in Leid und Tod.\n\nKomm, o du glückselig Licht, fülle Herz und Angesicht,\ndring bis auf der Seele Grund.\nOhne dein lebendig Wehn kann im Menschen nichts bestehn,\nkann nichts heil sein noch gesund.\n\nWas befleckt ist, wasche rein, Dürrem gieße Leben ein,\nheile du, wo Krankheit quält.\nWärme du, was kalt und hart, löse, was in sich erstarrt,\nlenke, was den Weg verfehlt.\n\nGib dem Volk, das dir vertraut, das auf deine Hilfe baut,\ndeine Gaben zum Geleit.\nLass es in der Zeit bestehn, deines Heils Vollendung sehn\nund der Freuden Ewigkeit. Amen.", en: "Come, Holy Spirit, come! And from Your celestial home shed a ray of light divine! Come, Father of the poor! Come, source of all our store! Come, within our bosoms shine.\n\nYou, of comforters the best; You, the soul's most welcome guest; sweet refreshment here below; in our labor, rest most sweet; grateful coolness in the heat; solace in the midst of woe.\n\nO most blessed Light divine, shine within these hearts of Yours, and our inmost being fill! Where You are not, we have naught, nothing good in deed or thought, nothing free from taint of ill.\n\nHeal our wounds, our strength renew; on our dryness pour Your dew; wash the stains of guilt away: bend the stubborn heart and will; melt the frozen, warm the chill; guide the steps that go astray.\n\nOn the faithful, who adore and confess You, evermore in Your sevenfold gift descend; give them virtue's sure reward; give them Your salvation, Lord; give them joys that never end. Amen." } },
    ],
  },

  {
    slug: "stabat-mater",
    category: "devotion",
    icon: "water_drop",
    title: { de: "Stabat Mater", en: "Stabat Mater" },
    description: { de: "Gebet der Mutter unter dem Kreuz — Karwoche", en: "The Mother at the foot of the Cross — Holy Week" },
    steps: [
      { text: { de: "Christi Mutter stand mit Schmerzen\nbei dem Kreuz und weint von Herzen,\nals ihr lieber Sohn da hing.\nDurch die Seele voller Trauer,\nschneidend unter Todesschauer,\njetzt das Schwert des Leidens ging.\n\nWelch ein Schmerz der Auserkor'nen,\nda sie sah den Eingebor'nen,\nwie er mit dem Tode rang.\nAngst und Jammer, Qual und Bangen,\nalles Leid hielt sie umfangen,\ndas nur je ein Herz durchdrang.\n\nGib, o Mutter, Born der Liebe,\ndass ich mich mit dir betrübe,\ndass ich fühl die Schmerzen dein.\nDass mein Herz von Lieb entbrenne,\ndass ich nur noch Jesus kenne,\ndass ich liebe Gott allein.\n\nWenn mein Leib nun stirbt und endet,\ndann, o Mutter, lass gesendet\nmeiner Seel die Himmelskron. Amen.", en: "At the cross her station keeping, stood the mournful Mother weeping, close to Jesus to the last.\nThrough her heart, His sorrow sharing, all His bitter anguish bearing, now at length the sword had passed.\n\nO how sad and sore distressed, was that Mother highly blessed, of the sole-begotten One!\nChrist above in torment hangs; she beneath beholds the pangs of her dying glorious Son.\n\nO sweet Mother! fount of love, touch my spirit from above, make my heart with yours accord.\nMake me feel as you have felt; make my soul to glow and melt with the love of Christ our Lord.\n\nWhen the body dies, O grant that the soul Your glory shall see, paradise with You. Amen." } },
    ],
  },

  // ===== St. Francis of Assisi =====

  {
    slug: "canticle-of-sun",
    category: "devotion",
    icon: "wb_sunny",
    title: { de: "Sonnengesang — Franz von Assisi", en: "Canticle of the Sun — Francis of Assisi" },
    description: { de: "Lobpreis der Schöpfung", en: "Praise of creation" },
    steps: [
      { text: { de: "Höchster, allmächtiger, guter Herr, dein ist das Lob, die Herrlichkeit und Ehre und jeglicher Segen.\nDir allein, Höchster, gebühren sie, und kein Mensch ist würdig, dich zu nennen.\n\nGelobt seist du, mein Herr, mit allen deinen Geschöpfen,\nzumal dem Herrn Bruder Sonne,\nder uns den Tag schenkt, und durch den du uns leuchtest.\nUnd schön ist er und strahlend mit großem Glanz: Von dir, Höchster, ist er ein Sinnbild.\n\nGelobt seist du, mein Herr, durch Schwester Mond und die Sterne; am Himmel hast du sie gebildet, klar und kostbar und schön.\nGelobt seist du, mein Herr, durch Bruder Wind und durch die Luft, Wolken, heiteres und jegliches Wetter, durch das du deinen Geschöpfen Unterhalt gibst.\nGelobt seist du, mein Herr, durch Schwester Wasser, gar nützlich ist sie und demütig und kostbar und keusch.\nGelobt seist du, mein Herr, durch Bruder Feuer, durch das du die Nacht erleuchtest;\nund schön ist es und fröhlich und kraftvoll und stark.\nGelobt seist du, mein Herr, durch unsere Schwester, Mutter Erde, die uns erhält und lenkt und vielfältige Frucht hervorbringt und bunte Blumen und Kräuter.\n\nGelobt seist du, mein Herr, durch jene, die verzeihen um deiner Liebe willen\nund Krankheit und Trübsal ertragen.\nSelig jene, die solches ertragen in Frieden, denn von dir, Höchster, werden sie gekrönt.\nGelobt seist du, mein Herr, durch unsere Schwester, den leiblichen Tod,\ndem kein lebender Mensch entrinnen kann.\n\nLobt und preist meinen Herrn und dankt und dient ihm mit großer Demut. Amen.", en: "Most High, all-powerful, all good Lord, all praise is Yours, all glory, all honor and all blessing. To You alone, Most High, do they belong, and no human is worthy to mention Your name.\n\nPraised be You, my Lord, with all Your creatures, especially Sir Brother Sun, who brings the day, and through whom You give us light. How beautiful he is, radiant with great splendor; of You, Most High, he bears the likeness.\n\nPraised be You, my Lord, through Sister Moon and the stars; in the heavens You have made them, precious and beautiful.\nPraised be You, my Lord, through Brother Wind, and through the air, cloudy and serene, and every kind of weather, by which You give sustenance to Your creatures.\nPraised be You, my Lord, through Sister Water, so useful, humble, precious, and chaste.\nPraised be You, my Lord, through Brother Fire, through whom You light the night; he is beautiful and playful and robust and strong.\nPraised be You, my Lord, through our Sister Mother Earth, who sustains and governs us, and who produces varied fruits with colored flowers and herbs.\n\nPraised be You, my Lord, through those who give pardon for Your love, and bear infirmity and tribulation. Blessed are those who endure in peace, for by You, Most High, they shall be crowned.\n\nPraised be You, my Lord, through our Sister Bodily Death, from whom no one living can escape.\n\nPraise and bless my Lord, and give Him thanks, and serve Him with great humility. Amen." } },
    ],
  },

  {
    slug: "peace-prayer",
    category: "devotion",
    icon: "spa",
    title: { de: "Friedensgebet — Franz von Assisi", en: "Peace Prayer of St. Francis" },
    description: { de: "Werkzeug des Friedens Gottes sein", en: "Becoming an instrument of God's peace" },
    steps: [
      { text: { de: "Herr, mach mich zu einem Werkzeug deines Friedens,\ndass ich Liebe bringe, wo man hasst,\ndass ich verzeihe, wo man beleidigt,\ndass ich verbinde, wo Streit ist,\ndass ich die Wahrheit sage, wo Irrtum ist,\ndass ich Glauben bringe, wo Zweifel droht,\ndass ich Hoffnung wecke, wo Verzweiflung quält,\ndass ich Licht entzünde, wo Finsternis regiert,\ndass ich Freude bringe, wo der Kummer wohnt.\n\nHerr, lass mich trachten,\nnicht dass ich getröstet werde, sondern dass ich tröste,\nnicht dass ich verstanden werde, sondern dass ich verstehe,\nnicht dass ich geliebt werde, sondern dass ich liebe.\n\nDenn wer gibt, der empfängt.\nWer sich selbst vergisst, der findet.\nWer verzeiht, dem wird verziehen.\nUnd wer stirbt, der erwacht zum ewigen Leben. Amen.", en: "Lord, make me an instrument of Your peace;\nwhere there is hatred, let me sow love;\nwhere there is injury, pardon;\nwhere there is doubt, faith;\nwhere there is despair, hope;\nwhere there is darkness, light;\nand where there is sadness, joy.\n\nO Divine Master, grant that I may not so much seek\nto be consoled, as to console;\nto be understood, as to understand;\nto be loved, as to love.\n\nFor it is in giving that we receive;\nit is in pardoning that we are pardoned;\nand it is in dying that we are born to eternal life. Amen." } },
    ],
  },
];
