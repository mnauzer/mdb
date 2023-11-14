// TODO json export
const zakazkaToJsonHZS = zakazka => {
    var result = "";
    var cp = zakazka.field(FLD_CP)[0];
    var vyuctovanie = zakazka.field(FLD_VYUCTOVANIE)[0];
    var f = file("/sdcard/" + zakazka.field(NUMBER) + "_file.json");
    var odberatel = zakazka.field("Klient")[0];
    f.writeLine('{"Odberateľ":{');
    f.writeLine('"Nick"' + ':"' + odberatel.field("Nick") + '",');
    f.writeLine('"Meno"' + ':"' + odberatel.field("Meno") + '",');
    f.writeLine('"Priezvisko"' + ':"' + odberatel.field("Priezvisko") + '",');
    f.writeLine('"Titul"' + ':"' + odberatel.field("Titul") + '",');
    f.writeLine('"Ulica"' + ':"' + odberatel.field("Ulica") + '",');
    f.writeLine('"PSČ"' + ':"' + odberatel.field("PSČ") + '",');
    f.writeLine('"Mesto"' + ':"' + odberatel.field("Mesto") + '"},');
    f.writeLine('"Základné nastavenia":{');
    f.writeLine('"Typ vyúčtovania"' + ':"' + zakazka.field("Účtovanie zákazky") + '",');
    f.writeLine('"+Mechanizácia"' + ':' + cp.field("+Mechanizácia") + ',');
    f.writeLine('"+Materiál"' + ':' + cp.field("+Materiál") + ',');
    f.writeLine('"Počítanie hodinových sadzieb"' + ':"' + cp.field("Počítanie hodinových sadzieb") + '",');
    f.writeLine('"Účtovanie dopravy"' + ':"' + cp.field("Účtovanie dopravy") + '",');
    f.writeLine('"Cenová ponuka"' + ':"' + cp.title + '",');
    f.writeLine('"Účtovanie DPH":{');
    f.writeLine('"Práce"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Práce") + ',');
    f.writeLine('"Materiál"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Materiál") + ',');
    f.writeLine('"Stroje"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Mechanizácia") + ',');
    f.writeLine('"Doprava"' + ':' + mclCheck(zakazka.field("Účtovanie DPH"), "Doprava") + '}');
    f.writeLine('},');
    f.writeLine('"Rekapitulácia vyúčtovania":{');
    f.writeLine('"Celkom (bez DPH)"' + ':' + vyuctovanie.field("Celkom (bez DPH)") + ',');
    f.writeLine('"DPH 20%"' + ':' + vyuctovanie.field("DPH 20%") + ',');
    f.writeLine('"Cena celkom (s DPH)"' + ':' + vyuctovanie.field("Cena celkom (s DPH)") + ',');
    f.writeLine('"Zaplatená záloha"' + ':' + vyuctovanie.field("Zaplatená záloha") + ',');
    f.writeLine('"Suma na úhradu"' + ':' + vyuctovanie.field("Suma na úhradu") + '},');
    f.writeLine('"Rozpis prác":{');
    f.writeLine('"' + vyuctovanie.field("Záhradnícke práce")[0].title + '":{');
    f.writeLine('"počet hodín"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("počet hodín") + ',');
    f.writeLine('"základná sadzba"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("základná sadzba") + ',');
    f.writeLine('"zľava"' + ':"' + vyuctovanie.field("Záhradnícke práce")[0].attr("zľava") + '",');
    f.writeLine('"účtovaná sadzba"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("účtovaná sadzba") + ',');
    f.writeLine('"cena celkom"' + ':' + vyuctovanie.field("Záhradnícke práce")[0].attr("cena celkom") + '}');
    f.writeLine('}}');
    f.close();                      // Close & save. Until closed,
    //   the file is still empty
    //var a = f.readLines();
    return result;
}