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

const noveVyuctovanie = zakazka => {
    var vyuctovania = libByName(DB_VYUCTOVANIA);
    var noveVyuctovanie = new Object();
    // inicializácia
    var datum = new Date();
    var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
    var sezona = zakazka.field(FIELD_SEZONA);
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
    var popisVyuctovania = "Vyúčtovanie zákazky č." + zakazka.field(FIELD_CISLO) + " (" + cp.field("Popis cenovej ponuky") + ")";
    // stav vyúčtovania
    if (stavZakazky == "Ukončená") {
        stavVyuctovania = "Pripravené";
    }
    // Hlavička a základné nastavenia
    noveVyuctovanie["Dátum"] = datum;
    noveVyuctovanie[FIELD_CISLO] = cislo;
    noveVyuctovanie["Miesto realizácie"] = miesto;
    noveVyuctovanie["Stav vyúčtovania"] = stavVyuctovania;
    noveVyuctovanie["Typ vyúčtovania"] = typ;
    noveVyuctovanie["+Materiál"] = cp.field("+Materiál");
    noveVyuctovanie["+Mechanizácia"] = cp.field("+Mechanizácia");
    noveVyuctovanie["+Subdodávky"] = cp.field("+Subdodávky");
    noveVyuctovanie["+Položky"] = cp.field("+Položky");
    noveVyuctovanie["Účtovanie dopravy"] = cp.field("Účtovanie dopravy");
    noveVyuctovanie["Klient"] = klient;
    noveVyuctovanie["Popis vyúčtovania"] = popisVyuctovania;
    noveVyuctovanie[FIELD_CENOVA_PONUKA] = cp;
    noveVyuctovanie[FIELD_ZAKAZKA] = zakazka;
    noveVyuctovanie[FIELD_SEZONA] = sezona;
    noveVyuctovanie["Diely vyúčtovania"] = diely.join();
    // doprava
    noveVyuctovanie["Účtovanie DPH"] = uctovanieDPH.join();
    noveVyuctovanie["Paušál"] = cp.field("Paušál")[0];
    noveVyuctovanie["Sadzba km"] = cp.field("Sadzba km")[0];
    noveVyuctovanie["% zo zákazky"] = cp.field("% zo zákazky");
    vyuctovania.create(noveVyuctovanie);

    var vyuctovanie = vyuctovania.find(cislo)[0];
    zakazka.set(FIELD_VYUCTOVANIE, empty);
    zakazka.link(FIELD_VYUCTOVANIE, vyuctovanie);
    return vyuctovanie;
}

const nalinkujMaterial = (vyuctovanie, vydajka) => {
    var vydajkaCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vydajka.field(FIELD_POPIS);
    vyuctovanie.set(popis, empty);
    // položky z výdajky do array
    var polozkyVydajka = vydajka.field(FIELD_MATERIAL);
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
    var popis = vykazPrac.field(FIELD_POPIS);
    // vynuluj staré položky

    var polozky = vyuctovanie.field(popis);
    if (polozky.length > 0) {
        for (var p in polozky) {
            vyuctovanie.unlink(popis, polozky[p]);
        }
        vyuctovanie.set(popis + " celkom", null);
    }
    // práce navyše ošetriť inak

    var polozkyVykazPrac = vykazPrac.field(FIELD_PRACE);
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
    var pocitanieHodinovychSadzieb = vykazPrac.field(FIELD_CENOVA_PONUKA)[0].field("Počítanie hodinových sadzieb");
    var popis = vykazPrac.field(FIELD_POPIS);
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
    var popis = vykazStrojov.field(FIELD_POPIS);
    vyuctovanie.set(popis, empty);

    var polozkyVykaz = vykazStrojov.field(FIELD_STROJE);
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