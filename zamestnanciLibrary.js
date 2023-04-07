function verziaKniznice() {
    var nazov = "zamestnanciLibrary";
    var verzia = "0.2.01";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

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
};

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
};

// spočítať vyplatené mzdy zamestnancovi za obdobie (rok)
const zamPlatby = (zam, sezona ) =>{
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
// spočítať dochádzku zamestnanca za obdobie (rok)
const zamDochadzka = (zam, sezona ) =>{
    message("Prepočítavam zamestnanca: " + zam.field("Nick") + "\nza sezónu: " + sezona);
    var lib = libByName("Dochádzka"); // const dbLib.js
    var entries = lib.entries().filter(entry => entry.field("sezóna") == sezona);
    message("Počet záznamov: " + entries.length);
    var odpracovane = 0;
    if (entries.length > 0){
        for (var e = 0; e < entries.length; e++) {
            var zamestnanci = entries[e].field("Zamestnanci");
            if ( zamestnanci.length > 0) {
                for ( var z = 0; z < zamestnanci.length; z++) {
                    if (zamestnanci[z] === zam){
                        odpracovane += zamestnanci[z].field("Výdavok bez DPH");
                    } else {
                        message("Nie je žiadny záznam pre zamestnanca " + zam.field("Nick"));
                    }
                }
            } else {
                message("V zázname dochádzky " + entries[e].field("Číslo") + " chýbajú zamestnanci");
            }
        }
    } else {
        message("Nie je žiadny záznam v databáze: " + lib.title);
    }
    return odpracovane;
}