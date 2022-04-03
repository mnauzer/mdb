// Library/Event/Script:    mdb\vyuctovaniaLibrary.js
// JS Libraries:
// Dátum:                   01.04.2022
// Popis:
// Autor:                   just me, for my garden business. this code is muddy like me
function verziaKniznice() {
    var nazov = "vyuctovaniaLibrary";
    var verzia = "0.2.01";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

const zakazkaDoprava = (zakazka, cenaCelkomBezDPH) => {
    var jazd = zakazkaPocetJazd(zakazka);
    var cp = zakazka.field("Cenová ponuka")[0];
    var vyuctovanie = zakazka.field("Vyúčtovanie")[0];
    var uctovanieDopravy = cp.field("Účtovanie dopravy");
    // doprava
    //message("Debug DOPRAVA " + uctovanie);
    var celkom = 0;
    switch (uctovanieDopravy) {
        case "Paušál":
            var cpPausal = cp.field("Paušál")[0];
            var vPausal = vyuctovanie.field("Paušál")[0];
            //if
            vPausal.setAttr("cena", cpPausal.attr("cena"));
            var cena = vPausal.attr("cena");
            vPausal.setAttr("počet jázd", jazd);
            vPausal.setAttr("cena celkom", cena * jazd);
            celkom += jazd * cena;
            break;
        case "Km":
            var cpKm = cp.field("Sadzba km")[0];
            var vKm = vyuctovanie.field("Sadzba km")[0];
            var km = 0;
            vKm.setAttr("cena", cpKm.attr("cena"));
            var cena = vKm.attr("cena");
            // spočítať kilometre
            for (var k = 0; k < jazdy.length; k++) {
                km += jazdy[k].field("Najazdené km");
            }
            vKm.setAttr("počet km", km);
            vKm.setAttr("cena", cena);
            vKm.setAttr("cena celkom", cena * km);
            celkom += km * cena;
            break;
        case "% zo zákazky":
            var percento = cp.field("% zo zákazky") || 5;
            if (percento) {
                celkom = cenaCelkomBezDPH * (percento / 100);
            }
            break;
        case "Pevná cena":
            var pevnaCena = cp.field("Pevná cena");
            if (pevnaCena) {
                celkom = pevnaCena;
            }
    }
    cp.set("Doprava celkom bez DPH", celkom);
    return celkom;

};

const zakazkaPocetJazd = zakazka => {
    // počíta len cesty na miesto realizácie
    var links = zakazka.linksFrom("Kniha jázd", "Zákazka")
    var jazd = 0;
    message(links.length);
    for (var p = 0; p < links.length; p++) {
        if (links[p].field("Účel jazdy") == "Výjazd") {
            jazd += 1;
        }
    };
    return jazd;
};

const zakazkaKm = zakazka => {
    var links = zakazka.linksFrom("Kniha jázd", "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Najazdené km"));
    };
    return result;
};

const zakazkaCasJazdy = zakazka => {
    var links = zakazka.linksFrom("Kniha jázd", "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += links[p].field("Trvanie") * links[p].field("Posádka").length;
    };
    return result;
};

const zakazkaHodiny = zakazka => {
    var links = zakazka.linksFrom("Evidencia prác", "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Odpracované"));
    };
    return result;
};

const zakazkaMzdy = zakazka => {
    var links = zakazka.linksFrom("Evidencia prác", "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Mzdové náklady"));
    };
    return result;
};

const zakazkaNakupMaterialu = zakazka => {
    var links = zakazka.linksFrom("Výdajky", "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Suma v NC bez DPH"));
    };
    return result;
};

const zakazkaMaterialDPH = zakazka => {
    var links = zakazka.linksFrom("Výdajky", "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += links[p].field("DPH");
    };
    return result;
};
const zakazkaMaterialRozdielDPH = zakazka => {
    var links = zakazka.linksFrom("Výdajky", "Zákazka");
    var result = 0;
    var dphNC = 0;
    var dph = 0;
    for (var p = 0; p < links.length; p++) {
        dphNC += links[p].field("DPH NC");
        dph += links[p].field("DPH");
    };
    result = dph - dphNC;
    if (result < 0) {
        result = 0;
    }
    return result;
};

const zakazkaPraceDPH = zakazka => {
    var links = zakazka.linksFrom("Výkaz prác", "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("DPH"));
    };
    return result;
};

