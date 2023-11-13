// Library/Event/Script:    mdb\vyuctovaniaLibrary.js
// JS Libraries:
// Dátum:                   01.04.2022
// Popis:
// Autor:                   just me, for my garden business. this code is muddy like me
const vyuctovania = "0.2.03";

const verziaVyuctovania = () => {
    var result = "";
    var nazov = "vyuctovanieLibrary";
    result = nazov + " " + vyuctovania;
    return result;
}


const btnVyuctovania1 = () => {
    let scriptName ="btnVyuctovania1 23.0.31"
    let variables = "Záznam: " + entry().name
    let parameters = "en: " + entry()
    let txtMsg = ""
    try {
        if (!entry().field("Zákazka")[0]) {
            message("Najprv vyber zákazku...")
            cancel()
            exit()
        }
        txtMsg = "Zákazka: " + entry().name
        //zakazka.set("Typ zákazky", zakazka.field(FLD_CENOVA_PONUKA)[0].field("Typ cenovej ponuky"))
        msgGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, txtMsg, variables, parameters )

        message("nastavujem záznam..." + scriptName)

        entry().set("Typ zákazky", entry().field(FLD_ZAKAZKA)[0].field(FLD_CENOVA_PONUKA)[0].field("Typ cenovej ponuky"))
        entry().set("Evidovať", entry().field(FLD_ZAKAZKA)[0].field(FLD_CENOVA_PONUKA)[0].field("Evidovať"))
        entry().set("Výkazy", entry().field(FLD_ZAKAZKA)[0].field(FLD_CENOVA_PONUKA)[0].field("Evidovať"))
        let evidovat = entry().field("Evidovať")
        // for(let i=0; i<evidovat.length; i++) {
        //     message(links[i])
        //     let links = entry().field(FLD_ZAKAZKA)[0].linksFrom(evidovat[i], "Zákazka")
        //     if (links[i] != undefined)
        //     message(links[i].name)
        // //entry().link(evidovat[i], link )
        // }
        message(evidovat)
        evidovat.forEach(element => {
            entry().set(element, entry().field(FLD_ZAKAZKA)[0].linksFrom(element, "Zákazka")[0])
        })
    } catch (error) {
        errorGen(DB_EVIDENCIA_PRAC, "libEvidenciaPrac.js", scriptName, error, variables, parameters);
    }
}
const noveVyuctovanie = zakazka => {
    var vyuctovania = libByName(DB_VYUCTOVANIA);
    var nVyuctovanie = new Object();
    // inicializácia
    var datum = new Date();
    var cp = zakazka.field(FLD_CENOVA_PONUKA)[0];
    var sezona = zakazka.field(SEASON);
    var cislo = noveCislo(sezona, DB_VYUCTOVANIA, 1, 2);
    var klient = zakazka.field("Klient")[0]
    var miesto = zakazka.field("Miesto")[0];
    var typ = cp.field("Typ cenovej ponuky");
    var uctovanieDPH = zakazka.field("Účtovanie DPH");
    var stavZakazky = zakazka.field("Stav");
    var stavVyuctovania = "Prebieha";
    // inicializácia
    var empty = []; // mazacie pole


    // vyber diely zákazky podľa typu cp
    if (typ == "Hodinovka") {
        var diely = cp.field("Diely cenovej ponuky hzs");
    } else {
        var diely = cp.field("Diely cenovej ponuky");
    }
    // popis vyúčtovania
    var popisVyuctovania = "Vyúčtovanie zákazky č." + zakazka.field(NUMBER) + " (" + cp.field("Popis cenovej ponuky") + ")";
    // stav vyúčtovania
    if (stavZakazky == "Ukončená") {
        stavVyuctovania = "Pripravené";
    }
    // Hlavička a základné nastavenia
    nVyuctovanie["Dátum"] = datum;
    nVyuctovanie[NUMBER] = cislo;
    nVyuctovanie["Miesto realizácie"] = miesto;
    nVyuctovanie["Stav vyúčtovania"] = stavVyuctovania;
    nVyuctovanie["Typ vyúčtovania"] = typ;
    nVyuctovanie["+Materiál"] = cp.field("+Materiál");
    nVyuctovanie["+Mechanizácia"] = cp.field("+Mechanizácia");
    nVyuctovanie["+Subdodávky"] = cp.field("+Subdodávky");
    nVyuctovanie["+Položky"] = cp.field("+Položky");
    nVyuctovanie["Účtovanie dopravy"] = cp.field("Účtovanie dopravy");
    nVyuctovanie["Klient"] = klient;
    nVyuctovanie["Popis vyúčtovania"] = popisVyuctovania;
    nVyuctovanie[FLD_CENOVA_PONUKA] = cp;
    nVyuctovanie[FLD_ZAKAZKA] = zakazka;
    nVyuctovanie[SEASON] = sezona;
    nVyuctovanie["Diely vyúčtovania"] = diely.join();
    // doprava
    nVyuctovanie["Účtovanie DPH"] = uctovanieDPH.join();
    nVyuctovanie["Paušál"] = cp.field("Paušál")[0];
    nVyuctovanie["Sadzba km"] = cp.field("Sadzba km")[0];
    nVyuctovanie["% zo zákazky"] = cp.field("% zo zákazky");
    vyuctovania.create(nVyuctovanie);

    var vyuctovanie = vyuctovania.find(cislo)[0];
    zakazka.set(FLD_VYUCTOVANIE, empty);
    zakazka.link(FLD_VYUCTOVANIE, vyuctovanie);
    return vyuctovanie;
}

