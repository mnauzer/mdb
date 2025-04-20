// Standardized Triggers for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Triggers module that handles all Memento Database triggers
 * This module can be used directly in Memento Database scripts
 * without requiring the ASISTANTO Scripts table.
 *
 * To use these triggers:
 * 1. Copy this file to your Memento Database library's Scripts section
 * 2. In your library settings, go to the Triggers tab
 * 3. For each trigger event, select the corresponding function from this module
 *    For example, for the "Library Open" event, select "libOpen"
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
var std = {};
}

// Triggers module
std.Triggers = {
/**
 * Library open trigger
 * Called when a library is opened
 */
libOpen: function() {
try {
    // Initialize the core module if available
    if (typeof std !== 'undefined' && std.Core && !std.Core._initialized) {
        try {
            std.Core.init();
        } catch (initError) {
            // Use direct error handling instead of console.error
            try {
                var errorDialog = dialog();
                errorDialog.title('Core Error')
                          .text('Failed to initialize Core module: ' + initError.toString())
                          .positiveButton('OK', function() {})
                          .show();
            } catch (dialogError) {
                // Nothing more we can do if even dialog fails
            }
        }
    }

    // Get the current library safely
    var libName = "unknown";
    var currentLib = null;
    try {
        currentLib = lib();
        if (currentLib && typeof currentLib.title === 'string') {
            libName = currentLib.title;
        }
    } catch (libError) {
        // Use direct error handling instead of console.error
        try {
            var errorDialog = dialog();
            errorDialog.title('Library Error')
                      .text('Failed to get library information: ' + libError.toString())
                      .positiveButton('OK', function() {})
                      .show();
        } catch (dialogError) {
            // Nothing more we can do if even dialog fails
        }
        return; // Exit early to prevent further errors
    }

    // Update app state safely
    try {
        if (typeof app !== 'undefined' && app.activeLib) {
            app.activeLib.name = libName;
            app.activeLib.lib = currentLib;
            app.activeLib.entries = currentLib.entries();
        }
    } catch (appError) {
        // Silently continue, no need to show error for this
    }

    // Show welcome message safely
    try {
        if (typeof app !== 'undefined' && app.data) {
            // Use dialog instead of message
            var welcomeDialog = dialog();
            welcomeDialog.title('Welcome')
                        .text(app.data.name + ' v.' + app.data.version + '\n' + libName + ' ' + (app.season || ''))
                        .positiveButton('OK', function() {})
                        .show();
        } else {
            // Use dialog instead of message
            var simpleDialog = dialog();
            simpleDialog.title('Welcome')
                        .text('Welcome to ' + libName)
                        .positiveButton('OK', function() {})
                        .show();
        }
    } catch (dialogError) {
        // Silently continue, no need to show error for this
    }

    // Don't use console.log here as it might be causing the issue
    // Instead, return silently

} catch (e) {
    // Use direct error handling instead of console.error
    try {
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in libOpen: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
    } catch (dialogError) {
        // Nothing more we can do if even dialog fails
    }
}
},

/**
 * Library open before show trigger
 * Called before a library is shown
 */
libOpenBeforeShow: function() {
try {
    // Get the current library safely
    var libName = "unknown";
    try {
        var currentLib = lib();
        if (currentLib && typeof currentLib.title === 'string') {
            libName = currentLib.title;
        }
    } catch (libError) {
        // Use direct error handling instead of console.error
        try {
            var errorDialog = dialog();
            errorDialog.title('Library Error')
                      .text('Failed to get library information: ' + libError.toString())
                      .positiveButton('OK', function() {})
                      .show();
        } catch (dialogError) {
            // Nothing more we can do if even dialog fails
        }
        return; // Exit early to prevent further errors
    }

    // Show dialog safely
    try {
        var dialogTitle = '';
        var dialogText = '';

        // Safely access app properties
        var appName = '';
        var appVersion = '';
        var appSeason = '';

        try {
            if (typeof app !== 'undefined') {
                if (app.data) {
                    appName = app.data.name || '';
                    appVersion = app.data.version || '';
                }
                appSeason = app.season || '';
            }
        } catch (appError) {
            // Silently continue with empty values
        }

        if (appName) {
            dialogTitle = appName + ' >>> ' + libName + ' >>> ' + appSeason;
            dialogText = appVersion;
        } else {
            dialogTitle = 'Opening Library';
            dialogText = libName;
        }

        var myDialog = dialog();
        myDialog.title(dialogTitle)
                .text(dialogText)
                .negativeButton('Odísť', function() {
                    try {
                        cancel();
                    } catch (cancelError) {
                        // Silently fail if cancel() fails
                    }
                })
                .positiveButton('Pokračuj', function() {})
                .autoDismiss(true)
                .show();
    } catch (dialogError) {
        // Use direct error handling instead of console.error
        try {
            var errorDialog = dialog();
            errorDialog.title('Dialog Error')
                      .text('Failed to show dialog: ' + dialogError.toString())
                      .positiveButton('OK', function() {})
                      .show();
        } catch (innerDialogError) {
            // Nothing more we can do if even dialog fails
        }
    }

    // Don't use console.log here as it might be causing the issue
    // Instead, return silently

} catch (e) {
    // Use direct error handling instead of console.error
    try {
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in libOpenBeforeShow: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
    } catch (dialogError) {
        // Nothing more we can do if even dialog fails
    }
}
},

/**
 * Create entry open trigger
 * Called when a new entry is being created
 */
createEntryOpen: function() {
try {
    // Get the current library safely
    var libName = "unknown";
    var currentLib = null;
    try {
        currentLib = lib();
        if (currentLib && typeof currentLib.title === 'string') {
            libName = currentLib.title;
        }
    } catch (libError) {
        // Use direct error handling instead of console.error
        try {
            var errorDialog = dialog();
            errorDialog.title('Library Error')
                      .text('Failed to get library information: ' + libError.toString())
                      .positiveButton('OK', function() {})
                      .show();
        } catch (dialogError) {
            // Nothing more we can do if even dialog fails
        }
        return; // Exit early to prevent further errors
    }

    // Get the default entry safely
    var en = null;
    try {
        en = entryDefault();
        if (!en) {
            // Use direct error handling instead of console.error
            try {
                var errorDialog = dialog();
                errorDialog.title('Entry Error')
                          .text('Failed to get default entry')
                          .positiveButton('OK', function() {})
                          .show();
            } catch (dialogError) {
                // Nothing more we can do if even dialog fails
            }
            return; // Exit early to prevent further errors
        }
    } catch (entryError) {
        // Use direct error handling instead of console.error
        try {
            var errorDialog = dialog();
            errorDialog.title('Entry Error')
                      .text('Failed to get default entry: ' + entryError.toString())
                      .positiveButton('OK', function() {})
                      .show();
        } catch (dialogError) {
            // Nothing more we can do if even dialog fails
        }
        return; // Exit early to prevent further errors
    }

    // Set basic fields
    if (typeof std !== 'undefined' && std.Constants) {
        try {
            var constants = std.Constants;
            var utils = std.Utils;

            // Set view state safely
            try {
                utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.EDIT);
            } catch (viewError) {
                // Silently continue, no need to show error for this
            }

            // Set date safely
            try {
                utils.Field.setValue(en, constants.FIELDS.COMMON.DATE, new Date());
            } catch (dateError) {
                // Silently continue, no need to show error for this
            }

            // Generate entry number safely
            try {
                var entryNumber = utils.EntryNumber.generateEntryNumber(en);
                if (entryNumber) {
                    utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER, entryNumber);

                    // Get the raw entry number (without prefix and season) from the entry attributes
                    var rawEntryNumber = en.attr("_deletedNumber") || en.attr("_nextNumber");
                    if (rawEntryNumber) {
                        utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER_ENTRY, parseInt(rawEntryNumber, 10));
                    }
                } else if (typeof app !== 'undefined' && app.activeLib && app.activeLib.number) {
                    // Fallback to old method if entry number generation fails
                    utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER, app.activeLib.number);
                    utils.Field.setValue(en, constants.FIELDS.COMMON.NUMBER_ENTRY, app.activeLib.nextNum);
                }
            } catch (numberError) {
                // Silently continue, no need to show error for this
            }

            // Get current season from ASISTANTO database safely
            try {
                var asistentoLib = libByName(constants.APP.TENANTS);
                if (asistentoLib) {
                    var seasonEntries = asistentoLib.find("Prevádzka appky = 'Ostrý režim'");
                    if (seasonEntries.length === 0) {
                        seasonEntries = asistentoLib.find("Prevádzka appky = 'Testovanie'");
                    }

                    if (seasonEntries.length > 0) {
                        var season = seasonEntries[0].field("Sezóna");
                        utils.Field.setValue(en, constants.FIELDS.COMMON.SEASON, season);
                    } else if (typeof app !== 'undefined' && app.season) {
                        // Fallback to app.season if ASISTANTO database is not available
                        utils.Field.setValue(en, constants.FIELDS.COMMON.SEASON, app.season);
                    }
                } else if (typeof app !== 'undefined' && app.season) {
                    // Fallback to app.season if ASISTANTO database is not available
                    utils.Field.setValue(en, constants.FIELDS.COMMON.SEASON, app.season);
                }
            } catch (seasonError) {
                // Silently continue, no need to show error for this
            }

            // Set creation metadata safely
            try {
                var currentUser = "unknown";
                try {
                    currentUser = user();
                } catch (userError) {
                    // Silently continue with default value
                }

                utils.Field.setValue(en, constants.FIELDS.COMMON.CREATED_BY, currentUser);
                utils.Field.setValue(en, constants.FIELDS.COMMON.CREATED_DATE, new Date());
            } catch (metadataError) {
                // Silently continue, no need to show error for this
            }

            // Set library-specific defaults safely
            try {
                if (libName === constants.LIBRARIES.RECORDS.ATTENDANCE) {
                    // For Attendance database, use direct Date objects instead of strings
                    try {
                        // Create Date objects for arrival and departure
                        var now = new Date();
                        var arrival = new Date(now);
                        arrival.setHours(8, 0, 0, 0); // 8:00

                        var departure = new Date(now);
                        departure.setHours(16, 30, 0, 0); // 16:30

                        // Set the values directly as Date objects
                        utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.ARRIVAL, arrival);
                        utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.DEPARTURE, departure);
                    } catch (timeError) {
                        // If direct Date objects fail, try with the constants
                        try {
                            utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.ARRIVAL, constants.DEFAULTS.ATTENDANCE.ARRIVAL);
                            utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.DEPARTURE, constants.DEFAULTS.ATTENDANCE.DEPARTURE);
                        } catch (fallbackTimeError) {
                            // If that fails too, try with direct set
                            try {
                                en.set(constants.FIELDS.ATTENDANCE.ARRIVAL, arrival);
                                en.set(constants.FIELDS.ATTENDANCE.DEPARTURE, departure);
                            } catch (directSetError) {
                                // Last resort - try with field names directly
                                try {
                                    en.set('Príchod', arrival);
                                    en.set('Odchod', departure);
                                } catch (finalError) {
                                    // Nothing more we can do
                                }
                            }
                        }
                    }
                } else if (libName === constants.LIBRARIES.RECORDS.WORK_RECORDS) {
                    try {
                        var now = new Date();
                        var startTime = new Date(now);
                        startTime.setHours(8, 0, 0, 0); // 8:00

                        var endTime = new Date(now);
                        endTime.setHours(16, 30, 0, 0); // 16:30

                        utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.START_TIME, startTime);
                        utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.END_TIME, endTime);
                    } catch (timeError) {
                        // Fallback to constants
                        try {
                            utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.START_TIME, constants.DEFAULTS.WORK_RECORDS.START_TIME);
                            utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.END_TIME, constants.DEFAULTS.WORK_RECORDS.END_TIME);
                        } catch (fallbackError) {
                            // Nothing more we can do
                        }
                    }
                } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
                    utils.Field.setValue(en, constants.FIELDS.PRICE_QUOTE.VALIDITY_PERIOD, constants.DEFAULTS.PRICE_QUOTES.VALIDITY_PERIOD);
                }
            } catch (defaultsError) {
                // Silently continue, no need to show error for this
            }
        } catch (constantsError) {
            // Fallback if constants are not available
            try {
                en.set('view', 'Editácia');
                en.set('Dátum', new Date());

                // Try to set user safely
                try {
                    en.set('zapísal', user());
                } catch (userError) {
                    // Skip if user() fails
                }

                en.set('dátum zápisu', new Date());

                // For Attendance database, set default times
                if (libName === "Dochádzka") {
                    try {
                        var now = new Date();
                        var arrival = new Date(now);
                        arrival.setHours(8, 0, 0, 0); // 8:00

                        var departure = new Date(now);
                        departure.setHours(16, 30, 0, 0); // 16:30

                        en.set('Príchod', arrival);
                        en.set('Odchod', departure);
                    } catch (timeError) {
                        // Nothing more we can do
                    }
                }
            } catch (fallbackError) {
                // Nothing more we can do
            }
        }
    } else {
        // Fallback if constants are not available
        try {
            en.set('view', 'Editácia');
            en.set('Dátum', new Date());

            // Try to set user safely
            try {
                en.set('zapísal', user());
            } catch (userError) {
                // Skip if user() fails
            }

            en.set('dátum zápisu', new Date());

            // For Attendance database, set default times
            if (libName === "Dochádzka") {
                try {
                    var now = new Date();
                    var arrival = new Date(now);
                    arrival.setHours(8, 0, 0, 0); // 8:00

                    var departure = new Date(now);
                    departure.setHours(16, 30, 0, 0); // 16:30

                    en.set('Príchod', arrival);
                    en.set('Odchod', departure);
                } catch (timeError) {
                    // Nothing more we can do
                }
            }
        } catch (fallbackError) {
            // Nothing more we can do
        }
    }

    // Show message safely
    try {
        if (typeof app !== 'undefined' && app.activeLib) {
            // Use dialog instead of message
            var infoDialog = dialog();
            var dialogText = 'Knižnica: ' + libName;

            if (app.data && app.data.version) {
                dialogText += ' /' + app.data.version + '/';
            }

            if (typeof std !== 'undefined' && std.Constants && std.Utils && std.Utils.Field) {
                var constants = std.Constants;
                var utils = std.Utils;

                var season = utils.Field.getValue(en, constants.FIELDS.COMMON.SEASON) || '';
                if (season) {
                    dialogText += ' ' + season + ' /';
                }

                var number = utils.Field.getValue(en, constants.FIELDS.COMMON.NUMBER) || '';
                if (number) {
                    dialogText += ' ' + number;
                }
            }

            infoDialog.title('Informácia')
                      .text(dialogText)
                      .positiveButton('OK', function() {})
                      .show();
        }
    } catch (dialogError) {
        // Silently continue, no need to show error for this
    }

    // Don't use console.log here as it might be causing the issue
    // Instead, return silently

} catch (e) {
    // Use direct error handling instead of console.error
    try {
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in createEntryOpen: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
    } catch (dialogError) {
        // Nothing more we can do if even dialog fails
    }
}
},

