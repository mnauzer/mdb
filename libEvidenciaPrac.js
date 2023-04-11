// Library/Event/Script:    Evidencia\Evidencia prác\shared\evidenciaLibrary_w.js
// JS Libraries:
// Dátum:                   15.03.2022
// Popis:

function verziaKniznice() {
    var result = "";
    var nazov = "evidenciaLibrary";
    var verzia = "0.2.30";
    result = nazov + " " + verzia;
    //message("cpLibrary v." + verzia);
    return result;
}

const evidenciaSadzbaPrace = (vykazPrac, hodinyCelkom) => {
    try {

        var zakladnaSadzba = vykazPrac.field("Práce sadzby")[0].field("Cena bez DPH");

        // zistiť zľavu podľa počtu odpracovaných hodín
        var zlava = 0;
        var limity = vykazPrac.field("Práce sadzby")[0].field("Limity");

        for (var m = 0; m < limity.length; m++) {
            if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
                zlava = limity[m].field("Zľava");
            }
        }
        var sadzba = zakladnaSadzba - (zakladnaSadzba * zlava / 100);
        return sadzba;
    } catch (error) {
        message("Chyba funkcie 'evidenciaSadzbaPrace' \n" + error);
    }
};

const prepocetZaznamuEvidencie = en => {
    var datum = en.field(DATE)
    // inicializácia
    var typ = en.field("Typ zákazky");
    if (typ == "Hodinovka") {
        //TODO opraviť chybu keď nie je zadaná zákazka
        en.set(FIELD_ZAKAZKA, en.field("Výkaz prác")[0].field(FIELD_ZAKAZKA)[0] || null);
    } else if (typ == "Položky") {
        //message("Práce na zákazke " + evidencia.field("Zákazka")[0].field("Názov"));
    }
    var zamestnanci = evidencia.field(FIELD_ZAMESTNANCI);
    var odpracovane = 0;
    var mzdoveNakladyCelkom = 0;
    var nakladyZamestnatec = 0;
    // zaokrúhli na 1/4 hod
    var casOd = roundTimeQ(en.field("Od"));
    var casDo = roundTimeQ(en.field("Do"));

    // spočítaj hodiny, mzdy a náklady
    odpracovaneOsoba = (casDo - casOd) / 3600000;
    for (var z = 0; z < zamestnanci.length; z++) {
        // sadzba buď tá zadaná, alebo zisti zo záznamu zamestnanca
        var hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : sadzbaZamestnanca(zamestnanci[z]);
        zamestnanci[z].setAttr("hodinovka", hodinovka);
        odpracovane += odpracovaneOsoba;
        nakladyZamestnatec = odpracovaneOsoba * hodinovka;
        mzdoveNakladyCelkom += nakladyZamestnatec;
    };
    // PRÁCE
    var vykazPrac = en.field("Výkaz prác");
    var hodinCelkom = 0;
    if (vykazPrac) {
        for (var v = 0; v < vykazPrac.length; v++) {
            // zistiť hodinovú sadzbu
            var sadzba = 0;
            var hodin = vykazPrac[v].attr("počet hodín") || odpracovane;
            hodinCelkom += hodin;
            vykazPrac[v].setAttr("popis prác", vykazPrac[v].attr("popis prác") || en.field("Rozpis prác"));
            vykazPrac[v].setAttr("počet hodín", hodin);
            var uctovanie = vykazPrac[v].field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb");
            if (uctovanie == "Individuálne za každý výjazd") {
                sadzba = evidenciaSadzbaPrace(vykazPrac[v], hodin);
                vykazPrac[v].setAttr("sadzba", sadzba);
                vykazPrac[v].setAttr("cena celkom", hodin * sadzba);
            }
        }
    };

    //STROJE
    var evidovatStroje = en.field("Evidovať stroje");
    if (evidovatStroje) {
        var vyuzitieStrojov = en.field("Využitie strojov");
        if (vyuzitieStrojov) {
            var vykazStrojov = en.field("Výkaz strojov")[0];
            if (vykazStrojov) {
                // ak má zákazka už vygenerovaný výkaz s cp
                var stroje = vykazStrojov.field("Stroje");
                for (var i = 0; i < vyuzitieStrojov.length; i++) {
                    if (stroje) {
                        var prevadzkaMTH = 0;
                        for (var j = 0; j < stroje.length; j++) {
                            if (vyuzitieStrojov[i].field("Cena")[0].id == stroje[j].id) {
                            }
                            stroje[j].setAttr("prevádzka mth", stroje[j].attr("prevádzka mth", prevadzkaMTH));
                        }
                    } else {
                        message("false");
                        vykazStrojov.link("Stroje", vyuzitieStrojov[i].field("Cena")[0]);
                    }
                }
            } else {
                var vykazStrojovZakazka = en.field("Zákazka")[0].linksFrom("Výkaz strojov", "Zákazka")[0];
                if (vykazStrojovZakazka) {
                    en.link("Výkaz strojov", vykazStrojovZakazka);
                } else {
                    // ak neexistuje, vygeneruj nový výkaz strojov
                    message("Generujem výkaz strojov");
                    vykazStrojov = novyVykazStrojov(en.field("Zákazka")[0]);
                    en.link("Výkaz strojov", vykazStrojov);
                }
            }
            prepocitatVykazStrojov(vykazStrojov);
        } else {
            message("V zázname nie su vybraté žiadne využité stroje");
        }
    }

    en.set("Od", casOd);
    en.set("Do", casDo);
    en.set("Počet pracovníkov", zamestnanci.length);
    en.set("Odpracované", odpracovane);
    en.set("Mzdové náklady", mzdoveNakladyCelkom);
    en.set("Odpracované/os", odpracovaneOsoba);
}




// End of file: 15.03.2022, 07:59