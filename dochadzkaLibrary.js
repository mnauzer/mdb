
function verziaKniznice() {
    var result = "";
    var nazov = "dochadzkaLibrary";
    var verzia = "0.2.02";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatZaznamDochadzky = zaznam => {
    message("Prepočítavám záznam...");
    // výpočet pracovnej doby
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
    if (zamestnanci) {
        for (var zm in zamestnanci) {
            var hodinovka = zamestnanci[zm].attr("hodinovka") ? zamestnanci[zm].attr("hodinovka") : zamestnanci[zm].field("Hodinovka");
            var hodnotenie = zamestnanci[zm].attr("hodnotenie") ? zamestnanci[zm].attr("hodnotenie") : 5;
            var dennaMzda = zamestnanci[zm].attr("denná mzda") ? zamestnanci[zm].attr("denná mzda") : 0; // jedného zamestnanca
            // premenné z knižnice Zamestnanci
            var libZarobene = zamestnanci[zm].field("Zarobené") - dennaMzda;
            var libOdrobene = zamestnanci[zm].field("Odpracované"); // len v úprave zázbanz, odpočíta od základu už vyrátanú hodnotu
            var libVyplatene = zamestnanci[zm].field("Vyplatené");
            var libHodnotenieD = zamestnanci[zm].field("Dochádzka");

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
            zamestnanci[zm].set("Dochádzka", libHodnotenieD);

            mzdyCelkom += dennaMzda;
            odpracovaneCelkom += pracovnaDoba;
            //  prejsť záznam prác, nájsť každého zamestnanca z dochádzky a spočítať jeho hodiny v evidencii
            if (evidenciaPrac) {
                for (var ep in evidenciaPrac) {
                    var zamNaZakazke = evidenciaPrac[ep].field("Zamestnanci");
                    var naZakazke = evidenciaPrac[ep].field("Odpracované/os");
                    for (var znz in zamNaZakazke) {
                        if (zamestnanci[zm].field("Nick") == zamNaZakazke[znz].field("Nick")) {
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

const newMzdy = zaznam => {
    message("Evidujem mzdy v.9");
    var mzdy = libByName("aMzdy");
    var zamestnanci = zaznam.field("Zamestnanci");
    var links = zaznam.linksFrom("aMzdy", "Dochádzka")
    // skontrolovať či je už záznam nalinkovaný
    if (links.length > 0){
        //vymaž nalinkované záznamy
        message("Mažem už nalinkované záznamy");
        for (var l = 0; l < links.length; l++){
            links[l].trash();
        }
    }
    for (var z = 0; z < zamestnanci.length; z++) {
        var novyZaznam = new Object();
        novyZaznam["Dátum"] = zaznam.field("Dátum");
        novyZaznam["Nick"] =  zamestnanci[z].field("Nick");
        novyZaznam["Odpracované"] = zaznam.field("Pracovná doba");
        novyZaznam["Sadzba"] =  zamestnanci[z].attr("hodinovka");
        novyZaznam["Mzda"] =  zamestnanci[z].attr("denná mzda");
        novyZaznam["Vyplatiť"] =  zamestnanci[z].attr("denná mzda");
        novyZaznam["sezóna"] = zaznam.field("Dátum").getFullYear();
        novyZaznam["Dochádzka"] = zaznam;
        novyZaznam["Zamestnanec"] = zamestnanci[z];
        mzdy.create(novyZaznam);
        var zaznamMzdy = zaznam.linksFrom("aMzdy", "Dochádzka")[0];
        zaznamMzdy.field("Dochádzka")[0].setAttr("odpracované", zaznam.field("Pracovná doba"));
        zaznamMzdy.field("Zamestnanec")[0].setAttr("sadzba", zamestnanci[z].attr("hodinovka"));
        // zauctuj preplatok ak je
        var preplatokLinks = zamestnanci[z].linksFrom("Pokladňa", "Zamestnanec").filter(e => e.field("Preplatok na mzde") == true);
        if (preplatokLinks.length > 0) {
            message("Účtujem preplatky");
            for (var l = 0; l < preplatokLinks.length; l++) {
                var preplatok = preplatokLinks[l].field("Preplatok");
                var vyplata = zaznamMzdy.field("Vyplatiť");
                if (preplatok >= vyplata) {
                    zaznamMzdy.set("Vyplatiť", vyplata);
                    zaznamMzdy.link("Platby", preplatokLinks[l]);
                    zaznamMzdy.field("Platby")[0].setAttr("suma", vyplata);
                    preplatok -= vyplata;
                    preplatokLinks[l].set("Preplatok", preplatok);
                } else if ( preplatok != 0 && preplatok < vyplata){
                    zaznamMzdy.set("Vyplatená mzda", preplatok);
                    zaznamMzdy.set("Vyplatiť", vyplata - preplatok);
                    zaznamMzdy.link("Platby", zaznam);
                    zaznamMzdy.field("Platby")[0].setAttr("suma", preplatok);

                }
            }

        }
    }
}
