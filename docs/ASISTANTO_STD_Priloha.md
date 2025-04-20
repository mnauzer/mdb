# ASISTANTO STD - Príloha

## 1. Databázy a ich štruktúra

Táto príloha obsahuje detailný popis databáz, polí a ich vzťahov v systéme ASISTANTO STD. Databázy sú rozdelené do logických skupín podľa ich účelu.

### 1.1 Systémové databázy

#### 1.1.1 ASISTANTO

**Účel**: Hlavná databáza aplikácie, slúži ako vstupný bod do systému.

**Polia**:
- **Názov** (Text) - Názov položky v menu
- **Ikona** (Text) - Názov ikony
- **Typ** (Výber) - Typ položky (Databáza, Sekcia, Odkaz)
- **Databáza** (Odkaz) - Odkaz na databázu v ASISTANTO DB
- **URL** (Text) - URL adresa pre typ Odkaz
- **Sekcia** (Odkaz) - Nadradená sekcia
- **Poradie** (Číslo) - Poradie zobrazenia v menu
- **Viditeľnosť** (Výber) - Viditeľnosť položky (Všetci, Administrátori, Používatelia)

#### 1.1.2 ASISTANTO DB

**Účel**: Databáza s informáciami o ostatných databázach.

**Polia**:
- **Názov** (Text) - Názov databázy
- **Popis** (Text) - Popis databázy
- **Typ** (Výber) - Typ databázy (Systémová, Projektová, Administratívna, Evidenčná, Údajová)
- **Prefix** (Text) - Prefix pre číslovanie záznamov
- **Generovať čísla** (Áno/Nie) - Či sa majú generovať čísla záznamov
- **Formát čísla** (Text) - Formát čísla záznamu (napr. "YYYY-MM-####")
- **Posledné číslo** (Číslo) - Posledné vygenerované číslo
- **Aktívna** (Áno/Nie) - Či je databáza aktívna

#### 1.1.3 ASISTANTO Errors

**Účel**: Databáza s chybovými hláseniami a logmi.

**Polia**:
- **Typ** (Výber) - Typ záznamu (ERROR, WARNING, INFO)
- **Zdroj** (Text) - Zdroj záznamu (názov modulu a funkcie)
- **Správa** (Text) - Text správy
- **Dátum** (Dátum a čas) - Dátum a čas vytvorenia záznamu
- **Používateľ** (Text) - Používateľ, ktorý vyvolal akciu
- **Zariadenie** (Text) - Zariadenie, na ktorom sa vyskytla chyba
- **Verzia aplikácie** (Text) - Verzia aplikácie
- **Stacktrace** (Text) - Stacktrace chyby

#### 1.1.4 ASISTANTO Tenants

**Účel**: Databáza s informáciami o nájomníkoch (firmách).

**Polia**:
- **Názov** (Text) - Názov nájomníka (firmy)
- **Skratka** (Text) - Skratka nájomníka (firmy)
- **IČO** (Text) - IČO nájomníka (firmy)
- **DIČ** (Text) - DIČ nájomníka (firmy)
- **IČ DPH** (Text) - IČ DPH nájomníka (firmy)
- **Adresa** (Text) - Adresa nájomníka (firmy)
- **Telefón** (Text) - Telefónne číslo nájomníka (firmy)
- **Email** (Text) - Emailová adresa nájomníka (firmy)
- **Web** (Text) - Webová stránka nájomníka (firmy)
- **Logo** (Obrázok) - Logo nájomníka (firmy)
- **Aktívny** (Áno/Nie) - Či je nájomník (firma) aktívny

#### 1.1.5 ASISTANTO Scripts

**Účel**: Databáza so skriptami.

**Polia**:
- **Názov** (Text) - Názov skriptu
- **Popis** (Text) - Popis skriptu
- **Kód** (Text) - Kód skriptu
- **Verzia** (Text) - Verzia skriptu
- **Autor** (Text) - Autor skriptu
- **Dátum vytvorenia** (Dátum) - Dátum vytvorenia skriptu
- **Dátum aktualizácie** (Dátum) - Dátum poslednej aktualizácie skriptu
- **Aktívny** (Áno/Nie) - Či je skript aktívny

