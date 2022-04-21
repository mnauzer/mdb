// Library/Event/Script:    Projekty\Cenové ponuky\shared\krajinkaLib.js
// JS Libraries:
// Dátum:                   06.03.2022
// Popis:                   knižnica krajinkaLib
function verziaKrajinkaLib() {
    var nazov = "krajinkaLlib";
    var verzia = "0.2.22";
    return nazov + " v." + verzia;
}

// libraries
// app
const DB_ASSISTENT = "KRAJINKA APP";
const DB_ASSISTENT_DATABAZY = "KRAJINKA APP DATABÁZY";
// projekty
const DB_CENOVE_PONUKY = "Cenové ponuky";
const DB_ZAKAZKY = "Zákazky";
const DB_VYUCTOVANIA = "Vyúčtovania";
const DB_CENNIK_PRAC = "Cenník prác";
const DB_SKLAD = "Sklad Krajinka";
const DB_PLAN_PRAC = "Plán prác";
// administratíva
const DB_VYKAZY_PRAC = "Výkaz prác";
const DB_VYDAJKY_MATERIALU = "Výdajky";
const DB_VYKAZY_STROJOV = "Výkaz strojov";
const DB_INVENTURY = "Invenúry";
const DB_PRIJEMKY = "Príjemky";
const DB_REZERVACIE = "Rezervácie";
const DB_OBJEDNAVKY = "Objednávky";
// evidencia
const DB_POKLADNA = "Pokladňa";
const DB_EVIDENCIA_PRAC = "Evidencia prác";
const DB_DOCHADZKA = "Dochádzka";
const DB_KNIHA_JAZD = "Kniha jázd";
const DB_ZASTAVKY = "Zastávky";
// databázy
const DB_ZAMESTNANCI = "Zamestnanci";
const DB_KLIENTI = "Klienti";
const DB_DODAVATELIA = "Dodávatelia";
const DB_PARTNERI = "Partneri";
const DB_MIESTA = "Miesta";
const DB_UCTY = "Účty";
const DB_STROJE = "Stroje";
const DB_VOZIDLA = "Vozidlá";
const DB_RASTLINY = "Databáza rastlín";

// fields
const FIELD_CENOVA_PONUKA = "Cenová ponuka"; // link to entry
const FIELD_ZAKAZKA = "Zákazka";
const FIELD_VYUCTOVANIE = "Vyúčtovanie";
const FIELD_TYP_VYKAZU = "Typ výkazu";
const FIELD_POPIS = "Popis";
const FIELD_CISLO = "Číslo";
// nastavenia
const FIELD_SEZONA = "sezóna";
const FIELD_DEBUG = "debug";
const FIELD_BACKROUND_COLOR = "background color";
const FIELD_ENTRY_COLOR = "entry color";
const FIELD_VIEW = "Tlač";
//
const FIELD_PRACE = "Práce";
const FIELD_MATERIAL = "Materiál";
const FIELD_STROJE = "Stroje";
const FIELD_DOPRAVA = "Doprava";
// diely polozky
const FIELD_TRAVNIK = "Trávnik";
const FIELD_VYSADBY = "Výsadby";
const FIELD_RASTLINY = "Rastliny";
const FIELD_ZAVLAZOVANIE = "Zavlažovanie";
const FIELD_JAZIERKO = "Jazierko";
const FIELD_KAMEN = "Kameň";
const FIELD_NESTANDARDNE = "Neštandardné";
const FIELD_SUBDODAVKY = "Subdodávky";
// diely hzs
const FIELD_ZAHRADNICKE_PRACE = "Záhradnícke práce";
const FIELD_SERVIS_ZAVLAZOVANIA = "Servis zavlažovania";
const FIELD_KONZULTACIE = "Konzultácie a poradenstvo"
const FIELD_PRACE_NAVYSE = "Práce navyše";
const FIELD_DATUM = "Dátum";
// zamestnanci
const FIELD_ZAMESTNANCI = "Zamestnanci";
const FLD_ZAMESTNANCI = 'field("Zamestnanci")';
const FIELD_HODINOVKA = "Hodinovka";
const FLD_HODINOVKA = 'field("Hodinovka")';


