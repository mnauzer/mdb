# Dokumentácia ku knižnici Kniha jázd

Táto dokumentácia popisuje, ako používať štandardnú knižnicu `std.KnihaJazd` pre výpočet prejdenej trasy a vzdialenosti v databáze Kniha jázd pomocou Google Maps API.

## Obsah

1. [Prehľad knižnice](#prehľad-knižnice)
2. [Požiadavky](#požiadavky)
3. [Inštalácia](#inštalácia)
4. [Štruktúra databáz](#štruktúra-databáz)
5. [Funkcie knižnice](#funkcie-knižnice)
6. [Akcie](#akcie)
7. [Príklady použitia](#príklady-použitia)
8. [Riešenie problémov](#riešenie-problémov)
9. [Zdrojový kód](#zdrojový-kód)

## Prehľad knižnice

Knižnica `std.KnihaJazd` poskytuje funkcie pre výpočet prejdenej trasy a vzdialenosti v databáze Kniha jázd. Knižnica využíva Google Maps API pre presný výpočet trasy medzi zástavkami a ako zálohu používa Haversine vzorec pre výpočet priamej vzdialenosti.

Hlavné funkcie knižnice:

- Výpočet vzdialenosti trasy pomocou Google Maps API
- Extrakcia súradníc zástavok z prepojených záznamov v databáze Miesta
- Výpočet vzdialenosti medzi ľubovoľnými dvoma miestami
- Hromadný výpočet vzdialeností pre viacero jázd naraz
- Záložný výpočet pomocou Haversine vzorca, ak Google Maps API nie je dostupné

## Požiadavky

Pre správne fungovanie knižnice potrebujete:

1. **Google Maps API kľúč** - Knižnica používa Google Maps Directions API pre výpočet trasy
2. **Memento Database** - Knižnica je určená pre použitie v Memento Database
3. **Databázy** - Knižnica vyžaduje nasledujúce databázy:
   - **Kniha jázd** - Databáza s jazdami
   - **Miesta** - Databáza s miestami a ich súradnicami
   - **ASISTANTO Tenants** - Databáza s nastaveniami, ktorá obsahuje API kľúč pre Google Maps

## Inštalácia

1. Skopírujte súbor `libKnihaJazd.js` do vášho projektu v Memento Database
2. Pridajte akcie do vašich knižníc, ktoré budú volať funkcie z knižnice `std.KnihaJazd`
3. Uistite sa, že máte správne nastavený API kľúč pre Google Maps v databáze ASISTANTO Tenants

## Štruktúra databáz

### Kniha jázd

Databáza Kniha jázd by mala obsahovať nasledujúce polia:

- **Zástavky** - Pole s linkami do databázy Miesta (typ: Link)
- **Vzdialenosť (km)** - Pole pre uloženie vypočítanej vzdialenosti (typ: Number)
- **Trvanie (hod)** - Pole pre uloženie vypočítaného trvania jazdy (typ: Number)

### Miesta

Databáza Miesta by mala obsahovať nasledujúce polia:

- **Názov** - Názov miesta (typ: Text)
- **Súradnice** - Geografické súradnice miesta (typ: Location)

Pole typu Location v Memento Database obsahuje súradnice vo formáte "lat,lng" (zemepisná šírka, zemepisná dĺžka).

### ASISTANTO Tenants

Databáza ASISTANTO Tenants by mala obsahovať nasledujúce pole:

- **API Google Maps** - API kľúč pre Google Maps (typ: Text)

## Funkcie knižnice

### getGoogleMapsApiKey()

Získa API kľúč pre Google Maps z databázy ASISTANTO Tenants.

```javascript
var apiKey = libKnihaJazd.getGoogleMapsApiKey();
```

### getPlaceCoordinates(placeEntry)

Získa súradnice miesta zo záznamu v databáze Miesta.

```javascript
var placeEntry = libByName("Miesta").find("Názov = 'Bratislava'")[0];
var coordinates = libKnihaJazd.getPlaceCoordinates(placeEntry);
// Výsledok: { lat: 48.1486, lng: 17.1077 }
```

### getTripStopCoordinates(tripEntry)

Získa súradnice všetkých zástavok z jazdy.

```javascript
var tripEntry = entry();
var coordinates = libKnihaJazd.getTripStopCoordinates(tripEntry);
// Výsledok: [{ lat: 48.1486, lng: 17.1077 }, { lat: 49.1951, lng: 16.6068 }, ...]
```

### calculateHaversineDistance(point1, point2)

Vypočíta vzdialenosť medzi dvoma bodmi pomocou Haversine vzorca (priama vzdialenosť).

```javascript
var point1 = { lat: 48.1486, lng: 17.1077 }; // Bratislava
var point2 = { lat: 49.1951, lng: 16.6068 }; // Brno
var distance = libKnihaJazd.calculateHaversineDistance(point1, point2);
// Výsledok: 89.15 km
```

### calculateRouteDistance(coordinates)

Vypočíta vzdialenosť trasy pomocou Google Maps API.

```javascript
var coordinates = [
    { lat: 48.1486, lng: 17.1077 }, // Bratislava
    { lat: 49.1951, lng: 16.6068 }  // Brno
];

libKnihaJazd.calculateRouteDistance(coordinates)
    .then(function(result) {
        if (result.status === "OK") {
            console.log("Vzdialenosť: " + result.distance + " km");
            console.log("Trvanie: " + result.duration + " hod");
        } else {
            console.log("Chyba: " + result.status);
        }
    })
    .catch(function(error) {
        console.log("Chyba: " + error.message);
    });
```

### calculateTripDistance(tripEntry)

Vypočíta vzdialenosť trasy pre jazdu.

```javascript
var tripEntry = entry();

libKnihaJazd.calculateTripDistance(tripEntry)
    .then(function(result) {
        if (result.status === "OK") {
            console.log("Vzdialenosť: " + result.distance + " km");
            console.log("Trvanie: " + result.duration + " hod");
        } else {
            console.log("Chyba: " + result.status);
        }
    })
    .catch(function(error) {
        console.log("Chyba: " + error.message);
    });
```

### updateTripDistance(tripEntry)

Aktualizuje vzdialenosť a trvanie jazdy v zázname.

```javascript
var tripEntry = entry();

libKnihaJazd.updateTripDistance(tripEntry)
    .then(function(result) {
        if (result.success) {
            console.log(result.message);
            console.log("Vzdialenosť: " + result.distance + " km");
            console.log("Trvanie: " + result.duration + " hod");
        } else {
            console.log("Chyba: " + result.message);
        }
    })
    .catch(function(error) {
        console.log("Chyba: " + error.message);
    });
```

## Akcie

Knižnica obsahuje nasledujúce akcie, ktoré môžete pridať do vašich knižníc:

### calculateTripDistanceAction()

Akcia pre výpočet vzdialenosti jazdy. Táto akcia by mala byť pridaná do databázy Kniha jázd ako akcia pre záznam.

```javascript
function calculateTripDistanceAction() {
    var e = entry();
    
    libKnihaJazd.updateTripDistance(e)
        .then(function(result) {
            if (result.success) {
                message(result.message + "\n\nVzdialenosť: " + result.distance.toFixed(2) + " km\nTrvanie: " + (result.duration * 60).toFixed(0) + " minút");
            } else {
                message("Chyba: " + result.message);
            }
        })
        .catch(function(error) {
            message("Chyba pri výpočte vzdialenosti jazdy: " + error.message);
        });
}
```

### calculateBulkTripDistanceAction()

Akcia pre hromadný výpočet vzdialenosti pre viacero jázd. Táto akcia by mala byť pridaná do databázy Kniha jázd ako akcia pre knižnicu.

```javascript
function calculateBulkTripDistanceAction() {
    var lib = lib();
    var entries = lib.entries();
    
    if (entries.length === 0) {
        message("Knižnica neobsahuje žiadne záznamy.");
        return;
    }
    
    var count = 0;
    var totalDistance = 0;
    var errors = 0;
    
    // Funkcia pre sekvenčné spracovanie záznamov
    function processEntry(index) {
        if (index >= entries.length) {
            // Všetky záznamy boli spracované
            message("Výpočet vzdialenosti bol dokončený.\n\nSpracované záznamy: " + count + "\nCelková vzdialenosť: " + totalDistance.toFixed(2) + " km\nChyby: " + errors);
            return;
        }
        
        var entry = entries[index];
        
        libKnihaJazd.updateTripDistance(entry)
            .then(function(result) {
                if (result.success) {
                    count++;
                    totalDistance += result.distance;
                } else {
                    errors++;
                }
                
                // Spracovanie ďalšieho záznamu
                processEntry(index + 1);
            })
            .catch(function(error) {
                errors++;
                
                // Spracovanie ďalšieho záznamu
                processEntry(index + 1);
            });
    }
    
    // Spustenie spracovania od prvého záznamu
    processEntry(0);
}
```

### calculateDistanceBetweenPlacesAction()

Akcia pre výpočet vzdialenosti medzi dvoma miestami. Táto akcia by mala byť pridaná do databázy Miesta ako akcia pre knižnicu.

```javascript
function calculateDistanceBetweenPlacesAction() {
    var placesLib = libByName("Miesta");
    
    if (!placesLib) {
        message("Chyba: Knižnica 'Miesta' nebola nájdená.");
        return;
    }
    
    // Získanie zoznamu miest
    var places = placesLib.entries();
    
    if (places.length < 2) {
        message("Knižnica 'Miesta' neobsahuje dostatok záznamov (minimum 2).");
        return;
    }
    
    // Vytvorenie zoznamu miest pre výber
    var placeNames = [];
    for (var i = 0; i < places.length; i++) {
        placeNames.push(places[i].field("Názov"));
    }
    
    // Výber prvého miesta
    var startPlace = prompt("Vyberte začiatočné miesto", placeNames);
    if (!startPlace) {
        return;
    }
    
    // Výber druhého miesta
    var endPlace = prompt("Vyberte cieľové miesto", placeNames);
    if (!endPlace) {
        return;
    }
    
    // Nájdenie záznamov miest
    var startPlaceEntry = placesLib.find("Názov = '" + startPlace + "'")[0];
    var endPlaceEntry = placesLib.find("Názov = '" + endPlace + "'")[0];
    
    if (!startPlaceEntry || !endPlaceEntry) {
        message("Chyba: Jedno alebo obe miesta neboli nájdené.");
        return;
    }
    
    // Získanie súradníc
    var startCoords = libKnihaJazd.getPlaceCoordinates(startPlaceEntry);
    var endCoords = libKnihaJazd.getPlaceCoordinates(endPlaceEntry);
    
    if (!startCoords || !endCoords) {
        message("Chyba: Jedno alebo obe miesta nemajú súradnice.");
        return;
    }
    
    // Výpočet vzdialenosti
    libKnihaJazd.calculateRouteDistance([startCoords, endCoords])
        .then(function(result) {
            if (result.status === "OK") {
                message("Vzdialenosť medzi miestami:\n\n" +
                        "Začiatok: " + startPlace + "\n" +
                        "Cieľ: " + endPlace + "\n\n" +
                        "Vzdialenosť: " + result.distance.toFixed(2) + " km\n" +
                        "Trvanie: " + (result.duration * 60).toFixed(0) + " minút");
            } else {
                // Výpočet vzdialenosti pomocou Haversine vzorca ako záloha
                var haversineDistance = libKnihaJazd.calculateHaversineDistance(startCoords, endCoords);
                
                message("Vzdialenosť medzi miestami (priama vzdialenosť):\n\n" +
                        "Začiatok: " + startPlace + "\n" +
                        "Cieľ: " + endPlace + "\n\n" +
                        "Vzdialenosť: " + haversineDistance.toFixed(2) + " km\n" +
                        "Poznámka: Použitý Haversine vzorec (Google Maps API: " + result.status + ")");
            }
        })
        .catch(function(error) {
            message("Chyba pri výpočte vzdialenosti: " + error.message);
        });
}
```

## Príklady použitia

### Príklad 1: Výpočet vzdialenosti pre jednu jazdu

```javascript
// V akcii pre záznam jazdy
function calculateTripDistanceAction() {
    var e = entry();
    
    libKnihaJazd.updateTripDistance(e)
        .then(function(result) {
            if (result.success) {
                message(result.message + "\n\nVzdialenosť: " + result.distance.toFixed(2) + " km\nTrvanie: " + (result.duration * 60).toFixed(0) + " minút");
            } else {
                message("Chyba: " + result.message);
            }
        })
        .catch(function(error) {
            message("Chyba pri výpočte vzdialenosti jazdy: " + error.message);
        });
}
```

### Príklad 2: Výpočet vzdialenosti pre jazdu s viacerými zástavkami

```javascript
// Predpokladajme, že máme jazdu s nasledujúcimi zástavkami:
// - Bratislava
// - Trnava
// - Nitra
// - Banská Bystrica
// - Žilina

// V akcii pre záznam jazdy
function calculateTripWithMultipleStopsAction() {
    var e = entry();
    
    // Získanie súradníc zástavok
    var coordinates = libKnihaJazd.getTripStopCoordinates(e);
    
    if (coordinates.length < 2) {
        message("Jazda nemá dostatok zástavok (minimum 2).");
        return;
    }
    
    // Výpis zástavok
    var stopsText = "Zástavky:\n";
    var stops = e.field("Zástavky");
    for (var i = 0; i < stops.length; i++) {
        stopsText += "- " + stops[i].field("Názov") + "\n";
    }
    
    // Výpočet vzdialenosti
    libKnihaJazd.calculateRouteDistance(coordinates)
        .then(function(result) {
            if (result.status === "OK") {
                message(stopsText + "\nVzdialenosť: " + result.distance.toFixed(2) + " km\nTrvanie: " + (result.duration * 60).toFixed(0) + " minút");
                
                // Aktualizácia polí v zázname
                e.set("Vzdialenosť (km)", result.distance);
                e.set("Trvanie (hod)", result.duration);
            } else {
                message("Chyba pri výpočte vzdialenosti: " + result.status);
            }
        })
        .catch(function(error) {
            message("Chyba pri výpočte vzdialenosti: " + error.message);
        });
}
```

### Príklad 3: Hromadný výpočet vzdialeností pre viacero jázd

```javascript
// V akcii pre knižnicu Kniha jázd
function calculateBulkTripDistanceAction() {
    var lib = lib();
    var entries = lib.entries();
    
    if (entries.length === 0) {
        message("Knižnica neobsahuje žiadne záznamy.");
        return;
    }
    
    // Potvrdenie od používateľa
    var confirm = prompt("Chcete vypočítať vzdialenosť pre " + entries.length + " záznamov?", ["Áno", "Nie"]);
    if (confirm !== "Áno") {
        return;
    }
    
    var count = 0;
    var totalDistance = 0;
    var errors = 0;
    
    // Funkcia pre sekvenčné spracovanie záznamov
    function processEntry(index) {
        if (index >= entries.length) {
            // Všetky záznamy boli spracované
            message("Výpočet vzdialenosti bol dokončený.\n\nSpracované záznamy: " + count + "\nCelková vzdialenosť: " + totalDistance.toFixed(2) + " km\nChyby: " + errors);
            return;
        }
        
        var entry = entries[index];
        
        libKnihaJazd.updateTripDistance(entry)
            .then(function(result) {
                if (result.success) {
                    count++;
                    totalDistance += result.distance;
                } else {
                    errors++;
                }
                
                // Spracovanie ďalšieho záznamu
                processEntry(index + 1);
            })
            .catch(function(error) {
                errors++;
                
                // Spracovanie ďalšieho záznamu
                processEntry(index + 1);
            });
    }
    
    // Spustenie spracovania od prvého záznamu
    processEntry(0);
}
```

### Príklad 4: Výpočet vzdialenosti medzi dvoma miestami

```javascript
// V akcii pre knižnicu Miesta
function calculateDistanceBetweenTwoCitiesAction() {
    // Definícia miest
    var city1 = "Bratislava";
    var city2 = "Košice";
    
    // Nájdenie záznamov miest
    var placesLib = libByName("Miesta");
    var city1Entry = placesLib.find("Názov = '" + city1 + "'")[0];
    var city2Entry = placesLib.find("Názov = '" + city2 + "'")[0];
    
    if (!city1Entry || !city2Entry) {
        message("Chyba: Jedno alebo obe mestá neboli nájdené.");
        return;
    }
    
    // Získanie súradníc
    var city1Coords = libKnihaJazd.getPlaceCoordinates(city1Entry);
    var city2Coords = libKnihaJazd.getPlaceCoordinates(city2Entry);
    
    if (!city1Coords || !city2Coords) {
        message("Chyba: Jedno alebo obe mestá nemajú súradnice.");
        return;
    }
    
    // Výpočet vzdialenosti
    libKnihaJazd.calculateRouteDistance([city1Coords, city2Coords])
        .then(function(result) {
            if (result.status === "OK") {
                message("Vzdialenosť medzi mestami:\n\n" +
                        "Začiatok: " + city1 + "\n" +
                        "Cieľ: " + city2 + "\n\n" +
                        "Vzdialenosť: " + result.distance.toFixed(2) + " km\n" +
                        "Trvanie: " + (result.duration * 60).toFixed(0) + " minút");
            } else {
                message("Chyba pri výpočte vzdialenosti: " + result.status);
            }
        })
        .catch(function(error) {
            message("Chyba pri výpočte vzdialenosti: " + error.message);
        });
}
```

### Príklad 5: Automatický výpočet vzdialenosti pri vytvorení jazdy

```javascript
// V triggeri pre databázu Kniha jázd
function onCreateTripTrigger() {
    // Tento trigger sa spustí pri vytvorení nového záznamu
    var e = entry();
    
    // Kontrola, či má jazda zástavky
    var stops = e.field("Zástavky");
    if (!stops || stops.length < 2) {
        return;
    }
    
    // Výpočet vzdialenosti
    libKnihaJazd.updateTripDistance(e)
        .then(function(result) {
            if (result.success) {
                // Vzdialenosť a trvanie boli aktualizované v zázname
                console.log("Vzdialenosť jazdy bola automaticky vypočítaná: " + result.distance.toFixed(2) + " km");
            }
        })
        .catch(function(error) {
            console.log("Chyba pri automatickom výpočte vzdialenosti: " + error.message);
        });
}
```

## Riešenie problémov

### Chyba: API kľúč pre Google Maps nie je nastavený

Ak sa zobrazí chyba "API kľúč pre Google Maps nie je nastavený v databáze ASISTANTO Tenants", skontrolujte nasledujúce:

1. Uistite sa, že máte vytvorenú databázu ASISTANTO Tenants
2. Uistite sa, že databáza obsahuje pole "API Google Maps"
3. Uistite sa, že v poli je nastavený platný API kľúč pre Google Maps
4. Uistite sa, že funkcia `getTenantId()` vracia správne ID tenanta

### Chyba: Knižnica 'Miesta' nebola nájdená

Ak sa zobrazí chyba "Knižnica 'Miesta' nebola nájdená", skontrolujte nasledujúce:

1. Uistite sa, že máte vytvorenú databázu Miesta
2. Uistite sa, že názov databázy je presne "Miesta"
3. Ak používate iný názov, upravte kód v knižnici

### Chyba: Miesto nemá súradnice

Ak sa zobrazí upozornenie "Miesto 'XYZ' nemá súradnice", skontrolujte nasledujúce:

1. Uistite sa, že záznam miesta obsahuje pole "Súradnice" typu Location
2. Uistite sa, že pole obsahuje platné súradnice vo formáte "lat,lng" (napr. "48.1486,17.1077")
3. Ak používate iný názov poľa, upravte konštantu FIELD_COORDINATES v knižnici

### Chyba pri výpočte vzdialenosti: OVER_QUERY_LIMIT

Ak sa zobrazí chyba "OVER_QUERY_LIMIT", znamená to, že ste prekročili limit požiadaviek na Google Maps API. Skúste nasledujúce:

1. Počkajte niekoľko minút a skúste to znova
2. Zvýšte limit požiadaviek pre váš API kľúč v Google Cloud Console
3. Použite iný API kľúč

### Chyba pri výpočte vzdialenosti: ZERO_RESULTS

Ak sa zobrazí chyba "ZERO_RESULTS", znamená to, že Google Maps API nemohlo nájsť trasu medzi zadanými bodmi. Skúste nasledujúce:

1. Skontrolujte, či sú súradnice správne
2. Skontrolujte, či existuje cestná sieť medzi zadanými bodmi
3. Skúste použiť iný spôsob dopravy (napr. "driving", "walking", "bicycling", "transit")

## Zdrojový kód

Kompletný zdrojový kód knižnice `libKnihaJazd.js`:

```javascript
/**
 * Memento Database - Kniha jázd
 * 
 * Knižnica pre prácu s databázou Kniha jázd, ktorá umožňuje
 * výpočet prejdenej trasy a vzdialenosti pomocou Google Maps API.
 * 
 * Autor: Cline
 * Verzia: 1.0
 * Dátum: 19.4.2025
 */

// Globálny objekt pre knižnicu Kniha jázd
var libKnihaJazd = {
    /**
     * Získa API kľúč pre Google Maps z databázy ASISTANTO Tenants
     * @returns {String} API kľúč pre Google Maps alebo prázdny reťazec v prípade chyby
     */
    getGoogleMapsApiKey: function() {
        try {
            // Získanie knižnice ASISTANTO Tenants
            var tenantsLib = libByName("ASISTANTO Tenants");
            if (!tenantsLib) {
                message("Chyba: Knižnica 'ASISTANTO Tenants' nebola nájdená.");
                return "";
            }
            
            // Získanie aktuálneho záznamu tenanta
            var tenantId = getTenantId(); // Predpokladáme, že existuje funkcia na získanie ID tenanta
            var tenantEntries = tenantsLib.find("ID = '" + tenantId + "'");
            
            if (tenantEntries.length === 0) {
                message("Chyba: Záznam tenanta s ID '" + tenantId + "' nebol nájdený.");
                return "";
            }
            
            // Získanie API kľúča
            var apiKey = tenantEntries[0].field("API Google Maps");
            if (!apiKey) {
                message("Chyba: API kľúč pre Google Maps nie je nastavený v databáze ASISTANTO Tenants.");
                return "";
            }
            
            return apiKey;
        } catch (e) {
            message("Chyba pri získavaní API kľúča: " + e.message);
            return "";
        }
    },
    
    /**
     * Získa súradnice miesta zo záznamu v databáze Miesta
     * @param {Object} placeEntry - Záznam miesta
     * @returns {Object} Objekt so súradnicami {lat, lng} alebo null v prípade chyby
     */
    getPlaceCoordinates: function(placeEntry) {
        try {
            if (!placeEntry) {
                return null;
            }
            
            // Získanie súradníc z polí záznamu
            var lat = placeEntry.field("Latitude");
            var lng = placeEntry.field("Longitude");
            
            // Kontrola, či sú súradnice k dispozícii
            if (!lat || !lng) {
                // Skúsime alternatívne názvy polí
                lat = placeEntry.field("Zemepisná šírka");
                lng = placeEntry.field("Zemepisná dĺžka");
                
                if (!lat || !lng) {
                    // Skúsime ešte ďalšie alternatívne názvy polí
                    lat = placeEntry.field("Lat");
                    lng = placeEntry.field("Lng");
                    
                    if (!lat || !lng) {
                        return null;
                    }
                }
            }
            
            // Konverzia na čísla
            lat = parseFloat(lat);
            lng = parseFloat(lng);
            
            if (isNaN(lat) || isNaN(lng)) {
                return null;
            }
            
            return {
                lat: lat,
                lng: lng
            };
        } catch (e) {
            message("Chyba pri získavaní súradníc miesta: " + e.message);
            return null;
        }
    },
    
    /**
     * Získa súradnice všetkých zástavok z jazdy
     * @param {Object} tripEntry - Záznam jazdy
     * @returns {Array} Pole objektov so súradnicami [{lat, lng}, ...] alebo prázdne pole v prípade chyby
     */
    getTripStopCoordinates: function(tripEntry) {
        try {
            if (!tripEntry) {
