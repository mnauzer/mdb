// DOCHÁDZKA
const newEntryDochadzka = en => {
    scr.name = "newEntryDochadzka 23.0.07"
    scr.param.en = en
    try {
        setEntry(en)
        const date = new Date()
        const season = APP.defaultSeason()
        const number = APP.newNumber()
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set(NUMBER_ENTRY, number[1])
        en.set(SEASON, season)
    } catch (error) {
        errorGen2(scr, error)
    }
}
const updateEntryDochadzka = en => {
    scr.name = "newEntryDochadzka 23.0.01"
    scr.param.en = en
    try {

    } catch (error) {
        errorGen2(scr, error);
    }
}
const removeEntryDochadzka = (en, inptScript) => {
    // Created at: 16.11.2023, 07:55
    scr.name = "removeEntryDochadzka 23.0.05"
    scr.param.en = en
    scr.param.inptScript = inptScript
    try {
        removeEntry(en, APP.defaultName(), scr.name)
    } catch (error) {
        scr.error = error
        en.set(VIEW, VIEW_DEBUG)
        errorGen2(scr)
    }
}
const saveEntryDochadzka = en => {
    scr.name = "saveEntryDochadzka 23.0.02"
    scr.param.en = en
    try {
        prepocitatZaznamDochadzky(en, scr.name)
        saveEntry(en, scr.name)
    } catch (error) {
        errorGen2(scr, error);
    }
}

const genDochadzkaZavazky = (en, inptScript) => {
    scr.name = "genDochadzkaZavazky 23.0.02"
    scr.param.en = en
    scr.param.inptScript = inptScript
    //
    const zavazok = en.field("Generovať záväzky")
    let stareZavazky = en.linksFrom(LIB_ZVK, "Dochádzka")
    try {
        if (zavazok) {
            if(stareZavazky.length > 0){
                message("Mažem súvisiace záväzky...")
                for (let i in stareZavazky) {
                    removeEntry(stareZavazky[i], LIB_ZVK, scr.name)
                }
            stareZavazky = false
            }
            const zamestnanci = en.field("Zamestnanci")
            for (let z in zamestnanci) {
                if (z == 0 ) {message("Generujem záväzky......")} // this message only once
                newEntryZavazky(zamestnanci[z], en, zamestnanci[z].attr("denná mzda"))
            }
        }
    } catch (error) {
        errorGen2(scr, error);
    }
}
const rmDochadzkaZavazky = (en, inptScript) => {
    scr.name = "rmDochadzkaZavazky 23.0.03"
    scr.param.en = en
    scr.param.inptScript = inptScript
    try {
        const stareZavazky = en.linksFrom(LIB_ZVK, APP.defaultName())
        if(stareZavazky.length > 0){
            message("Mažem súvisiace záväzky...")
            for (let i in stareZavazky) {
                removeEntry(stareZavazky[i], LIB_ZVK, scr.name)
            }
        }
    } catch (error) {
        errorGen2(scr, error);
    }
}

