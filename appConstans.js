// libraries
// APP
const APP = "ASISTANTO"
const APP_DB = "ASISTANTO DB"
const APP_ERROR = "ASISTANTO Errors"
const APP_TENATNS = "ASISTANTO Tenants"
const APP_TODO = "ASISTANTO ToDo"

// PROJEKTY
const LIB_CPN = "Cenové ponuky"
const LIB_ZKZ = "Zákazky"
const LIB_VYC = "Vyúčtovania"
const LIB_CPR = "Cenník prác"
const LIB_SKL = "Sklad"
const LIB_PP = "Plán prác"
const LIB_VP = "Výkaz prác"
const LIB_VM = "Výkaz materiálu"
const LIB_VS = "Výkaz strojov"
const LIB_VD = "Výkaz dopravy"
const LIB_SD = "Stavebný denník"

// ADMINISTRATÍVA
const LIB_INV = "Invenúry"
const LIB_PRJ = "Príjemky"
const LIB_REZ = "Rezervácie"
const LIB_OBJ = "Objednávky"
const LIB_FV = "Faktúry prijaté"
const LIB_FO = "Faktúry odoslané"
const LIB_POH = "Pohľadávky"
const LIB_ZAV = "Záväzky"

// EVIDENCIA
const LIB_PKL = "Pokladňa"
const LIB_EP = "Evidencia prác"
const LIB_DOCH = "Dochádzka"
const LIB_KJ = "Kniha jázd"
const LIB_ZAS = "Zastávky"

// DATABÁZY
const LIB_ZAM = "Zamestnanci"
const LIB_KLI = "Klienti"
const LIB_DOD = "Dodávatelia"
const LIB_PAR = "Partneri"
const LIB_MIE = "Miesta"
const LIB_UCT = "Účty"
const LIB_STR = "Stroje"
const LIB_VOZ = "Vozidlá"
const LIB_DR = "Databáza rastlín"
const LIB_PRM = "Príjemky"
const LIB_ZS = "Zamestnanci Sadzby"

// aGroup
const DBA_OBL = "aZáväzky"
const DBA_SAL= "aMzdy"
const DBA_POHLADAVKY = "aPohľadávky"
const DBA_DOCHADZKA = "aDochádzka"
const DBA_WORK = "aPráce"

// fields
// spolocne
const FLD_CPN = "Cenová ponuka" // link to entry
const FLD_ZKZ = "Zákazka"
const FLD_VYC = "Vyúčtovanie"
const FLD_TV = "Typ výkazu"
const FLD_PPS = "Popis"
const FLD_ZAM = "Zamestnanec"



//
const FLD_PRC = "Práce"
const FLD_MAT = "Materiál"
const FLD_STR = "Stroje"
const FLD_DPR = "Doprava"
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
const FLD_PRC_NAVYSE = "Práce navyše"
// zamestnanci
const FLD_ZAMESTNANCI = "Zamestnanci"
const FLD_HZS = "Hodinovka"
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
// LIB_FV
const FO_DOD = "Dodávateľ"
const FO_DOD_NUMBER = "Číslo faktúry"
const FO_DOD_VS = "VS" // variabilný symbol
const FO_DATE = "Dátum vystavenia"
const FO_DUE_DATE = "Dátum splatnosti"
const FO_PAY_DATE = "Dátum úhrady"
const FO_SUM = "Suma bez DPH"
const FO_SUM_DPH = "DPH"
const FO_SUM_TOTAL = "Suma s DPH"
const FO_PAYED = "Uhradená"

// aZáväzky
const A_OBL_TYPE = "Typ záväzku"
const A_OBL_SUM = "Suma"
const A_OBL_DUE_DATE = "Dátum splatnosti"
const A_OBL_PAY_DATE = "Dátum úhrady"
const A_OBL_INVC = "Faktúry prijaté"
const A_OBL_PAYED = "Uhradené"

// Príjemky
// LIB_PRM
const RCPTS_INVC = "Faktúry prijaté"
// aMzdy

// Pokladňa/bi
// LIB_PKL
// Polia
const POK_POHYB = "Pohyb" //Select
const POK_U_PREVOD = "Účel prevodu" //Select
const POK_DOKLAD = "Doklad" //Multiple choice
const POK_S_DPH = "s DPH" //Checklist
const POK_SADZBA_DPH = "sadzba DPH" //Real Number
const POK_ = "%DPH" //Real number


// Dochádzka/Attendance
// LIB_ATTDC
const DOCH_ARRIVAL = "Príchod"
const DOCH_DEPARTURE = "Odchod"
const DOCH_WORKS = "Práce" // Link to Entry
const DOCH_EMPLOYEES = "Zamestnanci"


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


