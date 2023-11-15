// Library/Event/Script:    Projekty\Cenové ponuky\shared\krajinkaLib.js
// JS Libraries:
// Dátum:                   06.03.2022
// Popis:                   knižnica krajinkaLib

// HELPERS
var orderDate = { compare: function(a,b) { return b.field(DATE).getTime()/1000 - a.field(DATE).getTime()/1000 }}
var orderPlatnost = { compare: function(a,b) { return b.field("Platnosť od").getTime()/1000 - a.field("Platnosť od").getTime()/1000 }}
var filterPlatnost = { compare: function(a,b) { return a.field("Platnosť od").getTime()/1000 < date}}

// FILTER FUNCTIONS
//
function fltrDb(value) {
    var arr = [0]
    if (value.field("Názov") == lib().title) {
        arr.push(value)
        return arr
    }
}
function fltrDbByName(value, name) {
    var arr = [0]
    if (value.field("Názov") == name) {
        arr.push(value)
        return arr
    }
}
const filterByDate = (entries, maxDate, dateField, inptScript) => {
    //odfiltruje záznamy s vyšším dátumom ako maxDate v poli datefield
    let scriptName = "filterByDate 23.0.08"
    let variables = "user: " + user()
    let parameters = "entries: " + entries.length + "\nmaxDate: " + maxDate + "\ndateField: " + dateField +"\ninptScript: " + inptScript
    try {
        let logTxt = "entries: " + entries.length
        //let links = []
        // for(var e = 0; e < entries.length; e++) {
        //     if (entries[e].field(dateField).getTime()/1000 <= maxDate.getTime()/1000) {
        //         links.push(entries[e])
        //     }
        // }
        // return links
        entries.filter(entry => entry.field(dateField).getTime()/1000 <= maxDate.getTime()/1000)
        logTxt += "\nfiltered entries: " + entries.length
        logGen(APP, "appAsistanto.js", scriptName, logTxt, variables, parameters )
        return entries
    } catch (error) {
        variables += "\nlinks: " + entries.length
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}

// DATE TIME FUNCTONS
//
const dateDiff = (date1, date2) => {
    var diff = {}// Initialization of the return
    var tmp = date2 - date1

    tmp = Math.floor(tmp/1000)// Number of seconds between the 2 dates
    diff.sec = tmp % 60
    //Extracting the number of seconds

    tmp = Math.floor((tmp-diff.sec)/60)// Number of minutes (whole part)
    diff.min = tmp % 60
    // Extract the number of minutes

    tmp = Math.floor((tmp-diff.min)/60)// Number of hours (whole)
    diff.hour = tmp % 24
    // Extract the number of hours

    tmp = Math.floor((tmp-diff.hour)/24)

    // Nombre de jours restants
    diff.day = tmp % 7

    tmp = Math.floor((tmp-diff.day)/7)
    diff.week = tmp % 4

    tmp = Math.floor((tmp-diff.week)/4)
    diff.mon = tmp % 12

    tmp = Math.floor((tmp-diff.mon)/12)
    diff.year = tmp

    return diff
}
const roundTimeQ = time => {
    // zaokrúhľovanie času na 1/4 hodiny
    var timeToReturn = new Date(time)
    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000)
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60)
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15)
    return timeToReturn
}

// NUMBER FUNCTIONS
//
const pad = (number, length) => {
    // pridá počet núl k čislu do zadanej dĺžky
    let str = '' + number
    while (str.length < length) {
        str = '0' + str
    }
    return str
}

