// Library/Event/Script:    libFakturyPrijate.js
// JS Libraries:
// Dátum:                   09.04.2023
// Popis:
// Autor:                   just me, for my garden business. this code is muddy like me
// scrtipt library pre knižnicu Faktúry Prijaté
const checkOverdue = (en, date) => {
    if (!en.field(DOFA_PAYED)){
        if (en.field(DOFA_D_SPL) <= date ) {
            en.set(ENT_COLOR, MEM_RED)
        } else {
            en.set(ENT_COLOR, MEM_BLUE)
        }
    } else {
            en.set(ENT_COLOR, MEM_GREEN)
    }
}

const updateObligations = entry => {
    var lib = libByName(DBA_OBL);
    // check if entry exist
    var aEntry = linksFrom(DBA_OBL, A_OBL_FAKTURY);
    if (aEntry.length < 0) {
        // if not exist, create new entry
        message("entry exist");

    } else {
        // if exist update entry
        message("entry not exist");
    }


}
// End of file: 09.04.2023, 12:14