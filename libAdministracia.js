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