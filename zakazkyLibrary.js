const zakazky = "0.3.56";

const verziaZakazky = () => {
    var result = "";
    var nazov = "zakazkyLibrary";
    result = nazov + " " + zakazky;
    return result;
}

const prepocetZakazky = zakazka => {
    var vKniznica = verziaZakazky();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("PREPOČÍTAJ ZÁKAZKU" + "\n" + vKniznica + "\n" + vKrajinkaLib);

    var uctovanieDPH = zakazka.field(FIELD_UCTOVANIE_DPH);
    var sezona = zakazka.field(FIELD_SEZONA);
    if (!sezona || sezona == 0) {
        sezona = zakazka.field(FIELD_DATUM).getFullYear();
        zakazka.set(FIELD_SEZONA, sezona);
    }
    var zakazkaCelkomBezDPH = 0;
    var zakazkaDPH = 0;
    var zakazkaCelkom = 0;

    // PRÁCE
    // prepočet výkazov prác
    // prepočet práce
    var praceUctovatDPH = mclCheck(uctovanieDPH, W_PRACE);
    var vykazyPrac = zakazka.linksFrom(DB_VYKAZY_PRAC, W_ZAKAZKA)
    // prepočet nákladov práce
    var mzdy = 0;

    // TODO: refaktoring prepočtu miezd (nákladov na práce)
    var mzdy = zakazkaMzdy(zakazka);
    if (vykazyPrac.length > 0) {
        var praceCelkomBezDPH = 0;
        var praceDPH = 0;
        var praceCelkom = 0;
        var txtPrace = "";
        for (var vp = 0; vp < vykazyPrac.length; vp++) {
            var prace = [];
            prace = prepocitatVykazPrac(vykazyPrac[vp], praceUctovatDPH);
            if (praceUctovatDPH) {
                praceDPH += prace[1];
                zakazkaDPH += praceDPH;
                txtPrace = " s DPH";
            } else {
                txtPrace = " bez DPH";
            }
            message("Práce celkom bez dph: " + praceCelkomBezDPH);
            message("Práce bez dph: " + prace[0]);
            praceCelkomBezDPH += prace[0];
            praceCelkom += praceCelkomBezDPH + praceDPH;
        }
        // globálny súčet
        zakazkaCelkomBezDPH += praceCelkomBezDPH;
        zakazkaDPH += praceDPH;
        zakazkaCelkom += praceCelkom;
    } else {
        txtPrace = "...žiadne práce";
    }
    message("Práce celkom:" + praceCelkom);
    zakazka.set(FIELD_PRACE, praceCelkom);
    zakazka.set("Odvod DPH Práce", praceDPH);
    zakazka.set("txt práce", txtPrace);
    zakazka.set("Mzdy", mzdy);


    // MATERIÁL
    var txtMaterial = "";
    // prepočet výdajok materiálu
    var vydajkyMaterialu = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, W_ZAKAZKA);
    var materialUctovatDPH = mclCheck(uctovanieDPH, W_MATERIAL);
    // prepočet nákladov materiálu
    var nakupMaterialu = zakazkaNakupMaterialu(zakazka);            // nákup materiálu bez DPH
    var odvodDPHMaterial = zakazkaMaterialRozdielDPH(zakazka);

    if (vydajkyMaterialu.length > 0) {
        var materialCelkomBezDPH = 0;
        var materialDPH = 0;
        var materialCelkom = 0;
        for (var vm = 0; vm < vydajkyMaterialu.length; vm++) {
            var material = 0;
            material = prepocitatVydajkuMaterialu(vydajkyMaterialu[vm], materialUctovatDPH);
            if (materialUctovatDPH) {
                materialDPH += material[1];
                zakazkaDPH += materialDPH;
                txtMaterial = " s DPH";
            } else {
                txtMaterial = " bez DPH";
            }
            materialCelkomBezDPH += material[0];
            materialCelkom += materialCelkomBezDPH + materialDPH;
        }
        // globálny súčet
        zakazkaCelkomBezDPH += materialCelkomBezDPH;
        zakazkaDPH += materialDPH;
        zakazkaCelkom += materialCelkom;
    } else {
        txtMaterial = "...žiadny materiál";
    }

    message("Materiál celkom:" + materialCelkom);
    zakazka.set("txt materiál", txtMaterial);
    zakazka.set(FIELD_MATERIAL, materialCelkom);
    zakazka.set("Nákup materiálu", nakupMaterialu);
    zakazka.set("Odvod DPH Materiál", odvodDPHMaterial);

    // STROJE
    // prepočet výkazov strojov
    var strojeUctovatDPH = mclCheck(uctovanieDPH, "Mechanizácia");
    var vykazyStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, W_ZAKAZKA);
    // prepočet nákladov strojov
    var nakladyStroje = 0; // náklady

    if (vykazyStrojov.length > 0) {
        var strojeCelkomBezDPH = 0;
        var strojeDPH = 0;
        var strojeCelkom = 0;
        var txtStroje = "";
        for (var vs = 0; vs < vykazyStrojov.length; vs++) {
            var stroje = 0;
            stroje = prepocitatVykazStrojov(vykazyStrojov[vs], strojeUctovatDPH);
            if (strojeUctovatDPH) {
                strojeDPH += stroje[1];
                zakazkaDPH += strojeDPH;
                txtStroje = " s DPH";
            } else {
                txtStroje = " bez DPH";
            }
            strojeCelkomBezDPH += stroje[0];
            strojeCelkom += strojeCelkomBezDPH + strojeDPH;
        }
        zakazkaCelkomBezDPH += strojeCelkomBezDPH;
        zakazkaDPH += strojeDPH;
        zakazkaCelkom += strojeCelkom;
        nakladyStroje = stroje[0] * 0.75;                         // náklady 75%
    } else {
        txtStroje = "...žiadne stroje";
    }
    message("Stroje celkom:" + strojeCelkom);
    zakazka.set(FIELD_STROJE, strojeCelkom);
    zakazka.set("Odvod DPH Stroje", strojeDPH);
    zakazka.set("txt stroje", txtStroje);
    zakazka.set("Náklady stroje", nakladyStroje);

    // DOPRAVA
    // prepočítať dopravu
    var dopravaCelkomBezDPH = spocitatDopravu(zakazka, zakazkaCelkomBezDPH);
    if (dopravaCelkomBezDPH > 0) {
        var dopravaUctovatDPH = mclCheck(uctovanieDPH, W_DOPRAVA);
        var dopravaDPH = 0;
        var dopravaCelkom = 0;
        if (dopravaUctovatDPH) {
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
            txtDoprava = " s DPH";
            dopravaDPH = dopravaCelkomBezDPH * sadzbaDPH;
        } else {
            txtDoprava = " bez DPH";
        }
    } else {
        txtDoprava = "...žiadna doprava";
    }
    // globálny súčet
    zakazkaCelkomBezDPH += dopravaCelkomBezDPH;
    zakazkaDPH += dopravaDPH;
    zakazkaCelkom += dopravaCelkom;

    var najazdenyCas = zakazkaCasJazdy(zakazka);
    var najazdeneKm = zakazkaKm(zakazka);
    var pocetJazd = zakazkaPocetJazd(zakazka);

    zakazka.set(FIELD_DOPRAVA, dopravaCelkom);
    zakazka.set("Počet jázd", pocetJazd);
    zakazka.set("Najazdené km", najazdeneKm);
    zakazka.set("Najazdený čas", najazdenyCas);
    zakazka.set("txt doprava", txtDoprava);

    // Message
    message(
        W_PRACE + txtPrace + "\n" +
        W_MATERIAL + txtMaterial + "\n" +
        W_STROJE + txtStroje + "\n" +
        W_DOPRAVA + txtDoprava + "\n"
    );

    // CELKOM
    zakazkaCelkom = zakazkaCelkomBezDPH + zakazkaDPH;

    var rozpocetSDPH = zakazka.field(FIELD_CENOVA_PONUKA)[0].field("Cena celkom (s DPH)");
    // mzdy z evidencie
    var odpracovanychHodin = spocitatHodinyZevidencie(zakazka);                // hodiny z evidencie

    var mzdyDoprava = najazdenyCas * (mzdy / odpracovanychHodin);   // priemerná mzda za čas strávený v aute
    var nakladyDoprava = najazdeneKm * 0.5;                         // náklady 0,50€/km


    var odvodDPHDoprava = dopravaDPH;
    var ineVydavky = zakazkaVydavky(zakazka);
    var zaplatene = zakazkaPrijmy(zakazka);

    var naklady = mzdy
        + praceDPH
        + mzdyDoprava
        + nakupMaterialu
        + odvodDPHMaterial
        + nakladyDoprava
        + odvodDPHDoprava
        + nakladyStroje
        + strojeDPH;

    var sumaNaUhradu = zakazkaCelkomBezDPH + zakazkaDPH - zaplatene;
    var marza = marzaPercento(zakazkaCelkom, naklady);
    var marzaPoZaplateni = zaplatene > 1 ? marzaPercento(zaplatene, naklady) : 0;
    var doprava = dopravaCelkom + odvodDPHDoprava;
    var zisk = zakazkaCelkom - naklady;
    var ziskPoZaplateni = zaplatene - naklady;
    var zostatok = rozpocetSDPH - zakazkaCelkom;


    if (zisk <= 0) {
        zakazka.set("Zisk", null);
        zakazka.set("Strata", zisk);
    } else {
        zakazka.set("Zisk", zisk);
        zakazka.set("Strata", null);
    }

    if (ziskPoZaplateni <= 0) {
        zakazka.set("Zisk po zaplatení", null);
        zakazka.set("Dotácia zákazky", ziskPoZaplateni);
    } else {
        zakazka.set("Zisk po zaplatení", ziskPoZaplateni);
        zakazka.set("Dotácia zákazky", null);
    }

    if (zostatok >= 0) {
        zakazka.set("Zostatok rozpočtu", zostatok);
        zakazka.set("Prečerpanie rozpočtu", null);
    } else {
        zakazka.set("Zostatok rozpočtu", null);
        zakazka.set("Prečerpanie rozpočtu", zostatok);
    }
    // Vyúčtovanie
    zakazka.set("Rozpočet", rozpocetSDPH);
    zakazka.set("Zaplatené", zaplatene);
    zakazka.set("Suma na úhradu", sumaNaUhradu);
    zakazka.set("Vyúčtovanie celkom", zakazkaCelkom);



    zakazka.set(FIELD_DOPRAVA, doprava); // doprava bez dph + dph z dopravy
    zakazka.set("Iné výdavky", ineVydavky);
    zakazka.set("efektivita", efektivita(marzaPoZaplateni));

    // Náklady
    zakazka.set("Marža", marza);       // TODO zakalkulovať DPH
    zakazka.set("Marža po zaplatení", marzaPoZaplateni);
    zakazka.set("Odpracovaných hodín", odpracovanychHodin);


    zakazka.set("Mzdy v aute", mzdyDoprava);
    zakazka.set("Náklady vozidlá", nakladyDoprava);
    zakazka.set("Odvod DPH Doprava", odvodDPHDoprava);

    zakazka.set("Náklady celkom", naklady);

    message("Zákazka prepočítaná...");

}