#### 1.1.6 ASISTANTO ToDo

**Účel**: Databáza s úlohami.

**Polia**:
- **Názov** (Text) - Názov úlohy
- **Popis** (Text) - Popis úlohy
- **Priorita** (Výber) - Priorita úlohy (Nízka, Stredná, Vysoká)
- **Stav** (Výber) - Stav úlohy (Nová, V riešení, Dokončená, Zrušená)
- **Termín** (Dátum) - Termín dokončenia úlohy
- **Priradená** (Odkaz) - Zamestnanec, ktorému je úloha priradená
- **Vytvoril** (Text) - Používateľ, ktorý vytvoril úlohu
- **Dátum vytvorenia** (Dátum) - Dátum vytvorenia úlohy
- **Dokončil** (Text) - Používateľ, ktorý dokončil úlohu
- **Dátum dokončenia** (Dátum) - Dátum dokončenia úlohy

### 1.2 Projektové databázy

#### 1.2.1 Cenové ponuky

**Účel**: Evidencia cenových ponúk.

**Polia**:
- **Číslo** (Text) - Číslo cenovej ponuky
- **Dátum** (Dátum) - Dátum vytvorenia cenovej ponuky
- **Klient** (Odkaz) - Odkaz na klienta
- **Miesto realizácie** (Text) - Miesto realizácie
- **Popis cenovej ponuky** (Text) - Popis cenovej ponuky
- **Platnosť ponuky** (Číslo) - Počet dní platnosti ponuky
- **Diely** (Odkaz) - Odkaz na diely cenovej ponuky
- **Cena bez DPH** (Číslo) - Cena cenovej ponuky bez DPH
- **DPH** (Číslo) - DPH cenovej ponuky
- **Cena s DPH** (Číslo) - Cena cenovej ponuky s DPH
- **Stav** (Výber) - Stav cenovej ponuky (Nová, Odoslaná, Akceptovaná, Odmietnutá)
- **Zákazka** (Odkaz) - Odkaz na zákazku
- **Zapísal** (Text) - Používateľ, ktorý vytvoril cenovú ponuku
- **Dátum zápisu** (Dátum) - Dátum vytvorenia cenovej ponuky
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil cenovú ponuku
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy cenovej ponuky

#### 1.2.2 CP Diely

**Účel**: Evidencia dielov cenových ponúk.

**Polia**:
- **Názov** (Text) - Názov dielu
- **Popis** (Text) - Popis dielu
- **Cenová ponuka** (Odkaz) - Odkaz na cenovú ponuku
- **Položky** (Odkaz) - Odkaz na položky dielu
- **Cena bez DPH** (Číslo) - Cena dielu bez DPH
- **DPH** (Číslo) - DPH dielu
- **Cena s DPH** (Číslo) - Cena dielu s DPH
- **Poradie** (Číslo) - Poradie dielu v cenovej ponuke
- **Zapísal** (Text) - Používateľ, ktorý vytvoril diel
- **Dátum zápisu** (Dátum) - Dátum vytvorenia dielu
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil diel
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy dielu

#### 1.2.3 Zákazky

**Účel**: Evidencia zákaziek.

