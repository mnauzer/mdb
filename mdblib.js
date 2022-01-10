const version = "0.1";
// padding number
const pad = ((number, length) => {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
});

const roundTimeQ = (time => {
    var timeToReturn = new Date(time);

    timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
    return timeToReturn;

});

const remoteMessage = (
    (mes) => {
        message("Remote script: " + mes);
    });

// Popis:                   prepočíta dáta zamestnanca
const calcZam = ((zamestnanec, libraries) => {
    message("Verzia: " + version + " Output: " + libraries);

    var nick = zamestnanec.field("Nick");
    var hs = zamestnanec.field("Hodinovka"); // nastavená hodinová sadzba (hs)
    var os = zamestnanec.field("Odpracované sezóny"); // odpracované sezóny (os)
    var sz = zamestnanec.field("Výber sezóny na prepočet"); //sezóny na prepočet
    // premenné na spočítanie
    var hodnotenieEvidenciaCelkom = 0; //počet hviezdičiek za zákazky => Evidencia prác
    // konvertuj sz na Array sezony
    var nastaveneSezony = [];
    for (var s in sz) {
        nastaveneSezony.push(sz[s]);
    }
    nastaveneSezony.forEach((sezona) => {

        // Dochádzka
        if ((libraries.find(library => library == "Dochádzka")) >= 0) {
            var odpracovaneCelkom = 0; // odpracované hodiny celkom => Dochádzka
            var zarobeneCelkom = 0; // zarobená suma, odpracované hodiny x hodinová mzda => Dochádzka
            var hodnotenieCelkom = 0; // počet hviezdičiek => Dochádzka
            lfDochadzka = zamestnanec.linksFrom("Dochádzka", "Zamestnanci");
            if (lfDochadzka) {
                for (var d in lfDochadzka) {
                    var dSezona = lfDochadzka[d].field("Sezóna");
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
            zamestnanec.set("Odpracované", odpracovaneCelkom);
            zamestnanec.set("Zarobené", zarobeneCelkom);
            zamestnanec.set("Dochádzka", hodnotenieCelkom);
            zamestnanec.set("Preplatok/Nedoplatok", zarobeneCelkom - zamestnanec.field("Vyplatené"));
        }
        // Mzdy
        if ((libraries.find(library => library == "Platby")) >= 0) {
            var vyplateneCelkom = 0; // vyplatené mzdy => Pokladňa
            lfPlatby = zamestnanec.linksFrom("Pokladňa", "Zamestnanec");
            if (lfPlatby) {
                for (var d in lfPlatby) {
                    var dSezona = lfPlatby[d].field("Sezóna");
                    if (dSezona == sezona) {
                        vyplateneCelkom += lfPlatby[d].field("Výdavok bez DPH");
                    }
                }
            }
            zamestnanec.set("Vyplatené", vyplateneCelkom);
            zamestnanec.set("Preplatok/Nedoplatok", zamestnanec.field("Zarobené") - vyplateneCelkom);
        }

        // Evidencia prác
        if ((libraries.find(library => library == "Práce")) >= 0) {
            var evidenciaCelkom = 0; // hodiny odpracované na zákazkach => Evidencia prác
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
            zamestnanec.set("Odpracované na zákazkach", evidenciaCelkom);
        }
    });
    //zamestnanec.set("Zákazky", hodnotenieEvidenciaCelkom);
});
// End of file: 10.01.2022, 15:25
