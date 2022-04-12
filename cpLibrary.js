// Library/Event/Script:    Projekty\Cenové ponuky\shared\cpLibrary_w.js
// JS Libraries:
// Dátum:                   07.03.2022
// Popis:
function verziaKniznice() {
    var nazov = "cpLibrary";
    var verzia = "0.2.08";
    return nazov + " v." + verzia;
}
// GENEROVANIE NOVEJ ZÁKAZKY

const prepocetPonuky = ponuka => {
    // verzia
    var verzia = "0.2.03";
    message("CENOVÁ PONUKA v." + verzia
        + "\n" + verziaKniznice()
        + "\n" + verziaKrajinkaLib());
    //
    message("Prepočítavam...")
    // inicializácia
    var typ = ponuka.field("Typ cenovej ponuky");
    var uctoDopravy = ponuka.field("Účtovanie dopravy");
    //spôsob účtovania dopravy
    var cislo = ponuka.field("Číslo");
    var pracaCelkom = 0;
    var strojeCelkom = 0;
    var materialCelkom = 0;
    var cenaCelkomBezDPH = 0;
    var cenaSDPH = 0;
    var dph = 0;

    // nastaviť sezónu
    ponuka.set("sezóna", ponuka.field("Dátum").getFullYear());
    var sezona = ponuka.field("sezóna");
    var sadzbaDPH = libByName("KRAJINKA APP").find(sezona)[0].field("Základná sadzba DPH") / 100;

    // nastaviť splatnosť
    var datum = new Date(ponuka.field("Dátum"));
    var platnost = new Date(ponuka.field("Platnosť do"));
    var platnost30 = new Date(moment(datum).add(15, "Days"));
    ponuka.set("Platnosť do", platnost > datum ? platnost : platnost30);

    // doplň adresu klienta do Krycieho listu
    var klient = ponuka.field("Klient")[0] ? ponuka.field("Klient")[0] : ponuka.field("Cenová ponuka")[0].field("Klient")[0];
    if (klient) {
        ponuka.set("Odberateľ", pullAddress(klient));
    }

    // generuj nové číslo
    cislo = cislo ? cislo : noveCislo(sezona, "Cenové ponuky", 1, 2);
    ponuka.set("Číslo", cislo);

    // prepočet podľa typu cenovej ponuky
    switch (typ) {
        case "Položky":
            var diely = ponuka.field("Diely cenovej ponuky");
            // prejsť všetky diely a spočítať práce a materiál
            if (diely) {
                for (var d = 0; d < diely.length; d++) {
                    cenaCelkomBezDPH += prepocetDielPolozky(ponuka, diely[d]);
                }
            }
            break;
        case "Hodinovka":
            var diely = ponuka.field("Diely cenovej ponuky hzs");
            if (diely) {
                for (var d = 0; d < diely.length; d++) {
                    pracaCelkom += prepocetDielHZS(ponuka, diely[d]);
                }
                if (ponuka.field("+Materiál")) {
                    // spočítať  materiál
                    var material = ponuka.field("Materiál");
                    materialCelkom = polozkaMaterial(material);
                    ponuka.set("Materiál hzs", materialCelkom);
                    ponuka.set("Materiál celkom bez DPH", materialCelkom);
                }
                if (ponuka.field("+Mechanizácia")) {
                    // spočítať mechanizácie
                    var stroje = ponuka.field("Stroje");
                    strojeCelkom = prepocetDielStroje(stroje);
                    ponuka.set("Využitie mechanizácie", strojeCelkom);
                    ponuka.set("Stroje celkom bez DPH", strojeCelkom);
                }
                cenaCelkomBezDPH = materialCelkom + strojeCelkom + pracaCelkom;

            }
            break;
        case "Ad Hoc":
            message("I'am thinking about it!");
            break;
    }

    // Doprava každopádne
    var dopravaCelkom = ponukaDoprava(ponuka, uctoDopravy); // cenová ponuka + spôsob účtovania dopravy

    // dph
    cenaCelkomBezDPH += dopravaCelkom;
    dph = cenaCelkomBezDPH * sadzbaDPH;
    cenaSDPH += cenaCelkomBezDPH + dph;
    ponuka.set("Práca celkom bez DPH", pracaCelkom);
    ponuka.set("Práce hzs", pracaCelkom);
    ponuka.set("Doprava", dopravaCelkom);
    ponuka.set("Celkom (bez DPH)", cenaCelkomBezDPH);
    ponuka.set("DPH 20%", dph);
    ponuka.set("Cena celkom (s DPH)", cenaSDPH);
    message("Hotovo...Cena ponuky bez DPH je: " + cenaCelkomBezDPH.toFixed(1) + "€");
}

