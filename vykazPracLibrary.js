function verziaKniznice() {
    var result = "";
    var nazov = "vykazPracLibrary";
    var verzia = "0.2.13";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatVykazPrac = (vykaz, uctovatDPH) => {
    var typ = vykaz.field("Typ výkazu");
    var sumaBezDPH = 0;
    var sumaDPH = null;
    var sumaCelkom = null;
    var CPsumaBezDPH = 0;
    var CPdph = null;
    var CPsumaCelkomSDPH = null;
    if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
    var sDPH = vykaz.field("s DPH");
    message(
        "Výkaz typ: " + typ
        + "\n"
        + (uctovatDPH ? "Účtovanie s DPH" : "Účtovanie bez DPH")
        + "\n"

    );
    if (typ == "Hodinovka") {
        var prace = vykaz.field("Práce sadzby")[0];
        //var polozka = vykaz.field("Práce sadzby")[0];
        var evidenciaLinks = vykaz.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
        var limity = prace.field("Limity");
        var uctovanie = vykaz.field(FIELD_ZAKAZKA)[0].field(FIELD_CENOVA_PONUKA)[0].field("Počítanie hodinových sadzieb");
        // vynulovať rozpis prác
        var empty = [];
        vykaz.set("Rozpis", empty);
        message("prace.length: " + prace.length);
        if (evidenciaLinks.length > 0) {
            message("evidenciaLinks.length: " + evidenciaLinks.length);
            if (uctovanie == "Individuálne za každý výjazd" || diel == "Práce navyše") {
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
                    setTlac(vykaz.field("Rozpis")[el])
                    sumaBezDPH += rVykaz.attr("cena celkom")
                }
                polozka.setAttr("dodané množstvo", hodinyCelkom);
                polozka.setAttr("účtovaná sadzba", null); // len vynuluje attribút
                polozka.setAttr("cena celkom", sumaBezDPH);
            } else {
                for (var el = 0; el < evidenciaLinks.length; el++) {
                    var rVykazy = evidenciaLinks[el].field("Výkaz prác");
                    var index = zistiIndexLinku(vykaz, rVykazy);
                    var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
                    hodinyCelkom += rVykaz.attr("počet hodín") || evidenciaLinks[el].field("Odpracované");
                    vykaz.link("Rozpis", evidenciaLinks[el]);
                    vykaz.field("Rozpis")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
                    vykaz.field("Rozpis")[el].setAttr("počet hodín", null);
                    vykaz.field("Rozpis")[el].setAttr("účtovaná sadzba", null);
                    vykaz.field("Rozpis")[el].setAttr("cena celkom", null);
                    setTlac(vykaz.field("Rozpis")[el]);
                }
                // zistiť zľavu podľa počtu odpracovaných hodín
                var sadzba = vykaz.field(FIELD_CENOVA_PONUKA)[0].field(diel)[0].attr("sadzba");
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
                polozka.setAttr("účtovaná sadzba", sadzba);
                polozka.setAttr("cena celkom", sumaBezDPH);
            }
        } else {
            message("Pre tento výkaz nie sú žiadne záznamy v Evidencii práce");
        }

    } else if (typ == "Položky") {
        var prace = vykaz.field("Práce");
        //var polozka = vykaz.field("Práce")[0];
        for (var p = 0; p < prace.length; p++) {
            var mnozstvo = prace[p].attr("dodané množstvo");
            var cena = prace[p].attr("cena") || prace[p].field("Cena bez DPH");
            cenaCelkom = mnozstvo * cena;
            prace[p].setAttr("cena celkom", cenaCelkom);
            sumaBezDPH += cenaCelkom;

            // message("množstvo:+ " + mnozstvo + ", cena: " + cena + ", cena celkom: " + cenaCelkom);
            // nastav príznak Tlač
            setTlac(prace[p]);
        }
        var attrMJ = "cena";
    } else {
        message("Neurčený typ výkazu (Hodinovka/Položky");
    }
    if (sDPH) {
        var sezona = vykaz.field(FIELD_SEZONA);
        if (!sezona || sezona == 0) {
            sezona = vykaz.field(FIELD_DATUM).getFullYear();
            vykaz.set(FIELD_SEZONA, sezona);
        }
        var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
        sumaDPH = (sumaBezDPH * sadzbaDPH).toFixed(2);
        sumaCelkom = sumaBezDPH + sumaDPH;
        CPdph = CPsumaBezDPH * sadzbaDPH;
        CPsumaCelkomSDPH = CPsumaBezDPH + CPdph;
    }
    vykaz.set("Suma bez DPH", sumaBezDPH);
    vykaz.set("DPH", sumaDPH);
    vykaz.set("Suma s DPH", sumaCelkom);
    setTlac(vykaz);
    return [sumaBezDPH, sumaDPH];
}