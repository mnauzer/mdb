
const app = {
    // app store
    data: {
        name: 'ASISTANTO',
        version: '23.1.0005',
        app: "ASISTANTO",
        db: "ASISTANTO DB",
        errors: "ASISTANTO Errors",
        tenants: "ASISTANTO Tenants",
        scripts: "ASISTANTO Scripts",
        todo: "ASISTANTO ToDo",
    },
    msg: null,
    runningScript: null,
    libFile: 'appScripts.js',
    season: null,
    openLib: {
        name: null,
        db: null,
        ID: null,
        prefix: null,
        lastNum: null,
        nextNum: null,
        reservedNum: null,
        removedNums: null,
        isPrefix: null,
        trim: null,
        trailingDigit: null,
    },
    en: null,
    enD: null,
    lib: null,
    dph: {
        zakladna: null,
        znizena: null,
    }
}
const get = {
    // app getters
    library(){
        app.lib = lib()
    },
    season(season){
        app.season = season || libByName(app.data.tenants).find("KRAJINKA")[0].field("default season")
    },
    openLibName(){
        app.openLib.name = app.openLib.db.title // lib().title
    },
    openDb(season){
        app.runningScript = 'get.openDb()'
        try {
            get.library()
            get.season(season)
            const dbLib = libByName(app.data.app).find(app.season)[0].field("Databázy").filter(en => en.field("Názov") == app.lib.title)
            app.openLib.db = dbLib[0]
            app.openLib.ID = app.openLib.db.field("ID")
            app.openLib.prefix = app.openLib.db.field("Prefix")
            // entry attributes
            app.openLib.lastNum = app.openLib.db.attr("posledné číslo")
            app.openLib.nextNum = app.openLib.db.attr("nasledujúce číslo")
            app.openLib.reservedNum = app.openLib.db.attr("rezervované číslo")
            app.openLib.removedNums = app.openLib.db.attr("vymazané čísla")
            app.openLib.isPrefix = app.openLib.db.attr("prefix")
            app.openLib.trim = app.openLib.db.attr("trim")
            app.openLib.trailingDigit = app.openLib.db.attr("trailing digit")
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }

    },
    sadzbyDPH(){
        // nájdi sadzby DPH pre sezónu
        app.runningScript = 'get.sadzbyDPH()'
        try {
            app.dph.zakladna = libByName(app.data.app).find(app.season)[0].field("Základná sadzba DPH")
            app.dph.znizena = libByName(app.data.app).find(app.season)[0].field("Znížená sadzba DPH")
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    sadzbaZamestnanca(zamestnanec, datum){
        // nájdi poslednú aktuálnu zamestnanca
        app.runningScript = 'get.sadzbaZamestnanca()'
        try {
            // code here
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },

}
const set = {
    // app setters
}
const calc = {
    // app mutators
}

const runGetters = () => {
    get.openDb()
    get.openLibName()
    get.sadzbyDPH()
}
const logAppVariableStore = (msg) => {
    const storeVariables =
        'name: ' + app.data.name
        +'\nversion: ' + app.data.version
        +'\nseason: ' +  app.season
        +'\nopenLib.name: ' +  app.openLib.name
        +'\nopenLib.db: ' +  app.openLib.db
        +'\nopenLib.ID: ' +  app.openLib.ID
        +'\nopenLib.prefix: ' +  app.openLib.prefix
        +'\nopenLib.lastNum: ' +  app.openLib.lastNum
        +'\nopenLib.nextNum: ' +  app.openLib.nextNum
        +'\nopenLib.reservedNum: ' +  app.openLib.reservedNum
        +'\nopenLib.removedNums: ' +  app.openLib.removedNums
        +'\nopenLib.isPrefix: ' +  app.openLib.isPrefix
        +'\nopenLib.trim: ' +  app.openLib.trim
        +'\nopenLib.trailingDigit: ' +  app.openLib.trailingDigit
        +'\nen: ' +  app.en
        +'\nenD: ' +  app.enD
        +'\nlib: ' +  app.lib
        +'\ndph.zakladna: ' +  app.dph.zakladna
        +'\ndph.znizena: ' +  app.dph.znizena
        +'\nmsg: ' +  msg


    return storeVariables
}
const createLogEntry = (msg) => {
        const errorLib = libByName(app.data.errors)
        const newLog = new Object()
        newLog['type'] = 'log'
        newLog['date'] = new Date()
        newLog['memento library'] = app.openLib.name
        newLog['library'] = app.libFile
        newLog['script'] = app.runningScript
        newLog['text'] = 'app store variables'
        newLog['variables'] = logAppVariableStore(msg)
        newLog['note'] = 'generované scriptom createLogEntry'
        errorLib.create(newLog)
}
const createErrorEntry = (msg, error) => {
        message(error)
        message(error.lineNumber)
        const errorLib = libByName(app.data.errors)
        const newError = new Object()
        newError['type'] = 'error'
        newError['date'] = new Date()
        newError['memento library'] = app.openLib.name
        newError['library'] = app.libFile
        newError['script'] = app.runningScript
        newError['text'] = error
        newError['line'] = error.lineNumber
        newError['variables'] = logAppVariableStore(msg)
        newError['note'] = 'generované scriptom createErrorEntry'
        errorLib.create(newError)
}
// TRIGGERS
const libOpen = () => {
    runGetters()
    message(app.data.name + ' v.' + app.data.version +
    '\n' +  app.openLib.name +' ' +  app.season )
}