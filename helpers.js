// DATE TIME FUNCTONS
//
const dateDiff = (date1, date2) => {
    var diff = {}// Initialization of the return
    var tmp = date2 - date1

    tmp = Math.floor(tmp/1000)// Number of seconds between the 2 dates
    diff.sec = tmp % 60
    //Extracting the number of seconds

    tmp = Math.floor((tmp-diff.sec)/60)// Number of minutes (whole part)
    diff.min = tmp % 60
    // Extract the number of minutes

    tmp = Math.floor((tmp-diff.min)/60)// Number of hours (whole)
    diff.hour = tmp % 24
    // Extract the number of hours

    tmp = Math.floor((tmp-diff.hour)/24)

    // Nombre de jours restants
    diff.day = tmp % 7

    tmp = Math.floor((tmp-diff.day)/7)
    diff.week = tmp % 4

    tmp = Math.floor((tmp-diff.week)/4)
    diff.mon = tmp % 12

    tmp = Math.floor((tmp-diff.mon)/12)
    diff.year = tmp

    return diff
}
const roundTimeQ = time => {
    // zaokrúhľovanie času na 1/4 hodiny
    var timeToReturn = new Date(time)
    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000)
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60)
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15)
    return timeToReturn
}

// NUMBER FUNCTIONS
//
const pad = (number, length) => {
    // pridá počet núl k čislu do zadanej dĺžky
    let str = '' + number
    while (str.length < length) {
        str = '0' + str
    }
    return str
}

// ARRAY FUNCTIONS
const filterByDate = (entries, maxDate, dateField, initScript) => {
    //odfiltruje záznamy s vyšším dátumom ako maxDate v poli datefield
    app.runningScript = 'filterByDate()'
    app.libFile = 'helpers.js'
    app.initScript = initScript
    try {
        const filtered = []
        for(let i in entries) {
            if(Number(entries[i].field(dateField).getTime()/1000) <= Number(maxDate.getTime()/1000)) {
                filtered.push(entries[i])
            }
        }
        filtered.sort((entryA, entryB) => (entryA.field(dateField).getTime()/1000) - (entryB.field(dateField).getTime()/1000))
        filtered.reverse()
        app.runningScript = null
        app.libFile = null
        app.initScript = null
        return filtered
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
