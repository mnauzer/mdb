
const lastSadzba = (employee, date, inputScript) => {
    let scriptName = "lastSadzba 23.0.04"
    let variables = "Zamestnanec: " + employee.name + "\nDátum: " + date
    let parameters = "employee: " + employee + "\ndate: " + date + "\ninputScript: " + input
    try {
        // odfiltruje záznamy sadzby z vyšším dátumom ako zadaný dátum
        let links = employee.linksFrom("Zamestnanci Sadzby", "Zamestnanec");
        variables += "\nZáznamov: " + links.length
        filtered = filterByDatePlatnost(links, date);
        if (filtered.length < 0) {
            msgGen(DB_DOCHADZKA, "libDochadzka.js", scriptName, 'Zamestnanec nemá zaevidovanú sadzbu k tomuto dátumu', variables, parameters);
        } else {
            filtered.reverse();
        }
        //vyberie a vráti sadzbu z prvého záznamu
        let sadzba = filtered[0].field("Sadzba");
        variables += "\nSadzba: " + sadzba
        let msgTxt = "Aktuálna sadzba zamestnanca " + employee.name + " je " + sadzba + "€/hod"
        msgGen(DB_DOCHADZKA, "libDochadzka.js", scriptName, msgTxt, variables, parameters);
        return sadzba;
    } catch (error) {
        errorGen(DB_DOCHADZKA, "libDochadzka.js", scriptName, error, variables, parameters);
    }
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
const zamDochadzka = (zam, sezona) => {
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