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
    // function safeLinksFrom(sourceObject, targetLibrary, backLinkField, debugEntry) {
    //     if (!sourceObject || !targetLibrary || !backLinkField) {
    //         if (debugEntry) {
    //             addDebug(debugEntry, "❌ LinksFrom: Missing parameters");
    //         }
    //         return [];
    //     }
        
    //     try {
    //         var results = sourceObject.linksFrom(targetLibrary, backLinkField);
            
    //         if (debugEntry) {
    //             if (results && results.length > 0) {
    //                 addDebug(debugEntry, "✅ LinksFrom '" + targetLibrary + "': " + results.length + " záznamov");
    //             } else {
    //                 addDebug(debugEntry, "⚠️ LinksFrom '" + targetLibrary + "': 0 záznamov");
    //             }
    //         }
            
    //         return results || [];
    //     } catch (e) {
    //         if (debugEntry) {
    //             addError(debugEntry, "LinksFrom failed: " + e.toString());
    //         }
    //         return [];
    //     }
    // }
    function safeLinksFrom(sourceEntry, targetLibraryName, backLinkFieldName, debugEntry) {
    if (!sourceEntry || !targetLibraryName || !backLinkFieldName) {
        if (debugEntry) addDebug(debugEntry, "❌ LinksFrom: Missing parameters");
        return [];
    }
    
    try {
        // V Memento sa volá na entry objektu, nie na poli
        var results = sourceEntry.linksFrom(targetLibraryName, backLinkFieldName);
        
        if (debugEntry) {
            var count = results ? results.length : 0;
            addDebug(debugEntry, "✅ LinksFrom '" + targetLibraryName + "': " + count + " záznamov");
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
    // function safeSetAttribute(entry, fieldName, attrName, value, index) {
    //     if (!entry || !fieldName || !attrName) return false;
    //     index = index || 0;
        
    //     try {
    //         entry.field(fieldName).setAttr(attrName, value);
    //         return true;
    //     } catch (e) {
    //         // Fallback na priamy prístup
    //         try {
    //             var links = entry.field(fieldName);
    //             if (links && links[index]) {
    //                 links[index].setAttr(attrName, value);
    //                 return true;
    //             }
    //         } catch (e2) {
    //             return false;
    //         }
    //     }
    //     return false;
    // }
    function safeSetAttribute(entry, fieldName, attrName, value, index) {
    if (!entry || !fieldName || !attrName) return false;
    index = index || 0;
    
    try {
        var linkField = entry.field(fieldName);
        if (!linkField || linkField.length === 0) return false;
        
        // SPRÁVNY spôsob: setAttr sa volá na samotnom link objekte
        if (Array.isArray(linkField)) {
            if (linkField[index]) {
                linkField[index].setAttr(attrName, value);
                return true;
            }
        } else {
            // Pre single link
            linkField.setAttr(attrName, value);
            return true;
        }
    } catch (e) {
        // Alternatívny prístup cez priamy set
        try {
            entry.set(fieldName + "." + attrName, value);
            return true;
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
    // function safeGetAttribute(entry, fieldName, attrName, index, defaultValue) {
    //     if (!entry || !fieldName || !attrName) return defaultValue || null;
    //     index = index || 0;
        
    //     try {
    //         return entry.attr(attrName) || defaultValue || null;
    //     } catch (e) {
    //         // Fallback na priamy prístup
    //         try {
    //             var links = entry.field(fieldName);
    //             if (links && links[index]) {
    //                 return links[index].attr(attrName) || defaultValue || null;
    //             }
    //         } catch (e2) {
    //             return defaultValue || null;
    //         }
    //     }
    //     return defaultValue || null;
    // }
    function safeGetAttribute(entry, fieldName, attrName, index, defaultValue) {
    if (!entry || !fieldName || !attrName) return defaultValue || null;
    index = index || 0;
    
    try {
        var linkField = entry.field(fieldName);
        if (!linkField) return defaultValue || null;
        
        // SPRÁVNY spôsob: attr() sa volá na link objekte
        if (Array.isArray(linkField)) {
            if (linkField[index]) {
                return linkField[index].attr(attrName) || defaultValue || null;
            }
        } else {
            // Pre single link
            return linkField.attr(attrName) || defaultValue || null;
        }
    } catch (e) {
        // Alternatívny prístup
        try {
            return entry.field(fieldName + "." + attrName) || defaultValue || null;
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
    // function calculateHours(startTime, endTime, date) {
    //     if (!startTime || !endTime) return 0;
        
    //     try {
    //         var start, end;
            
    //         // Ak máme len čas bez dátumu
    //         if (startTime.length <= 5 && endTime.length <= 5) {
    //             var baseDate = date ? moment(date) : moment();
    //             start = moment(baseDate.format("YYYY-MM-DD") + " " + startTime);
    //             end = moment(baseDate.format("YYYY-MM-DD") + " " + endTime);
                
    //             // Ak koniec je skôr ako začiatok, pridáme deň
    //             if (end.isBefore(start)) {
    //                 end.add(1, "day");
    //             }
    //         } else {
    //             start = moment(startTime);
    //             end = moment(endTime);
    //         }
            
    //         var hours = end.diff(start, "hours", true);
    //         return Math.round(hours * 100) / 100; // Zaokrúhli na 2 desatinné miesta
    //     } catch (e) {
    //         return 0;
    //     }
    // }
    function calculateHours(startTime, endTime, date) {
    if (!startTime || !endTime) return 0;
    
    try {
        var start, end;
        var baseDate = date ? new Date(date) : new Date();
        
        // Testuj či moment existuje
        if (typeof moment !== 'undefined') {
            if (startTime.length <= 5 && endTime.length <= 5) {
                var baseMoment = moment(baseDate);
                start = moment(baseMoment.format("YYYY-MM-DD") + " " + startTime, "YYYY-MM-DD HH:mm");
                end = moment(baseMoment.format("YYYY-MM-DD") + " " + endTime, "YYYY-MM-DD HH:mm");
                
                if (end.isBefore(start)) {
                    end.add(1, "day");
                }
                
                return Math.round(end.diff(start, "hours", true) * 100) / 100;
            }
        }
        
        // Fallback na native Date ak moment zlyhal
        return calculateHoursNative(startTime, endTime, baseDate);
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
    // AI API KEY MANAGEMENT
    // ========================================

    /**
     * Načítanie API kľúčov z knižnice ASISTANTO Api
     * @param {string} providerName - Názov providera ("Perplexity", "OpenAi", "OpenRouter")
     * @param {Entry} debugEntry - Entry pre debug log
     * @return {string|null} API kľúč alebo null
     */
    function getApiKey(providerName, debugEntry) {
        if (!providerName) return null;
        
        try {
            var apiLib = libByName("ASISTANTO Api");
            var fieldVariations = [
                "API " + providerName,
                "AI " + providerName,
                providerName + " API",
                providerName + " Key"
            ];
            
            // Hľadáme záznam s API kľúčmi
            var apiEntries = apiLib.entries();
            if (!apiEntries || apiEntries.length === 0) {
                if (debugEntry) addError(debugEntry, "ASISTANTO Api knižnica je prázdna");
                return null;
            }
            
            // Berieme prvý záznam (predpokladáme jeden záznam s API kľúčmi)
            var apiEntry = apiEntries[0];
            
            // Skúšame rôzne variácie názvov polí
            for (var i = 0; i < fieldVariations.length; i++) {
                var key = safeFieldAccess(apiEntry, fieldVariations[i], null);
                if (key && key.trim() !== "") {
                    if (debugEntry) {
                        addDebug(debugEntry, "✅ API Key loaded for " + providerName + " (field: " + fieldVariations[i] + ")");
                    }
                    return key.trim();
                }
            }
            
            if (debugEntry) {
                addError(debugEntry, "❌ API Key not found for " + providerName + ". Tried fields: " + fieldVariations.join(", "));
            }
            return null;
            
        } catch (e) {
            if (debugEntry) {
                addError(debugEntry, "Failed to get API key for " + providerName + ": " + e);
            }
            return null;
        }
    }

    /**
     * Cache pre API kľúče (optimalizácia)
     */
    var _apiKeyCache = {};

    function getCachedApiKey(providerName, debugEntry) {
        if (!_apiKeyCache[providerName]) {
            _apiKeyCache[providerName] = getApiKey(providerName, debugEntry);
        }
        return _apiKeyCache[providerName];
    }

    // ========================================
    // UNIVERSAL AI CLIENT
    // ========================================

    /**
     * Konfigurácia pre rôznych AI providerov
     */
    var AI_PROVIDERS = {
        "OpenAi": {
            baseUrl: "https://api.openai.com/v1/chat/completions",
            headers: function(apiKey) {
                return {
                    "Authorization": "Bearer " + apiKey,
                    "Content-Type": "application/json"
                };
            },
            payload: function(prompt, model, options) {
                return JSON.stringify({
                    model: model || "gpt-4o-mini",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7
                });
            },
            parseResponse: function(response) {
                var data = JSON.parse(response);
                return data.choices && data.choices[0] && data.choices[0].message 
                    ? data.choices[0].message.content 
                    : "No response";
            }
        },
        
        "Perplexity": {
            baseUrl: "https://api.perplexity.ai/chat/completions",
            headers: function(apiKey) {
                return {
                    "Authorization": "Bearer " + apiKey,
                    "Content-Type": "application/json"
                };
            },
            payload: function(prompt, model, options) {
                return JSON.stringify({
                    model: model || "llama-3.1-sonar-small-128k-online",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7
                });
            },
            parseResponse: function(response) {
                var data = JSON.parse(response);
                return data.choices && data.choices[0] && data.choices[0].message 
                    ? data.choices[0].message.content 
                    : "No response";
            }
        },
        
        "OpenRouter": {
            baseUrl: "https://openrouter.ai/api/v1/chat/completions",
            headers: function(apiKey) {
                return {
                    "Authorization": "Bearer " + apiKey,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://mementodatabase.app",
                    "X-Title": "Memento Database Script"
                };
            },
            payload: function(prompt, model, options) {
                return JSON.stringify({
                    model: model || "anthropic/claude-3.5-haiku",
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    max_tokens: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7
                });
            },
            parseResponse: function(response) {
                var data = JSON.parse(response);
                return data.choices && data.choices[0] && data.choices[0].message 
                    ? data.choices[0].message.content 
                    : "No response";
            }
        }
    };

    /**
     * Univerzálne volanie AI providera
     * @param {string} provider - Názov providera ("OpenAi", "Perplexity", "OpenRouter")
     * @param {string} prompt - Prompt pre AI
     * @param {Object} options - Nastavenia {model, maxTokens, temperature, debugEntry}
     * @return {Object} {success: boolean, response: string, error: string}
     */
    function callAI(provider, prompt, options) {
        options = options || {};
        var debugEntry = options.debugEntry;
        
        if (!provider || !prompt) {
            var error = "Missing provider or prompt";
            if (debugEntry) addError(debugEntry, "AI Call failed: " + error);
            return {success: false, error: error, response: null};
        }
        
        // Získaj API kľúč
        var apiKey = getCachedApiKey(provider, debugEntry);
        if (!apiKey) {
            var error = "API key not found for " + provider;
            if (debugEntry) addError(debugEntry, "AI Call failed: " + error);
            return {success: false, error: error, response: null};
        }
        
        // Získaj konfiguráciu providera
        var providerConfig = AI_PROVIDERS[provider];
        if (!providerConfig) {
            var error = "Unsupported AI provider: " + provider;
            if (debugEntry) addError(debugEntry, "AI Call failed: " + error);
            return {success: false, error: error, response: null};
        }
        
        try {
            if (debugEntry) {
                addDebug(debugEntry, "🤖 AI Call: " + provider + " (" + (options.model || "default") + ")");
                addDebug(debugEntry, "📝 Prompt: " + prompt.substring(0, 100) + "...");
            }
            
            // Priprav HTTP request
            var httpClient = http();
            var headers = providerConfig.headers(apiKey);
            
            // Nastav headers
            for (var headerName in headers) {
                httpClient.headers()[headerName] = headers[headerName];
            }
            
            // Priprav payload
            var payload = providerConfig.payload(prompt, options.model, options);
            
            // Vykonaj POST request
            var response = httpClient.post(providerConfig.baseUrl, payload);
            
            if (response.statusCode >= 200 && response.statusCode < 300) {
                var aiResponse = providerConfig.parseResponse(response.body);
                
                if (debugEntry) {
                    addDebug(debugEntry, "✅ AI Response received (" + response.body.length + " chars)");
                    addDebug(debugEntry, "🔍 Response: " + aiResponse.substring(0, 200) + "...");
                }
                
                return {
                    success: true, 
                    response: aiResponse, 
                    error: null,
                    statusCode: response.statusCode,
                    provider: provider
                };
            } else {
                var error = "HTTP " + response.statusCode + ": " + response.body;
                if (debugEntry) addError(debugEntry, "AI Call HTTP error: " + error);
                return {success: false, error: error, response: null};
            }
            
        } catch (e) {
            var error = "AI Call exception: " + e.toString();
            if (debugEntry) addError(debugEntry, error);
            return {success: false, error: error, response: null};
        }
    }

    // ========================================
    // SPECIALIZED AI FUNCTIONS
    // ========================================

    /**
     * AI analýza dát zo záznamu
     * @param {Entry} sourceEntry - Záznam na analýzu
     * @param {Array} fieldsToAnalyze - Polia na analýzu
     * @param {string} analysisType - Typ analýzy ("summarize", "classify", "extract")
     * @param {Object} options - Nastavenia
     * @return {Object} Výsledok analýzy
     */
    function aiAnalyzeEntry(sourceEntry, fieldsToAnalyze, analysisType, options) {
        options = options || {};
        var provider = options.provider || "OpenAi";
        var debugEntry = options.debugEntry;
        
        if (!sourceEntry || !fieldsToAnalyze || fieldsToAnalyze.length === 0) {
            return {success: false, error: "Missing required parameters"};
        }
        
        try {
            // Priprav dáta pre analýzu
            var dataForAnalysis = {};
            for (var i = 0; i < fieldsToAnalyze.length; i++) {
                var fieldName = fieldsToAnalyze[i];
                var fieldValue = safeFieldAccess(sourceEntry, fieldName, "");
                if (fieldValue) {
                    dataForAnalysis[fieldName] = fieldValue.toString().substring(0, 1000); // Limit na 1000 chars
                }
            }
            
            // Priprav prompt podľa typu analýzy
            var prompt = "";
            var dataJson = JSON.stringify(dataForAnalysis, null, 2);
            
            switch(analysisType) {
                case "summarize":
                    prompt = "Analyzed následujúce dáta a vytvor stručné zhrnutie v slovenčine:\n\n" + dataJson;
                    break;
                case "classify":
                    prompt = "Analyzuj následujúce dáta a zaraď ich do vhodnej kategórie. Vráť len názov kategórie:\n\n" + dataJson;
                    break;
                case "extract":
                    prompt = "Z následujúcich dát extrahuj kľúčové informácie a vráť ich ako JSON:\n\n" + dataJson;
                    break;
                case "sentiment":
                    prompt = "Analyzuj sentiment následujúcich dát. Vráť: Pozitívny/Negatívny/Neutrálny:\n\n" + dataJson;
                    break;
                default:
                    prompt = options.customPrompt ? options.customPrompt + "\n\n" + dataJson : dataJson;
            }
            
            if (debugEntry) {
                addDebug(debugEntry, "🧠 AI Analysis: " + analysisType + " na " + fieldsToAnalyze.length + " poliach");
            }
            
            // Zavolaj AI
            var aiResult = callAI(provider, prompt, {
                model: options.model,
                maxTokens: options.maxTokens || 500,
                temperature: options.temperature || 0.3,
                debugEntry: debugEntry
            });
            
            if (aiResult.success) {
                return {
                    success: true,
                    analysis: aiResult.response,
                    analysisType: analysisType,
                    fieldsAnalyzed: fieldsToAnalyze,
                    provider: provider
                };
            } else {
                return aiResult;
            }
            
        } catch (e) {
            var error = "AI Analysis failed: " + e.toString();
            if (debugEntry) addError(debugEntry, error);
            return {success: false, error: error};
        }
    }

    /**
     * AI generovanie SQL dotazov z prirodzeného jazyka
     * @param {string} naturalLanguageQuery - Dotaz v prirodzenom jazyku
     * @param {Array} availableTables - Zoznam dostupných tabuliek/knižníc
     * @param {Object} options - Nastavenia
     * @return {Object} Výsledok s SQL dotazom
     */
    function aiGenerateSQL(naturalLanguageQuery, availableTables, options) {
        options = options || {};
        var provider = options.provider || "OpenAi";
        var debugEntry = options.debugEntry;
        
        if (!naturalLanguageQuery) {
            return {success: false, error: "Missing natural language query"};
        }
        
        try {
            var tablesInfo = availableTables ? availableTables.join(", ") : "všetky dostupné tabuľky";
            
            var prompt = `Vygeneruj SQL dotaz na základe tohto požiadavku v slovenčine: "${naturalLanguageQuery}"

    Dostupné tabuľky: ${tablesInfo}

    Pravidlá:
    - Vráť iba SQL dotaz bez dodatočného textu
    - Používaj SQLite syntax
    - Názvy tabuliek a stĺpcov používaj presne ako sú zadané
    - Pre slovenčinu používaj COLLATE NOCASE pre porovnávanie textu

    SQL dotaz:`;

            if (debugEntry) {
                addDebug(debugEntry, "🔍 AI SQL Generation: " + naturalLanguageQuery.substring(0, 100));
            }
            
            var aiResult = callAI(provider, prompt, {
                model: options.model,
                maxTokens: options.maxTokens || 300,
                temperature: 0.1, // Nízka temperatura pre presnosť
                debugEntry: debugEntry
            });
            
            if (aiResult.success) {
                // Vyčisti SQL dotaz
                var sqlQuery = aiResult.response
                    .replace(/```
                    .replace(/```/g, "")
                    .replace(/^SQL dotaz:/gi, "")
                    .trim();
                
                return {
                    success: true,
                    sqlQuery: sqlQuery,
                    originalQuery: naturalLanguageQuery,
                    provider: provider
                };
            } else {
                return aiResult;
            }
            
        } catch (e) {
            var error = "AI SQL Generation failed: " + e.toString();
            if (debugEntry) addError(debugEntry, error);
            return {success: false, error: error};
        }
    }

    // ========================================
    // ENHANCED SQL OPERATIONS
    // ========================================

    /**
     * Rozšírené SQL operácie s AI podporou
     * @param {string} query - SQL dotaz alebo prirodzený jazyk
     * @param {Object} options - Nastavenia
     * @return {Object} Výsledky dotazu
     */
    function smartSQL(query, options) {
        options = options || {};
        var debugEntry = options.debugEntry;
        var returnType = options.returnType || "objects";
        
        if (!query || query.trim() === "") {
            return {success: false, error: "Empty query"};
        }
        
        try {
            var finalQuery = query.trim();
            
            // Ak query nevyzerá ako SQL, použij AI na generovanie
            if (!finalQuery.toUpperCase().startsWith("SELECT") && 
                !finalQuery.toUpperCase().startsWith("UPDATE") && 
                !finalQuery.toUpperCase().startsWith("INSERT") && 
                !finalQuery.toUpperCase().startsWith("DELETE")) {
                
                if (debugEntry) {
                    addDebug(debugEntry, "🤖 Natural language detected, generating SQL...");
                }
                
                var aiSqlResult = aiGenerateSQL(query, options.availableTables, {
                    provider: options.aiProvider,
                    debugEntry: debugEntry
                });
                
                if (!aiSqlResult.success) {
                    return aiSqlResult;
                }
                
                finalQuery = aiSqlResult.sqlQuery;
                
                if (debugEntry) {
                    addDebug(debugEntry, "📝 Generated SQL: " + finalQuery);
                }
            }
            
            // Vykonaj SQL dotaz
            var sqlResult = sql(finalQuery);
            var data;
            
            switch(returnType.toLowerCase()) {
                case "objects":
                    data = sqlResult.asObjects();
                    break;
                case "entries":
                    data = sqlResult.asEntries();
                    break;
                case "int":
                case "number":
                    data = sqlResult.asInt();
                    break;
                case "string":
                    data = sqlResult.asString();
                    break;
                default:
                    data = sqlResult.asObjects();
            }
            
            if (debugEntry) {
                var resultCount = Array.isArray(data) ? data.length : (typeof data === "number" ? data : 1);
                addDebug(debugEntry, "✅ SQL executed successfully. Results: " + resultCount);
            }
            
            return {
                success: true,
                data: data,
                query: finalQuery,
                resultType: returnType
            };
            
        } catch (e) {
            var error = "Smart SQL failed: " + e.toString() + "\nQuery: " + finalQuery;
            if (debugEntry) addError(debugEntry, error);
            return {success: false, error: error, query: finalQuery};
        }
    }

    /**
     * SQL dotaz s AI interpretáciou výsledkov
     * @param {string} query - SQL dotaz
     * @param {string} interpretationPrompt - Ako interpretovať výsledky
     * @param {Object} options - Nastavenia
     */
    function sqlWithAIInterpretation(query, interpretationPrompt, options) {
        options = options || {};
        var debugEntry = options.debugEntry;
        
        // Vykonaj SQL dotaz
        var sqlResult = smartSQL(query, options);
        
        if (!sqlResult.success) {
            return sqlResult;
        }
        
        // AI interpretácia výsledkov
        var dataForAI = JSON.stringify(sqlResult.data, null, 2);
        var prompt = interpretationPrompt + "\n\nDáta z SQL dotazu:\n" + dataForAI;
        
        var aiResult = callAI(options.aiProvider || "OpenAi", prompt, {
            model: options.aiModel,
            maxTokens: options.maxTokens || 800,
            debugEntry: debugEntry
        });
        
        return {
            success: true,
            sqlData: sqlResult.data,
            sqlQuery: sqlResult.query,
            aiInterpretation: aiResult.success ? aiResult.response : "AI interpretation failed: " + aiResult.error,
            aiSuccess: aiResult.success
        };
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
        
        // AI Functions
        getApiKey: getApiKey,
        getCachedApiKey: getCachedApiKey,
        callAI: callAI,
        aiAnalyzeEntry: aiAnalyzeEntry,
        aiGenerateSQL: aiGenerateSQL,
        
        // Enhanced SQL
        smartSQL: smartSQL,
        sqlWithAIInterpretation: sqlWithAIInterpretation,
        
        // AI Provider Config
        AI_PROVIDERS: AI_PROVIDERS,
        // Konfigurácia
        DEFAULT_CONFIG: DEFAULT_CONFIG
    };
})();

// Export pre Memento
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MementoUtils;
}