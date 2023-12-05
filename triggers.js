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
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
const newEntry = en => {
    app.runningScript = 'newEntry()'
    app.libFile = 'triggers.js'
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
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}