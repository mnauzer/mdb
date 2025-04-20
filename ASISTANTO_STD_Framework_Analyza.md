# Analýza a návrh refaktoringu frameworku ASISTANTO STD

## Obsah
1. [Úvod](#úvod)
2. [Súčasný stav](#súčasný-stav)
3. [Cieľový stav](#cieľový-stav)
4. [Návrh architektúry](#návrh-architektúry)
5. [Plán implementácie](#plán-implementácie)
6. [Štruktúra knižníc](#štruktúra-knižníc)
7. [Konvencie pomenovania](#konvencie-pomenovania)
8. [Integrácia s GitHub](#integrácia-s-github)
9. [Dokumentácia](#dokumentácia)

## Úvod

Tento dokument obsahuje analýzu súčasného stavu frameworku ASISTANTO a návrh jeho refaktoringu na ASISTANTO STD. Cieľom refaktoringu je vytvoriť štandardizovaný, modulárny a ľahko rozšíriteľný framework pre Memento Database, ktorý bude možné jednoducho integrovať do rôznych databáz.

## Súčasný stav

Súčasný framework ASISTANTO pozostáva z niekoľkých JavaScript súborov, ktoré obsahujú rôzne funkcie a moduly pre prácu s Memento Database. Tieto súbory sú:

- **appConstants.js** - Konštanty pre aplikáciu
- **fieldConstants.js** - Konštanty pre polia
- **tableConstants.js** - Konštanty pre tabuľky
- **attributeConstants.js** - Konštanty pre atribúty
- **app_v2_1.js** - Hlavný súbor aplikácie
- **libKnihaJazd.js** - Knižnica pre Knihu jázd
- **std_utils_refactored.js** - Refaktorované utility funkcie
- **std_triggers_refactored.js** - Refaktorované triggery
- **std_constants.js** - Refaktorované konštanty
- **std_html_generator.js** - Generátor HTML
- **std_html_generator_fixed.js** - Opravený generátor HTML
- **std_html_template_loader.js** - Načítavač HTML šablón

Súčasný framework má niekoľko problémov:
- Nekonzistentné pomenovanie súborov a funkcií
- Duplicitný kód
- Chýbajúca modulárnosť
- Chýbajúca dokumentácia
- Ťažká rozšíriteľnosť
- Ťažká údržba

## Cieľový stav

Cieľom refaktoringu je vytvoriť framework ASISTANTO STD, ktorý bude:
- Používať konzistentné pomenovanie s prefixom "std"
- Modulárny a ľahko rozšíriteľný
- Dobre dokumentovaný
- Ľahko integrovateľný do rôznych databáz
- Načítavať knižnice z GitHubu
- Mať jasnú štruktúru a architektúru

## Návrh architektúry

Framework ASISTANTO STD bude pozostávať z nasledujúcich hlavných komponentov:

1. **Základné knižnice** - Všeobecné knižnice použiteľné vo viacerých databázach
   - **std.Constants** - Konštanty pre celý framework
   - **std.Utils** - Utility funkcie
   - **std.ErrorHandler** - Spracovanie chýb
   - **std.Triggers** - Univerzálne triggery
   - **std.HTML** - Generovanie HTML a práca so šablónami

2. **Špecifické knižnice** - Knižnice pre konkrétne databázy
   - **std.Zamestnanci** - Funkcie pre databázu Zamestnanci
   - **std.Dochadzka** - Funkcie pre databázu Dochádzka
   - **std.KnihaJazd** - Funkcie pre databázu Kniha jázd
   - **std.CenovePonuky** - Funkcie pre databázu Cenové ponuky
   - atď.

3. **Triggery** - Triggery pre jednotlivé databázy
   - Univerzálne triggery v knižnici std.Triggers
   - Špecifické triggery v knižniciach pre konkrétne databázy

4. **Akcie** - Akcie pre jednotlivé databázy
   - Univerzálne akcie v knižnici std.Actions
   - Špecifické akcie v knižniciach pre konkrétne databázy

## Plán implementácie

1. **Fáza 1: Refaktoring základných knižníc**
   - Refaktoring konštánt do std.Constants
   - Refaktoring utility funkcií do std.Utils
   - Refaktoring spracovania chýb do std.ErrorHandler
   - Refaktoring triggerov do std.Triggers
   - Refaktoring generovania HTML do std.HTML

2. **Fáza 2: Refaktoring špecifických knižníc**
   - Refaktoring knižnice Kniha jázd do std.KnihaJazd
   - Vytvorenie ďalších špecifických knižníc podľa potreby

3. **Fáza 3: Integrácia s GitHub**
   - Vytvorenie repozitára na GitHube
   - Nastavenie načítavania knižníc z GitHubu
   - Vytvorenie dokumentácie pre integráciu

4. **Fáza 4: Dokumentácia**
   - Vytvorenie dokumentácie pre každú knižnicu
   - Vytvorenie príkladov použitia
   - Vytvorenie návodu na integráciu do nových databáz

## Štruktúra knižníc

### Základné knižnice

#### std.Constants
- Konštanty pre celý framework
- Konštanty pre polia, tabuľky, atribúty, správy, farby, atď.

#### std.Utils
- Utility funkcie pre prácu s dátumami, reťazcami, číslami, objektami, poliami, atď.
- Funkcie pre generovanie čísla záznamu
- Funkcie pre prácu s historickými dátami

#### std.ErrorHandler
- Funkcie pre spracovanie chýb
- Funkcie pre logovanie chýb
- Funkcie pre zobrazovanie chybových správ

#### std.Triggers
- Univerzálne triggery pre všetky databázy
- Funkcie pre spracovanie udalostí v Memento Database

#### std.HTML
- Funkcie pre generovanie HTML
- Funkcie pre načítavanie a spracovanie HTML šablón

### Špecifické knižnice

#### std.KnihaJazd
- Funkcie pre výpočet vzdialenosti
- Funkcie pre prácu so súradnicami
- Funkcie pre generovanie reportov

#### std.Dochadzka
- Funkcie pre výpočet odpracovaného času
- Funkcie pre generovanie výkazov
- Funkcie pre spracovanie dochádzky

#### std.Zamestnanci
- Funkcie pre správu zamestnancov
- Funkcie pre výpočet miezd
- Funkcie pre generovanie reportov

#### std.CenovePonuky
- Funkcie pre výpočet cien
- Funkcie pre generovanie cenových ponúk
- Funkcie pre správu cenových ponúk

## Konvencie pomenovania

- **Súbory**: Všetky súbory budú mať prefix "std_" a budú používať camelCase, napr. "std_utils.js", "std_errorHandler.js"
- **Knižnice**: Všetky knižnice budú mať namespace "std" a budú používať PascalCase, napr. "std.Utils", "std.ErrorHandler"
- **Funkcie**: Všetky funkcie budú používať camelCase, napr. "generateEntryNumber", "formatDate"
- **Konštanty**: Všetky konštanty budú používať UPPER_SNAKE_CASE, napr. "FIELDS_COMMON_DATE", "LIBRARIES_SYSTEM_APP"
- **Premenné**: Všetky premenné budú používať camelCase, napr. "entryNumber", "currentLib"

## Integrácia s GitHub

Framework ASISTANTO STD bude uložený v GitHub repozitári, ktorý bude obsahovať všetky knižnice a dokumentáciu. Knižnice budú načítavané priamo z GitHubu do Memento Database pomocou URL adresy.

Príklad načítania knižnice z GitHubu:
```javascript
// V script editore Memento Database
// Nastavenie URL adresy knižnice v Properties
// Potom v script editore len volanie funkcie
std.Triggers.createEntryOpen();
```

## Dokumentácia

Každá knižnica bude mať vlastnú dokumentáciu, ktorá bude obsahovať:
- Popis knižnice
- Zoznam funkcií
- Parametre funkcií
- Návratové hodnoty funkcií
- Príklady použitia
- Potrebné knižnice pre fungovanie

Dokumentácia bude uložená v GitHub repozitári a bude dostupná online.
