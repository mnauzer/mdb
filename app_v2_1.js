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
    getField(entry, fieldName, defaultValue) {
        if (defaultValue === undefined) {
            defaultValue = null;
        }
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

            const prichod = this.validateAndRoundTime(en.field("Príchod"));
            const odchod = this.validateAndRoundTime(en.field("Odchod"));

            if (!prichod || !odchod || this.getTime(prichod) >= this.getTime(odchod)) {
                message('Invalid arrival/departure times, Príchod: ' + prichod + ', Odchod: ' + odchod);
                return;
            } else {
                en.set("Príchod", prichod);
                en.set("Odchod", odchod);
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

            en.set("Mzdové náklady", totals.mzdy.toFixed(2));
            en.set("Pracovná doba", totals.pracovnaDoba.toFixed(2));
            en.set("Odpracované", totals.odpracovane.toFixed(2));
            en.set("Na zákazkách", totals.evidencia.toFixed(2));
            en.set("Prestoje", totals.prestoje.toFixed(2));

            if (totals.evidencia > totals.odpracovane) {
                en.set("appMsg", 'vyžaduje pozornosť');
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
                let zavazky = en.linksFrom(LIBRARY.ZVK, app.activeLib.db.title);
                let filtered = zavazky.filter(el => el.field("Zamestnanec")[0].name == employee.name);
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
            get.openLib(LIBRARY.ZVK);
            const popis = "Mzda " + employee.name + ", za deň ";
            const zavazky = libByName(LIBRARY.ZVK);
            const newEntry = {};
            newEntry[NUMBER] = app.activeLib.number;
            newEntry[NUMBER_ENTRY] = app.activeLib.nextNum;
            newEntry[DATE] = new Date();
            newEntry["Typ"] = "Mzdy";
            newEntry["Zamestnanec"] = employee;
            newEntry["Dochádzka"] = en;
            newEntry["info"] = "generované automaticky z dochádzky";
            newEntry["Popis"] = popis;
            newEntry["Suma"] = attrs.dennaMzda.toFixed(2);
            newEntry[SEASON] = app.season;
            newEntry[CR] = user();
            newEntry[CR_DATE] = new Date();
            zavazky.create(newEntry);
            app.activeLib.lastNum = app.activeLib.nextNum;
            app.activeLib.nextNum += 1;
            set.storeLib();
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
    sadzba(employee, date) {
        try {
            const links = employee.linksFrom(LIBRARY.SZ, FLD_ZAM);
            const dateField = "Platnosť od";
            const filteredLinks = filterByDate(links, date, dateField);
            if (!filteredLinks || filteredLinks.length === 0) {
                return null;
            } else {
                return filteredLinks[0].field("Sadzba");
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
