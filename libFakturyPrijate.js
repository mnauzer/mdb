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

const updateObligations = entry =>{
    var lib = libByName(DBA_OBL);
    // check if entry exists
    var aEntry = linksFrom(DBA_OBL, A_OBL_FAKTURY);
    if (aEntry.length < 0) {
        // if not exitsts create new

    } else {
        // if exists update entry
    }


}