// Common fields used across multiple tables
const COMMON_FIELDS = {
    VIEW: 'view',
    DATE: 'Dátum',
    NUMBER: 'number',
    NUMBER_ENTRY: 'Číslo',
    SEASON: 'sezóna',
    CREATED_BY: 'zapísal',
    CREATED_DATE: 'dátum zápisu'
};

// Price Quote related fields
const PRICE_QUOTE_FIELDS = {
    VALIDITY_PERIOD: 'Platnosť ponuky',
    VALID_UNTIL: 'Platnosť do',
    IDENTIF: 'Identifikátor',  // Zmenené z IDENTIFIER na IDENTIF
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
const ATTENDANCE_FIELDS = {
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
const EMPLOYEE_FIELDS = {
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
const LIABILITY_FIELDS = {
    TYPE: 'Typ',
    AMOUNT: 'Suma',
    INFO: 'info',
    DESCRIPTION: 'Popis',
    ATTENDANCE: 'Dochádzka'
};

// Work record related fields
const WORK_RECORD_FIELDS = {
    START_TIME: 'Začiatok',
    END_TIME: 'Koniec'
};

// Make constants globally available
this.COMMON_FIELDS = COMMON_FIELDS;
this.PRICE_QUOTE_FIELDS = PRICE_QUOTE_FIELDS;
this.ATTENDANCE_FIELDS = ATTENDANCE_FIELDS;
this.EMPLOYEE_FIELDS = EMPLOYEE_FIELDS;
this.LIABILITY_FIELDS = LIABILITY_FIELDS;
this.WORK_RECORD_FIELDS = WORK_RECORD_FIELDS;