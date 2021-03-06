const zakazky = "0.4.28";

const verziaZakazky = () => {
    var result = "";
    var nazov = "zakazkyLibrary";
    result = nazov + " " + zakazky;
    return result;
}

var textVyuctovanie = "prepočítané";
const prepocetZakazky = (zakazka) => {
    var vyuctovanie = zakazka.field(FIELD_VYUCTOVANIE)[0];
    if (!vyuctovanie) {
        message("Zákazka ešte nemá záznam vyúčtovania...\nGenerujem nové vyúčtovanie...");
        vyuctovanie = noveVyuctovanie(zakazka);
        textVyuctovanie = "vygenerované";
    }
    var vZakazky = verziaZakazky();
    var vVyuctovania = verziaVyuctovania();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("Prepočítavám zákazku..." + "\n" + vZakazky + "\n" + vVyuctovania + "\n" + vKrajinkaLib);

    var uctovanieDPH = zakazka.field(FIELD_UCTOVANIE_DPH);
    var sezona = zakazka.field(FIELD_SEZONA);
    if (!sezona || sezona == 0) {
        sezona = zakazka.field(FIELD_DATUM).getFullYear();
        zakazka.set(FIELD_SEZONA, sezona);
    }

    var stavZakazky = zakazka.field("Stav");
    var stavVyuctovania = "Prebieha";
    if (stavZakazky == "Ukončená" || stavZakazky == "Vyúčtovaná") {
        stavVyuctovania = "Vyúčtované";
        stavZakazky = "Vyúčtovaná";
    }

    var txtCelkoveNaklady = "✔....náklady na zákazku celkom";
    var txtVyuctovanieCelkom = "✔....celkové vyúčtovanie zákazky";
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
                vykazyPrac[vp].set(FIELD_STAV, stavVyuctovania);
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
        zakazkaCelkomBezDPH += praceCelkomBezDPH;
        zakazkaDPH += praceDPH;
        zakazkaCelkom += praceCelkom;
        odpracovanychHodin = spocitatHodinyZevidencie(zakazka);
    }
    // message("Práce celkom:" + praceCelkom);
    zakazka.set(FIELD_PRACE, praceCelkom);
    zakazka.set("txt práce", txtPrace);
    // náklady
    var mzdy = zakazkaMzdy(zakazka);

    zakazka.set("Odvod DPH Práce", praceDPH);
    if (praceDPH > 0) {
        txtOdvodDPHPrace = "✔...odvod DPH za práce";
    }
    zakazka.set("txt odvod dph práce", txtOdvodDPHPrace);
    zakazka.set("Mzdy", mzdy);
    if (mzdy > 0) {
        txtMzdy = "✔...mzdy vyplatené počas prác na zákazke";
    }
    zakazka.set("txt mzdy", txtMzdy);
    zakazka.set("Odpracovaných hodín", odpracovanychHodin);
    if (odpracovanychHodin > 0) {
        txtOdpracovanychHodin = "✔...pracovné hodiny na zákazke";
    }
    zakazka.set("txt odpracovaných hodín", txtOdpracovanychHodin);

    // MATERIÁL
    var txtMaterial = "✘...žiadny materiál";
    var txtNakupMaterialu = "✘...žiadny nákup materiálu";
    var txtOdvodDPHMaterial = "✘...žiadny odvod DPH z materiálu";
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
                txtMaterial = " s DPH";
            } else {
                txtMaterial = " bez DPH";
            }
            materialCelkomBezDPH += material[0];
            if (vyuctovanie) {
                // nastaviť príznak výdajok materiálu na vyúčtované

                vydajkyMaterialu[vm].link(FIELD_VYUCTOVANIE, vyuctovanie);
                vydajkyMaterialu[vm].set(FIELD_STAV, stavVyuctovania);
                // zápis do vyúčtovania
                vyuctovanie.set(vydajkyMaterialu[vm].field(FIELD_POPIS) + " celkom", materialCelkomBezDPH);
                nalinkujMaterial(vyuctovanie, vydajkyMaterialu[vm]);
            }
        }
        materialCelkom += materialCelkomBezDPH + materialDPH;
        // globálny súčet
        zakazkaCelkomBezDPH += materialCelkomBezDPH;
        zakazkaDPH += materialDPH;
        zakazkaCelkom += materialCelkom;
    }
    //message("Materiál celkom:" + materialCelkom);
    zakazka.set(FIELD_MATERIAL, materialCelkom);
    zakazka.set("txt materiál", txtMaterial);
    // náklady
    zakazka.set("Nákup materiálu", nakupMaterialu);
    if (nakupMaterialu > 0) {
        txtNakupMaterialu = "✔...materiál v nákupných cenách bez DPH";
    }
    zakazka.set("txt nákup materiálu", txtNakupMaterialu);
    zakazka.set("Odvod DPH Materiál", odvodDPHMaterial);
    if (odvodDPHMaterial > 0) {
        txtOdvodDPHMaterial = "✔...odvod DPH za nakúpený materiál (rozdiel)";
    }
    zakazka.set("txt odvod dph materiál", txtOdvodDPHMaterial);

    // STROJE
    // prepočet výkazov strojov

    var strojeUctovatDPH = mclCheck(uctovanieDPH, "Mechanizácia");
    var vykazStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, W_ZAKAZKA)[0];
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
            vykazStrojov.set(FIELD_STAV, stavVyuctovania);
            // zápis do vyúčtovania
            vyuctovanie.set(vykazStrojov.field(FIELD_POPIS) + " celkom", strojeCelkomBezDPH);
            nalinkujStroje(vyuctovanie, vykazStrojov);

        }

    }
    strojeCelkom += strojeCelkomBezDPH + strojeDPH;
    // náklady stroje
    var koefStroje = libByName(DB_ASSISTENT).find(sezona)[0].field("Koeficient nákladov prevádzky strojov");
    nakladyStroje = strojeCelkomBezDPH * koefStroje;
    txtNakladyStroje = "✔...náklady na prevádzku strojov (" + koefStroje * 100 + "% z účtovanej sadzby)";                        // náklady 75%
    // globálny súčet
    zakazkaCelkomBezDPH += strojeCelkomBezDPH;
    zakazkaDPH += strojeDPH;
    zakazkaCelkom += strojeCelkom;

    //message("Stroje celkom:" + strojeCelkom);
    zakazka.set(FIELD_STROJE, strojeCelkom);
    zakazka.set("txt stroje", txtStroje);
    // náklady
    zakazka.set("Náklady stroje", nakladyStroje);
    zakazka.set("txt náklady stroje", txtNakladyStroje);
    zakazka.set("Odvod DPH Stroje", strojeDPH);
    if (strojeDPH > 0) {
        txtOdvodDPHStroje = "✔...odvod DPH za stroje";
    }
    zakazka.set("txt odvod dph stroje", txtOdvodDPHStroje);

    // INÉ VÝDAVKY
    var ineVydavky = zakazkaVydavky(zakazka, true, vyuctovanie);
    if (ineVydavky <= 0) {
        var txtVydavky = "✘...žiadne iné výdavky";
    } else {
        var txtVydavky = "✔...priame výdavky z Pokladne";
    }

    zakazkaCelkomBezDPH += ineVydavky[0];
    zakazkaDPH += ineVydavky[1];
    zakazkaCelkom += ineVydavky[2];
    zakazka.set("txt iné výdavky", ineVydavky[3]);

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
    var dopravaCelkomBezDPH = spocitatDopravu(zakazka, zakazkaCelkomBezDPH);
    var mzdyDoprava = 0;
    var dopravaDPH = 0;
    var dopravaCelkom = 0;
    if (dopravaCelkomBezDPH > 0) {
        var dopravaUctovatDPH = mclCheck(uctovanieDPH, W_DOPRAVA);
        if (dopravaUctovatDPH) {
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
            txtDoprava = " s DPH";
            dopravaDPH = dopravaCelkomBezDPH * sadzbaDPH;
        } else {
            txtDoprava = " bez DPH";
        }
        dopravaCelkom += dopravaCelkomBezDPH + dopravaDPH;
        var koefVozidla = libByName(DB_ASSISTENT).find(sezona)[0].field("Koeficient nákladov prevádzky vozidiel");
        nakladyVozidla = dopravaCelkomBezDPH * koefVozidla;
    }
    // náklady doprava
    najazdenyCas = zakazkaCasJazdy(zakazka);
    pocetJazd = zakazkaPocetJazd(zakazka);
    mzdyDoprava = najazdenyCas * (mzdy / odpracovanychHodin);   // priemerná mzda za čas strávený v aute
    najazdeneKm = zakazkaKm(zakazka);

    // globálny súčet
    zakazkaCelkomBezDPH += dopravaCelkomBezDPH;
    zakazkaDPH += dopravaDPH;
    zakazkaCelkom += dopravaCelkom;
    //message("Doprava celkom:" + dopravaCelkom);
    zakazka.set(FIELD_DOPRAVA, dopravaCelkom);
    zakazka.set("txt doprava", txtDoprava);
    // náklady
    zakazka.set("Počet jázd", pocetJazd);
    if (pocetJazd > 0) {
        txtPocetJazd = "✔...len jazdy tam (výjazd)";
    }
    zakazka.set("txt počet jázd", txtPocetJazd);

    zakazka.set("Najazdené km", najazdeneKm);
    // message("najazdené km: " + najazdeneKm);
    if (najazdeneKm > 0) {
        txtNajazdeneKm = "✔...km najazdené v rámci zákazky";
    }
    zakazka.set("txt najazdené km", txtNajazdeneKm);

    zakazka.set("Najazdený čas", najazdenyCas);
    if (najazdenyCas > 0) {
        txtNajazdenyCas = "✔...pracovný čas v aute";
    }
    zakazka.set("txt najazdený čas", txtNajazdenyCas);

    zakazka.set("Mzdy v aute", mzdyDoprava);
    if (mzdyDoprava > 0) {
        txtMzdyDoprava = "✔...mzdy počas jazdy autom";
    }
    zakazka.set("txt mzdy v aute", txtMzdyDoprava);

    zakazka.set("Náklady vozidlá", nakladyVozidla);
    if (nakladyVozidla > 0) {
        txtNakladyVozidla = "✔...náklady na prevádzku vozidiel (" + koefVozidla * 100 + "% z účtovanej sadzby)";                        // náklady 75%
    }
    zakazka.set("txt náklady vozidlá", txtNakladyVozidla);

    zakazka.set("Odvod DPH Doprava", dopravaDPH);
    if (dopravaDPH > 0) {
        txtOdvodDPHDoprava = "✔...odvod DPH za dopravu";
    }
    zakazka.set("txt odvod dph doprava", txtOdvodDPHDoprava);


    // PLATBY
    var zaplatene = zakazkaPrijmy(zakazka);
    // CELKOM
    var rozpocetSDPH = zakazka.field(FIELD_CENOVA_PONUKA)[0].field("Cena celkom (s DPH)");

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
    if (!zakazkaCelkom) {
        txtVyuctovanieCelkom = "✘...chyba prepočtu zákazky";
        zakazkaCelkom = 0;
    }
    zakazka.set("Náklady celkom", naklady);
    zakazka.set("txt celkové náklady", txtCelkoveNaklady);
    zakazka.set("txt vyúčtovanie celkom", txtVyuctovanieCelkom);

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
    // Prepočet zákazky
    zakazka.set("Rozpočet", rozpocetSDPH);
    zakazka.set("Zaplatené", zaplatene);
    zakazka.set("Suma na úhradu", sumaNaUhradu);
    zakazka.set("Vyúčtovanie celkom", zakazkaCelkom);
    zakazka.set("Iné výdavky", ineVydavky);
    zakazka.set("efektivita", efektivita(marzaPoZaplateni));
    // Náklady a marže
    zakazka.set("Marža", marza);       // TODO zakalkulovať DPH
    zakazka.set("Marža po zaplatení", marzaPoZaplateni);
    message("Zákazka |" + zakazka.field("Číslo") + "| bola prepočítaná...");

    // VYÚČTOVANIE
    if (vyuctovanie) {
        var typ = zakazka.field(FIELD_CENOVA_PONUKA)[0].field("Typ cenovej ponuky");
        // NASTAVENIE POLÍ
        // časti vyúčtovania
        vyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
        // vyúčtovanie
        vyuctovanie.set("Celkom (bez DPH)", zakazkaCelkomBezDPH);
        vyuctovanie.set("DPH 20%", zakazkaDPH);
        vyuctovanie.set("Cena celkom (s DPH)", zakazkaCelkom);
        vyuctovanie.set("Zaplatená záloha", zaplatene);
        vyuctovanie.set("Suma na úhradu", zakazkaCelkom - zaplatene);
        if (typ == W_POLOZKY) {
            var diely = zakazka.field("Diely zákazky");
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
        //zakazkaToJsonHZS(zakazka);
        message("Vyúčtovane |" + vyuctovanie.field("Číslo") + "| bolo " + textVyuctovanie);
        zakazka.set(FIELD_STAV, stavZakazky);
        // stav vyúčtovania

    }
    setBackgroudColor(zakazka, zakazka.field(FIELD_STAV));
    message("Hotovo...!");
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

const zakazkaPrijmy = (zakazka, sDPH) => {
    var links = zakazka.linksFrom(DB_POKLADNA, "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Príjem bez DPH") + links[p].field("DPH+"));
    }
    return result;
};

const zakazkaVydavky = (zakazka, sDPH, vyuctovanie) => {
    var vydavkyLinks = zakazka.linksFrom(DB_POKLADNA, "Zákazka")
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

const setBackgroudColor = (zakazka, stav) => {

    switch (stav) {
        case "Vyúčtovaná":
            zakazka.set("background color", "#B3E5FC")
            break;
        case "Prebieha":
            zakazka.set("background color", "#F5E9F7")
            break;
        case "Ukončená":
            zakazka.set("background color", "#EDF7EE")
            break;
        case "Čakajúca":
            zakazka.set("background color", "#FFF9E6")
            break;
        case "Zaplatená":
            zakazka.set("background color", "#B3E0DB")
            break;
    }
}
// End of file: 22.03.2022, 19:24 '{"result":true, "count":42}'