// Standardized App Module for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_
// Refactored implementation of app_v2_1.js

/**
 * Main application module that implements the core functionality
 * of the original app_v2_1.js using the standardized framework
 */
var std_App = {
  /**
   * Initialize the application
   * @param {Object} options - Initialization options
   * @returns {Boolean} - True if initialization was successful
   */
  init: function(options) {
    try {
      options = options || {};
      
      // Initialize app state
      this.initAppState(options);
      
      // Initialize tenant data
      this.loadTenantData();
      
      // Initialize season data
      this.loadSeasonData();
      
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.init', true);
      } else {
        message('Error initializing app: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Initialize application state
   * @param {Object} options - Initialization options
   */
  initAppState: function(options) {
    try {
      // Make sure app object exists
      if (typeof app === 'undefined') {
        window.app = {};
      }
      
      // Initialize app.data if it doesn't exist
      if (!app.data) {
        app.data = {
          name: std_Constants.APP.NAME,
          version: std_Constants.APP.VERSION,
          app: std_Constants.APP.APP,
          db: std_Constants.APP.DB,
          errors: std_Constants.APP.ERRORS,
          tenants: std_Constants.APP.TENANTS,
          scripts: std_Constants.APP.SCRIPTS,
          todo: std_Constants.APP.TODO,
          tenant: options.tenant || std_Constants.APP.TENANT
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
      
      app.msg = null;
      app.runningScript = null;
      app.libFile = 'std_app.js';
      app.log = options.log !== undefined ? options.log : false;
      app.debug = options.debug !== undefined ? options.debug : false;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.initAppState', true);
      } else {
        message('Error initializing app state: ' + e.toString());
      }
    }
  },
  
  /**
   * Load tenant data
   */
  loadTenantData: function() {
    try {
      if (!app.data || !app.data.tenant || !app.data.tenants) {
        return;
      }
      
      var tenantLib = std_LibraryCache.get(app.data.tenants);
      if (!tenantLib) {
        return;
      }
      
      var tenants = tenantLib.find(app.data.tenant);
      if (!tenants || tenants.length === 0) {
        return;
      }
      
      var tenant = tenants[0];
      
      // Load tenant data
      app.tenant.name = tenant.field('name') || app.data.tenant;
      app.tenant.street = tenant.field('street');
      app.tenant.city = tenant.field('city');
      app.tenant.psc = tenant.field('psc');
      app.tenant.ico = tenant.field('ico');
      app.tenant.dic = tenant.field('dic');
      app.tenant.platca_dph = tenant.field('platca_dph');
      
      // Load app settings
      app.log = tenant.field('log') || false;
      app.debug = tenant.field('debug') || false;
      app.season = tenant.field('default season');
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_App.loadTenantData', true);
      } else {
        message('Error loading tenant data: ' + e.toString());
      }
    }
  },
  
  /**
   * Load season data
   */
  loadSeasonData: function() {
    try {
      if (!app.data || !app.data.app || !app.season) {
        return;
      }
      
      var appLib = std_LibraryCache.get(app.data.app);
      if (!appLib) {
        return;
      }
      
      var seasons = appLib.find(app.season);
      if (!seasons || seasons.length === 0) {
        return;
      }
      
      var season = seasons[0];
      
      // Load VAT rates
      app.dph.zakladna = season.field('Základná sadzba DPH');
      app.dph.znizena = season.field('Znížená sadzba DPH');
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_App.loadSeasonData', true);
      } else {
        message('Error loading season data: ' + e.toString());
      }
    }
  },
  
  /**
   * Open a library
   * @param {String} libName - Library name
   * @returns {Boolean} - True if successful
   */
  openLibrary: function(libName) {
    try {
      // Store current library state if a new library is being opened
      if (libName && app.activeLib && app.activeLib.name && app.activeLib.name !== libName) {
        this.storeLibraryState();
      }
      
      // Get the library
      var library = libName ? std_LibraryCache.get(libName) : lib();
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + libName, 'std_App.openLibrary', true);
        } else {
          message('Library not found: ' + libName);
        }
        return false;
      }
      
      // Update app state
      app.activeLib.name = libName || library.title;
      app.activeLib.lib = library;
      app.activeLib.entries = library.entries();
      app.activeLib.en = entry();
      
      // Load season data
      this.loadSeasonData();
      
      // Load library metadata
      this.loadLibraryMetadata();
      
      // Store updated state
      this.storeLibraryState();
      
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_App.openLibrary', true);
      } else {
        message('Error opening library: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Load library metadata
   */
  loadLibraryMetadata: function() {
    try {
      if (!app.data || !app.data.app || !app.season || !app.activeLib || !app.activeLib.name) {
        return;
      }
      
      var appLib = std_LibraryCache.get(app.data.app);
      if (!appLib) {
        return;
      }
      
      var seasons = appLib.find(app.season);
      if (!seasons || seasons.length === 0) {
        return;
      }
      
      var season = seasons[0];
      var databases = season.field('Databázy');
      
      if (!databases || databases.length === 0) {
        return;
      }
      
      // Find the database entry for the current library
      var dbEntries = databases.filter(function(en) {
        return en.field('Názov') === app.activeLib.name;
      });
      
      if (dbEntries.length === 0) {
        if (app.log) {
          message('...nie je vytvorený záznam pre knižnicu ' + app.activeLib.name + ' v sezóne  ' + app.season);
        }
        return;
      }
      
      var dbEntry = dbEntries[0];
      
      // Load database metadata
      app.activeLib.db = dbEntry;
      app.activeLib.ID = dbEntry.field('ID');
      app.activeLib.prefix = dbEntry.field('Prefix');
      
      // Load entry attributes
      app.activeLib.lastNum = dbEntry.attr('posledné číslo');
      app.activeLib.nextNum = dbEntry.attr('nasledujúce číslo');
      app.activeLib.reservedNum = dbEntry.attr('rezervované číslo');
      app.activeLib.removedNums = dbEntry.attr('vymazané čísla') || [];
      app.activeLib.isPrefix = dbEntry.attr('prefix');
      app.activeLib.trim = dbEntry.attr('trim');
      app.activeLib.trailingDigit = dbEntry.attr('trailing digit');
      
      // Generate number
      app.activeLib.number = this.generateNumber();
      
      if (app.log) {
        message('...openLib: ' + season.name + ' - ' + dbEntry.title);
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_App.loadLibraryMetadata', true);
      } else {
        message('Error loading library metadata: ' + e.toString());
      }
    }
  },
  
  /**
   * Store library state
   */
  storeLibraryState: function() {
    try {
      if (!app.data || !app.data.tenants || !app.data.tenant) {
        return;
      }
      
      // Store to ASISTANTO Tenants
      var tenantLib = std_LibraryCache.get(app.data.tenants);
      if (!tenantLib) {
        return;
      }
      
      var tenants = tenantLib.find(app.data.tenant);
      if (!tenants || tenants.length === 0) {
        return;
      }
      
      var tenant = tenants[0];
      
      // Store app data
      tenant.set('data.name', app.data.name);
      tenant.set('data.version', app.data.version);
      tenant.set('data.app', app.data.app);
      tenant.set('data.db', app.data.db);
      tenant.set('data.errors', app.data.errors);
      tenant.set('data.tenants', app.data.tenants);
      tenant.set('data.scripts', app.data.scripts);
      tenant.set('data.todo', app.data.todo);
      tenant.set('data.tenant', app.data.tenant);
      
      // Store app state
      tenant.set('msg', app.msg);
      tenant.set('runningScript', app.runningScript);
      tenant.set('libFile', app.libFile);
      tenant.set('season', app.season);
      tenant.set('log', app.log);
      tenant.set('debug', app.debug);
      
      // Store active library state
      tenant.set('activeLib.name', app.activeLib.name);
      tenant.set('activeLib.db.id', app.activeLib.db ? app.activeLib.db.id : null);
      tenant.set('activeLib.prefix', app.activeLib.prefix);
      tenant.set('activeLib.lastNum', app.activeLib.lastNum);
      tenant.set('activeLib.nextNum', app.activeLib.nextNum);
      tenant.set('activeLib.reservedNum', app.activeLib.reservedNum);
      tenant.set('activeLib.removedNums', app.activeLib.removedNums);
      tenant.set('activeLib.isPrefix', app.activeLib.isPrefix);
      tenant.set('activeLib.trailingDigit', app.activeLib.trailingDigit);
      tenant.set('activeLib.trim', app.activeLib.trim);
      tenant.set('activeLib.number', app.activeLib.number);
      
      // Store VAT rates
      tenant.set('dph.zakladna', app.dph.zakladna);
      tenant.set('dph.znizena', app.dph.znizena);
      
      // Store current entry
      tenant.set('en.id', app.activeLib.en ? app.activeLib.en.id : null);
      
      // Store to database entry
      if (app.activeLib.db) {
        app.activeLib.db.setAttr('názov', app.activeLib.name);
        app.activeLib.db.setAttr('posledné číslo', app.activeLib.lastNum);
        app.activeLib.db.setAttr('nasledujúce číslo', app.activeLib.nextNum);
        app.activeLib.db.setAttr('rezervované číslo', app.activeLib.reservedNum);
        app.activeLib.db.setAttr('vymazané čísla', app.activeLib.removedNums);
        app.activeLib.db.setAttr('vygenerované číslo', app.activeLib.number);
      }
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_App.storeLibraryState', true);
      } else {
        message('Error storing library state: ' + e.toString());
      }
    }
  },
  
  /**
   * Generate a new number for the current library
   * @returns {String} - Generated number
   */
  generateNumber: function() {
    try {
      if (!app.activeLib) {
        return null;
      }
      
      // Check for removed numbers
      if (app.activeLib.removedNums && app.activeLib.removedNums.length > 0) {
        if (app.log) {
          message('...removedNums: ' + app.activeLib.removedNums);
        }
        // TODO: Implement logic to use removed numbers
      }
      
      // Generate new number
      var newNumber;
      if (app.activeLib.isPrefix) {
        newNumber = app.activeLib.prefix + 
                   (app.season ? app.season.slice(app.activeLib.trim) : '') + 
                   std_Utils.String.padNumber(app.activeLib.nextNum, app.activeLib.trailingDigit);
      } else {
        newNumber = app.activeLib.ID + 
                   (app.season ? app.season.slice(app.activeLib.trim) : '') + 
                   std_Utils.String.padNumber(app.activeLib.nextNum, app.activeLib.trailingDigit);
      }
      
      if (app.log) {
        message('Nové číslo: ' + newNumber + ' v knižnici ' + app.activeLib.name);
      }
      
      return newNumber;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.generateNumber', true);
      } else {
        message('Error generating number: ' + e.toString());
      }
      return null;
    }
  },
  
  /**
   * Increment the number sequence
   * @returns {Boolean} - True if successful
   */
  incrementNumber: function() {
    try {
      if (!app.activeLib || !app.activeLib.db) {
        return false;
      }
      
      var lastNum = app.activeLib.nextNum;
      var nextNum = Number(app.activeLib.nextNum) + 1;
      
      if (app.log) {
        message('setting number ' + lastNum + '/' + nextNum + ' v activeLib.' + app.activeLib.name);
      }
      
      app.activeLib.lastNum = lastNum;
      app.activeLib.nextNum = nextNum;
      
      // Update database entry
      app.activeLib.db.setAttr('posledné číslo', lastNum);
      app.activeLib.db.setAttr('nasledujúce číslo', nextNum);
      
      // Store updated state
      this.storeLibraryState();
      
      // Reload library metadata
      this.loadLibraryMetadata();
      
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.incrementNumber', true);
      } else {
        message('Error incrementing number: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Set the season
   * @param {String} season - Season to set
   * @returns {Boolean} - True if successful
   */
  setSeason: function(season) {
    try {
      if (!app.data || !app.data.tenants || !app.data.tenant) {
        return false;
      }
      
      var tenantLib = std_LibraryCache.get(app.data.tenants);
      if (!tenantLib) {
        return false;
      }
      
      var tenants = tenantLib.find(app.data.tenant);
      if (!tenants || tenants.length === 0) {
        return false;
      }
      
      var tenant = tenants[0];
      
      // Set season
      tenant.set('default season', season);
      app.season = season;
      
      // Reload library
      this.openLibrary();
      
      message('Nastavená sezóna: ' + app.season);
      
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.setSeason', true);
      } else {
        message('Error setting season: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Toggle logging
   * @returns {Boolean} - New log state
   */
  toggleLog: function() {
    try {
      if (!app.data || !app.data.tenants || !app.data.tenant) {
        return false;
      }
      
      var tenantLib = std_LibraryCache.get(app.data.tenants);
      if (!tenantLib) {
        return false;
      }
      
      var tenants = tenantLib.find(app.data.tenant);
      if (!tenants || tenants.length === 0) {
        return false;
      }
      
      var tenant = tenants[0];
      
      // Toggle log
      var isLog = tenant.field('log');
      isLog = !isLog;
      
      tenant.set('log', isLog);
      app.log = isLog;
      
      message(isLog ? 'log zapnutý' : 'log vypnutý');
      
      return isLog;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.toggleLog', true);
      } else {
        message('Error toggling log: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Toggle debug mode
   * @returns {Boolean} - New debug state
   */
  toggleDebug: function() {
    try {
      if (!app.data || !app.data.tenants || !app.data.tenant) {
        return false;
      }
      
      var tenantLib = std_LibraryCache.get(app.data.tenants);
      if (!tenantLib) {
        return false;
      }
      
      var tenants = tenantLib.find(app.data.tenant);
      if (!tenants || tenants.length === 0) {
        return false;
      }
      
      var tenant = tenants[0];
      
      // Toggle debug
      var isDebug = tenant.field('debug');
      isDebug = !isDebug;
      
      tenant.set('debug', isDebug);
      app.debug = isDebug;
      
      message(isDebug ? 'debug zapnutý' : 'debug vypnutý');
      
      return isDebug;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.toggleDebug', true);
      } else {
        message('Error toggling debug: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Toggle number prefix
   * @returns {Boolean} - New prefix state
   */
  toggleNumberPrefix: function() {
    try {
      if (!app.activeLib || !app.activeLib.db) {
        return false;
      }
      
      var current = app.activeLib.isPrefix;
      
      // Toggle prefix
      app.activeLib.db.setAttr('prefix', !current);
      app.activeLib.isPrefix = !current;
      
      // Reload library
      this.openLibrary();
      
      message(app.activeLib.isPrefix ? 'prefix čísla zapnutý' : 'prefix čísla vypnutý');
      
      return app.activeLib.isPrefix;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_App.toggleNumberPrefix', true);
      } else {
        message('Error toggling number prefix: ' + e.toString());
      }
      return false;
    }
  }
};

// Make available globally
this.std_App = std_App;

// Initialize the app
std_App.init();