const nalinkujMaterial = (vyuctovanie, vydajka) => {
    var vydajkaCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vydajka.field(FLD_POPIS);
    vyuctovanie.set(popis, empty);
    // položky z výdajky do array
    var polozkyVydajka = vydajka.field(FLD_MATERIAL);
    var typVydajky = vydajka.field("Typ výkazu");
    if (typVydajky == "Hodinovka") {
        var polozkyVyuctovanie = vyuctovanie.field(popis);
    } else if (typVydajky == "Položky") {
        var polozkyVyuctovanie = vyuctovanie.field(popis + " materiál");
        if (popis == "Rastliny") {
            var polozkyVyuctovanie = vyuctovanie.field(popis);
        }

    } else {
    }
    // nastav atribúty položiek vo vyúčtovaní
    for (var m = 0; m < polozkyVydajka.length; m++) {
        vyuctovanie.link(popis, polozkyVydajka[m]);
        var mnozstvo = polozkyVydajka[m].attr("dodané množstvo");
        var cena = polozkyVydajka[m].attr("cena");
        var cenaCelkom = polozkyVydajka[m].attr("cena celkom");
        vyuctovanie.field(popis)[m].setAttr("množstvo", mnozstvo);
        vyuctovanie.field(popis)[m].setAttr("cena", cena);
        vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
        vydajkaCelkom += cenaCelkom;
        // nastav príznak Tlač
        setTlac(polozkyVydajka[m]);
    }
    vyuctovanie.set(popis + " celkom", vydajkaCelkom);
    return vydajkaCelkom;
}

const nalinkujPrace = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
    var popis = vykazPrac.field(FLD_POPIS);
    // vynuluj staré položky

    var polozky = vyuctovanie.field(popis);
    if (polozky.length > 0) {
        for (var p in polozky) {
            vyuctovanie.unlink(popis, polozky[p]);
        }
        vyuctovanie.set(popis + " celkom", null);
    }
    // práce navyše ošetriť inak

    var polozkyVykazPrac = vykazPrac.field(FLD_PRACE);
    if (popis == "Práce navyše") {
        for (var m = 0; m < polozkyVykazPrac.length; m++) {
            var mnozstvo = polozkyVykazPrac[m].attr("dodané množstvo");
            var cena = polozkyVykazPrac[m].attr("cena");
            var cenaCelkom = polozkyVykazPrac[m].attr("cena celkom");
            vyuctovanie.link(popis, polozkyVykazPrac[m])
            vyuctovanie.field(popis)[m].setAttr("počet hodín", mnozstvo);
            vyuctovanie.field(popis)[m].setAttr("účtovaná sadzba", cena);
            vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
            vykazPracCelkom += cenaCelkom;
            // nastav príznak Tlač
            setTlac(polozkyVykazPrac[m]);
        }
    } else {
        for (var m = 0; m < polozkyVykazPrac.length; m++) {
            var mnozstvo = polozkyVykazPrac[m].attr("dodané množstvo");
            var cena = polozkyVykazPrac[m].attr("cena");
            var cenaCelkom = polozkyVykazPrac[m].attr("cena celkom");
            vyuctovanie.link(popis, polozkyVykazPrac[m])
            vyuctovanie.field(popis)[m].setAttr("množstvo", mnozstvo);
            vyuctovanie.field(popis)[m].setAttr("cena", cena);
            vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
            vykazPracCelkom += cenaCelkom;
            // nastav príznak Tlač
            setTlac(polozkyVykazPrac[m]);
        }
    }



    vyuctovanie.set(popis + " celkom", vykazPracCelkom);
    return vykazPracCelkom;
}

