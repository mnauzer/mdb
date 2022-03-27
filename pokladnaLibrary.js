// Library/Event/Script:    Evidencia\Pokladňa\shared\pokladnaLibrary.js
// JS Libraries:
// Dátum:                   20.03.2022
// Popis:
const getSumaBezDPH = (sumaSDPH, sadzbaDPH) => {
    result = 0;
    result = sumaSDPH / (sadzbaDPH + 1);
    return result;
}

const getSumaSDPH = (sumaBezDPH, sadzbaDPH) => {
    result = 0;
    result = sumaBezDPH * (sadzbaDPH + 1);
    return result;
}

const calcUcet = (ucet) => {
    var result = 0;
    // prepočíta zadaný účet
    return result;
}
// End of file: 20.03.2022, 12:17