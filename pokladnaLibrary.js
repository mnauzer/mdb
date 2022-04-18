// Library/Event/Script:    Evidencia\Pokladňa\shared\pokladnaLibrary.js
// JS Libraries:
// Dátum:                   20.03.2022
// Popis:
function verziaKniznice() {
    var result = "";
    var nazov = "pokladnaLibrary";
    var verzia = "0.2.01";
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

const prepocetPlatby = pokladna => {
    var vKniznica = verziaKniznice();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("PREPOČET PLATBY" + "\n" + vKniznica + "\n" + vKrajinkaLib);
    var datum = pokladna.field(FIELD_DATUM)
    var db = lib();
    // nastaviť sezónu
    pokladna.set(FIELD_SEZONA, datum.getFullYear());
    var sezona = pokladna.field(FIELD_SEZONA);

    // vygenerovať nové číslo
    // var cislo = pokladna.field("Číslo");
    //cislo = cislo ? cislo : noveCislo(sezona, "Pokladňa", 0, 3);
    var cislo = noveCisloV2(pokladna, db, 0, 3);
    pokladna.set(FIELD_CISLO, cislo);

    // zistiť aktuálnu sadzbu dph v databáze
    var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100
    pokladna.set("sadzba DPH", sadzbaDPH * 100);

    // inicializácia
    var zaklad = 0;
    var total = 0;
    var dph = 0;

    if (pokladna.field("Pohyb") == "Výdavok") {
        if (pokladna.field("s DPH")) {
            total = pokladna.field("Výdavok s DPH");
            zaklad = pokladna.field("Výdavok bez DPH");
            if (total) {
                zaklad = getSumaBezDPH(total, sadzbaDPH);
            } else if (zaklad) {
                zaklad = getSumaSDPH(zaklad, sadzbaDPH);
            }
            dph = total - zaklad;
            pokladna.set("Výdavok bez DPH", zaklad);
            pokladna.set("DPH-", dph);
        } else {
            pokladna.set("Výdavok s DPH", 0);
            pokladna.set("DPH-", 0);
        };
        pokladna.set("Príjem s DPH", 0);
        pokladna.set("Príjem bez DPH", 0);
        pokladna.set("DPH+", 0);
        pokladna.set("Do pokladne", null);
        pokladna.set("Účel príjmu", null);
        //pokladna.set("Zákazka", null);
        //pokladna.set("Klient", null);
        pokladna.set("Partner", null);

    } else if (pokladna.field("Pohyb") == "Príjem") {
        if (pokladna.field("s DPH")) {
            total = pokladna.field("Príjem s DPH");
            zaklad = total / (sadzbaDPH + 1);
            dph = total - zaklad;
            pokladna.set("Príjem bez DPH", zaklad);
            pokladna.set("DPH+", dph);
        } else {
            pokladna.set("Príjem s DPH", 0);
            pokladna.set("DPH+", 0);
        };
        pokladna.set("Výdavok s DPH", 0);
        pokladna.set("Výdavok bez DPH", 0);
        pokladna.set("DPH-", 0);
        pokladna.set("Z pokladne", null);
        pokladna.set("Účel výdaja", null);
        pokladna.set("Prevádzková réžia", null);
        pokladna.set("Dodávateľ", null);
        pokladna.set("Zamestnanec", null);
        pokladna.set("Stroj", null);
        pokladna.set("Vozidlo", null);
    }
    message("Hotovo...");
}
// End of file: 20.03.2022, 12:17