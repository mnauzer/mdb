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
    let scriptName = "filterByDate 23.0.15"
    let variables = "user: " + user()
    let parameters = "entries: " + entries.length + "\nmaxDate: " + maxDate + "\ndateField: " + dateField +"\ninptScript: " + inptScript
    try {
        let logTxt = "entries: " + entries.length
        //entries.filter(entry => entry.field(dateField).getTime()/1000 <= maxDate.getTime()/1000)
        //entries.filter(entry => Number(entry.field(dateField).getTime()/1000) <= Number(maxDate.getTime()/1000))
        //entries.sort((entryA, entryB) => entryA.field(dateField).getTime()/1000 - entryB.field(dateField).getTime()/1000)

        // metóda filter tu asi nefunguje tak to skúsim oldway :
        let filtered = []
        for(let i in entries) {
            if(Number(entries[i].field(dateField).getTime()/1000) <= Number(maxDate.getTime()/1000)) {
                filtered.push(entries[i])
            }
        }
        filtered.sort((entryA, entryB) => (entryA.field(dateField).getTime()/1000) - (entryB.field(dateField).getTime()/1000))
        filtered.reverse()
        logTxt += "\nfiltered entries: " + filtered.length
        logGen(APP, "appAsistanto.js", scriptName, logTxt, variables, parameters )
        return filtered
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
    const scriptName = "newEntry 23.0.07"
    const variables = "user" + user()
    const parameters = "en: " + en
    try {
        message("Nový záznam >>" + appLIB.name)
        en.set(VIEW, VIEW_EDIT)
        en.set(DATE, new Date())
        en.set(CR, user())
        en.set(CR_DATE, new Date())
        en.set(NUMBER, appLIB.newNumber()[0])
        en.set(NUMBER_ENTRY, appLIB.newNumber()[1])
        en.set(SEASON, appLIB.season())

    } catch (error) {
        variables += "\nentry: " + en.name + "\nappLIB.name: " + appLIB.name
        en.set(VIEW, VIEW_DEBUG)
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const updateEntry = en => {
    const scriptName = "updateEntry 23.0.05"
    const variables = "user: " + user()
    const parameters = "en: " + en
    try {
        message("Úprava záznamu >>" + appLIB.name);
        en.set(VIEW, VIEW_EDIT)
        en.set(DATE, en.field(DATE) ? en.field(DATE) : new Date())
        en.set(MOD, user())
        en.set(MOD_DATE, new Date())
    } catch (error) {
        variables += "\nentry: " + en.name + "appLIB.name: " + appLIB.name
        en.set(VIEW, VIEW_DEBUG)
        errorGen(APP, "appAsistanto.js", scriptName, error, variables, parameters);
    }
}
const setEntry = (en, inptScript) => {
    let scriptName = "setEntry 23.0.10"
    let variables = "Záznam: " + en.name + "\nmemento library: " + appLIB.name
    let parameters = "en: " + "\ninptScript: " + inptScript
    let logTxt = ""
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen(appLIB.name, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const saveEntry = (en, inptScript) => {
    const scriptName = "saveEntry 23.0.19"
    const variables = "user: " + user()
    const parameters = "en: " + en + "\ninptScript: " + inptScript
    try {
        message("Ukladám záznam...")
        const logTxt = ""
        const newNumber = appLIB.newNumber()
        variables += "\nnewNumber: " + newNumber[0]
        const createdEntry = lib().entries()[0]
        if (createdEntry.field(NUMBER_ENTRY) == newNumber[1]) {
            message("true")
            logTxt += "Nový záznam [" + newNumber[0] + "] v knižnici " + appLIB.name
            appLIB.saveNewNumber(newNumber[1])
            switch (appLIB.name) {
                case "Dochádzka":
                    prepocitatZaznamDochadzky(en)
                    break;
                default:
                    break;
            }
            createdEntry.set(VIEW, VIEW_PRINT)
        } else {
            logTxt += "\nNový záznam nebol vytvorený"
        }
        logGen(appLIB.name, "appAsistanto.js", scriptName, logTxt, variables, parameters)
        en.set(VIEW, VIEW_PRINT)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        variables += "\nentry: " + en.name + "\nmemento library: " + appLIB.name
        errorGen(appLIB.name, "appAsistanto.js", scriptName, error, variables, parameters)
    }
}
const removeEntry = (en, inptScript) => {
    // Created at: 16.11.2023, 00:50
    // vymaže záznam a updatuje číslo vymazaného záznamu v appDB
    let scriptName = 'removeEntry 23.0.1'
    let variables = 'user: ' + user() + '\entry: ' + en.name + '\nappLIB.name: ' + appLIB.name
    let parameters = 'en: ' + en
    try {
        variables = '\ninptScript: ' + inptScript
        let logTxt = ''
        variables += '\nlibrary: ' + appLIB.name
        let trashedNums = appLIB.getTrashedNums()
        let tnArray= []
        variables += '\ntrashed nums: ' + trashedNums
        let numToBeTrashed = en.field(NUMBER_ENTRY)
        variables += '\nnum to trash: ' + numToBeTrashed
        // ak je záznam vymazaných čísiel, konvertuje na array
        if (trashedNums>0) {
            tnArray = trashedNums.split(',')
            variables += '\ntnArray: ' + tnArray
            tnArray = tnArray.push(numToBeTrashed)
            appLIB.setTrashedNums(trashedNums)
            variables += '\ntnArray+: ' + tnArray
            variables += '\nnew trashed nums: ' + trashedNums
        }
        // pridá číslo d´mazaného záznamu do trashedNums a vymaže záznam
        logTxt += 'Záznam č.' + numToBeTrashed + ' bol vymazaný z knižnice ' + appLIB.name
        logGen(APP, 'appAsistanto.js', scriptName, logTxt, variables, parameters )
        if(inptScript != 'trigger remove_entry') {
            en.trash()
        }
    } catch (error) {
        errorGen(appLIB.name, 'appAsistanto.js', scriptName, error, variables, parameters)
    }
}
// entry script ACTIONS
const unlockDB = (season) => {
    let scriptName = "unlockDB 23.0.04"
    let variables = "Season: " + season + "\nDatabáza: " + appLIB.name
    let parameters = "season: " + season +  "\nappLIB.name" + appLIB.name
    try {
        let appDB = getAppSeasonDB(season, appLIB.name, scriptName)
        appDB.setAttr("locked", false)
        appDB.setAttr("locked reason", null)
        //message("Databáza " + appLIB.name + " odomknutá")
        return true
    } catch (error) {
        errorGen(appLIB.name, "appAsistanto.js", scriptName, error, variables, parameters)
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
const errorGen = ( library, script, error, variables, parameters) => {
    // generátor chyby
    message("ERROR: " + script + "\n" + error)
    let errorLib = libByName(APP_ERROR)
    let newError = new Object()
    newError["type"] = "error"
    newError["date"] = new Date()
    newError["library"] = library
    newError["memento library"] = appLIB.name
    newError["script"] = script
    newError["text"] = error
    newError["line"] = error.lineNumber
    newError["variables"] = variables
    newError["parameters"] = parameters
    errorLib.create(newError)
    cancel()
    exit()
}
const msgGen = (library, script, msg, variables, parameters) => {
    // generátor message
  //  message("MSG: " + script + "\n" + msg)
    let errorLib = libByName(APP_ERROR)
    let newMsg = new Object()
    newMsg["type"] = "message"
    newMsg["date"] = new Date()
    newMsg["library"] = library
    newMsg["memento library"] = appLIB.name
    newMsg["script"] = script
    newMsg["text"] = msg
    newMsg["variables"] = variables
    newMsg["parameters"] = parameters
    errorLib.create(newMsg)
}
const logGen = (library, script, log, variables, parameters, attributes) => {
    // generátor log
   // message("LOG: " + script + "\n" + log)
    let errorLib = libByName(APP_ERROR)
    let newLog = new Object()
    newLog["type"] = "log"
    newLog["date"] = new Date()
    newLog["library"] = library
    newLog["memento library"] = appLIB.name
    newLog["script"] = script
    newLog["text"] = log
    newLog["variables"] = variables
    newLog["parameters"] = parameters
    newLog["attributes"] = attributes
    errorLib.create(newLog)
}


// ZAMESTNANCI
const sadzbaZamestnanca = (employee, date, inptScript) => {
    // vyhľadá aktuálnu sadzbu zamestnanca k dátum "date", v poli "dateField"
    // v databáze "LIB_SZ - sadzby zamestnancov"
    let scriptName = "sadzbaZamestnanca 23.0.12"
    let variables = "user: " + user()
    let parameters = "employee: " + employee + "\ndate: " + date + "\ninptScript: " + inptScript
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        let links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        let dateField ="Platnosť od"
        let msgTxt = ""
        let sadzba = 0
        variables += "\nZáznamov: " + links.length
        filteredLinks = filterByDate(links, date, dateField, scriptName);
        variables += "\nFiltrovaných záznamov: " + filteredLinks.length
        if (filteredLinks.length < 0) {
            msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu'
        } else {
            //filteredLinks.sort({ compare: function(a,b) { return b.field(dateField).getTime()/1000 - a.field(dateField).getTime()/1000 }})
            //filteredLinks.reverse();
            sadzba = filteredLinks[0].field("Sadzba");
            msgTxt = "Nájdená sadzba zamestnanca " + employee.name
        }
        //vyberie a vráti sadzbu z prvého záznamu
        variables += "\nZamestnanec: " + employee.name + "\nSadzba: " + sadzba
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
