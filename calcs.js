// DOCHÁDZKA
const prepocitatZaznamDochadzky = (en, initScript)=> {
    app.runningScript = 'prepocitatZaznamDochadzky()'
    app.libFile = 'calcs.js'
    app.initScript = initScript
    try {
        // výpočet pracovnej doby
        if (app.log) {message("...prepocitatZaznamDochadzky()")}
        const prichod = roundTimeQ(en.field("Príchod")); //zaokrúhlenie času na 15min
        const odchod = roundTimeQ(en.field("Odchod"));
        const datum = en.field(DATE)
        const pracovnaDoba = (odchod - prichod) / 3600000;
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);
        let mzdyCelkom = 0; // mzdy za všetkých zamestnancov v ten deň
        let odpracovaneCelkom = 0; // odpracovane hod za všetkýh zamestnancov
        let evidenciaCelkom = 0; // všetky odpracované hodiny z evidencie prác
        let prestojeCelkom = 0; //TODO ak sa budú evidovať prestojeCelkom
        const zamestnanci = en.field("Zamestnanci");
        const evidenciaPrac = en.field("Práce");
        if (zamestnanci.length > 0) {
            for (let z in zamestnanci ) {
                const hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript);
                zamestnanci[z].setAttr("hodinovka", hodinovka);

                const hodnotenie = zamestnanci[z].attr("hodnotenie") ? zamestnanci[z].attr("hodnotenie") : 5;
                let dennaMzda = zamestnanci[z].attr("denná mzda") ? zamestnanci[z].attr("denná mzda") : 0; // jedného zamestnanca
                // premenné z knižnice zamestnanci
                let Zarobene = zamestnanci[z].field("Zarobené") - dennaMzda;
                let Odrobene = zamestnanci[z].field("Odpracované"); // len v úprave zázbanz, odpočíta od základu už vyrátanú hodnotu
                const Vyplatene = zamestnanci[z].field("Vyplatené");
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
                const Nedoplatok = Zarobene - Vyplatene;

                zamestnanci[z].set("Zarobené", Zarobene);
                zamestnanci[z].set("Odpracované", Odrobene);
                zamestnanci[z].set("Preplatok/Nedoplatok", Nedoplatok);
                zamestnanci[z].set("Dochádzka", HodnotenieD);

                mzdyCelkom += dennaMzda;
                odpracovaneCelkom += pracovnaDoba;
                //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
                if (evidenciaPrac) {
                    for (let ep in evidenciaPrac) {
                        const zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                        const naZakazke = evidenciaPrac[ep].field("Pracovná doba");
                        for (let znz in zamNaZakazke) {
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
        app.runningScript = null
        app.libFile = null
        app.initScript = null
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
// ZAMESTNANCI
const sadzbaZamestnanca = (employee, date, initScript) => {
    // vyhľadá aktuálnu sadzbu zamestnanca k dátum "date", v poli "dateField"
    // v databáze "LIB_SZ - sadzby zamestnancov"
    app.runningScript = 'sadzbaZamestnanca()'
    app.libFile = 'calcs.js'
    app.initScript = initScript
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        if (app.log) {message("...sadzbaZamestnanca()")}
        const links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        const dateField ="Platnosť od"
        let sadzba = 0
        filteredLinks = filterByDate(links, date, dateField, app.runningScript);
        if (filteredLinks.length < 0) {
            msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu'
        } else {
            sadzba = filteredLinks[0].field("Sadzba");
        }
        app.runningScript = null
        app.libFile = null
        app.initScript = null
        return sadzba;
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}