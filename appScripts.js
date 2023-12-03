const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

//message('Posledné číslo: ' + appLIB.att("posledné číslo"));




const appLIB = {
    newNumber(lib){
        const number = []
        try {
            let trim = this.DB(lib).attr("trim")
            let lastNum = Number(this.DB(lib).attr("posledné číslo"))
            let nextNum = Number(this.DB(lib).attr("nasledujúce číslo"))
            if (nextNum == Number(this.DB(lib).attr("rezervované číslo"))){
                nextNum += 1
            }
            this.DB(lib).setAttr("rezervované číslo", nextNum)
            number[0] = this.DB(lib).attr("prefix")
            ? this.DB(lib).field("Prefix") + this.season().slice(trim) + pad(nextNum, this.DB(lib).attr("trailing digit"))
            : this.DB(lib).field("ID") + this.season().slice(trim) + pad(nextNum, this.DB(lib).attr("trailing digit"))
            number[1] = nextNum
        } catch (error) {
            message(error)
            return 0
        }
        this.DB(lib).setAttr("rezervované číslo", null)
        return number
    },
    saveNewNumber(nmb, lib){
        this.DB(lib).setAttr("posledné číslo", Number(nmb))
        this.DB(lib).setAttr("nasledujúce číslo", Number(nmb) + 1)
        this.DB(lib).setAttr("rezervované číslo", null)
    },
    name: lib().title,

    season(){
        return libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
        },
    entry(){
        return libByName(APP).find(this.season())[0]
    },
    DB(lib){
        const libName = lib || this.name
        const db = this.entry().field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == libName)
        return filtered[0]
    },

    getTrashedNums(lib){
        let rmNum = this.DB(lib).attr("vymazané čísla")
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
    setTrashedNums(nums, lib){
        try {
            this.DB(lib).setAttr("vymazané čísla", nums)
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

const setNewEntryNumber = en => {
    let newNumber = appLIB.newNumber()
    en.set("Číslo", newNumber[0])
    appLIB.saveNewNumber(newNumber[1])
}