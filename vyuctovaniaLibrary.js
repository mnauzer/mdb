// Library/Event/Script:    mdb\vyuctovaniaLibrary.js
// JS Libraries:
// Dátum:                   01.04.2022
// Popis:
// Autor:                   just me, for my garden business. this code is muddy like me
const vyuctovania = "0.2.01";

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
    var miesto = zakazka.field("Miesto realizácie")[0];
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
    noveVyuctovanie["+Materiál"] = zakazka.field("+Materiál");
    noveVyuctovanie["+Mechanizácia"] = zakazka.field("+Mechanizácia");
    noveVyuctovanie["+Subdodávky"] = zakazka.field("+Subdodávky");
    noveVyuctovanie["+Položky"] = zakazka.field("+Položky");
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

// Generuj vyúčtovanie

// const generujVyuctovanie2 = zakazka => {
//     // verzia
//     //var vyuctovanie = zakazka.field("Vyúčtovanie")[0];
//     //if (!vyuctovanie.length>0) {
//     var noveVyuctovanie = zakazkaNoveVyuctovanie(zakazka);
//     var vKniznica = verziaZakazky();
//     var vKrajinkaLib = verziaKrajinkaLib();
//     message("GENERUJ VYÚČTOVANIE" + "\n" + vKniznica + "\n" + vKrajinkaLib);
//     var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
//     var typCP = cp.field("Typ cenovej ponuky");
//     var uctovanieDPH = zakazka.field("Účtovanie DPH");
//     // inicializácia
//     var sezona = noveVyuctovanie.field(FIELD_SEZONA);
//     var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
//     var zakazkaDPH = 0;
//     var zakazkaCelkom = 0;
//     var zakazkaCelkomBezDPH = 0;

//     if (typCP == W_HODINOVKA) {
//         var diely = cp.field("Diely cenovej ponuky hzs")
//     } else if (typCP == "Položky") {
//         var diely = cp.field("Diely cenovej ponuky")
//     } else {

//     }
//     // PRÁCE
//     // prepočet výkazov prác
//     var vykazyPrac = zakazka.linksFrom(DB_VYKAZY_PRAC, W_ZAKAZKA);
//     if (vykazyPrac.length > 0) {
//         var praceCelkomBezDPH = 0;
//         var praceDPH = 0;
//         var praceUctovatDPH = mclCheck(uctovanieDPH, W_PRACE);
//         for (var vp = 0; vp < vykazyPrac.length; vp++) {
//             var typ = vykazyPrac[vp].field("Typ výkazu");
//             if (typ == W_HODINOVKA || vykazyPrac[vp].field(FIELD_POPIS) == W_PRACE_NAVYSE) {
//                 praceCelkomBezDPH += prepocitatVykazPraceHzs(vykazyPrac[vp], praceUctovatDPH, sadzbaDPH);
//             } else if (typ == W_POLOZKY) {
//                 praceCelkomBezDPH += prepocitatVykazPracePolozky(vykazyPrac[vp], praceUctovatDPH, sadzbaDPH);
//             } else {
//                 message("Zle zadaný typ výkazu prác");
//             }
//             vykazyPrac[vp].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
//             vydajkyMaterialu[vm].set(FIELD_STAV, "Vyúčtované");

//             noveVyuctovanie.set(vykazyPrac[vp].field(FIELD_POPIS) + " celkom", praceCelkomBezDPH);

//             // zápis do vyúčtovania
//             if (praceUctovatDPH) {
//                 txtPrace = "s DPH";
//                 praceDPH += vykazyPrac[vp].field("DPH");
//                 zakazkaDPH += praceDPH;
//             } else {
//                 txtPrace = "bez DPH";
//             }
//         }
//         zakazkaCelkomBezDPH += praceCelkomBezDPH;
//     } else {
//         txtPrace = "...žiadne práce";
//     }
//     zakazka.set("txt práce", txtPrace);

