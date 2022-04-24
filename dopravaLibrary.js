const verziaDoprava = () => {
    var result = "";
    var nazov = "dopravaLibrary";
    var verzia = "0.1.01";
    result = nazov + " " + verzia;
    return result;
}

const spocitatDopravu = (zakazka, cenaCelkomBezDPH) => {
    var jazd = zakazkaPocetJazd(zakazka);
    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var vyuctovanie = zakazka.field(FIELD_VYUCTOVANIE)[0];
    var uctovanieDopravy = cp.field("Účtovanie dopravy");
    // doprava
    //message("Debug DOPRAVA " + uctovanie);
    var celkom = 0;
    switch (uctovanieDopravy) {
        case "Paušál":
            var cpPausal = cp.field("Paušál")[0];
            if (cpPausal) {
                var cena = cpPausal.attr("cena");
            } else {
                message("nie je zadaná paušálna cena v CP")
            }
            if (vyuctovanie) { // prepočet ak je už vygenerované vyúčtovanie
                var vPausal = vyuctovanie.field("Paušál")[0];
                //if
                vPausal.setAttr("cena", cena);
                vPausal.setAttr("počet jázd", jazd);
                vPausal.setAttr("cena celkom", cena * jazd);
            }
            celkom += jazd * cena;
            break;
        case "Km":
            var cpKm = cp.field("Sadzba km")[0];
            var km = 0;
            var jazdy = zakazka.linksFrom("Kniha jázd", "Zákazka")
            // spočítať kilometre
            for (var k = 0; k < jazdy.length; k++) {
                km += jazdy[k].field("Najazdené km");
            }
            if (cpKm) {
                var cena = cpKm.attr("cena");
            } else {
                message("nie ja zadaná cena za km v CP")
            }
            if (vyuctovanie) {
                var vKm = vyuctovanie.field("Sadzba km")[0];
                vKm.setAttr("cena", cena);
                vKm.setAttr("počet km", km);
                vKm.setAttr("cena", cena);
                vKm.setAttr("cena celkom", cena * km);
            }
            celkom += km * cena;
            break;
        case "% zo zákazky":
            var percento = cp.field("% zo zákazky") || 5;
            if (percento) {
                celkom = cenaCelkomBezDPH * (percento / 100);
            }
            break;
        case "Pevná cena":
            var pevnaCena = cp.field("Pevná cena");
            if (pevnaCena) {
                celkom = pevnaCena;
            }
    }
    cp.set("Doprava celkom bez DPH", celkom);
    return celkom;

};

const zakazkaPocetJazd = zakazka => {
    // počíta len cesty na miesto realizácie
    var links = zakazka.linksFrom(DB_KNIHA_JAZD, "Zákazka")
    var zastavky = zakazka.linksFrom(DB_KNIHA_JAZD, "Zastávka na zákazke")
    var jazd = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            if (links[p].field("Účel jazdy") == "Výjazd") {
                jazd += 1;
            }
        };
        for (var p = 0; p < zastavky.length; p++) {
            var remoteLinks = zastavky[p].field("Zastávka na zákazke");
            rlIndex = zistiIndexLinku(zakazka, remoteLinks)
            if (remoteLinks[rlIndex].attr("účtovať jazdu") == true) {
                jazd += 1;
            }
        };
    }
    return jazd;
};

const zakazkaKm = zakazka => {
    var links = zakazka.linksFrom(DB_KNIHA_JAZD, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += (links[p].field("Najazdené km"));
        };
        return result;
    }
};

const zakazkaCasJazdy = zakazka => {
    var links = zakazka.linksFrom(DB_KNIHA_JAZD, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += links[p].field("Trvanie") * links[p].field("Posádka").length;
        };
    }
    return result;
};