**Polia**:
- **Číslo** (Text) - Číslo zákazky
- **Dátum** (Dátum) - Dátum vytvorenia zákazky
- **Klient** (Odkaz) - Odkaz na klienta
- **Miesto realizácie** (Text) - Miesto realizácie
- **Popis zákazky** (Text) - Popis zákazky
- **Cenová ponuka** (Odkaz) - Odkaz na cenovú ponuku
- **Termín začiatku** (Dátum) - Termín začiatku realizácie
- **Termín ukončenia** (Dátum) - Termín ukončenia realizácie
- **Stav** (Výber) - Stav zákazky (Nová, V realizácii, Dokončená, Zrušená)
- **Výkaz prác** (Odkaz) - Odkaz na výkazy prác
- **Výkaz materiálu** (Odkaz) - Odkaz na výkazy materiálu
- **Výkaz strojov** (Odkaz) - Odkaz na výkazy strojov
- **Výkaz dopravy** (Odkaz) - Odkaz na výkazy dopravy
- **Faktúry** (Odkaz) - Odkaz na faktúry
- **Zapísal** (Text) - Používateľ, ktorý vytvoril zákazku
- **Dátum zápisu** (Dátum) - Dátum vytvorenia zákazky
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil zákazku
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy zákazky

### 1.3 Administratívne databázy

#### 1.3.1 Faktúry odoslané

**Účel**: Evidencia odoslaných faktúr.

**Polia**:
- **Číslo faktúry** (Text) - Číslo faktúry
- **Dátum** (Dátum) - Dátum vystavenia faktúry
- **Klient** (Odkaz) - Odkaz na klienta
- **Zákazka** (Odkaz) - Odkaz na zákazku
- **Dátum splatnosti** (Dátum) - Dátum splatnosti faktúry
- **Dátum úhrady** (Dátum) - Dátum úhrady faktúry
- **Položky** (Odkaz) - Odkaz na položky faktúry
- **Cena bez DPH** (Číslo) - Cena faktúry bez DPH
- **DPH** (Číslo) - DPH faktúry
- **Cena s DPH** (Číslo) - Cena faktúry s DPH
- **Stav** (Výber) - Stav faktúry (Nová, Odoslaná, Uhradená, Stornovaná)
- **Pohľadávka** (Odkaz) - Odkaz na pohľadávku
- **Zapísal** (Text) - Používateľ, ktorý vytvoril faktúru
- **Dátum zápisu** (Dátum) - Dátum vytvorenia faktúry
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil faktúru
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy faktúry

### 1.4 Evidenčné databázy

#### 1.4.1 Kniha jázd

**Účel**: Evidencia jázd vozidiel.

**Polia**:
- **Číslo** (Text) - Číslo záznamu
- **Dátum** (Dátum) - Dátum jazdy
- **Vozidlo** (Odkaz) - Odkaz na vozidlo
- **Vodič** (Odkaz) - Odkaz na zamestnanca (vodiča)
- **Odkiaľ** (Text) - Miesto odchodu
- **Kam** (Text) - Cieľ cesty
- **Účel** (Text) - Účel jazdy
- **Vzdialenosť (km)** (Číslo) - Vzdialenosť v kilometroch
- **Spotreba (l)** (Číslo) - Spotreba paliva v litroch
- **Náklady (€)** (Číslo) - Náklady na jazdu
- **Zákazka** (Odkaz) - Odkaz na zákazku
- **Zapísal** (Text) - Používateľ, ktorý vytvoril záznam
- **Dátum zápisu** (Dátum) - Dátum vytvorenia záznamu
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil záznam
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy záznamu

#### 1.4.2 Dochádzka

**Účel**: Evidencia dochádzky zamestnancov.

**Polia**:
- **Číslo** (Text) - Číslo záznamu
- **Dátum** (Dátum) - Dátum dochádzky
- **Zamestnanec** (Odkaz) - Odkaz na zamestnanca
- **Príchod** (Čas) - Čas príchodu
- **Odchod** (Čas) - Čas odchodu
- **Pracovná doba** (Číslo) - Čas medzi príchodom a odchodom
- **Prestoje** (Odkaz) - Odkaz na prestoje
- **Odpracované** (Číslo) - Odpracované hodiny
- **Mzdové náklady** (Číslo) - Náklady na mzdu
- **Práce** (Odkaz) - Odkaz na výkazy prác
- **Zapísal** (Text) - Používateľ, ktorý vytvoril záznam
- **Dátum zápisu** (Dátum) - Dátum vytvorenia záznamu
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil záznam
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy záznamu

