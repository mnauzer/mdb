// Standardized Field Lister for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Script to list all fields in a table and save the results to ASISTANTO DB
 * The record name will be the name of the table, and the field will be "Zoznam polí"
 */
var std_FieldLister = {
  /**
   * List all fields in a table
   * @param {String} tableName - Name of the table to list fields from
   * @returns {Array} - Array of field information objects
   */
  listFields: function(tableName) {
    try {
      if (!tableName) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createValidationError('Table name is required', null, 'std_FieldLister.listFields', true);
        } else {
          message('Error: Table name is required');
        }
        return [];
      }
      
      // Get the library
      var library;
      if (typeof std_LibraryCache !== 'undefined') {
        library = std_LibraryCache.get(tableName);
      } else {
        library = libByName(tableName);
      }
      
      if (!library) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('Library not found: ' + tableName, 'std_FieldLister.listFields', true);
        } else {
          message('Error: Library not found: ' + tableName);
        }
        return [];
      }
      
      // Get all entries to analyze fields
      var entries = library.entries();
      if (!entries || entries.length === 0) {
        message('Warning: No entries found in library: ' + tableName);
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
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_FieldLister.listFields', true);
      } else {
        message('Error listing fields: ' + e.toString());
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
      message('Warning: Could not get fields from schema: ' + e.toString());
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
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createValidationError('Table name and field list are required', null, 'std_FieldLister.saveFieldList', true);
        } else {
          message('Error: Table name and field list are required');
        }
        return false;
      }
      
      // Get the ASISTANTO DB library
      var dbLibrary;
      if (typeof std_LibraryCache !== 'undefined') {
        dbLibrary = std_LibraryCache.get('ASISTANTO DB');
      } else {
        dbLibrary = libByName('ASISTANTO DB');
      }
      
      if (!dbLibrary) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createDatabaseError('ASISTANTO DB library not found', 'std_FieldLister.saveFieldList', true);
        } else {
          message('Error: ASISTANTO DB library not found');
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
        message('Updated field list for table: ' + tableName);
      } else {
        // Create new entry
        var newEntry = {
          name: tableName,
          'Zoznam polí': fieldList,
          'Dátum': new Date()
        };
        
        if (typeof std_DataAccess !== 'undefined') {
          entry = std_DataAccess.create('ASISTANTO DB', newEntry);
        } else {
          entry = dbLibrary.create(newEntry);
        }
        
        message('Created field list for table: ' + tableName);
      }
      
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_FieldLister.saveFieldList', true);
      } else {
        message('Error saving field list: ' + e.toString());
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
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createValidationError('Table name is required', null, 'std_FieldLister.processTable', true);
        } else {
          message('Error: Table name is required');
        }
        return false;
      }
      
      message('Processing table: ' + tableName);
      
      // List fields
      var fields = this.listFields(tableName);
      
      // Format field list
      var fieldList = this.formatFieldList(fields);
      
      // Save field list
      var success = this.saveFieldList(tableName, fieldList);
      
      if (success) {
        message('Successfully processed table: ' + tableName);
      }
      
      return success;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_FieldLister.processTable', true);
      } else {
        message('Error processing table: ' + e.toString());
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
      if (typeof std_LibraryCache !== 'undefined') {
        asistantoDB = std_LibraryCache.get('ASISTANTO DB');
      } else {
        asistantoDB = libByName('ASISTANTO DB');
      }
      
      if (!asistantoDB) {
        message('ASISTANTO DB library not found');
        return { success: 0, failure: 0 };
      }
      
      // Get all entries from ASISTANTO DB
      var entries = asistantoDB.entries();
      
      if (!entries || entries.length === 0) {
        message('No tables found in ASISTANTO DB');
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
      
      message('Processed ' + (results.success + results.failure) + ' tables');
      message('Success: ' + results.success + ', Failure: ' + results.failure);
      
      return results;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_FieldLister.processAllTables', true);
      } else {
        message('Error processing all tables: ' + e.toString());
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
      if (typeof std_LibraryCache !== 'undefined') {
        asistantoLib = std_LibraryCache.get('ASISTANTO');
      } else {
        asistantoLib = libByName('ASISTANTO');
      }
      
      if (!asistantoLib) {
        message('ASISTANTO library not found');
        return [];
      }
      
      // Get the current season
      var season = null;
      if (typeof app !== 'undefined' && app.season) {
        season = app.season;
      } else {
        // Try to get the season from ASISTANTO Tenants
        var tenantsLib;
        if (typeof std_LibraryCache !== 'undefined') {
          tenantsLib = std_LibraryCache.get('ASISTANTO Tenants');
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
        message('Warning: Could not determine current season');
        // Try to get the latest season
        var seasons = asistantoLib.entries();
        if (seasons && seasons.length > 0) {
          season = seasons[0].name;
        } else {
          message('Error: No seasons found in ASISTANTO');
          return [];
        }
      }
      
      // Find the season entry
      var seasonEntries = asistantoLib.find(season);
      if (!seasonEntries || seasonEntries.length === 0) {
        message('Error: Season not found: ' + season);
        return [];
      }
      
      var seasonEntry = seasonEntries[0];
      
      // Get the databases linked to this season
      var databases = seasonEntry.field('Databázy');
      if (!databases || databases.length === 0) {
        message('No databases found for season: ' + season);
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
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createDatabaseError(e, 'std_FieldLister.getTablesFromAsistanto', true);
      } else {
        message('Error getting tables from ASISTANTO: ' + e.toString());
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
        message('No tables found in ASISTANTO');
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
      
      message('Processed ' + (results.success + results.failure) + ' tables');
      message('Success: ' + results.success + ', Failure: ' + results.failure);
      
      return results;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_FieldLister.processTablesFromAsistanto', true);
      } else {
        message('Error processing tables from ASISTANTO: ' + e.toString());
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
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createSystemError(e, 'std_FieldLister.run', true);
      } else {
        message('Error running field lister: ' + e.toString());
      }
      return false;
    }
  }
};

// Make available globally
this.std_FieldLister = std_FieldLister;

// Example usage:
// std_FieldLister.run(); // Process all tables
// std_FieldLister.run('Table Name'); // Process a specific table
