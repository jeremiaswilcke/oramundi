// Latin texts for core prayers and mystery insertions.
// Used as overlay on top of de/en — selected via the prayer language picker.

export const PRAYERS_LATIN = {
  signOfCross:
    "In nomine Patris, et Filii, et Spiritus Sancti. Amen.",
  ourFather:
    "Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie. Et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.",
  hailMary:
    "Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.",
  gloryBe:
    "Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen.",
  apostlesCreed:
    "Credo in Deum, Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.",
  hailHolyQueen:
    "Salve, Regina, Mater misericordiae, vita, dulcedo, et spes nostra, salve. Ad te clamamus, exsules filii Hevae. Ad te suspiramus, gementes et flentes in hac lacrimarum valle. Eia ergo, Advocata nostra, illos tuos misericordes oculos ad nos converte. Et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, o pia, o dulcis Virgo Maria.",
  fatimaPrayer:
    "Domine Iesu, dimitte nobis debita nostra, salva nos ab igne inferiori, perduc in caelum omnes animas, praesertim eas, quae misericordiae tuae maxime indigent.",
  // Divine Mercy
  eternalFather:
    "Pater aeterne, offero tibi Corpus et Sanguinem, animam et divinitatem dilectissimi Filii tui, Domini nostri Iesu Christi, in propitiatione pro peccatis nostris et totius mundi.",
  divineMercy:
    "Pro dolorosa eius Passione, miserere nobis et totius mundi.",
  // Joseph chaplet (no specific Latin closing prayer — same as Hail Mary structure)
  josephPrayer:
    "Sancte Ioseph, fidelis custos Iesu et castissime sponse Mariae, ora pro nobis et pro morientibus huius diei (huius noctis). Amen.",
} as const;

// Insertions for the mystery types (used inside Ave Maria after "Iesus")
export const INSERTIONS_LATIN: Record<string, string[]> = {
  joyful: [
    "Iesus, quem, Virgo, concepisti",
    "Iesus, quem, Virgo, visitando Elisabeth portasti",
    "Iesus, quem, Virgo, in Bethlehem genuisti",
    "Iesus, quem, Virgo, in templo praesentasti",
    "Iesus, quem, Virgo, in templo invenisti",
  ],
  luminous: [
    "Iesus, qui apud Iordanem baptizatus est",
    "Iesus, qui se ipsum in Cana ostendit",
    "Iesus, qui Regnum Dei annuntiavit",
    "Iesus, qui transfiguratus est",
    "Iesus, qui Eucharistiam instituit",
  ],
  sorrowful: [
    "Iesus, qui pro nobis sanguinem sudavit",
    "Iesus, qui pro nobis flagellatus est",
    "Iesus, qui pro nobis spinis coronatus est",
    "Iesus, qui pro nobis crucem baiulavit",
    "Iesus, qui pro nobis crucifixus est",
  ],
  glorious: [
    "Iesus, qui resurrexit a mortuis",
    "Iesus, qui in caelum ascendit",
    "Iesus, qui Spiritum Sanctum misit",
    "Iesus, qui te, Virgo, in caelum assumpsit",
    "Iesus, qui te, Virgo, in caelo coronavit",
  ],
  mercy: [
    "Pro dolorosa eius Passione",
    "Pro dolorosa eius Passione",
    "Pro dolorosa eius Passione",
    "Pro dolorosa eius Passione",
    "Pro dolorosa eius Passione",
  ],
  joseph: [
    "Iesus, qui sanctum Ioseph in sponsum tibi elegit",
    "Iesus, qui sanctum Ioseph in nutritium dilexit",
    "Iesus, qui sancto Ioseph oboediens fuit",
    "Iesus, qui cum sancto Ioseph oravit et laboravit",
    "Iesus, qui sanctum Ioseph patronum sanctae Ecclesiae elegit",
  ],
};

export const MYSTERY_NAMES_LATIN: Record<string, string> = {
  joyful: "Mysteria Gaudiosa",
  luminous: "Mysteria Luminosa",
  sorrowful: "Mysteria Dolorosa",
  glorious: "Mysteria Gloriosa",
  mercy: "Coronam Divinae Misericordiae",
  joseph: "Rosarium Sancti Ioseph",
};

export const OPENING_INTENTIONS_LATIN: string[] = [
  "pro augmento fidei",
  "pro augmento spei",
  "pro augmento caritatis",
];

export const PRAYER_TITLES_LATIN: Record<string, string> = {
  signOfCross: "Signum Crucis",
  apostlesCreed: "Symbolum Apostolorum",
  ourFather: "Pater Noster",
  hailMary: "Ave Maria",
  gloryBe: "Gloria Patri",
  fatimaPrayer: "Oratio Fatimae",
  hailHolyQueen: "Salve Regina",
  eternalFather: "Pater Aeterne",
  divineMercy: "Misericordia Divina",
};
