// padding number
const pad = (number, length) => {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
};

const remoteMessage = ((mes) => {
    message("Remote script: " + mes);
});

class Dochadzka {
    constructor(entry) {
        this.lib = "Dochádzka";
        this.datum = entry.field("Dátum");
        this.prichod = entry.field("Príchod");
        this.odchod = entry.field("Odchod");
        this.zamestnanci = entry.field("Zamestnanci");
        this.prace = entry.field("Práce");
        // vypočítané
        this.odpracovane = entry.field("Odpracované");
        this.pracovnaDoba = entry.field("Pracovná doba");
        this.naZakazkach = entry.field("Na zákazkach");
        this.prestoje = entry.field("Prestoje");
        this.mzdoveNaklady = entry.field("Mzdové náklady");
    }
    library() {
        message("Knižnica je:" + this.lib);
        return this;
    }
}