const generujZakazku = cp => {
    var verzia = "0.2.07";
    var vKniznica = verziaKniznice();
    var vKrajinkaLib = verziaKrajinkaLib();
    message("GENERUJ ZÁKAZKU v." + verzia + "\n" + vKniznica + "\n" + vKrajinkaLib);

    var zakazka = cp.linksFrom("Zákazky", "Cenová ponuka");

    if (cp.field("Stav cenovej ponuky") == "Schválená") {

        var stav = cp.field("Stav cenovej ponuky");
        var typ = cp.field("Typ cenovej ponuky");

        // vygenerovať novú zákazku
        zakazka = ponukaNovaZakazka(cp);

        if (typ == "Hodinovka") {
            generujVykazyPrac(zakazka);
            if (cp.field("+Materiál")) {
                generujVydajkyMaterialu(zakazka);
            }
            if (cp.field("+Mechanizácia")) {
                generujVykazStrojov(zakazka);
            }
        } else if (typ == "Položky") {
            generujVykazyPrac(zakazka);
            generujVydajkyMaterialu(zakazka);
        } else {
        }

        cp.set("Stav cenovej ponuky", "Uzavretá");
        message("Zákazka č." + zakazka.field("Číslo") + " bola vygenerovaná");
    } else if (!zakazka) {
        message("Z cenovej ponuky už je vytvorená zákazk č." + zakazka.field("Číslo"));
    } else {
        message("Cenová ponuka musí byť schválená");
    }

    // End of file: 08.03.2022, 08:01
}
// vygeneruj nový záznam zákazky
const ponukaNovaZakazka = cp => {
    // nastaviť sezónu
    cp.set("sezóna", cp.field("Dátum").getFullYear());
    var sezona = cp.field("sezóna");
    var lib = libByName("Zákazky");
    // inicializácia
    var novaZakazka = new Object();
    var datum = new Date();
    var typZakazky = "Realizácia" //harcoded
    message(sezona);
    var cislo = noveCislo(sezona, "Zákazky", 1, 2);
    var klient = cp.field("Klient")[0];
    var miesto = cp.field("Miesto realizácie")[0];
    var nazovZakazky = cp.field("Popis cenovej ponuky");
    var typ = cp.field("Typ cenovej ponuky");
    // vyber diely zákazky podľa typu cp
    if (typ == "Hodinovka") {
        var dielyZakazky = cp.field("Diely cenovej ponuky hzs");
    } else {
        var dielyZakazky = cp.field("Diely cenovej ponuky");
    }
    var uctovanieDPH = ["Práce", "Materiál", "Doprava", "Mechanizácia"];

    // hlavička a základné nastavenia
    novaZakazka["Dátum"] = datum;
    novaZakazka["Typ zákazky"] = typZakazky;
    novaZakazka["Číslo"] = cislo;
    novaZakazka["Klient"] = klient;
    novaZakazka["Miesto"] = miesto;
    novaZakazka["Stav zákazky"] = "Čakajúca";
    novaZakazka["Názov zákazky"] = nazovZakazky;
    novaZakazka["Diely zákazky"] = dielyZakazky.join();
    novaZakazka["Cenová ponuka"] = cp;
    novaZakazka["sezóna"] = sezona;
    novaZakazka["Účtovanie DPH"] = uctovanieDPH;
    novaZakazka["Účtovanie zákazky"] = typ;
    lib.create(novaZakazka);

    var zakazka = cp.linksFrom("Zákazky", "Cenová ponuka")[0];
    return zakazka;
}
// VÝDAJKY
// generuj nové výdajky
const generujVydajkyMaterialu = zakazka => {
    //inicializácia

    var cp = zakazka.field("Cenová ponuka")[0];
    var typ = cp.field("Typ cenovej ponuky");
    var popis = [];
    // ak je zákazka hodinovka
    if (typ == "Hodinovka") {
        if (cp.field("+Materiál")) {
            popis.push("Materiál");
        }
        var materialPonuky = cp.field("Materiál");
        var vydajka = novaVydajkaMaterialu(zakazka, popis);
        nalinkujPolozkyPonukyMaterial(vydajka, materialPonuky);
        spocitajVykaz(vydajka, "Materiál");

        // ak je zákazka položky
    } else if (typ == "Položky") {
        var dielyPonuky = cp.field("Diely cenovej ponuky");
        for (var d = 0; d < dielyPonuky.length; d++) {
            popis.push(dielyPonuky[d] + " materiál");
            if (dielyPonuky[d] == "Výsadby") {
                popis.push("Rastliny");
            }
        }
        for (var p = 0; p < popis.length; p++) {
            var materialPonuky = cp.field(popis[p]);
            var vydajka = novaVydajkaMaterialu(zakazka, popis[p]);
            nalinkujPolozkyPonukyMaterial(vydajka, materialPonuky);
            spocitajVykaz(vydajka, "Materiál");
        }

    } else { }
    return vydajka;
}
const novaVydajkaMaterialu = (zakazka, popis) => {
    // inicializácia
    var lib = libByName("Výdajky");
    var cp = zakazka.field("Cenová ponuka")[0];
    var datum = zakazka.field("Dátum");
    var sezona = zakazka.field("sezóna");
    var cislo = noveCislo(sezona, "Výdajky", 0, 3);
    // vytvoriť novú výdajku
    var novaVydajka = new Object();
    novaVydajka["Číslo"] = cislo;
    novaVydajka["Dátum"] = datum;
    novaVydajka["Popis"] = popis;
    novaVydajka["s DPH"] = true; // hardcoded
    novaVydajka["Ceny počítať"] = "Z cenovej ponuky";
    novaVydajka["Vydané"] = "Zákazka";
    novaVydajka["Zákazka"] = zakazka;
    novaVydajka["Cenová ponuka"] = cp;
    novaVydajka["sezóna"] = sezona;
    lib.create(novaVydajka);
    var vydajkaMaterialu = lib.find(cislo)[0];

    return vydajkaMaterialu;
}
const nalinkujPolozkyPonukyMaterial = (vydajkaMaterialu, polozky) => {
    vydajkaMaterialu.set("Materiál", null);
    for (var p = 0; p < polozky.length; p++) {
        vydajkaMaterialu.link("Materiál", polozky[p]);
        vydajkaMaterialu.field("Materiál")[p].setAttr("množstvo z cp", polozky[p].attr("množstvo"));
        vydajkaMaterialu.field("Materiál")[p].setAttr("cena", polozky[p].attr("cena"));
    }
}

