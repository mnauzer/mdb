const verziaKnihaJazd = () => {
    var nazov = "knihaJazdLibrary";
    var verzia = "0.2.01";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

const prepocitatJazdu = jazda => {
    message("Prepočítavam záznam...");
    var ciel = jazda.field("Cieľ");
    var start = jazda.field("Štart");
    var trvanie = jazda.field("Trvanie");
    var vzdialenostStart = start[0].field("Vzdialenosť");
    var vzdialenostCiel = ciel[0].field("Vzdialenosť");
    var trvanieCiel = ciel[0].field("Trvanie");
    var trvanieStart = start[0].field("Trvanie");
    var ucelJazdy = "Neurčené";
    if (jazda.field("Zákazka")[0].field("Cenová ponuka")[0]) {
        var uctovanie = jazda.field(FIELD_ZAKAZKA)[0].field(FIELD_CENOVA_PONUKA)[0].field("Účtovanie dopravy");
    } else {
        var uctovanie = "Neúčtovať";

    }

    if (ciel && start) {
        if (vzdialenostCiel == 0 && trvanieCiel == 0) {
            vzdialenostCiel = vzdialenostStart;
            trvanieCiel = trvanieStart;
            ucelJazdy = "Návrat";
        } else if (vzdialenostStart == 0 && trvanieStart == 0) {
            ucelJazdy = "Výjazd";
        }

        jazda.set("Najazdené km", vzdialenostCiel);
        jazda.set("Trvanie", (trvanieCiel / 3600000).toFixed(2));
        jazda.set("Účel jazdy", ucelJazdy);
        switch (uctovanie) {
            case "Paušál":
                if (ucelJazdy == ("Návrat")) {
                    jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                } else {
                    jazda.set("Spôsob účtovania jazdy", "Paušál");
                }
                break;
            case "Km":
                jazda.set("Spôsob účtovania jazdy", "Km");
                break;
            case "% zo zákazky":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
            case "Pevná cena":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
            case "Neúčtovať":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
        }
    } else {
        message("Nie sú všetky potrebné údaje");
    }
    message("Hotovo");
    // End of file: 22.03.2022, 14:54
}