const spocitatHodinyZevidencie = zakazka => {
    var links = zakazka.linksFrom(DB_EVIDENCIA_PRAC, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += links[p].field("Odpracované");
        };
    } else {
        message("Zákazka nemá záznamy v Evidencii prác");
    }
    return result;
};

const zakazkaMzdy = zakazka => {
    var links = zakazka.linksFrom(DB_EVIDENCIA_PRAC, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += links[p].field("Mzdové náklady");
        };
    } else {
        message("Zákazka nemá záznamy v Evidencii prác");
    }
    return result;
};

const zakazkaNakupMaterialu = zakazka => {
    var links = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, "Zákazka");
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += (links[p].field("Suma v NC bez DPH"));
        };
    } else {
        message("Zákazka nemá záznamy vo Výdajkách materiálu");
    }
    return result;
};

const zakazkaMaterialDPH = zakazka => {
    var links = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, "Zákazka");
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += links[p].field("DPH");
        };
    } else {
        message("Zákazka nemá záznamy v Evidencii prác");
    }
    return result;
};

const zakazkaMaterialRozdielDPH = zakazka => {
    var links = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, "Zákazka");
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

// const zakazkaPraceDPH = zakazka => {
//     var links = zakazka.linksFrom(DB_VYKAZY_PRAC, "Zákazka");
//     var result = 0;
//     for (var p = 0; p < links.length; p++) {
//         result += (links[p].field("DPH"));
//     };
//     return result;
// };



