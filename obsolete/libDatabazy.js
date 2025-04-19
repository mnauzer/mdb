// SKLAD

// PLATNOST CIEN

// CENNÍK PRÁC
const setPrice = en => {
    message("V199");

    let links = en.linksFrom("Ceny prác", "Práca");
    if (links.length > 0) {
        message(links.length);

        let date = new Date().getTime();
        message("Cena: " + price + "\nDátum: " + date);
        let price = lastValid(links, date, "Cena", "Platnosť od");
        message("Cena: " + price + "\nDátum: " + date);

        en.set("Cena bez DPH", price);
    } else {
        message("Položka nemá žiadne zaevidované ceny");
    }
}
// LIMITY PRACOVNÝCH HODÍN


// SEZÓNNE CENY PRÁC

// ÚČTY
const ucetPrijmy = ucet => {
    var sezony = ucet.field("Výber sezóny na prepočet"); //sezóny na prepočet
    var prijmyCelkom = 0;
    if (sezony.length > 0) {
        // Príjmy
        var zaznamy = ucet.linksFrom(LIB_POKLADNA, "Do pokladne");
        if (zaznamy.length > 0) {
            //          var zaznamyPrepocet = [];
            for (var s = 0; s < sezony.length; s++) {
                for (var p = 0; p < zaznamy.length; p++) {
                    if (sezony[s] == zaznamy[p].field(SEASON)) {
                        //                        zaznamyPrepocet.push(zaznamy[p]);
                        prijmyCelkom += zaznamy[p].field("Priebežná položka");
                        prijmyCelkom += zaznamy[p].field("Príjem bez DPH");
                        prijmyCelkom += zaznamy[p].field("DPH+");
                    }
                }
            }
            ucet.set("Príjmy", prijmyCelkom);
            ucet.set("Stav", prijmyCelkom - ucet.field("Výdavky"));
        } else {
            message("Nie sú žiadne záznamy príjmov pre účet " + ucet.title);
        }
    }
    else {
        message("Nie sú vybraté sezóny na prepočet");
    }
};
const ucetVydavky = ucet => {
    var sezony = ucet.field("Výber sezóny na prepočet"); //sezóny na prepočet
    var vydavkyCelkom = 0;
    if (sezony.length > 0) {
        var zaznamy = ucet.linksFrom(LIB_POKLADNA, "Z pokladne");
        if (zaznamy.length > 0) {
            for (var s = 0; s < sezony.length; s++) {
                for (var v = 0; v < zaznamy.length; v++) {

                    if (sezony[s] == zaznamy[v].field(SEASON)) {
                        vydavkyCelkom += zaznamy[v].field("Priebežná položka");
                        vydavkyCelkom += zaznamy[v].field("Výdavok bez DPH");
                        vydavkyCelkom += zaznamy[v].field("DPH-");
                    }
                }
            }
            ucet.set("Výdavky", vydavkyCelkom);
            ucet.set("Stav", ucet.field("Príjmy") - vydavkyCelkom);
        } else {
            message("Nie sú žiadne záznamy príjmov pre účet " + ucet.title);
        }
    } else {
        message("Nie sú vybraté sezóny na prepočet");
    }
}

// MIESTA



