// Employee attribute constants - exact names as used in Memento Database
export const EMPLOYEE_ATTRIBUTES = {
    HOURS_WORKED: 'odpracované',
    HOURLY_RATE: 'hodinovka',
    DAILY_WAGE: 'denná mzda',
    HOURLY_BONUS: '+príplatok (€/h)',
    FIXED_BONUS: '+prémia (€)',
    PENALTY: '-pokuta (€)'
};

// Wage type constants
export const WAGE_TYPES = {
    WAGES: 'Mzdy'
};

// Calculation related constants
export const CALCULATION = {
    // Time constants
    MILLISECONDS_PER_HOUR: 3600000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_QUARTER: 15,

    // Decimal places for financial calculations
    DECIMAL_PLACES: 2
};

// Entry type constants
export const ENTRY_TYPES = {
    LOG: 'log',
    MESSAGE: 'msg',
    ERROR: 'error'
};

// Note constants
export const NOTES = {
    LOG_ENTRY: 'generované scriptom createLogEntry',
    MESSAGE_ENTRY: 'generované scriptom createMsgEntry',
    ERROR_ENTRY: 'generované scriptom createErrorEntry'
};
