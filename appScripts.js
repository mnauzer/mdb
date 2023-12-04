const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

//message('Posledné číslo: ' + appLIB.att("posledné číslo"));




const appLIB = {
    name: lib().title,
    defaultSeason(season){
        return season || libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
    },
    entry(season){
        season = this.defaultSeason(season)
        return libByName(APP).find(season)[0]
    },
    newNumber(lib, season){
        season = this.defaultSeason(season)
        const number = []
        const trashedNums = this.getTrashedNums(lib, season)
        message('trashed length: ' + trashedNums.length)
        let nextNum = null;
        const trim = this.DB(lib, season).attr("trim")
        // najprv použi vymazané čísla
        if (trashedNums.length !== undefined || trashedNums !== null){
            message('využívam vymazané číslo')
            nextNum = trashedNums.pop()
            this.DB(lib, season).setAttr("vymazané čísla", trashedNums)

        } else {
            // ak nie sú žiadne vymazané čísla použi následujúce
            let nextNum = Number(this.DB(lib, season).attr("nasledujúce číslo"))
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
        this.DB(lib, season).setAttr("posledné číslo", Number(nmb))
        this.DB(lib, season).setAttr("nasledujúce číslo", Number(nmb) + 1)
        this.DB(lib, season).setAttr("rezervované číslo", null)
    },


    DB(lib, season){
        season = this.defaultSeason(season)
        const libName = lib || this.name
        const db = this.entry(season).field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == libName)
        return filtered[0]
    },
    getTrashedNums(lib, season){
        season = this.defaultSeason(season)
        const rmNum = this.DB(lib, season).attr("vymazané čísla")
        let rmArray = []
        if (rmNum.length > 1) {
            rmArray = rmNum.split(',')
        } else if (rmNum.length = 1) {
            rmArray.push(rmNum)
        } else {
            message('nie sú vymazané čísla')
            return null
        }
        return rmArray
    },
    setTrashedNums(nums, lib, season){
        season = this.defaultSeason(season)
        try {
            this.DB(lib, season).setAttr("vymazané čísla", nums)
            return true
        } catch (error) {
            return false
        }
    }
}

const debug = {
    libFile: '',
    scriptName: '',
    memLib: '',
    message: '',
    addMessage(msg){
        this.message = '' + msg.trim
    },
    postError(err) {
        let errorLib = libByName(APP_ERROR)
        let newError = new Object()
        newError["type"] = "error"
        newError["date"] = new Date()
        newError["library"] = this.libFile
        newError["memento library"] = this.memLib
        newError["script"] = this.scriptName
        newError["text"] = err
        newError["line"] = err.lineNumber
        //newError["variables"] = variables
        //newError["parameters"] = parameters
        errorLib.create(newError)
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
            entries[e].set('farba pozadia', '#D1CBCB')
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
    let newNumber = appLIB.newNumber(lib().name, en.field("sezóna"))
    en.set("Číslo", newNumber[0])
    appLIB.saveNewNumber(newNumber[1], lib().name, en.field("sezóna"))
}

const setNewEntriesNumber = (season) =>{
    if (season) {
        message('Generujem nové čísla pre sezónu ' + season)
    } else {
        message('Generujem nové čísla v celej knižnici')
    }
    appLIB.DB(lib().title, season).setAttr("posledné číslo", 0)
    appLIB.DB(lib().title, season).setAttr("nasledujúce číslo", 1)
    let entries = lib().entries()
    let filtered = entries.filter(en => en.field("sezóna") == season)
    filtered.sort((entryA, entryB) => (entryA.field("Dátum").getTime()/1000) - (entryB.field("Dátum").getTime()/1000))
   // filtered.reverse()
    for(let e in filtered){
        setNewEntryNumber(filtered[e])
    }
}

const scr = {
    name: '',
    param: {
        en: en || null,
        inptScript: inptScript || null,
        lib: lib || null,
        season: season || null,
    },
    var: {
        user: user(),
        app: appLIB.name,
    },
    error: error || null,
    genMsg(){
        let msg = ''
        this.param.forEach((key, value) => msg += key + ': ' + value + '\n');
        return msg
    }
}

const errorGen2 = scr => {
    // generátor chyby
    message('ERROR: ' + scr.name + '\n' + error)
    const errorLib = libByName(APP_ERROR)
    const newError = new Object()
    newError['type'] = 'error'
    newError['date'] = new Date()
    newError['memento library'] = appLIB.name
    newError['script'] = scr.name
    newError['text'] = scr.error
    newError['line'] = scr.error.lineNumber
    newError['variables'] = scr.var
    newError['parameters'] = scr.param
    errorLib.create(newError)
    cancel()
    exit()
}