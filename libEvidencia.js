// DOCHÁDZKA
const newEntryDochadzka = en => {
    let scriptName = "newEntryDochadzka 23.0.07"
    let parameters = "en: " + en
    let memLib = lib().title
    let variables = "user: " + user()
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, memLib, scriptName)
        variables += "\nseason: " + season
        let appDB = getAppSeasonDB(season, memLib, scriptName)
        variables += "\nappDB: " + appDB
        let number = getNewNumber(appDB, season, memLib, scriptName)
        variables += "\nnumber: " + number
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set(NUMBER_ENTRY, number[1])
        en.set(SEASON, season)
        let msgTxt = "nový záznam dochádzky č. " + number[0]
        msgGen(memLib, "appAsistanto.js", scriptName, msgTxt, variables, parameters);
        return sadzba;
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters)
    }
}
const updateEntryDochadzka = en => {
    let scriptName = "updateEntryDochadzka 23.0.01"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "\nmemLib: " + memLib
    let parameters = "en: " + en
    message("Úprava záznamu - " + memLib);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters);
    }
}
const saveEntryDochadzka = en => {
    let scriptName = "saveEntryDochadzka 23.0.02"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, memLib)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, memLib)
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters);
    }
}
const prepocitatZaznamDochadzky = en => {
    let scriptName = "prepocitatZaznamDochadzky 23.0.06"
    let variables = "user: " + user()
    let parameters = "en: " + en
    try {
        // výpočet pracovnej doby
        let prichod = roundTimeQ(en.field("Príchod")); //zaokrúhlenie času na 15min
        let odchod = roundTimeQ(en.field("Odchod"));
        let datum = en.field(DATE)
        let zavazok = en.field("Generovať záväzky")
        let pracovnaDoba = (odchod - prichod) / 3600000;
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);
        let mzdyCelkom = 0; // mzdy za všetkých zamestnancov v ten deň
        let odpracovaneCelkom = 0; // odpracovane hod za všetkýh zamestnancov
        let evidenciaCelkom = 0; // všetky odpracované hodiny z evidencie prác
        let prestojeCelkom = 0; //TODO ak sa budú evidovať prestojeCelkom
        let zamestnanci = en.field("Zamestnanci");
        let evidenciaPrac = en.field("Práce");
        if (zamestnanci.length > 0) {
            for (let z = 0; z < zamestnanci.length; z++) {
                let hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : sadzbaZamestnanca(zamestnanci[z], datum, scriptName);
                zamestnanci[z].setAttr("hodinovka", hodinovka);

                let hodnotenie = zamestnanci[z].attr("hodnotenie") ? zamestnanci[z].attr("hodnotenie") : 5;
                let dennaMzda = zamestnanci[z].attr("denná mzda") ? zamestnanci[z].attr("denná mzda") : 0; // jedného zamestnanca
                // premenné z knižnice zamestnanci
                let Zarobene = zamestnanci[z].field("Zarobené") - dennaMzda;
                let Odrobene = zamestnanci[z].field("Odpracované"); // len v úprave zázbanz, odpočíta od základu už vyrátanú hodnotu
                let Vyplatene = zamestnanci[z].field("Vyplatené");
                let HodnotenieD = zamestnanci[z].field("Dochádzka");

                dennaMzda = (pracovnaDoba * (hodinovka
                    + zamestnanci[z].attr("+príplatok (€/h)")))
                    + zamestnanci[z].attr("+prémia (€)")
                    - zamestnanci[z].attr("-pokuta (€)");
                zamestnanci[z].setAttr("denná mzda", dennaMzda);
                zamestnanci[z].setAttr("hodnotenie", hodnotenie);
                // nastavenie v knižnici zamestnanci
                Zarobene += dennaMzda;
                Odrobene += pracovnaDoba;
                HodnotenieD += hodnotenie;
                let Nedoplatok = Zarobene - Vyplatene;

                zamestnanci[z].set("Zarobené", Zarobene);
                zamestnanci[z].set("Odpracované", Odrobene);
                zamestnanci[z].set("Preplatok/Nedoplatok", Nedoplatok);
                zamestnanci[z].set("Dochádzka", HodnotenieD);
                if (zavazok) {
                    let stareZavazky = zamestnanci[z].linksFrom(LIB_ZVK, "Dochádzka")
                    if(stareZavazky){
                        for (let i in stareZavazky)
                        stareZavazky[i].trash()
                    } else {
                        if (z == 0 ) {message("Generujem záväzky......")} // message only once
                        newEntryZavazky(zamestnanci[z], en, dennaMzda)
                    }
                }
                mzdyCelkom += dennaMzda;
                odpracovaneCelkom += pracovnaDoba;
                //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
                if (evidenciaPrac) {
                    for (var ep in evidenciaPrac) {
                        var zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                        var naZakazke = evidenciaPrac[ep].field("Odpracované/os");
                        for (var znz in zamNaZakazke) {
                            if (zamestnanci[z].field(NICK) == zamNaZakazke[znz].field(NICK)) {
                                evidenciaCelkom += naZakazke;
                            }
                        }
                    }
                }
            }
        }
        prestojeCelkom = odpracovaneCelkom - evidenciaCelkom;
        // TODO zaevidovať prestoje do databázy zákaziek na zákazku Krajinka
        en.set("Mzdové náklady", mzdyCelkom.toFixed(2));
        en.set("Pracovná doba", pracovnaDoba);
        en.set("Odpracované", odpracovaneCelkom);
        en.set("Na zákazkách", evidenciaCelkom);
        en.set("Prestoje", prestojeCelkom);
        message("Hotovo...");
    } catch (error) {
        errorGen(LIB_DOCH, 'appAsistanto.js', scriptName, error, variables, parameters);
    }
}
const aSalary = (en, NEW_ENTRY) => {
    let scriptName = "aSalary 23.0.01"
    let variables = "Záznam: " + en.name + "\nNEW_ENTRY: " + NEW_ENTRY
    let parameters = "en: " + en + "\nNEW_ENTRY: " + NEW_ENTRY
    try {
        var salaries = libByName(DBA_SAL);
        var zamestnanci = en.field(DOCH_zamestnanci);
        if (NEW_ENTRY) {

        } else {
            var links = en.linksFrom(DBA_SAL, FLD_DOCH)
            // skontrolovať či je už záznam nalinkovaný
            if (links.length > 0){
                //vymaž nalinkované záznamy
                message("Mažem už nalinkované záznamy");
                for (var l = 0; l < links.length; l++){
                    links[l].trash();
                }
            }
        }
        for (var z = 0; z < zamestnanci.length; z++) {
            var newEntry = new Object();
            newEntry[DATE] = en.field(DATE);
            newEntry[NICK] =  zamestnanci[z].field(NICK);
            newEntry["Odpracované"] = en.field("Pracovná doba");
            newEntry["Sadzba"] =  zamestnanci[z].attr("hodinovka");
            newEntry["Mzda"] =  zamestnanci[z].attr("denná mzda");
            newEntry["Vyplatiť"] =  zamestnanci[z].attr("denná mzda");
            newEntry[SEASON] = en.field(DATE).getFullYear();
            newEntry[FLD_DOCH] = en;
            newEntry["Zamestnanec"] = zamestnanci[z];
            salaries.create(newEntry);
            var entrySalaries = en.linksFrom(DBA_SAL,FLD_DOCH)[0];
            entrySalaries.field(FLD_DOCH)[0].setAttr("odpracované", en.field("Pracovná doba"));
            entrySalaries.field("Zamestnanec")[0].setAttr("sadzba", zamestnanci[z].attr("hodinovka"));
            // zauctuj preplatok ak je
            var preplatokLinks = zamestnanci[z].linksFrom("Pokladňa", "Zamestnanec").filter(e => e.field("Preplatok na mzde") == true);
            if (preplatokLinks.length > 0) {
                message("Účtujem preplatky");
                for (var l = 0; l < preplatokLinks.length; l++) {
                    var preplatok = preplatokLinks[l].field("Preplatok");
                    var vyplata = entrySalaries.field("Vyplatiť");
                    if (preplatok >= vyplata) {
                        entrySalaries.set("Vyplatiť", vyplata);
                        entrySalaries.link("Platby", preplatokLinks[l]);
                        entrySalaries.field("Platby")[0].setAttr("suma", vyplata);
                        preplatok -= vyplata;
                        preplatokLinks[l].set("Preplatok", preplatok);
                    } else if ( preplatok != 0 && preplatok < vyplata){
                        entrySalaries.set("Vyplatená mzda", preplatok);
                        entrySalaries.set("Vyplatiť", vyplata - preplatok);
                        entrySalaries.link("Platby", en);
                        entrySalaries.field("Platby")[0].setAttr("suma", preplatok);

                    }
                }

            }
        }
    } catch (error) {
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters);
    }
}

