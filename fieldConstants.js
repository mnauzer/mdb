// Common fields used across multiple tables
export const COMMON_FIELDS = {
    VIEW: 'view',
    DATE: 'date',
    NUMBER: 'number',
    NUMBER_ENTRY: 'number_entry',
    SEASON: 'season',
    CREATED_BY: 'cr',
    CREATED_DATE: 'cr_date'
};

// Price Quote related fields
export const PRICE_QUOTE_FIELDS = {
    VALIDITY_PERIOD: 'Platnosť ponuky',
    VALID_UNTIL: 'Platnosť do',
    IDENTIFIER: 'Identifikátor',
    DESCRIPTION: 'Popis cenovej ponuky',
    QUOTE_PART: 'Diel cenovej ponuky',
    LOCATION: 'Miesto realizácie',
    CLIENT: 'Klient',
    TRANSPORT_BILLING: 'Účtovanie dopravy',
    NICKNAME: 'Nick',
    LOCALITY: 'Lokalita',
    QUOTE_TYPE: 'Typ cenovej ponuky',
    RATE_DISCOUNT: 'Počítať zľavy na sadzby',
    TOTAL_PRICE: 'Cena celkom',
    HOURLY_RATES: 'Počítanie hodinových sadzieb'
};

// Attendance related fields
export const ATTENDANCE_FIELDS = {
    ARRIVAL: 'Príchod',
    DEPARTURE: 'Odchod',
    LABOR_COSTS: 'Mzdové náklady',
    WORKING_HOURS: 'Pracovná doba',
    HOURS_WORKED: 'Odpracované',
    PROJECT_HOURS: 'Na zákazkách',
    IDLE_TIME: 'Prestoje',
    APP_MESSAGE: 'appMsg',
    GENERATE_LIABILITIES: 'Generovať záväzky',
    EMPLOYEES: 'Zamestnanci',
    WORK: 'Práce'
};

// Employee related fields
export const EMPLOYEE_FIELDS = {
    EMPLOYEE: 'Zamestnanec',
    RATE: 'Sadzba',
    VALID_FROM: 'Platnosť od',
    BONUS_HOURLY: '+príplatok (€/h)',
    BONUS_FIXED: '+prémia (€)',
    PENALTY: '-pokuta (€)',
    HOURS_WORKED_ATTR: 'odpracované',
    HOURLY_RATE_ATTR: 'hodinovka',
    DAILY_WAGE_ATTR: 'denná mzda'
};

// Liability related fields
export const LIABILITY_FIELDS = {
    TYPE: 'Typ',
    AMOUNT: 'Suma',
    INFO: 'info',
    DESCRIPTION: 'Popis',
    ATTENDANCE: 'Dochádzka'
};

// Work record related fields
export const WORK_RECORD_FIELDS = {
    START_TIME: 'Začiatok',
    END_TIME: 'Koniec'
};
