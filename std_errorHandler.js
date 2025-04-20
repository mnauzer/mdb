// Standardized Error Handler for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Error handling and logging module for the ASISTANTO STD framework
 * Provides standardized error handling, logging, and reporting
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Error Handler module
std.ErrorHandler = {
  /**
   * Create a system error entry in the error log
   * @param {Error|String} error - The error object or error message
   * @param {String} source - The source of the error (function name)
   * @param {Boolean} showMessage - Whether to show a message to the user
   * @returns {Object} - The created error entry
   */
  createSystemError: function(error, source, showMessage) {
    try {
      // Get error message
      var errorMessage = error;
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Create error entry
      var errorEntry = this._createErrorEntry("SYSTEM", source, errorMessage);
      
      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("System Error", source, errorMessage);
      }
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in createSystemError: " + e.toString());
      
      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('System Error')
                .text('Error in ' + source + ': ' + errorMessage + '\n\nAdditional error: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      
      return null;
    }
  },
  
  /**
   * Create a database error entry in the error log
   * @param {Error|String} error - The error object or error message
   * @param {String} source - The source of the error (function name)
   * @param {Boolean} showMessage - Whether to show a message to the user
   * @returns {Object} - The created error entry
   */
  createDatabaseError: function(error, source, showMessage) {
    try {
      // Get error message
      var errorMessage = error;
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Create error entry
      var errorEntry = this._createErrorEntry("DATABASE", source, errorMessage);
      
      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("Database Error", source, errorMessage);
      }
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in createDatabaseError: " + e.toString());
      
      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('Database Error')
                .text('Error in ' + source + ': ' + errorMessage + '\n\nAdditional error: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      
      return null;
    }
  },
  
  /**
   * Create a validation error entry in the error log
   * @param {Error|String} error - The error object or error message
   * @param {String} source - The source of the error (function name)
   * @param {Boolean} showMessage - Whether to show a message to the user
   * @returns {Object} - The created error entry
   */
  createValidationError: function(error, source, showMessage) {
    try {
      // Get error message
      var errorMessage = error;
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Create error entry
      var errorEntry = this._createErrorEntry("VALIDATION", source, errorMessage);
      
      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("Validation Error", source, errorMessage);
      }
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in createValidationError: " + e.toString());
      
      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('Validation Error')
                .text('Error in ' + source + ': ' + errorMessage + '\n\nAdditional error: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      
      return null;
    }
  },
  
  /**
   * Create a business error entry in the error log
   * @param {Error|String} error - The error object or error message
   * @param {String} source - The source of the error (function name)
   * @param {Boolean} showMessage - Whether to show a message to the user
   * @returns {Object} - The created error entry
   */
  createBusinessError: function(error, source, showMessage) {
    try {
      // Get error message
      var errorMessage = error;
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Create error entry
      var errorEntry = this._createErrorEntry("BUSINESS", source, errorMessage);
      
      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("Business Error", source, errorMessage);
      }
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in createBusinessError: " + e.toString());
      
      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('Business Error')
                .text('Error in ' + source + ': ' + errorMessage + '\n\nAdditional error: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      
      return null;
    }
  },
  
  /**
   * Log an error message to the console and error log
   * @param {String} module - The module name
   * @param {String} function - The function name
   * @param {String} message - The error message
   * @returns {Object} - The created error entry
   */
  logError: function(module, functionName, message) {
    try {
      // Log to console
      console.log("ERROR: [" + module + "." + functionName + "] " + message);
      
      // Create error entry
      var errorEntry = this._createErrorEntry("LOG", module + "." + functionName, message);
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in logError: " + e.toString());
      return null;
    }
  },
  
  /**
   * Log a warning message to the console and error log
   * @param {String} module - The module name
   * @param {String} function - The function name
   * @param {String} message - The warning message
   * @returns {Object} - The created error entry
   */
  logWarning: function(module, functionName, message) {
    try {
      // Log to console
      console.log("WARNING: [" + module + "." + functionName + "] " + message);
      
      // Create error entry
      var errorEntry = this._createErrorEntry("WARNING", module + "." + functionName, message);
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in logWarning: " + e.toString());
      return null;
    }
  },
  
  /**
   * Log an info message to the console and error log
   * @param {String} module - The module name
   * @param {String} function - The function name
   * @param {String} message - The info message
   * @returns {Object} - The created error entry
   */
  logInfo: function(module, functionName, message) {
    try {
      // Log to console
      console.log("INFO: [" + module + "." + functionName + "] " + message);
      
      // Create error entry
      var errorEntry = this._createErrorEntry("INFO", module + "." + functionName, message);
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in logInfo: " + e.toString());
      return null;
    }
  },
  
  /**
   * Create an error entry in the error log
   * @param {String} type - The type of error
   * @param {String} source - The source of the error
   * @param {String} message - The error message
   * @returns {Object} - The created error entry
   * @private
   */
  _createErrorEntry: function(type, source, message) {
    try {
      // Get constants
      var constants = (typeof std !== 'undefined' && std.Constants) ? 
                      std.Constants : 
                      { APP: { ERRORS: 'ASISTANTO Errors' }, NOTES: { STD_ERROR_ENTRY: 'generované scriptom std.ErrorHandler' } };
      
      // Get error library
      var errorLib = libByName(constants.APP.ERRORS);
      if (!errorLib) {
        console.log("Error library not found: " + constants.APP.ERRORS);
        return null;
      }
      
      // Create error entry
      var errorEntry = errorLib.create();
      
      // Set error fields
      errorEntry.set("Typ", type);
      errorEntry.set("Zdroj", source);
      errorEntry.set("Správa", message);
      errorEntry.set("Dátum", new Date());
      errorEntry.set("Používateľ", user());
      errorEntry.set("Poznámka", constants.NOTES.STD_ERROR_ENTRY);
      
      // Save error entry
      errorEntry.save();
      
      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in _createErrorEntry: " + e.toString());
      return null;
    }
  },
  
  /**
   * Show an error message to the user
   * @param {String} title - The title of the error message
   * @param {String} source - The source of the error
   * @param {String} message - The error message
   * @private
   */
  _showErrorMessage: function(title, source, message) {
    try {
      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title(title)
                .text('Error in ' + source + ': ' + message)
                .positiveButton('OK', function() {})
                .show();
    } catch (e) {
      // Fallback if error handling fails
      console.log("Error in _showErrorMessage: " + e.toString());
      
      // Use simple message
      message(title + ': ' + message);
    }
  }
};

// For backward compatibility
var std_ErrorHandler = std.ErrorHandler;