// VÝKAZY PRÁC
// vytvorí nový záznam
const novyVykazPrac = (zakazka, popis) => {
    // inicializácia
    var lib = libByName("Výkaz prác");
    var cp = zakazka.field("Cenová ponuka")[0];
    var typVykazu = cp.field("Typ cenovej ponuky");
    var datum = zakazka.field("Dátum");
    var sezona = zakazka.field("sezóna");
    var cislo = noveCislo(sezona, "Výkaz prác", 0, 3);
    // vytvoriť novú výdajku
    var novyVykaz = new Object();
    novyVykaz["Číslo"] = cislo;
    novyVykaz["Dátum"] = datum;
    novyVykaz["Popis"] = popis;
    novyVykaz["Typ výkazu"] = typVykazu;
    novyVykaz["s DPH"] = true; //harcoded
    novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
    novyVykaz["Vydané"] = "Zákazka";
    novyVykaz["Zákazka"] = zakazka;
    novyVykaz["Cenová ponuka"] = cp;

    novyVykaz["sezóna"] = sezona;
    lib.create(novyVykaz);
    var vykazPrac = lib.find(cislo)[0];

    return vykazPrac;
}
const generujVykazyPrac = zakazka => {
    var cp = zakazka.field("Cenová ponuka")[0];
    var typ = cp.field("Typ cenovej ponuky");
    var popis = [];

    if (typ == "Položky") {
        popis.push("Práce navyše");                         // Práce navyše
        var dielyPonuky = cp.field("Diely cenovej ponuky");
        for (var i = 0; i < dielyPonuky.length; i++) {
            popis.push(dielyPonuky[i] + " práce");                  // Závlaha, Trávnik, Výsadby, Jazierko, Kameň, Neštandardné, Subdodávky
        }
        for (var z = 0; z < popis.length; z++) {
            var polozkyPonuky = cp.field(popis[z]);
            if (popis[z] == "Práce navyše") {
                var vykazPrac = novyVykazPrac(zakazka, popis[z]);
                nalinkujPolozkyPonukyPraceHZS(vykazPrac, polozkyPonuky);
                spocitajVykaz(vykazPrac, "Práce sadzby");
            } else {
                var vykazPrac = novyVykazPrac(zakazka, popis[z]);
                nalinkujPolozkyPonukyPrace(vykazPrac, polozkyPonuky);
                spocitajVykaz(vykazPrac, "Práce");
            }
        }
    } else if (typ == "Hodinovka") {
        // to array
        var dielyPonuky = cp.field("Diely cenovej ponuky hzs");
        for (var d = 0; d < dielyPonuky.length; d++) {
            popis.push(dielyPonuky[d]);                             // Záhradnícke práce, Servis zavlažovanie, Konzultácie a poradenstvo
        }
        // genruj jednotlivé výkazy diel = popis
        for (var p = 0; p < popis.length; p++) {
            var polozkyPonuky = cp.field(popis[p]);             // Položky ponuky: napr.field("Záhradnícke práce")
            var vykazPrac = novyVykazPrac(zakazka, popis[p]); // vytvorí nový výkaz prác a skoíruje položky
            nalinkujPolozkyPonukyPraceHZS(vykazPrac, polozkyPonuky);                   // nalinkuje atribúty na položky
            spocitajVykaz(vykazPrac, "Práce sadzby");
        }
    } else { }
    return vykazPrac; //suma
}
const nalinkujPolozkyPonukyPrace = (vykazPrac, polozky) => {
    vykazPrac.set("Práce", null);
    for (var p = 0; p < polozky.length; p++) {
        vykazPrac.link("Práce", polozky[p]);
        vykazPrac.field("Práce")[p].setAttr("množstvo z cp", polozky[p].attr("množstvo"));
        vykazPrac.field("Práce")[p].setAttr("cena", polozky[p].attr("cena"));
    }
}
const nalinkujPolozkyPonukyPraceHZS = (vykazPrac, polozky) => {
    vykazPrac.set("Práce sadzby", null);
    for (var p = 0; p < polozky.length; p++) {
        vykazPrac.link("Práce sadzby", polozky[p]);
        vykazPrac.field("Práce sadzby")[p].setAttr("množstvo z cp", polozky[p].attr("odhadovaný počet hodín"));
        vykazPrac.field("Práce sadzby")[p].setAttr("základná sadzba", polozky[p].attr("sadzba"));
    }
}

