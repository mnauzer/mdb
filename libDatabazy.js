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
};