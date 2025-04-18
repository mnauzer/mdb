// Application configuration constants
export const APP_CONFIG = {
    name: 'ASISTANTO 2',
    version: '2.04.0079',
    app: 'ASISTANTO',
    db: 'ASISTANTO DB',
    tenant: 'KRAJINKA'
};

// Section definitions
export const SECTIONS = {
    MATERIAL: 'Materiál',
    WORK: 'Práce',
    OTHER: 'Ostatné',
    MACHINES: 'Stroje',
    TRANSPORT: 'Doprava'
};

// Color definitions
export const COLORS = {
    FIREBRICK: '#B22222',
    CHARTREUSE: '#7FFF00',
    MEDIUM_AQUAMARINE: '#66CDAA',
    MARENGO: '#4C5866',
    MEDIUM_GRAY: '#BEBEBE',
    NICKEL: '#727472',
    STONE_GRAY: '#928E85',
    OUTER_SPACE: '#414A4C',
    PORCELAIN: '#FFFEFC',
    WHITE: '#FFFFFF',
    CHIFFON: '#FBFAF2',
    BONE: '#E7DECC',
    ACOUSTIC_WHITE: '#EFECE1',
    AIRCRAFT_WHITE: '#EDF2F8',
    CERAMIC: '#FCFFF9',
    BRIGHT_WHITE: '#F4F5F0',
    BRILLIANT_WHITE: '#EDF1FE'
};

// View states
export const VIEW_STATES = {
    EDIT: 'edit',
    PRINT: 'print',
    DEBUG: 'debug'
};

// Default values
export const DEFAULTS = {
    ATTENDANCE: {
        ARRIVAL: '7:30',
        DEPARTURE: '14:30'
    },
    WORK_RECORDS: {
        START_TIME: '8:00',
        END_TIME: '14:00'
    },
    PRICE_QUOTES: {
        VALIDITY_PERIOD: '10'
    }
};

// System messages
export const MESSAGES = {
    MISSING_TIME: 'Missing time value',
    INVALID_TIMES: 'Invalid arrival/departure times',
    REQUIRES_ATTENTION: 'vyžaduje pozornosť',
    DONE: '...hotovo',
    AUTO_GENERATED: 'generované automaticky z dochádzky',
    WAGE_FOR_DAY: 'Mzda {0}, za deň'
};
