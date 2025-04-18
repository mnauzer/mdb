// Employee attribute constants - exact names as used in Memento Database
const EMPLOYEE_ATTRIBUTES = {
    HOURS_WORKED: 'odpracované',
    HOURLY_RATE: 'hodinovka',
    DAILY_WAGE: 'denná mzda',
    HOURLY_BONUS: '+príplatok (€/h)',
    FIXED_BONUS: '+prémia (€)',
    PENALTY: '-pokuta (€)'
};

// Wage type constants
const WAGE_TYPES = {
    WAGES: 'Mzdy'
};

// Calculation related constants
const CALCULATION = {
    // Time constants
    MILLISECONDS_PER_HOUR: 3600000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_QUARTER: 15,

    // Decimal places for financial calculations
    DECIMAL_PLACES: 2
};

// Entry type constants
const ENTRY_TYPES = {
    LOG: 'log',
    MESSAGE: 'msg',
    ERROR: 'error'
};

// Note constants
const NOTES = {
    LOG_ENTRY: 'generované scriptom createLogEntry',
    MESSAGE_ENTRY: 'generované scriptom createMsgEntry',
    ERROR_ENTRY: 'generované scriptom createErrorEntry'
};

// Make constants globally available
this.EMPLOYEE_ATTRIBUTES = EMPLOYEE_ATTRIBUTES;
this.WAGE_TYPES = WAGE_TYPES;
this.CALCULATION = CALCULATION;
this.ENTRY_TYPES = ENTRY_TYPES;
this.NOTES = NOTES;