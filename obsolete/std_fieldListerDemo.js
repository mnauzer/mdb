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
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Error: std_fieldLister.js not found in ASISTANTO Scripts')
              .positiveButton('OK', function() {})
              .show();
    } else {
      var scriptContent = script[0].field('Script');
      if (!scriptContent) {
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Chyba')
                .text('Error: std_fieldLister.js is empty')
                .positiveButton('OK', function() {})
                .show();
      } else {
        // Execute the script
        eval(scriptContent);
        // Use dialog instead of message
        var myDialog = dialog();
        myDialog.title('Informácia')
                .text('Successfully loaded std_FieldLister module')
                .positiveButton('OK', function() {})
                .show();
      }
    }
  } catch (e) {
    // Use dialog instead of message
    var myDialog = dialog();
    myDialog.title('Chyba')
            .text('Error loading std_fieldLister.js: ' + e.toString())
            .positiveButton('OK', function() {})
            .show();
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
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Upozornenie')
              .text('No libraries found')
              .positiveButton('OK', function() {})
              .show();
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

/**
 * Process a specific table
 * @param {String} tableName - Name of the table to process
 */
function processTable(tableName) {
  try {
    if (!tableName) {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Error: Table name is required')
              .positiveButton('OK', function() {})
              .show();
      return;
    }
    
    if (typeof std_FieldLister === 'undefined') {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Error: std_FieldLister module not loaded')
              .positiveButton('OK', function() {})
              .show();
      return;
    }
    
    // Use dialog instead of message
    var processDialog = dialog();
    processDialog.title('Informácia')
                 .text('Processing table: ' + tableName)
                 .positiveButton('OK', function() {})
                 .show();
    
    // Run the field lister for the specified table
    var success = std_FieldLister.run(tableName);
    
    if (success) {
      // Use dialog instead of message
      var successDialog = dialog();
      successDialog.title('Informácia')
                   .text('Successfully processed table: ' + tableName)
                   .positiveButton('OK', function() {})
                   .show();
      showResultDialog(tableName);
    } else {
      // Use dialog instead of message
      var failDialog = dialog();
      failDialog.title('Upozornenie')
                .text('Failed to process table: ' + tableName)
                .positiveButton('OK', function() {})
                .show();
    }
  } catch (e) {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
               .text('Error processing table: ' + e.toString())
               .positiveButton('OK', function() {})
               .show();
  }
}

/**
 * Process all tables
 */
function processAllTables() {
  try {
    if (typeof std_FieldLister === 'undefined') {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Error: std_FieldLister module not loaded')
              .positiveButton('OK', function() {})
              .show();
      return;
    }
    
    // Use dialog instead of message
    var processDialog = dialog();
    processDialog.title('Informácia')
                 .text('Processing all tables...')
                 .positiveButton('OK', function() {})
                 .show();
    
    // Run the field lister for all tables
    var results = std_FieldLister.processAllTables();
    
    // Use dialog instead of message
    var resultsDialog = dialog();
    resultsDialog.title('Výsledky')
                 .text('Processed ' + (results.success + results.failure) + ' tables\n' +
                       'Success: ' + results.success + ', Failure: ' + results.failure)
                 .positiveButton('OK', function() {})
                 .show();
    
    if (results.success > 0) {
      showResultsListDialog();
    }
  } catch (e) {
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
               .text('Error processing all tables: ' + e.toString())
               .positiveButton('OK', function() {})
               .show();
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
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Error: ASISTANTO DB library not found')
              .positiveButton('OK', function() {})
              .show();
      return;
    }
    
    // Find the entry for the table
    var entries = dbLibrary.find(tableName);
    if (!entries || entries.length === 0) {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Error: No entry found for table: ' + tableName)
              .positiveButton('OK', function() {})
              .show();
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
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
               .text('Error showing result dialog: ' + e.toString())
               .positiveButton('OK', function() {})
               .show();
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
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Chyba')
              .text('Error: ASISTANTO DB library not found')
              .positiveButton('OK', function() {})
              .show();
      return;
    }
    
    // Get all entries
    var entries = dbLibrary.entries();
    if (!entries || entries.length === 0) {
      // Use dialog instead of message
      var myDialog = dialog();
      myDialog.title('Upozornenie')
              .text('No entries found in ASISTANTO DB')
              .positiveButton('OK', function() {})
              .show();
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
    // Use dialog instead of message
    var errorDialog = dialog();
    errorDialog.title('Chyba')
               .text('Error showing results list dialog: ' + e.toString())
               .positiveButton('OK', function() {})
               .show();
  }
}

// Start the demo
showTableSelectionDialog();
