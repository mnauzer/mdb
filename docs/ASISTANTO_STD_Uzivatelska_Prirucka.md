# ASISTANTO STD - Užívateľská príručka

## 1. Úvod

### 1.1 O aplikácii ASISTANTO

ASISTANTO je komplexný informačný systém pre správu firemných procesov, vyvinutý na platforme Memento Database. Systém poskytuje riešenia pre evidenciu dochádzky, knihu jázd, cenové ponuky, faktúry, skladové hospodárstvo a ďalšie oblasti podnikania.

Aplikácia ASISTANTO je navrhnutá s dôrazom na jednoduchosť používania, flexibilitu a efektívnosť. Vďaka modulárnej architektúre je možné systém prispôsobiť špecifickým potrebám vašej firmy.

### 1.2 Inštalácia a prvé spustenie

#### 1.2.1 Inštalácia Memento Database

1. Otvorte Google Play Store na vašom Android zariadení
2. Vyhľadajte "Memento Database"
3. Kliknite na "Inštalovať"
4. Po dokončení inštalácie kliknite na "Otvoriť"

#### 1.2.2 Inštalácia aplikácie ASISTANTO

1. Otvorte Memento Database
2. Kliknite na menu (tri čiarky v ľavom hornom rohu)
3. Vyberte "Import library"
4. Vyberte "From file" alebo "From URL"
5. Vyberte súbor s aplikáciou ASISTANTO alebo zadajte URL adresu
6. Kliknite na "Import"
7. Počkajte na dokončenie importu

#### 1.2.3 Prvé spustenie

1. Po importe sa zobrazí zoznam databáz aplikácie ASISTANTO
2. Kliknite na databázu "ASISTANTO" pre otvorenie hlavnej databázy
3. Pri prvom spustení sa zobrazí sprievodca nastavením
4. Postupujte podľa pokynov sprievodcu pre nastavenie aplikácie

### 1.3 Základné pojmy a navigácia

#### 1.3.1 Základné pojmy

- **Databáza** - Súbor záznamov určitého typu (napr. Kniha jázd, Dochádzka, Cenové ponuky)
- **Záznam** - Jednotlivý záznam v databáze (napr. jedna jazda, jeden deň dochádzky, jedna cenová ponuka)
- **Pole** - Jednotlivý údaj v zázname (napr. dátum, čas, suma)
- **Trigger** - Automatická akcia, ktorá sa vykoná pri určitej udalosti (napr. pri vytvorení záznamu)
- **Akcia** - Manuálna akcia, ktorú môže používateľ vykonať (napr. generovanie reportu)

#### 1.3.2 Navigácia v aplikácii

- **Hlavné menu** - Dostupné po kliknutí na tri čiarky v ľavom hornom rohu
- **Zoznam databáz** - Zobrazuje sa po otvorení aplikácie alebo po kliknutí na ikonu domov
- **Zoznam záznamov** - Zobrazuje sa po otvorení databázy
- **Detail záznamu** - Zobrazuje sa po kliknutí na záznam v zozname
- **Tlačidlo "+"** - Slúži na vytvorenie nového záznamu
- **Tlačidlo "⋮"** - Zobrazuje kontextové menu s dostupnými akciami

### 1.4 Prehľad databáz a ich účel

#### 1.4.1 Systémové databázy

- **ASISTANTO** - Hlavná databáza aplikácie, slúži ako vstupný bod do systému
- **ASISTANTO DB** - Databáza s informáciami o ostatných databázach
- **ASISTANTO Errors** - Databáza s chybovými hláseniami a logmi
- **ASISTANTO Tenants** - Databáza s informáciami o nájomníkoch (firmách)
- **ASISTANTO Scripts** - Databáza so skriptami
- **ASISTANTO ToDo** - Databáza s úlohami

#### 1.4.2 Projektové databázy

