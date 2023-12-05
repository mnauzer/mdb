
const app = {
    // app store
    data: {
        name: 'ASISTANTO',
        version: '23.1.0002',
        app: "ASISTANTO",
        db: "ASISTANTO DB",
        errors: "ASISTANTO Errors",
        tenants: "ASISTANTO Tenants",
        scripts: "ASISTANTO Scripts",
        todo: "ASISTANTO ToDo",
    },
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
        get.library()
        get.openDb()
        app.openLib.name = app.openLib.db.name // lib().title
    },
    openDb(){
        message("getting DB")
        try {
            get.season()
            get.openLibName()
            const dbLib = libByName(app.data.app).find(app.season)[0].field("Databázy").filter(en => en.field("Názov") == app.lib.title)
            app.openLib.db = dbLib[0]
            app.openLib.ID = app.openLib.db.field("ID")
            app.openLib.prefix = app.openLib.db.field("Prefix")
            // entry attributes
            app.openLib.lastNum = app.openLib.db.atrr("posledné číslo")
            app.openLib.nextNum = app.openLib.db.atrr("naseledujúce číslo")
            app.openLib.reservedNum = app.openLib.db.atrr("rezervované číslo")
            app.openLib.removedNums = app.openLib.db.atrr("vymazané čísla")
            app.openLib.isPrefix = app.openLib.db.atrr("prefix")
            app.openLib.trim = app.openLib.db.atrr("trim")
            app.openLib.trailingDigit = app.openLib.db.atrr("trailing digit")
        } catch (error) {
            message(error)
            message(error.lineNumber)
        }

    },
    sadzbyDPH(){
        // nájdi sadzby DPH pre sezónu
        app.dph.zakladna = libByName(app.data.app).find(app.season)[0].field("Základná sadzba DPH")
        app.dph.znizena = libByName(app.data.app).find(app.season)[0].field("Znížená sadzba DPH")
    },
    sadzbaZamestnanca(zamestnanec, datum){
        // nájdi poslednú aktuálnu zamestnanca
    },

}
const set = {
    // app setters
}
const calc = {
    // app mutators
}

const runGetters = () => {
    get.openLibName()
    get.sadzbyDPH()
}
const logAppVariableStore = () => {
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

    createLogEntry(storeVariables)
}
const createLogEntry = (msg) =>{
        const errorLib = libByName(app.data.errors)
        const newError = new Object()
        newError['type'] = 'log'
        newError['date'] = new Date()
        newError['memento library'] = app.openLib.name
        newError['script'] = 'logAppVariableStore'
        newError['text'] = 'app store variables'
        newError['variables'] = msg
        newError['note'] = 'generované scriptom logAppVariableStore'
        errorLib.create(newError)
}
// TRIGGERS
const libOpen = () => {
    runGetters()
    message(app.data.name + ' v.' + app.data.version +
    '\n' +  app.openLib.name +' ' +  app.season )
}