//     // MATERIÁL
//     // prepočet výdajok materiálu
//     var vydajkyMaterialu = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, "Zákazka");
//     if (vydajkyMaterialu.length > 0) {
//         var materialUctovatDPH = mclCheck(uctovanieDPH, "Materiál");
//         var materialCelkomBezDPH = 0;
//         var materialDPH = 0;
//         for (var vm = 0; vm < vydajkyMaterialu.length; vm++) {
//             materialCelkomBezDPH += spocitatVydajkyMaterialu(vydajkyMaterialu[vm], materialUctovatDPH, sadzbaDPH);
//             vydajkyMaterialu[vm].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
//             vydajkyMaterialu[vm].set(FIELD_STAV, "Vyúčtované");

//             // zápis do vyúčtovania
//             noveVyuctovanie.set(vydajkyMaterialu[vm].field(FIELD_POPIS) + " celkom", materialCelkomBezDPH);
//             if (materialUctovatDPH) {
//                 txtMaterial = "s DPH";
//                 materialDPH += vydajkyMaterialu[vm].field("DPH");
//                 zakazkaDPH += materialDPH;
//             } else {
//                 txtMaterial = "bez DPH";
//             }
//             zakazkaCelkomBezDPH += materialCelkomBezDPH;
//         }
//     } else {
//         txtMaterial = "...žiadny materiál";
//     }
//     zakazka.set("txt materiál", txtMaterial);

//     // STROJE
//     // prepočet výkazu strojov
//     var vykazStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, "Zákazka");
//     if (vykazStrojov.length > 0) {
//         var strojeUctovatDPH = mclCheck(uctovanieDPH, "Mechanizácia");
//         var strojeCelkomBezDPH = 0;
//         var strojeDPH = 0;
//         for (var vs = 0; vs < vykazStrojov.length; vs++) {

//             // strojeCelkomBezDPH += spocitatVykazStrojov(vykazStrojov[vs], strojeUctovatDPH, sadzbaDPH);
//             strojeCelkomBezDPH += prepocitatVykazStrojov(vykazStrojov[vs], strojeUctovatDPH);
//             vykazStrojov[vs].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
//             vykazStrojov[vs].set(FIELD_STAV, "Vyúčtované");
//             // zápis do vyúčtovania
//             noveVyuctovanie.set(vykazStrojov[vs].field(FIELD_POPIS) + " celkom", strojeCelkomBezDPH);
//             if (strojeUctovatDPH) {
//                 txtStroje = "s DPH";
//                 strojeDPH += vykazStrojov[vs].field("DPH");
//                 zakazkaDPH += strojeDPH;
//             } else {
//                 txtStroje = "bez DPH";
//             }
//         }
//         zakazkaCelkomBezDPH += strojeCelkomBezDPH;
//     } else {
//         txtStroje = "...žiadne stroje";
//     }
//     zakazka.set("txt stroje", txtStroje);

//     // DOPRAVA
//     // prepočítať dopravu
//     var dopravaUctovatDPH = mclCheck(uctovanieDPH, "Doprava");;
//     var dopravaCelkomBezDPH = spocitatDopravu(zakazka, zakazkaCelkomBezDPH);
//     var dopravaDPH = 0;
//     if (dopravaCelkomBezDPH >= 0) {
//         if (dopravaUctovatDPH) {
//             txtDoprava = " s DPH";
//             dopravaDPH = dopravaCelkomBezDPH * sadzbaDPH;
//             zakazkaDPH += dopravaDPH;
//         } else {
//             txtDoprava = " bez DPH";
//         }
//     } else {
//         txtDoprava = " žiadna doprava";
//     }
//     zakazka.set("txt doprava", txtDoprava);
//     zakazkaCelkomBezDPH += dopravaCelkomBezDPH;

//     // Message
//     message(
//         "Práce: " + txtPrace + "\n" +
//         "Materiál: " + txtMaterial + "\n" +
//         "Stroje: " + txtStroje + "\n" +
//         "Doprava: " + txtDoprava + "\n"
//     );

//     // PLATBY
//     var vydavkySDPH = uctovanieDPH.filter(cast => cast === "Iné výdavky");
//     var prijmyCelkom = zakazkaPrijmy(zakazka);
//     var vydavkyCelkom = zakazkaVydavky(zakazka, vydavkySDPH);

//     // súčet vyúčtovania
//     zakazkaCelkom = zakazkaCelkomBezDPH + zakazkaDPH;

