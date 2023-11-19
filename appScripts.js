const filterTest = () => {

    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
 }

const appLIB = {
    name: function(){
        return lib().title
    },
    season: function(){
        return libByName(APP_TENATNS).find("KRAJINKA")[0].field("default season")
        },
    entry: function(){
        return libByName(APP).find(this.season())[0]
    },
    DB: function(){
        const db = this.entry().field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == this.name())
        return filtered[0]
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
    }
}