/**
 * Create entry after save trigger
 * Called after a new entry is saved
 */
createEntryAfterSave: function() {
try {
    // Get the current library safely
    var libName = "unknown";
    var currentLib = null;
    var en = null;

    try {
        currentLib = lib();
        if (currentLib && typeof currentLib.title === 'string') {
            libName = currentLib.title;
        }

        // Get the last entry safely
        try {
            en = currentLib.lastEntry();
            if (!en) {
                // Use direct error handling instead of console.error
                try {
                    var errorDialog = dialog();
                    errorDialog.title('Entry Error')
                              .text('Failed to get last entry')
                              .positiveButton('OK', function() {})
                              .show();
                } catch (dialogError) {
                    // Nothing more we can do if even dialog fails
                }
                return; // Exit early to prevent further errors
            }
        } catch (entryError) {
            // Use direct error handling instead of console.error
            try {
                var errorDialog = dialog();
                errorDialog.title('Entry Error')
                          .text('Failed to get last entry: ' + entryError.toString())
                          .positiveButton('OK', function() {})
                          .show();
            } catch (dialogError) {
                // Nothing more we can do if even dialog fails
            }
            return; // Exit early to prevent further errors
        }
    } catch (libError) {
        // Use direct error handling instead of console.error
        try {
            var errorDialog = dialog();
            errorDialog.title('Library Error')
                      .text('Failed to get library information: ' + libError.toString())
                      .positiveButton('OK', function() {})
                      .show();
        } catch (dialogError) {
            // Nothing more we can do if even dialog fails
        }
        return; // Exit early to prevent further errors
    }

    // Process library-specific logic safely
    if (typeof std !== 'undefined' && std.Constants) {
        try {
            var constants = std.Constants;
            var utils = std.Utils;

            // Process library-specific logic safely
            try {
                if (libName === constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std !== 'undefined' && std.Attendance) {
                    std.Attendance.processAttendanceRecord(en, false);
                } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
                    // Process price quote logic
                    // This would be implemented in a std.PriceQuotes module
                } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTE_PARTS) {
                    // Process price quote parts logic
                    // This would be implemented in a std.PriceQuotes module
                }
            } catch (processError) {
                // Silently continue, no need to show error for this
            }

            // Update entry number information in ASISTANTO database safely
            try {
                utils.EntryNumber.updateEntryNumberInfo(en);
            } catch (numberError) {
                // Silently continue, no need to show error for this
            }

            // Update number sequence (legacy support) safely
            try {
                if (typeof app !== 'undefined' && app.activeLib) {
                    app.activeLib.lastNum = app.activeLib.nextNum;
                    app.activeLib.nextNum++;
                }
            } catch (sequenceError) {
                // Silently continue, no need to show error for this
            }

            // Update entry view state safely
            try {
                utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.PRINT);
            } catch (viewError) {
                // Silently continue, no need to show error for this
            }
        } catch (constantsError) {
            // Silently continue, no need to show error for this
        }
    }

    // Don't use console.log here as it might be causing the issue
    // Instead, return silently

} catch (e) {
    // Use direct error handling instead of console.error
    try {
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in createEntryAfterSave: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
    } catch (dialogError) {
        // Nothing more we can do if even dialog fails
    }

    // Set debug view state on error safely
    try {
        if (typeof std !== 'undefined' && std.Constants) {
            var debugEntry = lib().lastEntry();
            if (debugEntry) {
                std.Utils.Field.setValue(debugEntry, std.Constants.FIELDS.COMMON.VIEW, std.Constants.VIEW_STATES.DEBUG);
            }
        }
    } catch (debugError) {
        // Silently continue, no need to show error for this
    }
}
},

