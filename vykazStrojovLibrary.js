function verziaKniznice() {
    var result = "";
    var nazov = "vykazStrojovLibrary";
    var verzia = "0.2.02";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatZaznam = zaznam => {
    var stroje = zaznam.field("Stroje");
    var sumaBezDPH = 0;
    var dph = 0;
    var sumaBezDPHzCP = 0;
    var dphCP = 0;
    var sezona = zaznam.field("sezóna");
    var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
    if (stroje) {
        for (var p = 0; p < stroje.length; p++) {
            // výpočet ceny
            var mnozstvoCP = stroje[p].attr("množstvo z cp");
            var dodaneMnozstvo = stroje[p].attr("prevádzka mth");
            var cena = stroje[p].attr("účtovaná sadzba");
            var cenaCelkom = dodaneMnozstvo ? dodaneMnozstvo * cena : mnozstvoCP * cena;
            stroje[p].setAttr("cena celkom", cenaCelkom);
            sumaBezDPH += cenaCelkom;
            //výpočet ceny z cp
            sumaBezDPHzCP += (mnozstvoCP * cena);
        }
        dph = sumaBezDPH * sadzbaDPH;
        dphCP = sumaBezDPHzCP * sadzbaDPH;

        zaznam.set("Suma bez DPH", sumaBezDPH);
        zaznam.set("DPH", dph);
        zaznam.set("Suma s DPH", sumaBezDPH + dph);
        zaznam.set("CP Suma bez DPH", sumaBezDPHzCP);
        zaznam.set("CP DPH", dphCP);
        zaznam.set("CP Suma s DPH", sumaBezDPHzCP + dphCP);
    }
}