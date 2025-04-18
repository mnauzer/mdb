// Refaktorovaný súbor app_v2_1.js s aplikovanými vylepšeniami a zachovaním funkčnosti pôvodného app_v2.js

// Konfigurácia tabuliek, polí a sekcií pre lepšiu údržbu
const CONFIG = {
    data: {
        name: 'ASISTANTO 2',
        version: '2.04.0090',
        app: 'ASISTANTO',
        db: 'ASISTANTO DB',
        errors: 'ASISTANTO Errors',
        tenants: 'ASISTANTO Tenants',
        scripts: 'ASISTANTO Scripts',
        todo: 'ASISTANTO ToDo',
        tenant: 'KRAJINKA'
    },
    libraries: {
        errors: 'ASISTANTO Errors',
        tenants: 'ASISTANTO Tenants',
        app: 'ASISTANTO',
        cpDiely: 'CP Diely',
        cenovePonuky: 'Cenové ponuky v2',
        sklad: 'Sklad',
        cennikPrac: 'Cenník prác',
        zavazky: 'Záväzky',
        employees: 'Zamestnanci',
        attendance: 'Dochádzka'
    },
    sections: {
        material: 'Materiál',
        prace: 'Práce',
        ostatne: 'Ostatné',
        stroje: 'Stroje',
        doprava: 'Doprava'
    },
    fields: {
        cenaCelkom: 'Cena celkom',
        pocetHodin: 'Počítanie hodinových sadzieb',
        zlavaNaSadzby: 'Počítať zľavy na sadzby',
        typCenovejPonuky: 'Typ cenovej ponuky',
        platnostPonuky: 'Platnosť ponuky',
        platnostDo: 'Platnosť do',
        identif: 'Identifikátor',
        popisCenovejPonuky: 'Popis cenovej ponuky',
        dielCenovejPonuky: 'Diel cenovej ponuky',
        miestoRealizacie: 'Miesto realizácie',
        klient: 'Klient',
        uctovanieDopravy: 'Účtovanie dopravy',
        nick: 'Nick',
        lokalita: 'Lokalita'
    },
    colors: {
        firebrick: '#B22222',
        chartreuse: '#7FFF00',
        mediumAquamarine: '#66CDAA',
        marengo: '#4C5866',
        mediumGray: '#BEBEBE',
        nickel: '#727472',
        stoneGray: '#928E85',
        outerSpace: '#414A4C',
        porcelain: '#FFFEFC',
        white: '#FFFFFF',
        chiffon: '#FBFAF2',
        bone: '#E7DECC',
        acousticWhite: '#EFECE1',
        aircraftWhite: '#EDF2F8',
        ceramic: '#FCFFF9',
        brightWhite: '#F4F5F0',
        brilliantWhite: '#EDF1FE'
    }
};

// Globálny stav aplikácie
const app = {
    data: CONFIG.data,
    tenant: {
        name: null,
        street: null,
        city: null,
        psc: null,
        ico: null,
        dic: null,
        platca_dph: null
    },
    msg: null,
    runningScript: null,
    libFile: 'app_v2_1.js',
    activeLib: {
        name: null,
        db: null,
        ID: null,
        prefix: null,
        lastNum: null,
        nextNum: null,
        reservedNum: null,
        removedNums: [],
        isPrefix: null,
        trim: null,
        trailingDigit: null,
        number: null,
        lib: null,
        entries: null,
        en: null,
        enD: null
    },
    season: null,
    log: false,
    debug: false,
    dph: {
        zakladna: null,
        znizena: null
    }
};

// Cache knižníc pre optimalizáciu
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

