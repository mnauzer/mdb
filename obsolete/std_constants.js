// Standardized Constants for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Consolidated constants for the entire application
 * Combines and organizes constants from multiple files:
 * - appConstants.js
 * - fieldConstants.js
 * - tableConstants.js
 * - attributeConstants.js
 */
var std_Constants = {
  // Application configuration
  APP: {
    NAME: 'ASISTANTO 2',
    VERSION: '2.04.0091',
    APP: 'ASISTANTO',
    DB: 'ASISTANTO DB',
    ERRORS: 'ASISTANTO Errors',
    TENANTS: 'ASISTANTO Tenants',
    SCRIPTS: 'ASISTANTO Scripts',
    TODO: 'ASISTANTO ToDo',
    TENANT: 'KRAJINKA'
  },
  
  // Library/Table definitions
  LIBRARIES: {
    // System libraries
    SYSTEM: {
      APP: 'ASISTANTO',
      DB: 'ASISTANTO DB',
      ERRORS: 'ASISTANTO Errors',
      TENANTS: 'ASISTANTO Tenants',
      SCRIPTS: 'ASISTANTO Scripts',
      TODO: 'ASISTANTO ToDo'
    },
    
    // Project libraries
    PROJECTS: {
      PRICE_QUOTES: 'Cenové ponuky v2',
      PRICE_QUOTE_PARTS: 'CP Diely',
      JOBS: 'Zákazky',
      SETTLEMENTS: 'Vyúčtovania',
      PRICE_LIST: 'Cenník prác',
      WORK_PLAN: 'Plán prác',
      WORK_REPORT: 'Výkaz prác',
      MATERIAL_REPORT: 'Výkaz materiálu',
      MACHINE_REPORT: 'Výkaz strojov',
      TRANSPORT_REPORT: 'Výkaz dopravy',
      CONSTRUCTION_DIARY: 'Stavebný denník'
    },
    
    // Administration libraries
    ADMIN: {
      INVENTORY: 'Invenúry',
      RECEIPTS: 'Príjemky',
      RESERVATIONS: 'Rezervácie',
      ORDERS: 'Objednávky',
      INVOICES_RECEIVED: 'Faktúry prijaté',
      INVOICES_SENT: 'Faktúry odoslané',
      RECEIVABLES: 'Pohľadávky',
      LIABILITIES: 'Záväzky'
    },
    
    // Records libraries
    RECORDS: {
      CASH_REGISTER: 'Pokladňa',
      WORK_RECORDS: 'Evidencia prác',
      ATTENDANCE: 'Dochádzka',
      TRAVEL_LOG: 'Kniha jázd'
    },
    
    // Database libraries
    DATABASES: {
      INVENTORY: 'Sklad',
      EXTERNAL_INVENTORY: 'Externý sklad',
      EMPLOYEES: 'Zamestnanci',
      CLIENTS: 'Klienti',
      SUPPLIERS: 'Dodávatelia',
      PARTNERS: 'Partneri',
      LOCATIONS: 'Miesta',
      PLANT_DATABASE: 'Databáza rastlín',
      ACCOUNTS: 'Účty',
      EMPLOYEE_RATES: 'sadzby zamestnancov',
      WORK_HOUR_LIMITS: 'limity pracovných hodín',
      SEASONAL_WORK_PRICES: 'sezónne ceny prác a strojov',
      SEASONAL_MATERIAL_PRICES: 'sezónne ceny materiálu',
      MACHINES: 'Stroje'
    }
  },
  
  // Field definitions
  FIELDS: {
    // Common fields used across multiple tables
    COMMON: {
      VIEW: 'view',
      DATE: 'Dátum',
      NUMBER: 'number',
      NUMBER_ENTRY: 'Číslo',
      SEASON: 'sezóna',
      CREATED_BY: 'zapísal',
      CREATED_DATE: 'dátum zápisu',
      MODIFIED_BY: 'upravil',
      MODIFIED_DATE: 'dátum úpravy',
      ENTRY_COLOR: 'farba záznamu',
      BACKGROUND_COLOR: 'farba pozadia'
    },
    
    // Price Quote related fields
    PRICE_QUOTE: {
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
    },
    
    // Attendance related fields
    ATTENDANCE: {
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
    },
    
    // Employee related fields
    EMPLOYEE: {
      EMPLOYEE: 'Zamestnanec',
      RATE: 'Sadzba',
      VALID_FROM: 'Platnosť od',
      BONUS_HOURLY: '+príplatok (€/h)',
      BONUS_FIXED: '+prémia (€)',
      PENALTY: '-pokuta (€)',
      HOURS_WORKED_ATTR: 'odpracované',
      HOURLY_RATE_ATTR: 'hodinovka',
      DAILY_WAGE_ATTR: 'denná mzda'
    },
    
    // Liability related fields
    LIABILITY: {
      TYPE: 'Typ',
      AMOUNT: 'Suma',
      INFO: 'info',
      DESCRIPTION: 'Popis',
      ATTENDANCE: 'Dochádzka'
    },
    
    // Work record related fields
    WORK_RECORD: {
      START_TIME: 'Začiatok',
      END_TIME: 'Koniec'
    },
    
    // Invoice related fields
    INVOICE: {
      SUPPLIER: 'Dodávateľ',
      INVOICE_NUMBER: 'Číslo faktúry',
      VARIABLE_SYMBOL: 'VS',
      ISSUE_DATE: 'Dátum vystavenia',
      DUE_DATE: 'Dátum splatnosti',
      PAYMENT_DATE: 'Dátum úhrady',
      AMOUNT_WITHOUT_VAT: 'Suma bez DPH',
      VAT: 'DPH',
      AMOUNT_WITH_VAT: 'Suma s DPH',
      PAID: 'Uhradená'
    }
  },
  
  // Section definitions
  SECTIONS: {
    MATERIAL: 'Materiál',
    WORK: 'Práce',
    OTHER: 'Ostatné',
    MACHINES: 'Stroje',
    TRANSPORT: 'Doprava'
  },
  
  // Color definitions
  COLORS: {
    // Reds
    FIREBRICK: '#B22222',
    
    // Greens
    CHARTREUSE: '#7FFF00',
    MEDIUM_AQUAMARINE: '#66CDAA',
    
    // Grays
    MARENGO: '#4C5866',
    MEDIUM_GRAY: '#BEBEBE',
    NICKEL: '#727472',
    STONE_GRAY: '#928E85',
    OUTER_SPACE: '#414A4C',
    
    // Whites
    PORCELAIN: '#FFFEFC',
    WHITE: '#FFFFFF',
    CHIFFON: '#FBFAF2',
    BONE: '#E7DECC',
    ACOUSTIC_WHITE: '#EFECE1',
    AIRCRAFT_WHITE: '#EDF2F8',
    CERAMIC: '#FCFFF9',
    BRIGHT_WHITE: '#F4F5F0',
    BRILLIANT_WHITE: '#EDF1FE',
    
    // Memento colors
    MEM_RED: '#B22222',
    MEM_GREEN: '#669966',
    MEM_BLUE: '#4D66CC',
    MEM_LIGHT_GREEN: '#CCFFCC',
    MEM_LIGHT_YELLOW: '#FFFFCC',
    MEM_LIGHT_BLUE: '#CCFFFF'
  },
  
  // View states
  VIEW_STATES: {
    EDIT: 'Editácia',
    PRINT: 'Tlač',
    DEBUG: 'Debug'
  },
  
  // Default values
  DEFAULTS: {
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
  },
  
  // System messages
  MESSAGES: {
    MISSING_TIME: 'Chýbajúci čas',
    INVALID_TIMES: 'Zlý čas príchodu/odchodu',
    REQUIRES_ATTENTION: 'Vyžaduje pozornosť',
    DONE: '...hotovo',
    AUTO_GENERATED: 'Generované automaticky z dochádzky',
    WAGE_FOR_DAY: 'Mzda {0}, za deň'
  },
  
  // Employee attribute constants
  EMPLOYEE_ATTRIBUTES: {
    HOURS_WORKED: 'odpracované',
    HOURLY_RATE: 'hodinovka',
    DAILY_WAGE: 'denná mzda',
    HOURLY_BONUS: '+príplatok (€/h)',
    FIXED_BONUS: '+prémia (€)',
    PENALTY: '-pokuta (€)'
  },
  
  // Wage type constants
  WAGE_TYPES: {
    WAGES: 'Mzdy'
  },
  
  // Calculation related constants
  CALCULATION: {
    // Time constants
    MILLISECONDS_PER_HOUR: 3600000,
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_QUARTER: 15,
    
    // Decimal places for financial calculations
    DECIMAL_PLACES: 2
  },
  
  // Entry type constants
  ENTRY_TYPES: {
    LOG: 'log',
    MESSAGE: 'msg',
    ERROR: 'error'
  },
  
  // Note constants
  NOTES: {
    LOG_ENTRY: 'generované scriptom createLogEntry',
    MESSAGE_ENTRY: 'generované scriptom createMsgEntry',
    ERROR_ENTRY: 'generované scriptom createErrorEntry',
    STD_ERROR_ENTRY: 'generované scriptom std_ErrorHandler'
  }
};

// Make available globally
this.std_Constants = std_Constants;
