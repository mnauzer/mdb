const prepocetPonuky = en => {
    let scriptName ="prepocetPonuky 23.0.01";
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
        var season = getSeason(en, DB_CENOVE_PONUKY, scriptName);
        var sadzbaDPH = libByName(DB_ASSISTENT).find(season)[0].field("Základná sadzba DPH") / 100;
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
        switch (typ) {
            case "Položky":
                var diely = en.field("Diely cenovej ponuky");
                // prejsť všetky diely a spočítať práce a materiál
                if (diely) {
                    for (var d = 0; d < diely.length; d++) {
                        cenaCelkomBezDPH += prepocetDielPolozky(en, diely[d]);
                    }
                }
                break;
            case "Hodinovka":
                var diely = en.field("Diely cenovej ponuky hzs");
                if (diely) {
                    for (var d = 0; d < diely.length; d++) {
                        pracaCelkom += prepocetDielHZS(en, diely[d]);
                    }
                    if (en.field("+Materiál")) {
                        // spočítať  materiál
                        var material = en.field("Materiál");
                        materialCelkom = polozkaMaterial(material);
                        en.set("Materiál hzs", materialCelkom);
                        en.set("Materiál celkom bez DPH", materialCelkom);
                    }
                    if (en.field("+Mechanizácia")) {
                        // spočítať mechanizácie
                        var stroje = en.field(FIELD_STROJE);
                        strojeCelkom = prepocetDielStroje(stroje);
                        en.set("Využitie mechanizácie", strojeCelkom);
                        en.set("Stroje celkom bez DPH", strojeCelkom);
                    }
                    cenaCelkomBezDPH = materialCelkom + strojeCelkom + pracaCelkom;

                }
                break;
            case "Ad Hoc":
                message("I'am thinking about it!");
                break;
        }

        // Doprava každopádne
        var dopravaCelkom = ponukaDoprava(en, uctoDopravy, cenaCelkomBezDPH); // cenová ponuka + spôsob účtovania dopravy

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
        let msgTxt = "Hotovo...\nCena ponuky bez DPH je: " + cenaCelkomBezDPH.toFixed(1) + "€"
        message(msgTxt)
        msgGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, msgTxt, variables, parameters)
    } catch (error) {
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters)
    }
}