// ZAMESTNANCI
const zamestnanecPlatby = zamestnanec => {
    //    var os = zamestnanec.field("Odpracované sezóny"); // odpracované sezóny (os)
    var sz = zamestnanec.field("Výber sezóny na prepočet"); //sezóny na prepočet
    // konvertuj sz na Array sezony
    var nastaveneSezony = [];
    for (var s in sz) {
        nastaveneSezony.push(sz[s]);
    }
    var odpracovaneCelkom = 0; // vyplatené mzdy => Pokladňa
    nastaveneSezony.forEach((sezona) => {
        var platby = zamestnanec.linksFrom("Pokladňa", "Zamestnanec")
        // Mzdy
        platby = zamestnanec.linksFrom("Pokladňa", "Zamestnanec");
        if (platby) {
            for (var d in platby) {
                var dSezona = platby[d].field("Sezóna");
                if (dSezona == sezona) {
                    vyplateneCelkom += platby[d].field("Výdavok bez DPH");
                }
            }
        }
    });
    zamestnanec.set("Vyplatené", vyplateneCelkom);
    zamestnanec.set("Preplatok/Nedoplatok", zamestnanec.field("Zarobené") - vyplateneCelkom);
}
const zamestnanecDochadzka = zamestnanec => {
    //    var hs = zamestnanec.field("Hodinovka"); // nastavená hodinová sadzba (hs)
    //    var os = zamestnanec.field("Odpracované sezóny"); // odpracované sezóny (os)
    var nick = zamestnanec.field("Nick");
    var sz = zamestnanec.field("Výber sezóny na prepočet"); //sezóny na prepočet
    var hodnotenieEvidenciaCelkom = 0; //počet hviezdičiek za zákazky => Evidencia prác
    // konvertuj sz na Array sezony
    var nastaveneSezony = [];
    for (var s in sz) {
        nastaveneSezony.push(sz[s]);
    }
    var odpracovaneCelkom = 0; // odpracované hodiny celkom => Dochádzka
    var zarobeneCelkom = 0; // zarobená suma, odpracované hodiny x hodinová mzda => Dochádzka
    var hodnotenieCelkom = 0; // počet hviezdičiek => Dochádzka
    nastaveneSezony.forEach((sezona) => {
        // Dochádzka
        lfDochadzka = zamestnanec.linksFrom("Dochádzka", "Zamestnanci");
        if (lfDochadzka) {
            for (var d in lfDochadzka) {
                var dSezona = lfDochadzka[d].field("sezóna");
                if (dSezona == sezona) {
                    odpracovaneCelkom += lfDochadzka[d].field("Odpracované");
                    // prebehni pole zamestnanci
                    var vPraci = lfDochadzka[d].field("Zamestnanci");
                    for (var i in vPraci) {
                        if (vPraci[i].field("Nick") == nick) {
                            zarobeneCelkom += vPraci[i].attr("denná mzda");
                            hodnotenieCelkom += vPraci[i].attr("hodnotenie");
                        }
                    }
                }
            }
        }
    });
    zamestnanec.set("Odpracované", odpracovaneCelkom);
    zamestnanec.set("Zarobené", zarobeneCelkom);
    zamestnanec.set("Dochádzka", hodnotenieCelkom);
    zamestnanec.set("Preplatok/Nedoplatok", zarobeneCelkom - zamestnanec.field("Vyplatené"));
}
const zamestnanecPrace = zamestnanec => {
    //   var hs = zamestnanec.field("Hodinovka"); // nastavená hodinová sadzba (hs)
    //   var os = zamestnanec.field("Odpracované sezóny"); // odpracované sezóny (os)
    var sz = zamestnanec.field("Výber sezóny na prepočet"); //sezóny na prepočet
    // konvertuj sz na Array sezony
    var nastaveneSezony = [];
    for (var s in sz) {
        nastaveneSezony.push(sz[s]);
    }
    var evidenciaCelkom = 0; // hodiny odpracované na zákazkach => Evidencia prác
    nastaveneSezony.forEach((sezona) => {
        // Evidencia prác
        lfEvidencia = zamestnanec.linksFrom("Evidencia prác", "Zamestnanci");
        if (lfEvidencia) {
            for (var d in lfEvidencia) {
                var dSezona = lfEvidencia[d].field("Sezóna");
                if (dSezona == sezona) {
                    evidenciaCelkom += lfEvidencia[d].field("Odpracované/os");
                    // hodnotenieEvidenciaCelkom +=
                }
            }
        }
    });
    zamestnanec.set("Odpracované na zákazkach", evidenciaCelkom);
    //zamestnanec.set("Zákazky", hodnotenieEvidenciaCelkom);
}
const zamPlatby = (zam, sezona ) =>{
// spočítať vyplatené mzdy zamestnancovi za obdobie (rok)
    var lib = libByName("Pokladňa"); // const dbLib.js
    var entries = lib.entries();
    var vyplatene = 0;
    if (entries.length > 0){
        for (var e = 0; e < entries.length; e++) {
            if (entries[e].field("Zamestnanec") === zam && entries[e].field("sezóna") === sezona){
                vyplatene += entries[e].field("Výdavok bez DPH");
                return vyplatene;
            } else {
                message("Nie je žiadny záznam pre zamestnanca " + zam.field("Nick"));
                return 0;
            }
        }
    } else {
        message("Nie je žiadny záznam v databáze " + lib.title);
    }
}
const zamDochadzka = (zam, sezona) => {
// spočítať dochádzku zamestnanca za obdobie (rok)
    message("Prepočítavam\n zamestnanec: " + zam.field("Nick") + "\n za sezónu: " + sezona);
    var lib = libByName("Dochádzka"); // const dbLib.js
   // var entries = lib.entries().filter(entry => entry.field("sezóna") == sezona);
    var entries = zam.linksFrom("Dochádzka", "Zamestnanci").filter(entry => entry.field("sezóna") == sezona);
    message("Počet záznamov: " + entries.length);
    var odpracovane = 0;
    var zarobene = 0;
    if (entries.length > 0){
        for (var e = 0; e < entries.length; e++) {
            message("Záznam: " + e + "(" + entries[e].field("Dátum") + ")");
            var zamestnanci = entries[e].field("Zamestnanci");
            message("Zamestnancov: " + zamestnanci.length);
            for ( var z = 0; z < zamestnanci.length; z++) {
                if (zamestnanci[z].field("Nick") === zam.field("Nick")){
                    odpracovane += entries[e].field("Pracovná doba");
                }
            }

        }
        zam.set("Odpracované", odpracovane);
    } else {
        message("Nie je žiadny záznam v databáze: " + lib.title);
    }
    return odpracovane;
}

// ZAMESTNANCI SADZBY

// DODÁVATELIA


// PARTNERI


// KLIENTI


// VOZIDLÁ

// STROJE

// DOKUMENTY