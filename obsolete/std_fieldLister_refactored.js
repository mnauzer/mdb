// Standardized Field Lister for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Script to list all fields in a table and save the results to ASISTANTO DB
 * The record name will be the name of the table, and the field will be "Zoznam polí"
 * 
 * This module can be used directly in Memento Database scripts
 * without requiring the ASISTANTO Scripts table.
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Field Lister module
std.FieldLister = {
  /**
   * List all fields in a table
   * @param {String} tableName - Name of the table to list fields from
   * @returns {Array} - Array of field information objects
   */
  listFields: function(tableName) {
    try {
      if (!tableName) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createValidationError('Table name is required', null, 'std.FieldLister.listFields', true);
        } else {
          // Use dialog instead of message
          var myDialog = dialog();
          myDialog.title('Chyba')
                  .text('Error: Table name is required')
                  .positiveButton('OK', function() {})
                  .show();
        }
        return [];
      }
      
      // Get the library
      var library;
      if (typeof std !== 'undefined' && std.LibraryCache) {
        library = std.LibraryCache.get(tableName);
      } else {
        library = libByName(tableName);
      }
      
      if (!library) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createDatabaseError('Library not found: ' + tableName, 'std.FieldLister.listFields', true);
        } else {
          // Use dialog instead of message
          var myDialog = dialog();
          myDialog.title('Chyba')
                  .text('Error: Library not found: ' + tableName)
                  .positiveButton('OK', function() {})
                  .show();
        }
        return [];
      }
      
      // Get all entries to analyze fields
      var entries = library.entries();
      if (!entries || entries.length === 0) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Upozornenie')
                .text('Warning: No entries found in library: ' + tableName)
                .positiveButton('OK', function() {})
                .show();
        
        // Try to get fields from the library schema if available
        return this._getFieldsFromSchema(library);
      }
      
      // Get fields from the first entry
      var firstEntry = entries[0];
      var fields = [];
      
      // Get field names
      var fieldNames = firstEntry.fields();
      
      // Get field information for each field
      for (var i = 0; i < fieldNames.length; i++) {
        var fieldName = fieldNames[i];
        var fieldInfo = this._getFieldInfo(firstEntry, fieldName);
        fields.push(fieldInfo);
      }
      
      return fields;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createDatabaseError(e, 'std.FieldLister.listFields', true);
      } else {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error listing fields: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      }
      return [];
    }
  },
  
  /**
   * Get field information from schema if available
   * @param {Object} library - Library object
   * @returns {Array} - Array of field information objects
   * @private
   */
  _getFieldsFromSchema: function(library) {
    try {
      // This is a fallback method if no entries exist
      // It may not work in all versions of Memento
      var fields = [];
      
      // Try to access schema if available
      if (library.schema && typeof library.schema === 'function') {
        var schema = library.schema();
        if (schema && schema.fields) {
          for (var i = 0; i < schema.fields.length; i++) {
            var field = schema.fields[i];
            fields.push({
              name: field.name,
              type: field.type || 'Unknown',
              isSystem: false
            });
          }
        }
      }
      
      return fields;
    } catch (e) {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Upozornenie')
              .text('Warning: Could not get fields from schema: ' + e.toString())
              .positiveButton('OK', function() {})
              .show();
      return [];
    }
  },
  
  /**
   * Get information about a field
   * @param {Object} entry - Entry to get field information from
   * @param {String} fieldName - Name of the field
   * @returns {Object} - Field information object
   * @private
   */
  _getFieldInfo: function(entry, fieldName) {
    try {
      var value = entry.field(fieldName);
      var type = this._getFieldType(value);
      var isSystem = this._isSystemField(fieldName);
      
      return {
        name: fieldName,
        type: type,
        isSystem: isSystem
      };
    } catch (e) {
      return {
        name: fieldName,
        type: 'Unknown',
        isSystem: false
      };
    }
  },
  
  /**
   * Get the type of a field value
   * @param {*} value - Field value
   * @returns {String} - Field type
   * @private
   */
  _getFieldType: function(value) {
    if (value === null || value === undefined) {
      return 'Null';
    }
    
    if (value instanceof Date) {
      return 'Date';
    }
    
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0].lib === 'function') {
        return 'Link to Entry';
      }
      return 'Array';
    }
    
    return typeof value;
  },
  
  /**
   * Check if a field is a system field
   * @param {String} fieldName - Name of the field
   * @returns {Boolean} - True if the field is a system field
   * @private
   */
  _isSystemField: function(fieldName) {
    var systemFields = [
      'id', 'created', 'modified', 'createdBy', 'modifiedBy'
    ];
    
    return systemFields.indexOf(fieldName) !== -1;
  },
  
  /**
   * Format field list as text
   * @param {Array} fields - Array of field information objects
   * @returns {String} - Formatted field list
   */
  formatFieldList: function(fields) {
    if (!fields || fields.length === 0) {
      return 'No fields found';
    }
    
    var result = '';
    
    // Group fields by type
    var fieldsByType = {};
    
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      
      if (!fieldsByType[field.type]) {
        fieldsByType[field.type] = [];
      }
      
      fieldsByType[field.type].push(field);
    }
    
    // Format fields by type
    for (var type in fieldsByType) {
      if (fieldsByType.hasOwnProperty(type)) {
        result += '== ' + type + ' Fields ==\n';
        
        var typeFields = fieldsByType[type];
        for (var j = 0; j < typeFields.length; j++) {
          var typeField = typeFields[j];
          result += '- ' + typeField.name;
          
          if (typeField.isSystem) {
            result += ' (System)';
          }
          
          result += '\n';
        }
        
        result += '\n';
      }
    }
    
    return result;
  },
  
  /**
   * Save field list to ASISTANTO DB
   * @param {String} tableName - Name of the table
   * @param {String} fieldList - Formatted field list
   * @returns {Boolean} - True if successful
   */
  saveFieldList: function(tableName, fieldList) {
    try {
      if (!tableName || !fieldList) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createValidationError('Table name and field list are required', null, 'std.FieldLister.saveFieldList', true);
        } else {
          // Use dialog instead of message
          var myDialog = dialog();
          myDialog.title('Chyba')
                  .text('Error: Table name and field list are required')
                  .positiveButton('OK', function() {})
                  .show();
        }
        return false;
      }
      
      // Get the ASISTANTO DB library
      var dbLibrary;
      if (typeof std !== 'undefined' && std.LibraryCache) {
        dbLibrary = std.LibraryCache.get('ASISTANTO DB');
      } else {
        dbLibrary = libByName('ASISTANTO DB');
      }
      
      if (!dbLibrary) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createDatabaseError('ASISTANTO DB library not found', 'std.FieldLister.saveFieldList', true);
        } else {
          // Use dialog instead of message
          var myDialog = dialog();
          myDialog.title('Chyba')
                  .text('Error: ASISTANTO DB library not found')
                  .positiveButton('OK', function() {})
                  .show();
        }
        return false;
      }
      
      // Check if an entry already exists for this table
      var existingEntries = dbLibrary.find(tableName);
      var entry;
      
      if (existingEntries && existingEntries.length > 0) {
        // Update existing entry
        entry = existingEntries[0];
        entry.set('Zoznam polí', fieldList);
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Informácia')
                .text('Updated field list for table: ' + tableName)
                .positiveButton('OK', function() {})
                .show();
      } else {
        // Create new entry
        var newEntry = {
          name: tableName,
          'Zoznam polí': fieldList,
          'Dátum': new Date()
        };
        
        if (typeof std !== 'undefined' && std.DataAccess) {
          entry = std.DataAccess.create('ASISTANTO DB', newEntry);
        } else {
          entry = dbLibrary.create(newEntry);
        }
        
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Informácia')
                .text('Created field list for table: ' + tableName)
                .positiveButton('OK', function() {})
                .show();
      }
      
      return true;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createDatabaseError(e, 'std.FieldLister.saveFieldList', true);
      } else {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error saving field list: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      }
      return false;
    }
  },
  
  /**
   * Process a table to list fields and save the results
   * @param {String} tableName - Name of the table to process
   * @returns {Boolean} - True if successful
   */
  processTable: function(tableName) {
    try {
      if (!tableName) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.createValidationError('Table name is required', null, 'std.FieldLister.processTable', true);
        } else {
          // Use dialog instead of message
          var myDialog = dialog();
          myDialog.title('Chyba')
                  .text('Error: Table name is required')
                  .positiveButton('OK', function() {})
                  .show();
        }
        return false;
      }
      
      // Use dialog instead of message
      var processDialog = dialog();
      processDialog.title('Informácia')
                   .text('Processing table: ' + tableName)
                   .positiveButton('OK', function() {})
                   .show();
      
      // List fields
      var fields = this.listFields(tableName);
      
      // Format field list
      var fieldList = this.formatFieldList(fields);
      
      // Save field list
      var success = this.saveFieldList(tableName, fieldList);
      
      if (success) {
        // Use dialog instead of message
        var successDialog = dialog();
        successDialog.title('Informácia')
                     .text('Successfully processed table: ' + tableName)
                     .positiveButton('OK', function() {})
                     .show();
      }
      
      return success;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, 'std.FieldLister.processTable', true);
      } else {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error processing table: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      }
      return false;
    }
  },
  
  /**
   * Process all tables in the database
   * @returns {Object} - Results object with success and failure counts
   */
  processAllTables: function() {
    try {
      // Get the list of tables from ASISTANTO DB
      var asistantoDB;
      if (typeof std !== 'undefined' && std.LibraryCache) {
        asistantoDB = std.LibraryCache.get('ASISTANTO DB');
      } else {
        asistantoDB = libByName('ASISTANTO DB');
      }
      
      if (!asistantoDB) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('ASISTANTO DB library not found')
                .positiveButton('OK', function() {})
                .show();
        return { success: 0, failure: 0 };
      }
      
      // Get all entries from ASISTANTO DB
      var entries = asistantoDB.entries();
      
      if (!entries || entries.length === 0) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Upozornenie')
                .text('No tables found in ASISTANTO DB')
                .positiveButton('OK', function() {})
                .show();
        return { success: 0, failure: 0 };
      }
      
      var results = {
        success: 0,
        failure: 0
      };
      
      // Process each table
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var tableName = entry.name;
        
        // Skip ASISTANTO DB itself and system tables
        if (tableName === 'ASISTANTO DB' || 
            tableName.startsWith('System') || 
            tableName === 'Trash') {
          continue;
        }
        
        var success = this.processTable(tableName);
        
        if (success) {
          results.success++;
        } else {
          results.failure++;
        }
      }
      
      // Use dialog instead of message
      var resultsDialog = dialog();
      resultsDialog.title('Výsledky')
                   .text('Processed ' + (results.success + results.failure) + ' tables\n' +
                         'Success: ' + results.success + ', Failure: ' + results.failure)
                   .positiveButton('OK', function() {})
                   .show();
      
      return results;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, 'std.FieldLister.processAllTables', true);
      } else {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error processing all tables: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      }
      return { success: 0, failure: 0 };
    }
  },
  
  /**
   * Get tables from ASISTANTO
   * @returns {Array} - Array of table names
   */
  getTablesFromAsistanto: function() {
    try {
      // Get the ASISTANTO library
      var asistantoLib;
      if (typeof std !== 'undefined' && std.LibraryCache) {
        asistantoLib = std.LibraryCache.get('ASISTANTO');
      } else {
        asistantoLib = libByName('ASISTANTO');
      }
      
      if (!asistantoLib) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('ASISTANTO library not found')
                .positiveButton('OK', function() {})
                .show();
        return [];
      }
      
      // Get the current season
      var season = null;
      if (typeof app !== 'undefined' && app.season) {
        season = app.season;
      } else {
        // Try to get the season from ASISTANTO Tenants
        var tenantsLib;
        if (typeof std !== 'undefined' && std.LibraryCache) {
          tenantsLib = std.LibraryCache.get('ASISTANTO Tenants');
        } else {
          tenantsLib = libByName('ASISTANTO Tenants');
        }
        
        if (tenantsLib) {
          var tenants = tenantsLib.entries();
          if (tenants && tenants.length > 0) {
            season = tenants[0].field('default season');
          }
        }
      }
      
      if (!season) {
        // Use dialog instead of message
        var warningDialog = dialog();
        warningDialog.title('Upozornenie')
                     .text('Warning: Could not determine current season')
                     .positiveButton('OK', function() {})
                     .show();
        
        // Try to get the latest season
        var seasons = asistantoLib.entries();
        if (seasons && seasons.length > 0) {
          season = seasons[0].name;
        } else {
          // Use dialog instead of message
          var errorDialog = dialog();
          errorDialog.title('Chyba')
                     .text('Error: No seasons found in ASISTANTO')
                     .positiveButton('OK', function() {})
                     .show();
          return [];
        }
      }
      
      // Find the season entry
      var seasonEntries = asistantoLib.find(season);
      if (!seasonEntries || seasonEntries.length === 0) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error: Season not found: ' + season)
                .positiveButton('OK', function() {})
                .show();
        return [];
      }
      
      var seasonEntry = seasonEntries[0];
      
      // Get the databases linked to this season
      var databases = seasonEntry.field('Databázy');
      if (!databases || databases.length === 0) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Upozornenie')
                .text('No databases found for season: ' + season)
                .positiveButton('OK', function() {})
                .show();
        return [];
      }
      
      // Extract table names
      var tableNames = [];
      for (var i = 0; i < databases.length; i++) {
        var database = databases[i];
        var tableName = database.field('Názov');
        if (tableName) {
          tableNames.push(tableName);
        }
      }
      
      return tableNames;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createDatabaseError(e, 'std.FieldLister.getTablesFromAsistanto', true);
      } else {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error getting tables from ASISTANTO: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      }
      return [];
    }
  },
  
  /**
   * Process tables from ASISTANTO
   * @returns {Object} - Results object with success and failure counts
   */
  processTablesFromAsistanto: function() {
    try {
      // Get tables from ASISTANTO
      var tableNames = this.getTablesFromAsistanto();
      
      if (!tableNames || tableNames.length === 0) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Upozornenie')
                .text('No tables found in ASISTANTO')
                .positiveButton('OK', function() {})
                .show();
        return { success: 0, failure: 0 };
      }
      
      var results = {
        success: 0,
        failure: 0
      };
      
      // Process each table
      for (var i = 0; i < tableNames.length; i++) {
        var tableName = tableNames[i];
        
        // Skip system tables
        if (tableName === 'ASISTANTO DB' || 
            tableName === 'ASISTANTO' || 
            tableName === 'ASISTANTO Errors' || 
            tableName === 'ASISTANTO Tenants' || 
            tableName === 'ASISTANTO Scripts' || 
            tableName === 'ASISTANTO ToDo' || 
            tableName.startsWith('System') || 
            tableName === 'Trash') {
          continue;
        }
        
        var success = this.processTable(tableName);
        
        if (success) {
          results.success++;
        } else {
          results.failure++;
        }
      }
      
      // Use dialog instead of message
      var resultsDialog = dialog();
      resultsDialog.title('Výsledky')
                   .text('Processed ' + (results.success + results.failure) + ' tables\n' +
                         'Success: ' + results.success + ', Failure: ' + results.failure)
                   .positiveButton('OK', function() {})
                   .show();
      
      return results;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, 'std.FieldLister.processTablesFromAsistanto', true);
      } else {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error processing tables from ASISTANTO: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      }
      return { success: 0, failure: 0 };
    }
  },
  
  /**
   * Run the field lister
   * @param {String} tableName - Optional table name to process a specific table
   * @returns {Boolean} - True if successful
   */
  run: function(tableName) {
    try {
      if (tableName) {
        return this.processTable(tableName);
      } else {
        // Try to process tables from ASISTANTO first
        var asistantoResults = this.processTablesFromAsistanto();
        
        // If no tables were processed from ASISTANTO, try ASISTANTO DB
        if (asistantoResults.success === 0 && asistantoResults.failure === 0) {
          var dbResults = this.processAllTables();
          return dbResults.success > 0;
        }
        
        return asistantoResults.success > 0;
      }
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, 'std.FieldLister.run', true);
      } else {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error running field lister: ' + e.toString())
                .positiveButton('OK', function() {})
                .show();
      }
      return false;
    }
  }
};