// const prepocitatVykazPraceHzs = (vykaz, sDPH, sadzbaDPH) => {
//     // inicializácia
//     if (sDPH) { vykaz.set("s DPH", true) }
//     var sumaDPH = 0;
//     var sumaBezDPH = 0;
//     var typ = vykaz.field("Typ výkazu");
//     var diel = vykaz.field("Popis");
//     var evidenciaLinks = vykaz.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
//     // vymazať predošlé nalinkované evidencie
//     var empty = [];
//     vykaz.set("Rozpis", empty);

//     var hodinyCelkom = 0;
//     if (typ == W_HODINOVKA) {
//         var polozka = vykaz.field("Práce sadzby")[0];
//         var limity = polozka.field("Limity");
//         var attrMJ = "účtovaná sadzba";
//     }
//     else if (typ == W_POLOZKY) {
//         var polozka = vykaz.field("Práce")[0];
//         var attrMJ = "cena";
//     }
//     // vypočítať aktuálnu sadzbu práce za počet hodín
//     var uctovanie = vykaz.field(FIELD_ZAKAZKA)[0].field(FIELD_CENOVA_PONUKA)[0].field("Počítanie hodinových sadzieb");
//     if (uctovanie == "Individuálne za každý výjazd" || diel == "Práce navyše") {
//         for (var el = 0; el < evidenciaLinks.length; el++) {
//             var rVykazy = evidenciaLinks[el].field("Výkaz prác");
//             // nájde index výkazu v linkToEntry evidencie prác
//             var index = zistiIndexLinku(vykaz, rVykazy);
//             // rVykaz - remote link v evidencii na tento výkaz
//             var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
//             // počet hodín z atribútu alebo celkový počet hodín zo záznamu
//             hodinyCelkom += rVykaz.attr("počet hodín") || evidenciaLinks[el].field("Odpracované");
//             // nalinkuj záznam do evidencie prác
//             vykaz.link("Rozpis", evidenciaLinks[el]);
//             //nastav atribúty nového linku
//             vykaz.field("Rozpis")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
//             vykaz.field("Rozpis")[el].setAttr("počet hodín", rVykaz.attr("počet hodín"));
//             vykaz.field("Rozpis")[el].setAttr(attrMJ, rVykaz.attr("sadzba"));
//             vykaz.field("Rozpis")[el].setAttr("cena celkom", rVykaz.attr("cena celkom"));
//             // nastav príznak výkazu na tlač
//             setTlac(vykaz.field("Rozpis")[el])
//             sumaBezDPH += rVykaz.attr("cena celkom")
//         }
//         polozka.setAttr("dodané množstvo", hodinyCelkom);
//         polozka.setAttr("účtovaná sadzba", null); // len vynuluje attribút
//         polozka.setAttr("cena celkom", sumaBezDPH);
//     } else {
//         for (var el = 0; el < evidenciaLinks.length; el++) {
//             var rVykazy = evidenciaLinks[el].field("Výkaz prác");
//             var index = zistiIndexLinku(vykaz, rVykazy);
//             var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
//             hodinyCelkom += rVykaz.attr("počet hodín") || evidenciaLinks[el].field("Odpracované");
//             vykaz.link("Rozpis", evidenciaLinks[el]);
//             vykaz.field("Rozpis")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
//             vykaz.field("Rozpis")[el].setAttr("počet hodín", null);
//             vykaz.field("Rozpis")[el].setAttr(attrMJ, null);
//             vykaz.field("Rozpis")[el].setAttr("cena celkom", null);
//             vykaz.field("Rozpis")[el].set("Tlač", "Tlač")
//         }
//         // zistiť zľavu podľa počtu odpracovaných hodín
//         var sadzba = vykaz.field(FIELD_CENOVA_PONUKA)[0].field(diel)[0].attr("sadzba");
//         var zlava = null;
//         var zakladnaSadzba = null;
//         if (limity) {
//             zakladnaSadzba = sadzba;
//             for (var m = 0; m < limity.length; m++) {
//                 if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
//                     zlava = limity[m].field("Zľava");
//                 }
//                 // výpočítať novú sadzbu so zľavou
//                 //sadzba = zakladnaSadzba - (zakladnaSadzba * zlava / 100);
//             }
//         }
//         sadzba = sadzba - (sadzba * zlava / 100);
//         // dosadiť výsledky do poľa "Práce" - pri výkazoch práce je len jedno
//         sumaBezDPH = hodinyCelkom * sadzba;
//         polozka.setAttr("dodané množstvo", hodinyCelkom);
//         polozka.setAttr("základná sadzba", zakladnaSadzba);
//         polozka.setAttr("zľava %", zlava);
//         polozka.setAttr(attrMJ, sadzba);
//         polozka.setAttr("cena celkom", sumaBezDPH);
//     }
//     vykaz.set("Suma bez DPH", sumaBezDPH);
//     if (sDPH) {
//         sumaDPH += sumaBezDPH * sadzbaDPH;
//         vykaz.set("DPH", sumaDPH);
//         vykaz.set("Suma s DPH", sumaBezDPH + sumaDPH);
//     } else {
//         vykaz.set("DPH", null);
//         vykaz.set("Suma s DPH", null);
//     }
//     // message("Suma bez DPH: " + sumaBezDPH);
//     setTlac(vykaz);
//     return sumaBezDPH;
// };

