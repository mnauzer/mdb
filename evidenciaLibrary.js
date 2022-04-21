// Library/Event/Script:    Evidencia\Evidencia prác\shared\evidenciaLibrary_w.js
// JS Libraries:
// Dátum:                   15.03.2022
// Popis:

function verziaKniznice() {
    var result = "";
    var nazov = "evidenciaLibrary";
    var verzia = "0.2.08";
    result = nazov + " " + verzia;
    //message("cpLibrary v." + verzia);
    return result;
}

const evidenciaSadzbaPrace = (vykaz, hodinyCelkom) => {
    try {

        var zakladnaSadzba = vykaz.field("Práce sadzby")[0].field("Cena bez DPH");

        // zistiť zľavu podľa počtu odpracovaných hodín
        var zlava = 0;
        var limity = vykaz.field("Práce sadzby")[0].field("Limity");

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
    //nastaviť atribúty výkazu
    var vykaz = evidencia.field("Výkaz prác");
    var hodinCelkom = 0;
    if (vykaz) {
        for (var v = 0; v < vykaz.length; v++) {
            // zistiť hodinovú sadzbu
            var sadzba = 0;
            var hodin = vykaz[v].attr("počet hodín") || odpracovane;
            hodinCelkom += hodin;
            vykaz[v].setAttr("popis prác", vykaz[v].attr("popis prác") || evidencia.field("Rozpis prác"));
            vykaz[v].setAttr("počet hodín", hodin);
            var uctovanie = vykaz[v].field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb");
            if (uctovanie == "Individuálne za každý výjazd") {
                sadzba = evidenciaSadzbaPrace(vykaz[v], hodin);
                vykaz[v].setAttr("sadzba", sadzba);
                vykaz[v].setAttr("cena celkom", hodin * sadzba);
            }
        }
        if (hodinCelkom > odpracovane && typ == "Hodinovka") {
            message("Vo výkazoch je viac hodín ako je celkom odpracované");
            // nastaviť príznak a farbu záznamu
            evidencia.set("farba pozadia", "#FFDCD5");
        } else if (hodinCelkom < odpracovane && typ == "Hodinovka") {
            message("Vo výkazoch je menej hodín ako je celkom odpracované");
            // nastaviť príznak a farbu záznamu
            evidencia.set("farba pozadia", "#FFDCD5");
        } else if (typ == "Položky") {
            evidencia.set("farba pozadia", "#D5FFF3");
        }
        else {
            // nastaviť príznak a farbu záznamu
            evidencia.set("farba pozadia", "#EEFFD5");
            evidencia.set("farba pozadia", "#EEFFD5");
            evidencia.set("hzs ok", true);
        }
    };

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