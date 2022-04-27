const verziaVykazStrojov = () => {
    var result = "";
    var nazov = "vykazStrojovLibrary";
    var verzia = "0.2.18";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatVykazStrojov = (vykaz, uctovatDPH) => {
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
                for (var v = 0; v < zaznamyEvidencia.length; v++) {
                    var vyuzitieStrojov = zaznamyEvidencia[v].field("Využitie strojov");
                    for (var s = 0; s < vyuzitieStrojov.length; s++) {
                        if (stroje[p].id == vyuzitieStrojov[v].field("Cena").id) {
                            prevadzkaMTH += vyuzitieStrojov[v].attr("doba prevádzky") / 36000000;
                        }
                    }
                }
                var cena = stroje[p].attr("účtovaná sadzba") || stroje[p].field("Cena bez DPH");
                var cenaCelkom = prevadzkaMTH ? prevadzkaMTH * cena : null;
                stroje[p].setAttr("prevádzka mth", prevadzkaMTH);
                stroje[p].setAttr("účtovaná sadzba", cena);
                stroje[p].setAttr("cena celkom", cenaCelkom);
                sumaBezDPH += cenaCelkom;
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
}