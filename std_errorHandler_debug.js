// Debug script for error handling in Memento Database
// This script will help diagnose issues with logging to ASISTANTO Errors database

/**
 * Test function to diagnose error logging issues
 * This function will attempt to log messages using different approaches
 * and provide detailed diagnostics about what's working and what's not
 */
function diagnoseErrorLogging() {
  var results = [];
  var errorLibName = 'ASISTANTO Errors';

  // Step 1: Check if the database exists
  try {
    var errorLib = libByName(errorLibName);
    if (errorLib) {
      results.push("✓ Database '" + errorLibName + "' exists");

      // Get field names to verify structure
      try {
        var fieldNames = [];
        var fields = errorLib.fields();
        for (var i = 0; i < fields.length; i++) {
          fieldNames.push(fields[i].name);
        }
        results.push("✓ Fields in database: " + fieldNames.join(", "));
      } catch (fieldsError) {
        results.push("✗ Failed to get fields: " + fieldsError.toString());
      }
    } else {
      results.push("✗ Database '" + errorLibName + "' does not exist");

      // Try to find similar databases
      try {
        var allLibs = libs();
        var similarLibs = [];
        for (var i = 0; i < allLibs.length; i++) {
          if (allLibs[i].title.indexOf('Error') !== -1 ||
              allLibs[i].title.indexOf('Log') !== -1) {
            similarLibs.push(allLibs[i].title);
          }
        }

        if (similarLibs.length > 0) {
          results.push("ℹ Similar databases found: " + similarLibs.join(", "));
        } else {
          results.push("ℹ No similar databases found");
        }
      } catch (libsError) {
        results.push("✗ Failed to list libraries: " + libsError.toString());
      }
    }
  } catch (libError) {
    results.push("✗ Error accessing database: " + libError.toString());
  }

  // Step 2: Test entry creation
  if (errorLib) {
    try {
      var testEntry = errorLib.create();
      results.push("✓ Successfully created test entry");

      // Step 3: Test setting fields
      try {
        // Test each field individually
        var fieldTests = [
          { field: "type", value: "test" },
          { field: "date", value: new Date() },
          { field: "memento library", value: "Test Library" },
          { field: "script", value: "std_errorHandler_debug.js" },
          { field: "line", value: "123" },
          { field: "text", value: "Test message" },
          { field: "user", value: "Test User" }
        ];

        var successFields = [];
        var failedFields = [];

        for (var i = 0; i < fieldTests.length; i++) {
          var test = fieldTests[i];
          try {
            testEntry.set(test.field, test.value);
            successFields.push(test.field);
          } catch (fieldError) {
            failedFields.push(test.field + " (" + fieldError.toString() + ")");
          }
        }

        if (successFields.length > 0) {
          results.push("✓ Successfully set fields: " + successFields.join(", "));
        }

        if (failedFields.length > 0) {
          results.push("✗ Failed to set fields: " + failedFields.join(", "));
        }

        // Step 4: Test saving entry
        try {
          testEntry.save();
          results.push("✓ Successfully saved test entry");

          // Verify entry was saved
          try {
            var savedEntries = errorLib.find("text = 'Test message'");
            if (savedEntries.length > 0) {
              results.push("✓ Verified test entry was saved");
            } else {
              results.push("✗ Test entry not found after save");
            }
          } catch (findError) {
            results.push("✗ Failed to verify saved entry: " + findError.toString());
          }
        } catch (saveError) {
          results.push("✗ Failed to save entry: " + saveError.toString());
        }
      } catch (setError) {
        results.push("✗ Error setting fields: " + setError.toString());
      }
    } catch (createError) {
      results.push("✗ Failed to create entry: " + createError.toString());
    }
  }

  // Step 5: Test console methods
  results.push("\n--- Testing console methods ---");

  // Test if console object exists
  if (typeof console !== 'undefined') {
    results.push("✓ console object exists");

    // Check which methods are available
    var methods = [];
    for (var method in console) {
      if (typeof console[method] === 'function') {
        methods.push(method);
      }
    }

    if (methods.length > 0) {
      results.push("✓ Available console methods: " + methods.join(", "));
    } else {
      results.push("✗ No methods found in console object");
    }

    // Test console.log
    if (typeof console.log === 'function') {
      try {
        console.log("Test log message", "std_errorHandler_debug.js", "diagnoseErrorLogging");
        results.push("✓ console.log executed without errors");
      } catch (logError) {
        results.push("✗ console.log failed: " + logError.toString());
      }
    }

    // Test console.error
    if (typeof console.error === 'function') {
      try {
        console.error("Test error message", "std_errorHandler_debug.js", "diagnoseErrorLogging");
        results.push("✓ console.error executed without errors");
      } catch (errorError) {
        results.push("✗ console.error failed: " + errorError.toString());
      }
    }
  } else {
    results.push("✗ console object does not exist");
  }

  // Step 6: Test std.ErrorHandler methods
  results.push("\n--- Testing std.ErrorHandler methods ---");

  if (typeof std !== 'undefined' && std.ErrorHandler) {
    results.push("✓ std.ErrorHandler exists");

    // Check which methods are available
    var methods = [];
    for (var method in std.ErrorHandler) {
      if (typeof std.ErrorHandler[method] === 'function') {
        methods.push(method);
      }
    }

    if (methods.length > 0) {
      results.push("✓ Available std.ErrorHandler methods: " + methods.join(", "));
    } else {
      results.push("✗ No methods found in std.ErrorHandler");
    }

    // Test createSystemError
    if (typeof std.ErrorHandler.createSystemError === 'function') {
      try {
        std.ErrorHandler.createSystemError("Test system error", "std_errorHandler_debug.js", false);
        results.push("✓ createSystemError executed without errors");
      } catch (sysError) {
        results.push("✗ createSystemError failed: " + sysError.toString());
      }
    }

    // Test logError
    if (typeof std.ErrorHandler.logError === 'function') {
      try {
        std.ErrorHandler.logError("TestModule", "diagnoseErrorLogging", "Test error log message");
        results.push("✓ logError executed without errors");
      } catch (logError) {
        results.push("✗ logError failed: " + logError.toString());
      }
    }
  } else {
    results.push("✗ std.ErrorHandler does not exist");
  }

  // Step 7: Check for recent entries
  results.push("\n--- Checking for recent entries ---");

  if (errorLib) {
    try {
      var recentEntries = errorLib.entries();
      if (recentEntries.length > 0) {
        results.push("✓ Found " + recentEntries.length + " entries in error database");

        // Check the most recent entries
        var count = Math.min(5, recentEntries.length);
        for (var i = 0; i < count; i++) {
          var entry = recentEntries[i];
          var entryInfo = [];

          try { entryInfo.push("type: " + entry.field("type")); } catch(e) {}
          try { entryInfo.push("date: " + entry.field("date")); } catch(e) {}
          try { entryInfo.push("text: " + entry.field("text")); } catch(e) {}

          results.push("Entry " + (i+1) + ": " + entryInfo.join(", "));
        }
      } else {
        results.push("✗ No entries found in error database");
      }
    } catch (entriesError) {
      results.push("✗ Failed to get entries: " + entriesError.toString());
    }
  }

  // Step 8: Test JavaScript environment
  results.push("\n--- Testing JavaScript environment ---");

  // Check available global objects
  var globals = ["lib", "entry", "libByName", "libs", "user", "message", "dialog"];
  for (var i = 0; i < globals.length; i++) {
    var globalName = globals[i];
    if (typeof window[globalName] === 'function') {
      results.push("✓ " + globalName + "() is available");
    } else {
      results.push("✗ " + globalName + "() is not available");
    }
  }

  // Check if we can get current library
  try {
    var currentLib = lib();
    results.push("✓ Current library: " + currentLib.title);
  } catch (libError) {
    results.push("✗ Failed to get current library: " + libError.toString());
  }

  // Check if we can get current user
  try {
    var currentUser = user();
    results.push("✓ Current user: " + currentUser);
  } catch (userError) {
    results.push("✗ Failed to get current user: " + userError.toString());
  }

  // Return diagnostic results
  return results.join("\n");
}

// Function to run the diagnostics and show results
function runDiagnostics() {
  var results = diagnoseErrorLogging();

  // Show results in a dialog
  var resultDialog = dialog();
  resultDialog.title("Error Logging Diagnostics")
             .text(results)
             .positiveButton("OK", function() {})
             .show();
}

// Run diagnostics when this script is executed
runDiagnostics();