/**
 * Entry before save trigger
 * Called before an entry is saved
 */
entryBeforeSave: function() {
try {
    // Get the current library and entry
    var currentLib = lib();
    var libName = currentLib.title;
    var en = entry();

    // Process library-specific logic
    if (typeof std !== 'undefined' && std.Constants) {
    var constants = std.Constants;
    var utils = std.Utils;

    if (libName === constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std !== 'undefined' && std.Attendance) {
        std.Attendance.processAttendanceRecord(en, true);
    } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
        // Process price quote logic
        // This would be implemented in a std.PriceQuotes module
    } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTE_PARTS) {
        // Process price quote parts logic
        // This would be implemented in a std.PriceQuotes module
    }

    // Set modification metadata
    utils.Field.setValue(en, constants.FIELDS.COMMON.MODIFIED_BY, user());
    utils.Field.setValue(en, constants.FIELDS.COMMON.MODIFIED_DATE, new Date());
    }
} catch (e) {
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.createSystemError(e, "std.Triggers.entryBeforeSave", true);
    } else {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
                .text('Error in entryBeforeSave: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
    }
}
},

/**
 * Entry after save trigger
 * Called after an entry is saved
 */
entryAfterSave: function() {
try {
    // Get the current library and entry
    var currentLib = lib();
    var libName = currentLib.title;
    var en = entry();

    // Process library-specific logic
    if (typeof std !== 'undefined' && std.Constants) {
    if (libName === std.Constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std !== 'undefined' && std.Attendance) {
        // Additional processing after save if needed
    } else if (libName === std.Constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
        // Additional processing after save if needed
    }
    }
} catch (e) {
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.createSystemError(e, "std.Triggers.entryAfterSave", true);
    } else {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
                .text('Error in entryAfterSave: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
    }
}
},

