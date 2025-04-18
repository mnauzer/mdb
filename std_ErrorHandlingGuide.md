# Standardized Error Handling Implementation Guide

This guide explains how to implement the standardized error handling approach in your existing Memento Database code.

## Overview

The standardized error handling approach provides several benefits:

1. **Consistency**: All errors are handled in a consistent way
2. **Categorization**: Errors are categorized by type and severity
3. **Recovery**: Optional recovery mechanisms can be provided
4. **Logging**: All errors are logged for later analysis
5. **User Feedback**: User-friendly error messages can be displayed

## Implementation Steps

### Step 1: Include the Required Modules

Make sure the following modules are included in your script:

- std_errorHandler.js
- std_libraryCache.js
- std_constants.js

### Step 2: Replace Direct Error Handling

Replace direct error handling with the standardized approach:

#### Before:

```javascript
try {
    // Some code that might throw an error
    var result = someFunction();
    return result;
} catch (e) {
    message('Error: ' + e.toString());
    return null;
}
```

#### After:

```javascript
try {
    // Some code that might throw an error
    var result = someFunction();
    return result;
} catch (e) {
    return std_ErrorHandler.handle(e, 'functionName', {
        severity: std_ErrorHandler.SEVERITY.ERROR,
        category: std_ErrorHandler.CATEGORY.SYSTEM,
        showToUser: true,
        recovery: function() {
            // Optional recovery logic
            return null;
        }
    });
}
```

### Step 3: Use Specialized Error Handling Methods

For specific types of errors, use the specialized methods:

#### Validation Errors:

```javascript
if (!isValid(input)) {
    std_ErrorHandler.createValidationError('Invalid input', 'fieldName', 'functionName', true);
    return null;
}
```

#### Database Errors:

```javascript
try {
    var library = libByName('Library Name');
    return library.entries();
} catch (e) {
    std_ErrorHandler.createDatabaseError(e, 'functionName', true);
    return [];
}
```

#### System Errors:

```javascript
try {
    // System operation
    return result;
} catch (e) {
    std_ErrorHandler.createSystemError(e, 'functionName', true);
    return null;
}
```

#### Business Logic Errors:

```javascript
if (condition) {
    std_ErrorHandler.createBusinessError('Business rule violated', 'functionName', true);
    return null;
}
```

### Step 4: Add Context Information

Always provide context information to help with debugging:

```javascript
std_ErrorHandler.handle(e, 'Module.functionName', options);
```

The context should include:
- Module name
- Function name
- Any relevant parameters or state information

### Step 5: Configure Error Display

Decide whether to show errors to the user:

```javascript
// Show error to user
std_ErrorHandler.handle(e, 'context', { showToUser: true });

// Don't show error to user (just log it)
std_ErrorHandler.handle(e, 'context', { showToUser: false });
```

### Step 6: Implement Recovery Mechanisms

For critical operations, provide recovery mechanisms:

```javascript
std_ErrorHandler.handle(e, 'context', {
    recovery: function() {
        // Try an alternative approach
        return alternativeFunction();
    }
});
```

## Examples

### Example 1: Field Access

#### Before:

```javascript
function getFieldValue(entry, fieldName) {
    try {
        return entry.field(fieldName);
    } catch (e) {
        message('Error accessing field: ' + e.toString());
        return null;
    }
}
```

#### After:

```javascript
function getFieldValue(entry, fieldName) {
    try {
        return entry.field(fieldName);
    } catch (e) {
        std_ErrorHandler.createDatabaseError(e, 'getFieldValue', false);
        return null;
    }
}
```

### Example 2: Data Validation

#### Before:

```javascript
function validateDate(dateStr) {
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        message('Invalid date format');
        return false;
    }
    return true;
}
```

#### After:

```javascript
function validateDate(dateStr) {
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        std_ErrorHandler.createValidationError('Invalid date format', 'date', 'validateDate', true);
        return false;
    }
    return true;
}
```

### Example 3: Complex Operation with Recovery

#### Before:

```javascript
function processAttendance(entry) {
    try {
        // Process attendance
        calculateHours(entry);
        updateFields(entry);
        generateReports(entry);
        return true;
    } catch (e) {
        message('Error processing attendance: ' + e.toString());
        return false;
    }
}
```

#### After:

```javascript
function processAttendance(entry) {
    try {
        // Process attendance
        calculateHours(entry);
        updateFields(entry);
        generateReports(entry);
        return true;
    } catch (e) {
        return std_ErrorHandler.handle(e, 'processAttendance', {
            severity: std_ErrorHandler.SEVERITY.ERROR,
            category: std_ErrorHandler.CATEGORY.BUSINESS_LOGIC,
            showToUser: true,
            recovery: function() {
                // Try a simplified processing approach
                try {
                    calculateHours(entry);
                    updateFields(entry);
                    // Skip report generation
                    return true;
                } catch (innerError) {
                    std_ErrorHandler.createBusinessError(innerError, 'processAttendance.recovery', true);
                    return false;
                }
            }
        });
    }
}
```

## Best Practices

1. **Be Consistent**: Use the standardized error handling approach consistently throughout your code.

2. **Provide Context**: Always include meaningful context information to help with debugging.

3. **Choose Appropriate Severity**: Use the appropriate severity level for each error:
   - ERROR: Serious errors that prevent the operation from completing
   - WARNING: Issues that don't prevent the operation but might cause problems
   - INFO: Informational messages about potential issues
   - DEBUG: Detailed information for debugging purposes

4. **Choose Appropriate Category**: Use the appropriate category for each error:
   - VALIDATION: Input validation errors
   - DATABASE: Database access errors
   - SYSTEM: System-level errors
   - BUSINESS_LOGIC: Business rule violations
   - UI: User interface errors

5. **Consider User Experience**: Decide whether to show errors to the user based on whether they can take action to resolve the issue.

6. **Implement Recovery**: For critical operations, provide recovery mechanisms to handle errors gracefully.

7. **Log Everything**: Log all errors, even if they're not shown to the user, to help with debugging and analysis.

## Migration Strategy

When migrating existing code to use the standardized error handling approach, follow these steps:

1. **Start with Critical Code**: Begin with the most critical parts of your application, such as data access and business logic.

2. **Identify Error Handling Patterns**: Look for existing error handling patterns in your code, such as try/catch blocks and error messages.

3. **Replace Gradually**: Replace the existing error handling with the standardized approach one module at a time.

4. **Test Thoroughly**: Test each module after migrating to ensure that errors are handled correctly.

5. **Update Documentation**: Update your documentation to reflect the new error handling approach.

6. **Train Team Members**: Ensure that all team members understand the new error handling approach and how to use it.

## Conclusion

By implementing the standardized error handling approach, you'll improve the reliability, maintainability, and user experience of your Memento Database applications. The consistent approach to error handling will make it easier to debug issues, provide better feedback to users, and recover from errors gracefully.
