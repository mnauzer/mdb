// Library/Event/Script:    Evidencia\Pokladňa\shared\pokladnaLibrary.js
// JS Libraries:
// Dátum:                   20.03.2022
// Popis:

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
        errorGen(DB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters)
    }
}


const newEntryPokladna = en => {
    let scriptName = "newEntryPokladna 23.0.01"
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
        errorGen(DB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters)
    }
}

const updateEntryPokladna = en => {
    let scriptName = "updateEntryPokladna 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en 
    message("Úprava záznamu - " + mementoLibrary);
    try {
        
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(DB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters);
    }
}

const saveEntryPokladna = en => {
    let scriptName = "saveEntryPokladna 23.0.02"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en 
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, mementoLibrary)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(DB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters);
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
                let sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100
            } else if (en.field("sadzba") === "znížená") {
                let sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Znížená sadzba DPH") / 100
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
        errorGen(DB_POKLADNA, "libPokladna.js", scriptName, error, variables, parameters)
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