// STROJE
// vytvorí nový záznam
const novyVykazStrojov = (zakazka) => {
    // inicializácia
    var lib = libByName("Výkaz strojov");
    var cp = zakazka.field("Cenová ponuka")[0];
    var datum = zakazka.field("Dátum");
    var sezona = zakazka.field("sezóna");
    var cislo = noveCislo(sezona, "Výkaz strojov", 0, 3);
    // vytvoriť novú výdajku
    var novyVykaz = new Object();
    novyVykaz["Číslo"] = cislo;
    novyVykaz["Dátum"] = datum;
    novyVykaz["Popis"] = "Stroje";          // Jediný typ výkazu v knižnici
    novyVykaz["Typ výkazu"] = "Hodinovka";  // výkaz strojov je len pri hodinovej sadzbe
    novyVykaz["s DPH"] = true; //harcoded
    novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
    novyVykaz["Vydané"] = "Zákazka";
    novyVykaz["Zákazka"] = zakazka;
    novyVykaz["Cenová ponuka"] = cp;
    novyVykaz["sezóna"] = sezona;
    lib.create(novyVykaz);
    var vykazStrojov = lib.find(cislo)[0];

    return vykazStrojov;
}
const generujVykazStrojov = zakazka => {
    var cp = zakazka.field("Cenová ponuka")[0];
    var strojePolozky = cp.field("Stroje");
    // vytvoriť nový výkaz
    var vykazStrojov = novyVykazStrojov(zakazka);
    nalinkujPolozkyStrojov(vykazStrojov, strojePolozky);          // nalinkuje atribúty na položky
    spocitajVykaz(vykazStrojov, "Stroje");                      // výkaz , názov poľa položiek

    return vykazStrojov;
}
const nalinkujPolozkyStrojov = (vykaz, polozky) => {
    vykaz.set("Stroje", null);
    for (var m = 0; m < polozky.length; m++) {
        vykaz.link("Stroje", polozky[m]);
        vykaz.field("Stroje")[m].setAttr("množstvo z cp", polozky[m].attr("odhadovaný počet mth"));
        vykaz.field("Stroje")[m].setAttr("účtovaná sadzba", polozky[m].attr("sadzba"));
    }
}

