/**
 * Memento Database - Export HTML do rôznych formátov
 * 
 * Tento skript umožňuje exportovať HTML dokumenty do rôznych formátov
 * ako PDF a WEBP pomocou externých služieb.
 * 
 * Autor: Cline
 * Verzia: 1.0
 * Dátum: 19.4.2025
 */

// Globálny objekt pre export HTML
var std = std || {};
std.HtmlExport = {
    /**
     * Exportuje HTML do PDF formátu
     * @param {String} html - HTML kód na konverziu
     * @param {String} fileName - Názov výstupného súboru (bez prípony)
     * @param {Object} options - Nastavenia exportu
     * @returns {String} Cesta k vygenerovanému PDF súboru alebo prázdny reťazec v prípade chyby
     */
    toPdf: function(html, fileName, options) {
        options = options || {};
        
        try {
            // Nastavenia pre PDF
            var pdfOptions = {
                pageSize: options.pageSize || "A4",
                margin: options.margin || "10mm",
                landscape: options.landscape || false,
                headerTemplate: options.headerTemplate || "",
                footerTemplate: options.footerTemplate || "",
                displayHeaderFooter: options.displayHeaderFooter || false,
                printBackground: options.printBackground || true
            };
            
            // Uloženie HTML do dočasného súboru
            var tempHtmlFile = fileName + "_temp.html";
            var f = file(tempHtmlFile);
            f.write(html);
            f.close();
            
            // Cesta k výstupnému PDF súboru
            var pdfFile = fileName + ".pdf";
            
            // Konverzia HTML do PDF
            if (this._convertHtmlToPdf(tempHtmlFile, pdfFile, pdfOptions)) {
                // Odstránenie dočasného HTML súboru
                file(tempHtmlFile).remove();
                return pdfFile;
            } else {
                message("Chyba pri konverzii HTML do PDF.");
                return "";
            }
        } catch (e) {
            message("Chyba pri exporte do PDF: " + e.message);
            return "";
        }
    },
    
    /**
     * Exportuje HTML do WEBP formátu (obrázok)
     * @param {String} html - HTML kód na konverziu
     * @param {String} fileName - Názov výstupného súboru (bez prípony)
     * @param {Object} options - Nastavenia exportu
     * @returns {String} Cesta k vygenerovanému WEBP súboru alebo prázdny reťazec v prípade chyby
     */
    toWebp: function(html, fileName, options) {
        options = options || {};
        
        try {
            // Nastavenia pre WEBP
            var webpOptions = {
                quality: options.quality || 80,
                width: options.width || 1200,
                height: options.height || 1600,
                scale: options.scale || 1
            };
            
            // Uloženie HTML do dočasného súboru
            var tempHtmlFile = fileName + "_temp.html";
            var f = file(tempHtmlFile);
            f.write(html);
            f.close();
            
            // Cesta k výstupnému WEBP súboru
            var webpFile = fileName + ".webp";
            
            // Konverzia HTML do WEBP
            if (this._convertHtmlToWebp(tempHtmlFile, webpFile, webpOptions)) {
                // Odstránenie dočasného HTML súboru
                file(tempHtmlFile).remove();
                return webpFile;
            } else {
                message("Chyba pri konverzii HTML do WEBP.");
                return "";
            }
        } catch (e) {
            message("Chyba pri exporte do WEBP: " + e.message);
            return "";
        }
    },
    
    /**
     * Konvertuje HTML do PDF pomocou HTML2PDF API
     * @param {String} htmlFile - Cesta k HTML súboru
     * @param {String} pdfFile - Cesta k výstupnému PDF súboru
     * @param {Object} options - Nastavenia konverzie
     * @returns {Boolean} Úspech operácie
     * @private
     */
    _convertHtmlToPdf: function(htmlFile, pdfFile, options) {
        try {
            // Konfigurácia HTML2PDF API
            var apiKey = "YOUR_HTML2PDF_API_KEY"; // Nahraďte vlastným API kľúčom
            var apiUrl = "https://api.html2pdf.app/v1/generate";
            
            // Načítanie HTML súboru
            var htmlContent = file(htmlFile).readAll().join("\n");
            
            // Príprava dát pre API
            var requestData = {
                html: htmlContent,
                apiKey: apiKey,
                options: {
                    format: options.pageSize,
                    margin: options.margin,
                    landscape: options.landscape,
                    printBackground: options.printBackground,
                    displayHeaderFooter: options.displayHeaderFooter,
                    headerTemplate: options.headerTemplate,
                    footerTemplate: options.footerTemplate
                }
            };
            
            // Konverzia JSON objektu na string
            var requestBody = JSON.stringify(requestData);
            
            // Vytvorenie HTTP požiadavky
            var http = new XMLHttpRequest();
            http.open("POST", apiUrl, false); // Synchrónna požiadavka
            http.setRequestHeader("Content-Type", "application/json");
            http.setRequestHeader("Accept", "application/pdf");
            
            // Odoslanie požiadavky
            http.send(requestBody);
            
            // Spracovanie odpovede
            if (http.status === 200) {
                // Uloženie PDF súboru
                var f = file(pdfFile);
                f.write(http.responseText);
                f.close();
                
                message("PDF súbor bol úspešne vygenerovaný: " + pdfFile);
                return true;
            } else {
                // Spracovanie chyby
                var errorResponse;
                try {
                    errorResponse = JSON.parse(http.responseText);
                } catch (e) {
                    errorResponse = { error: "Neznáma chyba" };
                }
                
                message("Chyba pri generovaní PDF: " + (errorResponse.error || "Neznáma chyba"));
                return false;
            }
        } catch (e) {
            message("Chyba pri konverzii HTML do PDF: " + e.message);
            return false;
        }
    },
    
    /**
     * Konvertuje HTML do WEBP pomocou Screenshot API
     * @param {String} htmlFile - Cesta k HTML súboru
     * @param {String} webpFile - Cesta k výstupnému WEBP súboru
     * @param {Object} options - Nastavenia konverzie
     * @returns {Boolean} Úspech operácie
     * @private
     */
    _convertHtmlToWebp: function(htmlFile, webpFile, options) {
        try {
            // Konfigurácia Screenshot API
            var apiKey = "YOUR_SCREENSHOT_API_KEY"; // Nahraďte vlastným API kľúčom
            var apiUrl = "https://api.screenshotapi.net/capture";
            
            // Načítanie HTML súboru
            var htmlContent = file(htmlFile).readAll().join("\n");
            
            // Vytvorenie dočasného servera pre HTML obsah
            // Poznámka: V reálnom prostredí by ste potrebovali spôsob, ako sprístupniť HTML obsah cez URL
            // Toto je len príklad, v skutočnosti by ste museli implementovať vlastný server alebo použiť inú metódu
            
            // Pre účely demonštrácie použijeme priame odoslanie HTML obsahu do API
            var requestData = {
                html: htmlContent,
                apiKey: apiKey,
                output: "webp",
                width: options.width,
                height: options.height,
                scale: options.scale,
                quality: options.quality,
                fullPage: options.fullPage || true
            };
            
            // Konverzia JSON objektu na string
            var requestBody = JSON.stringify(requestData);
            
            // Vytvorenie HTTP požiadavky
            var http = new XMLHttpRequest();
            http.open("POST", apiUrl, false); // Synchrónna požiadavka
            http.setRequestHeader("Content-Type", "application/json");
            http.setRequestHeader("Accept", "image/webp");
            
            // Odoslanie požiadavky
            http.send(requestBody);
            
            // Spracovanie odpovede
            if (http.status === 200) {
                // Uloženie WEBP súboru
                var f = file(webpFile);
                f.write(http.responseText);
                f.close();
                
                message("WEBP súbor bol úspešne vygenerovaný: " + webpFile);
                return true;
            } else {
                // Spracovanie chyby
                var errorResponse;
                try {
                    errorResponse = JSON.parse(http.responseText);
                } catch (e) {
                    errorResponse = { error: "Neznáma chyba" };
                }
                
                message("Chyba pri generovaní WEBP: " + (errorResponse.error || "Neznáma chyba"));
                return false;
            }
        } catch (e) {
            message("Chyba pri konverzii HTML do WEBP: " + e.message);
            return false;
        }
    }
};