- **Cenové ponuky** - Evidencia cenových ponúk
- **CP Diely** - Evidencia dielov cenových ponúk
- **Zákazky** - Evidencia zákaziek
- **Vyúčtovania** - Evidencia vyúčtovaní
- **Cenník prác** - Evidencia cien prác
- **Plán prác** - Plánovanie prác
- **Výkaz prác** - Evidencia vykonaných prác
- **Výkaz materiálu** - Evidencia použitého materiálu
- **Výkaz strojov** - Evidencia použitých strojov
- **Výkaz dopravy** - Evidencia dopravy
- **Stavebný denník** - Evidencia stavebných prác

#### 1.4.3 Administratívne databázy

- **Inventúry** - Evidencia inventúr
- **Príjemky** - Evidencia príjemiek
- **Rezervácie** - Evidencia rezervácií
- **Objednávky** - Evidencia objednávok
- **Faktúry prijaté** - Evidencia prijatých faktúr
- **Faktúry odoslané** - Evidencia odoslaných faktúr
- **Pohľadávky** - Evidencia pohľadávok
- **Záväzky** - Evidencia záväzkov

#### 1.4.4 Evidenčné databázy

- **Pokladňa** - Evidencia pokladničných dokladov
- **Evidencia prác** - Evidencia vykonaných prác
- **Dochádzka** - Evidencia dochádzky zamestnancov
- **Kniha jázd** - Evidencia jázd vozidiel

#### 1.4.5 Databázy údajov

- **Sklad** - Evidencia skladových zásob
- **Externý sklad** - Evidencia externých skladových zásob
- **Zamestnanci** - Evidencia zamestnancov
- **Klienti** - Evidencia klientov
- **Dodávatelia** - Evidencia dodávateľov
- **Partneri** - Evidencia partnerov
- **Miesta** - Evidencia miest
- **Databáza rastlín** - Evidencia rastlín
- **Účty** - Evidencia účtov
- **Sadzby zamestnancov** - Evidencia sadzieb zamestnancov
- **Limity pracovných hodín** - Evidencia limitov pracovných hodín
- **Sezónne ceny prác a strojov** - Evidencia sezónnych cien prác a strojov
- **Sezónne ceny materiálu** - Evidencia sezónnych cien materiálu
- **Stroje** - Evidencia strojov

## 2. Práca so záznamami

### 2.1 Vytvorenie nového záznamu

Pre vytvorenie nového záznamu postupujte podľa nasledujúcich krokov:

1. Otvorte požadovanú databázu
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte požadované polia
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

Pri vytváraní nového záznamu sa automaticky vyplnia niektoré polia:
- **Dátum** - Aktuálny dátum
- **Číslo** - Automaticky generované číslo záznamu
- **Sezóna** - Aktuálna sezóna
- **Zapísal** - Meno používateľa, ktorý vytvoril záznam
- **Dátum zápisu** - Dátum a čas vytvorenia záznamu

### 2.2 Úprava existujúceho záznamu

Pre úpravu existujúceho záznamu postupujte podľa nasledujúcich krokov:

1. Otvorte požadovanú databázu
2. Kliknite na záznam, ktorý chcete upraviť
3. Upravte požadované polia
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

Pri úprave záznamu sa automaticky vyplnia niektoré polia:
- **Upravil** - Meno používateľa, ktorý upravil záznam
- **Dátum úpravy** - Dátum a čas úpravy záznamu

### 2.3 Odstránenie záznamu

Pre odstránenie záznamu postupujte podľa nasledujúcich krokov:

1. Otvorte požadovanú databázu
2. Kliknite na záznam, ktorý chcete odstrániť
3. Kliknite na tlačidlo "⋮" v pravom hornom rohu
4. Vyberte "Delete"
5. Potvrďte odstránenie kliknutím na "OK"

**Upozornenie:** Odstránenie záznamu je nevratná operácia. Pred odstránením záznamu sa uistite, že ho naozaj chcete odstrániť.

### 2.4 Vyhľadávanie a filtrovanie záznamov

#### 2.4.1 Vyhľadávanie záznamov

Pre vyhľadávanie záznamov postupujte podľa nasledujúcich krokov:

1. Otvorte požadovanú databázu
2. Kliknite na ikonu lupy v hornej časti obrazovky
3. Zadajte hľadaný text
4. Systém zobrazí záznamy, ktoré obsahujú hľadaný text

#### 2.4.2 Filtrovanie záznamov