// const prepocitatVykazPracePolozky = (vykaz, sDPH, sadzbaDPH) => {
//     // inicializácia
//     //var sDPH = vykaz.field("s DPH");
//     if (sDPH) { vykaz.set("s DPH", true) }
//     var sumaDPH = 0;
//     var sumaBezDPH = 0;
//     var polozky = vykaz.field(FIELD_PRACE);

//     if (polozky) {
//         for (var p = 0; p < polozky.length; p++) {
//             var mnozstvo = polozky[p].attr("dodané množstvo");
//             var cena = polozky[p].attr("cena") || polozky[p].field("Cena bez DPH");
//             cenaCelkom = mnozstvo * cena;
//             polozky[p].setAttr("cena celkom", cenaCelkom);
//             sumaBezDPH += cenaCelkom;
//             // message("množstvo:+ " + mnozstvo + ", cena: " + cena + ", cena celkom: " + cenaCelkom);
//             // nastav príznak Tlač
//             polozky[p].set("Tlač", "Tlač");
//         }
//     }
//     vykaz.set("Suma bez DPH", sumaBezDPH);
//     if (sDPH) {
//         sumaDPH += sumaBezDPH * sadzbaDPH;
//         vykaz.set("DPH", sumaDPH);
//         vykaz.set("Suma s DPH", sumaBezDPH + sumaDPH);
//     } else {
//         vykaz.set("DPH", null);
//         vykaz.set("Suma s DPH", null);

//     }
//     // message("Suma bez DPH: " + sumaBezDPH);
//     vykaz.set("Tlač", "Tlač");
//     return sumaBezDPH;
// };

// const spocitatVykazStrojov = (vykaz, sDPH, sadzbaDPH) => {
//     // inicializácia
//     if (sDPH) { vykaz.set("s DPH", true) }
//     var sumaDPH = 0;
//     var sumaBezDPH = 0;
//     var polozky = vykaz.field(FIELD_STROJE);
//     if (polozky) {
//         // presť všetky položky na výdajke a spočitať sumy
//         for (var p = 0; p < polozky.length; p++) {
//             var mnozstvo = polozky[p].attr("prevádzka mth");
//             var cena = polozky[p].attr("účtovaná sadzba");
//             var cenaCelkom = mnozstvo * cena;
//             polozky[p].setAttr("cena celkom", cenaCelkom);
//             //var cenaCelkom = mnozstvo * cena;
//             sumaBezDPH += cenaCelkom;
//             // nastav príznak Tlač
//             setTlac(polozky[p]);
//         }
//     }
//     vykaz.set("Suma bez DPH", sumaBezDPH);
//     if (sDPH) {
//         sumaDPH += sumaBezDPH * sadzbaDPH;
//         vykaz.set("DPH", sumaDPH);
//         vykaz.set("Suma s DPH", sumaBezDPH + sumaDPH);
//     } else {
//         vykaz.set("DPH", null);
//         vykaz.set("Suma s DPH", null);

//     }
//     // message("Suma bez DPH: " + sumaBezDPH);
//     setTlac(vykaz);
//     return sumaBezDPH;
// };

const spocitatVydajkyMaterialu = (vydajka, sDPH, sadzbaDPH) => {
    //message("Výdajka: " + vydajka.field("Popis"))
    // inicializácia
    //var sDPH = vydajka.field("s DPH");
    if (sDPH) { vydajka.set("s DPH", true) }
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var polozky = vydajka.field(FIELD_MATERIAL);
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
    setTlac(vydajka);
    return sumaBezDPH;
};

// const zakazkaPraceEvidencia = zakazka => {
//     var typ = zakazka.field("Cenová ponuka")[0].field("Typ cenovej ponuky");
//     if (typ == "Položky") {
//         message("spočítavám položky");
//         // prejde výkazy práce
//         var vykazy = zakazka.linksFrom(DB_VYKAZY_PRAC, "Zákazka");
//         for (var v = 0; v < vykazy.length; v++) {
//         }

//     } else if (typ == "Hodinovka") {
//         message("spočítavám hodiny");
//         // prejde výkazy práce
//         var vykazy = zakazka.linksFrom(DB_VYKAZY_PRAC, "Zákazka");
//         for (var v = 0; v < vykazy.length; v++) {
//         }
//     } else {
//         message("ad-hoc ešte nefunguje");
//     }
// };

const zakazkaPrijmy = (zakazka, sDPH) => {
    var links = zakazka.linksFrom(DB_POKLADNA, "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Príjem bez DPH") + links[p].field("DPH+"));
    }
    return result;
};