/**
 * Exportuje faktúru do rôznych formátov
 * @param {String} html - HTML kód faktúry
 * @param {String} baseFileName - Základný názov súboru (bez prípony)
 * @param {Array} formats - Formáty na export (html, pdf, webp)
 * @param {Object} options - Nastavenia exportu
 * @returns {Object} Objekt s cestami k vygenerovaným súborom
 */
function exportInvoice(html, baseFileName, formats, options) {
    options = options || {};
    formats = formats || ["html"];
    
    var result = {
        success: true,
        files: {}
    };
    
    try {
        // Export do HTML
        if (formats.indexOf("html") !== -1) {
            var htmlFile = baseFileName + ".html";
            var f = file(htmlFile);
            f.write(html);
            f.close();
            result.files.html = htmlFile;
        }
        
        // Export do PDF
        if (formats.indexOf("pdf") !== -1) {
            var pdfFile = std.HtmlExport.toPdf(html, baseFileName, options.pdf);
            if (pdfFile) {
                result.files.pdf = pdfFile;
            } else {
                result.success = false;
            }
        }
        
        // Export do WEBP
        if (formats.indexOf("webp") !== -1) {
            var webpFile = std.HtmlExport.toWebp(html, baseFileName, options.webp);
            if (webpFile) {
                result.files.webp = webpFile;
            } else {
                result.success = false;
            }
        }
        
        return result;
    } catch (e) {
        message("Chyba pri exporte faktúry: " + e.message);
        return {
            success: false,
            error: e.message,
            files: result.files
        };
    }
}

