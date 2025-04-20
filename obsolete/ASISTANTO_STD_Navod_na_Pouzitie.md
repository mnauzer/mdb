# Návod na použitie frameworku ASISTANTO STD

## Obsah
1. [Úvod](#úvod)
2. [Inštalácia](#inštalácia)
3. [Základné koncepty](#základné-koncepty)
4. [Používanie triggerov](#používanie-triggerov)
5. [Používanie akcií](#používanie-akcií)
6. [Integrácia s GitHub](#integrácia-s-github)
7. [Vytváranie vlastných skriptov](#vytváranie-vlastných-skriptov)
8. [Riešenie problémov](#riešenie-problémov)
9. [Príklady](#príklady)

## Úvod

ASISTANTO STD je framework pre Memento Database, ktorý poskytuje štandardizované knižnice a nástroje pre vývoj aplikácií. Framework je navrhnutý tak, aby bol modulárny, ľahko rozšíriteľný a dobre dokumentovaný.

Tento návod vás prevedie procesom inštalácie, konfigurácie a používania frameworku ASISTANTO STD.

## Inštalácia

### Požiadavky
- Memento Database (verzia 4.0 alebo vyššia)
- Prístup na internet (pre načítavanie knižníc z GitHubu)

### Postup inštalácie

1. **Vytvorenie databáz**
   - Vytvorte databázy podľa vašich potrieb (napr. Kniha jázd, Dochádzka, Zamestnanci, atď.)
   - Vytvorte systémové databázy:
     - ASISTANTO (hlavná databáza frameworku)
     - ASISTANTO DB (databáza s informáciami o databázach)
     - ASISTANTO Tenants (databáza s informáciami o tenantoch)
     - ASISTANTO Errors (databáza pre logovanie chýb)

2. **Nastavenie triggerov**
   - Pre každú databázu nastavte triggery podľa potreby
   - Triggery nastavte tak, aby načítavali knižnice z GitHubu a volali príslušné funkcie

3. **Nastavenie akcií**
   - Pre každú databázu nastavte akcie podľa potreby
   - Akcie nastavte tak, aby načítavali knižnice z GitHubu a volali príslušné funkcie

## Základné koncepty

### Namespace

Framework ASISTANTO STD používa namespace `std` pre všetky svoje knižnice a funkcie. Toto pomáha predchádzať konfliktom s inými knižnicami a funkciami.

Príklad:
```javascript
// Použitie konštánt
var constants = std.Constants;
var appName = constants.APP.NAME;

// Použitie utility funkcií
var date = new Date();
var formattedDate = std.Utils.Date.format(date, 'full');
```

### Knižnice

Framework ASISTANTO STD pozostáva z niekoľkých knižníc:

- **std.Constants** - Konštanty pre celý framework
- **std.Utils** - Utility funkcie pre prácu s dátami
- **std.ErrorHandler** - Spracovanie chýb a logovanie
- **std.Triggers** - Univerzálne triggery pre všetky databázy
- **std.HTML** - Generovanie HTML a práca so šablónami
- **std.Actions** - Univerzálne akcie pre všetky databázy
- **std.KnihaJazd** - Funkcie pre databázu Kniha jázd
- **std.Dochadzka** - Funkcie pre databázu Dochádzka
- **std.Zamestnanci** - Funkcie pre databázu Zamestnanci
- **std.CenovePonuky** - Funkcie pre databázu Cenové ponuky

### Závislosti

Knižnice frameworku ASISTANTO STD majú nasledujúce závislosti:

- **std.Constants** - Žiadne závislosti
- **std.ErrorHandler** - Závisí na std.Constants
- **std.Utils** - Závisí na std.Constants a std.ErrorHandler
- **std.Triggers** - Závisí na std.Constants, std.ErrorHandler a std.Utils
- **std.HTML** - Závisí na std.Constants, std.ErrorHandler a std.Utils
- **std.Actions** - Závisí na std.Constants, std.ErrorHandler, std.Utils a std.HTML
- **Špecifické knižnice** - Závisia na základných knižniciach

## Používanie triggerov

Triggery sú funkcie, ktoré sa spúšťajú pri určitých udalostiach v Memento Database, ako je vytvorenie záznamu, otvorenie záznamu, uloženie záznamu, atď.

### Nastavenie triggeru

1. V Memento Database otvorte databázu, pre ktorú chcete nastaviť trigger
2. Prejdite do nastavení databázy
3. Vyberte záložku "Triggers"
4. Kliknite na "Add trigger"
5. Vyberte typ triggeru (napr. "Creating an entry")
6. Vyberte fázu triggeru (napr. "Opening an Entry card")
7. Kliknite na "Edit script"
8. V dialógovom okne "Script Properties" kliknite na "Add URL"
9. Zadajte URL adresu knižnice std_triggers.js na GitHube
10. Pridajte ďalšie URL adresy pre knižnice, ktoré potrebujete (std_constants.js, std_errorHandler.js, std_utils.js)
11. Do script editora zadajte kód, ktorý volá príslušnú funkciu z knižnice std.Triggers

Príklad kódu pre trigger "Creating an entry" / "Opening an Entry card":
```javascript
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
```

### Dostupné triggery

Framework ASISTANTO STD poskytuje nasledujúce univerzálne triggery:

- **libOpen** - Otvorenie knižnice
- **libOpenBeforeShow** - Pred zobrazením knižnice
- **createEntryOpen** - Vytvorenie nového záznamu
- **createEntryAfterSave** - Po uložení nového záznamu
- **entryBeforeSave** - Pred uložením záznamu
- **entryAfterSave** - Po uložení záznamu
- **linkEntryBeforeSave** - Pred uložením prepojeného záznamu
- **entryOpen** - Otvorenie záznamu
- **entryDelete** - Vymazanie záznamu

### Špecifické triggery

Okrem univerzálnych triggerov môžete použiť aj špecifické triggery pre jednotlivé databázy. Tieto triggery sú definované v špecifických knižniciach pre jednotlivé databázy.

Príklad použitia špecifického triggeru:
```javascript
function createEntryOpen() {
  // Najprv sa vykoná univerzálny trigger
  std.Triggers.createEntryOpen();
  
  // Potom sa vykoná špecifický trigger
  if (lib().title === "Kniha jázd") {
    std.KnihaJazd.Triggers.createEntryOpen();
  }
}
```

## Používanie akcií

Akcie sú funkcie, ktoré sa spúšťajú na požiadanie používateľa, napríklad kliknutím na tlačidlo alebo výberom položky z menu.

### Nastavenie akcie

1. V Memento Database otvorte databázu, pre ktorú chcete nastaviť akciu
2. Prejdite do nastavení databázy
3. Vyberte záložku "Actions"
4. Kliknite na "Add action"
5. Zadajte názov akcie
6. Vyberte typ akcie (napr. "Entry action" alebo "Library action")
7. Kliknite na "Edit script"
8. V dialógovom okne "Script Properties" kliknite na "Add URL"
9. Zadajte URL adresu knižnice std_actions.js na GitHube
10. Pridajte ďalšie URL adresy pre knižnice, ktoré potrebujete (std_constants.js, std_errorHandler.js, std_utils.js, std_html.js)
11. Do script editora zadajte kód, ktorý volá príslušnú funkciu z knižnice std.Actions alebo špecifickej knižnice

Príklad kódu pre akciu "Generate Report":
```javascript
function generateReport() {
  return std.Actions.generateReport();
}
```

### Dostupné akcie

Framework ASISTANTO STD poskytuje nasledujúce univerzálne akcie:

- **generateReport** - Generovanie reportu
- **exportData** - Export dát
- **importData** - Import dát
- **bulkOperation** - Hromadná operácia

### Špecifické akcie

Okrem univerzálnych akcií môžete použiť aj špecifické akcie pre jednotlivé databázy. Tieto akcie sú definované v špecifických knižniciach pre jednotlivé databázy.

Príklad použitia špecifickej akcie:
```javascript
function calculateDistance() {
  return std.KnihaJazd.Actions.calculateDistance();
}
```

## Integrácia s GitHub

Framework ASISTANTO STD je uložený v GitHub repozitári, ktorý obsahuje všetky knižnice a dokumentáciu. Knižnice sú načítavané priamo z GitHubu do Memento Database pomocou URL adresy.

### Nastavenie URL adresy knižnice

1. V Memento Database otvorte script editor pre trigger alebo akciu
2. V dialógovom okne "Script Properties" kliknite na "Add URL"
3. Zadajte URL adresu knižnice na GitHube
4. Pridajte ďalšie URL adresy pre knižnice, ktoré potrebujete

Príklad URL adresy knižnice:
```
https://raw.githubusercontent.com/username/asistanto-std/main/std_constants.js
```

### Aktualizácia knižníc

Keď sa knižnice na GitHube aktualizujú, Memento Database automaticky načíta najnovšiu verziu pri ďalšom spustení triggeru alebo akcie.

## Vytváranie vlastných skriptov

Okrem používania existujúcich knižníc a funkcií môžete vytvárať aj vlastné skripty, ktoré rozširujú funkcionalitu frameworku ASISTANTO STD.

### Vytvorenie vlastnej knižnice

1. Vytvorte nový JavaScript súbor s prefixom "std_" (napr. "std_myLibrary.js")
2. Definujte namespace "std" a vašu knižnicu
3. Implementujte funkcie vašej knižnice
4. Nahrajte súbor na GitHub

Príklad vlastnej knižnice:
```javascript
// std_myLibrary.js

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// My library
std.MyLibrary = {
  /**
   * My function
   * @param {String} param - Parameter description
   * @returns {String} - Return value description
   */
  myFunction: function(param) {
    try {
      // Implementation
      return "Result: " + param;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "MyLibrary.myFunction", true);
      }
      return "";
    }
  }
};

// For backward compatibility
var std_MyLibrary = std.MyLibrary;
```

### Použitie vlastnej knižnice

1. V Memento Database otvorte script editor pre trigger alebo akciu
2. V dialógovom okne "Script Properties" kliknite na "Add URL"
3. Zadajte URL adresu vašej knižnice na GitHube
4. Do script editora zadajte kód, ktorý volá funkciu z vašej knižnice

Príklad použitia vlastnej knižnice:
```javascript
function myAction() {
  var result = std.MyLibrary.myFunction("Hello, world!");
  message(result);
}
```

## Riešenie problémov

### Chyba: Knižnica nie je načítaná

Ak sa zobrazí chyba "Cannot read property 'X' of undefined", môže to znamenať, že knižnica nie je správne načítaná.

**Riešenie**:
1. Skontrolujte, či je URL adresa knižnice správna
2. Skontrolujte, či je knižnica dostupná na GitHube
3. Skontrolujte, či máte pripojenie na internet
4. Skúste pridať knižnicu znova

### Chyba: Funkcia nie je definovaná

Ak sa zobrazí chyba "X is not a function", môže to znamenať, že funkcia nie je správne definovaná alebo načítaná.

**Riešenie**:
1. Skontrolujte, či je názov funkcie správny
2. Skontrolujte, či je knižnica, ktorá obsahuje funkciu, načítaná
3. Skontrolujte, či sú načítané všetky závislosti knižnice

### Chyba: Nesprávne parametre

Ak sa zobrazí chyba súvisiaca s parametrami funkcie, môže to znamenať, že funkcia je volaná s nesprávnymi parametrami.

**Riešenie**:
1. Skontrolujte dokumentáciu funkcie
2. Skontrolujte, či sú parametre správneho typu
3. Skontrolujte, či sú všetky povinné parametre zadané

### Logovanie chýb

Framework ASISTANTO STD poskytuje funkcie pre logovanie chýb, ktoré môžete použiť na diagnostiku problémov.

Príklad logovania chyby:
```javascript
try {
  // Kód, ktorý môže vyhodiť chybu
} catch (e) {
  std.ErrorHandler.createSystemError(e, "názov_funkcie", true);
}
```

Chyby sú logované do databázy ASISTANTO Errors, kde ich môžete prezerať a analyzovať.

## Príklady

### Príklad 1: Vytvorenie nového záznamu

```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
```

### Príklad 2: Výpočet vzdialenosti v Knihe jázd

```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function calculateDistance() {
  var entry = entry();
  return std.KnihaJazd.calculateTripDistance(entry);
}
```

### Príklad 3: Generovanie reportu

```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function generateReport() {
  var entry = entry();
  var template = std.HTML.loadTemplate('report');
  var data = {
    title: "Report",
    date: new Date(),
    items: [
      { name: "Item 1", value: 100 },
      { name: "Item 2", value: 200 },
      { name: "Item 3", value: 300 }
    ]
  };
  var html = std.HTML.renderTemplate(template, data);
  return html;
}
```

### Príklad 4: Spracovanie chyby

```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function myFunction() {
  try {
    // Kód, ktorý môže vyhodiť chybu
  } catch (e) {
    std.ErrorHandler.createSystemError(e, "myFunction", true);
  }
}
