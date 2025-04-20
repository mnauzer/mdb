# Analýza dokumentácie frameworku ASISTANTO STD

Na základe vykonaného refaktoringu frameworku ASISTANTO STD je potrebné vytvoriť komplexnú dokumentáciu, ktorá bude slúžiť ako referenčný materiál pre administrátorov, vývojárov aj koncových používateľov. Táto analýza navrhuje štruktúru dokumentácie rozdelenú do troch hlavných častí.

## Štruktúra dokumentácie

Dokumentácia bude rozdelená do nasledujúcich častí:

1. **Administrátorská príručka** - technická dokumentácia pre správcov a vývojárov
2. **Užívateľská príručka** - návod pre koncových používateľov
3. **Príloha** - detailný popis databáz, polí a ich vzťahov

Každá časť bude mať vlastný dokument s logickou štruktúrou kapitol a podkapitol.

## 1. Administrátorská príručka

### Navrhovaná štruktúra

#### 1.1 Úvod
- Prehľad frameworku ASISTANTO STD
- Architektúra a moduly
- Inštalácia a konfigurácia
- Systémové požiadavky

#### 1.2 Základné moduly
- **std_constants.js** - Konštanty a konfigurácia
  - Popis štruktúry konštánt
  - Spôsob rozšírenia a úpravy konštánt
  - Príklady použitia
- **std_errorHandler.js** - Spracovanie chýb
  - Typy chýb (systémové, databázové, validačné, biznis)
  - Logovanie chýb
  - Zobrazovanie chybových hlásení
  - Príklady použitia
- **std_utils.js** - Utility funkcie
  - Práca s dátumami
  - Práca s reťazcami
  - Práca s číslami
  - Práca s objektmi a poliami
  - Práca s poliami v Memento Database
  - Generovanie čísel záznamov
  - Príklady použitia
- **std_triggers.js** - Triggery
  - Popis jednotlivých triggerov
  - Životný cyklus záznamu
  - Implementácia triggerov v databázach
  - Príklady použitia
- **std_html.js** - Generovanie HTML
  - Práca so šablónami
  - Generovanie tabuliek, formulárov a kariet
  - Príklady použitia
- **std_actions.js** - Akcie
  - Popis jednotlivých akcií
  - Implementácia akcií v databázach
  - Príklady použitia

#### 1.3 Špecifické moduly
- Kniha jázd
- Dochádzka
- Cenové ponuky
- Faktúry
- Ďalšie špecifické moduly

#### 1.4 Rozšírenie frameworku
- Vytvorenie nového modulu
- Integrácia s existujúcimi modulmi
- Testovanie nových funkcií
- Aktualizácia dokumentácie

#### 1.5 Integrácia s GitHub
- Nastavenie repozitára
- Nahrávanie súborov
- Verziovanie
- Načítavanie knižníc z GitHubu

#### 1.6 Riešenie problémov
- Bežné chyby a ich riešenie
- Logovanie a analýza chýb
- Kontakt na podporu

### Príklady obsahu

#### Príklad: Použitie modulu std_errorHandler.js

```javascript
// Vytvorenie systémovej chyby
try {
  // Kód, ktorý môže vyvolať chybu
} catch (e) {
  std.ErrorHandler.createSystemError(e, "názovFunkcie", true);
}

// Logovanie informácie
std.ErrorHandler.logInfo("názovModulu", "názovFunkcie", "Informačná správa");

// Logovanie varovania
std.ErrorHandler.logWarning("názovModulu", "názovFunkcie", "Varovná správa");

// Logovanie chyby
std.ErrorHandler.logError("názovModulu", "názovFunkcie", "Chybová správa");
```

#### Príklad: Implementácia triggeru

```javascript
// V nastaveniach databázy, záložka Triggers
// Pre udalosť "Create Entry Open" vyberte funkciu "createEntryOpen"

// V skripte databázy
function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}
```

