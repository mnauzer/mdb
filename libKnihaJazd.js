// NEW AND UPDATE ENTRY
const newEntryKnihaJazd= en => {
    let scriptName = "newEntryKnihaJazd23.0.01"
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
        errorGen(LIB_KJ, "libKnihaJazd.js", scriptName, error, variables, parameters)
    }
}

const updateEntryKnihaJazd= en => {
    let scriptName = "updateEntryKnihaJazd23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    message("Úprava záznamu - " + mementoLibrary);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_KJ, "libKnihaJazd.js", scriptName, error, variables, parameters);
    }
}

const saveEntryKnihaJazd= en => {
    let scriptName = "saveEntryKnihaJazd23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, mementoLibrary)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
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