// MEMENTO FIELD HELPERS
//
const mclCheck = (mcl, value) => {
    result = false
    for (var m = 0; m < mcl.length; m++) {
        if (value === mcl[m]) {
            result = true
        }
    }
    return result
}
const lteClear = lte => {
    // link to entry field clearing
    // Parameter: lte, link to entry field to be cleared
    if (lte.length > 0) {
        for (var l = 0; l < lte.length; l++) {
            lte[l].unlink(lte[l])
        }
    }
}
const checkDebug = season => {
    let scriptName = "checkDebug 0.23.05"
    try {
        return getAppSeason(season).field("debug")
    } catch (error) {
        var variables = ""
        errorGen(APP, "appAsistanto.js", scriptName, error, variables)
    }
}
const pullAddress = klient => {
    // fill customer address field
    if (klient.field("Firma/Osoba") == "Osoba") {
        var meno = (klient.field("Titul") + klient.field("Meno") + " " + klient.field("Priezvisko")).trim()
        var ulica = klient.field("Ulica")
        var mesto = (klient.field("PSČ") + " " + klient.field("Mesto")).trim()
        var adresa = meno + "\n" + ulica + "\n" + mesto + "\n"
    } else {
        var firma = klient.field("Firma")
        var ulica = klient.field("Ulica")
        var mesto = (klient.field("PSČ") + " " + klient.field("Mesto")).trim()
        var adresa = firma + "\n" + ulica + "\n" + mesto + "\n"
    }
    return adresa
}
const lteCheck = (lte, entry) => {
    result = false
    if (lte.length > 0) {
        for (var index = 0; index < lte.length; index++) {
            if (entry.id === lte[index].id) {
                result = true
                break
            }
        }
        return index
    } else {
        return -1
    }
}
const getLinkIndex = (link, remoteLinks) => {
    // get index of link from links.linkFrom(lib, field)
    var indexy = []
    for (var r = 0; r < remoteLinks.length; r++) {
        indexy.push(remoteLinks[r].id)
    }
    var index = indexy.indexOf(link.id)
    // message(index)
    return index
}

