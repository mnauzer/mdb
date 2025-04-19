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
                return [];
            }
            
            // Získanie knižnice Miesta
            var placesLib = libByName("Miesta");
            if (!placesLib) {
                message("Chyba: Knižnica 'Miesta' nebola nájdená.");
                return [];
            }
            
            // Získanie zástavok z jazdy
            var stops = tripEntry.field("Zástavky");
            if (!stops || stops.length === 0) {
                message("Upozornenie: Jazda nemá žiadne zástavky.");
                return [];
            }
            
            // Pole pre uloženie súradníc zástavok
            var coordinates = [];
            
            // Prechádzanie všetkých zástavok
            for (var i = 0; i < stops.length; i++) {
                var stop = stops[i];
                
                // Získanie záznamu miesta
                var placeEntry = null;
                
                if (typeof stop === 'object' && stop.lib && stop.id) {
                    // Priamy link na záznam
                    placeEntry = stop;
                } else if (typeof stop === 'string') {
                    // Názov miesta - vyhľadanie v knižnici
                    var placeEntries = placesLib.find("Názov = '" + stop + "'");
                    if (placeEntries.length > 0) {
                        placeEntry = placeEntries[0];
                    }
                }
                
                if (placeEntry) {
                    // Získanie súradníc miesta
                    var coords = this.getPlaceCoordinates(placeEntry);
                    if (coords) {
                        coordinates.push(coords);
                    } else {
                        message("Upozornenie: Miesto '" + (placeEntry.field("Názov") || "Neznáme") + "' nemá súradnice.");
                    }
                }
            }
            
            return coordinates;
        } catch (e) {
            message("Chyba pri získavaní súradníc zástavok: " + e.message);
            return [];
        }
    },
    
    /**
     * Vypočíta vzdialenosť medzi dvoma bodmi pomocou Haversine vzorca (priama vzdialenosť)
     * @param {Object} point1 - Prvý bod {lat, lng}
     * @param {Object} point2 - Druhý bod {lat, lng}
     * @returns {Number} Vzdialenosť v kilometroch
     */
    calculateHaversineDistance: function(point1, point2) {
        try {
            var R = 6371; // Polomer Zeme v km
            var dLat = this._toRad(point2.lat - point1.lat);
            var dLon = this._toRad(point2.lng - point1.lng);
            var lat1 = this._toRad(point1.lat);
            var lat2 = this._toRad(point2.lat);
            
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            
            return d;
        } catch (e) {
            message("Chyba pri výpočte Haversine vzdialenosti: " + e.message);
            return 0;
        }
    },
    
    /**
     * Konvertuje stupne na radiány
     * @param {Number} value - Hodnota v stupňoch
     * @returns {Number} Hodnota v radiánoch
     * @private
     */
    _toRad: function(value) {
        return value * Math.PI / 180;
    },
    
    /**
     * Vypočíta vzdialenosť trasy pomocou Google Maps API
     * @param {Array} coordinates - Pole objektov so súradnicami [{lat, lng}, ...]
     * @returns {Promise} Promise s výsledkom výpočtu {distance, duration, status}
     */
    calculateRouteDistance: function(coordinates) {
        try {
            if (!coordinates || coordinates.length < 2) {
                return Promise.resolve({
                    distance: 0,
                    duration: 0,
                    status: "INVALID_REQUEST"
                });
            }
            
            // Získanie API kľúča
            var apiKey = this.getGoogleMapsApiKey();
            if (!apiKey) {
                return Promise.resolve({
                    distance: 0,
                    duration: 0,
                    status: "API_KEY_MISSING"
                });
            }
            
            // Vytvorenie URL pre Google Maps Directions API
            var url = "https://maps.googleapis.com/maps/api/directions/json?";
            
            // Pridanie parametrov
            url += "origin=" + coordinates[0].lat + "," + coordinates[0].lng;
            url += "&destination=" + coordinates[coordinates.length - 1].lat + "," + coordinates[coordinates.length - 1].lng;
            
            // Pridanie waypoints, ak je viac ako 2 body
            if (coordinates.length > 2) {
                url += "&waypoints=";
                for (var i = 1; i < coordinates.length - 1; i++) {
                    if (i > 1) {
                        url += "|";
                    }
                    url += coordinates[i].lat + "," + coordinates[i].lng;
                }
            }
            
            // Pridanie ďalších parametrov
            url += "&mode=driving";
            url += "&units=metric";
            url += "&key=" + apiKey;
            
            // Vytvorenie HTTP požiadavky
            var http = new XMLHttpRequest();
            http.open("GET", url, true);
            
            // Vytvorenie Promise pre asynchrónne spracovanie
            return new Promise(function(resolve, reject) {
                http.onreadystatechange = function() {
                    if (http.readyState === 4) {
                        if (http.status === 200) {
                            try {
                                var response = JSON.parse(http.responseText);
                                
                                if (response.status === "OK" && response.routes && response.routes.length > 0) {
                                    var route = response.routes[0];
                                    var legs = route.legs;
                                    
                                    var totalDistance = 0;
                                    var totalDuration = 0;
                                    
                                    for (var i = 0; i < legs.length; i++) {
                                        totalDistance += legs[i].distance.value;
                                        totalDuration += legs[i].duration.value;
                                    }
                                    
                                    // Konverzia na kilometre a hodiny
                                    totalDistance = totalDistance / 1000;
                                    totalDuration = totalDuration / 3600;
                                    
                                    resolve({
                                        distance: totalDistance,
                                        duration: totalDuration,
                                        status: "OK"
                                    });
                                } else {
                                    resolve({
                                        distance: 0,
                                        duration: 0,
                                        status: response.status || "UNKNOWN_ERROR"
                                    });
                                }
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            reject(new Error("HTTP Error: " + http.status));
                        }
                    }
                };
                
                http.send();
            });
        } catch (e) {
            message("Chyba pri výpočte vzdialenosti trasy: " + e.message);
            return Promise.resolve({
                distance: 0,
                duration: 0,
                status: "ERROR"
            });
        }
    },
    
    /**
     * Vypočíta vzdialenosť trasy pre jazdu
     * @param {Object} tripEntry - Záznam jazdy
     * @returns {Promise} Promise s výsledkom výpočtu {distance, duration, status}
     */
    calculateTripDistance: function(tripEntry) {
        try {
            if (!tripEntry) {
                return Promise.resolve({
                    distance: 0,
                    duration: 0,
                    status: "INVALID_TRIP"
                });
            }
            
            // Získanie súradníc zástavok
            var coordinates = this.getTripStopCoordinates(tripEntry);
            
            if (coordinates.length < 2) {
                // Ak nemáme aspoň 2 body, nemôžeme vypočítať trasu
                return Promise.resolve({
                    distance: 0,
                    duration: 0,
                    status: "INSUFFICIENT_STOPS"
                });
            }
            
            // Výpočet vzdialenosti trasy
            return this.calculateRouteDistance(coordinates);
        } catch (e) {
            message("Chyba pri výpočte vzdialenosti jazdy: " + e.message);
            return Promise.resolve({
                distance: 0,
                duration: 0,
                status: "ERROR"
            });
        }
    },
    
    /**
     * Aktualizuje vzdialenosť a trvanie jazdy v zázname
     * @param {Object} tripEntry - Záznam jazdy
     * @returns {Promise} Promise s výsledkom aktualizácie {success, message, distance, duration}
     */
    updateTripDistance: function(tripEntry) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                if (!tripEntry) {
                    resolve({
                        success: false,
                        message: "Neplatný záznam jazdy",
                        distance: 0,
                        duration: 0
                    });
                    return;
                }
                
                // Výpočet vzdialenosti jazdy
                self.calculateTripDistance(tripEntry)
                    .then(function(result) {
                        try {
                            if (result.status === "OK") {
                                // Aktualizácia polí v zázname
                                tripEntry.set("Vzdialenosť (km)", result.distance);
                                tripEntry.set("Trvanie (hod)", result.duration);
                                
                                resolve({
                                    success: true,
                                    message: "Vzdialenosť a trvanie jazdy boli úspešne aktualizované",
                                    distance: result.distance,
                                    duration: result.duration
                                });
                            } else {
                                // Výpočet vzdialenosti pomocou Haversine vzorca ako záloha
                                var coordinates = self.getTripStopCoordinates(tripEntry);
                                var haversineDistance = 0;
                                
                                for (var i = 1; i < coordinates.length; i++) {
                                    haversineDistance += self.calculateHaversineDistance(coordinates[i-1], coordinates[i]);
                                }
                                
                                // Aktualizácia polí v zázname
                                tripEntry.set("Vzdialenosť (km)", haversineDistance);
                                tripEntry.set("Trvanie (hod)", haversineDistance / 60); // Odhad: 60 km/h
                                
                                resolve({
                                    success: true,
                                    message: "Vzdialenosť a trvanie jazdy boli aktualizované pomocou Haversine vzorca (Google Maps API: " + result.status + ")",
                                    distance: haversineDistance,
                                    duration: haversineDistance / 60
                                });
                            }
                        } catch (e) {
                            reject(e);
                        }
                    })
                    .catch(function(error) {
                        reject(error);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }
};

/**
 * Akcia pre výpočet vzdialenosti jazdy
 * @returns {void}
 */
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

/**
 * Akcia pre hromadný výpočet vzdialenosti pre viacero jázd
 * @returns {void}
 */
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

/**
 * Akcia pre výpočet vzdialenosti medzi dvoma miestami
 * @returns {void}
 */
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

/**
 * Pomocná funkcia pre získanie ID aktuálneho tenanta
 * @returns {String} ID tenanta alebo prázdny reťazec v prípade chyby
 */
function getTenantId() {
    try {
        // Implementácia závisí od vašej aplikácie
        // Toto je len príklad, ako by mohla vyzerať
        
        // Možnosť 1: Získanie z globálnej premennej
        if (typeof TENANT_ID !== 'undefined') {
            return TENANT_ID;
        }
        
        // Možnosť 2: Získanie z knižnice nastavení
        var settingsLib = libByName("Nastavenia");
        if (settingsLib) {
            var settingsEntries = settingsLib.find("Názov = 'TENANT_ID'");
            if (settingsEntries.length > 0) {
                return settingsEntries[0].field("Hodnota");
            }
        }
        
        // Možnosť 3: Použitie predvolenej hodnoty
        return "default";
    } catch (e) {
        message("Chyba pri získavaní ID tenanta: " + e.message);
        return "";
    }
}
