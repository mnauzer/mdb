function verziaKniznice() {
    var nazov = "cennikPracLibrary";
    var verzia = "0.23.01";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

const setPrice = en => {
    let links = en.linksFrom("Ceny prác", "Práca");
    let date = new Date();
    let price = lastValid(links, date, "Cena", "Platnosť od");
    en.set("Cena bez DPH", price);
}