const zakazkaVydavky = (zakazka, sDPH) => {
    var links = zakazka.linksFrom(DB_POKLADNA, "Zákazka")
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

// Generuj vyúčtovanie

const generujVyuctovanie = zakazka => {
    // verzia
    //var vyuctovanie = zakazka.field("Vyúčtovanie")[0];
    //if (!vyuctovanie.length>0) {
    var noveVyuctovanie = zakazkaNoveVyuctovanie(zakazka);
    var vKniznica = verziaZakazky();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("GENERUJ VYÚČTOVANIE" + "\nv." + vKniznica + "\nv." + vKrajinkaLib);
    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var typCP = cp.field("Typ cenovej ponuky");
    var uctovanieDPH = zakazka.field("Účtovanie DPH");
    // inicializácia
    var sezona = noveVyuctovanie.field(FIELD_SEZONA);
    var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
    var zakazkaDPH = 0;
    var zakazkaCelkom = 0;
    var zakazkaCelkomBezDPH = 0;

    if (typCP == W_HODINOVKA) {
        var diely = cp.field("Diely cenovej ponuky hzs")
    } else if (typCP == "Položky") {
        var diely = cp.field("Diely cenovej ponuky")
    } else {

    }
    // PRÁCE
    // prepočet výkazov prác
    var vykazyPrac = zakazka.linksFrom(DB_VYKAZY_PRAC, W_ZAKAZKA);
    if (vykazyPrac.length > 0) {
        var praceCelkomBezDPH = 0;
        var praceDPH = 0;
        var praceUctovatDPH = mclCheck(uctovanieDPH, W_PRACE);
        for (var vp = 0; vp < vykazyPrac.length; vp++) {
            var typ = vykazyPrac[vp].field("Typ výkazu");
            if (typ == W_HODINOVKA || vykazyPrac[vp].field(FIELD_POPIS) == W_PRACE_NAVYSE) {
                praceCelkomBezDPH += prepocitatVykazPraceHzs(vykazyPrac[vp], praceUctovatDPH, sadzbaDPH);
            } else if (typ == W_POLOZKY) {
                praceCelkomBezDPH += prepocitatVykazPracePolozky(vykazyPrac[vp], praceUctovatDPH, sadzbaDPH);
            } else {
                message("Zle zadaný typ výkazu prác");
            }
            vykazyPrac[vp].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
            vydajkyMaterialu[vm].set(FIELD_STAV, "Vyúčtované");

            noveVyuctovanie.set(vykazyPrac[vp].field(FIELD_POPIS) + " celkom", praceCelkomBezDPH);

            // zápis do vyúčtovania
            if (praceUctovatDPH) {
                txtPrace = "s DPH";
                praceDPH += vykazyPrac[vp].field("DPH");
                zakazkaDPH += praceDPH;
            } else {
                txtPrace = "bez DPH";
            }
        }
        zakazkaCelkomBezDPH += praceCelkomBezDPH;
    } else {
        txtPrace = "...žiadne práce";
    }
    zakazka.set("txt práce", txtPrace);

    // MATERIÁL
    // prepočet výdajok materiálu
    var vydajkyMaterialu = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, "Zákazka");
    if (vydajkyMaterialu.length > 0) {
        var materialUctovatDPH = mclCheck(uctovanieDPH, "Materiál");
        var materialCelkomBezDPH = 0;
        var materialDPH = 0;
        for (var vm = 0; vm < vydajkyMaterialu.length; vm++) {
            materialCelkomBezDPH += spocitatVydajkyMaterialu(vydajkyMaterialu[vm], materialUctovatDPH, sadzbaDPH);
            vydajkyMaterialu[vm].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
            vydajkyMaterialu[vm].set(FIELD_STAV, "Vyúčtované");

            // zápis do vyúčtovania
            noveVyuctovanie.set(vydajkyMaterialu[vm].field(FIELD_POPIS) + " celkom", materialCelkomBezDPH);
            if (materialUctovatDPH) {
                txtMaterial = "s DPH";
                materialDPH += vydajkyMaterialu[vm].field("DPH");
                zakazkaDPH += materialDPH;
            } else {
                txtMaterial = "bez DPH";
            }
            zakazkaCelkomBezDPH += materialCelkomBezDPH;
        }
    } else {
        txtMaterial = "...žiadny materiál";
    }
    zakazka.set("txt materiál", txtMaterial);

    // STROJE
    // prepočet výkazu strojov
    var vykazStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, "Zákazka");
    if (vykazStrojov.length > 0) {
        var strojeUctovatDPH = mclCheck(uctovanieDPH, "Mechanizácia");
        var strojeCelkomBezDPH = 0;
        var strojeDPH = 0;
        for (var vs = 0; vs < vykazStrojov.length; vs++) {

            // strojeCelkomBezDPH += spocitatVykazStrojov(vykazStrojov[vs], strojeUctovatDPH, sadzbaDPH);
            strojeCelkomBezDPH += prepocitatVykazStrojov(vykazStrojov[vs], strojeUctovatDPH);
            vykazStrojov[vs].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
            vykazStrojov[vs].set(FIELD_STAV, "Vyúčtované");
            // zápis do vyúčtovania
            noveVyuctovanie.set(vykazStrojov[vs].field(FIELD_POPIS) + " celkom", strojeCelkomBezDPH);
            if (strojeUctovatDPH) {
                txtStroje = "s DPH";
                strojeDPH += vykazStrojov[vs].field("DPH");
                zakazkaDPH += strojeDPH;
            } else {
                txtStroje = "bez DPH";
            }
        }
        zakazkaCelkomBezDPH += strojeCelkomBezDPH;
    } else {
        txtStroje = "...žiadne stroje";
    }
    zakazka.set("txt stroje", txtStroje);

    // DOPRAVA
    // prepočítať dopravu
    var dopravaUctovatDPH = mclCheck(uctovanieDPH, "Doprava");;
    var dopravaCelkomBezDPH = spocitatDopravu(zakazka, zakazkaCelkomBezDPH);
    var dopravaDPH = 0;
    if (dopravaCelkomBezDPH >= 0) {
        if (dopravaUctovatDPH) {
            txtDoprava = " s DPH";
            dopravaDPH = dopravaCelkomBezDPH * sadzbaDPH;
            zakazkaDPH += dopravaDPH;
        } else {
            txtDoprava = " bez DPH";
        }
    } else {
        txtDoprava = " žiadna doprava";
    }
    zakazka.set("txt doprava", txtDoprava);
    zakazkaCelkomBezDPH += dopravaCelkomBezDPH;

    // Message
    message(
        "Práce: " + txtPrace + "\n" +
        "Materiál: " + txtMaterial + "\n" +
        "Stroje: " + txtStroje + "\n" +
        "Doprava: " + txtDoprava + "\n"
    );

    // PLATBY
    var vydavkySDPH = uctovanieDPH.filter(cast => cast === "Iné výdavky");
    var prijmyCelkom = zakazkaPrijmy(zakazka);
    var vydavkyCelkom = zakazkaVydavky(zakazka, vydavkySDPH);

    // súčet vyúčtovania
    zakazkaCelkom = zakazkaCelkomBezDPH + zakazkaDPH;

    // NASTAVENIE POLÍ
    // časti vyúčtovania
    noveVyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
    // vyúčtovanie
    noveVyuctovanie.set("Celkom (bez DPH)", zakazkaCelkomBezDPH);
    noveVyuctovanie.set("DPH 20%", zakazkaDPH);
    noveVyuctovanie.set("Cena celkom (s DPH)", zakazkaCelkom);
    noveVyuctovanie.set("Zaplatená záloha", prijmyCelkom);
    noveVyuctovanie.set("Suma na úhradu", zakazkaCelkomBezDPH + zakazkaDPH - prijmyCelkom);

    // texty

    // pridané - treba skotnrolovať a refaktoring
    // kopírovanie položiek bez prepočtu výdajok a výkazov

    // iba ak typ je Položky
    // nalinkuje jednotlivé položky z výkazov do vyúčtovania
    if (typCP == W_POLOZKY) {
        // nalinkuj výdajky materiálu
        for (var v = 0; v < vydajkyMaterialu.length; v++) {
            nalinkujMaterial(noveVyuctovanie, vydajkyMaterialu[v]);
        }
        // nalinkuj výkazy prác
        for (var v = 0; v < vykazyPrac.length; v++) {
            nalinkujPrace(noveVyuctovanie, vykazyPrac[v]);
        }
        // prepočítať diely
        for (var d in diely) {
            var sucetDielov = 0;

            sucetDielov += noveVyuctovanie.field(diely[d] + " materiál celkom")
            sucetDielov += noveVyuctovanie.field(diely[d] + " práce celkom")
            if (diely[d] == "Výsadby") {
                sucetDielov += noveVyuctovanie.field("Rastliny celkom")
            }
            noveVyuctovanie.set(diely[d] + " celkom", sucetDielov);
        }
    } else if (typCP == W_HODINOVKA) {
        // ak je typ hodinovka nalinkuje práce, materiál a a stroje do vyúčtovania
        for (var v = 0; v < vydajkyMaterialu.length; v++) {
            nalinkujMaterial(noveVyuctovanie, vydajkyMaterialu[v]);
        }
        // nalinkuj výkazy prác
        for (var v = 0; v < vykazyPrac.length; v++) {
            if (typ == W_POLOZKY) {
                nalinkujPrace(noveVyuctovanie, vykazyPrac[v]);
            } else {
                nalinkujPraceHZS(noveVyuctovanie, vykazyPrac[v]);
            }
        }
        // nalinkuj výkazy strojov
        for (var v = 0; v < vykazStrojov.length; v++) {
            nalinkujStroje(noveVyuctovanie, vykazStrojov[v]);
        }
    } else {
        message("Neviem aký je typ vyúčtovania (Položky/Hodinovka");
    }

    // doplň adresu klienta do Krycieho listu
    noveVyuctovanie.set("Odberateľ", pullAddress(noveVyuctovanie.field("Klient")[0]));
    //zakazkaToJsonHZS(zakazka);
    message("Hotovo...!");
    message("Bolo vygenerované vyúčtovane č.: " + noveVyuctovanie.field("Číslo"));
    // } else {
    //     message("Zákazka už má vyúčtovanie č." + noveVyuctovanie.field("Číslo"));
    // }
    // End of file: 11.03.2022, 11:27
}