Pre filtrovanie záznamov postupujte podľa nasledujúcich krokov:

1. Otvorte požadovanú databázu
2. Kliknite na tlačidlo "Filter" v hornej časti obrazovky
3. Vyberte pole, podľa ktorého chcete filtrovať
4. Vyberte operátor (napr. "rovná sa", "obsahuje", "väčšie ako")
5. Zadajte hodnotu
6. Kliknite na "Apply"

Pre pridanie ďalšieho filtračného kritéria kliknite na "Add condition" a opakujte kroky 3-5.

### 2.5 Zobrazenie detailov záznamu

Pre zobrazenie detailov záznamu postupujte podľa nasledujúcich krokov:

1. Otvorte požadovanú databázu
2. Kliknite na záznam, ktorého detaily chcete zobraziť

V detailnom zobrazení záznamu môžete:
- Zobraziť všetky polia záznamu
- Upraviť hodnoty polí
- Vykonať akcie nad záznamom (napr. generovanie reportu)
- Zobraziť prepojené záznamy

## 3. Kniha jázd

### 3.1 Vytvorenie záznamu o jazde

Pre vytvorenie záznamu o jazde postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Kniha jázd"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Dátum** - Dátum jazdy
   - **Vozidlo** - Vyberte vozidlo zo zoznamu
   - **Odkiaľ** - Zadajte miesto odchodu
   - **Kam** - Zadajte cieľ cesty
   - **Účel** - Zadajte účel jazdy
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

Po uložení záznamu systém automaticky vypočíta:
- **Vzdialenosť (km)** - Vzdialenosť medzi miestom odchodu a cieľom
- **Spotreba (l)** - Spotreba paliva na základe vzdialenosti a priemernej spotreby vozidla
- **Náklady (€)** - Náklady na jazdu na základe spotreby a ceny paliva

### 3.2 Výpočet vzdialenosti a nákladov

Systém automaticky vypočíta vzdialenosť a náklady na jazdu na základe nasledujúcich údajov:

- **Vzdialenosť (km)** = Vzdialenosť medzi miestom odchodu a cieľom
- **Spotreba (l)** = Vzdialenosť (km) * Priemerná spotreba vozidla (l/100km) / 100
- **Náklady (€)** = Spotreba (l) * Cena paliva (€/l)

Priemerná spotreba vozidla a cena paliva sú nastavené v databáze vozidiel.

### 3.3 Generovanie reportov

Pre generovanie reportu o jazde postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Kniha jázd"
2. Kliknite na záznam, pre ktorý chcete vygenerovať report
3. Kliknite na tlačidlo "⋮" v pravom hornom rohu
4. Vyberte "Generate Report"
5. Systém vygeneruje report vo formáte HTML
6. Kliknite na "Share" pre zdieľanie reportu alebo "Print" pre tlač reportu

Pre generovanie reportu o všetkých jazdách postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Kniha jázd"
2. Kliknite na tlačidlo "⋮" v pravom hornom rohu
3. Vyberte "Export to CSV"
4. Systém vygeneruje CSV súbor so všetkými jazdami
5. Kliknite na "Share" pre zdieľanie súboru

### 3.4 Prepojenie s inými databázami

Kniha jázd je prepojená s nasledujúcimi databázami:

- **Vozidlá** - Každá jazda je priradená k vozidlu
- **Zamestnanci** - Každá jazda je priradená k zamestnancovi (vodičovi)
- **Zákazky** - Jazda môže byť priradená k zákazke

Pre priradenie jazdy k zákazke postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Kniha jázd"
2. Vytvorte nový záznam alebo otvorte existujúci
3. V poli "Zákazka" kliknite na "Select"
4. Vyberte zákazku zo zoznamu
5. Kliknite na "OK"
6. Uložte záznam

## 4. Dochádzka

### 4.1 Evidencia príchodov a odchodov

Pre evidenciu príchodu a odchodu postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Dochádzka"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Dátum** - Dátum dochádzky
   - **Zamestnanec** - Vyberte zamestnanca zo zoznamu
   - **Príchod** - Zadajte čas príchodu (napr. "7:30")
   - **Odchod** - Zadajte čas odchodu (napr. "16:00")
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

