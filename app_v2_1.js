// Refaktorovaný súbor app_v2_1.js s aplikovanými vylepšeniami a zachovaním funkčnosti pôvodného app_v2.js

// Konfigurácia tabuliek, polí a sekcií pre lepšiu údržbu
const CONFIG = {
    data: {
        name: 'ASISTANTO 2',
        version: '2.04.0078',
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
        zamestnanci: 'Zamestnanci'
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
        identifikator: 'Identifikátor',
        popisCenovejPonuky: 'Popis cenovej ponuky',
        dielCenovejPonuky: 'Diel cenovej ponuky',
        miestoRealizacie: 'Miesto realizácie',
        klient: 'Klient'
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
    getField(entry, fieldName, defaultValue = null) {
        try {
            const val = entry.field(fieldName);
            return val !== undefined && val !== null ? val : defaultValue;
        } catch (e) {
if (app.log) message('Chyba pri čítaní poľa ' + fieldName + ': ' + e);
            return defaultValue;
        }
    },
    setField(entry, fieldName, value) {
        try {
            entry.set(fieldName, value);
        } catch (e) {
if (app.log) message('Chyba pri zápise poľa ' + fieldName + ': ' + e);
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

// Funkcie pre spracovanie cenových ponúk a dielov
const CenovePonuky = {
    fillEntryCP(en, isEdit) {
        try {
            const platnostPonuky = Helpers.getField(en, CONFIG.fields.platnostPonuky, 10);
            const datum = Helpers.getField(en, CONFIG.fields.datum, new Date());
            en.set('Platnosť do', new Date(moment(datum).add(platnostPonuky, 'days')));
            if (!Helpers.getField(en, CONFIG.fields.identifikator, '')) {
                const miesto = Helpers.getField(en, CONFIG.fields.miestoRealizacie, []);
                if (miesto.length > 0) {
                    const klient = Helpers.getField(miesto[0], CONFIG.fields.klient, []);
                    if (klient.length > 0) {
                        en.set(CONFIG.fields.identifikator, klient[0].field('Nick') + ', ' + miesto[0].field('Lokalita'));
                    }
                }
            }
            if (!Helpers.getField(en, CONFIG.fields.popisCenovejPonuky, '')) {
                const diely = Helpers.getField(en, CONFIG.fields.dielCenovejPonuky, []);
                let popis = '';
                for (let i = 0; i < diely.length; i++) {
                    popis += diely[i].field('diel cenovej ponuky') + ', ';
                }
                en.set(CONFIG.fields.popisCenovejPonuky, popis);
            }
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'CenovePonuky.fillEntryCP');
        }
    },
    fillEntryCPDiely(en, mEn, isEdit) {
        try {
            if (!Helpers.getField(en, CONFIG.fields.identifikator, '')) {
                const miesto = Helpers.getField(mEn, CONFIG.fields.miestoRealizacie, []);
                if (miesto.length > 0) {
                    const klient = Helpers.getField(miesto[0], CONFIG.fields.klient, []);
                    if (klient.length > 0) {
                        en.set(CONFIG.fields.identifikator, klient[0].field('Nick') + ', ' + miesto[0].field('Lokalita'));
                    }
                }
            }
            if (!Helpers.getField(en, CONFIG.fields.popisCenovejPonuky, '')) {
                const diely = Helpers.getField(en, CONFIG.fields.dielCenovejPonuky, []);
                let popis = '';
                for (let i = 0; i < diely.length; i++) {
                    popis += diely[i].field('diel cenovej ponuky') + ', ';
                }
                en.set(CONFIG.fields.popisCenovejPonuky, popis);
            }
            if (mEn.length > 0) {
                en.set(CONFIG.fields.typCenovejPonuky, mEn.field(CONFIG.fields.typCenovejPonuky));
                en.set(CONFIG.fields.zlavaNaSadzby, mEn.field(CONFIG.fields.zlavaNaSadzby));
                en.set('Účtovanie dopravy', mEn.field('Účtovanie dopravy'));
            }
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'CenovePonuky.fillEntryCPDiely');
        }
    }
};

// Trigger funkcie
const Triggers = {
    libOpen() {
        try {
            message(app.data.name + ' v.' + app.data.version + '\n' + app.activeLib.name + ' ' + app.season);
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
        }
    },
/*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Trigger funkcia, ktorá sa spúští pri otvorení knižnice.
     * Zobrazí dial gov dialog s informáciami o aplikácii.
     * Ak je stlačené tlačidlo "Pokračuj", pokračuje sa s otvorením knižnice.
     * Ak je stlačené tlačidlo "Odísť", je knižnica zatvorená.
     */
/*******  e504751e-5345-4676-8341-61d2661c0b1d  *******/
    libOpenBeforeShow() {
        try {
            const myDialog = dialog();
            myDialog.title(app.data.name)
                .text(app.data.version)
                .neutralButton("Neutral", () => { cancel(); })
                .negativeButton("Odísť", () => { cancel(); })
                .positiveButton("Pokračuj", () => { })
                .autoDismiss(true)
                .show();
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            Logger.createError(error, 'Triggers.libOpenBeforeShow');
        }
    },
    newEntryAfterSave() {
        const en = lib().lastEntry();
        try {
            switch (app.activeLib.name) {
                case 'Dochádzka':
                    prepocitatZaznamDochadzky(en, false);
                    break;
                case 'Cenové ponuky v2':
                    CenovePonuky.fillEntryCP(en, false);
                    break;
                case 'CP Diely':
                    CenovePonuky.fillEntryCPDiely(en, masterEntry(), false);
                    break;
                default:
                    break;
            }
            en.set(VIEW, VIEW_PRINT);
        } catch (error) {
            message('Chyba: ' + error + ', line: ' + error.lineNumber);
            en.set(VIEW, VIEW_DEBUG);
            Logger.createError(error, 'Triggers.newEntryAfterSave');
        }
    },
    linkEntryBeforeSave() {
        const en = entryDefault();
        const mEn = masterEntry();
        try {
            switch (app.activeLib.name) {
                case 'Cenové ponuky v2':
                    CenovePonuky.fillEntryCPDiely(en, mEn, false);
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

// Export alebo priradenie triggerov podľa potreby
// Napríklad:
// exports.libOpen = Triggers.libOpen;
// exports.libOpenBeforeShow = Triggers.libOpenBeforeShow;
// exports.newEntryAfterSave = Triggers.newEntryAfterSave;
// exports.linkEntryBeforeSave = Triggers.linkEntryBeforeSave;

// Ďalšie funkcie a logika môžu byť refaktorované podobným spôsobom podľa potreby
