export interface PrayerEntry {
  slug: string;
  category: "litany" | "hour" | "novena";
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
];