Po uložení záznamu systém automaticky vypočíta:
- **Pracovná doba** - Čas medzi príchodom a odchodom
- **Odpracované** - Odpracované hodiny (pracovná doba mínus prestávky)
- **Mzdové náklady** - Náklady na mzdu na základe odpracovaných hodín a hodinovej sadzby zamestnanca

### 4.2 Výpočet odpracovaného času

Systém automaticky vypočíta odpracovaný čas na základe nasledujúcich údajov:

- **Pracovná doba** = Odchod - Príchod
- **Odpracované** = Pracovná doba - Prestoje
- **Prestoje** = Súčet všetkých prestojov

Prestoje môžete zadať v sekcii "Prestoje" v zázname dochádzky.

### 4.3 Generovanie výkazov

Pre generovanie výkazu dochádzky postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Dochádzka"
2. Kliknite na záznam, pre ktorý chcete vygenerovať výkaz
3. Kliknite na tlačidlo "⋮" v pravom hornom rohu
4. Vyberte "Generate Report"
5. Systém vygeneruje výkaz vo formáte HTML
6. Kliknite na "Share" pre zdieľanie výkazu alebo "Print" pre tlač výkazu

Pre generovanie výkazu o všetkých dochádzach postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Dochádzka"
2. Kliknite na tlačidlo "⋮" v pravom hornom rohu
3. Vyberte "Export to CSV"
4. Systém vygeneruje CSV súbor so všetkými dochádzkami
5. Kliknite na "Share" pre zdieľanie súboru

### 4.4 Prepojenie s inými databázami

Dochádzka je prepojená s nasledujúcimi databázami:

- **Zamestnanci** - Každá dochádzka je priradená k zamestnancovi
- **Výkaz prác** - Dochádzka môže obsahovať výkazy prác
- **Zákazky** - Práce môžu byť priradené k zákazkám

Pre pridanie práce do dochádzky postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Dochádzka"
2. Otvorte záznam, do ktorého chcete pridať prácu
3. V sekcii "Práce" kliknite na "Add"
4. Vyplňte povinné polia:
   - **Zákazka** - Vyberte zákazku zo zoznamu
   - **Začiatok** - Zadajte čas začiatku práce
   - **Koniec** - Zadajte čas konca práce
   - **Popis** - Zadajte popis práce
5. Kliknite na "OK"
6. Uložte záznam

## 5. Cenové ponuky

### 5.1 Vytvorenie cenovej ponuky

Pre vytvorenie cenovej ponuky postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Cenové ponuky"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Dátum** - Dátum vytvorenia cenovej ponuky
   - **Klient** - Vyberte klienta zo zoznamu
   - **Miesto realizácie** - Zadajte miesto realizácie
   - **Popis cenovej ponuky** - Zadajte popis cenovej ponuky
   - **Platnosť ponuky** - Zadajte počet dní platnosti ponuky
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

Po uložení cenovej ponuky môžete pridať diely cenovej ponuky.

### 5.2 Pridanie položiek

Pre pridanie dielu cenovej ponuky postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Cenové ponuky"
2. Otvorte cenovú ponuku, do ktorej chcete pridať diel
3. V sekcii "Diely" kliknite na "Add"
4. Vyplňte povinné polia:
   - **Názov** - Zadajte názov dielu
   - **Popis** - Zadajte popis dielu
5. Kliknite na "OK"
6. Uložte cenovú ponuku

Pre pridanie položky do dielu cenovej ponuky postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "CP Diely"
2. Otvorte diel, do ktorého chcete pridať položku
3. V sekcii "Položky" kliknite na "Add"
4. Vyplňte povinné polia:
   - **Sekcia** - Vyberte sekciu (Materiál, Práce, Stroje, Doprava, Ostatné)
   - **Názov** - Zadajte názov položky
   - **Množstvo** - Zadajte množstvo
   - **Jednotka** - Zadajte jednotku (ks, m, m2, m3, hod, ...)
   - **Cena** - Zadajte cenu za jednotku
5. Kliknite na "OK"
6. Uložte diel

