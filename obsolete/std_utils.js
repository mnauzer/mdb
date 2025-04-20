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
 * - Validation
 */
var std_Utils = {
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
      
      return (end.getTime() - start.getTime()) / std_Constants.CALCULATION.MILLISECONDS_PER_HOUR;
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
      
      decimals = decimals !== undefined ? decimals : std_Constants.CALCULATION.DECIMAL_PLACES;
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
      
      decimals = decimals !== undefined ? decimals : std_Constants.CALCULATION.DECIMAL_PLACES;
      
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
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError(e, 'std_Utils.Field.getValue', false);
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
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError(e, 'std_Utils.Field.setValue', true);
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
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError(e, 'std_Utils.Field.getAttr', false);
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
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError(e, 'std_Utils.Field.setAttr', true);
        }
        return false;
      }
    }
  }
};

// Make available globally
this.std_Utils = std_Utils;