// SPOČÍTAŤ VÝKAZY
const spocitajVykaz = (doklad, field) => {
    // inicializácia
    var sezona = doklad.field("sezóna");
    var sadzbaDPH = libByName("KRAJINKA APP").find(sezona)[0].field("Základná sadzba DPH") / 100;
    var sumaBezDPH = 0;
    var sumaDPH = 0;
    var sumaCelkomSDPH = 0
    var polozky = doklad.field(field);
    for (var p = 0; p < polozky.length; p++) {
        var mnozstvo = polozky[p].attr("množstvo z cp");
        if (field == "Práce sadzby" || field == "Stroje") {
            var cena = polozky[p].attr("základná sadzba");
        } else if (field == "Práce" || field == "Materiál")
            var cena = polozky[p].attr("cena");
        var cenaCelkom = mnozstvo * cena;
        sumaBezDPH += cenaCelkom;
    }
    sumaDPH = sumaBezDPH * sadzbaDPH;
    sumaCelkomSDPH = sumaBezDPH + sumaDPH;
    doklad.set("CP Suma bez DPH", sumaBezDPH)
    doklad.set("CP DPH", sumaDPH)
    doklad.set("CP Suma s DPH", sumaCelkomSDPH)
}
//

// OBSOLETE

// prepočet dielov cenovej ponuky - Položky
const prepocetDielPolozky = (cp, diel) => {
    // inicializácia
    var materialCelkom = 0;
    var praceCelkom = 0;
    var rastlinyCelkom = 0;
    var dielCelkom = 0;

    var material = cp.field(diel + " materiál");
    materialCelkom = polozkaMaterial(material);
    cp.set(diel + " materiál celkom", materialCelkom);
    dielCelkom += materialCelkom;

    var prace = cp.field(diel + " práce");
    praceCelkom = polozkaPrace(prace);
    cp.set(diel + " práce celkom", praceCelkom);
    dielCelkom += praceCelkom;

    if (diel == "Výsadby") {
        var rastliny = cp.field("Rastliny");
        rastlinyCelkom = polozkaMaterial(rastliny);
        cp.set("Rastliny celkom", rastlinyCelkom);
        dielCelkom += rastlinyCelkom;
    }

    cp.set(diel + " celkom bez DPH", dielCelkom);
    cp.set(diel, dielCelkom);
    return dielCelkom;
};

// prepočet dielov cenovej ponuky - Hodinovka
const prepocetDielHZS = (cp, diel) => {
    var celkom = 0;
    var prace = cp.field(diel);
    celkom = polozkaHZS(prace);
    return celkom;
};

