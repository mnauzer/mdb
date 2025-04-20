// Standardized Library Cache for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Library cache module that provides caching for Memento Database libraries
 * This module can be used directly in Memento Database scripts
 * without requiring the ASISTANTO Scripts table.
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Library Cache module
std.LibraryCache = {
  // Cache storage
  _cache: {},
  
  // Default TTL (5 minutes in milliseconds)
  _ttl: 300000,
  
  /**
   * Set the TTL (Time To Live) for cached libraries
   * @param {Number} ttl - TTL in milliseconds
   */
  setTTL: function(ttl) {
    if (typeof ttl === 'number' && ttl > 0) {
      this._ttl = ttl;
    }
  },
  
  /**
   * Get a library by name, using cache if available
   * @param {String} libName - Name of the library to get
   * @returns {Object} - Library object
   */
  get: function(libName) {
    try {
      // Check if library is in cache and not expired
      var now = new Date().getTime();
      if (this._cache[libName] && 
          this._cache[libName].timestamp + this._ttl > now) {
        return this._cache[libName].library;
      }
      
      // Get library from Memento
      var library = libByName(libName);
      
      // Cache the library
      if (library) {
        this._cache[libName] = {
          library: library,
          timestamp: now
        };
      }
      
      return library;
    } catch (e) {
      // Use ErrorHandler if available
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createDatabaseError(e, 'std.LibraryCache.get', false);
      } else {
        // Use dialog for error
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error getting library: ' + libName + ' - ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }
      return null;
    }
  },
  
  /**
   * Invalidate a cached library
   * @param {String} libName - Name of the library to invalidate
   */
  invalidate: function(libName) {
    if (this._cache[libName]) {
      delete this._cache[libName];
    }
  },
  
  /**
   * Clear the entire cache
   */
  clear: function() {
    this._cache = {};
  },
  
  /**
   * Get the current cache status
   * @returns {Object} - Cache status
   */
  getStatus: function() {
    var status = {
      ttl: this._ttl,
      entries: 0,
      libraries: []
    };
    
    for (var libName in this._cache) {
      if (this._cache.hasOwnProperty(libName)) {
        status.entries++;
        status.libraries.push({
          name: libName,
          timestamp: this._cache[libName].timestamp,
          expires: new Date(this._cache[libName].timestamp + this._ttl)
        });
      }
    }
    
    return status;
  },
  
  /**
   * Show cache status in a dialog
   */
  showStatus: function() {
    var status = this.getStatus();
    var message = 'Cache TTL: ' + (status.ttl / 1000) + ' seconds\n';
    message += 'Cached Libraries: ' + status.entries + '\n\n';
    
    if (status.entries > 0) {
      message += 'Libraries:\n';
      for (var i = 0; i < status.libraries.length; i++) {
        var lib = status.libraries[i];
        message += '- ' + lib.name + '\n';
        message += '  Cached: ' + new Date(lib.timestamp).toLocaleString() + '\n';
        message += '  Expires: ' + lib.expires.toLocaleString() + '\n';
      }
    }
    
    // Show dialog
    var myDialog = dialog();
    myDialog.title('Library Cache Status')
            .text(message)
            .positiveButton('OK', function() {})
            .show();
  }
};

// For backward compatibility
var std_LibraryCache = std.LibraryCache;
