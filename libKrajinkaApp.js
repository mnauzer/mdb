// Library/Event/Script:    Projekty\Cenové ponuky\shared\krajinkaLib.js
// JS Libraries:
// Dátum:                   06.03.2022
// Popis:                   knižnica krajinkaLib

const verziaKrajinkaLib = () => {
    var result = "";
    var nazov = "libKrajinkaApp";
    var verzia = "0.23.04";
    result = nazov + " " + verzia;
    return result;
}

const getNumber = en => {
    // vygenerovať nové číslo

    return number;
}


function fltrDb(value) {
    var arr = [0];
    if (value.field("Názov") == lib().title) {
        arr.push(value)
        return arr
    }
}

const setView = (en, view) => {
    if (view === "E") {
        en.set(VIEW, "Editácia");
    } else {
        en.set(VIEW, "Tlač");
        en.set(DBG, false);
    }
}

const pad = (number, length) => {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

// zaokrúhľovanie času na 1/4 hodiny
const roundTimeQ = time => {
    var timeToReturn = new Date(time);
    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
    return timeToReturn;
};

// kontrola či je databáza v móde testovania
const isTest = (sezona, db) => {
    //message("zisťujem stav app a databázy...");
    var entry = libByName(DB_ASSISTENT).find(sezona)[0];
    var appStatus = entry.field("Prevádzka appky");
    if (db && db.field("Testovanie")) {
        var test = true;
        // message("databáza " + db.field("Názov") + " je v testovacom režime...");
    } else if (appStatus == "Testovanie") {
        var test = true;;
        // message("aplikácia je v testovacom režime...");
    } else {
        var test = false;
    }
    return test;
};

// generuje nové číslo záznamu
const newNumber = (sezona, db, withPrefix, sliceNum) => {
    var prefix = 0;
    var lastNum = 0;
    var dbID = 0;
    var cislo = 0;
    var attr = "";
    var rok = libByName(DB_ASSISTENT).find(sezona)[0];
    //message(rok.length);
    var databazy = rok.field("Databázy");

    for (var d = 0; d < databazy.length; d++) {
        if (filteredDB.field("Názov") === db) {
            //  message("Cyklus " + d + "Databáza ..." + filteredDB.field("Názov"));
            var test = isTest(sezona, filteredDB);
            attr = test ? "číslo testu" : "posledné číslo";
            lastNum = filteredDB.attr(attr);
            filteredDB.setAttr(attr, lastNum + 1);
            prefix = test ? "T!" + filteredDB.field("Prefix") : filteredDB.field("Prefix");
            dbID = test ? "T!" + filteredDB.field("ID") : filteredDB.field("ID");
            cislo = withPrefix ? prefix + sezona.slice(sliceNum) + pad(lastNum, 3) : dbID + sezona.slice(sliceNum) + pad(lastNum, 3);
            // message("generujem prefix: " + withPrefix ? prefix : dbID);
        }
    }
    return cislo;
};

const getSeason = (en) => {
    var season = en.field(SEASON);
    if (season < 0) {
       // message("getSeason: " + season);
        return season;
    } else {
        let date = new Date();
        season = date.getFullYear().toString();
       // message("Sezóna: " + season + "\nDate: " + date);
        return season;
    }
}

// generuje nové číslo záznamu
const newNumberV2 = (en, dv, withPrefix, sliceNum) => {
    var sezona = en.field(SEASON);
    var test = isTest(sezona, db);
    var dbID = test ? "T!" + db.field("ID") : db.field("ID");
    var prefix = test ? "T!" + db.field("Prefix") : db.field("Prefix");
    var attr = test ? "číslo testu" : "posledné číslo";
    var lastNum = db.attr(attr);
    var reservedNum = db.attr("rezervované číslo");
    if (lastNum == reservedNum) {
        lastNum += 1;
    }
    filteredDB.setAttr("rezervované číslo", lastNum)
    // filteredDB.setAttr(attr, lastNum + 1);
    var cislo = withPrefix ? prefix + sezona.slice(sliceNum) + pad(lastNum, 3) : dbID + sezona.slice(sliceNum) + pad(lastNum, 3);
    // message("generujem prefix: " + withPrefix ? prefix : dbID);
    return [cislo, lastNum];
};

const setEntry = en =>{
    setView(en, "E");
    let season = getSeason(en);
    let db = findAppDB(season);
    let number = en.field(NUMBER) || newNumberV2(en, db, 0, 3);
    // nastav základné polia
    en.set(SEASON, season);
    en.set(NUMBER, number[0]);
    db.setAttr("rezervované číslo", number[1])
    en.set(LAST_NUM, number[0]);
}


const findAppDB = sezona => {
    var entry = libByName(DB_ASSISTENT).find(sezona)[0];
    var databazy = entry.field("Databázy");
    //message("Databáz 2: " + databazy.length);
    var filteredDB = databazy.filter(fltrDb)[0];
    return filteredDB;
}

const pullAddress = klient => {
    if (klient.field("Firma/Osoba") == "Osoba") {
        var meno = (klient.field("Titul") + klient.field("Meno") + " " + klient.field("Priezvisko")).trim();
        var ulica = klient.field("Ulica");
        var mesto = (klient.field("PSČ") + " " + klient.field("Mesto")).trim();
        var adresa = meno + "\n" + ulica + "\n" + mesto + "\n";
    } else {
        var firma = klient.field("Názov firmy");
        var ulica = klient.field("Ulica");
        var mesto = (klient.field("PSČ") + " " + klient.field("Mesto")).trim();
        var adresa = firma + "\n" + ulica + "\n" + mesto + "\n";
    }
    return adresa;
};

const marzaPercento = (pc, nc) => {
    var result = (((pc - nc) / pc) * 100).toFixed(2);
    return result;
}

const ziskSuma = (pc, nc, dph) => {
    var result = (pc - nc) - ((pc - nc) * dph);
    return result;
}

// zistiť aké je percento rabatu z nc
const rabatPercento = (euro, pc) => {
    var result = euro / pc * 100;
    return result;
}

// aké ja suma v eurách z percenta rabatu a predajnej ceny
const rabatSuma = (percento, pc) => {
    var result = percento / 100 * pc;
    return result;
}

// aké je percento prirážky z nákupnej a predajnej ceny
const prirazkaSuma = (pc, nc) => {
    var result = (pc - nc) / nc * 100;
    return result;
}

const getPCTovaru = (nc, prirazka, sadzbaDPH) => {
    // vypočíta predajnú cenu bez dph z nákupnej ceny a prirážky
    //
    var pcBezDPH = 0;
    var pcSDPH = 0;
    var koefDPH = sadzbaDPH / 100 + 1;
    var koefPrirazka = prirazka / 100 + 1;
    pcSDPH = ((nc * koefPrirazka) * koefDPH).toFixed(1);
    pcBezDPH = pcSDPH / koefDPH;
    return pcBezDPH;
}

const getNCTovaru = (pc, prirazka, sadzbaDPH) => {
    // vypočítať nákupnú cenu bez dph z predajnej ceny a prirážky
    //
    var pcBezDPH = 0;
    var pcSDPH = 0;
    var koefDPH = sadzbaDPH / 100 + 1;
    var koefPrirazka = prirazka / 100 + 1;
    pcSDPH = ((pc * koefPrirazka) * koefDPH).toFixed(1);
    pcBezDPH = pcSDPH / koefDPH;
    return pcBezDPH;
};

const sadzbaZamestnanca2 = (zamestnanec, datum) => {
    var sadzba = 0;
    //zatial len zo zaznnamu
    sadzba = zamestnanec.field(FIELD_HODINOVKA);
    return sadzba;
};

const sadzbaZamestnanca = (zamestnanec, datum) => {
    var sadzba = 0;
    //zatial len zo zaznnamu
    sadzba = zamestnanec.field(FIELD_HODINOVKA);
    return sadzba;
};

const lastSadzba = (employee, date) => {
    // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
    // var links = employee.linksFrom("Zamestnanci Sadzby", "Zamestnanec");
    var links = employee.linksFrom("Zamestnanci Sadzby", "Zamestnanec").filter(e => e.field("Platnosť od") < date);
    if (links.length < 0) {
        message("Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu")
    } else {
    //zotriedi záznamy sadzby od najvyššieho dátumu platnosti
        links.sort((a, b) => a.field("Platnosť od") - b.field("Platnosť od")).reverse();
        // lastValid(links, date, "Sadzba", "Platnosť od")
    }
    //vyberie a vráti sadzbu z prvého záznamu
    var sadzba = links[0].field("Sadzba");
    return sadzba;
}

// const lastSadzba = (employee, date) => {
//     var links = employee.linksFrom("Zamestnanci Sadzby", "Zamestnanec");
//     if (links.length > 0) {
//         var sadzba = lastValid(links, date, "Sadzba", "Platnosť od");
//         return sadzba;
//     } else {
//         message("Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu");
//         return 0;
//     }
// }

const lastValid = (links, date, valueField, dateField) => {
    message(new Date(links[0].field(dateField)).getTime());

    // vráti poslednú hodnotu poľa valueField zo záznamov links podľa dátumu date (dateField poľe)
    links.filter(e => new Date(e.field(dateField)).getTime() < new Date(date).getTime());
    links.sort((a, b) => new Date(b.field(dateField)).getTime() - new Date(a.field(dateField)).getTime());
    links.reverse();
    message("Links: " + links.length + "\nDátum: " + date);
    return links[0].field(valueField);
}

const mclCheck = (mcl, value) => {
    result = false;up
    for (var m = 0; m < mcl.length; m++) {
        if (value === mcl[m]) {
            result = true;
        }
    }
    return result;
}

const lteClear = (lte) => {
    if (lte.length > 0) {
        for (var l = 0; l < lte.length; l++) {
            lte[l].unlink(lte[l]);
        }
    }
}

const lteCheck = (lte, entry) => {
    result = false;
    if (lte.length > 0) {
        for (var index = 0; index < lte.length; index++) {
            if (entry.id === lte[index].id) {
                result = true;
                break;
            }
        }
        return index;
    } else {
        return -1;
    }
}

const zistiIndexLinku = (link, remoteLinks) => {
    var indexy = [];
    for (var r = 0; r < remoteLinks.length; r++) {
        indexy.push(remoteLinks[r].id);
    }
    var index = indexy.indexOf(link.id);
    // message(index);
    return index;
}


const getSumaBezDPH = (sumaSDPH, sadzbaDPH) => {
    result = 0;
    result = sumaSDPH / (sadzbaDPH + 1);
    return result;
}

const getSumaSDPH = (sumaBezDPH, sadzbaDPH) => {
    result = 0;
    result = sumaBezDPH * (sadzbaDPH + 1);
    return result;
}

// End of file: 25.03.2022, 16:16