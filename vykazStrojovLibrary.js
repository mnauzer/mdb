const verziaVykazStrojov = () => {
    var result = "";
    var nazov = "vykazStrojovLibrary";
    var verzia = "0.2.12";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatVykazStrojov = (vykaz, uctovatDPH) => {
    var stroje = vykaz.field(FIELD_STROJE);
    var sumaBezDPH = 0;
    var dph = null;
    var sumaCelkom = null;

    var typ = vykaz.field("Typ výkazu");
    if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
    var sDPH = vykaz.field("s DPH");
    if (stroje.length > 0) {
        for (var p = 0; p < stroje.length; p++) {
            // výpočet ceny
            var mnozstvoCP = stroje[p].attr("množstvo z cp");
            var dodaneMnozstvo = stroje[p].attr("prevádzka mth");
            var cena = stroje[p].attr("účtovaná sadzba");
            var cenaCelkom = dodaneMnozstvo ? dodaneMnozstvo * cena : null;
            stroje[p].setAttr("cena celkom", cenaCelkom);
            sumaBezDPH += cenaCelkom;
            //výpočet ceny z cp
        }
        if (sDPH) {
            var sezona = vykaz.field(FIELD_SEZONA);
            if (!sezona || sezona == 0) {
                sezona = vykaz.field(FIELD_DATUM).getFullYear();
                vykaz.set(FIELD_SEZONA, sezona);
            }
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
            dph = (sumaBezDPH * sadzbaDPH).toFixed(2);
            sumaCelkom = sumaBezDPH + dph;
        }
        vykaz.set("Suma bez DPH", sumaBezDPH);
        vykaz.set("DPH", dph);
        vykaz.set("Suma s DPH", sumaCelkom);
    }
    setTlac(vykaz);
    return [sumaBezDPH, dph];
}