const nalinkujPraceHZS = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
    // message("Vyýkaz prác " + vykazPrac.title);
    var pocitanieHodinovychSadzieb = vykazPrac.field(FLD_CENOVA_PONUKA)[0].field("Počítanie hodinových sadzieb");
    var popis = vykazPrac.field(FLD_POPIS);
    var polozky = vyuctovanie.field(popis);
    // vynuluj staré položky
    if (polozky.length > 0) {
        for (var p in polozky) {
            vyuctovanie.unlink(popis, polozky[p]);
        }
        vyuctovanie.set(popis + " celkom", null);
    }
    // vynuluj staré položky rozpisu prác
    var polozkyRozpis = vyuctovanie.field("Rozpis " + popis);
    if (polozkyRozpis.length > 0) {
        for (var p in polozkyRozpis) {
            vyuctovanie.unlink("Rozpis " + popis, polozkyRozpis[p]);
        }
    }
    var vykazPraceSadzby = vykazPrac.field("Práce sadzby")[0];
    var vykazPraceSadzbyCelkom = 0;
    var cenaCelkom = 0;
    var hodinCelkom = 0;
    var uctovanaSadzba = 0;
    vyuctovanie.link(popis, vykazPraceSadzby);
    var evidenciaLinks = vykazPrac.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
    if (pocitanieHodinovychSadzieb == "Za celú zákazku") {
        var zlava = vykazPraceSadzby.attr("zľava %");
        var zakladnaSadzba = vykazPraceSadzby.attr("základná sadzba");
        var uctovanaSadzba = vykazPraceSadzby.attr("účtovaná sadzba");
        vyuctovanie.field(popis)[0].setAttr("počet hodín", vykazPraceSadzby.attr("dodané množstvo"));
        if (!zlava) {
            vyuctovanie.field(popis)[0].setAttr("základná sadzba", zakladnaSadzba);
            uctovanaSadzba = zakladnaSadzba;
            zakladnaSadzba = null;
        } else {
            zlava = "zľava " + zlava + "%";
        }
        vyuctovanie.field(popis)[0].setAttr("základná sadzba", zakladnaSadzba);
        vyuctovanie.field(popis)[0].setAttr("zľava", zlava);
        vyuctovanie.field(popis)[0].setAttr("účtovaná sadzba", uctovanaSadzba);
        vyuctovanie.field(popis)[0].setAttr("cena celkom", vykazPraceSadzby.attr("cena celkom"));
        hodinCelkom += vykazPraceSadzby.attr("dodané množstvo");
        uctovanaSadzba = vykazPraceSadzby.attr("účtovaná sadzba");
        // nastav príznak Tlač
        setTlac(vyuctovanie);
        for (var e = 0; e < evidenciaLinks.length; e++) {
            vyuctovanie.link("Rozpis " + popis, evidenciaLinks[e]);
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
            cenaCelkom = hodinCelkom * uctovanaSadzba;
            // nastav príznak Tlač
            setTlac(evidenciaLinks[e])
        }
        vykazPracCelkom += cenaCelkom;
    } else if (pocitanieHodinovychSadzieb == "Individuálne za každý výjazd") {
        vyuctovanie.field(popis)[0].setAttr("počet hodín", vykazPraceSadzby.attr("dodané množstvo"));
        vyuctovanie.field(popis)[0].setAttr("cena celkom", vykazPraceSadzby.attr("cena celkom"));
        for (var e = 0; e < evidenciaLinks.length; e++) {
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("zľava", evidenciaLinks[e].attr("zľava"));
            vyuctovanie.link("Rozpis " + popis, evidenciaLinks[e]);
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
            vyuctovanie.field("Rozpis " + popis)[e].setAttr("cena celkom", evidenciaLinks[e].attr("cena celkom"));
            vyuctovanie.field(popis)[0].setAttr("cena celkom", cenaCelkom);
            cenaCelkom = hodinCelkom * uctovanaSadzba;
            // nastav príznak Tlač
            setTlac(evidenciaLinks[e]);
        }
    } else {
        message("Neviem určiť počítanie hodinových sadzieb")
    }

    vyuctovanie.set(popis + " celkom", vykazPracCelkom);
    return vykazPracCelkom;
}

const nalinkujStroje = (vyuctovanie, vykazStrojov) => {
    var vykazStrojovCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vykazStrojov.field(FLD_POPIS);
    vyuctovanie.set(popis, empty);

    var polozkyVykaz = vykazStrojov.field(FLD_STROJE);
    // nastav atribúty položiek vo vyúčtovaní
    var polozkyVyuctovanie = vyuctovanie.field(popis);
    for (var m = 0; m < polozkyVykaz.length; m++) {
        vyuctovanie.link(popis, polozkyVykaz[m]);
        var mnozstvo = polozkyVykaz[m].attr("prevádzka mth");
        var cena = polozkyVykaz[m].attr("účtovaná sadzba");
        var cenaCelkom = polozkyVykaz[m].attr("cena celkom");
        vyuctovanie.field(popis)[m].setAttr("využitie mth", mnozstvo);
        vyuctovanie.field(popis)[m].setAttr("sadzba", cena);
        vyuctovanie.field(popis)[m].setAttr("cena celkom", cenaCelkom);
        vykazStrojovCelkom += cenaCelkom;
        // nastav príznak Tlač
        setTlac(polozkyVykaz[m]);
    }
    vyuctovanie.set(popis + " celkom", vykazStrojovCelkom);

    return vykazStrojovCelkom;
}
// End of file: 22.03.2022, 19:24