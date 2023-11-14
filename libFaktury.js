// FAKTÚRY VYSTAVENÉ
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
const checkRcpts = en => {
// skontroluje či položky faktúry sú zaevidované na skladovej príjemke
    var receipts = libByName(LIB_RCPTS);

    var links = en.linksFrom(LIB_RCPTS, RCPTS_INVC);
    if (links.length <= 0) {
        // if not exist, create new entry
        en.set(BKG_COLOR, MEM_LIGHT_BLUE)

    } else {
        // if exist update entry
        en.set(BKG_COLOR, MEM_LIGHT_GREEN)
    }

}
const updateObligations = en => {
// vytvorí alebo upraví záznam v aZáväzky
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

// FAKTÚRY PRIJATÉ


// End of file: 09.04.2023, 12:14