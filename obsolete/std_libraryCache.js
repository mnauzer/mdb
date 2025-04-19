// Standardized Library Cache for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Enhanced library cache with TTL and invalidation support
 * Improves performance by reducing calls to libByName
 */
var std_LibraryCache = {
  // Private cache storage
  _cache: {},
  
  // Timestamps for cache entries
  _timestamps: {},
  
  // Default TTL (Time To Live) in milliseconds (5 minutes)
  _ttl: 300000,
  
  /**
   * Get a library from cache or load it if not cached
   * @param {String} libName - Name of the library to get
   * @param {Boolean} forceRefresh - Whether to force a refresh of the cache
   * @returns {Object} - The Memento library object
   */
  get: function(libName, forceRefresh) {
    if (!libName) {
      return null;
    }
    
    var now = new Date().getTime();
    
    // If cache doesn't exist, expired, or force refresh requested
    if (forceRefresh || 
        !this._cache[libName] || 
        (this._timestamps[libName] && now - this._timestamps[libName] > this._ttl)) {
      try {
        this._cache[libName] = libByName(libName);
        this._timestamps[libName] = now;
      } catch (e) {
        // If we can't access std_ErrorHandler yet (during initialization)
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError(e, 'std_LibraryCache.get', false);
        } else {
          message('Error accessing library: ' + libName + ' - ' + e.toString());
        }
        return null;
      }
    }
    
    return this._cache[libName];
  },
  
  /**
   * Invalidate a specific library in the cache or the entire cache
   * @param {String} libName - Name of the library to invalidate (optional)
   */
  invalidate: function(libName) {
    if (libName) {
      delete this._cache[libName];
      delete this._timestamps[libName];
    } else {
      this.clear();
    }
  },
  
  /**
   * Clear the entire cache
   */
  clear: function() {
    this._cache = {};
    this._timestamps = {};
  },
  
  /**
   * Set the TTL (Time To Live) for cache entries
   * @param {Number} milliseconds - TTL in milliseconds
   */
  setTTL: function(milliseconds) {
    if (typeof milliseconds === 'number' && milliseconds > 0) {
      this._ttl = milliseconds;
    }
  },
  
  /**
   * Get all entries from a library with optional filtering
   * @param {String} libName - Name of the library
   * @param {Function} filterFn - Optional filter function
   * @returns {Array} - Array of entries
   */
  getEntries: function(libName, filterFn) {
    var lib = this.get(libName);
    if (!lib) {
      return [];
    }
    
    try {
      var entries = lib.entries();
      
      if (typeof filterFn === 'function') {
        var filtered = [];
        for (var i = 0; i < entries.length; i++) {
          if (filterFn(entries[i])) {
            filtered.push(entries[i]);
          }
        }
        return filtered;
      }
      
      return entries;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_LibraryCache.getEntries', false);
      }
      return [];
    }
  },
  
  /**
   * Find entries in a library using a filter
   * @param {String} libName - Name of the library
   * @param {String|Object} filter - Filter to apply
   * @returns {Array} - Array of matching entries
   */
  findEntries: function(libName, filter) {
    var lib = this.get(libName);
    if (!lib) {
      return [];
    }
    
    try {
      return lib.find(filter);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_LibraryCache.findEntries', false);
      }
      return [];
    }
  },
  
  /**
   * Create a new entry in a library
   * @param {String} libName - Name of the library
   * @param {Object} data - Data for the new entry
   * @returns {Object} - The created entry or null if failed
   */
  createEntry: function(libName, data) {
    var lib = this.get(libName);
    if (!lib) {
      return null;
    }
    
    try {
      return lib.create(data);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_LibraryCache.createEntry', true);
      }
      return null;
    }
  }
};

// Make available globally
this.std_LibraryCache = std_LibraryCache;
