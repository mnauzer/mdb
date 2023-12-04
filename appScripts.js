const APP = {
    version: '23.0.010',
    defaultName(lib){
        return lib || lib().title
    },
    defaultSeason(season){
        return season || libByName(LIBAPP_TENATNS).find("KRAJINKA")[0].field("default season")
    },
    entry(season){
        season = this.defaultSeason(season)
        return libByName(LIBAPP).find(season)[0]
    },
    newNumber(lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        const number = []
        const trashedNums = this.getTrashedNums(lib, season)
        //message('1 trashed length: ' + trashedNums.length)
        message('2 trashed: ' + trashedNums)
        let nextNum = null;
        const trim = this.DB(lib, season).attr("trim")
        // najprv použi vymazané čísla
        if (trashedNums !== undefined && trashedNums != null){
            message('3 využívam vymazané číslo: ' + season)
            nextNum = trashedNums.pop()
            this.DB(lib, season).setAttr("vymazané čísla", trashedNums)
        } else {
            message('3 využívam nasledujúce číslo: ' + season)
            // ak nie sú žiadne vymazané čísla použi následujúce
            nextNum = Number(this.DB(lib, season).attr("nasledujúce číslo"))
            if (nextNum == Number(this.DB(lib, season).attr("rezervované číslo"))){
                nextNum += 1
            }
        }
        this.DB(lib, season).setAttr("rezervované číslo", nextNum)
        number[0] = this.DB(lib, season).attr("prefix")
        ? this.DB(lib, season).field("Prefix") + season.slice(trim) + pad(nextNum, this.DB(lib, season).attr("trailing digit"))
        : this.DB(lib, season).field("ID") + season.slice(trim) + pad(nextNum, this.DB(lib, season).attr("trailing digit"))
        number[1] = nextNum

        this.DB(lib).setAttr("rezervované číslo", null)
        return number
    },
    saveNewNumber(nmb, lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        this.DB(lib, season).setAttr("posledné číslo", Number(nmb))
        this.DB(lib, season).setAttr("nasledujúce číslo", Number(nmb) + 1)
        this.DB(lib, season).setAttr("rezervované číslo", null)
    },
    DB(lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        const db = this.entry(season).field("Databázy")
        const filtered = db.filter(en => en.field("Názov") == lib)
        return filtered[0]
    },
    getTrashedNums(lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        const rmNum = this.DB(lib, season).attr("vymazané čísla")
        //message('rmNum: ' + typeof(rmNum))
        let rmArray = []
        if (rmNum.length > 1) {
            message('rmNum > 1: ' + rmNum)
            rmArray = rmNum.split(',')
        } else if (rmNum.length = 1) {
            const num = Number(rmNum)
            if (num <= 0) {
                message('rmNum = 1: ' + rmNum)
                return null
            } else {
                rmArray.push(num)
            }
        } else {
            message('nie sú vymazané čísla')
            return null
        }
        message('rmArray: ' + rmArray)
        return rmArray
    },
    setTrashedNums(nums, lib, season){
        season = this.defaultSeason(season)
        lib = this.defaultName(lib)
        try {
            this.DB(lib, season).setAttr("vymazané čísla", nums)
            return true
        } catch (error) {
            return false
        }
    },
    scr: {
        name: '',
        param: {
            en: null,
            inptScript: null,
            lib: null,
            season: null,
        },
        var: {
            user: user(),
            app: this.defaultName(),
            version: this.version,
            season: this.defaultSeason(),
        },
        error: null,
        genMsgParams(){
            let msg = ''
            Object.entries(this.param).forEach(([key, value]) => {msg += key + ': ' + value + '\n'})
            // for (let [key, value] of this.param) {
            //     msg += key + ': ' + value + '\n'
            // }
            return msg
        },
        genMsgVars(){
            let msg = ''
            this.var.entries().forEach(([key, value]) => {msg += key + ': ' + value + '\n'})
            return msg
        }
    },
    errorGen(error){
        // generátor chyby
        message('ERROR: ' + this.scr.name + '\n' + error)
        const errorLib = libByName(LIBAPP_ERROR)
        const newError = new Object()
        newError['type'] = 'error'
        newError['date'] = new Date()
        newError['memento library'] = this.defaultName()
        newError['script'] = this.scr.name
        newError['text'] = error
        newError['line'] = error.lineNumber
        newError['variables'] = this.scr.var
        newError['parameters'] = this.scr.param
        newError['note'] = 'generované scriptom APP.errorGen'
        errorLib.create(newError)

        scr.param.en.set(VIEW, VIEW_DEBUG)
        cancel()
        exit()
    },
}

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