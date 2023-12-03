const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

//message('Posledné číslo: ' + appLIB.att("posledné číslo"));




const appLIB = {
    newNumber(){
        const number = []
        try {
            let trim = this.DB().attr("trim")
            let lastNum = this.DB().attr("posledné číslo")
            let nextNum = this.DB().attr("nasledujúce číslo")
            this.DB().setAttr("rezervované číslo", nextNum)
            number[0] = this.DB().attr("prefix")
            ? this.DB().field("Prefix") + this.season().slice(trim) + pad(nextNum, this.DB().attr("trailing digit"))
            : this.DB().field("ID") + this.season().slice(trim) + pad(nextNum, this.DB().attr("trailing digit"))
            number[1] = nextNum
            this.DB().setAttr("nasledujúce číslo", Number(lastNum) + 1)
        } catch (error) {
            message(error)
            this.DB().setAttr("rezervované číslo", null)
            return 0
        }
        return number
    },
    name: lib().title,

    season(){
        return libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
        },
    entry(){
        return libByName(APP).find(this.season())[0]
    },
    DB(){
        const db = this.entry().field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == this.name)
        return filtered[0]
    },
    getNextNum(){
        return this.DB().attr("nasledujúce číslo")
    },
    setNextNum(newNum){
        try {
            this.DB().setAttr("nasledujúce číslo", newNum)
            return true
        } catch (error) {
            return false
        }
    },
    getLastNum(){
        return this.DB().attr("posledné číslo")
    },
    setLastNum(newNum){
        try {
            this.DB().setAttr("posledné číslo", newNum)
            return true
        } catch (error) {
            return false
        }
    },
    getTrashedNums(){
        return this.DB().attr("vymazané čísla")
    },
    setTrashedNums(newNum){
        try {
            this.DB().setAttr("vymazané čísla", newNum)
            return true
        } catch (error) {
            return false
        }
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