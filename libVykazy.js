// VÝKAZY PRÁC
const novyVykazPrac = (zakazka, popis) => {
    let scriptName = "novyVykazPrac 23.1.04";
    let variables = "Zákazka: " +  zakazka.name + "\n"
    let parameters = "zakazka: " +  zakazka + "\npopis: " + popis
    try {
        // inicializácia
        let season = getSeason(zakazka, LIB_VP, scriptName);
        let appDB = getAppSeasonDB(season, LIB_VP, scriptName);
        let newNumber = getNewNumber(appDB, season, LIB_VP, scriptName);
        let vykazy = libByName(LIB_VP);
        let cp = zakazka.field(FLD_CPN)[0];
        let typVykazu = cp.field("Typ cenovej ponuky");
        let datum = zakazka.field(DATE);
        // vytvoriť novú výdajku
        let novyVykaz = new Object();
        novyVykaz[NUMBER] = newNumber[0];
        novyVykaz[NUMBER_ENTRY] = newNumber[1];
        novyVykaz[DATE] = datum;
        novyVykaz["Popis"] = popis;
        novyVykaz["Typ výkazu"] = typVykazu;
        novyVykaz["s DPH"] = true; //harcoded
        novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
        novyVykaz["Vydané"] = "Zákazka";
        novyVykaz[FLD_ZKZ] = zakazka;
        novyVykaz[SEASON]= season
        novyVykaz[CR] = user()
        novyVykaz[CR_DATE] = new Date()

        novyVykaz[SEASON] = season;
        vykazy.create(novyVykaz);
        let vykazPrac = vykazy.find(newNumber[0])[0];
        let msgTxt = "Vygenovaný nový výkaz prác č." + newNumber[0]
        message(msgTxt)
        msgGen(LIB_VP, "libVykazPrac.js", scriptName, msgTxt, variables, parameters )
        return vykazPrac;
    } catch (error) {
        errorGen(LIB_VP, "libVykazPrac.js", scriptName, error, variables, parameters);
    }
}
const prepocitatVykazPrac = (vykaz, uctovatDPH) => {
    let scriptName = "prepocitatVykazPrac 23.1.01";
    let variables = "Záznam: " +  vykaz.name + "\n"
    let parameters = "vykaz: " +  vykaz + "\nuctovatDPH: " + uctovatDPH
    try {
        var typ = vykaz.field("Typ výkazu");
        var sumaBezDPH = 0;
        var sumaDPH = null;
        var sumaCelkom = null;
        var popis = vykaz.field(FLD_PPS);
        if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
        var sDPH = vykaz.field("s DPH");

        if (typ == "Hodinovka") {
            var prace = vykaz.field("Práce sadzby")[0];
            var hodinyCelkom = 0;

            var evidenciaLinks = vykaz.linksFrom(LIB_EP, "Výkaz prác");
            var limity = prace.field("Limity");
            var uctovanie = vykaz.field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Počítanie hodinových sadzieb");
            // vynulovať rozpis prác
            var empty = [];
            vykaz.set("Rozpis", empty);
            if (prace) {
                if (evidenciaLinks.length > 0) {
                    if (uctovanie == "Individuálne za každý výjazd" || popis == "Práce navyše") {
                        for (var el = 0; el < evidenciaLinks.length; el++) {
                            var rVykazy = evidenciaLinks[el].field("Výkaz prác");
                            // nájde index výkazu v linkToEntry evidencie prác
                            var index = getLinkIndex(vykaz, rVykazy);
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
                        vykaz.setAttr("dodané množstvo", hodinyCelkom);
                        vykaz.setAttr("účtovaná sadzba", null); // len vynuluje attribút
                        vykaz.setAttr("cena celkom", sumaBezDPH);
                    } else {
                        for (var el = 0; el < evidenciaLinks.length; el++) {
                            var rVykazy = evidenciaLinks[el].field("Výkaz prác");
                            var index = getLinkIndex(vykaz, rVykazy);
                            var rVykaz = evidenciaLinks[el].field("Výkaz prác")[index];
                            hodinyCelkom += evidenciaLinks[el].field("Odpracované");
                            vykaz.link("Rozpis", evidenciaLinks[el]);
                            vykaz.field("Rozpis")[el].setAttr("vykonané práce", rVykaz.attr("popis prác"));
                            vykaz.field("Rozpis")[el].setAttr("počet hodín", null);
                            vykaz.field("Rozpis")[el].setAttr("účtovaná sadzba", null);
                            vykaz.field("Rozpis")[el].setAttr("cena celkom", null);
                            setTlac(vykaz.field("Rozpis")[el]);
                        }
                        // zistiť zľavu podľa počtu odpracovaných hodín
                        var sadzba = vykaz.field(FLD_CPN)[0].field(popis)[0].attr("sadzba");
                        var zlava = null;
                        var zakladnaSadzba = null;
                        if (limity) {
                            zakladnaSadzba = sadzba;
                            for (var m = 0; m < limity.length; m++) {
                                if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
                                    zlava = limity[m].field("Zľava");
                                }
                            }
                        }
                        //message(hodinyCelkom);
                        sadzba = sadzba - (sadzba * zlava / 100);
                        // dosadiť výsledky do poľa "Práce" - pri výkazoch práce je len jedno
                        sumaBezDPH = hodinyCelkom * sadzba;
                        prace.setAttr("základná sadzba", zakladnaSadzba);
                        prace.setAttr("dodané množstvo", hodinyCelkom);
                        prace.setAttr("zľava %", zlava);
                        prace.setAttr("účtovaná sadzba", sadzba);
                        prace.setAttr("cena celkom", sumaBezDPH);
                    }
                } else {
                    message("Pre tento výkaz nie sú žiadne záznamy v Evidencii práce");
                }
            } else {
                message("Chýba položka Práce sadzby");
            }

        } else if (typ == "Položky") {
            var prace = vykaz.field("Práce");
            //var vykaz = vykaz.field("Práce")[0];
            for (var p = 0; p < prace.length; p++) {
                var mnozstvo = prace[p].attr("dodané množstvo");
                var cena = prace[p].attr("cena") || prace[p].field("Cena bez DPH");
                cenaCelkom = mnozstvo * cena;
                prace[p].setAttr("cena", cena);
                prace[p].setAttr("cena celkom", cenaCelkom);
                sumaBezDPH += cenaCelkom;
                setTlac(prace[p]);
            }
            var attrMJ = "cena";
        } else {
            message("Neurčený typ výkazu (Hodinovka/Položky");
        }
        if (sDPH) {
            var sezona = vykaz.field(SEASON);
            if (!sezona || sezona == 0) {
                sezona = vykaz.field(FLD_DATUM).getFullYear();
                vykaz.set(SEASON, sezona);
            }
            var sadzbaDPH = libByName(APP).find(sezona)[0].field("Základná sadzba DPH") / 100;
            sumaDPH = sumaBezDPH * sadzbaDPH;
        }
        sumaCelkom = sumaBezDPH + sumaDPH;

        vykaz.set("Suma bez DPH", sumaBezDPH);
        vykaz.set("DPH", sumaDPH);
        vykaz.set("Suma s DPH", sumaCelkom);
        return [sumaBezDPH, sumaDPH]
    } catch (error) {
        errorGen(LIB_VP, "libVykazPrac.js", scriptName, error, variables, parameters);
}
}
const newEntryVykazPrac = en => {
    let scriptName = "newEntryVykazPrac 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    message("Nový záznam - " + appDBName)
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, appDBName, scriptName)
        let appDB = getAppSeasonDB(season, appDBName, scriptName)
        let number = getNewNumber(appDB, season, appDBName, scriptName)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VP, "libVykazPrac.js", scriptName, error, variables, parameters)
    }
}
const updateEntryVykazPrac = en => {
    let scriptName = "updateEntryVykazPrac 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    message("Úprava záznamu - " + appDBName);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VP, "libVykazPrac.js", scriptName, error, variables, parameters);
    }
}
const saveEntryVykazPrac = en => {
    let scriptName = "saveEntryVykazPrac 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    try {
        prepocitatVykazPrac(en, true)
        saveEntry(en, appDBName)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VP, "libVykazPrac.js", scriptName, error, variables, parameters);
    }
}