//     // NASTAVENIE POLÍ
//     // časti vyúčtovania
//     noveVyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
//     // vyúčtovanie
//     noveVyuctovanie.set("Celkom (bez DPH)", zakazkaCelkomBezDPH);
//     noveVyuctovanie.set("DPH 20%", zakazkaDPH);
//     noveVyuctovanie.set("Cena celkom (s DPH)", zakazkaCelkom);
//     noveVyuctovanie.set("Zaplatená záloha", prijmyCelkom);
//     noveVyuctovanie.set("Suma na úhradu", zakazkaCelkomBezDPH + zakazkaDPH - prijmyCelkom);

//     // texty

//     // pridané - treba skotnrolovať a refaktoring
//     // kopírovanie položiek bez prepočtu výdajok a výkazov

//     // iba ak typ je Položky
//     // nalinkuje jednotlivé položky z výkazov do vyúčtovania
//     if (typCP == W_POLOZKY) {
//         // nalinkuj výdajky materiálu
//         for (var v = 0; v < vydajkyMaterialu.length; v++) {
//             nalinkujMaterial(noveVyuctovanie, vydajkyMaterialu[v]);
//         }
//         // nalinkuj výkazy prác
//         for (var v = 0; v < vykazyPrac.length; v++) {
//             nalinkujPrace(noveVyuctovanie, vykazyPrac[v]);
//         }
//         // prepočítať diely
//         for (var d in diely) {
//             var sucetDielov = 0;

//             sucetDielov += noveVyuctovanie.field(diely[d] + " materiál celkom")
//             sucetDielov += noveVyuctovanie.field(diely[d] + " práce celkom")
//             if (diely[d] == "Výsadby") {
//                 sucetDielov += noveVyuctovanie.field("Rastliny celkom")
//             }
//             noveVyuctovanie.set(diely[d] + " celkom", sucetDielov);
//         }
//     } else if (typCP == W_HODINOVKA) {
//         // ak je typ hodinovka nalinkuje práce, materiál a a stroje do vyúčtovania
//         for (var v = 0; v < vydajkyMaterialu.length; v++) {
//             nalinkujMaterial(noveVyuctovanie, vydajkyMaterialu[v]);
//         }
//         // nalinkuj výkazy prác
//         for (var v = 0; v < vykazyPrac.length; v++) {
//             if (typ == W_POLOZKY) {
//                 nalinkujPrace(noveVyuctovanie, vykazyPrac[v]);
//             } else {
//                 nalinkujPraceHZS(noveVyuctovanie, vykazyPrac[v]);
//             }
//         }
//         // nalinkuj výkazy strojov
//         for (var v = 0; v < vykazStrojov.length; v++) {
//             nalinkujStroje(noveVyuctovanie, vykazStrojov[v]);
//         }
//     } else {
//         message("Neviem aký je typ vyúčtovania (Položky/Hodinovka");
//     }

//     // doplň adresu klienta do Krycieho listu
//     noveVyuctovanie.set("Odberateľ", pullAddress(noveVyuctovanie.field("Klient")[0]));
//     //zakazkaToJsonHZS(zakazka);
//     message("Hotovo...!");
//     message("Bolo vygenerované vyúčtovane č.: " + noveVyuctovanie.field("Číslo"));
//     // } else {
//     //     message("Zákazka už má vyúčtovanie č." + noveVyuctovanie.field("Číslo"));
//     // }
//     // End of file: 11.03.2022, 11:27
// }

// const generujVyuctovanie = zakazka => {
//     // verzia
//     //var vyuctovanie = zakazka.field("Vyúčtovanie")[0];
//     //if (!vyuctovanie.length>0) {
//     var vKniznica = verziaZakazky();
//     var vKrajinkaLib = verziaKrajinkaLib();
//     message("GENERUJ VYÚČTOVANIE" + "\n" + vKniznica + "\n" + vKrajinkaLib);
//     prepocetZakazky(zakazka);
//     var noveVyuctovanie = zakazkaNoveVyuctovanie(zakazka);
//     var cp = zakazka.field(FIELD_CENOVA_PONUKA)[0];
//     var typCP = cp.field("Typ cenovej ponuky");
//     var uctovanieDPH = zakazka.field("Účtovanie DPH");
//     // inicializácia
//     var sezona = noveVyuctovanie.field(FIELD_SEZONA);
//     var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
//     var zakazkaDPH = 0;
//     var zakazkaCelkom = 0;
//     var zakazkaCelkomBezDPH = 0;

