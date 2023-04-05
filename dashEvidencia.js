function spocitajDochadzku(zamestnanec) {

}

function spocitajMzdy(zamestnanec){

}
var pracujuci = [];
var fiscalYear = 2003;

function najdiPracujucich(pracujuci, fiscalYear){
    try{
        var lib = libByName("Dochádzka");
        var entries = lib.entries();
        const fiscalEntries = entries.filter(e => e.field('sezóna') == fiscalYear)
        message("Počet záznamov: " + fiscalEntries);
        for (var e = 0;e < fiscalEntries.length; e++) {
            if (entries[e].field("sezóna") === fiscalYear){
                var zamestnanci = entries[e].field("Zamestnanci");
                for (var z = 0;z < zamestnanci.length; z++){
                    if(pracujuci.indexOf(zamestnanci[z]) === -1) {
                        pracujuci.push(zamestnanci[z]);
                        //message('Zamestnanec: ' + zamestnanci[z].field('Nick') + ' pridaný');
                    }
                }
            }
        }

        return pracujuci;

    } catch (error) {
        message('Chyba: ' + error);
    }
}