function verziaKniznice() {
    var nazov = "zamestnanciLibrary";
    var verzia = "0.2.01";
    //message("cpLibrary v." + verzia);
    return nazov + " " + verzia;
}

// spočíta platby zamestnanca
const zamestnanecPlatby = (zamestnanec, sezona) => {
    var platby = zamestnanec.linksFrom("Pokladňa","Zamestnanec")
}