// For backward compatibility
var std_FieldLister = std.FieldLister;

/**
 * Main function to run the field lister
 * This function can be called directly from Memento Database
 * @param {String} tableName - Optional table name to process a specific table
 */
function runFieldLister(tableName) {
  return std.FieldLister.run(tableName);
}

/**
 * Show a dialog to select a table or process all tables
 * This function can be called directly from Memento Database
 */
function showTableSelectionDialog() {
  try {
    // Get all libraries from ASISTANTO
    var tableNames = std.FieldLister.getTablesFromAsistanto();
    
    if (!tableNames || tableNames.length === 0) {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Upozornenie')
              .text('No tables found')
              .positiveButton('OK', function() {})
              .show();
      return;
    }
    
    // Filter out system libraries
    var userLibraries = [];
    for (var i = 0; i < tableNames.length; i++) {
      var tableName = tableNames[i];
      
      if (tableName !== 'ASISTANTO DB' && 
          !tableName.startsWith('System') && 
          tableName !== 'Trash') {
        userLibraries.push(tableName);
      }
    }
    
    // Create dialog
    var myDialog = dialog();
    myDialog.title('Field Lister');
    myDialog.text('Select a table to process or choose "Process All Tables"');
    
    // Add option to process all tables
    myDialog.radioButton('Process All Tables', 'all', true);
    
    // Add options for each library
    for (var j = 0; j < userLibraries.length; j++) {
      myDialog.radioButton(userLibraries[j], userLibraries[j], false);
    }
    
    // Add buttons
    myDialog.positiveButton('Process', function(selection) {
      if (selection === 'all') {
        std.FieldLister.processTablesFromAsistanto();
      } else {
        std.FieldLister.processTable(selection);
      }
    });
    
    myDialog.negativeButton('Cancel', function() {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Informácia')
              .text('Operation cancelled')
              .positiveButton('OK', function() {})
              .show();
    });
    
    // Show dialog
    myDialog.show();
  } catch (e) {
    // Use dialog instead of message
    var myDialog = dialog();
    myDialog.title('Chyba')
            .text('Error showing table selection dialog: ' + e.toString())
            .positiveButton('OK', function() {})
            .show();
  }
}
