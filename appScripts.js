
const app = {
    // app store
    name: 'ASISTANTO',
    version: '23.1.0001',
    season: null,
    openLib: {
        name: null,
        db: null,
    },
    lib: {
        app: "ASISTANTO",
        db: "ASISTANTO DB",
        errors: "ASISTANTO Errors",
        tenants: "ASISTANTO Tenants",
        scripts: "ASISTANTO Scripts",
        todo: "ASISTANTO ToDo",
    },
}

const get = {
    // app getters
    season(){
        app.season = libByName(app.lib.tenants).find("KRAJINKA")[0].field("default season")
    },
    name(){
        app.openLib.name = lib().name
    },
    db(){
        const dbLib = libByName(app.lib.app).find(app.season)[0].field("Databázy")
        app.openLib.db = dbLib.filter(en => en.field("Názov") == app.openLib.name)
    },
    library(){

    },
}

const set = {
    // app setters
}

const calc = {
    // app mutators
}

const libOpen = () => {
    get.season()
    get.name()
    get.db()

    message(app.name + ' v.' + app.version +
    '\nopenLib.name: ' +  app.openLib.name +
    '\nseason: ' +  app.season )
}

const logAppVariableStore = () => {
        const storeVariables =
        'app.name: ' + app.name
        +'\napp.version: ' + app.version
        +'\napp.season: ' +  app.season
        +'\napp.openLib.name: ' +  app.openLib.name
        const errorLib = libByName(app.lib.errors)
        const newError = new Object()
        newError['type'] = 'log'
        newError['date'] = new Date()
        newError['memento library'] = app.name
        newError['script'] = 'logAppVariableStore'
        newError['text'] = 'app store variables'
        newError['variables'] = storeVariables
        newError['note'] = 'generované scriptom logAppVariableStore'
        errorLib.create(newError)
}