// words
const W_ZAKAZKA = "Zákazka";
const W_PRACE = "Práce";
const W_PRACE_NAVYSE = "Práce navyše";
const W_DOPRAVA = "Doprava";
const W_MATERIAL = "Materiál";
const W_STROJE = "Stroje";
const W_HODINOVKA = "Hodinovka";
const W_POLOZKY = "Položky";


const setEdit = entry => {
    entry.set(FIELD_VIEW, "Editácia");
    entry.set("debug", false);
    return;
}

const setTlac = entry => {
    entry.set(FIELD_VIEW, "Tlač");
    entry.set("debug", false);
    return;
}

const pad = (number, length) => {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

// zaokrúhľovanie času na 1/4 hodiny
const roundTimeQ = time => {
    var timeToReturn = new Date(time);
    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
    return timeToReturn;
};

// kontrola či je databáza v móde testovania
const isTest = (sezona, db) => {
    //message("zisťujem stav app a databázy...");
    var entry = libByName(DB_ASSISTENT).find(sezona)[0];
    var appStatus = entry.field("Prevádzka appky");
    if (db && db.field("Testovanie")) {
        var test = true;
        // message("databáza " + db.field("Názov") + " je v testovacom režime...");
    } else if (appStatus == "Testovanie") {
        var test = true;;
        // message("aplikácia je v testovacom režime...");
    } else {
        var test = false;
    }
    return test;
};

// generuje nové číslo záznamu
const noveCislo = (sezona, db, withPrefix, sliceNum) => {
    var prefix = 0;
    var lastNum = 0;
    var dbID = 0;
    var cislo = 0;
    var attr = "";
    var rok = libByName(DB_ASSISTENT).find(sezona)[0];
    //message(rok.length);
    var databazy = rok.field("Databázy");

    for (var d = 0; d < databazy.length; d++) {
        if (databazy[d].field("Názov") === db) {
            //  message("Cyklus " + d + "Databáza ..." + databazy[d].field("Názov"));
            var test = isTest(sezona, databazy[d]);
            attr = test ? "číslo testu" : "posledné číslo";
            lastNum = databazy[d].attr(attr);
            databazy[d].setAttr(attr, lastNum + 1);
            prefix = test ? "T!" + databazy[d].field("Prefix") : databazy[d].field("Prefix");
            dbID = test ? "T!" + databazy[d].field("ID") : databazy[d].field("ID");
            cislo = withPrefix ? prefix + sezona.slice(sliceNum) + pad(lastNum, 3) : dbID + sezona.slice(sliceNum) + pad(lastNum, 3);
            // message("generujem prefix: " + withPrefix ? prefix : dbID);
        }
    }
    return cislo;
};

// generuje nové číslo záznamu
const noveCisloV2 = (entry, lib, withPrefix, sliceNum) => {
    var db = lib.title;
    var sezona = entry.field(FIELD_SEZONA) ? entry.field(FIELD_SEZONA) : new Date().getFullYear();
    var prefix = 0;
    var lastNum = 0;
    var dbID = 0;
    var cislo = 0;
    var attr = "";
    var entry = libByName(DB_ASSISTENT).find(sezona)[0];
    var databazy = entry.field("Databázy");

    for (var d = 0; d < databazy.length; d++) {
        if (databazy[d].field("Názov") === db) {
            //  message("Cyklus " + d + "Databáza ..." + databazy[d].field("Názov"));
            var test = isTest(sezona, databazy[d]);
            attr = test ? "číslo testu" : "posledné číslo";
            lastNum = databazy[d].attr(attr);
            databazy[d].setAttr(attr, lastNum + 1);
            prefix = test ? "T!" + databazy[d].field("Prefix") : databazy[d].field("Prefix");
            dbID = test ? "T!" + databazy[d].field("ID") : databazy[d].field("ID");
            cislo = withPrefix ? prefix + sezona.slice(sliceNum) + pad(lastNum, 3) : dbID + sezona.slice(sliceNum) + pad(lastNum, 3);
            // message("generujem prefix: " + withPrefix ? prefix : dbID);
        }
    }
    return cislo;
};

const pullAddress = klient => {
    var meno = (klient.field("Titul") + klient.field("Meno") + " " + klient.field("Priezvisko")).trim();
    var ulica = klient.field("Ulica");
    var mesto = (klient.field("PSČ") + " " + klient.field("Mesto")).trim();
    var adresa = meno + "\n" + ulica + "\n" + mesto + "\n";
    return adresa;
};

const marzaPercento = (pc, nc) => {
    var result = (((pc - nc) / pc) * 100).toFixed(2);
    return result;
}

const ziskSuma = (pc, nc, dph) => {
    var result = (pc - nc) - ((pc - nc) * dph);
    return result;
}

// zistiť aké je percento rabatu z nc
const rabatPercento = (euro, pc) => {
    var result = euro / pc * 100;
    return result;
}

// aké ja suma v eurách z percenta rabatu a predajnej ceny
const rabatSuma = (percento, pc) => {
    var result = percento / 100 * pc;
    return result;
}

// aké je percento prirážky z nákupnej a predajnej ceny
const prirazkaSuma = (pc, nc) => {
    var result = (pc - nc) / nc * 100;
    return result;
}

const getPCTovaru = (nc, prirazka, sadzbaDPH) => {
    // vypočíta predajnú cenu bez dph z nákupnej ceny a prirážky
    //
    var pcBezDPH = 0;
    var pcSDPH = 0;
    var koefDPH = sadzbaDPH / 100 + 1;
    var koefPrirazka = prirazka / 100 + 1;
    pcSDPH = ((nc * koefPrirazka) * koefDPH).toFixed(1);
    pcBezDPH = pcSDPH / koefDPH;
    return pcBezDPH;
}

const getNCTovaru = (pc, prirazka, sadzbaDPH) => {
    // vypočítať nákupnú cenu bez dph z predajnej ceny a prirážky
    //
    var pcBezDPH = 0;
    var pcSDPH = 0;
    var koefDPH = sadzbaDPH / 100 + 1;
    var koefPrirazka = prirazka / 100 + 1;
    pcSDPH = ((pc * koefPrirazka) * koefDPH).toFixed(1);
    pcBezDPH = pcSDPH / koefDPH;
    return pcBezDPH;
};

const sadzbaZamestnanca2 = (zamestnanec, datum) => {
    var sadzba = 0;
    //zatial len zo zaznnamu
    sadzba = zamestnanec.field(FIELD_HODINOVKA);
    return sadzba;
};

const sadzbaZamestnanca = (zamestnanec, datum) => {
    var sadzba = 0;
    //zatial len zo zaznnamu
    sadzba = zamestnanec.field(FIELD_HODINOVKA);
    return sadzba;
};

const setTest = (status) => {
    var lib = libByName(DB_ASSISTENT_DATABAZY);
    var databazy = lib.entries();
    for (var d = 0; d < databazy.length; d++) {
        databazy[d].set("Testovanie", status);
    }
    if (status) {
        message("Databázy nastavené na Testovanie");
    } else {
        message("Databázy nastavené na Ostrý režim");
    }
}

const mclChecked = (mcl, value) => {
    result = false;
    for (var m = 0; m < mcl.length; m++) {
        if (value === mcl[m]) {
            result = true;
        }
    }
    return result;
}

const setBackgroudColor = (entry, color) => {
    entry.set(FIELD_BACKROUND_COLOR, color)
}

const setColor = (entry, color) => {
    entry.set(FIELD_ENTRY_COLOR, color)
}
// End of file: 25.03.2022, 16:16