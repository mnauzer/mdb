// Standardized Actions for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Actions module that provides common actions for Memento Database
 * This module can be used directly in Memento Database scripts
 * without requiring the ASISTANTO Scripts table.
 * 
 * To use these actions:
 * 1. Copy this file to your Memento Database library's Scripts section
 * 2. In your library settings, go to the Actions tab
 * 3. Create a new action and select the corresponding function from this module
 *    For example, for generating a report, select "generateReport"
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Actions module
std.Actions = {
  /**
   * Generate a report from the current library
   * @param {Object} options - Options for the report
   * @returns {String} - The generated report HTML
   */
  generateReport: function(options) {
    try {
      // Default options
      options = options || {};
      options.title = options.title || "Report";
      options.subtitle = options.subtitle || "";
      options.includeDate = options.includeDate !== false;
      options.includeUser = options.includeUser !== false;
      options.includeLibrary = options.includeLibrary !== false;
      options.filter = options.filter || "";
      options.sortBy = options.sortBy || "";
      options.sortOrder = options.sortOrder || "asc";
      options.limit = options.limit || 0;
      options.template = options.template || "report";
      options.fields = options.fields || [];
      
      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;
      
      // Get entries
      var entries = [];
      if (options.filter) {
        entries = currentLib.find(options.filter);
      } else {
        entries = currentLib.entries();
      }
      
      // Sort entries
      if (options.sortBy) {
        entries.sort(function(a, b) {
          var aValue = a.field(options.sortBy);
          var bValue = b.field(options.sortBy);
          
          if (aValue === bValue) {
            return 0;
          }
          
          if (options.sortOrder.toLowerCase() === "desc") {
            return aValue > bValue ? -1 : 1;
          } else {
            return aValue < bValue ? -1 : 1;
          }
        });
      }
      
      // Limit entries
      if (options.limit > 0 && entries.length > options.limit) {
        entries = entries.slice(0, options.limit);
      }
      
      // Prepare data for the report
      var data = {
        title: options.title,
        subtitle: options.subtitle,
        date: options.includeDate ? new Date() : null,
        user: options.includeUser ? user() : null,
        library: options.includeLibrary ? libName : null,
        entries: []
      };
      
      // Get fields if not specified
      if (!options.fields || options.fields.length === 0) {
        options.fields = currentLib.fields();
      }
      
      // Convert entries to data objects
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var entryData = {};
        
        for (var j = 0; j < options.fields.length; j++) {
          var field = options.fields[j];
          entryData[field] = entry.field(field);
        }
        
        data.entries.push(entryData);
      }
      
      // Generate the report
      var html = "";
      
      // Try to load a template
      if (typeof std !== 'undefined' && std.HTML) {
        var template = std.HTML.loadTemplate(options.template);
        if (template) {
          html = std.HTML.renderTemplate(template, data);
        } else {
          // Generate a default report
          html = this._generateDefaultReport(data, options);
        }
      } else {
        // Generate a default report
        html = this._generateDefaultReport(data, options);
      }
      
      return html;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.generateReport", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in generateReport: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }
      
      return "";
    }
  },
  
  /**
   * Export data from the current library
   * @param {Object} options - Options for the export
   * @returns {String} - The exported data
   */
  exportData: function(options) {
    try {
      // Default options
      options = options || {};
      options.format = options.format || "csv";
      options.filter = options.filter || "";
      options.sortBy = options.sortBy || "";
      options.sortOrder = options.sortOrder || "asc";
      options.fields = options.fields || [];
      options.includeHeaders = options.includeHeaders !== false;
      options.delimiter = options.delimiter || ",";
      options.fileName = options.fileName || "export";
      
      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;
      
      // Get entries
      var entries = [];
      if (options.filter) {
        entries = currentLib.find(options.filter);
      } else {
        entries = currentLib.entries();
      }
      
      // Sort entries
      if (options.sortBy) {
        entries.sort(function(a, b) {
          var aValue = a.field(options.sortBy);
          var bValue = b.field(options.sortBy);
          
          if (aValue === bValue) {
            return 0;
          }
          
          if (options.sortOrder.toLowerCase() === "desc") {
            return aValue > bValue ? -1 : 1;
          } else {
            return aValue < bValue ? -1 : 1;
          }
        });
      }
      
      // Get fields if not specified
      if (!options.fields || options.fields.length === 0) {
        options.fields = currentLib.fields();
      }
      
      // Export data
      var result = "";
      
      switch (options.format.toLowerCase()) {
        case "csv":
          result = this._exportToCsv(entries, options.fields, options);
          break;
        case "json":
          result = this._exportToJson(entries, options.fields, options);
          break;
        case "xml":
          result = this._exportToXml(entries, options.fields, options);
          break;
        default:
          result = this._exportToCsv(entries, options.fields, options);
          break;
      }
      
      // Save the exported data to a file
      var exportFile = file(options.fileName + "." + options.format.toLowerCase());
      exportFile.writeText(result);
      
      // Show success message
      var successDialog = dialog();
      successDialog.title('Export')
                  .text('Data exported to ' + options.fileName + "." + options.format.toLowerCase())
                  .positiveButton('OK', function() {})
                  .show();
      
      return result;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.exportData", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in exportData: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }
      
      return "";
    }
  },
  
  /**
   * Import data into the current library
   * @param {Object} options - Options for the import
   * @returns {Number} - The number of imported entries
   */
  importData: function(options) {
    try {
      // Default options
      options = options || {};
      options.format = options.format || "csv";
      options.fileName = options.fileName || "import";
      options.delimiter = options.delimiter || ",";
      options.hasHeaders = options.hasHeaders !== false;
      options.fieldMapping = options.fieldMapping || {};
      options.updateExisting = options.updateExisting || false;
      options.identifyBy = options.identifyBy || "";
      
      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;
      
      // Load the import file
      var importFile = file(options.fileName + "." + options.format.toLowerCase());
      if (!importFile.exists()) {
        // Show error message
        var errorDialog = dialog();
        errorDialog.title('Import Error')
                  .text('Import file not found: ' + options.fileName + "." + options.format.toLowerCase())
                  .positiveButton('OK', function() {})
                  .show();
        
        return 0;
      }
      
      // Read the import file
      var importData = importFile.readText();
      
      // Parse the import data
      var data = [];
      
      switch (options.format.toLowerCase()) {
        case "csv":
          data = this._parseCsv(importData, options);
          break;
        case "json":
          data = this._parseJson(importData, options);
          break;
        case "xml":
          data = this._parseXml(importData, options);
          break;
        default:
          data = this._parseCsv(importData, options);
          break;
      }
      
      // Import the data
      var importCount = 0;
      
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var entry = null;
        
        // Check if the entry already exists
        if (options.updateExisting && options.identifyBy) {
          var existingEntries = currentLib.find(options.identifyBy + " = '" + item[options.identifyBy] + "'");
          if (existingEntries.length > 0) {
            entry = existingEntries[0];
          }
        }
        
        // Create a new entry if it doesn't exist
        if (!entry) {
          entry = currentLib.create();
          importCount++;
        }
        
        // Set the fields
        for (var field in item) {
          if (item.hasOwnProperty(field)) {
            var targetField = options.fieldMapping[field] || field;
            entry.set(targetField, item[field]);
          }
        }
        
        // Save the entry
        entry.save();
      }
      
      // Show success message
      var successDialog = dialog();
      successDialog.title('Import')
                  .text('Imported ' + importCount + ' entries')
                  .positiveButton('OK', function() {})
                  .show();
      
      return importCount;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.importData", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in importData: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }
      
      return 0;
    }
  },
  
  /**
   * Perform a bulk operation on entries in the current library
   * @param {Object} options - Options for the bulk operation
   * @returns {Number} - The number of affected entries
   */
  bulkOperation: function(options) {
    try {
      // Default options
      options = options || {};
      options.filter = options.filter || "";
      options.operation = options.operation || "update";
      options.fields = options.fields || {};
      
      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;
      
      // Get entries
      var entries = [];
      if (options.filter) {
        entries = currentLib.find(options.filter);
      } else {
        entries = currentLib.entries();
      }
      
      // Confirm the operation
      var confirmDialog = dialog();
      confirmDialog.title('Bulk Operation')
                  .text('Are you sure you want to ' + options.operation + ' ' + entries.length + ' entries?')
                  .negativeButton('Cancel', function() { cancel(); })
                  .positiveButton('OK', function() {})
                  .show();
      
      // Perform the operation
      var affectedCount = 0;
      
      switch (options.operation.toLowerCase()) {
        case "update":
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            
            for (var field in options.fields) {
              if (options.fields.hasOwnProperty(field)) {
                entry.set(field, options.fields[field]);
              }
            }
            
            entry.save();
            affectedCount++;
          }
          break;
        case "delete":
          for (var j = 0; j < entries.length; j++) {
            entries[j].trash();
            affectedCount++;
          }
          break;
        default:
          // Show error message
          var operationErrorDialog = dialog();
          operationErrorDialog.title('Bulk Operation Error')
                            .text('Unknown operation: ' + options.operation)
                            .positiveButton('OK', function() {})
                            .show();
          
          return 0;
      }
      
      // Show success message
      var successDialog = dialog();
      successDialog.title('Bulk Operation')
                  .text('Affected ' + affectedCount + ' entries')
                  .positiveButton('OK', function() {})
                  .show();
      
      return affectedCount;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.bulkOperation", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in bulkOperation: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }
      
      return 0;
    }
  },
  
  /**
   * Generate a default report
   * @param {Object} data - The data for the report
   * @param {Object} options - Options for the report
   * @returns {String} - The generated HTML
   * @private
   */
  _generateDefaultReport: function(data, options) {
    try {
      var html = '<!DOCTYPE html>';
      html += '<html>';
      html += '<head>';
      html += '<meta charset="UTF-8">';
      html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
      html += '<title>' + data.title + '</title>';
      html += '<style>';
      html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
      html += 'h1 { color: #333; }';
      html += 'h2 { color: #666; }';
      html += '.info { margin-bottom: 20px; color: #888; }';
      html += 'table { border-collapse: collapse; width: 100%; }';
      html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
      html += 'th { background-color: #f2f2f2; }';
      html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
      html += '</style>';
      html += '</head>';
      html += '<body>';
      
      // Header
      html += '<h1>' + data.title + '</h1>';
      
      if (data.subtitle) {
        html += '<h2>' + data.subtitle + '</h2>';
      }
      
      // Info
      html += '<div class="info">';
      if (data.date) {
        html += 'Date: ' + data.date.toLocaleString() + '<br>';
      }
      if (data.user) {
        html += 'User: ' + data.user + '<br>';
      }
      if (data.library) {
        html += 'Library: ' + data.library + '<br>';
      }
      html += '</div>';
      
      // Table
      if (data.entries && data.entries.length > 0) {
        html += '<table>';
        
        // Headers
        html += '<tr>';
        for (var field in data.entries[0]) {
          if (data.entries[0].hasOwnProperty(field)) {
