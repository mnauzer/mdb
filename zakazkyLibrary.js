// Library/Event/Script:    Projekty\Zákazky\shared\zakazkyLibrary_w.js
// JS Libraries:
// Dátum:                   09.03.2022
// Popis:                   knižnica scriptov Zákazky
function verziaKniznice() {
    var result = "";
    var nazov = "zakazkyLibrary";
    var verzia = "0.3.34";
    result = nazov + " " + verzia;
    return result;
}

const prepocetZakazky = zakazka => {
    var vKniznica = verziaKniznice();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("PREPOČÍTAJ ZÁKAZKU" + "\nv. " + vKniznica + "\nv. " + vKrajinkaLib);

    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var uctovanieDPH = zakazka.field("Účtovanie DPH");
    var sezona = zakazka.field(FIELD_SEZONA);

    // nalinkovať a spočítať výkazy
    var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
    var vyuctovanieCelkomBezDph = 0;
    var vyuctovanieCelkom = 0;
    var dphSuma = 0;
    var vykazyPrac = zakazka.linksFrom(DB_VYKAZY_PRAC, W_ZAKAZKA)
    var vykazyStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, W_ZAKAZKA);
    var vydajkyMaterialu = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, W_ZAKAZKA);
    var praceSDPH = mclChecked(uctovanieDPH, W_PRACE);
    var strojeSDPH = mclChecked(uctovanieDPH, "Mechanizácia");
    var materialSDPH = mclChecked(uctovanieDPH, W_MATERIAL);
    var dopravaSDPH = mclChecked(uctovanieDPH, W_DOPRAVA);
    var txtPrace = "";
    var txtMaterial = "";
    var txtStroje = "";
    var txtDoprava = "";

    // PRÁCE
    // prepočet výkazov prác
    var prace = 0;
    var praceDPH = 0;
    if (vykazyPrac.length > 0) {
        for (var vp = 0; vp < vykazyPrac.length; vp++) {
            var typ = vykazyPrac[vp].field(FIELD_TYP_VYKAZU);
            if (typ == W_HODINOVKA || vykazyPrac[vp].field(FIELD_POPIS) == W_PRACE_NAVYSE) {
                prace += prepocitatVykazPraceHzs(vykazyPrac[vp], praceSDPH, sadzbaDPH);
            } else {
                prace += prepocitatVykazPracePolozky(vykazyPrac[vp], praceSDPH, sadzbaDPH);
            }
            if (praceSDPH) {
                txtPrace = " s DPH";
                praceDPH += vykazyPrac[vp].field("DPH");
                dphSuma += praceDPH;
            } else {
                txtPrace = " bez DPH";
            }
        }
        vyuctovanieCelkomBezDph += prace;
    } else {
        txtPrace = " žiadne práce";
    }
    zakazka.set("txt práce", txtPrace);
    // MATERIÁL
    // prepočet výdajok materiálu
    var material = 0;
    var materialDPH = 0;
    if (vydajkyMaterialu.length > 0) {
        for (var vm = 0; vm < vydajkyMaterialu.length; vm++) {
            material += spocitatVydajkyMaterialu(vydajkyMaterialu[vm], materialSDPH, sadzbaDPH);
            if (materialSDPH) {
                txtMaterial = " s DPH";
                materialDPH += vydajkyMaterialu[vm].field("DPH");
                dphSuma += materialDPH;
            } else {
                txtMaterial = " bez DPH";
            }
            vyuctovanieCelkomBezDph += material;
        }
    } else {
        txtMaterial = " žiadny materiál";
    }
    zakazka.set("txt materiál", txtMaterial);

    // STROJE
    var stroje = 0;
    var strojeDPH = 0;
    if (vykazyStrojov.length > 0) {
        for (var vs = 0; vs < vykazyStrojov.length; vs++) {
            //  message("Počet výkazov strojov: " + vykazyStrojov.length);
            stroje += spocitatVykazStrojov(vykazyStrojov[vs], strojeSDPH, sadzbaDPH);
            if (strojeSDPH) {
                txtStroje = " s DPH";
                strojeDPH += vykazyStrojov[vs].field("DPH");
                dphSuma += strojeDPH;
            } else {
                txtStroje = " bez DPH";
            }
        }
        vyuctovanieCelkomBezDph += stroje;
    } else {
        txtStroje = " žiadne stroje";
    }
    zakazka.set("txt stroje", txtStroje);

    // DOPRAVA
    // prepočítať dopravu
    var dopravaCelkom = spocitatDopravu(zakazka, vyuctovanieCelkomBezDph);
    var dopravaDPH = 0;
    if (dopravaCelkom >= 0) {
        if (dopravaSDPH) {
            txtDoprava = " s DPH";
            dopravaDPH = dopravaCelkom * sadzbaDPH;
            dphSuma += dopravaDPH;
        } else {
            txtDoprava = " bez DPH";
        }
    } else {
        txtDoprava = " žiadna doprava";
    }
    zakazka.set("txt doprava", txtDoprava);
    vyuctovanieCelkomBezDph += dopravaCelkom;

    // Message
    message(
        W_PRACE + txtPrace + "\n" +
        W_MATERIAL + txtMaterial + "\n" +
        W_STROJE + txtStroje + "\n" +
        W_DOPRAVA + txtDoprava + "\n"
    );

    // CELKOM
    vyuctovanieCelkom = vyuctovanieCelkomBezDph + dphSuma;

    var rozpocetSDPH = zakazka.field(FIELD_CENOVA_PONUKA)[0].field("Cena celkom (s DPH)");
    var mzdy = zakazkaMzdy(zakazka);                                // mzdy z evidencie
    var odpracovanychHodin = spocitatHodinyZevidencie(zakazka);                // hodiny z evidencie
    var najazdenyCas = zakazkaCasJazdy(zakazka);
    var najazdeneKm = zakazkaKm(zakazka);
    var mzdyDoprava = najazdenyCas * (mzdy / odpracovanychHodin);   // priemerná mzda za čas strávený v aute
    var nakladyDoprava = najazdeneKm * 0.5;                         // náklady 0,50€/km
    var nakladyStroje = stroje * 0.75;                         // náklady 75%
    var nakupMaterialu = zakazkaNakupMaterialu(zakazka);            // nákup materiálu bez DPH
    var odvodDPHMaterial = zakazkaMaterialRozdielDPH(zakazka);
    var odvodDPHPrace = praceDPH;
    var odvodDPHDoprava = dopravaDPH;
    var odvodDPHStroje = strojeDPH;
    var ineVydavky = zakazkaVydavky(zakazka);
    var pocetJazd = zakazkaPocetJazd(zakazka);
    var zaplatene = zakazkaPrijmy(zakazka);

    var naklady = mzdy
        + odvodDPHPrace
        + mzdyDoprava
        + nakupMaterialu
        + odvodDPHMaterial
        + nakladyDoprava
        + odvodDPHDoprava
        + nakladyStroje
        + odvodDPHStroje;

    var sumaNaUhradu = vyuctovanieCelkomBezDph + dphSuma - zaplatene;
    var marza = marzaPercento(vyuctovanieCelkom, naklady);
    var marzaPoZaplateni = zaplatene > 1 ? marzaPercento(zaplatene, naklady) : 0;
    var doprava = dopravaCelkom + odvodDPHDoprava;
    var zisk = vyuctovanieCelkom - naklady;
    var ziskPoZaplateni = zaplatene - naklady;
    var zostatok = rozpocetSDPH - vyuctovanieCelkom;


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
    zakazka.set("Vyúčtovanie celkom", vyuctovanieCelkom);
    zakazka.set(FIELD_PRACE, prace + praceDPH);
    zakazka.set(FIELD_MATERIAL, material + materialDPH);
    zakazka.set(FIELD_STROJE, stroje + strojeDPH);
    zakazka.set(FIELD_DOPRAVA, doprava); // doprava bez dph + dph z dopravy
    zakazka.set("Iné výdavky", ineVydavky);
    zakazka.set("efektivita", efektivita(marzaPoZaplateni));

    // Náklady
    zakazka.set("Marža", marza);       // TODO zakalkulovať DPH
    zakazka.set("Marža po zaplatení", marzaPoZaplateni);
    zakazka.set("Odpracovaných hodín", odpracovanychHodin);
    zakazka.set("Počet jázd", pocetJazd);
    zakazka.set("Najazdené km", najazdeneKm);
    zakazka.set("Najazdený čas", najazdenyCas);
    zakazka.set("Nákup materiálu", nakupMaterialu);
    zakazka.set("Odvod DPH Materiál", odvodDPHMaterial);
    zakazka.set("Mzdy", mzdy);
    zakazka.set("Mzdy v aute", mzdyDoprava);
    zakazka.set("Odvod DPH Práce", odvodDPHPrace);
    zakazka.set("Náklady vozidlá", nakladyDoprava);
    zakazka.set("Odvod DPH Doprava", odvodDPHDoprava);
    zakazka.set("Náklady stroje", nakladyStroje);
    zakazka.set("Odvod DPH Stroje", odvodDPHDoprava);
    zakazka.set("Náklady celkom", naklady);

    message("Zákazka prepočítaná...");

}