const zakazkaNoveVyuctovanie = zakazka => {
    var vyuctovania = libByName(DB_VYUCTOVANIA);
    var noveVyuctovanie = new Object();
    // inicializácia
    var datum = new Date();
    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var sezona = cp.field(FIELD_SEZONA);
    var cislo = noveCislo(sezona, DB_VYUCTOVANIA, 1, 2);
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
    var popisVyuctovania = "Vyúčtovanie zákazky č." + zakazka.field(FIELD_CISLO) + " (" + cp.field("Popis cenovej ponuky") + ")";

    // Hlavička a základné nastavenia
    noveVyuctovanie["Dátum"] = datum;
    noveVyuctovanie[FIELD_CISLO] = cislo;
    noveVyuctovanie["Miesto realizácie"] = miesto;
    noveVyuctovanie["Stav vyúčtovania"] = "Prebieha";
    noveVyuctovanie["Typ vyúčtovania"] = typ;
    noveVyuctovanie["+Materiál"] = cp.field("+Materiál");
    noveVyuctovanie["+Mechanizácia"] = cp.field("+Mechanizácia");
    noveVyuctovanie["+Subdodávky"] = cp.field("+Subdodávky");
    noveVyuctovanie["Účtovanie dopravy"] = cp.field("Účtovanie dopravy");
    noveVyuctovanie["Klient"] = klient;
    noveVyuctovanie["Popis vyúčtovania"] = popisVyuctovania;
    noveVyuctovanie[FIELD_CENOVA_PONUKA] = cp;
    noveVyuctovanie[FIELD_ZAKAZKA] = zakazka;
    noveVyuctovanie[FIELD_SEZONA] = sezona;
    noveVyuctovanie["Diely vyúčtovania"] = diely.join();
    noveVyuctovanie["Účtovanie DPH"] = uctovanieDPH.join();
    // doprava
    noveVyuctovanie["Paušál"] = cp.field("Paušál")[0];
    noveVyuctovanie["Sadzba km"] = cp.field("Sadzba km")[0];
    noveVyuctovanie["% zo zákazky"] = cp.field("% zo zákazky");
    vyuctovania.create(noveVyuctovanie);

    var vyuctovanie = vyuctovania.find(cislo)[0];
    zakazka.set(FIELD_VYUCTOVANIE, empty);
    zakazka.link(FIELD_VYUCTOVANIE, vyuctovanie);
    return vyuctovanie;
}
// nalinkuj tovar z výdajok do vyúčtovanie / POLOŽKY -- bez prepočtu
const nalinkujMaterial = (vyuctovanie, vydajka) => {
    var vydajkaCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vydajka.field(FIELD_POPIS);
    vyuctovanie.set(popis, empty);
    // položky z výdajky do array
    var polozkyVydajka = vydajka.field(FIELD_MATERIAL);
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
        setTlac(polozkyVydajka[m]);
    }
    vyuctovanie.set(popis + " celkom", vydajkaCelkom);
    return vydajkaCelkom;
}