//     if (typCP == W_HODINOVKA) {
//         var diely = cp.field("Diely cenovej ponuky hzs")
//     } else if (typCP == "Položky") {
//         var diely = cp.field("Diely cenovej ponuky")
//     } else {

//     }
//     // PRÁCE
//     // prepočet výkazov prác
//     var vykazyPrac = zakazka.linksFrom(DB_VYKAZY_PRAC, W_ZAKAZKA);
//     if (vykazyPrac.length > 0) {
//         var praceCelkomBezDPH = 0;
//         var praceDPH = 0;
//         var praceUctovatDPH = mclCheck(uctovanieDPH, W_PRACE);
//         for (var vp = 0; vp < vykazyPrac.length; vp++) {
//             var typ = vykazyPrac[vp].field("Typ výkazu");
//             if (typ == W_HODINOVKA || vykazyPrac[vp].field(FIELD_POPIS) == W_PRACE_NAVYSE) {
//                 praceCelkomBezDPH += prepocitatVykazPraceHzs(vykazyPrac[vp], praceUctovatDPH, sadzbaDPH);
//             } else if (typ == W_POLOZKY) {
//                 praceCelkomBezDPH += prepocitatVykazPracePolozky(vykazyPrac[vp], praceUctovatDPH, sadzbaDPH);
//             } else {
//                 message("Zle zadaný typ výkazu prác");
//             }
//             vykazyPrac[vp].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
//             vydajkyMaterialu[vm].set(FIELD_STAV, "Vyúčtované");

//             noveVyuctovanie.set(vykazyPrac[vp].field(FIELD_POPIS) + " celkom", praceCelkomBezDPH);

//             // zápis do vyúčtovania
//             if (praceUctovatDPH) {
//                 txtPrace = "s DPH";
//                 praceDPH += vykazyPrac[vp].field("DPH");
//                 zakazkaDPH += praceDPH;
//             } else {
//                 txtPrace = "bez DPH";
//             }
//         }
//         zakazkaCelkomBezDPH += praceCelkomBezDPH;
//     } else {
//         txtPrace = "...žiadne práce";
//     }
//     zakazka.set("txt práce", txtPrace);

//     // MATERIÁL
//     // prepočet výdajok materiálu
//     var vydajkyMaterialu = zakazka.linksFrom(DB_VYDAJKY_MATERIALU, "Zákazka");
//     if (vydajkyMaterialu.length > 0) {
//         var materialUctovatDPH = mclCheck(uctovanieDPH, "Materiál");
//         var materialCelkomBezDPH = 0;
//         var materialDPH = 0;
//         for (var vm = 0; vm < vydajkyMaterialu.length; vm++) {
//             materialCelkomBezDPH += spocitatVydajkyMaterialu(vydajkyMaterialu[vm], materialUctovatDPH, sadzbaDPH);

//             if (materialUctovatDPH) {
//                 txtMaterial = "s DPH";
//                 materialDPH += vydajkyMaterialu[vm].field("DPH");
//                 zakazkaDPH += materialDPH;
//             } else {
//                 txtMaterial = "bez DPH";
//             }
//             zakazkaCelkomBezDPH += materialCelkomBezDPH;
//         }
//     } else {
//         txtMaterial = "...žiadny materiál";
//     }
//     zakazka.set("txt materiál", txtMaterial);

//     // STROJE
//     // prepočet výkazu strojov
//     var vykazStrojov = zakazka.linksFrom(DB_VYKAZY_STROJOV, "Zákazka");
//     if (vykazStrojov.length > 0) {
//         var strojeUctovatDPH = mclCheck(uctovanieDPH, "Mechanizácia");
//         var strojeCelkomBezDPH = 0;
//         var strojeDPH = 0;
//         for (var vs = 0; vs < vykazStrojov.length; vs++) {

