// CENOVÉ PONUKY
const saveEntryCenovePonuky = en => {
    let scr.name = "saveEntryCenovePonuky 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    try {
        prepocitatCenovuPonuku(en)
        saveEntry(en, appDBName)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
const prepocitatCenovuPonuku = en => {
    let scr.name ="prepocitatCenovuPonuku 23.0.04";
    let variables = "Záznam: " + en.name
    let parameters = "en: " + en
    try {
        message("Prepočítavam...")
        // inicializácia
        var typ = en.field("Typ cenovej ponuky");
        //spôsob účtovania doprav
        var uctoDopravy = en.field("Účtovanie dopravy");
        var pracaCelkom = 0;
        var strojeCelkom = 0;
        var materialCelkom = 0;
        var cenaCelkomBezDPH = 0;
        var cenaSDPH = 0;
        var dph = 0;
        var dopravaCelkom = 0;
        var season = getSeason(en, LIB_CPN, scr.name);
        var sadzbaDPH = libByName(APP).find(season)[0].field("Základná sadzba DPH") / 100;
        // nastaviť splatnosť
        var datum = new Date(en.field(DATE));
        var platnost = new Date(en.field("Platnosť do"));
        var platnost30 = new Date(moment(datum).add(en.field("Platnosť ponuky"), "Days"));

        en.set("Platnosť do", platnost > datum ? platnost30 : platnost30);

        // doplň adresu klienta do Krycieho listu
        var klient = en.field("Miesto realizácie")[0].field("Klient")[0];
        en.set("Klient", klient);
        if (klient) {
            en.set("Odberateľ", pullAddress(klient));
        }

        // prepočet podľa typu cenovej ponuky
        let evidovat = en.field("Evidovať")
        switch (typ) {
            case "Položky":
                let diely = en.field("Diely cenovej ponuky");
                // prejsť všetky diely a spočítať práce a materiál
                if (diely) {
                    for (var d = 0; d < diely.length; d++) {
                        cenaCelkomBezDPH += prepocetDielPolozky(en, diely[d]);
                    }
                }
                  // Doprava každopádne
                dopravaCelkom = ponukaDoprava(en, uctoDopravy, cenaCelkomBezDPH); // cenová ponuka + spôsob účtovania dopravy
                break;
                case "Hodinovka":
                diely = en.field("Diely cenovej ponuky hzs");
                if (diely) {
                    for (var d = 0; d < diely.length; d++) {
                        pracaCelkom += prepocetDielHZS(en, diely[d]);
                    }
                    if (evidovat.includes("Výkaz materiálu")) {
                        // spočítať  materiál
                        var material = en.field("Materiál");
                        materialCelkom = polozkaMaterial(material);
                        en.set("Materiál hzs", materialCelkom);
                        en.set("Materiál celkom bez DPH", materialCelkom);
                    }
                    if (evidovat.includes("Výkaz strojov")) {
                        // spočítať mechanizácie
                        var stroje = en.field(FLD_STR);
                        strojeCelkom = prepocetDielStroje(stroje);
                        en.set("Využitie mechanizácie", strojeCelkom);
                        en.set("Stroje celkom bez DPH", strojeCelkom);
                    }
                    cenaCelkomBezDPH = materialCelkom + strojeCelkom + pracaCelkom;
                }
                dopravaCelkom = ponukaDoprava(en, uctoDopravy, cenaCelkomBezDPH); // cenová ponuka + spôsob účtovania dopravy
                break;
            case "Externá":
                cenaCelkomBezDPH = en.field("Cena externej ponuky")
                dopravaCelkom = 0
                break;
            case "Ad Hoc":
                message("I'am thinking about it!");
                break;
        }
        // dph
        cenaCelkomBezDPH += dopravaCelkom;
        dph = cenaCelkomBezDPH * sadzbaDPH;
        cenaSDPH += cenaCelkomBezDPH + dph;
        en.set("Práca celkom bez DPH", pracaCelkom);
        en.set("Práce hzs", pracaCelkom);
        en.set("Doprava", dopravaCelkom);
        en.set("Celkom (bez DPH)", cenaCelkomBezDPH);
        en.set("DPH 20%", dph);
        en.set("Cena celkom (s DPH)", cenaSDPH);
        let identifikator =  en.field("Klient")[0].name + ", " + en.field("Miesto realizácie")[0].name
        en.set("Identifikátor", identifikator)
        let msgTxt = "Hotovo...\nCena ponuky bez DPH je: " + cenaCelkomBezDPH.toFixed(1) + "€"
        message(msgTxt)
        msgGen(LIB_CPN, "libCenovePonuky.js", scr.name, msgTxt, variables, parameters)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters)
    }
}
const generujZakazku = cp => {
    var scr.name ="generujZakazku 23.1.09";
    let variables = "Záznam: " + cp.name + "\n"
    let parameters = "cp: " + cp + "\n"
    try {
        var stav = cp.field("Stav cenovej ponuky");
        if (stav == "Schválená") {
            // vygenerovať novú zákazku
            let zakazky = libByName(LIB_ZKZ);
            let season = getSeason(en, LIB_CPN, scr.name)
            let appDB = getAppSeasonDB(season, zakazky.title, scr.name);
            let newNumber = getNewNumber(appDB, season, LIB_CPN, scr.name);
            // vyber diely zákazky podľa typu cp
            if (cp.field("Typ cenovej ponuky") == "Hodinovka") {
                var dielyZakazky = cp.field("Diely cenovej ponuky hzs");
                if (mclCheck(dielyZakazky, "Servis zavlažovania")) {
                    typZakazky = "Servis AZS";
                } else {
                    typZakazky = "Údržba";
                }
            } else {
                var dielyZakazky = cp.field("Diely cenovej ponuky");
                typZakazky = "Realizácia";
            }
            // vytvorenie nového objektu
            message("Generujem novú zákazku...")
            var novaZakazka = new Object()
            novaZakazka[DATE] = new Date()
            novaZakazka["Typ zákazky"] = typZakazky
            novaZakazka["Identifikátor"] = identifikator
            novaZakazka[NUMBER] = newNumber[0]
            novaZakazka[NUMBER_ENTRY] = newNumber[1]
            novaZakazka["Klient"] = cp.field("Klient")[0]
            novaZakazka["Identifikátor"] = cp.field("Klient")[0].field("Nick") + ', ' + cp.field("Miesto realizácie")[0].field("Lokalita")
            novaZakazka["Miesto"] = cp.field("Miesto realizácie")[0]
            novaZakazka["Stav zákazky"] = "Čakajúca" // hardcoded
            novaZakazka["Názov zákazky"] = cp.field("Popis cenovej ponuky")
            novaZakazka["Diely zákazky"] = dielyZakazky.join()
            novaZakazka[FLD_CPN] = cp
            novaZakazka[SEASON]= season
            novaZakazka[CR] = user()
            novaZakazka[CR_DATE] = new Date()
            novaZakazka["Účtovanie DPH"] = ["Práce", "Materiál", "Doprava", "Mechanizácia"] // hardcoded
            novaZakazka["Účtovanie zákazky"] = cp.field("Typ cenovej ponuky")
            zakazky.create(novaZakazka)

            // inicializácia premennej z posledného záznamu
            var zakazka = cp.linksFrom(LIB_ZKZ, FLD_CPN)[0]
            let msgTxt = "Zákazka č." + zakazka.field(NUMBER) + " bola vygenerovaná"
            let nextNumber = zakazka.field(NUMBER_ENTRY)
            appDB.setAttr("nasledujúce číslo", nextNumber++)

            message(msgTxt)
            msgGen(LIB_CPN, "libCenovePonuky.js", scr.name, msgTxt, variables, parameters)

            // generovanie výkazov
            let evidovat = cp.field("Evidovať")
            generujVykazyPrac(zakazka)
            //generujVykazDopravy(zakazka)
            if (evidovat.includes("Výkaz materiálu")) {
                generujVykazyMaterialu(zakazka)
            }
            if (evidovat.includes("Výkaz strojov")) {
                message("generujVykazStrojov...")
                generujVykazStrojov(zakazka)
            }
            if (evidovat.includes("Položky")) {
                message("generujVykazyPrac...")
                generujVykazyPrac(zakazka)
            }
            if (evidovat.includes("Výkaz prác")) {
                message("generujVykazyPrac...")
                generujVykazyPrac(zakazka)
            }
            if (evidovat.includes("Vykaz dopravy")) {
                //message("generujVykazyPrac...")
                //generujVykazDopravy(zakazka)
            }
            if (evidovat.includes("Stavebný denník")) {
                //message("generujVykazyPrac...")
                //generujStavebnyDennik(zakazka)
            }
            if (evidovat.includes("Subdodávky")) {
                //message("generujVykazyPrac...")
                //generujVykazSubdodavok(zakazka)
            }
            cp.set("Stav cenovej ponuky", "Zákazka")
        } else if (cp.linksFrom(LIB_ZKZ, FLD_CPN)[0]) {
            let msgTxt = "Z cenovej ponuky už je vytvorená zákazka č." + cp.linksFrom(LIB_ZKZ, FLD_CPN)[0]
            message(msgTxt)
            msgGen(LIB_CPN, "libCenovePonuky.js", scr.name, msgTxt, variables, parameters)
            cancel()
            exit()
        } else {
            let msgTxt = "Cenová ponuka musí byť schválená"
            msgGen(LIB_CPN, "libCenovePonuky.js", scr.name, msgTxt, variables, parameters)
            message(msgTxt)
            cancel()
            exit()
        }
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters)
        cancel()
        exit()
    }
}

