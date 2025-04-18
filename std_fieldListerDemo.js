// Standardized Field Lister Demo for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Demo script for the Field Lister
 * This script shows how to use the std_FieldLister module
 * to list fields in tables and save the results to ASISTANTO DB
 */

// Check if std_FieldLister is available
if (typeof std_FieldLister === 'undefined') {
  // Try to load the module
  try {
    var script = libByName('ASISTANTO Scripts').find('std_fieldLister.js');
    if (script.length === 0) {
      message('Error: std_fieldLister.js not found in ASISTANTO Scripts');
    } else {
      var scriptContent = script[0].field('Script');
      if (!scriptContent) {
        message('Error: std_fieldLister.js is empty');
      } else {
        // Execute the script
        eval(scriptContent);
        message('Successfully loaded std_FieldLister module');
      }
    }
  } catch (e) {
    message('Error loading std_fieldLister.js: ' + e.toString());
  }
}

/**
 * Show a dialog to select a table or process all tables
 */
function showTableSelectionDialog() {
  try {
    // Get all libraries
    var libraries = libs();
    
    if (!libraries || libraries.length === 0) {
      message('No libraries found');
      return;
    }
    
    // Filter out system libraries
    var userLibraries = [];
    for (var i = 0; i < libraries.length; i++) {
      var library = libraries[i];
      var libraryName = library.title;
      
      if (libraryName !== 'ASISTANTO DB' && 
          !libraryName.startsWith('System') && 
          libraryName !== 'Trash') {
        userLibraries.push(libraryName);
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
        processAllTables();
      } else {
        processTable(selection);
      }
    });
    
    myDialog.negativeButton('Cancel', function() {
      message('Operation cancelled');
    });
    
    // Show dialog
    myDialog.show();
  } catch (e) {
    message('Error showing table selection dialog: ' + e.toString());
  }
}

/**
 * Process a specific table
 * @param {String} tableName - Name of the table to process
 */
function processTable(tableName) {
  try {
    if (!tableName) {
      message('Error: Table name is required');
      return;
    }
    
    if (typeof std_FieldLister === 'undefined') {
      message('Error: std_FieldLister module not loaded');
      return;
    }
    
    message('Processing table: ' + tableName);
    
    // Run the field lister for the specified table
    var success = std_FieldLister.run(tableName);
    
    if (success) {
      message('Successfully processed table: ' + tableName);
      showResultDialog(tableName);
    } else {
      message('Failed to process table: ' + tableName);
    }
  } catch (e) {
    message('Error processing table: ' + e.toString());
  }
}

/**
 * Process all tables
 */
function processAllTables() {
  try {
    if (typeof std_FieldLister === 'undefined') {
      message('Error: std_FieldLister module not loaded');
      return;
    }
    
    message('Processing all tables...');
    
    // Run the field lister for all tables
    var results = std_FieldLister.processAllTables();
    
    message('Processed ' + (results.success + results.failure) + ' tables');
    message('Success: ' + results.success + ', Failure: ' + results.failure);
    
    if (results.success > 0) {
      showResultsListDialog();
    }
  } catch (e) {
    message('Error processing all tables: ' + e.toString());
  }
}

/**
 * Show a dialog with the results for a specific table
 * @param {String} tableName - Name of the table
 */
function showResultDialog(tableName) {
  try {
    // Get the ASISTANTO DB library
    var dbLibrary = libByName('ASISTANTO DB');
    if (!dbLibrary) {
      message('Error: ASISTANTO DB library not found');
      return;
    }
    
    // Find the entry for the table
    var entries = dbLibrary.find(tableName);
    if (!entries || entries.length === 0) {
      message('Error: No entry found for table: ' + tableName);
      return;
    }
    
    var entry = entries[0];
    var fieldList = entry.field('Zoznam polí');
    
    // Show dialog with the field list
    var myDialog = dialog();
    myDialog.title('Fields for ' + tableName);
    myDialog.text(fieldList || 'No fields found');
    myDialog.positiveButton('OK', function() {});
    myDialog.show();
  } catch (e) {
    message('Error showing result dialog: ' + e.toString());
  }
}

/**
 * Show a dialog with a list of all processed tables
 */
function showResultsListDialog() {
  try {
    // Get the ASISTANTO DB library
    var dbLibrary = libByName('ASISTANTO DB');
    if (!dbLibrary) {
      message('Error: ASISTANTO DB library not found');
      return;
    }
    
    // Get all entries
    var entries = dbLibrary.entries();
    if (!entries || entries.length === 0) {
      message('No entries found in ASISTANTO DB');
      return;
    }
    
    // Create dialog
    var myDialog = dialog();
    myDialog.title('Processed Tables');
    myDialog.text('Select a table to view its fields:');
    
    // Add options for each entry
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      myDialog.radioButton(entry.name, entry.name, i === 0);
    }
    
    // Add buttons
    myDialog.positiveButton('View', function(selection) {
      showResultDialog(selection);
    });
    
    myDialog.negativeButton('Close', function() {});
    
    // Show dialog
    myDialog.show();
  } catch (e) {
    message('Error showing results list dialog: ' + e.toString());
  }
}

// Start the demo
showTableSelectionDialog();
