# Standardized Framework for Memento Database

## Overview

This is a refactored version of the standardized framework for Memento Database that removes the dependency on the "ASISTANTO Scripts" table. Each module can now be used directly in Memento Database scripts without requiring a central script loading mechanism.

## Key Changes

1. **Removed Dependency on ASISTANTO Scripts Table**: Each module is now self-contained and can be loaded directly by Memento Database.
2. **Namespace-based Architecture**: All modules are now organized under the `std` namespace, with backward compatibility for the old `std_` prefixed global variables.
3. **Direct Trigger Integration**: Trigger functions are now exposed directly as global functions that can be selected in Memento Database's trigger settings.
4. **Improved Error Handling**: All error handling now uses dialogs instead of messages for better user experience.
5. **Module Independence**: Modules can now be used independently, with graceful fallbacks when dependencies are not available.

## Installation

To use the refactored framework:

1. Copy the needed module files to your Memento Database library's Scripts section.
2. For trigger functionality, copy the `std_triggers_refactored.js` file and select the appropriate trigger functions in your library's trigger settings.
3. For utility functions, copy the relevant module files (e.g., `std_core_refactored.js`, `std_errorHandler_refactored.js`, etc.).

## Available Modules

- **std_core_refactored.js**: Core functionality and initialization
- **std_errorHandler_refactored.js**: Standardized error handling with severity levels and categories
- **std_libraryCache_refactored.js**: Improved library caching with TTL and invalidation support
- **std_triggers_refactored.js**: Standardized handling of Memento Database triggers
- **std_fieldLister_refactored.js**: Utility to list all fields in a table and save the results to ASISTANTO DB

## Using Triggers

To use the triggers in your Memento Database library:

1. Copy the `std_triggers_refactored.js` file to your library's Scripts section.
2. In your library settings, go to the Triggers tab.
3. For each trigger event, select the corresponding function from this module:
   - For "Library Open" event, select "libOpen"
   - For "Library Open Before Show" event, select "libOpenBeforeShow"
   - For "Create Entry Open" event, select "createEntryOpen"
   - For "Create Entry After Save" event, select "createEntryAfterSave"
   - For "Entry Before Save" event, select "entryBeforeSave"
   - For "Entry After Save" event, select "entryAfterSave"
   - For "Link Entry Before Save" event, select "linkEntryBeforeSave"
   - For "Entry Open" event, select "entryOpen"

## Using the Field Lister

The Field Lister module provides a utility to list all fields in a table and save the results to ASISTANTO DB. To use it:

1. Copy the `std_fieldLister_refactored.js` file to your library's Scripts section.
2. Create a new script in your library that calls the Field Lister functions:

```javascript
// Run the field lister for all tables
runFieldLister();

// Or run it for a specific table
runFieldLister('Table Name');

// Or show a dialog to select a table
showTableSelectionDialog();
```

## Module Dependencies

While modules can be used independently, some functionality may depend on other modules. Here are the dependencies:

- **std.Core**: No dependencies
- **std.ErrorHandler**: Optional dependency on std.Core for logging
- **std.LibraryCache**: Optional dependency on std.ErrorHandler for error handling
- **std.Triggers**: Optional dependencies on std.Core, std.ErrorHandler, std.Constants, and std.Utils
- **std.FieldLister**: Optional dependencies on std.ErrorHandler, std.LibraryCache, and std.DataAccess

## Backward Compatibility

For backward compatibility, each module still exposes the old `std_` prefixed global variables. For example:

```javascript
// New namespace-based approach
std.Core.init();

// Old approach (still works)
std_Core.init();
```

## Migration Guide

To migrate from the old architecture to the new one:

1. Replace the old `std_*.js` files with the new `std_*_refactored.js` files.
2. Update your library's trigger settings to use the new trigger functions.
3. Remove any code that loads scripts from the "ASISTANTO Scripts" table.
4. Update any references to the old `std_` prefixed global variables to use the new `std` namespace (optional, as backward compatibility is maintained).

## Best Practices

1. **Use the std namespace**: While backward compatibility is maintained, it's recommended to use the new `std` namespace for better organization and clarity.
2. **Load only what you need**: Since modules are now independent, only load the modules you actually need for your specific use case.
3. **Use dialogs for user interaction**: All user interaction should use dialogs instead of messages for better user experience.
4. **Handle errors gracefully**: Use the std.ErrorHandler module for consistent error handling, with fallbacks when it's not available.
5. **Use library cache**: Use the std.LibraryCache module to improve performance when accessing libraries.
