
const prepocetZakazky = (contract) => {
    var vyuctovanie = contract.field(FIELD_VYUCTOVANIE)[0];
    if (!vyuctovanie) {
        message("Zákazka ešte nemá záznam vyúčtovania...\nGenerujem nové vyúčtovanie...");
        vyuctovanie = noveVyuctovanie(contract);
        textVyuctovanie = "vygenerované";
    }
    message("Prepočítavám zákazku...");

    var uctovanieDPH = contract.field(FIELD_UCTOVANIE_DPH);
    var season = contract.field(SEASON);
    if (!season || season == 0) {
        season = contract.field(FIELD_DATUM).getFullYear();
        contract.set(SEASON, season);
    }

    var contractStatus = contract.field("Stav");
    var stavVyuctovania = "Prebieha";
    if (contractStatus == "Ukončená" || contractStatus == "Vyúčtovaná") {
        stavVyuctovania = "Vyúčtované";
        contractStatus = "Vyúčtovaná";
    }

    var txtCelkoveNaklady = "✔....náklady na zákazku celkom";
    var txtVyuctovanieCelkom = "✔....celkové vyúčtovanie zákazky";
    var contractCelkomBezDPH = 0;
    var contractDPH = 0;
    var contractCelkom = 0;

    // PRÁCE
    // prepočet výkazov prác
    // prepočet práce
    var praceUctovatDPH = mclCheck(uctovanieDPH, W_PRACE);
    var vykazyPrac = contract.linksFrom(DB_VYKAZY_PRAC, W_contract)
    // prepočet nákladov práce
    var mzdy = 0;
    var odpracovanychHodin = 0;
    var txtPrace = "✘...žiadne práce";
    var txtMzdy = "✘...žiadne mzdy";
    var txtOdvodDPHPrace = "✘...žiadna DPH za práce";
    var txtOdpracovanychHodin = "✘...žiadne odpracované hodiny";

    // TODO: refaktoring prepočtu miezd (nákladov na práce)
    var praceCelkomBezDPH = 0;
    var praceDPH = 0;
    var praceCelkom = 0;
    if (vykazyPrac.length > 0) {
        for (var vp = 0; vp < vykazyPrac.length; vp++) {
            // message(vykazyPrac.length);
            var prace = [];
            prace = prepocitatVykazPrac(vykazyPrac[vp], praceUctovatDPH);
            if (praceUctovatDPH) {
                praceDPH += prace[1];
                txtPrace = " s DPH";
            } else {
                txtPrace = " bez DPH";
            }
            praceCelkomBezDPH += prace[0];
            if (vyuctovanie) {
                // nastaviť status výkazov práce na Vyúčtované
                vykazyPrac[vp].link(FIELD_VYUCTOVANIE, vyuctovanie);
                vykazyPrac[vp].set(STATUS, stavVyuctovania);
                // záapis do vyúčtovania
                vyuctovanie.set(vykazyPrac[vp].field(FIELD_POPIS) + " celkom", praceCelkomBezDPH);
                // nalinkuj výkazy prác
                typVykazu = vykazyPrac[vp].field("Typ výkazu");
                if (typVykazu == W_HODINOVKA) {
                    nalinkujPraceHZS(vyuctovanie, vykazyPrac[vp]);
                } else if (typVykazu == W_POLOZKY) {
                    nalinkujPrace(vyuctovanie, vykazyPrac[vp]);
                }
            }
        }
        praceCelkom += praceCelkomBezDPH + praceDPH;
        // globálny súčet
        contractCelkomBezDPH += praceCelkomBezDPH;
        contractDPH += praceDPH;
        contractCelkom += praceCelkom;
        odpracovanychHodin = spocitatHodinyZevidencie(contract);
    }
    // message("Práce celkom:" + praceCelkom);
    contract.set(FIELD_PRACE, praceCelkom);
    contract.set("txt práce", txtPrace);
    // náklady
    var mzdy = contractMzdy(contract);

    contract.set("Odvod DPH Práce", praceDPH);
    if (praceDPH > 0) {
        txtOdvodDPHPrace = "✔...odvod DPH za práce";
    }
    contract.set("txt odvod dph práce", txtOdvodDPHPrace);
    contract.set("Mzdy", mzdy);
    if (mzdy > 0) {
        txtMzdy = "✔...mzdy vyplatené počas prác na zákazke";
    }
    contract.set("txt mzdy", txtMzdy);
    contract.set("Odpracovaných hodín", odpracovanychHodin);
    if (odpracovanychHodin > 0) {
        txtOdpracovanychHodin = "✔...pracovné hodiny na zákazke";
    }
    contract.set("txt odpracovaných hodín", txtOdpracovanychHodin);

    // MATERIÁL
    var txtMaterial = "✘...žiadny materiál";
    var txtNakupMaterialu = "✘...žiadny nákup materiálu";
    var txtOdvodDPHMaterial = "✘...žiadny odvod DPH z materiálu";
    // prepočet výdajok materiálu
    var vydajkyMaterialu = contract.linksFrom(DB_VYKAZY_MATERIALU, W_contract);
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
                odvodDPHMaterial += contractMaterialRozdielDPH(vydajkyMaterialu[vm]);
                materialDPH += material[1];
                txtMaterial = " s DPH";
            } else {
                txtMaterial = " bez DPH";
            }
            materialCelkomBezDPH += material[0];
            if (vyuctovanie) {
                // nastaviť príznak výdajok materiálu na vyúčtované

                vydajkyMaterialu[vm].link(FIELD_VYUCTOVANIE, vyuctovanie);
                vydajkyMaterialu[vm].set(STATUS, stavVyuctovania);
                // zápis do vyúčtovania
                vyuctovanie.set(vydajkyMaterialu[vm].field(FIELD_POPIS) + " celkom", materialCelkomBezDPH);
                nalinkujMaterial(vyuctovanie, vydajkyMaterialu[vm]);
            }
        }
        materialCelkom += materialCelkomBezDPH + materialDPH;
        // globálny súčet
        contractCelkomBezDPH += materialCelkomBezDPH;
        contractDPH += materialDPH;
        contractCelkom += materialCelkom;
    }
    //message("Materiál celkom:" + materialCelkom);
    contract.set(FIELD_MATERIAL, materialCelkom);
    contract.set("txt materiál", txtMaterial);
    // náklady
    contract.set("Nákup materiálu", nakupMaterialu);
    if (nakupMaterialu > 0) {
        txtNakupMaterialu = "✔...materiál v nákupných cenách bez DPH";
    }
    contract.set("txt nákup materiálu", txtNakupMaterialu);
    contract.set("Odvod DPH Materiál", odvodDPHMaterial);
    if (odvodDPHMaterial > 0) {
        txtOdvodDPHMaterial = "✔...odvod DPH za nakúpený materiál (rozdiel)";
    }
    contract.set("txt odvod dph materiál", txtOdvodDPHMaterial);

    // STROJE
    // prepočet výkazov strojov

    var strojeUctovatDPH = mclCheck(uctovanieDPH, "Mechanizácia");
    var vykazStrojov = contract.linksFrom(DB_VYKAZY_STROJOV, W_contract)[0];
    var nakladyStroje = 0; // náklady
    var strojeCelkomBezDPH = 0;
    var strojeDPH = 0;
    var strojeCelkom = 0;
    var txtStroje = "✘...žiadne stroje";
    var txtNakladyStroje = "✘...žiadne náklady na stroje";
    var txtOdvodDPHStroje = "✘...žiadna DPH za stroje";
    if (vykazStrojov) {
        var vykazStrojovVyuctovanie = vykazStrojov.field("Vyúčtovanie");
        // prepočet nákladov strojov
        var stroje = [];
        stroje = prepocitatVykazStrojov(vykazStrojov, strojeUctovatDPH);
        if (strojeUctovatDPH) {
            strojeDPH += stroje[1];
            txtStroje = " s DPH";
        } else {
            txtStroje = " bez DPH";
        }
        strojeCelkomBezDPH += stroje[0];
        if (vyuctovanie) {
            // nastavenie statusu výkazu na Vyúčtované
            if (vykazStrojovVyuctovanie.length > 0) {
                for (var l = 0; l < vykazStrojovVyuctovanie.length; l++) {
                    vykazStrojov.unlink("Vyúčtovanie", vykazStrojovVyuctovanie[l]);
                }
            }
            vykazStrojov.link(FIELD_VYUCTOVANIE, vyuctovanie);
            vykazStrojov.set(STATUS, stavVyuctovania);
            // zápis do vyúčtovania
            vyuctovanie.set(vykazStrojov.field(FIELD_POPIS) + " celkom", strojeCelkomBezDPH);
            nalinkujStroje(vyuctovanie, vykazStrojov);

        }

    }
    strojeCelkom += strojeCelkomBezDPH + strojeDPH;
    // náklady stroje
    var koefStroje = libByName(DB_ASSISTENT).find(season)[0].field("Koeficient nákladov prevádzky strojov");
    nakladyStroje = strojeCelkomBezDPH * koefStroje;
    txtNakladyStroje = "✔...náklady na prevádzku strojov (" + koefStroje * 100 + "% z účtovanej sadzby)";                        // náklady 75%
    // globálny súčet
    contractCelkomBezDPH += strojeCelkomBezDPH;
    contractDPH += strojeDPH;
    contractCelkom += strojeCelkom;

    //message("Stroje celkom:" + strojeCelkom);
    contract.set(FIELD_STROJE, strojeCelkom);
    contract.set("txt stroje", txtStroje);
    // náklady
    contract.set("Náklady stroje", nakladyStroje);
    contract.set("txt náklady stroje", txtNakladyStroje);
    contract.set("Odvod DPH Stroje", strojeDPH);
    if (strojeDPH > 0) {
        txtOdvodDPHStroje = "✔...odvod DPH za stroje";
    }
    contract.set("txt odvod dph stroje", txtOdvodDPHStroje);

    // INÉ VÝDAVKY
    var ineVydavky = contractVydavky(contract, true, vyuctovanie);
    if (ineVydavky <= 0) {
        var txtVydavky = "✘...žiadne iné výdavky";
    } else {
        var txtVydavky = "✔...priame výdavky z Pokladne";
    }

    contractCelkomBezDPH += ineVydavky[0];
    contractDPH += ineVydavky[1];
    contractCelkom += ineVydavky[2];
    contract.set("txt iné výdavky", ineVydavky[3]);

    // DOPRAVA
    // prepočítať dopravu
    var txtDoprava = "✘...žiadna doprava";
    var txtPocetJazd = "✘...žiadne jazdy";
    var txtNajazdeneKm = "✘...žiadne najazdené km";
    var txtNajazdenyCas = "✘...žiadny čas v aute";
    var txtMzdyDoprava = "✘...žiadne mzdy v aute";
    var txtNakladyVozidla = "✘...žiadne náklady na vozidlá";
    var txtOdvodDPHDoprava = "✘...žiadna DPH za dopravu";
    var pocetJazd = 0;
    var najazdeneKm = 0;
    var najazdenyCas = 0;
    var nakladyVozidla = 0;
    var dopravaCelkomBezDPH = spocitatDopravu(contract, contractCelkomBezDPH);
    var mzdyDoprava = 0;
    var dopravaDPH = 0;
    var dopravaCelkom = 0;
    if (dopravaCelkomBezDPH > 0) {
        var dopravaUctovatDPH = mclCheck(uctovanieDPH, W_DOPRAVA);
        if (dopravaUctovatDPH) {
            var sadzbaDPH = libByName(DB_ASSISTENT).find(season)[0].field("Základná sadzba DPH") / 100;
            txtDoprava = " s DPH";
            dopravaDPH = dopravaCelkomBezDPH * sadzbaDPH;
        } else {
            txtDoprava = " bez DPH";
        }
        dopravaCelkom += dopravaCelkomBezDPH + dopravaDPH;
        var koefVozidla = libByName(DB_ASSISTENT).find(season)[0].field("Koeficient nákladov prevádzky vozidiel");
        nakladyVozidla = dopravaCelkomBezDPH * koefVozidla;
    }
    // náklady doprava
    najazdenyCas = contractCasJazdy(contract);
    pocetJazd = contractPocetJazd(contract);
    mzdyDoprava = najazdenyCas * (mzdy / odpracovanychHodin);   // priemerná mzda za čas strávený v aute
    najazdeneKm = contractKm(contract);

    // globálny súčet
    contractCelkomBezDPH += dopravaCelkomBezDPH;
    contractDPH += dopravaDPH;
    contractCelkom += dopravaCelkom;
    //message("Doprava celkom:" + dopravaCelkom);
    contract.set(FIELD_DOPRAVA, dopravaCelkom);
    contract.set("txt doprava", txtDoprava);
    // náklady
    contract.set("Počet jázd", pocetJazd);
    if (pocetJazd > 0) {
        txtPocetJazd = "✔...len jazdy tam (výjazd)";
    }
    contract.set("txt počet jázd", txtPocetJazd);

    contract.set("Najazdené km", najazdeneKm);
    // message("najazdené km: " + najazdeneKm);
    if (najazdeneKm > 0) {
        txtNajazdeneKm = "✔...km najazdené v rámci zákazky";
    }
    contract.set("txt najazdené km", txtNajazdeneKm);

    contract.set("Najazdený čas", najazdenyCas);
    if (najazdenyCas > 0) {
        txtNajazdenyCas = "✔...pracovný čas v aute";
    }
    contract.set("txt najazdený čas", txtNajazdenyCas);

    contract.set("Mzdy v aute", mzdyDoprava);
    if (mzdyDoprava > 0) {
        txtMzdyDoprava = "✔...mzdy počas jazdy autom";
    }
    contract.set("txt mzdy v aute", txtMzdyDoprava);

    contract.set("Náklady vozidlá", nakladyVozidla);
    if (nakladyVozidla > 0) {
        txtNakladyVozidla = "✔...náklady na prevádzku vozidiel (" + koefVozidla * 100 + "% z účtovanej sadzby)";                        // náklady 75%
    }
    contract.set("txt náklady vozidlá", txtNakladyVozidla);

    contract.set("Odvod DPH Doprava", dopravaDPH);
    if (dopravaDPH > 0) {
        txtOdvodDPHDoprava = "✔...odvod DPH za dopravu";
    }
    contract.set("txt odvod dph doprava", txtOdvodDPHDoprava);


    // PLATBY
    var zaplatene = contractPrijmy(contract);
    // CELKOM
    var rozpocetSDPH = contract.field(FIELD_CENOVA_PONUKA)[0].field("Cena celkom (s DPH)");

    // Message
    message(
        W_PRACE + " " + txtPrace + "\n" +
        W_MATERIAL + " " + txtMaterial + "\n" +
        W_STROJE + " " + txtStroje + "\n" +
        W_DOPRAVA + " " + txtDoprava + "\n"
    );

    var naklady = mzdy
        + mzdyDoprava
        + nakupMaterialu
        + nakladyStroje
        + nakladyVozidla
        + praceDPH
        + odvodDPHMaterial
        + strojeDPH
        + dopravaDPH
        + ineVydavky;
    if (!naklady) {
        txtCelkoveNaklady = "✘...chyba prepočtu nákladov";
        naklady = 0;
    }
    if (!contractCelkom) {
        txtVyuctovanieCelkom = "✘...chyba prepočtu zákazky";
        contractCelkom = 0;
    }
    contract.set("Náklady celkom", naklady);
    contract.set("txt celkové náklady", txtCelkoveNaklady);
    contract.set("txt vyúčtovanie celkom", txtVyuctovanieCelkom);

    var sumaNaUhradu = contractCelkom - zaplatene;
    var marza = marzaPercento(contractCelkom, naklady);
    var marzaPoZaplateni = zaplatene > 1 ? marzaPercento(zaplatene, naklady) : 0;
    var zisk = contractCelkom - naklady;
    var ziskPoZaplateni = zaplatene - naklady;
    var zostatok = rozpocetSDPH - contractCelkom;

    if (zisk <= 0) {
        contract.set("Zisk", null);
        contract.set("Strata", zisk);
    } else {
        contract.set("Zisk", zisk);
        contract.set("Strata", null);
    }

    if (ziskPoZaplateni <= 0) {
        contract.set("Zisk po zaplatení", null);
        contract.set("Dotácia zákazky", ziskPoZaplateni);
    } else {
        contract.set("Zisk po zaplatení", ziskPoZaplateni);
        contract.set("Dotácia zákazky", null);
    }

    if (zostatok >= 0) {
        contract.set("Zostatok rozpočtu", zostatok);
        contract.set("Prečerpanie rozpočtu", null);
    } else {
        contract.set("Zostatok rozpočtu", null);
        contract.set("Prečerpanie rozpočtu", zostatok);
    }
    // Prepočet zákazky
    contract.set("Rozpočet", rozpocetSDPH);
    contract.set("Zaplatené", zaplatene);
    contract.set("Suma na úhradu", sumaNaUhradu);
    contract.set("Vyúčtovanie celkom", contractCelkom);
    contract.set("Iné výdavky", ineVydavky);
    contract.set("efektivita", efektivita(marzaPoZaplateni));
    // Náklady a marže
    contract.set("Marža", marza);       // TODO zakalkulovať DPH
    contract.set("Marža po zaplatení", marzaPoZaplateni);
    message("Zákazka |" + contract.field("Číslo") + "| bola prepočítaná...");

    // VYÚČTOVANIE
    if (vyuctovanie) {
        var typ = contract.field(FIELD_CENOVA_PONUKA)[0].field("Typ cenovej ponuky");
        // NASTAVENIE POLÍ
        // časti vyúčtovania
        vyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
        // vyúčtovanie
        vyuctovanie.set("Celkom (bez DPH)", contractCelkomBezDPH);
        vyuctovanie.set("DPH 20%", contractDPH);
        vyuctovanie.set("Cena celkom (s DPH)", contractCelkom);
        vyuctovanie.set("Zaplatená záloha", zaplatene);
        vyuctovanie.set("Suma na úhradu", contractCelkom - zaplatene);
        if (typ == W_POLOZKY) {
            var diely = contract.field("Diely zákazky");
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
        } else if (typ == W_HODINOVKA) {
            // ak je typ hodinovka nalinkuje práce, materiál a a stroje do vyúčtovania

        } else {
            message("Neviem aký je typ vyúčtovania (Položky/Hodinovka");
        }

        // doplň adresu klienta do Krycieho listu
        vyuctovanie.set("Odberateľ", pullAddress(vyuctovanie.field("Klient")[0]));
        //contractToJsonHZS(contract);
        message("Vyúčtovane |" + vyuctovanie.field("Číslo") + "| bolo " + textVyuctovanie);
        contract.set(STATUS, contractStatus);
        // stav vyúčtovania

    }
    setBackgroudColor(contract, contract.field(STATUS));
    message("Hotovo...!");
}

