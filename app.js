const app = {
    // app store
    data: {
        name: 'ASISTANTO',
        version: '1.02.0012',
        app: "ASISTANTO",
        db: "ASISTANTO DB",
        errors: "ASISTANTO Errors",
        tenants: "ASISTANTO Tenants",
        scripts: "ASISTANTO Scripts",
        todo: "ASISTANTO ToDo",
        tenant: "KRAJINKA"
    },
    msg: null,
    runningScript: null,
    libFile: 'app.js',
    initScript: null,
    openLib: { // ASISTANTO nastavenie knižnice podľa sezóny
        name: null,
        // ASISTANTO DB
        db: null,
        ID: null,
        prefix: null,
        // ASISTANTO attributes
        lastNum: null,
        nextNum: null,
        reservedNum: null,
        removedNums: [],
        isPrefix: null,
        trim: null,
        trailingDigit: null,
        // generované get.number()
        number: null,
        // záznamy otvorenej knižnice
        lib: null,
        entries: null,
        en: null,
        enD: null,
    },
    // ASSISTANTO TENANTS nastavenie
    season: null, // default season
    log: false,
    debug: false,
    // ASISTANTO nastavenie knižnice podľa sezóny
    dph: {
        zakladna: null,
        znizena: null,
    }
}
const get = {
    // app getters
    library(){
        app.openLib.lib = lib()
        app.openLib.name = lib().title
        app.openLib.entries = lib().entries()
        app.openLib.en = entry()
        app.openLib.enD = entryDefault()
    },
    season(){
        app.season = libByName(app.data.tenants).find(app.data.tenant)[0].field("default season")
        app.log = libByName(app.data.tenants).find(app.data.tenant)[0].field("log")
        app.debug = libByName(app.data.tenants).find(app.data.tenant)[0].field("debug")
    },
    //openLibName(){
    //     app.openLib.name = app.openLib.db.title // lib().title
    // },
    openDb(){
        app.runningScript = 'get.openDb()'
        app.libFile = 'app.js'
        try {
            get.library()
            get.season()
            const dbEntry = libByName(app.data.app).find(app.season)[0]
            if (dbEntry !== undefined){
                const dbLib = dbEntry.field("Databázy").filter(en => en.field("Názov") == app.openLib.name)
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
                app.openLib.number = this.number()
            } else {
                message('Nie je vytvorený záznam knižnice ' + app.openLib.name + ' pre sezónu ' + app.season)
            }
            set.storeDb()
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    number(){
        // vyskladaj nové číslo záznamu
        app.runningScript = 'get.number()'
        app.libFile = 'app.js'
        try {
            // najprv zisti či nie sú vymazané čísla
            if (app.openLib.removedNums){
                if (app.log) {message("...removedNums: " + app.openLib.removedNums)}
            }
            const newNumber = app.openLib.isPrefix
            ? app.openLib.prefix + app.season.slice(app.openLib.trim) + pad(app.openLib.nextNum, app.openLib.trailingDigit)
            : app.openLib.ID + app.season.slice(app.openLib.trim) + pad(app.openLib.nextNum, app.openLib.trailingDigit)
            app.openLib.number = newNumber
            if (app.log) {message('Nové číslo: ' + newNumber)}
            nullAppScripts()
            return newNumber
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
            app.runningScript = null
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
}
const set = {
    // app setters
    storeDb(){
        app.runningScript = 'get.storeDb()'
        try {
            const storeDB = libByName(app.data.tenants).find(app.data.tenant)[0]
            storeDB.set("data.name", app.data.name)
            storeDB.set("data.version", app.data.version)
            storeDB.set("data.app", app.data.app)
            storeDB.set("data.db", app.data.db)
            storeDB.set("data.errors", app.data.errors)
            storeDB.set("data.tenants", app.data.tenants)
            storeDB.set("data.scripts", app.data.scripts)
            storeDB.set("data.todo", app.data.todo)
            storeDB.set("data.tenant", app.data.tenant)
            storeDB.set("msg", app.msg)
            storeDB.set("runningScript", app.runningScript)
            storeDB.set("libFile", app.libFile)
            storeDB.set("season", app.season)
            storeDB.set("log", app.log)
            storeDB.set("debug", app.debug)
            storeDB.set("openLib.name", app.openLib.name)
            storeDB.set("openLib.db.id", app.openLib.db ? app.openLib.db.id : null)
            storeDB.set("openLib.prefix", app.openLib.prefix)
            storeDB.set("openLib.lastNum", app.openLib.lastNum)
            storeDB.set("openLib.nextNum", app.openLib.nextNum)
            storeDB.set("openLib.reservedNum", app.openLib.reservedNum)
            storeDB.set("openLib.removedNums", app.openLib.removedNums)
            storeDB.set("openLib.isPrefix", app.openLib.isPrefix)
            storeDB.set("openLib.trailingDigit", app.openLib.trailingDigit)
            storeDB.set("openLib.trim", app.openLib.trim)
            storeDB.set("openLib.number", app.openLib.number)
            storeDB.set("dph.zakladna", app.dph.zakladna)
            storeDB.set("dph.znizena", app.dph.znizena)
            storeDB.set("en.id", app.en ? app.en.id : null)
            app.runningScript = null
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    season(arg){
        app.runningScript = 'set.season()'
        try {
            libByName(app.data.tenants).find(app.data.tenant)[0].set("default season", arg)
            initApp()
            message('Nastavená sezóna: ' + app.season)
            app.runningScript = null
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    log(){
        app.runningScript = 'set.log()'
        const current = !app.log
        try {
            libByName(app.data.tenants).find(app.data.tenant)[0].set("log", current)
            initApp()
            if (app.log) {
                message('log zapnutý')
            } else {
                message('log vypnutý')
            }
            app.runningScript = null
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    debug(){
        app.runningScript = 'set.debug()'
        const current = app.debug
        try {
            libByName(app.data.tenants).find(app.data.tenant)[0].set("debug", !current)
            initApp()
            if (app.log) {
                message('debug zapnutý')
            } else {
                message('debug vypnutý')
            }
            app.runningScript = null
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    numberPrefix(){
        app.runningScript = 'set.numberPrefix()'
        const current = app.openLib.isPrefix
        try {
            app.openLib.db.setAttr("prefix", !current)
            initApp()
            if (app.log) {
                message('prefix čísla zapnutý')
            } else {
                message('prefix čísla vypnutý')
            }
            app.runningScript = null
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    number(){
        app.runningScript = 'set.number()'
        app.libFile = 'app.js'
        try {
            if (app.log) {message("...set.number()")}
            app.openLib.db.setAttr("posledné číslo", app.openLib.nextNum)
            app.openLib.db.setAttr("nasledujúce číslo", (Number(app.openLib.nextNum) + 1))
            initApp()
            app.runningScript = null
            app.libFile = null
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    }
}
const calc = {
    // app mutators
}

const initApp = () => {
    app.runningScript = 'initApp()'
    app.libFile = 'app.js'
    try {
        get.openDb()
        //get.openLibName()
        get.sadzbyDPH()
        set.storeDb()
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
const logAppVariableStore = (msg) => {
    const storeVariables =
        'name: ' + app.data.name
        +'\nversion: ' + app.data.version
        +'\nseason: ' +  app.season
        +'\nlog: ' +  app.log
        +'\ndebug: ' +  app.debug
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
        +'\nopenLib.number: ' +  app.openLib.number
        +'\nen: ' +  app.en
        +'\nenD: ' +  app.enD
        +'\nlib: ' +  app.lib
        +'\ndph.zakladna: ' +  app.dph.zakladna
        +'\ndph.znizena: ' +  app.dph.znizena
        +'\nmsg: ' +  msg
    return storeVariables
}
const createLogEntry = (msg) => {
        if (app.log) {message("Nový záznam vytvorený")}
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
        if (app.debug) {message(error)}
        if (app.debug) {message(error.lineNumber)}
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
        nullAppScripts()
}

const nullAppScripts = () => {
        app.runningScript = null
        app.libFile = null
        app.initScript = null
}