### 5.3 Výpočet ceny

Systém automaticky vypočíta cenu cenovej ponuky na základe nasledujúcich údajov:

- **Cena položky** = Množstvo * Cena za jednotku
- **Cena dielu** = Súčet cien všetkých položiek v diele
- **Cena cenovej ponuky** = Súčet cien všetkých dielov v cenovej ponuke

Ceny sú zobrazené bez DPH a s DPH (20%).

### 5.4 Generovanie PDF

Pre generovanie PDF s cenovou ponukou postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Cenové ponuky"
2. Kliknite na cenovú ponuku, pre ktorú chcete vygenerovať PDF
3. Kliknite na tlačidlo "⋮" v pravom hornom rohu
4. Vyberte "Generate Price Quote"
5. Systém vygeneruje PDF s cenovou ponukou
6. Kliknite na "Share" pre zdieľanie PDF alebo "Print" pre tlač PDF

### 5.5 Prepojenie s inými databázami

Cenové ponuky sú prepojené s nasledujúcimi databázami:

- **Klienti** - Každá cenová ponuka je priradená ku klientovi
- **CP Diely** - Cenová ponuka obsahuje diely
- **Zákazky** - Cenová ponuka môže byť priradená k zákazke

Pre vytvorenie zákazky z cenovej ponuky postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Cenové ponuky"
2. Otvorte cenovú ponuku, z ktorej chcete vytvoriť zákazku
3. Kliknite na tlačidlo "⋮" v pravom hornom rohu
4. Vyberte "Create Job"
5. Systém vytvorí novú zákazku s údajmi z cenovej ponuky
6. Otvorí sa nová zákazka, kde môžete doplniť ďalšie údaje
7. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

## 6. Faktúry

### 6.1 Vytvorenie faktúry

Pre vytvorenie faktúry postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Faktúry odoslané"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Dátum** - Dátum vystavenia faktúry
   - **Klient** - Vyberte klienta zo zoznamu
   - **Číslo faktúry** - Systém automaticky vygeneruje číslo faktúry
   - **Dátum splatnosti** - Zadajte dátum splatnosti faktúry
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

Po uložení faktúry môžete pridať položky faktúry.

### 6.2 Pridanie položiek

Pre pridanie položky do faktúry postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Faktúry odoslané"
2. Otvorte faktúru, do ktorej chcete pridať položku
3. V sekcii "Položky" kliknite na "Add"
4. Vyplňte povinné polia:
   - **Názov** - Zadajte názov položky
   - **Množstvo** - Zadajte množstvo
   - **Jednotka** - Zadajte jednotku (ks, m, m2, m3, hod, ...)
   - **Cena** - Zadajte cenu za jednotku
5. Kliknite na "OK"
6. Uložte faktúru

### 6.3 Výpočet ceny a DPH

Systém automaticky vypočíta cenu faktúry na základe nasledujúcich údajov:

- **Cena položky** = Množstvo * Cena za jednotku
- **Cena faktúry bez DPH** = Súčet cien všetkých položiek
- **DPH** = Cena faktúry bez DPH * Sadzba DPH (20%)
- **Cena faktúry s DPH** = Cena faktúry bez DPH + DPH

### 6.4 Generovanie PDF

Pre generovanie PDF s faktúrou postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Faktúry odoslané"
2. Kliknite na faktúru, pre ktorú chcete vygenerovať PDF
3. Kliknite na tlačidlo "⋮" v pravom hornom rohu
4. Vyberte "Generate Invoice"
5. Systém vygeneruje PDF s faktúrou
6. Kliknite na "Share" pre zdieľanie PDF alebo "Print" pre tlač PDF

### 6.5 Prepojenie s inými databázami

Faktúry sú prepojené s nasledujúcimi databázami:

- **Klienti** - Každá faktúra je priradená ku klientovi
- **Zákazky** - Faktúra môže byť priradená k zákazke
- **Pohľadávky** - Systém automaticky vytvorí pohľadávku pre každú faktúru

