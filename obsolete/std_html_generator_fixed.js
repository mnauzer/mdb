/**
 * Memento Database - Generátor HTML formulárov
 * 
 * Tento skript umožňuje generovať HTML formuláre a dokumenty
 * z údajov v Memento Database. Výstupy majú moderný dizajn
 * a sú vhodné na tlač alebo zobrazenie v prehliadači.
 * 
 * Autor: Cline
 * Verzia: 1.0
 * Dátum: 19.4.2025
 */

// Globálny objekt pre generátor HTML formulárov
var std = std || {};
std.HtmlGenerator = {
    /**
     * Generuje HTML faktúru s moderným dizajnom
     * @param {Object} entry - Záznam faktúry
     * @param {Object} options - Nastavenia výstupu
     * @returns {String} HTML kód faktúry
     */
    generateInvoice: function(entry, options) {
        options = options || {};
        
        var companyName = options.companyName || "Vaša Spoločnosť";
        var companyInfo = options.companyInfo || "IČO: 12345678, DIČ: 2023456789";
        var companyAddress = options.companyAddress || "Hlavná 123, 831 01 Bratislava";
        var companyContact = options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk";
        var logoUrl = options.logoUrl || "";
        var primaryColor = options.primaryColor || "#3498db";
        var secondaryColor = options.secondaryColor || "#2c3e50";
        
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
        
        // Začiatok HTML dokumentu
        var html = `<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Faktúra č. ${invoiceNumber}</title>
    <style>
        :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            --light-gray: #f8f9fa;
            --medium-gray: #e9ecef;
            --dark-gray: #343a40;
            --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: #333;
            background-color: #fff;
            margin: 0;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            border: 1px solid var(--medium-gray);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            background-color: #fff;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--primary-color);
        }
        
        .logo {
            max-width: 200px;
            max-height: 80px;
        }
        
        .invoice-title {
            color: var(--secondary-color);
            font-size: 28px;
            font-weight: bold;
            text-align: right;
        }
        
        .invoice-number {
            color: var(--primary-color);
            font-size: 18px;
            margin-top: 5px;
        }
        
        .invoice-parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .invoice-party {
            width: 48%;
        }
        
        .party-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--secondary-color);
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--medium-gray);
        }
        
        .party-name {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .invoice-info {
            background-color: var(--light-gray);
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
        }
        
        .info-label {
            font-weight: bold;
            color: var(--secondary-color);
        }
        
        .invoice-items {
            margin-bottom: 30px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background-color: var(--primary-color);
            color: white;
            text-align: left;
            padding: 10px;
        }
        
        td {
            padding: 10px;
            border-bottom: 1px solid var(--medium-gray);
        }
        
        tr:nth-child(even) {
            background-color: var(--light-gray);
        }
        
        .text-right {
            text-align: right;
        }
        
        .invoice-summary {
            margin-top: 20px;
            text-align: right;
        }
        
        .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: var(--secondary-color);
            padding: 10px 0;
            border-top: 2px solid var(--primary-color);
        }
        
        .invoice-notes {
            margin-top: 30px;
            padding: 15px;
            background-color: var(--light-gray);
            border-radius: 5px;
        }
        
        .notes-title {
            font-weight: bold;
            color: var(--secondary-color);
            margin-bottom: 10px;
        }
        
        .invoice-footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--medium-gray);
            text-align: center;
            font-size: 14px;
            color: var(--dark-gray);
        }
        
        @media print {
            body {
                padding: 0;
                background-color: #fff;
            }
            
            .invoice-container {
                box-shadow: none;
                border: none;
                padding: 10px;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">`;
        
        // Logo (ak je k dispozícii)
        if (logoUrl) {
            html += `
            <div>
                <img src="${logoUrl}" alt="Logo" class="logo">
            </div>`;
        } else {
            html += `
            <div>
                <h2 style="color: var(--primary-color);">${companyName}</h2>
            </div>`;
        }
        
        html += `
            <div>
                <div class="invoice-title">FAKTÚRA</div>
                <div class="invoice-number">č. ${invoiceNumber}</div>
            </div>
        </div>
        
        <div class="invoice-parties">
            <div class="invoice-party">
                <div class="party-title">DODÁVATEĽ</div>
                <div class="party-name">${companyName}</div>
                <div>${companyAddress}</div>
                <div>${companyInfo}</div>
                <div>${companyContact}</div>
            </div>
            
            <div class="invoice-party">
                <div class="party-title">ODBERATEĽ</div>
                <div class="party-name">${customerName}</div>
                <div>${customerAddress}</div>
                <div>${customerInfo}</div>
            </div>
        </div>
        
        <div class="invoice-info">
            <div class="info-row">
                <div><span class="info-label">Dátum vystavenia:</span> ${issueDate}</div>
                <div><span class="info-label">Dátum splatnosti:</span> ${dueDate}</div>
            </div>
        </div>
        
        <div class="invoice-items">
            <table>
                <thead>
                    <tr>
                        <th>P.č.</th>
                        <th>Popis</th>
                        <th>Množstvo</th>
                        <th>Jednotková cena</th>
                        <th>Celkom</th>
                    </tr>
                </thead>
                <tbody>`;
        
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
            html += `
                <tr>
                    <td>${i+1}</td>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td class="text-right">${item.unitPrice} ${currency}</td>
                    <td class="text-right">${item.total} ${currency}</td>
                </tr>`;
        }
        
        html += `
                </tbody>
            </table>
            
            <div class="invoice-summary">
                <div class="total-amount">Celková suma: ${totalAmount} ${currency}</div>
            </div>
        </div>`;
        
        // Poznámky
        if (notes) {
            html += `
        <div class="invoice-notes">
            <div class="notes-title">Poznámky</div>
            <div>${notes.replace(/\n/g, '<br>')}</div>
        </div>`;
        }
        
        // Pätička
        html += `
        <div class="invoice-footer">
            <p>Ďakujeme za Vašu dôveru. Tento dokument bol vygenerovaný automaticky a je platný bez podpisu.</p>
        </div>
    </div>
</body>
</html>`;
        
        return html;
    },
    
    /**
     * Generuje HTML cenovú ponuku s moderným dizajnom
     * @param {Object} entry - Záznam cenovej ponuky
     * @param {Object} options - Nastavenia výstupu
     * @returns {String} HTML kód cenovej ponuky
     */
    generateQuote: function(entry, options) {
        options = options || {};
        
        var companyName = options.companyName || "Vaša Spoločnosť";
        var companyInfo = options.companyInfo || "IČO: 12345678, DIČ: 2023456789";
        var companyAddress = options.companyAddress || "Hlavná 123, 831 01 Bratislava";
        var companyContact = options.companyContact || "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk";
        var logoUrl = options.logoUrl || "";
        var primaryColor = options.primaryColor || "#27ae60";
        var secondaryColor = options.secondaryColor || "#2c3e50";
        
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
        
        // Začiatok HTML dokumentu
        var html = `<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cenová ponuka č. ${quoteNumber}</title>
    <style>
        :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            --light-gray: #f8f9fa;
            --medium-gray: #e9ecef;
            --dark-gray: #343a40;
            --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: #333;
            background-color: #fff;
            margin: 0;
            padding: 20px;
        }
        
        .quote-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            border: 1px solid var(--medium-gray);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            background-color: #fff;
        }
        
        .quote-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--primary-color);
        }
        
        .logo {
            max-width: 200px;
            max-height: 80px;
        }
        
        .quote-title {
            color: var(--secondary-color);
            font-size: 28px;
            font-weight: bold;
            text-align: right;
        }
        
        .quote-number {
            color: var(--primary-color);
            font-size: 18px;
            margin-top: 5px;
        }
        
        .quote-parties {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .quote-party {
            width: 48%;
        }
        
        .party-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--secondary-color);
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid var(--medium-gray);
        }
        
        .party-name {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .quote-info {
            background-color: var(--light-gray);
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
        }
        
        .info-label {
            font-weight: bold;
            color: var(--secondary-color);
        }
        
        .quote-items {
            margin-bottom: 30px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background-color: var(--primary-color);
            color: white;
            text-align: left;
            padding: 10px;
        }
        
        td {
            padding: 10px;
            border-bottom: 1px solid var(--medium-gray);
        }
        
        tr:nth-child(even) {
            background-color: var(--light-gray);
        }
        
        .text-right {
            text-align: right;
        }
        
        .quote-summary {
            margin-top: 20px;
            text-align: right;
        }
        
        .total-amount {
            font-size: 20px;
            font-weight: bold;
            color: var(--secondary-color);
            padding: 10px 0;
            border-top: 2px solid var(--primary-color);
        }
        
        .quote-notes {
            margin-top: 30px;
            padding: 15px;
            background-color: var(--light-gray);
            border-radius: 5px;
        }
        
        .notes-title {
            font-weight: bold;
            color: var(--secondary-color);
            margin-bottom: 10px;
        }
        
        .quote-footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--medium-gray);
            text-align: center;
            font-size: 14px;
            color: var(--dark-gray);
        }
        
        .validity {
            font-weight: bold;
            color: var(--primary-color);
        }
        
        @media print {
            body {
                padding: 0;
                background-color: #fff;
            }
            
            .quote-container {
                box-shadow: none;
                border: none;
                padding: 10px;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="quote-container">
        <div class="quote-header">`;
        
        // Logo (ak je k dispozícii)
        if (logoUrl) {
            html += `
            <div>
                <img src="${logoUrl}" alt="Logo" class="logo">
            </div>`;
        } else {
            html += `
            <div>
                <h2 style="color: var(--primary-color);">${companyName}</h2>
            </div>`;
        }
        
        html += `
            <div>
                <div class="quote-title">CENOVÁ PONUKA</div>
                <div class="quote-number">č. ${quoteNumber}</div>
            </div>
        </div>
        
        <div class="quote-parties">
            <div class="quote-party">
                <div class="party-title">DODÁVATEĽ</div>
                <div class="party-name">${companyName}</div>
                <div>${companyAddress}</div>
                <div>${companyInfo}</div>
                <div>${companyContact}</div>
            </div>
            
            <div class="quote-party">
                <div class="party-title">ODBERATEĽ</div>
                <div class="party-name">${customerName}</div>
                <div>${customerAddress}</div>
                <div>${customerInfo}</div>
            </div>
        </div>
        
        <div class="quote-info">
            <div class="info-row">
                <div><span class="info-label">Dátum vystavenia:</span> ${issueDate}</div>
                <div><span class="info-label">Platnosť do:</span> ${validUntil}</div>
            </div>
        </div>
        
        <div class="quote-items">
            <table>
                <thead>
                    <tr>
                        <th>P.č.</th>
                        <th>Popis</th>
                        <th>Množstvo</th>
                        <th>Jednotková cena</th>
                        <th>Celkom</th>
                    </tr>
                </thead>
                <tbody>`;
        
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
            html += `
                <tr>
                    <td>${i+1}</td>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td class="text-right">${item.unitPrice} ${currency}</td>
                    <td class="text-right">${item.total} ${currency}</td>
                </tr>`;
        }
        
        html += `
                </tbody>
            </table>
            
            <div class="quote-summary">
                <div class="total-amount">Celková suma: ${totalAmount} ${currency}</div>
            </div>
        </div>`;
        
        // Poznámky
        if (notes) {
            html += `
        <div class="quote-notes">
            <div class="notes-title">Poznámky</div>
            <div>${notes.replace(/\n/g, '<br>')}</div>
        </div>`;
        }
        
        // Pätička
        html += `
        <div class="quote-footer">
            <p class="validity">Táto cenová ponuka je platná do ${validUntil}.</p>
            <p>Tento dokument bol vygenerovaný automaticky a je platný bez podpisu.</p>
        </div>
    </div>
</body>
</html>`;
        
        return html;
    },
    
    /**
     * Generuje HTML formulár s moderným dizajnom
     * @param {Object} formConfig - Konfigurácia formulára
     * @returns {String} HTML kód formulára
     */
    generateForm: function(formConfig) {
        var title = formConfig.title || "Formulár";
        var description = formConfig.description || "";
        var submitUrl = formConfig.submitUrl || "#";
        var submitMethod = formConfig.submitMethod || "POST";
        var submitButtonText = formConfig.submitButtonText || "Odoslať";
        var fields = formConfig.fields || [];
        var primaryColor = formConfig.primaryColor || "#3498db";
        var secondaryColor = formConfig.secondaryColor || "#2c3e50";
        var logoUrl = formConfig.logoUrl || "";
        
        // Začiatok HTML dokumentu
        var html = `<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            --light-gray: #f8f9fa;
            --medium-gray: #e9ecef;
            --dark-gray: #343a40;
            --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            font-family: var(--font-family);
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        
        .form-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            background-color: #fff;
        }
        
        .form-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--primary-color);
        }
        
        .logo {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 20px;
        }
        
        .form-title {
            color: var(--secondary-color);
            font-size: 28px;
            font-weight: bold;
        }
        
        .form-description {
            color: var(--dark-gray);
            margin-top: 10px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: var(--secondary-color);
        }
        
        .required::after {
            content: " *";
            color: #e74c3c;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="number"],
        input[type="date"],
        textarea,
        select {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--medium-gray);
            border-radius: 4px;
            font-family: var(--font-family);
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus,
        input[type="email"]:focus,
        input[type="tel"]:focus,
        input[type="number"]:focus,
        input[type="date"]:focus,
        textarea:focus,
        select:focus {
            border-color: var(--primary-color);
            outline: none;
            box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
        }
        
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .checkbox-group,
        .radio-group {
            margin-top: 10px;
        }
        
        .checkbox-item,
        .radio-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .checkbox-item input,
        .radio-item input {
            margin-right: 10px;
        }
        
        .help-text {
            font-size: 14px;
            color: #6c757d;
            margin-top: 5px;
        }
        
        .form-row {
            display: flex;
            flex-wrap: wrap;
            margin-right: -15px;
            margin-left: -15px;
        }
        
        .form-col {
            flex: 0 0 50%;
            max-width: 50%;
            padding-right: 15px;
            padding-left: 15px;
            box-sizing: border-box;
        }
        
        .form-actions {
            margin-top: 30px;
            text-align: center;
        }
        
        .btn {
            display: inline-block;
            font-weight: 400;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            user-select: none;
            border: 1px solid transparent;
            padding: 12px 24px;
            font-size: 16px;
            line-height: 1.5;
            border-radius: 4px;
            transition: all 0.15s ease-in-out;
            cursor: pointer;
        }
        
        .btn-primary {
            color: #fff;
            background-color: var(--primary-color);
            border-color: var(--primary-color);
        }
        
        .btn-primary:hover {
            background-color: #2980b9;
            border-color: #2980b9;
        }
        
        .btn-secondary {
            color: #fff;
            background-color: #6c757d;
            border-color: #6c757d;
            margin-right: 10px;
        }
        
        .btn-secondary:hover {
            background-color: #5a6268;
            border-color: #5a6268;
        }
        
        .form-footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid var(--medium-gray);
            text-align: center;
            font-size: 14px;
            color: var(--dark-gray);
        }
        
        @media (max-width: 768px) {
            .form-col {
                flex: 0 0 100%;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="form-container">
        <div class="form-header">`;
        
        // Logo (ak je k dispozícii)
        if (logoUrl) {
            html += `
            <img src="${logoUrl}" alt="Logo" class="logo">`;
        }
        
        html += `
            <div class="form-title">${title}</div>
            ${description ? `<div class="form-description">${description}</div>` : ''}
        </div>
        
        <form action="${submitUrl}" method="${submitMethod}">`;
        
        // Generovanie polí formulára
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            
            // Ak je to začiatok riadku s viacerými stĺpcami
            if (field.rowStart) {
                html += `
        <div class="form-row">`;
            }
            
            // Ak je pole v stĺpci
            if (field.column) {
                html += `
            <div class="form-col">`;
            }
            
            html += `
            <div class="form-group">`;
            
            // Label
            if (field.label) {
                html += `
                <label for="${field.id}" class="${field.required ? 'required' : ''}">${field.label}</label>`;
            }
            
            // Pole podľa typu
            switch (field.type) {
                case 'text':
                case 'email':
                case 'tel':
                case 'number':
                case 'date':
                    html += `
                <input type="${field.type}" id="${field.id}" name="${field.name || field.id}" 
                    ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} 
                    ${field.value ? `value="${field.value}"` : ''} 
                    ${field.required ? 'required' : ''}>`;
                    break;
                    
                case 'textarea':
                    html += `
                <textarea id="${field.id}" name="${field.name || field.id}" 
                    ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} 
                    ${field.required ? 'required' : ''}>${field.value || ''}</textarea>`;
                    break;
                    
                case 'select':
                    html += `
                <select id="${field.id}" name="${field.name || field.id}" ${field.required ? 'required' : ''}>`;
                    
                    if (field.placeholder) {
                        html += `
                    <option value="" disabled ${!field.value ? 'selected' : ''}>${field.placeholder}</option>`;
                    }
                    
                    if (field.options && field.options.length) {
                        for (var j = 0; j < field.options.length; j++) {
                            var option = field.options[j];
                            html += `
                    <option value="${option.value}" ${field.value === option.value ? 'selected' : ''}>${option.label}</option>`;
                        }
                    }
                    
                    html += `
                </select>`;
                    break;
                    
                case 'checkbox':
                    html += `
                <div class="checkbox-group">`;
                    
                    if (field.options && field.options.length) {
                        for (var j = 0; j < field.options.length; j++) {
                            var option = field.options[j];
                            var isChecked = field.value && field.value.indexOf(option.value) !== -1;
                            
                            html += `
                    <div class="checkbox-item">
                        <input type="checkbox" id="${field.id}_${j}" name="${field.name || field.id}[]" value="${option.value}" ${isChecked ? 'checked' : ''}>
                        <label for="${field.id}_${j}">${option.label}</label>
                    </div>`;
                        }
                    }
                    
                    html += `
                </div>`;
                    break;
                    
                case 'radio':
                    html += `
                <div class="radio-group">`;
                    
                    if (field.options && field.options.length) {
                        for (var j = 0; j < field.options.length; j++) {
                            var option = field.options[j];
                            
                            html += `
                    <div class="radio-item">
                        <input type="radio" id="${field.id}_${j}" name="${field.name || field.id}" value="${option.value}" ${field.value === option.value ? 'checked' : ''}>
                        <label for="${field.id}_${j}">${option.label}</label>
                    </div>`;
                        }
                    }
                    
                    html += `
                </div>`;
                    break;
            }
            
            // Pomocný text
            if (field.helpText) {
                html += `
                <div class="help-text">${field.helpText}</div>`;
            }
            
            html += `
            </div>`;
            
            // Ak je koniec stĺpca
            if (field.column) {
                html += `
            </div>`;
            }
            
            // Ak je koniec riadku
            if (field.rowEnd) {
                html += `
        </div>`;
            }
        }
        
        // Tlačidlá formulára
        html += `
        <div class="form-actions">
            ${formConfig.resetButton ? `<button type="reset" class="btn btn-secondary">${formConfig.resetButtonText || 'Zrušiť'}</button>` : ''}
            <button type="submit" class="btn btn-primary">${submitButtonText}</button>
        </div>
        </form>
        
        <div class="form-footer">
            <p>${formConfig.footerText || 'Tento formulár bol vygenerovaný automaticky.'}</p>
        </div>
    </div>
</body>
</html>`;
        
        return html;
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
    
    var html = std.HtmlGenerator.generateInvoice(e, options);
    
    // Vytvorenie názvu súboru na základe čísla faktúry
    var fileName = "Faktura_" + e.field("Číslo faktúry").replace(/\//g, "_") + ".html";
    
    if (std.HtmlGenerator.saveToFile(fileName, html)) {
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
    
    var html = std.HtmlGenerator.generateQuote(e, options);
    
    // Vytvorenie názvu súboru na základe čísla ponuky
    var fileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_") + ".html";
    
    if (std.HtmlGenerator.saveToFile(fileName, html)) {
        message("Cenová ponuka bola úspešne vygenerovaná a uložená ako " + fileName);
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
    
    var html = std.HtmlGenerator.generateForm(formConfig);
    
    // Vytvorenie názvu súboru
    var fileName = "Kontaktny_formular.html";
    
    if (std.HtmlGenerator.saveToFile(fileName, html)) {
        message("Kontaktný formulár bol úspešne vygenerovaný a uložený ako " + fileName);
    }
}