//             // strojeCelkomBezDPH += spocitatVykazStrojov(vykazStrojov[vs], strojeUctovatDPH, sadzbaDPH);
//             strojeCelkomBezDPH += prepocitatVykazStrojov(vykazStrojov[vs], strojeUctovatDPH);
//             vykazStrojov[vs].link(FIELD_VYUCTOVANIE, noveVyuctovanie);
//             vykazStrojov[vs].set(FIELD_STAV, "Vyúčtované");
//             // zápis do vyúčtovania
//             noveVyuctovanie.set(vykazStrojov[vs].field(FIELD_POPIS) + " celkom", strojeCelkomBezDPH);
//             if (strojeUctovatDPH) {
//                 txtStroje = "s DPH";
//                 strojeDPH += vykazStrojov[vs].field("DPH");
//                 zakazkaDPH += strojeDPH;
//             } else {
//                 txtStroje = "bez DPH";
//             }
//         }
//         zakazkaCelkomBezDPH += strojeCelkomBezDPH;
//     } else {
//         txtStroje = "...žiadne stroje";
//     }
//     zakazka.set("txt stroje", txtStroje);

//     // DOPRAVA
//     // prepočítať dopravu
//     var dopravaUctovatDPH = mclCheck(uctovanieDPH, "Doprava");;
//     var dopravaCelkomBezDPH = spocitatDopravu(zakazka, zakazkaCelkomBezDPH);
//     var dopravaDPH = 0;
//     if (dopravaCelkomBezDPH >= 0) {
//         if (dopravaUctovatDPH) {
//             txtDoprava = " s DPH";
//             dopravaDPH = dopravaCelkomBezDPH * sadzbaDPH;
//             zakazkaDPH += dopravaDPH;
//         } else {
//             txtDoprava = " bez DPH";
//         }
//     } else {
//         txtDoprava = " žiadna doprava";
//     }
//     zakazka.set("txt doprava", txtDoprava);
//     zakazkaCelkomBezDPH += dopravaCelkomBezDPH;

//     // Message
//     message(
//         "Práce: " + txtPrace + "\n" +
//         "Materiál: " + txtMaterial + "\n" +
//         "Stroje: " + txtStroje + "\n" +
//         "Doprava: " + txtDoprava + "\n"
//     );

//     // PLATBY
//     var vydavkySDPH = uctovanieDPH.filter(cast => cast === "Iné výdavky");
//     var prijmyCelkom = zakazkaPrijmy(zakazka);
//     var vydavkyCelkom = zakazkaVydavky(zakazka, vydavkySDPH);

//     // súčet vyúčtovania
//     zakazkaCelkom = zakazkaCelkomBezDPH + zakazkaDPH;

//     // NASTAVENIE POLÍ
//     // časti vyúčtovania
//     noveVyuctovanie.set("Doprava celkom", dopravaCelkomBezDPH)
//     // vyúčtovanie
//     noveVyuctovanie.set("Celkom (bez DPH)", zakazkaCelkomBezDPH);
//     noveVyuctovanie.set("DPH 20%", zakazkaDPH);
//     noveVyuctovanie.set("Cena celkom (s DPH)", zakazkaCelkom);
//     noveVyuctovanie.set("Zaplatená záloha", prijmyCelkom);
//     noveVyuctovanie.set("Suma na úhradu", zakazkaCelkomBezDPH + zakazkaDPH - prijmyCelkom);

//     // texty

//     // pridané - treba skotnrolovať a refaktoring
//     // kopírovanie položiek bez prepočtu výdajok a výkazov

//     // iba ak typ je Položky
//     // nalinkuje jednotlivé položky z výkazov do vyúčtovania
//     if (typCP == W_POLOZKY) {
//         // nalinkuj výdajky materiálu
//         for (var v = 0; v < vydajkyMaterialu.length; v++) {
//             nalinkujMaterial(noveVyuctovanie, vydajkyMaterialu[v]);
//         }
//         // nalinkuj výkazy prác
//         for (var v = 0; v < vykazyPrac.length; v++) {
//             nalinkujPrace(noveVyuctovanie, vykazyPrac[v]);
//         }
//         // prepočítať diely
//         for (var d in diely) {
//             var sucetDielov = 0;

