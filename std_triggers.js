// Standardized Triggers Module for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Triggers module that handles all Memento Database triggers
 * This is the main entry point for the application when events occur in Memento
 */
var std_Triggers = {
  /**
   * Library open trigger
   * Called when a library is opened
   */
  libOpen: function() {
    try {
      // Initialize the core module if not already initialized
      if (typeof std_Core !== 'undefined' && !std_Core._initialized) {
        std_Core.init();
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
        message(app.data.name + ' v.' + app.data.version + '\n' + libName + ' ' + (app.season || ''));
      } else {
        message('Welcome to ' + libName);
      }
      
      // Log the event
      if (typeof std_Core !== 'undefined') {
        std_Core.log('Library opened: ' + libName, 'info');
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.libOpen', true);
      } else {
        message('Error in libOpen: ' + e.toString());
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
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.libOpenBeforeShow', true);
      } else {
        message('Error in libOpenBeforeShow: ' + e.toString());
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
      if (typeof std_Constants !== 'undefined') {
        // Set view state
        std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.VIEW, std_Constants.VIEW_STATES.EDIT);
        
        // Set date
        std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.DATE, new Date());
        
        // Set number if available
        if (typeof app !== 'undefined' && app.activeLib && app.activeLib.number) {
          std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.NUMBER, app.activeLib.number);
          std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.NUMBER_ENTRY, app.activeLib.nextNum);
        }
        
        // Set season if available
        if (typeof app !== 'undefined' && app.season) {
          std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.SEASON, app.season);
        }
        
        // Set creation metadata
        std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.CREATED_BY, user());
        std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.CREATED_DATE, new Date());
        
        // Set library-specific defaults
        if (libName === std_Constants.LIBRARIES.RECORDS.ATTENDANCE) {
          std_Utils.Field.setValue(en, std_Constants.FIELDS.ATTENDANCE.ARRIVAL, std_Constants.DEFAULTS.ATTENDANCE.ARRIVAL);
          std_Utils.Field.setValue(en, std_Constants.FIELDS.ATTENDANCE.DEPARTURE, std_Constants.DEFAULTS.ATTENDANCE.DEPARTURE);
        } else if (libName === std_Constants.LIBRARIES.RECORDS.WORK_RECORDS) {
          std_Utils.Field.setValue(en, std_Constants.FIELDS.WORK_RECORD.START_TIME, std_Constants.DEFAULTS.WORK_RECORDS.START_TIME);
          std_Utils.Field.setValue(en, std_Constants.FIELDS.WORK_RECORD.END_TIME, std_Constants.DEFAULTS.WORK_RECORDS.END_TIME);
        } else if (libName === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
          std_Utils.Field.setValue(en, std_Constants.FIELDS.PRICE_QUOTE.VALIDITY_PERIOD, std_Constants.DEFAULTS.PRICE_QUOTES.VALIDITY_PERIOD);
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
        message('Knižnica: ' + libName + ' /' + (app.data ? app.data.version : '') + '/ ' + 
                (app.season || '') + ' / ' + (app.activeLib.nextNum || ''));
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.createEntryOpen', true);
      } else {
        message('Error in createEntryOpen: ' + e.toString());
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
      if (typeof std_Constants !== 'undefined') {
        if (libName === std_Constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std_Attendance !== 'undefined') {
          std_Attendance.processAttendanceRecord(en, false);
        } else if (libName === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
          // Process price quote logic
          // This would be implemented in a std_PriceQuotes module
        } else if (libName === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTE_PARTS) {
          // Process price quote parts logic
          // This would be implemented in a std_PriceQuotes module
        }
        
        // Update number sequence
        if (typeof app !== 'undefined' && app.activeLib) {
          app.activeLib.lastNum = app.activeLib.nextNum;
          app.activeLib.nextNum++;
          
          // Update entry view state
          std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.VIEW, std_Constants.VIEW_STATES.PRINT);
        }
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.createEntryAfterSave', true);
      } else {
        message('Error in createEntryAfterSave: ' + e.toString());
      }
      
      // Set debug view state on error
      if (typeof std_Constants !== 'undefined') {
        var en = lib().lastEntry();
        std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.VIEW, std_Constants.VIEW_STATES.DEBUG);
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
      if (typeof std_Constants !== 'undefined') {
        if (libName === std_Constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std_Attendance !== 'undefined') {
          std_Attendance.processAttendanceRecord(en, true);
        } else if (libName === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
          // Process price quote logic
          // This would be implemented in a std_PriceQuotes module
        } else if (libName === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTE_PARTS) {
          // Process price quote parts logic
          // This would be implemented in a std_PriceQuotes module
        }
        
        // Set modification metadata
        std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.MODIFIED_BY, user());
        std_Utils.Field.setValue(en, std_Constants.FIELDS.COMMON.MODIFIED_DATE, new Date());
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.entryBeforeSave', true);
      } else {
        message('Error in entryBeforeSave: ' + e.toString());
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
      if (typeof std_Constants !== 'undefined') {
        if (libName === std_Constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std_Attendance !== 'undefined') {
          // Additional processing after save if needed
        } else if (libName === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
          // Additional processing after save if needed
        }
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.entryAfterSave', true);
      } else {
        message('Error in entryAfterSave: ' + e.toString());
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
      if (typeof std_Constants !== 'undefined') {
        if (libName === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTE_PARTS && mEn.length > 0) {
          // Copy fields from master entry to linked entry
          if (mEn[0].lib().title === std_Constants.LIBRARIES.PROJECTS.PRICE_QUOTES) {
            std_Utils.Field.setValue(enD, std_Constants.FIELDS.PRICE_QUOTE.QUOTE_TYPE, 
                                    std_Utils.Field.getValue(mEn[0], std_Constants.FIELDS.PRICE_QUOTE.QUOTE_TYPE));
            
            std_Utils.Field.setValue(enD, std_Constants.FIELDS.PRICE_QUOTE.RATE_DISCOUNT, 
                                    std_Utils.Field.getValue(mEn[0], std_Constants.FIELDS.PRICE_QUOTE.RATE_DISCOUNT));
            
            std_Utils.Field.setValue(enD, std_Constants.FIELDS.PRICE_QUOTE.TRANSPORT_BILLING, 
                                    std_Utils.Field.getValue(mEn[0], std_Constants.FIELDS.PRICE_QUOTE.TRANSPORT_BILLING));
          }
        }
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.linkEntryBeforeSave', true);
      } else {
        message('Error in linkEntryBeforeSave: ' + e.toString());
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
      if (typeof std_Constants !== 'undefined') {
        if (libName === std_Constants.LIBRARIES.RECORDS.ATTENDANCE && typeof std_Attendance !== 'undefined') {
          // Additional processing when opening an attendance entry
        }
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_Triggers.entryOpen', true);
      } else {
        message('Error in entryOpen: ' + e.toString());
      }
    }
  }
};

// Make triggers available globally
this.libOpen = std_Triggers.libOpen;
this.libOpenBeforeShow = std_Triggers.libOpenBeforeShow;
this.createEntryOpen = std_Triggers.createEntryOpen;
this.createEntryAfterSave = std_Triggers.createEntryAfterSave;
this.entryBeforeSave = std_Triggers.entryBeforeSave;
this.entryAfterSave = std_Triggers.entryAfterSave;
this.linkEntryBeforeSave = std_Triggers.linkEntryBeforeSave;
this.entryOpen = std_Triggers.entryOpen;
