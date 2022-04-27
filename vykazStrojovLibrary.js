const verziaVykazStrojov = () => {
    var result = "";
    var nazov = "vykazStrojovLibrary";
    var verzia = "0.2.23";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatVykazStrojov = (vykaz, uctovatDPH) => {
    try {
        var stroje = vykaz.field(FIELD_STROJE);
        var zaznamyEvidencia = vykaz.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz strojov");
        var sumaBezDPH = 0;
        var sumaDPH = null;
        var sumaCelkom = null;

        var typ = vykaz.field("Typ výkazu");
        if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
        var sDPH = vykaz.field("s DPH");
        // najprv prejdi záznamy z evidencie a dosaď hodnoty do atribútov

        if (stroje.length > 0) {
            for (var p = 0; p < stroje.length; p++) {
                var prevadzkaMTH = 0;

                if (zaznamyEvidencia.length > 0) {
                    message(zaznamyEvidencia.length);
                    for (var v = 0; v < zaznamyEvidencia.length; v++) {
                        var vyuzitieStrojov = zaznamyEvidencia[v].field("Využitie strojov");
                        for (var s = 0; s < vyuzitieStrojov.length; s++) {
                            if (stroje[p].id == vyuzitieStrojov[s].field("Cena")[0].id) {
                                message("True");
                                prevadzkaMTH += vyuzitieStrojov[s].attr("doba prevádzky") / 3600000;
                                break;
                            } else {
                                vykaz.link("Stroje", vyuzitieStrojov[s].field("Cena")[0]);
                                prevadzkaMTH += vyuzitieStrojov[s].attr("doba prevádzky") / 3600000;
                            }
                        }
                    }
                    var cena = stroje[p].attr("účtovaná sadzba") || stroje[p].field("Cena bez DPH");
                    var cenaCelkom = prevadzkaMTH ? prevadzkaMTH * cena : null;
                    stroje[p].setAttr("prevádzka mth", prevadzkaMTH);
                    stroje[p].setAttr("účtovaná sadzba", cena);
                    stroje[p].setAttr("cena celkom", cenaCelkom);
                    sumaBezDPH += cenaCelkom;
                } else {
                    message("Žiadne záznamy využitia strojov v Evidencii prác");
                }
            }
        }
        if (sDPH) {
            var sezona = vykaz.field(FIELD_SEZONA);
            if (!sezona || sezona == 0) {
                sezona = vykaz.field(FIELD_DATUM).getFullYear();
                vykaz.set(FIELD_SEZONA, sezona);
            }
            var sadzbaDPH = libByName(DB_ASSISTENT).find(sezona)[0].field("Základná sadzba DPH") / 100;
            sumaDPH = sumaBezDPH * sadzbaDPH;
        }
        sumaCelkom = sumaBezDPH + sumaDPH;
        vykaz.set("Suma bez DPH", sumaBezDPH);
        vykaz.set("DPH", sumaDPH);
        vykaz.set("Suma s DPH", sumaCelkom);
        setTlac(vykaz);
        return [sumaBezDPH, sumaDPH];
    } catch (err) {
        message("Chyba v riadku: " + err.lineNuber);
    }

}

const novyVykazStrojov = (zakazka) => {
    // inicializácia
    var lib = libByName("Výkaz strojov");
    var cp = zakazka.field("Cenová ponuka")[0];
    var typVykazu = cp.field("Typ cenovej ponuky");
    var datum = zakazka.field("Dátum");
    var sezona = zakazka.field(FIELD_SEZONA);
    var cislo = noveCislo(sezona, "Výkaz strojov", 0, 3);
    // vytvoriť novú výdajku
    var novyVykaz = new Object();
    novyVykaz[FIELD_CISLO] = cislo;
    novyVykaz["Dátum"] = datum;
    novyVykaz["Popis"] = FIELD_STROJE;          // Jediný typ výkazu v knižnici
    novyVykaz["Typ výkazu"] = typVykazu;  // výkaz strojov je len pri hodinovej sadzbe
    novyVykaz["s DPH"] = true; //harcoded
    novyVykaz["Ceny počítať"] = "Z cenovej ponuky";
    novyVykaz["Vydané"] = "Zákazka";
    novyVykaz["Zákazka"] = zakazka;
    novyVykaz["Cenová ponuka"] = cp;
    novyVykaz[FIELD_SEZONA] = sezona;
    lib.create(novyVykaz);
    var vykazStrojov = lib.find(cislo)[0];

    return vykazStrojov;
}