// VÝKAZY STROJOV
const newEntryVykazStrojov = en => {
    let scriptName = "newEntryVykazStrojov 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    message("Nový záznam - " + appDBName)
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, appDBName, scriptName)
        let appDB = getAppSeasonDB(season, appDBName, scriptName)
        let number = getNewNumber(appDB, season, appDBName, scriptName)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VS, "libVykazStrojov.js", scriptName, error, variables, parameters)
    }
}
const updateEntryVykazStrojov = en => {
    let scriptName = "updateEntryVykazStrojov 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    message("Úprava záznamu - " + appDBName);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VS, "libVykazStrojov.js", scriptName, error, variables, parameters);
    }
}
const saveEntryVykazStrojov = en => {
    let scriptName = "saveEntryVykazStrojov 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, appDBName)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VS, "libVykazStrojov.js", scriptName, error, variables, parameters);
    }
}
const novyVykazStrojov = (zakazka, popis) => {
    let scriptName = "novyVykazStrojov 23.0.04";
    let variables = "Zákazka: " +  zakazka.name + "\nPopis: " + popis
    let parameters = "zakazka: " +  zakazka + "\npopis: " + popis
    try {
        // inicializácia
        let season = getSeason(zakazka, LIB_VS, scriptName);
        let vykazy = libByName(LIB_VS);
        let appDB = getAppSeasonDB(season, LIB_VS, scriptName);
        let cp = zakazka.field(FLD_CPN)[0];
        let typVykazu = cp.field("Typ cenovej ponuky");
        let datum = zakazka.field(DATE);
        let newNumber = getNewNumber(appDB, season, LIB_VS, scriptName);
        // vytvoriť novú výdajku
        let novyVykaz = new Object();
        novyVykaz[NUMBER] = newNumber[0];
        novyVykaz[NUMBER_ENTRY] = newNumber[1];
        novyVykaz[DATE] = datum;
        novyVykaz["Popis"] = FLD_STR;          // Jediný typ výkazu v knižnici
        novyVykaz["Typ výkazu"] = typVykazu;  // výkaz strojov je len pri hodinovej sadzbe
        novyVykaz["s DPH"] = true; //harcoded
        novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
        novyVykaz["Vydané"] = "Zákazka";
        novyVykaz[FLD_ZKZ] = zakazka;
        novyVykaz[SEASON] = season;
        novyVykaz[CR] = user()
        novyVykaz[CR_DATE] = new Date()
        vykazy.create(novyVykaz);
        let vykazPrac = vykazy.find(newNumber[0])[0];
        let msgTxt = "Vygenovaný nový výkaz prác č." + newNumber[0]
        message(msgTxt)
        msgGen(LIB_VS, "libVykazStrojov.js", scriptName, msgTxt, variables, parameters )
        return vykazPrac;
    } catch (error) {
        errorGen(LIB_VS, "libVykazStrojov.js", scriptName, error, variables, parameters);
    }
}
const prepocitatVykazStrojov = (vykaz, uctovatDPH) => {
    let scriptName = "prepocitatVykazStrojov 23.0.01";
    let variables = "Záznam: " +  vykaz.name + "\nÚčtovať DPH: " + uctovatDPH
    let parameters = "vykaz: " +  vykaz + "\nuctovatDPH: " + ucnuctovatDPH
    try {
        var zaznamyEvidencia = vykaz.linksFrom(LIB_EP, "Výkaz strojov");
        var sumaBezDPH = 0;
        var sumaDPH = 0;
        var sumaCelkom = 0;

        var typ = vykaz.field("Typ výkazu");
        message(uctovatDPH);
        if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
        var sDPH = vykaz.field("s DPH");
        // najprv prejdi záznamy z evidencie a dosaď hodnoty do atribútov
        if (zaznamyEvidencia) {
            for (var v = 0; v < zaznamyEvidencia.length; v++) {
                var vyuzitieStrojov = zaznamyEvidencia[v].field("Využitie strojov");
                var stroje = vykaz.field(FLD_STR);
                if (vyuzitieStrojov) {
                    for (var i in vyuzitieStrojov) {
                        var prevadzkaMTH = 0;
                        var cena = 0;
                        var cenaCelkom = 0;
                        if (!stroje) {
                            //ak nie je žiadny záznam strojov, vytvor nové pre všetky záznamy strojov z evidencie prác
                            var newLink = vykaz.link("Stroje", vyuzitieStrojov[i].field("Cena")[0]);
                            var vyuzitieZapisane = true;
                        } else {
                            // ak už existuje nejaký záznam, spáruj s evidenciou
                            for (var s in stroje) {
                                if (vyuzitieStrojov[i].field("Cena")[0].id == stroje[s].id) {
                                    var newLink = stroje[s];
                                    var vyuzitieZapisane = true;
                                }
                            }
                        }
                        if (!vyuzitieZapisane) {
                            // ak sa využitie strojov nezápísalo do výkazu, vytvor nový záznam vo výkaze
                            var newLink = vykaz.link("Stroje", vyuzitieStrojov[i].field("Cena")[0]);
                            vyuzitieZapisane = true;
                        }
                        prevadzkaMTH += vyuzitieStrojov[i].attr("doba prevádzky") / 3600000;
                        cena = newLink.attr("účtovaná sadzba") || vyuzitieStrojov[i].field("Cena")[0].field("Cena bez DPH");
                        cenaCelkom = prevadzkaMTH ? prevadzkaMTH * cena : null;
                        newLink.setAttr("prevádzka mth", prevadzkaMTH);
                        newLink.setAttr("účtovaná sadzba", cena);
                        newLink.setAttr("cena celkom", cenaCelkom);
                        sumaBezDPH += cenaCelkom;
                    }
                }
            }
        } else {
            message("Žiadne záznamy využitia strojov v Evidencii prác");
        }

        if (sDPH) {
            var sezona = vykaz.field(SEASON);
            if (!sezona || sezona == 0) {
                sezona = vykaz.field(FLD_DATUM).getFullYear();
                vykaz.set(SEASON, sezona);
            }
            var sadzbaDPH = libByName(APP).find(sezona)[0].field("Základná sadzba DPH") / 100;
            sumaDPH = sumaBezDPH * sadzbaDPH;
        }
        sumaCelkom = sumaBezDPH + sumaDPH;
        vykaz.set("Suma bez DPH", sumaBezDPH);
        vykaz.set("DPH", sumaDPH);
        vykaz.set("Suma s DPH", sumaCelkom);
        setTlac(vykaz);
        return [sumaBezDPH, sumaDPH, sumaCelkom];
    } catch (error) {
        errorGen(LIB_VS, "libVykazStrojov.js", scriptName, error, variables, parameters);

    }
}

