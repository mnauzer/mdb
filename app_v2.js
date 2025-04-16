const app = {
    // app store
    data: {
        name: 'ASISTANTO',
        version: '2.04.0007',
        app: 'ASISTANTO',
        db: 'ASISTANTO DB',
        errors: 'ASISTANTO Errors',
        tenants: 'ASISTANTO Tenants',
        scripts: 'ASISTANTO Scripts',
        todo: 'ASISTANTO ToDo',
        tenant: 'KRAJINKA'
    },
    tenant: {
        name: null,
        street: null,
        city: null,
        psc: null,
        ico: null,
        dic: null,
        platca_dph: null,
    },
    msg: null,
    runningScript: null,
    libFile: 'app_v2.js',
    initScript: null,
    activeLib: { // ASISTANTO nastavenie knižnice podľa sezóny
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
    },
}
// Better library reference caching
const LibraryCache = {
    _cache: {},
    get(libName) {
        if (!this._cache[libName]) {
            this._cache[libName] = libByName(libName);
        }
        return this._cache[libName];
    },
    clear() {
        this._cache = {};
    }
};

// Improved error handling for Memento operations
const MementoOps = {
    safeLibOperation(libName, operation) {
        try {
            const library = LibraryCache.get(libName);
            if (!library) {
                message(`Library ${libName} not found`);
            }
            return operation(library);
        } catch (error) {
            createErrorEntry('MementoOps.safeLibOperation', error);
            return null;
        }
    }
};

// Better entry validation
const validateEntry = (entry, requiredFields) => {
    if (!entry) return false;
    return requiredFields.every(field => {
        const value = entry.field(field);
        return value !== undefined && value !== null;
    });
};