const zakazkaPraceVykazyHZS = (vykaz, sadzbaDPH) => {
    // verzia
    //var verzia = "0.2.1"
    //message("funkcia: zakazkaPraceVykazyHZS v." + verzia);
    //message("Výkaz: " + vykaz.field("Popis"))
    // inicializácia
    var sDPH = vykaz.field("s DPH");
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var diel = vykaz.field("Popis");
    var evidenciaLinks = vykaz.linksFrom("Evidencia prác", "Výkaz prác");
    // vymazať predošlé nalinkované evidencie
    var empty = [];
    vykaz.set("Odpracované", empty);

    var hodinyCelkom = 0;
    var polozka = vykaz.field("Práce")[0];
    // vypočítať aktuálnu sadzbu práce za počet hodín
    var uctovanie = vykaz.field("Zákazka")[0].field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb");
    if (uctovanie == "Individuálne za každý výjazd") {
        for (var el = 0; el < evidenciaLinks.length; el++) {

            var indexy = [];
            var rVykazy = evidenciaLinks[el].field("Výkaz prác");
            for (var r = 0; r < rVykazy.length; r++) {
                indexy.push(rVykazy[r].id);
            }
            var index = indexy.indexOf(vykaz.id);
            // message("Index: " + index);
            var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
            hodinyCelkom += rVykaz.attr("počet hodín") || evidenciaLinks[el].field("Odpracované");

            vykaz.link("Odpracované", evidenciaLinks[el]);
            vykaz.field("Odpracované")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
            vykaz.field("Odpracované")[el].setAttr("počet hodín", rVykaz.attr("počet hodín"));
            vykaz.field("Odpracované")[el].setAttr("sadzba", rVykaz.attr("sadzba"));
            vykaz.field("Odpracované")[el].setAttr("cena celkom", rVykaz.attr("cena celkom"));
            vykaz.field("Odpracované")[el].set("Tlač", "Tlač");
            sumaBezDPH += rVykaz.attr("cena celkom")
        }
        polozka.setAttr("dodané množstvo", hodinyCelkom);
        polozka.setAttr("cena", null);
        polozka.setAttr("cena celkom", sumaBezDPH);
    } else {
        for (var el = 0; el < evidenciaLinks.length; el++) {
            //toto bude fungovať len keč je v evidencii len jeden výka rVykaz[0]
            var indexy = [];
            var rVykazy = evidenciaLinks[el].field("Výkaz prác");
            for (var r = 0; r < rVykazy.length; r++) {
                indexy.push(rVykazy[r].id);
            }
            var index = indexy.indexOf(vykaz.id);
            // message("Index: " + index);
            var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
            hodinyCelkom += rVykaz.attr("počet hodín") || evidenciaLinks[el].field("Odpracované");

            vykaz.link("Odpracované", evidenciaLinks[el]);
            vykaz.field("Odpracované")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
            vykaz.field("Odpracované")[el].setAttr("počet hodín", null);
            vykaz.field("Odpracované")[el].setAttr("sadzba", null);
            vykaz.field("Odpracované")[el].setAttr("cena celkom", null);
            vykaz.field("Odpracované")[el].set("Tlač", "Tlač")
        }
        // zistiť zľavu podľa počtu odpracovaných hodín
        var sadzba = vykaz.field("Cenová ponuka")[0].field(diel)[0].attr("sadzba");
        var zlava = null;
        var zakladnaSadzba = null;
        var limity = polozka.field("Limit pracovných hodín");
        if (limity) {
            zakladnaSadzba = polozka.field("Cena bez DPH");
            for (var m = 0; m < limity.length; m++) {
                if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
                    zlava = limity[m].field("Zľava");
                }
                // výpočítať novú sadzbu so zľavou
                sadzba = zakladnaSadzba - (zakladnaSadzba * zlava / 100);
            }
        }
        // dosadiť výsledky do poľa "Práce" - pri výkazoch práce je len jedno
        sumaBezDPH = hodinyCelkom * sadzba;
        polozka.setAttr("dodané množstvo", hodinyCelkom);
        polozka.setAttr("základná sadzba", zakladnaSadzba);
        polozka.setAttr("zľava %", zlava);
        polozka.setAttr("cena", sadzba);
        polozka.setAttr("cena celkom", sumaBezDPH);
    }
    vykaz.set("Suma bez DPH", sumaBezDPH);
    if (sDPH) {
        sumaDPH += sumaBezDPH * sadzbaDPH;
        vykaz.set("DPH", sumaDPH);
        vykaz.set("Suma s DPH", sumaBezDPH + sumaDPH);
    } else {
        vykaz.set("DPH", null);
        vykaz.set("Suma s DPH", null);

    }
    // message("Suma bez DPH: " + sumaBezDPH);
    vykaz.set("Tlač", "Tlač");
    return sumaBezDPH;
};

