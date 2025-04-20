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
    std.Core.init();
    }

    // Get the current library
    var currentLib = lib();
    var libName = currentLib.title;

    // Update app state
    if (typeof app !== 'undefined' && app.activeLib) {
    app.activeLib.name = libName;
    app.activeLib.lib = currentLib;
    app.activeLib.entries = currentLib.entries();
    }

    // Show welcome message
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

    // Log the event
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.logInfo("Triggers", "libOpen", "Library opened: " + libName);
    }
} catch (e) {
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.createSystemError(e, "std.Triggers.libOpen", true);
    } else {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
                .text('Error in libOpen: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
    }
}
},

/**
 * Library open before show trigger
 * Called before a library is shown
 */
libOpenBeforeShow: function() {
try {
    // Get the current library
    var currentLib = lib();
    var libName = currentLib.title;

    // Show dialog
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
} catch (e) {
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.createSystemError(e, "std.Triggers.libOpenBeforeShow", true);
    } else {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
                .text('Error in libOpenBeforeShow: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
    }
}
},

/**
 * Create entry open trigger
 * Called when a new entry is being created
 */
createEntryOpen: function() {
try {
    // Get the current library
    var currentLib = lib();
    var libName = currentLib.title;

    // Get the default entry
    var en = entryDefault();

    // Set basic fields
    if (typeof std !== 'undefined' && std.Constants) {
    var constants = std.Constants;
    var utils = std.Utils;

    // Set view state
    utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.EDIT);

    // Set date
    utils.Field.setValue(en, constants.FIELDS.COMMON.DATE, new Date());

    // Generate entry number
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

    // Get current season from ASISTANTO database
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

    // Set creation metadata
    utils.Field.setValue(en, constants.FIELDS.COMMON.CREATED_BY, user());
    utils.Field.setValue(en, constants.FIELDS.COMMON.CREATED_DATE, new Date());

    // Set library-specific defaults
    if (libName === constants.LIBRARIES.RECORDS.ATTENDANCE) {
        utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.ARRIVAL, constants.DEFAULTS.ATTENDANCE.ARRIVAL);
        utils.Field.setValue(en, constants.FIELDS.ATTENDANCE.DEPARTURE, constants.DEFAULTS.ATTENDANCE.DEPARTURE);
    } else if (libName === constants.LIBRARIES.RECORDS.WORK_RECORDS) {
        utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.START_TIME, constants.DEFAULTS.WORK_RECORDS.START_TIME);
        utils.Field.setValue(en, constants.FIELDS.WORK_RECORD.END_TIME, constants.DEFAULTS.WORK_RECORDS.END_TIME);
    } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
        utils.Field.setValue(en, constants.FIELDS.PRICE_QUOTE.VALIDITY_PERIOD, constants.DEFAULTS.PRICE_QUOTES.VALIDITY_PERIOD);
    }
    } else {
    // Fallback if constants are not available
    en.set('view', 'Editácia');
    en.set('Dátum', new Date());
    en.set('zapísal', user());
    en.set('dátum zápisu', new Date());
    }

    // Show message
    if (typeof app !== 'undefined' && app.activeLib) {
    // Use dialog instead of message
    var infoDialog = dialog();
    infoDialog.title('Informácia')
                .text('Knižnica: ' + libName + ' /' + (app.data ? app.data.version : '') + '/ ' +
                    (utils && utils.Field ? utils.Field.getValue(en, constants.FIELDS.COMMON.SEASON) || '' : '') + ' / ' +
                    (utils && utils.Field ? utils.Field.getValue(en, constants.FIELDS.COMMON.NUMBER) || '' : ''))
                .positiveButton('OK', function() {})
                .show();
    }
} catch (e) {
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.createSystemError(e, "std.Triggers.createEntryOpen", true);
    } else {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
                .text('Error in createEntryOpen: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
    }
}
},

/**
 * Create entry after save trigger
 * Called after a new entry is saved
 */
createEntryAfterSave: function() {
try {
    // Get the current library
    var currentLib = lib();
    var libName = currentLib.title;
    var en = currentLib.lastEntry();

    // Process library-specific logic
    if (typeof std !== 'undefined' && std.Constants) {
    var constants = std.Constants;
    var utils = std.Utils;

    if (libName === constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std !== 'undefined' && std.Attendance) {
        std.Attendance.processAttendanceRecord(en, false);
    } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
        // Process price quote logic
        // This would be implemented in a std.PriceQuotes module
    } else if (libName === constants.LIBRARIES.PROJECTS.PRICE_QUOTE_PARTS) {
        // Process price quote parts logic
        // This would be implemented in a std.PriceQuotes module
    }

    // Update entry number information in ASISTANTO database
    utils.EntryNumber.updateEntryNumberInfo(en);

    // Update number sequence (legacy support)
    if (typeof app !== 'undefined' && app.activeLib) {
        app.activeLib.lastNum = app.activeLib.nextNum;
        app.activeLib.nextNum++;
    }

    // Update entry view state
    utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.PRINT);
    }
} catch (e) {
    if (typeof std !== 'undefined' && std.ErrorHandler) {
    std.ErrorHandler.createSystemError(e, "std.Triggers.createEntryAfterSave", true);
    } else {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
                .text('Error in createEntryAfterSave: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
    }

    // Set debug view state on error
    if (typeof std !== 'undefined' && std.Constants) {
    var en = lib().lastEntry();
    std.Utils.Field.setValue(en, std.Constants.FIELDS.COMMON.VIEW, std.Constants.VIEW_STATES.DEBUG);
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
