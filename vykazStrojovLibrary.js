function verziaKniznice() {
    var result = "";
    var nazov = "vykazStrojovLibrary";
    var verzia = "0.2.11";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatVykazStrojov = (zaznam, uctovatDPH) => {
    var stroje = zaznam.field(FIELD_STROJE);
    var sumaBezDPH = 0;
    var dph = 0;
    var sumaCelkom = 0;
    var CPsumaBezDPH = 0;
    var CPdph = 0;
    var CPsumaCelkomSDPH = 0;
    var typ = zaznam.field("Typ účtovania");
    if (uctovatDPH) { zaznam.set("s DPH", uctovatDPH) };
    var sDPH = zaznam.field("s DPH");
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
            CPsumaBezDPH += (mnozstvoCP * cena);
        }
        if (sDPH) {
            var sezona = zaznam.field(FIELD_SEZONA);
            if (!sezona || sezona == 0) {
                sezona = zaznam.field(FIELD_DATUM).getFullYear();
                zaznam.set(FIELD_SEZONA, sezona);
            }
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
            dph = (sumaBezDPH * sadzbaDPH).toFixed(2);
            sumaCelkom = sumaBezDPH + dph;
            CPdph = CPsumaBezDPH * sadzbaDPH;
            CPsumaCelkomSDPH = CPsumaBezDPH + CPdph;
        }
        zaznam.set("Suma bez DPH", sumaBezDPH);
        zaznam.set("DPH", dph);
        zaznam.set("Suma s DPH", sumaCelkom);

        zaznam.set("CP Suma bez DPH", CPsumaBezDPH);
        zaznam.set("CP DPH", CPdph);
        zaznam.set("CP Suma s DPH", CPsumaCelkomSDPH);
    }
    return [sumaBezDPH, dph];
}