// Pomocné funkcie pre bezpečný prístup k poliam a nastaveniam
const Helpers = {
    getField(entry, fieldName, defaultValue) {
        if (defaultValue === undefined) {
            defaultValue = null;
        }
        try {
            let val;
            // Použitie get objektu na získanie hodnoty, ak je definovaný
            if (get && typeof get[fieldName] === 'function') {
                val = get[fieldName](entry);
            } else {
                // Fallback na pôvodné volanie
                val = entry.field(fieldName);
            }
            return val !== undefined && val !== null ? val : defaultValue;
        } catch (e) {
            if (app.log) message('Chyba pri čítaní poľa ' + fieldName + ': ' + e);
            Logger.createError(e, 'Helpers.getField()');
            return defaultValue;
        }
    },
    setField(entry, fieldName, value) {
        try {
            // Použitie set objektu na nastavenie hodnoty, ak je definovaný
            if (set && typeof set[fieldName] === 'function') {
                set[fieldName](entry, value);
                return;
            }
            // Fallback na pôvodné volanie
            entry.set(fieldName, value);
        } catch (e) {
            if (app.log) message('Chyba pri zápise poľa ' + fieldName + ': ' + e);
            Logger.createError(e, 'Helpers.setField()');
        }
    },
    roundTimeToQuarter(time) {
        const date = new Date(time);
        date.setMilliseconds(0);
        date.setSeconds(0);
        const minutes = date.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        date.setMinutes(roundedMinutes);
        return date;
    },
    calculateWorkHours(start, end) {
        return (end - start) / 3600000; // milisekundy na hodiny
    },
    padNumber(number, length) {
        let str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    },
    filterByDate(entries, maxDate, dateField) {
        try {
            const filtered = entries.filter(en => {
                const d = en.field(dateField);
                return d && d.getTime() <= maxDate.getTime();
            });
            filtered.sort((a, b) => b.field(dateField).getTime() - a.field(dateField).getTime());
            return filtered;
        } catch (e) {
            if (app.log) message(`Chyba filterByDate: ${e}`);
            return [];
        }
    }
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
                    app.activeLib.number = this.number();
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
            message('Chyba: ' + error + ', line:' + error.lineNumber);
            Logger.createError(error, 'get.openLib()');
        }
    },
    number(){
        // vyskladaj nové číslo záznamu
        //setAppScripts('get.number()', 'app.js' );
        try {
            // najprv zisti či nie sú vymazané čísla
            if (app.activeLib.removedNums > 0){
                if (app.log) {message('...removedNums: ' + app.activeLib.removedNums)}
                // použi najprv vymazané čísla
            }
            const newNumber = app.activeLib.isPrefix
            ? app.activeLib.prefix + app.season.slice(app.activeLib.trim) + Helpers.padNumber(app.activeLib.nextNum, app.activeLib.trailingDigit)
            : app.activeLib.ID + app.season.slice(app.activeLib.trim) + Helpers.padNumber(app.activeLib.nextNum, app.activeLib.trailingDigit);
            app.activeLib.number = newNumber;
            if (app.log) {message('Nové číslo: ' + newNumber + ' v knižnici ' + app.activeLib.name)}
            return newNumber
        } catch (error) {
            message('Chyba: ' + error + ', line:' + error.lineNumber);
            Logger.createError(error, 'get.number()')
        }
    },
    sadzbyDPH(){
        // nájdi sadzby DPH pre sezónu
        //setAppScripts('sadzbyDPH()', 'app.js' )
        try {
            app.dph.zakladna = libByName(app.data.app).find(app.season)[0].field('Základná sadzba DPH')
            app.dph.znizena = libByName(app.data.app).find(app.season)[0].field('Znížená sadzba DPH')
            ////nullAppScripts()
        } catch (error) {
            message('Chyba: ' + error + ', line:' + error.lineNumber);
            createErrorEntry(error, 'sadzbyDPH()')
        }
    },
}
// SETTERS
const set = {
    app(){
        //setAppScripts('set.app()', 'app.js' )
        try {
            this.storeLib()
            //nullAppScripts()
        } catch (error) {
            Logger.createError(error, 'set.app()')
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
            storeDB.set('runningScript', )
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
            Logger.createError(error, 'set.storeLib()')
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
            Logger.createError(error, 'set.season()')
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
            Logger.createError(error, 'set.log()')
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
            Logger.createError(error, 'set.debug()')
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
            Logger.createMsg('Chyba: ' + error + ', line:' + error.lineNumber);
            Logger.createError(error, 'set.numberPrefix()')
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
            Logger.createMsg('Chyba: ' + error + ', line:' + error.lineNumber);
            Logger.createError(error, 'set.number()')
        }
    }
}
// Logovanie a správa chýb
const Logger = {
    createLog(msg) {
        if (!app.msg) return;
        const errorLib = LibraryCache.get(app.data.errors);
        if (!errorLib) return;
        const newLog = {
            type: 'log',
            date: new Date(),
            'memento library': app.activeLib.name,
            library: app.libFile,
            text: 'app store variables',
            variables: this._logVariables(msg),
            note: 'generované scriptom createLogEntry'
        };
        errorLib.create(newLog);
    },
    createMsg(msg) {
        if (!app.log) return;
        const errorLib = LibraryCache.get(app.data.errors);
        if (!errorLib) return;
        const newMsg = {
            type: 'msg',
            date: new Date(),
            'memento library': app.activeLib.name,
            library: app.libFile,
            text: msg,
            variables: this._logVariables(msg),
            note: 'generované scriptom createMsgEntry'
        };
        errorLib.create(newMsg);
    },
    createError(error, context) {
        const errorLib = LibraryCache.get(app.data.errors);
        if (!errorLib) return;
        const newError = {
            type: 'error',
            date: new Date(),
            'memento library': app.activeLib.name,
            library: app.libFile,
            text: error.toString(),
            line: error.lineNumber || null,
            variables: this._logVariables(context),
            note: 'generované scriptom createErrorEntry'
        };
        errorLib.create(newError);
    },
    _logVariables(msg) {
        return 'name: ' + app.data.name + '\n' +
            'version: ' + app.data.version + '\n' +
            'season: ' + app.season + '\n' +
            'log: ' + app.log + '\n' +
            'debug: ' + app.debug + '\n' +
            'activeLib.name: ' + app.activeLib.name + '\n' +
            'activeLib.db: ' + (app.activeLib.db ? app.activeLib.db.title : null) + '\n' +
            'activeLib.ID: ' + app.activeLib.ID + '\n' +
            'activeLib.prefix: ' + app.activeLib.prefix + '\n' +
            'activeLib.lastNum: ' + app.activeLib.lastNum + '\n' +
            'activeLib.nextNum: ' + app.activeLib.nextNum + '\n' +
            'activeLib.reservedNum: ' + app.activeLib.reservedNum + '\n' +
            'activeLib.removedNums: ' + app.activeLib.removedNums + '\n' +
            'activeLib.isPrefix: ' + app.activeLib.isPrefix + '\n' +
            'activeLib.trim: ' + app.activeLib.trim + '\n' +
            'activeLib.trailingDigit: ' + app.activeLib.trailingDigit + '\n' +
            'activeLib.number: ' + app.activeLib.number + '\n' +
            'msg: ' + msg;
    }
};

