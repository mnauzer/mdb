
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
        error: "ASISTANTO Errors",
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

    message(app.name + ' v.' + app.version + '\n' +  app.openLib.name )
}