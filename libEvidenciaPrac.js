// Library/Event/Script:    Evidencia\Evidencia prác\shared\evidenciaLibrary_w.js
// JS Libraries:
// Dátum:                   15.03.2022
// Popis:


const newEntryEvidenciaPrac = en => {
    let scriptName = "newEntryEvidenciaPrac 23.0.02"
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
        errorGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, error, variables, parameters)
    }
}

const updateEntryEvidenciaPrac = en => {
    let scriptName = "updateEntryEvidenciaPrac 23.0.02"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en 
    message("Úprava záznamu - " + mementoLibrary);
    try {
        
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
}

const saveEntryEvidenciaPrac = en => {
    let scriptName = "saveEntryEvidenciaPrac 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en 
    try {
        prepocetZaznamuEvidenciePrac(en)
        saveEntry(en, mementoLibrary)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
}

const evidenciaSadzbaPrace = (vykazPrac, hodinyCelkom) => {
    let scriptName ="evidenciaSadzbaPrace 23.0.01";
    let variables = "Záznam: " + vykazPrac.name + "\n"
    let parameters = "vykazPrac: " + vykazPrac + "\nhodinyCelkom: " + hodinyCelkom
    if(vykazPrac == undefined){
        msgGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, "chýba parameter vykazPrac", variables, parameters );
        cancel();
        exit();
    }
    try {
        let zakladnaSadzba = vykazPrac.field("Práce sadzby")[0].field("Cena bez DPH");
        // zistiť zľavu podľa počtu odpracovaných hodín
        let zlava = 0;
        let limity = vykazPrac.field("Práce sadzby")[0].field("Limity");
        for (let m = 0; m < limity.length; m++) {
            if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
                zlava = limity[m].field("Zľava");
            }
        }
        let sadzba = zakladnaSadzba - (zakladnaSadzba * zlava / 100);
        return sadzba;
    } catch (error) {
        errorGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
        cancel();
        exit();
    }
};

const prepocetZaznamuEvidenciePrac = en => {
    let scriptName ="prepocetZaznamuEvidenciePrac 23.0.04";
    let variables = "Záznam: " + en.name + "\n"
    let parameters = "en: " + en 
    try {
        let date = en.field(DATE)
        let typ = en.field("Typ zákazky");
        if (typ == "Hodinovka") {
            //TODO opraviť chybu keď nie je zadaná zákazka
            if (en.field("Výkaz práce"[0]) != undefined) {
                en.set(FIELD_ZAKAZKA, en.field("Výkaz prác")[0].field(FIELD_ZAKAZKA)[0]);
            } else {
                msgGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js",  scriptName, "nie je zadaná zákazka", variables, parameters)
            }
        } else if (typ == "Položky") {
        }
        let zamestnanci = en.field(FIELD_ZAMESTNANCI);
        let odpracovane = 0;
        let mzdoveNakladyCelkom = 0;
        let nakladyZamestnatec = 0;
        let casOd = roundTimeQ(en.field("Od"));
        let casDo = roundTimeQ(en.field("Do"));
        let odpracovaneOsoba = (casDo - casOd) / 3600000;
        for (let z = 0; z < zamestnanci.length; z++) {
            // sadzba buď tá zadaná, alebo zisti zo záznamu zamestnanca
            let hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : lastSadzba(zamestnanci[z], date, scriptName);
            zamestnanci[z].setAttr("hodinovka", hodinovka);

            odpracovane += odpracovaneOsoba;
            nakladyZamestnatec = odpracovaneOsoba * hodinovka;
            mzdoveNakladyCelkom += nakladyZamestnatec;
        };
        let vykazPrac = en.field("Výkaz prác");
        let hodinCelkom = 0;
        if (vykazPrac) {
            for (let v = 0; v < vykazPrac.length; v++) {
                // zistiť hodinovú sadzbu
                let sadzba = 0;
                let hodin = vykazPrac[v].attr("počet hodín") || odpracovane;
                hodinCelkom += hodin;
                vykazPrac[v].setAttr("popis prác", vykazPrac[v].attr("popis prác") || en.field("Rozpis prác"));
                vykazPrac[v].setAttr("počet hodín", hodin);
                let uctovanie = vykazPrac[v].field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb");
                if (uctovanie == "Individuálne za každý výjazd") {
                    sadzba = evidenciaSadzbaPrace(vykazPrac[v], hodin);
                    vykazPrac[v].setAttr("sadzba", sadzba);
                    vykazPrac[v].setAttr("cena celkom", hodin * sadzba);
                }
            }
        };

        //STROJE
        let evidovatStroje = en.field("Evidovať stroje");
        if (evidovatStroje) {
            let vyuzitieStrojov = en.field("Využitie strojov");
            if (vyuzitieStrojov) {
                let EvidenciaPrac = en.field("Výkaz strojov")[0];
                if (EvidenciaPrac) {
                    // ak má zákazka už vygenerovaný výkaz s cp
                    let stroje = vykazStrojov.field("Stroje");
                    for (let i = 0; i < vyuzitieStrojov.length; i++) {
                        if (stroje) {
                            let prevadzkaMTH = 0;
                            for (let j = 0; j < stroje.length; j++) {
                                if (vyuzitieStrojov[i].field("Cena")[0].id == stroje[j].id) {
                                }
                                stroje[j].setAttr("prevádzka mth", stroje[j].attr("prevádzka mth", prevadzkaMTH));
                            }
                        } else {
                            message("false");
                            vykazStrojov.link("Stroje", vyuzitieStrojov[i].field("Cena")[0]);
                        }
                    }
                } else {
                    let vykazStrojovZakazka = en.field("Zákazka")[0].linksFrom("Výkaz strojov", "Zákazka")[0];
                    if (vykazStrojovZakazka) {
                        en.link("Výkaz strojov", vykazStrojovZakazka);
                    } else {
                        // ak neexistuje, vygeneruj nový výkaz strojov
                        message("Generujem výkaz strojov");
                        vykazStrojov = novyVykazStrojov(en.field("Zákazka")[0]);
                        en.link("Výkaz strojov", vykazStrojov);
                    }
                }
                prepocitatVykazStrojov(vykazStrojov);
            } else {
                message("V zázname nie su vybraté žiadne využité stroje");
            }
        }

        en.set("Od", casOd);
        en.set("Do", casDo);
        en.set("Počet pracovníkov", zamestnanci.length);
        en.set("Odpracované", odpracovane);
        en.set("Mzdové náklady", mzdoveNakladyCelkom);
        en.set("Odpracované/os", odpracovaneOsoba); 
    } catch (error) {
        errorGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
    
}




// End of file: 15.03.2022, 07:59