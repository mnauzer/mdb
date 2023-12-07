const app = {
    // app store
    data: {
        name: 'ASISTANTO',
        version: '1.03.0017',
        app: 'ASISTANTO',
        db: 'ASISTANTO DB',
        errors: 'ASISTANTO Errors',
        tenants: 'ASISTANTO Tenants',
        scripts: 'ASISTANTO Scripts',
        todo: 'ASISTANTO ToDo',
        tenant: 'KRAJINKA'
    },
    msg: null,
    runningScript: null,
    libFile: 'app.js',
    initScript: null,
    openLib: { // ASISTANTO nastavenie knižnice podľa sezóny
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
// GETTERS
const get = {
    // app getters
    library(libName){
        app.openLib.lib = lib()
        app.openLib.name = libName || lib().title
        app.openLib.entries = lib().entries()
        app.openLib.en = entry()
        app.openLib.enD = entryDefault()
    },
    season(){
        app.season = libByName(app.data.tenants).find(app.data.tenant)[0].field('default season')
        app.log = libByName(app.data.tenants).find(app.data.tenant)[0].field('log')
        app.debug = libByName(app.data.tenants).find(app.data.tenant)[0].field('debug')
    },
    openDb(initScript, libName){
        setAppScripts('get.openDb()', 'app.js', initScript)
        try {
            if(libName){
                set.storeDb(app.runningScript); // keď je otvorená sekundárna knižnica ulož premenné
            }
            get.library(libName);
            get.season();
            const dbEntry = libByName(app.data.app).find(app.season)[0];
            if (dbEntry !== undefined){
                //if (app.log) {message('...openDbSeason: ' + app.season)}
                const dbLib = dbEntry.field('Databázy').filter(en => en.field('Názov') == app.openLib.name);
                if (dbLib !== undefined){
                    app.openLib.db = dbLib[0];
                    app.openLib.ID = app.openLib.db.field('ID');
                    app.openLib.prefix = app.openLib.db.field('Prefix');
                    // entry attributes
                    app.openLib.lastNum = app.openLib.db.attr('posledné číslo');
                    app.openLib.nextNum = app.openLib.db.attr('nasledujúce číslo');
                    app.openLib.reservedNum = app.openLib.db.attr('rezervované číslo');
                    app.openLib.removedNums.concat(app.openLib.db.attr('vymazané čísla'));
                    app.openLib.isPrefix = app.openLib.db.attr('prefix');
                    app.openLib.trim = app.openLib.db.attr('trim');
                    app.openLib.trailingDigit = app.openLib.db.attr('trailing digit');
                    app.openLib.number = this.number(app.runningScript);
                    if (app.log) {message('...openDb: ' + dbEntry.name + ' - ' + app.openLib.db.title)}
                } else {
                    if (app.log) {message('...nie je vytvorený záznam pre knižnicu ' + app.openLib.name + ' v sezóne  ' + app.season)}
                }
            } else {
                if (app.log) {message('...nie je vytvorené záznam pre sezónu ' + app.season)}
            }
            set.storeDb(app.runningScript)
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    number(initScript){
        // vyskladaj nové číslo záznamu
        setAppScripts('get.number()', 'app.js', initScript);
        try {
            // najprv zisti či nie sú vymazané čísla
            if (app.openLib.removedNums > 0){
                if (app.log) {message('...removedNums: ' + app.openLib.removedNums)}
                // použi najprv vymazané čísla
            }
            const newNumber = app.openLib.isPrefix
            ? app.openLib.prefix + app.season.slice(app.openLib.trim) + pad(app.openLib.nextNum, app.openLib.trailingDigit)
            : app.openLib.ID + app.season.slice(app.openLib.trim) + pad(app.openLib.nextNum, app.openLib.trailingDigit);
            app.openLib.number = newNumber;
            if (app.log) {message('Nové číslo: ' + newNumber + ' v knižnici ' + app.openLib.name)}
            nullAppScripts();
            return newNumber
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    sadzbyDPH(initScript){
        // nájdi sadzby DPH pre sezónu
        setAppScripts('sadzbyDPH()', 'app.js', initScript)
        try {
            app.dph.zakladna = libByName(app.data.app).find(app.season)[0].field('Základná sadzba DPH')
            app.dph.znizena = libByName(app.data.app).find(app.season)[0].field('Znížená sadzba DPH')
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
}
// SETTERS
const set = {
    app(initScript){
        setAppScripts('set.app()', 'app.js', initScript)
        try {
            this.storeDb(app.runningScript)
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    storeDb(initScript){
        setAppScripts('set.storeDb()', 'app.js', initScript)
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
            storeDB.set('openLib.name', app.openLib.name)
            storeDB.set('openLib.db.id', app.openLib.db ? app.openLib.db.id : null)
            storeDB.set('openLib.prefix', app.openLib.prefix)
            storeDB.set('openLib.lastNum', app.openLib.lastNum)
            storeDB.set('openLib.nextNum', app.openLib.nextNum)
            storeDB.set('openLib.reservedNum', app.openLib.reservedNum)
            storeDB.set('openLib.removedNums', app.openLib.removedNums)
            storeDB.set('openLib.isPrefix', app.openLib.isPrefix)
            storeDB.set('openLib.trailingDigit', app.openLib.trailingDigit)
            storeDB.set('openLib.trim', app.openLib.trim)
            storeDB.set('openLib.number', app.openLib.number)
            storeDB.set('dph.zakladna', app.dph.zakladna)
            storeDB.set('dph.znizena', app.dph.znizena)
            storeDB.set('en.id', app.en ? app.en.id : null)

            // Store to ASISTANTO open database
            app.openLib.db.setAttr('názov', app.openLib.name)
            app.openLib.db.setAttr('posledné číslo', app.openLib.lastNum)
            app.openLib.db.setAttr('nasledujúce číslo', app.openLib.nextNum)
            app.openLib.db.setAttr('rezervované číslo', app.openLib.reservedNum)
            app.openLib.db.setAttr('vymazané čísla', app.openLib.removedNums)
            app.openLib.db.setAttr('vygenerované číslo', app.openLib.number)
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    season(arg){
        setAppScripts('set.season()', 'app.js')
        try {
            libByName(app.data.tenants).find(app.data.tenant)[0].set('default season', arg)
            get.openDb()
            message('Nastavená sezóna: ' + app.season)
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    log(){
        setAppScripts('set.log()', 'app.js')
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
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    debug(){
        setAppScripts('set.debug()', 'app.js')
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
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    numberPrefix(){
        setAppScripts('set.numberPrefix()', 'app.js', initScript)
        const current = app.openLib.isPrefix
        try {
            app.openLib.db.setAttr('prefix', !current)
            initApp()
            if (app.log) {
                message('prefix čísla zapnutý')
            } else {
                message('prefix čísla vypnutý')
            }
            nullAppScripts()
        } catch (error) {
            createErrorEntry(app.runningScript, error)
        }
    },
    number(initScript){
        setAppScripts('set.number()', 'app.js', initScript)
        try {
            const lastNum = app.openLib.nextNum;
            const nextNum = (Number(app.openLib.nextNum) + 1);
            message('setting number ' + lastNum + '/' + nextNum + ' v openLib ' + app.openLib.name);
            app.openLib.db.setAttr('posledné číslo', lastNum);
            app.openLib.db.setAttr('nasledujúce číslo', nextNum );
            this.storeDb(app.runningScript);
            get.openDb(app.runningScript);
        } catch (error) {
            createErrorEntry(app.runningScript, error);
        }
    }
}
// MUTATORS
const calc = {
    // app mutators
}

// const initApp = () => {
//     setAppScripts('initApp()', 'app.js')
//     try {
//         get.openDb()
//         //get.openLibName()
//         get.sadzbyDPH()
//         set.storeDb()
//         nullAppScripts()
//     } catch (error) {
//         createErrorEntry(app.runningScript, error)
//     }
// }

// LOG & ERRORS
const logAppVariableStore = (msg) => {
    const storeVariables =
        'name: ' + app.data.name
        +'\nversion: ' + app.data.version
        +'\nseason: ' +  app.season
        +'\nlog: ' +  app.log
        +'\ndebug: ' +  app.debug
        +'\nopenLib.name: ' +  app.openLib.name
        +'\nopenLib.db: ' +  app.openLib.db
        +'\nopenLib.ID: ' +  app.openLib.ID
        +'\nopenLib.prefix: ' +  app.openLib.prefix
        +'\nopenLib.lastNum: ' +  app.openLib.lastNum
        +'\nopenLib.nextNum: ' +  app.openLib.nextNum
        +'\nopenLib.reservedNum: ' +  app.openLib.reservedNum
        +'\nopenLib.removedNums: ' +  app.openLib.removedNums
        +'\nopenLib.isPrefix: ' +  app.openLib.isPrefix
        +'\nopenLib.trim: ' +  app.openLib.trim
        +'\nopenLib.trailingDigit: ' +  app.openLib.trailingDigit
        +'\nopenLib.number: ' +  app.openLib.number
        +'\nopenLib.lib: ' +  app.openLib.lib
        +'\nopenLib.en: ' +  app.openLib.en
        +'\nopenLib.entries: ' +  app.openLib.entries.length
        +'\nopenLib.enD: ' +  app.openLib.enD
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
        newLog['memento library'] = app.openLib.name
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
        newMsg['memento library'] = app.openLib.name
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
        newError['memento library'] = app.openLib.name
        newError['library'] = app.libFile
        newError['script'] = app.runningScript
        newError['text'] = error
        newError['line'] = error.lineNumber
        newError['variables'] = logAppVariableStore(msg)
        newError['note'] = 'generované scriptom createErrorEntry'
        errorLib.create(newError)
        nullAppScripts()
}
const nullAppScripts = () => {
        app.runningScript = null
        app.libFile = null
        app.initScript = null
}
const setAppScripts = (scriptName, libFile, initScript) => {
        app.runningScript = scriptName
        app.libFile = libFile
        app.initScript = initScript || null
        const msg = initScript + '>>' + app.runningScript
        if (app.debug) {
            message(msg)
            createLogEntry(msg)
            }

}
const appLogMsg = (message, value, createEntry) => {
    setAppScripts('appLogMsg()', 'app.js')
    try {
        createEntry = createEntry || false
        if (app.log) {message(message + value)}
        if (createEntry) {
            createMsgEntry(message, value )
        }
        nullAppScripts()
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
// CALC
// DOCHÁDZKA
function prepocitatZaznamDochadzky(en, initScript){
    setAppScripts('prepocitatZaznamDochadzky()', 'calc.js', initScript);
    try {
        const datum = en.field(DATE);
        const zavazky = en.field("Generovať záväzky")
        const zamestnanci = en.field("Zamestnanci");
        const evidenciaPrac = en.field("Práce");
        let mzdyCelkom = 0; // mzdy za všetkých zamestnancov v ten deň
        let odpracovaneCelkom = 0; // odpracovane hod za všetkýh zamestnancov
        let evidenciaCelkom = 0; // všetky odpracované hodiny z evidencie prác
        let prestojeCelkom = 0; //TODO: ak sa budú evidovať prestojeCelkom

        // zaokrúhlenie zadaného času na 15min
        const prichod = roundTimeQ(en.field("Príchod")); //zaokrúhlenie času na 15min
        const odchod = roundTimeQ(en.field("Odchod"));
        en.set("Príchod", prichod); //uloženie upravených časov
        en.set("Odchod", odchod);

        // výpočet pracovnej doby
        const pracovnaDoba = (odchod - prichod) / 3600000;

        // prepočet zamestnancov
        if (zamestnanci !== undefined) {
            for (let z = 0; z < zamestnanci.length; z++ ) {
                // vyhľadanie aktuálnej sadzby zamestnanca
                const hodinovka = sadzbaZamestnanca(zamestnanci[z], datum, app.runningScript); // prepisovať zadanú hodinovku
                zamestnanci[z].setAttr("hodinovka", hodinovka);

                // výpočet dennej mzdy zamestnanca (základná mzda + zadané príplatky)
                const dennaMzda = (pracovnaDoba * (hodinovka
                    + zamestnanci[z].attr("+príplatok (€/h)")))
                    + zamestnanci[z].attr("+prémia (€)")
                    - zamestnanci[z].attr("-pokuta (€)");
                zamestnanci[z].setAttr("denná mzda", dennaMzda);

                // pripočítanie do celkových hodnôt záznamu
                mzdyCelkom += dennaMzda;
                odpracovaneCelkom += pracovnaDoba;

                // generovanie záväzkov za mzdy
                if (zavazky) {
                    // ak sú staré záväzky, najprv vymaž
                    const stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka");
                    if(stareZavazky !== undefined){
                        message("Hľadám staré záväzky zamestnanca " + zamestnanci[z].name)
                        const filtered = stareZavazky.filter(el => el.field("Zamestnanec")[0].name == zamestnanci[z].name)
                        message("mažem..." + filtered.length + " záznamov")
                        filtered.forEach(el => {
                            el.trash()
                        });
                    stareZavazky = null
                    }
                    // vygeneruj nové záväzky
                    message('Generujem nový záväzok zamestnanca ' + zamestnanci[z].name)
                    const zavazok = newEntryZavazky(zamestnanci[z], en, dennaMzda, app.runningScript);
                };
                //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
                if (evidenciaPrac !== undefined) {
                    if (app.log) {message("...prepočítavam evidenciu prác")}
                    for (let ep = 0; ep < evidenciaPrac.length; ep++) {
                        const zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                        const naZakazke = evidenciaPrac[ep].field("Pracovná doba");
                        for (let znz in zamNaZakazke) {
                            if (zamestnanci[z].field(NICK) == zamNaZakazke[znz].field(NICK)) {
                                evidenciaCelkom += naZakazke;
                            }
                        }
                    }
                }
            }
        };
        prestojeCelkom = odpracovaneCelkom - evidenciaCelkom;
        // TODO zaevidovať prestoje do databázy zákaziek na zákazku Krajinka
        en.set("Mzdové náklady", mzdyCelkom.toFixed(2));
        en.set("Pracovná doba", pracovnaDoba);
        en.set("Odpracované", odpracovaneCelkom);
        en.set("Na zákazkách", evidenciaCelkom);
        en.set("Prestoje", prestojeCelkom);
        if (prestojeCelkom = odpracovaneCelkom) {
            en.set("appMsg", 'vyžaduje pozornosť');
            en.set("appMsg2", 'Nie sú zaevidované žiadne práce na zákazkách\nZaeviduj práce a daj prepočítať záznam.\nZvyšný čas bude priradený na zákazku KRAJINKA - prestoje');
        }
        if (app.log) {message("...hotovo")};
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}
// ZAMESTNANCI
function sadzbaZamestnanca(employee, date, initScript){
    // vyhľadá aktuálnu sadzbu zamestnanca k dátum "date", v poli "dateField"
    // v databáze "LIB_SZ - sadzby zamestnancov"
    setAppScripts('sadzbaZamestnancab()', 'calc.js', initScript);
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        const links = employee.linksFrom(LIB_SZ, FLD_ZAM);
        const dateField ="Platnosť od";
        let sadzba = 0;
        filteredLinks = filterByDate(links, date, dateField, app.runningScript);
        if (filteredLinks.length < 0) {
            msgTxt = 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu';
        } else {
            sadzba = filteredLinks[0].field("Sadzba");
        }
        nullAppScripts()
        return sadzba;
    } catch (error) {
        createErrorEntry(app.runningScript, error)
    }
}
function genDochadzkaZavazky(en, initScript){
    setAppScripts('genDochadzkaZavazky()', 'calc.js', initScript);
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
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}
function newEntryZavazky(employee, en, sum, initScript) {
    setAppScripts('newEntryZavazky()', 'calc.js', initScript);
    try {
        get.openDb(app.runningScript, LIB_ZVK); // inicializácia app knižnicou záväzky
        const popis = "Mzda " + employee.name +", za deň "; // TODO: pridať a upraviť formát dátumu
        const zavazky = libByName(LIB_ZVK);
        // vytvorenie nového záznamu
        const newEntry = new Object();
        newEntry[NUMBER] = app.openLib.number;
        newEntry[NUMBER_ENTRY] = app.openLib.nextNum;
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
        app.openLib.lastNum = app.openLib.nextNum;
        app.openLib.nextNum = (app.openLib.nextNum)  +1;
        set.storeDb(app.runningScript);
        return true;
        // kontrola vytvorenia záznamu
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
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
            const dbLib = dbEntry.field("Databázy").filter(en => en.field("Názov") == app.openLib.name)

        }
    }
}


// TRIGGERS
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
function newEntry (en, initScript) {
    setAppScripts('newEntry()', 'triggers.js', initScript);
    get.openDb(app.runningScript);
    try {
        message("Nový záznam >> " + app.openLib.name);
        en.set(VIEW, VIEW_EDIT);
        en.set(DATE, new Date());
        en.set(CR, user());
        en.set(CR_DATE, new Date());
        en.set(NUMBER, app.openLib.number);
        en.set(NUMBER_ENTRY, app.openLib.nextNum);
        en.set(SEASON, app.season);
        // code here
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}

function newEntryBeforeSave (en, initScript) {
    setAppScripts('newEntryBeforeSave()', 'triggers.js', initScript);
    try {

        en.set(VIEW, VIEW_PRINT)
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}

function newEntryAfterSave(en, initScript){
    setAppScripts('newEntryAfterSave()', 'triggers.js', initScript);
    try {
        const entryCreated = app.openLib.lib.entries()[0]
        if (entryCreated.field(NUMBER_ENTRY) === app.openLib.nextNum) {
        if(app.log) { message("Záznam vytvorený: " + entryCreated.field(NUMBER_ENTRY) + '/' + en.field(NUMBER_ENTRY) + '/' + app.openLib.nextNum)}
            switch (app.openLib.name) {
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
        app.openLib.lastNum = app.openLib.nextNum;
        app.openLib.nextNum = Number(app.openLib.nextNum) + 1;
        if(app.log) { message("Ukladám čísla: " + app.openLib.lastNum + '/' +app.openLib.nextNum)}
        set.storeDb(app.runningScript)
        en.set(VIEW, VIEW_PRINT);
        } else {
            if(app.log) {message('Záznam nebol vytvorený')}
            en.set(VIEW, VIEW_DEBUG);
        }

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
        createErrorEntry(app.runningScript, error);
    }
}

function removeEntryBefore(en, initScript) {
    setAppScripts('removeEntryBefore()', 'triggers.js', initScript);
    get.openDb(app.runningScript); //TODO: asi musí byt inicializované po každom novom načítaní knižnice app.js do trigger scriptu
    try {
        const rmNum  = [];
        if (app.log) {message("BF...removing entry: " + en.field(NUMBER_ENTRY))}
        rmNum.push(en.field(NUMBER_ENTRY));
        if (app.log) {message("BF...removedNums: " + rmNum)};
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
        };
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}
function removeEntryAfter(en, initScript) {
    setAppScripts('removeEntryAfter()', 'triggers.js', initScript);
    get.openDb(app.runningScript); //TODO: asi musí byt inicializované po každom novom načítaní knižnice app.js do trigger scriptu
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
        };
        nullAppScripts();
    } catch (error) {
        createErrorEntry(app.runningScript, error);
    }
}

const test = () => {
    message('test2')
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
    setAppScripts('filterByDate()', 'helpers.js', initScript)
    try {
        const filtered = []
        for(let i in entries) {
            if(Number(entries[i].field(dateField).getTime()/1000) <= Number(maxDate.getTime()/1000)) {
                filtered.push(entries[i])
            }
        }
        filtered.sort((entryA, entryB) => (entryA.field(dateField).getTime()/1000) - (entryB.field(dateField).getTime()/1000))
        filtered.reverse()
        nullAppScripts()
        return filtered
    } catch (error) {
        createErrorEntry(app.runningScript, error)
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



