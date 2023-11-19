const filterTest = () => {

    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
    message(testArray)
    const filtered = testArray.filter(entry => {return entry < 20})
    message(filtered.sort())
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
        const filtered = db.filter(en => en.name <= this.name())
        return filtered.name
     //   return findDB.attr("posledné číslo")
    }
    //
}
