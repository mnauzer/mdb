# Návod na používanie štandardizovaného frameworku pre Memento Database

Tento návod vysvetľuje, ako používať knižnice a funkcie štandardizovaného frameworku pre Memento Database. Framework poskytuje množstvo užitočných funkcií pre prácu s dátami, manipuláciu s poľami, spracovanie dátumov a ďalšie bežné operácie.

## Obsah

1. [Inštalácia frameworku](#inštalácia-frameworku)
2. [Základné moduly](#základné-moduly)
3. [Práca s dátumami](#práca-s-dátumami)
4. [Práca s reťazcami](#práca-s-reťazcami)
5. [Práca s číslami](#práca-s-číslami)
6. [Práca s poľami](#práca-s-poľami)
7. [Práca s objektmi](#práca-s-objektmi)
8. [Práca s poľami v Memento Database](#práca-s-poľami-v-memento-database)
9. [Spracovanie chýb](#spracovanie-chýb)
10. [Používanie triggerov](#používanie-triggerov)
11. [Práca s cache knižníc](#práca-s-cache-knižníc)
12. [Príklady kompletných skriptov](#príklady-kompletných-skriptov)

## Inštalácia frameworku

Pre použitie frameworku je potrebné pridať požadované moduly do skriptov vašej knižnice v Memento Database:

1. Otvorte vašu knižnicu v Memento Database
2. Prejdite do Nastavenia > Skripty
3. Pridajte nový skript a skopírujte obsah požadovaného modulu (napr. `std_core_refactored.js`)
4. Uložte skript
5. Pre triggery nastavte príslušné funkcie v sekcii Triggery

### Minimálna inštalácia

Pre základnú funkcionalitu stačí pridať tieto moduly:
- `std_core_refactored.js` - základné funkcie
- `std_errorHandler_refactored.js` - spracovanie chýb
- `std_utils_refactored.js` - užitočné funkcie

### Kompletná inštalácia

Pre plnú funkcionalitu pridajte všetky moduly:
- `std_core_refactored.js` - základné funkcie
- `std_errorHandler_refactored.js` - spracovanie chýb
- `std_libraryCache_refactored.js` - cache knižníc
- `std_utils_refactored.js` - užitočné funkcie
- `std_triggers_refactored.js` - triggery
- `std_constants.js` - konštanty
- `std_dataAccess.js` - prístup k dátam
- `std_fieldLister_refactored.js` - nástroj na výpis polí

## Základné moduly

### Core modul (std.Core)

Core modul poskytuje základné funkcie pre inicializáciu frameworku a prístup k Memento Database.

```javascript
// Inicializácia frameworku
std.Core.init({
  debug: true,
  logLevel: 'info'
});

// Získanie aktuálnej knižnice
var currentLib = std.Core.getCurrentLibrary();

// Získanie aktuálneho záznamu
var currentEntry = std.Core.getCurrentEntry();

// Získanie aktuálneho používateľa
var currentUser = std.Core.getCurrentUser();

// Zobrazenie dialógu
std.Core.showDialog({
  title: 'Informácia',
  text: 'Toto je informačný dialóg',
  positiveButton: {
    text: 'OK',
    callback: function() {
      // Kód po stlačení tlačidla
    }
  }
});
```

## Práca s dátumami

Modul `std.Utils.Date` poskytuje funkcie pre prácu s dátumami.

```javascript
// Formátovanie dátumu
var today = new Date();
var formattedDate = std.Utils.Date.format(today, 'simple'); // 19.04.2025
var formattedDateTime = std.Utils.Date.format(today, 'datetime'); // 19.04.2025 09:30

// Pridanie dní k dátumu
var nextWeek = std.Utils.Date.addDays(today, 7);

// Zaokrúhlenie času na štvrťhodiny
var roundedTime = std.Utils.Date.roundToQuarter(today);

// Výpočet hodín medzi dvoma dátumami
var startDate = new Date(2025, 3, 19, 9, 0);
var endDate = new Date(2025, 3, 19, 17, 0);
var hours = std.Utils.Date.calculateHours(startDate, endDate); // 8

// Kontrola, či je dátum pred iným dátumom
var isBefore = std.Utils.Date.isBefore(startDate, endDate); // true

// Parsovanie času z reťazca
var timeDate = std.Utils.Date.parseTime("14:30", today);
```

## Práca s reťazcami

Modul `std.Utils.String` poskytuje funkcie pre prácu s reťazcami.

```javascript
// Formátovanie reťazca s placeholdermi
var formatted = std.Utils.String.format("Ahoj {0}, vitaj v {1}!", "Jano", "Memento");
// Výsledok: "Ahoj Jano, vitaj v Memento!"

// Kontrola, či je reťazec prázdny
var isEmpty = std.Utils.String.isEmpty(""); // true
var isNotEmpty = std.Utils.String.isEmpty("Text"); // false

// Skrátenie reťazca na maximálnu dĺžku
var truncated = std.Utils.String.truncate("Toto je veľmi dlhý text", 10); // "Toto je..."

// Doplnenie čísla nulami na začiatku
var padded = std.Utils.String.padNumber(42, 5); // "00042"
```

## Práca s číslami

Modul `std.Utils.Number` poskytuje funkcie pre prácu s číslami.

```javascript
// Formátovanie čísla ako meny
var formattedCurrency = std.Utils.Number.formatCurrency(1234.56); // "1 234,56 €"
var formattedCurrencyUSD = std.Utils.Number.formatCurrency(1234.56, 2, "$"); // "1 234,56 $"

// Zaokrúhlenie čísla na desatinné miesta
var rounded = std.Utils.Number.round(1234.567, 2); // 1234.57
```

## Práca s poľami

Modul `std.Utils.Array` poskytuje funkcie pre prácu s poľami, špeciálne prispôsobené pre Memento Database.

```javascript
// Kontrola, či je pole prázdne
var isEmpty = std.Utils.Array.isEmpty([]); // true

// Suma hodnôt poľa objektov
var data = [
  { amount: 100 },
  { amount: 200 },
  { amount: 300 }
];
var sum = std.Utils.Array.sumField(data, 'amount'); // 600

// Práca so záznamami Memento Database
// Predpokladajme, že máme knižnicu "Faktúry" s poľom "suma"
var invoiceLib = libByName('Faktúry');
var entries = invoiceLib.entries();

// Suma hodnôt poľa zo záznamov
var totalAmount = std.Utils.Array.sumEntryField(entries, 'suma');

// Filtrovanie záznamov podľa hodnoty poľa
var paidInvoices = std.Utils.Array.filterEntries(entries, 'stav', 'zaplatená');
var unpaidInvoices = std.Utils.Array.filterEntries(entries, 'stav', 'nezaplatená');

// Filtrovanie s čiastočnou zhodou
var invoicesWithText = std.Utils.Array.filterEntries(entries, 'poznámka', 'urgent', false);

// Zoskupenie záznamov podľa hodnoty poľa
var invoicesByCustomer = std.Utils.Array.groupEntriesByField(entries, 'zákazník');
// Výsledok: { "Firma A": [entry1, entry2], "Firma B": [entry3] }

// Zoradenie záznamov podľa hodnoty poľa
var sortedByDate = std.Utils.Array.sortEntriesByField(entries, 'dátum', true); // vzostupne
var sortedByAmount = std.Utils.Array.sortEntriesByField(entries, 'suma', false); // zostupne

// Nájdenie záznamu podľa hodnoty poľa
var specificInvoice = std.Utils.Array.findEntryByField(entries, 'číslo', 'FA-2025-001');

// Získanie unikátnych hodnôt poľa
var uniqueCustomers = std.Utils.Array.getUniqueFieldValues(entries, 'zákazník');

// Konverzia záznamov na objekty
var invoiceObjects = std.Utils.Array.entriesToObjects(entries, ['číslo', 'zákazník', 'suma', 'dátum']);

// Odstránenie duplicitných záznamov podľa hodnoty poľa
var uniqueInvoices = std.Utils.Array.removeDuplicateEntries(entries, 'číslo');
```

## Práca s historickými dátami

Modul `std.Utils.HistoricalData` poskytuje funkcie pre prácu s historickými dátami, ako sú sadzby zamestnancov, ceny tovarov, materiálov a prác, ktoré sa menia v čase.

```javascript
// Predpokladajme, že máme tabuľku "Sadzby zamestnancov" s poľami:
// - zamestnanec_id: ID zamestnanca
// - sadzba: hodinová sadzba
// - platné_od: dátum, od ktorého je sadzba platná

// Získanie aktuálnej sadzby zamestnanca
var zamestnanecId = "Z001";
var aktualnaSadzba = std.Utils.HistoricalData.getCurrentValue(
  'Sadzby zamestnancov',  // názov tabuľky
  'zamestnanec_id',       // názov poľa s identifikátorom
  zamestnanecId,          // hodnota identifikátora
  'sadzba',               // názov poľa s hodnotou, ktorú chceme získať
  'platné_od'             // názov poľa s dátumom platnosti
);

// Získanie sadzby platnej k určitému dátumu
var datumVykonuPrace = new Date(2025, 2, 15); // 15.3.2025
var sadzbaNaDatum = std.Utils.HistoricalData.getValueAtDate(
  'Sadzby zamestnancov',
  'zamestnanec_id',
  zamestnanecId,
  'sadzba',
  'platné_od',
  datumVykonuPrace
);

// Získanie celého záznamu s aktuálnou sadzbou
var aktualnyZaznam = std.Utils.HistoricalData.getCurrentRecord(
  'Sadzby zamestnancov',
  'zamestnanec_id',
  zamestnanecId,
  'platné_od'
);

// Získanie histórie sadzieb zamestnanca
var historickeSadzby = std.Utils.HistoricalData.getHistoricalValues(
  'Sadzby zamestnancov',
  'zamestnanec_id',
  zamestnanecId,
  'sadzba',
  'platné_od'
);

// Výpis histórie sadzieb
for (var i = 0; i < historickeSadzby.length; i++) {
  var zaznam = historickeSadzby[i];
  console.log(std.Utils.Date.format(zaznam.date) + ': ' + zaznam.value + ' €/hod');
}

// Príklad použitia pre ceny materiálu
var kodMaterialu = "M123";
var aktualnaCena = std.Utils.HistoricalData.getCurrentValue(
  'Cenník materiálu',
  'kod_materialu',
  kodMaterialu,
  'cena',
  'platné_od'
);

// Príklad použitia pre sezónne ceny prác
var kodPrace = "P456";
var sezonnaLetnaCena = std.Utils.HistoricalData.getValueAtDate(
  'Sezónne ceny prác',
  'kod_prace',
  kodPrace,
  'cena',
  'platné_od',
  new Date(2025, 6, 15)  // 15.7.2025 - letná sezóna
);

var sezonnaZimnaCena = std.Utils.HistoricalData.getValueAtDate(
  'Sezónne ceny prác',
  'kod_prace',
  kodPrace,
  'cena',
  'platné_od',
  new Date(2025, 0, 15)  // 15.1.2025 - zimná sezóna
);
```

## Práca s objektmi

Modul `std.Utils.Object` poskytuje funkcie pre prácu s objektmi.

```javascript
// Bezpečné získanie vnorenej vlastnosti objektu
var data = {
  user: {
    address: {
      city: 'Bratislava'
    }
  }
};
var city = std.Utils.Object.getProperty(data, 'user.address.city'); // 'Bratislava'
var country = std.Utils.Object.getProperty(data, 'user.address.country', 'Slovensko'); // 'Slovensko' (default)

// Kontrola, či je objekt prázdny
var isEmpty = std.Utils.Object.isEmpty({}); // true
var isNotEmpty = std.Utils.Object.isEmpty({ key: 'value' }); // false
```

## Práca s poľami v Memento Database

Modul `std.Utils.Field` poskytuje funkcie pre bezpečnú prácu s poľami záznamov v Memento Database.

```javascript
// Bezpečné získanie hodnoty poľa
var entry = lib().entries()[0]; // Prvý záznam v aktuálnej knižnici
var value = std.Utils.Field.getValue(entry, 'názov', 'Predvolená hodnota');

// Bezpečné nastavenie hodnoty poľa
std.Utils.Field.setValue(entry, 'názov', 'Nová hodnota');

// Bezpečné získanie hodnoty atribútu
var attrValue = std.Utils.Field.getAttr(entry, 'farba', 'biela');

// Bezpečné nastavenie hodnoty atribútu
std.Utils.Field.setAttr(entry, 'farba', 'červená');
```

## Spracovanie chýb

Modul `std.ErrorHandler` poskytuje funkcie pre štandardizované spracovanie chýb.

```javascript
// Vytvorenie validačnej chyby
std.ErrorHandler.createValidationError('Neplatná hodnota', 'suma', 'validateInvoice', true);

// Vytvorenie databázovej chyby
try {
  var nonExistentLib = libByName('NeexistujúcaKnižnica');
} catch (e) {
  std.ErrorHandler.createDatabaseError(e, 'getLibrary', true);
}

// Vytvorenie systémovej chyby
try {
  // Nejaký kód, ktorý môže vyhodiť chybu
  var result = someUndefinedFunction();
} catch (e) {
  std.ErrorHandler.createSystemError(e, 'processData', true);
}

// Vytvorenie biznis chyby
std.ErrorHandler.createBusinessError('Nedostatočný kredit', 'processPayment', true);

// Vlastné spracovanie chyby
std.ErrorHandler.handle(new Error('Vlastná chyba'), 'customFunction', {
  severity: std.ErrorHandler.SEVERITY.WARNING,
  category: std.ErrorHandler.CATEGORY.BUSINESS_LOGIC,
  showToUser: true,
  recovery: function() {
    // Kód pre zotavenie z chyby
    return fallbackValue;
  }
});
```

## Používanie triggerov

Modul `std.Triggers` poskytuje funkcie pre spracovanie triggerov v Memento Database. Pre použitie triggerov je potrebné pridať skript `std_triggers_refactored.js` do vašej knižnice a nastaviť príslušné funkcie v sekcii Triggery.

```javascript
// V nastaveniach knižnice > Triggery nastavte:
// Pre "Otvorenie knižnice" vyberte funkciu "libOpen"
// Pre "Otvorenie knižnice pred zobrazením" vyberte funkciu "libOpenBeforeShow"
// Pre "Vytvorenie záznamu" vyberte funkciu "createEntryOpen"
// Pre "Po uložení nového záznamu" vyberte funkciu "createEntryAfterSave"
// Pre "Pred uložením záznamu" vyberte funkciu "entryBeforeSave"
// Pre "Po uložení záznamu" vyberte funkciu "entryAfterSave"
// Pre "Pred uložením prepojeného záznamu" vyberte funkciu "linkEntryBeforeSave"
// Pre "Otvorenie záznamu" vyberte funkciu "entryOpen"
```

Príklad vlastného triggeru:

```javascript
// Vytvorte nový skript v knižnici
function myCustomEntryBeforeSave() {
  // Najprv zavolajte štandardný trigger
  entryBeforeSave();
  
  // Potom pridajte vlastnú logiku
  var en = entry();
  
  // Automatické vyplnenie dátumu
  if (!en.field('dátum')) {
    en.set('dátum', new Date());
  }
  
  // Automatický výpočet DPH
  if (en.field('suma_bez_dph')) {
    var sumaBezDPH = en.field('suma_bez_dph');
    var dph = sumaBezDPH * 0.2;
    en.set('dph', dph);
    en.set('suma_s_dph', sumaBezDPH + dph);
  }
}

// V nastaveniach knižnice > Triggery nastavte:
// Pre "Pred uložením záznamu" vyberte funkciu "myCustomEntryBeforeSave"
```

## Práca s cache knižníc

Modul `std.LibraryCache` poskytuje funkcie pre cachovanie knižníc, čo môže výrazne zrýchliť skripty, ktoré často pristupujú k rovnakým knižniciam.

```javascript
// Získanie knižnice z cache (alebo z Memento, ak nie je v cache)
var invoiceLib = std.LibraryCache.get('Faktúry');

// Nastavenie TTL (Time To Live) pre cache
std.LibraryCache.setTTL(600000); // 10 minút v milisekundách

// Invalidácia konkrétnej knižnice v cache
std.LibraryCache.invalidate('Faktúry');

// Vyčistenie celej cache
std.LibraryCache.clear();

// Zobrazenie stavu cache
std.LibraryCache.showStatus();
```

## Príklady kompletných skriptov

### Príklad 1: Skript pre výpočet štatistík faktúr

```javascript
function calculateInvoiceStatistics() {
  try {
    // Získanie knižnice faktúr
    var invoiceLib = std.LibraryCache.get('Faktúry');
    if (!invoiceLib) {
      std.ErrorHandler.createDatabaseError('Knižnica Faktúry nebola nájdená', 'calculateInvoiceStatistics', true);
      return;
    }
    
    // Získanie všetkých záznamov
    var allInvoices = invoiceLib.entries();
    
    // Filtrovanie faktúr podľa stavu
    var paidInvoices = std.Utils.Array.filterEntries(allInvoices, 'stav', 'zaplatená');
    var unpaidInvoices = std.Utils.Array.filterEntries(allInvoices, 'stav', 'nezaplatená');
    
    // Výpočet súm
    var totalPaid = std.Utils.Array.sumEntryField(paidInvoices, 'suma');
    var totalUnpaid = std.Utils.Array.sumEntryField(unpaidInvoices, 'suma');
    
    // Zoskupenie faktúr podľa zákazníka
    var invoicesByCustomer = std.Utils.Array.groupEntriesByField(allInvoices, 'zákazník');
    
    // Vytvorenie štatistík pre každého zákazníka
    var customerStats = [];
    for (var customer in invoicesByCustomer) {
      if (invoicesByCustomer.hasOwnProperty(customer)) {
        var customerInvoices = invoicesByCustomer[customer];
        var customerPaid = std.Utils.Array.filterEntries(customerInvoices, 'stav', 'zaplatená');
        var customerUnpaid = std.Utils.Array.filterEntries(customerInvoices, 'stav', 'nezaplatená');
        
        customerStats.push({
          zákazník: customer,
          počet_faktúr: customerInvoices.length,
          zaplatené: std.Utils.Array.sumEntryField(customerPaid, 'suma'),
          nezaplatené: std.Utils.Array.sumEntryField(customerUnpaid, 'suma')
        });
      }
    }
    
    // Zoradenie štatistík podľa celkovej sumy
    customerStats.sort(function(a, b) {
      return (b.zaplatené + b.nezaplatené) - (a.zaplatené + a.nezaplatené);
    });
    
    // Vytvorenie výsledného textu
    var result = "Štatistiky faktúr\n\n";
    result += "Celkový počet faktúr: " + allInvoices.length + "\n";
    result += "Zaplatené faktúry: " + paidInvoices.length + " (" + std.Utils.Number.formatCurrency(totalPaid) + ")\n";
    result += "Nezaplatené faktúry: " + unpaidInvoices.length + " (" + std.Utils.Number.formatCurrency(totalUnpaid) + ")\n\n";
    
    result += "Štatistiky podľa zákazníkov:\n";
    for (var i = 0; i < customerStats.length; i++) {
      var stat = customerStats[i];
      result += stat.zákazník + ": " + stat.počet_faktúr + " faktúr, ";
      result += "zaplatené: " + std.Utils.Number.formatCurrency(stat.zaplatené) + ", ";
      result += "nezaplatené: " + std.Utils.Number.formatCurrency(stat.nezaplatené) + "\n";
    }
    
    // Zobrazenie výsledku
    std.Core.showDialog({
      title: 'Štatistiky faktúr',
      text: result,
      positiveButton: {
        text: 'OK',
        callback: function() {}
      }
    });
    
  } catch (e) {
    std.ErrorHandler.createSystemError(e, 'calculateInvoiceStatistics', true);
  }
}
```

### Príklad 2: Skript pre automatické číslovanie faktúr

```javascript
function autoNumberInvoice() {
  try {
    // Získanie aktuálneho záznamu
    var en = entry();
    
    // Kontrola, či už má číslo faktúry
    var invoiceNumber = std.Utils.Field.getValue(en, 'číslo_faktúry');
    if (invoiceNumber) {
      return; // Už má číslo, nič nerobíme
    }
    
    // Získanie aktuálneho roku
    var currentYear = new Date().getFullYear();
    
    // Získanie knižnice faktúr
    var invoiceLib = std.LibraryCache.get('Faktúry');
    if (!invoiceLib) {
      std.ErrorHandler.createDatabaseError('Knižnica Faktúry nebola nájdená', 'autoNumberInvoice', true);
      return;
    }
    
    // Získanie všetkých faktúr z aktuálneho roku
    var allInvoices = invoiceLib.entries();
    var currentYearInvoices = std.Utils.Array.filterEntries(
      allInvoices, 
      'rok', 
      currentYear.toString()
    );
    
    // Nájdenie najvyššieho čísla faktúry
    var highestNumber = 0;
    for (var i = 0; i < currentYearInvoices.length; i++) {
      var invoice = currentYearInvoices[i];
      var numberStr = std.Utils.Field.getValue(invoice, 'číslo_faktúry', '');
      
      // Extrakcia čísla z formátu "FA-YYYY-NNNN"
      if (numberStr && numberStr.length > 8) {
        var numberPart = numberStr.substring(8);
        var number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > highestNumber) {
          highestNumber = number;
        }
      }
    }
    
    // Vytvorenie nového čísla faktúry
    var nextNumber = highestNumber + 1;
    var paddedNumber = std.Utils.String.padNumber(nextNumber, 4);
    var newInvoiceNumber = "FA-" + currentYear + "-" + paddedNumber;
    
    // Nastavenie čísla faktúry a roku
    std.Utils.Field.setValue(en, 'číslo_faktúry', newInvoiceNumber);
    std.Utils.Field.setValue(en, 'rok', currentYear.toString());
    
    // Informovanie používateľa
    std.Core.showDialog({
      title: 'Automatické číslovanie',
      text: 'Bolo priradené číslo faktúry: ' + newInvoiceNumber,
      positiveButton: {
        text: 'OK',
        callback: function() {}
      }
    });
    
  } catch (e) {
    std.ErrorHandler.createSystemError(e, 'autoNumberInvoice', true);
  }
}
```

### Príklad 3: Trigger pre automatické výpočty v dochádzke

```javascript
function processAttendanceRecord() {
  try {
    // Získanie aktuálneho záznamu
    var en = entry();
    
    // Získanie príchodu a odchodu
    var arrival = std.Utils.Field.getValue(en, 'príchod');
    var departure = std.Utils.Field.getValue(en, 'odchod');
    
    // Kontrola, či máme oba časy
    if (!arrival || !departure) {
      return; // Nemáme kompletné údaje, nič nerobíme
    }
    
    // Výpočet odpracovaných hodín
    var hoursWorked = std.Utils.Date.calculateHours(arrival, departure);
    
    // Zaokrúhlenie na štvrťhodiny
    hoursWorked = std.Utils.Number.round(hoursWorked, 2);
    
    // Nastavenie odpracovaných hodín
    std.Utils.Field.setValue(en, 'hodiny', hoursWorked);
    
    // Výpočet nadčasov (ak je viac ako 8 hodín)
    var overtime = Math.max(0, hoursWorked - 8);
    if (overtime > 0) {
      std.Utils.Field.setValue(en, 'nadčas', overtime);
    }
    
    // Kontrola, či je víkend
    var dayOfWeek = arrival.getDay();
    var isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 = nedeľa, 6 = sobota
    
    if (isWeekend) {
      std.Utils.Field.setValue(en, 'víkend', true);
      // Víkendové hodiny sa počítajú ako nadčas
      std.Utils.Field.setValue(en, 'nadčas', hoursWorked);
    } else {
      std.Utils.Field.setValue(en, 'víkend', false);
    }
    
  } catch (e) {
    std.ErrorHandler.createSystemError(e, 'processAttendanceRecord', true);
  }
}

// Tento skript by ste mali nastaviť ako trigger "Pred uložením záznamu" v knižnici dochádzky
```

### Príklad 4: Skript pre export dát do inej knižnice

```javascript
function exportInvoicesToSummary() {
  try {
    // Získanie zdrojovej knižnice
    var invoiceLib = std.LibraryCache.get('Faktúry');
    if (!invoiceLib) {
      std.ErrorHandler.createDatabaseError('Knižnica Faktúry nebola nájdená', 'exportInvoicesToSummary', true);
      return;
    }
    
    // Získanie cieľovej knižnice
    var summaryLib = std.LibraryCache.get('Súhrn faktúr');
    if (!summaryLib) {
      std.ErrorHandler.createDatabaseError('Knižnica Súhrn faktúr nebola nájdená', 'exportInvoicesToSummary', true);
      return;
    }
    
    // Získanie faktúr z aktuálneho mesiaca
    var now = new Date();
    var currentMonth = now.getMonth() + 1;
    var currentYear = now.getFullYear();
    
    var allInvoices = invoiceLib.entries();
    var currentMonthInvoices = [];
    
    for (var i = 0; i < allInvoices.length; i++) {
      var invoice = allInvoices[i];
      var invoiceDate = std.Utils.Field.getValue(invoice, 'dátum');
      
      if (invoiceDate && 
          invoiceDate.getMonth() + 1 === currentMonth && 
          invoiceDate.getFullYear() === currentYear) {
        currentMonthInvoices.push(invoice);
      }
    }
    
    // Zoskupenie faktúr podľa zákazníka
    var invoicesByCustomer = std.Utils.Array.groupEntriesByField(currentMonthInvoices, 'zákazník');
    
    // Vytvorenie alebo aktualizácia súhrnných záznamov
    var exportCount = 0;
    
    for (var customer in invoicesByCustomer) {
      if (invoicesByCustomer.hasOwnProperty(customer)) {
        var customerInvoices = invoicesByCustomer[customer];
        
        // Výpočet súm
        var totalAmount = std.Utils.Array.sumEntryField(customerInvoices, 'suma');
        var totalVAT = std.Utils.Array.sumEntryField(customerInvoices, 'dph');
        
        // Kontrola, či už existuje súhrnný záznam
        var existingSummary = summaryLib.find(customer + " " + currentMonth + "/" + currentYear);
        
        if (existingSummary && existingSummary.length > 0) {
          // Aktualizácia existujúceho záznamu
          var summaryEntry = existingSummary[0];
          std.Utils.Field.setValue(summaryEntry, 'zákazník', customer);
          std.Utils.Field.setValue(summaryEntry, 'mesiac', currentMonth);
          std.Utils.Field.setValue(summaryEntry, 'rok', currentYear);
          std.Utils.Field.setValue(summaryEntry, 'počet_faktúr', customerInvoices.length);
          std.Utils.Field.setValue(summaryEntry, 'celková_suma', totalAmount);
          std.Utils.Field.setValue(summaryEntry, 'celková_dph', totalVAT);
          std.Utils.Field.setValue(summaryEntry, 'aktualizované', now);
        } else {
          // Vytvorenie nového záznamu
          var newSummary = {
            name: customer + " " + currentMonth + "/" + currentYear,
            zákazník: customer,
            mesiac: currentMonth,
            rok: currentYear,
            počet_faktúr: customerInvoices.length,
            celková_suma: totalAmount,
            celková_dph: totalVAT,
            vytvorené: now,
            aktualizované: now
          };
          
          summaryLib.create(newSummary);
        }
        
        exportCount++;
      }
    }
    
    // Informovanie používateľa
    std.Core.showDialog({
      title: 'Export faktúr',
      text: 'Bolo exportovaných ' + exportCount + ' súhrnných záznamov za ' + 
            currentMonth + '/' + currentYear + '.',
      positiveButton: {
        text: 'OK',
        callback: function() {}
      }
    });
    
  } catch (e) {
    std.ErrorHandler.createSystemError(e, 'exportInvoicesToSummary', true);
  }
}
```

## Príklad 5: Skript pre výpočet mzdy s použitím historických sadzieb

```javascript
function vypocitatMzdu() {
  try {
    // Získanie vstupných parametrov
    var zamestnanecId = entry().field('zamestnanec');
    var mesiac = entry().field('mesiac');
    var rok = entry().field('rok');
    
    // Vytvorenie dátumu pre koniec mesiaca (pre určenie platnej sadzby)
    var datumPreSadzbu = new Date(rok, mesiac, 0); // Posledný deň mesiaca
    
    // Získanie knižnice s odpracovanými hodinami
    var dochadzkaLib = std.LibraryCache.get('Dochádzka');
    if (!dochadzkaLib) {
      std.ErrorHandler.createDatabaseError('Knižnica Dochádzka nebola nájdená', 'vypocitatMzdu', true);
      return;
    }
    
    // Filtrovanie záznamov pre daného zamestnanca a mesiac/rok
    var vsetkyZaznamy = dochadzkaLib.entries();
    var zaznamy = [];
    
    for (var i = 0; i < vsetkyZaznamy.length; i++) {
      var zaznam = vsetkyZaznamy[i];
      var datumZaznamu = std.Utils.Field.getValue(zaznam, 'dátum');
      
      if (datumZaznamu && 
          datumZaznamu.getMonth() === mesiac - 1 && 
          datumZaznamu.getFullYear() === rok &&
          std.Utils.Field.getValue(zaznam, 'zamestnanec_id') === zamestnanecId) {
        zaznamy.push(zaznam);
      }
    }
    
    // Výpočet odpracovaných hodín
    var bezneHodiny = 0;
    var nadcasoveHodiny = 0;
    var vikendoveHodiny = 0;
    
    for (var j = 0; j < zaznamy.length; j++) {
      var zaznam = zaznamy[j];
      var hodiny = std.Utils.Field.getValue(zaznam, 'hodiny', 0);
      var nadcas = std.Utils.Field.getValue(zaznam, 'nadčas', 0);
      var vikend = std.Utils.Field.getValue(zaznam, 'víkend', false);
      
      if (vikend) {
        vikendoveHodiny += hodiny;
      } else {
        bezneHodiny += (hodiny - nadcas);
        nadcasoveHodiny += nadcas;
      }
    }
    
    // Získanie platných sadzieb pre daný mesiac
    var zakladnaSadzba = std.Utils.HistoricalData.getValueAtDate(
      'Sadzby zamestnancov',
      'zamestnanec_id',
      zamestnanecId,
      'základná_sadzba',
      'platné_od',
      datumPreSadzbu
    );
    
    var nadcasovaSadzba = std.Utils.HistoricalData.getValueAtDate(
      'Sadzby zamestnancov',
      'zamestnanec_id',
      zamestnanecId,
      'nadčasová_sadzba',
      'platné_od',
      datumPreSadzbu
    );
    
    var vikendovaSadzba = std.Utils.HistoricalData.getValueAtDate(
      'Sadzby zamestnancov',
      'zamestnanec_id',
      zamestnanecId,
      'víkendová_sadzba',
      'platné_od',
      datumPreSadzbu
    );
    
    // Ak nie sú definované špeciálne sadzby, použijeme základnú s príplatkom
    if (!nadcasovaSadzba) nadcasovaSadzba = zakladnaSadzba * 1.25; // +25%
    if (!vikendovaSadzba) vikendovaSadzba = zakladnaSadzba * 1.5;  // +50%
    
    // Výpočet mzdy
    var mzdaZakladna = bezneHodiny * zakladnaSadzba;
    var mzdaNadcas = nadcasoveHodiny * nadcasovaSadzba;
    var mzdaVikend = vikendoveHodiny * vikendovaSadzba;
    var mzdaCelkom = mzdaZakladna + mzdaNadcas + mzdaVikend;
    
    // Uloženie výsledkov
    var en = entry();
    std.Utils.Field.setValue(en, 'bežné_hodiny', bezneHodiny);
    std.Utils.Field.setValue(en, 'nadčasové_hodiny', nadcasoveHodiny);
    std.Utils.Field.setValue(en, 'víkendové_hodiny', vikendoveHodiny);
    std.Utils.Field.setValue(en, 'základná_sadzba', zakladnaSadzba);
    std.Utils.Field.setValue(en, 'nadčasová_sadzba', nadcasovaSadzba);
    std.Utils.Field.setValue(en, 'víkendová_sadzba', vikendovaSadzba);
    std.Utils.Field.setValue(en, 'mzda_základná', mzdaZakladna);
    std.Utils.Field.setValue(en, 'mzda_nadčas', mzdaNadcas);
    std.Utils.Field.setValue(en, 'mzda_víkend', mzdaVikend);
    std.Utils.Field.setValue(en, 'mzda_celkom', mzdaCelkom);
    
    // Informovanie používateľa
    std.Core.showDialog({
      title: 'Výpočet mzdy',
      text: 'Mzda za ' + mesiac + '/' + rok + ' bola úspešne vypočítaná.\n\n' +
            'Bežné hodiny: ' + bezneHodiny + ' × ' + zakladnaSadzba + ' € = ' + mzdaZakladna + ' €\n' +
            'Nadčasové hodiny: ' + nadcasoveHodiny + ' × ' + nadcasovaSadzba + ' € = ' + mzdaNadcas + ' €\n' +
            'Víkendové hodiny: ' + vikendoveHodiny + ' × ' + vikendovaSadzba + ' € = ' + mzdaVikend + ' €\n\n' +
            'Celková mzda: ' + mzdaCelkom + ' €',
      positiveButton: {
        text: 'OK',
        callback: function() {}
      }
    });
    
  } catch (e) {
    std.ErrorHandler.createSystemError(e, 'vypocitatMzdu', true);
  }
}
```

## Tipy a triky

1. **Používajte cache knižníc** - Pre skripty, ktoré pristupujú k rovnakým knižniciam viackrát, používajte `std.LibraryCache` pre zrýchlenie.

2. **Spracovanie chýb** - Vždy obaľte kód do blokov try-catch a používajte `std.ErrorHandler` pre konzistentné spracovanie chýb.

3. **Bezpečný prístup k poliam** - Používajte `std.Utils.Field.getValue` a `std.Utils.Field.setValue` namiesto priameho prístupu k poliam, aby ste predišli chybám.

4. **Práca s poľami** - Využívajte funkcie v `std.Utils.Array` pre efektívnu prácu so záznamami, najmä pri filtrovaní, zoraďovaní a zoskupovaní.

5. **Formátovanie dát** - Používajte funkcie pre formátovanie dátumov, čísel a reťazcov pre konzistentný výstup.

6. **Modularizácia kódu** - Rozdeľte komplexné skripty do menších funkcií pre lepšiu čitateľnosť a údržbu.

7. **Validácia vstupov** - Vždy kontrolujte vstupné hodnoty pred ich použitím, aby ste predišli chybám.

8. **Dokumentácia** - Pridávajte komentáre k vašim skriptom, aby boli zrozumiteľné aj pre iných vývojárov.

9. **Optimalizácia výkonu** - Pri práci s veľkým množstvom záznamov používajte efektívne algoritmy a minimalizujte počet prístupov k databáze.

10. **Testovanie** - Testujte skripty na malej vzorke dát pred ich nasadením do produkcie.
