const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

//message('Posledné číslo: ' + appLIB.att("posledné číslo"));




const appLIB = {
    newNumber(lib, season){
        const number = []
        const trashedNums = this.getTrashedNums()
        let nextNum = null;
        let trim = this.DB(lib, season).attr("trim")
        let lastNum = Number(this.DB(lib, season).attr("posledné číslo"))
        if (trashedNums.length > 0){
            nextNum = trashedNums.pop()
            this.DB(lib, season).setAttr("vymazané čísla", trashedNums)

        } else {
            let nextNum = Number(this.DB(lib, season).attr("nasledujúce číslo"))
            if (nextNum == Number(this.DB(lib, season).attr("rezervované číslo"))){
                nextNum += 1
            }
        }
        this.DB(lib, season).setAttr("rezervované číslo", nextNum)
        number[0] = this.DB(lib, season).attr("prefix")
        ? this.DB(lib, season).field("Prefix") + this.season(season).slice(trim) + pad(nextNum, this.DB(lib, season).attr("trailing digit"))
        : this.DB(lib, season).field("ID") + this.season(season).slice(trim) + pad(nextNum, this.DB(lib, season).attr("trailing digit"))
        number[1] = nextNum

        this.DB(lib).setAttr("rezervované číslo", null)
        return number
    },
    saveNewNumber(nmb, lib, season){
        this.DB(lib, season).setAttr("posledné číslo", Number(nmb))
        this.DB(lib, season).setAttr("nasledujúce číslo", Number(nmb) + 1)
        this.DB(lib, season).setAttr("rezervované číslo", null)
    },
    name: lib().title,

    season(season){
        return season || libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
        },
    entry(season){
        return libByName(APP).find(this.season(season))[0]
    },
    DB(lib, season){
        const libName = lib || this.name
        const db = this.entry(season).field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == libName)
        return filtered[0]
    },

    getTrashedNums(lib, season){
        let rmNum = this.DB(lib, season).attr("vymazané čísla")
        let rmArray = []
        if (rmNum.length > 1) {
            rmArray = rmNum.split(',')
            return rmArray
        } else if (rmNum.length = 1) {
            rmArray.push(rmNum)
        } else {
            message('nie sú vymazané čísla')
            return null
        }
    },
    setTrashedNums(nums, lib, season){
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