const zakazkaPraceVykazyPolozky = (vykaz, sadzbaDPH) => {
    // verzia
    //var verzia = "0.2.1"
    //message("funkcia: zakazkaPraceVykazyPolozky v." + verzia);
    //message("Výkaz: " + vykaz.field("Popis"))
    // inicializácia
    var sDPH = vykaz.field("s DPH");
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var polozky = vykaz.field("Práce");

    if (polozky) {
        for (var p = 0; p < polozky.length; p++) {
            var mnozstvo = polozky[p].attr("dodané množstvo");
            var cena = polozky[p].attr("cena");
            cenaCelkom = mnozstvo * cena;
            polozky[p].setAttr("cena celkom", mnozstvo * cena);
            sumaBezDPH += cenaCelkom;
            // message("množstvo:+ " + mnozstvo + ", cena: " + cena + ", cena celkom: " + cenaCelkom);
        }
    }
    vykaz.set("Suma bez DPH", sumaBezDPH);
    if (sDPH) {
        sumaDPH += sumaBezDPH * sadzbaDPH;
        vykaz.set("DPH", sumaDPH);
        vykaz.set("Suma s DPH", sumaBezDPH + sumaDPH);
    } else {
        vykaz.set("DPH", null);
        vykaz.set("Suma s DPH", null);

    }
    // message("Suma bez DPH: " + sumaBezDPH);
    vykaz.set("Tlač", "Tlač");
    return sumaBezDPH;
};

const zakazkaMaterialVydajky = (vydajka, sadzbaDPH) => {
    // verzia
    //var verzia = "0.2.1"
    //message("funkcia: zakazkaMaterialVydajky v." + verzia);
    // message("Výkaz: " + vydajka.field("Popis"))

    //message("Výdajka: " + vydajka.field("Popis"))
    // inicializácia
    var sDPH = vydajka.field("s DPH");
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var polozky = vydajka.field("Materiál");
    if (polozky) {
        // presť všetky položky na výdajke a spočitať sumy
        for (var p = 0; p < polozky.length; p++) {
            var mnozstvo = polozky[p].attr("dodané množstvo");
            var cena = polozky[p].attr("cena");
            var cenaCelkom = mnozstvo * cena;
            polozky[p].setAttr("cena celkom", cenaCelkom);
            //var cenaCelkom = mnozstvo * cena;
            sumaBezDPH += cenaCelkom;
        }
    }
    vydajka.set("Suma bez DPH", sumaBezDPH);
    if (sDPH) {
        sumaDPH += sumaBezDPH * sadzbaDPH;
        vydajka.set("DPH", sumaDPH);
        vydajka.set("Suma s DPH", sumaBezDPH + sumaDPH);
    } else {
        vydajka.set("DPH", null);
        vydajka.set("Suma s DPH", null);

    }
    // message("Suma bez DPH: " + sumaBezDPH);
    vydajka.set("Tlač", "Tlač");
    return sumaBezDPH;
};

const zakazkaPraceEvidencia = zakazka => {
    var typ = zakazka.field("Cenová ponuka")[0].field("Typ cenovej ponuky");
    if (typ == "Položky") {
        message("spočítavám položky");
        // prejde výkazy práce
        var vykazy = zakazka.linksFrom("Výkazy práce", "Zákazka");
        for (var v = 0; v < vykazy.length; v++) {
        }

    } else if (typ == "Hodinovka") {
        message("spočítavám hodiny");
        // prejde výkazy práce
        var vykazy = zakazka.linksFrom("Výkazy práce", "Zákazka");
        for (var v = 0; v < vykazy.length; v++) {
        }
    } else {
        message("ad-hoc ešte nefunguje");
    }
};

const zakazkaPrijmy = zakazka => {
    var links = zakazka.linksFrom("Pokladňa", "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Príjem bez DPH") + links[p].field("DPH+"));
    }
    return result;
};

const zakazkaVydavky = zakazka => {
    var links = zakazka.linksFrom("Pokladňa", "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Výdavok bez DPH") + links[p].field("DPH-"));
    };
    return result;
};
// End of file: 22.03.2022, 19:24