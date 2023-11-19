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
    // DB: function(){
    //     return libByName(APP).find(this.season()).find(this.name())[0]
    // },
    lastNum: function(){
        const db = this.entry().field("Databázy")
        const filtered = db.filter(en => {
            return en.field("Názov") == this.name()
        })
        return filtered[0].attr("posledné číslo")
     //   return findDB.attr("posledné číslo")
    }
    //
}
