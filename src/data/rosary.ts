export type MysteryType = "joyful" | "luminous" | "sorrowful" | "glorious" | "mercy" | "joseph";

export interface Mystery {
  title: { de: string; en: string };
  insertion: { de: string; en: string };
  subtitle: { de: string; en: string };
  scripture: { de: string; en: string };
  fruit: { de: string; en: string };
}

export interface MysterySet {
  type: MysteryType;
  name: { de: string; en: string };
  icon: string;
  mysteries: Mystery[];
  day: string[];
}

export const MYSTERY_SETS: MysterySet[] = [
  {
    type: "joyful",
    name: { de: "Freudenreicher Rosenkranz", en: "Joyful Mysteries" },
    icon: "sentiment_very_satisfied",
    day: ["monday", "saturday"],
    mysteries: [
      {
        title: { de: "Die Verkündigung des Herrn", en: "The Annunciation" },
        insertion: { de: "Jesus, den du, o Jungfrau, vom Heiligen Geist empfangen hast", en: "Jesus, whom you, O Virgin, conceived by the Holy Spirit" },
        subtitle: { de: "Der Engel Gabriel wird zu Maria gesandt", en: "The Angel Gabriel is sent to Mary" },
        scripture: { de: "Lk 1,26-38", en: "Luke 1:26-38" },
        fruit: { de: "Demut", en: "Humility" },
      },
      {
        title: { de: "Der Besuch Marias bei Elisabeth", en: "The Visitation" },
        insertion: { de: "Jesus, den du, o Jungfrau, zu Elisabeth getragen hast", en: "Jesus, whom you, O Virgin, carried to Elizabeth" },
        subtitle: { de: "Maria besucht ihre Cousine Elisabeth", en: "Mary visits her cousin Elizabeth" },
        scripture: { de: "Lk 1,39-56", en: "Luke 1:39-56" },
        fruit: { de: "Nächstenliebe", en: "Charity" },
      },
      {
        title: { de: "Die Geburt Jesu", en: "The Nativity" },
        insertion: { de: "Jesus, den du, o Jungfrau, in Bethlehem geboren hast", en: "Jesus, whom you, O Virgin, gave birth to in Bethlehem" },
        subtitle: { de: "Jesus wird in Bethlehem geboren", en: "Jesus is born in Bethlehem" },
        scripture: { de: "Lk 2,1-20", en: "Luke 2:1-20" },
        fruit: { de: "Armut im Geiste", en: "Poverty of Spirit" },
      },
      {
        title: { de: "Die Darstellung Jesu im Tempel", en: "The Presentation" },
        insertion: { de: "Jesus, den du, o Jungfrau, im Tempel aufgeopfert hast", en: "Jesus, whom you, O Virgin, presented in the Temple" },
        subtitle: { de: "Jesus wird im Tempel dargestellt", en: "Jesus is presented in the Temple" },
        scripture: { de: "Lk 2,22-40", en: "Luke 2:22-40" },
        fruit: { de: "Gehorsam", en: "Obedience" },
      },
      {
        title: { de: "Die Auffindung Jesu im Tempel", en: "Finding Jesus in the Temple" },
        insertion: { de: "Jesus, den du, o Jungfrau, im Tempel wiedergefunden hast", en: "Jesus, whom you, O Virgin, found again in the Temple" },
        subtitle: { de: "Der zwölfjährige Jesus im Tempel", en: "The twelve-year-old Jesus in the Temple" },
        scripture: { de: "Lk 2,41-52", en: "Luke 2:41-52" },
        fruit: { de: "Freude an Gott", en: "Joy in Finding Jesus" },
      },
    ],
  },
  {
    type: "luminous",
    name: { de: "Lichtreicher Rosenkranz", en: "Luminous Mysteries" },
    icon: "light_mode",
    day: ["thursday"],
    mysteries: [
      {
        title: { de: "Die Taufe Jesu im Jordan", en: "The Baptism of Jesus" },
        insertion: { de: "Jesus, der von Johannes im Jordan getauft worden ist", en: "Jesus, who was baptized by John in the Jordan" },
        subtitle: { de: "Jesus wird von Johannes getauft", en: "Jesus is baptized by John" },
        scripture: { de: "Mt 3,13-17", en: "Matthew 3:13-17" },
        fruit: { de: "Offenheit für den Heiligen Geist", en: "Openness to the Holy Spirit" },
      },
      {
        title: { de: "Die Hochzeit zu Kana", en: "The Wedding at Cana" },
        insertion: { de: "Jesus, der sich bei der Hochzeit in Kana offenbart hat", en: "Jesus, who revealed himself at the wedding in Cana" },
        subtitle: { de: "Jesus verwandelt Wasser in Wein", en: "Jesus changes water into wine" },
        scripture: { de: "Joh 2,1-12", en: "John 2:1-12" },
        fruit: { de: "Vertrauen auf Marias Fürsprache", en: "Trust in Mary's intercession" },
      },
      {
        title: { de: "Die Verkündigung des Reiches Gottes", en: "The Proclamation of the Kingdom" },
        insertion: { de: "Jesus, der uns das Reich Gottes verkündet und zur Umkehr gerufen hat", en: "Jesus, who proclaimed the Kingdom of God and called us to conversion" },
        subtitle: { de: "Jesus verkündet das Reich Gottes", en: "Jesus proclaims the Kingdom of God" },
        scripture: { de: "Mk 1,14-15", en: "Mark 1:14-15" },
        fruit: { de: "Umkehr", en: "Conversion" },
      },
      {
        title: { de: "Die Verklärung Jesu", en: "The Transfiguration" },
        insertion: { de: "Jesus, der auf dem Berg verklärt worden ist", en: "Jesus, who was transfigured on the mountain" },
        subtitle: { de: "Jesus wird auf dem Berg verklärt", en: "Jesus is transfigured on the mountain" },
        scripture: { de: "Mt 17,1-8", en: "Matthew 17:1-8" },
        fruit: { de: "Sehnsucht nach Heiligkeit", en: "Desire for Holiness" },
      },
      {
        title: { de: "Die Einsetzung der Eucharistie", en: "The Institution of the Eucharist" },
        insertion: { de: "Jesus, der uns die Eucharistie geschenkt hat", en: "Jesus, who gave us the Eucharist" },
        subtitle: { de: "Jesus setzt die Eucharistie ein", en: "Jesus institutes the Eucharist" },
        scripture: { de: "Mt 26,26-28", en: "Matthew 26:26-28" },
        fruit: { de: "Eucharistische Anbetung", en: "Eucharistic Adoration" },
      },
    ],
  },
  {
    type: "sorrowful",
    name: { de: "Schmerzhafter Rosenkranz", en: "Sorrowful Mysteries" },
    icon: "water_drop",
    day: ["tuesday", "friday"],
    mysteries: [
      {
        title: { de: "Das Gebet am Ölberg", en: "The Agony in the Garden" },
        insertion: { de: "Jesus, der für uns Blut geschwitzt hat", en: "Jesus, who sweat blood for us" },
        subtitle: { de: "Jesus betet im Garten Getsemani", en: "Jesus prays in the Garden of Gethsemane" },
        scripture: { de: "Mt 26,36-46", en: "Matthew 26:36-46" },
        fruit: { de: "Reue über die Sünden", en: "Contrition for our sins" },
      },
      {
        title: { de: "Die Geißelung Jesu", en: "The Scourging at the Pillar" },
        insertion: { de: "Jesus, der für uns gegeißelt worden ist", en: "Jesus, who was scourged for us" },
        subtitle: { de: "Jesus wird gegeißelt", en: "Jesus is scourged at the pillar" },
        scripture: { de: "Joh 19,1", en: "John 19:1" },
        fruit: { de: "Abtötung der Sinne", en: "Mortification" },
      },
      {
        title: { de: "Die Dornenkrönung", en: "The Crowning with Thorns" },
        insertion: { de: "Jesus, der für uns mit Dornen gekrönt worden ist", en: "Jesus, who was crowned with thorns for us" },
        subtitle: { de: "Jesus wird mit Dornen gekrönt", en: "Jesus is crowned with thorns" },
        scripture: { de: "Mt 27,27-31", en: "Matthew 27:27-31" },
        fruit: { de: "Mut", en: "Courage" },
      },
      {
        title: { de: "Die Kreuztragung", en: "The Carrying of the Cross" },
        insertion: { de: "Jesus, der für uns das schwere Kreuz getragen hat", en: "Jesus, who carried the heavy cross for us" },
        subtitle: { de: "Jesus trägt sein Kreuz", en: "Jesus carries his cross" },
        scripture: { de: "Joh 19,17", en: "John 19:17" },
        fruit: { de: "Geduld", en: "Patience" },
      },
      {
        title: { de: "Die Kreuzigung und der Tod Jesu", en: "The Crucifixion" },
        insertion: { de: "Jesus, der für uns gekreuzigt worden ist", en: "Jesus, who was crucified for us" },
        subtitle: { de: "Jesus stirbt am Kreuz", en: "Jesus dies on the cross" },
        scripture: { de: "Joh 19,18-30", en: "John 19:18-30" },
        fruit: { de: "Selbstverleugnung", en: "Self-denial" },
      },
    ],
  },
  {
    type: "glorious",
    name: { de: "Glorreicher Rosenkranz", en: "Glorious Mysteries" },
    icon: "auto_awesome",
    day: ["wednesday", "sunday"],
    mysteries: [
      {
        title: { de: "Die Auferstehung Jesu", en: "The Resurrection" },
        insertion: { de: "Jesus, der von den Toten auferstanden ist", en: "Jesus, who rose from the dead" },
        subtitle: { de: "Jesus ersteht von den Toten", en: "Jesus rises from the dead" },
        scripture: { de: "Mt 28,1-10", en: "Matthew 28:1-10" },
        fruit: { de: "Glaube", en: "Faith" },
      },
      {
        title: { de: "Die Himmelfahrt Jesu", en: "The Ascension" },
        insertion: { de: "Jesus, der in den Himmel aufgefahren ist", en: "Jesus, who ascended into heaven" },
        subtitle: { de: "Jesus fährt in den Himmel auf", en: "Jesus ascends into heaven" },
        scripture: { de: "Apg 1,9-11", en: "Acts 1:9-11" },
        fruit: { de: "Hoffnung", en: "Hope" },
      },
      {
        title: { de: "Die Sendung des Heiligen Geistes", en: "The Descent of the Holy Spirit" },
        insertion: { de: "Jesus, der uns den Heiligen Geist gesandt hat", en: "Jesus, who sent us the Holy Spirit" },
        subtitle: { de: "Der Heilige Geist kommt herab", en: "The Holy Spirit descends upon the Apostles" },
        scripture: { de: "Apg 2,1-13", en: "Acts 2:1-13" },
        fruit: { de: "Liebe zu Gott", en: "Love of God" },
      },
      {
        title: { de: "Die Aufnahme Mariens in den Himmel", en: "The Assumption" },
        insertion: { de: "Jesus, der dich, o Jungfrau, in den Himmel aufgenommen hat", en: "Jesus, who took you, O Virgin, up into heaven" },
        subtitle: { de: "Maria wird in den Himmel aufgenommen", en: "Mary is taken up into heaven" },
        scripture: { de: "Offb 12,1", en: "Revelation 12:1" },
        fruit: { de: "Gnade eines guten Todes", en: "Grace of a Happy Death" },
      },
      {
        title: { de: "Die Krönung Mariens im Himmel", en: "The Coronation of Mary" },
        insertion: { de: "Jesus, der dich, o Jungfrau, im Himmel gekrönt hat", en: "Jesus, who crowned you, O Virgin, in heaven" },
        subtitle: { de: "Maria wird zur Königin des Himmels gekrönt", en: "Mary is crowned Queen of Heaven" },
        scripture: { de: "Offb 12,1", en: "Revelation 12:1" },
        fruit: { de: "Vertrauen auf Marias Fürsprache", en: "Trust in Mary's intercession" },
      },
    ],
  },
  {
    type: "mercy",
    name: { de: "Barmherzigkeitsrosenkranz", en: "Chaplet of Divine Mercy" },
    icon: "cardiology",
    day: [],
    mysteries: [
      {
        title: { de: "Erstes Gesätz", en: "First Decade" },
        insertion: { de: "Um Seines schmerzhaften Leidens willen", en: "For the sake of His sorrowful Passion" },
        subtitle: { de: "Für alle Sünder der ganzen Welt", en: "For all sinners in the whole world" },
        scripture: { de: "Joh 3,16", en: "John 3:16" },
        fruit: { de: "Vertrauen auf Gottes Barmherzigkeit", en: "Trust in God's Mercy" },
      },
      {
        title: { de: "Zweites Gesätz", en: "Second Decade" },
        insertion: { de: "Um Seines schmerzhaften Leidens willen", en: "For the sake of His sorrowful Passion" },
        subtitle: { de: "Für die Priester und Ordensleute", en: "For priests and religious" },
        scripture: { de: "Mt 9,38", en: "Matthew 9:38" },
        fruit: { de: "Heiligung der Priester", en: "Sanctification of priests" },
      },
      {
        title: { de: "Drittes Gesätz", en: "Third Decade" },
        insertion: { de: "Um Seines schmerzhaften Leidens willen", en: "For the sake of His sorrowful Passion" },
        subtitle: { de: "Für alle frommen und treuen Seelen", en: "For all devout and faithful souls" },
        scripture: { de: "Ps 103,8", en: "Psalm 103:8" },
        fruit: { de: "Treue im Glauben", en: "Faithfulness" },
      },
      {
        title: { de: "Viertes Gesätz", en: "Fourth Decade" },
        insertion: { de: "Um Seines schmerzhaften Leidens willen", en: "For the sake of His sorrowful Passion" },
        subtitle: { de: "Für jene, die Gott noch nicht kennen", en: "For those who do not yet know God" },
        scripture: { de: "1 Tim 2,4", en: "1 Timothy 2:4" },
        fruit: { de: "Bekehrung der Ungläubigen", en: "Conversion of unbelievers" },
      },
      {
        title: { de: "Fünftes Gesätz", en: "Fifth Decade" },
        insertion: { de: "Um Seines schmerzhaften Leidens willen", en: "For the sake of His sorrowful Passion" },
        subtitle: { de: "Für die Seelen im Fegfeuer", en: "For the souls in purgatory" },
        scripture: { de: "2 Makk 12,46", en: "2 Maccabees 12:46" },
        fruit: { de: "Erlösung der Armen Seelen", en: "Release of the Poor Souls" },
      },
    ],
  },
  {
    type: "joseph",
    name: { de: "Josephsrosenkranz", en: "Rosary of St. Joseph" },
    icon: "carpenter",
    day: [],
    mysteries: [
      {
        title: { de: "Die Erwählung Josefs", en: "The Choosing of Joseph" },
        insertion: { de: "Jesus, der den heiligen Josef zu deinem Bräutigam erwählt hat", en: "Jesus, who chose St. Joseph as your spouse" },
        subtitle: { de: "Josef wird zum Bräutigam Mariens erwählt", en: "Joseph is chosen as the spouse of Mary" },
        scripture: { de: "Mt 1,18-19", en: "Matthew 1:18-19" },
        fruit: { de: "Reinheit des Herzens", en: "Purity of heart" },
      },
      {
        title: { de: "Josef als Nährvater", en: "Joseph as Foster Father" },
        insertion: { de: "Jesus, der den heiligen Josef als seinen Nährvater geliebt hat", en: "Jesus, who loved St. Joseph as his foster father" },
        subtitle: { de: "Josef als Nährvater des Jesuskindes", en: "Joseph as foster father of the Child Jesus" },
        scripture: { de: "Lk 2,4-7", en: "Luke 2:4-7" },
        fruit: { de: "Väterliche Liebe", en: "Fatherly love" },
      },
      {
        title: { de: "Josefs Gehorsam", en: "Joseph's Obedience" },
        insertion: { de: "Jesus, der dem heiligen Josef gehorsam gewesen ist", en: "Jesus, who was obedient to St. Joseph" },
        subtitle: { de: "Jesus war Josef und Maria untertan", en: "Jesus was subject to Joseph and Mary" },
        scripture: { de: "Lk 2,51", en: "Luke 2:51" },
        fruit: { de: "Gehorsam", en: "Obedience" },
      },
      {
        title: { de: "Gebet und Arbeit", en: "Prayer and Work" },
        insertion: { de: "Jesus, der mit dem heiligen Josef gebetet und gearbeitet hat", en: "Jesus, who prayed and worked with St. Joseph" },
        subtitle: { de: "Das gemeinsame Leben in Nazaret", en: "Life together in Nazareth" },
        scripture: { de: "Mt 13,55", en: "Matthew 13:55" },
        fruit: { de: "Treue in der Arbeit", en: "Faithfulness in work" },
      },
      {
        title: { de: "Schutzpatron der Kirche", en: "Patron of the Church" },
        insertion: { de: "Jesus, der den heiligen Josef zum Schutzpatron seiner heiligen Kirche erwählt hat", en: "Jesus, who chose St. Joseph as patron of the Holy Church" },
        subtitle: { de: "Josef als Beschützer der Kirche", en: "Joseph as protector of the Church" },
        scripture: { de: "Mt 2,13-15", en: "Matthew 2:13-15" },
        fruit: { de: "Vertrauen auf Gottes Führung", en: "Trust in God's guidance" },
      },
    ],
  },
];

