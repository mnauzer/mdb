// Library/Event/Script:    libFakturyPrijate.js
// JS Libraries:
// Dátum:                   09.04.2023
// Popis:
// Autor:                   just me, for my garden business. this code is muddy like me
// script library pre knižnicu Faktúry Prijaté
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

const updateObligations = en => {
    var obligations = libByName(DBA_OBL);
    // check if entry exist
    var links = en.linksFrom(DBA_OBL, A_OBL_INVC);
    if (links.length <= 0) {
        // if not exist, create new entry
        message("entry not exist");

    } else {
        // if exist update entry
        message("entry exist");
    }


}
// End of file: 09.04.2023, 12:14