const generujVyuctovanie = zakazka => {
    // verzia
    //var vyuctovanie = zakazka.field("Vyúčtovanie")[0];
    //if (!vyuctovanie.length>0) {
    var noveVyuctovanie = zakazkaNoveVyuctovanie(zakazka);
    var vKniznica = verziaKniznice();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("GENERUJ VYÚČTOVANIE" + "\nv." + vKniznica + "\nv." + vKrajinkaLib);
    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var typCP = cp.field("Typ cenovej ponuky");
    var uctovanieDPH = zakazka.field("Účtovanie DPH");
    // inicializácia
    var sezona = noveVyuctovanie.field(FIELD_SEZONA);
    var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
    var dphSuma = 0;
    var vyuctovanieCelkom = 0;
    var vyuctovanieCelkomBezDph = 0;

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
        var praceSDPH = mclChecked(uctovanieDPH, W_PRACE);
        for (var vp = 0; vp < vykazyPrac.length; vp++) {
            var typ = vykazyPrac[vp].field("Typ výkazu");
            if (typ == W_HODINOVKA || vykazyPrac[vp].field(FIELD_POPIS) == W_PRACE_NAVYSE) {
                praceCelkomBezDPH += prepocitatVykazPraceHzs(vykazyPrac[vp], praceSDPH, sadzbaDPH);
            } else if (typ == W_POLOZKY) {
                praceCelkomBezDPH += prepocitatVykazPracePolozky(vykazyPrac[vp], praceSDPH, sadzbaDPH);
            } else {
                message("Zle zadaný typ výkazu prác");
            }
            vykazyPrac[vp].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
            noveVyuctovanie.set(vykazyPrac[vp].field(FIELD_POPIS) + " celkom", praceCelkomBezDPH);

            // zápis do vyúčtovania
            if (praceSDPH) {
                txtPrace = " s DPH";
                praceDPH += vykazyPrac[vp].field("DPH");
                dphSuma += praceDPH;
            } else {
                txtPrace = " bez DPH";
            }
        }
        vyuctovanieCelkomBezDph += praceCelkomBezDPH;
    } else {
        txtPrace = " žiadne práce";
    }
    zakazka.set("txt práce", txtPrace);

    // MATERIÁL
    // prepočet výdajok materiálu
    var vydajkyMaterialu = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, "Zákazka");
    if (vydajkyMaterialu.length > 0) {
        var materialSDPH = mclChecked(uctovanieDPH, "Materiál");
        var materialCelkomBezDPH = 0;
        var materialDPH = 0;
        for (var vm = 0; vm < vydajkyMaterialu.length; vm++) {
            materialCelkomBezDPH += spocitatVydajkyMaterialu(vydajkyMaterialu[vm], materialSDPH, sadzbaDPH);
            vydajkyMaterialu[vm].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
            // zápis do vyúčtovania
            noveVyuctovanie.set(vydajkyMaterialu[vm].field(FIELD_POPIS) + " celkom", materialCelkomBezDPH);
            if (materialSDPH) {
                txtMaterial = " s DPH";
                materialDPH += vydajkyMaterialu[vm].field("DPH");
                dphSuma += materialDPH;
            } else {
                txtMaterial = " bez DPH";
            }
            vyuctovanieCelkomBezDph += materialCelkomBezDPH;
        }
    } else {
        txtMaterial = " žiadny materiál";
    }
    zakazka.set("txt materiál", txtMaterial);

    // STROJE
    // prepočet výkazu strojov
    var vykazStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, "Zákazka");
    if (vykazStrojov.length > 0) {
        var strojeSDPH = mclChecked(uctovanieDPH, "Mechanizácia");
        var strojeCelkomBezDPH = 0;
        var strojeDPH = 0;
        for (var vs = 0; vs < vykazStrojov.length; vs++) {

            strojeCelkomBezDPH += spocitatVykazStrojov(vykazStrojov[vs], strojeSDPH, sadzbaDPH);
            vykazStrojov[vs].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
            // zápis do vyúčtovania
            noveVyuctovanie.set(vykazStrojov[vs].field(FIELD_POPIS) + " celkom", strojeCelkomBezDPH);
            if (strojeSDPH) {
                txtStroje = " s DPH";
                strojeDPH += vykazStrojov[vs].field("DPH");
                dphSuma += strojeDPH;
            } else {
                txtStroje = " bez DPH";
            }
        }
        vyuctovanieCelkomBezDph += strojeCelkomBezDPH;
    } else {
        txtStroje = " žiadne stroje";
    }
    zakazka.set("txt stroje", txtStroje);

    // DOPRAVA
    // prepočítať dopravu
    var dopravaSDPH = mclChecked(uctovanieDPH, "Doprava");;
    var dopravaCelkomBezDPH = spocitatDopravu(zakazka, vyuctovanieCelkomBezDph);
    var dopravaDPH = 0;
    if (dopravaCelkomBezDPH >= 0) {
        if (dopravaSDPH) {
            txtDoprava = " s DPH";
            dopravaDPH = dopravaCelkomBezDPH * sadzbaDPH;
            dphSuma += dopravaDPH;
        } else {
            txtDoprava = " bez DPH";
        }
    } else {
        txtDoprava = " žiadna doprava";
    }
    zakazka.set("txt doprava", txtDoprava);
    vyuctovanieCelkomBezDph += dopravaCelkomBezDPH;

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
    vyuctovanieCelkom = vyuctovanieCelkomBezDph + dphSuma;

    // NASTAVENIE POLÍ
    // časti vyúčtovania
    noveVyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
    // vyúčtovanie
    noveVyuctovanie.set("Celkom (bez DPH)", vyuctovanieCelkomBezDph);
    noveVyuctovanie.set("DPH 20%", dphSuma);
    noveVyuctovanie.set("Cena celkom (s DPH)", vyuctovanieCelkom);
    noveVyuctovanie.set("Zaplatená záloha", prijmyCelkom);
    noveVyuctovanie.set("Suma na úhradu", vyuctovanieCelkomBezDph + dphSuma - prijmyCelkom);

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

