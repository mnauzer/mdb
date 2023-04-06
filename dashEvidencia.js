function spocitajDochadzku(zamestnanec) {

}

function spocitajMzdy(zamestnanec) {

}

function najdiPracujucich(fiscalYear) {
        var pracujuci = [];
        var lib = libByName("Dochádzka");
        var entries = lib.entries();
        const fiscalEntries = entries.filter(e => e.field('sezóna') == fiscalYear)
        message("Počet záznamov: " + fiscalEntries.length);
        for (var e = 0;e < fiscalEntries.length; e++) {
            var zamestnanci = fiscalEntries[e].field("Zamestnanci");
            for (var z = 0;z < zamestnanci.length; z++) {
                if(pracujuci.indexOf(zamestnanci[z]) === -1) {
                    pracujuci.push(zamestnanci[z]);
                    //message('Zamestnanec: ' + zamestnanci[z].field('Nick') + ' pridaný');
                }
            }
        }
       return pracujuci;
}

// spočítať vyplatené mzdy zamestnancovi za obdobie (rok)
const zamPlatby = (zam, rok ) =>{
    var lib = libByName("Pokladňa"); // const dbLib.js
    var entries = lib.entries();
    var vyplatene = 0;
    for (var e = 0; e < entries.length; e++) {
        if (entries[e].field("Zamestnanec") === zam && entries[e].field("sezóna") === rok){
            vyplatene += entries[e].field("Výdavok bez DPH");
        }
    }
    return vyplatene;
}

