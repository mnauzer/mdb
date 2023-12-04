// ADMINISTRÁCIA
const prepocitatPrijemku = prijemka => {

    prijemka.set("sezóna", prijemka.field("Dátum").getFullYear());
    var sezona = prijemka.field("sezóna");
    var sadzbaDPH = libByName("KRAJINKA APP").find(sezona)[0].field("Základná sadzba DPH") / 100;
    var polozky = prijemka.field("Položky");

    message("Prepočítavám položky...");
    if (polozky.length > 0) {
        var dph = 0;
        var marza = 0;
        var cenaCelkom = 0;

        for (var p = 0; p < polozky.length; p++) {
            var skladovaCena = polozky[p].field("NC bez DPH");
            var mnozstvo = polozky[p].attr("množstvo");
            var cena = polozky[p].attr("cena");

            if (cena > skladovaCena) {
                // ak je nákupná cena vyššia ako skladová nastaviť novú skladovú cenu
                polozky[p].set("NC bez DPH", cena);
                message("Skladová nákupná cena bola upravená");

                // prepočítať cenu v sklade
                var prirazka = polozky[p].field("Obchodná prirážka");
                if (prirazka == null || prirazka == undefined) {
                    message("Prirážka pri tovare " + polozky[p].field("Názov") + " nie je nastavená")
                } else if (prirazka < 10) {
                    message("Prirážka pri tovare " + polozky[p].field("Názov") + " je menšia ako 10%")
                }
                var pCena = cenaTovaru(cena, prirazka, sadzbaDPH);
                var pDPH = pCena * sadzbaDPH;
                var nDPH = cena * sadzbaDPH;

                polozky[p].set("NC s DPH", cena + nDPH)
                polozky[p].set("PC bez DPH", pCena);
                polozky[p].set("PC s DPH", pCena + pDPH);

            } else if (!cena) {
                cena = skladovaCena;
            }

            polozky[p].setAttr("cena", cena);
            polozky[p].setAttr("cena celkom", cena * mnozstvo);
            cenaCelkom += mnozstvo * cena;
        }

        var dph = cenaCelkom * sadzbaDPH;
        prijemka.set("Suma bez DPH", cenaCelkom);
        if (prijemka.field("s DPH")) {
            prijemka.set("Suma s DPH", cenaCelkom + dph);
            prijemka.set("DPH", dph);
        }
    }
    // End of file: 19.03.2022, 10:24
}

// FAKTÚRY VYSTAVENÉ
const checkOverdue = (en, date) => {
    if (!en.field(DOFA_PAYED)){
        if (en.field(DOFA_D_SPL) <= date ) {
            en.set(ENT_COLOR, MEM_RED)
        } else {
            en.set(ENT_COLOR, MEM_BLUE)
        }
    } else {
            en.set(ENT_COLOR, MEM_GREEN)
    }
}
const checkRcpts = en => {
// skontroluje či položky faktúry sú zaevidované na skladovej príjemke
    var receipts = libByName(LIB_RCPTS);

    var links = en.linksFrom(LIB_RCPTS, RCPTS_INVC);
    if (links.length <= 0) {
        // if not exist, create new entry
        en.set(BKG_COLOR, MEM_LIGHT_BLUE)

    } else {
        // if exist update entry
        en.set(BKG_COLOR, MEM_LIGHT_GREEN)
    }

}
const updateObligations = en => {
// vytvorí alebo upraví záznam v aZáväzky
    var obligations = libByName(DBA_OBL);
    // check if entry exist
    var links = en.linksFrom(DBA_OBL, A_OBL_INVC);
    if (links.length <= 0) {
			// if not exist, create new entry
        message("entry don't exist");

    } else {
        // if exist update entry
        message("entry exist");
    }


}

// FAKTÚRY PRIJATÉ

// ZÁVAZKY
const newEntryZavazky = (employee, en, sum) => {
    let scriptName = "newEntryZavazky 23.0.12"
    let parameters = "employee: " + employee + "\nen: " + en + "\nsum: " + sum
    let variables = "user: " + user() + "\nappLIB name: " + appLIB.name
    try {
        let date = new Date()
        let newNumber = appLIB.newNumber("Záväzky", )
        // let newNumber = getNewNumber(appLIB.DB(), appLIB.season(), appLIB.name, scriptName)
        variables += "\nnumber: " + newNumber[0]
        let popis = "Mzda " + employee.name +", za deň " // TODO: pridať a upraviť formát dátumu
        let zavazky = libByName(LIB_ZVK)
        // vytvorenie nového záznamu
        let newEntry = new Object();
        newEntry[NUMBER] = newNumber[0];
        newEntry[NUMBER_ENTRY] = newNumber[1];
        newEntry[DATE] = date;
        // TODO: zmeniť aj pre iných veriteľov ako zamestnanci
        newEntry["Typ"] = "Mzdy";
        newEntry["Zamestnanec"] = employee;
        newEntry["Dochádzka"] = en;
        newEntry["info"] = "generované automaticky z dochádzky";
        //
        newEntry["Popis"] = popis;
        newEntry["Suma"] = sum.toFixed(2);
        newEntry[SEASON]= appLIB.season()
        newEntry[CR] = user()
        newEntry[CR_DATE] = new Date()
        zavazky.create(newEntry);
        // kontrola vytvorenia záznamu

        appLIB.saveNewNumber(newNumber[1], "Záväzky")

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen( scriptName, error, variables, parameters)
    }
}

// End of file: 09.04.2023, 12:14