// Príklad použitia v akcii pre faktúru
function generateAndExportInvoiceAction() {
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
    
    // Generovanie HTML faktúry
    var html = generateInvoice(e, options);
    
    // Vytvorenie názvu súboru na základe čísla faktúry
    var baseFileName = "Faktura_" + e.field("Číslo faktúry").replace(/\//g, "_");
    
    // Export do rôznych formátov
    var exportOptions = {
        pdf: {
            pageSize: "A4",
            margin: "10mm",
            landscape: false,
            printBackground: true
        },
        webp: {
            quality: 90,
            width: 1200,
            height: 1600
        }
    };
    
    var result = exportInvoice(html, baseFileName, ["html", "pdf", "webp"], exportOptions);
    
    if (result.success) {
        var message = "Faktúra bola úspešne vygenerovaná a uložená v nasledujúcich formátoch:\n";
        for (var format in result.files) {
            message += "- " + format.toUpperCase() + ": " + result.files[format] + "\n";
        }
        message(message);
    } else {
        message("Nastala chyba pri exporte faktúry do niektorých formátov.");
    }
}

// Príklad použitia v akcii pre jednoduchú faktúru
function generateAndExportSimpleInvoiceAction() {
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
    
    // Nastavenie textu faktúry
    e.set("Text faktúry", "Faktúrujeme Vám údržbu záhrady podľa priloženého vyúčtovania č." + e.field("Číslo vyúčtovania") + ".");
    
    // Nastavenie údajov o DPH
    e.set("Celková suma", 120);
    e.set("Sadzba DPH", 20);
    e.set("Cena bez DPH", 100);
    
    // Nastavenie platobných údajov pre QR kód
    e.set("Banka", "Slovenská sporiteľňa, a.s.");
    e.set("IBAN", "SK12 0900 0000 0001 2345 6789");
    e.set("SWIFT", "GIBASKBX");
    e.set("Variabilný symbol", e.field("Číslo faktúry"));
    e.set("Konštantný symbol", "0308");
    
    // Generovanie HTML faktúry
    var html = generateSimpleInvoice(e, options);
    
    // Vytvorenie názvu súboru na základe čísla faktúry
    var baseFileName = "Faktura_jednoducha_" + e.field("Číslo faktúry").replace(/\//g, "_");
    
    // Export do rôznych formátov
    var exportOptions = {
        pdf: {
            pageSize: "A4",
            margin: "10mm",
            landscape: false,
            printBackground: true
        },
        webp: {
            quality: 90,
            width: 1200,
            height: 1600
        }
    };
    
    var result = exportInvoice(html, baseFileName, ["html", "pdf", "webp"], exportOptions);
    
    if (result.success) {
        var message = "Jednoduchá faktúra bola úspešne vygenerovaná a uložená v nasledujúcich formátoch:\n";
        for (var format in result.files) {
            message += "- " + format.toUpperCase() + ": " + result.files[format] + "\n";
        }
        message(message);
    } else {
        message("Nastala chyba pri exporte jednoduchej faktúry do niektorých formátov.");
    }
}

// Príklad použitia v akcii pre cenovú ponuku
function generateAndExportQuoteAction() {
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
    
    // Generovanie HTML cenovej ponuky
    var html = generateQuote(e, options);
    
    // Vytvorenie názvu súboru na základe čísla ponuky
    var baseFileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_");
    
    // Export do rôznych formátov
    var exportOptions = {
        pdf: {
            pageSize: "A4",
            margin: "10mm",
            landscape: false,
            printBackground: true
        },
        webp: {
            quality: 90,
            width: 1200,
            height: 1600
        }
    };
    
    var result = exportInvoice(html, baseFileName, ["html", "pdf", "webp"], exportOptions);
    
    if (result.success) {
        var message = "Cenová ponuka bola úspešne vygenerovaná a uložená v nasledujúcich formátoch:\n";
        for (var format in result.files) {
            message += "- " + format.toUpperCase() + ": " + result.files[format] + "\n";
        }
        message(message);
    } else {
        message("Nastala chyba pri exporte cenovej ponuky do niektorých formátov.");
    }
}

// Príklad použitia v akcii pre formulár
function generateAndExportFormAction() {
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
            // Ďalšie polia...
        ]
    };
    
    // Generovanie HTML formulára
    var html = generateForm(formConfig);
    
    // Vytvorenie názvu súboru
    var baseFileName = "Kontaktny_formular";
    
    // Export do rôznych formátov
    var exportOptions = {
        pdf: {
            pageSize: "A4",
            margin: "10mm",
            landscape: false,
            printBackground: true
        },
        webp: {
            quality: 90,
            width: 1200,
            height: 1600
        }
    };
    
    var result = exportInvoice(html, baseFileName, ["html", "pdf", "webp"], exportOptions);
    
    if (result.success) {
        var message = "Formulár bol úspešne vygenerovaný a uložený v nasledujúcich formátoch:\n";
        for (var format in result.files) {
            message += "- " + format.toUpperCase() + ": " + result.files[format] + "\n";
        }
        message(message);
    } else {
        message("Nastala chyba pri exporte formulára do niektorých formátov.");
    }
}
