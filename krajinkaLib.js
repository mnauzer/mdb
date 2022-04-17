// Library/Event/Script:    Projekty\Cenové ponuky\shared\krajinkaLib_w.js
// JS Libraries:
// Dátum:                   06.03.2022
// Popis:                   knižnica dbAssistent
function verziaKrajinkaLib() {
    var nazov = "krajinkaLlib";
    var verzia = "0.2.16";
    return nazov + " v." + verzia;
}

const dbAssistent = "KRAJINKA APP";
const dbAssistentDatabazy = "KRAJINKA APP DATABÁZY";

const setEdit = entry => {
    entry.set("Tlač", "Editácia");
    return;
}


const setTlac = entry => {
    entry.set("Tlač", "Tlač");
    return;
}

const setDebug = entry => {
    entry.set("Tlač", "Debug");
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
    var entry = libByName(dbAssistent).find(sezona)[0];
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
    var rok = libByName(dbAssistent).find(sezona)[0];
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
    var sezona = entry.field("sezóna") ? entry.field("sezóna") : new Date().getFullYear();
    var prefix = 0;
    var lastNum = 0;
    var dbID = 0;
    var cislo = 0;
    var attr = "";
    var entry = libByName(dbAssistent).find(sezona)[0];
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
    sadzba = zamestnanec.field("Hodinovka");
    return sadzba;
};

const sadzbaZamestnanca = (zamestnanec, datum) => {
    var sadzba = 0;
    //zatial len zo zaznnamu
    sadzba = zamestnanec.field("Hodinovka");
    return sadzba;
};

const setTest = (status) => {
    var lib = libByName(dbAssistentDatabazy);
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
    entry.set("entry background", color)
}

const setColor = (entry, color) => {
    entry.set("entry color", color)
}
// End of file: 25.03.2022, 16:16