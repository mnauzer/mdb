# Memento Database Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Core Concepts](#core-concepts)
   - [Libraries](#libraries)
   - [Fields](#fields)
   - [Entries](#entries)
   - [Pages and Subheaders](#pages-and-subheaders)
3. [Field Types](#field-types)
   - [Text Fields](#text-fields)
   - [Numeric Fields](#numeric-fields)
   - [Choice Fields](#choice-fields)
   - [Date and Time Fields](#date-and-time-fields)
   - [Linking Fields](#linking-fields)
   - [Media Fields](#media-fields)
   - [Calculated Fields](#calculated-fields)
   - [Special Fields](#special-fields)
4. [Data Analysis](#data-analysis)
   - [Sorting](#sorting)
   - [Filtering](#filtering)
   - [Grouping](#grouping)
   - [Aggregation](#aggregation)
   - [Charting](#charting)
5. [JavaScript in Memento](#javascript-in-memento)
   - [JavaScript Fields](#javascript-fields)
   - [JavaScript Library](#javascript-library)
   - [Working with Libraries and Entries](#working-with-libraries-and-entries)
   - [Working with Files](#working-with-files)
   - [HTTP Requests](#http-requests)
   - [System Interaction](#system-interaction)
   - [SQL Queries](#sql-queries)
6. [Triggers](#triggers)
   - [Events and Phases](#events-and-phases)
   - [Creating Triggers](#creating-triggers)
   - [Trigger Examples](#trigger-examples)
7. [Actions](#actions)
   - [Creating Actions](#creating-actions)
   - [Action Examples](#action-examples)
8. [Synchronization and Cloud](#synchronization-and-cloud)
   - [Google Sheets Sync](#google-sheets-sync)
   - [Memento Cloud](#memento-cloud)
   - [Teamwork](#teamwork)
9. [Security](#security)
   - [Library Protection](#library-protection)
   - [Script Permissions](#script-permissions)
10. [Best Practices](#best-practices)
    - [Database Design](#database-design)
    - [JavaScript Coding](#javascript-coding)
    - [Performance Optimization](#performance-optimization)
11. [Advanced Examples](#advanced-examples)
    - [Historical Data Tracking](#historical-data-tracking)
    - [Automated Workflows](#automated-workflows)
    - [Integration with External Services](#integration-with-external-services)

## Introduction

Memento Database is a powerful database management application for mobile devices (Android) and personal computers (Windows, Linux, macOS). It allows users to create custom databases with a wide range of field types and features, making it suitable for various use cases from simple personal collections to complex business applications.

### Key Features

- **Custom Database Creation**: Design databases with custom fields, layouts, and relationships
- **Rich Field Types**: Support for over 20 field types including text, numbers, dates, images, files, and more
- **Data Analysis**: Sort, filter, group, and visualize data with built-in tools
- **JavaScript Support**: Extend functionality with custom scripts
- **Cloud Synchronization**: Sync data across devices and with Google Sheets
- **Teamwork**: Share libraries with other users for collaborative work
- **Cross-Platform**: Available on Android, Windows, Linux, and macOS

## Core Concepts

### Libraries

A library is the primary container for data in Memento Database. It consists of a collection of entries with a defined structure of fields. Libraries can be linked to form relationships, allowing for complex data models.

#### Creating a Library

1. From the Libraries List screen, tap the + button
2. Enter a name for the library
3. Define fields in the FIELDS tab
4. Organize fields into pages in the PAGES tab
5. Configure library settings in the MAIN tab

#### Library Settings

- **Entry Name**: Define which field(s) will be used as the entry name
- **Unique Entry Names**: Enforce uniqueness of entry names
- **Library Protection**: Enable encryption for sensitive data
- **Synchronization**: Configure sync settings with Google Sheets or Memento Cloud

### Fields

Fields are the building blocks of a library's structure. Each field represents a specific piece of data and has a defined type that determines what kind of data it can store and how it behaves.

#### Field Properties

- **Name**: The identifier for the field
- **Type**: The data type of the field
- **Role**: How the field is displayed in lists (Entry Name, Description, etc.)
- **Required**: Whether the field must have a value
- **Default Value**: The initial value for new entries
- **Display Options**: How the field is displayed in the user interface

### Entries

Entries are individual records within a library. Each entry contains values for the fields defined in the library structure.

#### Working with Entries

- **Creating**: Tap the + button on the Entries List screen
- **Viewing**: Tap an entry in the list to open the Entry View card
- **Editing**: Tap the pencil icon on the Entry View card
- **Deleting**: Tap the trash icon on the Entry View card (moves to Recycle Bin)
- **Favorites**: Mark entries as favorites for quick access

### Pages and Subheaders

Pages and subheaders help organize fields within a library for better usability.

- **Pages**: Group related fields into separate tabs on the Entry Edit and Entry View cards
- **Subheaders**: Create sections within a page to further organize fields

## Field Types

Memento Database offers a wide range of field types to accommodate different data needs.

### Text Fields

- **Text**: Simple text input
- **Rich Text (HTML)**: Formatted text with styling options
- **Phone Number**: Text optimized for phone numbers
- **Email**: Text optimized for email addresses
- **Hyperlink**: Text that functions as a clickable link
- **Password**: Text that is masked for security
- **Barcode**: Text that can be entered by scanning a barcode

### Numeric Fields

- **Integer**: Whole numbers
- **Integer Values**: Integers with predefined values and labels
- **Real Number**: Decimal numbers
- **Currency**: Numbers formatted as currency
- **Rating**: Visual representation of a numeric value (stars)

### Choice Fields

- **Boolean**: Yes/No or True/False values
- **Single-choice List**: Selection from a predefined list of options
- **Radio Buttons**: Visual representation of a single-choice list
- **Multiple-choice List**: Selection of multiple options from a list
- **Checkboxes**: Visual representation of a multiple-choice list
- **Dynamic List**: List of options that can be updated programmatically

### Date and Time Fields

- **Date**: Calendar date
- **DateTime**: Date combined with time
- **Time**: Time of day

### Linking Fields

- **Link to Entry**: Reference to entries in another library
- **Link to File**: Reference to files stored on the device

### Media Fields

- **Image**: Photos or images
- **Audio**: Sound recordings
- **Signature**: Handwritten signatures

### Calculated Fields

- **Calculation**: Formula-based calculation using other field values
- **JavaScript**: Custom calculation using JavaScript code

### Special Fields

- **Contact**: Reference to a contact from the device's contacts
- **Location**: Geographic coordinates with map integration
- **Tags**: Keywords for categorizing entries

## Data Analysis

Memento Database provides powerful tools for analyzing and visualizing data.

### Sorting

Sort entries based on one or more fields in ascending or descending order.

```javascript
// Example: Sort entries by date in descending order
var sortedEntries = std.Utils.Array.sortEntriesByField(entries, 'date', false);
```

### Filtering

Filter entries based on field values to show only relevant data.

```javascript
// Example: Filter entries where status is 'completed'
var completedEntries = std.Utils.Array.filterEntries(entries, 'status', 'completed');
```

### Grouping

Group entries by field values to organize data hierarchically.

```javascript
// Example: Group entries by category
var entriesByCategory = std.Utils.Array.groupEntriesByField(entries, 'category');
```

### Aggregation

Perform calculations on grouped data, such as sum, average, minimum, and maximum.

```javascript
// Example: Calculate sum of amounts for each category
var categories = std.Utils.Array.getUniqueFieldValues(entries, 'category');
for (var i = 0; i < categories.length; i++) {
  var categoryEntries = std.Utils.Array.filterEntries(entries, 'category', categories[i]);
  var totalAmount = std.Utils.Array.sumEntryField(categoryEntries, 'amount');
  console.log(categories[i] + ': ' + totalAmount);
}
```

### Charting

Visualize data using built-in chart types:
- Pie charts
- Bar charts
- Line charts
- Column charts
- Area charts
- Scatter charts
- Stepped area charts

## JavaScript in Memento

Memento Database includes powerful JavaScript capabilities that allow you to extend its functionality.

### JavaScript Fields

JavaScript fields contain code that calculates a value based on other fields in the entry.

```javascript
// Example: Calculate total price
field("quantity") * field("unit_price")
```

### JavaScript Library

Memento provides a JavaScript library with functions for working with libraries, entries, files, HTTP requests, and more.

### Working with Libraries and Entries

```javascript
// Get the current library
var currentLib = lib();

// Get all entries in the library
var allEntries = currentLib.entries();

// Get the current entry
var currentEntry = entry();

// Get a field value
var name = currentEntry.field("name");

// Set a field value
currentEntry.set("status", "completed");

// Create a new entry
var newEntry = {
  "name": "New Entry",
  "date": new Date(),
  "status": "pending"
};
currentLib.create(newEntry);

// Find entries by a search term
var results = currentLib.find("search term");

// Find an entry by ID
var foundEntry = currentLib.findById("entry_id");
```

### Working with Files

```javascript
// Open a file for reading/writing
var f = file("myfile.txt");

// Write to the file
f.writeLine("Hello, world!");

// Close the file
f.close();

// Read all lines from the file
var lines = f.readAll();
```

### HTTP Requests

```javascript
// Make a GET request
var response = http().get("https://api.example.com/data");

// Make a POST request
var postResponse = http().post("https://api.example.com/submit", "data=value");

// Set headers
http().headers({"Authorization": "Bearer token"});

// Parse JSON response
var data = JSON.parse(response.body);
```

### System Interaction

```javascript
// Show a message to the user
message("Operation completed successfully");

// Create a dialog
var myDialog = dialog();
myDialog.title("Confirmation")
        .text("Are you sure you want to proceed?")
        .positiveButton("Yes", function() { /* action */ })
        .negativeButton("No", function() { /* action */ })
        .show();

// Create an intent to open another app
var i = intent("android.intent.action.VIEW");
i.data("https://example.com");
i.send();
```

### SQL Queries

```javascript
// Execute an SQL query
var results = sql("SELECT * FROM MyLibrary WHERE status = 'active'").asObjects();

// Get a single value
var count = sql("SELECT COUNT(*) FROM MyLibrary").asInt();
```

## Triggers

Triggers are scripts that run automatically when certain events occur in Memento Database.

### Events and Phases

Triggers are defined by an event type and a phase:

#### Event Types
- Opening a library
- Creating an entry
- Updating an entry
- Updating a field
- Linking an entry
- Unlinking an entry
- Deleting an entry
- Opening an Entry View card
- Adding an entry to Favorites
- Removing an entry from Favorites

#### Phases
- Before the operation (synchronous)
- After the operation (asynchronous)

### Creating Triggers

1. Open the library
2. Open the menu and select Triggers
3. Tap the + button
4. Select the Event type and Phase
5. Write the trigger script

### Trigger Examples

#### Data Validation

```javascript
// Validate that a number is within range
var num = entry().field("Number");
if (num < 0 || num > 200) {
  message("Number must be between 0 and 200");
  cancel();
}
```

#### Setting Default Values

```javascript
// Set default values for a new entry
entryDefault().set("Date", new Date());
entryDefault().set("Status", "Pending");
```

#### Creating Related Entries

```javascript
// Create a related entry in another library
var e = entry();
var otherLib = libByName("Related Library");
var newEntry = {
  "Parent ID": e.id,
  "Name": e.field("Name") + " - Related",
  "Date": new Date()
};
otherLib.create(newEntry);
```

## Actions

Actions are scripts that run when the user taps a button in the toolbar.

### Creating Actions

1. Open the library
2. Open the menu and select Scripts
3. Tap the + button and select Actions
4. Select the context (Library, Entry, or Bulk)
5. Write the action script

### Action Examples

#### Export to CSV

```javascript
// Export library data to a CSV file
var entries = lib().entries();
var f = file("export.csv");

// Write header
var headerLine = "Name,Date,Status\n";
f.write(headerLine);

// Write data
for (var i = 0; i < entries.length; i++) {
  var e = entries[i];
  var line = e.field("Name") + "," + 
             e.field("Date") + "," + 
             e.field("Status") + "\n";
  f.write(line);
}

f.close();
message("Export completed");
```

#### Send Data to Web Service

```javascript
// Send entry data to a web service
var e = entry();
var data = {
  id: e.id,
  name: e.field("Name"),
  date: e.field("Date"),
  status: e.field("Status")
};

var response = http().post(
  "https://api.example.com/submit",
  JSON.stringify(data)
);

if (response.code == 200) {
  message("Data sent successfully");
} else {
  message("Error: " + response.body);
}
```

## Synchronization and Cloud

### Google Sheets Sync

Memento Database can synchronize libraries with Google Sheets, allowing you to:
- Edit data in either Memento or Google Sheets
- Share data with users who don't have Memento
- Use Google Sheets for advanced data analysis

#### Setting Up Google Sheets Sync

1. Open the library
2. Open the menu and select Sync
3. Select Google Sheets
4. Sign in to your Google account
5. Configure sync settings

### Memento Cloud

Memento Cloud provides synchronization across devices and platforms:
- Sync libraries between Android devices
- Access libraries from Windows, Linux, or macOS
- Automatic background synchronization

#### Setting Up Memento Cloud

1. Create a Memento Cloud account
2. Open the library
3. Open the menu and select Sync
4. Select Memento Cloud
5. Sign in to your Memento Cloud account
6. Configure sync settings

### Teamwork

Memento Cloud enables collaboration with other users:
- Share libraries with team members
- Control access permissions
- Track changes made by team members

#### Sharing a Library

1. Open the library
2. Open the menu and select Share
3. Enter the email address of the user to share with
4. Select access permissions (View, Edit, or Admin)
5. Tap Share

## Security

### Library Protection

Sensitive data can be protected with encryption:
- AES-128 encryption
- Password protection
- Encrypted synchronization

#### Enabling Library Protection

1. Open the library
2. Open the menu and select Settings
3. Enable Library Protection
4. Set a password
5. Configure protection settings

### Script Permissions

Scripts require specific permissions to access certain features:
- Library access
- File access
- Network access

#### Setting Script Permissions

1. Open the library
2. Open the menu and select Triggers or Scripts
3. Tap the Shield icon
4. Configure permissions for libraries, files, and network

## Best Practices

### Database Design

- **Plan your structure**: Define your data model before creating libraries
- **Normalize data**: Avoid duplicating data across libraries
- **Use appropriate field types**: Choose the right field type for each piece of data
- **Create relationships**: Use Link to Entry fields to connect related data
- **Organize fields**: Use pages and subheaders to group related fields
- **Set default values**: Provide sensible defaults to speed up data entry
- **Validate data**: Use triggers to ensure data integrity

### JavaScript Coding

- **Use semicolons**: End statements with semicolons for clarity
- **Check for null values**: Always validate field values before using them
- **Handle errors**: Use try-catch blocks to handle exceptions
- **Comment your code**: Document complex logic for future reference
- **Avoid long scripts**: Break complex tasks into smaller functions
- **Test thoroughly**: Test scripts with various input scenarios

### Performance Optimization

- **Limit entry count**: Large libraries can slow down performance
- **Use indexes**: Set appropriate fields as indexes for faster searching
- **Optimize scripts**: Minimize loops and complex calculations
- **Cache data**: Use variables to store frequently accessed data
- **Batch operations**: Group related operations to reduce overhead

## Advanced Examples

### Historical Data Tracking

Track changes to data over time using the HistoricalData utility:

```javascript
// Get the current valid value from a historical data table
var currentRate = std.Utils.HistoricalData.getCurrentValue(
  'Employee Rates',    // table name
  'employee_id',       // key field name
  'E001',              // key value to match
  'hourly_rate',       // value field to retrieve
  'valid_from'         // date field for validity
);

// Get the rate valid at a specific date
var historicalRate = std.Utils.HistoricalData.getValueAtDate(
  'Employee Rates',
  'employee_id',
  'E001',
  'hourly_rate',
  'valid_from',
  new Date(2025, 2, 15)  // March 15, 2025
);

// Get all historical values for an entity
var rateHistory = std.Utils.HistoricalData.getHistoricalValues(
  'Employee Rates',
  'employee_id',
  'E001',
  'hourly_rate',
  'valid_from'
);
```

### Automated Workflows

Create automated workflows using triggers and actions:

```javascript
// Trigger: When a task is marked as completed
var e = entry();
if (e.field("Status") === "Completed") {
  // Update completion date
  e.set("Completion Date", new Date());
  
  // Notify assignee
  var assignee = e.field("Assignee")[0];
  if (assignee) {
    // Send email notification
    var cfg = {
      "host": "smtp.example.com",
      "port": 25,
      "user": "notifications",
      "pass": "password",
      "from": "notifications@example.com"
    };
    
    var subject = "Task Completed: " + e.field("Title");
    var message = "The task '" + e.field("Title") + "' has been marked as completed.";
    
    email().send(cfg, assignee.field("Email"), subject, message);
  }
  
  // Create follow-up task if needed
  if (e.field("Requires Follow-up")) {
    var tasksLib = libByName("Tasks");
    var followUpTask = {
      "Title": "Follow up on: " + e.field("Title"),
      "Description": "Follow up on completed task: " + e.field("Description"),
      "Due Date": std.Utils.Date.addDays(new Date(), 7),
      "Status": "Pending",
      "Priority": "Medium",
      "Assignee": e.field("Assignee")
    };
    tasksLib.create(followUpTask);
  }
}
```

### Integration with External Services

Integrate Memento Database with external services using HTTP requests:

```javascript
// Action: Sync inventory with online store
var inventoryLib = lib();
var inventory = inventoryLib.entries();
var productsToUpdate = [];

for (var i = 0; i < inventory.length; i++) {
  var product = inventory[i];
  productsToUpdate.push({
    id: product.field("Product ID"),
    name: product.field("Name"),
    price: product.field("Price"),
    stock: product.field("Stock")
  });
}

// Set up authentication
http().headers({
  "Authorization": "Bearer your_api_token",
  "Content-Type": "application/json"
});

// Send data to API
var response = http().post(
  "https://api.yourstore.com/products/update",
  JSON.stringify(productsToUpdate)
);

// Process response
if (response.code === 200) {
  var result = JSON.parse(response.body);
  message("Updated " + result.updated + " products");
  
  // Update sync timestamp
  for (var i = 0; i < inventory.length; i++) {
    inventory[i].set("Last Synced", new Date());
  }
} else {
  message("Error: " + response.body);
}
```

---

This documentation provides a comprehensive overview of Memento Database and its capabilities. For more specific information or examples, refer to the Memento Database Wiki or the in-app help documentation.