// Trigger funkcie
const Triggers = {
    libOpen() {
        try {
            message(app.data.name + ' v.' + app.data.version + '\n' + app.activeLib.name + ' ' + app.season);
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'Triggers.libOpen');
        }
    },
    createEntryOpen() {
        try {
            get.openLib();
            message('Knižnica: ' + app.activeLib.name + ' /' + app.data.version + '/ ' + app.season + ' / ' + app.activeLib.nextNum);
            const en = entryDefault();

            // Set basic fields
            en.set(COMMON_FIELDS.VIEW, VIEW_STATES.EDIT);
            en.set(COMMON_FIELDS.DATE, new Date());
            en.set(COMMON_FIELDS.NUMBER, app.activeLib.number);
            en.set(COMMON_FIELDS.NUMBER_ENTRY, app.activeLib.nextNum);
            en.set(COMMON_FIELDS.SEASON, app.season);

            // Set creation metadata
            en.set(COMMON_FIELDS.CREATED_BY, user());
            en.set(COMMON_FIELDS.CREATED_DATE, new Date());

            // Set library-specific defaults
            switch (app.activeLib.name) {
                case CONFIG.libraries.attendance:
                    en.set(ATTENDANCE_FIELDS.PRICHOD, '7:30');
                    en.set(ATTENDANCE_FIELDS.ODCHOD, '14:30');
                    break;
                case 'Evidencia prác':
                    en.set(WORK_RECORD_FIELDS.ZACIATOK, '8:00');
                    en.set(WORK_RECORD_FIELDS.KONIEC, '14:00');
                    break;
                case 'Cenové ponuky v2':
                    en.set(CONFIG.fields.platnostPonuky, '10');
                    break;
                default:
                    break;
            }
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'Triggers.createEntryOpen');
        }
    },
    libOpenBeforeShow() { // Otvorenie knižnice pred zobrazením
        try {
            const myDialog = dialog();
            myDialog.title(app.data.name + ' >>> ' + app.activeLib.name + ' >>> ' + app.season)
                .text(app.data.version)
                //.neutralButton("Neutral", () => { cancel(); })
                .negativeButton("Odísť", () => { cancel(); })
                .positiveButton("Pokračuj", () => { })
                .autoDismiss(true)
                .show();
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'Triggers.libOpenBeforeShow');
        }
    },
    createEntryAfterSave() {
        const en = lib().lastEntry();
        try {
            switch (app.activeLib.name) {
                case 'Dochádzka':
                    Dochadzka.prepocitatZaznamDochadzky(en, false);
                    break;
                case 'Cenové ponuky v2':
                    CenovePonuky.fillEntryCP(en, false);
                    break;
                case 'CP Diely':
                    CenovePonuky.fillEntryCPDiely(en, false);
                    break;
                default:
                    break;
            }
            app.activeLib.lastNum = app.activeLib.nextNum;
            app.activeLib.nextNum++;
            en.set(COMMON_FIELDS.VIEW, VIEW_STATES.PRINT);
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            en.set(COMMON_FIELDS.VIEW, VIEW_STATES.DEBUG);
            Logger.createError(error, 'Triggers.newEntryAfterSave');
        }
    },
    linkEntryBeforeSave() {
        const en = entryDefault();
        const mEn = masterEntry();
        try {
            switch (app.activeLib.name) {
                case 'Cenové ponuky v2':
                    break;
                case 'CP Diely':
                    CenovePonuky.fillEntryCPDiely(en, false);
                    break;
                default:
                    break;
            }
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'Triggers.linkEntryBeforeSave');
        }
    }
};

