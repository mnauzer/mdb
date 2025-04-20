/**
 * Memento Database - Kniha jázd
 * 
 * Štandardná knižnica pre prácu s databázou Kniha jázd, ktorá umožňuje
 * výpočet prejdenej trasy a vzdialenosti pomocou Google Maps API.
 * 
 * @module std.KnihaJazd
 * @author Cline
 * @version 1.0.0
 * @date 2025-04-19
 */

// Inicializácia globálneho objektu std, ak ešte neexistuje
var std = std || {};

// Inicializácia modulu pre chybové hlásenia, ak ešte neexistuje
std.ErrorHandler = std.ErrorHandler || {
    logError: function(module, method, error, details) {
        console.error("[" + module + "." + method + "] " + error + (details ? ": " + details : ""));
    },
    showError: function(message, error) {
        var errorMessage = message + (error ? ": " + error.message : "");
        console.error(errorMessage);
        message(errorMessage);
    }
};

// Modul pre prácu s knihou jázd
std.KnihaJazd = {
    // Konštanty
    MODULE_NAME: "KnihaJazd",
    DB_TENANTS: "ASISTANTO Tenants",
    DB_PLACES: "Miesta",
    FIELD_API_KEY: "API Google Maps",
    FIELD_COORDINATES: "Súradnice",
    FIELD_STOPS: "Zástavky",
    FIELD_DISTANCE: "Vzdialenosť (km)",
    FIELD_DURATION: "Trvanie (hod)",
    FIELD_NAME: "Názov",
    
    /**
     * Získa API kľúč pre Google Maps z databázy ASISTANTO Tenants
     * @returns {String} API kľúč pre Google Maps alebo prázdny reťazec v prípade chyby
     */
    getGoogleMapsApiKey: function() {
        try {
            // Získanie knižnice ASISTANTO Tenants
            var tenantsLib = libByName(this.DB_TENANTS);
            if (!tenantsLib) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getGoogleMapsApiKey", "Knižnica '" + this.DB_TENANTS + "' nebola nájdená");
                return "";
            }
            
            // Získanie aktuálneho záznamu tenanta
            var tenantId = std.Utils.getTenantId(); // Predpokladáme, že existuje funkcia na získanie ID tenanta
            var tenantEntries = tenantsLib.find("ID = '" + tenantId + "'");
            
            if (tenantEntries.length === 0) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getGoogleMapsApiKey", "Záznam tenanta s ID '" + tenantId + "' nebol nájdený");
                return "";
            }
            
            // Získanie API kľúča
            var apiKey = tenantEntries[0].field(this.FIELD_API_KEY);
            if (!apiKey) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getGoogleMapsApiKey", "API kľúč pre Google Maps nie je nastavený v databáze " + this.DB_TENANTS);
                return "";
            }
            
            return apiKey;
        } catch (e) {
            std.ErrorHandler.logError(this.MODULE_NAME, "getGoogleMapsApiKey", "Neočakávaná chyba", e.message);
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
                std.ErrorHandler.logError(this.MODULE_NAME, "getPlaceCoordinates", "Neplatný záznam miesta");
                return null;
            }
            
            // Získanie súradníc z poľa typu Location
            var coordinates = placeEntry.field(this.FIELD_COORDINATES);
            if (!coordinates) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getPlaceCoordinates", "Miesto '" + placeEntry.field(this.FIELD_NAME) + "' nemá súradnice");
                return null;
            }
            
            // Pole typu Location obsahuje súradnice vo formáte "lat,lng"
            var parts = coordinates.split(",");
            if (parts.length !== 2) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getPlaceCoordinates", "Neplatný formát súradníc", coordinates);
                return null;
            }
            
            // Konverzia na čísla
            var lat = parseFloat(parts[0]);
            var lng = parseFloat(parts[1]);
            
            if (isNaN(lat) || isNaN(lng)) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getPlaceCoordinates", "Neplatné súradnice", coordinates);
                return null;
            }
            
            return {
                lat: lat,
                lng: lng
            };
        } catch (e) {
            std.ErrorHandler.logError(this.MODULE_NAME, "getPlaceCoordinates", "Neočakávaná chyba", e.message);
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
                std.ErrorHandler.logError(this.MODULE_NAME, "getTripStopCoordinates", "Neplatný záznam jazdy");
                return [];
            }
            
            // Získanie knižnice Miesta
            var placesLib = libByName(this.DB_PLACES);
            if (!placesLib) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getTripStopCoordinates", "Knižnica '" + this.DB_PLACES + "' nebola nájdená");
                return [];
            }
            
            // Získanie zástavok z jazdy
            var stops = tripEntry.field(this.FIELD_STOPS);
            if (!stops || stops.length === 0) {
                std.ErrorHandler.logError(this.MODULE_NAME, "getTripStopCoordinates", "Jazda nemá žiadne zástavky");
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
                    var placeEntries = placesLib.find(this.FIELD_NAME + " = '" + stop + "'");
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
                        std.ErrorHandler.logError(this.MODULE_NAME, "getTripStopCoordinates", "Miesto '" + (placeEntry.field(this.FIELD_NAME) || "Neznáme") + "' nemá súradnice");
                    }
                }
            }
            
            return coordinates;
        } catch (e) {
            std.ErrorHandler.logError(this.MODULE_NAME, "getTripStopCoordinates", "Neočakávaná chyba", e.message);
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
            if (!point1 || !point2) {
                std.ErrorHandler.logError(this.MODULE_NAME, "calculateHaversineDistance", "Neplatné súradnice bodov");
                return 0;
            }
            
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
            std.ErrorHandler.logError(this.MODULE_NAME, "calculateHaversineDistance", "Neočakávaná chyba", e.message);
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
        var self = this;
        
        try {
            if (!coordinates || coordinates.length < 2) {
                std.ErrorHandler.logError(this.MODULE_NAME, "calculateRouteDistance", "Neplatné súradnice alebo nedostatok bodov");
                return Promise.resolve({
                    distance: 0,
                    duration: 0,
                    status: "INVALID_REQUEST"
                });
            }
            
            // Získanie API kľúča
            var apiKey = this.getGoogleMapsApiKey();
            if (!apiKey) {
                std.ErrorHandler.logError(this.MODULE_NAME, "calculateRouteDistance", "Chýba API kľúč pre Google Maps");
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
                                    std.ErrorHandler.logError(self.MODULE_NAME, "calculateRouteDistance", "Google Maps API vrátilo chybu", response.status || "UNKNOWN_ERROR");
                                    resolve({
                                        distance: 0,
                                        duration: 0,
                                        status: response.status || "UNKNOWN_ERROR"
                                    });
                                }
                            } catch (e) {
                                std.ErrorHandler.logError(self.MODULE_NAME, "calculateRouteDistance", "Chyba pri spracovaní odpovede", e.message);
                                reject(e);
                            }
                        } else {
                            std.ErrorHandler.logError(self.MODULE_NAME, "calculateRouteDistance", "HTTP chyba", http.status);
                            reject(new Error("HTTP Error: " + http.status));
                        }
                    }
                };
                
                http.send();
            });
        } catch (e) {
            std.ErrorHandler.logError(this.MODULE_NAME, "calculateRouteDistance", "Neočakávaná chyba", e.message);
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
                std.ErrorHandler.logError(this.MODULE_NAME, "calculateTripDistance", "Neplatný záznam jazdy");
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
                std.ErrorHandler.logError(this.MODULE_NAME, "calculateTripDistance", "Nedostatok zástavok pre výpočet trasy (minimum 2)");
                return Promise.resolve({
                    distance: 0,
                    duration: 0,
                    status: "INSUFFICIENT_STOPS"
                });
            }
            
            // Výpočet vzdialenosti trasy
            return this.calculateRouteDistance(coordinates);
        } catch (e) {
            std.ErrorHandler.logError(this.MODULE_NAME, "calculateTripDistance", "Neočakávaná chyba", e.message);
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
                    std.ErrorHandler.logError(self.MODULE_NAME, "updateTripDistance", "Neplatný záznam jazdy");
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
                                tripEntry.set(self.FIELD_DISTANCE, result.distance);
                                tripEntry.set(self.FIELD_DURATION, result.duration);
                                
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
                                tripEntry.set(self.FIELD_DISTANCE, haversineDistance);
                                tripEntry.set(self.FIELD_DURATION, haversineDistance / 60); // Odhad: 60 km/h
                                
                                std.ErrorHandler.logError(self.MODULE_NAME, "updateTripDistance", "Použitý Haversine vzorec namiesto Google Maps API", result.status);
                                
                                resolve({
                                    success: true,
                                    message: "Vzdialenosť a trvanie jazdy boli aktualizované pomocou Haversine vzorca (Google Maps API: " + result.status + ")",
                                    distance: haversineDistance,
                                    duration: haversineDistance / 60
                                });
                            }
                        } catch (e) {
                            std.ErrorHandler.logError(self.MODULE_NAME, "updateTripDistance", "Chyba pri aktualizácii polí", e.message);
                            reject(e);
                        }
                    })
                    .catch(function(error) {
                        std.ErrorHandler.logError(self.MODULE_NAME, "updateTripDistance", "Chyba pri výpočte vzdialenosti", error.message);
                        reject(error);
                    });
            } catch (e) {
                std.ErrorHandler.logError(self.MODULE_NAME, "updateTripDistance", "Neočakávaná chyba", e.message);
                reject(e);
            }
        });
    }
};

