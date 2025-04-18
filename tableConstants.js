// Table/Library definitions used in Memento Database
const TABLES = {
    LIABILITIES: 'Záväzky',
    EMPLOYEE_RATES: 'Sadzby zamestnancov',
    ATTENDANCE: 'Dochádzka',
    WORK_RECORDS: 'Evidencia prác',
    PRICE_QUOTES: 'Cenové ponuky v2',
    PRICE_QUOTE_PARTS: 'CP Diely',
    INVENTORY: 'Sklad',
    PRICE_LIST: 'Cenník prác',
    EMPLOYEES: 'Zamestnanci'
};

// System tables
const SYSTEM_TABLES = {
    ERRORS: 'ASISTANTO Errors',
    TENANTS: 'ASISTANTO Tenants',
    SCRIPTS: 'ASISTANTO Scripts',
    TODO: 'ASISTANTO ToDo'
};

// Make constants globally available
this.TABLES = TABLES;
this.SYSTEM_TABLES = SYSTEM_TABLES;