// Funkcie pre spracovanie cenových ponúk a dielov
const CenovePonuky = {
    fillEntryCP(en){
        try {
            const platnostPonuky = Helpers.getField(en, CONFIG.fields.platnostPonuky, 10);
            const datum = Helpers.getField(en, CONFIG.fields.datum, new Date());
            en.set(CONFIG.fields.platnostDo, new Date(moment(datum).add(platnostPonuky, 'days')));
            if (!Helpers.getField(en, CONFIG.fields.identif, '')) {
                const miesto = Helpers.getField(en, CONFIG.fields.miestoRealizacie, []);
                if (miesto.length > 0) {
                    const klient = Helpers.getField(miesto[0], CONFIG.fields.klient, []);
                    if (klient.length > 0) {
                        en.set(CONFIG.fields.identif, klient[0].field(CONFIG.fields.nick) + ', ' + miesto[0].field(CONFIG.fields.lokalita));
                    }
                }
            }
            if (!Helpers.getField(en, CONFIG.fields.popisCenovejPonuky, '')) {
                const diely = Helpers.getField(en, CONFIG.fields.dielCenovejPonuky, []);
                let popis = '';
                for (let i = 0; i < diely.length; i++) {
                    popis += diely[i].field(CONFIG.fields.dielCenovejPonuky) + ', ';
                }
                en.set(CONFIG.fields.popisCenovejPonuky, popis);
            }
        } catch (error) {
            Logger.createMsg('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'CenovePonuky.fillEntryCP');
        }
    },
    fillEntryCPDiely(en, mEn) {
        try {
            if (!Helpers.getField(en, CONFIG.fields.identif, '')) {
                const miesto = Helpers.getField(mEn, CONFIG.fields.miestoRealizacie, []);
                if (miesto.length > 0) {
                    const klient = Helpers.getField(miesto[0], CONFIG.fields.klient, []);
                    if (klient.length > 0) {
                        en.set(CONFIG.fields.identif, klient[0].field(CONFIG.fields.nick) + ', ' + miesto[0].field(CONFIG.fields.lokalita));
                    }
                }
            }
            if (!Helpers.getField(en, CONFIG.fields.popisCenovejPonuky, '')) {
                const diely = Helpers.getField(en, CONFIG.fields.dielCenovejPonuky, []);
                let popis = '';
                for (let i = 0; i < diely.length; i++) {
                    popis += diely[i].field(CONFIG.fields.dielCenovejPonuky) + ', ';
                }
                en.set(CONFIG.fields.popisCenovejPonuky, popis);
            }
            if (mEn.length > 0) {
                en.set(CONFIG.fields.typCenovejPonuky, mEn.field(CONFIG.fields.typCenovejPonuky));
                en.set(CONFIG.fields.zlavaNaSadzby, mEn.field(CONFIG.fields.zlavaNaSadzby));
                en.set(CONFIG.fields.uctovanieDopravy, mEn.field(CONFIG.fields.uctovanieDopravy));
            }
        } catch (error) {
            Logger.createMsg('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'CenovePonuky.fillEntryCPDiely');
        }
    }
};

// Dochadzka - Attendance related functions and triggers
const Dochadzka = {
    validateAndRoundTime(time) {
        if (!time) {
            message('Missing time value');
            return null;
        }
        return this.roundTimeQ(time);
    },
    roundTimeQ(time) {
        const timeToReturn = new Date(time);
        timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
        timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
        timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
        return timeToReturn;
    },
    calculateWorkHours(start, end) {
        return (end - start) / 3600000; // milliseconds to hours
    },
    prepocitatZaznamDochadzky(en, isEdit) {
        try {
            en = en || lib().entry();
            const datum = en.field(COMMON_FIELDS.DATE);
            const zavazky = en.field(ATTENDANCE_FIELDS.GENEROVAT_ZAVAZKY);
            const zamestnanci = en.field(ATTENDANCE_FIELDS.ZAMESTNANCI);
            const evidenciaPrac = en.field(ATTENDANCE_FIELDS.PRACE);
            const totals = {
                mzdy: 0,
                odpracovane: 0,
                evidencia: 0,
                prestoje: 0,
                pracovnaDoba: 0
            };

            const prichod = this.validateAndRoundTime(en.field(ATTENDANCE_FIELDS.PRICHOD));
            const odchod = this.validateAndRoundTime(en.field(ATTENDANCE_FIELDS.ODCHOD));

            if (!prichod || !odchod || this.getTime(prichod) >= this.getTime(odchod)) {
                message('Invalid arrival/departure times, ' + ATTENDANCE_FIELDS.PRICHOD + ': ' + prichod + ', ' + ATTENDANCE_FIELDS.ODCHOD + ': ' + odchod);
                return;
            } else {
                en.set(ATTENDANCE_FIELDS.PRICHOD, prichod);
                en.set(ATTENDANCE_FIELDS.ODCHOD, odchod);
            }

            const employeeAtt = {
                odpracovane: 0,
                hodinovka: 0,
                dennaMzda: 0
            };

            totals.pracovnaDoba = this.calculateWorkHours(prichod, odchod);

            if (zamestnanci.length > 0) {
                for (let z = 0; z < zamestnanci.length; z++) {
                    employeeAtt.hodinovka = Zamestnanci.sadzba(zamestnanci[z], datum);
                    employeeAtt.odpracovane = totals.pracovnaDoba;
                    employeeAtt.dennaMzda = employeeAtt.odpracovane * (employeeAtt.hodinovka
                        + zamestnanci[z].attr("+príplatok (€/h)"))
                        + zamestnanci[z].attr("+prémia (€)")
                        - zamestnanci[z].attr("-pokuta (€)");

                    Zamestnanci.setEmployeeAttributes(zamestnanci[z], employeeAtt);

                    totals.mzdy += employeeAtt.dennaMzda;
                    totals.odpracovane += employeeAtt.odpracovane;

                    if (zavazky) {
                        Dochadzka.registrujZavazky(zamestnanci[z], en, employeeAtt, isEdit);
                    }
                }
            }

            totals.prestoje = totals.odpracovane - totals.evidencia;

            en.set(ATTENDANCE_FIELDS.MZDOVE_NAKLADY, totals.mzdy.toFixed(2));
            en.set(ATTENDANCE_FIELDS.PRACOVNA_DOBA, totals.pracovnaDoba.toFixed(2));
            en.set(ATTENDANCE_FIELDS.ODPRACOVANE, totals.odpracovane.toFixed(2));
            en.set(ATTENDANCE_FIELDS.NA_ZAKAZKACH, totals.evidencia.toFixed(2));
            en.set(ATTENDANCE_FIELDS.PRESTOJE, totals.prestoje.toFixed(2));

            if (totals.evidencia > totals.odpracovane) {
                en.set(ATTENDANCE_FIELDS.APP_MSG, MESSAGES.REQUIRES_ATTENTION);
            }

            if (app.log) {
                message("...hotovo");
            }
        } catch (error) {
            message('Chyba: ' + error + ', line:' + error.lineNumber);
        }
    },
    registrujZavazky(employee, en, attr, isEdit) {
        try {
            if (isEdit) {
                let zavazky = en.linksFrom(TABLES.ZAVAZKY, app.activeLib.db.title);
                let filtered = zavazky.filter(el => el.field(LIABILITY_FIELDS.ZAMESTNANEC)[0].name == employee.name);
                filtered.forEach(el => {
                    el.trash();
                });
            }
            this.newEntryZavazky(employee, en, attr);
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
        }
    },
    newEntryZavazky(employee, en, attrs) {
        try {
            lib(TABLES.ZAVAZKY);
            const popis = MESSAGES.WAGE_FOR_DAY.replace('{0}', employee.name);
            const zavazky = libByName(TABLES.ZAVAZKY);
            const newEntry = {};
            newEntry[COMMON_FIELDS.NUMBER] = app.activeLib.number;
            newEntry[COMMON_FIELDS.NUMBER_ENTRY] = app.activeLib.nextNum;
            newEntry[COMMON_FIELDS.DATE] = new Date();
            newEntry[LIABILITY_FIELDS.TYP] = WAGE_TYPES.WAGES;
            newEntry[LIABILITY_FIELDS.ZAMESTNANEC] = employee;
            newEntry[LIABILITY_FIELDS.DOCHADZKA] = en;
            newEntry[LIABILITY_FIELDS.INFO] = MESSAGES.AUTO_GENERATED;
            newEntry[LIABILITY_FIELDS.POPIS] = popis;
            newEntry[LIABILITY_FIELDS.SUMA] = attrs.dennaMzda.toFixed(2);
            newEntry[COMMON_FIELDS.SEASON] = app.season;
            newEntry[COMMON_FIELDS.CREATED_BY] = user();
            newEntry[COMMON_FIELDS.CREATED_DATE] = new Date();
            zavazky.create(newEntry);
            app.activeLib.lastNum = app.activeLib.nextNum;
            app.activeLib.nextNum += 1;
            storeLib();
            return true;
        } catch (error) {
            message('Chyba: ' + error + ', line:' + error.lineNumber);
        }
    },
    getTime(date) {
        return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
    }
};

// Zamestnanci - Employees related functions
const Zamestnanci = {
    sadzba(employee, dateParam) {
        try {
            const links = employee.linksFrom(TABLES.SADZBY_ZAMESTNANCOV, EMPLOYEE_FIELDS.ZAMESTNANEC);
            const filteredLinks = Helpers.filterByDate(links, dateParam, EMPLOYEE_FIELDS.PLATNOST_OD);
            if (!filteredLinks || filteredLinks.length === 0) {
                return null;
            } else {
                return filteredLinks[0].field(EMPLOYEE_FIELDS.SADZBA);
            }
        } catch (error) {
            message('Chyba: ' + error + ', line:' + error.lineNumber);
            return null;
        }
    },
    setEmployeeAttributes(employee, employeeAttributes) {
        try {
            employee.setAttr("odpracované", employeeAttributes.odpracovane);
            employee.setAttr("hodinovka", employeeAttributes.hodinovka);
            employee.setAttr("denná mzda", employeeAttributes.dennaMzda);
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
        }
    }
};

// Make functions globally available
this.libOpen = Triggers.libOpen;
this.libOpenBeforeShow = Triggers.libOpenBeforeShow;
this.newEntryAfterSave = Triggers.newEntryAfterSave;
this.linkEntryBeforeSave = Triggers.linkEntryBeforeSave;
this.createEntryOpen = Triggers.createEntryOpen;