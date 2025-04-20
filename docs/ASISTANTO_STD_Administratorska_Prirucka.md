# ASISTANTO STD - Administrátorská príručka

## 1. Úvod

### 1.1 Prehľad frameworku ASISTANTO STD

ASISTANTO STD je modulárny framework pre Memento Database, ktorý poskytuje štandardizované riešenie pre správu dát, spracovanie chýb, generovanie reportov a ďalšie funkcie. Framework je navrhnutý s dôrazom na modularitu, rozšíriteľnosť a jednoduchú údržbu.

Framework ASISTANTO STD je výsledkom refaktoringu pôvodného frameworku ASISTANTO s cieľom zlepšiť jeho štruktúru, zvýšiť jeho spoľahlivosť a uľahčiť jeho rozšírenie o nové funkcie.

### 1.2 Architektúra a moduly

Framework ASISTANTO STD je rozdelený do nasledujúcich základných modulov:

1. **std_constants.js** - Centralizované konštanty pre celý framework
2. **std_errorHandler.js** - Spracovanie chýb a logovanie
3. **std_utils.js** - Utility funkcie pre bežné operácie
4. **std_triggers.js** - Triggery pre Memento Database
5. **std_html.js** - Generovanie HTML a práca so šablónami
6. **std_actions.js** - Akcie pre Memento Database

Okrem základných modulov framework obsahuje aj špecifické moduly pre jednotlivé databázy, ako napríklad:

- **std_knihaJazd.js** - Funkcie pre prácu s knihou jázd
- **std_dochadzka.js** - Funkcie pre prácu s dochádzkou
- **std_cenovePonuky.js** - Funkcie pre prácu s cenovými ponukami

Všetky moduly používajú rovnaký namespace `std` a sú navrhnuté tak, aby mohli byť použité samostatne alebo spolu s ostatnými modulmi.

### 1.3 Inštalácia a konfigurácia

#### 1.3.1 Inštalácia frameworku

Pre inštaláciu frameworku ASISTANTO STD do Memento Database postupujte podľa nasledujúcich krokov:

1. **Príprava súborov**
   - Stiahnite si najnovšiu verziu frameworku z GitHub repozitára
   - Rozbaľte súbory do priečinka na vašom zariadení

2. **Nahratie základných modulov**
   - Otvorte Memento Database
   - Prejdite do databázy, kde chcete framework používať
   - Prejdite do nastavení databázy
   - Vyberte záložku "Scripts"
   - Kliknite na "Add script"
   - Zadajte názov skriptu (napr. "std_constants")
   - Skopírujte obsah súboru std_constants.js do editora skriptu
   - Kliknite na "Save"
   - Opakujte pre všetky základné moduly

3. **Nastavenie triggerov**
   - Prejdite do záložky "Triggers"
   - Pre každý trigger vyberte príslušnú funkciu z modulu std_triggers.js
   - Napríklad pre trigger "Create Entry Open" vyberte funkciu "createEntryOpen"

4. **Nastavenie akcií**
   - Prejdite do záložky "Actions"
   - Pre každú akciu vyberte príslušnú funkciu z modulu std_actions.js
   - Napríklad pre akciu "Generate Report" vyberte funkciu "generateReport"

#### 1.3.2 Konfigurácia frameworku

Framework ASISTANTO STD je možné konfigurovať úpravou konštánt v module std_constants.js. Najdôležitejšie konfiguračné parametre sú:

- **APP** - Základné informácie o aplikácii (názov, verzia, atď.)
- **LIBRARIES** - Názvy databáz používaných v aplikácii
- **FIELDS** - Názvy polí používaných v databázach
- **DEFAULTS** - Predvolené hodnoty pre rôzne polia

Príklad konfigurácie:

```javascript
// Konfigurácia aplikácie
APP: {
  NAME: 'ASISTANTO 2',
  VERSION: '2.04.0091',
  APP: 'ASISTANTO',
  DB: 'ASISTANTO DB',
  ERRORS: 'ASISTANTO Errors',
  TENANTS: 'ASISTANTO Tenants',
  SCRIPTS: 'ASISTANTO Scripts',
  TODO: 'ASISTANTO ToDo',
  TENANT: 'KRAJINKA'
}
```

### 1.4 Systémové požiadavky

Pre správne fungovanie frameworku ASISTANTO STD sú potrebné nasledujúce systémové požiadavky:

- **Memento Database** verzia 4.0 alebo vyššia
- **Android** verzia 5.0 alebo vyššia
- **Internetové pripojenie** pre načítavanie knižníc z GitHubu (voliteľné)

## 2. Základné moduly

### 2.1 std_constants.js - Konštanty a konfigurácia

Modul std_constants.js obsahuje centralizované konštanty pre celý framework. Tieto konštanty sú používané v ostatných moduloch a poskytujú jednotný spôsob prístupu k názvom databáz, polí a ďalším konfiguračným parametrom.

#### 2.1.1 Štruktúra konštánt

Konštanty sú organizované do logických skupín:

- **FRAMEWORK** - Informácie o frameworku (názov, verzia, atď.)
- **APP** - Základné informácie o aplikácii
- **LIBRARIES** - Názvy databáz používaných v aplikácii
- **FIELDS** - Názvy polí používaných v databázach
- **SECTIONS** - Názvy sekcií v databázach
- **COLORS** - Definície farieb používaných v aplikácii
- **VIEW_STATES** - Stavy zobrazenia záznamov
- **DEFAULTS** - Predvolené hodnoty pre rôzne polia
- **MESSAGES** - Systémové správy
- **CALCULATION** - Konštanty pre výpočty

#### 2.1.2 Rozšírenie a úprava konštánt

Pre rozšírenie alebo úpravu konštánt postupujte podľa nasledujúcich krokov:

1. Otvorte súbor std_constants.js v editore skriptov
2. Nájdite príslušnú sekciu konštánt
3. Pridajte alebo upravte konštanty podľa potreby
4. Uložte zmeny

Príklad rozšírenia konštánt:

```javascript
// Pridanie novej databázy
LIBRARIES: {
  // Existujúce databázy
  ...

  // Nová databáza
  CUSTOM: {
    MY_DATABASE: 'Moja databáza'
  }
}

// Pridanie polí pre novú databázu
FIELDS: {
  // Existujúce polia
  ...

  // Polia pre novú databázu
  MY_DATABASE: {
    NAME: 'Názov',
    DESCRIPTION: 'Popis',
    AMOUNT: 'Suma'
  }
}
```

#### 2.1.3 Príklady použitia

```javascript
// Získanie názvu aplikácie
var appName = std.Constants.APP.NAME;

// Získanie názvu databázy
var dbName = std.Constants.LIBRARIES.RECORDS.TRAVEL_LOG;

// Získanie názvu poľa
var fieldName = std.Constants.FIELDS.COMMON.DATE;

// Získanie predvolenej hodnoty
var defaultArrival = std.Constants.DEFAULTS.ATTENDANCE.ARRIVAL;
```

### 2.2 std_errorHandler.js - Spracovanie chýb

Modul std_errorHandler.js poskytuje jednotný spôsob spracovania chýb, logovania a zobrazovania chybových hlásení. Modul je navrhnutý tak, aby minimalizoval dopad chýb na používateľa a poskytoval užitočné informácie pre vývojárov pri riešení problémov.

#### 2.2.1 Implementácia console objektu

Memento Database nemá natívnu podporu pre `console.log()` a podobné funkcie, ktoré sú bežné v iných JavaScript prostrediach. Modul std_errorHandler.js preto implementuje vlastný `console` objekt s nasledujúcimi metódami:

- **console.log** - Logovanie bežných správ (typ 'log')
- **console.warn** - Logovanie varovných správ (typ 'warn')
- **console.error** - Logovanie chybových správ (typ 'error')
- **console.msg** - Logovanie používateľských správ (typ 'message')

Tieto metódy zapisujú správy do databázy ASISTANTO Errors s príslušným typom a obsahujú robustné ošetrenie chýb s fallbackom na dialog() metódu.

Príklad implementácie:

```javascript
// Vytvorenie console objektu ak neexistuje
if (typeof console === 'undefined') {
  var console = {
    log: function(message, script, line, parameters, attributes) {
      try {
        // Zápis do databázy ASISTANTO Errors
        var logLib = libByName('ASISTANTO Errors');
        if (logLib) {
          var entry = logLib.create();
          entry.set('type', 'log');
          entry.set('date', new Date());
          entry.set('memento library', lib().title);
          entry.set('script', script || 'console.log');
          entry.set('line', line || 'unknown');
          entry.set('text', message);
          entry.set('user', user());

          // Set parameters and attributes if provided
          if (parameters) {
            entry.set('parameters', JSON.stringify(parameters));
          }
          if (attributes) {
            entry.set('attributes', JSON.stringify(attributes));
          }

          entry.save();
        }
      } catch (e) {
        // Fallback na dialog
        try {
          var errorDialog = dialog();
          errorDialog.title('Console Log Error')
                    .text('Failed to log message: ' + message)
                    .positiveButton('OK', function() {})
                    .show();
        } catch (dialogError) {
          // Tiché zlyhanie ak zlyhá aj dialog
        }
      }
    },
    // Podobne implementované warn, error a msg metódy
  };
}
```

Každá metóda prijíma nasledujúce parametre:
- **message** (povinný) - Správa, ktorá sa má zaznamenať
- **script** (voliteľný) - Názov skriptu, ktorý vygeneroval správu
- **line** (voliteľný) - Číslo riadku, kde bola správa vygenerovaná
- **parameters** (voliteľný) - Parametre funkcie, ktorá vygenerovala správu (ako objekt)
- **attributes** (voliteľný) - Atribúty súvisiace so správou (ako objekt)

#### 2.2.2 Typy chýb

Modul rozlišuje nasledujúce typy chýb:

- **Systémové chyby** - Chyby súvisiace so systémom (napr. chyby JavaScriptu)
- **Databázové chyby** - Chyby súvisiace s databázou (napr. chyby pri čítaní alebo zápise dát)
- **Validačné chyby** - Chyby súvisiace s validáciou dát (napr. neplatné vstupy)
- **Biznis chyby** - Chyby súvisiace s biznis logikou (napr. nedostatok prostriedkov)

#### 2.2.3 Logovanie chýb

Modul poskytuje nasledujúce funkcie pre logovanie:

- **logError** - Logovanie chybových správ
- **logWarning** - Logovanie varovných správ
- **logInfo** - Logovanie informačných správ

Všetky logy sú ukladané do databázy ASISTANTO Errors, ktorá obsahuje nasledujúce polia:

- **Typ** - Typ záznamu (ERROR, WARNING, INFO, LOG)
- **Zdroj** - Zdroj záznamu (názov modulu a funkcie)
- **Správa** - Text správy
- **Dátum** - Dátum a čas vytvorenia záznamu
- **Používateľ** - Používateľ, ktorý vyvolal akciu
- **Poznámka** - Dodatočné informácie o chybe

#### 2.2.4 Zobrazovanie chybových hlásení

Modul používa dialog() metódu namiesto message() metódy pre zobrazovanie chybových hlásení, čo umožňuje zobrazenie viacriadkových správ a poskytuje lepšiu používateľskú skúsenosť.

Modul poskytuje funkcie pre zobrazovanie chybových hlásení používateľovi:

- **createSystemError** - Vytvorenie a zobrazenie systémovej chyby
- **createDatabaseError** - Vytvorenie a zobrazenie databázovej chyby
- **createValidationError** - Vytvorenie a zobrazenie validačnej chyby
- **createBusinessError** - Vytvorenie a zobrazenie biznis chyby

Chybové hlásenia sú zobrazované pomocou dialógových okien, ktoré obsahujú názov chyby, zdroj chyby a text chyby. Modul obsahuje viacúrovňový fallback mechanizmus pre prípad zlyhania primárneho spôsobu zobrazovania chýb.

#### 2.2.5 Príklady použitia

```javascript
// Použitie console objektu
console.log("Informačná správa");
console.warn("Varovná správa");
console.error("Chybová správa");

// Spracovanie systémovej chyby
try {
  // Kód, ktorý môže vyvolať chybu
  var result = someFunction();
} catch (e) {
  std.ErrorHandler.createSystemError(e, "myFunction", true);
}

// Logovanie informácie
std.ErrorHandler.logInfo("MyModule", "myFunction", "Operácia úspešne dokončená");

// Logovanie varovania
std.ErrorHandler.logWarning("MyModule", "myFunction", "Neštandardná situácia");

// Logovanie chyby
std.ErrorHandler.logError("MyModule", "myFunction", "Nepodarilo sa načítať dáta");
```

#### 2.2.6 Výhody vylepšeného spracovania chýb

Vylepšené spracovanie chýb prináša nasledujúce výhody:

1. **Robustnosť**:
   - Viacúrovňové ošetrenie chýb zabezpečuje, že aj v prípade zlyhania primárneho mechanizmu sa použije záložný
   - Tiché zlyhanie v najhoršom prípade zabraňuje kaskádovým chybám

2. **Lepšia diagnostika**:
   - Všetky chyby sú zaznamenané v databáze "ASISTANTO Errors"
   - Záznamy obsahujú detailné informácie vrátane zdroja, času a používateľa

3. **Používateľsky prívetivé hlásenia**:
   - Použitie dialog() metódy umožňuje zobrazenie viacriadkových chybových hlásení
   - Konzistentný formát chybových hlásení v celej aplikácii

4. **Spätná kompatibilita**:
   - Riešenie je plne kompatibilné s existujúcim kódom
   - Zachováva všetky pôvodné funkcie a správanie

### 2.3 std_utils.js - Utility funkcie

Modul std_utils.js poskytuje sadu utility funkcií pre bežné operácie, ako je práca s dátumami, reťazcami, číslami, objektmi a poliami. Modul tiež obsahuje funkcie pre prácu s poliami v Memento Database a generovanie čísel záznamov.

#### 2.3.1 Práca s dátumami

Modul poskytuje nasledujúce funkcie pre prácu s dátumami:

- **Date.format** - Formátovanie dátumu na reťazec
- **Date.addDays** - Pridanie dní k dátumu
- **Date.roundToQuarter** - Zaokrúhlenie času na najbližšiu štvrťhodinu
- **Date.calculateHours** - Výpočet hodín medzi dvoma dátumami
- **Date.isBefore** - Kontrola, či je jeden dátum pred druhým
- **Date.parseTime** - Parsovanie času z reťazca

Príklady použitia:

```javascript
// Formátovanie dátumu
var formattedDate = std.Utils.Date.format(new Date(), 'full'); // 01.01.2023

// Pridanie dní k dátumu
var newDate = std.Utils.Date.addDays(new Date(), 7); // Dátum o týždeň neskôr

// Výpočet hodín medzi dvoma dátumami
var hours = std.Utils.Date.calculateHours(startDate, endDate);
```

#### 2.3.2 Práca s reťazcami

Modul poskytuje nasledujúce funkcie pre prácu s reťazcami:

- **String.format** - Formátovanie reťazca s placeholdermi
- **String.isEmpty** - Kontrola, či je reťazec prázdny
- **String.truncate** - Skrátenie reťazca na maximálnu dĺžku
- **String.padNumber** - Doplnenie čísla nulami na začiatku

Príklady použitia:

```javascript
// Formátovanie reťazca
var message = std.Utils.String.format("Ahoj, {0}!", "Jano"); // "Ahoj, Jano!"

// Kontrola prázdneho reťazca
var isEmpty = std.Utils.String.isEmpty(""); // true

// Skrátenie reťazca
var truncated = std.Utils.String.truncate("Dlhý text", 5); // "Dlhý..."
```

#### 2.3.3 Práca s číslami

Modul poskytuje nasledujúce funkcie pre prácu s číslami:

- **Number.formatCurrency** - Formátovanie čísla ako meny
- **Number.round** - Zaokrúhlenie čísla na určitý počet desatinných miest

Príklady použitia:

```javascript
// Formátovanie meny
var price = std.Utils.Number.formatCurrency(123.45); // "123,45 €"

// Zaokrúhlenie čísla
var rounded = std.Utils.Number.round(123.456, 2); // 123.46
```

#### 2.3.4 Práca s objektmi a poliami

Modul poskytuje nasledujúce funkcie pre prácu s objektmi a poliami:

- **Object.getProperty** - Bezpečné získanie vlastnosti objektu
- **Object.isEmpty** - Kontrola, či je objekt prázdny
- **Array.isEmpty** - Kontrola, či je pole prázdne
- **Array.sumField** - Súčet hodnôt poľa v poli objektov
- **Array.sumEntryField** - Súčet hodnôt poľa v poli záznamov
- **Array.filterEntries** - Filtrovanie poľa záznamov podľa hodnoty poľa

Príklady použitia:

```javascript
// Bezpečné získanie vlastnosti objektu
var value = std.Utils.Object.getProperty(obj, "a.b.c", defaultValue);

// Súčet hodnôt poľa
var sum = std.Utils.Array.sumField(items, "amount");

// Filtrovanie záznamov
var filtered = std.Utils.Array.filterEntries(entries, "status", "active");
```

#### 2.3.5 Práca s poliami v Memento Database

Modul poskytuje nasledujúce funkcie pre prácu s poliami v Memento Database:

- **Field.getValue** - Bezpečné získanie hodnoty poľa záznamu
- **Field.setValue** - Bezpečné nastavenie hodnoty poľa záznamu
- **Field.getAttr** - Bezpečné získanie hodnoty atribútu záznamu
- **Field.setAttr** - Bezpečné nastavenie hodnoty atribútu záznamu

Príklady použitia:

```javascript
// Získanie hodnoty poľa
var date = std.Utils.Field.getValue(entry, "Dátum", new Date());

// Nastavenie hodnoty poľa
std.Utils.Field.setValue(entry, "Suma", 123.45);

// Získanie hodnoty atribútu
var attr = std.Utils.Field.getAttr(entry, "customAttr", "");

// Nastavenie hodnoty atribútu
std.Utils.Field.setAttr(entry, "customAttr", "hodnota");
```

#### 2.3.6 Generovanie čísel záznamov

Modul poskytuje nasledujúce funkcie pre generovanie čísel záznamov:

- **EntryNumber.generateEntryNumber** - Generovanie čísla záznamu
- **EntryNumber.updateEntryNumberInfo** - Aktualizácia informácií o čísle záznamu
- **EntryNumber.handleEntryDeletion** - Spracovanie odstránenia záznamu

Príklady použitia:

```javascript
// Generovanie čísla záznamu
var entryNumber = std.Utils.EntryNumber.generateEntryNumber(entry);

// Aktualizácia informácií o čísle záznamu
std.Utils.EntryNumber.updateEntryNumberInfo(entry);

// Spracovanie odstránenia záznamu
std.Utils.EntryNumber.handleEntryDeletion(entry);
```

### 2.4 std_triggers.js - Triggery

Modul std_triggers.js poskytuje štandardizované triggery pre Memento Database. Tieto triggery sú volané automaticky pri rôznych udalostiach, ako je otvorenie databázy, vytvorenie záznamu, uloženie záznamu a podobne.

#### 2.4.1 Popis triggerov

Modul poskytuje nasledujúce triggery:

- **libOpen** - Volaný pri otvorení databázy
- **libOpenBeforeShow** - Volaný pred zobrazením databázy
- **createEntryOpen** - Volaný pri vytvorení nového záznamu
- **createEntryAfterSave** - Volaný po uložení nového záznamu
- **entryBeforeSave** - Volaný pred uložením záznamu
- **entryAfterSave** - Volaný po uložení záznamu
- **linkEntryBeforeSave** - Volaný pred uložením prepojeného záznamu
- **entryOpen** - Volaný pri otvorení záznamu
- **entryDelete** - Volaný pri odstránení záznamu

#### 2.4.2 Životný cyklus záznamu

Životný cyklus záznamu v Memento Database zahŕňa nasledujúce kroky:

1. **Vytvorenie záznamu** - Volaný trigger createEntryOpen
2. **Uloženie nového záznamu** - Volaný trigger createEntryAfterSave
3. **Otvorenie existujúceho záznamu** - Volaný trigger entryOpen
4. **Úprava záznamu** - Volaný trigger entryBeforeSave pred uložením a entryAfterSave po uložení
5. **Odstránenie záznamu** - Volaný trigger entryDelete

#### 2.4.3 Implementácia triggerov v databázach

Pre implementáciu triggerov v databáze postupujte podľa nasledujúcich krokov:

1. Otvorte nastavenia databázy
2. Prejdite na záložku "Triggers"
3. Pre každý trigger vyberte príslušnú funkciu z modulu std_triggers.js
4. Uložte zmeny

Príklad implementácie triggeru:

```javascript
// V nastaveniach databázy, záložka Triggers
// Pre udalosť "Create Entry Open" vyberte funkciu "createEntryOpen"

// V skripte databázy
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
```

#### 2.4.4 Príklady použitia

```javascript
// Implementácia všetkých triggerov v skripte databázy

function libOpen() {
  return std.Triggers.libOpen();
}

function libOpenBeforeShow() {
  return std.Triggers.libOpenBeforeShow();
}

function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}

function createEntryAfterSave() {
  return std.Triggers.createEntryAfterSave();
}

function entryBeforeSave() {
  return std.Triggers.entryBeforeSave();
}

function entryAfterSave() {
  return std.Triggers.entryAfterSave();
}

function linkEntryBeforeSave() {
  return std.Triggers.linkEntryBeforeSave();
}

function entryOpen() {
  return std.Triggers.entryOpen();
}

function entryDelete() {
  return std.Triggers.entryDelete();
}
```

### 2.5 std_html.js - Generovanie HTML

Modul std_html.js poskytuje funkcie pre generovanie HTML a prácu so šablónami. Tieto funkcie sú užitočné pri vytváraní reportov, faktúr, cenových ponúk a podobne.

#### 2.5.1 Práca so šablónami

Modul poskytuje nasledujúce funkcie pre prácu so šablónami:

- **loadTemplate** - Načítanie šablóny zo súboru
- **renderTemplate** - Renderovanie šablóny s dátami

Šablóny používajú jednoduchú syntax s placeholdermi:

- **{{key}}** - Nahradené hodnotou kľúča z dát
- **{{#if key}}...{{/if}}** - Podmienené zobrazenie obsahu
- **{{#if key}}...{{else}}...{{/if}}** - Podmienené zobrazenie obsahu s alternatívou
- **{{#each key}}...{{/each}}** - Iterácia cez pole

Príklady použitia:

```javascript
// Načítanie šablóny
var template = std.HTML.loadTemplate("invoice_template");

// Renderovanie šablóny s dátami
var html = std.HTML.renderTemplate(template, {
  invoiceNumber: "2023001",
  date: "01.01.2023",
  customer: "Jano Mrkvička",
  items: [
    { name: "Položka 1", price: 10 },
    { name: "Položka 2", price: 20 }
  ],
  total: 30
});
```

#### 2.5.2 Generovanie tabuliek, formulárov a kariet

Modul poskytuje nasledujúce funkcie pre generovanie HTML komponentov:

- **generateTable** - Generovanie HTML tabuľky z dát
- **generateForm** - Generovanie HTML formulára zo schémy
- **generateCard** - Generovanie HTML karty z dát

Príklady použitia:

```javascript
// Generovanie tabuľky
var tableHtml = std.HTML.generateTable(items, [
  { field: "name", title: "Názov" },
  { field: "price", title: "Cena" }
]);

// Generovanie formulára
var formHtml = std.HTML.generateForm({
  name: { type: "text", label: "Meno", required: true },
  email: { type: "email", label: "Email", required: true },
  message: { type: "textarea", label: "Správa", rows: 5 }
});

// Generovanie karty
var cardHtml = std.HTML.generateCard({
  title: "Názov karty",
  subtitle: "Podnadpis",
  text: "Text karty",
  footer: "Päta karty"
});
```

### 2.6 std_actions.js - Akcie

Modul std_actions.js poskytuje štandardizované akcie pre Memento Database. Tieto akcie sú volané manuálne používateľom alebo automaticky pri určitých udalostiach.

#### 2.6.1 Popis akcií

Modul poskytuje nasledujúce akcie:

- **generateReport** - Generovanie reportu pre záznam
- **generateInvoice** - Generovanie faktúry pre záznam
- **generatePriceQuote** - Generovanie cenovej ponuky pre záznam
- **exportToCSV** - Export záznamov do CSV súboru
- **sendEmail** - Odoslanie emailu s dátami záznamu

#### 2.6.2 Implementácia akcií v databázach

Pre implementáciu akcií v databáze postupujte podľa nasledujúcich krokov:

1. Otvorte nastavenia databázy
2. Prejdite na záložku "Actions"
3. Kliknite na "Add action"
4. Zadajte názov akcie (napr. "Generate Report")
5. Vyberte typ akcie "Script"
6. Zadajte názov funkcie (napr. "generateReport")
7. Uložte zmeny

Príklad implementácie akcie:

```javascript
// V nastaveniach databázy, záložka Actions
// Pridajte akciu s názvom "Generate Report" a funkciou "generateReport"

// V skripte databázy
function generateReport() {
  return std.Actions.generateReport();
}
```

#### 2.6.3 Príklady použitia

```javascript
// Implementácia všetkých akcií v skripte databázy

function generateReport() {
  return std.Actions.generateReport();
}

function generateInvoice() {
  return std.Actions.generateInvoice();
}

function generatePriceQuote() {
  return std.Actions.generatePriceQuote();
}

function exportToCSV() {
  return std.Actions.exportToCSV();
}

function sendEmail() {
  return std.Actions.sendEmail();
}
```

## 3. Špecifické moduly

### 3.1 Kniha jázd

Modul std_knihaJazd.js poskytuje funkcie pre prácu s knihou jázd. Tieto funkcie zahŕňajú výpočet vzdialenosti, spotreby paliva, nákladov na jazdu a podobne.

#### 3.1.1 Popis funkcií

Modul poskytuje nasledujúce funkcie:

- **calculateTripDistance** - Výpočet vzdialenosti jazdy
- **calculateFuelConsumption** - Výpočet spotreby paliva
- **calculateTripCost** - Výpočet nákladov na jazdu
- **generateTripReport** - Generovanie reportu o jazde

#### 3.1.2 Príklady použitia

```javascript
// Výpočet vzdialenosti jazdy
var distance = std.KnihaJazd.calculateTripDistance(entry);

// Výpočet spotreby paliva
var consumption = std.KnihaJazd.calculateFuelConsumption(entry);

// Výpočet nákladov na jazdu
var cost = std.KnihaJazd.calculateTripCost(entry);

// Generovanie reportu o jazde
var report = std.KnihaJazd.generateTripReport(entry);
```

### 3.2 Dochádzka

Modul std_dochadzka.js poskytuje funkcie pre prácu s dochádzkou. Tieto funkcie zahŕňajú výpočet odpracovaného času, mzdových nákladov, generovania výkazov a podobne.

#### 3.2.1 Popis funkcií

Modul poskytuje nasledujúce funkcie:

- **calculateWorkingHours** - Výpočet odpracovaných hodín
- **calculateLaborCosts** - Výpočet mzdových nákladov
- **generateAttendanceReport** - Generovanie výkazu dochádzky
- **processAttendanceRecord** - Spracovanie záznamu dochádzky

#### 3.2.2 Príklady použitia

```javascript
// Výpočet odpracovaných hodín
var hours = std.Dochadzka.calculateWorkingHours(entry);

// Výpočet mzdových nákladov
var costs = std.Dochadzka.calculateLaborCosts(entry);

// Generovanie výkazu dochádzky
var report = std.Dochadzka.generateAttendanceReport(entry);

// Spracovanie záznamu dochádzky
std.Dochadzka.processAttendanceRecord(entry, true);
```

### 3.3 Cenové ponuky

Modul std_cenovePonuky.js poskytuje funkcie pre prácu s cenovými ponukami. Tieto funkcie zahŕňajú výpočet ceny, generovania PDF, správu položiek a podobne.

#### 3.3.1 Popis funkcií

Modul poskytuje nasledujúce funkcie:

- **calculateTotalPrice** - Výpočet celkovej ceny
- **generatePriceQuotePDF** - Generovanie PDF s cenovou ponukou
- **addItem** - Pridanie položky do cenovej ponuky
- **removeItem** - Odstránenie položky z cenovej ponuky

#### 3.3.2 Príklady použitia

```javascript
// Výpočet celkovej ceny
var price = std.CenovePonuky.calculateTotalPrice(entry);

// Generovanie PDF s cenovou ponukou
var pdf = std.CenovePonuky.generatePriceQuotePDF(entry);

// Pridanie položky do cenovej ponuky
std.CenovePonuky.addItem(entry, item);

// Odstránenie položky z cenovej ponuky
std.CenovePonuky.removeItem(entry, itemIndex);
```

## 4. Rozšírenie frameworku

### 4.1 Vytvorenie nového modulu

Pre vytvorenie nového modulu pre framework ASISTANTO STD postupujte podľa nasledujúcich krokov:

1. **Vytvorenie súboru modulu**
   - Vytvorte nový súbor s názvom `std_nazovModulu.js`
   - Pridajte hlavičku s popisom modulu

2. **Definícia namespace**
   - Skontrolujte, či existuje namespace `std`
   - Vytvorte objekt modulu v namespace `std`

3. **Implementácia funkcií**
   - Implementujte funkcie modulu
   - Používajte štandardizované spracovanie chýb
   - Dokumentujte funkcie pomocou JSDoc komentárov

4. **Pridanie backward compatibility**
   - Vytvorte globálnu premennú pre backward compatibility

Príklad vytvorenia nového modulu:

```javascript
// Standardized Module for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Description of the module
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Module definition
std.MyModule = {
  /**
   * Description of the function
   * @param {Type} param - Description of the parameter
   * @returns {Type} - Description of the return value
   */
  myFunction: function(param) {
    try {
      // Implementation
      return result;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "MyModule.myFunction", true);
      }
      return defaultValue;
    }
  }
};

// For backward compatibility
var std_MyModule = std.MyModule;
```

### 4.2 Integrácia s existujúcimi modulmi

Pri integrácii nového modulu s existujúcimi modulmi postupujte podľa nasledujúcich krokov:

1. **Identifikácia závislostí**
   - Identifikujte moduly, ktoré váš modul potrebuje
   - Pridajte komentár s informáciou o závislostiach

2. **Použitie existujúcich modulov**
   - Používajte funkcie z existujúcich modulov
   - Kontrolujte existenciu modulov pred ich použitím

3. **Rozšírenie existujúcich modulov**
   - Ak je to potrebné, rozšírte existujúce moduly o nové funkcie
   - Zachovajte spätnú kompatibilitu

Príklad integrácie s existujúcimi modulmi:

```javascript
// Dependencies:
// - std_constants.js
// - std_errorHandler.js
// - std_utils.js

// Use existing modules
var constants = std.Constants;
var utils = std.Utils;

// Extend existing module
std.Utils.MyModule = {
  // New functions
};
```

### 4.3 Testovanie nových funkcií

Pre testovanie nových funkcií postupujte podľa nasledujúcich krokov:

1. **Vytvorenie testovacích dát**
   - Vytvorte testovacie záznamy v databáze
   - Pripravte testovacie vstupy pre funkcie

2. **Implementácia testov**
   - Vytvorte funkcie pre testovanie jednotlivých funkcií
   - Implementujte testy pre rôzne scenáre (normálne, hraničné, chybové)

3. **Spustenie testov**
   - Spustite testy v Memento Database
   - Analyzujte výsledky testov

4. **Oprava chýb**
   - Opravte chyby nájdené počas testovania
   - Opakujte testovanie po oprave chýb

Príklad implementácie testov:

```javascript
// Test function
function testMyFunction() {
  try {
    // Test case 1: Normal case
    var result1 = std.MyModule.myFunction(normalInput);
    if (result1 !== expectedOutput1) {
      throw new Error("Test case 1 failed: " + result1 + " !== " + expectedOutput1);
    }

    // Test case 2: Edge case
    var result2 = std.MyModule.myFunction(edgeInput);
    if (result2 !== expectedOutput2) {
      throw new Error("Test case 2 failed: " + result2 + " !== " + expectedOutput2);
    }

    // Test case 3: Error case
    try {
      var result3 = std.MyModule.myFunction(errorInput);
      throw new Error("Test case 3 failed: No error thrown");
    } catch (e) {
      // Expected error
    }

    return "All tests passed";
  } catch (e) {
    return "Test failed: " + e.message;
  }
}
```

### 4.4 Aktualizácia dokumentácie

Po vytvorení nového modulu alebo rozšírení existujúceho modulu je potrebné aktualizovať dokumentáciu. Postupujte podľa nasledujúcich krokov:

1. **Aktualizácia administrátorskej príručky**
   - Pridajte popis nového modulu
   - Aktualizujte príklady použitia

2. **Aktualizácia užívateľskej príručky**
   - Pridajte návod na použitie nových funkcií
   - Aktualizujte príklady použitia

3. **Aktualizácia prílohy**
   - Pridajte popis nových databáz a polí
   - Aktualizujte diagramy vzťahov

## 5. Integrácia s GitHub

### 5.1 Nastavenie repozitára

Pre nastavenie GitHub repozitára pre framework ASISTANTO STD postupujte podľa nasledujúcich krokov:

1. **Vytvorenie repozitára**
   - Prihláste sa do GitHub
   - Vytvorte nový repozitár s názvom "asistanto-std"
   - Pridajte popis repozitára

2. **Nastavenie štruktúry repozitára**
   - Vytvorte priečinky pre rôzne časti frameworku (src, docs, templates)
   - Vytvorte súbor README.md s popisom frameworku

3. **Nastavenie prístupových práv**
   - Pridajte spolupracovníkov do repozitára
   - Nastavte prístupové práva pre spolupracovníkov

### 5.2 Nahrávanie súborov

Pre nahrávanie súborov do GitHub repozitára postupujte podľa nasledujúcich krokov:

1. **Nahrávanie cez webové rozhranie**
   - Prejdite do príslušného priečinka v repozitári
   - Kliknite na tlačidlo "Add file" a vyberte "Upload files"
   - Vyberte súbory na nahratie
   - Zadajte popis zmien a kliknite na "Commit changes"

2. **Nahrávanie pomocou Git klienta**
   - Naklonujte repozitár na lokálny počítač
   - Pridajte súbory do lokálneho repozitára
   - Commitnite zmeny s popisom
   - Pushnite zmeny do GitHub repozitára

### 5.3 Verziovanie

Pre verziovanie frameworku ASISTANTO STD postupujte podľa nasledujúcich krokov:

1. **Sémantické verziovanie**
   - Používajte sémantické verziovanie (MAJOR.MINOR.PATCH)
   - Zvýšte MAJOR verziu pri spätne nekompatibilných zmenách
   - Zvýšte MINOR verziu pri pridaní nových funkcií
   - Zvýšte PATCH verziu pri oprave chýb

2. **Vytváranie tagov**
   - Vytvorte tag pre každú verziu
   - Používajte formát "v1.0.0" pre tagy
   - Pridajte popis zmien v novej verzii

3. **Vytváranie releases**
   - Vytvorte release pre každú verziu
   - Pridajte popis zmien v release
   - Pridajte súbory na stiahnutie (ZIP, TAR.GZ)

### 5.4 Načítavanie knižníc z GitHubu

Pre načítavanie knižníc z GitHubu v Memento Database postupujte podľa nasledujúcich krokov:

1. **Získanie URL adresy súboru**
   - Prejdite na súbor v GitHub repozitári
   - Kliknite na tlačidlo "Raw"
   - Skopírujte URL adresu

2. **Pridanie URL adresy do skriptu**
   - Otvorte nastavenia skriptu v Memento Database
   - Kliknite na "Add URL"
   - Vložte URL adresu súboru
   - Kliknite na "OK"

3. **Použitie knižnice v skripte**
   - Používajte funkcie z knižnice v skripte
   - Kontrolujte existenciu knižnice pred jej použitím

Príklad načítavania knižníc z GitHubu:

```javascript
// V nastaveniach skriptu pridajte URL adresy:
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_constants.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_errorHandler.js
// https://raw.githubusercontent.com/username/asistanto-std/main/src/core/std_utils.js

// V skripte
function myFunction() {
  // Použitie knižníc
  var constants = std.Constants;
  var utils = std.Utils;

  // Implementácia funkcie
}
```

## 6. Riešenie problémov

### 6.1 Bežné chyby a ich riešenie

#### 6.1.1 Chyba: Knižnica nie je načítaná

**Symptómy:**
- Chyba "Cannot read property 'X' of undefined"
- Funkcie z knižnice nie sú dostupné

**Riešenie:**
1. Skontrolujte, či je URL adresa knižnice správna
2. Skontrolujte, či je knižnica dostupná na GitHube
3. Skontrolujte, či máte pripojenie na internet
4. Skúste pridať knižnicu znova

#### 6.1.2 Chyba: Nesprávna verzia knižnice

**Symptómy:**
- Funkcie z knižnice nefungujú správne
- Chyby pri volaní funkcií

**Riešenie:**
1. Skontrolujte verziu knižnice
2. Aktualizujte URL adresu na najnovšiu verziu
3. Vyčistite cache prehliadača
4. Reštartujte Memento Database

#### 6.1.3 Chyba: Chyba pri generovaní čísla záznamu

**Symptómy:**
- Číslo záznamu nie je vygenerované
- Chyba pri ukladaní záznamu

**Riešenie:**
1. Skontrolujte, či existuje databáza ASISTANTO Tenants
2. Skontrolujte, či existuje aktívna sezóna
3. Skontrolujte, či je databáza zaregistrovaná v ASISTANTO DB
4. Skontrolujte, či má databáza nastavené parametre pre generovanie čísel

### 6.2 Logovanie a analýza chýb

Pre logovanie a analýzu chýb postupujte podľa nasledujúcich krokov:

1. **Kontrola logov**
   - Otvorte databázu ASISTANTO Errors
   - Skontrolujte najnovšie záznamy
   - Analyzujte chybové správy

2. **Debugovanie skriptov**
   - Pridajte logovanie do skriptov
   - Používajte funkcie std.ErrorHandler.logInfo, logWarning a logError
   - Analyzujte logy po spustení skriptu

3. **Testovanie jednotlivých funkcií**
   - Vytvorte testovacie skripty pre jednotlivé funkcie
   - Spustite testy a analyzujte výsledky
   - Opravte chyby nájdené počas testovania

### 6.3 Kontakt na podporu

V prípade problémov s frameworkom ASISTANTO STD kontaktujte podporu:

- **Email:** podpora@asistanto.sk
- **Telefón:** +421 123 456 789
- **GitHub Issues:** https://github.com/username/asistanto-std/issues
