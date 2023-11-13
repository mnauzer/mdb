
const newEntryVykazStrojov = en => {
    let scriptName = "newEntryVykazStrojov 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    message("Nový záznam - " + mementoLibrary)
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, mementoLibrary, scriptName)
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName)
        let number = getNewNumber(appDB, season, mementoLibrary, scriptName)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_VYKAZ_STROJOV, "libVykazStrojov.js", scriptName, error, variables, parameters)
    }
}

const updateEntryVykazStrojov = en => {
    let scriptName = "updateEntryVykazStrojov 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    message("Úprava záznamu - " + mementoLibrary);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_VYKAZ_STROJOV, "libVykazStrojov.js", scriptName, error, variables, parameters);
    }
}

const saveEntryVykazStrojov = en => {
    let scriptName = "saveEntryVykazStrojov 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, mementoLibrary)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_VYKAZ_STROJOV, "libVykazStrojov.js", scriptName, error, variables, parameters);
    }
}


const novyVykazStrojov = (zakazka, popis) => {
    let scriptName = "novyVykazStrojov 23.0.04";
    let variables = "Zákazka: " +  zakazka.name + "\nPopis: " + popis
    let parameters = "zakazka: " +  zakazka + "\npopis: " + popis
    try {
        // inicializácia
        let season = getSeason(zakazka, LIB_VYKAZ_STROJOV, scriptName);
        let vykazy = libByName(LIB_VYKAZ_STROJOV);
        let appDB = getAppSeasonDB(season, LIB_VYKAZ_STROJOV, scriptName);
        let cp = zakazka.field(FLD_CENOVA_PONUKA)[0];
        let typVykazu = cp.field("Typ cenovej ponuky");
        let datum = zakazka.field(DATE);
        let newNumber = getNewNumber(appDB, season, LIB_VYKAZ_STROJOV, scriptName);
        // vytvoriť novú výdajku
        let novyVykaz = new Object();
        novyVykaz[NUMBER] = newNumber[0];
        novyVykaz[NUMBER_ENTRY] = newNumber[1];
        novyVykaz[DATE] = datum;
        novyVykaz["Popis"] = FLD_STROJE;          // Jediný typ výkazu v knižnici
        novyVykaz["Typ výkazu"] = typVykazu;  // výkaz strojov je len pri hodinovej sadzbe
        novyVykaz["s DPH"] = true; //harcoded
        novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
        novyVykaz["Vydané"] = "Zákazka";
        novyVykaz[FLD_ZAKAZKA] = zakazka;
        novyVykaz[SEASON] = season;
        novyVykaz[CR] = user()
        novyVykaz[CR_DATE] = new Date()
        vykazy.create(novyVykaz);
        let vykazPrac = vykazy.find(newNumber[0])[0];
        let msgTxt = "Vygenovaný nový výkaz prác č." + newNumber[0]
        message(msgTxt)
        msgGen(LIB_VYKAZ_STROJOV, "libVykazStrojov.js", scriptName, msgTxt, variables, parameters )
        return vykazPrac;
    } catch (error) {
        errorGen(LIB_VYKAZ_STROJOV, "libVykazStrojov.js", scriptName, error, variables, parameters);
    }
}

const prepocitatVykazStrojov = (vykaz, uctovatDPH) => {
    let scriptName = "prepocitatVykazStrojov 23.0.01";
    let variables = "Záznam: " +  vykaz.name + "\nÚčtovať DPH: " + uctovatDPH
    let parameters = "vykaz: " +  vykaz + "\nuctovatDPH: " + ucnuctovatDPH
    try {
        var zaznamyEvidencia = vykaz.linksFrom(LIB_EVIDENCIA_PRAC, "Výkaz strojov");
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
                var stroje = vykaz.field(FLD_STROJE);
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
        errorGen(LIB_VYKAZ_STROJOV, "libVykazStrojov.js", scriptName, error, variables, parameters);

    }
}