// KRAJINKA APP FUNCTIONS
// získat údaje z Krajinka APP
const getAppSeason = (season, mementoLibrary) => {
    let scriptName = "getAppSeason 23.0.06"
    try {
        let variables = "Sezóna: " + season +  "\n"
        let parameters = "season: " + season +  "\nmaxDate: " + maxDate
        if(season === undefined || season == null){
            msgGen(mementoLibrary, "appAsistanto.js", scriptName, "season or dbName parameters are missing", variables, parameters )
            cancel()
            exit()
        }
        let entry = libByName(APP).find(season)[0]
        return entry
    } catch (error) {
        errorGen(mementoLibrary, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const getAppSeasonDatabases = (season, mementoLibrary) => {
    let scriptName = "getAppSeasonDatabases 23.0.04"
    let variables = "Sezóna: " + season +  "\n"
    let parameters = "season: " + season +  "\nmementoLibrary: " + mementoLibrary
    try {
        if(season == undefined){
            msgGen(mementoLibrary, "appAsistanto.js", scriptName, "", variables, parameters )
            cancel()
            exit()
        }
        return getAppSeason(season).field("Databázy")
    } catch (error) {
        errorGen(mementoLibrary, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const getAppSeasonDB = (season, mementoLibrary, inptScript) => {
    let scriptName = "getAppSeasonDB 23.1.10"
    let parameters = "season: " + season +  "\nmementoLibrary: " + mementoLibrary + "\ninptScript: " + inptScript
    let variables = "user: " + user()
    try {
        let attributes = ""
        if(season == undefined || mementoLibrary == undefined || season == null || mementoLibrary == null){
            msgGen(mementoLibrary, "appAsistanto.js", scriptName, "season or mementoLibrary are undefined", variables, parameters )
            cancel()
            exit()
        }
        let entry = libByName(APP).find(season)[0]
        let databazy = entry.field("Databázy")
        for (var v = 0;v < databazy.length; v++) {
            if (databazy[v].field("Názov") == mementoLibrary) {
                let logTxt = "Databáza " + databazy[v].name +" nájdená"
                // TODO: make it js object
                attributes =
                "\nnasledujúce číslo: " + databazy[v].attr("nasledujúce číslo") +
                "\nčíslo testu: " + databazy[v].attr("číslo testu") +
                "\nrezervované číslo: " + databazy[v].attr("rezervované číslo") +
                "\ndebug: " + databazy[v].attr("debug") +
                "\nlocked: " + databazy[v].attr("locked") +
                "\nlocked reason: " + databazy[v].attr("locked reason") +
                "\ntest: " + databazy[v].attr("test") +
                "\nprefix: " + databazy[v].attr("prefix") +
                "\nseason trim: " + databazy[v].attr("season trim") +
                "\ntrailing digit: " + databazy[v].attr("trailing digit")
                logGen(mementoLibrary, "appAsistanto.js", scriptName, logTxt, variables, parameters, attributes )
                return databazy[v]
            }
        }
        let logTxt = "Databáza " + mementoLibrary +" nenájdená v sezóne " + season
        logGen(APP, "appAsistanto.js", scriptName, logTxt, variables, parameters, attributes )
        return 0
    } catch (error) {
        variables += ""
        errorGen(mementoLibrary, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const findAppDB = (season, mementoLibrary, inptScript) => {
    // get db from APP library
    let scriptName = "findAppDB 23.0.98"
    let variables = "Záznam: " + en.name
    let parameters = "season: " + season  + "\ninptScript: " + inptScript + "\nmementoLibrary: " + mementoLibrary
    if(season === undefined || season == null){
        msgGen(mementoLibrary, "appAsistanto.js", scriptName, "season or dbName parameters are missing", variables, parameters )
        cancel()
        exit()
    }
    try {
        let entry = libByName(mementoLibrary).find(season)[0]
        let databazy = entry.field("Databázy")
        for (var v = 0;v < databazy.length; v++) {
            if (databazy[v].field("Názov") == mementoLibrary) {
                return databazy[v]
            }
        }
        message("Databáza " + mementoLibrary + " nenájdená v sezóne " + season)
        return 0
    } catch (error) {
        errorGen(mementoLibrary, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const findAppDBbyName = (season, libTitle) => {
    // get db from APP library
    var entry = libByName(APP).find(season)[0]
    var databazy = entry.field("Databázy")
    //message("Databáz 2: " + databazy.length)
    // var filteredDB = databazy.filter(fltrDb(libTitle))[0]
    var filteredDB = databazy.filter(fltrDb)[0]
    return filteredDB
}
const getSeason = (en, mementoLibrary, inptScript) => {
    // get entryDefault season from creation date
    let scriptName = "getSeason 23.1.0"
    let variables = "Záznam: " + en.name
    let parameters = "en: " + en + "\nmementoLibrary: " + mementoLibrary + "\ninptScript: " + inptScript
    if(en == undefined || en == null){
        msgGen(mementoLibrary, "appAsistanto.js", scriptName, "parameter en - záznam nie je zadaný", variables, parameters )
        cancel()
        exit()
    }
    try {
        let season = en.field(SEASON) ? en.field(SEASON) : en.field(DATE).getFullYear().toString()
        variables += "\nSezóna: " + season + "\n"
     //   let logMsg = "Setting season field to " + season
     //  logGen(mementoLibrary, "appAsistanto.js", scriptName, logMsg, variables, parameters)
        return season
    } catch (error) {
        errorGen(mementoLibrary, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const lastValid = (links, date, valueField, dateField, inptScript) => {
    //message(new Date(links[0].field(dateField)).getTime())
    // zistí sadzby DPH v zadanej sezóne
    let scriptName = "lastValid 23.0.07"
    let variables = "Links: " + links.length + "\nDátum: " + date
    let parameters = "links: " + links.length + "\ndate: " + date + "\nvalueField: " + valueField + "\ndateField: " + dateField  + "\ninptScript: " + inptScript
    try {
        // vráti poslednú hodnotu poľa valueField zo záznamov links podľa dátumu date (dateField poľe)
        //links.filter(e => new Date(e.field(dateField)).getTime()/1000 <= new Date(date).getTime()/1000)
               // ✅ Sort in Ascending order (low to high)
        let sadzby = []
        filteredLinks = filterByDate(links, date, dateField, scriptName)
        filteredLinks.sort((objA, objB) => Number(objA.field(dateField) - Number(objB.field(dateField))))
        filteredLinks.reverse()
        // for (let i = 0; filteredLinks.length; i++) {
        //     sadzby.push(filteredLinks.field(valueField))
        // }
        //return sadzby[0]
        return filteredLinks[0].field(valueField)
    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const getNewNumber = (appDB, season, mementoLibrary, inptScript) => {
    // generuje nové číslo záznamu
    let scriptName = "getNewNumber 23.1.09"
    try {
        let variables = "Knižnica: " + appDB.name + "\nSezóna: " + season
        let parameters = "appDB: " + appDB+ "\nseason: " + season + "\nmementoLibrary: " + mementoLibrary + "\ninptScript: " + inptScript
        if(appDB == undefined || appDB == null || season == undefined || season == null){
            msgGen(APP, "appAsistanto.js", scriptName, "one or all parameters are undefined", variables, parameters )
            cancel()
            exit()
        }
        let number = []
        let test = appDB.attr("test")
        let dbID =  appDB.field("ID")
        let prefix = appDB.field("Prefix")
        let isPrefix = appDB.attr("prefix")
        let attrTrailing = appDB.attr("trailing digit")
        let attrSeasonTrim = appDB.attr("season trim")
        if (test) {
            dbID = "T!" + appDB.field("ID")
            prefix = "T!" + appDB.field("Prefix")
            attr =  "číslo testu"
        }
        let lastNum = appDB.attr("nasledujúce číslo")
        appDB.setAttr("rezervované číslo", lastNum)
        number[0] = isPrefix ? prefix + season.slice(attrSeasonTrim) + pad(lastNum, attrTrailing) : dbID + season.slice(attrSeasonTrim) + pad(lastNum, attrTrailing)
        number[1] = lastNum
        return number
    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const getSadzbaDPH = (appDB, season, inptScript) => {
      // zistí sadzby DPH v zadanej sezóne
    let scriptName = "getSadzbaDPH 23.0.02"
    let variables = "Knižnica: " + appDB.name + "\nSezóna: " + season
    let parameters = "appDB: " + appDB+ "\nseason: " + season + "\ninptScript: " + inptScript
    if(appDB == undefined || appDB == null || season == undefined || season == null){
        msgGen(APP, "appAsistanto.js", scriptName, "one or all parameters are undefined or null", variables, parameters )
        cancel()
        exit()
    }
    try {
        let sadzbyDPH = []
        sadzbyDPH.push(appDB.field("Základná sadzba DPH"))
        sadzbyDPH.push(appDB.field("Znížená sadzba DPH"))
        return sadzbyDPH
    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}


// ENTRY SCRIPT HELPERS
// new entry script TRIGGERS
const newEntry = en => {
    let scriptName = "newEntry 23.0.05"
    let mementoLibrary = lib().title
    let variables = "user" + user()
    let parameters = "en: " + en
    try {
        message("Nový záznam [" + mementoLibrary + "]")
        en.set(VIEW, VIEW_EDIT)
        en.set(DATE, new Date())
        en.set(CR, user())
        en.set(CR_DATE, new Date())
        let season = getSeason(en, mementoLibrary, scriptName)
        variables += "\nseason: " + season //msgGen log
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName)
        if (appDB){
            variables += "\nappDB: " + appDB
            let number = getNewNumber(appDB, season, mementoLibrary, scriptName)
            variables += "\nnumber: " + number
            en.set(NUMBER, number[0])
            en.set(NUMBER_ENTRY, number[1])
            en.set(SEASON, season)
        } else {
            message("Databáza nenájdená v APP")
        }
    } catch (error) {
        variables += "\nentry: " + en.name + "\nmementoLibrary: " + mementoLibrary
        en.set(VIEW, VIEW_DEBUG)
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const updateEntry = en => {
    let scriptName = "updateEntry 23.0.05"
    let mementoLibrary = lib().title
    let variables = "user: " + user()
    let parameters = "en: " + en
    try {
        message("Úprava záznamu - " + mementoLibrary);
        en.set(VIEW, VIEW_EDIT)
        en.set(DATE, en.field(DATE) ? en.field(DATE) : new Date())
        en.set(MOD, user())
        en.set(MOD_DATE, new Date())
        let season = getSeason(en, mementoLibrary, scriptName)
        variables += "\nseason: " + season //msgGen log
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName)
        if (appDB){
            variables += "\nappDB: " + appDB
        } else {
            message("Databáza nenájdená v APP")
        }
    } catch (error) {
        variables += "\nentry: " + en.name + "mementoLibrary: " + mementoLibrary
        en.set(VIEW, VIEW_DEBUG)
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters);
    }
}
const setEntry = (en, inptScript) => {
    let scriptName = "setEntry 23.0.07"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "\nmemento library: " + mementoLibrary
    let parameters = "en: " + en +  "\nmementoLibrary: " + mementoLibrary +  "\ninptScript: " + inptScript
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const saveEntry = (en, mementoLibrary, inptScript) => {
    let scriptName = "saveEntry 23.0.13"
    let variables = "user: " + user()
    let parameters = "en: " + en +  "\nmementoLibrary: " + mementoLibrary + "\ninptScript: " + inptScript
    try {
        message("Ukladám záznam...")
        en.set(VIEW, VIEW_PRINT)
        let season = getSeason(en, mementoLibrary, scriptName)
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName)
        let nextNumber = en.field(NUMBER_ENTRY)
        appDB.setAttr("nasledujúce číslo", nextNumber++)
        // let msgTxt = "Nový záznam [" + en.field(NUMBER) + "] v knižnici " + mementoLibrary
        // message(msgTxt)
        // msgGen(APP, "appAsistanto.j", scriptName, msgTxt, variables, parameters)
        let logTxt = "Nový záznam [" + en.field(NUMBER) + "] v knižnici " + mementoLibrary
        logGen(APP, "appAsistanto.js", scriptName, logTxt, variables, parameters)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        variables += "\nentry: " + en.name + "\nmemento library: " + mementoLibrary
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
// entry script ACTIONS
const unlockDB = (season, mementoLibrary) => {
    let scriptName = "unlockDB 23.0.04"
    let variables = "Season: " + season + "\nDatabáza: " + mementoLibrary
    let parameters = "season: " + season +  "\nmementoLibrary" + mementoLibrary
    try {
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName)
        appDB.setAttr("locked", false)
        appDB.setAttr("locked reason", null)
        //message("Databáza " + mementoLibrary + " odomknutá")
        return true
    } catch (error) {
        errorGen(mementoLibrary, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const setID = entries => {
    let scriptName = "setID 23.0.04"
    let variables = "Počet záznamov: " + entries.length
    let parameters = "entries: " + entries
    try {
        message("Clearing old ID's")
        for (var e = 0; e < entries.length; e++) {
            entries[e].set("ID", null)
        }
        entries.sort(orderDate)
        entries.reverse()
        for (var e = 0; e < entries.length; e++) {
            entries[e].set("ID", e++)
        }
        message("ID's is set")
    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }

}
const setNumber = entries => {
    let scriptName = "setNumber 23.0.02"
    let variables = "Počet záznamov: " + entries.length
    let parameters = "entries: " + entries
    try {
        entries.sort(orderDate)
        message("Clearing old numbers")
        for (var e = 0; e < entries.length; e++) {
            entries[e].set("number", null)
        }
        entries.reverse()
        for (var e = 0; e < entries.length; e++) {
            entries[e].set("number", e++)
        }
        message("new number's is set")
    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }

}
const setTEST = en => {
    message("Set TEST v.0.23.01")
    let season = getSeason(en)
    let db = findAppDB(season)
    db.setAttr("test", !db.attr("test"))
    if (db.attr("test")) {
        en.set(BKG_COLOR, MEM_LIGHT_YELLOW)
        message("Databáza v testovacom režime")
    } else {
        en.set(BKG_COLOR, MEM_DEFAULT)
        message("Databáza v normálnom režime")
    }
    return true
}
const setDEBUG = en => {
    message("Set DEBUG v.0.23.01")
    en.set(DBG, !en.field(DBG))
    if (en.field(DBG)) {
        en.set(BKG_COLOR, MEM_LIGHT_BLUE)
    } else {
        en.set(BKG_COLOR, MEM_DEFAULT)
    }
}
const setIdentifikator = en => {
    // nastaví pole identifikátor
    let scriptName = "setIdentifikator 23.0.03"
    let libName = lib().name
    let variables = "Záznam: " + en.name
    let parameters = "en: " + en
    let identifikator = ""
    try {
        switch (libName) {
            case LIB_MIE:
                identifikator =  en.field("Klient")[0].name
                return identifikator
                break
            case LIB_ZKZ:
                identifikator =  en.field("Klient")[0].name
                return identifikator
                break
            default:
                break
        }
        en.set("Identifikátor", identifikator)
    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}



// PRICE FUNCTIONS
//
const marzaPercento = (pc, nc) => {
    // vypočíta percentuálnu maržu z nákupnej a predajnej ceny
    var result = (((pc - nc) / pc) * 100).toFixed(2)
    return result
}
const ziskSuma = (pc, nc, dph) => {
    // vypočíta sumu zisku z nákupnej a predajnej ceny a sadzby dph
    var result = (pc - nc) - ((pc - nc) * dph)
    return result
}
const rabatPercento = (euro, pc) => {
    // zistí aké je percento rabatu z nc
    var result = euro / pc * 100
    return result
}
const rabatSuma = (percento, pc) => {
    // aké ja suma v eurách z percenta rabatu a predajnej ceny
    var result = percento / 100 * pc
    return result
}
const prirazkaSuma = (pc, nc) => {
    // aké je percento prirážky z nákupnej a predajnej ceny
    var result = (pc - nc) / nc * 100
    return result
}
const getPCTovaru = (nc, prirazka, sadzbaDPH) => {
    // vypočíta predajnú cenu bez dph z nákupnej ceny a prirážky
    var pcBezDPH = 0
    var pcSDPH = 0
    var koefDPH = sadzbaDPH / 100 + 1
    var koefPrirazka = prirazka / 100 + 1
    pcSDPH = ((nc * koefPrirazka) * koefDPH).toFixed(1)
    pcBezDPH = pcSDPH / koefDPH
    return pcBezDPH
}
const getNCTovaru = (pc, prirazka, sadzbaDPH) => {
    // vypočítať nákupnú cenu bez dph z predajnej ceny a prirážky
    //
    var pcBezDPH = 0
    var pcSDPH = 0
    var koefDPH = sadzbaDPH / 100 + 1
    var koefPrirazka = prirazka / 100 + 1
    pcSDPH = ((pc * koefPrirazka) * koefDPH).toFixed(1)
    pcBezDPH = pcSDPH / koefDPH
    return pcBezDPH
}
const getSumaBezDPH = (sumaSDPH, sadzbaDPH) => {
    result = 0
    result = sumaSDPH / (sadzbaDPH + 1)
    return result
}
const getSumaSDPH = (sumaBezDPH, sadzbaDPH) => {
    result = 0
    result = sumaBezDPH * (sadzbaDPH + 1)
    return result
}

// LOG AND ERROR
//
const errorGen = (mementoLibrary, library, script, error, variables, parameters) => {
    // generátor chyby
    message("ERROR: " + script + "\n" + error)
    let errorLib = libByName(APP_ERROR)
    let newError = new Object()
    newError["type"] = "error"
    newError["date"] = new Date()
    newError["library"] = library
    newError["memento library"] = mementoLibrary
    newError["script"] = script
    newError["text"] = error
    newError["line"] = error.lineNumber
    newError["variables"] = variables
    newError["parameters"] = parameters
    errorLib.create(newError)
    cancel()
    exit()
}
const msgGen = (mementoLibrary, library, script, msg, variables, parameters) => {
    // generátor message
  //  message("MSG: " + script + "\n" + msg)
    let errorLib = libByName(APP_ERROR)
    let newMsg = new Object()
    newMsg["type"] = "message"
    newMsg["date"] = new Date()
    newMsg["library"] = library
    newMsg["memento library"] = mementoLibrary
    newMsg["script"] = script
    newMsg["text"] = msg
    newMsg["variables"] = variables
    newMsg["parameters"] = parameters
    errorLib.create(newMsg)
}
const logGen = (mementoLibrary, library, script, log, variables, parameters, attributes) => {
    // generátor log
   // message("LOG: " + script + "\n" + log)
    let errorLib = libByName(APP_ERROR)
    let newLog = new Object()
    newLog["type"] = "log"
    newLog["date"] = new Date()
    newLog["library"] = library
    newLog["memento library"] = mementoLibrary
    newLog["script"] = script
    newLog["text"] = log
    newLog["variables"] = variables
    newLog["parameters"] = parameters
    newLog["attributes"] = attributes
    errorLib.create(newLog)
}


// ZAMESTNANCI
const lastSadzba = (employee, date, inptScript) => {
    let scriptName = "lastSadzba 23.0.10"
    let variables = "user: " + user()
    let parameters = "employee: " + employee + "\ndate: " + date + "\ninptScript: " + inptScript
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        let links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        let dateField ="Platnosť od"
        variables += "\nZáznamov: " + links.length
        filteredLinks = filterByDate(links, date, dateField, scriptName);
        variables += "\nFiltrovaných záznamov: " + filteredLinks.length
        if (filteredLinks.length < 0) {
            msgGen(APP, "appAsistanto.js", scriptName, 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu', variables, parameters);
        } else {
            filteredLinks.sort({ compare: function(a,b) { return b.field(dateField).getTime()/1000 - a.field(dateField).getTime()/1000 }})
            filteredLinks.reverse();
        }
        //vyberie a vráti sadzbu z prvého záznamu
        let sadzba = filteredLinks[0].field("Sadzba");
        variables += "\nZamestnanec: " + employee.name + "\nSadzba: " + sadzba
        let msgTxt = "Nájdená sadzba zamestnanca " + employee.name
        msgGen(APP, "appAsistanto.js", scriptName, msgTxt, variables, parameters);
        return sadzba;
    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters);
    }
}

const getLibFieldsNames = lib =>{
    let scriptName = "getLibFieldsNames 23.0.14"
    let libName = lib.title
    let variables = "Library: " + libName
    let parameters = "lib: " + libName
    try {
        let fields = lib.fields()
        let fieldsNames = []
        let appDB = libByName(APP_DB)
        let entryToSet = appDB.find(libName)[0]
        for (let f in fields) {
            fieldsNames.push(fields[f] + "\n")
        }
        let msgTxt = "App DB: " + appDB + "\nEntryToSet: " + entryToSet.name
        msgGen(APP, "appAsistanto.js", scriptName, msgTxt, variables, parameters);
        entryToSet.set("Fields", fieldsNames)

    } catch (error) {
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}

// COLORS
const setBckgColor = (en, field) => {
    let scriptName = "setBckgColor 23.0.02"
    let variables = "user: " + user()
    let parameters = "en:" + en + "\nfield: " + field
    try {
        let libName = lib().title
        switch (libName) {
            case LIB_ZKZ: // Zákazky
                switch (field) {
                    case "Čakajúca":
                            en.set(BKG_COLOR, MEM_LIGHT_GREEN)
                    case "Čakajúca (klient)":
                            en.set(BKG_COLOR, AIRCRAFT_WHITE)
                        break;
                    case "Prebieha":
                            en.set(BKG_COLOR, BONE)
                        break;
                    case "Ukončená":
                            en.set(BKG_COLOR, MEDIUM_GRAY)
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
}
    } catch (error) {
        en.set("view", VIEW_DEBUG)
        variables += "\nLibrary: " + libName + "\nEntry: " + entry.name + "\nField: " + field
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
// End of file: 25.03.2022, 16:16