// Inicializácia modulu pre pomocné funkcie, ak ešte neexistuje
std.Utils = std.Utils || {
    /**
     * Získa ID aktuálneho tenanta
     * @returns {String} ID tenanta alebo prázdny reťazec v prípade chyby
     */
    getTenantId: function() {
        try {
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
            std.ErrorHandler.logError("Utils", "getTenantId", "Neočakávaná chyba", e.message);
            return "";
        }
    }
};

/**
 * Akcia pre výpočet vzdialenosti jazdy
 * @returns {void}
 */
function calculateTripDistanceAction() {
    try {
        var e = entry();
        
        std.KnihaJazd.updateTripDistance(e)
            .then(function(result) {
                if (result.success) {
                    message(result.message + "\n\nVzdialenosť: " + result.distance.toFixed(2) + " km\nTrvanie: " + (result.duration * 60).toFixed(0) + " minút");
                } else {
                    std.ErrorHandler.showError("Chyba pri výpočte vzdialenosti jazdy", { message: result.message });
                }
            })
            .catch(function(error) {
                std.ErrorHandler.showError("Chyba pri výpočte vzdialenosti jazdy", error);
            });
    } catch (e) {
        std.ErrorHandler.showError("Neočakávaná chyba pri výpočte vzdialenosti jazdy", e);
    }
}

