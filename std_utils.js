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
 * - Entry number generation
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
      try {
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
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Date.format", false);
        }
        return '';
      }
    },

    /**
     * Add days to a date
     * @param {Date} date - The date to add days to
     * @param {Number} days - Number of days to add
     * @returns {Date} - New date with days added
     */
    addDays: function(date, days) {
      try {
        if (!date || !(date instanceof Date)) {
          return null;
        }

        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Date.addDays", false);
        }
        return null;
      }
    },

    /**
     * Round time to nearest quarter hour
     * @param {Date} time - The time to round
     * @returns {Date} - Rounded time
     */
    roundToQuarter: function(time) {
      try {
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
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Date.roundToQuarter", false);
        }
        return null;
      }
    },

    /**
     * Calculate hours between two dates
     * @param {Date} start - Start date/time
     * @param {Date} end - End date/time
     * @returns {Number} - Hours between dates
     */
    calculateHours: function(start, end) {
      try {
        if (!start || !end || !(start instanceof Date) || !(end instanceof Date)) {
          return 0;
        }

        var constants = (typeof std !== 'undefined' && std.Constants) ?
                        std.Constants.CALCULATION.MILLISECONDS_PER_HOUR :
                        3600000; // 1 hour in milliseconds

        return (end.getTime() - start.getTime()) / constants;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Date.calculateHours", false);
        }
        return 0;
      }
    },

    /**
     * Check if a date is before another date
     * @param {Date} date1 - First date
     * @param {Date} date2 - Second date
     * @returns {Boolean} - True if date1 is before date2
     */
    isBefore: function(date1, date2) {
      try {
        if (!date1 || !date2 || !(date1 instanceof Date) || !(date2 instanceof Date)) {
          return false;
        }

        return date1.getTime() < date2.getTime();
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Date.isBefore", false);
        }
        return false;
      }
    },

    /**
     * Parse a time string to a Date object
     * @param {String} timeStr - Time string (e.g. "7:30")
     * @param {Date} baseDate - Optional base date to use
     * @returns {Date} - Date object with the specified time
     */
    parseTime: function(timeStr, baseDate) {
      try {
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
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Date.parseTime", false);
        }
        return null;
      }
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
      try {
        if (!str) {
          return '';
        }

        var args = Array.prototype.slice.call(arguments, 1);

        return str.replace(/{(\d+)}/g, function(match, number) {
          return typeof args[number] !== 'undefined' ? args[number] : match;
        });
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.String.format", false);
        }
        return str || '';
      }
    },

    /**
     * Check if a string is empty or whitespace
     * @param {String} str - String to check
     * @returns {Boolean} - True if string is empty or whitespace
     */
    isEmpty: function(str) {
      try {
        return !str || str.trim().length === 0;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.String.isEmpty", false);
        }
        return true;
      }
    },

    /**
     * Truncate a string to a maximum length
     * @param {String} str - String to truncate
     * @param {Number} maxLength - Maximum length
     * @param {String} suffix - Optional suffix to add if truncated
     * @returns {String} - Truncated string
     */
    truncate: function(str, maxLength, suffix) {
      try {
        if (!str) {
          return '';
        }

        suffix = suffix || '...';

        if (str.length <= maxLength) {
          return str;
        }

        return str.substring(0, maxLength - suffix.length) + suffix;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.String.truncate", false);
        }
        return str || '';
      }
    },

    /**
     * Pad a number with leading zeros
     * @param {Number} number - Number to pad
     * @param {Number} length - Desired length
     * @returns {String} - Padded number as string
     */
    padNumber: function(number, length) {
      try {
        var str = '' + number;
        while (str.length < length) {
          str = '0' + str;
        }
        return str;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.String.padNumber", false);
        }
        return '' + number;
      }
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
      try {
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
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Number.formatCurrency", false);
        }
        return '' + number;
      }
    },

    /**
     * Round a number to a specified number of decimal places
     * @param {Number} number - Number to round
     * @param {Number} decimals - Number of decimal places
     * @returns {Number} - Rounded number
     */
    round: function(number, decimals) {
      try {
        if (typeof number !== 'number') {
          return 0;
        }

        var constants = (typeof std !== 'undefined' && std.Constants) ?
                        std.Constants.CALCULATION.DECIMAL_PLACES :
                        2; // Default decimal places

        decimals = decimals !== undefined ? decimals : constants;

        var factor = Math.pow(10, decimals);
        return Math.round(number * factor) / factor;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Number.round", false);
        }
        return number;
      }
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
      try {
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
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Object.getProperty", false);
        }
        return defaultValue;
      }
    },

    /**
     * Check if an object is empty
     * @param {Object} obj - Object to check
     * @returns {Boolean} - True if object is empty
     */
    isEmpty: function(obj) {
      try {
        if (!obj) {
          return true;
        }

        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            return false;
          }
        }

        return true;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Object.isEmpty", false);
        }
        return true;
      }
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
      try {
        return !arr || !Array.isArray(arr) || arr.length === 0;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Array.isEmpty", false);
        }
        return true;
      }
    },

    /**
     * Get the sum of a specific field from an array of objects
     * @param {Array} arr - Array of objects
     * @param {String} fieldName - Name of the field to sum
     * @returns {Number} - Sum of the field values
     */
    sumField: function(arr, fieldName) {
      try {
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
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Array.sumField", false);
        }
        return 0;
      }
    },

    /**
     * Get the sum of a specific field from an array of Memento entries
     * @param {Array} entries - Array of Memento entries
     * @param {String} fieldName - Name of the field to sum
     * @returns {Number} - Sum of the field values
     */
    sumEntryField: function(entries, fieldName) {
      try {
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
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logWarning("Utils.Array", "sumEntryField", "Field not found: " + fieldName);
            }
          }
        }

        return sum;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Array.sumEntryField", false);
        }
        return 0;
      }
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
      try {
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
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logWarning("Utils.Array", "filterEntries", "Field not found: " + fieldName);
            }
          }
        }

        return result;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Array.filterEntries", false);
        }
        return [];
      }
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
      try {
        if (!entry || !fieldName) {
          return defaultValue;
        }

        try {
          var value = entry.field(fieldName);
          return value !== undefined && value !== null ? value : defaultValue;
        } catch (e) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logWarning("Utils.Field", "getValue", "Field not found: " + fieldName);
          }
          return defaultValue;
        }
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Field.getValue", false);
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
      try {
        if (!entry || !fieldName) {
          return false;
        }

        try {
          // Handle special cases for time fields
          if (typeof value === 'string' &&
              (fieldName === 'Príchod' || fieldName === 'Odchod' ||
               fieldName === 'Začiatok' || fieldName === 'Koniec' ||
               fieldName.toLowerCase().indexOf('time') !== -1 ||
               fieldName.toLowerCase().indexOf('čas') !== -1)) {

            // Check if the string looks like a time (HH:MM)
            var timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (timeRegex.test(value)) {
              // Convert string time to Date object
              if (typeof std !== 'undefined' && std.Utils && std.Utils.Date) {
                var dateValue = std.Utils.Date.parseTime(value);
                if (dateValue) {
                  entry.set(fieldName, dateValue);
                  return true;
                }
              }
            }
          }

          // Default case - set the value directly
          entry.set(fieldName, value);
          return true;
        } catch (e) {
          // Try to handle the error by converting the value
          try {
            if (e.toString().indexOf("Can't set string") !== -1 &&
                e.toString().indexOf("to field") !== -1) {

              // This might be a date/time field expecting a Date object
              if (typeof value === 'string') {
                // Try to parse as time
                if (typeof std !== 'undefined' && std.Utils && std.Utils.Date) {
                  var dateValue = std.Utils.Date.parseTime(value);
                  if (dateValue) {
                    entry.set(fieldName, dateValue);
                    return true;
                  }
                }
              }
            }
          } catch (conversionError) {
            // Conversion failed, continue to error handling
          }

          // Log the error
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createDatabaseError(e, "Utils.Field.setValue", true);
          }

          // Log additional information
          if (typeof console !== 'undefined') {
            console.error("Failed to set value '" + value + "' to field '" + fieldName + "'",
                         "std_utils.js", "Field.setValue", e);
          }

          return false;
        }
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Field.setValue", false);
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
      try {
        if (!entry || !attrName) {
          return defaultValue;
        }

        try {
          var value = entry.attr(attrName);
          return value !== undefined && value !== null ? value : defaultValue;
        } catch (e) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logWarning("Utils.Field", "getAttr", "Attribute not found: " + attrName);
          }
          return defaultValue;
        }
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Field.getAttr", false);
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
      try {
        if (!entry || !attrName) {
          return false;
        }

        try {
          entry.setAttr(attrName, value);
          return true;
        } catch (e) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.createDatabaseError(e, "Utils.Field.setAttr", true);
          }
          return false;
        }
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.Field.setAttr", false);
        }
        return false;
      }
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

        // Get current library - handle both Entry and EntryDefault objects
        var currentLib = null;
        var libName = "";

        try {
          // For regular Entry objects
          if (typeof entry.lib === 'function') {
            currentLib = entry.lib();
            if (currentLib && typeof currentLib.title === 'string') {
              libName = currentLib.title;
            }
          } else {
            // For EntryDefault objects, get the current library directly
            currentLib = lib();
            if (currentLib && typeof currentLib.title === 'string') {
              libName = currentLib.title;
            }
          }

          if (!libName) {
            throw new Error("Could not determine library name");
          }
        } catch (libError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Failed to get library: " + libError.toString());
          }

          // Try alternative approach to get library name
          try {
            if (typeof app !== 'undefined' && app.activeLib && app.activeLib.name) {
              libName = app.activeLib.name;
            } else {
              // Last resort - try to get from global context
              var globalLib = lib();
              libName = globalLib.title;
            }
          } catch (altLibError) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Failed to get library using alternative methods: " + altLibError.toString());
            }
            return "";
          }
        }

        // Get ASISTANTO database
        var constants = (typeof std !== 'undefined' && std.Constants) ?
                        std.Constants :
                        { APP: { TENANTS: 'ASISTANTO Tenants', DB: 'ASISTANTO DB' } };

        var asistentoLib = null;
        try {
          asistentoLib = libByName(constants.APP.TENANTS);
          if (!asistentoLib) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "ASISTANTO database not found");
            }
            return "";
          }
        } catch (tenantError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error accessing ASISTANTO database: " + tenantError.toString());
          }
          return "";
        }

        // Get default season from ASISTANTO Tenants
        var defaultSeason = "";
        var seasonEntry = null;
        var seasonEntries = [];

        try {
          // First, find the default season setting in ASISTANTO Tenants
          var defaultSeasonEntries = [];
          try {
            // Try to find entries with default season field
            defaultSeasonEntries = asistentoLib.find("default season != ''");
            message(defaultSeasonEntries.length + " entries found with default season field");
          } catch (defaultSeasonError) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logWarning("Utils", "EntryNumber.generateEntryNumber",
                "Error finding default season: " + defaultSeasonError.toString());
            }
          }

          // If we found entries with default season, get the default season value
          if (defaultSeasonEntries && defaultSeasonEntries.length > 0) {
            try {
              defaultSeason = defaultSeasonEntries[0].field("default season");
            } catch (defaultSeasonFieldError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.generateEntryNumber",
                  "Error getting default season field: " + defaultSeasonFieldError.toString());
              }
            }
          }

          // If we have a default season, find the matching season entry
          if (defaultSeason) {
            try {
              seasonEntries = asistentoLib.find("Sezóna = '" + defaultSeason + "'");
            } catch (seasonFindError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.generateEntryNumber",
                  "Error finding season by default season: " + seasonFindError.toString());
              }
            }
          }

          // If we couldn't find the season by default season, try the standard approach
          if (!seasonEntries || seasonEntries.length === 0) {
            try {
              seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
              if (seasonEntries.length === 0) {
                seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
              }
            } catch (standardSeasonError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.generateEntryNumber",
                  "Error finding season by operation mode: " + standardSeasonError.toString());
              }
            }
          }

          // If we still couldn't find a season, use current year as fallback
          if (!seasonEntries || seasonEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "No active season found");
            }

            // Use current year as fallback
            var currentDate = new Date();
            var currentYear = currentDate.getFullYear().toString();

            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logWarning("Utils", "EntryNumber.generateEntryNumber",
                "Using current year as fallback: " + currentYear);
            }

            return libName + "-" + currentYear + "-001";
          }

          // Get the season entry and season value
          seasonEntry = seasonEntries[0];
          var season = "";
          try {
            season = seasonEntry.field("Sezóna");
          } catch (seasonFieldError) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber",
                "Error getting season field: " + seasonFieldError.toString());
            }

            // Use current year as fallback
            var currentDate = new Date();
            season = currentDate.getFullYear().toString();
          }
        } catch (seasonError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber",
              "Error in season processing: " + seasonError.toString());
          }

          // Use current year as fallback
          var currentDate = new Date();
          season = currentDate.getFullYear().toString();
        }

        // Find database in the season entry
        var databases = [];
        try {
          databases = seasonEntry.field("Databázy");
        } catch (dbFieldError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error getting databases field: " + dbFieldError.toString());
          }
          return "";
        }

        var dbEntry = null;
        try {
          for (var i = 0; i < databases.length; i++) {
            if (databases[i].field("názov") === libName) {
              dbEntry = databases[i];
              break;
            }
          }
        } catch (dbEntryError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error finding database entry: " + dbEntryError.toString());
          }
          return "";
        }

        if (!dbEntry) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Database not found in ASISTANTO: " + libName);
          }
          return "";
        }

        // Get ASISTANTO DB database
        var asistentoDBLib = null;
        try {
          asistentoDBLib = libByName(constants.APP.DB);
          if (!asistentoDBLib) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "ASISTANTO DB database not found");
            }
            return "";
          }
        } catch (dbLibError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error accessing ASISTANTO DB: " + dbLibError.toString());
          }
          return "";
        }

        // Find database in ASISTANTO DB
        var dbInfoEntries = [];
        try {
          dbInfoEntries = asistentoDBLib.find("Názov = '" + libName + "'");
          if (dbInfoEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Database not found in ASISTANTO DB: " + libName);
            }
            return "";
          }
        } catch (dbInfoError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error finding database info: " + dbInfoError.toString());
          }
          return "";
        }

        var dbInfo = dbInfoEntries[0];

        // Get number generation parameters
        var usePrefix = false;
        var trimDigits = 0;
        var trailingDigits = 3;
        var deletedNumbers = "";
        var nextNumber = 1;

        try {
          usePrefix = dbEntry.field("prefix");
          trimDigits = dbEntry.field("trim") || 0;
          trailingDigits = dbEntry.field("trailing digit") || 3;
          deletedNumbers = dbEntry.field("vymazané čísla") || "";
          nextNumber = dbEntry.field("nasledujúce číslo") || 1;
        } catch (paramError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error getting number parameters: " + paramError.toString());
          }
          // Continue with defaults
        }

        // Check if there are deleted numbers to reuse
        var entryNumber = 0;
        if (deletedNumbers && deletedNumbers.trim() !== "") {
          try {
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
              try {
                entry.setAttr("_deletedNumber", entryNumber.toString());
              } catch (attrError) {
                if (typeof std !== 'undefined' && std.ErrorHandler) {
                  std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error setting _deletedNumber attribute: " + attrError.toString());
                }
              }
            }
          } catch (deletedNumError) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error processing deleted numbers: " + deletedNumError.toString());
            }
            // Continue with next number
          }
        }

        // If no deleted number was found, use the next number
        if (entryNumber === 0) {
          entryNumber = nextNumber;

          // Store the next number for later update
          try {
            entry.setAttr("_nextNumber", (nextNumber + 1).toString());
          } catch (nextNumError) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error setting _nextNumber attribute: " + nextNumError.toString());
            }
          }
        }

        // Format the entry number
        var formattedEntryNumber = "";
        try {
          formattedEntryNumber = this._formatEntryNumber(entryNumber, trailingDigits);
        } catch (formatError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error formatting entry number: " + formatError.toString());
          }
          formattedEntryNumber = entryNumber.toString();
        }

        // Format the season
        var formattedSeason = season;
        try {
          if (trimDigits > 0 && season.length > trimDigits) {
            formattedSeason = season.substring(season.length - trimDigits);
          }
        } catch (seasonFormatError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error formatting season: " + seasonFormatError.toString());
          }
        }

        // Generate the final entry number
        var finalEntryNumber = "";
        try {
          if (usePrefix) {
            // Use prefix from ASISTANTO DB
            finalEntryNumber = dbInfo.field("Prefix") + formattedSeason + formattedEntryNumber;
          } else {
            // Use ID from ASISTANTO DB
            finalEntryNumber = dbInfo.field("ID") + formattedSeason + formattedEntryNumber;
          }
        } catch (finalNumError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error generating final number: " + finalNumError.toString());
          }
          finalEntryNumber = libName + "-" + formattedSeason + formattedEntryNumber;
        }

        // Store the generated number in the entry
        try {
          entry.setAttr("_generatedNumber", finalEntryNumber);
        } catch (genNumError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.generateEntryNumber", "Error setting _generatedNumber attribute: " + genNumError.toString());
          }
        }

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
        var constants = (typeof std !== 'undefined' && std.Constants) ?
                        std.Constants :
                        { APP: { TENANTS: 'ASISTANTO Tenants' } };

        var asistentoLib = libByName(constants.APP.TENANTS);
        if (!asistentoLib) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "ASISTANTO database not found");
          }
          return false;
        }

        // Get default season from ASISTANTO Tenants
        var defaultSeason = "";
        var seasonEntry = null;
        var seasonEntries = [];

        try {
          // First, find the default season setting in ASISTANTO Tenants
          var defaultSeasonEntries = [];
          try {
            // Try to find entries with default season field
            defaultSeasonEntries = asistentoLib.find("default season != ''");
          } catch (defaultSeasonError) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logWarning("Utils", "EntryNumber.updateEntryNumberInfo",
                "Error finding default season: " + defaultSeasonError.toString());
            }
          }

          // If we found entries with default season, get the default season value
          if (defaultSeasonEntries && defaultSeasonEntries.length > 0) {
            try {
              defaultSeason = defaultSeasonEntries[0].field("default season");
            } catch (defaultSeasonFieldError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.updateEntryNumberInfo",
                  "Error getting default season field: " + defaultSeasonFieldError.toString());
              }
            }
          }

          // If we have a default season, find the matching season entry
          if (defaultSeason) {
            try {
              seasonEntries = asistentoLib.find("Sezóna = '" + defaultSeason + "'");
            } catch (seasonFindError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.updateEntryNumberInfo",
                  "Error finding season by default season: " + seasonFindError.toString());
              }
            }
          }

          // If we couldn't find the season by default season, try the standard approach
          if (!seasonEntries || seasonEntries.length === 0) {
            try {
              seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
              if (seasonEntries.length === 0) {
                seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
              }
            } catch (standardSeasonError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.updateEntryNumberInfo",
                  "Error finding season by operation mode: " + standardSeasonError.toString());
              }
            }
          }

          // If we still couldn't find a season, return false
          if (!seasonEntries || seasonEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo", "No active season found");
            }
            return false;
          }

          // Get the season entry
          seasonEntry = seasonEntries[0];
        } catch (seasonError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.updateEntryNumberInfo",
              "Error in season processing: " + seasonError.toString());
          }
          return false;
        }

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
        var constants = (typeof std !== 'undefined' && std.Constants) ?
                        std.Constants :
                        { FIELDS: { COMMON: { NUMBER_ENTRY: 'Číslo' } }, APP: { TENANTS: 'ASISTANTO Tenants' } };

        var entryNumber = entry.field(constants.FIELDS.COMMON.NUMBER_ENTRY);
        if (!entryNumber) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "Entry number not found");
          }
          return false;
        }

        // Get ASISTANTO database
        var asistentoLib = libByName(constants.APP.TENANTS);
        if (!asistentoLib) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "ASISTANTO database not found");
          }
          return false;
        }

        // Get default season from ASISTANTO Tenants
        var defaultSeason = "";
        var seasonEntry = null;
        var seasonEntries = [];

        try {
          // First, find the default season setting in ASISTANTO Tenants
          var defaultSeasonEntries = [];
          try {
            // Try to find entries with default season field
            defaultSeasonEntries = asistentoLib.find("default season != ''");
          } catch (defaultSeasonError) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logWarning("Utils", "EntryNumber.handleEntryDeletion",
                "Error finding default season: " + defaultSeasonError.toString());
            }
          }

          // If we found entries with default season, get the default season value
          if (defaultSeasonEntries && defaultSeasonEntries.length > 0) {
            try {
              defaultSeason = defaultSeasonEntries[0].field("default season");
            } catch (defaultSeasonFieldError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.handleEntryDeletion",
                  "Error getting default season field: " + defaultSeasonFieldError.toString());
              }
            }
          }

          // If we have a default season, find the matching season entry
          if (defaultSeason) {
            try {
              seasonEntries = asistentoLib.find("Sezóna = '" + defaultSeason + "'");
            } catch (seasonFindError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.handleEntryDeletion",
                  "Error finding season by default season: " + seasonFindError.toString());
              }
            }
          }

          // If we couldn't find the season by default season, try the standard approach
          if (!seasonEntries || seasonEntries.length === 0) {
            try {
              seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
              if (seasonEntries.length === 0) {
                seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
              }
            } catch (standardSeasonError) {
              if (typeof std !== 'undefined' && std.ErrorHandler) {
                std.ErrorHandler.logWarning("Utils", "EntryNumber.handleEntryDeletion",
                  "Error finding season by operation mode: " + standardSeasonError.toString());
              }
            }
          }

          // If we still couldn't find a season, return false
          if (!seasonEntries || seasonEntries.length === 0) {
            if (typeof std !== 'undefined' && std.ErrorHandler) {
              std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion", "No active season found");
            }
            return false;
          }

          // Get the season entry
          seasonEntry = seasonEntries[0];
        } catch (seasonError) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("Utils", "EntryNumber.handleEntryDeletion",
              "Error in season processing: " + seasonError.toString());
          }
          return false;
        }

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
      try {
        var str = number.toString();
        while (str.length < digits) {
          str = "0" + str;
        }
        return str;
      } catch (e) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createSystemError(e, "Utils.EntryNumber._formatEntryNumber", false);
        }
        return number.toString();
      }
    }
  }
};

// For backward compatibility
var std_Utils = std.Utils;
