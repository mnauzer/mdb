
const novyVykazMaterialu = (zakazka, popis) => {
    let scriptName = "novyVykazMaterialu 23.1.03";
    let variables = "Zákazka: " + zakazka.name + "\n"
    let parameters = "zakazka: " + zakazka + "\npopis: "+ popis
    if(zakazka === undefined ){
        msgGen("libVykazMaterialu.js", scriptName, "zakazka entry is undefined", variables, parameters);
        cancel();
        exit();
    }
    try {
        var lib = libByName(DB_VYKAZY_MATERIALU);
        var season = getSeason(zakazka, DB_VYKAZY_MATERIALU, scriptName)
        var appDB = getAppSeasonDB(season, DB_VYKAZY_MATERIALU, scriptName);
        var newNumber = getNewNumber(appDB, season, DB_VYKAZY_MATERIALU, scriptName);
        // vytvoriť novú výdajku
        var novyVykaz = new Object();
        novyVykaz[NUMBER] = newNumber[0];
        novyVykaz["number"] = newNumber[1];
        novyVykaz["Dátum"] = zakazka.field("Dátum");
        novyVykaz["Popis"] = popis;
        novyVykaz["s DPH"] = true; // hardcoded
        novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
        novyVykaz["Vydané"] = "Zákazka";
        novyVykaz["Zákazka"] = zakazka;
        novyVykaz["Cenová ponuka"] = zakazka.field("Cenová ponuka")[0];
        novyVykaz[SEASON] = season;
        lib.create(novyVykaz);
        var vydajkaMaterialu = lib.find(newNumber[0])[0];
        let msgTxt = "Vygenerovaná nová výdajka materiálu č." + newNumber[0]
        message(msgTxt)
        msgGen(DB_VYKAZY_MATERIALU, "libVykazMaterialu.js", scriptName, msgTxt, variables, parameters)
        return vydajkaMaterialu;
    } catch (error) {
        errorGen(DB_VYKAZY_MATERIALU, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }
}

const prepocitatVykazMaterialu = (vykaz, uctovatDPH) => {
    let scriptName = "prepocitatVykazMaterialu 23.0.01";
    let variables = "Záznam: " + vykaz.name + "\nÚčtovať DPH: " + uctovatDPH
    let parameters = "vykaz: " + vykaz + "\nuctovatDPH: "+ uctovatDPH
    try {
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
        return [sumaBezDPH, sumaDPH];
    } catch (error) {
        errorGen(DB_VYKAZY_MATERIALU, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }

}