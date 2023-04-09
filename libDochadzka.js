
function verziaKniznice() {
    var result = "";
    var nazov = "dochadzkaLibrary";
    var verzia = "23.1";
    result = nazov + " " + verzia;
    return result;
}

const newEntry = en => {

}

const updateEntry = en => {

}

const prepocitatZaznamDochadzky = zaznam => {
    message("Prepočítavám záznam...v23.1");
    // výpočet pracovnej doby
    var datum = zaznam.field(DATE);
    var prichod = roundTimeQ(zaznam.field("Príchod")); //zaokrúhlenie času na 15min
    var odchod = roundTimeQ(zaznam.field("Odchod"));
    var pracovnaDoba = (odchod - prichod) / 3600000;
    zaznam.set("Príchod", prichod); //uloženie upravených časov
    zaznam.set("Odchod", odchod);
    var mzdyCelkom = 0; // mzdy za všetkých zamestnancov v ten deň
    var odpracovaneCelkom = 0; // odpracovane hod za všetkýh zamestnancov
    var evidenciaCelkom = 0; // všetky odpracované hodiny z evidencie prác
    var prestojeCelkom = 0; //TODO ak sa budú evidovať prestojeCelkom
    var zamestnanci = zaznam.field("Zamestnanci");
    var evidenciaPrac = zaznam.field("Práce");
    if (zamestnanci.length > 0) {
        for (var zm = 0; zm < zamestnanci.length; zm++) {
            //var hodinovka = zamestnanci[zm].attr("hodinovka") ? zamestnanci[zm].attr("hodinovka") : zamestnanci[zm].field("Hodinovka");
            var hodinovka = zamestnanci[zm].attr("hodinovka") ? zamestnanci[zm].attr("hodinovka") : lastSadzba(zamestnanci[zm], datum);
            var hodnotenie = zamestnanci[zm].attr("hodnotenie") ? zamestnanci[zm].attr("hodnotenie") : 5;
            var dennaMzda = zamestnanci[zm].attr("denná mzda") ? zamestnanci[zm].attr("denná mzda") : 0; // jedného zamestnanca
            // premenné z knižnice Zamestnanci
            var libZarobene = zamestnanci[zm].field("Zarobené") - dennaMzda;
            var libOdrobene = zamestnanci[zm].field("Odpracované"); // len v úprave zázbanz, odpočíta od základu už vyrátanú hodnotu
            var libVyplatene = zamestnanci[zm].field("Vyplatené");
            var libHodnotenieD = zamestnanci[zm].field(ATTENDANCE);

            zamestnanci[zm].setAttr("hodinovka", hodinovka);
            dennaMzda = (pracovnaDoba * (hodinovka
                + zamestnanci[zm].attr("+príplatok (€/h)")))
                + zamestnanci[zm].attr("+prémia (€)")
                - zamestnanci[zm].attr("-pokuta (€)");
            zamestnanci[zm].setAttr("denná mzda", dennaMzda);
            zamestnanci[zm].setAttr("hodnotenie", hodnotenie);
            // nastavenie v knižnici Zamestnanci
            libZarobene += dennaMzda;
            libOdrobene += pracovnaDoba;
            libHodnotenieD += hodnotenie;
            var libNedoplatok = libZarobene - libVyplatene;

            zamestnanci[zm].set("Zarobené", libZarobene);
            zamestnanci[zm].set("Odpracované", libOdrobene);
            zamestnanci[zm].set("Preplatok/Nedoplatok", libNedoplatok);
            zamestnanci[zm].set(ATTENDANCE, libHodnotenieD);

            mzdyCelkom += dennaMzda;
            odpracovaneCelkom += pracovnaDoba;
            //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
            if (evidenciaPrac) {
                for (var ep in evidenciaPrac) {
                    var zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                    var naZakazke = evidenciaPrac[ep].field("Odpracované/os");
                    for (var znz in zamNaZakazke) {
                        if (zamestnanci[zm].field(NICK) == zamNaZakazke[znz].field(NICK)) {
                            evidenciaCelkom += naZakazke;
                        }
                    }
                }
            }
        }
    }
    prestojeCelkom = odpracovaneCelkom - evidenciaCelkom;
    zaznam.set("Mzdové náklady", mzdyCelkom);
    zaznam.set("Pracovná doba", pracovnaDoba);
    zaznam.set("Odpracované", odpracovaneCelkom);
    zaznam.set("Na zákazkách", evidenciaCelkom);
    zaznam.set("Prestoje", prestojeCelkom);
    message("Hotovo...");
}

const aSalary = en => {
    message("Evidujem mzdy v.9");
    var salaries = libByName(DBA_SAL);
    var employees = en.field(ATTDC_EMPLOYEES);
    var links = en.linksFrom(DBA_SAL, ATTENDANCE)
    // skontrolovať či je už záznam nalinkovaný
    if (links.length > 0){
        //vymaž nalinkované záznamy
        message("Mažem už nalinkované záznamy");
        for (var l = 0; l < links.length; l++){
            links[l].trash();
        }
    }
    for (var z = 0; z < employees.length; z++) {
        var newEntry = new Object();
        newEntry[DATE] = en.field(DATE);
        newEntry[NICK] =  employees[z].field(NICK);
        newEntry["Odpracované"] = en.field("Pracovná doba");
        newEntry["Sadzba"] =  employees[z].attr("hodinovka");
        newEntry["Mzda"] =  employees[z].attr("denná mzda");
        newEntry["Vyplatiť"] =  employees[z].attr("denná mzda");
        newEntry[SEASON] = en.field(DATE).getFullYear();
        newEntry[ATTENDANCE] = en;
        newEntry["Zamestnanec"] = employees[z];
        salaries.create(newEntry);
        var entrySalaries = zaznam.linksFrom(DBA_SAL,ATTENDANCE)[0];
        entrySalaries.field(ATTENDANCE)[0].setAttr("odpracované", zaznam.field("Pracovná doba"));
        entrySalaries.field("Zamestnanec")[0].setAttr("sadzba", employees[z].attr("hodinovka"));
        // zauctuj preplatok ak je
        var preplatokLinks = employees[z].linksFrom("Pokladňa", "Zamestnanec").filter(e => e.field("Preplatok na mzde") == true);
        if (preplatokLinks.length > 0) {
            message("Účtujem preplatky");
            for (var l = 0; l < preplatokLinks.length; l++) {
                var preplatok = preplatokLinks[l].field("Preplatok");
                var vyplata = entrySalaries.field("Vyplatiť");
                if (preplatok >= vyplata) {
                    entrySalaries.set("Vyplatiť", vyplata);
                    entrySalaries.link("Platby", preplatokLinks[l]);
                    entrySalaries.field("Platby")[0].setAttr("suma", vyplata);
                    preplatok -= vyplata;
                    preplatokLinks[l].set("Preplatok", preplatok);
                } else if ( preplatok != 0 && preplatok < vyplata){
                    entrySalaries.set("Vyplatená mzda", preplatok);
                    entrySalaries.set("Vyplatiť", vyplata - preplatok);
                    entrySalaries.link("Platby", zaznam);
                    entrySalaries.field("Platby")[0].setAttr("suma", preplatok);

                }
            }

        }
    }
}
