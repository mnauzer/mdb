// Standardized Data Access Module for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Data Access module that provides a consistent API for working with Memento Database
 * Includes CRUD operations and other data manipulation functions
 */
var std_DataAccess = {
  /**
   * Create a new entry in a library
   * @param {String} libName - Library name
   * @param {Object} data - Data for the new entry
   * @returns {Object} - Created entry or null if failed
   */
  create: function(libName, data) {
    try {
      var library = std_LibraryCache.get(libName);
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + libName, 'std_DataAccess.create', true);
        }
        return null;
      }
      
      return library.create(data);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.create', true);
      } else {
        message('Error creating entry: ' + e.toString());
      }
      return null;
    }
  },
  
  /**
   * Find entries in a library
   * @param {String} libName - Library name
   * @param {String|Object} filter - Filter to apply
   * @returns {Array} - Array of matching entries
   */
  find: function(libName, filter) {
    try {
      var library = std_LibraryCache.get(libName);
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + libName, 'std_DataAccess.find', false);
        }
        return [];
      }
      
      return library.find(filter);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.find', false);
      } else {
        message('Error finding entries: ' + e.toString());
      }
      return [];
    }
  },
  
  /**
   * Get all entries from a library
   * @param {String} libName - Library name
   * @returns {Array} - Array of all entries
   */
  getAll: function(libName) {
    try {
      var library = std_LibraryCache.get(libName);
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + libName, 'std_DataAccess.getAll', false);
        }
        return [];
      }
      
      return library.entries();
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.getAll', false);
      } else {
        message('Error getting all entries: ' + e.toString());
      }
      return [];
    }
  },
  
  /**
   * Update an entry
   * @param {Object} entry - Entry to update
   * @param {Object} data - Data to update
   * @returns {Boolean} - True if successful
   */
  update: function(entry, data) {
    if (!entry) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createValidationError('Entry is null or undefined', null, 'std_DataAccess.update', true);
      }
      return false;
    }
    
    try {
      for (var field in data) {
        if (data.hasOwnProperty(field)) {
          entry.set(field, data[field]);
        }
      }
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.update', true);
      } else {
        message('Error updating entry: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Delete an entry
   * @param {Object} entry - Entry to delete
   * @returns {Boolean} - True if successful
   */
  delete: function(entry) {
    if (!entry) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createValidationError('Entry is null or undefined', null, 'std_DataAccess.delete', true);
      }
      return false;
    }
    
    try {
      entry.trash();
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.delete', true);
      } else {
        message('Error deleting entry: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Get an entry by ID
   * @param {String} libName - Library name
   * @param {String|Number} id - Entry ID
   * @returns {Object} - Entry or null if not found
   */
  getById: function(libName, id) {
    try {
      var library = std_LibraryCache.get(libName);
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + libName, 'std_DataAccess.getById', false);
        }
        return null;
      }
      
      var entries = library.findById(id);
      return entries.length > 0 ? entries[0] : null;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.getById', false);
      } else {
        message('Error getting entry by ID: ' + e.toString());
      }
      return null;
    }
  },
  
  /**
   * Get entries by field value
   * @param {String} libName - Library name
   * @param {String} fieldName - Field name
   * @param {*} value - Field value
   * @returns {Array} - Array of matching entries
   */
  getByField: function(libName, fieldName, value) {
    try {
      var library = std_LibraryCache.get(libName);
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + libName, 'std_DataAccess.getByField', false);
        }
        return [];
      }
      
      var filter = {};
      filter[fieldName] = value;
      return library.find(filter);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.getByField', false);
      } else {
        message('Error getting entries by field: ' + e.toString());
      }
      return [];
    }
  },
  
  /**
   * Get entries by date range
   * @param {String} libName - Library name
   * @param {String} dateField - Date field name
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} - Array of matching entries
   */
  getByDateRange: function(libName, dateField, startDate, endDate) {
    try {
      var library = std_LibraryCache.get(libName);
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + libName, 'std_DataAccess.getByDateRange', false);
        }
        return [];
      }
      
      var entries = library.entries();
      var result = [];
      
      for (var i = 0; i < entries.length; i++) {
        var entryDate = entries[i].field(dateField);
        
        if (entryDate instanceof Date) {
          if ((!startDate || entryDate >= startDate) && 
              (!endDate || entryDate <= endDate)) {
            result.push(entries[i]);
          }
        }
      }
      
      return result;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.getByDateRange', false);
      } else {
        message('Error getting entries by date range: ' + e.toString());
      }
      return [];
    }
  },
  
  /**
   * Get entries sorted by a field
   * @param {String} libName - Library name
   * @param {String} sortField - Field to sort by
   * @param {Boolean} ascending - Sort direction (true for ascending, false for descending)
   * @returns {Array} - Sorted array of entries
   */
  getSorted: function(libName, sortField, ascending) {
    try {
      var entries = this.getAll(libName);
      
      entries.sort(function(a, b) {
        var valA = a.field(sortField);
        var valB = b.field(sortField);
        
        // Handle different types
        if (valA instanceof Date && valB instanceof Date) {
          return ascending ? valA - valB : valB - valA;
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          return ascending ? valA - valB : valB - valA;
        } else {
          // Convert to strings for comparison
          valA = valA !== null && valA !== undefined ? valA.toString() : '';
          valB = valB !== null && valB !== undefined ? valB.toString() : '';
          
          return ascending ? 
            valA.localeCompare(valB) : 
            valB.localeCompare(valA);
        }
      });
      
      return entries;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.getSorted', false);
      } else {
        message('Error sorting entries: ' + e.toString());
      }
      return [];
    }
  },
  
  /**
   * Get linked entries
   * @param {Object} entry - Source entry
   * @param {String} fieldName - Link field name
   * @returns {Array} - Array of linked entries
   */
  getLinked: function(entry, fieldName) {
    if (!entry) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createValidationError('Entry is null or undefined', null, 'std_DataAccess.getLinked', false);
      }
      return [];
    }
    
    try {
      return entry.field(fieldName) || [];
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.getLinked', false);
      } else {
        message('Error getting linked entries: ' + e.toString());
      }
      return [];
    }
  },
  
  /**
   * Get entries linked from another library
   * @param {Object} entry - Target entry
   * @param {String} libName - Source library name
   * @param {String} fieldName - Link field name in source library
   * @returns {Array} - Array of entries linked from the source library
   */
  getLinkedFrom: function(entry, libName, fieldName) {
    if (!entry) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createValidationError('Entry is null or undefined', null, 'std_DataAccess.getLinkedFrom', false);
      }
      return [];
    }
    
    try {
      return entry.linksFrom(libName, fieldName);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.getLinkedFrom', false);
      } else {
        message('Error getting entries linked from: ' + e.toString());
      }
      return [];
    }
  },
  
  /**
   * Create a new entry with standard fields
   * @param {String} libName - Library name
   * @param {Object} data - Custom data for the entry
   * @returns {Object} - Created entry or null if failed
   */
  createStandardEntry: function(libName, data) {
    try {
      // Add standard fields
      var standardData = {
        view: std_Constants.VIEW_STATES.EDIT,
        date: new Date()
      };
      
      // Add number if available
      if (app.activeLib && app.activeLib.number) {
        standardData[std_Constants.FIELDS.COMMON.NUMBER] = app.activeLib.number;
        standardData[std_Constants.FIELDS.COMMON.NUMBER_ENTRY] = app.activeLib.nextNum;
      }
      
      // Add season if available
      if (app.season) {
        standardData[std_Constants.FIELDS.COMMON.SEASON] = app.season;
      }
      
      // Add creation metadata
      standardData[std_Constants.FIELDS.COMMON.CREATED_BY] = user();
      standardData[std_Constants.FIELDS.COMMON.CREATED_DATE] = new Date();
      
      // Merge with custom data
      for (var field in data) {
        if (data.hasOwnProperty(field)) {
          standardData[field] = data[field];
        }
      }
      
      return this.create(libName, standardData);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.createStandardEntry', true);
      } else {
        message('Error creating standard entry: ' + e.toString());
      }
      return null;
    }
  },
  
  /**
   * Batch process entries
   * @param {Array} entries - Entries to process
   * @param {Function} processFn - Function to apply to each entry
   * @param {Number} batchSize - Batch size (default: 50)
   * @returns {Array} - Results of processing
   */
  batchProcess: function(entries, processFn, batchSize) {
    batchSize = batchSize || 50;
    var results = [];
    
    try {
      for (var i = 0; i < entries.length; i += batchSize) {
        var batch = entries.slice(i, Math.min(i + batchSize, entries.length));
        
        for (var j = 0; j < batch.length; j++) {
          results.push(processFn(batch[j]));
        }
        
        // Show progress for large batches
        if (entries.length > batchSize && i + batchSize < entries.length) {
          message('Processed ' + (i + batch.length) + ' of ' + entries.length + ' entries...');
        }
      }
      
      return results;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_DataAccess.batchProcess', true);
      } else {
        message('Error in batch processing: ' + e.toString());
      }
      return results;
    }
  }
};

// Make available globally
this.std_DataAccess = std_DataAccess;
