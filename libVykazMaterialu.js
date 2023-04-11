

const prepocitatVydajkuMaterialu = (vykaz, uctovatDPH) => {
    var material = vykaz.field(FIELD_MATERIAL);
    var sumaBezDPH = 0;
    var sumaDPH = null;
    var sumaCelkom = null;

    var typ = vykaz.field("Typ výkazu");
    if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
    var sDPH = vykaz.field("s DPH");
    if (material.length > 0) {
        for (var p = 0; p < material.length; p++) {
            // výpočet ceny
            var dodaneMnozstvo = material[p].attr("dodané množstvo");
            var cena = material[p].attr("cena");
            var cenaCelkom = dodaneMnozstvo ? dodaneMnozstvo * cena : null;
            material[p].setAttr("cena celkom", cenaCelkom);
            sumaBezDPH += cenaCelkom;
            //výpočet ceny z cp
        }
        if (sDPH) {
            var sezona = vykaz.field(SEASON);
            if (!sezona || sezona == 0) {
                sezona = vykaz.field(DATE).getFullYear();
                vykaz.set(SEASON, sezona);
            }
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
            sumaDPH = sumaBezDPH * sadzbaDPH;
        }
        sumaCelkom = sumaBezDPH + sumaDPH;
        vykaz.set("Suma bez DPH", sumaBezDPH);
        vykaz.set("DPH", sumaDPH);
        vykaz.set("Suma s DPH", sumaCelkom);
    }
    setTlac(vykaz);
    return [sumaBezDPH, sumaDPH];
}