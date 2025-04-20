// Standardized Main Module for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Main entry point for the standardized framework
 * Imports all modules and initializes the framework
 * 
 * To use this framework, include this file in your Memento Database library
 * and it will automatically load all the standardized modules.
 * 
 * Example:
 * 1. Open your library in Memento Database
 * 2. Go to Settings > Scripts
 * 3. Add a new script with the content of this file
 * 4. Save and the framework will be loaded
 */

// Framework version
var STD_VERSION = '1.0.0';

// Framework modules to load
var STD_MODULES = [
  'std_errorHandler.js',
  'std_libraryCache.js',
  'std_constants.js',
  'std_utils.js',
  'std_core.js',
  'std_dataAccess.js',
  'std_attendance.js',
  'std_triggers.js'
];

/**
 * Load a script file
 * @param {String} filename - Name of the script file to load
 * @returns {Boolean} - True if successful
 */
function loadScript(filename) {
  try {
    var script = libByName('ASISTANTO Scripts').find(filename);
    if (script.length === 0) {
      message('Script not found: ' + filename);
      return false;
    }
    
    var scriptContent = script[0].field('Script');
    if (!scriptContent) {
      message('Script is empty: ' + filename);
      return false;
    }
    
    // Execute the script
    eval(scriptContent);
    return true;
  } catch (e) {
    message('Error loading script ' + filename + ': ' + e.toString());
    return false;
  }
}

/**
 * Initialize the standardized framework
 */
function initStandardizedFramework() {
  message('Initializing Standardized Framework v' + STD_VERSION);
  
  var loadedModules = 0;
  
  // Load all modules
  for (var i = 0; i < STD_MODULES.length; i++) {
    if (loadScript(STD_MODULES[i])) {
      loadedModules++;
    }
  }
  
  message('Loaded ' + loadedModules + ' of ' + STD_MODULES.length + ' modules');
  
  // Initialize the core module
  if (typeof std_Core !== 'undefined') {
    std_Core.init({
      debug: false,
      logLevel: 'error'
    });
    
    message('Standardized Framework initialized successfully');
  } else {
    message('Failed to initialize Standardized Framework: Core module not loaded');
  }
}

// Initialize the framework
initStandardizedFramework();

/**
 * Get information about the standardized framework
 * @returns {Object} - Framework information
 */
function getFrameworkInfo() {
  var info = {
    version: STD_VERSION,
    modules: []
  };
  
  // Check which modules are loaded
  for (var i = 0; i < STD_MODULES.length; i++) {
    var moduleName = STD_MODULES[i].replace('.js', '');
    var isLoaded = typeof window[moduleName] !== 'undefined';
    
    info.modules.push({
      name: moduleName,
      loaded: isLoaded
    });
  }
  
  // Add core version if available
  if (typeof std_Core !== 'undefined' && std_Core.VERSION) {
    info.coreVersion = std_Core.VERSION.toString();
  }
  
  return info;
}

/**
 * Display information about the standardized framework
 */
function showFrameworkInfo() {
  var info = getFrameworkInfo();
  var message = 'Standardized Framework v' + info.version + '\n';
  
  if (info.coreVersion) {
    message += 'Core v' + info.coreVersion + '\n';
  }
  
  message += '\nLoaded Modules:\n';
  
  for (var i = 0; i < info.modules.length; i++) {
    var module = info.modules[i];
    message += '- ' + module.name + ': ' + (module.loaded ? 'Loaded' : 'Not Loaded') + '\n';
  }
  
  dialog()
    .title('Framework Information')
    .text(message)
    .positiveButton('OK', function() {})
    .show();
}

// Make functions available globally
this.loadScript = loadScript;
this.initStandardizedFramework = initStandardizedFramework;
this.getFrameworkInfo = getFrameworkInfo;
this.showFrameworkInfo = showFrameworkInfo;
