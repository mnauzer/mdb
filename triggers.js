// TRIGGERS
const libOpen = (initScript) => {
    // trigger lib_open
    setAppScripts('libOpen()', 'triggers.js', initScript)
    set.app(app.runningScript)
    try {
        message(app.data.name + ' v.' + app.data.version +
        '\n' +  app.openLib.name +' ' +  app.season )
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
const newEntry = (en, initScript)  => {
    setAppScripts('newEntry()', 'triggers.js', initScript)
    set.app(app.runningScript)
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
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}

const newEntryBeforeSave = (en, initScript) => {
    setAppScripts('newEntryBeforeSave()', 'triggers.js', initScript)
    try {
        switch (app.openLib.name) {
            case "Dochádzka":

                break;
            case "Evidencia prác":
                break;
            case "Pokladňa":
                break;
            case "Kniha jázd":
                break;
            default:
                break;
        }
        en.set(VIEW, VIEW_PRINT)
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}

const newEntryAfterSave = (en, initScript) => {
    setAppScripts('newEntryAfterSave()', 'triggers.js', initScript)
    try {
        switch (app.openLib.name) {
            case "Dochádzka":
                prepocitatZaznamDochadzky(en, app.runningScript)
                genDochadzkaZavazky(en, app.runningScript)
                break;
            case "Evidencia prác":
                break;
            case "Pokladňa":
                break;
            case "Kniha jázd":
                break;
            default:
                break;
        }
        set.number()
        en.set(VIEW, VIEW_PRINT)

        // if (app.log) {message("...after save")}
        // const createdEntry = lib().entries()[0]
        // if (app.log) {message("...entry number: " + createdEntry.field(NUMBER_ENTRY) )}
        // if (app.log) {message("...app.openLib.nextNum: " + Number(app.openLib.nextNum) )}
        // if (createdEntry.field(NUMBER_ENTRY) == Number(app.openLib.nextNum)) {
        //     if (app.log) {message("...entry successfully created")}
        //     set.number()

        // }
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}

const removeEntryBefore = (en, initScript) => {
    setAppScripts('removeEntryBefore()', 'triggers.js', initScript)
    set.app(app.runningScript) //TODO: asi musí byt inicializované po každom novom načítaní knižnice app.js do trigger scriptu
    try {
        if (app.log) {message("BF...removing entry: " + en.field(NUMBER_ENTRY))}
        app.openLib.removedNums.push(en.field(NUMBER_ENTRY))
        if (app.log) {message("BF...removedNums: " + app.openLib.removedNums)}
        switch (app.openLib.name) {
            case "Dochádzka":
                break;
            case "Evidencia prác":
                break;
            case "Pokladňa":
                break;
            case "Kniha jázd":
                break;
            default:
                break;
        }
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
const removeEntryAfter = (en, initScript) => {
    setAppScripts('removeEntryAfter()', 'triggers.js', initScript)
    set.app(app.runningScript) //TODO: asi musí byt inicializované po každom novom načítaní knižnice app.js do trigger scriptu
    try {
        //if (app.log) {message("AF...removing entry: " + en.field(NUMBER_ENTRY))}
        switch (app.openLib.name) {
            case "Dochádzka":
                break;
            case "Evidencia prác":
                break;
            case "Pokladňa":
                break;
            case "Kniha jázd":
                break;
            default:
                break;
        }
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}

const test = () => {
    message('test2')
}