### 1.5 Databázy údajov

#### 1.5.1 Zamestnanci

**Účel**: Evidencia zamestnancov.

**Polia**:
- **Meno** (Text) - Meno zamestnanca
- **Priezvisko** (Text) - Priezvisko zamestnanca
- **Telefón** (Text) - Telefónne číslo zamestnanca
- **Email** (Text) - Emailová adresa zamestnanca
- **Adresa** (Text) - Adresa zamestnanca
- **Dátum narodenia** (Dátum) - Dátum narodenia zamestnanca
- **Rodné číslo** (Text) - Rodné číslo zamestnanca
- **Číslo OP** (Text) - Číslo občianskeho preukazu zamestnanca
- **Pozícia** (Text) - Pracovná pozícia zamestnanca
- **Dátum nástupu** (Dátum) - Dátum nástupu do zamestnania
- **Dátum výstupu** (Dátum) - Dátum výstupu zo zamestnania
- **Hodinová sadzba** (Číslo) - Hodinová sadzba zamestnanca
- **Aktívny** (Áno/Nie) - Či je zamestnanec aktívny
- **Zapísal** (Text) - Používateľ, ktorý vytvoril záznam
- **Dátum zápisu** (Dátum) - Dátum vytvorenia záznamu
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil záznam
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy záznamu

#### 1.5.2 Klienti

**Účel**: Evidencia klientov.

**Polia**:
- **Názov** (Text) - Názov klienta (firmy)
- **IČO** (Text) - IČO klienta
- **DIČ** (Text) - DIČ klienta
- **IČ DPH** (Text) - IČ DPH klienta
- **Adresa** (Text) - Adresa klienta
- **Telefón** (Text) - Telefónne číslo klienta
- **Email** (Text) - Emailová adresa klienta
- **Web** (Text) - Webová stránka klienta
- **Kontaktná osoba** (Text) - Kontaktná osoba klienta
- **Telefón kontaktnej osoby** (Text) - Telefónne číslo kontaktnej osoby
- **Email kontaktnej osoby** (Text) - Emailová adresa kontaktnej osoby
- **Bankové spojenie** (Text) - Bankové spojenie klienta
- **IBAN** (Text) - IBAN klienta
- **Aktívny** (Áno/Nie) - Či je klient aktívny
- **Zapísal** (Text) - Používateľ, ktorý vytvoril záznam
- **Dátum zápisu** (Dátum) - Dátum vytvorenia záznamu
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil záznam
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy záznamu

## 2. Detailný popis polí

### 2.1 Spoločné polia

Nasledujúce polia sa vyskytujú vo väčšine databáz:

- **Číslo** (Text) - Číslo záznamu, generované automaticky podľa nastavení v ASISTANTO DB
- **Dátum** (Dátum) - Dátum vytvorenia záznamu, predvolená hodnota je aktuálny dátum
- **Zapísal** (Text) - Používateľ, ktorý vytvoril záznam, vyplnené automaticky
- **Dátum zápisu** (Dátum) - Dátum vytvorenia záznamu, vyplnené automaticky
- **Upravil** (Text) - Používateľ, ktorý naposledy upravil záznam, vyplnené automaticky
- **Dátum úpravy** (Dátum) - Dátum poslednej úpravy záznamu, vyplnené automaticky

### 2.2 Polia pre generovanie čísel záznamov

Nasledujúce polia v databáze ASISTANTO DB sa používajú pre generovanie čísel záznamov:

- **Prefix** (Text) - Prefix pre číslovanie záznamov, napríklad "FAK" pre faktúry
- **Generovať čísla** (Áno/Nie) - Či sa majú generovať čísla záznamov
- **Formát čísla** (Text) - Formát čísla záznamu, napríklad "YYYY-MM-####"
  - YYYY - Rok (4 číslice)
  - YY - Rok (2 číslice)
  - MM - Mesiac (2 číslice)
  - DD - Deň (2 číslice)
  - #### - Poradové číslo (ľubovoľný počet číslic)
