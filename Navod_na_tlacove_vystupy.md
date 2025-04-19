# Návod na tlačové výstupy v Memento Database

Tento návod popisuje, ako používať systém pre generovanie tlačových výstupov v rôznych formátoch (HTML, PDF, WEBP) z Memento Database.

## Obsah

1. [Prehľad systému](#prehľad-systému)
2. [Inštalácia a konfigurácia](#inštalácia-a-konfigurácia)
3. [Generovanie faktúr](#generovanie-faktúr)
4. [Generovanie cenových ponúk](#generovanie-cenových-ponúk)
5. [Generovanie formulárov](#generovanie-formulárov)
6. [Prispôsobenie výstupov](#prispôsobenie-výstupov)
7. [Riešenie problémov](#riešenie-problémov)

## Prehľad systému

Systém pre tlačové výstupy pozostáva z nasledujúcich komponentov:

1. **HTML šablóny** - Definujú vzhľad a štruktúru dokumentov (faktúry, cenové ponuky, formuláre)
2. **Načítavač šablón** - JavaScript knižnica, ktorá načítava HTML šablóny a nahrádza v nich premenné
3. **Exportný modul** - Umožňuje exportovať HTML dokumenty do rôznych formátov (PDF, WEBP)
4. **Akcie** - JavaScript funkcie, ktoré generujú a exportujú dokumenty na základe údajov zo záznamov

Systém podporuje nasledujúce formáty výstupov:

- **HTML** - Štandardný webový formát, ktorý je možné otvoriť v prehliadači
- **PDF** - Prenosný dokumentový formát, vhodný na tlač a zdieľanie
- **WEBP** - Moderný obrazový formát s dobrou kompresiou, vhodný na zdieľanie náhľadov

## Inštalácia a konfigurácia

### Potrebné súbory

Pre správne fungovanie systému potrebujete nasledujúce súbory:

1. `std_html_template_loader.js` - Načítavač HTML šablón
2. `std_html_export.js` - Modul pre export do rôznych formátov
3. Adresár `templates/` s HTML šablónami:
   - `invoice_template.html` - Šablóna pre faktúry s položkami
   - `simple_invoice_template.html` - Šablóna pre jednoduchú faktúru
   - `quote_template.html` - Šablóna pre cenové ponuky
   - `form_template.html` - Šablóna pre formuláre

### Konfigurácia API kľúčov

Pre export do PDF a WEBP formátov je potrebné nastaviť API kľúče pre externé služby:

1. Otvorte súbor `std_html_export.js`
2. Nájdite riadok s `var apiKey = "YOUR_HTML2PDF_API_KEY";` a nahraďte ho vaším API kľúčom pre HTML2PDF službu
3. Nájdite riadok s `var apiKey = "YOUR_SCREENSHOT_API_KEY";` a nahraďte ho vaším API kľúčom pre Screenshot API službu

```javascript
// Konfigurácia HTML2PDF API
var apiKey = "abc123xyz"; // Váš skutočný API kľúč
```

### Pridanie akcií do Memento Database

1. Otvorte Memento Database a prejdite do knižnice, kde chcete používať tlačové výstupy
2. Prejdite do nastavení knižnice a vyberte "Akcie"
3. Pridajte nové akcie pre generovanie dokumentov (napr. "Generovať faktúru", "Generovať cenovú ponuku")
4. Do kódu akcie vložte príslušnú funkciu zo súboru `std_html_export.js` (napr. `generateAndExportInvoiceAction()`)

## Generovanie faktúr

Systém podporuje dva typy faktúr:

1. **Faktúra s položkami** - Obsahuje zoznam položiek s množstvom, cenou a DPH
2. **Jednoduchá faktúra** - Obsahuje len text faktúry bez položiek

### Faktúra s položkami

Pre generovanie faktúry s položkami použite funkciu `generateAndExportInvoiceAction()`:

```javascript
function generateAndExportInvoiceAction() {
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
```

### Jednoduchá faktúra

Pre generovanie jednoduchej faktúry použite funkciu `generateAndExportSimpleInvoiceAction()`:

```javascript
function generateAndExportSimpleInvoiceAction() {
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
    
    // Generovanie a export faktúry
    var html = generateSimpleInvoice(e, options);
    var baseFileName = "Faktura_jednoducha_" + e.field("Číslo faktúry").replace(/\//g, "_");
    var result = exportInvoice(html, baseFileName, ["html", "pdf", "webp"], {
        pdf: { pageSize: "A4", margin: "10mm" },
        webp: { quality: 90, width: 1200, height: 1600 }
    });
    
    // Zobrazenie výsledku
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
```

## Generovanie cenových ponúk

Pre generovanie cenových ponúk použite funkciu `generateAndExportQuoteAction()`:

```javascript
function generateAndExportQuoteAction() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#27ae60",
        secondaryColor: "#2c3e50"
    };
    
    // Generovanie a export cenovej ponuky
    var html = generateQuote(e, options);
    var baseFileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_");
    var result = exportInvoice(html, baseFileName, ["html", "pdf", "webp"], {
        pdf: { pageSize: "A4", margin: "10mm" },
        webp: { quality: 90, width: 1200, height: 1600 }
    });
    
    // Zobrazenie výsledku
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
```

## Generovanie formulárov

Pre generovanie formulárov použite funkciu `generateAndExportFormAction()`:

```javascript
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
    
    // Generovanie a export formulára
    var html = generateForm(formConfig);
    var baseFileName = "Kontaktny_formular";
    var result = exportInvoice(html, baseFileName, ["html", "pdf", "webp"], {
        pdf: { pageSize: "A4", margin: "10mm" },
        webp: { quality: 90, width: 1200, height: 1600 }
    });
    
    // Zobrazenie výsledku
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
```

## Prispôsobenie výstupov

### Zmena vzhľadu dokumentov

Môžete prispôsobiť vzhľad dokumentov zmenou nasledujúcich parametrov:

1. **Farby** - Nastavte `primaryColor` a `secondaryColor` podľa vašich firemných farieb
2. **Logo** - Nastavte `logoUrl` na URL vášho firemného loga
3. **Informácie o spoločnosti** - Nastavte `companyName`, `companyInfo`, `companyAddress` a `companyContact`

```javascript
var options = {
    companyName: "Vaša Spoločnosť s.r.o.",
    companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
    companyAddress: "Hlavná 123, 831 01 Bratislava",
    companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
    logoUrl: "https://example.com/logo.png",
    primaryColor: "#3498db", // Modrá farba
    secondaryColor: "#2c3e50" // Tmavá farba
};
```

### Nastavenia exportu do PDF

Môžete prispôsobiť nastavenia exportu do PDF formátu:

```javascript
var exportOptions = {
    pdf: {
        pageSize: "A4", // Veľkosť stránky (A4, Letter, Legal, ...)
        margin: "10mm", // Okraje stránky
        landscape: false, // Orientácia stránky (true = na šírku, false = na výšku)
        printBackground: true, // Tlačiť pozadie
        displayHeaderFooter: true, // Zobraziť hlavičku a pätičku
        headerTemplate: "<div style='text-align: center; font-size: 10px;'>Vaša Spoločnosť s.r.o.</div>", // HTML šablóna pre hlavičku
        footerTemplate: "<div style='text-align: center; font-size: 10px;'>Strana <span class='pageNumber'></span> z <span class='totalPages'></span></div>" // HTML šablóna pre pätičku
    }
};
```

### Nastavenia exportu do WEBP

Môžete prispôsobiť nastavenia exportu do WEBP formátu:

```javascript
var exportOptions = {
    webp: {
        quality: 90, // Kvalita obrázka (0-100)
        width: 1200, // Šírka obrázka v pixeloch
        height: 1600, // Výška obrázka v pixeloch
        scale: 1, // Mierka (1 = 100%)
        fullPage: true // Zachytiť celú stránku (true) alebo len viditeľnú časť (false)
    }
};
```

## Riešenie problémov

### Chyba pri exporte do PDF

Ak sa vyskytne chyba pri exporte do PDF, skontrolujte nasledujúce:

1. **API kľúč** - Uistite sa, že ste správne nastavili API kľúč pre HTML2PDF službu
2. **Limity API** - Skontrolujte, či ste neprekročili limity vášho API kľúča
3. **Veľkosť HTML** - Skúste zjednodušiť HTML, ak je príliš veľké
4. **Internetové pripojenie** - Uistite sa, že máte funkčné internetové pripojenie

### Chyba pri exporte do WEBP

Ak sa vyskytne chyba pri exporte do WEBP, skontrolujte nasledujúce:

1. **API kľúč** - Uistite sa, že ste správne nastavili API kľúč pre Screenshot API službu
2. **Limity API** - Skontrolujte, či ste neprekročili limity vášho API kľúča
3. **Veľkosť HTML** - Skúste zjednodušiť HTML, ak je príliš veľké
4. **Internetové pripojenie** - Uistite sa, že máte funkčné internetové pripojenie

### Problémy so zobrazením

Ak sa dokument nezobrazuje správne, skontrolujte nasledujúce:

1. **HTML šablóna** - Uistite sa, že HTML šablóna je správne formátovaná
2. **CSS štýly** - Skontrolujte CSS štýly v šablóne
3. **Dáta** - Uistite sa, že všetky potrebné dáta sú k dispozícii v zázname

---

Tento návod poskytuje základný prehľad o používaní systému pre tlačové výstupy v Memento Database. Pre ďalšie informácie alebo pomoc sa obráťte na autora alebo pozrite si zdrojový kód.
