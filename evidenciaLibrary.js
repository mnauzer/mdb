// Library/Event/Script:    Evidencia\Evidencia prác\shared\evidenciaLibrary_w.js
// JS Libraries:
// Dátum:                   15.03.2022
// Popis:

function verziaKniznice() {
    var result = "";
    var nazov = "evidenciaLibrary";
    var verzia = "0.2.10";
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

const prepocetZaznamuEvidencie = evidencia => {
    var datum = evidencia.field("Dátum")
    var vKniznica = verziaKniznice();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("PREPOČET EVIDENCIA PRÁC\n" + vKniznica + "\n" + vKrajinkaLib);
    // nastaviť sezónu
    evidencia.set("sezóna", datum.getFullYear());
    var sezona = evidencia.field("sezóna");

    // vygenerovať nové číslo
    var cislo = evidencia.field("Číslo");
    cislo = cislo ? cislo : noveCislo(sezona, DB_EVIDENCIA_PRAC, 0, 3);

    // inicializácia
    var typ = evidencia.field("Typ zákazky");
    if (typ == "Hodinovka") {
        evidencia.set(FIELD_ZAKAZKA, evidencia.field("Výkaz prác")[0].field(FIELD_ZAKAZKA)[0] || null);
    } else if (typ == "Položky") {
        //message("Práce na zákazke " + evidencia.field("Zákazka")[0].field("Názov"));
    }
    var zamestnanci = evidencia.field(FIELD_ZAMESTNANCI);
    var odpracovane = 0;
    var mzdoveNakladyCelkom = 0;
    var nakladyZamestnatec = 0;
    // zaokrúhli na 1/4 hod
    var casOd = roundTimeQ(evidencia.field("Od"));
    var casDo = roundTimeQ(evidencia.field("Do"));

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
    var vykazPrac = evidencia.field("Výkaz prác");
    var hodinCelkom = 0;
    if (vykazPrac) {
        for (var v = 0; v < vykazPrac.length; v++) {
            // zistiť hodinovú sadzbu
            var sadzba = 0;
            var hodin = vykazPrac[v].attr("počet hodín") || odpracovane;
            hodinCelkom += hodin;
            vykazPrac[v].setAttr("popis prác", vykazPrac[v].attr("popis prác") || evidencia.field("Rozpis prác"));
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
    var evidovatStroje = evidencia.field("Evidovať stroje");
    if (evidovatStroje) {
        var vyuzitieStrojov = evidencia.field("Využitie strojov");
        var vykazStrojov = evidencia.field("Výkaz strojov")[0];
        if (vykazStrojov.length <= 0) {
            // ak má zákazka už vygenerovaný výkaz s cp
            var vykazStrojovZakazka = vykazPrac.filed("Zákazka")[0].linksFrom("Výkaz strojov", "Zákazka")[0];
            if (vykazStrojovZakazka) {
                evidencia.link("vykazStrojov", vykazStrojovZakazka);
            } else {
                // ak nemá vygenerovanýv výkaz, vygeneruj nový
                // ...
            }
        }
        var stroje = vykazStrojov.field("Stroje");
        for (var i = 0; i < vyuzitieStrojov.length; i++) {
            for (var j = 0; j < stroje.length; j++) {
                if (vyuzitieStrojov[i].title == vykazStrojov[j].title) {
                    stroje[j].setAttr("prevádzka mth", stroje[j].attr("prevádzka mth") + vyuzitieStrojov[i].attr("doba prevádzky"));
                    break;
                } else {
                    vykazStrojov.link("Stroje", vyuzitieStrojov[i]);
                    stroje[j].setAttr("prevádzka mth", vyuzitieStrojov[i].attr("doba prevádzky"));
                }
            }
        }

        evidencia.set("Číslo", cislo);
        evidencia.set("Od", casOd);
        evidencia.set("Do", casDo);
        evidencia.set("Počet pracovníkov", zamestnanci.length);
        evidencia.set("Odpracované", odpracovane);
        evidencia.set("Mzdové náklady", mzdoveNakladyCelkom);
        evidencia.set("Odpracované/os", odpracovaneOsoba);
        evidencia.set("sezóna", sezona);
    }




// End of file: 15.03.2022, 07:59