- **Posledné číslo** (Číslo) - Posledné vygenerované číslo

### 2.3 Polia pre výpočet cien

Nasledujúce polia sa používajú pre výpočet cien:

- **Cena bez DPH** (Číslo) - Cena bez DPH, vypočítaná automaticky
- **DPH** (Číslo) - DPH, vypočítaná automaticky ako Cena bez DPH * Sadzba DPH
- **Cena s DPH** (Číslo) - Cena s DPH, vypočítaná automaticky ako Cena bez DPH + DPH

### 2.4 Polia pre výpočet vzdialenosti a nákladov

Nasledujúce polia v databáze Kniha jázd sa používajú pre výpočet vzdialenosti a nákladov:

- **Vzdialenosť (km)** (Číslo) - Vzdialenosť v kilometroch, vypočítaná automaticky na základe miest Odkiaľ a Kam
- **Spotreba (l)** (Číslo) - Spotreba paliva v litroch, vypočítaná automaticky ako Vzdialenosť * Priemerná spotreba vozidla / 100
- **Náklady (€)** (Číslo) - Náklady na jazdu, vypočítané automaticky ako Spotreba * Cena paliva

### 2.5 Polia pre výpočet odpracovaného času

Nasledujúce polia v databáze Dochádzka sa používajú pre výpočet odpracovaného času:

- **Pracovná doba** (Číslo) - Čas medzi príchodom a odchodom, vypočítaný automaticky ako Odchod - Príchod
- **Odpracované** (Číslo) - Odpracované hodiny, vypočítané automaticky ako Pracovná doba - Prestoje
- **Mzdové náklady** (Číslo) - Náklady na mzdu, vypočítané automaticky ako Odpracované * Hodinová sadzba zamestnanca

## 3. Vzťahy medzi databázami

### 3.1 Diagram vzťahov

```
+----------------+     +----------------+     +----------------+
| Cenové ponuky  |     | CP Diely       |     | Položky        |
+----------------+     +----------------+     +----------------+
| PK: ID         |<----| FK: CP_ID      |<----| FK: Diel_ID    |
| Klient_ID      |     | PK: ID         |     | PK: ID         |
+----------------+     +----------------+     +----------------+
       |
       |
       v
+----------------+     +----------------+     +----------------+
| Zákazky        |     | Výkaz prác     |     | Dochádzka      |
+----------------+     +----------------+     +----------------+
| PK: ID         |<----| FK: Zakazka_ID |<----| FK: Praca_ID   |
| Klient_ID      |     | PK: ID         |     | PK: ID         |
| CP_ID          |     | Zamestnanec_ID |---->| Zamestnanec_ID |
+----------------+     +----------------+     +----------------+
       |                      |
       |                      |
       v                      v
+----------------+     +----------------+     +----------------+
| Faktúry        |     | Kniha jázd     |     | Vozidlá        |
+----------------+     +----------------+     +----------------+
| PK: ID         |     | PK: ID         |<----| PK: ID         |
| Klient_ID      |     | Zakazka_ID     |     |                |
| Zakazka_ID     |     | Zamestnanec_ID |     |                |
+----------------+     +----------------+     +----------------+
       |
       |
       v
+----------------+     +----------------+
| Pohľadávky     |     | Klienti        |
+----------------+     +----------------+
| PK: ID         |     | PK: ID         |
| Faktura_ID     |<----|                |
+----------------+     +----------------+
```

### 3.2 Popis vzťahov

#### 3.2.1 Cenové ponuky a CP Diely

- Cenová ponuka môže obsahovať viacero dielov (1:N)
- Diel patrí práve jednej cenovej ponuke (N:1)

#### 3.2.2 CP Diely a Položky

- Diel môže obsahovať viacero položiek (1:N)
- Položka patrí práve jednému dielu (N:1)

#### 3.2.3 Cenové ponuky a Zákazky

