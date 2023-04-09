// scrtipt library pre knižnicu Faktúry Prijaté
const checkOverdue = (en, date) => {
    if (en.field(DOFA_D_SPL) < date) {
        en.set(ENT_COLOR, MEM_RED)
    } else {
        en.set(ENT_COLOR, MEM_BLUE)
    }
}