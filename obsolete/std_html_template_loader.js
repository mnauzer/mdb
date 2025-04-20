/**
 * Memento Database - Načítavač HTML šablón
 * 
 * Tento skript umožňuje načítavať HTML šablóny zo samostatných súborov
 * a generovať HTML výstupy na základe údajov z Memento Database.
 * 
 * Autor: Cline
 * Verzia: 1.0
 * Dátum: 19.4.2025
 */

// Globálny objekt pre načítavač HTML šablón
var std = std || {};
std.HtmlTemplateLoader = {
    /**
     * Načíta HTML šablónu zo súboru a nahradí v nej premenné
     * @param {String} templatePath - Cesta k súboru so šablónou
     * @param {Object} data - Objekt s dátami na nahradenie v šablóne
     * @returns {String} HTML kód s nahradenými premennými
     */
    loadTemplate: function(templatePath, data) {
        try {
            // Načítanie šablóny zo súboru
            var f = file(templatePath);
            var template = f.readAll().join("\n");
            f.close();
            
            // Nahradenie premenných v šablóne
            return this._replaceVariables(template, data);
        } catch (e) {
            message("Chyba pri načítaní šablóny: " + e.message);
            return "";
        }
    },
    
    /**
     * Nahradí premenné v šablóne hodnotami z dátového objektu
     * @param {String} template - HTML šablóna s premennými
     * @param {Object} data - Objekt s dátami na nahradenie
     * @returns {String} HTML kód s nahradenými premennými
     * @private
     */
    _replaceVariables: function(template, data) {
        // Nahradenie jednoduchých premenných {{premenná}}
        var result = template.replace(/\{\{([^{}]+)\}\}/g, function(match, key) {
            var keys = key.trim().split('.');
            var value = data;
            
            // Podpora pre vnorené objekty (napr. {{customer.name}})
            for (var i = 0; i < keys.length; i++) {
                if (value === undefined || value === null) {
                    return '';
                }
                value = value[keys[i]];
            }
            
            return value !== undefined && value !== null ? value : '';
        });
        
        // Nahradenie podmienených blokov {{#if premenná}} obsah {{/if}}
        result = this._processConditionalBlocks(result, data);
        
        // Nahradenie cyklov {{#each premenná}} obsah {{/each}}
        result = this._processLoopBlocks(result, data);
        
        return result;
    },
    
    /**
     * Spracuje podmienené bloky v šablóne
     * @param {String} template - HTML šablóna s podmienkami
     * @param {Object} data - Objekt s dátami
     * @returns {String} HTML kód so spracovanými podmienkami
     * @private
     */
    _processConditionalBlocks: function(template, data) {
        var ifRegex = /\{\{#if\s+([^{}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
        var ifElseRegex = /\{\{#if\s+([^{}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
        
        // Spracovanie if-else blokov
        var result = template.replace(ifElseRegex, function(match, condition, ifContent, elseContent) {
            var keys = condition.trim().split('.');
            var value = data;
            
            for (var i = 0; i < keys.length; i++) {
                if (value === undefined || value === null) {
                    return elseContent;
                }
                value = value[keys[i]];
            }
            
            return value ? ifContent : elseContent;
        });
        
        // Spracovanie if blokov
        result = result.replace(ifRegex, function(match, condition, content) {
            var keys = condition.trim().split('.');
            var value = data;
            
            for (var i = 0; i < keys.length; i++) {
                if (value === undefined || value === null) {
                    return '';
                }
                value = value[keys[i]];
            }
            
            return value ? content : '';
        });
        
        return result;
    },
    
    /**
     * Spracuje cykly v šablóne
     * @param {String} template - HTML šablóna s cyklami
     * @param {Object} data - Objekt s dátami
     * @returns {String} HTML kód so spracovanými cyklami
     * @private
     */
    _processLoopBlocks: function(template, data) {
        var eachRegex = /\{\{#each\s+([^{}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
        
        return template.replace(eachRegex, function(match, arrayName, content) {
            var keys = arrayName.trim().split('.');
            var array = data;
            
            for (var i = 0; i < keys.length; i++) {
                if (array === undefined || array === null) {
                    return '';
                }
                array = array[keys[i]];
            }
            
            if (!Array.isArray(array)) {
                return '';
            }
            
            var result = '';
            for (var i = 0; i < array.length; i++) {
                var itemData = array[i];
                itemData.index = i;
                
                // Nahradenie premenných v obsahu cyklu
                var itemContent = content.replace(/\{\{([^{}]+)\}\}/g, function(match, key) {
                    if (key === 'this') {
                        return itemData;
                    }
                    
                    if (key === 'index') {
                        return i;
                    }
                    
                    var itemKeys = key.trim().split('.');
                    var value = itemData;
                    
                    for (var j = 0; j < itemKeys.length; j++) {
                        if (value === undefined || value === null) {
                            return '';
                        }
                        value = value[itemKeys[j]];
                    }
                    
                    return value !== undefined && value !== null ? value : '';
                });
                
                result += itemContent;
            }
            
            return result;
        });
    },
    
    /**
     * Uloží HTML výstup do súboru
     * @param {String} html - HTML kód na uloženie
     * @param {String} fileName - Názov súboru
     * @returns {Boolean} Úspech operácie
     */
    saveToFile: function(html, fileName) {
        try {
            var f = file(fileName);
            f.write(html);
            f.close();
            return true;
        } catch (e) {
            message("Chyba pri ukladaní súboru: " + e.message);
            return false;
        }
    },
    
    /**
     * Formátuje dátum do čitateľného formátu
     * @param {Date} date - Dátum na formátovanie
     * @returns {String} Formátovaný dátum
     */
    formatDate: function(date) {
        if (!date) return "";
        
        if (typeof date === 'string') {
            // Skúsime parsovať string ako dátum
            date = new Date(date);
        }
        
        if (isNaN(date.getTime())) {
            return "";
        }
        
        var day = date.getDate().toString().padStart(2, '0');
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var year = date.getFullYear();
        
        return day + "." + month + "." + year;
    }
};

// Funkcie pre generovanie rôznych typov dokumentov

/**
 * Generuje faktúru na základe údajov zo záznamu
 * @param {Object} entry - Záznam faktúry
 * @param {Object} options - Nastavenia výstupu
 * @returns {String} HTML kód faktúry
 */
function generateInvoice(entry, options) {
    options = options || {};
    
    // Príprava dát pre šablónu
    var data = {
        company: {
            name: options.companyName || "Vaša Spoločnosť",
            info: options.companyInfo || "IČO: 12345678, DIČ: 2023456789",
            address: options.companyAddress || "Hlavná 123, 831 01 Bratislava",
            contact: options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
            logo: options.logoUrl || ""
        },
        styles: {
            primaryColor: options.primaryColor || "#3498db",
            secondaryColor: options.secondaryColor || "#2c3e50"
        },
        invoice: {
            number: entry.field("Číslo faktúry"),
            issueDate: std.HtmlTemplateLoader.formatDate(entry.field("Dátum vystavenia")),
            taxDate: std.HtmlTemplateLoader.formatDate(entry.field("Dátum zdaniteľného plnenia")) || std.HtmlTemplateLoader.formatDate(entry.field("Dátum vystavenia")),
            dueDate: std.HtmlTemplateLoader.formatDate(entry.field("Dátum splatnosti")),
            paymentMethod: entry.field("Spôsob úhrady") || "Bankový prevod",
            currency: entry.field("Mena") || "EUR",
            totalAmount: entry.field("Celková suma"),
            notes: entry.field("Poznámky") || "",
            barcode: entry.field("Čiarový kód") || "",
            qrCode: generateQRCode(entry) || ""
        },
        customer: {
            name: entry.field("Zákazník"),
            address: entry.field("Adresa zákazníka"),
            info: entry.field("Info zákazníka") || ""
        },
        items: []
    };
    
    // Pridanie platobných údajov, ak sú k dispozícii
    if (entry.field("Banka") || entry.field("IBAN") || entry.field("SWIFT") || entry.field("Variabilný symbol")) {
        data.invoice.paymentInfo = {
            bank: entry.field("Banka") || "",
            iban: entry.field("IBAN") || "",
            swift: entry.field("SWIFT") || "",
            variableSymbol: entry.field("Variabilný symbol") || entry.field("Číslo faktúry") || "",
            constantSymbol: entry.field("Konštantný symbol") || "0308",
            specificSymbol: entry.field("Špecifický symbol") || ""
        };
    }
    
    // Spracovanie položiek faktúry
    var items = entry.field("Položky");
    var vatSummary = {};
    
    if (typeof items === 'string') {
        try {
            // Skúsime parsovať JSON
            var parsedItems = JSON.parse(items);
            data.items = processInvoiceItems(parsedItems, vatSummary, data.invoice.currency);
        } catch (e) {
            // Ak nie je validný JSON, skúsime to rozdeliť podľa riadkov
            var lineItems = items.split('\n');
            data.items = processInvoiceLineItems(lineItems, vatSummary, data.invoice.currency);
        }
    } else if (Array.isArray(items)) {
        data.items = processInvoiceItems(items, vatSummary, data.invoice.currency);
    }
    
    // Pridanie súhrnu DPH
    data.invoice.vatSummary = [];
    for (var rate in vatSummary) {
        data.invoice.vatSummary.push({
            rate: rate,
            base: formatCurrency(vatSummary[rate].base),
            amount: formatCurrency(vatSummary[rate].amount),
            total: formatCurrency(vatSummary[rate].total)
        });
    }
    
    // Načítanie šablóny a nahradenie premenných
    return std.HtmlTemplateLoader.loadTemplate("templates/invoice_template.html", data);
}

/**
 * Spracuje položky faktúry z JSON objektu
 * @param {Array} items - Položky faktúry
 * @param {Object} vatSummary - Objekt pre súhrn DPH
 * @param {String} currency - Mena
 * @returns {Array} Spracované položky faktúry
 * @private
 */
function processInvoiceItems(items, vatSummary, currency) {
    return items.map(function(item, index) {
        var quantity = parseFloat(item.quantity) || 1;
        var unitPriceWithoutVat = parseFloat(item.unitPriceWithoutVat) || 0;
        var vatRate = parseFloat(item.vatRate) || 20;
        var priceWithoutVat = quantity * unitPriceWithoutVat;
        var vatAmount = priceWithoutVat * (vatRate / 100);
        var total = priceWithoutVat + vatAmount;
        
        // Pridanie do súhrnu DPH
        if (!vatSummary[vatRate]) {
            vatSummary[vatRate] = { base: 0, amount: 0, total: 0 };
        }
        vatSummary[vatRate].base += priceWithoutVat;
        vatSummary[vatRate].amount += vatAmount;
        vatSummary[vatRate].total += total;
        
        return {
            index: index + 1,
            description: item.description || "",
            quantity: quantity,
            unit: item.unit || "ks",
            unitPriceWithoutVat: formatCurrency(unitPriceWithoutVat),
            vatRate: vatRate,
            priceWithoutVat: formatCurrency(priceWithoutVat),
            vatAmount: formatCurrency(vatAmount),
            total: formatCurrency(total)
        };
    });
}

/**
 * Spracuje položky faktúry z textových riadkov
 * @param {Array} lineItems - Riadky s položkami faktúry
 * @param {Object} vatSummary - Objekt pre súhrn DPH
 * @param {String} currency - Mena
 * @returns {Array} Spracované položky faktúry
 * @private
 */
function processInvoiceLineItems(lineItems, vatSummary, currency) {
    return lineItems.map(function(line, index) {
        var parts = line.split('|');
        var description = parts[0] || "";
        var quantity = parseFloat(parts[1]) || 1;
        var unit = parts[2] || "ks";
        var unitPriceWithoutVat = parseFloat(parts[3]) || 0;
        var vatRate = parseFloat(parts[4]) || 20;
        
        var priceWithoutVat = quantity * unitPriceWithoutVat;
        var vatAmount = priceWithoutVat * (vatRate / 100);
        var total = priceWithoutVat + vatAmount;
        
        // Pridanie do súhrnu DPH
        if (!vatSummary[vatRate]) {
            vatSummary[vatRate] = { base: 0, amount: 0, total: 0 };
        }
        vatSummary[vatRate].base += priceWithoutVat;
        vatSummary[vatRate].amount += vatAmount;
        vatSummary[vatRate].total += total;
        
        return {
            index: index + 1,
            description: description,
            quantity: quantity,
            unit: unit,
            unitPriceWithoutVat: formatCurrency(unitPriceWithoutVat),
            vatRate: vatRate,
            priceWithoutVat: formatCurrency(priceWithoutVat),
            vatAmount: formatCurrency(vatAmount),
            total: formatCurrency(total)
        };
    });
}

/**
 * Formátuje číslo ako menu
 * @param {Number} value - Hodnota na formátovanie
 * @returns {String} Formátovaná hodnota
 * @private
 */
function formatCurrency(value) {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Generuje QR kód pre platbu faktúry
 * @param {Object} entry - Záznam faktúry
 * @returns {String} URL k QR kódu alebo prázdny reťazec
 * @private
 */
function generateQRCode(entry) {
    // Kontrola, či máme všetky potrebné údaje pre QR kód
    if (!entry.field("IBAN") || !entry.field("Celková suma") || !entry.field("Variabilný symbol") && !entry.field("Číslo faktúry")) {
        return "";
    }
    
    var iban = entry.field("IBAN").replace(/\s+/g, "");
    var amount = parseFloat(entry.field("Celková suma")) || 0;
    var vs = entry.field("Variabilný symbol") || entry.field("Číslo faktúry") || "";
    var currency = entry.field("Mena") || "EUR";
    
    // Vytvorenie QR Pay kódu podľa slovenského štandardu
    // Formát: SPD*1.0*ACC:IBAN*AM:AMOUNT*CC:CURRENCY*X-VS:VS
    var qrPayData = "SPD*1.0*ACC:" + iban + "*AM:" + amount.toFixed(2) + "*CC:" + currency + "*X-VS:" + vs;
    
    // Použitie Google Chart API na generovanie QR kódu
    // Poznámka: V reálnom prostredí by bolo lepšie použiť lokálnu knižnicu alebo službu
    return "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=" + encodeURIComponent(qrPayData);
}

/**
 * Generuje cenovú ponuku na základe údajov zo záznamu
 * @param {Object} entry - Záznam cenovej ponuky
 * @param {Object} options - Nastavenia výstupu
 * @returns {String} HTML kód cenovej ponuky
 */
function generateQuote(entry, options) {
    options = options || {};
    
    // Príprava dát pre šablónu
    var data = {
        company: {
            name: options.companyName || "Vaša Spoločnosť",
            info: options.companyInfo || "IČO: 12345678, DIČ: 2023456789",
            address: options.companyAddress || "Hlavná 123, 831 01 Bratislava",
            contact: options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
            logo: options.logoUrl || ""
        },
        styles: {
            primaryColor: options.primaryColor || "#27ae60",
            secondaryColor: options.secondaryColor || "#2c3e50"
        },
        quote: {
            number: entry.field("Číslo ponuky"),
            issueDate: std.HtmlTemplateLoader.formatDate(entry.field("Dátum vystavenia")),
            validUntil: std.HtmlTemplateLoader.formatDate(entry.field("Platnosť do")),
            currency: entry.field("Mena") || "EUR",
            totalAmount: entry.field("Celková suma"),
            notes: entry.field("Poznámky") || ""
        },
        customer: {
            name: entry.field("Zákazník"),
            address: entry.field("Adresa zákazníka"),
            info: entry.field("Info zákazníka") || ""
        },
        items: []
    };
    
    // Spracovanie položiek cenovej ponuky
    var items = entry.field("Položky");
    if (typeof items === 'string') {
        try {
            data.items = JSON.parse(items);
        } catch (e) {
            // Ak nie je validný JSON, skúsime to rozdeliť podľa riadkov
            data.items = items.split('\n').map(function(line) {
                var parts = line.split('|');
                return {
                    description: parts[0] || "",
                    quantity: parts[1] || "",
                    unitPrice: parts[2] || "",
                    total: parts[3] || ""
                };
            });
        }
    } else if (Array.isArray(items)) {
        data.items = items;
    }
    
    // Načítanie šablóny a nahradenie premenných
    return std.HtmlTemplateLoader.loadTemplate("templates/quote_template.html", data);
}

/**
 * Generuje jednoduchú faktúru na základe údajov zo záznamu
 * @param {Object} entry - Záznam faktúry
 * @param {Object} options - Nastavenia výstupu
 * @returns {String} HTML kód jednoduchej faktúry
 */
function generateSimpleInvoice(entry, options) {
    options = options || {};
    
    // Výpočet základu DPH a DPH
    var totalAmount = parseFloat(entry.field("Celková suma")) || 0;
    var vatRate = parseFloat(entry.field("Sadzba DPH")) || 20;
    var baseAmount, vatAmount;
    
    if (entry.field("Cena bez DPH")) {
        baseAmount = parseFloat(entry.field("Cena bez DPH"));
        vatAmount = totalAmount - baseAmount;
    } else {
        // Ak nemáme cenu bez DPH, vypočítame ju z celkovej sumy
        baseAmount = totalAmount / (1 + (vatRate / 100));
        vatAmount = totalAmount - baseAmount;
    }
    
    // Príprava dát pre šablónu
    var data = {
        company: {
            name: options.companyName || "Vaša Spoločnosť",
            info: options.companyInfo || "IČO: 12345678, DIČ: 2023456789",
            address: options.companyAddress || "Hlavná 123, 831 01 Bratislava",
            contact: options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
            logo: options.logoUrl || ""
        },
        styles: {
            primaryColor: options.primaryColor || "#3498db",
            secondaryColor: options.secondaryColor || "#2c3e50"
        },
        invoice: {
            number: entry.field("Číslo faktúry"),
            issueDate: std.HtmlTemplateLoader.formatDate(entry.field("Dátum vystavenia")),
            taxDate: std.HtmlTemplateLoader.formatDate(entry.field("Dátum zdaniteľného plnenia")) || std.HtmlTemplateLoader.formatDate(entry.field("Dátum vystavenia")),
            dueDate: std.HtmlTemplateLoader.formatDate(entry.field("Dátum splatnosti")),
            paymentMethod: entry.field("Spôsob úhrady") || "Bankový prevod",
            currency: entry.field("Mena") || "EUR",
            totalAmount: formatCurrency(totalAmount),
            baseAmount: formatCurrency(baseAmount),
            vatAmount: formatCurrency(vatAmount),
            vatRate: vatRate,
            text: entry.field("Text faktúry") || "Faktúrujeme Vám služby podľa priloženého vyúčtovania.",
            notes: entry.field("Poznámky") || "",
            barcode: entry.field("Čiarový kód") || "",
            qrCode: generateQRCode(entry) || ""
        },
        customer: {
            name: entry.field("Zákazník"),
            address: entry.field("Adresa zákazníka"),
            info: entry.field("Info zákazníka") || ""
        }
    };
    
    // Pridanie platobných údajov, ak sú k dispozícii
    if (entry.field("Banka") || entry.field("IBAN") || entry.field("SWIFT") || entry.field("Variabilný symbol")) {
        data.invoice.paymentInfo = {
            bank: entry.field("Banka") || "",
            iban: entry.field("IBAN") || "",
            swift: entry.field("SWIFT") || "",
            variableSymbol: entry.field("Variabilný symbol") || entry.field("Číslo faktúry") || "",
            constantSymbol: entry.field("Konštantný symbol") || "0308",
            specificSymbol: entry.field("Špecifický symbol") || ""
        };
    }
    
    // Pridanie súhrnu DPH
    if (entry.field("Znížená sadzba DPH") && entry.field("Znížený základ DPH")) {
        var reducedVatRate = parseFloat(entry.field("Znížená sadzba DPH")) || 10;
        var reducedBaseAmount = parseFloat(entry.field("Znížený základ DPH")) || 0;
        var reducedVatAmount = reducedBaseAmount * (reducedVatRate / 100);
        var reducedTotal = reducedBaseAmount + reducedVatAmount;
        
        data.invoice.vatSummary = [
            {
                rate: vatRate,
                base: formatCurrency(baseAmount),
                amount: formatCurrency(vatAmount),
                total: formatCurrency(baseAmount + vatAmount)
            },
            {
                rate: reducedVatRate,
                base: formatCurrency(reducedBaseAmount),
                amount: formatCurrency(reducedVatAmount),
                total: formatCurrency(reducedTotal)
            }
        ];
    }
    
    // Načítanie šablóny a nahradenie premenných
    return std.HtmlTemplateLoader.loadTemplate("templates/simple_invoice_template.html", data);
}

/**
 * Generuje formulár na základe konfigurácie
 * @param {Object} formConfig - Konfigurácia formulára
 * @returns {String} HTML kód formulára
 */
function generateForm(formConfig) {
    // Príprava dát pre šablónu
    var data = {
        form: {
            title: formConfig.title || "Formulár",
            description: formConfig.description || "",
            submitUrl: formConfig.submitUrl || "#",
            submitMethod: formConfig.submitMethod || "POST",
            submitButtonText: formConfig.submitButtonText || "Odoslať",
            resetButton: formConfig.resetButton || false,
            resetButtonText: formConfig.resetButtonText || "Zrušiť",
            footerText: formConfig.footerText || "Tento formulár bol vygenerovaný automaticky."
        },
        styles: {
            primaryColor: formConfig.primaryColor || "#3498db",
            secondaryColor: formConfig.secondaryColor || "#2c3e50"
        },
        company: {
            logo: formConfig.logoUrl || ""
        },
        fields: formConfig.fields || []
    };
    
    // Načítanie šablóny a nahradenie premenných
    return std.HtmlTemplateLoader.loadTemplate("templates/form_template.html", data);
}

// Príklad použitia v akcii pre faktúru
function generateInvoiceHtmlAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png", // URL k logu
        primaryColor: "#3498db", // Modrá farba
        secondaryColor: "#2c3e50" // Tmavá farba
    };
    
    var html = generateInvoice(e, options);
    
    // Vytvorenie názvu súboru na základe čísla faktúry
    var fileName = "Faktura_" + e.field("Číslo faktúry").replace(/\//g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Faktúra bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}

// Príklad použitia v akcii pre cenovú ponuku
function generateQuoteHtmlAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png", // URL k logu
        primaryColor: "#27ae60", // Zelená farba
        secondaryColor: "#2c3e50" // Tmavá farba
    };
    
    var html = generateQuote(e, options);
    
    // Vytvorenie názvu súboru na základe čísla ponuky
    var fileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Cenová ponuka bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}

// Príklad použitia v akcii pre jednoduchú faktúru
function generateSimpleInvoiceHtmlAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png", // URL k logu
        primaryColor: "#3498db", // Modrá farba
        secondaryColor: "#2c3e50" // Tmavá farba
    };
    
    // Príklad textu faktúry
    e.set("Text faktúry", "Faktúrujeme Vám údržbu záhrady podľa priloženého vyúčtovania č." + e.field("Číslo vyúčtovania") + ".");
    
    // Pridanie platobných údajov
    e.set("Banka", "Slovenská sporiteľňa, a.s.");
    e.set("IBAN", "SK12 0900 0000 0001 2345 6789");
    e.set("SWIFT", "GIBASKBX");
    e.set("Variabilný symbol", e.field("Číslo faktúry"));
    
    var html = generateSimpleInvoice(e, options);
    
    // Vytvorenie názvu súboru na základe čísla faktúry
    var fileName = "Faktura_jednoducha_" + e.field("Číslo faktúry").replace(/\//g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Jednoduchá faktúra bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}

// Príklad použitia pre generovanie kontaktného formulára
function generateContactFormAction() {
    var formConfig = {
        title: "Kontaktný formulár",
        description: "Vyplňte nasledujúci formulár a my vás budeme kontaktovať",
        submitUrl: "https://example.com/submit-form",
        submitMethod: "POST",
        submitButtonText: "Odoslať správu",
        resetButton: true,
        resetButtonText: "Vymazať formulár",
        footerText: "Vaše údaje budú spracované v súlade s GDPR.",
        primaryColor: "#3498db",
        secondaryColor: "#2c3e50",
        logoUrl: "https://example.com/logo.png",
        fields: [
            {
                id: "name",
                type: "text",
                label: "Meno a priezvisko",
                placeholder: "Zadajte vaše meno a priezvisko",
                required: true
            },
            {
                id: "email",
                type: "email",
                label: "E-mailová adresa",
                placeholder: "vas@email.sk",
                required: true
            },
            {
                rowStart: true,
                column: true,
                id: "phone",
                type: "tel",
                label: "Telefónne číslo",
                placeholder: "+421 900 123 456"
            },
            {
                column: true,
                rowEnd: true,
                id: "company",
                type: "text",
                label: "Spoločnosť",
                placeholder: "Názov vašej spoločnosti"
            },
            {
                id: "subject",
                type: "select",
                label: "Predmet správy",
                placeholder: "Vyberte predmet",
                required: true,
                options: [
                    { value: "general", label: "Všeobecná otázka" },
                    { value: "support", label: "Technická podpora" },
                    { value: "billing", label: "Fakturácia" },
                    { value: "other", label: "Iné" }
                ]
            },
            {
                id: "message",
                type: "textarea",
                label: "Správa",
                placeholder: "Napíšte vašu správu...",
                required: true
            },
            {
                id: "services",
                type: "checkbox",
                label: "Služby, o ktoré máte záujem",
                options: [
                    { value: "web", label: "Webové stránky" },
                    { value: "app", label: "Mobilné aplikácie" },
                    { value: "design", label: "Grafický dizajn" },
                    { value: "marketing", label: "Online marketing" }
                ],
                helpText: "Môžete vybrať viacero možností"
            },
            {
                id: "contact_preference",
                type: "radio",
                label: "Preferovaný spôsob kontaktu",
                options: [
                    { value: "email", label: "E-mail" },
                    { value: "phone", label: "Telefón" }
                ],
                value: "email"
            },
            {
                id: "gdpr",
                type: "checkbox",
                label: "",
                options: [
                    { value: "agree", label: "Súhlasím so spracovaním osobných údajov" }
                ],
                required: true,
                helpText: "Tento súhlas je potrebný pre spracovanie vašej žiadosti"
            }
        ]
    };
    
    var html = generateForm(formConfig);
    
    // Vytvorenie názvu súboru
    var fileName = "Kontaktny_formular.html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Kontaktný formulár bol úspešne vygenerovaný a uložený ako " + fileName);
    }
}
