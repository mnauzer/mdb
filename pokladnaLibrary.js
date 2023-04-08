// Library/Event/Script:    Evidencia\Pokladňa\shared\pokladnaLibrary.js
// JS Libraries:
// Dátum:                   20.03.2022
// Popis:
const verziaPokladna = () => {
    var result = "";
    var nazov = "pokladnaLibrary";
    var verzia = "0.2.06";
    result = nazov + " " + verzia;
    return result;
}

const getSumaBezDPH = (sumaSDPH, sadzbaDPH) => {
    result = 0;
    result = sumaSDPH / (sadzbaDPH + 1);
    return result;
}

const getSumaSDPH = (sumaBezDPH, sadzbaDPH) => {
    result = 0;
    result = sumaBezDPH * (sadzbaDPH + 1);
    return result;
}

const calcUcet = (ucet) => {
    var result = 0;
    // prepočíta zadaný účet
    return result;
}

const prepocetPlatby = platba => {
    var vKniznica = verziaPokladna();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("PREPOČET PLATBY" + "\n" + vKniznica + "\n" + vKrajinkaLib);

    var datum = platba.field(FIELD_DATUM);
    var db = lib();
    // nastaviť sezónu
    platba.set(FIELD_SEZONA, datum.getFullYear());
    var sezona = platba.field(FIELD_SEZONA);

    // vygenerovať nové číslo
    // var cislo = platba.field("Číslo");
    //cislo = cislo ? cislo : noveCislo(sezona, "Pokladňa", 0, 3);
    var cislo = platba.field(FIELD_CISLO) || noveCisloV2(platba, db, 0, 3);
    platba.set(FIELD_CISLO, cislo);

    // zistiť aktuálnu sadzbu dph v databáze
    var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100
    platba.set("sadzba DPH", sadzbaDPH * 100);

    // inicializácia
    var zaklad = 0;
    var total = 0;
    var dph = 0;

    if (platba.field("Pohyb") == "Výdavok") {
        if (platba.field("s DPH")) {
            total = platba.field("Výdavok s DPH");
            zaklad = platba.field("Výdavok bez DPH");
            if (total) {
                zaklad = getSumaBezDPH(total, sadzbaDPH);
            } else if (zaklad) {
                zaklad = getSumaSDPH(zaklad, sadzbaDPH);
            }
            dph = total - zaklad;
            platba.set("Výdavok bez DPH", zaklad);
            platba.set("DPH-", dph);
        } else {
            platba.set("Výdavok s DPH", 0);
            platba.set("DPH-", 0);
        };
        platba.set("Príjem s DPH", 0);
        platba.set("Príjem bez DPH", 0);
        platba.set("DPH+", 0);
        platba.set("Do pokladne", null);
        platba.set("Účel príjmu", null);
        //platba.set("Zákazka", null);
        //platba.set("Klient", null);
        platba.set("Partner", null);

    } else if (platba.field("Pohyb") == "Príjem") {
        if (platba.field("s DPH")) {
            total = platba.field("Príjem s DPH");
            zaklad = total / (sadzbaDPH + 1);
            dph = total - zaklad;
            platba.set("Príjem bez DPH", zaklad);
            platba.set("DPH+", dph);
        } else {
            platba.set("Príjem s DPH", 0);
            platba.set("DPH+", 0);
        };
        platba.set("Výdavok s DPH", 0);
        platba.set("Výdavok bez DPH", 0);
        platba.set("DPH-", 0);
        platba.set("Z pokladne", null);
        platba.set("Účel výdaja", null);
        platba.set("Prevádzková réžia", null);
        platba.set("Dodávateľ", null);
        platba.set("Zamestnanec", null);
        platba.set("Stroj", null);
        platba.set("Vozidlo", null);
    }
    message("Hotovo...");
}

const vyplataMzdy = zaznam => {
    message("Evidujem platby v.12");
    var sumaUhrady =  zaznam.field("Výdavok bez DPH");
    var mzdy = libByName("aMzdy");
    var zamestnanec = zaznam.field("Zamestnanec")[0];
    var links = zamestnanec.linksFrom("aMzdy", "Zamestnanec").filter(e => e.field("Vyúčtované") == false )
    // skontrolovať či je už záznam nalinkovaný
    if (links.length > 0){
        //updatuj nalinkované záznamy
        message("Updatujem mzdové záznamy");

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
// End of file: 20.03.2022, 12:17