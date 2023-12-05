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