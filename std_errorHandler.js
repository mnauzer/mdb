// Standardized Error Handler for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Error handling and logging module for the ASISTANTO STD framework
 * Provides standardized error handling, logging, and reporting
 */

// Create console object if it doesn't exist
if (typeof console === 'undefined') {
  var console = {
    /**
     * Log a message to the console and error log
     * @param {String} message - The message to log
     * @param {String} script - The script name (optional)
     * @param {String} line - The line number (optional)
     * @param {Object} parameters - The function parameters (optional)
     * @param {Object} attributes - The attributes (optional)
     */
    log: function(message, script, line, parameters, attributes) {
      try {
        // First, try to show the message in a dialog for immediate feedback
        // This is especially useful for debugging when logging fails
        if (typeof dialog === 'function') {
          try {
            // Only show dialog for important messages to avoid dialog spam
            if (message && message.toString().indexOf("ERROR") !== -1) {
              var quickDialog = dialog();
              quickDialog.title('Log Message')
                        .text(message.toString())
                        .positiveButton('OK', function() {})
                        .show();
            }
          } catch (dialogError) {
            // Silent fail for dialog
          }
        }

        // Log to a dedicated log library if available
        if (typeof libByName === 'function') {
          // Try multiple possible error library names
          var errorLibNames = ['ASISTANTO Errors', 'Errors', 'Error Log', 'Log'];
          var logLib = null;

          // Try to find an error logging library
          for (var i = 0; i < errorLibNames.length; i++) {
            try {
              logLib = libByName(errorLibNames[i]);
              if (logLib) {
                break;
              }
            } catch (libError) {
              // Continue to next library name
            }
          }

          if (logLib) {
            // Create entry with error handling
            var entry = null;
            try {
              entry = logLib.create();
            } catch (createError) {
              // If create fails, try to show error in dialog
              if (typeof dialog === 'function') {
                try {
                  var createErrorDialog = dialog();
                  createErrorDialog.title('Error Creating Log Entry')
                                 .text('Failed to create entry: ' + createError.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                } catch (dialogError) {
                  // Silent fail for dialog
                }
              }
              return; // Exit if we can't create an entry
            }

            if (!entry) {
              return; // Exit if entry is null
            }

            // Get field names to handle different database structures
            var typeField = 'type';
            var dateField = 'date';
            var libraryField = 'memento library';
            var scriptField = 'script';
            var lineField = 'line';
            var textField = 'text';
            var userField = 'user';
            var parametersField = 'parameters';
            var attributesField = 'attributes';

            // Try to detect field names if they're different
            try {
              var fields = logLib.fields();
              if (fields && fields.length > 0) {
                for (var i = 0; i < fields.length; i++) {
                  var fieldName = fields[i].name.toLowerCase();
                  if (fieldName.indexOf('typ') !== -1) typeField = fields[i].name;
                  else if (fieldName.indexOf('dat') !== -1) dateField = fields[i].name;
                  else if (fieldName.indexOf('lib') !== -1) libraryField = fields[i].name;
                  else if (fieldName.indexOf('scr') !== -1) scriptField = fields[i].name;
                  else if (fieldName.indexOf('lin') !== -1) lineField = fields[i].name;
                  else if (fieldName.indexOf('tex') !== -1 || fieldName.indexOf('msg') !== -1 || fieldName.indexOf('mes') !== -1) textField = fields[i].name;
                  else if (fieldName.indexOf('use') !== -1) userField = fields[i].name;
                  else if (fieldName.indexOf('par') !== -1) parametersField = fields[i].name;
                  else if (fieldName.indexOf('att') !== -1) attributesField = fields[i].name;
                }
              }
            } catch (fieldsError) {
              // Continue with default field names
            }

            // Safely set fields with null checks
            try { entry.set(typeField, 'log'); } catch(e) {}
            try { entry.set(dateField, new Date()); } catch(e) {}

            // Safely get library title
            var libTitle = "unknown";
            try {
              var currentLib = lib();
              if (currentLib && typeof currentLib.title === 'string') {
                libTitle = currentLib.title;
              }
            } catch(e) {}
            try { entry.set(libraryField, libTitle); } catch(e) {}

            try { entry.set(scriptField, script || 'console.log'); } catch(e) {}
            try { entry.set(lineField, line || 'unknown'); } catch(e) {}
            try { entry.set(textField, message ? message.toString() : 'No message'); } catch(e) {}

            // Safely get user
            var currentUser = "unknown";
            try {
              currentUser = user();
            } catch(e) {}
            try { entry.set(userField, currentUser); } catch(e) {}

            // Set parameters and attributes if provided
            if (parameters) {
              try {
                entry.set(parametersField, JSON.stringify(parameters));
              } catch(e) {}
            }
            if (attributes) {
              try {
                entry.set(attributesField, JSON.stringify(attributes));
              } catch(e) {}
            }

            // Save entry with try-catch
            try {
              entry.save();
            } catch(e) {
              // Try alternative approach if save fails
              try {
                // Try to save with minimal fields
                var minimalEntry = logLib.create();
                minimalEntry.set(typeField, 'log');
                minimalEntry.set(textField, 'Failed to save log: ' + message);
                minimalEntry.save();
              } catch(saveError) {
                // If save fails, try to show error in dialog
                if (typeof dialog === 'function') {
                  try {
                    var saveErrorDialog = dialog();
                    saveErrorDialog.title('Error Saving Log Entry')
                                 .text('Failed to save entry: ' + e.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                  } catch (dialogError) {
                    // Silent fail for dialog
                  }
                }
              }
            }
          } else {
            // If no error library exists, try to show message in dialog
            if (typeof dialog === 'function') {
              try {
                var noLibDialog = dialog();
                noLibDialog.title('No Error Library')
                          .text('No error logging library found. Message: ' + message)
                          .positiveButton('OK', function() {})
                          .show();
              } catch (dialogError) {
                // Silent fail for dialog
              }
            }
          }
        }
      } catch (e) {
        // Silent fail - we can't use console.log to report a failure in console.log
        // Use dialog as a last resort
        try {
          var errorDialog = dialog();
          errorDialog.title('Console Log Error')
                    .text('Failed to log message: ' + message + '\nError: ' + e.toString())
                    .positiveButton('OK', function() {})
                    .show();
        } catch (dialogError) {
          // Completely silent fail if even dialog fails
        }
      }
    },

    /**
     * Log a warning to the console and error log
     * @param {String} message - The message to log
     * @param {String} script - The script name (optional)
     * @param {String} line - The line number (optional)
     * @param {Object} parameters - The function parameters (optional)
     * @param {Object} attributes - The attributes (optional)
     */
    warn: function(message, script, line, parameters, attributes) {
      try {
        // First, try to show the message in a dialog for immediate feedback
        // This is especially useful for debugging when logging fails
        if (typeof dialog === 'function') {
          try {
            // Only show dialog for important messages to avoid dialog spam
            if (message && message.toString().indexOf("WARNING") !== -1) {
              var quickDialog = dialog();
              quickDialog.title('Warning Message')
                        .text(message.toString())
                        .positiveButton('OK', function() {})
                        .show();
            }
          } catch (dialogError) {
            // Silent fail for dialog
          }
        }

        // Log to a dedicated log library if available
        if (typeof libByName === 'function') {
          // Try multiple possible error library names
          var errorLibNames = ['ASISTANTO Errors', 'Errors', 'Error Log', 'Log'];
          var logLib = null;

          // Try to find an error logging library
          for (var i = 0; i < errorLibNames.length; i++) {
            try {
              logLib = libByName(errorLibNames[i]);
              if (logLib) {
                break;
              }
            } catch (libError) {
              // Continue to next library name
            }
          }

          if (logLib) {
            // Create entry with error handling
            var entry = null;
            try {
              entry = logLib.create();
            } catch (createError) {
              // If create fails, try to show error in dialog
              if (typeof dialog === 'function') {
                try {
                  var createErrorDialog = dialog();
                  createErrorDialog.title('Error Creating Warning Entry')
                                 .text('Failed to create entry: ' + createError.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                } catch (dialogError) {
                  // Silent fail for dialog
                }
              }
              return; // Exit if we can't create an entry
            }

            if (!entry) {
              return; // Exit if entry is null
            }

            // Get field names to handle different database structures
            var typeField = 'type';
            var dateField = 'date';
            var libraryField = 'memento library';
            var scriptField = 'script';
            var lineField = 'line';
            var textField = 'text';
            var userField = 'user';
            var parametersField = 'parameters';
            var attributesField = 'attributes';

            // Try to detect field names if they're different
            try {
              var fields = logLib.fields();
              if (fields && fields.length > 0) {
                for (var i = 0; i < fields.length; i++) {
                  var fieldName = fields[i].name.toLowerCase();
                  if (fieldName.indexOf('typ') !== -1) typeField = fields[i].name;
                  else if (fieldName.indexOf('dat') !== -1) dateField = fields[i].name;
                  else if (fieldName.indexOf('lib') !== -1) libraryField = fields[i].name;
                  else if (fieldName.indexOf('scr') !== -1) scriptField = fields[i].name;
                  else if (fieldName.indexOf('lin') !== -1) lineField = fields[i].name;
                  else if (fieldName.indexOf('tex') !== -1 || fieldName.indexOf('msg') !== -1 || fieldName.indexOf('mes') !== -1) textField = fields[i].name;
                  else if (fieldName.indexOf('use') !== -1) userField = fields[i].name;
                  else if (fieldName.indexOf('par') !== -1) parametersField = fields[i].name;
                  else if (fieldName.indexOf('att') !== -1) attributesField = fields[i].name;
                }
              }
            } catch (fieldsError) {
              // Continue with default field names
            }

            // Safely set fields with null checks
            try { entry.set(typeField, 'warn'); } catch(e) {}
            try { entry.set(dateField, new Date()); } catch(e) {}

            // Safely get library title
            var libTitle = "unknown";
            try {
              var currentLib = lib();
              if (currentLib && typeof currentLib.title === 'string') {
                libTitle = currentLib.title;
              }
            } catch(e) {}
            try { entry.set(libraryField, libTitle); } catch(e) {}

            try { entry.set(scriptField, script || 'console.warn'); } catch(e) {}
            try { entry.set(lineField, line || 'unknown'); } catch(e) {}
            try { entry.set(textField, message ? message.toString() : 'No message'); } catch(e) {}

            // Safely get user
            var currentUser = "unknown";
            try {
              currentUser = user();
            } catch(e) {}
            try { entry.set(userField, currentUser); } catch(e) {}

            // Set parameters and attributes if provided
            if (parameters) {
              try {
                entry.set(parametersField, JSON.stringify(parameters));
              } catch(e) {}
            }
            if (attributes) {
              try {
                entry.set(attributesField, JSON.stringify(attributes));
              } catch(e) {}
            }

            // Save entry with try-catch
            try {
              entry.save();
            } catch(e) {
              // Try alternative approach if save fails
              try {
                // Try to save with minimal fields
                var minimalEntry = logLib.create();
                minimalEntry.set(typeField, 'warn');
                minimalEntry.set(textField, 'Failed to save warning: ' + message);
                minimalEntry.save();
              } catch(saveError) {
                // If save fails, try to show error in dialog
                if (typeof dialog === 'function') {
                  try {
                    var saveErrorDialog = dialog();
                    saveErrorDialog.title('Error Saving Warning Entry')
                                 .text('Failed to save entry: ' + e.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                  } catch (dialogError) {
                    // Silent fail for dialog
                  }
                }
              }
            }
          } else {
            // If no error library exists, try to show message in dialog
            if (typeof dialog === 'function') {
              try {
                var noLibDialog = dialog();
                noLibDialog.title('No Error Library')
                          .text('No error logging library found. Warning: ' + message)
                          .positiveButton('OK', function() {})
                          .show();
              } catch (dialogError) {
                // Silent fail for dialog
              }
            }
          }
        }
      } catch (e) {
        // Silent fail with fallback to dialog
        try {
          var errorDialog = dialog();
          errorDialog.title('Console Warning Error')
                    .text('Failed to log warning: ' + message + '\nError: ' + e.toString())
                    .positiveButton('OK', function() {})
                    .show();
        } catch (dialogError) {
          // Completely silent fail if even dialog fails
        }
      }
    },

    /**
     * Log an error to the console and error log
     * @param {String} message - The message to log
     * @param {String} script - The script name (optional)
     * @param {String} line - The line number (optional)
     * @param {Object} parameters - The function parameters (optional)
     * @param {Object} attributes - The attributes (optional)
     */
    error: function(message, script, line, parameters, attributes) {
      try {
        // First, try to show the message in a dialog for immediate feedback
        // This is especially useful for debugging when logging fails
        if (typeof dialog === 'function') {
          try {
            // Always show dialog for error messages
            var quickDialog = dialog();
            quickDialog.title('Error Message')
                      .text(message ? message.toString() : 'Unknown error')
                      .positiveButton('OK', function() {})
                      .show();
          } catch (dialogError) {
            // Silent fail for dialog
          }
        }

        // Log to a dedicated log library if available
        if (typeof libByName === 'function') {
          // Try multiple possible error library names
          var errorLibNames = ['ASISTANTO Errors', 'Errors', 'Error Log', 'Log'];
          var logLib = null;

          // Try to find an error logging library
          for (var i = 0; i < errorLibNames.length; i++) {
            try {
              logLib = libByName(errorLibNames[i]);
              if (logLib) {
                break;
              }
            } catch (libError) {
              // Continue to next library name
            }
          }

          if (logLib) {
            // Create entry with error handling
            var entry = null;
            try {
              entry = logLib.create();
            } catch (createError) {
              // If create fails, try to show error in dialog
              if (typeof dialog === 'function') {
                try {
                  var createErrorDialog = dialog();
                  createErrorDialog.title('Error Creating Error Entry')
                                 .text('Failed to create entry: ' + createError.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                } catch (dialogError) {
                  // Silent fail for dialog
                }
              }
              return; // Exit if we can't create an entry
            }

            if (!entry) {
              return; // Exit if entry is null
            }

            // Get field names to handle different database structures
            var typeField = 'type';
            var dateField = 'date';
            var libraryField = 'memento library';
            var scriptField = 'script';
            var lineField = 'line';
            var textField = 'text';
            var userField = 'user';
            var parametersField = 'parameters';
            var attributesField = 'attributes';

            // Try to detect field names if they're different
            try {
              var fields = logLib.fields();
              if (fields && fields.length > 0) {
                for (var i = 0; i < fields.length; i++) {
                  var fieldName = fields[i].name.toLowerCase();
                  if (fieldName.indexOf('typ') !== -1) typeField = fields[i].name;
                  else if (fieldName.indexOf('dat') !== -1) dateField = fields[i].name;
                  else if (fieldName.indexOf('lib') !== -1) libraryField = fields[i].name;
                  else if (fieldName.indexOf('scr') !== -1) scriptField = fields[i].name;
                  else if (fieldName.indexOf('lin') !== -1) lineField = fields[i].name;
                  else if (fieldName.indexOf('tex') !== -1 || fieldName.indexOf('msg') !== -1 || fieldName.indexOf('mes') !== -1) textField = fields[i].name;
                  else if (fieldName.indexOf('use') !== -1) userField = fields[i].name;
                  else if (fieldName.indexOf('par') !== -1) parametersField = fields[i].name;
                  else if (fieldName.indexOf('att') !== -1) attributesField = fields[i].name;
                }
              }
            } catch (fieldsError) {
              // Continue with default field names
            }

            // Safely set fields with null checks
            try { entry.set(typeField, 'error'); } catch(e) {}
            try { entry.set(dateField, new Date()); } catch(e) {}

            // Safely get library title
            var libTitle = "unknown";
            try {
              var currentLib = lib();
              if (currentLib && typeof currentLib.title === 'string') {
                libTitle = currentLib.title;
              }
            } catch(e) {}
            try { entry.set(libraryField, libTitle); } catch(e) {}

            try { entry.set(scriptField, script || 'console.error'); } catch(e) {}
            try { entry.set(lineField, line || 'unknown'); } catch(e) {}
            try { entry.set(textField, message ? message.toString() : 'No message'); } catch(e) {}

            // Safely get user
            var currentUser = "unknown";
            try {
              currentUser = user();
            } catch(e) {}
            try { entry.set(userField, currentUser); } catch(e) {}

            // Set parameters and attributes if provided
            if (parameters) {
              try {
                entry.set(parametersField, JSON.stringify(parameters));
              } catch(e) {}
            }
            if (attributes) {
              try {
                entry.set(attributesField, JSON.stringify(attributes));
              } catch(e) {}
            }

            // Save entry with try-catch
            try {
              entry.save();
            } catch(e) {
              // Try alternative approach if save fails
              try {
                // Try to save with minimal fields
                var minimalEntry = logLib.create();
                minimalEntry.set(typeField, 'error');
                minimalEntry.set(textField, 'Failed to save error: ' + message);
                minimalEntry.save();
              } catch(saveError) {
                // If save fails, try to show error in dialog
                if (typeof dialog === 'function') {
                  try {
                    var saveErrorDialog = dialog();
                    saveErrorDialog.title('Error Saving Error Entry')
                                 .text('Failed to save entry: ' + e.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                  } catch (dialogError) {
                    // Silent fail for dialog
                  }
                }
              }
            }
          } else {
            // If no error library exists, try to show message in dialog
            if (typeof dialog === 'function') {
              try {
                var noLibDialog = dialog();
                noLibDialog.title('No Error Library')
                          .text('No error logging library found. Error: ' + message)
                          .positiveButton('OK', function() {})
                          .show();
              } catch (dialogError) {
                // Silent fail for dialog
              }
            }
          }
        }
      } catch (e) {
        // Silent fail with fallback to dialog
        try {
          var errorDialog = dialog();
          errorDialog.title('Console Error')
                    .text('Failed to log error: ' + message + '\nError: ' + e.toString())
                    .positiveButton('OK', function() {})
                    .show();
        } catch (dialogError) {
          // Completely silent fail if even dialog fails
        }
      }
    },

    /**
     * Log a message to the console and error log
     * @param {String} message - The message to log
     * @param {String} script - The script name (optional)
     * @param {String} line - The line number (optional)
     * @param {Object} parameters - The function parameters (optional)
     * @param {Object} attributes - The attributes (optional)
     */
    msg: function(message, script, line, parameters, attributes) {
      try {
        // First, try to show the message in a dialog for immediate feedback
        // This is especially useful for debugging when logging fails
        if (typeof dialog === 'function') {
          try {
            // Only show dialog for important messages to avoid dialog spam
            if (message && message.toString().indexOf("IMPORTANT") !== -1) {
              var quickDialog = dialog();
              quickDialog.title('Message')
                        .text(message.toString())
                        .positiveButton('OK', function() {})
                        .show();
            }
          } catch (dialogError) {
            // Silent fail for dialog
          }
        }

        // Log to a dedicated log library if available
        if (typeof libByName === 'function') {
          // Try multiple possible error library names
          var errorLibNames = ['ASISTANTO Errors', 'Errors', 'Error Log', 'Log'];
          var logLib = null;

          // Try to find an error logging library
          for (var i = 0; i < errorLibNames.length; i++) {
            try {
              logLib = libByName(errorLibNames[i]);
              if (logLib) {
                break;
              }
            } catch (libError) {
              // Continue to next library name
            }
          }

          if (logLib) {
            // Create entry with error handling
            var entry = null;
            try {
              entry = logLib.create();
            } catch (createError) {
              // If create fails, try to show error in dialog
              if (typeof dialog === 'function') {
                try {
                  var createErrorDialog = dialog();
                  createErrorDialog.title('Error Creating Message Entry')
                                 .text('Failed to create entry: ' + createError.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                } catch (dialogError) {
                  // Silent fail for dialog
                }
              }
              return; // Exit if we can't create an entry
            }

            if (!entry) {
              return; // Exit if entry is null
            }

            // Get field names to handle different database structures
            var typeField = 'type';
            var dateField = 'date';
            var libraryField = 'memento library';
            var scriptField = 'script';
            var lineField = 'line';
            var textField = 'text';
            var userField = 'user';
            var parametersField = 'parameters';
            var attributesField = 'attributes';

            // Try to detect field names if they're different
            try {
              var fields = logLib.fields();
              if (fields && fields.length > 0) {
                for (var i = 0; i < fields.length; i++) {
                  var fieldName = fields[i].name.toLowerCase();
                  if (fieldName.indexOf('typ') !== -1) typeField = fields[i].name;
                  else if (fieldName.indexOf('dat') !== -1) dateField = fields[i].name;
                  else if (fieldName.indexOf('lib') !== -1) libraryField = fields[i].name;
                  else if (fieldName.indexOf('scr') !== -1) scriptField = fields[i].name;
                  else if (fieldName.indexOf('lin') !== -1) lineField = fields[i].name;
                  else if (fieldName.indexOf('tex') !== -1 || fieldName.indexOf('msg') !== -1 || fieldName.indexOf('mes') !== -1) textField = fields[i].name;
                  else if (fieldName.indexOf('use') !== -1) userField = fields[i].name;
                  else if (fieldName.indexOf('par') !== -1) parametersField = fields[i].name;
                  else if (fieldName.indexOf('att') !== -1) attributesField = fields[i].name;
                }
              }
            } catch (fieldsError) {
              // Continue with default field names
            }

            // Safely set fields with null checks
            try { entry.set(typeField, 'message'); } catch(e) {}
            try { entry.set(dateField, new Date()); } catch(e) {}

            // Safely get library title
            var libTitle = "unknown";
            try {
              var currentLib = lib();
              if (currentLib && typeof currentLib.title === 'string') {
                libTitle = currentLib.title;
              }
            } catch(e) {}
            try { entry.set(libraryField, libTitle); } catch(e) {}

            try { entry.set(scriptField, script || 'console.msg'); } catch(e) {}
            try { entry.set(lineField, line || 'unknown'); } catch(e) {}
            try { entry.set(textField, message ? message.toString() : 'No message'); } catch(e) {}

            // Safely get user
            var currentUser = "unknown";
            try {
              currentUser = user();
            } catch(e) {}
            try { entry.set(userField, currentUser); } catch(e) {}

            // Set parameters and attributes if provided
            if (parameters) {
              try {
                entry.set(parametersField, JSON.stringify(parameters));
              } catch(e) {}
            }
            if (attributes) {
              try {
                entry.set(attributesField, JSON.stringify(attributes));
              } catch(e) {}
            }

            // Save entry with try-catch
            try {
              entry.save();
            } catch(e) {
              // Try alternative approach if save fails
              try {
                // Try to save with minimal fields
                var minimalEntry = logLib.create();
                minimalEntry.set(typeField, 'message');
                minimalEntry.set(textField, 'Failed to save message: ' + message);
                minimalEntry.save();
              } catch(saveError) {
                // If save fails, try to show error in dialog
                if (typeof dialog === 'function') {
                  try {
                    var saveErrorDialog = dialog();
                    saveErrorDialog.title('Error Saving Message Entry')
                                 .text('Failed to save entry: ' + e.toString())
                                 .positiveButton('OK', function() {})
                                 .show();
                  } catch (dialogError) {
                    // Silent fail for dialog
                  }
                }
              }
            }
          } else {
            // If no error library exists, try to show message in dialog
            if (typeof dialog === 'function') {
              try {
                var noLibDialog = dialog();
                noLibDialog.title('No Error Library')
                          .text('No error logging library found. Message: ' + message)
                          .positiveButton('OK', function() {})
                          .show();
              } catch (dialogError) {
                // Silent fail for dialog
              }
            }
          }
        }
      } catch (e) {
        // Silent fail with fallback to dialog
        try {
          var errorDialog = dialog();
          errorDialog.title('Console Message Error')
                    .text('Failed to log message: ' + message + '\nError: ' + e.toString())
                    .positiveButton('OK', function() {})
                    .show();
        } catch (dialogError) {
          // Completely silent fail if even dialog fails
        }
      }
    }
  };
}

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Error Handler module
std.ErrorHandler = {
  /**
   * Extract line number from an error object
   * @param {Error} error - The error object
   * @returns {String} - The line number or "unknown"
   * @private
   */
  _getErrorLineNumber: function(error) {
    try {
      if (error instanceof Error) {
        // Try to get line number from lineNumber property
        if (error.lineNumber) {
          return error.lineNumber;
        }

        // Try to extract line number from stack trace
        if (error.stack) {
          var stackLines = error.stack.split('\n');
          for (var i = 0; i < stackLines.length; i++) {
            var match = stackLines[i].match(/:(\d+):\d+/);
            if (match && match[1]) {
              return match[1];
            }
          }
        }
      }
      return "unknown";
    } catch (e) {
      return "unknown";
    }
  },

  /**
   * Create a system error entry in the error log
   * @param {Error|String} error - The error object or error message
   * @param {String} source - The source of the error (function name)
   * @param {Boolean} showMessage - Whether to show a message to the user
   * @returns {Object} - The created error entry
   */
  createSystemError: function(error, source, showMessage) {
    try {
      // Get error message and line number
      var errorMessage = error;
      var lineNumber = "unknown";

      if (error instanceof Error) {
        errorMessage = error.message;
        lineNumber = this._getErrorLineNumber(error);
      }

      // Create error entry with line number
      var errorEntry = this._createErrorEntry("SYSTEM", source, errorMessage, lineNumber);

      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("System Error", source, errorMessage, lineNumber);
      }

      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.error("Error in createSystemError: " + e.toString());

      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('System Error')
                .text('Error in ' + source + ' (line: unknown): ' + errorMessage + '\n\nAdditional error: ' + e.toString()+ '\nLine: ' + e.lineNumber)
                .positiveButton('OK', function() {})
                .show();

      // Try to create error entry directly
      try {
        var constants = { APP: { ERRORS: 'ASISTANTO Errors' }, NOTES: { STD_ERROR_ENTRY: 'generované scriptom std.ErrorHandler' } };
        var errorLib = libByName(constants.APP.ERRORS);
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("Typ", "SYSTEM");
          fallbackEntry.set("Zdroj", source);
          fallbackEntry.set("Správa", errorMessage);
          fallbackEntry.set("Dátum", new Date());
          fallbackEntry.set("Používateľ", user());
          fallbackEntry.set("Poznámka", "Fallback error entry");
          fallbackEntry.set("Riadok", "unknown");
          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

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
      // Get error message and line number
      var errorMessage = error;
      var lineNumber = "unknown";

      if (error instanceof Error) {
        errorMessage = error.message;
        lineNumber = this._getErrorLineNumber(error);
      }

      // Create error entry with line number
      var errorEntry = this._createErrorEntry("DATABASE", source, errorMessage, lineNumber);

      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("Database Error", source, errorMessage, lineNumber);
      }

      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.error("Error in createDatabaseError: " + e.toString());

      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('Database Error')
                .text('Error in ' + source + ' (line: unknown): ' + errorMessage + '\n\nAdditional error: ' + e.toString()+ '\nLine: ' + e.lineNumber)
                .positiveButton('OK', function() {})
                .show();

      // Try to create error entry directly
      try {
        var constants = { APP: { ERRORS: 'ASISTANTO Errors' }, NOTES: { STD_ERROR_ENTRY: 'generované scriptom std.ErrorHandler' } };
        var errorLib = libByName(constants.APP.ERRORS);
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("Typ", "DATABASE");
          fallbackEntry.set("Zdroj", source);
          fallbackEntry.set("Správa", errorMessage);
          fallbackEntry.set("Dátum", new Date());
          fallbackEntry.set("Používateľ", user());
          fallbackEntry.set("Poznámka", "Fallback error entry");
          fallbackEntry.set("Riadok", "unknown");
          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

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
      // Get error message and line number
      var errorMessage = error;
      var lineNumber = "unknown";

      if (error instanceof Error) {
        errorMessage = error.message;
        lineNumber = this._getErrorLineNumber(error);
      }

      // Create error entry with line number
      var errorEntry = this._createErrorEntry("VALIDATION", source, errorMessage, lineNumber);

      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("Validation Error", source, errorMessage, lineNumber);
      }

      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.error("Error in createValidationError: " + e.toString());

      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('Validation Error')
                .text('Error in ' + source + ' (line: unknown): ' + errorMessage + '\n\nAdditional error: ' + e.toString()+ '\nLine: ' + e.lineNumber)
                .positiveButton('OK', function() {})
                .show();

      // Try to create error entry directly
      try {
        var constants = { APP: { ERRORS: 'ASISTANTO Errors' }, NOTES: { STD_ERROR_ENTRY: 'generované scriptom std.ErrorHandler' } };
        var errorLib = libByName(constants.APP.ERRORS);
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("Typ", "VALIDATION");
          fallbackEntry.set("Zdroj", source);
          fallbackEntry.set("Správa", errorMessage);
          fallbackEntry.set("Dátum", new Date());
          fallbackEntry.set("Používateľ", user());
          fallbackEntry.set("Poznámka", "Fallback error entry");
          fallbackEntry.set("Riadok", "unknown");
          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

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
      // Get error message and line number
      var errorMessage = error;
      var lineNumber = "unknown";

      if (error instanceof Error) {
        errorMessage = error.message;
        lineNumber = this._getErrorLineNumber(error);
      }

      // Create error entry with line number
      var errorEntry = this._createErrorEntry("BUSINESS", source, errorMessage, lineNumber);

      // Show message if requested
      if (showMessage) {
        this._showErrorMessage("Business Error", source, errorMessage, lineNumber);
      }

      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.error("Error in createBusinessError: " + e.toString());

      // Use dialog instead of message
      var errorDialog = dialog();
      errorDialog.title('Business Error')
                .text('Error in ' + source + ' (line: unknown): ' + errorMessage + '\n\nAdditional error: ' + e.toString()+ '\nLine: ' + e.lineNumber)
                .positiveButton('OK', function() {})
                .show();

      // Try to create error entry directly
      try {
        var constants = { APP: { ERRORS: 'ASISTANTO Errors' }, NOTES: { STD_ERROR_ENTRY: 'generované scriptom std.ErrorHandler' } };
        var errorLib = libByName(constants.APP.ERRORS);
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("Typ", "BUSINESS");
          fallbackEntry.set("Zdroj", source);
          fallbackEntry.set("Správa", errorMessage);
          fallbackEntry.set("Dátum", new Date());
          fallbackEntry.set("Používateľ", user());
          fallbackEntry.set("Poznámka", "Fallback error entry");
          fallbackEntry.set("Riadok", "unknown");
          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

      return null;
    }
  },

  /**
   * Log an error message to the console and error log
   * @param {String} module - The module name
   * @param {String} function - The function name
   * @param {String} message - The error message
   * @param {String} lineNumber - The line number (optional)
   * @param {Object} parameters - The function parameters (optional)
   * @param {Object} attributes - The attributes (optional)
   * @returns {Object} - The created error entry
   */
  logError: function(module, functionName, message, lineNumber, parameters, attributes) {
    try {
      // Format the script name
      var scriptName = module + "." + functionName;

      // Log to console
      console.error("ERROR: [" + scriptName + "] " + message, scriptName, lineNumber, parameters, attributes);

      return null; // console.error already creates the entry
    } catch (e) {
      // Fallback if error handling fails
      try {
        // Try direct approach to create entry
        var errorLib = libByName('ASISTANTO Errors');
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("type", "error");
          fallbackEntry.set("date", new Date());
          fallbackEntry.set("memento library", lib().title);
          fallbackEntry.set("script", module + "." + functionName);
          fallbackEntry.set("line", lineNumber || "unknown");
          fallbackEntry.set("text", message);
          fallbackEntry.set("user", user());

          // Set parameters and attributes if provided
          if (parameters) {
            fallbackEntry.set("parameters", JSON.stringify(parameters));
          }
          if (attributes) {
            fallbackEntry.set("attributes", JSON.stringify(attributes));
          }

          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

      return null;
    }
  },

  /**
   * Log a warning message to the console and error log
   * @param {String} module - The module name
   * @param {String} function - The function name
   * @param {String} message - The warning message
   * @param {String} lineNumber - The line number (optional)
   * @param {Object} parameters - The function parameters (optional)
   * @param {Object} attributes - The attributes (optional)
   * @returns {Object} - The created error entry
   */
  logWarning: function(module, functionName, message, lineNumber, parameters, attributes) {
    try {
      // Format the script name
      var scriptName = module + "." + functionName;

      // Log to console
      console.warn("WARNING: [" + scriptName + "] " + message, scriptName, lineNumber, parameters, attributes);

      return null; // console.warn already creates the entry
    } catch (e) {
      // Fallback if error handling fails
      try {
        // Try direct approach to create entry
        var errorLib = libByName('ASISTANTO Errors');
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("type", "warn");
          fallbackEntry.set("date", new Date());
          fallbackEntry.set("memento library", lib().title);
          fallbackEntry.set("script", module + "." + functionName);
          fallbackEntry.set("line", lineNumber || "unknown");
          fallbackEntry.set("text", message);
          fallbackEntry.set("user", user());

          // Set parameters and attributes if provided
          if (parameters) {
            fallbackEntry.set("parameters", JSON.stringify(parameters));
          }
          if (attributes) {
            fallbackEntry.set("attributes", JSON.stringify(attributes));
          }

          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

      return null;
    }
  },

  /**
   * Log an info message to the console and error log
   * @param {String} module - The module name
   * @param {String} function - The function name
   * @param {String} message - The info message
   * @param {String} lineNumber - The line number (optional)
   * @param {Object} parameters - The function parameters (optional)
   * @param {Object} attributes - The attributes (optional)
   * @returns {Object} - The created error entry
   */
  logInfo: function(module, functionName, message, lineNumber, parameters, attributes) {
    try {
      // Format the script name
      var scriptName = module + "." + functionName;

      // Log to console
      console.log("INFO: [" + scriptName + "] " + message, scriptName, lineNumber, parameters, attributes);

      return null; // console.log already creates the entry
    } catch (e) {
      // Fallback if error handling fails
      try {
        // Try direct approach to create entry
        var errorLib = libByName('ASISTANTO Errors');
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("type", "log");
          fallbackEntry.set("date", new Date());
          fallbackEntry.set("memento library", lib().title);
          fallbackEntry.set("script", module + "." + functionName);
          fallbackEntry.set("line", lineNumber || "unknown");
          fallbackEntry.set("text", message);
          fallbackEntry.set("user", user());

          // Set parameters and attributes if provided
          if (parameters) {
            fallbackEntry.set("parameters", JSON.stringify(parameters));
          }
          if (attributes) {
            fallbackEntry.set("attributes", JSON.stringify(attributes));
          }

          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

      return null;
    }
  },

  /**
   * Log a message to the console and error log
   * @param {String} module - The module name
   * @param {String} function - The function name
   * @param {String} message - The message
   * @param {String} lineNumber - The line number (optional)
   * @param {Object} parameters - The function parameters (optional)
   * @param {Object} attributes - The attributes (optional)
   * @returns {Object} - The created error entry
   */
  logMessage: function(module, functionName, message, lineNumber, parameters, attributes) {
    try {
      // Format the script name
      var scriptName = module + "." + functionName;

      // Log to console
      console.msg("MESSAGE: [" + scriptName + "] " + message, scriptName, lineNumber, parameters, attributes);

      return null; // console.msg already creates the entry
    } catch (e) {
      // Fallback if error handling fails
      try {
        // Try direct approach to create entry
        var errorLib = libByName('ASISTANTO Errors');
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("type", "message");
          fallbackEntry.set("date", new Date());
          fallbackEntry.set("memento library", lib().title);
          fallbackEntry.set("script", module + "." + functionName);
          fallbackEntry.set("line", lineNumber || "unknown");
          fallbackEntry.set("text", message);
          fallbackEntry.set("user", user());

          // Set parameters and attributes if provided
          if (parameters) {
            fallbackEntry.set("parameters", JSON.stringify(parameters));
          }
          if (attributes) {
            fallbackEntry.set("attributes", JSON.stringify(attributes));
          }

          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

      return null;
    }
  },

  /**
   * Create an error entry in the error log
   * @param {String} type - The type of error
   * @param {String} source - The source of the error
   * @param {String} message - The error message
   * @param {String} lineNumber - The line number where the error occurred
   * @param {Object} parameters - The function parameters (optional)
   * @param {Object} attributes - The attributes (optional)
   * @returns {Object} - The created error entry
   * @private
   */
  _createErrorEntry: function(type, source, message, lineNumber, parameters, attributes) {
    try {
      // Get constants
      var constants = (typeof std !== 'undefined' && std.Constants) ?
                      std.Constants :
                      { APP: { ERRORS: 'ASISTANTO Errors' } };

      // Get error library
      var errorLib = libByName(constants.APP.ERRORS);
      if (!errorLib) {
        console.error("Error library not found: " + constants.APP.ERRORS, "std_errorHandler.js", "_createErrorEntry");
        return null;
      }

      // Map error type to database type field
      var errorType = "error";
      switch(type) {
        case "SYSTEM":
        case "DATABASE":
        case "VALIDATION":
        case "BUSINESS":
        case "ERROR":
          errorType = "error";
          break;
        case "WARNING":
          errorType = "warn";
          break;
        case "INFO":
          errorType = "log";
          break;
        case "MESSAGE":
          errorType = "message";
          break;
      }

      // Create error entry
      var errorEntry = errorLib.create();

      // Safely set fields with null checks
      try { errorEntry.set("type", errorType); } catch(e) {}
      try { errorEntry.set("date", new Date()); } catch(e) {}

      // Safely get library title
      var libTitle = "unknown";
      try {
        var currentLib = lib();
        if (currentLib && typeof currentLib.title === 'string') {
          libTitle = currentLib.title;
        }
      } catch(e) {}
      try { errorEntry.set("memento library", libTitle); } catch(e) {}

      try { errorEntry.set("script", source || "unknown"); } catch(e) {}
      try { errorEntry.set("line", lineNumber || "unknown"); } catch(e) {}
      try { errorEntry.set("text", message ? message.toString() : "No message"); } catch(e) {}

      // Safely get user
      var currentUser = "unknown";
      try {
        currentUser = user();
      } catch(e) {}
      try { errorEntry.set("user", currentUser); } catch(e) {}

      // Set parameters and attributes if provided
      if (parameters) {
        try {
          errorEntry.set("parameters", JSON.stringify(parameters));
        } catch(e) {}
      }
      if (attributes) {
        try {
          errorEntry.set("attributes", JSON.stringify(attributes));
        } catch(e) {}
      }

      // Save entry with try-catch
      try {
        errorEntry.save();
      } catch(e) {
        // Try alternative approach if save fails
        try {
          // Try to save with minimal fields
          var minimalEntry = errorLib.create();
          minimalEntry.set("type", "error");
          minimalEntry.set("text", "Failed to save error entry: " + message);
          minimalEntry.save();
        } catch(saveError) {
          // Nothing more we can do
        }
      }

      return errorEntry;
    } catch (e) {
      // Fallback if error handling fails
      console.error("Error in _createErrorEntry: " + e.toString(), "std_errorHandler.js", "_createErrorEntry");

      // Try direct approach to create entry
      try {
        var errorLib = libByName('ASISTANTO Errors');
        if (errorLib) {
          var fallbackEntry = errorLib.create();
          fallbackEntry.set("type", "error");
          fallbackEntry.set("date", new Date());
          fallbackEntry.set("memento library", lib().title);
          fallbackEntry.set("script", source);
          fallbackEntry.set("line", lineNumber || "unknown");
          fallbackEntry.set("text", "Fallback error: " + message);
          fallbackEntry.set("user", user());
          fallbackEntry.save();
          return fallbackEntry;
        }
      } catch (fallbackError) {
        // Nothing more we can do
      }

      return null;
    }
  },

  /**
   * Show an error message to the user
   * @param {String} title - The title of the error message
   * @param {String} source - The source of the error
   * @param {String} message - The error message
   * @param {String} lineNumber - The line number where the error occurred
   * @private
   */
  _showErrorMessage: function(title, source, message, lineNumber) {
    try {
      // Use dialog instead of message
      var errorDialog = dialog();
      var displayText = 'Error in ' + source;

      // Add line number if available
      if (lineNumber && lineNumber !== "unknown") {
        displayText += ' (line: ' + lineNumber + ')';
      }

      displayText += ': ' + message;

      errorDialog.title(title)
                .text(displayText)
                .positiveButton('OK', function() {})
                .show();
    } catch (e) {
      // Fallback if error handling fails
      console.error("Error in _showErrorMessage: " + e.toString());

      // Try another approach to show dialog
      try {
        // Create a new dialog object with minimal configuration
        var fallbackDialog = dialog();
        var fallbackText = title + ': ' + message;
        if (lineNumber && lineNumber !== "unknown") {
          fallbackText += ' (line: ' + lineNumber + ')';
        }

        fallbackDialog.title('Error')
                     .text(fallbackText)
                     .positiveButton('OK', function() {})
                     .show();
      } catch (dialogError) {
        // Last resort fallback - use simple message if dialog completely fails
        try {
          message(title + ': ' + message);
        } catch (messageError) {
          // Nothing more we can do if even message fails
        }
      }
    }
  }
};

// For backward compatibility
var std_ErrorHandler = std.ErrorHandler;
