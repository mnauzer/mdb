
const newEntryDochadzka = en => {
    let scriptName = "newEntryDochadzka 23.0.06"
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
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters)
    }
}

const updateEntryDochadzka = en => {
    let scriptName = "updateEntryDochadzka 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "\nmementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    message("Úprava záznamu - " + mementoLibrary);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters);
    }
}

const saveEntryDochadzka = en => {
    let scriptName = "saveEntryDochadzka 23.0.02"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, mementoLibrary)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters);
    }
}



const prepocitatZaznamDochadzky = en => {
    let scriptName = "prepocitatZaznamDochadzky 23.0.02"
    let variables = "Záznam: " + en.name
    let parameters = "en: " + en
    try {
        // výpočet pracovnej doby
        let prichod = roundTimeQ(en.field("Príchod")); //zaokrúhlenie času na 15min
        let odchod = roundTimeQ(en.field("Odchod"));
        let datum = en.field(DATE)

        let pracovnaDoba = (odchod - prichod) / 3600000;
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);
        let mzdyCelkom = 0; // mzdy za všetkých zamestnancov v ten deň
        let odpracovaneCelkom = 0; // odpracovane hod za všetkýh zamestnancov
        let evidenciaCelkom = 0; // všetky odpracované hodiny z evidencie prác
        let prestojeCelkom = 0; //TODO ak sa budú evidovať prestojeCelkom
        let employees = en.field("Zamestnanci");
        let evidenciaPrac = en.field("Práce");
        if (employees.length > 0) {
            for (let z = 0; z < employees.length; z++) {
                let hodinovka = employees[z].attr("hodinovka") ? employees[z].attr("hodinovka") : lastSadzba(employees[z], datum, scriptName);
                employees[z].setAttr("hodinovka", hodinovka);

                let hodnotenie = employees[z].attr("hodnotenie") ? employees[z].attr("hodnotenie") : 5;
                let dennaMzda = employees[z].attr("denná mzda") ? employees[z].attr("denná mzda") : 0; // jedného zamestnanca
                // premenné z knižnice employees
                let libZarobene = employees[z].field("Zarobené") - dennaMzda;
                let libOdrobene = employees[z].field("Odpracované"); // len v úprave zázbanz, odpočíta od základu už vyrátanú hodnotu
                let libVyplatene = employees[z].field("Vyplatené");
                let libHodnotenieD = employees[z].field(FLD_DOCH);

                dennaMzda = (pracovnaDoba * (hodinovka
                    + employees[z].attr("+príplatok (€/h)")))
                    + employees[z].attr("+prémia (€)")
                    - employees[z].attr("-pokuta (€)");
                employees[z].setAttr("denná mzda", dennaMzda);
                employees[z].setAttr("hodnotenie", hodnotenie);
                // nastavenie v knižnici employees
                libZarobene += dennaMzda;
                libOdrobene += pracovnaDoba;
                libHodnotenieD += hodnotenie;
                var libNedoplatok = libZarobene - libVyplatene;

                employees[z].set("Zarobené", libZarobene);
                employees[z].set("Odpracované", libOdrobene);
                employees[z].set("Preplatok/Nedoplatok", libNedoplatok);
                employees[z].set(FLD_DOCH, libHodnotenieD);

                mzdyCelkom += dennaMzda;
                odpracovaneCelkom += pracovnaDoba;
                //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
                if (evidenciaPrac) {
                    for (var ep in evidenciaPrac) {
                        var zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                        var naZakazke = evidenciaPrac[ep].field("Odpracované/os");
                        for (var znz in zamNaZakazke) {
                            if (employees[z].field(NICK) == zamNaZakazke[znz].field(NICK)) {
                                evidenciaCelkom += naZakazke;
                            }
                        }
                    }
                }
            }
        }
        prestojeCelkom = odpracovaneCelkom - evidenciaCelkom;
        en.set("Mzdové náklady", mzdyCelkom);
        en.set("Pracovná doba", pracovnaDoba);
        en.set("Odpracované", odpracovaneCelkom);
        en.set("Na zákazkách", evidenciaCelkom);
        en.set("Prestoje", prestojeCelkom);
        message("Hotovo...");
    } catch (error) {
        errorGen(LIB_DOCH, "libDochadzka.js", scriptName, error, variables, parameters);
    }
}

const aSalary = (en, NEW_ENTRY) => {
    let scriptName = "aSalary 23.0.01"
    let variables = "Záznam: " + en.name + "\nNEW_ENTRY: " + NEW_ENTRY
    let parameters = "en: " + en + "\nNEW_ENTRY: " + NEW_ENTRY
    try {
        var salaries = libByName(DBA_SAL);
        var employees = en.field(DOCH_EMPLOYEES);
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
        for (var z = 0; z < employees.length; z++) {
            var newEntry = new Object();
            newEntry[DATE] = en.field(DATE);
            newEntry[NICK] =  employees[z].field(NICK);
            newEntry["Odpracované"] = en.field("Pracovná doba");
            newEntry["Sadzba"] =  employees[z].attr("hodinovka");
            newEntry["Mzda"] =  employees[z].attr("denná mzda");
            newEntry["Vyplatiť"] =  employees[z].attr("denná mzda");
            newEntry[SEASON] = en.field(DATE).getFullYear();
            newEntry[FLD_DOCH] = en;
            newEntry["Zamestnanec"] = employees[z];
            salaries.create(newEntry);
            var entrySalaries = en.linksFrom(DBA_SAL,FLD_DOCH)[0];
            entrySalaries.field(FLD_DOCH)[0].setAttr("odpracované", en.field("Pracovná doba"));
            entrySalaries.field("Zamestnanec")[0].setAttr("sadzba", employees[z].attr("hodinovka"));
            // zauctuj preplatok ak je
            var preplatokLinks = employees[z].linksFrom("Pokladňa", "Zamestnanec").filter(e => e.field("Preplatok na mzde") == true);
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

