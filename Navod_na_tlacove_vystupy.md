# Návod na generovanie tlačových výstupov z Memento Database

Tento návod popisuje, ako implementovať a používať generátor tlačových výstupov v Memento Database. Generátor umožňuje vytvárať profesionálne vyzerajúce dokumenty ako faktúry, cenové ponuky a vyúčtovania v Markdown formáte, ktoré sú vhodné na tlač alebo konverziu do PDF.

## Obsah

1. [Prehľad riešenia](#prehľad-riešenia)
2. [Štruktúra knižníc](#štruktúra-knižníc)
3. [Implementácia](#implementácia)
4. [Použitie](#použitie)
5. [Konverzia do PDF](#konverzia-do-pdf)
6. [Prispôsobenie šablón](#prispôsobenie-šablón)

## Prehľad riešenia

Riešenie pozostáva z:

1. **JavaScript knižnice** (`std_print_generator.js`) - obsahuje funkcie na generovanie Markdown výstupov
2. **Knižníc v Memento Database** - pre ukladanie faktúr, cenových ponúk a vyúčtovaní
3. **Akcií** - ktoré spúšťajú generovanie dokumentov

Výhody tohto riešenia:

- **Flexibilita** - možnosť prispôsobiť šablóny podľa vlastných potrieb
- **Prenositeľnosť** - Markdown formát je podporovaný mnohými nástrojmi
- **Jednoduchosť** - generovanie dokumentov priamo z Memento Database bez potreby externých aplikácií
- **Profesionálny vzhľad** - štruktúrované dokumenty s logom, hlavičkou, tabuľkami a pätičkou

## Štruktúra knižníc

Pre implementáciu riešenia odporúčame vytvoriť nasledujúce knižnice v Memento Database:

### 1. Knižnica "Faktúry"

**Polia:**
- Číslo faktúry (Text)
- Dátum vystavenia (Dátum)
- Dátum splatnosti (Dátum)
- Zákazník (Text)
- Adresa zákazníka (Text)
- Info zákazníka (Text) - IČO, DIČ, atď.
- Položky (Text alebo JavaScript) - formát popísaný nižšie
- Celková suma (Reálne číslo)
- Mena (Text) - predvolene EUR
- Poznámky (Text)

### 2. Knižnica "Cenové ponuky"

**Polia:**
- Číslo ponuky (Text)
- Dátum vystavenia (Dátum)
- Platnosť do (Dátum)
- Zákazník (Text)
- Adresa zákazníka (Text)
- Info zákazníka (Text)
- Položky (Text alebo JavaScript)
- Celková suma (Reálne číslo)
- Mena (Text)
- Poznámky (Text)

### 3. Knižnica "Vyúčtovania"

**Polia:**
- Číslo vyúčtovania (Text)
- Dátum vystavenia (Dátum)
- Obdobie od (Dátum)
- Obdobie do (Dátum)
- Zákazník (Text)
- Adresa zákazníka (Text)
- Info zákazníka (Text)
- Položky (Text alebo JavaScript)
- Celková suma (Reálne číslo)
- Mena (Text)
- Poznámky (Text)

### Formát položiek

Položky môžu byť uložené v jednom z nasledujúcich formátov:

1. **JSON formát** (odporúčané):
```json
[
  {
    "description": "Webová stránka - základný balík",
    "quantity": "1",
    "unitPrice": "500",
    "total": "500"
  },
  {
    "description": "SEO optimalizácia",
    "quantity": "5",
    "unitPrice": "50",
    "total": "250"
  }
]
```

2. **Textový formát s oddeľovačmi**:
```
Webová stránka - základný balík|1|500|500
SEO optimalizácia|5|50|250
```

3. **JavaScript pole** (pre pokročilých používateľov):
Môžete vytvoriť JavaScript pole objektov priamo v Memento Database.

## Implementácia

### Krok 1: Pridanie JavaScript knižnice

1. Skopírujte obsah súboru `std_print_generator.js` do svojho projektu v Memento Database.
2. Uistite sa, že knižnica je dostupná pre všetky knižnice, ktoré ju budú používať.

### Krok 2: Vytvorenie knižníc

Vytvorte knižnice "Faktúry", "Cenové ponuky" a "Vyúčtovania" podľa štruktúry popísanej vyššie.

### Krok 3: Pridanie akcií

Pre každú knižnicu pridajte akciu, ktorá bude generovať príslušný dokument:

#### Akcia pre knižnicu "Faktúry"

1. Otvorte knižnicu "Faktúry"
2. Prejdite do menu > Skripty > Akcie
3. Vytvorte novú akciu s názvom "Generovať faktúru"
4. Nastavte kontext na "Záznam" (aby sa akcia zobrazila pri prezeraní záznamu)
5. Vložte nasledujúci kód:

```javascript
function() {
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
```

#### Akcia pre knižnicu "Cenové ponuky"

Podobne vytvorte akciu "Generovať cenovú ponuku" s kódom:

```javascript
function() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png"
    };
    
    var markdown = std.PrintGenerator.generateQuote(e, options);
    
    var fileName = "Cenova_ponuka_" + e.field("Číslo ponuky").replace(/\//g, "_") + ".md";
    
    if (std.PrintGenerator.saveToFile(fileName, markdown)) {
        message("Cenová ponuka bola úspešne vygenerovaná a uložená ako " + fileName);
    }
}
```

#### Akcia pre knižnicu "Vyúčtovania"

Vytvorte akciu "Generovať vyúčtovanie" s kódom:

```javascript
function() {
    var e = entry();
    var options = {
        companyName: "Vaša Spoločnosť s.r.o.",
        companyInfo: "IČO: 12345678, DIČ: 2023456789, IČ DPH: SK2023456789",
        companyAddress: "Hlavná 123, 831 01 Bratislava",
        companyContact: "Tel: +421 900 123 456, Email: info@vasaspolocnost.sk",
        logoUrl: "https://example.com/logo.png"
    };
    
    var markdown = std.PrintGenerator.generateStatement(e, options);
    
    var fileName = "Vyuctovanie_" + e.field("Číslo vyúčtovania").replace(/\//g, "_") + ".md";
    
    if (std.PrintGenerator.saveToFile(fileName, markdown)) {
        message("Vyúčtovanie bolo úspešne vygenerované a uložené ako " + fileName);
    }
}
```

### Krok 4: Nastavenie oprávnení

Pre každú knižnicu nastavte oprávnenia pre skripty:

1. Otvorte knižnicu
2. Prejdite do menu > Skripty > Akcie
3. Kliknite na ikonu štítu (oprávnenia)
4. Povoľte prístup k súborom (pre ukladanie vygenerovaných dokumentov)

## Použitie

### Generovanie faktúry

1. Vytvorte nový záznam v knižnici "Faktúry"
2. Vyplňte všetky potrebné polia (číslo faktúry, dátum, zákazník, položky, atď.)
3. Uložte záznam
4. Otvorte záznam a kliknite na akciu "Generovať faktúru"
5. Markdown súbor s faktúrou bude vygenerovaný a uložený

### Položky faktúry

Položky faktúry môžete zadať v jednom z podporovaných formátov:

1. **JSON formát**:
```json
[
  {
    "description": "Webová stránka - základný balík",
    "quantity": "1",
    "unitPrice": "500",
    "total": "500"
  },
  {
    "description": "SEO optimalizácia",
    "quantity": "5",
    "unitPrice": "50",
    "total": "250"
  }
]
```

2. **Textový formát s oddeľovačmi**:
```
Webová stránka - základný balík|1|500|500
SEO optimalizácia|5|50|250
```

## Konverzia do PDF

Vygenerované Markdown súbory môžete konvertovať do PDF pomocou rôznych nástrojov:

### Metóda 1: Použitie online konvertorov

1. Otvorte vygenerovaný Markdown súbor v textovom editore
2. Skopírujte obsah
3. Navštívte online konvertor ako [Markdown to PDF](https://www.markdowntopdf.com/)
4. Vložte obsah a konvertujte na PDF

### Metóda 2: Použitie aplikácií

Existuje mnoho aplikácií, ktoré dokážu konvertovať Markdown do PDF:

- **Pandoc** - univerzálny konvertor dokumentov
- **Typora** - Markdown editor s možnosťou exportu do PDF
- **VS Code** s rozšírením Markdown PDF

### Metóda 3: Automatizácia pomocou skriptov

Pre pokročilých používateľov je možné vytvoriť skript, ktorý automaticky konvertuje Markdown do PDF pomocou nástrojov ako Pandoc alebo wkhtmltopdf.

## Prispôsobenie šablón

Šablóny dokumentov môžete prispôsobiť úpravou funkcií v súbore `std_print_generator.js`:

### Zmena vzhľadu faktúry

Upravte funkciu `generateInvoice` v súbore `std_print_generator.js`. Môžete zmeniť:

- Rozloženie dokumentu
- Formátovanie textu
- Obsah hlavičky a pätičky
- Štýl tabuliek

### Pridanie vlastného loga

V možnostiach akcie nastavte cestu k vášmu logu:

```javascript
var options = {
    // ...
    logoUrl: "https://vasadomena.sk/logo.png"
    // ...
};
```

### Pridanie ďalších typov dokumentov

Môžete vytvoriť nové funkcie pre ďalšie typy dokumentov podľa vzoru existujúcich funkcií, napríklad:

```javascript
generateDeliveryNote: function(entry, options) {
    // Kód pre generovanie dodacieho listu
}
```

---

Tento návod vám pomôže implementovať a používať generátor tlačových výstupov v Memento Database. Ak máte otázky alebo potrebujete pomoc, neváhajte kontaktovať podporu.
