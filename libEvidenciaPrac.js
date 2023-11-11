// Library/Event/Script:    Evidencia\Evidencia prác\shared\evidenciaLibrary_w.js
// JS Libraries:
// Dátum:                   15.03.2022
// Popis:

// TRIGGERS FUNCTIONS
const newEntryEvidenciaPrac = en => {
    let scriptName = "newEntryEvidenciaPrac 23.0.02"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    message("Nový záznam - " + mementoLibrary)
    try {
        setEntry(en, scriptName)
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

// ACTION FUNCTIONS
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
    let scriptName ="prepocetZaznamuEvidenciePrac 23.0.06";
    let variables = "Záznam: " + en.name + "\n"
    let parameters = "en: " + en 
    try {
        let date = en.field(DATE)
        let typ = en.field("Typ zákazky");
        if (typ == "Hodinovka") {
            //TODO opraviť chybu keď nie je zadaná zákazka
            let vykaz = en.field("Výkaz prác")[0]
            if (vykaz != undefined) {
                en.set(FIELD_ZAKAZKA, vykaz.field(FIELD_ZAKAZKA)[0]);
            } else {
                msgGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js",  scriptName, "nie je zadaná zákazka", variables, parameters)
            }
        } else if (typ == "Položky") {
        }
        let zamestnanci = en.field(FIELD_ZAMESTNANCI);
        let odpracovane = 0;
        let mzdoveNakladyCelkom = 0;
        let nakladyZamestnatec = 0;
        let hodinCelkom = 0;
        let casOd = roundTimeQ(en.field("Od"));
        let casDo = roundTimeQ(en.field("Do"));
        let trvanie = (casDo - casOd) / 3600000;
        // dosaď mzdy zamestnancov
        for (let z = 0; z < zamestnanci.length; z++) {
            // sadzba buď tá zadaná, alebo zisti zo záznamu zamestnanca
            let hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : lastSadzba(zamestnanci[z], date, scriptName);
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
        let evMateriál = evidovat.includes("Materiál")
        let evPrace = evidovat.includes("Výkaz prác")
        let evDoprava = evidovat.includes("Dopravu")
        // vykazy link to entry
        let vykazPrac = en.field("Výkaz prác")// práce, zamestnancov, trvanie, hodín, hzs, cena
        let vykazStrojov = en.field("Výkaz strojov")// hodín, hzs, cena
        let vykazMaterialu = en.field("Výkaz materiálu")// atribúty vykonané práce/počet pracovníkov/trvanie/celkový počet hodín
        let vykazDopravy = en.field("Výkaz dopravy")// km, jázd, sadzba, cena
        // calc výkaz prác
        if (evPrace && vykazPrac) {
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
        } else {
            message("Chýba výkaz prác")
            cancel()
            exit()
        }
        ;

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
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
    
}




// End of file: 15.03.2022, 07:59