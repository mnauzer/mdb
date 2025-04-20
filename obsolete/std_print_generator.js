/**
 * Memento Database - Generátor tlačových výstupov
 * 
 * Tento skript umožňuje generovať tlačové výstupy v Markdown formáte
 * z údajov v Memento Database. Výstupy môžu byť použité na tlač
 * cenových ponúk, vyúčtovaní, faktúr a iných dokumentov.
 * 
 * Autor: Cline
 * Verzia: 1.0
 * Dátum: 19.4.2025
 */

// Globálny objekt pre generátor tlačových výstupov
var std = std || {};
std.PrintGenerator = {
    /**
     * Generuje Markdown výstup pre faktúru
     * @param {Object} entry - Záznam faktúry
     * @param {Object} options - Nastavenia výstupu
     * @returns {String} Markdown text faktúry
     */
    generateInvoice: function(entry, options) {
        options = options || {};
        
        var companyName = options.companyName || "Vaša Spoločnosť";
        var companyInfo = options.companyInfo || "IČO: 12345678, DIČ: 2023456789";
        var companyAddress = options.companyAddress || "Hlavná 123, 831 01 Bratislava";
        var companyContact = options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk";
        var logoUrl = options.logoUrl || "";
        
        var invoiceNumber = entry.field("Číslo faktúry");
        var issueDate = this._formatDate(entry.field("Dátum vystavenia"));
        var dueDate = this._formatDate(entry.field("Dátum splatnosti"));
        var customerName = entry.field("Zákazník");
        var customerAddress = entry.field("Adresa zákazníka");
        var customerInfo = entry.field("Info zákazníka") || "";
        
        var items = entry.field("Položky");
        var totalAmount = entry.field("Celková suma");
        var currency = entry.field("Mena") || "EUR";
        var notes = entry.field("Poznámky") || "";
        
        // Začiatok Markdown dokumentu
        var md = "";
        
        // Hlavička s logom (ak je k dispozícii)
        if (logoUrl) {
            md += "![Logo](" + logoUrl + ")\n\n";
        }
        
        // Hlavička dokumentu
        md += "# FAKTÚRA č. " + invoiceNumber + "\n\n";
        
        // Informácie o spoločnosti a zákazníkovi v dvoch stĺpcoch
        md += "<div style='display: flex; justify-content: space-between;'>\n";
        
        // Ľavý stĺpec - dodávateľ
        md += "<div style='width: 48%;'>\n";
        md += "## Dodávateľ\n\n";
        md += "**" + companyName + "**  \n";
        md += companyAddress + "  \n";
        md += companyInfo + "  \n";
        md += companyContact + "\n";
        md += "</div>\n";
        
        // Pravý stĺpec - odberateľ
        md += "<div style='width: 48%;'>\n";
        md += "## Odberateľ\n\n";
        md += "**" + customerName + "**  \n";
        md += customerAddress + "  \n";
        md += customerInfo + "\n";
        md += "</div>\n";
        
        md += "</div>\n\n";
        
        // Informácie o faktúre
        md += "## Informácie o faktúre\n\n";
        md += "| Dátum vystavenia | Dátum splatnosti |\n";
        md += "|------------------|------------------|\n";
        md += "| " + issueDate + " | " + dueDate + " |\n\n";
        
        // Položky faktúry
        md += "## Položky faktúry\n\n";
        md += "| P.č. | Popis | Množstvo | Jednotková cena | Celkom |\n";
        md += "|------|-------|----------|-----------------|--------|\n";
        
        // Pridanie položiek
        var itemsArray = [];
        if (typeof items === 'string') {
            // Ak sú položky uložené ako JSON string
            try {
                itemsArray = JSON.parse(items);
            } catch (e) {
                // Ak nie je validný JSON, skúsime to rozdeliť podľa riadkov
                itemsArray = items.split('\n').map(function(line) {
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
            // Ak sú položky už pole objektov
            itemsArray = items;
        }
        
        // Pridanie položiek do tabuľky
        for (var i = 0; i < itemsArray.length; i++) {
            var item = itemsArray[i];
            md += "| " + (i+1) + " | " + item.description + " | " + item.quantity + " | " + 
                  item.unitPrice + " " + currency + " | " + item.total + " " + currency + " |\n";
        }
        
        // Súhrn
        md += "\n## Súhrn\n\n";
        md += "**Celková suma: " + totalAmount + " " + currency + "**\n\n";
        
        // Poznámky
        if (notes) {
            md += "## Poznámky\n\n";
            md += notes + "\n\n";
        }
        
        // Pätička
        md += "---\n\n";
        md += "*Ďakujeme za Vašu dôveru. Tento dokument bol vygenerovaný automaticky a je platný bez podpisu.*\n\n";
        
        return md;
    },
    
    /**
     * Generuje Markdown výstup pre cenovú ponuku
     * @param {Object} entry - Záznam cenovej ponuky
     * @param {Object} options - Nastavenia výstupu
     * @returns {String} Markdown text cenovej ponuky
     */
    generateQuote: function(entry, options) {
        options = options || {};
        
        var companyName = options.companyName || "Vaša Spoločnosť";
        var companyInfo = options.companyInfo || "IČO: 12345678, DIČ: 2023456789";
        var companyAddress = options.companyAddress || "Hlavná 123, 831 01 Bratislava";
        var companyContact = options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk";
        var logoUrl = options.logoUrl || "";
        
        var quoteNumber = entry.field("Číslo ponuky");
        var issueDate = this._formatDate(entry.field("Dátum vystavenia"));
        var validUntil = this._formatDate(entry.field("Platnosť do"));
        var customerName = entry.field("Zákazník");
        var customerAddress = entry.field("Adresa zákazníka");
        var customerInfo = entry.field("Info zákazníka") || "";
        
        var items = entry.field("Položky");
        var totalAmount = entry.field("Celková suma");
        var currency = entry.field("Mena") || "EUR";
        var notes = entry.field("Poznámky") || "";
        
        // Začiatok Markdown dokumentu
        var md = "";
        
        // Hlavička s logom (ak je k dispozícii)
        if (logoUrl) {
            md += "![Logo](" + logoUrl + ")\n\n";
        }
        
        // Hlavička dokumentu
        md += "# CENOVÁ PONUKA č. " + quoteNumber + "\n\n";
        
        // Informácie o spoločnosti a zákazníkovi v dvoch stĺpcoch
        md += "<div style='display: flex; justify-content: space-between;'>\n";
        
        // Ľavý stĺpec - dodávateľ
        md += "<div style='width: 48%;'>\n";
        md += "## Dodávateľ\n\n";
        md += "**" + companyName + "**  \n";
        md += companyAddress + "  \n";
        md += companyInfo + "  \n";
        md += companyContact + "\n";
        md += "</div>\n";
        
        // Pravý stĺpec - odberateľ
        md += "<div style='width: 48%;'>\n";
        md += "## Odberateľ\n\n";
        md += "**" + customerName + "**  \n";
        md += customerAddress + "  \n";
        md += customerInfo + "\n";
        md += "</div>\n";
        
        md += "</div>\n\n";
        
        // Informácie o ponuke
        md += "## Informácie o ponuke\n\n";
        md += "| Dátum vystavenia | Platnosť do |\n";
        md += "|------------------|------------|\n";
        md += "| " + issueDate + " | " + validUntil + " |\n\n";
        
        // Položky ponuky
        md += "## Položky ponuky\n\n";
        md += "| P.č. | Popis | Množstvo | Jednotková cena | Celkom |\n";
        md += "|------|-------|----------|-----------------|--------|\n";
        
        // Pridanie položiek
        var itemsArray = [];
        if (typeof items === 'string') {
            // Ak sú položky uložené ako JSON string
            try {
                itemsArray = JSON.parse(items);
            } catch (e) {
                // Ak nie je validný JSON, skúsime to rozdeliť podľa riadkov
                itemsArray = items.split('\n').map(function(line) {
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
            // Ak sú položky už pole objektov
            itemsArray = items;
        }
        
        // Pridanie položiek do tabuľky
        for (var i = 0; i < itemsArray.length; i++) {
            var item = itemsArray[i];
            md += "| " + (i+1) + " | " + item.description + " | " + item.quantity + " | " + 
                  item.unitPrice + " " + currency + " | " + item.total + " " + currency + " |\n";
        }
        
        // Súhrn
        md += "\n## Súhrn\n\n";
        md += "**Celková suma: " + totalAmount + " " + currency + "**\n\n";
        
        // Poznámky
        if (notes) {
            md += "## Poznámky\n\n";
            md += notes + "\n\n";
        }
        
        // Pätička
        md += "---\n\n";
        md += "*Táto cenová ponuka je platná do " + validUntil + ". Dokument bol vygenerovaný automaticky a je platný bez podpisu.*\n\n";
        
        return md;
    },
    
    /**
     * Generuje Markdown výstup pre vyúčtovanie
     * @param {Object} entry - Záznam vyúčtovania
     * @param {Object} options - Nastavenia výstupu
     * @returns {String} Markdown text vyúčtovania
     */
    generateStatement: function(entry, options) {
        options = options || {};
        
        var companyName = options.companyName || "Vaša Spoločnosť";
        var companyInfo = options.companyInfo || "IČO: 12345678, DIČ: 2023456789";
        var companyAddress = options.companyAddress || "Hlavná 123, 831 01 Bratislava";
        var companyContact = options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk";
        var logoUrl = options.logoUrl || "";
        
        var statementNumber = entry.field("Číslo vyúčtovania");
        var issueDate = this._formatDate(entry.field("Dátum vystavenia"));
        var periodStart = this._formatDate(entry.field("Obdobie od"));
        var periodEnd = this._formatDate(entry.field("Obdobie do"));
        var customerName = entry.field("Zákazník");
        var customerAddress = entry.field("Adresa zákazníka");
        var customerInfo = entry.field("Info zákazníka") || "";
        
        var items = entry.field("Položky");
        var totalAmount = entry.field("Celková suma");
        var currency = entry.field("Mena") || "EUR";
        var notes = entry.field("Poznámky") || "";
        
        // Začiatok Markdown dokumentu
        var md = "";
        
        // Hlavička s logom (ak je k dispozícii)
        if (logoUrl) {
            md += "![Logo](" + logoUrl + ")\n\n";
        }
        
        // Hlavička dokumentu
        md += "# VYÚČTOVANIE č. " + statementNumber + "\n\n";
        
        // Informácie o spoločnosti a zákazníkovi v dvoch stĺpcoch
        md += "<div style='display: flex; justify-content: space-between;'>\n";
        
        // Ľavý stĺpec - dodávateľ
        md += "<div style='width: 48%;'>\n";
        md += "## Dodávateľ\n\n";
        md += "**" + companyName + "**  \n";
        md += companyAddress + "  \n";
        md += companyInfo + "  \n";
        md += companyContact + "\n";
        md += "</div>\n";
        
        // Pravý stĺpec - odberateľ
        md += "<div style='width: 48%;'>\n";
        md += "## Odberateľ\n\n";
        md += "**" + customerName + "**  \n";
        md += customerAddress + "  \n";
        md += customerInfo + "\n";
        md += "</div>\n";
        
        md += "</div>\n\n";
        
        // Informácie o vyúčtovaní
        md += "## Informácie o vyúčtovaní\n\n";
        md += "| Dátum vystavenia | Obdobie od | Obdobie do |\n";
        md += "|------------------|------------|------------|\n";
        md += "| " + issueDate + " | " + periodStart + " | " + periodEnd + " |\n\n";
        
        // Položky vyúčtovania
        md += "## Položky vyúčtovania\n\n";
        md += "| P.č. | Popis | Množstvo | Jednotková cena | Celkom |\n";
        md += "|------|-------|----------|-----------------|--------|\n";
        
        // Pridanie položiek
        var itemsArray = [];
        if (typeof items === 'string') {
            // Ak sú položky uložené ako JSON string
            try {
                itemsArray = JSON.parse(items);
            } catch (e) {
                // Ak nie je validný JSON, skúsime to rozdeliť podľa riadkov
                itemsArray = items.split('\n').map(function(line) {
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
            // Ak sú položky už pole objektov
            itemsArray = items;
        }
        
        // Pridanie položiek do tabuľky
        for (var i = 0; i < itemsArray.length; i++) {
            var item = itemsArray[i];
            md += "| " + (i+1) + " | " + item.description + " | " + item.quantity + " | " + 
                  item.unitPrice + " " + currency + " | " + item.total + " " + currency + " |\n";
        }
        
        // Súhrn
        md += "\n## Súhrn\n\n";
        md += "**Celková suma: " + totalAmount + " " + currency + "**\n\n";
        
        // Poznámky
        if (notes) {
            md += "## Poznámky\n\n";
            md += notes + "\n\n";
        }
        
        // Pätička
        md += "---\n\n";
        md += "*Tento dokument bol vygenerovaný automaticky a je platný bez podpisu.*\n\n";
        
        return md;
    },
    
    /**
     * Uloží Markdown výstup do súboru
     * @param {String} markdown - Markdown text na uloženie
     * @param {String} fileName - Názov súboru
     * @returns {Boolean} Úspech operácie
     */
    saveToFile: function(markdown, fileName) {
        try {
            var f = file(fileName);
            f.write(markdown);
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
     * @private
     */
    _formatDate: function(date) {
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

// Príklad použitia v akcii pre faktúru
function generateInvoiceAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png" // URL k logu
    };
    
    var markdown = std.PrintGenerator.generateInvoice(e, options);
    
    // Vytvorenie názvu súboru na základe čísla faktúry
    var fileName = "Faktura_" + e.field("Číslo faktúry").replace(/\//g, "_") + ".md";
    
    if (std.PrintGenerator.saveToFile(fileName, markdown)) {
        message("Faktúra bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}

// Príklad použitia v akcii pre cenovú ponuku
function generateQuoteAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png" // URL k logu
    };
    
    var markdown = std.PrintGenerator.generateQuote(e, options);
    
    // Vytvorenie názvu súboru na základe čísla ponuky
    var fileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_") + ".md";
    
    if (std.PrintGenerator.saveToFile(fileName, markdown)) {
        message("Cenová ponuka bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}

// Príklad použitia v akcii pre vyúčtovanie
function generateStatementAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png" // URL k logu
    };
    
    var markdown = std.PrintGenerator.generateStatement(e, options);
    
    // Vytvorenie názvu súboru na základe čísla vyúčtovania
    var fileName = "Vyuctovanie_" + e.field("Číslo vyúčtovania").replace(/\//g, "_") + ".md";
    
    if (std.PrintGenerator.saveToFile(fileName, markdown)) {
        message("Vyúčtovanie bolo úspešne vygenerované a uložené ako " + fileName);
    }
}
