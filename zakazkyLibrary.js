const zakazky = "0.3.66";

const verziaZakazky = () => {
    var result = "";
    var nazov = "zakazkyLibrary";
    result = nazov + " " + zakazky;
    return result;
}

const prepocetZakazky = (zakazka, vyuctovanie) => {
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
    var praceCelkomBezDPH = 0;
    var praceDPH = 0;
    var praceCelkom = 0;
    var txtPrace = "";
    if (vykazyPrac.length > 0) {
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
            // message("Práce celkom bez dph: " + praceCelkomBezDPH);
            //message("Práce bez dph: " + prace[0]);
            praceCelkomBezDPH += prace[0];
            if (vyuctovanie) {
                // nastaviť status výkazov práce na Vyúčtované
                vykazyPrac[vp].link(FIELD_VYUCTOVANIE, vyuctovanie);
                vykazyPrac[vp].set(FIELD_STAV, "Vyúčtované");
                // záapis do vyúčtovania
                vyuctovanie.set(vykazyPrac[vp].field(FIELD_POPIS) + " celkom", praceCelkomBezDPH);
            }
        }
        praceCelkom += praceCelkomBezDPH + praceDPH;
        // globálny súčet
        zakazkaCelkomBezDPH += praceCelkomBezDPH;
        zakazkaDPH += praceDPH;
        zakazkaCelkom += praceCelkom;
        var odpracovanychHodin = spocitatHodinyZevidencie(zakazka);
    } else {
        txtPrace = "...žiadne práce";
    }
    // message("Práce celkom:" + praceCelkom);
    zakazka.set(FIELD_PRACE, praceCelkom);
    zakazka.set("txt práce", txtPrace);
    // náklady
    zakazka.set("Odvod DPH Práce", praceDPH);
    zakazka.set("Mzdy", mzdy);

    // MATERIÁL
    var txtMaterial = "";
    // prepočet výdajok materiálu
    var vydajkyMaterialu = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, W_ZAKAZKA);
    var materialUctovatDPH = mclCheck(uctovanieDPH, W_MATERIAL);
    // prepočet nákladov materiálu
    var nakupMaterialu = 0;
    var odvodDPHMaterial = 0;

    var materialCelkomBezDPH = 0;
    var materialDPH = 0;
    var materialCelkom = 0;
    if (vydajkyMaterialu.length > 0) {
        for (var vm = 0; vm < vydajkyMaterialu.length; vm++) {
            var material = 0;
            material = prepocitatVydajkuMaterialu(vydajkyMaterialu[vm], materialUctovatDPH);
            nakupMaterialu += vydajkyMaterialu[vm].field("Suma v NC bez DPH")
            if (materialUctovatDPH) {
                odvodDPHMaterial += zakazkaMaterialRozdielDPH(vydajkyMaterialu[vm]);
                materialDPH += material[1];
                zakazkaDPH += materialDPH;
                txtMaterial = " s DPH";
            } else {
                txtMaterial = " bez DPH";
            }
            materialCelkomBezDPH += material[0];
            if (vyuctovanie) {
                // nastaviť príznak výdajok materiálu na vyúčtované
                vydajkyMaterialu[vm].link(FIELD_VYUCTOVANIE, vyuctovanie);
                vydajkyMaterialu[vm].set(FIELD_STAV, "Vyúčtované");
                // zápis do vyúčtovania
                vyuctovanie.set(vydajkyMaterialu[vm].field(FIELD_POPIS) + " celkom", materialCelkomBezDPH);
            }
        }
        materialCelkom += materialCelkomBezDPH + materialDPH;
        // globálny súčet
        zakazkaCelkomBezDPH += materialCelkomBezDPH;
        zakazkaDPH += materialDPH;
        zakazkaCelkom += materialCelkom;
    } else {
        txtMaterial = "...žiadny materiál";
    }

    //message("Materiál celkom:" + materialCelkom);
    zakazka.set(FIELD_MATERIAL, materialCelkom);
    zakazka.set("txt materiál", txtMaterial);
    // náklady
    zakazka.set("Nákup materiálu", nakupMaterialu);
    zakazka.set("Odvod DPH Materiál", odvodDPHMaterial);

    // STROJE
    // prepočet výkazov strojov
    var strojeUctovatDPH = mclCheck(uctovanieDPH, "Mechanizácia");
    var vykazyStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, W_ZAKAZKA);
    // prepočet nákladov strojov
    var nakladyStroje = 0; // náklady

    var strojeCelkomBezDPH = 0;
    var strojeDPH = 0;
    var strojeCelkom = 0;
    var txtStroje = "";
    if (vykazyStrojov.length > 0) {
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
            if (vyuctovanie) {
                // nastavenie statusu výkazu na Vyúčtované
                vykazyStrojov[vs].link(FIELD_VYUCTOVANIE, vyuctovanie);
                vykazyStrojov[vs].set(FIELD_STAV, "Vyúčtované");
                // zápis do vyúčtovania
                vyuctovanie.set(vykazyStrojov[vs].field(FIELD_POPIS) + " celkom", strojeCelkomBezDPH);
            }
        }
        strojeCelkom += strojeCelkomBezDPH + strojeDPH;
        zakazkaCelkomBezDPH += strojeCelkomBezDPH;
        zakazkaDPH += strojeDPH;
        zakazkaCelkom += strojeCelkom;
        nakladyStroje = stroje[0] * 0.75;                         // náklady 75%
    } else {
        txtStroje = "...žiadne stroje";
    }
    //message("Stroje celkom:" + strojeCelkom);
    zakazka.set(FIELD_STROJE, strojeCelkom);
    zakazka.set("txt stroje", txtStroje);
    // náklady
    zakazka.set("Odvod DPH Stroje", strojeDPH);
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
        dopravaCelkom += dopravaCelkomBezDPH + dopravaDPH;
        var najazdenyCas = zakazkaCasJazdy(zakazka);
        var najazdeneKm = zakazkaKm(zakazka);
        var pocetJazd = zakazkaPocetJazd(zakazka);

        var mzdyDoprava = najazdenyCas * (mzdy / odpracovanychHodin);   // priemerná mzda za čas strávený v aute
        var nakladyDoprava = dopravaCelkomBezDPH * 0.75;
    } else {
        txtDoprava = "...žiadna doprava";
    }
    // globálny súčet
    zakazkaCelkomBezDPH += dopravaCelkomBezDPH;
    zakazkaDPH += dopravaDPH;
    zakazkaCelkom += dopravaCelkom;

    //message("Doprava celkom:" + dopravaCelkom);
    zakazka.set(FIELD_DOPRAVA, dopravaCelkom);
    zakazka.set("txt doprava", txtDoprava);
    // náklady
    zakazka.set("Počet jázd", pocetJazd);
    zakazka.set("Najazdené km", najazdeneKm);
    zakazka.set("Najazdený čas", najazdenyCas);
    zakazka.set("Mzdy v aute", mzdyDoprava);
    zakazka.set("Náklady vozidlá", nakladyDoprava);
    zakazka.set("Odvod DPH Doprava", dopravaDPH);

    // Message
    message(
        W_PRACE + txtPrace + "\n" +
        W_MATERIAL + txtMaterial + "\n" +
        W_STROJE + txtStroje + "\n" +
        W_DOPRAVA + txtDoprava + "\n"
    );

    // CELKOM
    //zakazkaCelkom = zakazkaCelkomBezDPH + zakazkaDPH;

    var rozpocetSDPH = zakazka.field(FIELD_CENOVA_PONUKA)[0].field("Cena celkom (s DPH)");


    var ineVydavky = zakazkaVydavky(zakazka);
    var zaplatene = zakazkaPrijmy(zakazka);

    var naklady = mzdy
        + mzdyDoprava
        + nakupMaterialu
        + nakladyStroje
        + nakladyDoprava
        + praceDPH
        + odvodDPHMaterial
        + strojeDPH;
    + dopravaDPH

    var sumaNaUhradu = zakazkaCelkom - zaplatene;
    var marza = marzaPercento(zakazkaCelkom, naklady);
    var marzaPoZaplateni = zaplatene > 1 ? marzaPercento(zaplatene, naklady) : 0;
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

    zakazka.set("Iné výdavky", ineVydavky);
    zakazka.set("efektivita", efektivita(marzaPoZaplateni));
    // Náklady
    zakazka.set("Marža", marza);       // TODO zakalkulovať DPH
    zakazka.set("Marža po zaplatení", marzaPoZaplateni);
    zakazka.set("Odpracovaných hodín", odpracovanychHodin);

    zakazka.set("Náklady celkom", naklady);
    message("Zákazka prepočítaná...");
    if (vyuctovanie) {
        
    // NASTAVENIE POLÍ
    // časti vyúčtovania
    noveVyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
    // vyúčtovanie
    noveVyuctovanie.set("Celkom (bez DPH)", zakazkaCelkomBezDPH);
    noveVyuctovanie.set("DPH 20%", zakazkaDPH);
    noveVyuctovanie.set("Cena celkom (s DPH)", zakazkaCelkom);
    noveVyuctovanie.set("Zaplatená záloha", prijmyCelkom);
    noveVyuctovanie.set("Suma na úhradu", zakazkaCelkomBezDPH + zakazkaDPH - prijmyCelkom);
    message("Vyúčtovanie vygenerované...");
    }
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

