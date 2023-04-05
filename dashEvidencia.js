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
        for (var e = 0;e < entries.length; e++) {
            var zamestnanci = e.field("Zamestnanci");
            for (var z = 0;z < zamestnanci.length; z++){
                if(pracujuci.indexOf(z) === -1) {
                    pracujuci.push(z);
                    message('Zamestnanec: ' + z.field('Nick') + ' pridaný');
                }
            }
        }

        return pracujuci;

    } catch (error) {
        message('Chyba: ' + error);
    }
}