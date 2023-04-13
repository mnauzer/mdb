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

// HELPERS
var orderDate = { compare: function(a,b) { return b.field(DATE).getTime()/1000 - a.field(DATE).getTime()/1000; }}
var orderPlatnost = { compare: function(a,b) { return b.field("Platnosť od").getTime()/1000 - a.field("Platnosť od").getTime()/1000; }}
var filterPlatnost = { compare: function(a,b) { return a.field("Platnosť od").getTime()/1000 < date}}
// example:
// var entries = lib().entries();
// var order = { compare: function(a,b) { return b.field("date").getTime()/1000 - a.field("date").getTime()/1000; }}
// entries.sort(order);
// entryDefault().set("previous", entries[0].field("current"));
function fltrDb(value) {
    var arr = [0];
    if (value.field("Názov") == lib().title) {
        arr.push(value);
        return arr;
    }
}
function fltrDbByName(value, name) {
    var arr = [0];
    if (value.field("Názov") == name) {
        arr.push(value);
        return arr;
    }
}






const dateDiff = (date1, date2) => {
    var diff = {}// Initialization of the return
    var tmp = date2 - date1;

    tmp = Math.floor(tmp/1000);// Number of seconds between the 2 dates
    diff.sec = tmp % 60;
    //Extracting the number of seconds

    tmp = Math.floor((tmp-diff.sec)/60);// Number of minutes (whole part)
    diff.min = tmp % 60;
    // Extract the number of minutes

    tmp = Math.floor((tmp-diff.min)/60);// Number of hours (whole)
    diff.hour = tmp % 24;
    // Extract the number of hours

    tmp = Math.floor((tmp-diff.hour)/24);

    // Nombre de jours restants
    diff.day = tmp % 7;

    tmp = Math.floor((tmp-diff.day)/7);
    diff.week = tmp % 4;

    tmp = Math.floor((tmp-diff.week)/4);
    diff.mon = tmp % 12;

    tmp = Math.floor((tmp-diff.mon)/12);
    diff.year = tmp;

    return diff;
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
const mclCheck = (mcl, value) => {
    result = false;
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
// get db from APP library
const findAppDB = season => {
    var entry = libByName(DB_ASSISTENT).find(season)[0];
    var databazy = entry.field("Databázy");
    //message("Databáz 2: " + databazy.length);
    var filteredDB = databazy.filter(fltrDb)[0];
    return filteredDB;
}
// get db from APP library
const findAppDBbyName = (season, libTitle) => {
    var entry = libByName(DB_ASSISTENT).find(season)[0];
    var databazy = entry.field("Databázy");
    //message("Databáz 2: " + databazy.length);
    var filteredDB = databazy.filter(fltrDb(libTitle))[0];
    return filteredDB;
}
// fill customer address field
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
// get entryDefault season from creation date
const getSeason = en => {
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
const lastValid = (links, date, valueField, dateField) => {
    message(new Date(links[0].field(dateField)).getTime());

    // vráti poslednú hodnotu poľa valueField zo záznamov links podľa dátumu date (dateField poľe)
    links.filter(e => new Date(e.field(dateField)).getTime()/1000 <= new Date(date).getTime()/1000);
    links.sort(orderPlatnost);
    links.reverse();
    message("Links: " + links.length + "\nDátum: " + date);
    return links[0].field(valueField);
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
// get index of link from links.linkFrom(lib, field)
const getLinkIndex = (link, remoteLinks) => {
    var indexy = [];
    for (var r = 0; r < remoteLinks.length; r++) {
        indexy.push(remoteLinks[r].id);
    }
    var index = indexy.indexOf(link.id);
    // message(index);
    return index;
}
// generuje nové číslo záznamu
const getNewNumber = (lib, season, isPrefix) => {
    var test = lib.attr("test");
    let dbID =  lib.field("ID");
    let prefix = lib.field("Prefix");
    let attr = "posledné číslo";
    let attrTrailing = lib.attr("trailing digit");
    let attrSeasonTrim = lib.attr("season trim");
    if (test) {
        dbID = "T!" + lib.field("ID");
        prefix = "T!" + lib.field("Prefix");
        attr =  "číslo testu";
    };
    let lastNum = lib.attr(attr);
    let reservedNum = lib.attr("rezervované číslo");
    if (lastNum == reservedNum) {
        lastNum += 1;
    }
    let number = isPrefix ? prefix + season.slice(attrSeasonTrim
    ) + pad(lastNum, attrTrailing) : dbID + season.slice(attrSeasonTrim) + pad(lastNum, attrTrailing);
    message("Záznam číslo: " + number);
    return [number, lastNum];
};
//
// TRIGGERS open and save entry
const setView = (en, view) => {
    if (view === "Editácia") {
        en.set(VIEW, "Editácia");
    } else if (view ==="Tlač") {
        en.set(VIEW, "Tlač");
        en.set(DBG, false);
    }
}
const setEntry = (en, isPrefix) => {
    message("Nastavujem záznam...");
    setView(en, "Editácia");
    var prfx = isPrefix || false;
    var season = getSeason(en);
    var db = findAppDB(season);
    var locked = db.attr("locked");
    if (locked) {
        message("Databáza je zamknutá \nDôvod: "+ db.attr("locked reason"));
        cancel();
    } else {
        //message(db.field("Názov") + ", "+ season);
        let number = [];
        var isNumber = en.field(NUMBER);
        if (isNumber > null) {
            number.push(en.field(NUMBER));
        } else {
            number = getNewNumber( db, season, prfx);
        }
        // nastav základné polia
        en.set(SEASON, season);
        en.set(NUMBER, number[0]);
        db.setAttr("rezervované číslo", number[1]);
        db.setAttr("locked", true);
        db.setAttr("locked reason", "editácia užívateľom ");
        en.set(LAST_NUM, number[1]);
    }
}
const saveEntry = en => {
    message("Ukladám záznam...");
    setView(en, "Tlač");
    let season = getSeason(en);
    let db = findAppDB(season);
    db.setAttr("posledné číslo", db.attr("rezervované číslo"))
    unlockDB(en);

}
//
// ACTIONS
const unlockDB = en => {
    message("Unlock DB v.0.23.01");
    let season = getSeason(en);
    let db = findAppDB(season);
    db.setAttr("rezervované číslo", null);
    db.setAttr("locked", false);
    db.setAttr("locked reason", null);
    return true;
}
const setID = entries => {
    message("Set ID v.0.23.08");
    message(entries.length + " záznamov")
    entries.sort(orderDate);
    entries.reverse();
    for (var e = 0; e < entries.length; e++) {
        entries[e].set("ID", e + 1);
    }
}
const setDEBUG = en => {
    message("Set DEBUG v.0.23.01")
    en.set(DEBUG, !en.field(DEBUG));
}
//
// Price functions
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
const getSadzbaDPH = season => {


}

// EMPLOYEES functions
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
    var links = employee.linksFrom("Zamestnanci Sadzby", "Zamestnanec").filter(e => e.field("Platnosť od").getTime()/1000 < date.getTime()/1000);
    // var links = employee.linksFrom("Zamestnanci Sadzby", "Zamestnanec").filter(filterPlatnost);
    if (links.length < 0) {
        message("Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu")
    } else {
    //zotriedi záznamy sadzby od najvyššieho dátumu platnosti
        //links.sort((a, b) => a.field("Platnosť od") - b.field("Platnosť od")).reverse();
        links.sort(orderPlatnost);
        // lastValid(links, date, "Sadzba", "Platnosť od")
        links.reverse();
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
const employeeTariffValidToDate = (employee, date) => {
    var links = employee.linksFrom("Zamestnanci Sadzby", "Zamestnanec");
    var filtered = [];
    message("záznamov " + links.length);
    // links.filter(e => e.field("Platnosť od").getTime()/1000 <= date.getTime()/1000);
    for (var e = 0; e < links.length; e++) {
        if (links[e].field("Platnosť od").getTime()/1000 <= date.getTime()/1000) {
            filtered.push(links[e]);
        }
    };
    message("filtrovaných záznamov " + links.length);
    if (links.length < 0) {
        message("Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu")
    } else {
        links.sort(orderPlatnost);
    }
    var sadzba = links[0].field("Sadzba");
    message("Sadzba platná k dátumu: " + date + " je " + sadzba + " €");
    return sadzba;
}







// End of file: 25.03.2022, 16:16