const generujZakazku = cp => {
    var scriptName ="generujZakazku 23.1.02";
    let variables = "Záznam: " + cp.name + "\n"
    let parameters = "cp: " + cp + "\n"
    if(cp == undefined){
        msgGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, "chýba parameter cp - cenová ponuka", variables, parameters );
        cancel();
        exit();
    }

    try {
        var season = getSeason(cp, DB_CENOVE_PONUKY, scriptName);
      //  var en = cp.linksFrom(DB_ZAKAZKY, "Cenová ponuka");
        var stav = cp.field("Stav cenovej ponuky");
        if (stav == "Schválená") {
            // vygenerovať novú zákazku
            let zakazky = libByName(DB_ZAKAZKY);
            let appDB = getAppSeasonDB(season, zakazky.title, scriptName);
            let newNumber = getNewNumber(appDB, season, true, DB_CENOVE_PONUKY, scriptName);
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
            var novaZakazka = new Object();
            novaZakazka[DATE] = new Date();
            novaZakazka["Typ zákazky"] = typZakazky;
            novaZakazka[NUMBER] = newNumber;
            novaZakazka["Klient"] = cp.field("Klient")[0];
            novaZakazka["Identifikátor"] = cp.field("Klient")[0].field("Nick") + ', ' + cp.field("Miesto realizácie")[0].field("Lokalita");
            novaZakazka["Miesto"] = cp.field("Miesto realizácie")[0];
            novaZakazka["Stav zákazky"] = "Čakajúca"; // hardcoded
            novaZakazka["Názov zákazky"] = cp.field("Popis cenovej ponuky");
            novaZakazka["Diely zákazky"] = dielyZakazky.join();
            novaZakazka["Cenová ponuka"] = cp;
            novaZakazka[SEASON] = season;
            novaZakazka["Účtovanie DPH"] = ["Práce", "Materiál", "Doprava", "Mechanizácia"]; // hardcoded
            novaZakazka["Účtovanie zákazky"] = cp.field("Typ cenovej ponuky");
            zakazky.create(novaZakazka);

            // inicializácia premennej z posledného záznamu
            var zakazka = cp.linksFrom(DB_ZAKAZKY, FIELD_CENOVA_PONUKA)[0];
            let msgTxt = "Zákazka č." + zakazka.field(NUMBER) + " bola vygenerovaná";
            message(msgTxt);
            msgGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, msgTxt, variables, parameters);

            // generovanie výkazov
            if (cp.field("Typ cenovej ponuky") == "Hodinovka") {
                generujVykazyPrac(zakazka);
                //generujVykazDopravy(zakazka)
                if (cp.field("+Materiál")) {
                    generujVykazyMaterialu(zakazka);
                }
                if (cp.field("+Mechanizácia")) {
                    message("generujVykazStrojov...");
                    generujVykazStrojov(zakazka);
                }
                if (cp.field("+Položky")) {
                    message("generujVykazyPrac...");
                    generujVykazyPrac(zakazka);
                }
            } else if (cp.field("Typ cenovej ponuky") == "Položky") {
                message("generujVykazyPrac2...");
                generujVykazyPrac(zakazka);
                message("generujVykazyMaterialu...");
                generujVykazyMaterialu(zakazka);
            } else {
                message("Nie je jasný typ zákazky");
            }
            cp.set("Stav cenovej ponuky", "Uzavretá");
        } else if (cp.linksFrom(DB_ZAKAZKY, FIELD_CENOVA_PONUKA)[0]) {
            let msgTxt = "Z cenovej ponuky už je vytvorená zákazka č." + cp.linksFrom(DB_ZAKAZKY, FIELD_CENOVA_PONUKA)[0];
            message(msgTxt);
            msgGenGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, msgTxt, variables, parameters);
            cancel();
            exit();
        } else {
            let msgTxt = "Cenová ponuka musí byť schválená";
            msgGenGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, msgTxt, variables, parameters);
            message(msgTxt);
            cancel();
            exit();
        }
    } catch (error) {
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
        cancel();
        exit();
    }
}

// VÝDAJKY
// generuj nové výdajky

