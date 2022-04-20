
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