// Library/Event/Script:    Projekty\Zákazky\shared\zakazkyLibrary_w.js
// JS Libraries:
// Dátum:                   09.03.2022
// Popis:                   knižnica scriptov Zákazky
function verziaKniznice() {
    var result = "";
    var nazov = "zakazkyLibrary";
    var verzia = "0.3.60";
    result = nazov + " " + verzia;
    //message("cpLibrary v." + verzia);
    return result;
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
            var cena = cpPausal.attr("cena");
            if (vyuctovanie) { // prepočet ak je už vygenerované vyúčtovanie
                var vPausal = vyuctovanie.field("Paušál")[0];
                //if
                vPausal.setAttr("cena", cena);
                vPausal.setAttr("počet jázd", jazd);
                vPausal.setAttr("cena celkom", cena * jazd);
            }
            celkom += jazd * cena;
            break;
        case "Km":
            var cpKm = cp.field("Sadzba km")[0];
            var km = 0;
            var jazdy = zakazka.linksFrom("Kniha jázd", "Zákazka")
            // spočítať kilometre
            for (var k = 0; k < jazdy.length; k++) {
                km += jazdy[k].field("Najazdené km");
            }
            var cena = cpKm.attr("cena");
            if (vyuctovanie) {
                var vKm = vyuctovanie.field("Sadzba km")[0];
                vKm.setAttr("cena", cena);
                vKm.setAttr("počet km", km);
                vKm.setAttr("cena", cena);
                vKm.setAttr("cena celkom", cena * km);
            }
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

const zakazkaStrojeDPH = zakazka => {
    var links = zakazka.linksFrom("Výkaz prác", "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("DPH"));
    };
    return result;
};

const zistiIndexLinku = (link, remoteLinks) => {
    var indexy = [];
    //var remoteLinks = evidenciaLinks[el].field("Výkaz prác");
    for (var r = 0; r < remoteLinks.length; r++) {
        indexy.push(remoteLinks[r].id);
    }
    var index = indexy.indexOf(link.id);

    return index;
}

const zakazkaPraceVykazyHZS = (vykaz, sDPH, sadzbaDPH) => {

    // inicializácia
    // var sDPH = vykaz.field("s DPH");
    if (sDPH) { vykaz.set("s DPH", true) }
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var diel = vykaz.field("Popis");
    var cp = vykaz.field("Cenová ponuka")[0];
    var typ = cp.field("Typ cenovej ponuky");
    var evidenciaLinks = vykaz.linksFrom("Evidencia prác", "Výkaz prác");
    // vymazať predošlé nalinkované evidencie
    var empty = [];
    vykaz.set("Rozpis", empty);

    var hodinyCelkom = 0;
    if (typ = "Hodinovka") {
        var polozka = vykaz.field("Práce sadzby")[0];
        var limity = polozka.field("Limity");
        var attrMJ = "účtovaná sadzba";
    } else {
        var polozka = vykaz.field("Práce")[0];
        var attrMJ = "cena";
    }
    // vypočítať aktuálnu sadzbu práce za počet hodín
    var uctovanie = vykaz.field("Zákazka")[0].field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb");
    if (uctovanie == "Individuálne za každý výjazd") {
        for (var el = 0; el < evidenciaLinks.length; el++) {
            var rVykazy = evidenciaLinks[el].field("Výkaz prác");
            // nájde index výkazu v linkToEntry evidencie prác
            var index = zistiIndexLinku(vykaz, rVykazy);
            // rVykaz - remote link v evidencii na tento výkaz
            var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
            // počet hodín z atribútu alebo celkový počet hodín zo záznamu
            hodinyCelkom += rVykaz.attr("počet hodín") || evidenciaLinks[el].field("Odpracované");
            // nalinkuj záznam do evidencie prác
            vykaz.link("Rozpis", evidenciaLinks[el]);
            //nastav atribúty nového linku
            vykaz.field("Rozpis")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
            vykaz.field("Rozpis")[el].setAttr("počet hodín", rVykaz.attr("počet hodín"));
            vykaz.field("Rozpis")[el].setAttr(attrMJ, rVykaz.attr("sadzba"));
            vykaz.field("Rozpis")[el].setAttr("cena celkom", rVykaz.attr("cena celkom"));
            // nastav príznak výkazu na tlač
            vykaz.field("Rozpis")[el].set("Tlač", "Tlač");
            sumaBezDPH += rVykaz.attr("cena celkom")
        }
        polozka.setAttr("dodané množstvo", hodinyCelkom);
        polozka.setAttr("účtovaná sadzba", null); // len vynuluje attribút
        polozka.setAttr("cena celkom", sumaBezDPH);
    } else if (uctovanie == "Za celú zákazku") {
        for (var el = 0; el < evidenciaLinks.length; el++) {
            var rVykazy = evidenciaLinks[el].field("Výkaz prác");
            var index = zistiIndexLinku(vykaz, rVykazy);
            var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
            hodinyCelkom += rVykaz.attr("počet hodín") || evidenciaLinks[el].field("Odpracované");
            vykaz.link("Rozpis", evidenciaLinks[el]);
            vykaz.field("Rozpis")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
            vykaz.field("Rozpis")[el].setAttr("počet hodín", null);
            vykaz.field("Rozpis")[el].setAttr(attrMJ, null);
            vykaz.field("Rozpis")[el].setAttr("cena celkom", null);
            vykaz.field("Rozpis")[el].set("Tlač", "Tlač")
        }
        // zistiť zľavu podľa počtu odpracovaných hodín
        var sadzba = vykaz.field("Cenová ponuka")[0].field(diel)[0].attr("sadzba");
        var zlava = null;
        var zakladnaSadzba = null;
        if (limity) {
            zakladnaSadzba = sadzba;
            for (var m = 0; m < limity.length; m++) {
                if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
                    zlava = limity[m].field("Zľava");
                }
                // výpočítať novú sadzbu so zľavou
                //sadzba = zakladnaSadzba - (zakladnaSadzba * zlava / 100);
            }
        }
        sadzba = sadzba - (sadzba * zlava / 100);
        // dosadiť výsledky do poľa "Práce" - pri výkazoch práce je len jedno
        sumaBezDPH = hodinyCelkom * sadzba;
        polozka.setAttr("dodané množstvo", hodinyCelkom);
        polozka.setAttr("základná sadzba", zakladnaSadzba);
        polozka.setAttr("zľava %", zlava);
        polozka.setAttr(attrMJ, sadzba);
        polozka.setAttr("cena celkom", sumaBezDPH);
    } else {
        message("Chyba!...nie je zadaný typ účtovania hodinvých sadzieb");
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

const zakazkaPraceVykazyPolozky = (vykaz, sDPH, sadzbaDPH) => {
    // inicializácia
    //var sDPH = vykaz.field("s DPH");
    if (sDPH) { vykaz.set("s DPH", true) }
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var polozky = vykaz.field("Práce");

    if (polozky) {
        for (var p = 0; p < polozky.length; p++) {
            var mnozstvo = polozky[p].attr("dodané množstvo");
            var cena = polozky[p].attr("cena");
            cenaCelkom = mnozstvo * cena;
            polozky[p].setAttr("cena celkom", cenaCelkom);
            sumaBezDPH += cenaCelkom;
            // message("množstvo:+ " + mnozstvo + ", cena: " + cena + ", cena celkom: " + cenaCelkom);
            // nastav príznak Tlač
            polozky[p].set("Tlač", "Tlač");
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

const zakazkaStrojeVykazy = (vykaz, sDPH, sadzbaDPH) => {
    //message("Výdajka: " + vydajka.field("Popis"))
    // inicializácia
    //var sDPH = vykaz.field("s DPH");
    if (sDPH) { vykaz.set("s DPH", true) }
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var polozky = vykaz.field("Stroje");
    if (polozky) {
        // presť všetky položky na výdajke a spočitať sumy
        for (var p = 0; p < polozky.length; p++) {
            var mnozstvo = polozky[p].attr("prevádzka mth");
            var cena = polozky[p].attr("účtovaná sadzba");
            var cenaCelkom = mnozstvo * cena;
            polozky[p].setAttr("cena celkom", cenaCelkom);
            //var cenaCelkom = mnozstvo * cena;
            sumaBezDPH += cenaCelkom;
            // nastav príznak Tlač
            polozky[p].set("Tlač", "Tlač");
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

const zakazkaMaterialVydajky = (vydajka, sDPH, sadzbaDPH) => {
    //message("Výdajka: " + vydajka.field("Popis"))
    // inicializácia
    //var sDPH = vydajka.field("s DPH");
    if (sDPH) { vydajka.set("s DPH", true) }
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

const zakazkaPrijmy = (zakazka, sDPH) => {
    var links = zakazka.linksFrom("Pokladňa", "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Príjem bez DPH") + links[p].field("DPH+"));
    }
    return result;
};

const zakazkaVydavky = (zakazka, sDPH) => {
    var links = zakazka.linksFrom("Pokladňa", "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Výdavok bez DPH") + links[p].field("DPH-"));
    };
    return result;
};

const efektivita = marza => {
    result = 0;
    var koeficient = 0.6; // 60% marža je top = 10 stars
    result = marza / koeficient;
    return result;
}
// nalinkuj tovar z výdajok do vyúčtovanie / POLOŽKY -- bez prepočtu
const nalinkujMaterial = (vyuctovanie, vydajka) => {
    var vydajkaCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vydajka.field("Popis");
    vyuctovanie.set(popis, empty);
    // položky z výdajky do array
    var polozkyVydajka = vydajka.field("Materiál");
    // nastav atribúty položiek vo vyúčtovaní
    var polozkyVyuctovanie = vyuctovanie.field(popis);
    for (var m = 0; m < polozkyVydajka.length; m++) {
        vyuctovanie.link(popis, polozkyVydajka[m]);
        var mnozstvo = polozkyVydajka[m].attr("dodané množstvo");
        var cena = polozkyVydajka[m].attr("cena");
        var cenaCelkom = polozkyVydajka[m].attr("cena celkom");
        vyuctovanie.field(popis)[m].setAttr("množstvo", mnozstvo);
        vyuctovanie.field(popis)[m].setAttr("cena", cena);
        vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
        vydajkaCelkom += cenaCelkom;
        // nastav príznak Tlač
        polozkyVydajka[m].set("Tlač", "Tlač");
    }
    vyuctovanie.set(popis + " celkom", vydajkaCelkom);
    return vydajkaCelkom;
}

// nalinkuj tovar z výdajok do vyúčtovanie / POLOŽKY
const nalinkujPrace = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vykazPrac.field("Popis");
    vyuctovanie.set(popis, empty);
    vyuctovanie.set(popis + " celkom", empty);
    // práce navyše ošetriť inak
    if (popis != "Práce navyše") {
        // položky z výdajky do array
        var polozkyVykazPrac = vykazPrac.field("Práce");
        for (var m = 0; m < polozkyVykazPrac.length; m++) {
            var mnozstvo = polozkyVykazPrac[m].attr("dodané množstvo");
            var cena = polozkyVykazPrac[m].attr("cena");
            var cenaCelkom = polozkyVykazPrac[m].attr("cena celkom");
            vyuctovanie.link(popis, polozkyVykazPrac[m])
            vyuctovanie.field(popis)[m].setAttr("množstvo", mnozstvo);
            vyuctovanie.field(popis)[m].setAttr("cena", cena);
            vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
            vykazPracCelkom += cenaCelkom;
            // nastav príznak Tlač
            polozkyVykazPrac[m].set("Tlač", "Tlač");
        }
    } else {
        // práce navyše
        var praceNavyse = vykazPrac.field("Práce sadzby")[0];
        var hodinCelkom = 0;
        var uctovanaSadzba = vykazPrac.field("Cenová ponuka")[0].field(popis)[0].attr("sadzba");
        var cenaCelkom = 0;
        vyuctovanie.link(popis, praceNavyse);
        var evidenciaLinks = vykazPrac.linksFrom("Evidencia prác", "Výkaz prác");
        for (var e = 0; e < evidenciaLinks.length; e++) {
            vyuctovanie.link("Rozpis", evidenciaLinks[e]);
            vyuctovanie.field("Rozpis")[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
            vyuctovanie.field("Rozpis")[e].setAttr("počet hodín", evidenciaLinks[e].attr("počet hodín"));
            hodinCelkom += evidenciaLinks[e].attr("počet hodín");
        }
        cenaCelkom = hodinCelkom * uctovanaSadzba;
        vyuctovanie.field(popis)[0].setAttr("cena celkom", cenaCelkom);

    }
    vyuctovanie.set(popis + " celkom", vykazPracCelkom);
    return vykazPracCelkom;
}

const nalinkujPraceHZS = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
    var pocitanieHodinovychSadzieb = vykazPrac.field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb");
    var empty = [];
    var popis = vykazPrac.field("Popis");
    vyuctovanie.set(popis, empty);
    vyuctovanie.set(popis + " celkom", empty);
    var vykazPraceSadzby = vykazPrac.field("Práce sadzby")[0];
    var vykazPraceSadzbyCelkom = 0;
    var hodinCelkom = 0;
    var cenaCelkom = 0;
    var uctovanaSadzba = 0;
    vyuctovanie.link(popis, vykazPraceSadzby);
    var evidenciaLinks = vykazPrac.linksFrom("Evidencia prác", "Výkaz prác");
    if (pocitanieHodinovychSadzieb == "Za celú zákazku") {
        var zlava = vykazPraceSadzby.attr("zľava %");
        var zakladnaSadzba = vykazPraceSadzby.attr("základná sadzba");
        var uctovanaSadzba = vykazPraceSadzby.attr("účtovaná sadzba");
        vyuctovanie.field(popis)[0].setAttr("počet hodín", vykazPraceSadzby.attr("dodané množstvo"));
        if (!zlava) {
            vyuctovanie.field(popis)[0].setAttr("základná sadzba", zakladnaSadzba);
            uctovanaSadzba = zakladnaSadzba;
            zakladnaSadzba = null;
        } else {
            zlava = "zľava " + zlava + "%";
        }
        vyuctovanie.field(popis)[0].setAttr("základná sadzba", zakladnaSadzba);
        vyuctovanie.field(popis)[0].setAttr("zľava", zlava);
        vyuctovanie.field(popis)[0].setAttr("účtovaná sadzba", uctovanaSadzba);
        vyuctovanie.field(popis)[0].setAttr("cena celkom", vykazPraceSadzby.attr("cena celkom"));
        hodinCelkom += vykazPraceSadzby.attr("dodané množstvo");
        uctovanaSadzba = vykazPraceSadzby.attr("účtovaná sadzba");
        // nastav príznak Tlač
        vyuctovanie.field(popis)[0].set("Tlač", "Tlač");
        for (var e = 0; e < evidenciaLinks.length; e++) {
            vyuctovanie.link("Rozpis " + popis, evidenciaLinks[e]);
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
            cenaCelkom = hodinCelkom * uctovanaSadzba;
            vykazPracCelkom += cenaCelkom;
            // nastav príznak Tlač
            evidenciaLinks[e].set("Tlač", "Tlač");
        }
    } else if (pocitanieHodinovychSadzieb == "Individuálne za každý výjazd") {

        vyuctovanie.field(popis)[0].setAttr("počet hodín", vykazPraceSadzby.attr("dodané množstvo"));
        vyuctovanie.field(popis)[0].setAttr("cena celkom", vykazPraceSadzby.attr("cena celkom"));
        for (var e = 0; e < evidenciaLinks.length; e++) {
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("zľava", evidenciaLinks[e].attr("zľava"));
            vyuctovanie.link("Rozpis " + popis, evidenciaLinks[e]);
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("cena celkom", evidenciaLinks[e].attr("cena celkom"));
            vyuctovanie.field(popis)[0].setAttr("cena celkom", cenaCelkom);
            cenaCelkom = hodinCelkom * uctovanaSadzba;
            // nastav príznak Tlač
            evidenciaLinks[e].set("Tlač", "Tlač");
        }
    } else {
        message("Neviem určiť počítanie hodinových sadzieb")
    }

    vyuctovanie.set(popis + " celkom", vykazPracCelkom);
    return vykazPracCelkom;
}

const nalinkujStroje = (vyuctovanie, vykazStrojov) => {
    var vykazStrojovCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vykazStrojov.field("Popis");
    vyuctovanie.set(popis, empty);

    var polozkyVykaz = vykazStrojov.field("Stroje");
    // nastav atribúty položiek vo vyúčtovaní
    var polozkyVyuctovanie = vyuctovanie.field(popis);
    for (var m = 0; m < polozkyVykaz.length; m++) {
        vyuctovanie.link(popis, polozkyVykaz[m]);
        var mnozstvo = polozkyVykaz[m].attr("prevádzka mth");
        var cena = polozkyVykaz[m].attr("účtovaná sadzba");
        var cenaCelkom = polozkyVykaz[m].attr("cena celkom");
        vyuctovanie.field(popis)[m].setAttr("využitie mth", mnozstvo);
        vyuctovanie.field(popis)[m].setAttr("sadzba", cena);
        vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
        vykazStrojovCelkom += cenaCelkom;
        // nastav príznak Tlač
        polozkyVykaz[m].set("Tlač", "Tlač");
    }
    vyuctovanie.set(popis + " celkom", vykazStrojovCelkom);

    return vykazStrojovCelkom;
}

const zakazkaNoveVyuctovanie = zakazka => {
    var vyuctovania = libByName("Vyúčtovania");
    var noveVyuctovanie = new Object();
    // inicializácia
    var datum = new Date();
    var cp = zakazka.field("Cenová ponuka")[0];
    var sezona = cp.field("sezóna");
    var cislo = noveCislo(sezona, "Vyúčtovania", 1, 2);
    var klient = cp.field("Klient")[0]
    var miesto = cp.field("Miesto realizácie")[0];
    var typ = cp.field("Typ cenovej ponuky");
    var uctovanieDPH = zakazka.field("Účtovanie DPH");

    // inicializácia
    var empty = []; // mazacie pole

    // vyber diely zákazky podľa typu cp
    if (typ == "Hodinovka") {
        var diely = cp.field("Diely cenovej ponuky hzs");
    } else {
        var diely = cp.field("Diely cenovej ponuky");
    }
    // popis vyúčtovania
    var popisVyuctovania = "Vyúčtovanie zákazky č." + zakazka.field("Číslo") + " (" + cp.field("Popis cenovej ponuky") + ")";

    // Hlavička a základné nastavenia
    noveVyuctovanie["Dátum"] = datum;
    noveVyuctovanie["Číslo"] = cislo;
    noveVyuctovanie["Miesto realizácie"] = miesto;
    noveVyuctovanie["Stav vyúčtovania"] = "Prebieha";
    noveVyuctovanie["Typ vyúčtovania"] = typ;
    noveVyuctovanie["+Materiál"] = cp.field("+Materiál");
    noveVyuctovanie["+Mechanizácia"] = cp.field("+Mechanizácia");
    noveVyuctovanie["+Subdodávky"] = cp.field("+Subdodávky");
    noveVyuctovanie["Účtovanie dopravy"] = cp.field("Účtovanie dopravy");
    noveVyuctovanie["Klient"] = klient;
    noveVyuctovanie["Popis vyúčtovania"] = popisVyuctovania;
    noveVyuctovanie["Cenová ponuka"] = cp;
    noveVyuctovanie["Zákazka"] = zakazka;
    noveVyuctovanie["sezóna"] = sezona;
    noveVyuctovanie["Diely vyúčtovania"] = diely.join();
    noveVyuctovanie["Účtovanie DPH"] = uctovanieDPH.join();
    // doprava
    noveVyuctovanie["Paušál"] = cp.field("Paušál")[0];
    noveVyuctovanie["Sadzba km"] = cp.field("Sadzba km")[0];
    noveVyuctovanie["% zo zákazky"] = cp.field("% zo zákazky");
    vyuctovania.create(noveVyuctovanie);

    var vyuctovanie = vyuctovania.find(cislo)[0];
    zakazka.set("Vyúčtovanie", empty);
    zakazka.link("Vyúčtovanie", vyuctovanie);
    return vyuctovanie;
}

const zakazkaToJson = zakazka => {
    var result = "";
    var f = file("/sdcard/" + zakazka.field("Číslo") + "_file.json");
    var odberatel = zakazka.field("Klient")[0];
    f.writeLine('{"Odberateľ":{');
    f.writeLine('"Nick"' + ':"' + odberatel.field("Nick") + '",');
    f.writeLine('"Meno"' + ':"' + odberatel.field("Meno") + '",');
    f.writeLine('"Priezvisko"' + ':"' + odberatel.field("Priezvisko") + '",');
    f.writeLine('"Titul"' + ':"' + odberatel.field("Titul") + '",');
    f.writeLine('"Ulica"' + ':"' + odberatel.field("Ulica") + '",');
    f.writeLine('"PSČ"' + ':"' + odberatel.field("PSČ") + '",');
    f.writeLine('"Mesto"' + ':"' + odberatel.field("Mesto") + '"},');
    f.writeLine('{"Základné nastavenia":{');
    f.writeLine('"Typ vyúčtovania"' + ':"' + zakazka.field("Typ vyúčtovania") + '",');
    f.writeLine('"+Mechanizácia"' + ':"' + zakazka.field("+Mechanizácia") + '",');
    f.writeLine('"+Materiál"' + ':"' + zakazka.field("+Materiál") + '",');
    f.writeLine('"Počítanie hodinových sadzieb"' + ':"' + zakazka.field("Počítanie hodinových sadzieb") + '",');
    f.writeLine('"Účtovanie dopravy"' + ':"' + zakazka.field("Účtovanie dopravy") + '",');
    f.writeLine('{"Účtovanie DPH":{');
    f.writeLine('"Práce' + ':"' + mclChecked(zakazka.field("Účtovanie DPH"), "Práce") + '",');
    f.writeLine('"Materiál' + ':"' + mclChecked(zakazka.field("Účtovanie DPH"), "Materiál") + '",');
    f.writeLine('"Stroje' + ':"' + mclChecked(zakazka.field("Účtovanie DPH"), "Stroje") + '",');
    f.writeLine('"Doprava' + ':"' + mclChecked(zakazka.field("Účtovanie DPH"), "Doprava") + '"},');
    f.writeLine('},');
    f.writeLine('{"Rekapitulácia vyúčtovania":{');
    f.writeLine('"Celkom (bez DPH)"' + ':"' + zakazka.field("Celkom (bez DPH") + '",');
    f.writeLine('"DPH 20%"' + ':"' + zakazka.field("DPH 20%") + '",');
    f.writeLine('"Cena celkom (s DPH)"' + ':"' + zakazka.field("Cena celkom (s DPH") + '",');
    f.writeLine('"Zaplatená záloha"' + ':"' + zakazka.field("Zaplatená záloha") + '",');
    f.writeLine('"Suma na úhradu"' + ':"' + zakazka.field("Suma na úhradu") + '"},');


    f.writeLine('}');
    f.close();                      // Close & save. Until closed,
    //   the file is still empty
    //var a = f.readLines();
    return result;
}
// End of file: 22.03.2022, 19:24 '{"result":true, "count":42}'