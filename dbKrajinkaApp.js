// Library/Event/Script:    Projekty\Cenové ponuky\shared\krajinkaLib.js
// JS Libraries:
// Dátum:                   06.03.2022
// Popis:                   knižnica krajinkaLib

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
const checkDebug = season => {
    let scriptName = "checkDebug 0.23.05"
    try {
        return getAppSeason(season).field("debug");
    } catch (error) {
        var variables = ""
        errorGen(DB_ASSISTENT, "dbKrajinkaApp.js", scriptName, error, variables);
    }
}
const getAppSeason = (season, mementoLibrary) => {
    let scriptName = "getAppSeason 23.0.05"
    let variables = "Sezóna: " + season +  "\n"
    let parameters = "season: " + season +  "\nmementoLibrary: " + mementoLibrary
    if(season === undefined || season == null){
        msgGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, "season or dbName parameters are missing", variables, parameters );
        cancel();
        exit();
    }
    try {
        let entry = libByName(DB_ASSISTENT).find(season)[0];
        return entry;
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}

const getAppSeasonDatabases = (season, mementoLibrary) => {
    let scriptName = "getAppSeasonDatabases 23.0.04"
    let variables = "Sezóna: " + season +  "\n"
    let parameters = "season: " + season +  "\nmementoLibrary: " + mementoLibrary
    try {
        if(season == undefined){
            msgGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, "", variables, parameters );
            cancel();
            exit();
        }
        return getAppSeason(season).field("Databázy")
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}

const getAppSeasonDB = (season, mementoLibrary, inputScript) => {
    let scriptName = "getAppSeasonDB 23.1.03"
    let variables = "Sezóna: " + season +  "\nKnižnica: " + mementoLibrary + "\n";
    let parameters = "season: " + season +  "\nmementoLibrary: " + mementoLibrary + "\ninputScript: " + inputScript;
    if(season == undefined || mementoLibrary == undefined || season == null || mementoLibrary == null){
        msgGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, "season or mementoLibrary are undefined", variables, parameters );
        cancel();
        exit();
    }
    try {
        let entry = libByName(DB_ASSISTENT).find(season)[0];
        let databazy = entry.field("Databázy");
        for (var v = 0;v < databazy.length; v++) {
            if (databazy[v].field("Názov") == mementoLibrary) {
                let logTxt = "Databáza " + databazy[v].name +" nájdená"
                logGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, logTxt, variables, parameters );
                return databazy[v];
            }
        }
        let logTxt = "Databáza " + mementoLibrary +" nenájdená v sezóne " + season
        logGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, logTxt, variables, parameters );
        return 0;
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}

// get db from APP library
const findAppDB = (season, mementoLibrary, inputScript) => {
    let scriptName = "findAppDB 23.0.08"
    let variables = "Záznam: " + en.name  + "\n"
    let parameters = "season: " + season  + "\inputScript: " + inputScript + "\nmementoLibrary: " + mementoLibrary
    if(season === undefined || season == null){
        msgGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, "season or dbName parameters are missing", variables, parameters );
        cancel();
        exit();
    }
    try {
        let entry = libByName(mementoLibrary).find(season)[0];
        let databazy = entry.field("Databázy");
        for (var v = 0;v < databazy.length; v++) {
            if (databazy[v].field("Názov") == mementoLibrary) {
                return databazy[v];
            }
        }
        message("Databáza " + mementoLibrary + " nenájdená v sezóne " + season);
        return 0;
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}
// get db from APP library
const findAppDBbyName = (season, libTitle) => {
    var entry = libByName(DB_ASSISTENT).find(season)[0];
    var databazy = entry.field("Databázy");
    //message("Databáz 2: " + databazy.length);
    // var filteredDB = databazy.filter(fltrDb(libTitle))[0];
    var filteredDB = databazy.filter(fltrDb)[0];
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
        var firma = klient.field("Firma");
        var ulica = klient.field("Ulica");
        var mesto = (klient.field("PSČ") + " " + klient.field("Mesto")).trim();
        var adresa = firma + "\n" + ulica + "\n" + mesto + "\n";
    }
    return adresa;
};

