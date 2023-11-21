const filterTest = () => {
    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
}

const testSet = new Set();

const testMap = new Map();


testMap.set("new", "second")

//message('Posledné číslo: ' + appLIB.attrs("posledné číslo"));




const appLIB = {
    attrs(a){
        const att = new Map(
        "posledné číslo", this.DB().attr("posledné číslo"),
        "nasledujúce číslo", this.DB().attr("nasledujúce číslo"),
        "vymazané čísla", this.DB().attr("vymazané čísla"),
        "test", this.DB().attr("test"),
        "ID", this.DB().attr("ID"),
        "prefix", this.DB().attr("prefix"),
        "trailing digit", this.DB().attr("trailing digit"),
        "trim", this.DB().attr("trim"),
        )
        return att.get(a)
    },
    newNumber(){
        const number = []
        this.DB().setAttr("rezervované číslo", this.attrs().get("nasledujúce číslo"))
        number[0] = this.attrs().get("prefix")
        ? this.DB().field("Prefix") + this.season().slice(trim) + pad(this.attrs().get("nasledujúce číslo"), this.attrs().get("trailing digit"))
        : this.attrs().get("ID") + this.season().slice(trim) + pad(this.attrs().get("nasledujúce číslo"), this.attrs().get("trailing digit"))
        number[1] = this.attrs().get("nasledujúce číslo")
        return number
    },
    name(name){
        return name || lib().title
    },
    season(){
        return libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
        },
    entry(){
        return libByName(APP).find(this.season())[0]
    },
    DB(name){
        const db = this.entry().field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == this.name(name))
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
