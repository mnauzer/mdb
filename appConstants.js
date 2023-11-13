// libraries
// APP
const APP = "ASISTANTO"
const APP_DB = "ASISTANTO DB"
const APP_ERROR = "ASISTANTO Errors"
const APP_TENATNS = "ASISTANTO Tenants"

// PROJEKTY
const LIB_CENOVE_PONUKY = "Cenové ponuky"
const LIB_ZAKAZKY = "Zákazky"
const LIB_VYUCTOVANIA = "Vyúčtovania"
const LIB_CENNIK_PRAC = "Cenník prác"
const LIB_SKLAD = "Sklad"
const LIB_PLAN_PRAC = "Plán prác"
const LIB_VYKAZ_PRAC = "Výkaz prác"
const LIB_VYKAZ_MATERIALU = "Výkaz materiálu"
const LIB_VYKAZ_STROJOV = "Výkaz strojov"
const LIB_VYKAZ_DOPRAVY = "Výkaz dopravy"
const LIB_STAVEBNY_DENNIK = "Stavebný denník"

// ADMINISTRATÍVA
const LIB_INV = "Invenúry"
const LIB_PRJ = "Príjemky"
const LIB_REZ = "Rezervácie"
const LIB_OBJ = "Objednávky"
const LIB_DOFA = "Faktúry prijaté"
const LIB_ODFA = "Faktúry odoslané"
const LIB_POH = "Pohľadávky"
const LIB_ZAV = "Záväzky"

// EVIDENCIA
const LIB_POK = "Pokladňa"
const LIB_EP = "Evidencia prác"
const LIB_DOCH = "Dochádzka"
const LIB_KJ = "Kniha jázd"
const LIB_ZAS = "Zastávky"

// DATABÁZY
const LIB_ZAMESTNANCI = "Zamestnanci"
const LIB_KLIENTI = "Klienti"
const LIB_DODAVATELIA = "Dodávatelia"
const LIB_PARTNERI = "Partneri"
const LIB_MIESTA = "Miesta"
const LIB_UCTY = "Účty"
const LIB_STROJE = "Stroje"
const LIB_VOZIDLA = "Vozidlá"
const LIB_PLANTS = "Databáza rastlín"
const LIB_RCPTS = "Príjemky"
const LIB_Z_SADZBY = "Zamestnanci Sadzby"

// aGroup
const DBA_OBL = "aZáväzky"
const DBA_SAL= "aMzdy"
const DBA_POHLADAVKY = "aPohľadávky"
const DBA_DOCHADZKA = "aDochádzka"
const DBA_WORK = "aPráce"

// fields
// spolocne
const FLD_CENOVA_PONUKA = "Cenová ponuka" // link to entry
const FLD_ZAKAZKA = "Zákazka"
const FLD_VYUCTOVANIE = "Vyúčtovanie"
const FLD_TYP_VYKAZU = "Typ výkazu"
const FLD_POPIS = "Popis"
const FLD_ZAM = "Zamestnanec"



//
const FLD_PRACE = "Práce"
const FLD_MATERIAL = "Materiál"
const FLD_STROJE = "Stroje"
const FLD_DOPRAVA = "Doprava"
// diely polozky
const FLD_TRAVNIK = "Trávnik"
const FLD_VYSADBY = "Výsadby"
const FLD_RASTLINY = "Rastliny"
const FLD_ZAVLAZOVANIE = "Zavlažovanie"
const FLD_JAZIERKO = "Jazierko"
const FLD_KAMEN = "Kameň"
const FLD_NESTANDARDNE = "Neštandardné"
const FLD_SUBDODAVKY = "Subdodávky"
// diely hzs
const FLD_ZAHRADNICKE_PRACE = "Záhradnícke práce"
const FLD_SERVIS_ZAVLAZOVANIA = "Servis zavlažovania"
const FLD_KONZULTACIE = "Konzultácie a poradenstvo"
const FLD_PRACE_NAVYSE = "Práce navyše"
// zamestnanci
const FLD_ZAMESTNANCI = "Zamestnanci"
const FLD_HODINOVKA = "Hodinovka"
// zakazky
const FLD_UCTOVANIE_DPH = "Účtovanie DPH"

