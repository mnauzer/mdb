// Standardized Utilities for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Collection of utility functions for common operations
 * Provides standardized methods for:
 * - Date manipulation
 * - String formatting
 * - Number formatting
 * - Object manipulation
 * - Array manipulation
 * - Validation
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Utilities module
std.Utils = {
  /**
   * Date utilities
   */
  Date: {
    /**
     * Format a date to a string
     * @param {Date} date - The date to format
     * @param {String} format - Optional format (simple, full, time, datetime)
     * @returns {String} - Formatted date string
     */
    format: function(date, format) {
      if (!date || !(date instanceof Date)) {
        return '';
      }
      
      format = format || 'simple';
      
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      
      // Pad with leading zeros
      day = day < 10 ? '0' + day : day;
      month = month < 10 ? '0' + month : month;
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      
      switch (format) {
        case 'full':
          return day + '.' + month + '.' + year;
        case 'time':
          return hours + ':' + minutes;
        case 'datetime':
          return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
        case 'simple':
        default:
          return day + '.' + month + '.' + year;
      }
    },
    
    /**
     * Add days to a date
     * @param {Date} date - The date to add days to
     * @param {Number} days - Number of days to add
     * @returns {Date} - New date with days added
     */
    addDays: function(date, days) {
      if (!date || !(date instanceof Date)) {
        return null;
      }
      
      var result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },
    
    /**
     * Round time to nearest quarter hour
     * @param {Date} time - The time to round
     * @returns {Date} - Rounded time
     */
    roundToQuarter: function(time) {
      if (!time || !(time instanceof Date)) {
        return null;
      }
      
      var result = new Date(time);
      result.setMilliseconds(0);
      result.setSeconds(0);
      
      var minutes = result.getMinutes();
      var roundedMinutes = Math.round(minutes / 15) * 15;
      
      if (roundedMinutes === 60) {
        result.setHours(result.getHours() + 1);
        roundedMinutes = 0;
      }
      
      result.setMinutes(roundedMinutes);
      return result;
    },
    
    /**
     * Calculate hours between two dates
     * @param {Date} start - Start date/time
     * @param {Date} end - End date/time
     * @returns {Number} - Hours between dates
     */
    calculateHours: function(start, end) {
      if (!start || !end || !(start instanceof Date) || !(end instanceof Date)) {
        return 0;
      }
      
      var constants = (typeof std !== 'undefined' && std.Constants) ? 
                      std.Constants.CALCULATION.MILLISECONDS_PER_HOUR : 
                      3600000; // 1 hour in milliseconds
      
      return (end.getTime() - start.getTime()) / constants;
    },
    
    /**
     * Check if a date is before another date
     * @param {Date} date1 - First date
     * @param {Date} date2 - Second date
     * @returns {Boolean} - True if date1 is before date2
     */
    isBefore: function(date1, date2) {
      if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
        return false;
      }
      
      return date1.getTime() < date2.getTime();
    },
    
    /**
     * Parse a time string to a Date object
     * @param {String} timeStr - Time string (e.g. "7:30")
     * @param {Date} baseDate - Optional base date to use
     * @returns {Date} - Date object with the specified time
     */
    parseTime: function(timeStr, baseDate) {
      if (!timeStr) {
        return null;
      }
      
      var parts = timeStr.split(':');
      if (parts.length < 2) {
        return null;
      }
      
      var hours = parseInt(parts[0], 10);
      var minutes = parseInt(parts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) {
        return null;
      }
      
      var result = baseDate ? new Date(baseDate) : new Date();
      result.setHours(hours);
      result.setMinutes(minutes);
      result.setSeconds(0);
      result.setMilliseconds(0);
      
      return result;
    }
  },
  
  /**
   * String utilities
   */
  String: {
    /**
     * Format a string by replacing placeholders
     * @param {String} str - String with placeholders {0}, {1}, etc.
     * @param {...*} args - Values to replace placeholders
     * @returns {String} - Formatted string
     */
    format: function(str) {
      if (!str) {
        return '';
      }
      
      var args = Array.prototype.slice.call(arguments, 1);
      
      return str.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] !== 'undefined' ? args[number] : match;
      });
    },
    
    /**
     * Check if a string is empty or whitespace
     * @param {String} str - String to check
     * @returns {Boolean} - True if string is empty or whitespace
     */
    isEmpty: function(str) {
      return !str || str.trim().length === 0;
    },
    
    /**
     * Truncate a string to a maximum length
     * @param {String} str - String to truncate
     * @param {Number} maxLength - Maximum length
     * @param {String} suffix - Optional suffix to add if truncated
     * @returns {String} - Truncated string
     */
    truncate: function(str, maxLength, suffix) {
      if (!str) {
        return '';
      }
      
      suffix = suffix || '...';
      
      if (str.length <= maxLength) {
        return str;
      }
      
      return str.substring(0, maxLength - suffix.length) + suffix;
    },
    
    /**
     * Pad a number with leading zeros
     * @param {Number} number - Number to pad
     * @param {Number} length - Desired length
     * @returns {String} - Padded number as string
     */
    padNumber: function(number, length) {
      var str = '' + number;
      while (str.length < length) {
        str = '0' + str;
      }
      return str;
    }
  },
  
  /**
   * Number utilities
   */
  Number: {
    /**
     * Format a number as currency
     * @param {Number} number - Number to format
     * @param {Number} decimals - Number of decimal places
     * @param {String} currencySymbol - Currency symbol
     * @returns {String} - Formatted currency string
     */
    formatCurrency: function(number, decimals, currencySymbol) {
      if (typeof number !== 'number') {
        return '';
      }
      
      var constants = (typeof std !== 'undefined' && std.Constants) ? 
                      std.Constants.CALCULATION.DECIMAL_PLACES : 
                      2; // Default decimal places
      
      decimals = decimals !== undefined ? decimals : constants;
      currencySymbol = currencySymbol || '€';
      
      var formatted = number.toFixed(decimals);
      
      // Replace dot with comma for European format
      formatted = formatted.replace('.', ',');
      
      // Add thousand separators
      var parts = formatted.split(',');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      
      return parts.join(',') + ' ' + currencySymbol;
    },
    
    /**
     * Round a number to a specified number of decimal places
     * @param {Number} number - Number to round
     * @param {Number} decimals - Number of decimal places
     * @returns {Number} - Rounded number
     */
    round: function(number, decimals) {
      if (typeof number !== 'number') {
        return 0;
      }
      
      var constants = (typeof std !== 'undefined' && std.Constants) ? 
                      std.Constants.CALCULATION.DECIMAL_PLACES : 
                      2; // Default decimal places
      
      decimals = decimals !== undefined ? decimals : constants;
      
      var factor = Math.pow(10, decimals);
      return Math.round(number * factor) / factor;
    }
  },
  
  /**
   * Object utilities
   */
  Object: {
    /**
     * Safely get a nested property from an object
     * @param {Object} obj - Object to get property from
     * @param {String} path - Property path (e.g. "a.b.c")
     * @param {*} defaultValue - Default value if property doesn't exist
     * @returns {*} - Property value or default value
     */
    getProperty: function(obj, path, defaultValue) {
      if (!obj || !path) {
        return defaultValue;
      }
      
      var parts = path.split('.');
      var current = obj;
      
      for (var i = 0; i < parts.length; i++) {
        if (current === null || current === undefined || typeof current !== 'object') {
          return defaultValue;
        }
        
        current = current[parts[i]];
      }
      
      return current !== undefined ? current : defaultValue;
    },
    
    /**
     * Check if an object is empty
     * @param {Object} obj - Object to check
     * @returns {Boolean} - True if object is empty
     */
    isEmpty: function(obj) {
      if (!obj) {
        return true;
      }
      
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          return false;
        }
      }
      
      return true;
    }
  },
  
  /**
   * Array utilities adapted for the application
   */
  Array: {
    /**
     * Check if an array is empty
     * @param {Array} arr - Array to check
     * @returns {Boolean} - True if array is empty or not an array
     */
    isEmpty: function(arr) {
      return !arr || !Array.isArray(arr) || arr.length === 0;
    },
    
    /**
     * Get the sum of a specific field from an array of objects
     * @param {Array} arr - Array of objects
     * @param {String} fieldName - Name of the field to sum
     * @returns {Number} - Sum of the field values
     */
    sumField: function(arr, fieldName) {
      if (this.isEmpty(arr) || !fieldName) {
        return 0;
      }
      
      var sum = 0;
      for (var i = 0; i < arr.length; i++) {
        var value = arr[i][fieldName];
        if (typeof value === 'number') {
          sum += value;
        } else if (typeof value === 'string') {
          var num = parseFloat(value);
          if (!isNaN(num)) {
            sum += num;
          }
        }
      }
      
      return sum;
    },
    
    /**
     * Get the sum of a specific field from an array of Memento entries
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to sum
     * @returns {Number} - Sum of the field values
     */
    sumEntryField: function(entries, fieldName) {
      if (this.isEmpty(entries) || !fieldName) {
        return 0;
      }
      
      var sum = 0;
      for (var i = 0; i < entries.length; i++) {
        try {
          var value = entries[i].field(fieldName);
          if (typeof value === 'number') {
            sum += value;
          } else if (typeof value === 'string') {
            var num = parseFloat(value);
            if (!isNaN(num)) {
              sum += num;
            }
          }
        } catch (e) {
          // Skip entries that don't have the field
        }
      }
      
      return sum;
    },
    
    /**
     * Filter an array of Memento entries by a field value
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to filter by
     * @param {*} value - Value to filter for
     * @param {Boolean} exactMatch - Whether to require an exact match (default: true)
     * @returns {Array} - Filtered array of entries
     */
    filterEntries: function(entries, fieldName, value, exactMatch) {
      if (this.isEmpty(entries) || !fieldName) {
        return [];
      }
      
      exactMatch = exactMatch !== undefined ? exactMatch : true;
      
      var result = [];
      for (var i = 0; i < entries.length; i++) {
        try {
          var fieldValue = entries[i].field(fieldName);
          
          if (exactMatch) {
            if (fieldValue === value) {
              result.push(entries[i]);
            }
          } else {
            // For string values, check for partial match
            if (typeof fieldValue === 'string' && typeof value === 'string') {
              if (fieldValue.indexOf(value) !== -1) {
                result.push(entries[i]);
              }
            } else if (fieldValue === value) {
              result.push(entries[i]);
            }
          }
        } catch (e) {
          // Skip entries that don't have the field
        }
      }
      
      return result;
    },
    
    /**
     * Group an array of Memento entries by a field value
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to group by
     * @returns {Object} - Object with field values as keys and arrays of entries as values
     */
    groupEntriesByField: function(entries, fieldName) {
      if (this.isEmpty(entries) || !fieldName) {
        return {};
      }
      
      var result = {};
      for (var i = 0; i < entries.length; i++) {
        try {
          var fieldValue = entries[i].field(fieldName);
          
          // Convert to string for object keys
          var key = fieldValue !== null && fieldValue !== undefined ? fieldValue.toString() : 'null';
          
          if (!result[key]) {
            result[key] = [];
          }
          
          result[key].push(entries[i]);
        } catch (e) {
          // Skip entries that don't have the field
        }
      }
      
      return result;
    },
    
    /**
     * Sort an array of Memento entries by a field value
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to sort by
     * @param {Boolean} ascending - Whether to sort in ascending order (default: true)
     * @returns {Array} - Sorted array of entries
     */
    sortEntriesByField: function(entries, fieldName, ascending) {
      if (this.isEmpty(entries) || !fieldName) {
        return entries || [];
      }
      
      ascending = ascending !== undefined ? ascending : true;
      
      var sortedEntries = entries.slice(); // Create a copy to avoid modifying the original
      
      sortedEntries.sort(function(a, b) {
        var valueA, valueB;
        
        try {
          valueA = a.field(fieldName);
        } catch (e) {
          valueA = null;
        }
        
        try {
          valueB = b.field(fieldName);
        } catch (e) {
          valueB = null;
        }
        
        // Handle null/undefined values
        if (valueA === null || valueA === undefined) {
          return ascending ? -1 : 1;
        }
        if (valueB === null || valueB === undefined) {
          return ascending ? 1 : -1;
        }
        
        // Sort based on value type
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return ascending ? 
                 valueA.localeCompare(valueB) : 
                 valueB.localeCompare(valueA);
        } else if (valueA instanceof Date && valueB instanceof Date) {
          return ascending ? 
                 valueA.getTime() - valueB.getTime() : 
                 valueB.getTime() - valueA.getTime();
        } else {
          // Default comparison
          if (valueA < valueB) {
            return ascending ? -1 : 1;
          }
          if (valueA > valueB) {
            return ascending ? 1 : -1;
          }
          return 0;
        }
      });
      
      return sortedEntries;
    },
    
    /**
     * Find the first entry in an array of Memento entries that matches a field value
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to match
     * @param {*} value - Value to match
     * @returns {Object|null} - Matching entry or null if not found
     */
    findEntryByField: function(entries, fieldName, value) {
      if (this.isEmpty(entries) || !fieldName) {
        return null;
      }
      
      for (var i = 0; i < entries.length; i++) {
        try {
          var fieldValue = entries[i].field(fieldName);
          if (fieldValue === value) {
            return entries[i];
          }
        } catch (e) {
          // Skip entries that don't have the field
        }
      }
      
      return null;
    },
    
    /**
     * Get unique values of a field from an array of Memento entries
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to get unique values for
     * @returns {Array} - Array of unique field values
     */
    getUniqueFieldValues: function(entries, fieldName) {
      if (this.isEmpty(entries) || !fieldName) {
        return [];
      }
      
      var values = {};
      var result = [];
      
      for (var i = 0; i < entries.length; i++) {
        try {
          var fieldValue = entries[i].field(fieldName);
          
          // Convert to string for object keys
          var key = fieldValue !== null && fieldValue !== undefined ? fieldValue.toString() : 'null';
          
          if (!values[key]) {
            values[key] = true;
            result.push(fieldValue);
          }
        } catch (e) {
          // Skip entries that don't have the field
        }
      }
      
      return result;
    },
    
    /**
     * Convert an array of Memento entries to an array of objects with specified fields
     * @param {Array} entries - Array of Memento entries
     * @param {Array} fieldNames - Array of field names to include
     * @returns {Array} - Array of objects with the specified fields
     */
    entriesToObjects: function(entries, fieldNames) {
      if (this.isEmpty(entries)) {
        return [];
      }
      
      if (!fieldNames || !Array.isArray(fieldNames) || fieldNames.length === 0) {
        // If no field names specified, try to get all fields from the first entry
        if (entries.length > 0) {
          try {
            fieldNames = entries[0].fields();
          } catch (e) {
            return [];
          }
        } else {
          return [];
        }
      }
      
      var result = [];
      
      for (var i = 0; i < entries.length; i++) {
        var obj = {};
        
        for (var j = 0; j < fieldNames.length; j++) {
          try {
            obj[fieldNames[j]] = entries[i].field(fieldNames[j]);
          } catch (e) {
            obj[fieldNames[j]] = null;
          }
        }
        
        result.push(obj);
      }
      
      return result;
    },
    
    /**
     * Merge multiple arrays into a single array
     * @param {...Array} arrays - Arrays to merge
     * @returns {Array} - Merged array
     */
    merge: function() {
      var result = [];
      
      for (var i = 0; i < arguments.length; i++) {
        var arr = arguments[i];
        if (arr && Array.isArray(arr)) {
          for (var j = 0; j < arr.length; j++) {
            result.push(arr[j]);
          }
        }
      }
      
      return result;
    },
    
    /**
     * Remove duplicate entries from an array of Memento entries based on a field value
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to check for duplicates
     * @returns {Array} - Array with duplicates removed
     */
    removeDuplicateEntries: function(entries, fieldName) {
      if (this.isEmpty(entries) || !fieldName) {
        return entries || [];
      }
      
      var seen = {};
      var result = [];
      
      for (var i = 0; i < entries.length; i++) {
        try {
          var fieldValue = entries[i].field(fieldName);
          
          // Convert to string for object keys
          var key = fieldValue !== null && fieldValue !== undefined ? fieldValue.toString() : 'null';
          
          if (!seen[key]) {
            seen[key] = true;
            result.push(entries[i]);
          }
        } catch (e) {
          // Include entries that don't have the field (they're all unique)
          result.push(entries[i]);
        }
      }
      
      return result;
    }
  },
  
  /**
   * Field utilities for working with Memento fields
   */
  Field: {
    /**
     * Safely get a field value from an entry
     * @param {Object} entry - Memento entry
     * @param {String} fieldName - Field name
     * @param {*} defaultValue - Default value if field doesn't exist
     * @returns {*} - Field value or default value
     */
    getValue: function(entry, fieldName, defaultValue) {
      if (!entry || !fieldName) {
        return defaultValue;
      }
      
      try {
        var value = entry.field(fieldName);
        return value !== undefined && value !== null ? value : defaultValue;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createDatabaseError(e, 'std.Utils.Field.getValue', false);
        }
        return defaultValue;
      }
    },
    
    /**
     * Safely set a field value on an entry
     * @param {Object} entry - Memento entry
     * @param {String} fieldName - Field name
     * @param {*} value - Value to set
     * @returns {Boolean} - True if successful
     */
    setValue: function(entry, fieldName, value) {
      if (!entry || !fieldName) {
        return false;
      }
      
      try {
        entry.set(fieldName, value);
        return true;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createDatabaseError(e, 'std.Utils.Field.setValue', true);
        }
        return false;
      }
    },
    
    /**
     * Safely get an attribute value from an entry
     * @param {Object} entry - Memento entry
     * @param {String} attrName - Attribute name
     * @param {*} defaultValue - Default value if attribute doesn't exist
     * @returns {*} - Attribute value or default value
     */
    getAttr: function(entry, attrName, defaultValue) {
      if (!entry || !attrName) {
        return defaultValue;
      }
      
      try {
        var value = entry.attr(attrName);
        return value !== undefined && value !== null ? value : defaultValue;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createDatabaseError(e, 'std.Utils.Field.getAttr', false);
        }
        return defaultValue;
      }
    },
    
    /**
     * Safely set an attribute value on an entry
     * @param {Object} entry - Memento entry
     * @param {String} attrName - Attribute name
     * @param {*} value - Value to set
     * @returns {Boolean} - True if successful
     */
    setAttr: function(entry, attrName, value) {
      if (!entry || !attrName) {
        return false;
      }
      
      try {
        entry.setAttr(attrName, value);
        return true;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createDatabaseError(e, 'std.Utils.Field.setAttr', true);
        }
        return false;
      }
    }
  },
  
  /**
   * Historical Data utilities for working with time-based records
   */
  HistoricalData: {
    /**
     * Find the current valid value from a historical data table based on a date
     * @param {String} tableName - Name of the table containing historical data
     * @param {String} keyField - Name of the field that identifies the entity (e.g., 'zamestnanec_id')
     * @param {*} keyValue - Value of the key field to match
     * @param {String} valueField - Name of the field containing the value to retrieve (e.g., 'sadzba')
     * @param {String} dateField - Name of the field containing the effective date (e.g., 'platné_od')
     * @param {Date} referenceDate - Optional date to check against (defaults to current date)
     * @param {Boolean} exactMatch - Whether to require an exact match for the key (default: true)
     * @returns {*} - The current valid value or null if not found
     */
    getCurrentValue: function(tableName, keyField, keyValue, valueField, dateField, referenceDate, exactMatch) {
      try {
        // Default to current date if not provided
        referenceDate = referenceDate || new Date();
        exactMatch = exactMatch !== undefined ? exactMatch : true;
        
        // Get the table
        var dataTable;
        if (typeof std !== 'undefined' && std.LibraryCache) {
          dataTable = std.LibraryCache.get(tableName);
        } else {
          dataTable = libByName(tableName);
        }
        
        if (!dataTable) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createDatabaseError('Table not found: ' + tableName, 'std.Utils.HistoricalData.getCurrentValue', false);
          }
          return null;
        }
        
        // Get all entries
        var allEntries = dataTable.entries();
        if (!allEntries || allEntries.length === 0) {
          return null;
        }
        
        // Filter entries by key field
        var matchingEntries = [];
        for (var i = 0; i < allEntries.length; i++) {
          var entry = allEntries[i];
          try {
            var entryKeyValue = entry.field(keyField);
            
            if (exactMatch) {
              if (entryKeyValue === keyValue) {
                matchingEntries.push(entry);
              }
            } else {
              // For string values, check for partial match
              if (typeof entryKeyValue === 'string' && typeof keyValue === 'string') {
                if (entryKeyValue.indexOf(keyValue) !== -1) {
                  matchingEntries.push(entry);
                }
              } else if (entryKeyValue === keyValue) {
                matchingEntries.push(entry);
              }
            }
          } catch (e) {
            // Skip entries that don't have the key field
          }
        }
        
        if (matchingEntries.length === 0) {
          return null;
        }
        
        // Filter entries by date field (date <= referenceDate)
        var validEntries = [];
        for (var j = 0; j < matchingEntries.length; j++) {
          var entry = matchingEntries[j];
          try {
            var entryDate = entry.field(dateField);
            
            if (entryDate instanceof Date && entryDate <= referenceDate) {
              validEntries.push(entry);
            }
          } catch (e) {
            // Skip entries that don't have the date field or have invalid dates
          }
        }
        
        if (validEntries.length === 0) {
          return null;
        }
        
        // Sort valid entries by date in descending order (newest first)
        validEntries.sort(function(a, b) {
          var dateA = a.field(dateField);
          var dateB = b.field(dateField);
          
          return dateB.getTime() - dateA.getTime();
        });
        
        // Return the value from the most recent valid entry
        try {
          return validEntries[0].field(valueField);
        } catch (e) {
          // If value field doesn't exist
          return null;
        }
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, 'std.Utils.HistoricalData.getCurrentValue', false);
        }
        return null;
      }
    },
    
    /**
     * Find the current valid record from a historical data table based on a date
     * @param {String} tableName - Name of the table containing historical data
     * @param {String} keyField - Name of the field that identifies the entity (e.g., 'zamestnanec_id')
     * @param {*} keyValue - Value of the key field to match
     * @param {String} dateField - Name of the field containing the effective date (e.g., 'platné_od')
     * @param {Date} referenceDate - Optional date to check against (defaults to current date)
     * @param {Boolean} exactMatch - Whether to require an exact match for the key (default: true)
     * @returns {Object} - The current valid record or null if not found
     */
    getCurrentRecord: function(tableName, keyField, keyValue, dateField, referenceDate, exactMatch) {
      try {
        // Default to current date if not provided
        referenceDate = referenceDate || new Date();
        exactMatch = exactMatch !== undefined ? exactMatch : true;
        
        // Get the table
        var dataTable;
        if (typeof std !== 'undefined' && std.LibraryCache) {
          dataTable = std.LibraryCache.get(tableName);
        } else {
          dataTable = libByName(tableName);
        }
        
        if (!dataTable) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createDatabaseError('Table not found: ' + tableName, 'std.Utils.HistoricalData.getCurrentRecord', false);
          }
          return null;
        }
        
        // Get all entries
        var allEntries = dataTable.entries();
        if (!allEntries || allEntries.length === 0) {
          return null;
        }
        
        // Filter entries by key field
        var matchingEntries = [];
        for (var i = 0; i < allEntries.length; i++) {
          var entry = allEntries[i];
          try {
            var entryKeyValue = entry.field(keyField);
            
            if (exactMatch) {
              if (entryKeyValue === keyValue) {
                matchingEntries.push(entry);
              }
            } else {
              // For string values, check for partial match
              if (typeof entryKeyValue === 'string' && typeof keyValue === 'string') {
                if (entryKeyValue.indexOf(keyValue) !== -1) {
                  matchingEntries.push(entry);
                }
              } else if (entryKeyValue === keyValue) {
                matchingEntries.push(entry);
              }
            }
          } catch (e) {
            // Skip entries that don't have the key field
          }
        }
        
        if (matchingEntries.length === 0) {
          return null;
        }
        
        // Filter entries by date field (date <= referenceDate)
        var validEntries = [];
        for (var j = 0; j < matchingEntries.length; j++) {
          var entry = matchingEntries[j];
          try {
            var entryDate = entry.field(dateField);
            
            if (entryDate instanceof Date && entryDate <= referenceDate) {
              validEntries.push(entry);
            }
          } catch (e) {
            // Skip entries that don't have the date field or have invalid dates
          }
        }
        
        if (validEntries.length === 0) {
          return null;
        }
        
        // Sort valid entries by date in descending order (newest first)
        validEntries.sort(function(a, b) {
          var dateA = a.field(dateField);
          var dateB = b.field(dateField);
          
          return dateB.getTime() - dateA.getTime();
        });
        
        // Return the most recent valid entry
        return validEntries[0];
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, 'std.Utils.HistoricalData.getCurrentRecord', false);
        }
        return null;
      }
    },
    
    /**
     * Get all historical values for an entity from a historical data table
     * @param {String} tableName - Name of the table containing historical data
     * @param {String} keyField - Name of the field that identifies the entity (e.g., 'zamestnanec_id')
     * @param {*} keyValue - Value of the key field to match
     * @param {String} valueField - Name of the field containing the value to retrieve (e.g., 'sadzba')
     * @param {String} dateField - Name of the field containing the effective date (e.g., 'platné_od')
     * @param {Boolean} exactMatch - Whether to require an exact match for the key (default: true)
     * @returns {Array} - Array of objects with date and value properties, sorted by date
     */
    getHistoricalValues: function(tableName, keyField, keyValue, valueField, dateField, exactMatch) {
      try {
        exactMatch = exactMatch !== undefined ? exactMatch : true;
        
        // Get the table
        var dataTable;
        if (typeof std !== 'undefined' && std.LibraryCache) {
          dataTable = std.LibraryCache.get(tableName);
        } else {
          dataTable = libByName(tableName);
        }
        
        if (!dataTable) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createDatabaseError('Table not found: ' + tableName, 'std.Utils.HistoricalData.getHistoricalValues', false);
          }
          return [];
        }
        
        // Get all entries
        var allEntries = dataTable.entries();
        if (!allEntries || allEntries.length === 0) {
          return [];
        }
        
        // Filter entries by key field
        var matchingEntries = [];
        for (var i = 0; i < allEntries.length; i++) {
          var entry = allEntries[i];
          try {
            var entryKeyValue = entry.field(keyField);
            
            if (exactMatch) {
              if (entryKeyValue === keyValue) {
                matchingEntries.push(entry);
              }
            } else {
              // For string values, check for partial match
              if (typeof entryKeyValue === 'string' && typeof keyValue === 'string') {
                if (entryKeyValue.indexOf(keyValue) !== -1) {
                  matchingEntries.push(entry);
                }
              } else if (entryKeyValue === keyValue) {
                matchingEntries.push(entry);
              }
            }
          } catch (e) {
            // Skip entries that don't have the key field
          }
        }
        
        if (matchingEntries.length === 0) {
          return [];
        }
        
        // Create array of date-value pairs
        var historicalValues = [];
        for (var j = 0; j < matchingEntries.length; j++) {
          var entry = matchingEntries[j];
          try {
            var entryDate = entry.field(dateField);
            var entryValue = entry.field(valueField);
            
            if (entryDate instanceof Date) {
              historicalValues.push({
                date: entryDate,
                value: entryValue
              });
            }
          } catch (e) {
            // Skip entries with missing or invalid fields
          }
        }
        
        // Sort by date in ascending order
        historicalValues.sort(function(a, b) {
          return a.date.getTime() - b.date.getTime();
        });
        
        return historicalValues;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, 'std.Utils.HistoricalData.getHistoricalValues', false);
        }
        return [];
      }
    },
    
    /**
     * Get the value valid at a specific date from a historical data table
     * @param {String} tableName - Name of the table containing historical data
     * @param {String} keyField - Name of the field that identifies the entity (e.g., 'zamestnanec_id')
     * @param {*} keyValue - Value of the key field to match
     * @param {String} valueField - Name of the field containing the value to retrieve (e.g., 'sadzba')
     * @param {String} dateField - Name of the field containing the effective date (e.g., 'platné_od')
     * @param {Date} specificDate - The specific date to check
     * @param {Boolean} exactMatch - Whether to require an exact match for the key (default: true)
     * @returns {*} - The value valid at the specific date or null if not found
     */
    getValueAtDate: function(tableName, keyField, keyValue, valueField, dateField, specificDate, exactMatch) {
      // This is just a wrapper around getCurrentValue with a specific date
      return this.getCurrentValue(tableName, keyField, keyValue, valueField, dateField, specificDate, exactMatch);
    }
  },
  
  /**
   * Entry Number Generator utilities
   * Provides functions for generating and managing entry numbers
   */
  EntryNumber: {
    /**
     * Generate a new entry number for a database
     * @param {Object} entry - The entry to generate a number for
     * @returns {String} - The generated entry number
     */
    generateEntryNumber: function(entry) {
      try {
        if (!entry) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Entry is null or undefined");
          }
          return "";
        }
        
        // Get current library
        var currentLib = entry.lib();
        var libName = currentLib.title;
        
        // Get ASISTANTO database
        var asistentoLib = libByName(std.Constants.APP.TENANTS);
        if (!asistentoLib) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "ASISTANTO database not found");
          }
          return "";
        }
        
        // Get current season
        var seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
        if (seasonEntries.length === 0) {
          seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
          if (seasonEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "No active season found");
            }
            return "";
          }
        }
        
        var seasonEntry = seasonEntries[0];
        var season = seasonEntry.field("Sezóna");
        
        // Find database in the season entry
        var databases = seasonEntry.field("Databázy");
        var dbEntry = null;
        
        for (var i = 0; i < databases.length; i++) {
          if (databases[i].field("názov") === libName) {
            dbEntry = databases[i];
            break;
          }
        }
        
        if (!dbEntry) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Database not found in ASISTANTO: " + libName);
          }
          return "";
        }
        
        // Get ASISTANTO DB database
        var asistentoDBLib = libByName(std.Constants.APP.DB);
        if (!asistentoDBLib) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "ASISTANTO DB database not found");
          }
          return "";
        }
        
        // Find database in ASISTANTO DB
        var dbInfoEntries = asistentoDBLib.find("Názov = '" + libName + "'");
        if (dbInfoEntries.length === 0) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Database not found in ASISTANTO DB: " + libName);
          }
          return "";
        }
        
        var dbInfo = dbInfoEntries[0];
        
        // Get number generation parameters
        var usePrefix = dbEntry.field("prefix");
        var trimDigits = dbEntry.field("trim") || 0;
        var trailingDigits = dbEntry.field("trailing digit") || 3;
        var deletedNumbers = dbEntry.field("vymazané čísla") || "";
        var nextNumber = dbEntry.field("nasledujúce číslo") || 1;
        
        // Check if there are deleted numbers to reuse
        var entryNumber = 0;
        if (deletedNumbers && deletedNumbers.trim() !== "") {
          var deletedNumbersArray = deletedNumbers.split(",").map(function(num) {
            return parseInt(num.trim(), 10);
          }).filter(function(num) {
            return !isNaN(num);
          }).sort(function(a, b) {
            return a - b;
          });
          
          if (deletedNumbersArray.length > 0) {
            entryNumber = deletedNumbersArray[0];
            
            // Store the deleted number for later removal
            entry.setAttr("_deletedNumber", entryNumber.toString());
          }
        }
        
        // If no deleted number was found, use the next number
        if (entryNumber === 0) {
          entryNumber = nextNumber;
          
          // Store the next number for later update
          entry.setAttr("_nextNumber", (nextNumber + 1).toString());
        }
        
        // Format the entry number
        var formattedEntryNumber = this._formatEntryNumber(entryNumber, trailingDigits);
        
        // Format the season
        var formattedSeason = season;
        if (trimDigits > 0 && season.length > trimDigits) {
          formattedSeason = season.substring(season.length - trimDigits);
        }
        
        // Generate the final entry number
        var finalEntryNumber = "";
        if (usePrefix) {
          // Use prefix from ASISTANTO DB
          finalEntryNumber = dbInfo.field("Prefix") + formattedSeason + formattedEntryNumber;
        } else {
          // Use ID from ASISTANTO DB
          finalEntryNumber = dbInfo.field("ID") + formattedSeason + formattedEntryNumber;
        }
        
        // Store the generated number in the entry
        entry.setAttr("_generatedNumber", finalEntryNumber);
        
        return finalEntryNumber;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.EntryNumber.generateEntryNumber", true);
        }
        return "";
      }
    },
    
    /**
     * Update entry number information in ASISTANTO database after saving an entry
     * @param {Object} entry - The saved entry
     * @returns {Boolean} - True if successful, false otherwise
     */
    updateEntryNumberInfo: function(entry) {
      try {
        if (!entry) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "Entry is null or undefined");
          }
          return false;
        }
        
        // Get current library
        var currentLib = entry.lib();
        var libName = currentLib.title;
        
        // Get ASISTANTO database
        var asistentoLib = libByName(std.Constants.APP.TENANTS);
        if (!asistentoLib) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "ASISTANTO database not found");
          }
          return false;
        }
        
        // Get current season
        var seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
        if (seasonEntries.length === 0) {
          seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
          if (seasonEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "No active season found");
            }
            return false;
          }
        }
        
        var seasonEntry = seasonEntries[0];
        
        // Find database in the season entry
        var databases = seasonEntry.field("Databázy");
        var dbEntryIndex = -1;
        
        for (var i = 0; i < databases.length; i++) {
          if (databases[i].field("názov") === libName) {
            dbEntryIndex = i;
            break;
          }
        }
        
        if (dbEntryIndex === -1) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "Database not found in ASISTANTO: " + libName);
          }
          return false;
        }
        
        var dbEntry = databases[dbEntryIndex];
        
        // Get the stored values from the entry
        var deletedNumber = entry.attr("_deletedNumber");
        var nextNumber = entry.attr("_nextNumber");
        var generatedNumber = entry.attr("_generatedNumber");
        
        // Update the database entry
        if (deletedNumber) {
          // Remove the used deleted number
          var deletedNumbers = dbEntry.field("vymazané čísla") || "";
          var deletedNumbersArray = deletedNumbers.split(",").map(function(num) {
            return num.trim();
          }).filter(function(num) {
            return num !== "" && num !== deletedNumber;
          });
          
          dbEntry.set("vymazané čísla", deletedNumbersArray.join(","));
          dbEntry.set("posledné číslo", parseInt(deletedNumber, 10));
          dbEntry.set("vygenerované číslo", generatedNumber);
        } else if (nextNumber) {
          // Update the next number
          dbEntry.set("posledné číslo", parseInt(nextNumber, 10) - 1);
          dbEntry.set("nasledujúce číslo", parseInt(nextNumber, 10));
          dbEntry.set("vygenerované číslo", generatedNumber);
        }
        
        // Clear the stored values from the entry
        entry.setAttr("_deletedNumber", "");
        entry.setAttr("_nextNumber", "");
        
        return true;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.EntryNumber.updateEntryNumberInfo", true);
        }
        return false;
      }
    },
    
    /**
     * Handle entry deletion by adding the entry number to the deleted numbers list
     * @param {Object} entry - The entry being deleted
     * @returns {Boolean} - True if successful, false otherwise
     */
    handleEntryDeletion: function(entry) {
      try {
        if (!entry) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "Entry is null or undefined");
          }
          return false;
        }
        
        // Get current library
        var currentLib = entry.lib();
        var libName = currentLib.title;
        
        // Get entry number
        var entryNumber = entry.field(std.Constants.FIELDS.COMMON.NUMBER_ENTRY);
        if (!entryNumber) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "Entry number not found");
          }
          return false;
        }
        
        // Get ASISTANTO database
        var asistentoLib = libByName(std.Constants.APP.TENANTS);
        if (!asistentoLib) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "ASISTANTO database not found");
          }
          return false;
        }
        
        // Get current season
        var seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
        if (seasonEntries.length === 0) {
          seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
          if (seasonEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "No active season found");
            }
            return false;
          }
        }
        
        var seasonEntry = seasonEntries[0];
        
        // Find database in the season entry
        var databases = seasonEntry.field("Databázy");
        var dbEntryIndex = -1;
        
        for (var i = 0; i < databases.length; i++) {
          if (databases[i].field("názov") === libName) {
            dbEntryIndex = i;
            break;
          }
        }
        
        if (dbEntryIndex === -1) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "Database not found in ASISTANTO: " + libName);
          }
          return false;
        }
        
        var dbEntry = databases[dbEntryIndex];
        
        // Add the entry number to the deleted numbers list
        var deletedNumbers = dbEntry.field("vymazané čísla") || "";
        var deletedNumbersArray = deletedNumbers.split(",").map(function(num) {
          return num.trim();
        }).filter(function(num) {
          return num !== "";
        });
        
        // Add the entry number if it's not already in the list
        if (deletedNumbersArray.indexOf(entryNumber.toString()) === -1) {
          deletedNumbersArray.push(entryNumber.toString());
        }
        
        // Update the deleted numbers field
        dbEntry.set("vymazané čísla", deletedNumbersArray.join(","));
        
        return true;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.EntryNumber.handleEntryDeletion", true);
        }
        return false;
      }
    },
    
    /**
     * Format an entry number with leading zeros
     * @param {Number} number - The number to format
     * @param {Number} digits - The number of digits
     * @returns {String} - The formatted number
     * @private
     */
    _formatEntryNumber: function(number, digits) {
      var str = number.toString();
      while (str.length < digits) {
        str = "0" + str;
      }
      return str;
    }
  }
};

// For backward compatibility
var std_Utils = std.Utils;