// EVIDENCIA PRÁC
const newEntryEvidenciaPrac = en => {
    let scriptName = "newEntryEvidenciaPrac 23.0.02"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    message("Nový záznam - " + memLib)
    try {
        setEntry(en, scriptName)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(LIB_EP, "libEvidenciaPrac.js", scriptName, error, variables, parameters)
    }
}
const updateEntryEvidenciaPrac = en => {
    let scriptName = "updateEntryEvidenciaPrac 23.0.02"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    message("Úprava záznamu - " + memLib);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(LIB_EP, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
}
const saveEntryEvidenciaPrac = en => {
    let scriptName = "saveEntryEvidenciaPrac 23.0.01"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    try {
        prepocetZaznamuEvidenciePrac(en)
        saveEntry(en, memLib)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(LIB_EP, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
}
const evidenciaSadzbaPrace = (vykazPrac, hodinyCelkom) => {
    let scriptName ="evidenciaSadzbaPrace 23.0.01";
    let variables = "Záznam: " + vykazPrac.name + "\n"
    let parameters = "vykazPrac: " + vykazPrac + "\nhodinyCelkom: " + hodinyCelkom
    if(vykazPrac == undefined){
        msgGen(LIB_EP, "libEvidenciaPrac.js", scriptName, "chýba parameter vykazPrac", variables, parameters )
        cancel()
        exit()
    }
    try {
        let zakladnaSadzba = vykazPrac.field("Práce sadzby")[0].field("Cena bez DPH")
        // zistiť zľavu podľa počtu odpracovaných hodín
        let zlava = 0;
        let limity = vykazPrac.field("Práce sadzby")[0].field("Limity")
        for (let m = 0; m < limity.length; m++) {
            if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
                zlava = limity[m].field("Zľava");
            }
        }
        let sadzba = zakladnaSadzba - (zakladnaSadzba * zlava / 100)
        return sadzba
    } catch (error) {
        errorGen(LIB_EP, "libEvidenciaPrac.js", scriptName, error, variables, parameters)
        cancel()
        exit()
    }
};
const btnFill = () => {
    let scriptName ="btnFill 23.0.05"
    let variables = "Záznam: " + entry().name
    let parameters = "en: " + entry()
    let txtMsg = ""
    try {
        if (!entry().field(FLD_ZKZ)[0]) {
            message("Najprv vyber zákazku...")
            cancel()
            exit()
        }
        txtMsg = "Zákazka: " + entry().name
        //zakazka.set("Typ zákazky", zakazka.field(FLD_CPN)[0].field("Typ cenovej ponuky"))
        msgGen(LIB_EP, "libEvidenciaPrac.js", scriptName, txtMsg, variables, parameters )

        message("nastavujem záznam..." + scriptName)

        entry().set("Typ zákazky", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Typ cenovej ponuky"))
        entry().set("Evidovať", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Evidovať"))
        entry().set("Výkazy", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Výkazy"))
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
        errorGen(LIB_EP, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
}
const prepocetZaznamuEvidenciePrac = en => {
    let scriptName ="prepocetZaznamuEvidenciePrac 23.0.08";
    let variables = "Záznam: " + en.name
    let parameters = "en: " + en
    try {
        let date = en.field(DATE)
        let typ = en.field("Typ zákazky");
        if (typ == "Hodinovka") {
            //TODO opraviť chybu keď nie je zadaná zákazka
            let vykaz = en.field("Výkaz prác")[0]
            if (vykaz != undefined) {
                en.set(FLD_ZKZ, vykaz.field(FLD_ZKZ)[0]);
            } else {
                msgGen(LIB_EP, "libEvidenciaPrac.js",  scriptName, "nie je zadaná zákazka", variables, parameters)
            }
        } else if (typ == "Položky") {
        }
        let zamestnanci = en.field(FLD_ZAMESTNANCI)
        let odpracovane = 0
        let mzdoveNakladyCelkom = 0
        let nakladyZamestnatec = 0
        let casOd = roundTimeQ(en.field("Od"))
        let casDo = roundTimeQ(en.field("Do"))
        let trvanie = (casDo - casOd) / 3600000
        // dosaď mzdy zamestnancov
        for (let z = 0; z < zamestnanci.length; z++) {
            // sadzba buď tá zadaná, alebo zisti zo záznamu zamestnanca

            let hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : lastValid(zamestnanci[z].linksFrom(LIB_SZ, FLD_ZAM), date,"Sadzba", "Platnosť od", scriptName );
            zamestnanci[z].setAttr("hodinovka", hodinovka);
            odpracovane += trvanie;
            nakladyZamestnatec = trvanie * hodinovka;
            mzdoveNakladyCelkom += nakladyZamestnatec;
        };
        // set recap first
        en.set("Od", casOd);
        en.set("Do", casDo);
        en.set("Počet pracovníkov", zamestnanci.length)
        en.set("Odpracované", odpracovane)
        en.set("Mzdové náklady", mzdoveNakladyCelkom)
        en.set("Trvanie", trvanie)
        // checkbuttons
        let evidovat = en.field("Evidovať")
        let evStroje = evidovat.includes("Stroje")
        let evMaterial = evidovat.includes("Materiál")
        let evPrace = evidovat.includes("Výkaz prác")
        let evDoprava = evidovat.includes("Dopravu")
        // PRÁCE
        if (evPrace) {
            let vykazPrac = en.field("Výkaz prác")// práce, zamestnancov, trvanie, hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
            for (let v = 0; v < vykazPrac.length; v++) {
                // zistiť hodinovú sadzbu
                let sadzba = evidenciaSadzbaPrace(vykazPrac[v], odpracovane) // TODO: refaktoring funkcie
                let uctovanie = vykazPrac[v].field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb")
                vykazPrac[v].setAttr("práce", en.field("Vykonané práce"))
                vykazPrac[v].setAttr( "zamestnancov", zamestnanci.length)
                vykazPrac[v].setAttr("trvanie", en.field("Vykonané práce"))
                vykazPrac[v].setAttr("hodín", odpracovane)
                if (uctovanie == "Individuálne za každý výjazd") {
                    vykazPrac[v].setAttr("hzs", sadzba)
                    vykazPrac[v].setAttr("cena", odpracovane * sadzba)
                }
            }
        }

        //STROJE
        if (evStroje) {
            let vykazStrojov = en.field("Výkaz strojov")// hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
            let vyuzitieStrojov = en.field("Využitie strojov");
            if (vyuzitieStrojov) {

            } else {
                message("V zázname nie su vybraté žiadne využité stroje");
            }
        }
        //MATERIÁL
        if (evMaterial) {
            let vykazMaterialu = en.field("Výkaz materiálu")// hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
        }
        //DOPRAVA
        if (evDoprava) {
            let vykazDopravy = en.field("Výkaz dopravy")// hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
        }
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(LIB_EP, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }

}

// KNIHA JÁZD

// NEW AND UPDATE ENTRY
const newEntryKnihaJazd= en => {
    let scriptName = "newEntryKnihaJazd23.0.01"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    message("Nový záznam - " + memLib)
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, memLib, scriptName)
        let appDB = getAppSeasonDB(season, memLib, scriptName)
        let number = getNewNumber(appDB, season, memLib, scriptName)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, memLib)
        errorGen(LIB_KJ, "libKnihaJazd.js", scriptName, error, variables, parameters)
    }
}
const updateEntryKnihaJazd= en => {
    let scriptName = "updateEntryKnihaJazd23.0.01"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    message("Úprava záznamu - " + memLib);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, memLib)
        errorGen(LIB_KJ, "libKnihaJazd.js", scriptName, error, variables, parameters);
    }
}
const saveEntryKnihaJazd= en => {
    let scriptName = "saveEntryKnihaJazd23.0.01"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, memLib)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, memLib)
        errorGen(LIB_KJ, "libKnihaJazd.js", scriptName, error, variables, parameters);
    }
}
const spocitatDopravu = (zakazka, cenaCelkomBezDPH) => {
    var jazd = zakazkaPocetJazd(zakazka);
    var cp = zakazka.field(FLD_CP)[0];
    var vyuctovanie = zakazka.field(FLD_VYUCTOVANIE)[0];
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
    var links = zakazka.linksFrom(LIB_KJ, "Zákazka")
    var zastavky = zakazka.linksFrom(LIB_KJ, "Zastávka na zákazke")
    var jazd = 0;
    if (links.length > 0 || zastavky.length > 0) {
        for (var p = 0; p < links.length; p++) {
            if (links[p].field("Účel jazdy") == "Výjazd") {
                jazd += 1;
            }
        };
        for (var p = 0; p < zastavky.length; p++) {
            var remoteLinks = zastavky[p].field("Zastávka na zákazke");
            rlIndex = getLinkIndex(zakazka, remoteLinks)
            if (remoteLinks[rlIndex].attr("účtovať jazdu") == true) {
                jazd += 1;
            }
        };
    }
    return jazd;
};
const zakazkaKm = zakazka => {
    var links = zakazka.linksFrom(LIB_KJ, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += (links[p].field("Najazdené km"));
        };
    }
    return result;
};
const zakazkaCasJazdy = zakazka => {
    var links = zakazka.linksFrom(LIB_KJ, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += links[p].field("Trvanie") * links[p].field("Posádka").length;
        };
    }
    return result;
};
const prepocitatJazdu = jazda => {
    message("Prepočítavam záznam...");
    var ciel = jazda.field("Cieľ");
    var start = jazda.field("Štart");
    var trvanie = jazda.field("Trvanie");
    var vzdialenostStart = start[0].field("Vzdialenosť");
    var vzdialenostCiel = ciel[0].field("Vzdialenosť");
    var trvanieCiel = ciel[0].field("Trvanie");
    var trvanieStart = start[0].field("Trvanie");
    var ucelJazdy = "Neurčené";
    if (jazda.field("Zákazka")[0].field("Cenová ponuka")[0]) {
        var uctovanie = jazda.field(FLD_ZAKAZKA)[0].field(FLD_CP)[0].field("Účtovanie dopravy");
    } else {
        var uctovanie = "Neúčtovať";

    }

    if (ciel && start) {
        if (vzdialenostCiel == 0 && trvanieCiel == 0) {
            vzdialenostCiel = vzdialenostStart;
            trvanieCiel = trvanieStart;
            ucelJazdy = "Návrat";
        } else if (vzdialenostStart == 0 && trvanieStart == 0) {
            ucelJazdy = "Výjazd";
        }

        jazda.set("Najazdené km", vzdialenostCiel);
        jazda.set("Trvanie", (trvanieCiel / 3600000).toFixed(2));
        jazda.set("Účel jazdy", ucelJazdy);
        switch (uctovanie) {
            case "Paušál":
                if (ucelJazdy == ("Návrat")) {
                    jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                } else {
                    jazda.set("Spôsob účtovania jazdy", "Paušál");
                }
                break;
            case "Km":
                jazda.set("Spôsob účtovania jazdy", "Km");
                break;
            case "% zo zákazky":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
            case "Pevná cena":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
            case "Neúčtovať":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
        }
    } else {
        message("Nie sú všetky potrebné údaje");
    }
    message("Hotovo");
    // End of file: 22.03.2022, 14:54
}

