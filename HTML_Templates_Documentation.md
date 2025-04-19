# Dokumentácia k HTML šablónam pre Memento Database

Táto dokumentácia popisuje, ako používať a upravovať HTML šablóny pre generovanie výstupov z Memento Database. Systém umožňuje vytvárať profesionálne vyzerajúce dokumenty ako faktúry, cenové ponuky a formuláre s minimálnym úsilím.

## Obsah

1. [Prehľad systému](#prehľad-systému)
2. [Inštalácia](#inštalácia)
3. [Používanie existujúcich šablón](#používanie-existujúcich-šablón)
4. [Úprava existujúcich šablón](#úprava-existujúcich-šablón)
5. [Vytváranie nových šablón](#vytváranie-nových-šablón)
6. [Syntax šablón](#syntax-šablón)
7. [Príklady použitia](#príklady-použitia)

## Prehľad systému

Systém pozostáva z nasledujúcich komponentov:

1. **Načítavač šablón** (`std_html_template_loader.js`) - JavaScript knižnica, ktorá načítava HTML šablóny zo súborov a nahrádza v nich premenné skutočnými hodnotami.
2. **Šablóny** (v adresári `templates/`) - HTML súbory s CSS štýlmi, ktoré definujú vzhľad a štruktúru výstupných dokumentov.
3. **Akcie** - JavaScript funkcie, ktoré sa volajú z Memento Database a generujú výstupy na základe údajov zo záznamov.

Výhody tohto prístupu:

- **Oddelenie logiky a prezentácie** - JavaScript kód je oddelený od HTML a CSS, čo uľahčuje údržbu a úpravy.
- **Jednoduchá úprava šablón** - Šablóny sú uložené v samostatných súboroch, takže ich môžete upravovať bez zmeny JavaScript kódu.
- **Flexibilita** - Môžete ľahko pridávať nové šablóny pre ďalšie typy dokumentov.
- **Konzistentný vzhľad** - Všetky dokumenty majú konzistentný vzhľad a štýl.

## Inštalácia

1. Skopírujte súbor `std_html_template_loader.js` do vášho projektu v Memento Database.
2. Vytvorte adresár `templates` a skopírujte do neho šablóny, ktoré chcete používať.
3. Pridajte akcie do vašich knižníc v Memento Database, ktoré budú volať funkcie na generovanie dokumentov.

## Používanie existujúcich šablón

Systém obsahuje nasledujúce šablóny:

### 1. Faktúra (`invoice_template.html`)

Šablóna pre generovanie faktúr s hlavičkou, položkami, DPH a QR kódom pre platbu.

```javascript
// Príklad použitia v akcii
function generateInvoiceAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#3498db",
        secondaryColor: "#2c3e50"
    };
    
    // Nastavenie platobných údajov pre QR kód
    e.set("IBAN", "SK12 0900 0000 0001 2345 6789");
    e.set("Variabilný symbol", e.field("Číslo faktúry"));
    
    var html = generateInvoice(e, options);
    var fileName = "Faktura_" + e.field("Číslo faktúry").replace(/\//g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Faktúra bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}
```

Faktúra obsahuje nasledujúce údaje o DPH:
- Cena za MJ bez DPH
- Sadzba DPH (%)
- Cena bez DPH
- Výška DPH
- Celkom s DPH
- Súhrn DPH podľa sadzieb

### 2. Jednoduchá faktúra (`simple_invoice_template.html`)

Šablóna pre generovanie jednoduchých faktúr bez položiek, len s textom faktúry (napr. "Faktúrujeme Vám údržbu záhrady podľa priloženého vyúčtovania č.XXXX"). Obsahuje tiež údaje o DPH a QR kód pre platbu.

```javascript
// Príklad použitia v akcii
function generateSimpleInvoiceAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#3498db",
        secondaryColor: "#2c3e50"
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
    
    var html = generateSimpleInvoice(e, options);
    var fileName = "Faktura_jednoducha_" + e.field("Číslo faktúry").replace(/\//g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Jednoduchá faktúra bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}
```

Jednoduchá faktúra podporuje aj zníženú sadzbu DPH:

```javascript
// Nastavenie údajov o DPH so zníženou sadzbou
e.set("Celková suma", 150);
e.set("Sadzba DPH", 20);
e.set("Cena bez DPH", 100);
e.set("Znížená sadzba DPH", 10);
e.set("Znížený základ DPH", 20);
```

### 3. Cenová ponuka (`quote_template.html`)

Šablóna pre generovanie cenových ponúk s platnosťou a detailmi ponuky.

```javascript
// Príklad použitia v akcii
function generateQuoteAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#27ae60",
        secondaryColor: "#2c3e50"
    };
    
    var html = generateQuote(e, options);
    var fileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Cenová ponuka bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}
```

### 4. Formulár (`form_template.html`)

Šablóna pre generovanie interaktívnych formulárov s rôznymi typmi polí.

```javascript
// Príklad použitia v akcii
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
            // Ďalšie polia...
        ]
    };
    
    var html = generateForm(formConfig);
    var fileName = "Kontaktny_formular.html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Kontaktný formulár bol úspešne vygenerovaný a uložený ako " + fileName);
    }
}
```

## Úprava existujúcich šablón

Šablóny sú uložené v adresári `templates/` a môžete ich upravovať podľa svojich potrieb. Každá šablóna je HTML súbor s CSS štýlmi a premennými v formáte `{{premenná}}`.

### Úprava vzhľadu

Môžete upraviť CSS štýly v šablóne, aby ste zmenili vzhľad dokumentu. Napríklad:

```css
/* Zmena farby hlavičky */
.invoice-header {
    border-bottom: 2px solid #ff5722;
}

/* Zmena farby textu */
.invoice-title {
    color: #333;
}
```

### Úprava štruktúry

Môžete upraviť HTML štruktúru šablóny, aby ste zmenili rozloženie dokumentu. Napríklad:

```html
<!-- Pridanie nového prvku do hlavičky -->
<div class="invoice-header">
    <div class="logo-container">
        <img src="{{company.logo}}" alt="Logo" class="logo">
    </div>
    <div class="title-container">
        <div class="invoice-title">FAKTÚRA</div>
        <div class="invoice-number">č. {{invoice.number}}</div>
    </div>
    <div class="qr-code-container">
        <img src="{{invoice.qrCode}}" alt="QR kód" class="qr-code">
    </div>
</div>
```

## Vytváranie nových šablón

Môžete vytvoriť nové šablóny pre ďalšie typy dokumentov. Postup:

1. Vytvorte nový HTML súbor v adresári `templates/` (napr. `delivery_note_template.html`).
2. Definujte HTML štruktúru a CSS štýly pre nový dokument.
3. Použite premenné v formáte `{{premenná}}` pre dynamické časti dokumentu.
4. Vytvorte novú funkciu v JavaScript kóde, ktorá bude generovať dokument na základe šablóny.

### Príklad novej šablóny pre dodací list

```html
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dodací list č. {{delivery.number}}</title>
    <style>
        /* CSS štýly pre dodací list */
    </style>
</head>
<body>
    <div class="delivery-container">
        <div class="delivery-header">
            <!-- Hlavička dodacieho listu -->
        </div>
        
        <div class="delivery-content">
            <!-- Obsah dodacieho listu -->
        </div>
        
        <div class="delivery-footer">
            <!-- Pätička dodacieho listu -->
        </div>
    </div>
</body>
</html>
```

### Príklad funkcie pre generovanie dodacieho listu

```javascript
/**
 * Generuje dodací list na základe údajov zo záznamu
 * @param {Object} entry - Záznam dodacieho listu
 * @param {Object} options - Nastavenia výstupu
 * @returns {String} HTML kód dodacieho listu
 */
function generateDeliveryNote(entry, options) {
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
        delivery: {
            number: entry.field("Číslo dodacieho listu"),
            date: std.HtmlTemplateLoader.formatDate(entry.field("Dátum dodania")),
            // Ďalšie polia...
        },
        customer: {
            name: entry.field("Zákazník"),
            address: entry.field("Adresa zákazníka"),
            info: entry.field("Info zákazníka") || ""
        },
        items: []
    };
    
    // Spracovanie položiek dodacieho listu
    var items = entry.field("Položky");
    // Spracovanie položiek...
    
    // Načítanie šablóny a nahradenie premenných
    return std.HtmlTemplateLoader.loadTemplate("templates/delivery_note_template.html", data);
}
```

## Syntax šablón

Šablóny používajú jednoduchú syntax na vkladanie premenných a riadenie toku:

### Premenné

Premenné sa vkladajú pomocou dvojitých zložených zátvoriek:

```html
<div>{{premenná}}</div>
```

Pre vnorené objekty použite bodkovú notáciu:

```html
<div>{{objekt.vlastnosť}}</div>
```

### Podmienky

Podmienky sa používajú na zobrazenie alebo skrytie častí šablóny:

```html
{{#if podmienka}}
    <!-- Obsah, ktorý sa zobrazí, ak je podmienka splnená -->
{{/if}}
```

Podmienky s alternatívou:

```html
{{#if podmienka}}
    <!-- Obsah, ktorý sa zobrazí, ak je podmienka splnená -->
{{else}}
    <!-- Obsah, ktorý sa zobrazí, ak podmienka nie je splnená -->
{{/if}}
```

### Cykly

Cykly sa používajú na opakovanie častí šablóny pre každý prvok poľa:

```html
{{#each pole}}
    <!-- Obsah, ktorý sa zopakuje pre každý prvok poľa -->
    <div>{{this}}</div>
{{/each}}
```

Pre prístup k vlastnostiam prvku:

```html
{{#each pole}}
    <div>{{vlastnosť}}</div>
{{/each}}
```

## Príklady použitia

### Generovanie faktúry pre konkrétneho zákazníka

```javascript
function generateInvoiceForCustomer() {
    var e = entry();
    var customer = e.field("Zákazník");
    
    // Vyhľadanie zákazníka v knižnici zákazníkov
    var customersLib = libByName("Zákazníci");
    var customerEntry = customersLib.find("Názov = '" + customer + "'")[0];
    
    if (!customerEntry) {
        message("Zákazník '" + customer + "' nebol nájdený.");
        return;
    }
    
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#3498db",
        secondaryColor: "#2c3e50"
    };
    
    var html = generateInvoice(e, options);
    var fileName = "Faktura_" + e.field("Číslo faktúry").replace(/\//g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Faktúra bola úspešne vygenerovaná a uložená ako " + fileName);
        
        // Odoslanie faktúry zákazníkovi emailom
        if (customerEntry.field("Email")) {
            var emailConfig = {
                to: customerEntry.field("Email"),
                subject: "Faktúra č. " + e.field("Číslo faktúry"),
                body: "Vážený zákazník,\n\nv prílohe Vám posielame faktúru č. " + e.field("Číslo faktúry") + ".\n\nS pozdravom,\nVaša Spoločnosť s.r.o.",
                attachments: [fileName]
            };
            
            // Odoslanie emailu (implementácia závisí od vašich možností)
            // sendEmail(emailConfig);
        }
    }
}
```

### Generovanie hromadných cenových ponúk

```javascript
function generateBulkQuotes() {
    var lib = libByName("Cenové ponuky");
    var entries = lib.find("Stav = 'Nová'");
    
    if (entries.length === 0) {
        message("Neboli nájdené žiadne nové cenové ponuky.");
        return;
    }
    
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#27ae60",
        secondaryColor: "#2c3e50"
    };
    
    var generatedCount = 0;
    
    for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var html = generateQuote(e, options);
        var fileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_") + ".html";
        
        if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
            generatedCount++;
            e.set("Stav", "Vygenerovaná");
        }
    }
    
    message("Bolo úspešne vygenerovaných " + generatedCount + " z " + entries.length + " cenových ponúk.");
}
```

### Generovanie formulára s dynamickými poľami

```javascript
function generateDynamicForm() {
    var e = entry();
    var formFields = [];
    
    // Získanie polí z knižnice
    var fieldsLib = libByName("Polia formulárov");
    var fields = fieldsLib.find("Formulár = '" + e.field("Názov") + "'");
    
    // Vytvorenie konfigurácie polí
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        
        var fieldConfig = {
            id: field.field("ID"),
            type: field.field("Typ"),
            label: field.field("Popis"),
            required: field.field("Povinné") === "Áno"
        };
        
        if (field.field("Placeholder")) {
            fieldConfig.placeholder = field.field("Placeholder");
        }
        
        if (field.field("Pomocný text")) {
            fieldConfig.helpText = field.field("Pomocný text");
        }
        
        // Spracovanie možností pre výberové polia
        if (field.field("Typ") === "select" || field.field("Typ") === "checkbox" || field.field("Typ") === "radio") {
            var options = field.field("Možnosti").split("\n");
            fieldConfig.options = [];
            
            for (var j = 0; j < options.length; j++) {
                var parts = options[j].split("|");
                fieldConfig.options.push({
                    value: parts[0],
                    label: parts[1] || parts[0]
                });
            }
        }
        
        formFields.push(fieldConfig);
    }
    
    var formConfig = {
        title: e.field("Názov"),
        description: e.field("Popis"),
        submitUrl: e.field("URL odoslania"),
        submitMethod: e.field("Metóda odoslania") || "POST",
        submitButtonText: e.field("Text tlačidla odoslania") || "Odoslať",
        resetButton: e.field("Zobraziť tlačidlo zrušenia") === "Áno",
        resetButtonText: e.field("Text tlačidla zrušenia") || "Zrušiť",
        footerText: e.field("Text pätičky") || "Tento formulár bol vygenerovaný automaticky.",
        primaryColor: e.field("Primárna farba") || "#3498db",
        secondaryColor: e.field("Sekundárna farba") || "#2c3e50",
        logoUrl: e.field("URL loga") || "",
        fields: formFields
    };
    
    var html = generateForm(formConfig);
    var fileName = "Formular_" + e.field("Názov").replace(/\s/g, "_") + ".html";
    
    if (std.HtmlTemplateLoader.saveToFile(fileName, html)) {
        message("Formulár bol úspešne vygenerovaný a uložený ako " + fileName);
    }
}
```

---

Táto dokumentácia poskytuje základný prehľad o používaní a úprave HTML šablón v Memento Database. Pre ďalšie informácie alebo pomoc sa obráťte na autora alebo pozrite si zdrojový kód.
