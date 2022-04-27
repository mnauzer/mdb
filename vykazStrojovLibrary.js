const verziaVykazStrojov = () => {
    var result = "";
    var nazov = "vykazStrojovLibrary";
    var verzia = "0.2.31";
    result = nazov + " " + verzia;
    return result;
}

const prepocitatVykazStrojov = (vykaz, uctovatDPH) => {
    try {
        var zaznamyEvidencia = vykaz.linksFrom(DB_EVIDENCIA_PRAC, "Výkaz strojov");
        var sumaBezDPH = 0;
        var sumaDPH = null;
        var sumaCelkom = null;

        var typ = vykaz.field("Typ výkazu");
        if (uctovatDPH) { vykaz.set("s DPH", uctovatDPH) };
        var sDPH = vykaz.field("s DPH");
        // najprv prejdi záznamy z evidencie a dosaď hodnoty do atribútov
        if (zaznamyEvidencia) {
            for (var v in zaznamyEvidencia) {
                var vyuzitieStrojov = zaznamyEvidencia[v].field("Využitie strojov");
                var stroje = vykaz.field(FIELD_STROJE);
                if (vyuzitieStrojov) {
                    var vyuzitieZapisane = false;
                    for (var i in vyuzitieStrojov) {
                        var prevadzkaMTH = 0;
                        var cena = 0;
                        var cenaCelkom = 0;
                        if (!stroje) {
                            //ak nie je žiadny záznam strojov, vytvor nové pre všetky záznamy strojov z evidencie prác
                            var newLink = vykaz.link("Stroje", vyuzitieStrojov[i].field("Cena")[0]);
                            prevadzkaMTH += vyuzitieStrojov[i].attr("doba prevádzky") / 3600000;
                            cena = newLink.attr("účtovaná sadzba") || vyuzitieStrojov[i].field("Cena")[0].field("Cena bez DPH");
                            cenaCelkom = prevadzkaMTH ? prevadzkaMTH * cena : null;
                            newLink.setAttr("prevádzka mth", prevadzkaMTH);
                            newLink.setAttr("účtovaná sadzba", cena);
                            newLink.setAttr("cena celkom", cenaCelkom);

                            vyuzitieZapisane = true;
                        } else {
                            // ak už existuje nejaký záznam, spáruj s evidenciou
                            for (var s in stroje) {
                                if (vyuzitieStrojov[i].field("Cena")[0].id == stroje[s].id) {
                                    prevadzkaMTH += vyuzitieStrojov[i].attr("doba prevádzky") / 3600000;
                                    cena = stroje[s].attr("účtovaná sadzba") || vyuzitieStrojov[i].field("Cena")[0].field("Cena bez DPH");
                                    cenaCelkom = prevadzkaMTH ? prevadzkaMTH * cena : null;
                                    stroje[s].setAttr("prevádzka mth", prevadzkaMTH);
                                    stroje[s].setAttr("účtovaná sadzba", cena);
                                    stroje[s].setAttr("cena celkom", cenaCelkom);
                                    vyuzitieZapisane = true;
                                }
                            }
                        }
                        if (!vyuzitieZapisane) {
                            // ak sa využitie strojov nezápísalo do výkazu, vytvor nový záznam vo výkaze
                            vykaz.link("Stroje", vyuzitieStrojov[i].field("Cena")[0]);
                            prevadzkaMTH += vyuzitieStrojov[i].attr("doba prevádzky") / 3600000;
                            cena = newLink.attr("účtovaná sadzba") || vyuzitieStrojov[i].field("Cena")[0].field("Cena bez DPH");
                            cenaCelkom = prevadzkaMTH ? prevadzkaMTH * cena : null;
                            newLink.setAttr("prevádzka mth", prevadzkaMTH);
                            newLink.setAttr("účtovaná sadzba", cena);
                            newLink.setAttr("cena celkom", cenaCelkom);
                            vyuzitieStrojov = true;
                        }
                    }
                }
            }
        } else {
            message("Žiadne záznamy využitia strojov v Evidencii prác");
        }
        // prepočet atribútov položky
        // var cena = stroje[p].attr("účtovaná sadzba") || vyuzitieStrojov[i].field("Cena")[0].field("Cena bez DPH");
        // var cenaCelkom = prevadzkaMTH ? prevadzkaMTH * cena : null;
        // stroje[p].setAttr("prevádzka mth", prevadzkaMTH);
        // stroje[p].setAttr("účtovaná sadzba", cena);
        // stroje[p].setAttr("cena celkom", cenaCelkom);
        // sumaBezDPH += cenaCelkom;

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
        message("Chyba skriptu: vykazStrojovLibrary/prepocitatVykazyStrojov\nRiadok: " + err.lineNumber + "\n-------------------------\n" + err);
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