const spocitatDopravu = (zakazka, cenaCelkomBezDPH) => {
    var jazd = zakazkaPocetJazd(zakazka);
    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var vyuctovanie = zakazka.field(FIELD_VYUCTOVANIE)[0];
    var uctovanieDopravy = cp.field("Účtovanie dopravy");
    // doprava
    //message("Debug DOPRAVA " + uctovanie);
    var celkom = 0;
    switch (uctovanieDopravy) {
        case "Paušál":
            var cpPausal = cp.field("Paušál")[0];
            if (cpPausal) {
                var cena = cpPausal.attr("cena");
            } else {
                message("nie je zadaná paušálna cena v CP")
            }
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
            if (cpKm) {
                var cena = cpKm.attr("cena");
            } else {
                message("nie ja zadaná cena za km v CP")
            }
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
    var links = zakazka.linksFrom(DB_KNIHA_JAZD, "Zákazka")
    var zastavky = zakazka.linksFrom(DB_KNIHA_JAZD, "Zastávka na zákazke")
    var jazd = 0;
    for (var p = 0; p < links.length; p++) {
        if (links[p].field("Účel jazdy") == "Výjazd") {
            jazd += 1;
        }
    };
    for (var p = 0; p < zastavky.length; p++) {
        var remoteLinks = zastavky[p].field("Zastávka na zákazke");
        rlIndex = zistiIndexLinku(zakazka, remoteLinks)
        if (remoteLinks[rlIndex].attr("účtovať jazdu") == true) {
            jazd += 1;
        }
    };
    return jazd;
};

const zakazkaKm = zakazka => {
    var links = zakazka.linksFrom(DB_KNIHA_JAZD, "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("Najazdené km"));
    };
    return result;
};

const zakazkaCasJazdy = zakazka => {
    var links = zakazka.linksFrom(DB_KNIHA_JAZD, "Zákazka")
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += links[p].field("Trvanie") * links[p].field("Posádka").length;
    };
    return result;
};