const generujVykazyMaterialu = zakazka => {
    let scriptName ="generujVykazyMaterialu 23.0.03";
    let variables = "Zákazka: " + zakazka.name;
    let parameters = "zakazka: " + zakazka
    try {
        var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
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
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}
const linkItems = (vydajkaMaterialu, polozky) => {
    let scriptName ="linkItems 23.0.05";
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
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}

// VÝKAZY PRÁC
// vytvorí nový záznam

const generujVykazyPrac = zakazka => {
    let scriptName = "generujVykazyPrac 23.0.09";
    let variables = "Zákazka: " +  zakazka.name + "\n"
    let parameters = "zakazka: " +  zakazka + "\n"
    if(zakazka == undefined){
        msgGen("libCenovePonuky.js", scriptName, "zakazka entry is undefined", variables, parameters );
        cancel();
        exit();
    }
    try {
       // var season = getSeason(zakazka, DB_CENOVE_PONUKY, scriptName);
        var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
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
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}
const nalinkujPolozkyPonukyPrace = (vykazPrac, polozky) => {
    let scriptName = "nalinkujPolozkyPonukyPrace 23.0.01";
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
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}
const nalinkujPolozkyPonukyPraceHZS = (vykazPrac, polozky) => {
    let scriptName = "nalinkujPolozkyPonukyPraceHZS 23.0.01";
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
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}

// STROJE
// vytvorí nový záznam

// const novyVykazStrojov = (zakazka) => {
//     // inicializácia
//     var lib = libByName("Výkaz strojov");
//     var cp = zakazka.field("Cenová ponuka")[0];
//     var typVykazu = cp.field("Typ cenovej ponuky");
//     var datum = zakazka.field("Dátum");
//     var sezona = zakazka.field(SEASON);
//     var cislo = noveCislo(sezona, "Výkaz strojov", 0, 3);
//     // vytvoriť novú výdajku
//     var novyVykaz = new Object();
//     novyVykaz[NUMBER] = cislo;
//     novyVykaz["Dátum"] = datum;
//     novyVykaz["Popis"] = FIELD_STROJE;          // Jediný typ výkazu v knižnici
//     novyVykaz["Typ výkazu"] = typVykazu;  // výkaz strojov je len pri hodinovej sadzbe
//     novyVykaz["s DPH"] = true; //harcoded
//     novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
//     novyVykaz["Vydané"] = "Zákazka";
//     novyVykaz["Zákazka"] = zakazka;
//     novyVykaz["Cenová ponuka"] = cp;
//     novyVykaz[SEASON] = sezona;
//     lib.create(novyVykaz);
//     var vykazStrojov = lib.find(cislo)[0];

//     return vykazStrojov;
// }
const generujVykazStrojov = zakazka => {
    let scriptName = "generujVykazStrojov 23.0.01";
    let variables = "Zákazka: " +  zakazka.name + "\n"
    let parameters = "zakazka: " +  zakazka
    try {
        var cp = zakazka.field("Cenová ponuka")[0];
        var strojePolozky = cp.field(FIELD_STROJE);
        // vytvoriť nový výkaz
        var vykazStrojov = novyVykazStrojov(zakazka);
        nalinkujPolozkyStrojov(vykazStrojov, strojePolozky);          // nalinkuje atribúty na položky
        spocitajVykaz(vykazStrojov, FIELD_STROJE);                      // výkaz , názov poľa položiek
        return vykazStrojov;
    } catch (error) {
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}

const nalinkujPolozkyStrojov = (vykaz, polozky) => {
    let scriptName = "nalinkujPolozkyStrojov 23.0.01";
    let variables = "Výkaz : " +  vykaz.name
    let parameters = "vykaz: " +  vykaz + "\npolozky: " + polozky
    try {
        vykaz.set(FIELD_STROJE, null);
        for (var m = 0; m < polozky.length; m++) {
            vykaz.link(FIELD_STROJE, polozky[m]);
            vykaz.field(FIELD_STROJE)[m].setAttr("množstvo z cp", polozky[m].attr("odhadovaný počet mth"));
            vykaz.field(FIELD_STROJE)[m].setAttr("účtovaná sadzba", polozky[m].attr("sadzba"));
        }
    } catch (error) {
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}


// SPOČÍTAŤ VÝKAZY
const spocitajVykaz = (doklad, field) => {
    let scriptName = "spocitajVykaz 23.0.01"
    let variables = "Doklad : " +  doklad.name
    let parameters = "doklad: " +  doklad + "\nfield: " + field
    try {
        var sezona = doklad.field(SEASON);
        var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
        var sumaBezDPH = 0;
        var sumaDPH = 0;
        var sumaCelkomSDPH = 0
        var polozky = doklad.field(field);
        for (var p = 0; p < polozky.length; p++) {
            var mnozstvo = polozky[p].attr("množstvo z cp");
            if (field == "Práce sadzby" || field == FIELD_STROJE) {
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
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
}
//

// OBSOLETE

// prepočet dielov cenovej ponuky - Položky
const prepocetDielPolozky = (cp, diel) => {
    let scriptName = "prepocetDielPolozky 23.0.01"
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
        errorGen(DB_CENOVE_PONUKY, "libCenovePonuky.js", scriptName, error, variables, parameters);
    }
};

// prepočet dielov cenovej ponuky - Hodinovka
const prepocetDielHZS = (cp, diel) => {
    var celkom = 0;
    var prace = cp.field(diel);
    celkom = polozkaHZS(prace);
    return celkom;
};

// prepočet jednotlivých položiek dielov - práce - Hodinovka
const prepocetDielStroje = stroje => {
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

// prepočet dopravy cenovej ponuky
const ponukaDoprava = (cp, uctovanie, cenaCelkomBezDPH) => {
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

// CENOVÁ PONUKA PREPOČET
// spočítava diely ponkuky
// prepočet jednotlivých položiek dielov - práce - Hodinovka
const polozkaHZS = prace => {
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

// prepočet jednotlivých položiek dielov - materiál - Hodinovka, Položky
const polozkaMaterial = material => {
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

// prepočet jednotlivých dielov - práce - Položky
const polozkaPrace = prace => {
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
// End of file: 14.03.2022, 07:51aa