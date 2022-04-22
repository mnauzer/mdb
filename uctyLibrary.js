function verziaKniznice() {
    var nazov = "uctyLibrary";
    var verzia = "0.2.09";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

const ucetPrijmy = ucet => {
    var sezony = ucet.field("Výber sezóny na prepočet"); //sezóny na prepočet
    var prijmyCelkom = 0;
    if (sezony.length > 0) {
        // Príjmy
        var zaznamy = ucet.linksFrom(DB_POKLADNA, "Do pokladne");
        if (zaznamy.length > 0) {
            //          var zaznamyPrepocet = [];
            for (var z = 0; z < sezony.length; z++) {
                for (var p = 0; p < zaznamy.length; p++) {
                    if (sezony[z] == zaznamy[p].field(FIELD_SEZONA)) {
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
        for (var s = 0; s < sezony.length; s++) {
            var zaznamy = ucet.linksFrom(DB_POKLADNA, "Z pokladne");
            if (zaznamy.length > 0) {
                for (var v = 0; v < zaznamy.length; v++) {
                    var lfSezona = zaznamy[v].field(FIELD_SEZONA);
                    if (lfSezona == sezony[s]) {
                        vydavkyCelkom += zaznamy[v].field("Priebežná položka");
                        vydavkyCelkom += zaznamy[v].field("Výdavok bez DPH");
                        vydavkyCelkom += zaznamy[v].field("DPH-");
                    }
                }
            }
        }
        ucet.set("Výdavky", vydavkyCelkom);
        ucet.set("Stav", ucet.field("Príjmy") - vydavkyCelkom);
    } else {
        message("Nie sú vybraté sezóny na prepočet");
    }
};