const spocitatHodinyZevidencie = zakazka => {
    var links = zakazka.linksFrom(DB_EVIDENCIA_PRAC, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += (links[p].field("Odpracované"));
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
            //  result += links[p].field("Mzdové náklady");
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

const zakazkaPraceDPH = zakazka => {
    var links = zakazka.linksFrom(DB_VYKAZY_PRAC, "Zákazka");
    var result = 0;
    for (var p = 0; p < links.length; p++) {
        result += (links[p].field("DPH"));
    };
    return result;
};

const zakazkaStrojeDPH = zakazka => {
    var links = zakazka.linksFrom(DB_VYKAZY_STROJOV, "Zákazka");
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
    // message(index);
    return index;
}

const prepocitatVykazPraceHzs = (vykaz, sDPH, sadzbaDPH) => {
    // inicializácia
    if (sDPH) { vykaz.set("s DPH", true) }
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var typ = vykaz.field("Typ výkazu");
    var diel = vykaz.field("Popis");
    var evidenciaLinks = vykaz.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
    // vymazať predošlé nalinkované evidencie
    var empty = [];
    vykaz.set("Rozpis", empty);

    var hodinyCelkom = 0;
    if (typ == W_HODINOVKA) {
        var polozka = vykaz.field("Práce sadzby")[0];
        var limity = polozka.field("Limity");
        var attrMJ = "účtovaná sadzba";
    }
    // else if (typ == W_POLOZKY) {
    //     var polozka = vykaz.field("Práce")[0];
    //     var attrMJ = "cena";
    // }
    // vypočítať aktuálnu sadzbu práce za počet hodín
    var uctovanie = vykaz.field(FIELD_ZAKAZKA)[0].field(FIELD_CENOVA_PONUKA)[0].field("Počítanie hodinových sadzieb");
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
            vykaz.field("Rozpis")[el].setAttr(attrMJ, null);
            vykaz.field("Rozpis")[el].setAttr("cena celkom", null);
            vykaz.field("Rozpis")[el].set("Tlač", "Tlač")
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
        polozka.setAttr(attrMJ, sadzba);
        polozka.setAttr("cena celkom", sumaBezDPH);
    } else {
        message("Chyba!...nie je zadaný typ účtovania hodinových sadzieb");
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
    setTlac(vykaz);
    return sumaBezDPH;
};

const prepocitatVykazPracePolozky = (vykaz, sDPH, sadzbaDPH) => {
    // inicializácia
    //var sDPH = vykaz.field("s DPH");
    if (sDPH) { vykaz.set("s DPH", true) }
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var polozky = vykaz.field(FIELD_PRACE);

    if (polozky) {
        for (var p = 0; p < polozky.length; p++) {
            var mnozstvo = polozky[p].attr("dodané množstvo");
            var cena = polozky[p].attr("cena") || polozky[p].field("Cena bez DPH");
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

const spocitatVykazStrojov = (vykaz, sDPH, sadzbaDPH) => {
    // inicializácia
    if (sDPH) { vykaz.set("s DPH", true) }
    var sumaDPH = 0;
    var sumaBezDPH = 0;
    var polozky = vykaz.field(FIELD_STROJE);
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
            setTlac(polozky[p]);
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
    setTlac(vykaz);
    return sumaBezDPH;
};

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

const zakazkaPraceEvidencia = zakazka => {
    var typ = zakazka.field("Cenová ponuka")[0].field("Typ cenovej ponuky");
    if (typ == "Položky") {
        message("spočítavám položky");
        // prejde výkazy práce
        var vykazy = zakazka.linksFrom(DB_VYKAZY_PRAC, "Zákazka");
        for (var v = 0; v < vykazy.length; v++) {
        }

    } else if (typ == "Hodinovka") {
        message("spočítavám hodiny");
        // prejde výkazy práce
        var vykazy = zakazka.linksFrom(DB_VYKAZY_PRAC, "Zákazka");
        for (var v = 0; v < vykazy.length; v++) {
        }
    } else {
        message("ad-hoc ešte nefunguje");
    }
};

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
const nalinkujPrace = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vykazPrac.field(FIELD_POPIS);
    vyuctovanie.set(popis, empty);
    vyuctovanie.set(popis + " celkom", empty);
    // práce navyše ošetriť inak
    if (popis != "Práce navyše") {
        // položky z výdajky do array
        var polozkyVykazPrac = vykazPrac.field(FIELD_PRACE);
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
            setTlac(polozkyVykazPrac[m]);
        }
    } else {
        // práce navyše
        var praceNavyse = vykazPrac.field("Práce sadzby")[0];
        var hodinCelkom = 0;
        var uctovanaSadzba = vykazPrac.field(FIELD_CENOVA_PONUKA)[0].field(popis)[0].attr("sadzba");
        var cenaCelkom = 0;
        vyuctovanie.link(popis, praceNavyse);
        var evidenciaLinks = vykazPrac.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
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
    var pocitanieHodinovychSadzieb = vykazPrac.field(FIELD_CENOVA_PONUKA)[0].field("Počítanie hodinových sadzieb");
    var empty = [];
    var popis = vykazPrac.field(FIELD_POPIS);
    vyuctovanie.set(popis, empty);
    vyuctovanie.set(popis + " celkom", empty);
    var vykazPraceSadzby = vykazPrac.field("Práce sadzby")[0];
    var vykazPraceSadzbyCelkom = 0;
    var cenaCelkom = 0;
    var hodinCelkom = 0;
    var uctovanaSadzba = 0;
    vyuctovanie.link(popis, vykazPraceSadzby);
    var evidenciaLinks = vykazPrac.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
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
        setTlac(vyuctovanie);
        for (var e = 0; e < evidenciaLinks.length; e++) {
            vyuctovanie.link("Rozpis " + popis, evidenciaLinks[e]);
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
            cenaCelkom = hodinCelkom * uctovanaSadzba;
            // nastav príznak Tlač
            setTlac(evidenciaLinks[e])
        }
        vykazPracCelkom += cenaCelkom;
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
            setTlac(evidenciaLinks[e]);
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
    f.writeLine('"Práce"' + ':' + mclChecked(zakazka.field("Účtovanie DPH"), "Práce") + ',');
    f.writeLine('"Materiál"' + ':' + mclChecked(zakazka.field("Účtovanie DPH"), "Materiál") + ',');
    f.writeLine('"Stroje"' + ':' + mclChecked(zakazka.field("Účtovanie DPH"), "Mechanizácia") + ',');
    f.writeLine('"Doprava"' + ':' + mclChecked(zakazka.field("Účtovanie DPH"), "Doprava") + '}');
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