- Cenová ponuka môže byť priradená k jednej zákazke (1:1)
- Zákazka môže byť vytvorená z jednej cenovej ponuky (1:1)

#### 3.2.4 Zákazky a Výkaz prác

- Zákazka môže obsahovať viacero výkazov prác (1:N)
- Výkaz práce patrí práve jednej zákazke (N:1)

#### 3.2.5 Výkaz prác a Dochádzka

- Výkaz práce môže byť priradený k jednej dochádzke (1:1)
- Dochádzka môže obsahovať viacero výkazov prác (1:N)

#### 3.2.6 Zákazky a Faktúry

- Zákazka môže byť fakturovaná viacerými faktúrami (1:N)
- Faktúra môže byť priradená k jednej zákazke (N:1)

#### 3.2.7 Faktúry a Pohľadávky

- Faktúra vytvára práve jednu pohľadávku (1:1)
- Pohľadávka je vytvorená práve z jednej faktúry (1:1)

#### 3.2.8 Zákazky a Kniha jázd

- Zákazka môže obsahovať viacero jázd (1:N)
- Jazda môže byť priradená k jednej zákazke (N:1)

#### 3.2.9 Kniha jázd a Vozidlá

- Vozidlo môže byť použité vo viacerých jazdách (1:N)
- Jazda je priradená práve jednému vozidlu (N:1)

#### 3.2.10 Klienti a Cenové ponuky, Zákazky, Faktúry

- Klient môže mať viacero cenových ponúk (1:N)
- Klient môže mať viacero zákaziek (1:N)
- Klient môže mať viacero faktúr (1:N)
- Cenová ponuka patrí práve jednému klientovi (N:1)
- Zákazka patrí práve jednému klientovi (N:1)
- Faktúra patrí práve jednému klientovi (N:1)

#### 3.2.11 Zamestnanci a Dochádzka, Kniha jázd, Výkaz prác

- Zamestnanec môže mať viacero záznamov dochádzky (1:N)
- Zamestnanec môže byť vodičom vo viacerých jazdách (1:N)
- Zamestnanec môže mať viacero výkazov prác (1:N)
- Záznam dochádzky patrí práve jednému zamestnancovi (N:1)
- Jazda má práve jedného vodiča (N:1)
- Výkaz práce patrí práve jednému zamestnancovi (N:1)

## 4. Skripty a triggery

### 4.1 Triggery pre Knihu jázd

#### 4.1.1 createEntryOpen

Trigger sa spustí pri vytvorení nového záznamu v Knihe jázd. Nastaví predvolené hodnoty:
- **Dátum** = Aktuálny dátum
- **Vozidlo** = Predvolené vozidlo používateľa (ak je nastavené)
- **Vodič** = Aktuálny používateľ (ak je zamestnanec)

#### 4.1.2 entryBeforeSave

Trigger sa spustí pred uložením záznamu v Knihe jázd. Vypočíta:
- **Vzdialenosť (km)** = Vzdialenosť medzi miestom odchodu a cieľom
- **Spotreba (l)** = Vzdialenosť * Priemerná spotreba vozidla / 100
- **Náklady (€)** = Spotreba * Cena paliva

### 4.2 Triggery pre Dochádzku

#### 4.2.1 createEntryOpen

Trigger sa spustí pri vytvorení nového záznamu v Dochádzke. Nastaví predvolené hodnoty:
- **Dátum** = Aktuálny dátum
- **Zamestnanec** = Aktuálny používateľ (ak je zamestnanec)
- **Príchod** = Aktuálny čas (zaokrúhlený na štvrťhodinu)

#### 4.2.2 entryBeforeSave

Trigger sa spustí pred uložením záznamu v Dochádzke. Vypočíta:
- **Pracovná doba** = Odchod - Príchod
- **Odpracované** = Pracovná doba - Prestoje
- **Mzdové náklady** = Odpracované * Hodinová sadzba zamestnanca

### 4.3 Triggery pre Cenové ponuky

