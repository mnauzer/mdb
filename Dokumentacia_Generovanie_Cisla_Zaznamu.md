# Dokumentácia ku generovaniu čísla záznamu

Táto dokumentácia popisuje, ako funguje generovanie čísla záznamu v aplikácii ASISTANTO pomocou štandardných knižníc.

## Obsah

1. [Prehľad](#prehľad)
2. [Princíp fungovania](#princíp-fungovania)
3. [Štruktúra databáz](#štruktúra-databáz)
4. [Implementácia](#implementácia)
5. [Triggery](#triggery)
6. [Príklady použitia](#príklady-použitia)
7. [Riešenie problémov](#riešenie-problémov)

## Prehľad

Systém generovania čísla záznamu umožňuje automaticky generovať jedinečné čísla pre záznamy v rôznych databázach. Čísla sú generované podľa nastavení v databáze ASISTANTO a ASISTANTO DB. Systém podporuje:

- Generovanie čísla záznamu s prefixom alebo ID databázy
- Použitie sezóny v čísle záznamu
- Nastavenie počtu číslic v čísle záznamu
- Recykláciu vymazaných čísel záznamov
- Automatické aktualizácie informácií o číslach záznamov

## Princíp fungovania

Pri vytvorení nového záznamu v databáze (trigger `createEntryOpen`) sa zistia údaje o spôsobe generovania čísla záznamu z databáz ASISTANTO a ASISTANTO DB. Systém skontroluje, či existujú čísla v atribúte "vymazané čísla". Ak áno, zoberie sa číslo s najnižšou hodnotou. Ak nie, zoberie sa číslo z atribútu "nasledujúce číslo" databázy ASISTANTO.

Číslo sa vyskladá nasledovne:
- Ak je "prefix" true: `prefix + sezóna.trim + posledné číslo.trailing digit`
- Ak je "prefix" false: `ID + sezóna.trim + posledné číslo.trailing digit`

Po vytvorení záznamu (trigger `createEntryAfterSave`) sa zmenia atribúty záznamu v databáze ASISTANTO:
- posledné číslo: číslo posledného záznamu
- nasledujúce číslo: posledné číslo + 1
- ak bolo číslo z vymazaných čísel, odstráni sa z tohto poľa

Pri vymazaní záznamu v databáze (trigger `entryDelete`) sa číslo vymazaného záznamu pridá do atribútu "vymazané čísla" na ďalšie použitie.

## Štruktúra databáz

### Databáza ASISTANTO

**Databáza uchováva záznamy o sezónach aplikácie**

Polia databázy/záznamu:
- **Prevádzka appky** (typ Radio Buttons, Items: Ostrý režim, Testovanie, Zamknutá) - prepínačom sa nastavuje stav aplikácie v sezóne
- **ID** (typ Integer) - id záznamu, autoincrement
- **Sezóna** (typ Text) - sezóna záznamu (napríklad 2024, 2025 ...)
- **Základná sadzba DPH** (typ Real number) - nastavenie základnej sadzby dph v sezóne
- **Znížená sadzba DPH** (typ Real number) - nastavenie zníženej sadzby dph v sezóne
- **Koeficient nákladov prevádzky vozidiel** (typ Real number) - nastavuje sa koeficient 
- **Koeficient nákladov prevádzky strojov** (typ Real number) - nastavuje sa koeficient 
- **Databázy** (typ Link to Entry) - zoznam databáz súvisiacich s chodom aplikácie v sezóne. Linky obsahujú atribúty:
  - **názov** (text) - názov databázy
  - **posledné číslo** (integer) - číslo posledného záznamu v databáze (len poradové číslo, nie generované komplexné číslo záznamu)
  - **nasledujúce číslo** (integer) - číslo budúceho nového záznamu (len poradové číslo, nie generované komplexné číslo záznamu)
  - **rezervované číslo** (integer) - číslo ktoré je z nejakého dôvodu rezervované a vyňaté z ďalšieho použitia
  - **vymazané čísla** (text) - array čísel vymazaných záznamov, k dispozícii na ďalšie použitie
  - **vygenerované číslo** (text) - komplexné vygenerované číslo vrátane prefixov
  - **prefix** (boolean) - nastavenie či sa pri generovaní čísla bude používať textový prefix
  - **trim** (integer) - koľko číslic z údaju Sezóna sa odstráni pri generovaní čísla (napr. 2025 - trim 2 - zostane 25)
  - **trailing digit** (integer) - koľko číslic bude obsahovať vygenerovaní čísla

### Databáza ASISTANTO DB

**Databáza obsahuje zoznam databáz zahrnutých do frameworku Asistanto**

Polia databázy/záznamu:
- **ID** (typ Integer) - identifikačné číslo databázy, používa sa pri generovaní čísla v predmetnej databáze
- **Prefix** (typ Text) - identifikačný prefix databázy, používa sa pri generovaní čísla v predmetnej databáze
- **Názov** (typ Text) - názov databázy
- **Kategória databázy** (typ Single-choice list) - údaj slúžiaci na lepšiu organizáciu databáz
- **Popis databázy** (typ Text) - popis databázy
- **LibraryID** (typ Text) - ID knižnice pre prístup cez API Memento Database
- **Poznámka** (typ Text) - poznámka
- **Zoznam polí** (typ Text) - slovný zoznam polí databázy, oddelených čiarkou, polia začínajúce na # alebo ---, nie sú polia ale oddeľovače v zobrazení Memento Database
- **ASISTANTO Fields** (typ Link to Entry) - prepojenie do databázy polí

## Implementácia

Implementácia generovania čísla záznamu je rozdelená do niekoľkých častí:

### 1. Modul std.Utils.EntryNumber

Tento modul obsahuje funkcie pre generovanie a správu čísla záznamu:

#### generateEntryNumber(entry)

Generuje nové číslo záznamu pre zadaný záznam.

```javascript
/**
 * Generate a new entry number for a database
 * @param {Object} entry - The entry to generate a number for
 * @returns {String} - The generated entry number
 */
generateEntryNumber: function(entry) {
    try {
        if (!entry) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Entry is null or undefined");
            }
            return "";
        }
        
        // Get current library
        var currentLib = entry.lib();
        var libName = currentLib.title;
        
        // Get ASISTANTO database
        var asistentoLib = libByName(std.Constants.APP.TENANTS);
        if (!asistentoLib) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "ASISTANTO database not found");
            }
            return "";
        }
        
        // Get current season
        var seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
        if (seasonEntries.length === 0) {
            seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
            if (seasonEntries.length === 0) {
                if (typeof std !== 'undefined' && std.ErrorHandler) {
                    std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "No active season found");
                }
                return "";
            }
        }
        
        var seasonEntry = seasonEntries[0];
        var season = seasonEntry.field("Sezóna");
        
        // Find database in the season entry
        var databases = seasonEntry.field("Databázy");
        var dbEntry = null;
        
        for (var i = 0; i < databases.length; i++) {
            if (databases[i].field("názov") === libName) {
                dbEntry = databases[i];
                break;
            }
        }
        
        if (!dbEntry) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Database not found in ASISTANTO: " + libName);
            }
            return "";
        }
        
        // Get ASISTANTO DB database
        var asistentoDBLib = libByName(std.Constants.APP.DB);
        if (!asistentoDBLib) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "ASISTANTO DB database not found");
            }
            return "";
        }
        
        // Find database in ASISTANTO DB
        var dbInfoEntries = asistentoDBLib.find("Názov = '" + libName + "'");
        if (dbInfoEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Database not found in ASISTANTO DB: " + libName);
            }
            return "";
        }
        
        var dbInfo = dbInfoEntries[0];
        
        // Get number generation parameters
        var usePrefix = dbEntry.field("prefix");
        var trimDigits = dbEntry.field("trim") || 0;
        var trailingDigits = dbEntry.field("trailing digit") || 3;
        var deletedNumbers = dbEntry.field("vymazané čísla") || "";
        var nextNumber = dbEntry.field("nasledujúce číslo") || 1;
        
        // Check if there are deleted numbers to reuse
        var entryNumber = 0;
        if (deletedNumbers && deletedNumbers.trim() !== "") {
            var deletedNumbersArray = deletedNumbers.split(",").map(function(num) {
                return parseInt(num.trim(), 10);
            }).filter(function(num) {
                return !isNaN(num);
            }).sort(function(a, b) {
                return a - b;
            });
            
            if (deletedNumbersArray.length > 0) {
                entryNumber = deletedNumbersArray[0];
                
                // Store the deleted number for later removal
                entry.setAttr("_deletedNumber", entryNumber.toString());
            }
        }
        
        // If no deleted number was found, use the next number
        if (entryNumber === 0) {
            entryNumber = nextNumber;
            
            // Store the next number for later update
            entry.setAttr("_nextNumber", (nextNumber + 1).toString());
        }
        
        // Format the entry number
        var formattedEntryNumber = this._formatEntryNumber(entryNumber, trailingDigits);
        
        // Format the season
        var formattedSeason = season;
        if (trimDigits > 0 && season.length > trimDigits) {
            formattedSeason = season.substring(season.length - trimDigits);
        }
        
        // Generate the final entry number
        var finalEntryNumber = "";
        if (usePrefix) {
            // Use prefix from ASISTANTO DB
            finalEntryNumber = dbInfo.field("Prefix") + formattedSeason + formattedEntryNumber;
        } else {
            // Use ID from ASISTANTO DB
            finalEntryNumber = dbInfo.field("ID") + formattedSeason + formattedEntryNumber;
        }
        
        // Store the generated number in the entry
        entry.setAttr("_generatedNumber", finalEntryNumber);
        
        return finalEntryNumber;
    } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createSystemError(e, "Utils.EntryNumber.generateEntryNumber", true);
        }
        return "";
    }
}
```

#### updateEntryNumberInfo(entry)

Aktualizuje informácie o čísle záznamu v databáze ASISTANTO po uložení záznamu.

```javascript
/**
 * Update entry number information in ASISTANTO database after saving an entry
 * @param {Object} entry - The saved entry
 * @returns {Boolean} - True if successful, false otherwise
 */
updateEntryNumberInfo: function(entry) {
    try {
        if (!entry) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "Entry is null or undefined");
            }
            return false;
        }
        
        // Get current library
        var currentLib = entry.lib();
        var libName = currentLib.title;
        
        // Get ASISTANTO database
        var asistentoLib = libByName(std.Constants.APP.TENANTS);
        if (!asistentoLib) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "ASISTANTO database not found");
            }
            return false;
        }
        
        // Get current season
        var seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
        if (seasonEntries.length === 0) {
            seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
            if (seasonEntries.length === 0) {
                if (typeof std !== 'undefined' && std.ErrorHandler) {
                    std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "No active season found");
                }
                return false;
            }
        }
        
        var seasonEntry = seasonEntries[0];
        
        // Find database in the season entry
        var databases = seasonEntry.field("Databázy");
        var dbEntryIndex = -1;
        
        for (var i = 0; i < databases.length; i++) {
            if (databases[i].field("názov") === libName) {
                dbEntryIndex = i;
                break;
            }
        }
        
        if (dbEntryIndex === -1) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "Database not found in ASISTANTO: " + libName);
            }
            return false;
        }
        
        var dbEntry = databases[dbEntryIndex];
        
        // Get the stored values from the entry
        var deletedNumber = entry.attr("_deletedNumber");
        var nextNumber = entry.attr("_nextNumber");
        var generatedNumber = entry.attr("_generatedNumber");
        
        // Update the database entry
        if (deletedNumber) {
            // Remove the used deleted number
            var deletedNumbers = dbEntry.field("vymazané čísla") || "";
            var deletedNumbersArray = deletedNumbers.split(",").map(function(num) {
                return num.trim();
            }).filter(function(num) {
                return num !== "" && num !== deletedNumber;
            });
            
            dbEntry.set("vymazané čísla", deletedNumbersArray.join(","));
            dbEntry.set("posledné číslo", parseInt(deletedNumber, 10));
            dbEntry.set("vygenerované číslo", generatedNumber);
        } else if (nextNumber) {
            // Update the next number
            dbEntry.set("posledné číslo", parseInt(nextNumber, 10) - 1);
            dbEntry.set("nasledujúce číslo", parseInt(nextNumber, 10));
            dbEntry.set("vygenerované číslo", generatedNumber);
        }
        
        // Clear the stored values from the entry
        entry.setAttr("_deletedNumber", "");
        entry.setAttr("_nextNumber", "");
        
        return true;
    } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createSystemError(e, "Utils.EntryNumber.updateEntryNumberInfo", true);
        }
        return false;
    }
}
```

#### handleEntryDeletion(entry)

Spracuje vymazanie záznamu pridaním čísla záznamu do zoznamu vymazaných čísel.

```javascript
/**
 * Handle entry deletion by adding the entry number to the deleted numbers list
 * @param {Object} entry - The entry being deleted
 * @returns {Boolean} - True if successful, false otherwise
 */
handleEntryDeletion: function(entry) {
    try {
        if (!entry) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "Entry is null or undefined");
            }
            return false;
        }
        
        // Get current library
        var currentLib = entry.lib();
        var libName = currentLib.title;
        
        // Get entry number
        var entryNumber = entry.field(std.Constants.FIELDS.COMMON.NUMBER_ENTRY);
        if (!entryNumber) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "Entry number not found");
            }
            return false;
        }
        
        // Get ASISTANTO database
        var asistentoLib = libByName(std.Constants.APP.TENANTS);
        if (!asistentoLib) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "ASISTANTO database not found");
            }
            return false;
        }
        
        // Get current season
        var seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
        if (seasonEntries.length === 0) {
            seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
            if (seasonEntries.length === 0) {
                if (typeof std !== 'undefined' && std.ErrorHandler) {
                    std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "No active season found");
                }
                return false;
            }
        }
        
        var seasonEntry = seasonEntries[0];
        
        // Find database in the season entry
        var databases = seasonEntry.field("Databázy");
        var dbEntryIndex = -1;
        
        for (var i = 0; i < databases.length; i++) {
            if (databases[i].field("názov") === libName) {
                dbEntryIndex = i;
                break;
            }
        }
        
        if (dbEntryIndex === -1) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "Database not found in ASISTANTO: " + libName);
            }
            return false;
        }
        
        var dbEntry = databases[dbEntryIndex];
        
        // Add the entry number to the deleted numbers list
        var deletedNumbers = dbEntry.field("vymazané čísla") || "";
        var deletedNumbersArray = deletedNumbers.split(",").map(function(num) {
            return num.trim();
        }).filter(function(num) {
            return num !== "";
        });
        
        // Add the entry number if it's not already in the list
        if (deletedNumbersArray.indexOf(entryNumber.toString()) === -1) {
            deletedNumbersArray.push(entryNumber.toString());
        }
        
        // Update the deleted numbers field
        dbEntry.set("vymazané čísla", deletedNumbersArray.join(","));
        
        return true;
    } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createSystemError(e, "Utils.EntryNumber.handleEntryDeletion", true);
        }
        return false;
    }
}
```

#### _formatEntryNumber(number, digits)

Formátuje číslo záznamu s vedúcimi nulami.

```javascript
/**
 * Format an entry number with leading zeros
 * @param {Number} number - The number to format
 * @param {Number} digits - The number of digits
 * @returns {String} - The formatted number
 * @private
 */
_formatEntryNumber: function(number, digits) {
    var str = number.toString();
    while (str.length < digits) {
        str = "0" + str;
    }
    return str;
}
```

### 2. Triggery

Implementácia triggerov pre generovanie čísla záznamu:

#### createEntryOpen

Trigger, ktorý sa spustí pri vytvorení nového záznamu.

```javascript
/**
 * Create entry open trigger
 * Called when a new entry is being created
 */
createEntryOpen: function() {
    try {
        // Get the current library
        var currentLib = lib();
        var libName = currentLib.title;
        
        // Get the default entry
        var en = entryDefault();
        
        // Set basic fields
        if (typeof std !== 'undefined' && std.Constants) {
            var constants = std.Constants;
            var utils = std.Utils;
            
            // Set view state
            utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.EDIT);
            
            // Set date
            utils.Field.setValue(en, constants.FIELDS.COMMON.DATE, new Date());
            
            // Generate entry number
            var entryNumber = utils.EntryNumber.generateEntryNumber(en);
            if (entryNumber) {
                utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER, entryNumber);
                
                // Get the raw entry number (without prefix and season) from the entry attributes
                var rawEntryNumber = en.attr("_deletedNumber") || en.attr("_nextNumber");
                if (rawEntryNumber) {
                    utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER_ENTRY, parseInt(rawEntryNumber, 10));
                }
            } else if (typeof app !== 'undefined' && app.activeLib && app.activeLib.number) {
                // Fallback to old method if entry number generation fails
                utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER, app.activeLib.number);
                utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER_ENTRY, app.activeLib.nextNum);
            }
            
            // ... rest of the function ...
        }
    } catch (e) {
        // ... error handling ...
    }
}
```

#### createEntryAfterSave

Trigger, ktorý sa spustí po uložení nového záznamu.

```javascript
/**
 * Create entry after save trigger
 * Called after a new entry is saved
 */
createEntryAfterSave: function() {
    try {
        // Get the current library
        var currentLib = lib();
        var libName = currentLib.title;
        var en = currentLib.lastEntry();
        
        // Process library-specific logic
        if (typeof std !== 'undefined' && std.Constants) {
            var constants = std.Constants;
            var utils = std.Utils;
            
            // ... library-specific logic ...
            
            // Update entry number information in ASISTANTO database
            utils.EntryNumber.updateEntryNumberInfo(en);
            
            // Update number sequence (legacy support)
            if (typeof app !== 'undefined' && app.activeLib) {
                app.activeLib.lastNum = app.activeLib.nextNum;
                app.activeLib.nextNum++;
            }
            
            // Update entry view state
            utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.PRINT);
        }
    } catch (e) {
        // ... error handling ...
    }
}
```

#### entryDelete

Trigger, ktorý sa spustí pri vymazaní záznamu.

```javascript
/**
 * Entry delete trigger
 * Called when an entry is being deleted
 */
entryDelete: function() {
    try {
        // Get the current entry
        var en = entry();
        
        // Get the current library
        var currentLib = lib();
        var libName = currentLib.title;
        
        // Process library-specific logic
        if (typeof std !== 'undefined' && std.Constants && std.Utils) {
            var constants = std.Constants;
            var utils = std.Utils;
            
            // Handle entry deletion by adding the entry number to the deleted numbers list
            utils.EntryNumber.handleEntryDeletion(en);
            
            // ... additional library-specific processing ...
        }
    } catch (e) {
        // ... error handling ...
    }
}
```

## Príklady použitia

### Príklad 1: Generovanie čísla záznamu s prefixom

Nastavenie v databáze ASISTANTO:
- Databáza: Cenové ponuky
- prefix: true
- trim: 3
- trailing digit: 3
- Sezóna: 2025
- nasledujúce číslo: 14

Nastavenie v databáze ASISTANTO DB:
- Názov: Cenové ponuky
- Prefix: C

Výsledné číslo záznamu: `C5014`

### Príklad 2: Generovanie čísla záznamu s ID

Nastavenie v databáze ASISTANTO:
- Databáza: Dochádzka
- prefix: false
- trim: 2
- trailing digit: 3
- Sezóna: 2025
- nasledujúce číslo: 26

Nastavenie v databáze ASISTANTO DB:
- Názov: Dochádzka
- ID: 31

Výsledné číslo záznamu: `312526`

### Príklad 3: Recyklácia vymazaného čísla záznamu

Nastavenie v databáze ASISTANTO:
- Databáza: Faktúry
- prefix: true
- trim: 2
- trailing digit: 4
- Sezóna: 2025
- nasledujúce číslo: 123
- vymazané čísla: 45,67,89

Nastavenie v databáze ASISTANTO DB:
- Názov: Faktúry
- Prefix: F

Výsledné číslo záznamu: `F250045`

## Riešenie problémov

### Chyba: Databáza nie je nájdená v ASISTANTO

Ak sa zobrazí chyba "Database not found in ASISTANTO", skontrolujte nasledujúce:

1. Uistite sa, že databáza je pridaná do zoznamu databáz v aktívnej sezóne v databáze ASISTANTO
2. Uistite sa, že názov databázy je správne zadaný v poli "názov" v zozname databáz

### Chyba: Databáza nie je nájdená v ASISTANTO DB

Ak sa zobrazí chyba "Database not found in ASISTANTO DB", skontrolujte nasledujúce:

1. Uistite sa, že databáza je pridaná do databázy ASISTANTO DB
2. Uistite sa, že názov databázy je správne zadaný v poli "Názov" v databáze ASISTANTO DB

### Chyba: Nenájdená aktívna sezóna

Ak sa zobrazí chyba "No active season found", skontrolujte nasledujúce:

1. Uistite sa, že v databáze ASISTANTO existuje aspoň jeden záznam s poľom "Prevádzka appky" nastaveným na "Ostrý režim" alebo "Testovanie"
2. Uistite sa, že pole "Sezóna" je správne vyplnené v aktívnej sezóne

### Chyba: Číslo záznamu nie je nájdené

Ak sa zobrazí chyba "Entry number not found" pri vymazaní záznamu, skontrolujte nasledujúce:

1. Uistite sa, že záznam má vyplnené pole pre číslo záznamu (NUMBER_ENTRY)
2. Uistite sa, že názov poľa pre číslo záznamu je správne nastavený v konštantách (FIELDS.COMMON.NUMBER_ENTRY)
