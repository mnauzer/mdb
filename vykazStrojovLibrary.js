function verziaKniznice() {
    var result = "";
    var nazov = "vykazStrojovLibrary";
    var verzia = "0.2.05";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatVykazStrojov = (zaznam, sDPH = true) => {
    var stroje = zaznam.field(FIELD_STROJE);
    var sumaBezDPH = 0;
    var dph = 0;
    var sumaCelkom = 0;
    var CPsumaBezDPH = 0;
    var CPdph = 0;
    var CPsumaCelkomSDPH = 0;
    var sezona = zaznam.field(FIELD_SEZONA);
    if (!sezona || sezona == 0) {
        sezona = zaznam.field(FIELD_DATUM).getFullYear();
        zaznam.set(FIELD_SEZONA, sezona);
    }

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
            CPsumaCelkomSDPH += (mnozstvoCP * cena);
        }
        if (sDPH) {
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
            dph = sumaBezDPH * sadzbaDPH;
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
}