//             sucetDielov += noveVyuctovanie.field(diely[d] + " materiál celkom")
//             sucetDielov += noveVyuctovanie.field(diely[d] + " práce celkom")
//             if (diely[d] == "Výsadby") {
//                 sucetDielov += noveVyuctovanie.field("Rastliny celkom")
//             }
//             noveVyuctovanie.set(diely[d] + " celkom", sucetDielov);
//         }
//     } else if (typCP == W_HODINOVKA) {
//         // ak je typ hodinovka nalinkuje práce, materiál a a stroje do vyúčtovania
//         for (var v = 0; v < vydajkyMaterialu.length; v++) {
//             nalinkujMaterial(noveVyuctovanie, vydajkyMaterialu[v]);
//         }
//         // nalinkuj výkazy prác
//         for (var v = 0; v < vykazyPrac.length; v++) {
//             if (typ == W_POLOZKY) {
//                 nalinkujPrace(noveVyuctovanie, vykazyPrac[v]);
//             } else {
//                 nalinkujPraceHZS(noveVyuctovanie, vykazyPrac[v]);
//             }
//         }
//         // nalinkuj výkazy strojov
//         for (var v = 0; v < vykazStrojov.length; v++) {
//             nalinkujStroje(noveVyuctovanie, vykazStrojov[v]);
//         }
//     } else {
//         message("Neviem aký je typ vyúčtovania (Položky/Hodinovka");
//     }

//     // doplň adresu klienta do Krycieho listu
//     noveVyuctovanie.set("Odberateľ", pullAddress(noveVyuctovanie.field("Klient")[0]));
//     //zakazkaToJsonHZS(zakazka);
//     message("Hotovo...!");
//     message("Bolo vygenerované vyúčtovane č.: " + noveVyuctovanie.field("Číslo"));
//     // } else {
//     //     message("Zákazka už má vyúčtovanie č." + noveVyuctovanie.field("Číslo"));
//     // }
//     // End of file: 11.03.2022, 11:27
// }

const nalinkujMaterial = (vyuctovanie, vydajka) => {
    var vydajkaCelkom = 0;
    // najprv vymaž staré
    var empty = [];
    var popis = vydajka.field(FIELD_POPIS);
    vyuctovanie.set(popis, empty);
    // položky z výdajky do array
    var polozkyVydajka = vydajka.field(FIELD_MATERIAL);
    // nastav atribúty položiek vo vyúčtovaní
    var polozkyVyuctovanie = vyuctovanie.field(popis);
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
    //    if (popis != "Práce navyše") {
    // položky z výdajky do array
    var polozkyVykazPrac = vykazPrac.field(FIELD_PRACE);
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
    // } else {
    //     // práce navyše
    //     var praceNavyse = vykazPrac.field("Práce sadzby")[0];
    //     var hodinCelkom = 0;
    //     var uctovanaSadzba = vykazPrac.field(FIELD_CENOVA_PONUKA)[0].field(popis)[0].attr("sadzba");
    //     var cenaCelkom = 0;
    //     vyuctovanie.link(popis, praceNavyse);
    //     var evidenciaLinks = vykazPrac.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz prác");
    //     for (var e = 0; e < evidenciaLinks.length; e++) {
    //         vyuctovanie.link("Rozpis", evidenciaLinks[e]);
    //         vyuctovanie.field("Rozpis")[e].setAttr("popis prác", evidenciaLinks[e].attr("popis prác"));
    //         vyuctovanie.field("Rozpis")[e].setAttr("počet hodín", evidenciaLinks[e].attr("počet hodín"));
    //         hodinCelkom += evidenciaLinks[e].attr("počet hodín");
    //     }
    //     cenaCelkom = hodinCelkom * uctovanaSadzba;
    //     vyuctovanie.field(popis)[0].setAttr("cena celkom", cenaCelkom);

    // }
    vyuctovanie.set(popis + " celkom", vykazPracCelkom);
    return vykazPracCelkom;
}

const nalinkujPraceHZS = (vyuctovanie, vykazPrac) => {
    vykazPracCelkom = 0;
    // najprv vymaž staré
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