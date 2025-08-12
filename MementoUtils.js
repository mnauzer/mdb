// ==============================================
// MEMENTO DATABASE - UNIVERZÁLNA UTILITY KNIŽNICA
// Verzia: 2.0 | Dátum: 12.08.2025 | Autor: ASISTANTO
// ==============================================
// ✅ NOVÉ v2.0:
//    - Všetky missing funkcie pre Záznam prác script
//    - Časové utility funkcie (formatTime, roundToQuarter, calculateTimeDifference)
//    - Business logic helpers (findValidSalaryForDate, getDefaultHZS)
//    - Enhanced error handling pre všetky nové funkcie
//    - Kompatibilita s existujúcimi scriptmi zachovaná
//    - safeGet/safeSet/safeSetAttr pre jednoduchšie volania
// ==============================================
// Knižnica obsahuje najčastejšie používané funkcie
// pre všetky Memento scripty
// Import: var MementoUtils = require("MementoUtils.js");
// ==============================================

var MementoUtils = (function() {
    'use strict';
    
    // ========================================
    // KONFIGURAČNÉ KONŠTANTY
    // ========================================
    var DEFAULT_CONFIG = {
        debugFieldName: "Debug_Log",
        errorFieldName: "Error_Log",
        infoFieldName: "info",
        viewFieldName: "view",
        dateFormat: "DD.MM.YY HH:mm",
        timestampFormat: "HH:mm:ss",
        fullTimestampFormat: "YYYY-MM-DD HH:mm:ss",
        
        // v2.0 - Nové konfigurácie
        timeFormat: "HH:mm",
        quarterRoundingMinutes: 15,
        maxWorkHours: 24,
        minWorkHours: 0.5,
        defaultLibraryName: "ASISTANTO Defaults"
    };
    
    // ========================================
    // DEBUG A ERROR HANDLING
    // ========================================
    
    /**
     * Pridá debug správu do Debug_Log poľa
     * @param {Entry} entry - Entry objekt
     * @param {string} message - Debug správa
     * @param {Object} config - Konfigurácia (optional)
     */
    function addDebug(entry, message, config) {
        config = config || DEFAULT_CONFIG;
        if (!entry || !message) return;
        
        try {
            var timestamp = moment().format(config.timestampFormat || DEFAULT_CONFIG.timestampFormat);
            var debugMessage = "[" + timestamp + "] " + message;
            
            var fieldName = config.debugFieldName || DEFAULT_CONFIG.debugFieldName;
            var existingDebug = safeFieldAccess(entry, fieldName, "");
            entry.set(fieldName, existingDebug + debugMessage + "\n");
        } catch (e) {
            // Ak debug zlyhal, aspoň skúsime message()
            try {
                message("Debug failed: " + e);
            } catch (e2) {
                // Posledná záchrana - console ak existuje
            }
        }
    }
    
    /**
     * Pridá error správu do Error_Log poľa
     * @param {Entry} entry - Entry objekt
     * @param {string} errorMessage - Error správa
     * @param {string} version - Verzia scriptu (optional)
     * @param {Object} config - Konfigurácia (optional)
     */
    function addError(entry, errorMessage, version, config) {
        config = config || DEFAULT_CONFIG;
        if (!entry || !errorMessage) return;
        
        try {
            var timestamp = moment().format(config.fullTimestampFormat || DEFAULT_CONFIG.fullTimestampFormat);
            var versionString = version ? " v" + version + " -" : "";
            var errorLog = "[" + timestamp + "]" + versionString + " " + errorMessage;
            
            var fieldName = config.errorFieldName || DEFAULT_CONFIG.errorFieldName;
            var existingError = safeFieldAccess(entry, fieldName, "");
            entry.set(fieldName, existingError + errorLog + "\n");
        } catch (e) {
            try {
                message("Error logging failed: " + e);
            } catch (e2) {
                // Nič viac nemôžeme urobiť
            }
        }
    }
    
    /**
     * Pridá info záznam s detailmi o automatickej akcii
     * @param {Entry} entry - Entry objekt
     * @param {string} action - Popis akcie
     * @param {Object} details - Detaily (sourceId, libraryName, reason, etc.)
     * @param {Object} config - Konfigurácia (optional)
     */
    function addInfo(entry, action, details, config) {
        config = config || DEFAULT_CONFIG;
        if (!entry || !action) return;
        
        try {
            var timestamp = moment().format(DEFAULT_CONFIG.dateFormat);
            var infoMessage = "📋 [" + timestamp + "] " + action;
            
            if (details) {
                if (details.sourceId) infoMessage += "\n   • Zdroj: #" + details.sourceId;
                if (details.libraryName) infoMessage += " (" + details.libraryName + ")";
                if (details.reason) infoMessage += "\n   • Dôvod: " + details.reason;
                if (details.method) infoMessage += "\n   • Metóda: " + details.method;
                if (details.result) infoMessage += "\n   • Výsledok: " + details.result;
            }
            
            var fieldName = config.infoFieldName || DEFAULT_CONFIG.infoFieldName;
            var existingInfo = safeFieldAccess(entry, fieldName, "");
            entry.set(fieldName, existingInfo + infoMessage + "\n");
        } catch (e) {
            addError(entry, "Info logging failed: " + e, null, config);
        }
    }
    
    // ========================================
    // NULL-SAFE FIELD ACCESS
    // ========================================
    
    /**
     * Bezpečný prístup k poliam s default hodnotou
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @param {any} defaultValue - Default hodnota ak pole neexistuje
     * @return {any} Hodnota poľa alebo default
     */
    function safeFieldAccess(entry, fieldName, defaultValue) {
        if (!entry || !fieldName) return defaultValue || null;
        
        try {
            var value = entry.field(fieldName);
            return (value !== null && value !== undefined) ? value : (defaultValue || null);
        } catch (error) {
            return defaultValue || null;
        }
    }
    
    /**
     * v2.0 - Alias pre safeFieldAccess pre jednoduchšie volanie
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @param {any} defaultValue - Default hodnota
     * @return {any} Hodnota poľa alebo default
     */
    function safeGet(entry, fieldName, defaultValue) {
        return safeFieldAccess(entry, fieldName, defaultValue);
    }
    
    /**
     * v2.0 - Bezpečné nastavenie hodnoty poľa
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @param {any} value - Nová hodnota
     * @return {boolean} True ak úspešné, false ak nie
     */
    function safeSet(entry, fieldName, value) {
        if (!entry || !fieldName) return false;
        
        try {
            entry.set(fieldName, value);
            return true;
        } catch (error) {
            addError(entry, "Failed to set field '" + fieldName + "': " + error.toString(), "safeSet");
            return false;
        }
    }
    
    /**
     * Získanie prvého linku z Link to Entry poľa
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @return {Entry|null} Prvý linknutý entry alebo null
     */
    function safeGetFirstLink(entry, fieldName) {
        var links = safeFieldAccess(entry, fieldName, []);
        return (links && links.length > 0) ? links[0] : null;
    }
    
    /**
     * Získanie všetkých linkov z Link to Entry poľa
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @return {Array} Array linknutých entries alebo []
     */
    function safeGetLinks(entry, fieldName) {
        var links = safeFieldAccess(entry, fieldName, []);
        return links || [];
    }
    
    // ========================================
    // LINKS FROM OPERÁCIE
    // ========================================
    
    /**
     * Bezpečné LinksFrom volanie s error handlingom
     * @param {Entry} sourceEntry - Zdrojový entry objekt  
     * @param {string} targetLibrary - Názov cieľovej knižnice
     * @param {string} linkField - Názov poľa ktoré odkazuje späť
     * @return {Array} Array linknutých entries alebo []
     */
    function safeLinksFrom(sourceEntry, targetLibrary, linkField) {
        if (!sourceEntry || !targetLibrary || !linkField) return [];
        
        try {
            var results = sourceEntry.linksFrom(targetLibrary, linkField);
            return results || [];
        } catch (error) {
            // Nepridávame error log tu, pretože môže byť volané často a nie je to kritická chyba
            return [];
        }
    }
    
    /**
     * Hľadanie linkov s variáciami názvov polí
     * @param {Entry} sourceEntry - Zdrojový entry
     * @param {string} targetLibrary - Názov cieľovej knižnice
     * @param {Array} fieldVariations - Možné názvy polí ["Pole1", "pole1", "POLE1"]
     * @return {Array} Array linknutých entries alebo []
     */
    function findLinksWithVariations(sourceEntry, targetLibrary, fieldVariations) {
        if (!sourceEntry || !targetLibrary || !fieldVariations) return [];
        
        for (var i = 0; i < fieldVariations.length; i++) {
            var results = safeLinksFrom(sourceEntry, targetLibrary, fieldVariations[i]);
            if (results.length > 0) {
                return results;
            }
        }
        
        return [];
    }
    
    // ========================================
    // ATRIBÚTY HANDLING
    // ========================================
    
    /**
     * Bezpečné nastavenie atribútu s SPRÁVNOU SYNTAX!
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @param {number} index - Index v multi-select poli
     * @param {string} attributeName - Názov atribútu
     * @param {any} value - Hodnota atribútu
     * @return {boolean} True ak úspešné, false ak nie
     */
    function safeSetAttribute(entry, fieldName, index, attributeName, value) {
        if (!entry || !fieldName || typeof index !== "number" || !attributeName) return false;
        
        try {
            // SPRÁVNA SYNTAX - entry().setAttr cez pole s indexom, potom atribút a hodnota
            entry.setAttr(fieldName, index, attributeName, value);
            return true;
        } catch (error) {
            addError(entry, "Failed to set attribute '" + attributeName + "' on field '" + fieldName + "[" + index + "]': " + error.toString(), "safeSetAttribute");
            return false;
        }
    }
    
    /**
     * v2.0 - Alias pre safeSetAttribute pre backward compatibility
     * @param {Entry} entry - Entry objekt  
     * @param {string} fieldName - Názov poľa
     * @param {number} index - Index v multi-select poli
     * @param {string} attributeName - Názov atribútu
     * @param {any} value - Hodnota atribútu
     * @return {boolean} True ak úspešné, false ak nie
     */
    function safeSetAttr(entry, fieldName, index, attributeName, value) {
        return safeSetAttribute(entry, fieldName, index, attributeName, value);
    }
    
    /**
     * Bezpečné získanie atribútu
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @param {number|string} indexOrName - Index alebo názov objektu v poli
     * @param {string} attrName - Názov atribútu
     * @param {any} defaultValue - Default hodnota
     * @return {any} Hodnota atribútu alebo default
     */
    function safeGetAttribute(entry, fieldName, indexOrName, attrName, defaultValue) {
        if (!entry || !fieldName || !attrName) return defaultValue || null;
        
        try {
            var field = entry.field(fieldName);
            if (!field) return defaultValue || null;
            
            if (typeof indexOrName === "number") {
                // Index access
                if (field[indexOrName]) {
                    return field[indexOrName].attr(attrName) || defaultValue || null;
                }
            } else {
                // Name-based access
                for (var i = 0; i < field.length; i++) {
                    if (field[i].field && field[i].field("Name") === indexOrName) {
                        return field[i].attr(attrName) || defaultValue || null;
                    }
                }
            }
        } catch (error) {
            return defaultValue || null;
        }
        return defaultValue || null;
    }
    
    // ========================================
    // v2.0 - ČASOVÉ UTILITY FUNKCIE
    // ========================================
    
    /**
     * Formátovanie času do HH:mm formátu
     * @param {any} timeValue - Časová hodnota (Date, string, moment)
     * @return {string} Formátovaný čas alebo "00:00"
     */
    function formatTime(timeValue) {
        if (!timeValue) return "00:00";
        
        try {
            // Ak je už string v správnom formáte, vráť to
            if (typeof timeValue === "string" && timeValue.match(/^\d{2}:\d{2}$/)) {
                return timeValue;
            }
            
            // Skús moment formátovanie
            var momentTime = moment(timeValue);
            if (momentTime.isValid()) {
                return momentTime.format(DEFAULT_CONFIG.timeFormat);
            }
            
            // Ak je to Date objekt
            if (timeValue instanceof Date) {
                var hours = timeValue.getHours().toString().padStart(2, '0');
                var minutes = timeValue.getMinutes().toString().padStart(2, '0');
                return hours + ":" + minutes;
            }
            
            return "00:00";
        } catch (error) {
            return "00:00";
        }
    }
    
    /**
     * Zaokrúhlenie času na najbližších 15 minút
     * @param {any} timeValue - Časová hodnota
     * @return {any} Zaokrúhlený čas v pôvodnom formáte
     */
    function roundToQuarter(timeValue) {
        if (!timeValue) return null;
        
        try {
            var momentTime = moment(timeValue);
            if (!momentTime.isValid()) return timeValue;
            
            var minutes = momentTime.minutes();
            var roundedMinutes = Math.round(minutes / DEFAULT_CONFIG.quarterRoundingMinutes) * DEFAULT_CONFIG.quarterRoundingMinutes;
            
            // Handle overflow (60 minutes -> next hour)
            if (roundedMinutes >= 60) {
                momentTime.add(1, 'hour');
                roundedMinutes = 0;
            }
            
            return momentTime.minutes(roundedMinutes).seconds(0).milliseconds(0);
        } catch (error) {
            return timeValue; // Return original on error
        }
    }
    
    /**
     * Výpočet rozdielu medzi dvoma časmi v hodinách
     * @param {any} startTime - Začiatočný čas
     * @param {any} endTime - Koncový čas  
     * @return {number} Rozdiel v hodinách alebo 0
     */
    function calculateTimeDifference(startTime, endTime) {
        if (!startTime || !endTime) return 0;
        
        try {
            var start = moment(startTime);
            var end = moment(endTime);
            
            if (!start.isValid() || !end.isValid()) return 0;
            
            // Handle overnight work (end time next day)
            if (end.isBefore(start)) {
                end.add(1, 'day');
            }
            
            var diffMs = end.diff(start);
            var diffHours = diffMs / (1000 * 60 * 60);
            
            // Sanity check
            if (diffHours < 0 || diffHours > DEFAULT_CONFIG.maxWorkHours) return 0;
            if (diffHours < DEFAULT_CONFIG.minWorkHours) return 0;
            
            return Math.round(diffHours * 100) / 100; // Round to 2 decimals
        } catch (error) {
            return 0;
        }
    }
    
    // ========================================
    // v2.0 - BUSINESS LOGIC HELPERS
    // ========================================
    
    /**
     * Nájdenie platnej sadzby pre konkrétny dátum
     * @param {Array} salaries - Array sadzieb zamestnanca
     * @param {Date} targetDate - Cieľový dátum
     * @return {number} Platná sadzba alebo 0
     */
    function findValidSalaryForDate(salaries, targetDate) {
        if (!salaries || salaries.length === 0 || !targetDate) return 0;
        
        try {
            var targetMoment = moment(targetDate);
            var validSalaries = [];
            
            // Filter salaries valid for target date
            for (var i = 0; i < salaries.length; i++) {
                var salary = salaries[i];
                var validFrom = salary.field("Platnosť od");
                
                if (validFrom) {
                    var validFromMoment = moment(validFrom);
                    if (validFromMoment.isValid() && validFromMoment.isSameOrBefore(targetMoment)) {
                        validSalaries.push({
                            entry: salary,
                            validFrom: validFromMoment,
                            amount: safeFieldAccess(salary, "Sadzba", 0)
                        });
                    }
                }
            }
            
            // Sort by validFrom date descending (newest first)
            validSalaries.sort(function(a, b) {
                return b.validFrom.valueOf() - a.validFrom.valueOf();
            });
            
            // Return the most recent valid salary
            return validSalaries.length > 0 ? validSalaries[0].amount : 0;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * Získanie default HZS z defaults knižnice
     * @param {string} defaultsLibraryName - Názov defaults knižnice
     * @param {string} defaultType - Typ defaultu (optional, default "HZS")
     * @return {Entry|null} Default HZS entry alebo null
     */
    function getDefaultHZS(defaultsLibraryName, defaultType) {
        defaultsLibraryName = defaultsLibraryName || DEFAULT_CONFIG.defaultLibraryName;
        defaultType = defaultType || "HZS";
        
        try {
            var defaultsLib = libByName(defaultsLibraryName);
            if (!defaultsLib) return null;
            
            var defaults = defaultsLib.find("typ", defaultType);
            return (defaults && defaults.length > 0) ? defaults[0] : null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Nastavenie default hodnoty ak pole je prázdne a znovu načítanie
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov poľa
     * @param {string} defaultLibrary - Názov defaults knižnice
     * @param {string} defaultType - Typ defaultu ktorý hľadáme
     * @return {Array|null} Znovu načítané pole alebo null
     */
    function setDefaultAndReload(entry, fieldName, defaultLibrary, defaultType) {
        if (!entry || !fieldName) return null;
        
        var field = safeFieldAccess(entry, fieldName);
        if (!field || field.length === 0) {
            var defaultEntry = getDefaultHZS(defaultLibrary, defaultType);
            if (defaultEntry) {
                safeSet(entry, fieldName, defaultEntry);
                // KRITICKÉ: Znovu načítať pole po nastavení
                return safeFieldAccess(entry, fieldName);
            }
        }
        return field;
    }
    
    // ========================================
    // v2.0 - VALIDATION FUNKCIE
    // ========================================
    
    /**
     * Validácia povinných polí
     * @param {Entry} entry - Entry objekt
     * @param {Array} requiredFields - Array názvov povinných polí
     * @return {Object} {isValid: boolean, missingFields: []}
     */
    function validateRequiredFields(entry, requiredFields) {
        var result = {
            isValid: true,
            missingFields: []
        };
        
        if (!entry || !requiredFields) {
            result.isValid = false;
            return result;
        }
        
        for (var i = 0; i < requiredFields.length; i++) {
            var fieldName = requiredFields[i];
            var value = safeFieldAccess(entry, fieldName);
            
            if (!value || (Array.isArray(value) && value.length === 0)) {
                result.isValid = false;
                result.missingFields.push(fieldName);
            }
        }
        
        return result;
    }
    
    /**
     * Validácia stavu entry
     * @param {Entry} entry - Entry objekt na validáciu
     * @return {Object} {isValid: boolean, errors: []}
     */
    function validateEntryState(entry) {
        var result = {
            isValid: true,
            errors: []
        };
        
        if (!entry) {
            result.isValid = false;
            result.errors.push("Entry object is null/undefined");
            return result;
        }
        
        try {
            // Basic sanity checks
            var id = entry.field("ID");
            if (!id) {
                result.errors.push("Entry has no ID field");
            }
        } catch (error) {
            result.isValid = false;
            result.errors.push("Cannot access entry fields: " + error.toString());
        }
        
        result.isValid = result.errors.length === 0;
        return result;
    }
    
    // ========================================
    // v2.0 - FORMATTING FUNKCIE
    // ========================================
    
    /**
     * Formátovanie peňažnej sumy
     * @param {number} amount - Suma na formátovanie
     * @param {string} currency - Mena (default "€")
     * @param {number} decimals - Počet desatinných miest (default 2)
     * @return {string} Formátovaná suma
     */
    function formatMoney(amount, currency, decimals) {
        currency = currency || "€";
        decimals = typeof decimals === "number" ? decimals : 2;
        
        if (typeof amount !== "number" || isNaN(amount)) return "0.00 " + currency;
        
        return amount.toFixed(decimals) + " " + currency;
    }
    
    /**
     * Parsing peňažnej sumy zo stringu
     * @param {string} moneyString - String s peňažnou sumou
     * @return {number} Číselná hodnota alebo 0
     */
    function parseMoney(moneyString) {
        if (!moneyString) return 0;
        
        try {
            // Remove currency symbols and spaces
            var cleanString = moneyString.toString()
                .replace(/[€$£¥₹]/g, '')
                .replace(/\s+/g, '')
                .replace(/,/g, '.');
            
            var number = parseFloat(cleanString);
            return isNaN(number) ? 0 : number;
        } catch (error) {
            return 0;
        }
    }
    
    /**
     * Formátovanie mena zamestnanca pre zobrazenie
     * @param {Entry} employeeEntry - Entry zamestnanca
     * @return {string} Formátované meno alebo "Neznámy zamestnanec"
     */
    function formatEmployeeName(employeeEntry) {
        if (!employeeEntry) return "Neznámy zamestnanec";
        
        try {
            var nick = safeFieldAccess(employeeEntry, "Nick", "");
            var meno = safeFieldAccess(employeeEntry, "Meno", "");
            var priezvisko = safeFieldAccess(employeeEntry, "Priezvisko", "");
            
            if (nick && (meno || priezvisko)) {
                return nick + " (" + (meno + " " + priezvisko).trim() + ")";
            } else if (nick) {
                return nick;
            } else if (meno || priezvisko) {
                return (meno + " " + priezvisko).trim();
            } else {
                return "Zamestnanec ID:" + safeFieldAccess(employeeEntry, "ID", "?");
            }
        } catch (error) {
            return "Chyba pri formátovaní mena";
        }
    }
    
    // ========================================
    // v2.0 - UTILITY OPERÁCIE
    // ========================================
    
    /**
     * Uloženie všetkých logov - placeholder pre custom save logic
     * @param {Entry} entry - Entry objekt
     * @return {boolean} True ak úspešné
     */
    function saveLogs(entry) {
        if (!entry) return false;
        
        try {
            // V Memento sa logy ukladajú automaticky pri entry.set()
            // Môžeme pridať custom cleanup alebo validation logic tu
            
            // Optional: Cleanup starých debug logov ak sú príliš dlhé
            var debugLog = safeFieldAccess(entry, DEFAULT_CONFIG.debugFieldName, "");
            if (debugLog && debugLog.length > 10000) {
                // Keep only last 5000 characters
                var trimmedLog = "...[trimmed]...\n" + debugLog.substring(debugLog.length - 5000);
                safeSet(entry, DEFAULT_CONFIG.debugFieldName, trimmedLog);
            }
            
            return true;
        } catch (error) {
            try {
                message("Failed to save logs: " + error.toString());
            } catch (e2) {
                // Nič viac
            }
            return false;
        }
    }
    
    /**
     * Vyčistenie logov na začiatku scriptu
     * @param {Entry} entry - Entry objekt
     * @param {boolean} clearErrors - Či vyčistiť aj error logy (default false)
     */
    function clearLogs(entry, clearErrors) {
        if (!entry) return;
        
        try {
            // Vždy vyčisti debug log
            safeSet(entry, DEFAULT_CONFIG.debugFieldName, "");
            
            // Error log len ak je to požadované
            if (clearErrors) {
                safeSet(entry, DEFAULT_CONFIG.errorFieldName, "");
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    }
    
    // ========================================
    // v2.0 - VYHĽADÁVANIE V KNIŽNICIACH
    // ========================================
    
    /**
     * Vyhľadanie entry podľa unique poľa s variáciami
     * @param {string} libraryName - Názov knižnice
     * @param {Array} fieldVariations - Možné názvy unique polí ["Nick", "nick", "ID"]
     * @param {string} value - Hľadaná hodnota
     * @return {Entry|null} Nájdený záznam alebo null
     */
    function findByUniqueField(libraryName, fieldVariations, value) {
        if (!libraryName || !fieldVariations || !value) return null;
        
        try {
            var library = libByName(libraryName);
            if (!library) return null;
            
            for (var i = 0; i < fieldVariations.length; i++) {
                var fieldName = fieldVariations[i];
                var results = library.find(fieldName, value);
                
                if (results && results.length > 0) {
                    return results[0]; // Return first match
                }
            }
        } catch (error) {
            return null;
        }
        
        return null;
    }
    
    /**
     * Špecializovaná funkcia pre hľadanie zamestnanca podľa Nick
     * @param {string} nick - Nick zamestnanca
     * @param {string} employeesLibrary - Názov knižnice zamestnancov (default "Zamestnanci")
     * @return {Entry|null} Nájdený zamestnanec alebo null
     */
    function findEmployeeByNick(nick, employeesLibrary) {
        employeesLibrary = employeesLibrary || "Zamestnanci";
        return findByUniqueField(employeesLibrary, ["Nick", "nick"], nick);
    }
    
    // ========================================
    // v2.0 - BATCH PROCESSING
    // ========================================
    
    /**
     * Hromadné spracovanie položiek s error handlingom
     * @param {Array} items - Array položiek na spracovanie
     * @param {Function} processFunction - Funkcia pre spracovanie jednej položky
     * @param {Entry} debugEntry - Entry pre debug logy (optional)
     * @return {Object} Výsledky spracovania {success: [], failed: [], total: number}
     */
    function processBatch(items, processFunction, debugEntry) {
        var results = {
            success: [],
            failed: [],
            total: 0
        };
        
        if (!items || !processFunction) return results;
        
        results.total = items.length;
        
        for (var i = 0; i < items.length; i++) {
            try {
                var result = processFunction(items[i], i);
                if (result) {
                    results.success.push({
                        index: i,
                        item: items[i],
                        result: result
                    });
                } else {
                    results.failed.push({
                        index: i,
                        item: items[i],
                        error: "Processing returned false/null"
                    });
                }
            } catch (error) {
                results.failed.push({
                    index: i,
                    item: items[i],
                    error: error.toString()
                });
                
                if (debugEntry) {
                    addError(debugEntry, "Batch processing error at index " + i + ": " + error.toString(), "processBatch");
                }
            }
        }
        
        if (debugEntry) {
            addDebug(debugEntry, "Batch processed: " + results.success.length + "/" + results.total + " successful");
        }
        
        return results;
    }
    
    // ========================================
    // PUBLIC API
    // ========================================
    return {
        // v1.0 - Original functions
        addDebug: addDebug,
        addError: addError,
        addInfo: addInfo,
        safeFieldAccess: safeFieldAccess,
        safeGetFirstLink: safeGetFirstLink,
        safeGetLinks: safeGetLinks,
        safeLinksFrom: safeLinksFrom,
        findLinksWithVariations: findLinksWithVariations,
        safeSetAttribute: safeSetAttribute,
        safeGetAttribute: safeGetAttribute,
        setDefaultAndReload: setDefaultAndReload,
        validateRequiredFields: validateRequiredFields,
        validateEntryState: validateEntryState,
        formatMoney: formatMoney,
        parseMoney: parseMoney,
        formatEmployeeName: formatEmployeeName,
        processBatch: processBatch,
        findByUniqueField: findByUniqueField,
        findEmployeeByNick: findEmployeeByNick,
        
        // v2.0 - New functions pre Záznam prác compatibility
        safeGet: safeGet,
        safeSet: safeSet,
        safeSetAttr: safeSetAttr,
        formatTime: formatTime,
        roundToQuarter: roundToQuarter,
        calculateTimeDifference: calculateTimeDifference,
        findValidSalaryForDate: findValidSalaryForDate,
        getDefaultHZS: getDefaultHZS,
        saveLogs: saveLogs,
        clearLogs: clearLogs,
        
        // Configuration access
        DEFAULT_CONFIG: DEFAULT_CONFIG,
        
        // v2.0 - Version info
        version: "2.0"
    };
})();

// Export pre Memento
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MementoUtils;
}