#### 4.3.1 createEntryOpen

Trigger sa spustí pri vytvorení novej cenovej ponuky. Nastaví predvolené hodnoty:
- **Dátum** = Aktuálny dátum
- **Platnosť ponuky** = 30 (dní)
- **Stav** = Nová

#### 4.3.2 entryBeforeSave

Trigger sa spustí pred uložením cenovej ponuky. Vypočíta:
- **Cena bez DPH** = Súčet cien všetkých dielov bez DPH
- **DPH** = Cena bez DPH * Sadzba DPH
- **Cena s DPH** = Cena bez DPH + DPH

### 4.4 Triggery pre Faktúry

#### 4.4.1 createEntryOpen

Trigger sa spustí pri vytvorení novej faktúry. Nastaví predvolené hodnoty:
- **Dátum** = Aktuálny dátum
- **Dátum splatnosti** = Aktuálny dátum + 14 dní
- **Stav** = Nová

#### 4.4.2 entryBeforeSave

Trigger sa spustí pred uložením faktúry. Vypočíta:
- **Cena bez DPH** = Súčet cien všetkých položiek bez DPH
- **DPH** = Cena bez DPH * Sadzba DPH
- **Cena s DPH** = Cena bez DPH + DPH

#### 4.4.3 entryAfterSave

Trigger sa spustí po uložení faktúry. Vytvorí pohľadávku:
- **Číslo** = Číslo faktúry
- **Dátum** = Dátum faktúry
- **Klient** = Klient faktúry
- **Suma** = Cena faktúry s DPH
- **Dátum splatnosti** = Dátum splatnosti faktúry
- **Faktúra** = Odkaz na faktúru
- **Stav** = Nová

### 4.5 Akcie

#### 4.5.1 generateReport

Akcia vygeneruje report pre aktuálny záznam. Postup:
1. Získa aktuálny záznam
2. Nastaví stav zobrazenia na "Tlač"
3. Načíta šablónu pre daný typ záznamu
4. Ak šablóna existuje, vygeneruje report pomocou šablóny
5. Ak šablóna neexistuje, vygeneruje generický report
6. Vráti vygenerovaný HTML kód

#### 4.5.2 generateInvoice

Akcia vygeneruje faktúru pre aktuálny záznam. Postup:
1. Získa aktuálny záznam
2. Nastaví stav zobrazenia na "Tlač"
3. Načíta šablónu pre faktúru
4. Ak šablóna existuje, vygeneruje faktúru pomocou šablóny
5. Ak šablóna neexistuje, vygeneruje generickú faktúru
6. Vráti vygenerovaný HTML kód

#### 4.5.3 generatePriceQuote

Akcia vygeneruje cenovú ponuku pre aktuálny záznam. Postup:
1. Získa aktuálny záznam
2. Nastaví stav zobrazenia na "Tlač"
3. Načíta šablónu pre cenovú ponuku
4. Ak šablóna existuje, vygeneruje cenovú ponuku pomocou šablóny
5. Ak šablóna neexistuje, vygeneruje generickú cenovú ponuku
6. Vráti vygenerovaný HTML kód

#### 4.5.4 exportToCSV

Akcia exportuje záznamy do CSV súboru. Postup:
1. Získa všetky záznamy z aktuálnej databázy
2. Vygeneruje CSV hlavičku s názvami polí
3. Pre každý záznam vygeneruje riadok s hodnotami polí
4. Uloží CSV súbor
5. Zobrazí hlásenie o úspešnom exporte
6. Vráti vygenerovaný CSV kód

#### 4.5.5 sendEmail

Akcia odošle email s dátami aktuálneho záznamu. Postup:
1. Získa aktuálny záznam
2. Vygeneruje predmet emailu
3. Vygeneruje telo emailu s hodnotami polí
4. Zobrazí dialóg s možnosťou odoslania emailu
5. Po potvrdení odošle email
6. Vráti true ak bolo odoslanie úspešné, inak false