// prepočet jednotlivých položiek dielov - práce - Hodinovka
const prepocetDielStroje = stroje => {
    var celkom = 0;
    for (var p = 0; p < stroje.length; p++) {
        var cena = stroje[p].attr("sadzba") || stroje[p].field("Cena bez DPH");
        var mnozstvo = stroje[p].attr("odhadovaný počet mth") || 2;
        stroje[p].setAttr("odhadovaný počet mth", mnozstvo);
        stroje[p].setAttr("sadzba", cena);
        stroje[p].setAttr("cena celkom", cena * mnozstvo);
        celkom += mnozstvo * cena;
    }
    return celkom;
};

// prepočet dopravy cenovej ponuky
const ponukaDoprava = (cp, uctovanie) => {
    var celkom = 0;
    switch (uctovanie) {
        case "Paušál":
            var pausal = cp.field("Paušál");
            for (var p = 0; p < pausal.length; p++) {
                var cena = pausal[p].attr("cena") || pausal[p].field("Cena bez DPH");
                var jazd = pausal[p].attr("počet jázd") || 1;
                pausal[p].setAttr("cena", cena);
                pausal[p].setAttr("počet jázd", jazd);
                pausal[p].setAttr("cena celkom", cena * jazd);
                celkom += jazd * cena;
            }
            break;
        case "Km":
            var ckm = cp.field("Sadzba km");
            for (var p = 0; p < ckm.length; p++) {
                var cena = ckm[p].attr("cena") || ckm[p].field("Cena bez DPH");
                var jazd = ckm[p].attr("počet jázd") || 1;
                var km = ckm[p].attr("počet km") || jazd * cp.field("Miesto realizácie")[0].field("Vzdialenosť") * 2;
                ckm[p].setAttr("počet km", km);
                ckm[p].setAttr("cena", cena);
                ckm[p].setAttr("cena celkom", cena * km);
                celkom += km * cena;
            }
            break;
        case "% zo zákazky":
            var percento = cp.field("% zo zákazky") || 5;
            if (percento) {
                celkom = cenaCelkomBezDPH * (percento / 100);
            }
            break;
        case "Pevná cena":
            var pevnaCena = cp.field("Pevná cena");
            if (pevnaCena) {
                celkom = pevnaCena;
            }
    }
    cp.set("Doprava celkom bez DPH", celkom);
    return celkom;
}

// CENOVÁ PONUKA PREPOČET
// spočítava diely ponkuky
// prepočet jednotlivých položiek dielov - práce - Hodinovka
const polozkaHZS = prace => {
    var celkom = 0;
    for (var p = 0; p < prace.length; p++) {
        var cena = prace[p].attr("sadzba") || prace[p].field("Cena bez DPH");
        var mnozstvo = prace[p].attr("odhadovaný počet hodín") || 3;
        prace[p].setAttr("odhadovaný počet hodín", mnozstvo);
        prace[p].setAttr("sadzba", cena);
        prace[p].setAttr("cena celkom", cena * mnozstvo);
        celkom += mnozstvo * cena;
    }
    return celkom;
};

// prepočet jednotlivých položiek dielov - materiál - Hodinovka, Položky
const polozkaMaterial = material => {
    var celkom = 0;
    for (var p = 0; p < material.length; p++) {
        var pc = material[p].field("PC bez DPH");
        var mnozstvo = material[p].attr("množstvo");
        material[p].setAttr("poznámka", material[p].field("Poznámka"));
        if (material[p].attr("cena")) {
            pc = material[p].attr("cena");
        } else {
            material[p].setAttr("cena", pc);
        }
        material[p].setAttr("cena celkom", pc * mnozstvo);
        material[p].set("Tlač", "Tlač"); //nastaví príznak Tlač v položke skladu
        celkom += mnozstvo * pc;
    }
    return celkom;
};

// prepočet jednotlivých dielov - práce - Položky
const polozkaPrace = prace => {
    var celkom = 0;
    for (var p = 0; p < prace.length; p++) {
        var pc = prace[p].field("Cena bez DPH");
        var mnozstvo = prace[p].attr("množstvo");
        if (prace[p].attr("cena")) {
            pc = prace[p].attr("cena")
        } else {
            prace[p].setAttr("cena", pc);
        }
        prace[p].setAttr("cena celkom", pc * mnozstvo);
        celkom += mnozstvo * pc;
    }
    return celkom;
};
// End of file: 14.03.2022, 07:51aa