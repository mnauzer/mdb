
const newEntryVykazMaterialu = en => {
    let scriptName = "newEntryVykazMaterialu 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    message("Nový záznam - " + mementoLibrary)
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, mementoLibrary, scriptName)
        let appDB = getAppSeasonDB(season, mementoLibrary, scriptName)
        let number = getNewNumber(appDB, season, mementoLibrary, scriptName)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }
}

const updateEntryVykazMaterialu = en => {
    let scriptName = "updateEntryVykazMaterialu 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    message("Úprava záznamu - " + mementoLibrary);
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters);
    }
}

const saveEntryVykazMaterialu = en => {
    let scriptName = "saveEntryVykazMaterialu 23.0.01"
    let mementoLibrary = lib().title
    let variables = "Záznam: " + en.name + "mementoLibrary: " + mementoLibrary
    let parameters = "en: " + en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, mementoLibrary)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, mementoLibrary)
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters);
    }
}

const novyVykazMaterialu = (zakazka, popis) => {
    let scriptName = "novyVykazMaterialu 23.1.04";
    let variables = "Zákazka: " + zakazka.name + "\n"
    let parameters = "zakazka: " + zakazka + "\npopis: "+ popis
    if(zakazka === undefined ){
        msgGen("libVykazMaterialu.js", scriptName, "zakazka entry is undefined", variables, parameters);
        cancel();
        exit();
    }
    try {
        var lib = libByName(LIB_VM);
        var season = getSeason(zakazka, LIB_VM, scriptName)
        var appDB = getAppSeasonDB(season, LIB_VM, scriptName);
        var newNumber = getNewNumber(appDB, season, LIB_VM, scriptName);
        // vytvoriť novú výdajku
        var novyVykaz = new Object();
        novyVykaz[NUMBER] = newNumber[0];
        novyVykaz[NUMBER_ENTRY] = newNumber[1];
        novyVykaz[DATE] = zakazka.field("Dátum");
        novyVykaz["Popis"] = popis;
        novyVykaz["s DPH"] = true; // hardcoded
        novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
        novyVykaz["Vydané"] = "Zákazka";
        novyVykaz[FLD_ZKZ] = zakazka;
        novyVykaz[SEASON] = season;
        novyVykaz[CR] = user()
        novyVykaz[CR_DATE] = new Date()
        lib.create(novyVykaz);
        var vydajkaMaterialu = lib.find(newNumber[0])[0];
        let msgTxt = "Vygenerovaná nová výdajka materiálu č." + newNumber[0]
        message(msgTxt)
        msgGen(LIB_VM, "libVykazMaterialu.js", scriptName, msgTxt, variables, parameters)
        return vydajkaMaterialu;
    } catch (error) {
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }
}

const prepocitatVykazMaterialu = (vykaz, uctovatDPH) => {
    let scriptName = "prepocitatVykazMaterialu 23.0.01";
    let variables = "Záznam: " + vykaz.name + "\nÚčtovať DPH: " + uctovatDPH
    let parameters = "vykaz: " + vykaz + "\nuctovatDPH: "+ uctovatDPH
    try {
        var material = vykaz.field(FLD_MAT);
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
                var sadzbaDPH = libByName(APP).find(sezona)[0].field("Základná sadzba DPH") / 100;
                sumaDPH = sumaBezDPH * sadzbaDPH;
            }
            sumaCelkom = sumaBezDPH + sumaDPH;
            vykaz.set("Suma bez DPH", sumaBezDPH);
            vykaz.set("DPH", sumaDPH);
            vykaz.set("Suma s DPH", sumaCelkom);
        }
        return [sumaBezDPH, sumaDPH];
    } catch (error) {
        errorGen(LIB_VM, "libVykazMaterialu.js", scriptName, error, variables, parameters)
    }

}