const zakazkaMaterialRozdielDPH = vykaz => {
    var result = 0;
    var dphNC = vykaz.field("DPH NC");
    var dphPC = vykaz.field("DPH");
    result = dphPC - dphNC;
    if (result < 0) {
        message("chyba v položkách materiálu\nskontrolovať NC a PC v skladových položkách");
        result = 0;
    }
    return result;
};

// const spocitatVydajkyMaterialu = (vydajka, sDPH, sadzbaDPH) => {
//     //message("Výdajka: " + vydajka.field("Popis"))
//     // inicializácia
//     //var sDPH = vydajka.field("s DPH");
//     if (sDPH) { vydajka.set("s DPH", true) }
//     var sumaDPH = 0;
//     var sumaBezDPH = 0;
//     var polozky = vydajka.field(FIELD_MATERIAL);
//     if (polozky) {
//         // presť všetky položky na výdajke a spočitať sumy
//         for (var p = 0; p < polozky.length; p++) {
//             var mnozstvo = polozky[p].attr("dodané množstvo");
//             var cena = polozky[p].attr("cena");
//             var cenaCelkom = mnozstvo * cena;
//             polozky[p].setAttr("cena celkom", cenaCelkom);
//             //var cenaCelkom = mnozstvo * cena;
//             sumaBezDPH += cenaCelkom;
//         }
//     }
//     vydajka.set("Suma bez DPH", sumaBezDPH);
//     if (sDPH) {
//         sumaDPH += sumaBezDPH * sadzbaDPH;
//         vydajka.set("DPH", sumaDPH);
//         vydajka.set("Suma s DPH", sumaBezDPH + sumaDPH);
//     } else {
//         vydajka.set("DPH", null);
//         vydajka.set("Suma s DPH", null);

//     }
//     // message("Suma bez DPH: " + sumaBezDPH);
//     setTlac(vydajka);
//     return sumaBezDPH;
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

const generujVyuctovanie2 = zakazka => {
    // verzia
    //var vyuctovanie = zakazka.field("Vyúčtovanie")[0];
    //if (!vyuctovanie.length>0) {
    var noveVyuctovanie = zakazkaNoveVyuctovanie(zakazka);
    var vKniznica = verziaZakazky();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("GENERUJ VYÚČTOVANIE" + "\n" + vKniznica + "\n" + vKrajinkaLib);
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

const generujVyuctovanie = zakazka => {
    // verzia
    //var vyuctovanie = zakazka.field("Vyúčtovanie")[0];
    //if (!vyuctovanie.length>0) {
    var vKniznica = verziaZakazky();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("GENERUJ VYÚČTOVANIE" + "\n" + vKniznica + "\n" + vKrajinkaLib);
    prepocetZakazky(zakazka);
    var noveVyuctovanie = zakazkaNoveVyuctovanie(zakazka);
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



// End of file: 22.03.2022, 19:24 '{"result":true, "count":42}'