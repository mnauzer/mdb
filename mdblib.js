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

// Library/Event/Script:    Databázy\Zamestnanci\action library\Prepočítať stav aktívnych zamestnancov.js
// JS Libraries:
// Dátum:                   10.01.2022
// Popis:
const calcZam = ((zamestnanci) => {
    if (zamestnanci) {
        message("Prepočítavam...");
        for (var z in zamestnanci) {
            if (zamestnanci[z].field("Aktívny")) {
                var nick = zamestnanci[z].field("Nick");
                var hs = zamestnanci[z].field("Hodinovka"); // nastavená hodinová sadzba (hs)
                var os = zamestnanci[z].field("Odpracované sezóny"); // odpracované sezóny (os)
                var sz = zamestnanci[z].field("Výber sezóny na prepočet"); //sezóny na prepočet
                // premenné na spočítanie
                var odpracovaneCelkom = 0; // odpracované hodiny celkom => Dochádzka
                var zarobeneCelkom = 0; // zarobená suma, odpracované hodiny x hodinová mzda => Dochádzka
                var vyplateneCelkom = 0; // vyplatené mzdy => Pokladňa
                var evidenciaCelkom = 0; // hodiny odpracované na zákazkach => Evidencia prác
                var hodnotenieCelkom = 0; // počet hviezdičiek => Dochádzka
                var hodnotenieEvidenciaCelkom = 0; //počet hviezdičiek za zákazky => Evidencia prác
                // konvertuj sz na Array sezony
                var sezony = [];
                for (var s in sz) {
                    sezony.push(sz[s]);
                }

                sezony.forEach((sezona) => {
                    // Dochádzka
                    linksDochadzka = zamestnanci[z].linksFrom("Dochádzka", "Zamestnanci");
                    if (linksDochadzka) {
                        for (var d in linksDochadzka) {
                            var dSezona = linksDochadzka[d].field("Sezóna");
                            if (dSezona == sezona) {
                                odpracovaneCelkom += linksDochadzka[d].field("Odpracované");
                                // prebehni pole zamestnanci
                                var vPraci = linksDochadzka[d].field("Zamestnanci");
                                for (var i in vPraci) {
                                    if (vPraci[i].field("Nick") == nick) {
                                        zarobeneCelkom += vPraci[i].attr("denná mzda");
                                        hodnotenieCelkom += vPraci[i].attr("hodnotenie");
                                    }
                                }
                            }
                        }
                    }
                    // Mzdy
                    linksPlatby = zamestnanci[z].linksFrom("Pokladňa", "Zamestnanec");
                    if (linksPlatby) {
                        for (var d in linksPlatby) {
                            var dSezona = linksPlatby[d].field("Sezóna");
                            if (dSezona == sezona) {
                                vyplateneCelkom += linksPlatby[d].field("Výdavok bez DPH");
                            }
                        }
                    }

                    // Evidencia prác
                    linksEvidencia = zamestnanci[z].linksFrom("Evidencia prác", "Zamestnanci");
                    if (linksEvidencia) {
                        for (var d in linksEvidencia) {
                            var dSezona = linksEvidencia[d].field("Sezóna");
                            if (dSezona == sezona) {
                                evidenciaCelkom += linksEvidencia[d].field("Odpracované/os");
                                // hodnotenieEvidenciaCelkom +=
                            }
                        }
                    }

                });
                //message(nick + " Odpracované: " + odpracovaneCelkom + " Zarobené: " + zarobeneCelkom);
                zamestnanci[z].set("Odpracované", odpracovaneCelkom);
                zamestnanci[z].set("Zarobené", zarobeneCelkom);
                zamestnanci[z].set("Vyplatené", vyplateneCelkom);
                zamestnanci[z].set("Preplatok/Nedoplatok", zarobeneCelkom - vyplateneCelkom);
                zamestnanci[z].set("Odpracované na zákazkach", evidenciaCelkom);
                zamestnanci[z].set("Dochádzka", hodnotenieCelkom);
                //zamestnanci[z].set("Zákazky", hodnotenieEvidenciaCelkom);
            }
        }
    }
});
// End of file: 10.01.2022, 15:25