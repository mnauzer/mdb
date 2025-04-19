# Standardized Framework for Memento Database

## Overview

This standardized framework provides a structured, maintainable, and error-resistant approach to developing scripts for Memento Database. It implements consistent error handling, modular code organization, and standardized APIs for common operations.

## Features

- **Standardized Error Handling**: Consistent approach to error handling with severity levels, categories, and recovery mechanisms
- **Library Caching**: Improved performance through intelligent caching of library references
- **Consolidated Constants**: Organized constants for fields, tables, messages, and more
- **Utility Functions**: Helper functions for common operations like date manipulation, string formatting, etc.
- **Data Access Layer**: Consistent API for CRUD operations and data manipulation
- **Business Logic Modules**: Domain-specific modules for attendance, price quotes, etc.
- **Standardized Triggers**: Consistent handling of Memento Database triggers

## Components

The framework consists of the following modules:

1. **std_main.js**: Main entry point that loads and initializes all modules
2. **std_errorHandler.js**: Standardized error handling with severity levels and categories
3. **std_libraryCache.js**: Improved library caching with TTL and invalidation support
4. **std_constants.js**: Consolidated constants from multiple files
5. **std_utils.js**: Utility functions for common operations
6. **std_core.js**: Core functionality and initialization
7. **std_dataAccess.js**: Data access layer for CRUD operations
8. **std_attendance.js**: Business logic for attendance-related operations
9. **std_triggers.js**: Standardized handling of Memento Database triggers

## Installation

1. Create a new library in Memento Database called "ASISTANTO Scripts" if it doesn't already exist
2. Create entries in this library for each of the framework files, with the filename as the entry name and the file content in a field called "Script"
3. Add the std_main.js script to your Memento Database library's Scripts section

## Usage

### Basic Usage

The framework is designed to be used through the standardized triggers. Once installed, it will automatically handle events like library opening, entry creation, etc.

### Error Handling

```javascript
// Handle an error with default options
std_ErrorHandler.handle(error, 'context');

// Handle an error with custom options
std_ErrorHandler.handle(error, 'context', {
  severity: std_ErrorHandler.SEVERITY.WARNING,
  category: std_ErrorHandler.CATEGORY.VALIDATION,
  showToUser: true
});

// Create a specific type of error
std_ErrorHandler.createValidationError('Invalid input', 'fieldName', 'context', true);
std_ErrorHandler.createDatabaseError(error, 'context', true);
std_ErrorHandler.createSystemError(error, 'context', true);
std_ErrorHandler.createBusinessError(error, 'context', true);
```

### Data Access

```javascript
// Create a new entry
var newEntry = std_DataAccess.create('Library Name', {
  field1: 'value1',
  field2: 'value2'
});

// Find entries
var entries = std_DataAccess.find('Library Name', 'filter');

// Get all entries
var allEntries = std_DataAccess.getAll('Library Name');

// Update an entry
std_DataAccess.update(entry, {
  field1: 'new value'
});

// Delete an entry
std_DataAccess.delete(entry);

// Create a standard entry
var newEntry = std_DataAccess.createStandardEntry('Library Name', {
  field1: 'value1'
});
```

### Utilities

```javascript
// Date utilities
var formattedDate = std_Utils.Date.format(date, 'simple');
var newDate = std_Utils.Date.addDays(date, 5);
var roundedTime = std_Utils.Date.roundToQuarter(time);
var hours = std_Utils.Date.calculateHours(startDate, endDate);

// String utilities
var formatted = std_Utils.String.format('Hello, {0}!', 'World');
var isEmpty = std_Utils.String.isEmpty(str);
var truncated = std_Utils.String.truncate(str, 10, '...');
var padded = std_Utils.String.padNumber(5, 3); // "005"

// Number utilities
var currency = std_Utils.Number.formatCurrency(123.45);
var rounded = std_Utils.Number.round(123.456, 2);

// Field utilities
var value = std_Utils.Field.getValue(entry, 'fieldName', defaultValue);
std_Utils.Field.setValue(entry, 'fieldName', value);
var attr = std_Utils.Field.getAttr(entry, 'attrName', defaultValue);
std_Utils.Field.setAttr(entry, 'attrName', value);
```

### Core Functions

```javascript
// Initialize the core module with custom options
std_Core.init({
  debug: true,
  logLevel: 'info',
  cacheTTL: 600000
});

// Log a message
std_Core.log('Something happened', 'info');

// Show a dialog
std_Core.showDialog({
  title: 'Dialog Title',
  text: 'Dialog message',
  positiveButton: {
    text: 'OK',
    callback: function() { /* do something */ }
  },
  negativeButton: {
    text: 'Cancel',
    callback: function() { cancel(); }
  }
});
```

### Business Logic

```javascript
// Process an attendance record
std_Attendance.processAttendanceRecord(entry, false);

// Calculate work hours
var workHours = std_Attendance.calculateWorkHours(entry);

// Calculate labor costs
var laborCosts = std_Attendance.calculateLaborCosts(entry);

// Create a new attendance record
var newRecord = std_Attendance.createNewAttendanceRecord();
```

## Best Practices

1. **Use the standardized error handling**: Always use std_ErrorHandler for handling errors to ensure consistent error reporting and logging.

2. **Use the data access layer**: Use std_DataAccess for all CRUD operations instead of directly calling Memento Database functions.

3. **Use utility functions**: Use the utility functions in std_Utils for common operations to ensure consistent behavior.

4. **Use constants**: Use the constants in std_Constants instead of hardcoding values.

5. **Add business logic modules**: Create new business logic modules for specific domains following the pattern in std_Attendance.

6. **Document your code**: Use JSDoc comments to document your code for better maintainability.

## Extending the Framework

### Adding a New Module

1. Create a new file with the prefix "std_" (e.g., "std_invoices.js")
2. Follow the pattern of existing modules
3. Add the module to the STD_MODULES array in std_main.js

### Adding Business Logic

1. Create a new business logic module (e.g., "std_invoices.js")
2. Implement the necessary functions
3. Add handling for the module in std_triggers.js

## Troubleshooting

If you encounter issues with the framework:

1. Check the error messages in the Memento Database console
2. Verify that all modules are loaded correctly using showFrameworkInfo()
3. Check that the constants and field names match your Memento Database structure
4. Ensure that the ASISTANTO Scripts library exists and contains all the framework files

## License

This framework is provided as-is with no warranty. You are free to use, modify, and distribute it as needed.