## 2. Užívateľská príručka

### Navrhovaná štruktúra

#### 2.1 Úvod
- O aplikácii ASISTANTO
- Inštalácia a prvé spustenie
- Základné pojmy a navigácia
- Prehľad databáz a ich účel

#### 2.2 Práca so záznamami
- Vytvorenie nového záznamu
- Úprava existujúceho záznamu
- Odstránenie záznamu
- Vyhľadávanie a filtrovanie záznamov
- Zobrazenie detailov záznamu

#### 2.3 Kniha jázd
- Vytvorenie záznamu o jazde
- Výpočet vzdialenosti a nákladov
- Generovanie reportov
- Prepojenie s inými databázami

#### 2.4 Dochádzka
- Evidencia príchodov a odchodov
- Výpočet odpracovaného času
- Generovanie výkazov
- Prepojenie s inými databázami

#### 2.5 Cenové ponuky
- Vytvorenie cenovej ponuky
- Pridanie položiek
- Výpočet ceny
- Generovanie PDF
- Prepojenie s inými databázami

#### 2.6 Faktúry
- Vytvorenie faktúry
- Pridanie položiek
- Výpočet ceny a DPH
- Generovanie PDF
- Prepojenie s inými databázami

#### 2.7 Ďalšie moduly
- Špecifické návody pre ďalšie moduly

#### 2.8 Riešenie problémov
- Bežné problémy a ich riešenie
- Kontakt na podporu

### Príklady obsahu

#### Príklad: Vytvorenie záznamu v Knihe jázd

1. Otvorte databázu "Kniha jázd"
2. Kliknite na tlačidlo "+" pre vytvorenie nového záznamu
3. Vyplňte povinné polia:
   - Dátum: vyberte dátum jazdy
   - Vozidlo: vyberte vozidlo zo zoznamu
   - Odkiaľ: zadajte miesto odchodu
   - Kam: zadajte cieľ cesty
   - Účel: zadajte účel jazdy
4. Kliknite na tlačidlo "Uložiť"
5. Systém automaticky vypočíta vzdialenosť a náklady

#### Príklad: Prepojenie záznamu dochádzky s výkazom prác

1. Otvorte databázu "Dochádzka"
2. Vyberte existujúci záznam alebo vytvorte nový
3. V sekcii "Práce" kliknite na "Pridať prácu"
4. Vyberte zákazku zo zoznamu
5. Zadajte čas začiatku a konca práce
6. Kliknite na tlačidlo "Uložiť"
7. Systém automaticky prepojí záznam dochádzky s výkazom prác

## 3. Príloha

### Navrhovaná štruktúra

#### 3.1 Databázy a ich štruktúra
- Systémové databázy
  - ASISTANTO
  - ASISTANTO DB
  - ASISTANTO Errors
  - ASISTANTO Tenants
  - ASISTANTO Scripts
  - ASISTANTO ToDo
- Projektové databázy
  - Cenové ponuky
  - CP Diely
  - Zákazky
  - Vyúčtovania
  - Cenník prác
  - Plán prác
  - Výkaz prác
  - Výkaz materiálu
  - Výkaz strojov
  - Výkaz dopravy
  - Stavebný denník
- Administratívne databázy
  - Inventúry
  - Príjemky
  - Rezervácie
  - Objednávky
  - Faktúry prijaté
  - Faktúry odoslané
  - Pohľadávky
  - Záväzky
- Evidenčné databázy
  - Pokladňa
  - Evidencia prác
  - Dochádzka
  - Kniha jázd
- Databázy údajov
  - Sklad
  - Externý sklad
  - Zamestnanci
  - Klienti
  - Dodávatelia
  - Partneri
  - Miesta
  - Databáza rastlín
  - Účty
  - Sadzby zamestnancov
  - Limity pracovných hodín
  - Sezónne ceny prác a strojov
  - Sezónne ceny materiálu
  - Stroje