const spocitatHodinyZevidencie = contract => {
    var links = contract.linksFrom(DB_EVIDENCIA_PRAC, "Zákazka")
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

const contractMzdy = contract => {
    var links = contract.linksFrom(DB_EVIDENCIA_PRAC, "Zákazka")
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

const contractMaterialDPH = contract => {
    var links = contract.linksFrom(DB_VYKAZY_MATERIALU, "Zákazka");
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

const contractMaterialRozdielDPH = vykaz => {
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

const contractPrijmy = (contract, sDPH) => {
    var links = contract.linksFrom(DB_PKLLADNA, "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Príjem bez DPH") + links[p].field("DPH+"));
    }
    return result;
};

const contractVydavky = (contract, sDPH, vyuctovanie) => {
    var vydavkyLinks = contract.linksFrom(DB_PKLLADNA, "Zákazka")
    var vydavkyBezDPH = 0;
    var vydavkyDPH = 0;
    var vydavkyCelkom = 0;
    var txtVydavky = "";
    var reset = [];
    if (vyuctovanie) {
        vyuctovanie.set("Výdavky", reset);
    }
    if (vydavkyLinks) {
        for (var v = 0; v < vydavkyLinks.length; v++) {
            if (sDPH) {
                vydavkyBezDPH += vydavkyLinks[v].field("Výdavok bez DPH");
                vydavkyDPH += vydavkyLinks[v].field("DPH-");
                txtVydavky = " s DPH";
            } else {
                txtVydavky = " bez DPH";
            }
            if (vyuctovanie) {
                // zápis do vyúčtovania
                vyuctovanie.link("Výdavky", vydavkyLinks[v]);
                setTlac(vydavkyLinks[v]);
                vyuctovanie.field("Výdavky")[v].setAttr("popis", vydavkyLinks[v].field("Popis platby"))
                vyuctovanie.field("Výdavky")[v].setAttr("suma", vydavkyLinks[v].field("Výdavok bez DPH") + vydavkyLinks[v].field("DPH-"))
            }
        }
    }
    vydavkyCelkom = vydavkyBezDPH + vydavkyDPH;
    if (vyuctovanie) {
        // zápis do vyúčtovania
        vyuctovanie.set("Iné výdavky celkom", vydavkyCelkom);
    }
    return [vydavkyBezDPH, vydavkyDPH, vydavkyCelkom, txtVydavky];
};

const efektivita = marza => {
    result = 0;
    var koeficient = 0.6; // 60% marža je top = 10 stars
    result = marza / koeficient;
    return result;
}

const setBackgroudColor = (contract, stav) => {

    switch (stav) {
        case "Vyúčtovaná":
            contract.set("background color", "#B3E5FC")
            break;
        case "Prebieha":
            contract.set("background color", "#F5E9F7")
            break;
        case "Ukončená":
            contract.set("background color", "#EDF7EE")
            break;
        case "Čakajúca":
            contract.set("background color", "#FFF9E6")
            break;
        case "Zaplatená":
            contract.set("background color", "#B3E0DB")
            break;
    }
}
// End of file: 22.03.2022, 19:24 '{"result":true, "count":42}'