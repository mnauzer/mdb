# Integrácia frameworku ASISTANTO STD s GitHub

## Obsah
1. [Úvod](#úvod)
2. [Vytvorenie GitHub repozitára](#vytvorenie-github-repozitára)
3. [Štruktúra repozitára](#štruktúra-repozitára)
4. [Nahrávanie súborov na GitHub](#nahrávanie-súborov-na-github)
5. [Načítavanie knižníc z GitHubu v Memento Database](#načítavanie-knižníc-z-githubu-v-memento-database)
6. [Aktualizácia knižníc](#aktualizácia-knižníc)
7. [Verziovanie](#verziovanie)
8. [Riešenie problémov](#riešenie-problémov)
9. [Príklady](#príklady)

## Úvod

Integrácia frameworku ASISTANTO STD s GitHub umožňuje centralizovanú správu knižníc, verziovanie a jednoduchú distribúciu aktualizácií. Tento dokument popisuje, ako vytvoriť repozitár na GitHube, ako nahrať súbory na GitHub a ako nastaviť Memento Database na načítavanie knižníc z GitHubu.

## Vytvorenie GitHub repozitára

### Požiadavky
- Účet na GitHube (https://github.com)
- Git klient (voliteľné, ak chcete pracovať s repozitárom lokálne)

### Postup vytvorenia repozitára

1. **Prihlásenie na GitHub**
   - Navštívte stránku https://github.com
   - Prihláste sa do svojho účtu

2. **Vytvorenie nového repozitára**
   - Kliknite na tlačidlo "New" v hornej časti stránky
   - Zadajte názov repozitára (napr. "asistanto-std")
   - Zadajte popis repozitára (napr. "Framework ASISTANTO STD pre Memento Database")
   - Vyberte viditeľnosť repozitára (verejný alebo súkromný)
   - Zaškrtnite "Initialize this repository with a README"
   - Kliknite na tlačidlo "Create repository"

3. **Nastavenie repozitára**
   - Prejdite do nastavení repozitára (záložka "Settings")
   - Nastavte prístupové práva podľa potreby
   - Nastavte vetvy (branches) podľa potreby
   - Nastavte webhooky a integrácie podľa potreby

## Štruktúra repozitára

Odporúčaná štruktúra repozitára pre framework ASISTANTO STD:

```
asistanto-std/
├── README.md                           # Popis repozitára
├── LICENSE                             # Licencia
├── docs/                               # Dokumentácia
│   ├── ASISTANTO_STD_Framework_Analyza.md
│   ├── ASISTANTO_STD_Struktura_Suborov.md
│   ├── ASISTANTO_STD_Navod_na_Pouzitie.md
│   └── ASISTANTO_STD_Integracia_s_GitHub.md
├── src/                                # Zdrojové kódy
│   ├── core/                           # Základné knižnice
│   │   ├── std_constants.js
│   │   ├── std_errorHandler.js
│   │   ├── std_utils.js
│   │   ├── std_triggers.js
│   │   ├── std_html.js
│   │   └── std_actions.js
│   └── modules/                        # Špecifické knižnice
│       ├── std_knihaJazd.js
│       ├── std_dochadzka.js
│       ├── std_zamestnanci.js
│       └── std_cenovePonuky.js
└── templates/                          # HTML šablóny
    ├── report.html
    ├── invoice.html
    └── form.html
```

## Nahrávanie súborov na GitHub

### Nahrávanie súborov cez webové rozhranie

1. **Navigácia do priečinka**
   - Otvorte repozitár na GitHube
   - Navigujte do priečinka, do ktorého chcete nahrať súbor
   - Kliknite na tlačidlo "Add file" a vyberte "Upload files"

2. **Výber súborov**
   - Presuňte súbory do oblasti pre nahrávanie alebo kliknite na "choose your files" a vyberte súbory
   - Zadajte popis zmien (commit message)
   - Kliknite na tlačidlo "Commit changes"

### Nahrávanie súborov pomocou Git klienta

1. **Klonovanie repozitára**
   - Otvorte terminál alebo príkazový riadok
   - Zadajte príkaz `git clone https://github.com/username/asistanto-std.git`
   - Navigujte do klonovaného repozitára `cd asistanto-std`

2. **Pridanie súborov**
   - Skopírujte súbory do príslušných priečinkov
   - Zadajte príkaz `git add .` pre pridanie všetkých súborov
   - Zadajte príkaz `git commit -m "Popis zmien"`
   - Zadajte príkaz `git push origin main` pre nahratie zmien na GitHub

## Načítavanie knižníc z GitHubu v Memento Database

### URL adresy knižníc

Pre načítavanie knižníc z GitHubu v Memento Database potrebujete URL adresy knižníc. URL adresa knižnice má nasledujúci formát:

```
https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_constants.js
```

kde:
- `username` je vaše používateľské meno na GitHube
- `asistanto-std` je názov repozitára
- `main` je názov vetvy
- `src/core/std_constants.js` je cesta k súboru v repozitári

### Nastavenie URL adresy knižnice v Memento Database

1. **Otvorenie script editora**
   - V Memento Database otvorte databázu
   - Prejdite do nastavení databázy
   - Vyberte záložku "Triggers" alebo "Actions"
   - Vyberte trigger alebo akciu
   - Kliknite na "Edit script"

2. **Pridanie URL adresy knižnice**
   - V dialógovom okne "Script Properties" kliknite na "Add URL"
   - Zadajte URL adresu knižnice
   - Pridajte ďalšie URL adresy pre knižnice, ktoré potrebujete
   - Kliknite na "OK"

3. **Použitie knižnice v skripte**
   - Do script editora zadajte kód, ktorý volá funkciu z knižnice
   - Kliknite na "Save"

### Príklad nastavenia URL adresy knižnice

Predpokladajme, že máte repozitár `asistanto-std` na GitHube s používateľským menom `username` a chcete načítať knižnicu `std_constants.js` z priečinka `src/core`.

1. URL adresa knižnice bude:
```
https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_constants.js
```

2. V dialógovom okne "Script Properties" pridajte túto URL adresu.

3. V script editore môžete použiť knižnicu:
```javascript
function myFunction() {
  var constants = std.Constants;
  var appName = constants.APP.NAME;
  message(appName);
}
```

## Aktualizácia knižníc

Keď aktualizujete knižnice na GitHube, Memento Database automaticky načíta najnovšiu verziu pri ďalšom spustení triggeru alebo akcie. Nie je potrebné manuálne aktualizovať URL adresy knižníc v Memento Database.

### Postup aktualizácie knižníc

1. **Aktualizácia súborov na GitHube**
   - Upravte súbory lokálne alebo priamo na GitHube
   - Nahrajte aktualizované súbory na GitHub

2. **Testovanie aktualizácií**
   - Spustite trigger alebo akciu v Memento Database
   - Overte, či aktualizácie fungujú správne

## Verziovanie

Pre lepšiu správu verzií frameworku ASISTANTO STD odporúčame používať sémantické verziovanie (Semantic Versioning).

### Sémantické verziovanie

Sémantické verziovanie používa formát MAJOR.MINOR.PATCH, kde:
- MAJOR - zmeny, ktoré nie sú spätne kompatibilné
- MINOR - pridanie nových funkcií, ktoré sú spätne kompatibilné
- PATCH - opravy chýb, ktoré sú spätne kompatibilné

### Postup verziovania

1. **Vytvorenie tagu**
   - Po dokončení zmien vytvorte tag s číslom verzie
   - Zadajte príkaz `git tag v1.0.0`
   - Zadajte príkaz `git push origin v1.0.0`

2. **Vytvorenie release**
   - Na GitHube prejdite do sekcie "Releases"
   - Kliknite na "Draft a new release"
   - Vyberte tag
   - Zadajte názov release
   - Zadajte popis zmien
   - Kliknite na "Publish release"

3. **Aktualizácia dokumentácie**
   - Aktualizujte číslo verzie v dokumentácii
   - Aktualizujte zoznam zmien v dokumentácii

### Použitie konkrétnej verzie

Ak chcete použiť konkrétnu verziu knižnice, môžete v URL adrese knižnice špecifikovať tag namiesto vetvy:

```
https://raw.githubusercontent.com/username/asistanto-std/v1.0.0/src/core/std_constants.js
```

## Riešenie problémov

### Chyba: Knižnica nie je načítaná

Ak sa zobrazí chyba "Cannot read property 'X' of undefined", môže to znamenať, že knižnica nie je správne načítaná.

**Riešenie**:
1. Skontrolujte, či je URL adresa knižnice správna
2. Skontrolujte, či je knižnica dostupná na GitHube
3. Skontrolujte, či máte pripojenie na internet
4. Skúste pridať knižnicu znova

### Chyba: Nesprávna verzia knižnice

Ak sa zobrazí chyba súvisiaca s nesprávnou verziou knižnice, môže to znamenať, že Memento Database načítava starú verziu knižnice z cache.

**Riešenie**:
1. Vyčistite cache prehliadača
2. Reštartujte Memento Database
3. Skúste použiť konkrétnu verziu knižnice v URL adrese

### Chyba: Súbor nie je nájdený

Ak sa zobrazí chyba "404 Not Found", môže to znamenať, že súbor neexistuje na GitHube alebo URL adresa je nesprávna.

**Riešenie**:
1. Skontrolujte, či je súbor na GitHube
2. Skontrolujte, či je URL adresa správna
3. Skontrolujte, či je repozitár verejný alebo či máte prístup k súkromnému repozitáru

## Príklady

### Príklad 1: Načítanie základných knižníc

```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties:
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_constants.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_errorHandler.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_utils.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_triggers.js

// Potom v script editore
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
```

### Príklad 2: Načítanie špecifickej knižnice

```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties:
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_constants.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_errorHandler.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_utils.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/modules/std_knihaJazd.js

// Potom v script editore
function calculateDistance() {
  var entry = entry();
  return std.KnihaJazd.calculateTripDistance(entry);
}
```

### Príklad 3: Načítanie konkrétnej verzie knižnice

```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties:
// https://raw.githubusercontent.com/username/asistanto-std/v1.0.0/src/core/std_constants.js
// https://raw.githubusercontent.com/username/asistanto-std/v1.0.0/src/core/std_errorHandler.js
// https://raw.githubusercontent.com/username/asistanto-std/v1.0.0/src/core/std_utils.js
// https://raw.githubusercontent.com/username/asistanto-std/v1.0.0/src/core/std_triggers.js

// Potom v script editore
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