/**
 * Link entry before save trigger
 * Called before a linked entry is saved
 */
linkEntryBeforeSave: function() {
try {
    // Get the default entry and master entry
    var enD = entryDefault();
    var mEn = masterEntry();

    // Get the current library
    var currentLib = lib();
    var libName = currentLib.title;

    // Process library-specific logic
    if (typeof std !== 'undefined' && std.Constants) {
    var constants = std.Constants;
    var utils = std.Utils;

    if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTE_PARTS && mEn.length > 0) {
        // Copy fields from master entry to linked entry
        if (mEn[0].lib().title === constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
        utils.Field.setValue(enD, constants.FIELDS.PRICE_QUOTE.QUOTE_TYPE,
                            utils.Field.getValue(mEn[0], constants.FIELDS.PRICE_QUOTE.QUOTE_TYPE));

        utils.Field.setValue(enD, constants.FIELDS.PRICE_QUOTE.RATE_DISCOUNT,
                            utils.Field.getValue(mEn[0], constants.FIELDS.PRICE_QUOTE.RATE_DISCOUNT));

        utils.Field.setValue(enD, constants.FIELDS.PRICE_QUOTE.TRANSPORT_BILLING,
                            utils.Field.getValue(mEn[0], constants.FIELDS.PRICE_QUOTE.TRANSPORT_BILLING));
        }
    }
    }
} catch (e) {
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.createSystemError(e, "std.Triggers.linkEntryBeforeSave", true);
    } else {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
                .text('Error in linkEntryBeforeSave: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
    }
}
},

  /**
   * Entry open trigger
   * Called when an entry is opened
   */
  entryOpen: function() {
    try {
      // Get the current entry
      var en = entry();

      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;

      // Process library-specific logic
      if (typeof std !== 'undefined' && std.Constants) {
        if (libName === std.Constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std !== 'undefined' && std.Attendance) {
          // Additional processing when opening an attendance entry
        } else if (libName === std.Constants.LIBRARIES.PROJECTS.PRICE_QUOTES && typeof std !== 'undefined' && std.PriceQuotes) {
          // Additional processing when opening an PriceQuotes entry
        } else if (libName === std.Constants.LIBRARIES.PROJECTS.PRICE_QUOTES_PARTS && typeof std !== 'undefined' && std.PriceQuotesParts) {
          // Additional processing when opening an PriceQuotesParts entry
        }
      }
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Triggers.entryOpen", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in entryOpen: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }
    }
  },

  /**
   * Entry delete trigger
   * Called when an entry is being deleted
   */
  entryDelete: function() {
    try {
      // Get the current entry
      var en = entry();

      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;

      // Process library-specific logic
      if (typeof std !== 'undefined' && std.Constants && std.Utils) {
        var constants = std.Constants;
        var utils = std.Utils;

        // Handle entry deletion by adding the entry number to the deleted numbers list
        utils.EntryNumber.handleEntryDeletion(en);

        // Additional library-specific processing if needed
        if (libName === constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std !== 'undefined' && std.Attendance) {
          // Additional processing when deleting an attendance entry
        } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTES && typeof std !== 'undefined' && std.PriceQuotes) {
          // Additional processing when deleting a price quote entry
        }
      }
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Triggers.entryDelete", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in entryDelete: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }
    }
  }
};

// Make triggers available globally for Memento Database
// These are the functions that will be called directly by Memento
function libOpen() {
  return std.Triggers.libOpen();
}

function libOpenBeforeShow() {
  return std.Triggers.libOpenBeforeShow();
}

function createEntryOpen() {
  return std.Triggers.createEntryOpen();
}

function createEntryAfterSave() {
  return std.Triggers.createEntryAfterSave();
}

function entryBeforeSave() {
  return std.Triggers.entryBeforeSave();
}

function entryAfterSave() {
  return std.Triggers.entryAfterSave();
}

function linkEntryBeforeSave() {
  return std.Triggers.linkEntryBeforeSave();
}

function entryOpen() {
  return std.Triggers.entryOpen();
}

function entryDelete() {
  return std.Triggers.entryDelete();
}

// For backward compatibility
var std_Triggers = std.Triggers;
