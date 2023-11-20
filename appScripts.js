const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

message('DB Arrays: ' + appLIB.attrs);




const appLIB = {
    attrs: function(){
        const att = new Map(
        "posledné číslo", this.DB.attr("posledné číslo"),
        "nasledujúce číslo", this.DB.attr("nasledujúce číslo"),
        "vymazané čísla", this.DB.attr("vymazané čísla"),
        "test", this.DB.attr("test"),
        "ID", this.DB.attr("ID"),
        "prefix", this.DB.attr("prefix"),
        "trailing digit", this.DB.attr("trailing digit"),
        "trim", this.DB.attr("trim"),
        "trim", this.DB.attr("trim"),
        )
        return att
    },

    newNumber: function(){
        const number = []
        // link to field attributes
        let prefix = this.DB.field("Prefix")
        if (test) {
            dbID = "TEST" + this.attrs.get("ID")
            prefix = "TEST"
            attr =  "číslo testu"
        }
        // najprv získaj nasledujúce číslo
        // if (trashedNumvys) {
        //     // ak existujú vymazané čísla
        //     let tnArray = trashedNums.split(",")
        //     nextNum = tnArray.shift()
        //     appDB.setAttr("vymazané čísla", tnArray)
        // }
        this.DB.setAttr("rezervované číslo", this.attrs.get("nasledujúce číslo"))
        number[0] = this.attrs.get("prefix")
        ? prefix + this.season.slice(trim) + pad(this.attrs.get("nasledujúce číslo"), this.attrs.get("trailing digit"))
        : dbID + this.season.slice(trim) + pad(this.attrs.get("nasledujúce číslo"), this.attrs.get("trailing digit"))
        number[1] = this.attrs.get("nasledujúce číslo")
        return number
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
