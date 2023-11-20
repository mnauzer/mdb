const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

message('DB Arrays: ' + appLIB.arrays());




const appLIB = {
    arrays: new Map(
        "posledné číslo", this.DB.attr("posledné číslo")
    ),

    newNumber: function(){

    },

    name: function(){
        return lib.name()
    },
    season: function(){
        return libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
        },
    entry: function(){
        return libByName(APP).find(this.season())[0]
    },
    DB: function(name){
        const db = this.entry().field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == name || this.name())
        return filtered[0]
    },
    getNextNum: function(){
        return this.DB().attr("nasledujúce číslo")
    },
    setNextNum: function(newNum){
        try {
            this.DB().setAttr("nasledujúce číslo", newNum)
            return true
        } catch (error) {
            return false
        }
    },
    getLastNum: function(){
        return this.DB().attr("posledné číslo")
    },
    setLastNum: function(newNum){
        try {
            this.DB().setAttr("posledné číslo", newNum)
            return true
        } catch (error) {
            return false
        }
    },
    getTrashedNums: function(){
        return this.DB().attr("vymazané čísla")
    },
    setTrashedNums: function(newNum){
        try {
            this.DB().setAttr("vymazané čísla", newNum)
            return true
        } catch (error) {
            return false
        }
    }
}