// EVIDENCIA PRÁC
const newEntryEvidenciaPrac = en => {
    scr.name = "newEntryEvidenciaPrac 23.0.02"
    scr.param.en = en
    message("Nový záznam - " + APP.defaultName())
    try {
        setEntry(en, scr.name)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen2( scr.name, error, variables, parameters)
    }
}
const updateEntryEvidenciaPrac = en => {
    scr.name = "updateEntryEvidenciaPrac 23.0.02"
    scr.param.en = en
    message("Úprava záznamu - " + APP.defaultName());
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen2( scr.name, error, variables, parameters);
    }
}
const saveEntryEvidenciaPrac = en => {
    scr.param.en = en
    scr.name = "saveEntryEvidenciaPrac 23.0.01"
    try {
        prepocetZaznamuEvidenciePrac(en)
        saveEntry(en, APP.defaultName())
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen2( scr.name, error, variables, parameters);
    }
}
const evidenciaSadzbaPrace = (vykazPrac, hodinyCelkom) => {
    scr.name ="evidenciaSadzbaPrace 23.0.01";
    if(vykazPrac == undefined){
        msgGen( scr.name, "chýba parameter vykazPrac", variables, parameters )
        cancel()
        exit()
    }
    try {
        let zakladnaSadzba = vykazPrac.field("Práce sadzby")[0].field("Cena bez DPH")
        // zistiť zľavu podľa počtu odpracovaných hodín
        let zlava = 0;
        let limity = vykazPrac.field("Práce sadzby")[0].field("Limity")
        for (let m = 0; m < limity.length; m++) {
            if (hodinyCelkom > limity[m].field("Limit") && zlava < limity[m].field("Zľava")) {
                zlava = limity[m].field("Zľava");
            }
        }
        let sadzba = zakladnaSadzba - (zakladnaSadzba * zlava / 100)
        return sadzba
    } catch (error) {
        errorGen2( scr.name, error, variables, parameters)
        cancel()
        exit()
    }
};
const btnFill = () => {
    scr.name ="btnFill 23.0.05"
    try {
        if (!entry().field(FLD_ZKZ)[0]) {
            message("Najprv vyber zákazku...")
            cancel()
            exit()
        }
        txtMsg = "Zákazka: " + entry().name
        //zakazka.set("Typ zákazky", zakazka.field(FLD_CPN)[0].field("Typ cenovej ponuky"))
        msgGen( scr.name, txtMsg, variables, parameters )

        message("nastavujem záznam..." + scr.name)

        entry().set("Typ zákazky", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Typ cenovej ponuky"))
        entry().set("Evidovať", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Evidovať"))
        entry().set("Výkazy", entry().field(FLD_ZKZ)[0].field(FLD_CPN)[0].field("Výkazy"))
        const evidovat = entry().field("Evidovať")
        // for(let i=0; i<evidovat.length; i++) {
        //     message(links[i])
        //     let links = entry().field(FLD_ZKZ)[0].linksFrom(evidovat[i], "Zákazka")
        //     if (links[i] != undefined)
        //     message(links[i].name)
        // //entry().link(evidovat[i], link )
        // }
        message(evidovat)
        evidovat.forEach(element => {
            entry().set(element, entry().field(FLD_ZKZ)[0].linksFrom(element, "Zákazka")[0])
        })
    } catch (error) {
        errorGen2( scr.name, error, variables, parameters);
    }
}
const prepocetZaznamuEvidenciePrac = en => {
    scr.name ="prepocetZaznamuEvidenciePrac 23.0.08";
    try {
        let date = en.field(DATE)
        let typ = en.field("Typ zákazky");
        if (typ == "Hodinovka") {
            //TODO opraviť chybu keď nie je zadaná zákazka
            let vykaz = en.field("Výkaz prác")[0]
            if (vykaz != undefined) {
                en.set(FLD_ZKZ, vykaz.field(FLD_ZKZ)[0]);
            } else {
                msgGen(  scr.name, "nie je zadaná zákazka", variables, parameters)
            }
        } else if (typ == "Položky") {
        }
        let zamestnanci = en.field(FLD_ZAMESTNANCI)
        let odpracovane = 0
        let mzdoveNakladyCelkom = 0
        let nakladyZamestnatec = 0
        let casOd = roundTimeQ(en.field("Od"))
        let casDo = roundTimeQ(en.field("Do"))
        let trvanie = (casDo - casOd) / 3600000
        // dosaď mzdy zamestnancov
        for (let z = 0; z < zamestnanci.length; z++) {
            // sadzba buď tá zadaná, alebo zisti zo záznamu zamestnanca

            let hodinovka = zamestnanci[z].attr("hodinovka") ? zamestnanci[z].attr("hodinovka") : lastValid(zamestnanci[z].linksFrom(LIB_SZ, FLD_ZAM), date,"Sadzba", "Platnosť od", scr.name );
            zamestnanci[z].setAttr("hodinovka", hodinovka);
            odpracovane += trvanie;
            nakladyZamestnatec = trvanie * hodinovka;
            mzdoveNakladyCelkom += nakladyZamestnatec;
        };
        // set recap first
        en.set("Od", casOd);
        en.set("Do", casDo);
        en.set("Počet pracovníkov", zamestnanci.length)
        en.set("Odpracované", odpracovane)
        en.set("Mzdové náklady", mzdoveNakladyCelkom)
        en.set("Trvanie", trvanie)
        // checkbuttons
        let evidovat = en.field("Evidovať")
        let evStroje = evidovat.includes("Stroje")
        let evMaterial = evidovat.includes("Materiál")
        let evPrace = evidovat.includes("Výkaz prác")
        let evDoprava = evidovat.includes("Dopravu")
        // PRÁCE
        if (evPrace) {
            let vykazPrac = en.field("Výkaz prác")// práce, zamestnancov, trvanie, hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
            for (let v = 0; v < vykazPrac.length; v++) {
                // zistiť hodinovú sadzbu
                let sadzba = evidenciaSadzbaPrace(vykazPrac[v], odpracovane) // TODO: refaktoring funkcie
                let uctovanie = vykazPrac[v].field("Cenová ponuka")[0].field("Počítanie hodinových sadzieb")
                vykazPrac[v].setAttr("práce", en.field("Vykonané práce"))
                vykazPrac[v].setAttr( "zamestnancov", zamestnanci.length)
                vykazPrac[v].setAttr("trvanie", en.field("Vykonané práce"))
                vykazPrac[v].setAttr("hodín", odpracovane)
                if (uctovanie == "Individuálne za každý výjazd") {
                    vykazPrac[v].setAttr("hzs", sadzba)
                    vykazPrac[v].setAttr("cena", odpracovane * sadzba)
                }
            }
        }

        //STROJE
        if (evStroje) {
            let vykazStrojov = en.field("Výkaz strojov")// hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
            let vyuzitieStrojov = en.field("Využitie strojov");
            if (vyuzitieStrojov) {

            } else {
                message("V zázname nie su vybraté žiadne využité stroje");
            }
        }
        //MATERIÁL
        if (evMaterial) {
            let vykazMaterialu = en.field("Výkaz materiálu")// hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
        }
        //DOPRAVA
        if (evDoprava) {
            let vykazDopravy = en.field("Výkaz dopravy")// hodín, hzs, cena
            // TODO: automaticky nalinkovať výkaz zo zákazky
        }
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        errorGen2( scr.name, error, variables, parameters);
    }

}

// KNIHA JÁZD

// NEW AND UPDATE ENTRY
const newEntryKnihaJazd= en => {
    scr.name = "newEntryKnihaJazd23.0.01"
    scr.param.en = en
    message("Nový záznam - " + APP.defaultName())
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, APP.defaultName(), scr.name)
        let appDB = getAppSeasonDB(season, APP.defaultName(), scr.name)
        let number = getNewNumber(appDB, season, APP.defaultName(), scr.name)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, APP.defaultName())
        errorGen2(LIB_KJ, "libKnihaJazd.js", scr.name, error, variables, parameters)
    }
}
const updateEntryKnihaJazd= en => {
    scr.name = "updateEntryKnihaJazd23.0.01"
    scr.param.en = en
    message("Úprava záznamu - " + APP.defaultName());
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, APP.defaultName())
        errorGen2(LIB_KJ, "libKnihaJazd.js", scr.name, error, variables, parameters);
    }
}
const saveEntryKnihaJazd= en => {
    scr.name = "saveEntryKnihaJazd23.0.01"
    scr.param.en = en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, APP.defaultName())
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, APP.defaultName())
        errorGen2(LIB_KJ, "libKnihaJazd.js", scr.name, error, variables, parameters);
    }
}
const spocitatDopravu = (zakazka, cenaCelkomBezDPH) => {
    var jazd = zakazkaPocetJazd(zakazka);
    var cp = zakazka.field(FLD_CP)[0];
    var vyuctovanie = zakazka.field(FLD_VYUCTOVANIE)[0];
    var uctovanieDopravy = cp.field("Účtovanie dopravy");
    // doprava
    //message("Debug DOPRAVA " + uctovanie);
    var celkom = 0;
    switch (uctovanieDopravy) {
        case "Paušál":
            var cpPausal = cp.field("Paušál")[0];
            if (cpPausal) {
                var cena = cpPausal.attr("cena");
            } else {
                message("nie je zadaná paušálna cena v CP")
            }
            if (vyuctovanie) { // prepočet ak je už vygenerované vyúčtovanie
                var vPausal = vyuctovanie.field("Paušál")[0];
                //if
                vPausal.setAttr("cena", cena);
                vPausal.setAttr("počet jázd", jazd);
                vPausal.setAttr("cena celkom", cena * jazd);
            }
            celkom += jazd * cena;
            break;
        case "Km":
            var cpKm = cp.field("Sadzba km")[0];
            var km = 0;
            var jazdy = zakazka.linksFrom("Kniha jázd", "Zákazka")
            // spočítať kilometre
            for (var k = 0; k < jazdy.length; k++) {
                km += jazdy[k].field("Najazdené km");
            }
            if (cpKm) {
                var cena = cpKm.attr("cena");
            } else {
                message("nie ja zadaná cena za km v CP")
            }
            if (vyuctovanie) {
                var vKm = vyuctovanie.field("Sadzba km")[0];
                vKm.setAttr("cena", cena);
                vKm.setAttr("počet km", km);
                vKm.setAttr("cena", cena);
                vKm.setAttr("cena celkom", cena * km);
            }
            celkom += km * cena;
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
};
const zakazkaPocetJazd = zakazka => {
    // počíta len cesty na miesto realizácie
    var links = zakazka.linksFrom(LIB_KJ, "Zákazka")
    var zastavky = zakazka.linksFrom(LIB_KJ, "Zastávka na zákazke")
    var jazd = 0;
    if (links.length > 0 || zastavky.length > 0) {
        for (var p = 0; p < links.length; p++) {
            if (links[p].field("Účel jazdy") == "Výjazd") {
                jazd += 1;
            }
        };
        for (var p = 0; p < zastavky.length; p++) {
            var remoteLinks = zastavky[p].field("Zastávka na zákazke");
            rlIndex = getLinkIndex(zakazka, remoteLinks)
            if (remoteLinks[rlIndex].attr("účtovať jazdu") == true) {
                jazd += 1;
            }
        };
    }
    return jazd;
};
const zakazkaKm = zakazka => {
    var links = zakazka.linksFrom(LIB_KJ, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += (links[p].field("Najazdené km"));
        };
    }
    return result;
};
const zakazkaCasJazdy = zakazka => {
    var links = zakazka.linksFrom(LIB_KJ, "Zákazka")
    var result = 0;
    if (links.length > 0) {
        for (var p = 0; p < links.length; p++) {
            result += links[p].field("Trvanie") * links[p].field("Posádka").length;
        };
    }
    return result;
};
const prepocitatJazdu = jazda => {
    message("Prepočítavam záznam...");
    var ciel = jazda.field("Cieľ");
    var start = jazda.field("Štart");
    var trvanie = jazda.field("Trvanie");
    var vzdialenostStart = start[0].field("Vzdialenosť");
    var vzdialenostCiel = ciel[0].field("Vzdialenosť");
    var trvanieCiel = ciel[0].field("Trvanie");
    var trvanieStart = start[0].field("Trvanie");
    var ucelJazdy = "Neurčené";
    if (jazda.field("Zákazka")[0].field("Cenová ponuka")[0]) {
        var uctovanie = jazda.field(FLD_ZAKAZKA)[0].field(FLD_CP)[0].field("Účtovanie dopravy");
    } else {
        var uctovanie = "Neúčtovať";

    }

    if (ciel && start) {
        if (vzdialenostCiel == 0 && trvanieCiel == 0) {
            vzdialenostCiel = vzdialenostStart;
            trvanieCiel = trvanieStart;
            ucelJazdy = "Návrat";
        } else if (vzdialenostStart == 0 && trvanieStart == 0) {
            ucelJazdy = "Výjazd";
        }

        jazda.set("Najazdené km", vzdialenostCiel);
        jazda.set("Trvanie", (trvanieCiel / 3600000).toFixed(2));
        jazda.set("Účel jazdy", ucelJazdy);
        switch (uctovanie) {
            case "Paušál":
                if (ucelJazdy == ("Návrat")) {
                    jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                } else {
                    jazda.set("Spôsob účtovania jazdy", "Paušál");
                }
                break;
            case "Km":
                jazda.set("Spôsob účtovania jazdy", "Km");
                break;
            case "% zo zákazky":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
            case "Pevná cena":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
            case "Neúčtovať":
                jazda.set("Spôsob účtovania jazdy", "Neúčtovať");
                break;
        }
    } else {
        message("Nie sú všetky potrebné údaje");
    }
    message("Hotovo");
    // End of file: 22.03.2022, 14:54
}