// words
const W_ZAKAZKA = "Zákazka"
const W_PRACE = "Práce"
const W_PRACE_NAVYSE = "Práce navyše"
const W_DOPRAVA = "Doprava"
const W_MATERIAL = "Materiál"
const W_STROJE = "Stroje"
const W_HODINOVKA = "Hodinovka"
const W_POLOZKY = "Položky"

// Knižnica Faktúry prijaté
// LIB_DOFA
const DOFA_SUP = "Dodávateľ"
const DOFA_SUP_NUMBER = "Číslo faktúry"
const DOFA_SUP_VS = "VS" // variabilný symbol
const DOFA_DATE = "Dátum vystavenia"
const DOFA_DUE_DATE = "Dátum splatnosti"
const DOFA_PAY_DATE = "Dátum úhrady"
const DOFA_SUM = "Suma bez DPH"
const DOFA_SUM_DPH = "DPH"
const DOFA_SUM_TOTAL = "Suma s DPH"
const DOFA_PAYED = "Uhradená"

// aZáväzky
const A_OBL_TYPE = "Typ záväzku"
const A_OBL_SUM = "Suma"
const A_OBL_DUE_DATE = "Dátum splatnosti"
const A_OBL_PAY_DATE = "Dátum úhrady"
const A_OBL_INVC = "Faktúry prijaté"
const A_OBL_PAYED = "Uhradené"

// Príjemky
// LIB_RCPTS
const RCPTS_INVC = "Faktúry prijaté"
// aMzdy

// Pokladňa/bi
// LIB_POK
// Polia
const POK_POHYB = "Pohyb" //Select
const POK_U_PREVOD = "Účel prevodu" //Select
const POK_DOKLAD = "Doklad" //Multiple choice
const POK_S_DPH = "s DPH" //Checklist
const POK_SADZBA_DPH = "sadzba DPH" //Real Number
const POK_ = "%DPH" //Real number


// Dochádzka/Attendance
// LIB_ATTDC
const ATTENDANCE = "Dochádzka"
const ATTDC_ARRIVAL = "Príchod"
const ATTDC_DEPARTURE = "Odchod"
const ATTDC_WORKS = "Práce" // Link to Entry
const ATTDC_EMPLOYEES = "Zamestnanci"


// SPOLOČNÉ POLIA
const VIEW = "view"
const VIEW_EDIT = "Editácia"
const VIEW_PRINT = "Tlač"
const VIEW_DEBUG = "Debug"
const STATUS = "Stav"
const DATE = "Dátum"
const NUMBER = "Číslo"

const NICK = "Nick"
const DBG = "debug"

const SEASON = "sezóna"
const LAST_NUM = "lastnum"
const APP_SEASON = "Sezóna" // linked field
const NUMBER_ENTRY = "number"
const CR = "zapísal"
const CR_DATE = "dátum zápisu"
const MOD = "upravil"
const MOD_DATE = "dátum úpravy"
const ENT_COLOR = "farba záznamu"
const BKG_COLOR = "farba pozadia"

// COLOR CODES
const FIREBRICK = "#B22222"
const CHARTREUSE = "#7FFF00"
const MEDIUMAQUAMARINE = "#66CDAA"

// MEMENTO COLORS

const MEM_RED = "#B22222"
const MEM_GREEN = "#669966"
const MEM_BLUE = "#4D66CC"
const MEM_LIGHT_GREEN = "#CCFFCC"
const MEM_LIGHT_YELLOW = "#FFFFCC"
const MEM_LIGHT_BLUE = "#CCFFFF"
const MEM_DEFAULT = "#FFFFFF"


