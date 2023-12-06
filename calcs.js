// DOCHÁDZKA
const prepocitatZaznamDochadzky = (en, initScript) => {
    setAppScripts('prepocitatZaznamDochadzky()', 'calc.js', initScript)
    try {
        // výpočet pracovnej doby
        const prichod = roundTimeQ(en.field("Príchod")); //zaokrúhlenie času na 15min
        const odchod = roundTimeQ(en.field("Odchod"));
        const datum = en.field(DATE)
        const pracovnaDoba = (odchod - prichod) / 3600000;
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);
        let mzdyCelkom = 0; // mzdy za všetkých zamestnancov v ten deň
        let odpracovaneCelkom = 0; // odpracovane hod za všetkýh zamestnancov
        let evidenciaCelkom = 0; // všetky odpracované hodiny z evidencie prác
        let prestojeCelkom = 0; //TODO: ak sa budú evidovať prestojeCelkom
        const zamestnanci = en.field("Zamestnanci");
        if (app.log) {message("...zamestnancov: " + zamestnanci.length)}
        const evidenciaPrac = en.field("Práce");
        if (app.log) {message("...evidencia prác: " + evidenciaPrac.length)}
        if (zamestnanci) {
            if (app.log) {message("...prepočítavam zamestnancov")}
            for (let z = 0; z < zamestnanci.length; z++ ) {
                const hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript);
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
            }
        }
        prestojeCelkom = odpracovaneCelkom - evidenciaCelkom;
        // TODO zaevidovať prestoje do databázy zákaziek na zákazku Krajinka
        en.set("Mzdové náklady", mzdyCelkom.toFixed(2));
        en.set("Pracovná doba", pracovnaDoba);
        en.set("Odpracované", odpracovaneCelkom);
        en.set("Na zákazkách", evidenciaCelkom);
        en.set("Prestoje", prestojeCelkom);
        if (app.log) {message("...hotovo")}
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
// ZAMESTNANCI
const sadzbaZamestnanca = (employee, date, initScript) => {
    // vyhľadá aktuálnu sadzbu zamestnanca k dátum "date", v poli "dateField"
    // v databáze "LIB_SZ - sadzby zamestnancov"
    setAppScripts('sadzbaZamestnancab()', 'calc.js', initScript)
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        const links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        const dateField ="Platnosť od"
        let sadzba = 0
        filteredLinks = filterByDate(links, date, dateField, app.runningScript);
        if (filteredLinks.length < 0) {
            msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu'
        } else {
            sadzba = filteredLinks[0].field("Sadzba");
        }
        nullAppScripts()
        return sadzba;
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
const genDochadzkaZavazky = (en, initScript) => {
    setAppScripts('genDochadzkaZavazky()', 'calc.js', initScript)
    const zavazok = en.field("Generovať záväzky")
    try {

        if (zavazok) {
            if (app.log) {message("...generujem záväzky")}

            // ak sú staré záväzky, najprv vymaž
            const stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka")
            // if(stareZavazky.length > 0){
            //     message("Mažem súvisiace záväzky...")
            //     for (let i in stareZavazky) {
            //         removeEntry(stareZavazky[i], LIB_ZVK, scr.name)
            //     }
            // stareZavazky = false
            // }

            // vygeneruj nové záväzky

            const zamestnanci = en.field("Zamestnanci")
            // for (let z in zamestnanci) {
            //     if (z == 0 ) {message("Generujem záväzky......")} // this message only once
            //     newEntryZavazky(zamestnanci[z], en, zamestnanci[z].attr("denná mzda"))
            // }
        }
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}