// POKLADŇA
const newEntryPokladna = en => {
    let scriptName = "newEntryPokladna 23.0.01"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    message("Nový záznam - " + memLib)
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, memLib, scriptName)
        let appDB = getAppSeasonDB(season, memLib, scriptName)
        let number = getNewNumber(appDB, season, memLib, scriptName)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, memLib)
        errorGen(LIB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters)
    }
}
const updateEntryPokladna = en => {
    let scriptName = "updateEntryPokladna 23.0.01"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    message("Úprava záznamu - " + memLib);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, memLib)
        errorGen(LIB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters);
    }
}
const saveEntryPokladna = en => {
    let scriptName = "saveEntryPokladna 23.0.02"
    let memLib = lib().title
    let variables = "Záznam: " + en.name + "memLib: " + memLib
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, memLib)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, memLib)
        errorGen(LIB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters);
    }
}
const fillPopis = en => {
    let scriptName = "fillPopis 23.0.01";
    let variables = "Záznam: " +  en.name + "\n"
    let parameters = "en: " +  en
    try {
        let popis = en.field("Popis platby");
        if (!popis) {
            let typVydavku = en.field("Účel výdaja");
            switch(typVydavku) {
                case "Mzdy zamestnanci":
                    // code block
                    popis = "Mzda " + en.field("Zamestnanec")[0].field("Nick") ;
                    break;
                case "Mzdy odmeny":
                    // code block
                    popis = "Prémia " + en.field("Zamestnanec")[0].field("Nick");
                    break;
                case "Mzdy externé":
                    // code block
                    popis = "Externá mzda " + en.field("Zamestnanec")[0].field("Nick");
                    break;
                case "Prevádzková réžia":
                    // code block
                    let rezia = en.field("Prevádzková réžia");
                    popis = "Réžia " + rezia;
                    break;
                case "Nákup tovaru":
                    // code block
                    popis = "Nákup tovaru";
                    break;
                case "Finančné poplatky":
                    // code block
                    popis = "Finančné poplatky";
                    break;
                case "Podiely":
                    // code block
                    popis = "Podiely";
                    break;
                case "Výdavok na zákazku":
                    // code block
                    popis = "Výdavok na zákazku";
                    break;
                case "Súkromé do nákladov":
                    // code block
                    popis = "Súkromné";
                    break;
                default:
                    // code block
                }
            en.set("Popis platby", popis);
        } else {
            message(popis);
        }
    } catch (error) {
        errorGen(LIB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters)
    }
}
const prepocetPlatby = en => {
    let scriptName = "prepocetPlatby 23.0.01";
    let variables = "Záznam: " +  en.name + "\n"
    let parameters = "en: " +  en
    try {
        let datum = en.field(DATE);
        let db = lib();
        // nastaviť sezónu
        en.set(SEASON, datum.getFullYear());
        let sezona = en.field(SEASON);
        // zistiť aktuálnu sadzbu dph v databáze
        if (en.field("s DPH")) {
            if (en.field("sadzba") === "základná") {
                let sadzbaDPH = libByName(APP).find(sezona)[0].field("Základná sadzba DPH") / 100
            } else if (en.field("sadzba") === "znížená") {
                let sadzbaDPH = libByName(APP).find(sezona)[0].field("Znížená sadzba DPH") / 100
            } else if (en.field("sadzba") === "nulová") {
                let sadzbaDPH = 0;
            }
            en.set("DPH%", sadzbaDPH * 100);
        }
        // inicializácia
        let zaklad = 0;
        let total = 0;
        let dph = 0;
        if (en.field("Pohyb") == "Výdavok") {
            if (en.field("s DPH")) {
                total = en.field("Suma s DPH");
                zaklad = en.field("Suma");
                if (total) {
                    zaklad = getSumaBezDPH(total, sadzbaDPH).toFixed(2);
                    en.set("Suma", zaklad);
                } else if (zaklad) {
                    total = getSumaSDPH(zaklad, sadzbaDPH).toFixed(2);
                    en.set("Suma s DPH", total);
                }
                dph = (total - zaklad).toFixed(2);
                en.set("DPH", dph);
            } else {
                en.set("Suma s DPH", null);
                en.set("DPH", null);
            };
            en.set("Do pokladne", null);
            en.set("Účel príjmu", null);
            en.set("Partner", null);
        } else if (en.field("Pohyb") == "Príjem") {
            if (en.field("s DPH")) {
                total = en.field("Suma s DPH");
                zaklad = total / (sadzbaDPH + 1);
                dph = total - zaklad;
                en.set("Suma", zaklad);
                en.set("DPH", dph);
            } else {
                en.set("Suma s DPH", 0);
                en.set("DPH", 0);
            };
            en.set("Suma s DPH", 0);
            en.set("Suma", 0);
            en.set("DPH", 0);
            en.set("Z pokladne", null);
            en.set("Účel výdaja", null);
            en.set("Prevádzková réžia", null);
            en.set("Dodávateľ", null);
            en.set("Zamestnanec", null);
            en.set("Stroj", null);
            en.set("Vozidlo", null);
        }
        fillPopis(en);
        message("Hotovo...");
    } catch (error) {
        errorGen(LIB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters)
    }
}
const vyplataMzdy = zaznam => {
    message("Evidujem platby v.13");
    var sumaUhrady =  zaznam.field("Suma");
    var mzdy = libByName("aMzdy");
    var zamestnanec = zaznam.field("Zamestnanec")[0];
    var links = zamestnanec.linksFrom("aMzdy", "Zamestnanec").filter(e => e.field("Vyúčtované") == false )
    // skontrolovať či je už záznam nalinkovaný
    if (links.length > 0){
        //updatuj nalinkované záznamy
        message("Upravujem mzdové záznamy");

        for(var l = 0; l < links.length; l++) {
            var vyplata = links[l].field("Vyplatiť");
            var mzda = links[l].field("Mzda");
            var vMzda = links[l].field("Vyplatená mzda");

            if (sumaUhrady >= vyplata) {
                links[l].set("Vyplatená mzda", vyplata);
                links[l].set("Vyplatiť", 0);
                links[l].set("Vyúčtované", true);
                links[l].link("Platby", zaznam);
                links[l].field("Platby")[0].setAttr("suma", vyplata);
                sumaUhrady -= vyplata;
            } else if ( sumaUhrady != 0 && sumaUhrady < vyplata) {
                links[l].set("Vyplatená mzda", sumaUhrady);
                links[l].set("Vyplatiť", vyplata - sumaUhrady);
                links[l].link("Platby", zaznam);
                links[l].link("Platby", zaznam);
                links[l].field("Platby")[0].setAttr("suma", sumaUhrady);
                sumaUhrady = 0;
            }
        }
        if (sumaUhrady > 0) {
            zaznam.set("Preplatok na mzde", true);
            zaznam.set("Preplatok", sumaUhrady);
        }

    } else {
        message("Nie je žiadna dochádzka na úhradu")
    }

}
const convOld = en => {
    if (en.field("Pohyb") == "Výdavok") {
        en.set("Suma", en.field("Suma").toFixed(2))
        en.set("DPH", en.field("DPH").toFixed(2))
        en.set("Suma s DPH", en.field("Suma s DPH").toFixed(2))
    } else if (en.field("Pohyb") == "Príjem") {
        en.set("Suma", en.field("Suma").toFixed(2))
        en.set("DPH", en.field("DPH").toFixed(2))
        en.set("Suma s DPH", en.field("Suma s DPH").toFixed(2))
    } else if  (en.field("Pohyb") == "PP") {
        en.set("Suma", en.field("Priebežná položka").toFixed(2))

    } else {
        message("Nie je zadaný pohyb záznamu");

    }

}
// End of file: 20.03.2022, 12:17


// End of file: 15.03.2022, 07:59