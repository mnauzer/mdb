// Library/Event/Script:    Evidencia\Pokladňa\shared\pokladnaLibrary.js
// JS Libraries:
// Dátum:                   20.03.2022
// Popis:
const vPokladna = "0.23.09";

const verziaPokladna = () => {
    var result = "";
    var nazov = "libPokladna";
    result = nazov + " " + vPokladna;
    return result;
}

const calcUcet = ucet => {
    var result = 0;
    // prepočíta zadaný účet
    return result;
}
const fillPopis = en => {
    let popis = en.field("Popis");
    if (!popis) {
        let typVydavku = en.field("Účel výdaja");
        switch(expression) {
            case "Mzdy zamestnanci":
                // code block
                popis = "Mzdy";
                break;
            case "Mzdy odmeny":
                // code block
                popis = "Mzdy";
                break;
            case "Mzdy externé":
                // code block
                popis = "Mzdy";
                break;
            case "Prevádzková réžia":
                // code block
                popis = "Prevádzková réžia";
                break;
            case "Nákup tovaru":
                // code block
                popis = "Nákup tovaru";
                break;
            case "Finančné poplatky":
                // code block
                popis = "Finančné poplatky";
                break;
            case "Podiely":
                // code block
                popis = "Podiely";
                break;
            case "Výdavok na zákazku":
                // code block
                popis = "Výdavok na zákazku";
                break;
            case "Súkromé do nákladov":
                // code block
                popis = "Súkromné";
                break;
            default:
                // code block
            }
        en.set("Popis", popis);
    }
}

const prepocetPlatby = en => {
    message(verziaPokladna());

    var datum = en.field(DATE);
    var db = lib();
    // nastaviť sezónu
    en.set(SEASON, datum.getFullYear());
    var sezona = en.field(SEASON);

    // vygenerovať nové číslo
    // var cislo = en.field("Číslo");
    //cislo = cislo ? cislo : noveCislo(sezona, "Pokladňa", 0, 3);
    var cislo = en.field(NUMBER) || noveCisloV2(en, db, 0, 3);
    en.set(NUMBER, cislo);

    // zistiť aktuálnu sadzbu dph v databáze
    if (en.field("s DPH")) {
        if (en.field("sadzba") === "základná") {
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100
        } else if (en.field("sadzba") === "znížená") {
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Znížená sadzba DPH") / 100
        } else if (en.field("sadzba") === "nulová") {
            var sadzbaDPH = 0;
        }
        en.set("DPH%", sadzbaDPH * 100);
    }

    // inicializácia
    var zaklad = 0;
    var total = 0;
    var dph = 0;

    if (en.field("Pohyb") == "Výdavok") {
        if (en.field("s DPH")) {
            total = en.field("Suma s DPH");
            zaklad = en.field("Suma");
            if (total) {
                zaklad = getSumaBezDPH(total, sadzbaDPH).toFixed(2);
                en.set("Suma", zaklad);
            } else if (zaklad) {
                total = getSumaSDPH(zaklad, sadzbaDPH).toFixed(2);
                en.set("Suma s DPH", total);
            }
            dph = (total - zaklad).toFixed(2);
            en.set("DPH", dph);
        } else {
            en.set("Suma s DPH", null);
            en.set("DPH", null);
        };
        en.set("Do pokladne", null);
        en.set("Účel príjmu", null);
        en.set("Partner", null);
        //en.set("Zákazka", null);
        //en.set("Klient", null);
        // en.set("Suma s DPH", 0);
        // en.set("Suma", 0);
        // en.set("DPH", 0);

    } else if (en.field("Pohyb") == "Príjem") {
        if (en.field("s DPH")) {
            total = en.field("Suma s DPH");
            zaklad = total / (sadzbaDPH + 1);
            dph = total - zaklad;
            en.set("Suma", zaklad);
            en.set("DPH", dph);
        } else {
            en.set("Suma s DPH", 0);
            en.set("DPH", 0);
        };
        en.set("Suma s DPH", 0);
        en.set("Suma", 0);
        en.set("DPH", 0);
        en.set("Z pokladne", null);
        en.set("Účel výdaja", null);
        en.set("Prevádzková réžia", null);
        en.set("Dodávateľ", null);
        en.set("Zamestnanec", null);
        en.set("Stroj", null);
        en.set("Vozidlo", null);
    }
    message("Hotovo...");
}

const vyplataMzdy = zaznam => {
    message("Evidujem platby v.13");
    var sumaUhrady =  zaznam.field("Suma");
    var mzdy = libByName("aMzdy");
    var zamestnanec = zaznam.field("Zamestnanec")[0];
    var links = zamestnanec.linksFrom("aMzdy", "Zamestnanec").filter(e => e.field("Vyúčtované") == false )
    // skontrolovať či je už záznam nalinkovaný
    if (links.length > 0){
        //updatuj nalinkované záznamy
        message("Upravujem mzdové záznamy");

        for(var l = 0; l < links.length; l++) {
            var vyplata = links[l].field("Vyplatiť");
            var mzda = links[l].field("Mzda");
            var vMzda = links[l].field("Vyplatená mzda");

            if (sumaUhrady >= vyplata) {
                links[l].set("Vyplatená mzda", vyplata);
                links[l].set("Vyplatiť", 0);
                links[l].set("Vyúčtované", true);
                links[l].link("Platby", zaznam);
                links[l].field("Platby")[0].setAttr("suma", vyplata);
                sumaUhrady -= vyplata;
            } else if ( sumaUhrady != 0 && sumaUhrady < vyplata) {
                links[l].set("Vyplatená mzda", sumaUhrady);
                links[l].set("Vyplatiť", vyplata - sumaUhrady);
                links[l].link("Platby", zaznam);
                links[l].link("Platby", zaznam);
                links[l].field("Platby")[0].setAttr("suma", sumaUhrady);
                sumaUhrady = 0;
            }
        }
        if (sumaUhrady > 0) {
            zaznam.set("Preplatok na mzde", true);
            zaznam.set("Preplatok", sumaUhrady);
        }

    } else {
        message("Nie je žiadna dochádzka na úhradu")
    }

}

const convOld = en => {
    if (en.field("Pohyb") == "Výdavok") {
        en.set("Suma", en.field("Suma").toFixed(2))
        en.set("DPH", en.field("DPH").toFixed(2))
        en.set("Suma s DPH", en.field("Suma s DPH").toFixed(2))
    } else if (en.field("Pohyb") == "Príjem") {
        en.set("Suma", en.field("Suma").toFixed(2))
        en.set("DPH", en.field("DPH").toFixed(2))
        en.set("Suma s DPH", en.field("Suma s DPH").toFixed(2))
    } else if  (en.field("Pohyb") == "PP") {
        en.set("Suma", en.field("Priebežná položka").toFixed(2))

    } else {
        message("Nie je zadaný pohyb záznamu");

    }

}
// End of file: 20.03.2022, 12:17