// nalinkuj tovar z výdajok do vyúčtovanie / POLOŽKY
// const nalinkujPrace = (vyuctovanie, vykazPrac) => {
//     vykazPracCelkom = 0;
//     // najprv vymaž staré
//     var empty = [];
//     var popis = vykazPrac.field(FIELD_POPIS);
//     vyuctovanie.set(popis, empty);
//     vyuctovanie.set(popis + " celkom", empty);
//     // práce navyše ošetriť inak
//     if (popis != "Práce navyše") {
//         // položky z výdajky do array
//         var polozkyVykazPrac = vykazPrac.field(FIELD_PRACE);
//         for (var m = 0; m < polozkyVykazPrac.length; m++) {
//             var mnozstvo = polozkyVykazPrac[m].attr("dodané množstvo");
//             var cena = polozkyVykazPrac[m].attr("cena");
//             var cenaCelkom = polozkyVykazPrac[m].attr("cena celkom");
//             vyuctovanie.link(popis, polozkyVykazPrac[m])
//             vyuctovanie.field(popis)[m].setAttr("množstvo", mnozstvo);
//             vyuctovanie.field(popis)[m].setAttr("cena", cena);
//             vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
//             vykazPracCelkom += cenaCelkom;
//             // nastav príznak Tlač
//             setTlac(polozkyVykazPrac[m]);
//         }
//     } else {
//         // práce navyše
//         var praceNavyse = vykazPrac.field("Práce sadzby")[0];
//         var hodinCelkom = 0;
//         var uctovanaSadzba = vykazPrac.field(FIELD_CENOVA_PONUKA)[0].field(popis)[0].attr("sadzba");
//         var cenaCelkom = 0;
//         vyuctovanie.link(popis, praceNavyse);
//         var evidenciaLinks = vykazPrac.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
//         for (var e = 0; e < evidenciaLinks.length; e++) {
//             vyuctovanie.link("Rozpis", evidenciaLinks[e]);
//             vyuctovanie.field("Rozpis")[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
//             vyuctovanie.field("Rozpis")[e].setAttr("počet hodín", evidenciaLinks[e].attr("počet hodín"));
//             hodinCelkom += evidenciaLinks[e].attr("počet hodín");
//         }
//         cenaCelkom = hodinCelkom * uctovanaSadzba;
//         vyuctovanie.field(popis)[0].setAttr("cena celkom", cenaCelkom);

//     }
//     vyuctovanie.set(popis + " celkom", vykazPracCelkom);
//     return vykazPracCelkom;
// }

// const nalinkujPraceHZS = (vyuctovanie, vykazPrac) => {
//     vykazPracCelkom = 0;
//     // najprv vymaž staré
//     var pocitanieHodinovychSadzieb = vykazPrac.field(FIELD_CENOVA_PONUKA)[0].field("Počítanie hodinových sadzieb");
//     var empty = [];
//     var popis = vykazPrac.field(FIELD_POPIS);
//     vyuctovanie.set(popis, empty);
//     vyuctovanie.set(popis + " celkom", empty);
//     var vykazPraceSadzby = vykazPrac.field("Práce sadzby")[0];
//     var vykazPraceSadzbyCelkom = 0;
//     var cenaCelkom = 0;
//     var hodinCelkom = 0;
//     var uctovanaSadzba = 0;
//     vyuctovanie.link(popis, vykazPraceSadzby);
//     var evidenciaLinks = vykazPrac.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
//     if (pocitanieHodinovychSadzieb == "Za celú zákazku") {
//         var zlava = vykazPraceSadzby.attr("zľava %");
//         var zakladnaSadzba = vykazPraceSadzby.attr("základná sadzba");
//         var uctovanaSadzba = vykazPraceSadzby.attr("účtovaná sadzba");
//         vyuctovanie.field(popis)[0].setAttr("počet hodín", vykazPraceSadzby.attr("dodané množstvo"));
//         if (!zlava) {
//             vyuctovanie.field(popis)[0].setAttr("základná sadzba", zakladnaSadzba);
//             uctovanaSadzba = zakladnaSadzba;
//             zakladnaSadzba = null;
//         } else {
//             zlava = "zľava " + zlava + "%";
//         }
//         vyuctovanie.field(popis)[0].setAttr("základná sadzba", zakladnaSadzba);
//         vyuctovanie.field(popis)[0].setAttr("zľava", zlava);
//         vyuctovanie.field(popis)[0].setAttr("účtovaná sadzba", uctovanaSadzba);
//         vyuctovanie.field(popis)[0].setAttr("cena celkom", vykazPraceSadzby.attr("cena celkom"));
//         hodinCelkom += vykazPraceSadzby.attr("dodané množstvo");
//         uctovanaSadzba = vykazPraceSadzby.attr("účtovaná sadzba");
//         // nastav príznak Tlač
//         setTlac(vyuctovanie);
//         for (var e = 0; e < evidenciaLinks.length; e++) {
//             vyuctovanie.link("Rozpis " + popis, evidenciaLinks[e]);
//             vyuctovanie.field("Rozpis " + popis)[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
//             cenaCelkom = hodinCelkom * uctovanaSadzba;
//             // nastav príznak Tlač
//             setTlac(evidenciaLinks[e])
//         }
//         vykazPracCelkom += cenaCelkom;
//     } else if (pocitanieHodinovychSadzieb == "Individuálne za každý výjazd") {

