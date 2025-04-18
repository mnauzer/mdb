const app = {
    // app store
    data: {
        name: 'ASISTANTO',
        version: '2.04.0061',
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
    openLib(libName){  //parametre sú pre generátor chýb -- debug
        try {
            if(libName){
                set.storeLib(); // keď je otvorená sekundárna knižnica ulož premenné
            }
            get.library(libName);
            get.season();
            let dbEntry = libByName(app.data.app).find(app.season)[0]; // TS: ibByName() je Memento funkcia
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
            set.storeLib()
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    numbe(){
        // vyskladaj nové číslo záznamu
        //setAppScripts('get.number()', 'app.js' );
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
    sadzbyDP(){
        // nájdi sadzby DPH pre sezónu
        //setAppScripts('sadzbyDPH()', 'app.js' )
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
    app(){
        //setAppScripts('set.app()', 'app.js' )
        try {
            this.storeLib(app.runningScript)
            //nullAppScripts()
        } catch (error) {
            message(error)
        }
    },
    storeLib(){
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
    number(){
        try {
            const lastNum = app.activeLib.nextNum;
            const nextNum = (Number(app.activeLib.nextNum) + 1);
            message('setting number ' + lastNum + '/' + nextNum + ' v activeLib.' + app.activeLib.name);
            app.activeLib.db.setAttr('posledné číslo', lastNum);
            app.activeLib.db.setAttr('nasledujúce číslo', nextNum );
            this.storeLib();
            get.openLib();
        } catch (error) {
            message('Chyba: ' + error + ', line:' + error.lineNumber);
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
            const links = employee.linksFrom(LIBRARY.SZ, FLD_ZAM);
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
function validateAndRoundTime( time) {
    date =  entry().field(DATE);
    if (!time) {
        message('Missing time value');
        exit();
    }
   // time = kombinujDatumACas(date, time);
    return roundTimeQ(time);
}

function calculateWorkHours(start, end) {
    return (end - start) / 3600000;
}

function calculateTimeFromString(string) {
    const [hours, minutes] = string.split(":").map(Number);

    // Vytvoríme nový Date objekt pre 1. januára 1970 00:00:00 UTC
    const time = new Date(0); // Alebo new Date(1970, 0, 1, 0, 0, 0);

    // Nastavíme hodiny a minúty
    time.setHours(hours);
    time.setMinutes(minutes);
    time.setSeconds(0);
    time.setMilliseconds(0);

    const stringInMillis = time.getTime();
    return stringInMillis;
}
function calculateWorkHoursFromField() {
    const startTimeString = "07:30";
    const [hours, minutes] = startTimeString.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours);
    startDate.setMinutes(minutes);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const startTimeInMillis = startDate.getTime();
    return startTimeInMillis; // Vráti čas v milisekundách od 1. januára 1970
}
function vypisCelyDatumovyUdaj(nazovDatumovehoPola) {
    var datumovyUdaj = entry().field(nazovDatumovehoPola);
}
function registrujZavazky(employee, en, attr, isEdit){
    message("Registrujem záväzky");
    // ak sú staré záväzky, najprv vymaž
    if(isEdit){
        let zavazky = en.linksFrom(LIBRARY.ZVK, app.activeLib.db.title);
        let filtered = [];
       // message('stare zavazky: ' + zavazky.length + ' -> mažem...')
        message("Hľadám existujúce záväzky k tomuto záznamu pre zamestnanca " + employee.name)
        filtered = zavazky.filter(el => el.field("Zamestnanec")[0].name == employee.name)
        message("Nájdené... " + filtered.length+ "...mažem...");
        zavazky.forEach(el => {
            el.trash()
        });
        //zavazky.length = 0;
    }
    newEntryZavazky(employee, en, attr);
    }
const getTime = (date) => {
    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
};
function setEmployeeAtrributes(employee, employeeAttributes){
    try {
    message("sadzba " + employee.field("nick") + " je " + employeeAttributes.hodinovka);
    employee.setAttr("odpracované", employeeAttributes.odpracovane);
    employee.setAttr("hodinovka", employeeAttributes.hodinovka);
    employee.setAttr("denná mzda", employeeAttributes.dennaMzda);
    } catch (error) {
        message('Chyba: '+ error + ', line: ' + error.lineNumber);
    };
};
function prepocitatZaznamDochadzky(en, isEdit){
   // //setAppScripts('prepocitatZaznamDochadzky()', 'calc.js' );
    try {
        en = en || lib().entry();
        const datum = en.field(DATE);
        const zavazky = en.field("Generovať záväzky");
        const zamestnanci = en.field("Zamestnanci");
        const evidenciaPrac = en.field("Práce");
        const totals = {
            mzdy: 0,
            odpracovane: 0,
            evidencia: 0,
            prestoje: 0,
            pracovnaDoba: 0
        };

        // Function to extract time from a Date object

        // Validate and process time entries
        const prichod = validateAndRoundTime(en.field("Príchod"));
        const odchod = validateAndRoundTime(en.field("Odchod"));

        if (!prichod || !odchod || getTime(prichod) >= getTime(odchod)) {
            message('Invalid arrival/departure times, Príchod: ' + prichod + ', Odchod: ' + odchod);
            exit();
        } else {
            en.set("Príchod", prichod); // uloženie upravených časov
            en.set("Odchod", odchod);
        }
        const employeeAtt = {
                    odpracovane: 0,
                    hodinovka: 0, // prepisovať zadanú hodinovku0,
                    dennaMzda: 0

                };

        // výpočet pracovnej doby
        totals.pracovnaDoba = calculateWorkHours(prichod, odchod);
        // prepočet zamestnancov
        if (zamestnanci.length > 0) {
            for (let z = 0; z < zamestnanci.length; z++ ) {
                // vyhľadanie aktuálnej sadzby zamestnanca
                //const hodinovka = sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript); // prepisovať zadanú hodinovku
                employeeAtt.hodinovka = employees.sadzba(zamestnanci[z], datum), // prepisovať zadanú hodinovku0,
                employeeAtt.odpracovane = totals.pracovnaDoba,
                employeeAtt.dennaMzda = employeeAtt.odpracovane * (employeeAtt.hodinovka
                    + zamestnanci[z].attr("+príplatok (€/h)"))
                    + zamestnanci[z].attr("+prémia (€)")
                    - zamestnanci[z].attr("-pokuta (€)")

                setEmployeeAtrributes(zamestnanci[z], employeeAtt);
                // pripočítanie do celkových hodnôt záznamu
                totals.mzdy += employeeAtt.dennaMzda;
                totals.odpracovane += employeeAtt.odpracovane;
                if(zavazky){
                    registrujZavazky(zamestnanci[z], en, employeeAtt, isEdit);
                }
            }
        }
        //  generovanie záväzkov za mzdy
        totals.prestoje = totals.odpracovane - totals.evidencia;
        // TODO zaevidovať prestoje do databázy zákaziek na zákazku Krajinka
        en.set("Mzdové náklady", totals.mzdy.toFixed(2));
        en.set("Pracovná doba", totals.pracovnaDoba.toFixed(2));
        en.set("Odpracované", totals.odpracovane.toFixed(2));
        en.set("Na zákazkách", totals.evidencia.toFixed(2));
        en.set("Prestoje", totals.prestoje.toFixed(2));
        if (totals.evidencia > totals.odpracovane) {
            en.set("appMsg", 'vyžaduje pozornosť');
        // en.set("appMsg2", 'Nie sú zaevidované žiadne práce na zákazkách\nZaeviduj práce a daj prepočítať záznam.\nZvyšný čas bude priradený na zákazku KRAJINKA - prestoje');
        }
        if (app.log) {message("...hotovo")};
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
// ZAMESTNANCI
function sadzbaZamestnanca(employee, date){
    // vyhľadá aktuálnu sadzbu zamestnanca k dátum "date", v poli "dateField"
    // v databáze "LIB_SZ - sadzby zamestnancov"
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        const links = employee.linksFrom(LIBRARY.SZ, FLD_ZAM);
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
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function genDochadzkaZavazky(en ){
    //setAppScripts('genDochadzkaZavazky()', 'calc.js' );
    try {
        if (app.log) {message("...generujem záväzky")};

        // ak sú staré záväzky, najprv vymaž
        const stareZavazky = en.linksFrom(LIBRARY.ZVK, "Dochádzka");
        // if(stareZavazky.length > 0){
        //     message("Mažem súvisiace záväzky...")
        //     for (let i in stareZavazky) {
        //         removeEntry(stareZavazky[i], LIBRARY.ZVK, scr.name)
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
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function newEntryZavazky(employee, en, attrs) {
    try {
        get.openLib(LIBRARY.ZVK); // inicializácia app knižnicou záväzky
        const popis = "Mzda " + employee.name +", za deň "; // TODO: pridať a upraviť formát dátumu
        const zavazky = libByName(LIBRARY.ZVK);
        // vytvorenie nového záznamu
        const newEntry = new Object();
        newEntry[NUMBER] = app.activeLib.number; //TODO toto opraviť
        newEntry[NUMBER_ENTRY] = app.activeLib.nextNum;
        newEntry[DATE] =  new Date();
        // TODO: zmeniť aj pre iných veriteľov ako zamestnanci
        newEntry["Typ"] = "Mzdy";
        newEntry["Zamestnanec"] = employee;
        newEntry["Dochádzka"] = en;
        newEntry["info"] = "generované automaticky z dochádzky";
        //
        newEntry["Popis"] = popis;
        newEntry["Suma"] = attrs.dennaMzda.toFixed(2);
        newEntry[SEASON]= app.season;
        newEntry[CR] = user();
        newEntry[CR_DATE] = new Date();
        zavazky.create(newEntry);
        app.activeLib.lastNum = app.activeLib.nextNum;
        app.activeLib.nextNum = (app.activeLib.nextNum) + 1;
        set.storeLib();
        return true;
        // kontrola vytvorenia záznamu
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
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
const libOpen = () => {
    // trigger lib_open
    try {
        message(app.data.name + ' v.' + app.data.version +
        '\n' +  app.activeLib.name +' ' +  app.season )
        //nullAppScripts()
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
// NEW ENTRY TRIGGERS
function newEntry () {
    //get.openLib(app.runningScript);
    get.openLib();
    message('Knižnica: ' + app.activeLib.name + ' /' + app.data.version + '/ ' + app.season + ' / ' + app.activeLib.nextNum);
    let en = entryDefault();
    try {
        //buildDefaultEntry().set("Príchod", calculateTimeFromString('7:30'));
        en.set(VIEW, VIEW_EDIT);
        en.set('Príchod', calculateTimeFromString('7:30') );
        en.set('Odchod', calculateTimeFromString('14:30') );
        en.set(DATE, new Date());
        en.set(CR, user());
        en.set(CR_DATE, new Date());
        en.set(SEASON, app.season);
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function newEntryOpen() {
    get.openLib();
    message('Knižnica: ' + app.activeLib.name + ' /' + app.data.version + '/ ' + app.season + ' / ' + app.activeLib.nextNum);
    let en = entryDefault();
    try {
        en.set(VIEW, VIEW_EDIT);
        en.set(DATE, new Date());
        en.set(CR, user());
        en.set(CR_DATE, new Date());
        en.set(SEASON, app.season);
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function newEntryBeforeSave() {
    let en = entryDefault();
    try {
        app.activeLib.lastNum = app.activeLib.nextNum;
        app.activeLib.nextNum = Number(app.activeLib.nextNum) + 1;
        en.set(VIEW, VIEW_PRINT)
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function newEntryAfterSave(){
    let en = lib().lastEntry();
    try {
        prepocitatZaznamDochadzky(en, false);
        en.set(VIEW, VIEW_PRINT)
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
// UPDATE ENTRY TRIGGERS
function updateEntryOpen(){
    get.openLib();
    let en = entry();
    try {
        en.set(VIEW, VIEW_EDIT)
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function updateEntryBeforeSave(){
    let en = entry();
    try {
        en.set(VIEW, VIEW_PRINT)
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function updateEntryAfterSave(){
    let en = entry();
    try {
        prepocitatZaznamDochadzky(en, true);
        en.set(VIEW, VIEW_PRINT)
    } catch (error) {
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}

// DELETE ENTRY TRIGGERS
function removeEntryBefore(en) {
   //setAppScripts('removeEntryBefore()', 'triggers.js');
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
        message('Chyba: ' + error + ', line:' + error.lineNumber);
    }
}
function removeEntryAfter(en) {
    //setAppScripts('removeEntryAfter()', 'triggers.js');
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
        message('Chyba: ' + error + ', line:' + error.lineNumber);
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
const filterByDate = (entries, maxDate, dateField) => {
    //odfiltruje záznamy s vyšším dátumom ako maxDate v poli datefield
    //setAppScripts('filterByDate()', 'helpers.js')
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
const LIBRARY = {
    // PROJEKTY
    CPN: "Cenové ponuky",
    ZKZ: "Zákazky",
    VYC: "Vyúčtovania",
    CPR: "Cenník prác",
    PP: "Plán prác",
    VP: "Výkaz prác",
    VM: "Výkaz materiálu",
    VS: "Výkaz strojov",
    VD: "Výkaz dopravy",
    SD: "Stavebný denník",
    //
    INV: "Invenúry",
    PRJ: "Príjemky",
    REZ: "Rezervácie",
    OBJ: "Objednávky",
    FP: "Faktúry prijaté",
    FO: "Faktúry odoslané",
    POH: "Pohľadávky",
    ZVK: "Záväzky",
    // EVIDENCIA
    PKL:  "Pokladňa",
    EP: "Evidencia prác",
    DOCH: "Dochádzka",
    KJ: "Kniha jázd",

    // DATABÁZY
    SKL:  "Sklad",
    ESKL: "Externý sklad",
    ZVKM: "Zamestnanci",
    KLI:  "Klienti",
    DOD:  "Dodávatelia",
    PAR:  "Partneri",
    MIE:  "Miesta",
    DR: "Databáza rastlín",
    UCT:  "Účty",
    SZ: "sadzby zamestnancov",
    LPH:  "limity pracovných hodín",
    SCPS: "sezónne ceny prác a strojov",
    SCM:  "sezónne ceny materiálu",
    STR:  "Stroje"


}

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



