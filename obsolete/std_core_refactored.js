// Standardized Core Module for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Core module that serves as the main entry point for the standardized framework
 * Provides initialization, configuration, and access to other modules
 * 
 * This module can be used directly in Memento Database scripts
 * without requiring the ASISTANTO Scripts table.
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Core module
std.Core = {
  // Version information
  VERSION: {
    MAJOR: 1,
    MINOR: 0,
    PATCH: 0,
    toString: function() {
      return this.MAJOR + '.' + this.MINOR + '.' + this.PATCH;
    }
  },
  
  // Configuration
  config: {
    debug: false,
    logLevel: 'error', // 'error', 'warning', 'info', 'debug'
    cacheTTL: 300000, // 5 minutes in milliseconds
    defaultDateFormat: 'simple',
    defaultCurrency: '€',
    defaultDecimalPlaces: 2
  },
  
  // Initialization state
  _initialized: false,
  
  /**
   * Initialize the standardized framework
   * @param {Object} options - Configuration options
   * @returns {Boolean} - True if initialization was successful
   */
  init: function(options) {
    if (this._initialized) {
      return true;
    }
    
    try {
      // Apply configuration options
      if (options) {
        for (var key in options) {
          if (options.hasOwnProperty(key) && this.config.hasOwnProperty(key)) {
            this.config[key] = options[key];
          }
        }
      }
      
      // Initialize library cache if available
      if (typeof std !== 'undefined' && std.LibraryCache) {
        std.LibraryCache.setTTL(this.config.cacheTTL);
      }
      
      // Set up global app state
      this._initAppState();
      
      this._initialized = true;
      
      // Log initialization
      this.log('std.Core initialized successfully', 'info');
      
      return true;
    } catch (e) {
      // Use dialog instead of message for better user experience
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Failed to initialize std.Core: ' + e.toString())
              .positiveButton('OK', function() {})
              .show();
      return false;
    }
  },
  
  /**
   * Initialize the application state
   * @private
   */
  _initAppState: function() {
    // Make sure app object exists
if (typeof app === 'undefined') {
        window.app = {};
    }
    
    // Initialize app.data if it doesn't exist
    if (!app.data) {
      // Check if Constants module is available
    var constants = (typeof std !== 'undefined' && std.Constants) ? 
            std.Constants.APP : 
            {
            NAME: 'ASISTANTO',
            VERSION: '2.0.0',
            APP: 'ASISTANTO',
            DB: 'ASISTANTO DB',
            ERRORS: 'ASISTANTO Errors',
            TENANTS: 'ASISTANTO Tenants',
            SCRIPTS: 'ASISTANTO Scripts',
            TODO: 'ASISTANTO ToDo',
            TENANT: 'ASISTANTO'
                    };
    
    app.data = {
    name: constants.NAME,
    version: constants.VERSION,
    app: constants.APP,
    db: constants.DB,
    errors: constants.ERRORS,
    tenants: constants.TENANTS,
    scripts: constants.SCRIPTS,
    todo: constants.TODO,
    tenant: constants.TENANT
    };
    }
    
    // Initialize other app properties if they don't exist
    if (!app.activeLib) {
      app.activeLib = {
        name: null,
        db: null,
        ID: null,
        prefix: null,
        lastNum: null,
        nextNum: null,
        reservedNum: null,
        removedNums: [],
        isPrefix: null,
        trim: null,
        trailingDigit: null,
        number: null,
        lib: null,
        entries: null,
        en: null,
        enD: null
      };
    }
    
    if (!app.tenant) {
      app.tenant = {
        name: null,
        street: null,
        city: null,
        psc: null,
        ico: null,
        dic: null,
        platca_dph: null
      };
    }
    
    if (!app.dph) {
      app.dph = {
        zakladna: null,
        znizena: null
      };
    }
  },
  
  /**
   * Log a message with a specified level
   * @param {String} message - Message to log
   * @param {String} level - Log level ('error', 'warning', 'info', 'debug')
   */
  log: function(message, level) {
    level = level || 'info';
    
    // Check if we should log this level
    var logLevels = {
      'error': 0,
      'warning': 1,
      'info': 2,
      'debug': 3
    };
    
    if (logLevels[level] > logLevels[this.config.logLevel]) {
      return;
    }
    
    // Use ErrorHandler if available
    if (typeof std !== 'undefined' && std.ErrorHandler) {
      switch (level) {
        case 'error':
          std.ErrorHandler.createSystemError(message, 'std.Core.log', true);
          break;
        case 'warning':
          std.ErrorHandler.handle(message, 'std.Core.log', {
            severity: std.ErrorHandler.SEVERITY.WARNING,
            category: std.ErrorHandler.CATEGORY.SYSTEM,
            showToUser: this.config.debug
          });
          break;
        case 'info':
        case 'debug':
          std.ErrorHandler.handle(message, 'std.Core.log', {
            severity: level === 'info' ? std.ErrorHandler.SEVERITY.INFO : std.ErrorHandler.SEVERITY.DEBUG,
            category: std.ErrorHandler.CATEGORY.SYSTEM,
            showToUser: this.config.debug && level === 'info'
          });
          break;
      }
    } else {
      // Fallback to dialog
      if (level === 'error' || (this.config.debug && level !== 'debug')) {
        var myDialog = dialog();
        myDialog.title(level.toUpperCase())
                .text(message)
                .positiveButton('OK', function() {})
                .show();
      }
    }
  },
  
  /**
   * Get the current library
   * @returns {Object} - Current library
   */
  getCurrentLibrary: function() {
    return lib();
  },
  
  /**
   * Get the current entry
   * @returns {Object} - Current entry
   */
  getCurrentEntry: function() {
    return entry();
  },
  
  /**
   * Get the default entry
   * @returns {Object} - Default entry
   */
  getDefaultEntry: function() {
    return entryDefault();
  },
  
  /**
   * Get the current user
   * @returns {String} - Current user
   */
  getCurrentUser: function() {
    return user();
  },
  
  /**
   * Open a library by name
   * @param {String} libName - Library name
   * @returns {Boolean} - True if successful
   */
  openLibrary: function(libName) {
    try {
      lib(libName);
      return true;
    } catch (e) {
      this.log('Failed to open library: ' + libName + ' - ' + e.toString(), 'error');
      return false;
    }
  },
  
  /**
   * Create a new entry in the current library
   * @param {Object} data - Data for the new entry
   * @returns {Object} - Created entry or null if failed
   */
  createEntry: function(data) {
    try {
      var currentLib = this.getCurrentLibrary();
      return currentLib.create(data);
    } catch (e) {
      this.log('Failed to create entry: ' + e.toString(), 'error');
      return null;
    }
  },
  
  /**
   * Show a dialog to the user
   * @param {Object} options - Dialog options
   * @returns {Object} - Dialog object
   */
  showDialog: function(options) {
    options = options || {};
    
    try {
      var myDialog = dialog();
      
      if (options.title) {
        myDialog.title(options.title);
      }
      
      if (options.text) {
        myDialog.text(options.text);
      }
      
      if (options.positiveButton) {
        myDialog.positiveButton(
          options.positiveButton.text || 'OK',
          options.positiveButton.callback || function() {}
        );
      }
      
      if (options.negativeButton) {
        myDialog.negativeButton(
          options.negativeButton.text || 'Cancel',
          options.negativeButton.callback || function() { cancel(); }
        );
      }
      
      if (options.neutralButton) {
        myDialog.neutralButton(
          options.neutralButton.text || 'Neutral',
          options.neutralButton.callback || function() {}
        );
      }
      
      myDialog.autoDismiss(options.autoDismiss !== undefined ? options.autoDismiss : true);
      myDialog.show();
      
      return myDialog;
    } catch (e) {
      // Use dialog for error
      var errorDialog = dialog();
      errorDialog.title('Chyba')
                 .text('Failed to show dialog: ' + e.toString())
                 .positiveButton('OK', function() {})
                 .show();
      return null;
    }
  }
};

// Initialize the core module
std.Core.init();

// For backward compatibility
var std_Core = std.Core;
