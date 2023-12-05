// Library/Event/Script:    Projekty\Cenové ponuky\shared\krajinkaLib.js
// JS Libraries:
// Dátum:                   06.03.2022
// Popis:                   knižnica krajinkaLib

const APP = {
    version: '23.0.010',
    defaultName(lib){
        return lib || lib().title
    },
    defaultSeason(season){
        return season || libByName(LIBAPP_TENATNS).find("KRAJINKA")[0].field("default season")
    },
    entry(season){
        season = this.defaultSeason(season)
        return libByName(LIBAPP).find(season)[0]
    },
    newNumber(lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        const number = []
        const trashedNums = this.getTrashedNums(lib, season)
        //message('1 trashed length: ' + trashedNums.length)
        message('2 trashed: ' + trashedNums)
        let nextNum = null;
        const trim = this.DB(lib, season).attr("trim")
        // najprv použi vymazané čísla
        if (trashedNums !== undefined && trashedNums != null){
            message('3 využívam vymazané číslo: ' + season)
            nextNum = trashedNums.pop()
            this.DB(lib, season).setAttr("vymazané čísla", trashedNums)
        } else {
            message('3 využívam nasledujúce číslo: ' + season)
            // ak nie sú žiadne vymazané čísla použi následujúce
            nextNum = Number(this.DB(lib, season).attr("nasledujúce číslo"))
            if (nextNum == Number(this.DB(lib, season).attr("rezervované číslo"))){
                nextNum += 1
            }
        }
        this.DB(lib, season).setAttr("rezervované číslo", nextNum)
        number[0] = this.DB(lib, season).attr("prefix")
        ? this.DB(lib, season).field("Prefix") + season.slice(trim) + pad(nextNum, this.DB(lib, season).attr("trailing digit"))
        : this.DB(lib, season).field("ID") + season.slice(trim) + pad(nextNum, this.DB(lib, season).attr("trailing digit"))
        number[1] = nextNum

        this.DB(lib).setAttr("rezervované číslo", null)
        return number
    },
    saveNewNumber(nmb, lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        this.DB(lib, season).setAttr("posledné číslo", Number(nmb))
        this.DB(lib, season).setAttr("nasledujúce číslo", Number(nmb) + 1)
        this.DB(lib, season).setAttr("rezervované číslo", null)
    },
    DB(lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        const db = this.entry(season).field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == lib)
        return filtered[0]
    },
    getTrashedNums(lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        const rmNum = this.DB(lib, season).attr("vymazané čísla")
        //message('rmNum: ' + typeof(rmNum))
        let rmArray = []
        if (rmNum.length > 1) {
            message('rmNum > 1: ' + rmNum)
            rmArray = rmNum.split(',')
        } else if (rmNum.length = 1) {
            const num = Number(rmNum)
            if (num <= 0) {
                message('rmNum = 1: ' + rmNum)
                return null
            } else {
                rmArray.push(num)
            }
        } else {
            message('nie sú vymazané čísla')
            return null
        }
        message('rmArray: ' + rmArray)
        return rmArray
    },
    setTrashedNums(nums, lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        try {
            this.DB(lib, season).setAttr("vymazané čísla", nums)
            return true
        } catch (error) {
            return false
        }
    },
    scr: {
        name: '',
        param: {
            en: null,
            inptScript: null,
            lib: null,
            season: null,
        },
        var: {
            user: user(),
            app: this.defaultName(),
            version: this.version,
            season: this.defaultSeason(),
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
    },
    errorGen(error){
        // generátor chyby
        message('ERROR: ' + this.scr.name + '\n' + error)
        const errorLib = libByName(LIBAPP_ERROR)
        const newError = new Object()
        newError['type'] = 'error'
        newError['date'] = new Date()
        newError['memento library'] = APP.defaultName()
        newError['script'] = APP.scr.name
        newError['text'] = error
        newError['line'] = error.lineNumber
        newError['variables'] = APP.scr.var
        newError['parameters'] = APP.scr.param
        newError['note'] = 'generované scriptom APP.errorGen'
        errorLib.create(newError)

        scr.param.en.set(VIEW, VIEW_DEBUG)
        cancel()
        exit()
    },
}

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
    scr.name = "newEntry 23.0.08"
    scr.param.en = en
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
        errorGen2(error)
    }
}
const updateEntry = en => {
    scr.name = "updateEntry 23.0.05"
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
