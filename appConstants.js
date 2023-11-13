// libraries
// app
let DB_ASSISTENT = "KRAJINKA APP";
let DB_ASSISTENT_DATABAZY = "KRAJINKA APP DATABÁZY";
// projekty
let DB_CENOVE_PONUKY = "Cenové ponuky";
let DB_ZAKAZKY = "Zákazky";
let DB_VYUCTOVANIA = "Vyúčtovania";
let DB_CENNIK_PRAC = "Cenník prác";
let DB_SKLAD = "Sklad";
let DB_PLAN_PRAC = "Plán prác";
// administratíva
let DB_VYKAZY_PRAC = "Výkaz prác";
let DB_VYKAZY_MATERIALU = "Výkaz materiálu";
let DB_VYKAZY_STROJOV = "Výkaz strojov";
let DB_VYKAZY_DOPRAVY = "Výkaz dopravy";
let DB_INVENTURY = "Invenúry";
let DB_PRIJEMKY = "Príjemky";
let DB_REZERVACIE = "Rezervácie";
let DB_OBJEDNAVKY = "Objednávky";
let DB_DOFA = "Faktúry prijaté";
let DB_ODFA = "Faktúry odoslané";

// evidencia
let DB_POKLADNA = "Pokladňa";
let DB_EVIDENCIA_PRAC = "Evidencia prác";
let DB_DOCHADZKA = "Dochádzka";
let DB_KNIHA_JAZD = "Kniha jázd";
let DB_ZASTAVKY = "Zastávky";
// databázy
let DB_ZAMESTNANCI = "Zamestnanci";
let DB_KLIENTI = "Klienti";
let DB_DODAVATELIA = "Dodávatelia";
let DB_PARTNERI = "Partneri";
let DB_MIESTA = "Miesta";
let DB_UCTY = "Účty";
let DB_STROJE = "Stroje";
let DB_VOZIDLA = "Vozidlá";
let DB_PLANTS = "Databáza rastlín";
let DB_RCPTS = "Príjemky";
let DB_Z_SADZBY = "Zamestnanci Sadzby";

// aGroup
let DBA_OBL = "aZáväzky";
let DBA_SAL= "aMzdy";
let DBA_POHLADAVKY = "aPohľadávky";
let DBA_DOCHADZKA = "aDochádzka";
let DBA_WORK = "aPráce";

// fields
// spolocne
let FLD_CENOVA_PONUKA = "Cenová ponuka" // link to entry
let FLD_ZAKAZKA = "Zákazka"
let FLD_VYUCTOVANIE = "Vyúčtovanie"
let FLD_TYP_VYKAZU = "Typ výkazu"
let FLD_POPIS = "Popis"
let FLD_ZAM = "Zamestnanec"



//
let FLD_PRACE = "Práce"
let FLD_MATERIAL = "Materiál"
let FLD_STROJE = "Stroje"
let FLD_DOPRAVA = "Doprava"
// diely polozky
let FLD_TRAVNIK = "Trávnik"
let FLD_VYSADBY = "Výsadby"
let FLD_RASTLINY = "Rastliny"
let FLD_ZAVLAZOVANIE = "Zavlažovanie"
let FLD_JAZIERKO = "Jazierko"
let FLD_KAMEN = "Kameň"
let FLD_NESTANDARDNE = "Neštandardné"
let FLD_SUBDODAVKY = "Subdodávky"
// diely hzs
let FLD_ZAHRADNICKE_PRACE = "Záhradnícke práce"
let FLD_SERVIS_ZAVLAZOVANIA = "Servis zavlažovania"
let FLD_KONZULTACIE = "Konzultácie a poradenstvo"
let FLD_PRACE_NAVYSE = "Práce navyše"
// zamestnanci
let FLD_ZAMESTNANCI = "Zamestnanci"
let FLD_HODINOVKA = "Hodinovka"
// zakazky
let FLD_UCTOVANIE_DPH = "Účtovanie DPH"

// words
let W_ZAKAZKA = "Zákazka"
let W_PRACE = "Práce"
let W_PRACE_NAVYSE = "Práce navyše"
let W_DOPRAVA = "Doprava"
let W_MATERIAL = "Materiál"
let W_STROJE = "Stroje"
let W_HODINOVKA = "Hodinovka"
let W_POLOZKY = "Položky"

// Knižnica Faktúry prijaté
// DB_DOFA
let DOFA_SUP = "Dodávateľ"
let DOFA_SUP_NUMBER = "Číslo faktúry"
let DOFA_SUP_VS = "VS" // variabilný symbol
let DOFA_DATE = "Dátum vystavenia"
let DOFA_DUE_DATE = "Dátum splatnosti"
let DOFA_PAY_DATE = "Dátum úhrady"
let DOFA_SUM = "Suma bez DPH"
let DOFA_SUM_DPH = "DPH"
let DOFA_SUM_TOTAL = "Suma s DPH"
let DOFA_PAYED = "Uhradená"

// aZáväzky
let A_OBL_TYPE = "Typ záväzku"
let A_OBL_SUM = "Suma"
let A_OBL_DUE_DATE = "Dátum splatnosti"
let A_OBL_PAY_DATE = "Dátum úhrady"
let A_OBL_INVC = "Faktúry prijaté"
let A_OBL_PAYED = "Uhradené"

// Príjemky
// DB_RCPTS
let RCPTS_INVC = "Faktúry prijaté"
// aMzdy

// Pokladňa/bi
// DB_POKLADNA
// Polia
let POK_POHYB = "Pohyb" //Select
let POK_U_PREVOD = "Účel prevodu" //Select
let POK_DOKLAD = "Doklad" //Multiple choice
let POK_S_DPH = "s DPH" //Checklist
let POK_SADZBA_DPH = "sadzba DPH" //Real Number
let POK_ = "%DPH" //Real number


// Dochádzka/Attendance
// DB_ATTDC
let ATTENDANCE = "Dochádzka"
let ATTDC_ARRIVAL = "Príchod"
let ATTDC_DEPARTURE = "Odchod"
let ATTDC_WORKS = "Práce" // Link to Entry
let ATTDC_EMPLOYEES = "Zamestnanci"


// # SPOLOČNÉ POLIA
const NUMBER = "Číslo"
const NUMBER_ENTRY = "number"
const DATE = "Dátum"
const NICK = "Nick"
const VIEW = "view"
const STATUS = "Stav"
const DBG = "debug"
const SEASON = "sezóna"
const LAST_NUM = "lastnum"
const APP_SEASON = "Sezóna" // linked field
const CR = "zapísal"
const CR_DATE = "dátum zápisu"
const MOD = "upravil"
const MOD_DATE = "dátum úpravy"
const ENT_COLOR = "farba záznamu"
const BKG_COLOR = "farba pozadia"
const VIEW_EDIT = "Editácia"
const VIEW_PRINT = "Tlač"
const VIEW_DEBUG = "Debug"

// COLOR CODES
let FIREBRICK = "#B22222";
let CHARTREUSE = "#7FFF00";
let MEDIUMAQUAMARINE = "#66CDAA";

// MEMENTO COLORS

let MEM_RED = "#B22222";
let MEM_GREEN = "#669966";
let MEM_BLUE = "#4D66CC";
let MEM_LIGHT_GREEN = "#CCFFCC";
let MEM_LIGHT_YELLOW = "#FFFFCC";
let MEM_LIGHT_BLUE = "#CCFFFF";
let MEM_DEFAULT = "#FFFFFF";