#### 3.2 Detailný popis polí
- Pre každú databázu:
  - Názov poľa
  - Typ poľa
  - Popis a účel
  - Prepojenie s inými poľami
  - Validačné pravidlá
  - Predvolené hodnoty

#### 3.3 Vzťahy medzi databázami
- Diagram vzťahov (ER diagram)
- Popis vzťahov medzi databázami
- Kaskádové akcie a obmedzenia

#### 3.4 Skripty a triggery
- Zoznam skriptov pre každú databázu
- Popis triggerov a ich účel
- Popis akcií a ich účel

### Príklady obsahu

#### Príklad: Popis databázy Kniha jázd

**Názov**: Kniha jázd
**Účel**: Evidencia jázd vozidiel, výpočet vzdialeností a nákladov
**Prepojené databázy**: Vozidlá, Zamestnanci, Zákazky

**Polia**:
- **Dátum** (Dátum)
  - Popis: Dátum jazdy
  - Povinné: Áno
  - Predvolená hodnota: Aktuálny dátum
- **Vozidlo** (Odkaz)
  - Popis: Odkaz na vozidlo
  - Prepojená databáza: Vozidlá
  - Povinné: Áno
- **Odkiaľ** (Text)
  - Popis: Miesto odchodu
  - Povinné: Áno
- **Kam** (Text)
  - Popis: Cieľ cesty
  - Povinné: Áno
- **Účel** (Text)
  - Popis: Účel jazdy
  - Povinné: Áno
- **Vzdialenosť (km)** (Číslo)
  - Popis: Vzdialenosť v kilometroch
  - Výpočet: Automaticky na základe miest Odkiaľ a Kam
- **Spotreba (l)** (Číslo)
  - Popis: Spotreba paliva v litroch
  - Výpočet: Vzdialenosť * Priemerná spotreba vozidla / 100
- **Náklady (€)** (Číslo)
  - Popis: Náklady na jazdu
  - Výpočet: Spotreba * Cena paliva

**Triggery**:
- **createEntryOpen**: Nastaví predvolené hodnoty pri vytvorení záznamu
- **entryBeforeSave**: Vypočíta vzdialenosť, spotrebu a náklady pred uložením záznamu

**Akcie**:
- **generateReport**: Vygeneruje report o jazde
- **exportToCSV**: Exportuje záznamy do CSV súboru

#### Príklad: ER diagram (textový popis)

```
Kniha jázd (1) --- (N) Zákazky
Kniha jázd (N) --- (1) Vozidlá
Kniha jázd (N) --- (1) Zamestnanci
Dochádzka (1) --- (N) Výkaz prác
Dochádzka (N) --- (1) Zamestnanci
Cenové ponuky (1) --- (N) CP Diely
Cenové ponuky (N) --- (1) Klienti
Zákazky (1) --- (N) Výkaz prác
Zákazky (1) --- (N) Výkaz materiálu
Zákazky (1) --- (N) Výkaz strojov
Zákazky (1) --- (N) Výkaz dopravy
```

## Záver

Táto analýza poskytuje základnú štruktúru pre vytvorenie komplexnej dokumentácie frameworku ASISTANTO STD. Dokumentácia bude rozdelená do troch hlavných častí, ktoré pokrývajú potreby rôznych skupín používateľov - od technických administrátorov až po koncových používateľov.

Dokumentácia by mala byť pravidelne aktualizovaná pri každej zmene frameworku, pridaní nových funkcií alebo oprave chýb. Odporúča sa vytvoriť proces revízie dokumentácie, ktorý zabezpečí jej aktuálnosť a presnosť.

Pre lepšiu prehľadnosť a dostupnosť by dokumentácia mala byť dostupná v elektronickej forme, ideálne ako súčasť GitHub repozitára frameworku, s možnosťou exportu do PDF alebo HTML formátu pre offline použitie.
