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
            console.error("Failed to initialize Core module", "std_triggers.js", "libOpen", initError);
        }
    }

    // Get the current library safely
    var libName = "unknown";
    try {
        var currentLib = lib();
        if (currentLib && typeof currentLib.title === 'string') {
            libName = currentLib.title;
        }
    } catch (libError) {
        console.error("Failed to get library information", "std_triggers.js", "libOpen", libError);
    }

    // Update app state safely
    try {
        if (typeof app !== 'undefined' && app.activeLib) {
            app.activeLib.name = libName;
            app.activeLib.lib = currentLib;
            app.activeLib.entries = currentLib.entries();
        }
    } catch (appError) {
        console.error("Failed to update app state", "std_triggers.js", "libOpen", appError);
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
        console.error("Failed to show welcome dialog", "std_triggers.js", "libOpen", dialogError);
    }

    // Log the event
    console.log("Library opened: " + libName, "std_triggers.js", "libOpen");

} catch (e) {
    // Use console.error for logging the error
    console.error("Error in libOpen: " + e.toString(), "std_triggers.js", "libOpen", e);

    // Show error dialog
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
        console.error("Failed to get library information", "std_triggers.js", "libOpenBeforeShow", libError);
    }

    // Show dialog safely
    try {
        var dialogTitle = '';
        var dialogText = '';

        if (typeof app !== 'undefined' && app.data) {
            dialogTitle = app.data.name + ' >>> ' + libName + ' >>> ' + (app.season || '');
            dialogText = app.data.version;
        } else {
            dialogTitle = 'Opening Library';
            dialogText = libName;
        }

        var myDialog = dialog();
        myDialog.title(dialogTitle)
                .text(dialogText)
                .negativeButton('Odísť', function() { cancel(); })
                .positiveButton('Pokračuj', function() {})
                .autoDismiss(true)
                .show();
    } catch (dialogError) {
        console.error("Failed to show dialog", "std_triggers.js", "libOpenBeforeShow", dialogError);
    }

    // Log success
    console.log("Library before show processed: " + libName, "std_triggers.js", "libOpenBeforeShow");

} catch (e) {
    // Use console.error for logging the error
    console.error("Error in libOpenBeforeShow: " + e.toString(), "std_triggers.js", "libOpenBeforeShow", e);

    // Show error dialog
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
        console.error("Failed to get library information", "std_triggers.js", "createEntryOpen", libError);
    }

    // Get the default entry safely
    var en = null;
    try {
        en = entryDefault();
        if (!en) {
            console.error("Failed to get default entry", "std_triggers.js", "createEntryOpen");
            return;
        }
    } catch (entryError) {
        console.error("Failed to get default entry", "std_triggers.js", "createEntryOpen", entryError);
        return;
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
                console.error("Failed to set view state", "std_triggers.js", "createEntryOpen", viewError);
            }

            // Set date safely
            try {
                utils.Field.setValue(en, constants.FIELDS.COMMON.DATE, new Date());
            } catch (dateError) {
                console.error("Failed to set date", "std_triggers.js", "createEntryOpen", dateError);
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
                console.error("Failed to generate entry number", "std_triggers.js", "createEntryOpen", numberError);
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
                console.error("Failed to get season information", "std_triggers.js", "createEntryOpen", seasonError);
            }

            // Set creation metadata safely
            try {
                var currentUser = "unknown";
                try {
                    currentUser = user();
                } catch (userError) {
                    console.error("Failed to get user", "std_triggers.js", "createEntryOpen", userError);
                }

                utils.Field.setValue(en, constants.FIELDS.COMMON.CREATED_BY, currentUser);
                utils.Field.setValue(en, constants.FIELDS.COMMON.CREATED_DATE, new Date());
            } catch (metadataError) {
                console.error("Failed to set creation metadata", "std_triggers.js", "createEntryOpen", metadataError);
            }

            // Set library-specific defaults safely
            try {
                if (libName === constants.LIBRARIES.RECORDS.ATTENDANCE) {
                    utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.ARRIVAL, constants.DEFAULTS.ATTENDANCE.ARRIVAL);
                    utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.DEPARTURE, constants.DEFAULTS.ATTENDANCE.DEPARTURE);
                } else if (libName === constants.LIBRARIES.RECORDS.WORK_RECORDS) {
                    utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.START_TIME, constants.DEFAULTS.WORK_RECORDS.START_TIME);
                    utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.END_TIME, constants.DEFAULTS.WORK_RECORDS.END_TIME);
                } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
                    utils.Field.setValue(en, constants.FIELDS.PRICE_QUOTE.VALIDITY_PERIOD, constants.DEFAULTS.PRICE_QUOTES.VALIDITY_PERIOD);
                }
            } catch (defaultsError) {
                console.error("Failed to set library-specific defaults", "std_triggers.js", "createEntryOpen", defaultsError);
            }
        } catch (constantsError) {
            console.error("Failed to use std.Constants", "std_triggers.js", "createEntryOpen", constantsError);

            // Fallback if constants are not available
            try {
                en.set('view', 'Editácia');
                en.set('Dátum', new Date());
                en.set('zapísal', user());
                en.set('dátum zápisu', new Date());
            } catch (fallbackError) {
                console.error("Failed to set fallback fields", "std_triggers.js", "createEntryOpen", fallbackError);
            }
        }
    } else {
        // Fallback if constants are not available
        try {
            en.set('view', 'Editácia');
            en.set('Dátum', new Date());
            en.set('zapísal', user());
            en.set('dátum zápisu', new Date());
        } catch (fallbackError) {
            console.error("Failed to set fallback fields", "std_triggers.js", "createEntryOpen", fallbackError);
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
        console.error("Failed to show information dialog", "std_triggers.js", "createEntryOpen", dialogError);
    }

    // Log success
    console.log("Entry created successfully", "std_triggers.js", "createEntryOpen");

} catch (e) {
    // Use console.error for logging the error
    console.error("Error in createEntryOpen: " + e.toString(), "std_triggers.js", "createEntryOpen", e);

    // Show error dialog
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
                console.error("Failed to get last entry", "std_triggers.js", "createEntryAfterSave");
                return;
            }
        } catch (entryError) {
            console.error("Failed to get last entry", "std_triggers.js", "createEntryAfterSave", entryError);
            return;
        }
    } catch (libError) {
        console.error("Failed to get library information", "std_triggers.js", "createEntryAfterSave", libError);
        return;
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
                console.error("Failed to process library-specific logic", "std_triggers.js", "createEntryAfterSave", processError);
            }

            // Update entry number information in ASISTANTO database safely
            try {
                utils.EntryNumber.updateEntryNumberInfo(en);
            } catch (numberError) {
                console.error("Failed to update entry number information", "std_triggers.js", "createEntryAfterSave", numberError);
            }

            // Update number sequence (legacy support) safely
            try {
                if (typeof app !== 'undefined' && app.activeLib) {
                    app.activeLib.lastNum = app.activeLib.nextNum;
                    app.activeLib.nextNum++;
                }
            } catch (sequenceError) {
                console.error("Failed to update number sequence", "std_triggers.js", "createEntryAfterSave", sequenceError);
            }

            // Update entry view state safely
            try {
                utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.PRINT);
            } catch (viewError) {
                console.error("Failed to update view state", "std_triggers.js", "createEntryAfterSave", viewError);
            }
        } catch (constantsError) {
            console.error("Failed to use std.Constants", "std_triggers.js", "createEntryAfterSave", constantsError);
        }
    }

    // Log success
    console.log("Entry after save processed successfully", "std_triggers.js", "createEntryAfterSave");

} catch (e) {
    // Use console.error for logging the error
    console.error("Error in createEntryAfterSave: " + e.toString(), "std_triggers.js", "createEntryAfterSave", e);

    // Show error dialog
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
        console.error("Failed to set debug view state", "std_triggers.js", "createEntryAfterSave", debugError);
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
