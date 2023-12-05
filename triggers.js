// TRIGGERS
const libOpen = () => {
    // trigger lib_open
    app.runningScript = 'get.sadzbaZamestnanca()'
    app.libFile = 'triggers.js'
    try {
        initApp()
        message(app.data.name + ' v.' + app.data.version +
        '\n' +  app.openLib.name +' ' +  app.season )
        app.runningScript = null
        app.libFile = null
        app.initScript = null
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
const newEntry = (en, initScript)  => {
    app.runningScript = 'newEntry()'
    app.libFile = 'triggers.js'
    app.initScript = initScript
    try {
        message("Nový záznam >> " + app.openLib.name)
        en.set(VIEW, VIEW_EDIT)
        en.set(DATE, new Date())
        en.set(CR, user())
        en.set(CR_DATE, new Date())
        en.set(NUMBER, app.openLib.number)
        en.set(NUMBER_ENTRY, app.openLib.nextNum)
        en.set(SEASON, app.season)
        // code here
        app.runningScript = null
        app.libFile = null
        app.initScript = null
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}

const newEntryBeforeSave = (en, initScript) => {
    app.runningScript = 'newEntryBeforeSave()'
    app.libFile = 'triggers.js'
    app.initScript = initScript
    try {
        if (app.log) {message("...before save")}
        switch (app.openLib.name) {
            case "Dochádzka":
                prepocitatZaznamDochadzky(en, app.runningScript)
                break;
            default:
                break;
        }
        app.runningScript = null
        app.libFile = null
        app.initScript = null
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}

const newEntryAfterSave = (initScript) => {
    app.runningScript = 'newEntryAfterSave()'
    app.libFile = 'triggers.js'
    app.initScript = initScript
    try {
        if (app.log) {message("...after save")}
        const createdEntry = lib().entries()[0]
        if (app.log) {message("...entry name: " + createdEntry.name)}
        if (createdEntry.field(NUMBER_ENTRY) == app.openLib.nextNum) {
            if (app.log) {message("...entry successfully created")}
            set.number()
            createdEntry.set(VIEW, VIEW_PRINT)
        }
        app.runningScript = null
        app.libFile = null
        app.initScript = null
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}