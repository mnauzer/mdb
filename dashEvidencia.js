function spocitajDochadzku(zamestnanec) {

}

function spocitajMzdy(zamestnanec){

}

function najdiPracujucich(pracujuci, fiscalYear){
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
        message("Pracujúcich zamestnancov: " + pracujuci.length);
        return pracujuci;
}