// POKLADŇA
const newEntryPokladna = en => {
    scr.name = "newEntryPokladna 23.0.01"
    scr.param.en = en
    message("Nový záznam - " + APP.defaultName())
    try {
        setEntry(en)
        let date = new Date()
        let season = getSeason(en, APP.defaultName(), scr.name)
        let appDB = getAppSeasonDB(season, APP.defaultName(), scr.name)
        let number = getNewNumber(appDB, season, APP.defaultName(), scr.name)
        en.set(DATE, date)
        en.set(NUMBER, number[0])
        en.set("number", number[1])
        en.set(SEASON, season)
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, APP.defaultName())
        errorGen2(LIB_POKLADNA, "libPokladna.js", scr.name, error, variables, parameters)
    }
}
const updateEntryPokladna = en => {
    scr.name = "updateEntryPokladna 23.0.01"
    scr.param.en = en
    message("Úprava záznamu - " + APP.defaultName());
    try {

    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, APP.defaultName())
        errorGen2(LIB_POKLADNA, "libPokladna.js", scr.name, error, variables, parameters);
    }
}
const saveEntryPokladna = en => {
    scr.name = "saveEntryPokladna 23.0.02"
    scr.param.en = en
    try {
        prepocitatZaznamDochadzky(en)
        saveEntry(en, APP.defaultName())
    } catch (error) {
        en.set(VIEW, VIEW_DEBUG)
        unlockDB(season, APP.defaultName())
        errorGen2(LIB_POKLADNA, "libPokladna.js", scr.name, error, variables, parameters);
    }
}
const fillPopis = en => {
    scr.name = "fillPopis 23.0.01";
    scr.param.en = en
    try {
        let popis = en.field("Popis platby");
        if (!popis) {
            let typVydavku = en.field("Účel výdaja");
            switch(typVydavku) {
                case "Mzdy zamestnanci":
                    // code block
                    popis = "Mzda " + en.field("Zamestnanec")[0].field("Nick") ;
                    break;
                case "Mzdy odmeny":
                    // code block
                    popis = "Prémia " + en.field("Zamestnanec")[0].field("Nick");
                    break;
                case "Mzdy externé":
                    // code block
                    popis = "Externá mzda " + en.field("Zamestnanec")[0].field("Nick");
                    break;
                case "Prevádzková réžia":
                    // code block
                    let rezia = en.field("Prevádzková réžia");
                    popis = "Réžia " + rezia;
                    break;
                case "Nákup tovaru":
                    // code block
                    popis = "Nákup tovaru";
                    break;
                case "Finančné poplatky":
                    // code block
                    popis = "Finančné poplatky";
                    break;
                case "Podiely":
                    // code block
                    popis = "Podiely";
                    break;
                case "Výdavok na zákazku":
                    // code block
                    popis = "Výdavok na zákazku";
                    break;
                case "Súkromé do nákladov":
                    // code block
                    popis = "Súkromné";
                    break;
                default:
                    // code block
                }
            en.set("Popis platby", popis);
        } else {
            message(popis);
        }
    } catch (error) {
        errorGen2(LIB_POKLADNA, "libPokladna.js", scr.name, error, variables, parameters)
    }
}
const prepocetPlatby = en => {
    scr.name = "prepocetPlatby 23.0.01";
    scr.param.en = en
    try {
        let datum = en.field(DATE);
        let db = lib();
        // nastaviť sezónu
        en.set(SEASON, datum.getFullYear());
        let sezona = en.field(SEASON);
        // zistiť aktuálnu sadzbu dph v databáze
        if (en.field("s DPH")) {
            if (en.field("sadzba") === "základná") {
                let sadzbaDPH = libByName(APP).find(sezona)[0].field("Základná sadzba DPH") / 100
            } else if (en.field("sadzba") === "znížená") {
                let sadzbaDPH = libByName(APP).find(sezona)[0].field("Znížená sadzba DPH") / 100
            } else if (en.field("sadzba") === "nulová") {
                let sadzbaDPH = 0;
            }
            en.set("DPH%", sadzbaDPH * 100);
        }
        // inicializácia
        let zaklad = 0;
        let total = 0;
        let dph = 0;
        if (en.field("Pohyb") == "Výdavok") {
            if (en.field("s DPH")) {
                total = en.field("Suma s DPH");
                zaklad = en.field("Suma");
                if (total) {
                    zaklad = getSumaBezDPH(total, sadzbaDPH).toFixed(2);
                    en.set("Suma", zaklad);
                } else if (zaklad) {
                    total = getSumaSDPH(zaklad, sadzbaDPH).toFixed(2);
                    en.set("Suma s DPH", total);
                }
                dph = (total - zaklad).toFixed(2);
                en.set("DPH", dph);
            } else {
                en.set("Suma s DPH", null);
                en.set("DPH", null);
            };
            en.set("Do pokladne", null);
            en.set("Účel príjmu", null);
            en.set("Partner", null);
        } else if (en.field("Pohyb") == "Príjem") {
            if (en.field("s DPH")) {
                total = en.field("Suma s DPH");
                zaklad = total / (sadzbaDPH + 1);
                dph = total - zaklad;
                en.set("Suma", zaklad);
                en.set("DPH", dph);
            } else {
                en.set("Suma s DPH", 0);
                en.set("DPH", 0);
            };
            en.set("Suma s DPH", 0);
            en.set("Suma", 0);
            en.set("DPH", 0);
            en.set("Z pokladne", null);
            en.set("Účel výdaja", null);
            en.set("Prevádzková réžia", null);
            en.set("Dodávateľ", null);
            en.set("Zamestnanec", null);
            en.set("Stroj", null);
            en.set("Vozidlo", null);
        }
        fillPopis(en);
        message("Hotovo...");
    } catch (error) {
        errorGen2(LIB_POKLADNA, "libPokladna.js", scr.name, error, variables, parameters)
    }
}
const vyplataMzdy = zaznam => {
    message("Evidujem platby v.13");
    var sumaUhrady =  zaznam.field("Suma");
    var mzdy = libByName("aMzdy");
    var zamestnanec = zaznam.field("Zamestnanec")[0];
    var links = zamestnanec.linksFrom("aMzdy", "Zamestnanec").filter(e => e.field("Vyúčtované") == false )
    // skontrolovať či je už záznam nalinkovaný
    if (links.length > 0){
        //updatuj nalinkované záznamy
        message("Upravujem mzdové záznamy");

        for(var l = 0; l < links.length; l++) {
            var vyplata = links[l].field("Vyplatiť");
            var mzda = links[l].field("Mzda");
            var vMzda = links[l].field("Vyplatená mzda");

            if (sumaUhrady >= vyplata) {
                links[l].set("Vyplatená mzda", vyplata);
                links[l].set("Vyplatiť", 0);
                links[l].set("Vyúčtované", true);
                links[l].link("Platby", zaznam);
                links[l].field("Platby")[0].setAttr("suma", vyplata);
                sumaUhrady -= vyplata;
            } else if ( sumaUhrady != 0 && sumaUhrady < vyplata) {
                links[l].set("Vyplatená mzda", sumaUhrady);
                links[l].set("Vyplatiť", vyplata - sumaUhrady);
                links[l].link("Platby", zaznam);
                links[l].link("Platby", zaznam);
                links[l].field("Platby")[0].setAttr("suma", sumaUhrady);
                sumaUhrady = 0;
            }
        }
        if (sumaUhrady > 0) {
            zaznam.set("Preplatok na mzde", true);
            zaznam.set("Preplatok", sumaUhrady);
        }

    } else {
        message("Nie je žiadna dochádzka na úhradu")
    }

}
const convOld = en => {
    if (en.field("Pohyb") == "Výdavok") {
        en.set("Suma", en.field("Suma").toFixed(2))
        en.set("DPH", en.field("DPH").toFixed(2))
        en.set("Suma s DPH", en.field("Suma s DPH").toFixed(2))
    } else if (en.field("Pohyb") == "Príjem") {
        en.set("Suma", en.field("Suma").toFixed(2))
        en.set("DPH", en.field("DPH").toFixed(2))
        en.set("Suma s DPH", en.field("Suma s DPH").toFixed(2))
    } else if  (en.field("Pohyb") == "PP") {
        en.set("Suma", en.field("Priebežná položka").toFixed(2))

    } else {
        message("Nie je zadaný pohyb záznamu");

    }

}
// End of file: 20.03.2022, 12:17


// End of file: 15.03.2022, 07:59