/**
 * Akcia pre hromadný výpočet vzdialenosti pre viacero jázd
 * @returns {void}
 */
function calculateBulkTripDistanceAction() {
    try {
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
            
            std.KnihaJazd.updateTripDistance(entry)
                .then(function(result) {
                    if (result.success) {
                        count++;
                        totalDistance += result.distance;
                    } else {
                        errors++;
                        std.ErrorHandler.logError("KnihaJazd", "calculateBulkTripDistanceAction", "Chyba pri výpočte vzdialenosti pre záznam", result.message);
                    }
                    
                    // Spracovanie ďalšieho záznamu
                    processEntry(index + 1);
                })
                .catch(function(error) {
                    errors++;
                    std.ErrorHandler.logError("KnihaJazd", "calculateBulkTripDistanceAction", "Neočakávaná chyba pri výpočte vzdialenosti", error.message);
                    
                    // Spracovanie ďalšieho záznamu
                    processEntry(index + 1);
                });
        }
        
        // Spustenie spracovania od prvého záznamu
        processEntry(0);
    } catch (e) {
        std.ErrorHandler.showError("Neočakávaná chyba pri hromadnom výpočte vzdialenosti", e);
    }
}

/**
 * Akcia pre výpočet vzdialenosti medzi dvoma miestami
 * @returns {void}
 */
function calculateDistanceBetweenPlacesAction() {
    try {
        var placesLib = libByName(std.KnihaJazd.DB_PLACES);
        
        if (!placesLib) {
            std.ErrorHandler.showError("Knižnica '" + std.KnihaJazd.DB_PLACES + "' nebola nájdená");
            return;
        }
        
        // Získanie zoznamu miest
        var places = placesLib.entries();
        
        if (places.length < 2) {
            message("Knižnica '" + std.KnihaJazd.DB_PLACES + "' neobsahuje dostatok záznamov (minimum 2).");
            return;
        }
        
        // Vytvorenie zoznamu miest pre výber
        var placeNames = [];
        for (var i = 0; i < places.length; i++) {
            placeNames.push(places[i].field(std.KnihaJazd.FIELD_NAME));
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
        var startPlaceEntry = placesLib.find(std.KnihaJazd.FIELD_NAME + " = '" + startPlace + "'")[0];
        var endPlaceEntry = placesLib.find(std.KnihaJazd.FIELD_NAME + " = '" + endPlace + "'")[0];
        
        if (!startPlaceEntry || !endPlaceEntry) {
            std.ErrorHandler.showError("Jedno alebo obe miesta neboli nájdené");
            return;
        }
        
        // Získanie súradníc
        var startCoords = std.KnihaJazd.getPlaceCoordinates(startPlaceEntry);
        var endCoords = std.KnihaJazd.getPlaceCoordinates(endPlaceEntry);
        
        if (!startCoords || !endCoords) {
            std.ErrorHandler.showError("Jedno alebo obe miesta nemajú súradnice");
            return;
        }
        
        // Výpočet vzdialenosti
        std.KnihaJazd.calculateRouteDistance([startCoords, endCoords])
            .then(function(result) {
                if (result.status === "OK") {
                    message("Vzdialenosť medzi miestami:\n\n" +
                            "Začiatok: " + startPlace + "\n" +
                            "Cieľ: " + endPlace + "\n\n" +
                            "Vzdialenosť: " + result.distance.toFixed(2) + " km\n" +
                            "Trvanie: " + (result.duration * 60).toFixed(0) + " minút");
                } else {
                    // Výpočet vzdialenosti pomocou Haversine vzorca ako záloha
                    var haversineDistance = std.KnihaJazd.calculateHaversineDistance(startCoords, endCoords);
                    
                    message("Vzdialenosť medzi miestami (priama vzdialenosť):\n\n" +
                            "Začiatok: " + startPlace + "\n" +
                            "Cieľ: " + endPlace + "\n\n" +
                            "Vzdialenosť: " + haversineDistance.toFixed(2) + " km\n" +
                            "Poznámka: Použitý Haversine vzorec (Google Maps API: " + result.status + ")");
                }
            })
            .catch(function(error) {
                std.ErrorHandler.showError("Chyba pri výpočte vzdialenosti", error);
            });
    } catch (e) {
        std.ErrorHandler.showError("Neočakávaná chyba pri výpočte vzdialenosti medzi miestami", e);
    }
}
