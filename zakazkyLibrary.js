const zakazky = "0.3.68";

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
    // Náklady a marže
    zakazka.set("Marža", marza);       // TODO zakalkulovať DPH
    zakazka.set("Marža po zaplatení", marzaPoZaplateni);
    zakazka.set("Odpracovaných hodín", odpracovanychHodin);
    zakazka.set("Náklady celkom", naklady);
    message("Zákazka prepočítaná...");

    // VYÚČTOVANIE
    if (vyuctovanie) {
        var typCP = zakazka.field(FIELD_CENOVA_PONUKA)[0].field("Typ cenovej ponuky");
        // NASTAVENIE POLÍ
        // časti vyúčtovania
        vyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
        // vyúčtovanie
        vyuctovanie.set("Celkom (bez DPH)", zakazkaCelkomBezDPH);
        vyuctovanie.set("DPH 20%", zakazkaDPH);
        vyuctovanie.set("Cena celkom (s DPH)", zakazkaCelkom);
        vyuctovanie.set("Zaplatená záloha", zaplatene);
        vyuctovanie.set("Suma na úhradu", zakazkaCelkomBezDPH + zakazkaDPH - zaplatene);
        if (typCP == W_POLOZKY) {
            // nalinkuj výdajky materiálu
            for (var v = 0; v < vydajkyMaterialu.length; v++) {
                nalinkujMaterial(vyuctovanie, vydajkyMaterialu[v]);
            }
            // nalinkuj výkazy prác
            for (var v = 0; v < vykazyPrac.length; v++) {
                nalinkujPrace(vyuctovanie, vykazyPrac[v]);
            }
            // prepočítať diely
            for (var d in diely) {
                var sucetDielov = 0;

                sucetDielov += vyuctovanie.field(diely[d] + " materiál celkom")
                sucetDielov += vyuctovanie.field(diely[d] + " práce celkom")
                if (diely[d] == "Výsadby") {
                    sucetDielov += vyuctovanie.field("Rastliny celkom")
                }
                vyuctovanie.set(diely[d] + " celkom", sucetDielov);
            }
        } else if (typCP == W_HODINOVKA) {
            // ak je typ hodinovka nalinkuje práce, materiál a a stroje do vyúčtovania
            for (var v = 0; v < vydajkyMaterialu.length; v++) {
                nalinkujMaterial(vyuctovanie, vydajkyMaterialu[v]);
            }
            // nalinkuj výkazy prác
            for (var v = 0; v < vykazyPrac.length; v++) {
                if (typ == W_POLOZKY) {
                    nalinkujPrace(vyuctovanie, vykazyPrac[v]);
                } else {
                    nalinkujPraceHZS(vyuctovanie, vykazyPrac[v]);
                }
            }
            // nalinkuj výkazy strojov
            for (var v = 0; v < vykazStrojov.length; v++) {
                nalinkujStroje(vyuctovanie, vykazStrojov[v]);
            }
        } else {
            message("Neviem aký je typ vyúčtovania (Položky/Hodinovka");
        }

        // doplň adresu klienta do Krycieho listu
        vyuctovanie.set("Odberateľ", pullAddress(vyuctovanie.field("Klient")[0]));
        //zakazkaToJsonHZS(zakazka);
        message("Hotovo...!");
        message("Bolo vygenerované vyúčtovane č.: " + vyuctovanie.field("Číslo"));
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





// End of file: 22.03.2022, 19:24 '{"result":true, "count":42}'