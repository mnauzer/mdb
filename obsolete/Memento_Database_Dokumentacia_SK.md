# Dokumentácia k Memento Database

## Obsah

1. [Úvod](#úvod)
2. [Základné koncepty](#základné-koncepty)
   - [Knižnice](#knižnice)
   - [Polia](#polia)
   - [Záznamy](#záznamy)
   - [Stránky a podnadpisy](#stránky-a-podnadpisy)
3. [Typy polí](#typy-polí)
   - [Textové polia](#textové-polia)
   - [Číselné polia](#číselné-polia)
   - [Výberové polia](#výberové-polia)
   - [Polia dátumu a času](#polia-dátumu-a-času)
   - [Prepojovacie polia](#prepojovacie-polia)
   - [Mediálne polia](#mediálne-polia)
   - [Vypočítané polia](#vypočítané-polia)
   - [Špeciálne polia](#špeciálne-polia)
4. [Analýza dát](#analýza-dát)
   - [Triedenie](#triedenie)
   - [Filtrovanie](#filtrovanie)
   - [Zoskupovanie](#zoskupovanie)
   - [Agregácia](#agregácia)
   - [Grafy](#grafy)
5. [JavaScript v Memento](#javascript-v-memento)
   - [JavaScript polia](#javascript-polia)
   - [JavaScript knižnica](#javascript-knižnica)
   - [Práca s knižnicami a záznamami](#práca-s-knižnicami-a-záznamami)
   - [Práca so súbormi](#práca-so-súbormi)
   - [HTTP požiadavky](#http-požiadavky)
   - [Interakcia so systémom](#interakcia-so-systémom)
   - [SQL dotazy](#sql-dotazy)
6. [Triggery](#triggery)
   - [Udalosti a fázy](#udalosti-a-fázy)
   - [Vytváranie triggerov](#vytváranie-triggerov)
   - [Príklady triggerov](#príklady-triggerov)
7. [Akcie](#akcie)
   - [Vytváranie akcií](#vytváranie-akcií)
   - [Príklady akcií](#príklady-akcií)
8. [Synchronizácia a cloud](#synchronizácia-a-cloud)
   - [Synchronizácia s Google Sheets](#synchronizácia-s-google-sheets)
   - [Memento Cloud](#memento-cloud)
   - [Tímová spolupráca](#tímová-spolupráca)
9. [Bezpečnosť](#bezpečnosť)
   - [Ochrana knižnice](#ochrana-knižnice)
   - [Oprávnenia skriptov](#oprávnenia-skriptov)
10. [Osvedčené postupy](#osvedčené-postupy)
    - [Návrh databázy](#návrh-databázy)
    - [Kódovanie v JavaScripte](#kódovanie-v-javascripte)
    - [Optimalizácia výkonu](#optimalizácia-výkonu)
11. [Pokročilé príklady](#pokročilé-príklady)
    - [Sledovanie historických dát](#sledovanie-historických-dát)
    - [Automatizované pracovné postupy](#automatizované-pracovné-postupy)
    - [Integrácia s externými službami](#integrácia-s-externými-službami)

## Úvod

Memento Database je výkonná aplikácia na správu databáz pre mobilné zariadenia (Android) a osobné počítače (Windows, Linux, macOS). Umožňuje používateľom vytvárať vlastné databázy so širokou škálou typov polí a funkcií, čo ju robí vhodnou pre rôzne prípady použitia od jednoduchých osobných zbierok až po komplexné podnikové aplikácie.

### Kľúčové funkcie

- **Vytváranie vlastných databáz**: Návrh databáz s vlastnými poľami, rozloženiami a vzťahmi
- **Bohaté typy polí**: Podpora viac ako 20 typov polí vrátane textu, čísel, dátumov, obrázkov, súborov a ďalších
- **Analýza dát**: Triedenie, filtrovanie, zoskupovanie a vizualizácia dát pomocou vstavaných nástrojov
- **Podpora JavaScriptu**: Rozšírenie funkcionality pomocou vlastných skriptov
- **Synchronizácia s cloudom**: Synchronizácia dát medzi zariadeniami a s Google Sheets
- **Tímová spolupráca**: Zdieľanie knižníc s inými používateľmi pre spoluprácu
- **Multiplatformovosť**: Dostupné na Android, Windows, Linux a macOS

## Základné koncepty

### Knižnice

Knižnica je primárny kontajner pre dáta v Memento Database. Skladá sa zo zbierky záznamov s definovanou štruktúrou polí. Knižnice môžu byť prepojené, čo umožňuje vytvárať komplexné dátové modely.

#### Vytvorenie knižnice

1. Na obrazovke Zoznam knižníc ťuknite na tlačidlo +
2. Zadajte názov knižnice
3. Definujte polia na karte POLIA
4. Usporiadajte polia do stránok na karte STRÁNKY
5. Nakonfigurujte nastavenia knižnice na karte HLAVNÉ

#### Nastavenia knižnice

- **Názov záznamu**: Definujte, ktoré pole(ia) budú použité ako názov záznamu
- **Jedinečné názvy záznamov**: Vynútenie jedinečnosti názvov záznamov
- **Ochrana knižnice**: Povolenie šifrovania pre citlivé údaje
- **Synchronizácia**: Konfigurácia nastavení synchronizácie s Google Sheets alebo Memento Cloud

### Polia

Polia sú základnými stavebnými prvkami štruktúry knižnice. Každé pole predstavuje konkrétny kus dát a má definovaný typ, ktorý určuje, aký druh dát môže uchovávať a ako sa správa.

#### Vlastnosti poľa

- **Názov**: Identifikátor poľa
- **Typ**: Dátový typ poľa
- **Rola**: Ako sa pole zobrazuje v zoznamoch (Názov záznamu, Popis atď.)
- **Povinné**: Či pole musí mať hodnotu
- **Predvolená hodnota**: Počiatočná hodnota pre nové záznamy
- **Možnosti zobrazenia**: Ako sa pole zobrazuje v používateľskom rozhraní

### Záznamy

Záznamy sú jednotlivé záznamy v knižnici. Každý záznam obsahuje hodnoty pre polia definované v štruktúre knižnice.

#### Práca so záznamami

- **Vytváranie**: Ťuknite na tlačidlo + na obrazovke Zoznam záznamov
- **Prezeranie**: Ťuknite na záznam v zozname pre otvorenie karty Zobrazenie záznamu
- **Úprava**: Ťuknite na ikonu ceruzky na karte Zobrazenie záznamu
- **Odstránenie**: Ťuknite na ikonu koša na karte Zobrazenie záznamu (presunie sa do Koša)
- **Obľúbené**: Označte záznamy ako obľúbené pre rýchly prístup

### Stránky a podnadpisy

Stránky a podnadpisy pomáhajú organizovať polia v knižnici pre lepšiu použiteľnosť.

- **Stránky**: Zoskupenie súvisiacich polí do samostatných kariet na kartách Úprava záznamu a Zobrazenie záznamu
- **Podnadpisy**: Vytvorenie sekcií v rámci stránky pre ďalšiu organizáciu polí

## Typy polí

Memento Database ponúka širokú škálu typov polí pre rôzne dátové potreby.

### Textové polia

- **Text**: Jednoduchý textový vstup
- **Bohatý text (HTML)**: Formátovaný text s možnosťami štýlovania
- **Telefónne číslo**: Text optimalizovaný pre telefónne čísla
- **Email**: Text optimalizovaný pre emailové adresy
- **Hypertextový odkaz**: Text, ktorý funguje ako klikateľný odkaz
- **Heslo**: Text, ktorý je maskovaný pre bezpečnosť
- **Čiarový kód**: Text, ktorý možno zadať skenovaním čiarového kódu

### Číselné polia

- **Celé číslo**: Celé čísla
- **Hodnoty celých čísel**: Celé čísla s preddefinovanými hodnotami a popismi
- **Reálne číslo**: Desatinné čísla
- **Mena**: Čísla formátované ako mena
- **Hodnotenie**: Vizuálna reprezentácia číselnej hodnoty (hviezdičky)

### Výberové polia

- **Booleovské**: Hodnoty Áno/Nie alebo Pravda/Nepravda
- **Zoznam s jedným výberom**: Výber z preddefinovaného zoznamu možností
- **Prepínače**: Vizuálna reprezentácia zoznamu s jedným výberom
- **Zoznam s viacnásobným výberom**: Výber viacerých možností zo zoznamu
- **Zaškrtávacie políčka**: Vizuálna reprezentácia zoznamu s viacnásobným výberom
- **Dynamický zoznam**: Zoznam možností, ktorý možno aktualizovať programovo

### Polia dátumu a času

- **Dátum**: Kalendárny dátum
- **Dátum a čas**: Dátum kombinovaný s časom
- **Čas**: Čas dňa

### Prepojovacie polia

- **Odkaz na záznam**: Odkaz na záznamy v inej knižnici
- **Odkaz na súbor**: Odkaz na súbory uložené v zariadení

### Mediálne polia

- **Obrázok**: Fotografie alebo obrázky
- **Zvuk**: Zvukové nahrávky
- **Podpis**: Ručne písané podpisy

### Vypočítané polia

- **Výpočet**: Výpočet založený na vzorci s použitím hodnôt iných polí
- **JavaScript**: Vlastný výpočet pomocou JavaScriptového kódu

### Špeciálne polia

- **Kontakt**: Odkaz na kontakt z kontaktov zariadenia
- **Poloha**: Geografické súradnice s integráciou máp
- **Značky**: Kľúčové slová pre kategorizáciu záznamov

## Analýza dát

Memento Database poskytuje výkonné nástroje na analýzu a vizualizáciu dát.

### Triedenie

Triedenie záznamov na základe jedného alebo viacerých polí vo vzostupnom alebo zostupnom poradí.

```javascript
// Príklad: Triedenie záznamov podľa dátumu v zostupnom poradí
var zoradenéZáznamy = std.Utils.Array.sortEntriesByField(záznamy, 'dátum', false);
```

### Filtrovanie

Filtrovanie záznamov na základe hodnôt polí pre zobrazenie iba relevantných dát.

```javascript
// Príklad: Filtrovanie záznamov, kde stav je 'dokončené'
var dokončenéZáznamy = std.Utils.Array.filterEntries(záznamy, 'stav', 'dokončené');
```

### Zoskupovanie

Zoskupenie záznamov podľa hodnôt polí pre hierarchickú organizáciu dát.

```javascript
// Príklad: Zoskupenie záznamov podľa kategórie
var záznamyPodľaKategórie = std.Utils.Array.groupEntriesByField(záznamy, 'kategória');
```

### Agregácia

Vykonávanie výpočtov na zoskupených dátach, ako je súčet, priemer, minimum a maximum.

```javascript
// Príklad: Výpočet súčtu čiastok pre každú kategóriu
var kategórie = std.Utils.Array.getUniqueFieldValues(záznamy, 'kategória');
for (var i = 0; i < kategórie.length; i++) {
  var záznamyKategórie = std.Utils.Array.filterEntries(záznamy, 'kategória', kategórie[i]);
  var celkováČiastka = std.Utils.Array.sumEntryField(záznamyKategórie, 'čiastka');
  console.log(kategórie[i] + ': ' + celkováČiastka);
}
```

### Grafy

Vizualizácia dát pomocou vstavaných typov grafov:
- Koláčové grafy
- Stĺpcové grafy
- Čiarové grafy
- Stĺpcové grafy
- Plošné grafy
- Bodové grafy
- Schodiskové plošné grafy

## JavaScript v Memento

Memento Database zahŕňa výkonné JavaScriptové možnosti, ktoré vám umožňujú rozšíriť jeho funkcionalitu.

### JavaScript polia

JavaScript polia obsahujú kód, ktorý vypočíta hodnotu na základe iných polí v zázname.

```javascript
// Príklad: Výpočet celkovej ceny
field("množstvo") * field("jednotková_cena")
```

### JavaScript knižnica

Memento poskytuje JavaScriptovú knižnicu s funkciami pre prácu s knižnicami, záznamami, súbormi, HTTP požiadavkami a ďalšími.

### Práca s knižnicami a záznamami

```javascript
// Získanie aktuálnej knižnice
var aktuálnaKnižnica = lib();

// Získanie všetkých záznamov v knižnici
var všetkyZáznamy = aktuálnaKnižnica.entries();

// Získanie aktuálneho záznamu
var aktuálnyZáznam = entry();

// Získanie hodnoty poľa
var meno = aktuálnyZáznam.field("meno");

// Nastavenie hodnoty poľa
aktuálnyZáznam.set("stav", "dokončené");

// Vytvorenie nového záznamu
var novýZáznam = {
  "meno": "Nový záznam",
  "dátum": new Date(),
  "stav": "čakajúci"
};
aktuálnaKnižnica.create(novýZáznam);

// Vyhľadanie záznamov podľa vyhľadávacieho výrazu
var výsledky = aktuálnaKnižnica.find("vyhľadávací výraz");

// Vyhľadanie záznamu podľa ID
var nájdenýZáznam = aktuálnaKnižnica.findById("id_záznamu");
```

### Práca so súbormi

```javascript
// Otvorenie súboru na čítanie/zápis
var f = file("môjsúbor.txt");

// Zápis do súboru
f.writeLine("Ahoj, svet!");

// Zatvorenie súboru
f.close();

// Čítanie všetkých riadkov zo súboru
var riadky = f.readAll();
```

### HTTP požiadavky

```javascript
// Vytvorenie GET požiadavky
var odpoveď = http().get("https://api.example.com/data");

// Vytvorenie POST požiadavky
var postOdpoveď = http().post("https://api.example.com/submit", "data=hodnota");

// Nastavenie hlavičiek
http().headers({"Authorization": "Bearer token"});

// Parsovanie JSON odpovede
var dáta = JSON.parse(odpoveď.body);
```

### Interakcia so systémom

```javascript
// Zobrazenie správy používateľovi
message("Operácia úspešne dokončená");

// Vytvorenie dialógu
var môjDialóg = dialog();
môjDialóg.title("Potvrdenie")
        .text("Ste si istí, že chcete pokračovať?")
        .positiveButton("Áno", function() { /* akcia */ })
        .negativeButton("Nie", function() { /* akcia */ })
        .show();

// Vytvorenie intentu na otvorenie inej aplikácie
var i = intent("android.intent.action.VIEW");
i.data("https://example.com");
i.send();
```

### SQL dotazy

```javascript
// Vykonanie SQL dotazu
var výsledky = sql("SELECT * FROM MojaKnižnica WHERE stav = 'aktívny'").asObjects();

// Získanie jednej hodnoty
var počet = sql("SELECT COUNT(*) FROM MojaKnižnica").asInt();
```

## Triggery

Triggery sú skripty, ktoré sa spúšťajú automaticky, keď v Memento Database nastanú určité udalosti.

### Udalosti a fázy

Triggery sú definované typom udalosti a fázou:

#### Typy udalostí
- Otvorenie knižnice
- Vytvorenie záznamu
- Aktualizácia záznamu
- Aktualizácia poľa
- Prepojenie záznamu
- Zrušenie prepojenia záznamu
- Odstránenie záznamu
- Otvorenie karty Zobrazenie záznamu
- Pridanie záznamu do Obľúbených
- Odstránenie záznamu z Obľúbených

#### Fázy
- Pred operáciou (synchrónne)
- Po operácii (asynchrónne)

### Vytváranie triggerov

1. Otvorte knižnicu
2. Otvorte menu a vyberte Triggery
3. Ťuknite na tlačidlo +
4. Vyberte typ udalosti a fázu
5. Napíšte skript triggeru

### Príklady triggerov

#### Validácia dát

```javascript
// Overenie, že číslo je v rozsahu
var číslo = entry().field("Číslo");
if (číslo < 0 || číslo > 200) {
  message("Číslo musí byť medzi 0 a 200");
  cancel();
}
```

#### Nastavenie predvolených hodnôt

```javascript
// Nastavenie predvolených hodnôt pre nový záznam
entryDefault().set("Dátum", new Date());
entryDefault().set("Stav", "Čakajúci");
```

#### Vytvorenie súvisiacich záznamov

```javascript
// Vytvorenie súvisiaceho záznamu v inej knižnici
var e = entry();
var ináKnižnica = libByName("Súvisiaca knižnica");
var novýZáznam = {
  "ID rodiča": e.id,
  "Meno": e.field("Meno") + " - Súvisiaci",
  "Dátum": new Date()
};
ináKnižnica.create(novýZáznam);
```

## Akcie

Akcie sú skripty, ktoré sa spúšťajú, keď používateľ ťukne na tlačidlo v paneli nástrojov.

### Vytváranie akcií

1. Otvorte knižnicu
2. Otvorte menu a vyberte Skripty
3. Ťuknite na tlačidlo + a vyberte Akcie
4. Vyberte kontext (Knižnica, Záznam alebo Hromadné)
5. Napíšte skript akcie

### Príklady akcií

#### Export do CSV

```javascript
// Export dát knižnice do CSV súboru
var záznamy = lib().entries();
var f = file("export.csv");

// Zápis hlavičky
var riadokHlavičky = "Meno,Dátum,Stav\n";
f.write(riadokHlavičky);

// Zápis dát
for (var i = 0; i < záznamy.length; i++) {
  var e = záznamy[i];
  var riadok = e.field("Meno") + "," + 
             e.field("Dátum") + "," + 
             e.field("Stav") + "\n";
  f.write(riadok);
}

f.close();
message("Export dokončený");
```

#### Odoslanie dát do webovej služby

```javascript
// Odoslanie dát záznamu do webovej služby
var e = entry();
var dáta = {
  id: e.id,
  meno: e.field("Meno"),
  dátum: e.field("Dátum"),
  stav: e.field("Stav")
};

var odpoveď = http().post(
  "https://api.example.com/submit",
  JSON.stringify(dáta)
);

if (odpoveď.code == 200) {
  message("Dáta úspešne odoslané");
} else {
  message("Chyba: " + odpoveď.body);
}
```

## Synchronizácia a cloud

### Synchronizácia s Google Sheets

Memento Database môže synchronizovať knižnice s Google Sheets, čo vám umožňuje:
- Upravovať dáta buď v Memento alebo v Google Sheets
- Zdieľať dáta s používateľmi, ktorí nemajú Memento
- Používať Google Sheets pre pokročilú analýzu dát

#### Nastavenie synchronizácie s Google Sheets

1. Otvorte knižnicu
2. Otvorte menu a vyberte Synchronizácia
3. Vyberte Google Sheets
4. Prihláste sa do svojho Google účtu
5. Nakonfigurujte nastavenia synchronizácie

### Memento Cloud

Memento Cloud poskytuje synchronizáciu medzi zariadeniami a platformami:
- Synchronizácia knižníc medzi zariadeniami s Androidom
- Prístup ku knižniciam z Windows, Linux alebo macOS
- Automatická synchronizácia na pozadí

#### Nastavenie Memento Cloud

1. Vytvorte účet Memento Cloud
2. Otvorte knižnicu
3. Otvorte menu a vyberte Synchronizácia
4. Vyberte Memento Cloud
5. Prihláste sa do svojho účtu Memento Cloud
6. Nakonfigurujte nastavenia synchronizácie

### Tímová spolupráca

Memento Cloud umožňuje spoluprácu s inými používateľmi:
- Zdieľanie knižníc s členmi tímu
- Kontrola prístupových oprávnení
- Sledovanie zmien vykonaných členmi tímu

#### Zdieľanie knižnice

1. Otvorte knižnicu
2. Otvorte menu a vyberte Zdieľať
3. Zadajte emailovú adresu používateľa, s ktorým chcete zdieľať
4. Vyberte prístupové oprávnenia (Zobrazenie, Úprava alebo Admin)
5. Ťuknite na Zdieľať

## Bezpečnosť

### Ochrana knižnice

Citlivé údaje môžu byť chránené šifrovaním:
- AES-128 šifrovanie
- Ochrana heslom
- Šifrovaná synchronizácia

#### Povolenie ochrany knižnice

1. Otvorte knižnicu
2. Otvorte menu a vyberte Nastavenia
3. Povoľte Ochranu knižnice
4. Nastavte heslo
5. Nakonfigurujte nastavenia ochrany

### Oprávnenia skriptov

Skripty vyžadujú špecifické oprávnenia na prístup k určitým funkciám:
- Prístup ku knižnici
- Prístup k súborom
- Prístup k sieti

#### Nastavenie oprávnení skriptov

1. Otvorte knižnicu
2. Otvorte menu a vyberte Triggery alebo Skripty
3. Ťuknite na ikonu Štítu
4. Nakonfigurujte oprávnenia pre knižnice, súbory a sieť

## Osvedčené postupy

### Návrh databázy

- **Plánujte svoju štruktúru**: Definujte svoj dátový model pred vytvorením knižníc
- **Normalizujte dáta**: Vyhnite sa duplikácii dát medzi knižnicami
- **Používajte vhodné typy polí**: Vyberte správny typ poľa pre každý kus dát
- **Vytvárajte vzťahy**: Používajte polia Odkaz na záznam na prepojenie súvisiacich dát
- **Organizujte polia**: Používajte stránky a podnadpisy na zoskupenie súvisiacich polí
- **Nastavte predvolené hodnoty**: Poskytnite rozumné predvolené hodnoty na urýchlenie zadávania dát
- **Validujte dáta**: Používajte triggery na zabezpečenie integrity dát

### Kódovanie v JavaScripte

- **Používajte bodkočiarky**: Ukončujte príkazy bodkočiarkami pre jasnosť
- **Kontrolujte hodnoty null**: Vždy validujte hodnoty polí pred ich použitím
- **Spracovávajte chyby**: Používajte bloky try-catch na spracovanie výnimiek
- **Komentujte svoj kód**: Dokumentujte komplexnú logiku pre budúce použitie
- **Vyhnite sa dlhým skriptom**: Rozdeľte komplexné úlohy na menšie funkcie
- **Dôkladne testujte**: Testujte skripty s rôznymi vstupnými scenármi

### Optimalizácia výkonu

- **Obmedzte počet záznamov**: Veľké knižnice môžu spomaliť výkon
- **Používajte indexy**: Nastavte vhodné polia ako indexy pre rýchlejšie vyhľadávanie
- **Optimalizujte skripty**: Minimalizujte cykly a komplexné výpočty
- **Používajte cache**: Používajte premenné na uloženie často pristupovaných dát
- **Dávkové operácie**: Zoskupte súvisiace operácie na zníženie réžie

## Pokročilé príklady

### Sledovanie historických dát

Sledovanie zmien dát v čase pomocou utility HistoricalData:

```javascript
// Získanie aktuálnej platnej hodnoty z tabuľky historických dát
var aktuálnaSadzba = std.Utils.HistoricalData.getCurrentValue(
  'Sadzby zamestnancov',    // názov tabuľky
  'id_zamestnanca',         // názov poľa kľúča
  'Z001',                   // hodnota kľúča na porovnanie
  'hodinová_sadzba',        // názov poľa hodnoty na získanie
  'platné_od'               // názov poľa dátumu platnosti
);

// Získanie sadzby platnej k určitému dátumu
var historickáSadzba = std.Utils.HistoricalData.getValueAtDate(
  'Sadzby zamestnancov',
  'id_zamestnanca',
  'Z001',
  'hodinová_sadzba',
  'platné_od',
  new Date(2025, 2, 15)  // 15. marec 2025
);

// Získanie všetkých historických hodnôt pre entitu
var históriaSadzieb = std.Utils.HistoricalData.getHistoricalValues(
  'Sadzby zamestnancov',
  'id_zamestnanca',
  'Z001',
  'hodinová_sadzba',
  'platné_od'
);
```

### Automatizované pracovné postupy

Vytvorenie automatizovaných pracovných postupov pomocou triggerov a akcií:

```javascript
// Trigger: Keď je úloha označená ako dokončená
var e = entry();
if (e.field("Stav") === "Dokončené") {
  // Aktualizácia dátumu dokončenia
  e.set("Dátum dokončenia", new Date());
  
  // Upozornenie priradenej osoby
  var priradená = e.field("Priradené")[0];
  if (priradená) {
    // Odoslanie emailového upozornenia
    var cfg = {
      "host": "smtp.example.com",
      "port": 25,
      "user": "notifikácie",
      "pass": "heslo",
      "from": "notifikacie@example.com"
    };
    
    var predmet = "Úloha dokončená: " + e.field("Názov");
    var správa = "Úloha '" + e.field("Názov") + "' bola označená ako dokončená.";
    
    email().send(cfg, priradená.field("Email"), predmet, správa);
  }
  
  // Vytvorenie následnej úlohy, ak je potrebné
  if (e.field("Vyžaduje následné kroky")) {
    var knižnicaÚloh = libByName("Úlohy");
    var následnáÚloha = {
      "Názov": "Následné kroky k: " + e.field("Názov"),
      "Popis": "Následné kroky k dokončenej úlohe: " + e.field("Popis"),
      "Termín": std.Utils.Date.addDays(new Date(), 7),
      "Stav": "Čakajúci",
      "Priorita": "Stredná",
      "Priradené": e.field("Priradené")
    };
    knižnicaÚloh.create(následnáÚloha);
  }
}
```

### Integrácia s externými službami

Integrácia Memento Database s externými službami pomocou HTTP požiadaviek:

```javascript
// Akcia: Synchronizácia inventára s online obchodom
var knižnicaInventára = lib();
var inventár = knižnicaInventára.entries();
var produktyNaAktualizáciu = [];

for (var i = 0; i < inventár.length; i++) {
  var produkt = inventár[i];
  produktyNaAktualizáciu.push({
    id: produkt.field("ID produktu"),
    názov: produkt.field("Názov"),
    cena: produkt.field("Cena"),
    sklad: produkt.field("Sklad")
  });
}

// Nastavenie autentifikácie
http().headers({
  "Authorization": "Bearer váš_api_token",
  "Content-Type": "application/json"
});

// Odoslanie dát do API
var odpoveď = http().post(
  "https://api.vášobchod.com/produkty/aktualizácia",
  JSON.stringify(produktyNaAktualizáciu)
);

// Spracovanie odpovede
if (odpoveď.code === 200) {
  var výsledok = JSON.parse(odpoveď.body);
  message("Aktualizovaných " + výsledok.updated + " produktov");
  
  // Aktualizácia časovej pečiatky synchronizácie
  for (var i = 0; i < inventár.length; i++) {
    inventár[i].set("Posledná synchronizácia", new Date());
  }
} else {
  message("Chyba: " + odpoveď.body);
}
```

---

Táto dokumentácia poskytuje komplexný prehľad o Memento Database a jeho možnostiach. Pre podrobnejšie informácie alebo príklady si pozrite Wiki Memento Database alebo dokumentáciu pomocníka v aplikácii.
