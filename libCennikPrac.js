function verziaKniznice() {
    var nazov = "cennikPracLibrary";
    var verzia = "0.23.01";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

const setPrice = en => {
    message("V1");

    var links = en.linksFrom("Ceny prác", "Práca");
    if (links.lenght > 0) {
        var date = new Date();
        var price = lastValid(links, date, "Cena", "Platnosť od");
        en.set("Cena bez DPH", price);
    } else {
        message("Položka nemá žiadne zaevidované ceny");
    }
}