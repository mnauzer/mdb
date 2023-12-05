
const app = {
    // app store
    name: 'ASISTANTO',
    version: '23.1.0002',
    app: "ASISTANTO",
    db: "ASISTANTO DB",
    errors: "ASISTANTO Errors",
    tenants: "ASISTANTO Tenants",
    scripts: "ASISTANTO Scripts",
    todo: "ASISTANTO ToDo",
    season: null,
    openLib: {
        name: null,
        db: null,
    },
    en: null,
    enD: null,
    lib: null,
}
const get = {
    // app getters
    library(){
        app.lib = lib()
    },
    season(){
        app.season = libByName(app.tenants).find("KRAJINKA")[0].field("default season")
    },
    openLibName(){
        get.library()
        app.openLib.name = app.lib.name
    },
    openDb(){
        get.season()
        get.openLibName()
        const dbLib = libByName(app.app).find(app.season)[0].field("Databázy")
        app.openLib.db = dbLib.filter(en => en.field("Názov") == app.openLib.name)
    },

}
const set = {
    // app setters
}
const calc = {
    // app mutators
}

const runGetters = () => {
    get.library()
    get.season()
    get.openLibName()
    get.openDb()
}
const logAppVariableStore = () => {
    const storeVariables =
        'app.name: ' + app.name
        +'\napp.version: ' + app.version
        +'\napp.season: ' +  app.season
        +'\napp.openLib.name: ' +  app.openLib.name
        +'\napp.lib: ' +  app.lib

    createLogEntry(storeVariables)
}
const createLogEntry = (msg) =>{
        const errorLib = libByName(app.errors)
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
    message(app.name + ' v.' + app.version +
    '\nopenLib.name: ' +  app.openLib.name +
    '\nseason: ' +  app.season )
}