//         vyuctovanie.field(popis)[0].setAttr("počet hodín", vykazPraceSadzby.attr("dodané množstvo"));
//         vyuctovanie.field(popis)[0].setAttr("cena celkom", vykazPraceSadzby.attr("cena celkom"));
//         for (var e = 0; e < evidenciaLinks.length; e++) {
//             vyuctovanie.field("Rozpis " + popis)[e].setAttr("zľava", evidenciaLinks[e].attr("zľava"));
//             vyuctovanie.link("Rozpis " + popis, evidenciaLinks[e]);
//             vyuctovanie.field("Rozpis " + popis)[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
//             vyuctovanie.field("Rozpis " + popis)[e].setAttr("cena celkom", evidenciaLinks[e].attr("cena celkom"));
//             vyuctovanie.field(popis)[0].setAttr("cena celkom", cenaCelkom);
//             cenaCelkom = hodinCelkom * uctovanaSadzba;
//             // nastav príznak Tlač
//             setTlac(evidenciaLinks[e]);
//         }
//     } else {
//         message("Neviem určiť počítanie hodinových sadzieb")
//     }

//     vyuctovanie.set(popis + " celkom", vykazPracCelkom);
//     return vykazPracCelkom;
// }

const nalinkujStroje = (vyuctovanie, vykazStrojov) => {
    var vykazStrojovCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vykazStrojov.field(FIELD_POPIS);
    vyuctovanie.set(popis, empty);

    var polozkyVykaz = vykazStrojov.field(FIELD_STROJE);
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
        setTlac(polozkyVykaz[m]);
    }
    vyuctovanie.set(popis + " celkom", vykazStrojovCelkom);

    return vykazStrojovCelkom;
}


// TODO json export
const zakazkaToJsonHZS = zakazka => {
    var result = "";
    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var vyuctovanie = zakazka.field(FIELD_VYUCTOVANIE)[0];
    var f = file("/sdcard/" + zakazka.field(FIELD_CISLO) + "_file.json");
    var odberatel = zakazka.field("Klient")[0];
    f.writeLine('{"Odberateľ":{');
    f.writeLine('"Nick"' + ':"' + odberatel.field("Nick") + '",');
    f.writeLine('"Meno"' + ':"' + odberatel.field("Meno") + '",');
    f.writeLine('"Priezvisko"' + ':"' + odberatel.field("Priezvisko") + '",');
    f.writeLine('"Titul"' + ':"' + odberatel.field("Titul") + '",');
    f.writeLine('"Ulica"' + ':"' + odberatel.field("Ulica") + '",');
    f.writeLine('"PSČ"' + ':"' + odberatel.field("PSČ") + '",');
    f.writeLine('"Mesto"' + ':"' + odberatel.field("Mesto") + '"},');
    f.writeLine('"Základné nastavenia":{');
    f.writeLine('"Typ vyúčtovania"' + ':"' + zakazka.field("Účtovanie zákazky") + '",');
    f.writeLine('"+Mechanizácia"' + ':' + cp.field("+Mechanizácia") + ',');
    f.writeLine('"+Materiál"' + ':' + cp.field("+Materiál") + ',');
    f.writeLine('"Počítanie hodinových sadzieb"' + ':"' + cp.field("Počítanie hodinových sadzieb") + '",');
    f.writeLine('"Účtovanie dopravy"' + ':"' + cp.field("Účtovanie dopravy") + '",');
    f.writeLine('"Cenová ponuka"' + ':"' + cp.title + '",');
    f.writeLine('"Účtovanie DPH":{');
    f.writeLine('"Práce"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Práce") + ',');
    f.writeLine('"Materiál"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Materiál") + ',');
    f.writeLine('"Stroje"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Mechanizácia") + ',');
    f.writeLine('"Doprava"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Doprava") + '}');
    f.writeLine('},');
    f.writeLine('"Rekapitulácia vyúčtovania":{');
    f.writeLine('"Celkom (bez DPH)"' + ':' + vyuctovanie.field("Celkom (bez DPH)") + ',');
    f.writeLine('"DPH 20%"' + ':' + vyuctovanie.field("DPH 20%") + ',');
    f.writeLine('"Cena celkom (s DPH)"' + ':' + vyuctovanie.field("Cena celkom (s DPH)") + ',');
    f.writeLine('"Zaplatená záloha"' + ':' + vyuctovanie.field("Zaplatená záloha") + ',');
    f.writeLine('"Suma na úhradu"' + ':' + vyuctovanie.field("Suma na úhradu") + '},');
    f.writeLine('"Rozpis prác":{');
    f.writeLine('"' + vyuctovanie.field("Záhradnícke práce")[0].title + '":{');
    f.writeLine('"počet hodín"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("počet hodín") + ',');
    f.writeLine('"základná sadzba"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("základná sadzba") + ',');
    f.writeLine('"zľava"' + ':"' + vyuctovanie.field("Záhradnícke práce")[0].attr("zľava") + '",');
    f.writeLine('"účtovaná sadzba"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("účtovaná sadzba") + ',');
    f.writeLine('"cena celkom"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("cena celkom") + '}');
    f.writeLine('}}');
    f.close();                      // Close & save. Until closed,
    //   the file is still empty
    //var a = f.readLines();
    return result;
}
// End of file: 22.03.2022, 19:24 '{"result":true, "count":42}'