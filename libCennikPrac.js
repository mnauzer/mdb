function verziaKniznice() {
    var nazov = "cennikPracLibrary";
    var verzia = "0.23.01";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

const setPrice = en => {
    message("V8");

    let links = en.linksFrom("Ceny prác", "Práca");
    if (links.length > 0) {
        message(links.length);

        let date = new Date();
        let price = lastValid(links, date, "Cena", "Platnosť od");
        message("Cena: " + price + "\nDátum: " + date);

        en.set("Cena bez DPH", price);
    } else {
        message("Položka nemá žiadne zaevidované ceny");
    }
}