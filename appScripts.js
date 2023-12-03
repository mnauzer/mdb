const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

//message('Posledné číslo: ' + appLIB.att("posledné číslo"));




// const appLIB = {
//     att: new Map(
//     "posledné číslo", this.DB().attr("posledné číslo"),
//     "nasledujúce číslo", this.DB().attr("nasledujúce číslo"),
//     "vymazané čísla", this.DB().attr("vymazané čísla"),
//     "test", this.DB().attr("test"),
//     "ID", this.DB().field("ID"),
//     "prefix", this.DB().field("Prefix"),
//     "isPrefix", this.DB().attr("prefix"),
//     "trailing digit", this.DB().attr("trailing digit"),
//     "trim", this.DB().attr("trim"),
//     ),
//     getAttr(a){
//         return this.att.get(a)
//     },
//     setAttr(key, value){
//         return this.att.set(key, value)
//     },
//     newNumber(){
//         const number = []
//         this.DB().setAttr("rezervované číslo", this.DB().attr("nasledujúce číslo"))
//         number[0] = this.att("isPrefix")
//         ? this.DB().field("Prefix") + this.season().slice(trim) + pad(this.DB().attr("nasledujúce číslo"), this.DB().attr("trailing digit"))
//         : this.DB().field("D") + this.season().slice(trim) + pad(this.DB().attr("nasledujúce číslo"), this.DB().attr("trailing digit"))
//         number[1] = this.att().get("nasledujúce číslo")
//         return number
//     },
//     name: lib().title,

//     season(){
//         return libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
//         },
//     entry(){
//         return libByName(APP).find(this.season())[0]
//     },
//     DB(){
//         const db = this.entry().field("Databázy")
//         const filtered = db.filter(en => en.field("Názov") == this.name())
//         return filtered[0]
//     },
//     getNextNum(){
//         return this.DB().attr("nasledujúce číslo")
//     },
//     // setNextNum(newNum){
//     //     try {
//     //         this.DB().setAttr("nasledujúce číslo", newNum)
//     //         return true
//     //     } catch (error) {
//     //         return false
//     //     }
//     // },
//     // getLastNum(){
//     //     return this.DB().attr("posledné číslo")
//     // },
//     // setLastNum(newNum){
//     //     try {
//     //         this.DB().setAttr("posledné číslo", newNum)
//     //         return true
//     //     } catch (error) {
//     //         return false
//     //     }
//     // },
//     // getTrashedNums(){
//     //     return this.DB().attr("vymazané čísla")
//     // },
//     // setTrashedNums(newNum){
//     //     try {
//     //         this.DB().setAttr("vymazané čísla", newNum)
//     //         return true
//     //     } catch (error) {
//     //         return false
//     //     }
//     // }
// }


const setSeasonMaterialPrices = entries => {
    message('Kontrolujem ' + entries.length + ' záznamov')
    const lib = libByName("sezónne ceny materiálu")
    let successCount = 0
    let badEntries = 0
    for (let e in entries) {
        let nc = entries[e].field('NC bez DPH')
        let pc = entries[e].field('PC bez DPH')
        if ( nc != null || pc != null) {
            let newEntry = new Object()
            newEntry['Položka'] = entries[e]
            newEntry['Platnosť od'] = new Date('1.1.2023')
            newEntry['nc'] = nc
            newEntry['pc'] = pc
            lib.create(newEntry)
            successCount += 1
        } else {
            entries[e].set('farba pozadia', '#E74307')
            badEntries += 1
        }
    message('Úspešne pridaných ' + successCount + '/' + entries.length + ' záznamov')
    }
}