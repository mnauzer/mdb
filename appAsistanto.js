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
    scr.name = "filterByDate 23.0.15"
    scr.param.entries = entries
    scr.param.maxDate = maxDate
    scr.param.dateField = dateField
    scr.param.inptScript = inptScript
    try {
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
        return filtered
    } catch (error) {
        errorGen2(scr, error)
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
    scr.name = "checkDebug 0.23.05"
    try {
        return getAppSeason(season).field("debug")
    } catch (error) {
        errorGen2(scr, error)
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
    // zistí sadzby DPH v zadanej sezóne
    scr.name = "lastValid 23.0.07"
    scr.param.links = links
    scr.param.date = date
    scr.param.valueField = valueField
    scr.param.dateField = dateField
    scr.param.inptScript = inptScript
    try {
        // vráti poslednú hodnotu poľa valueField zo záznamov links podľa dátumu date (dateField poľe)
        //links.filter(e => new Date(e.field(dateField)).getTime()/1000 <= new Date(date).getTime()/1000)
        // ✅ Sort in Ascending order (low to high)
        let sadzby = []
        filteredLinks = filterByDate(links, date, dateField, scr.name)
        filteredLinks.sort((objA, objB) => Number(objA.field(dateField) - Number(objB.field(dateField))))
        filteredLinks.reverse()

        return filteredLinks[0].field(valueField)
    } catch (error) {
        errorGen2(scr, error)
    }
}

const getSadzbaDPH = (appDB, season, inptScript) => {
      // zistí sadzby DPH v zadanej sezóne
    scr.name = "getSadzbaDPH 23.0.02"
    scr.param.appDB = appDB
    scr.param.season = season
    scr.param.inptScript = inptScript
    try {
        let sadzbyDPH = []
        sadzbyDPH.push(appDB.field("Základná sadzba DPH"))
        sadzbyDPH.push(appDB.field("Znížená sadzba DPH"))
        return sadzbyDPH
    } catch (error) {
        errorGen2(scr, error)
    }
}

// ENTRY SCRIPT HELPERS
// new entry script TRIGGERS
const newEntry = en => {
    APP.scr.name = "newEntry 23.0.08"
    APP.scr.param.en = en
    try {
        message("Nový záznam >> " + APP.defaultName())
        const newNumber = APP.newNumber()
        en.set(VIEW, VIEW_EDIT)
        en.set(DATE, new Date())
        en.set(CR, user())
        en.set(CR_DATE, new Date())
        en.set(NUMBER, newNumber[0])
        en.set(NUMBER_ENTRY, newNumber[1])
        en.set(SEASON, APP.defaultSeason())
    } catch (error) {
        APP.errorGen(error)
    }
}
const updateEntry = en => {
    APP.scr.name = "updateEntry 23.0.05"
    try {
        message("Úprava záznamu >>" + APP.defaultName());
        en.set(VIEW, VIEW_EDIT)
        en.set(DATE, en.field(DATE) ? en.field(DATE) : new Date())
        en.set(MOD, user())
        en.set(MOD_DATE, new Date())
    } catch (error) {
        APP.errorGen(error);
    }
}
const setEntry = (en, inptScript) => {
    scr.name = "setEntry 23.0.11"
    scr.param.en = en
    scr.param.inptScript = inptScript
    try {

    } catch (error) {
        errorGen2(scr, error)
    }
}
const saveEntry = (en, inptScript) => {
    APP.scr.name = "saveEntry 23.0.21"
    APP.scr.param.en = en
    APP.scr.param.inptScript = inptScript
    try {
        message("Ukladám záznam...")
        const newNumber = APP.newNumber()
        const createdEntry = lib().entries()[0]
        if (createdEntry.field(NUMBER_ENTRY) == newNumber[1]) {
            APP.saveNewNumber(newNumber[1])
            switch (APP.defaultName()) {
                case "Dochádzka":
                    prepocitatZaznamDochadzky(en, APP.scr.name)
                    break;
                default:
                    break;
            }
            createdEntry.set(VIEW, VIEW_PRINT)
        }
        en.set(VIEW, VIEW_PRINT)
    } catch (error) {
        APP.errorGen(error)
    }
}
const removeEntry = (en, trashFromLib, inptScript) => {
    // Created at: 16.11.2023, 00:50
    // vymaže záznam a updatuje číslo vymazaného záznamu v appDB
    APP.scr.name = 'removeEntry 23.0.09'
    APP.scr.param.en = en
    APP.scr.param.trashFromLib = trashFromLib
    APP.scr.param.inptScript = inptScript
    try {
        const trashedNums = APP.getTrashedNums(trashFromLib)
        message('trashFromLib: ' + trashFromLib + '\nnumToBeTrashed: ' + en.field(NUMBER_ENTRY))
        const numToBeTrashed = en.field(NUMBER_ENTRY)
        // ak je záznam vymazaných čísiel, konvertuje na array
        if (trashedNums) {
            trashedNums.push(numToBeTrashed)
            APP.setTrashedNums(trashedNums, trashFromLib)
        } else {
            APP.setTrashedNums(numToBeTrashed, trashFromLib)
        }
        // pridá číslo d´mazaného záznamu do trashedNums a vymaže záznam
       //     en.trash()
    } catch (error) {
        APP.errorGen2(error)
    }
}
// entry script ACTIONS
const unlockDB = (season) => {
    scr.name = "unlockDB 23.0.04"
    try {
        let appDB = getAppSeasonDB(season, APP.defaultName(), scr.name)
        appDB.setAttr("locked", false)
        appDB.setAttr("locked reason", null)
        //message("Databáza " + APP.defaultName() + " odomknutá")
        return true
    } catch (error) {
        errorGen2(scr, error)
    }
}
const setID = entries => {
    scr.name = "setID 23.0.04"
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
        errorGen2(scr, error)
    }
}
const setIdentifikator = en => {
    // nastaví pole identifikátor
    scr.name = "setIdentifikator 23.0.03"
    let identifikator = ""
    try {
        switch (APP.defaultName()) {
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
        errorGen2(scr, error)
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
const errorGen = ( script, error, variables, parameters) => {
    // generátor chyby
    message("ERROR: " + script + "\n" + error)
    let errorLib = libByName(APP_ERROR)
    let newError = new Object()
    newError["type"] = "error"
    newError["date"] = new Date()
    newError["memento library"] = APP.defaultName()
    newError["script"] = script
    newError["text"] = error
    newError["line"] = error.lineNumber
    newError["variables"] = variables
    newError["parameters"] = parameters
    errorLib.create(newError)
    cancel()
    exit()
}

const msgGen = (script, msg, variables, parameters) => {
    // generátor message
  //  message("MSG: " + script + "\n" + msg)
    let errorLib = libByName(APP_ERROR)
    let newMsg = new Object()
    newMsg["type"] = "message"
    newMsg["date"] = new Date()
    newMsg["memento library"] = APP.defaultName()
    newMsg["script"] = script
    newMsg["text"] = msg
    newMsg["variables"] = variables
    newMsg["parameters"] = parameters
    errorLib.create(newMsg)
}
const logGen = (script, log, variables, parameters, attributes) => {
    // generátor log
   // message("LOG: " + script + "\n" + log)
    let errorLib = libByName(APP_ERROR)
    let newLog = new Object()
    newLog["type"] = "log"
    newLog["date"] = new Date()
    newLog["memento library"] = APP.defaultName()
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
    scr.name = "sadzbaZamestnanca 23.0.12"
    scr.param.employee = employee
    scr.param.date = date
    scr.param.inptScript = inptScript
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        const links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        const dateField ="Platnosť od"
        let sadzba = 0
        filteredLinks = filterByDate(links, date, dateField, scr.name);
        if (filteredLinks.length < 0) {
            msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu'
        } else {
            sadzba = filteredLinks[0].field("Sadzba");
        }
        return sadzba;
    } catch (error) {
        errorGen2(scr, error);
    }
}

const getLibFieldsNames = lib =>{
    scr.name  = "getLibFieldsNames 23.0.14"
    try {
        let fields = lib.fields()
        let fieldsNames = []
        let appDB = libByName(APP_DB)
        let entryToSet = appDB.find(libName)[0]
        for (let f in fields) {
            fieldsNames.push(fields[f] + "\n")
        }
        entryToSet.set("Fields", fieldsNames)

    } catch (error) {
        errorGen2(scr, error)
    }
}

// COLORS
const setBckgColor = (en, field) => {
    scr.name = "setBckgColor 23.0.03"
    scr.param.field = field
    try {
        switch (APP.defaultName()) {
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
        errorGen2(scr, error)
    }
}



const setSeasonMaterialPrices = entries => {
    message('Kontrolujem ' + entries.length + ' záznamov')
    const lib = libByName("sezónne ceny materiálu")
    let successCount = 0
    let badEntries = 0
    for (let e in entries) {
        let nc = Number(entries[e].field('NC bez DPH')).toFixed(2)
        let pc = Number(entries[e].field('PC bez DPH')).toFixed(2)
        if ( nc > 0 && pc > 0) {
            let newEntry = new Object()
            newEntry['Položka'] = entries[e]
            newEntry['Platnosť od'] = new Date(2023, 0, 1)
            newEntry['nc'] = nc
            newEntry['pc'] = pc
            lib.create(newEntry)
            entries[e].set('farba pozadia', '#C5E2CB')
            successCount += 1
        } else {
            entries[e].set('farba pozadia', FIREBRICK)
            entries[e].set('neúplný záznam', true)
            entries[e].set('chyba záznamu', 'žiadna alebo nulová cena')
            badEntries += 1
        }
    }
    message('Úspešne pridaných ' + successCount + '/' + entries.length + ' záznamov')
    message('Záznamov na opravu ' + badEntries)
}


const updatePrice = en =>{
    message('Prepočítavam cenu')
    if (en.field("Prepočítať cenu")) {

    } else {
        message('Cena položky je pevná, \nak ju checeš prepočítať odškrtni "Prepočítať cen u"')
    }
}

const setNewEntryNumber = (en) => {
    const newNumber = APP.newNumber(lib().name, en.field("sezóna"))
    en.set("Číslo", newNumber[0])
    APP.saveNewNumber(newNumber[1], lib().name, en.field("sezóna"))
}

const setNewEntriesNumber = (season) =>{
    if (season) {
        message('Generujem nové čísla pre sezónu ' + season)
    } else {
        message('Generujem nové čísla v celej knižnici')
    }
    APP.DB(lib().title, season).setAttr("posledné číslo", 0)
    APP.DB(lib().title, season).setAttr("nasledujúce číslo", 1)
    const entries = lib().entries()
    const filtered = entries.filter(en => en.field("sezóna") == season)
    filtered.sort((entryA, entryB) => (entryA.field("Dátum").getTime()/1000) - (entryB.field("Dátum").getTime()/1000))
   // filtered.reverse()
    for(let e in filtered){
        setNewEntryNumber(filtered[e])
    }
}

const scr = {
    name: '',
    param: {
        en: null,
        inptScript: null,
        lib: null,
        season: null,
    },
    var: {
        user: user(),
        app: APP.defaultName(),
        version: APP.version,
        season: APP.defaultSeason(),
    },
    error: null,
    genMsgParams(){
        let msg = ''
        Object.entries(this.param).forEach(([key, value]) => {msg += key + ': ' + value + '\n'})
        // for (let [key, value] of this.param) {
        //     msg += key + ': ' + value + '\n'
        // }
        return msg
    },
    genMsgVars(){
        let msg = ''
        this.var.entries().forEach(([key, value]) => {msg += key + ': ' + value + '\n'})
        return msg
    }
}

const errorGen2 = (scr, error) => {
    // generátor chyby
    message('ERROR: ' + scr.name + '\n' + error)
    const errorLib = libByName(LIBAPP_ERROR)
    const newError = new Object()
    newError['type'] = 'error'
    newError['date'] = new Date()
    newError['memento library'] = APP.defaultName()
    newError['script'] = scr.name
    newError['text'] = error
    newError['line'] = error.lineNumber
    newError['variables'] = scr.var
    newError['parameters'] = scr.param
    newError['note'] = 'generované scriptom errorGen2'
    errorLib.create(newError)

    scr.param.en.set(VIEW, VIEW_DEBUG)
    cancel()
    exit()
}

// End of file: 25.03.2022, 16:16