export const PRAYERS = {
  ourFather: {
    de: "Vater unser im Himmel, geheiligt werde dein Name. Dein Reich komme. Dein Wille geschehe, wie im Himmel so auf Erden. Unser tägliches Brot gib uns heute. Und vergib uns unsere Schuld, wie auch wir vergeben unsern Schuldigern. Und führe uns nicht in Versuchung, sondern erlöse uns von dem Bösen. Amen.",
    en: "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  hailMary: {
    de: "Gegrüßet seist du, Maria, voll der Gnade, der Herr ist mit dir. Du bist gebenedeit unter den Frauen, und gebenedeit ist die Frucht deines Leibes, Jesus. Heilige Maria, Mutter Gottes, bitte für uns Sünder, jetzt und in der Stunde unseres Todes. Amen.",
    en: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  },
  gloryBe: {
    de: "Ehre sei dem Vater und dem Sohn und dem Heiligen Geist, wie im Anfang, so auch jetzt und alle Zeit und in Ewigkeit. Amen.",
    en: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
  },
  signOfCross: {
    de: "Im Namen des Vaters und des Sohnes und des Heiligen Geistes. Amen.",
    en: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  },
  apostlesCreed: {
    de: "Ich glaube an Gott, den Vater, den Allmächtigen, den Schöpfer des Himmels und der Erde, und an Jesus Christus, seinen eingeborenen Sohn, unsern Herrn, empfangen durch den Heiligen Geist, geboren von der Jungfrau Maria, gelitten unter Pontius Pilatus, gekreuzigt, gestorben und begraben, hinabgestiegen in das Reich des Todes, am dritten Tage auferstanden von den Toten, aufgefahren in den Himmel; er sitzt zur Rechten Gottes, des allmächtigen Vaters; von dort wird er kommen, zu richten die Lebenden und die Toten. Ich glaube an den Heiligen Geist, die heilige katholische Kirche, Gemeinschaft der Heiligen, Vergebung der Sünden, Auferstehung der Toten und das ewige Leben. Amen.",
    en: "I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the Holy Catholic Church, the communion of Saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  },
  hailHolyQueen: {
    de: "Sei gegrüßt, o Königin, Mutter der Barmherzigkeit; unser Leben, unsre Wonne und unsre Hoffnung, sei gegrüßt! Zu dir rufen wir verbannte Kinder Evas; zu dir seufzen wir trauernd und weinend in diesem Tal der Tränen. Wohlan denn, unsre Fürsprecherin, wende deine barmherzigen Augen uns zu, und nach diesem Elend zeige uns Jesus, die gebenedeite Frucht deines Leibes. O gütige, o milde, o süße Jungfrau Maria!",
    en: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope! To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn, then, most gracious Advocate, thine eyes of mercy toward us, and after this, our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary!",
  },
  fatimaPrayer: {
    de: "O mein Jesus, verzeih uns unsere Sünden, bewahre uns vor dem Feuer der Hölle, führe alle Seelen in den Himmel, besonders jene, die deiner Barmherzigkeit am meisten bedürfen.",
    en: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those most in need of Thy mercy.",
  },
  // Divine Mercy prayers
  eternalFather: {
    de: "Ewiger Vater, ich opfere Dir auf den Leib und das Blut, die Seele und die Gottheit Deines über alles geliebten Sohnes, unseres Herrn Jesus Christus, zur Sühne für unsere Sünden und die Sünden der ganzen Welt.",
    en: "Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your dearly beloved Son, Our Lord Jesus Christ, in atonement for our sins and those of the whole world.",
  },
  divineMercy: {
    de: "Um Seines schmerzhaften Leidens willen, hab Erbarmen mit uns und mit der ganzen Welt.",
    en: "For the sake of His sorrowful Passion, have mercy on us and on the whole world.",
  },
  // St. Joseph prayers
  josephPrayer: {
    de: "Heiliger Josef, du treuer Hüter Jesu und keuscher Bräutigam Mariens, bitte für uns und für die Sterbenden dieses Tages (dieser Nacht). Amen.",
    en: "Saint Joseph, faithful guardian of Jesus and chaste spouse of Mary, pray for us and for the dying of this day (this night). Amen.",
  },
} as const;

export const OPENING_INTENTIONS: { de: string; en: string }[] = [
  { de: "um Vermehrung des Glaubens", en: "for the increase of Faith" },
  { de: "um Vermehrung der Hoffnung", en: "for the increase of Hope" },
  { de: "um Vermehrung der Liebe", en: "for the increase of Love" },
];

export function getTodaysMysteryType(): MysteryType {
  const days: MysteryType[] = [
    "glorious",   // Sunday
    "joyful",     // Monday
    "sorrowful",  // Tuesday
    "glorious",   // Wednesday
    "luminous",   // Thursday
    "sorrowful",  // Friday
    "joyful",     // Saturday
  ];
  return days[new Date().getDay()];
}
