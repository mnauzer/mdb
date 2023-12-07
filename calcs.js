// DOCHÁDZKA
function prepocitatZaznamDochadzky(en, initScript){
    setAppScripts('prepocitatZaznamDochadzky()', 'calc.js', initScript);
    try {
        // výpočet pracovnej doby
        const prichod = roundTimeQ(en.field("Príchod")); //zaokrúhlenie času na 15min
        const odchod = roundTimeQ(en.field("Odchod"));
        const datum = en.field(DATE);
        const pracovnaDoba = (odchod - prichod) / 3600000;
        const zavazky = en.field("Generovať záväzky")
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);
        let mzdyCelkom = 0; // mzdy za všetkých zamestnancov v ten deň
        let odpracovaneCelkom = 0; // odpracovane hod za všetkýh zamestnancov
        let evidenciaCelkom = 0; // všetky odpracované hodiny z evidencie prác
        let prestojeCelkom = 0; //TODO: ak sa budú evidovať prestojeCelkom
        const zamestnanci = en.field("Zamestnanci");
        if (app.log) {message("...zamestnancov: " + zamestnanci.length)};
        const evidenciaPrac = en.field("Práce");
        if (app.log) {message("...evidencia prác: " + evidenciaPrac.length)};
        if (zamestnanci) {
            if (app.log) {message("...prepočítavam zamestnancov")}
            for (let z = 0; z < zamestnanci.length; z++ ) {
               // const hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript); //neprepisovať už zadanú hodinovku
                const hodinovka = sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript); // prepisovať zadanú hodinovku
                zamestnanci[z].setAttr("hodinovka", hodinovka);

                const hodnotenie = zamestnanci[z].attr("hodnotenie") ? zamestnanci[z].attr("hodnotenie") : 5;
                let dennaMzda = zamestnanci[z].attr("denná mzda") ? zamestnanci[z].attr("denná mzda") : 0; // jedného zamestnanca
                // premenné z knižnice zamestnanci
                let zarobene = zamestnanci[z].field("Zarobené") - dennaMzda;
                let odrobene = zamestnanci[z].field("Odpracované"); // len v úprave zázbanz, odpočíta od základu už vyrátanú hodnotu
                const vyplatene = zamestnanci[z].field("Vyplatené");
                let hodnotenieD = zamestnanci[z].field("Dochádzka");

                dennaMzda = (pracovnaDoba * (hodinovka
                    + zamestnanci[z].attr("+príplatok (€/h)")))
                    + zamestnanci[z].attr("+prémia (€)")
                    - zamestnanci[z].attr("-pokuta (€)");
                zamestnanci[z].setAttr("denná mzda", dennaMzda);
                zamestnanci[z].setAttr("hodnotenie", hodnotenie);
                // nastavenie v knižnici zamestnanci
                zarobene += dennaMzda;
                odrobene += pracovnaDoba;
                hodnotenieD += hodnotenie;
                const nedoplatok = zarobene - vyplatene;

                zamestnanci[z].set("Zarobené", zarobene);
                zamestnanci[z].set("Odpracované", odrobene);
                zamestnanci[z].set("Preplatok/Nedoplatok", nedoplatok);
                zamestnanci[z].set("Dochádzka", hodnotenieD);

                mzdyCelkom += dennaMzda;
                odpracovaneCelkom += pracovnaDoba;
                //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
                if (evidenciaPrac) {
                    if (app.log) {message("...prepočítavam evidenciu prác")}
                    for (let ep = 0; ep < evidenciaPrac.length; ep++) {
                        const zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                        const naZakazke = evidenciaPrac[ep].field("Pracovná doba");
                        for (let znz in zamNaZakazke) {
                            if (zamestnanci[z].field(NICK) == zamNaZakazke[znz].field(NICK)) {
                                evidenciaCelkom += naZakazke;
                            }
                        }
                    }
                }
                if (zavazky) {
                    // ak sú staré záväzky, najprv vymaž
                    const stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka");
                    // if(stareZavazky.length > 0){
                    //     message("Mažem súvisiace záväzky...")
                    //     for (let i in stareZavazky) {
                    //         removeEntry(stareZavazky[i], LIB_ZVK, scr.name)
                    //     }
                    // stareZavazky = false
                    // }

                    // vygeneruj nové záväzky
                    const zavazok = newEntryZavazky(zamestnanci[z], en, dennaMzda, app.runningScript);
                };
            }
        };
        prestojeCelkom = odpracovaneCelkom - evidenciaCelkom;
        // TODO zaevidovať prestoje do databázy zákaziek na zákazku Krajinka
        en.set("Mzdové náklady", mzdyCelkom.toFixed(2));
        en.set("Pracovná doba", pracovnaDoba);
        en.set("Odpracované", odpracovaneCelkom);
        en.set("Na zákazkách", evidenciaCelkom);
        en.set("Prestoje", prestojeCelkom);
        if (prestojeCelkom = odpracovaneCelkom) {
            en.set("appMsg", 'vyžaduje pozornosť');
            en.set("appMsg2", 'Nie sú zaevidované žiadne práce na zákazkách\nZaeviduj práce a daj prepočítať záznam.\nZvyšný čas bude priradený na zákazku KRAJINKA - prestoje');
        }
        message('Generovať záväzky: ' + zavazky);

        if (app.log) {message("...hotovo")};
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}
// ZAMESTNANCI
function sadzbaZamestnanca(employee, date, initScript){
    // vyhľadá aktuálnu sadzbu zamestnanca k dátum "date", v poli "dateField"
    // v databáze "LIB_SZ - sadzby zamestnancov"
    setAppScripts('sadzbaZamestnancab()', 'calc.js', initScript);
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        const links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        const dateField ="Platnosť od";
        let sadzba = 0;
        filteredLinks = filterByDate(links, date, dateField, app.runningScript);
        if (filteredLinks.length < 0) {
            msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu';
        } else {
            sadzba = filteredLinks[0].field("Sadzba");
        }
        nullAppScripts()
        return sadzba;
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
function genDochadzkaZavazky(en, initScript){
    setAppScripts('genDochadzkaZavazky()', 'calc.js', initScript);
    try {
        if (app.log) {message("...generujem záväzky")};

        // ak sú staré záväzky, najprv vymaž
        const stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka");
        // if(stareZavazky.length > 0){
        //     message("Mažem súvisiace záväzky...")
        //     for (let i in stareZavazky) {
        //         removeEntry(stareZavazky[i], LIB_ZVK, scr.name)
        //     }
        // stareZavazky = false
        // }

        // vygeneruj nové záväzky

        const zamestnanci = en.field("Zamestnanci");
        for (let z in zamestnanci) {
            if (z == 0 ) {message("Generujem záväzky......")} // this message only once
                newEntryZavazky(zamestnanci[z], en, zamestnanci[z].attr("denná mzda"));
        };
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}
function newEntryZavazky(employee, en, sum, initScript) {
    setAppScripts('newEntryZavazky()', 'calc.js', initScript);
    try {
        get.openDb(LIB_ZVK);
        const popis = "Mzda " + employee.name +", za deň "; // TODO: pridať a upraviť formát dátumu
        const zavazky = libByName(LIB_ZVK);
        // vytvorenie nového záznamu
        const newEntry = new Object();
        newEntry[NUMBER] = app.openLib.number;
        newEntry[NUMBER_ENTRY] = app.openLib.nextNum;
        newEntry[DATE] =  new Date();
        // TODO: zmeniť aj pre iných veriteľov ako zamestnanci
        newEntry["Typ"] = "Mzdy";
        newEntry["Zamestnanec"] = employee;
        newEntry["Dochádzka"] = en;
        newEntry["info"] = "generované automaticky z dochádzky";
        //
        newEntry["Popis"] = popis;
        newEntry["Suma"] = sum.toFixed(2);
        newEntry[SEASON]= app.season;
        newEntry[CR] = user();
        newEntry[CR_DATE] = new Date();
        zavazky.create(newEntry);
        return true;
        // kontrola vytvorenia záznamu
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}

const zavazky = {
    name: null,
    // ASISTANTO DB
    db: null,
    ID: null,
    prefix: null,
    // ASISTANTO attributes
    lastNum: null,
    nextNum: null,
    reservedNum: null,
    removedNums: [],
    isPrefix: null,
    trim: null,
    trailingDigit: null,
    // generované get.number()
    number: null,
    // záznamy otvorenej knižnice
    lib: null,
    entries: null,
    en: null,
    enD: null,
    // GETTERS
    get:{
        db(){
            const dbLib = dbEntry.field("Databázy").filter(en => en.field("Názov") == app.openLib.name)

        }
    }
}