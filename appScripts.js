const filterTest = () => {

    let testArray = [1,2,3,15,25,11,7,18,125,3,4]
    message(testArray)
    const filtered = testArray.filter(entry => {return entry < 20})
    message(filtered.sort())
}

const appLIB = {
    name: "Dochádzka",
    season: function(){
        return libByName("APP").field("default season")
        },
    databases: function() {
        return "databases"
    },
    entry: function(){
        return libByName("APP").find(this.season)[0]
    }
}