const getSeason = (en, mementoLibrary, inputScript) => {
    // get entryDefault season from creation date
    let scriptName = "getSeason 23.1.02";
    let variables = "Záznam: " + en.name;
    let parameters = "en: " + en + "\nmementoLibrary: " + mementoLibrary + "\ninputScript: " + inputScript;
    if(en == undefined || en == null){
        msgGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, "parameter en - záznam nie je zadaný", variables, parameters );
        cancel();
        exit();
    }
    try {
        let season = en.field(SEASON) ? en.field(SEASON) : en.field(DATE).getFullYear().toString();
        en.set(SEASON, season)
        variables += "\nSezóna: " + season + "\n";
     //   let logMsg = "Setting season field to " + season;
     //  logGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, logMsg, variables, parameters);
        return season;
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
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

// generátor chyby
const errorGen = (mementoLibrary, library, script, error, variables, parameters) => {
    message("ERR: " + script + "\n" + error);
    let errorLib = libByName("APP Errors");
    let newError = new Object();
    newError["type"] = "error";
    newError["date"] = new Date();
    newError["library"] = library;
    newError["memento library"] = mementoLibrary;
    newError["script"] = script;
    newError["text"] = error;
    newError["line"] = error.lineNumber;
    newError["variables"] = variables;
    newError["parameters"] = parameters;
    errorLib.create(newError);
    cancel();
    exit();
}
// generátor message
const msgGen = (mementoLibrary, library, script, msg, variables, parameters) => {
  //  message("MSG: " + script + "\n" + msg);
    let errorLib = libByName("APP Errors");
    let newMsg = new Object();
    newMsg["type"] = "message";
    newMsg["date"] = new Date();
    newMsg["library"] = library;
    newMsg["memento library"] = mementoLibrary;
    newMsg["script"] = script;
    newMsg["text"] = msg;
    newMsg["variables"] = variables;
    newMsg["parameters"] = parameters;
    errorLib.create(newMsg);
}
// generátor log
const logGen = (mementoLibrary, library, script, log, variables, parameters) => {
   // message("LOG: " + script + "\n" + log);
    let errorLib = libByName("APP Errors");
    let newLog = new Object();
    newLog["type"] = "log";
    newLog["date"] = new Date();
    newLog["library"] = library;
    newLog["memento library"] = mementoLibrary;
    newLog["script"] = script;
    newLog["text"] = log;
    newLog["variables"] = variables;
    newLog["parameters"] = parameters;
    errorLib.create(newLog);
}

// generuje nové číslo záznamu
const getNewNumber = (db, season, isPrefix, mementoLibrary, inputScript) => {
    let scriptName = "getNewNumber 23.1.04"
    let variables = "Knižnica: " + db.name + "\n" + "Sezóna: " + season + "\n" +  "Prefix: " + isPrefix + "\n";
    let parameters = "db: " + db+ "\n" + "season: " + season + "\n" +  "isPrefix: " + isPrefix + "\nmementoLibrary: " + mementoLibrary + "\ninputScript: " + inputScript;
    if(db == undefined || db == null){
        msgGen(DB_ASSISTENT, "dbKrajinkaApp.js", scriptName, "one or all parameters are undefined", variables, parameters );
        cancel();
        exit();
    }
    try {
        let test = db.attr("test");
        let dbID =  db.field("ID");
        let prefix = db.field("Prefix");
        let lastNumAttr = "posledné číslo";
        let attrTrailing = db.attr("trailing digit");
        let attrSeasonTrim = db.attr("season trim");
        if (test) {
            dbID = "T!" + db.field("ID");
            prefix = "T!" + db.field("Prefix");
            attr =  "číslo testu";
        };
        let lastNum = db.attr(lastNumAttr);
        let reservedNum = db.attr("rezervované číslo");
        if (lastNum == reservedNum) {
            lastNum += 1;
        }
        let number = isPrefix ? prefix + season.slice(attrSeasonTrim
            ) + pad(lastNum, attrTrailing) : dbID + season.slice(attrSeasonTrim) + pad(lastNum, attrTrailing);
            db.setAttr(lastNumAttr, lastNum + 1);

            variables += "\nVygenerované číslo: " + number + "\nNasledujúce číslo: " + db.attr(lastNumAttr);
          //  let logMsg = "Vygenerované nové číslo " + number + " v knižnici " + db.name;
          //  logGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, logMsg, variables, parameters);
            return number;

        } catch (error) {
            errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
        }
};
//
// TRIGGERS open and save entry
const setView = (en, mementoLibrary, view) => {
    let scriptName = "setView 23.0.02"
    let variables = "Záznam: " + en.name + "memento library: " + mementoLibrary + "View: " + view
    let parameters = "en: " + en +  "\nmementoLibrary: " + mementoLibrary + "\nview: " + view
    try {
        if (view === FIELD_VIEW_EDIT) {
            en.set(VIEW, FIELD_VIEW_EDIT);
        } else if (view === FIELD_VIEW_PRINT) {
            en.set(VIEW, FIELD_VIEW_PRINT);
         //   en.set(DBG, false);
        }

    } catch (error) {
        errorGen(DB_ASSISTENT, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}
const setEntry = (en, mementoLibrary) => {
    let scriptName = "setEntry 23.0.04"
    let variables = "Záznam: " + en.name + "memento library: "
    let parameters = "en: " + en +  "\nmementoLibrary: " + mementoLibrary
    try {
        message("Nastavujem záznam...");
        setView(en, FIELD_VIEW_EDIT);
        let season = getSeason(en, mementoLibrary, scriptName)
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName);
        if (appDB){
            var locked = appDB.attr("locked");
            if (locked) {
                message("Databáza je zamknutá \nDôvod: "+ appDB.attr("locked reason"))
                cancel()
                exit()
            } else {
            //message(appDB.field("Názov") + ", "+ season);
            let number = [];
            var isNumber = en.field(NUMBER);
            if (isNumber > null) {
                number.push(en.field(NUMBER));
            } else {
                number = getNewNumber(appDB, season, false, mementoLibrary, scriptName);
            }
            // nastav základné polia
            en.set(SEASON, season);
            en.set(NUMBER, number[0]);
            appDB.setAttr("rezervované číslo", number[1]);
            appDB.setAttr("locked", true);
            appDB.setAttr("locked reason", "editácia užívateľom ");
            en.set(LAST_NUM, number[1]);
        }
        } else {
            message("Databáza nenájdená v APP")
        }
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}
const saveEntry = (en, mementoLibrary) => {
    let scriptName = "saveEntry 23.0.03"
    let variables = "Záznam: " + en.name + "memento library: " + mementoLibrary
    let parameters = "en: " + en +  "\nmementoLibrary: " + mementoLibrary
    try {
        message("Ukladám záznam...");
        setView(en, "Tlač");
            let season = getSeason(en, mementoLibrary, scriptName)
            let appDB = getAppSeasonDB(season, mementoLibrary, scriptName);
        if (appDB) {
            appDB.setAttr("posledné číslo", appDB.attr("rezervované číslo"))
        }
        unlockDB(season, mementoLibrary);
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}
//
// ACTIONS library
const unlockDB = (season, mementoLibrary) => {
    let scriptName = "unlockDB 23.0.03";
    let variables = "Season: " + season + "\nDatabáza: " + mementoLibrary;
    let parameters = "season: " + season +  "\nmementoLibrary" + mementoLibrary
    try {
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName);
        appDB.setAttr("rezervované číslo", null);
        appDB.setAttr("locked", false);
        appDB.setAttr("locked reason", null);
        message("Databáza " + mementoLibrary + " odomknutá")
        return true;
    } catch (error) {
        errorGen(mementoLibrary, "dbKrajinkaApp.js", scriptName, error, variables, parameters);
    }
}

const setID = entries => {
    let scriptName = "setID 23.0.01";
    let variables = ""
    try {
    entries.sort(orderDate);
    entries.reverse();
    for (var e = 0; e < entries.length; e++) {
        entries[e].set("ID", e + 1);
    }
    } catch (error) {
        errorGen("dbKrajinkaApp.js", scriptName, error, variables);
    }

}
const setTEST = en => {
    message("Set TEST v.0.23.01");
    let season = getSeason(en);
    let db = findAppDB(season);
    db.setAttr("test", !db.attr("test"));
    if (db.attr("test")) {
        en.set(BKG_COLOR, MEM_LIGHT_YELLOW);
        message("Databáza v testovacom režime");
    } else {
        en.set(BKG_COLOR, MEM_DEFAULT);
        message("Databáza v normálnom režime");
    }
    return true;
}
//
// ACTIONS entry
const setDEBUG = en => {
    message("Set DEBUG v.0.23.01")
    en.set(DBG, !en.field(DBG));
    if (en.field(DBG)) {
        en.set(BKG_COLOR, MEM_LIGHT_BLUE);
    } else {
        en.set(BKG_COLOR, MEM_DEFAULT);
    }
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

const filterByDatePlatnost = (entries, maxDate) => {
    message("filterByDate v.0.23.04");
    var links = [];
    for(var e = 0; e < entries.length; e++) {
        if (entries[e].field("Platnosť od").getTime()/1000 <= maxDate.getTime()/1000) {
            links.push(entries[e])
        }
    }
    return links;
}
// End of file: 25.03.2022, 16:16