Pre priradenie faktúry k zákazke postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Faktúry odoslané"
2. Otvorte faktúru, ktorú chcete priradiť k zákazke
3. V poli "Zákazka" kliknite na "Select"
4. Vyberte zákazku zo zoznamu
5. Kliknite na "OK"
6. Uložte faktúru

## 7. Ďalšie moduly

### 7.1 Zákazky

Databáza "Zákazky" slúži na evidenciu zákaziek. Zákazka môže byť vytvorená z cenovej ponuky alebo manuálne.

Pre vytvorenie zákazky manuálne postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Zákazky"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Dátum** - Dátum vytvorenia zákazky
   - **Klient** - Vyberte klienta zo zoznamu
   - **Miesto realizácie** - Zadajte miesto realizácie
   - **Popis zákazky** - Zadajte popis zákazky
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

### 7.2 Sklad

Databáza "Sklad" slúži na evidenciu skladových zásob. Skladové zásoby môžu byť pridané manuálne alebo prostredníctvom príjemky.

Pre pridanie skladovej zásoby manuálne postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Sklad"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Názov** - Zadajte názov položky
   - **Množstvo** - Zadajte množstvo
   - **Jednotka** - Zadajte jednotku (ks, m, m2, m3, ...)
   - **Cena** - Zadajte cenu za jednotku
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

### 7.3 Zamestnanci

Databáza "Zamestnanci" slúži na evidenciu zamestnancov. Zamestnanci sú používaní v databázach Dochádzka, Kniha jázd, Výkaz prác a ďalších.

Pre pridanie zamestnanca postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Zamestnanci"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Meno** - Zadajte meno zamestnanca
   - **Priezvisko** - Zadajte priezvisko zamestnanca
   - **Telefón** - Zadajte telefónne číslo zamestnanca
   - **Email** - Zadajte emailovú adresu zamestnanca
   - **Pozícia** - Zadajte pracovnú pozíciu zamestnanca
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

### 7.4 Klienti

Databáza "Klienti" slúži na evidenciu klientov. Klienti sú používaní v databázach Cenové ponuky, Zákazky, Faktúry a ďalších.

Pre pridanie klienta postupujte podľa nasledujúcich krokov:

1. Otvorte databázu "Klienti"
2. Kliknite na tlačidlo "+" v pravom dolnom rohu
3. Vyplňte povinné polia:
   - **Názov** - Zadajte názov klienta (firmy)
   - **IČO** - Zadajte IČO klienta
   - **DIČ** - Zadajte DIČ klienta
   - **Adresa** - Zadajte adresu klienta
   - **Telefón** - Zadajte telefónne číslo klienta
   - **Email** - Zadajte emailovú adresu klienta
4. Kliknite na tlačidlo "Uložiť" v pravom hornom rohu

## 8. Riešenie problémov

### 8.1 Bežné problémy a ich riešenie

#### 8.1.1 Problém: Aplikácia sa zasekáva alebo spomaľuje

**Riešenie:**
1. Zatvorte a znovu otvorte aplikáciu Memento Database
2. Vyčistite cache aplikácie v nastaveniach zariadenia
3. Reštartujte zariadenie
4. Ak problém pretrváva, kontaktujte podporu

#### 8.1.2 Problém: Chyba pri generovaní reportu

**Riešenie:**
1. Skontrolujte, či máte vyplnené všetky povinné polia
2. Skontrolujte, či máte pripojenie na internet (ak report používa online šablóny)
3. Zatvorte a znovu otvorte záznam
4. Skúste generovať report znova
5. Ak problém pretrváva, kontaktujte podporu

#### 8.1.3 Problém: Chyba pri synchronizácii

**Riešenie:**
1. Skontrolujte, či máte pripojenie na internet
2. Skontrolujte, či máte nastavený správny účet pre synchronizáciu
3. Zatvorte a znovu otvorte aplikáciu
4. Skúste synchronizovať znova
5. Ak problém pretrváva, kontaktujte podporu

### 8.2 Kontakt na podporu

V prípade problémov s aplikáciou ASISTANTO kontaktujte podporu:

- **Email:** podpora@asistanto.sk
- **Telefón:** +421 123 456 789
- **Web:** https://www.asistanto.sk/podpora
