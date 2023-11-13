// libraries
// APP
const APP = "KRAJINKA APP";
const APP_DB = "KRAJINKA APP DATABÁZY";
const APP_ERROR = "APP Errors

// PROJEKTY
const DB_CENOVE_PONUKY = "Cenové ponuky";
const DB_ZAKAZKY = "Zákazky";
const DB_VYUCTOVANIA = "Vyúčtovania";
const DB_CENNIK_PRAC = "Cenník prác";
const DB_SKLAD = "Sklad";
const DB_PLAN_PRAC = "Plán prác";
const DB_VYKAZ_PRAC = "Výkaz prác";
const DB_VYKAZ_MATERIALU = "Výkaz materiálu";
const DB_VYKAZ_STROJOV = "Výkaz strojov";
const DB_VYKAZ_DOPRAVY = "Výkaz dopravy";
const DB_STAVEBNY_DENNIK = "Stavebný denník";

// ADMINISTRATÍVA
const DB_INVENTURY = "Invenúry";
const DB_PRIJEMKY = "Príjemky";
const DB_REZERVACIE = "Rezervácie";
const DB_OBJEDNAVKY = "Objednávky";
const DB_DOFA = "Faktúry prijaté";
const DB_ODFA = "Faktúry odoslané";

// EVIDENCIA
const DB_POKLADNA = "Pokladňa";
const DB_EVIDENCIA_PRAC = "Evidencia prác";
const DB_DOCHADZKA = "Dochádzka";
const DB_KNIHA_JAZD = "Kniha jázd";
const DB_ZASTAVKY = "Zastávky";

// DATABÁZY
const DB_ZAMESTNANCI = "Zamestnanci";
const DB_KLIENTI = "Klienti";
const DB_DODAVATELIA = "Dodávatelia";
const DB_PARTNERI = "Partneri";
const DB_MIESTA = "Miesta";
const DB_UCTY = "Účty";
const DB_STROJE = "Stroje";
const DB_VOZIDLA = "Vozidlá";
const DB_PLANTS = "Databáza rastlín";
const DB_RCPTS = "Príjemky";
const DB_Z_SADZBY = "Zamestnanci Sadzby";

// aGroup
const DBA_OBL = "aZáväzky";
const DBA_SAL= "aMzdy";
const DBA_POHLADAVKY = "aPohľadávky";
const DBA_DOCHADZKA = "aDochádzka";
const DBA_WORK = "aPráce";

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
// DB_DOFA
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
// DB_RCPTS
const RCPTS_INVC = "Faktúry prijaté"
// aMzdy

// Pokladňa/bi
// DB_POKLADNA
// Polia
const POK_POHYB = "Pohyb" //Select
const POK_U_PREVOD = "Účel prevodu" //Select
const POK_DOKLAD = "Doklad" //Multiple choice
const POK_S_DPH = "s DPH" //Checklist
const POK_SADZBA_DPH = "sadzba DPH" //Real Number
const POK_ = "%DPH" //Real number


// Dochádzka/Attendance
// DB_ATTDC
const ATTENDANCE = "Dochádzka"
const ATTDC_ARRIVAL = "Príchod"
const ATTDC_DEPARTURE = "Odchod"
const ATTDC_WORKS = "Práce" // Link to Entry
const ATTDC_EMPLOYEES = "Zamestnanci"


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
const FIREBRICK = "#B22222";
const CHARTREUSE = "#7FFF00";
const MEDIUMAQUAMARINE = "#66CDAA";

// MEMENTO COLORS

const MEM_RED = "#B22222";
const MEM_GREEN = "#669966";
const MEM_BLUE = "#4D66CC";
const MEM_LIGHT_GREEN = "#CCFFCC";
const MEM_LIGHT_YELLOW = "#FFFFCC";
const MEM_LIGHT_BLUE = "#CCFFFF";
const MEM_DEFAULT = "#FFFFFF";


