// ==============================================
// MEMENTO DATABASE - UNIVERZÁLNA UTILITY KNIŽNICA
// Verzia: 1.0 | Dátum: 11.8.2025 | Autor: ASISTANTO
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
        fullTimestampFormat: "YYYY-MM-DD HH:mm:ss"
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
            message("Debug failed: " + e);
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
            message("Error logging failed: " + e);
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
        } catch (e) {
            return defaultValue || null;
        }
    }
    
    /**
     * Bezpečné získanie prvého objektu z Link to Entry poľa
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov Link to Entry poľa
     * @return {Entry|null} Prvý linknutý objekt alebo null
     */
    function safeGetFirstLink(entry, fieldName) {
        if (!entry || !fieldName) return null;
        
        try {
            var links = entry.field(fieldName);
            if (links && links.length > 0) {
                return links[0];
            }
            return null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Bezpečné získanie všetkých objektov z Link to Entry poľa
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov Link to Entry poľa
     * @return {Array} Array linknutých objektov alebo prázdny array
     */
    function safeGetLinks(entry, fieldName) {
        if (!entry || !fieldName) return [];
        
        try {
            var links = entry.field(fieldName);
            return (links && links.length > 0) ? links : [];
        } catch (e) {
            return [];
        }
    }
    
    // ========================================
    // LINKSFROM OPERÁCIE
    // ========================================
    
    /**
     * Bezpečné vykonanie linksFrom operácie s debug logom
     * @param {Entry} sourceObject - Zdrojový objekt (nie pole!)
     * @param {string} targetLibrary - Názov cieľovej knižnice
     * @param {string} backLinkField - Názov poľa ktoré odkazuje späť
     * @param {Entry} debugEntry - Entry pre debug log (optional)
     * @return {Array} Array výsledkov alebo prázdny array
     */
    function safeLinksFrom(sourceObject, targetLibrary, backLinkField, debugEntry) {
        if (!sourceObject || !targetLibrary || !backLinkField) {
            if (debugEntry) {
                addDebug(debugEntry, "❌ LinksFrom: Missing parameters");
            }
            return [];
        }
        
        try {
            var results = sourceObject.linksFrom(targetLibrary, backLinkField);
            
            if (debugEntry) {
                if (results && results.length > 0) {
                    addDebug(debugEntry, "✅ LinksFrom '" + targetLibrary + "': " + results.length + " záznamov");
                } else {
                    addDebug(debugEntry, "⚠️ LinksFrom '" + targetLibrary + "': 0 záznamov");
                }
            }
            
            return results || [];
        } catch (e) {
            if (debugEntry) {
                addError(debugEntry, "LinksFrom failed: " + e.toString());
            }
            return [];
        }
    }
    
    /**
     * Hľadanie súvisiacich záznamov cez rôzne variácie názvov polí
     * @param {Entry} sourceObject - Zdrojový objekt
     * @param {string} targetLibrary - Názov cieľovej knižnice
     * @param {Array} fieldVariations - Array možných názvov polí ["Zamestnanec", "Zamestnanci", "Employee"]
     * @param {Entry} debugEntry - Entry pre debug log (optional)
     * @return {Array} Array výsledkov z prvej úspešnej variácie
     */
    function findLinksWithVariations(sourceObject, targetLibrary, fieldVariations, debugEntry) {
        if (!sourceObject || !targetLibrary || !fieldVariations) return [];
        
        for (var i = 0; i < fieldVariations.length; i++) {
            var fieldName = fieldVariations[i];
            var results = safeLinksFrom(sourceObject, targetLibrary, fieldName, null);
            
            if (results && results.length > 0) {
                if (debugEntry) {
                    addDebug(debugEntry, "✅ Found links using field '" + fieldName + "'");
                }
                return results;
            }
        }
        
        if (debugEntry) {
            addDebug(debugEntry, "⚠️ No links found with any variation: " + fieldVariations.join(", "));
        }
        return [];
    }
    
    // ========================================
    // ATRIBÚTY A DEFAULT HODNOTY
    // ========================================
    
    /**
     * Bezpečné nastavenie atribútu (2 parametre!)
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov Link to Entry poľa
     * @param {string} attrName - Názov atribútu
     * @param {any} value - Hodnota atribútu
     * @param {number} index - Index objektu v poli (default 0)
     */
    function safeSetAttribute(entry, fieldName, attrName, value, index) {
        if (!entry || !fieldName || !attrName) return false;
        index = index || 0;
        
        try {
            entry.field(fieldName).setAttr(attrName, value);
            return true;
        } catch (e) {
            // Fallback na priamy prístup
            try {
                var links = entry.field(fieldName);
                if (links && links[index]) {
                    links[index].field(fieldName).setAttr(attrName, value);
                    return true;
                }
            } catch (e2) {
                return false;
            }
        }
        return false;
    }
    
    /**
     * Bezpečné získanie atribútu
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov Link to Entry poľa
     * @param {string} attrName - Názov atribútu
     * @param {number} index - Index objektu v poli (default 0)
     * @param {any} defaultValue - Default hodnota
     */
    function safeGetAttribute(entry, fieldName, attrName, index, defaultValue) {
        if (!entry || !fieldName || !attrName) return defaultValue || null;
        index = index || 0;
        
        try {
            return entry.attr(attrName) || defaultValue || null;
        } catch (e) {
            // Fallback na priamy prístup
            try {
                var links = entry.field(fieldName);
                if (links && links[index]) {
                    return links[index].attr(attrName) || defaultValue || null;
                }
            } catch (e2) {
                return defaultValue || null;
            }
        }
        return defaultValue || null;
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
        
        var field = entry.field(fieldName);
        if (!field || field.length === 0) {
            try {
                var defaultsLib = libByName(defaultLibrary);
                var defaults = defaultsLib.find("typ", defaultType);
                
                if (defaults && defaults.length > 0) {
                    entry.set(fieldName, defaults[0]);
                    // KRITICKÉ: Znovu načítať pole po nastavení
                    return entry.field(fieldName);
                }
            } catch (e) {
                addError(entry, "Failed to set default: " + e);
            }
        }
        return field;
    }
    
    // ========================================
    // VYHĽADÁVANIE V KNIŽNICIACH
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
            var targetLib = libByName(libraryName);
            
            for (var i = 0; i < fieldVariations.length; i++) {
                var fieldName = fieldVariations[i];
                var results = targetLib.find(fieldName, value);
                
                if (results && results.length > 0) {
                    return results[0]; // Unique pole, vrátime prvý
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    }
    
    /**
     * Hľadanie zamestnanca podľa Nick (alebo iných variácií)
     * @param {string} nick - Nick zamestnanca
     * @param {string} libraryName - Názov knižnice (default "Zamestnanci")
     * @return {Entry|null} Zamestnanec alebo null
     */
    function findEmployeeByNick(nick, libraryName) {
        libraryName = libraryName || "Zamestnanci";
        var nickVariations = ["Nick", "nick", "nickname", "Nickname"];
        return findByUniqueField(libraryName, nickVariations, nick);
    }
    
    // ========================================
    // VALIDÁCIE
    // ========================================
    
    /**
     * Validácia či entry má všetky požadované polia
     * @param {Entry} entry - Entry objekt
     * @param {Array} requiredFields - Array názvov požadovaných polí
     * @param {Entry} debugEntry - Entry pre debug (optional)
     * @return {boolean} True ak všetky polia existujú
     */
    function validateRequiredFields(entry, requiredFields, debugEntry) {
        if (!entry || !requiredFields) return false;
        
        var missingFields = [];
        
        for (var i = 0; i < requiredFields.length; i++) {
            var fieldName = requiredFields[i];
            var value = safeFieldAccess(entry, fieldName, null);
            
            if (value === null || value === undefined || value === "") {
                missingFields.push(fieldName);
            }
        }
        
        if (missingFields.length > 0) {
            if (debugEntry) {
                addDebug(debugEntry, "❌ Missing required fields: " + missingFields.join(", "));
            }
            return false;
        }
        
        return true;
    }
    
    /**
     * Kontrola či je entry v správnom stave pre operáciu
     * @param {Entry} entry - Entry objekt
     * @param {string} fieldName - Názov status poľa
     * @param {Array} allowedStates - Povolené stavy
     * @return {boolean} True ak je stav povolený
     */
    function validateEntryState(entry, fieldName, allowedStates) {
        if (!entry || !fieldName || !allowedStates) return false;
        
        var currentState = safeFieldAccess(entry, fieldName, null);
        if (!currentState) return false;
        
        for (var i = 0; i < allowedStates.length; i++) {
            if (currentState === allowedStates[i]) {
                return true;
            }
        }
        
        return false;
    }
    
    // ========================================
    // FORMÁTOVANIE A KONVERZIE
    // ========================================
    
    /**
     * Formátovanie peňažnej sumy
     * @param {number} amount - Suma
     * @param {string} currency - Mena (default "€")
     * @param {number} decimals - Počet desatinných miest (default 2)
     * @return {string} Formátovaná suma
     */
    function formatMoney(amount, currency, decimals) {
        currency = currency || "€";
        decimals = decimals !== undefined ? decimals : 2;
        
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "0,00 " + currency;
        }
        
        var formatted = amount.toFixed(decimals).replace(".", ",");
        return formatted + " " + currency;
    }
    
    /**
     * Parse peňažnej sumy zo stringu
     * @param {string} moneyString - String s sumou ("123,45 €")
     * @return {number} Číselná hodnota alebo 0
     */
    function parseMoney(moneyString) {
        if (!moneyString) return 0;
        
        try {
            // Odstráň všetko okrem čísiel, bodky a čiarky
            var cleaned = moneyString.replace(/[^\d,.-]/g, "");
            // Nahraď čiarku bodkou
            cleaned = cleaned.replace(",", ".");
            var value = parseFloat(cleaned);
            return isNaN(value) ? 0 : value;
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * Formátovanie mena pre debug výpis
     * @param {string} nick - Nick zamestnanca
     * @param {string} surname - Priezvisko (optional)
     * @return {string} Formátované meno
     */
    function formatEmployeeName(nick, surname) {
        if (!nick) return "Unknown";
        
        if (surname) {
            return nick + " (" + surname + ")";
        }
        return nick;
    }
    
    // ========================================
    // ČASOVÉ VÝPOČTY
    // ========================================
    
    /**
     * Výpočet rozdielu času v hodinách
     * @param {string} startTime - Začiatok (HH:mm alebo ISO)
     * @param {string} endTime - Koniec (HH:mm alebo ISO)
     * @param {Date} date - Dátum pre kontext (optional)
     * @return {number} Počet hodín
     */
    function calculateHours(startTime, endTime, date) {
        if (!startTime || !endTime) return 0;
        
        try {
            var start, end;
            
            // Ak máme len čas bez dátumu
            if (startTime.length <= 5 && endTime.length <= 5) {
                var baseDate = date ? moment(date) : moment();
                start = moment(baseDate.format("YYYY-MM-DD") + " " + startTime);
                end = moment(baseDate.format("YYYY-MM-DD") + " " + endTime);
                
                // Ak koniec je skôr ako začiatok, pridáme deň
                if (end.isBefore(start)) {
                    end.add(1, "day");
                }
            } else {
                start = moment(startTime);
                end = moment(endTime);
            }
            
            var hours = end.diff(start, "hours", true);
            return Math.round(hours * 100) / 100; // Zaokrúhli na 2 desatinné miesta
        } catch (e) {
            return 0;
        }
    }
    
    /**
     * Kontrola či je víkend
     * @param {Date|string} date - Dátum
     * @return {boolean} True ak je víkend
     */
    function isWeekend(date) {
        try {
            var m = moment(date);
            var day = m.day();
            return day === 0 || day === 6; // Nedeľa = 0, Sobota = 6
        } catch (e) {
            return false;
        }
    }
    
    // ========================================
    // BATCH OPERÁCIE
    // ========================================
    
    /**
     * Spracovanie viacerých záznamov s error handling
     * @param {Array} items - Array položiek na spracovanie
     * @param {Function} processFunction - Funkcia na spracovanie každej položky
     * @param {Entry} debugEntry - Entry pre debug log (optional)
     * @return {Object} Výsledky spracovania {success: [], failed: []}
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
            } catch (e) {
                results.failed.push({
                    index: i,
                    item: items[i],
                    error: e.toString()
                });
                
                if (debugEntry) {
                    addError(debugEntry, "Batch processing error at index " + i + ": " + e);
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
        // Debug a Error handling
        addDebug: addDebug,
        addError: addError,
        addInfo: addInfo,
        
        // Field access
        safeFieldAccess: safeFieldAccess,
        safeGetFirstLink: safeGetFirstLink,
        safeGetLinks: safeGetLinks,
        
        // LinksFrom operácie
        safeLinksFrom: safeLinksFrom,
        findLinksWithVariations: findLinksWithVariations,
        
        // Atribúty
        safeSetAttribute: safeSetAttribute,
        safeGetAttribute: safeGetAttribute,
        setDefaultAndReload: setDefaultAndReload,
        
        // Vyhľadávanie
        findByUniqueField: findByUniqueField,
        findEmployeeByNick: findEmployeeByNick,
        
        // Validácie
        validateRequiredFields: validateRequiredFields,
        validateEntryState: validateEntryState,
        
        // Formátovanie
        formatMoney: formatMoney,
        parseMoney: parseMoney,
        formatEmployeeName: formatEmployeeName,
        
        // Časové výpočty
        calculateHours: calculateHours,
        isWeekend: isWeekend,
        
        // Batch operácie
        processBatch: processBatch,
        
        // Konfigurácia
        DEFAULT_CONFIG: DEFAULT_CONFIG
    };
})();

// Export pre Memento
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MementoUtils;
}