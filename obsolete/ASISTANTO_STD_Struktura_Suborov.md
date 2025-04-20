# Návrh štruktúry súborov pre framework ASISTANTO STD

## Obsah
1. [Úvod](#úvod)
2. [Základné knižnice](#základné-knižnice)
3. [Špecifické knižnice](#špecifické-knižnice)
4. [Triggery](#triggery)
5. [Akcie](#akcie)
6. [Dokumentácia](#dokumentácia)
7. [Príklady použitia](#príklady-použitia)

## Úvod

Tento dokument obsahuje návrh štruktúry súborov pre framework ASISTANTO STD. Každý súbor je popísaný z hľadiska jeho obsahu, závislostí a použitia.

## Základné knižnice

### std_constants.js

**Popis**: Konštanty pre celý framework

**Obsah**:
- Konštanty pre názvy databáz
- Konštanty pre názvy polí
- Konštanty pre názvy sekcií
- Konštanty pre farby
- Konštanty pre stavy zobrazenia
- Konštanty pre predvolené hodnoty
- Konštanty pre systémové správy
- Konštanty pre atribúty zamestnancov
- Konštanty pre typy miezd
- Konštanty pre výpočty
- Konštanty pre typy záznamov
- Konštanty pre poznámky

**Závislosti**: Žiadne

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
var constants = std.Constants;
var appName = constants.APP.NAME;
```

### std_errorHandler.js

**Popis**: Spracovanie chýb a logovanie

**Obsah**:
- Funkcie pre spracovanie chýb
- Funkcie pre logovanie chýb
- Funkcie pre zobrazovanie chybových správ
- Funkcie pre vytváranie chybových záznamov

**Závislosti**:
- std_constants.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
try {
  // Kód, ktorý môže vyhodiť chybu
} catch (e) {
  std.ErrorHandler.createSystemError(e, "názov_funkcie", true);
}
```

### std_utils.js

**Popis**: Utility funkcie pre prácu s dátami

**Obsah**:
- Funkcie pre prácu s dátumami
- Funkcie pre prácu s reťazcami
- Funkcie pre prácu s číslami
- Funkcie pre prácu s objektami
- Funkcie pre prácu s poliami
- Funkcie pre prácu s poliami v Memento Database
- Funkcie pre prácu s historickými dátami
- Funkcie pre generovanie čísla záznamu

**Závislosti**:
- std_constants.js
- std_errorHandler.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
var date = new Date();
var formattedDate = std.Utils.Date.format(date, 'full');
```

### std_triggers.js

**Popis**: Univerzálne triggery pre všetky databázy

**Obsah**:
- Funkcie pre spracovanie udalostí v Memento Database
- Funkcie pre vytvorenie záznamu
- Funkcie pre otvorenie záznamu
- Funkcie pre uloženie záznamu
- Funkcie pre vymazanie záznamu
- Funkcie pre otvorenie knižnice

**Závislosti**:
- std_constants.js
- std_errorHandler.js
- std_utils.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
```

### std_html.js

**Popis**: Generovanie HTML a práca so šablónami

**Obsah**:
- Funkcie pre generovanie HTML
- Funkcie pre načítavanie HTML šablón
- Funkcie pre spracovanie HTML šablón
- Funkcie pre generovanie formulárov
- Funkcie pre generovanie tabuliek
- Funkcie pre generovanie reportov

**Závislosti**:
- std_constants.js
- std_errorHandler.js
- std_utils.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
var template = std.HTML.loadTemplate('invoice');
var html = std.HTML.renderTemplate(template, data);
```

### std_actions.js

**Popis**: Univerzálne akcie pre všetky databázy

**Obsah**:
- Funkcie pre vykonávanie akcií v Memento Database
- Funkcie pre generovanie reportov
- Funkcie pre export dát
- Funkcie pre import dát
- Funkcie pre hromadné operácie

**Závislosti**:
- std_constants.js
- std_errorHandler.js
- std_utils.js
- std_html.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function generateReport() {
  return std.Actions.generateReport();
}
```

## Špecifické knižnice

### std_knihaJazd.js

**Popis**: Funkcie pre databázu Kniha jázd

**Obsah**:
- Funkcie pre výpočet vzdialenosti
- Funkcie pre prácu so súradnicami
- Funkcie pre generovanie reportov
- Špecifické triggery pre Knihu jázd
- Špecifické akcie pre Knihu jázd

**Závislosti**:
- std_constants.js
- std_errorHandler.js
- std_utils.js
- std_html.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function calculateDistance() {
  var entry = entry();
  return std.KnihaJazd.calculateTripDistance(entry);
}
```

### std_dochadzka.js

**Popis**: Funkcie pre databázu Dochádzka

**Obsah**:
- Funkcie pre výpočet odpracovaného času
- Funkcie pre generovanie výkazov
- Funkcie pre spracovanie dochádzky
- Špecifické triggery pre Dochádzku
- Špecifické akcie pre Dochádzku

**Závislosti**:
- std_constants.js
- std_errorHandler.js
- std_utils.js
- std_html.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function calculateWorkHours() {
  var entry = entry();
  return std.Dochadzka.calculateWorkHours(entry);
}
```

### std_zamestnanci.js

**Popis**: Funkcie pre databázu Zamestnanci

**Obsah**:
- Funkcie pre správu zamestnancov
- Funkcie pre výpočet miezd
- Funkcie pre generovanie reportov
- Špecifické triggery pre Zamestnancov
- Špecifické akcie pre Zamestnancov

**Závislosti**:
- std_constants.js
- std_errorHandler.js
- std_utils.js
- std_html.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function calculateSalary() {
  var entry = entry();
  return std.Zamestnanci.calculateSalary(entry);
}
```

### std_cenovePonuky.js

**Popis**: Funkcie pre databázu Cenové ponuky

**Obsah**:
- Funkcie pre výpočet cien
- Funkcie pre generovanie cenových ponúk
- Funkcie pre správu cenových ponúk
- Špecifické triggery pre Cenové ponuky
- Špecifické akcie pre Cenové ponuky

**Závislosti**:
- std_constants.js
- std_errorHandler.js
- std_utils.js
- std_html.js

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function calculatePrice() {
  var entry = entry();
  return std.CenovePonuky.calculatePrice(entry);
}
```

## Triggery

### Univerzálne triggery

**Súbor**: std_triggers.js

**Triggery**:
- **libOpen** - Otvorenie knižnice
- **libOpenBeforeShow** - Pred zobrazením knižnice
- **createEntryOpen** - Vytvorenie nového záznamu
- **createEntryAfterSave** - Po uložení nového záznamu
- **entryBeforeSave** - Pred uložením záznamu
- **entryAfterSave** - Po uložení záznamu
- **linkEntryBeforeSave** - Pred uložením prepojeného záznamu
- **entryOpen** - Otvorenie záznamu
- **entryDelete** - Vymazanie záznamu

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
```

### Špecifické triggery

**Súbory**:
- std_knihaJazd.js
- std_dochadzka.js
- std_zamestnanci.js
- std_cenovePonuky.js

**Triggery**:
- Špecifické triggery pre jednotlivé databázy
- Rozšírenia univerzálnych triggerov

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function createEntryOpen() {
  // Najprv sa vykoná univerzálny trigger
  std.Triggers.createEntryOpen();
  
  // Potom sa vykoná špecifický trigger
  if (lib().title === "Kniha jázd") {
    std.KnihaJazd.Triggers.createEntryOpen();
  }
}
```

## Akcie

### Univerzálne akcie

**Súbor**: std_actions.js

**Akcie**:
- **generateReport** - Generovanie reportu
- **exportData** - Export dát
- **importData** - Import dát
- **bulkOperation** - Hromadná operácia

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function generateReport() {
  return std.Actions.generateReport();
}
```

### Špecifické akcie

**Súbory**:
- std_knihaJazd.js
- std_dochadzka.js
- std_zamestnanci.js
- std_cenovePonuky.js

**Akcie**:
- Špecifické akcie pre jednotlivé databázy

**Použitie**:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore
function calculateDistance() {
  return std.KnihaJazd.Actions.calculateDistance();
}
```

## Dokumentácia

### Dokumentácia knižníc

**Súbory**:
- Dokumentacia_std_constants.md
- Dokumentacia_std_errorHandler.md
- Dokumentacia_std_utils.md
- Dokumentacia_std_triggers.md
- Dokumentacia_std_html.md
- Dokumentacia_std_actions.md
- Dokumentacia_std_knihaJazd.md
- Dokumentacia_std_dochadzka.md
- Dokumentacia_std_zamestnanci.md
- Dokumentacia_std_cenovePonuky.md

**Obsah**:
- Popis knižnice
- Zoznam funkcií
- Parametre funkcií
- Návratové hodnoty funkcií
- Príklady použitia
- Potrebné knižnice pre fungovanie

### Dokumentácia frameworku

**Súbory**:
- ASISTANTO_STD_Framework_Analyza.md
- ASISTANTO_STD_Struktura_Suborov.md
- ASISTANTO_STD_Navod_na_Pouzitie.md
- ASISTANTO_STD_Integrácia_s_GitHub.md

**Obsah**:
- Popis frameworku
- Architektúra frameworku
- Štruktúra súborov
- Návod na použitie
- Návod na integráciu s GitHub
- Príklady použitia

## Príklady použitia

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
