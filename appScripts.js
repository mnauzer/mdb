const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

const APP = {
    version: '23.0.0006',
    name: lib().title,
    defaultSeason(season){
        return season || libByName(LIBAPP_TENATNS).find("KRAJINKA")[0].field("default season")
    },
    entry(season){
        season = this.defaultSeason(season)
        return libByName(LIBAPP).find(season)[0]
    },
    newNumber(lib, season){
        season = this.defaultSeason(season)
        const number = []
        const trashedNums = this.getTrashedNums(lib, season)
        message('1 trashed length: ' + trashedNums.length)
        message('2 trashed: ' + trashedNums)
        let nextNum = null;
        const trim = this.DB(lib, season).attr("trim")
        // najprv použi vymazané čísla
        if (trashedNums[0] !== undefined || trashedNums[0] !== null){
            message('3 využívam vymazané číslo: ' + season)
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
        const rmNum = null
        //rmNum = this.DB(lib, season).attr("vymazané čísla")
        message('rmNum: ' + rmNum.length)
        let rmArray = []
        if (rmNum.length > 1) {
            message('rmNum > 1: ' + rmNum)
            rmArray = rmNum.split(',')
        } else if (rmNum.length = 1) {
            message('rmNum = 1: ' + rmNum)
            rmArray.push(rmNum)
        } else {
            message('nie sú vymazané čísla')
            return null
        }
        message('rmArray: ' + rmArray)
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
        const errorLib = libByName(APP_ERROR)
        const newError = new Object()
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
        app: APP.name,
        version: APP.version,
        season: APP.defaultSeason(),
    },
    error: null,
    genMsgParams(){
        let msg = ''
       // Object.entries(this.param).forEach([key, value] => {msg += key + ': ' + value + '\n'})
        // for (let [key, value] of this.param) {
        //     msg += key + ': ' + value + '\n'
        // }
        return msg
    },
    genMsgVars(){
        let msg = ''
       // Object.entries(this.var).forEach(item => {[key, value] = msg += key + ': ' + value + '\n'})
        // for (let [key, value] of this.var) {
        //     msg += key + ': ' + value + '\n';
        // }
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
    newError['memento library'] = APP.name
    newError['script'] = scr.name
    newError['text'] = error
    newError['line'] = error.lineNumber
    newError['variables'] = scr.genMsgVars()
   // newError['parameters'] = scr.genMsgParams()
    newError['note'] = 'generované scriptom errorGen2'
    errorLib.create(newError)

    scr.param.en.set(VIEW, VIEW_DEBUG)
    cancel()
    exit()
}
const libOpen = () => {
    message(APP.name + ' ' + APP.version)
}