// VÝDAJKY
// generuj nové výdajky
const generujVykazyMaterialu = zakazka => {
    let scr.name ="generujVykazyMaterialu 23.0.03";
    let variables = "Zákazka: " + zakazka.name;
    let parameters = "zakazka: " + zakazka
    try {
        var cp = zakazka.field(FLD_CPN)[0];
        var popis = [];
        // ak je zákazka hodinovka
        if (cp.field("Typ cenovej ponuky") == "Hodinovka") {
            if (cp.field("+Materiál")) {
                popis.push("Materiál");
            }
            var materialPonuky = cp.field("Materiál");
            var vydajka = novyVykazMaterialu(zakazka, popis);
            linkItems(vydajka, materialPonuky);
            spocitajVykaz(vydajka, "Materiál");

        // ak je zákazka položky
        } else if (cp.field("Typ cenovej ponuky") == "Položky") {
            var dielyPonuky = cp.field("Diely cenovej ponuky");
            for (var d = 0; d < dielyPonuky.length; d++) {
                popis.push(dielyPonuky[d] + " materiál")
                if (dielyPouky[d] == "Výsadby") {
                    popis.push("Rastliny");
                }
            };
            for (var p = 0; p < popis.length; p++) {
                var materialPonuky = cp.field(popis[p])
                var vydajka = novyVykazMaterialu(zakazka, popis[p]);
                linkItems(vydajka, materialPonuky);
                spocitajVykaz(vydajka, "Materiál");
            };
        }
        return vydajka;
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
const linkItems = (vydajkaMaterialu, polozky) => {
    let scr.name ="linkItems 23.0.05";
    let variables = "Záznam: " + vydajkaMaterialu.name + "\n"
    let parameters = "vydajkaMaterialu: " + vydajkaMaterialu + "\npolozky: " + polozky
    try {
        vydajkaMaterialu.set("Materiál", null);
        for (var p = 0; p < polozky.length; p++) {
            vydajkaMaterialu.link("Materiál", polozky[p]);
            vydajkaMaterialu.field("Materiál")[p].setAttr("množstvo z cp", polozky[p].attr("množstvo"));
            vydajkaMaterialu.field("Materiál")[p].setAttr("cena", polozky[p].attr("cena"));
        }
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
// VÝKAZY PRÁC
// vytvorí nový záznam
const generujVykazyPrac = zakazka => {
    let scr.name = "generujVykazyPrac 23.0.09";
    let variables = "Zákazka: " +  zakazka.name + "\n"
    let parameters = "zakazka: " +  zakazka
    try {
        var cp = zakazka.field(FLD_CPN)[0];
        var typ = cp.field("Typ cenovej ponuky");
        var popis = [];

        if (typ == "Položky") {
            popis.push("Práce navyše");                         // Práce navyše
            var dielyPonuky = cp.field("Diely cenovej ponuky");
            for (var i = 0; i < dielyPonuky.length; i++) {
                popis.push(dielyPonuky[i] + " práce");                  // Závlaha, Trávnik, Výsadby, Jazierko, Kameň, Neštandardné, Subdodávky
            }
            for (var z = 0; z < popis.length; z++) {
                var polozkyPonuky = cp.field(popis[z]);
                if (popis[z] == "Práce navyše") {
                    var vykazPrac = novyVykazPrac(zakazka, popis[z]);
                    nalinkujPolozkyPonukyPraceHZS(vykazPrac, polozkyPonuky);
                    spocitajVykaz(vykazPrac, "Práce sadzby");
                } else {
                    var vykazPrac = novyVykazPrac(zakazka, popis[z]);
                    nalinkujPolozkyPonukyPrace(vykazPrac, polozkyPonuky);
                    spocitajVykaz(vykazPrac, "Práce");
                }
            }
        } else if (typ == "Hodinovka") {
            // to array
            var dielyPonuky = cp.field("Diely cenovej ponuky hzs");
            for (var d = 0; d < dielyPonuky.length; d++) {
                popis.push(dielyPonuky[d]);                             // Záhradnícke práce, Servis zavlažovanie, Konzultácie a poradenstvo
            }
            if (cp.field("+Položky")) {
                    var polozkyPonuky = cp.field("Položky")
                var vykazPrac = novyVykazPrac(zakazka, "Práce"); // vytvorí nový výkaz prác a skoíruje položky
                nalinkujPolozkyPonukyPrace(vykazPrac, polozkyPonuky);                   // nalinkuje atribúty na položky
                spocitajVykaz(vykazPrac, "Práce");
            }
            // generuj jednotlivé výkazy diel = popis
            for (var p = 0; p < popis.length; p++) {
                var polozkyPonuky = cp.field(popis[p]);             // Položky ponuky: napr.field("Záhradnícke práce")
                var vykazPrac = novyVykazPrac(zakazka, popis[p]); // vytvorí nový výkaz prác a skoíruje položky

                nalinkujPolozkyPonukyPraceHZS(vykazPrac, polozkyPonuky);                   // nalinkuje atribúty na položky
                spocitajVykaz(vykazPrac, "Práce sadzby");
            }
        } else {
            message("Nie je jasný typ účtovania zákazky")
        }
        return vykazPrac; //suma
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
const nalinkujPolozkyPonukyPrace = (vykazPrac, polozky) => {
    let scr.name = "nalinkujPolozkyPonukyPrace 23.0.01";
    let variables = "Výkaz prác: " +  vykazPrac.name
    let parameters = "vykazPrac: " +  vykazPrac + "\npolozky: " + polozky
    try {
        vykazPrac.set("Práce", null);
        for (var p = 0; p < polozky.length; p++) {
            vykazPrac.link("Práce", polozky[p]);
            vykazPrac.field("Práce")[p].setAttr("množstvo z cp", polozky[p].attr("množstvo"));
            vykazPrac.field("Práce")[p].setAttr("cena", polozky[p].attr("cena"));
        }
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
const nalinkujPolozkyPonukyPraceHZS = (vykazPrac, polozky) => {
    let scr.name = "nalinkujPolozkyPonukyPraceHZS 23.0.01";
    let variables = "Výkaz prác: " +  vykazPrac.name
    let parameters = "vykazPrac: " +  vykazPrac + "\npolozky: " + polozky
    try {
        vykazPrac.set("Práce sadzby", null);
        for (var p = 0; p < polozky.length; p++) {
            vykazPrac.link("Práce sadzby", polozky[p]);
            vykazPrac.field("Práce sadzby")[p].setAttr("množstvo z cp", polozky[p].attr("odhadovaný počet hodín"));
            vykazPrac.field("Práce sadzby")[p].setAttr("základná sadzba", polozky[p].attr("sadzba"));
        }
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
const generujVykazStrojov = zakazka => {
    let scr.name = "generujVykazStrojov 23.0.01";
    let variables = "Zákazka: " +  zakazka.name + "\n"
    let parameters = "zakazka: " +  zakazka
    try {
        var cp = zakazka.field(FLD_CPN)[0];
        var polozky = cp.field(FLD_STR);
        // vytvoriť nový výkaz
        var vykaz = novyVykazStrojov(zakazka);
        nalinkujPolozkyStrojov(vykaz, polozky);          // nalinkuje atribúty na položky
        spocitajVykaz(vykaz, FLD_STR);                      // výkaz , názov poľa položiek
        return vykaz;
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
const nalinkujPolozkyStrojov = (vykaz, polozky) => {
    let scr.name = "nalinkujPolozkyStrojov 23.0.01";
    let variables = "Výkaz : " +  vykaz.name
    let parameters = "vykaz: " +  vykaz + "\npolozky: " + polozky
    try {
        vykaz.set(FLD_STR, null);
        for (var m = 0; m < polozky.length; m++) {
            vykaz.link(FLD_STR, polozky[m]);
            vykaz.field(FLD_STR)[m].setAttr("množstvo z cp", polozky[m].attr("odhadovaný počet mth"));
            vykaz.field(FLD_STR)[m].setAttr("účtovaná sadzba", polozky[m].attr("sadzba"));
        }
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
// SPOČÍTAŤ VÝKAZY
const spocitajVykaz = (doklad, field) => {
    let scr.name = "spocitajVykaz 23.0.01"
    let variables = "Doklad : " +  doklad.name + "\nfield: " + field
    let parameters = "doklad: " +  doklad + "\nfield: " + field
    try {
        var sezona = doklad.field(SEASON);
        var sadzbaDPH = libByName(APP).find(sezona)[0].field("Základná sadzba DPH") / 100;
        var sumaBezDPH = 0;
        var sumaDPH = 0;
        var sumaCelkomSDPH = 0
        var polozky = doklad.field(field);
        for (var p = 0; p < polozky.length; p++) {
            var mnozstvo = polozky[p].attr("množstvo z cp");
            if (field == "Práce sadzby" || field == FLD_STR) {
                var cena = polozky[p].attr("základná sadzba");
            } else if (field == "Práce" || field == "Materiál")
            var cena = polozky[p].attr("cena");
            var cenaCelkom = mnozstvo * cena;
            sumaBezDPH += cenaCelkom;
        }
        sumaDPH = sumaBezDPH * sadzbaDPH;
        sumaCelkomSDPH = sumaBezDPH + sumaDPH;
        doklad.set("CP Suma bez DPH", sumaBezDPH)
        doklad.set("CP DPH", sumaDPH)
        doklad.set("CP Suma s DPH", sumaCelkomSDPH)

    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
}
// OBSOLETE
// prepočet dielov cenovej ponuky - Položky
const prepocetDielPolozky = (cp, diel) => {
    let scr.name = "prepocetDielPolozky 23.0.01"
    let variables = "Cenová ponuka : " +  cp.name
    let parameters = "cp: " +  cp + "\ndiel: " + diel
    try {
        // inicializácia
        var materialCelkom = 0;
        var praceCelkom = 0;
        var rastlinyCelkom = 0;
        var dielCelkom = 0;

        var material = cp.field(diel + " materiál");
        materialCelkom = polozkaMaterial(material);
        cp.set(diel + " materiál celkom", materialCelkom);
        dielCelkom += materialCelkom;

        var prace = cp.field(diel + " práce");
        praceCelkom = polozkaPrace(prace);
        cp.set(diel + " práce celkom", praceCelkom);
        dielCelkom += praceCelkom;

        if (diel == "Výsadby") {
            var rastliny = cp.field("Rastliny");
            rastlinyCelkom = polozkaMaterial(rastliny);
            cp.set("Rastliny celkom", rastlinyCelkom);
            dielCelkom += rastlinyCelkom;
        }

        cp.set(diel + " celkom bez DPH", dielCelkom);
        cp.set(diel, dielCelkom);
        return dielCelkom;
    } catch (error) {
        errorGen2(LIB_CPN, "libCenovePonuky.js", scr.name, error, variables, parameters);
    }
};
const prepocetDielHZS = (cp, diel) => {
// prepočet dielov cenovej ponuky - Hodinovka
    var celkom = 0;
    var prace = cp.field(diel);
    celkom = polozkaHZS(prace);
    return celkom;
};
const prepocetDielStroje = stroje => {
// prepočet jednotlivých položiek dielov - práce - Hodinovka
    var celkom = 0;
    for (var p = 0; p < stroje.length; p++) {
        var cena = stroje[p].attr("sadzba") || stroje[p].field("Cena bez DPH");
        var mnozstvo = stroje[p].attr("odhadovaný počet mth") || 2;
        stroje[p].setAttr("odhadovaný počet mth", mnozstvo);
        stroje[p].setAttr("sadzba", cena);
        stroje[p].setAttr("cena celkom", cena * mnozstvo);
        celkom += mnozstvo * cena;
    }
    return celkom;
};
const ponukaDoprava = (cp, uctovanie, cenaCelkomBezDPH) => {
// prepočet dopravy cenovej ponuky
    var celkom = 0;
    switch (uctovanie) {
        case "Paušál":
            var pausal = cp.field("Paušál");
            for (var p = 0; p < pausal.length; p++) {
                var cena = pausal[p].attr("cena") || pausal[p].field("Cena bez DPH");
                var jazd = pausal[p].attr("počet jázd") || 1;
                pausal[p].setAttr("cena", cena);
                pausal[p].setAttr("počet jázd", jazd);
                pausal[p].setAttr("cena celkom", cena * jazd);
                celkom += jazd * cena;
            }
            break;
        case "Km":
            var ckm = cp.field("Sadzba km");
            for (var p = 0; p < ckm.length; p++) {
                var cena = ckm[p].attr("cena") || ckm[p].field("Cena bez DPH");
                var jazd = ckm[p].attr("počet jázd") || 1;
                var km = ckm[p].attr("počet km") || jazd * cp.field("Miesto realizácie")[0].field("Vzdialenosť") * 2;
                ckm[p].setAttr("počet km", km);
                ckm[p].setAttr("cena", cena);
                ckm[p].setAttr("cena celkom", cena * km);
                celkom += km * cena;
            }
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
}
const polozkaHZS = prace => {
// CENOVÁ PONUKA PREPOČET
// prepočet jednotlivých položiek dielov - práce - Hodinovka
// spočítava diely ponkuky
    var celkom = 0;
    for (var p = 0; p < prace.length; p++) {
        var cena = prace[p].attr("sadzba") || prace[p].field("Cena bez DPH");
        var mnozstvo = prace[p].attr("odhadovaný počet hodín") || 3;
        prace[p].setAttr("odhadovaný počet hodín", mnozstvo);
        prace[p].setAttr("sadzba", cena);
        prace[p].setAttr("cena celkom", cena * mnozstvo);
        celkom += mnozstvo * cena;
    }
    return celkom;
};
const polozkaMaterial = material => {
// prepočet jednotlivých položiek dielov - materiál - Hodinovka, Položky
    var celkom = 0;
    for (var p = 0; p < material.length; p++) {
        var pc = material[p].field("PC bez DPH");
        var mnozstvo = material[p].attr("množstvo");
        material[p].setAttr("poznámka", material[p].field("Poznámka"));
        if (material[p].attr("cena")) {
            pc = material[p].attr("cena");
        } else {
            material[p].setAttr("cena", pc);
        }
        material[p].setAttr("cena celkom", pc * mnozstvo);
        material[p].set(VIEW, "Tlač"); //nastaví príznak view v položke skladu
        celkom += mnozstvo * pc;
    }
    return celkom;
};
const polozkaPrace = prace => {
// prepočet jednotlivých dielov - práce - Položky
    var celkom = 0;
    for (var p = 0; p < prace.length; p++) {
        var pc = prace[p].field("Cena bez DPH");
        var mnozstvo = prace[p].attr("množstvo");
        if (prace[p].attr("cena")) {
            pc = prace[p].attr("cena")
        } else {
            prace[p].setAttr("cena", pc);
        }
        prace[p].setAttr("cena celkom", pc * mnozstvo);
        celkom += mnozstvo * pc;
    }
    return celkom;
};

// ZÁKAZKY
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
// VYÚČTOVANIA
const btnVyuctovania1 = () => {
    let scr.name ="btnVyuctovania1 23.0.31"
    let variables = "Záznam: " + entry().name
    let parameters = "en: " + entry()
    let txtMsg = ""
    try {
        if (!entry().field("Zákazka")[0]) {
            message("Najprv vyber zákazku...")
            cancel()
            exit()
        }
        txtMsg = "Zákazka: " + entry().name
        //zakazka.set("Typ zákazky", zakazka.field(FLD_CPN)[0].field("Typ cenovej ponuky"))
        msgGen(LIB_EP, "libEvidenciaPrac.js", scr.name, txtMsg, variables, parameters )

        message("nastavujem záznam..." + scr.name)

        entry().set("Typ zákazky", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Typ cenovej ponuky"))
        entry().set("Evidovať", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Evidovať"))
        entry().set("Výkazy", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Evidovať"))
        let evidovat = entry().field("Evidovať")
        // for(let i=0; i<evidovat.length; i++) {
        //     message(links[i])
        //     let links = entry().field(FLD_ZKZ)[0].linksFrom(evidovat[i], "Zákazka")
        //     if (links[i] != undefined)
        //     message(links[i].name)
        // //entry().link(evidovat[i], link )
        // }
        message(evidovat)
        evidovat.forEach(element => {
            entry().set(element, entry().field(FLD_ZKZ)[0].linksFrom(element, "Zákazka")[0])
        })
    } catch (error) {
        errorGen2(LIB_EP, "libEvidenciaPrac.js", scr.name, error, variables, parameters);
    }
}
const noveVyuctovanie = zakazka => {
    var vyuctovania = libByName(LIB_VYC);
    var nVyuctovanie = new Object();
    // inicializácia
    var datum = new Date();
    var cp = zakazka.field(FLD_CPN)[0];
    var sezona = zakazka.field(SEASON);
    var cislo = noveCislo(sezona, LIB_VYC, 1, 2);
    var klient = zakazka.field("Klient")[0]
    var miesto = zakazka.field("Miesto")[0];
    var typ = cp.field("Typ cenovej ponuky");
    var uctovanieDPH = zakazka.field("Účtovanie DPH");
    var stavZakazky = zakazka.field("Stav");
    var stavVyuctovania = "Prebieha";
    // inicializácia
    var empty = []; // mazacie pole


    // vyber diely zákazky podľa typu cp
    if (typ == "Hodinovka") {
        var diely = cp.field("Diely cenovej ponuky hzs");
    } else {
        var diely = cp.field("Diely cenovej ponuky");
    }
    // popis vyúčtovania
    var popisVyuctovania = "Vyúčtovanie zákazky č." + zakazka.field(NUMBER) + " (" + cp.field("Popis cenovej ponuky") + ")";
    // stav vyúčtovania
    if (stavZakazky == "Ukončená") {
        stavVyuctovania = "Pripravené";
    }
    // Hlavička a základné nastavenia
    nVyuctovanie["Dátum"] = datum;
    nVyuctovanie[NUMBER] = cislo;
    nVyuctovanie["Miesto realizácie"] = miesto;
    nVyuctovanie["Stav vyúčtovania"] = stavVyuctovania;
    nVyuctovanie["Typ vyúčtovania"] = typ;
    nVyuctovanie["+Materiál"] = cp.field("+Materiál");
    nVyuctovanie["+Mechanizácia"] = cp.field("+Mechanizácia");
    nVyuctovanie["+Subdodávky"] = cp.field("+Subdodávky");
    nVyuctovanie["+Položky"] = cp.field("+Položky");
    nVyuctovanie["Účtovanie dopravy"] = cp.field("Účtovanie dopravy");
    nVyuctovanie["Klient"] = klient;
    nVyuctovanie["Popis vyúčtovania"] = popisVyuctovania;
    nVyuctovanie[FLD_CPN] = cp;
    nVyuctovanie[FLD_ZKZ] = zakazka;
    nVyuctovanie[SEASON] = sezona;
    nVyuctovanie["Diely vyúčtovania"] = diely.join();
    // doprava
    nVyuctovanie["Účtovanie DPH"] = uctovanieDPH.join();
    nVyuctovanie["Paušál"] = cp.field("Paušál")[0];
    nVyuctovanie["Sadzba km"] = cp.field("Sadzba km")[0];
    nVyuctovanie["% zo zákazky"] = cp.field("% zo zákazky");
    vyuctovania.create(nVyuctovanie);

    var vyuctovanie = vyuctovania.find(cislo)[0];
    zakazka.set(FLD_VYC, empty);
    zakazka.link(FLD_VYC, vyuctovanie);
    return vyuctovanie;
}
const nalinkujMaterial = (vyuctovanie, vydajka) => {
    var vydajkaCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vydajka.field(FLD_PPS);
    vyuctovanie.set(popis, empty);
    // položky z výdajky do array
    var polozkyVydajka = vydajka.field(FLD_MAT);
    var typVydajky = vydajka.field("Typ výkazu");
    if (typVydajky == "Hodinovka") {
        var polozkyVyuctovanie = vyuctovanie.field(popis);
    } else if (typVydajky == "Položky") {
        var polozkyVyuctovanie = vyuctovanie.field(popis + " materiál");
        if (popis == "Rastliny") {
            var polozkyVyuctovanie = vyuctovanie.field(popis);
        }

    } else {
    }
    // nastav atribúty položiek vo vyúčtovaní
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
const nalinkujPrace = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
    var popis = vykazPrac.field(FLD_PPS);
    // vynuluj staré položky

    var polozky = vyuctovanie.field(popis);
    if (polozky.length > 0) {
        for (var p in polozky) {
            vyuctovanie.unlink(popis, polozky[p]);
        }
        vyuctovanie.set(popis + " celkom", null);
    }
    // práce navyše ošetriť inak

    var polozkyVykazPrac = vykazPrac.field(FLD_PRC);
    if (popis == "Práce navyše") {
        for (var m = 0; m < polozkyVykazPrac.length; m++) {
            var mnozstvo = polozkyVykazPrac[m].attr("dodané množstvo");
            var cena = polozkyVykazPrac[m].attr("cena");
            var cenaCelkom = polozkyVykazPrac[m].attr("cena celkom");
            vyuctovanie.link(popis, polozkyVykazPrac[m])
            vyuctovanie.field(popis)[m].setAttr("počet hodín", mnozstvo);
            vyuctovanie.field(popis)[m].setAttr("účtovaná sadzba", cena);
            vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
            vykazPracCelkom += cenaCelkom;
            // nastav príznak Tlač
            setTlac(polozkyVykazPrac[m]);
        }
    } else {
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
    }



    vyuctovanie.set(popis + " celkom", vykazPracCelkom);
    return vykazPracCelkom;
}
const nalinkujPraceHZS = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
    // message("Vyýkaz prác " + vykazPrac.title);
    var pocitanieHodinovychSadzieb = vykazPrac.field(FLD_CPN)[0].field("Počítanie hodinových sadzieb");
    var popis = vykazPrac.field(FLD_PPS);
    var polozky = vyuctovanie.field(popis);
    // vynuluj staré položky
    if (polozky.length > 0) {
        for (var p in polozky) {
            vyuctovanie.unlink(popis, polozky[p]);
        }
        vyuctovanie.set(popis + " celkom", null);
    }
    // vynuluj staré položky rozpisu prác
    var polozkyRozpis = vyuctovanie.field("Rozpis " + popis);
    if (polozkyRozpis.length > 0) {
        for (var p in polozkyRozpis) {
            vyuctovanie.unlink("Rozpis " + popis, polozkyRozpis[p]);
        }
    }
    var vykazPraceSadzby = vykazPrac.field("Práce sadzby")[0];
    var vykazPraceSadzbyCelkom = 0;
    var cenaCelkom = 0;
    var hodinCelkom = 0;
    var uctovanaSadzba = 0;
    vyuctovanie.link(popis, vykazPraceSadzby);
    var evidenciaLinks = vykazPrac.linksFrom(LIB_EP, "Výkaz prác");
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
    var popis = vykazStrojov.field(FLD_PPS);
    vyuctovanie.set(popis, empty);

    var polozkyVykaz = vykazStrojov.field(FLD_STR);
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

// End of file: 10.11.2023