// Improved number generation with validation
const getNextNumber = (lib, season) => {
    if (!lib || !season) {
        message('Library and season required for number generation');
    }
    // Existing number generation logic with added validation
};
// GETTERS
const get = {
    // app getters
    library(libName){
        app.activeLib.lib = lib()
        app.activeLib.name = libName || lib().title
        app.activeLib.entries = lib().entries()
        app.activeLib.en = entry()
        //app.activeLib.enD = entryDefault()
    },
    season(){
        app.season = libByName(app.data.tenants).find(app.data.tenant)[0].field('default season')
        app.log = libByName(app.data.tenants).find(app.data.tenant)[0].field('log')
        app.debug = libByName(app.data.tenants).find(app.data.tenant)[0].field('debug')
    },
    openLib(initScript, libName){  //parametre sú pre generátor chýb -- debug
        //setAppScripts('get.openLib()', 'app.js', initScript)
        try {
            if(libName){
                set.storeDb(app.runningScript); // keď je otvorená sekundárna knižnica ulož premenné
            }
            get.library(libName);
            get.season();
            const dbEntry = libByName(app.data.app).find(app.season)[0]; // TS: ibByName() je Memento funkcia
            if (dbEntry !== undefined){
                //if (app.log) {message('...openLibSeason: ' + app.season)}
                const dbLib = dbEntry.field('Databázy').filter(en => en.field('Názov') == app.activeLib.name);
                if (dbLib !== undefined){
                    app.activeLib.db = dbLib[0];
                    app.activeLib.ID = app.activeLib.db.field('ID');
                    app.activeLib.prefix = app.activeLib.db.field('Prefix');
                    // entry attributes
                    app.activeLib.lastNum = app.activeLib.db.attr('posledné číslo');
                    app.activeLib.nextNum = app.activeLib.db.attr('nasledujúce číslo');
                    app.activeLib.reservedNum = app.activeLib.db.attr('rezervované číslo');
                    app.activeLib.removedNums.concat(app.activeLib.db.attr('vymazané čísla'));
                    app.activeLib.isPrefix = app.activeLib.db.attr('prefix');
                    app.activeLib.trim = app.activeLib.db.attr('trim');
                    app.activeLib.trailingDigit = app.activeLib.db.attr('trailing digit');
                    app.activeLib.number = this.number(app.runningScript);
                    if (app.log) {message('...openLib: ' + dbEntry.name + ' - ' + app.activeLib.db.title)}
                } else {
                    if (app.log) {message('...nie je vytvorený záznam pre knižnicu ' + app.activeLib.name + ' v sezóne  ' + app.season)}
                }
            } else {
                if (app.log) {message('...nie je vytvorené záznam pre sezónu ' + app.season)}
            }
            set.storeDb(app.runningScript)
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    number(initScript){
        // vyskladaj nové číslo záznamu
        //setAppScripts('get.number()', 'app.js', initScript);
        try {
            // najprv zisti či nie sú vymazané čísla
            if (app.activeLib.removedNums > 0){
                if (app.log) {message('...removedNums: ' + app.activeLib.removedNums)}
                // použi najprv vymazané čísla
            }
            const newNumber = app.activeLib.isPrefix
            ? app.activeLib.prefix + app.season.slice(app.activeLib.trim) + pad(app.activeLib.nextNum, app.activeLib.trailingDigit)
            : app.activeLib.ID + app.season.slice(app.activeLib.trim) + pad(app.activeLib.nextNum, app.activeLib.trailingDigit);
            app.activeLib.number = newNumber;
            if (app.log) {message('Nové číslo: ' + newNumber + ' v knižnici ' + app.activeLib.name)}
            //nullAppScripts();
            return newNumber
        } catch (error) {
            message(error)
        }
    },
    sadzbyDPH(initScript){
        // nájdi sadzby DPH pre sezónu
        //setAppScripts('sadzbyDPH()', 'app.js', initScript)
        try {
            app.dph.zakladna = libByName(app.data.app).find(app.season)[0].field('Základná sadzba DPH')
            app.dph.znizena = libByName(app.data.app).find(app.season)[0].field('Znížená sadzba DPH')
            ////nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
}
// SETTERS
const set = {
    app(initScript){
        //setAppScripts('set.app()', 'app.js', initScript)
        try {
            this.storeDb(app.runningScript)
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    storeDb(initScript){
        //setAppScripts('set.storeDb()', 'app.js', initScript)
        try {
            // Store to ASISTANTO Tenants
            const storeDB = libByName(app.data.tenants).find(app.data.tenant)[0]
            storeDB.set('data.name', app.data.name)
            storeDB.set('data.version', app.data.version)
            storeDB.set('data.app', app.data.app)
            storeDB.set('data.db', app.data.db)
            storeDB.set('data.errors', app.data.errors)
            storeDB.set('data.tenants', app.data.tenants)
            storeDB.set('data.scripts', app.data.scripts)
            storeDB.set('data.todo', app.data.todo)
            storeDB.set('data.tenant', app.data.tenant)
            storeDB.set('msg', app.msg)
            storeDB.set('runningScript', app.runningScript)
            storeDB.set('libFile', app.libFile)
            storeDB.set('season', app.season)
            storeDB.set('log', app.log)
            storeDB.set('debug', app.debug)
            storeDB.set('activeLib.name', app.activeLib.name)
            storeDB.set('activeLib.db.id', app.activeLib.db ? app.activeLib.db.id : null)
            storeDB.set('activeLib.prefix', app.activeLib.prefix)
            storeDB.set('activeLib.lastNum', app.activeLib.lastNum)
            storeDB.set('activeLib.nextNum', app.activeLib.nextNum)
            storeDB.set('activeLib.reservedNum', app.activeLib.reservedNum)
            storeDB.set('activeLib.removedNums', app.activeLib.removedNums)
            storeDB.set('activeLib.isPrefix', app.activeLib.isPrefix)
            storeDB.set('activeLib.trailingDigit', app.activeLib.trailingDigit)
            storeDB.set('activeLib.trim', app.activeLib.trim)
            storeDB.set('activeLib.number', app.activeLib.number)
            storeDB.set('dph.zakladna', app.dph.zakladna)
            storeDB.set('dph.znizena', app.dph.znizena)
            storeDB.set('en.id', app.en ? app.en.id : null)

            // Store to ASISTANTO open database

            // TODO: vypínam toto padá apka R 30.10.2024
            //message("zapnutý script app.js riadok 184")
            app.activeLib.db.setAttr('názov', app.activeLib.name)
            app.activeLib.db.setAttr('posledné číslo', app.activeLib.lastNum)
            app.activeLib.db.setAttr('nasledujúce číslo', app.activeLib.nextNum)
            app.activeLib.db.setAttr('rezervované číslo', app.activeLib.reservedNum)
            app.activeLib.db.setAttr('vymazané čísla', app.activeLib.removedNums)
            app.activeLib.db.setAttr('vygenerované číslo', app.activeLib.number)
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    season(arg){
        //setAppScripts('set.season()', 'app.js')
        try {
            libByName(app.data.tenants).find(app.data.tenant)[0].set('default season', arg)
            get.openLib()
            message('Nastavená sezóna: ' + app.season)
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    log(){
        //setAppScripts('set.log()', 'app.js')
        try {
            const lib = libByName(app.data.tenants).find(app.data.tenant)[0]
            let isLog = lib.field('log')
            if (isLog) {
                isLog = false
                message('log vypnutý')
            } else {
                isLog = true
                message('log zapnutý')
            }
            lib.set('log', isLog)
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    debug(){
        //setAppScripts('set.debug()', 'app.js')
        try {
            const lib = libByName(app.data.tenants).find(app.data.tenant)[0]
            let isDebug = lib.field('debug')
            if (isDebug) {
                isDebug = false
                message('debug vypnutý')
            } else {
                isDebug = true
                message('debug zapnutý')
            }
            lib.set('debug', isDebug)
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    numberPrefix(){
        //setAppScripts('set.numberPrefix()', 'app.js', initScript)
        const current = app.activeLib.isPrefix
        try {
            app.activeLib.db.setAttr('prefix', !current)
            initApp()
            if (app.log) {
                message('prefix čísla zapnutý')
            } else {
                message('prefix čísla vypnutý')
            }
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    number(initScript){
        //setAppScripts('set.number()', 'app.js', initScript)
        try {
            const lastNum = app.activeLib.nextNum;
            const nextNum = (Number(app.activeLib.nextNum) + 1);
            message('setting number ' + lastNum + '/' + nextNum + ' v activeLib.' + app.activeLib.name);
            app.activeLib.db.setAttr('posledné číslo', lastNum);
            app.activeLib.db.setAttr('nasledujúce číslo', nextNum );
            this.storeDb(app.runningScript);
            get.openLib(app.runningScript);
        } catch (error) {
            message(error);
        }
    }
}
// MUTATORS
const calc = {
    // app mutators
}

// LOG & ERRORS
const logAppVariableStore = (msg) => {
    const storeVariables =
        'name: ' + app.data.name
        +'\nversion: ' + app.data.version
        +'\nseason: ' +  app.season
        +'\nlog: ' +  app.log
        +'\ndebug: ' +  app.debug
        +'\nactiveLib.name: ' +  app.activeLib.name
        +'\nactiveLib.db: ' +  app.activeLib.db
        +'\nactiveLib.ID: ' +  app.activeLib.ID
        +'\nactiveLib.prefix: ' +  app.activeLib.prefix
        +'\nactiveLib.lastNum: ' +  app.activeLib.lastNum
        +'\nactiveLib.nextNum: ' +  app.activeLib.nextNum
        +'\nactiveLib.reservedNum: ' +  app.activeLib.reservedNum
        +'\nactiveLib.removedNums: ' +  app.activeLib.removedNums
        +'\nactiveLib.isPrefix: ' +  app.activeLib.isPrefix
        +'\nactiveLib.trim: ' +  app.activeLib.trim
        +'\nactiveLib.trailingDigit: ' +  app.activeLib.trailingDigit
        +'\nactiveLib.number: ' +  app.activeLib.number
        +'\nactiveLib.lib: ' +  app.activeLib.lib
        +'\nactiveLib.en: ' +  app.activeLib.en
        +'\nactiveLib.entries: ' +  app.activeLib.entries.length
        +'\nactiveLib.enD: ' +  app.activeLib.enD
        +'\ndph.zakladna: ' +  app.dph.zakladna
        +'\ndph.znizena: ' +  app.dph.znizena
        +'\nmsg: ' +  msg
    return storeVariables
}
const createLogEntry = (msg) => {
        if (app.msg) {message('Nový záznam vytvorený')}
        const errorLib = libByName(app.data.errors)
        const newLog = new Object()
        newLog['type'] = 'log'
        newLog['date'] = new Date()
        newLog['memento library'] = app.activeLib.name
        newLog['library'] = app.libFile
        newLog['script'] = app.runningScript
        newLog['text'] = 'app store variables'
        newLog['variables'] = logAppVariableStore(msg)
        newLog['note'] = 'generované scriptom createLogEntry'
        errorLib.create(newLog)
}
const createMsgEntry = (msg) => {
        if (app.log) {message('Nový záznam vytvorený')}
        const errorLib = libByName(app.data.errors)
        const newMsg = new Object()
        newMsg['type'] = 'msg'
        newMsg['date'] = new Date()
        newMsg['memento library'] = app.activeLib.name
        newMsg['library'] = app.libFile
        newMsg['script'] = app.runningScript
        newMsg['text'] = msg
        newMsg['variables'] = logAppVariableStore(msg)
        newMsg['note'] = 'generované scriptom createMsgEntry'
        errorLib.create(newMsg)
}
const createErrorEntry = (msg, error) => {
        if (app.debug) {message(error)}
        if (app.debug) {message(error.lineNumber)}
        const errorLib = libByName(app.data.errors)
        const newError = new Object()
        newError['type'] = 'error'
        newError['date'] = new Date()
        newError['memento library'] = app.activeLib.name
        newError['library'] = app.libFile
        newError['script'] = app.runningScript
        newError['text'] = error
        newError['line'] = error.lineNumber
        newError['variables'] = logAppVariableStore(msg)
        newError['note'] = 'generované scriptom createErrorEntry'
        errorLib.create(newError)
        //nullAppScripts()
}

// EMPLOYEES / ZAMESTNANCI
const employees = {
    sadzba(employee, date) {
        try {
            // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
            const links = employee.linksFrom(LIB_SZ, FLD_ZAM);
            const dateField ="Platnosť od";
            let sadzba = 0;
            filteredLinks = filterByDate(links, date, dateField);
            if (filteredLinks.length < 0) {
                msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu';
                return null;
            } else {
                return filteredLinks[0].field("Sadzba");
            }
        } catch (error) {
            message(error)
        }
    }
}
// CALC
// DOCHÁDZKA
// Helper functions
function validateAndRoundTime(time) {
    if (!time) {
        message('Missing time value');
        cancel();
    }
    return roundTimeQ(time);
}

function calculateWorkHours(start, end) {
    return (end - start) / 3600000;
}
function prepocitatZaznamDochadzky(en){
   // //setAppScripts('prepocitatZaznamDochadzky()', 'calc.js', initScript);
    try {
        const datum = en.field(DATE);
        const zavazky = en.field("Generovať záväzky")
        const zamestnanci = en.field("Zamestnanci");
        const evidenciaPrac = en.field("Práce");
        const totals = {
            mzdy: 0,
            odpracovane: 0,
            evidencia: 0,
            prestoje: 0
        };


         // Validate and process time entries
        const prichod = validateAndRoundTime(en.field("Príchod"));
        const odchod = validateAndRoundTime(en.field("Odchod"));

        if (!prichod || !odchod || prichod >= odchod) {
            message('Invalid arrival/departure times');
            cancel();
        }

        function setEmployeeAtrributes(employee, employeeAttributes){

        }
//
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);

        // výpočet pracovnej doby
        const pracovnaDoba = calculateWorkHours(prichod, odchod);

        // prepočet zamestnancov
        if (zamestnanci !== undefined || zamestnanci.length > 0) {
            for (let z = 0; z < zamestnanci.length; z++ ) {
                // vyhľadanie aktuálnej sadzby zamestnanca
                //const hodinovka = sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript); // prepisovať zadanú hodinovku
                const employeeAtt = {
                    hodinovka: employees.sadzba(zamestnanci[z], datum), // prepisovať zadanú hodinovku0,
                    odpracovane: pracovnaDoba,

                    dennaMzda(){return pracovnaDoba * (this.hodinovka
                    + zamestnanci[z].attr("+príplatok (€/h)"))
                    + zamestnanci[z].attr("+prémia (€)")
                    - zamestnanci[z].attr("-pokuta (€)")}
                }
               // employeeAtt.hodinovka = employees.sadzba(zamestnanci[z], datum); // prepisovať zadanú hodinovku

                message("sadzba " + zamestnanci[z].field("nick") + " je " + employeeAtt.hodinovka);

                zamestnanci[z].setAttr("odpracované", employeeAtt.odpracovane);
                zamestnanci[z].setAttr("hodinovka", employeeAtt.hodinovka);
                zamestnanci[z].setAttr("denná mzda", employeeAtt.dennaMzda());

                // výpočet dennej mzdy zamestnanca (základná mzda + zadané príplatky)
                // let dennaMzda = (pracovnaDoba * (hodinovka
                //     + zamestnanci[z].attr("+príplatok (€/h)")))
                //     + zamestnanci[z].attr("+prémia (€)")
                //     - zamestnanci[z].attr("-pokuta (€)");

                // pripočítanie do celkových hodnôt záznamu
                totals.mzdy += employeeAtt.dennaMzda;
                totals.odpracovane += employeeAtt.odpracovane;

                // generovanie záväzkov za mzdy
                if (!zavazky) {
                    message("Registrujem záväzky");
                    // ak sú staré záväzky, najprv vymaž
                    let stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka");
                    if(stareZavazky !== undefined || stareZavazky.length > 0){
                        message("Hľadám staré záväzky zamestnanca " + zamestnanci[z].name)
                        let filtered = stareZavazky.filter(el => el.field("Zamestnanec")[0].name == zamestnanci[z].name)
                        message("mažem..." + filtered.length + " záznamov")
                        filtered.forEach(el => {
                            el.trash()
                        });
                    stareZavazky = null;
                    }
                    // vygeneruj nové záväzky
                    message('Generujem nový záväzok zamestnanca ' + zamestnanci[z].name)
                    let zavazok = newEntryZavazky(zamestnanci[z], en, dennaMzda, app.runningScript);
                };
                //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
                if (evidenciaPrac !== undefined || evidenciaPrac.length > 0) {
                    if (app.log) {message("...prepočítavam evidenciu prác")}
                    for (let ep = 0; ep < evidenciaPrac.length; ep++) {
                        let zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                        let naZakazke = evidenciaPrac[ep].field("Pracovná doba");
                        for (let znz in zamNaZakazke) {
                            if (zamestnanci[z].field(NICK) == zamNaZakazke[znz].field(NICK)) {
                                totals.evidencia += naZakazke;
                            }
                        }
                    }
                }
            }
        };
        totals.prestoje = totals.odpracovane - totals.evidencia;
        // TODO zaevidovať prestoje do databázy zákaziek na zákazku Krajinka
        en.set("Mzdové náklady", totals.mzdy.toFixed(2));
        en.set("Pracovná doba", totals.odpracovane.toFixed(2));
        en.set("Odpracované", totals.odpracovane.toFixed(2));
        en.set("Na zákazkách", totals.evidencia.toFixed(2));
        en.set("Prestoje", totals.prestoje.toFixed(2));
        if (totals.evidencia == totals.odpracovane) {
           // en.set("appMsg", 'vyžaduje pozornosť');
          //  en.set("appMsg2", 'Nie sú zaevidované žiadne práce na zákazkách\nZaeviduj práce a daj prepočítať záznam.\nZvyšný čas bude priradený na zákazku KRAJINKA - prestoje');
        }
        if (app.log) {message("...hotovo")};
        ////nullAppScripts();
    } catch (error) {
        message(error);
    }
}


function setEmployeeAtrributes(employee, employeeAtt){

}
function prepocitatZaznamDochadzky2(en){
   // //setAppScripts('prepocitatZaznamDochadzky()', 'calc.js', initScript);
    try {
        const datum = en.field(DATE);
        const zavazky = en.field("Generovať záväzky")
        const zamestnanci = en.field("Zamestnanci");
        const evidenciaPrac = en.field("Práce");
        const totals = {
            mzdy: 0,
            odpracovane: 0,
            evidencia: 0,
            prestoje: 0
        };
        // Validate and process time entries
        const prichod = validateAndRoundTime(en.field("Príchod"));
        const odchod = validateAndRoundTime(en.field("Odchod"));

        if (!prichod || !odchod || prichod >= odchod) {
            message('Invalid arrival/departure times');
            //Notification.show("Error", "Invalid arrival/departure times");
            cancel();
        }
        //
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);

        // výpočet pracovnej doby
        const pracovnaDoba = calculateWorkHours(prichod, odchod);

        // prepočet zamestnancov
        if (zamestnanci !== undefined || zamestnanci.length > 0) {
            for (let z = 0; z < zamestnanci.length; z++ ) {
                // vyhľadanie aktuálnej sadzby zamestnanca
                //const hodinovka = sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript); // prepisovať zadanú hodinovku
                const employeeAttributes = {
                    hodinovka: employees.sadzba(zamestnanci[z], datum), // prepisovať zadanú hodinovku0,
                    odpracovane: pracovnaDoba,
                    dennaMzda: pracovnaDoba * (this.hodinovka
                    + zamestnanci[z].attr("+príplatok (€/h)"))
                    + zamestnanci[z].attr("+prémia (€)")
                    - zamestnanci[z].attr("-pokuta (€)")
                }
               // employeeAttributes.hodinovka = employees.sadzba(zamestnanci[z], datum); // prepisovať zadanú hodinovku

                message("sadzba " + zamestnanci[z].field("nick") + " je " + employeeAttributes.hodinovka);

                zamestnanci[z].setAttr("odpracované", employeeAttributes.odpracovane);
                zamestnanci[z].setAttr("hodinovka", employeeAttributes.hodinovka);
                zamestnanci[z].setAttr("denná mzda", employeeAttributes.dennaMzda);

                // výpočet dennej mzdy zamestnanca (základná mzda + zadané príplatky)
                // let dennaMzda = (pracovnaDoba * (hodinovka
                //     + zamestnanci[z].attr("+príplatok (€/h)")))
                //     + zamestnanci[z].attr("+prémia (€)")
                //     - zamestnanci[z].attr("-pokuta (€)");

                // pripočítanie do celkových hodnôt záznamu
                totals.mzdy += employeeAttributes.dennaMzda;
                totals.odpracovane += employeeAttributes.odpracovane;

                // generovanie záväzkov za mzdy
                if (!zavazky) {
                    message("Registrujem záväzky");
                    // ak sú staré záväzky, najprv vymaž
                    let stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka");
                    if(stareZavazky !== undefined || stareZavazky.length > 0){
                        message("Hľadám staré záväzky zamestnanca " + zamestnanci[z].name)
                        let filtered = stareZavazky.filter(el => el.field("Zamestnanec")[0].name == zamestnanci[z].name)
                        message("mažem..." + filtered.length + " záznamov")
                        filtered.forEach(el => {
                            el.trash()
                        });
                    stareZavazky = null;
                    }
                    // vygeneruj nové záväzky
                    message('Generujem nový záväzok zamestnanca ' + zamestnanci[z].name)
                    let zavazok = newEntryZavazky(zamestnanci[z], en, dennaMzda, app.runningScript);
                };
                //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
                if (evidenciaPrac !== undefined || evidenciaPrac.length > 0) {
                    if (app.log) {message("...prepočítavam evidenciu prác")}
                    for (let ep = 0; ep < evidenciaPrac.length; ep++) {
                        let zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                        let naZakazke = evidenciaPrac[ep].field("Pracovná doba");
                        for (let znz in zamNaZakazke) {
                            if (zamestnanci[z].field(NICK) == zamNaZakazke[znz].field(NICK)) {
                                totals.evidencia += naZakazke;
                            }
                        }
                    }
                }
            }
        };
        totals.prestoje = totals.odpracovane - totals.evidencia;
        // TODO zaevidovať prestoje do databázy zákaziek na zákazku Krajinka
        en.set("Mzdové náklady", totals.mzdy.toFixed(2));
        en.set("Pracovná doba", totals.odpracovane.toFixed(2));
        en.set("Odpracované", totals.odpracovane.toFixed(2));
        en.set("Na zákazkách", totals.evidencia.toFixed(2));
        en.set("Prestoje", totals.prestoje.toFixed(2));
        if (totals.evidencia == totals.odpracovane) {
           // en.set("appMsg", 'vyžaduje pozornosť');
          //  en.set("appMsg2", 'Nie sú zaevidované žiadne práce na zákazkách\nZaeviduj práce a daj prepočítať záznam.\nZvyšný čas bude priradený na zákazku KRAJINKA - prestoje');
        }
        if (app.log) {message("...hotovo")};
        ////nullAppScripts();
    } catch (error) {
        message(error);
    }
}
// ZAMESTNANCI
function sadzbaZamestnanca(employee, date){
    // vyhľadá aktuálnu sadzbu zamestnanca k dátum "date", v poli "dateField"
    // v databáze "LIB_SZ - sadzby zamestnancov"
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        const links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        const dateField ="Platnosť od";
        let sadzba = 0;
        filteredLinks = filterByDate(links, date, dateField);
        if (filteredLinks == undefined || filteredLinks.length < 0) {
            msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu';
        } else {
            sadzba = filteredLinks[0].field("Sadzba");
        }
        return sadzba;
    } catch (error) {
        message(error);
    }
}
function genDochadzkaZavazky(en, initScript){
    //setAppScripts('genDochadzkaZavazky()', 'calc.js', initScript);
    try {
        if (app.log) {message("...generujem záväzky")};

        // ak sú staré záväzky, najprv vymaž
        const stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka");
        // if(stareZavazky.length > 0){
        //     message("Mažem súvisiace záväzky...")
        //     for (let i in stareZavazky) {
        //         removeEntry(stareZavazky[i], LIB_ZVK, scr.name)
        //     }
        // stareZavazky = false
        // }

        // vygeneruj nové záväzky

        const zamestnanci = en.field("Zamestnanci");
        for (let z in zamestnanci) {
            if (z == 0 ) {message("Generujem záväzky......")} // this message only once
                newEntryZavazky(zamestnanci[z], en, zamestnanci[z].attr("denná mzda"));
        };
        //nullAppScripts();
    } catch (error) {
        message(error);
    }
}
function newEntryZavazky(employee, en, sum, initScript) {
    //setAppScripts('newEntryZavazky()', 'calc.js', initScript);
    try {
        get.openLib(app.runningScript, LIB_ZVK); // inicializácia app knižnicou záväzky
        const popis = "Mzda " + employee.name +", za deň "; // TODO: pridať a upraviť formát dátumu
        const zavazky = libByName(LIB_ZVK);
        // vytvorenie nového záznamu
        const newEntry = new Object();
        newEntry[NUMBER] = app.activeLib.number;
        newEntry[NUMBER_ENTRY] = app.activeLib.nextNum;
        newEntry[DATE] =  new Date();
        // TODO: zmeniť aj pre iných veriteľov ako zamestnanci
        newEntry["Typ"] = "Mzdy";
        newEntry["Zamestnanec"] = employee;
        newEntry["Dochádzka"] = en;
        newEntry["info"] = "generované automaticky z dochádzky";
        //
        newEntry["Popis"] = popis;
        newEntry["Suma"] = sum.toFixed(2);
        newEntry[SEASON]= app.season;
        newEntry[CR] = user();
        newEntry[CR_DATE] = new Date();
        zavazky.create(newEntry);
        app.activeLib.lastNum = app.activeLib.nextNum;
        app.activeLib.nextNum = (app.activeLib.nextNum) + 1;
        set.storeDb(app.runningScript);
        return true;
        // kontrola vytvorenia záznamu
    } catch (error) {
        message(error);
    }
}
function newEntryAttendance(employee, en ){
    const attendance = libByName('attendance')
    const newEntry = new Object();
    newEntry['Attendance'] = en;
    newEntry['Employee'] = employee;
    newEntry[DATE] = en.field(DATE);
    newEntry['nick'] = employee.field('nick');
    newEntry['check_in'] = en.field('Príchod');
    newEntry['check_out'] = en.field('Odchod');
    newEntry['hourly_rate'] = employee.attr('sadzba');
    newEntry['hours_worked'] = employee.attr('odpracované');
    newEntry['wage_ammount'] = employee.attr('denná mzda');
    attendance.create(newEntry);
}

const zavazky = {
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
    // GETTERS
    get:{
        db(){
            const dbLib = dbEntry.field("Databázy").filter(en => en.field("Názov") == app.activeLib.name)

        }
    }
}


// TRIGGERS
// TRIGGERS
const libOpen = (initScript) => {
    // trigger lib_open
    //setAppScripts('libOpen()', 'triggers.js', initScript)
    set.app(app.runningScript)
    try {
        message(app.data.name + ' v.' + app.data.version +
        '\n' +  app.activeLib.name +' ' +  app.season )
        //nullAppScripts()
    } catch (error) {
        message(error)
    }
}
function newEntry (en) {
    ////setAppScripts('newEntry()', 'triggers.js', initScript);
    get.openLib(app.runningScript);
    try {
        //dialog("Nový záznam >> " + app.activeLib.name);
        en.set(VIEW, VIEW_EDIT);
        en.set(DATE, new Date());
        en.set(CR, user());
        en.set(CR_DATE, new Date());
       // en.set(NUMBER, app.activeLib.number);
       // en.set(NUMBER_ENTRY, app.activeLib.nextNum);
        en.set(SEASON, app.season);
        // code here
        //nullAppScripts();
    } catch (error) {
        message('Chyba: ' + error);
    }
}

function newEntryBeforeSave (en, initScript) {
    //setAppScripts('newEntryBeforeSave()', 'triggers.js', initScript);
    try {
        app.activeLib.lastNum = app.activeLib.nextNum;
        app.activeLib.nextNum = Number(app.activeLib.nextNum) + 1;
        en.set(VIEW, VIEW_PRINT)
        //nullAppScripts();
    } catch (error) {
        message(error);
    }
}

function newEntryAfterSave(en, initScript){
    //setAppScripts('newEntryAfterSave()', 'triggers.js', initScript);
    try {
        const entryCreated = app.activeLib.lib.entries()[0]
        if (entryCreated.field(NUMBER_ENTRY) === app.activeLib.nextNum) {
        if(app.log) { message("Záznam vytvorený: " + entryCreated.field(NUMBER_ENTRY) + '/' + en.field(NUMBER_ENTRY) + '/' + app.activeLib.nextNum)}
            switch (app.activeLib.name) {
                case "Dochádzka":
                    prepocitatZaznamDochadzky(entryCreated, app.runningScript);
                    break;
                case "Evidencia prác":
                    break;
                case "Pokladňa":
                    break;
                case "Kniha jázd":
                    break;
                default:
                    break;
            };

        if(app.log) { message("Ukladám čísla: " + app.activeLib.lastNum + '/' +app.activeLib.nextNum)}
        set.storeDb(app.runningScript)
        en.set(VIEW, VIEW_PRINT);
        } else {
            if(app.log) {message('Záznam nebol vytvorený')}
            en.set(VIEW, VIEW_DEBUG);
        }

        // if (app.log) {message("...after save")}
        // const createdEntry = lib().entries()[0]
        // if (app.log) {message("...entry number: " + createdEntry.field(NUMBER_ENTRY) )}
        // if (app.log) {message("...app.activeLib.nextNum: " + Number(app.activeLib.nextNum) )}
        // if (createdEntry.field(NUMBER_ENTRY) == Number(app.activeLib.nextNum)) {
        //     if (app.log) {message("...entry successfully created")}
        //     set.number()

        // }
        //nullAppScripts()
    } catch (error) {
        message(error);
    }
}

function removeEntryBefore(en, initScript) {
   //setAppScripts('removeEntryBefore()', 'triggers.js', initScript);
    get.openLib(app.runningScript); //TODO: asi musí byt inicializované po každom novom načítaní knižnice app.js do trigger scriptu
    try {
        const rmNum  = [];
        if (app.log) {message("BF...removing entry: " + en.field(NUMBER_ENTRY))}
        rmNum.push(en.field(NUMBER_ENTRY));
        if (app.log) {message("BF...removedNums: " + rmNum)};
        switch (app.activeLib.name) {
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
        };
        //nullAppScripts();
    } catch (error) {
        message(error);
    }
}
function removeEntryAfter(en, initScript) {
    //setAppScripts('removeEntryAfter()', 'triggers.js', initScript);
    get.openLib(app.runningScript); //TODO: asi musí byt inicializované po každom novom načítaní knižnice app.js do trigger scriptu
    try {
        //if (app.log) {message("AF...removing entry: " + en.field(NUMBER_ENTRY))}
        switch (app.activeLib.name) {
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
        };
        //nullAppScripts();
    } catch (error) {
        message(error);
    }
}


// HELPERS
// DATE TIME FUNCTONS
//
const dateDiff = (date1, date2) => {
    var diff = {}// Initialization of the return
    var tmp = date2 - date1

    tmp = Math.floor(tmp/1000)// Number of seconds between the 2 dates
    diff.sec = tmp % 60
    //Extracting the number of seconds

    tmp = Math.floor((tmp-diff.sec)/60)// Number of minutes (whole part)
    diff.min = tmp % 60
    // Extract the number of minutes

    tmp = Math.floor((tmp-diff.min)/60)// Number of hours (whole)
    diff.hour = tmp % 24
    // Extract the number of hours

    tmp = Math.floor((tmp-diff.hour)/24)

    // Nombre de jours restants
    diff.day = tmp % 7

    tmp = Math.floor((tmp-diff.day)/7)
    diff.week = tmp % 4

    tmp = Math.floor((tmp-diff.week)/4)
    diff.mon = tmp % 12

    tmp = Math.floor((tmp-diff.mon)/12)
    diff.year = tmp

    return diff
}
const roundTimeQ = time => {
    // zaokrúhľovanie času na 1/4 hodiny
    var timeToReturn = new Date(time)
    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000)
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60)
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15)
    return timeToReturn
}

// NUMBER FUNCTIONS
//
const pad = (number, length) => {
    // pridá počet núl k čislu do zadanej dĺžky
    let str = '' + number
    while (str.length < length) {
        str = '0' + str
    }
    return str
}

// ARRAY FUNCTIONS
const filterByDate = (entries, maxDate, dateField, initScript) => {
    //odfiltruje záznamy s vyšším dátumom ako maxDate v poli datefield
    //setAppScripts('filterByDate()', 'helpers.js', initScript)
    try {
        const filtered = []
        for(let i in entries) {
            if(Number(entries[i].field(dateField).getTime()/1000) <= Number(maxDate.getTime()/1000)) {
                filtered.push(entries[i])
            }
        }
        filtered.sort((entryA, entryB) => (entryA.field(dateField).getTime()/1000) - (entryB.field(dateField).getTime()/1000))
        filtered.reverse()
        //nullAppScripts()
        return filtered
    } catch (error) {
        message(error)
    }
}

// CONSTANS
// libraries
// APP
const LIBAPP = "ASISTANTO"
const LIBAPP_DB = "ASISTANTO DB"
const LIBAPP_ERROR = "ASISTANTO Errors"
const LIBAPP_TENATNS = "ASISTANTO Tenants"
const LIBAPP_SCRIPTS = "ASISTANTO Scripts"
const LIBAPP_TODO = "ASISTANTO ToDo"

// PROJEKTY
const LIB_CPN = "Cenové ponuky"
const LIB_ZKZ = "Zákazky"
const LIB_VYC = "Vyúčtovania"
const LIB_CPR = "Cenník prác"
const LIB_PP = "Plán prác"
const LIB_VP = "Výkaz prác"
const LIB_VM = "Výkaz materiálu"
const LIB_VS = "Výkaz strojov"
const LIB_VD = "Výkaz dopravy"
const LIB_SD = "Stavebný denník"

// ADMINISTRATÍVA
const LIB_INV = "Invenúry"
const LIB_PRJ = "Príjemky"
const LIB_REZ = "Rezervácie"
const LIB_OBJ = "Objednávky"
const LIB_FP = "Faktúry prijaté"
const LIB_FO = "Faktúry odoslané"
const LIB_POH = "Pohľadávky"
const LIB_ZVK = "Záväzky"

// EVIDENCIA
const LIB_PKL = "Pokladňa"
const LIB_EP = "Evidencia prác"
const LIB_DOCH = "Dochádzka"
const LIB_KJ = "Kniha jázd"

// DATABÁZY
const LIB_SKL = "Sklad"
const LIB_ESKL = "Externý sklad"
const LIB_ZVKM = "Zamestnanci"
const LIB_KLI = "Klienti"
const LIB_DOD = "Dodávatelia"
const LIB_PAR = "Partneri"
const LIB_MIE = "Miesta"
const LIB_DR = "Databáza rastlín"
const LIB_UCT = "Účty"
const LIB_SZ = "sadzby zamestnancov"
const LIB_LPH = "limity pracovných hodín"
const LIB_SCPS = "sezónne ceny prác a strojov"
const LIB_SCM = "sezónne ceny materiálu"
const LIB_STR = "Stroje"

// aGroup
const DBA_OBL = "aZáväzky"
const DBA_SAL= "aMzdy"
const DBA_POHLADAVKY = "aPohľadávky"
const DBA_DOCHADZKA = "aDochádzka"
const DBA_WORK = "aPráce"

// fields
// spolocne
const FLD_CPN = "Cenová ponuka" // link to entry
const FLD_ZKZ = "Zákazka"
const FLD_VYC = "Vyúčtovanie"
const FLD_TV = "Typ výkazu"
const FLD_PPS = "Popis"
const FLD_ZAM = "Zamestnanec"



//
const FLD_PRC = "Práce"
const FLD_MAT = "Materiál"
const FLD_STR = "Stroje"
const FLD_DPR = "Doprava"
// diely polozky
const FLD_TRAVNIK = "Trávnik"
const FLD_VYSADBY = "Výsadby"
const FLD_RASTLINY = "Rastliny"
const FLD_ZAVLAZOVANIE = "Zavlažovanie"
const FLD_JAZIERKO = "Jazierko"
const FLD_KAMEN = "Kameň"
const FLD_NESTANDARDNE = "Neštandardné"
const FLD_SUBDODAVKY = "Subdodávky"
// diely hzs
const FLD_ZAHRADNICKE_PRACE = "Záhradnícke práce"
const FLD_SERVIS_ZAVLAZOVANIA = "Servis zavlažovania"
const FLD_KONZULTACIE = "Konzultácie a poradenstvo"
const FLD_PRC_NAVYSE = "Práce navyše"
// zamestnanci
const FLD_ZAMESTNANCI = "Zamestnanci"
const FLD_HZS = "Hodinovka"
// zakazky
const FLD_UCTOVANIE_DPH = "Účtovanie DPH"

// words
const W_ZAKAZKA = "Zákazka"
const W_PRACE = "Práce"
const W_PRACE_NAVYSE = "Práce navyše"
const W_DOPRAVA = "Doprava"
const W_MATERIAL = "Materiál"
const W_STROJE = "Stroje"
const W_HODINOVKA = "Hodinovka"
const W_POLOZKY = "Položky"

// Knižnica Faktúry prijaté
// LIB_FP
const FO_DOD = "Dodávateľ"
const FO_DOD_NUMBER = "Číslo faktúry"
const FO_DOD_VS = "VS" // variabilný symbol
const FO_DATE = "Dátum vystavenia"
const FO_DUE_DATE = "Dátum splatnosti"
const FO_PAY_DATE = "Dátum úhrady"
const FO_SUM = "Suma bez DPH"
const FO_SUM_DPH = "DPH"
const FO_SUM_TOTAL = "Suma s DPH"
const FO_PAYED = "Uhradená"

// aZáväzky
const A_OBL_TYPE = "Typ záväzku"
const A_OBL_SUM = "Suma"
const A_OBL_DUE_DATE = "Dátum splatnosti"
const A_OBL_PAY_DATE = "Dátum úhrady"
const A_OBL_INVC = "Faktúry prijaté"
const A_OBL_PAYED = "Uhradené"

// Príjemky
// LIB_PRM
const RCPTS_INVC = "Faktúry prijaté"
// aMzdy

// Pokladňa/bi
// LIB_PKL
// Polia
const POK_POHYB = "Pohyb" //Select
const POK_U_PREVOD = "Účel prevodu" //Select
const POK_DOKLAD = "Doklad" //Multiple choice
const POK_S_DPH = "s DPH" //Checklist
const POK_SADZBA_DPH = "sadzba DPH" //Real Number
const POK_ = "%DPH" //Real number


// Dochádzka/Attendance
// LIB_ATTDC
const DOCH_ARRIVAL = "Príchod"
const DOCH_DEPARTURE = "Odchod"
const DOCH_WORKS = "Práce" // Link to Entry
const DOCH_EMPLOYEES = "Zamestnanci"


// SPOLOČNÉ POLIA
const VIEW = "view"
const VIEW_EDIT = "Editácia"
const VIEW_PRINT = "Tlač"
const VIEW_DEBUG = "Debug"
const STATUS = "Stav"
const DATE = "Dátum"
const NUMBER = "Číslo"
const NICK = "Nick"
const DBG = "debug"
const SEASON = "sezóna"
const LAST_NUM = "lastnum"
const APP_SEASON = "Sezóna" // linked field
const NUMBER_ENTRY = "number"
const CR = "zapísal"
const CR_DATE = "dátum zápisu"
const MOD = "upravil"
const MOD_DATE = "dátum úpravy"
const ENT_COLOR = "farba záznamu"
const BKG_COLOR = "farba pozadia"

// COLOR CODES
const FIREBRICK = "#B22222"
const CHARTREUSE = "#7FFF00"
const MEDIUMAQUAMARINE = "#66CDAA"
// GRAY
const MARENGO = "#4C5866"
const MEDIUM_GRAY = "#BEBEBE"
const NICKEL = "#727472"
const STONE_GRAY  = "#928E85"
const OUTER_SPACE = "#414A4C"
// WHITE
const PORCELAIN = "#FFFEFC"
const WHITE = "#FFFFFF"
const CHIFFON = "#FBFAF2"
const BONE = "#E7DECC"
const ACOUSTIC_WHITE = "#EFECE1"
const AIRCRAFT_WHITE = "#EDF2F8"
const CERAMIC = "#FCFFF9"
const BRIGHT_WHITE = "#F4F5F0"
const BRILLIANT_WHITE = "#EDF1FE"




// MEMENTO COLORS
const MEM_RED = "#B22222"
const MEM_GREEN = "#669966"
const MEM_BLUE = "#4D66CC"
const MEM_LIGHT_GREEN = "#CCFFCC"
const MEM_LIGHT_YELLOW = "#FFFFCC"
const MEM_LIGHT_BLUE = "#CCFFFF"