// VÝKAZY MATERIÁLU
const newEntryVykazMaterialu = en => {
    let scriptName = "newEntryVykazMaterialu 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    message("Nový záznam - " + appDBName)
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, appDBName, scriptName)
        let appDB = getAppSeasonDB(season, appDBName, scriptName)
        let number = getNewNumber(appDB, season, appDBName, scriptName)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }
}
const updateEntryVykazMaterialu = en => {
    let scriptName = "updateEntryVykazMaterialu 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    message("Úprava záznamu - " + appDBName);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters);
    }
}
const saveEntryVykazMaterialu = en => {
    let scriptName = "saveEntryVykazMaterialu 23.0.01"
    let appDBName = lib().title
    let variables = "Záznam: " + en.name + "appDBName: " + appDBName
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, appDBName)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, appDBName)
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters);
    }
}
const novyVykazMaterialu = (zakazka, popis) => {
    let scriptName = "novyVykazMaterialu 23.1.04";
    let variables = "Zákazka: " + zakazka.name + "\n"
    let parameters = "zakazka: " + zakazka + "\npopis: "+ popis
    if(zakazka === undefined ){
        msgGen("libVykazMaterialu.js", scriptName, "zakazka entry is undefined", variables, parameters);
        cancel();
        exit();
    }
    try {
        var lib = libByName(LIB_VM);
        var season = getSeason(zakazka, LIB_VM, scriptName)
        var appDB = getAppSeasonDB(season, LIB_VM, scriptName);
        var newNumber = getNewNumber(appDB, season, LIB_VM, scriptName);
        // vytvoriť novú výdajku
        var novyVykaz = new Object();
        novyVykaz[NUMBER] = newNumber[0];
        novyVykaz[NUMBER_ENTRY] = newNumber[1];
        novyVykaz[DATE] = zakazka.field("Dátum");
        novyVykaz["Popis"] = popis;
        novyVykaz["s DPH"] = true; // hardcoded
        novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
        novyVykaz["Vydané"] = "Zákazka";
        novyVykaz[FLD_ZKZ] = zakazka;
        novyVykaz[SEASON] = season;
        novyVykaz[CR] = user()
        novyVykaz[CR_DATE] = new Date()
        lib.create(novyVykaz);
        var vydajkaMaterialu = lib.find(newNumber[0])[0];
        let msgTxt = "Vygenerovaná nová výdajka materiálu č." + newNumber[0]
        message(msgTxt)
        msgGen(LIB_VM, "libVykazMaterialu.js", scriptName, msgTxt, variables, parameters)
        return vydajkaMaterialu;
    } catch (error) {
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }
}
const prepocitatVykazMaterialu = (vykaz, uctovatDPH) => {
    let scriptName = "prepocitatVykazMaterialu 23.0.01";
    let variables = "Záznam: " + vykaz.name + "\nÚčtovať DPH: " + uctovatDPH
    let parameters = "vykaz: " + vykaz + "\nuctovatDPH: "+ uctovatDPH
    try {
        var material = vykaz.field(FLD_MAT);
        var sumaBezDPH = 0;
        var sumaDPH = null;
        var sumaCelkom = null;

        var typ = vykaz.field("Typ výkazu");
        if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
        var sDPH = vykaz.field("s DPH");
        if (material.length > 0) {
            for (var p = 0; p < material.length; p++) {
                // výpočet ceny
                var dodaneMnozstvo = material[p].attr("dodané množstvo");
                var cena = material[p].attr("cena");
                var cenaCelkom = dodaneMnozstvo ? dodaneMnozstvo * cena : null;
                material[p].setAttr("cena celkom", cenaCelkom);
                sumaBezDPH += cenaCelkom;
                //výpočet ceny z cp
            }
            if (sDPH) {
                var sezona = vykaz.field(SEASON);
                if (!sezona || sezona == 0) {
                    sezona = vykaz.field(DATE).getFullYear();
                    vykaz.set(SEASON, sezona);
                }
                var sadzbaDPH = libByName(APP).find(sezona)[0].field("Základná sadzba DPH") / 100;
                sumaDPH = sumaBezDPH * sadzbaDPH;
            }
            sumaCelkom = sumaBezDPH + sumaDPH;
            vykaz.set("Suma bez DPH", sumaBezDPH);
            vykaz.set("DPH", sumaDPH);
            vykaz.set("Suma s DPH", sumaCelkom);
        }
        return [sumaBezDPH, sumaDPH];
    } catch (error) {
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }

}

// VÝKAZY DOPRAVY

// STAVEBNÝ DENNÍK

// VÝKAZ PRÁC NAVYŠE

// VÝKAZ SUBDODÁVOK