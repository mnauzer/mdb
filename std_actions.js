// Standardized Actions for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Actions module that handles all Memento Database actions
 * This module can be used directly in Memento Database scripts
 * without requiring the ASISTANTO Scripts table.
 *
 * To use these actions:
 * 1. Copy this file to your Memento Database library's Scripts section
 * 2. In your library settings, go to the Actions tab
 * 3. For each action, select the corresponding function from this module
 *    For example, for a "Generate Report" action, select "generateReport"
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// Actions module
std.Actions = {
  /**
   * Generate a report for the current entry
   * @returns {String} - The generated report HTML
   */
  generateReport: function() {
    try {
      // Get the current entry
      var en = entry();

      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;

      // Get constants and utils
      var constants = (typeof std !== 'undefined' && std.Constants) ?
                      std.Constants :
                      { FIELDS: { COMMON: { VIEW: 'view' } }, VIEW_STATES: { PRINT: 'Tlač' } };

      var utils = (typeof std !== 'undefined' && std.Utils) ?
                  std.Utils :
                  null;

      var html = (typeof std !== 'undefined' && std.HTML) ?
                std.HTML :
                null;

      // Set view state to print
      if (utils && utils.Field) {
        utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.PRINT);
      } else {
        en.set('view', 'Tlač');
      }

      // Generate report based on library type
      var reportHtml = '';

      if (html) {
        // Try to load a template for the library
        var templateName = libName.toLowerCase().replace(/\s+/g, '_');
        var template = html.loadTemplate(templateName);

        if (template) {
          // Convert entry to a data object
          var data = this._entryToObject(en);

          // Render the template
          reportHtml = html.renderTemplate(template, data);
        } else {
          // Generate a generic report
          reportHtml = this._generateGenericReport(en);
        }
      } else {
        // Generate a generic report without the HTML module
        reportHtml = this._generateGenericReport(en);
      }

      return reportHtml;
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

      return '<h1>Error generating report</h1><p>' + e.toString() + '</p>';
    }
  },

  /**
   * Generate an invoice for the current entry
   * @returns {String} - The generated invoice HTML
   */
  generateInvoice: function() {
    try {
      // Get the current entry
      var en = entry();

      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;

      // Get constants and utils
      var constants = (typeof std !== 'undefined' && std.Constants) ?
                      std.Constants :
                      { FIELDS: { COMMON: { VIEW: 'view' } }, VIEW_STATES: { PRINT: 'Tlač' } };

      var utils = (typeof std !== 'undefined' && std.Utils) ?
                  std.Utils :
                  null;

      var html = (typeof std !== 'undefined' && std.HTML) ?
                std.HTML :
                null;

      // Set view state to print
      if (utils && utils.Field) {
        utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.PRINT);
      } else {
        en.set('view', 'Tlač');
      }

      // Generate invoice
      var invoiceHtml = '';

      if (html) {
        // Try to load the invoice template
        var template = html.loadTemplate('invoice_template');

        if (template) {
          // Convert entry to a data object
          var data = this._entryToObject(en);

          // Add additional invoice data
          data.invoiceDate = utils ? utils.Date.format(new Date(), 'full') : new Date().toLocaleDateString();
          data.dueDate = utils ? utils.Date.format(utils.Date.addDays(new Date(), 14), 'full') : new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString();

          // Render the template
          invoiceHtml = html.renderTemplate(template, data);
        } else {
          // Generate a generic invoice
          invoiceHtml = this._generateGenericInvoice(en);
        }
      } else {
        // Generate a generic invoice without the HTML module
        invoiceHtml = this._generateGenericInvoice(en);
      }

      return invoiceHtml;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.generateInvoice", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in generateInvoice: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }

      return '<h1>Error generating invoice</h1><p>' + e.toString() + '</p>';
    }
  },

  /**
   * Generate a price quote for the current entry
   * @returns {String} - The generated price quote HTML
   */
  generatePriceQuote: function() {
    try {
      // Get the current entry
      var en = entry();

      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;

      // Get constants and utils
      var constants = (typeof std !== 'undefined' && std.Constants) ?
                      std.Constants :
                      { FIELDS: { COMMON: { VIEW: 'view' } }, VIEW_STATES: { PRINT: 'Tlač' } };

      var utils = (typeof std !== 'undefined' && std.Utils) ?
                  std.Utils :
                  null;

      var html = (typeof std !== 'undefined' && std.HTML) ?
                std.HTML :
                null;

      // Set view state to print
      if (utils && utils.Field) {
        utils.Field.setValue(en, constants.FIELDS.COMMON.VIEW, constants.VIEW_STATES.PRINT);
      } else {
        en.set('view', 'Tlač');
      }

      // Generate price quote
      var quoteHtml = '';

      if (html) {
        // Try to load the quote template
        var template = html.loadTemplate('quote_template');

        if (template) {
          // Convert entry to a data object
          var data = this._entryToObject(en);

          // Add additional quote data
          data.quoteDate = utils ? utils.Date.format(new Date(), 'full') : new Date().toLocaleDateString();

          // Calculate validity date
          var validityPeriod = 10; // Default validity period in days
          if (constants && constants.DEFAULTS && constants.DEFAULTS.PRICE_QUOTES) {
            validityPeriod = parseInt(constants.DEFAULTS.PRICE_QUOTES.VALIDITY_PERIOD, 10) || 10;
          }

          if (utils && utils.Field && constants && constants.FIELDS && constants.FIELDS.PRICE_QUOTE) {
            var customValidityPeriod = utils.Field.getValue(en, constants.FIELDS.PRICE_QUOTE.VALIDITY_PERIOD, null);
            if (customValidityPeriod) {
              validityPeriod = parseInt(customValidityPeriod, 10) || validityPeriod;
            }
          }

          data.validUntil = utils ? utils.Date.format(utils.Date.addDays(new Date(), validityPeriod), 'full') : new Date(new Date().getTime() + validityPeriod * 24 * 60 * 60 * 1000).toLocaleDateString();

          // Render the template
          quoteHtml = html.renderTemplate(template, data);
        } else {
          // Generate a generic price quote
          quoteHtml = this._generateGenericPriceQuote(en);
        }
      } else {
        // Generate a generic price quote without the HTML module
        quoteHtml = this._generateGenericPriceQuote(en);
      }

      return quoteHtml;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.generatePriceQuote", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in generatePriceQuote: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }

      return '<h1>Error generating price quote</h1><p>' + e.toString() + '</p>';
    }
  },

  /**
   * Export entries to CSV
   * @returns {String} - The generated CSV
   */
  exportToCSV: function() {
    try {
      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;

      // Get all entries
      var entries = currentLib.entries();

      // Get field names
      var fields = currentLib.fields();

      // Generate CSV header
      var csv = '';
      for (var i = 0; i < fields.length; i++) {
        if (i > 0) {
          csv += ',';
        }
        csv += '"' + fields[i].name.replace(/"/g, '""') + '"';
      }
      csv += '\n';

      // Generate CSV rows
      for (var j = 0; j < entries.length; j++) {
        var en = entries[j];

        for (var k = 0; k < fields.length; k++) {
          if (k > 0) {
            csv += ',';
          }

          var value = '';
          try {
            value = en.field(fields[k].name);

            // Format value based on type
            if (value instanceof Date) {
              value = value.toISOString();
            } else if (typeof value === 'object') {
              value = JSON.stringify(value);
            } else if (value !== null && value !== undefined) {
              value = value.toString();
            }
          } catch (e) {
            value = '';
          }

          csv += '"' + (value || '').replace(/"/g, '""') + '"';
        }

        csv += '\n';
      }

      // Save CSV to file
      var fileName = libName.replace(/\s+/g, '_') + '_export_' + new Date().toISOString().replace(/[:.]/g, '-') + '.csv';
      var csvFile = file(fileName);
      csvFile.writeText(csv);

      // Show success message
      var successDialog = dialog();
      successDialog.title('Export Successful')
                  .text('Exported ' + entries.length + ' entries to ' + fileName)
                  .positiveButton('OK', function() {})
                  .show();

      return csv;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.exportToCSV", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in exportToCSV: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }

      return '';
    }
  },

  /**
   * Send an email with the current entry data
   * @returns {Boolean} - True if successful, false otherwise
   */
  sendEmail: function() {
    try {
      // Get the current entry
      var en = entry();

      // Get the current library
      var currentLib = lib();
      var libName = currentLib.title;

      // Generate email subject
      var subject = libName + ' - ';

      // Try to get a meaningful subject
      if (en.field('Názov')) {
        subject += en.field('Názov');
      } else if (en.field('Číslo')) {
        subject += en.field('Číslo');
      } else if (en.field('Dátum')) {
        var date = en.field('Dátum');
        if (date instanceof Date) {
          subject += date.toLocaleDateString();
        } else {
          subject += date;
        }
      } else {
        subject += 'Entry #' + en.id();
      }

      // Generate email body
      var body = 'Library: ' + libName + '\n\n';

      // Get field names
      var fields = currentLib.fields();

      // Add fields to body
      for (var i = 0; i < fields.length; i++) {
        var fieldName = fields[i].name;

        // Skip internal fields
        if (fieldName === 'view' || fieldName === 'appMsg') {
          continue;
        }

        var value = '';
        try {
          value = en.field(fieldName);

          // Format value based on type
          if (value instanceof Date) {
            value = value.toLocaleDateString() + ' ' + value.toLocaleTimeString();
          } else if (typeof value === 'object') {
            if (Array.isArray(value)) {
              value = value.join(', ');
            } else {
              value = JSON.stringify(value);
            }
          } else if (value !== null && value !== undefined) {
            value = value.toString();
          }
        } catch (e) {
          value = '';
        }

        body += fieldName + ': ' + value + '\n';
      }

      // Show email dialog
      var emailDialog = dialog();
      emailDialog.title('Send Email')
                .text('Subject: ' + subject + '\n\nBody: ' + body)
                .negativeButton('Cancel', function() {})
                .positiveButton('Send', function() {
                  // Send email
                  var emailIntent = intent('android.intent.action.SEND');
                  emailIntent.type('message/rfc822');
                  emailIntent.extra('android.intent.extra.SUBJECT', subject);
                  emailIntent.extra('android.intent.extra.TEXT', body);
                  emailIntent.send();
                })
                .show();

      return true;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions.sendEmail", true);
      } else {
        // Use dialog instead of message
        var errorDialog = dialog();
        errorDialog.title('Chyba')
                  .text('Error in sendEmail: ' + e.toString())
                  .positiveButton('OK', function() {})
                  .show();
      }

      return false;
    }
  },

  /**
   * Generate a generic report for an entry
   * @param {Object} en - The entry to generate a report for
   * @returns {String} - The generated HTML
   * @private
   */
  _generateGenericReport: function(en) {
    try {
      if (!en) {
        return '<h1>Error: No entry provided</h1>';
      }

      // Get the current library
      var currentLib = en.lib();
      var libName = currentLib.title;

      // Generate HTML
      var html = '<html><head><title>' + libName + ' Report</title>';
      html += '<style>';
      html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
      html += 'h1 { color: #333; }';
      html += 'table { border-collapse: collapse; width: 100%; }';
      html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
      html += 'th { background-color: #f2f2f2; }';
      html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
      html += '</style></head><body>';

      // Add header
      html += '<h1>' + libName + ' Report</h1>';

      // Add entry details
      html += '<table>';

      // Get field names
      var fields = currentLib.fields();

      // Add fields to table
      for (var i = 0; i < fields.length; i++) {
        var fieldName = fields[i].name;

        // Skip internal fields
        if (fieldName === 'view' || fieldName === 'appMsg') {
          continue;
        }

        var value = '';
        try {
          value = en.field(fieldName);

          // Format value based on type
          if (value instanceof Date) {
            value = value.toLocaleDateString() + ' ' + value.toLocaleTimeString();
          } else if (typeof value === 'object') {
            if (Array.isArray(value)) {
              value = value.join(', ');
            } else {
              value = JSON.stringify(value);
            }
          } else if (value !== null && value !== undefined) {
            value = value.toString();
          }
        } catch (e) {
          value = '';
        }

        html += '<tr><th>' + fieldName + '</th><td>' + value + '</td></tr>';
      }

      html += '</table>';

      // Add footer
      html += '<p><em>Generated on ' + new Date().toLocaleString() + '</em></p>';

      html += '</body></html>';

      return html;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions._generateGenericReport", false);
      }

      return '<h1>Error generating report</h1><p>' + e.toString() + '</p>';
    }
  },

  /**
   * Generate a generic invoice for an entry
   * @param {Object} en - The entry to generate an invoice for
   * @returns {String} - The generated HTML
   * @private
   */
  _generateGenericInvoice: function(en) {
    try {
      if (!en) {
        return '<h1>Error: No entry provided</h1>';
      }

      // Get the current library
      var currentLib = en.lib();
      var libName = currentLib.title;

      // Generate HTML
      var html = '<html><head><title>Invoice</title>';
      html += '<style>';
      html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
      html += 'h1 { color: #333; }';
      html += '.invoice-header { display: flex; justify-content: space-between; margin-bottom: 20px; }';
      html += '.invoice-details { margin-bottom: 20px; }';
      html += 'table { border-collapse: collapse; width: 100%; }';
      html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
      html += 'th { background-color: #f2f2f2; }';
      html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
      html += '.total { font-weight: bold; text-align: right; margin-top: 20px; }';
      html += '</style></head><body>';

      // Add header
      html += '<div class="invoice-header">';
      html += '<div><h1>INVOICE</h1></div>';
      html += '<div><p>Date: ' + new Date().toLocaleDateString() + '</p>';
      html += '<p>Invoice #: ';

      // Try to get invoice number
      if (en.field('Číslo')) {
        html += en.field('Číslo');
      } else {
        html += 'INV-' + new Date().getFullYear() + '-' + en.id();
      }

      html += '</p></div>';
      html += '</div>';

      // Add invoice details
      html += '<div class="invoice-details">';
      html += '<p><strong>From:</strong> Your Company Name</p>';
      html += '<p><strong>To:</strong> ';

      // Try to get client name
      if (en.field('Klient')) {
        html += en.field('Klient');
      } else if (en.field('Zákazník')) {
        html += en.field('Zákazník');
      } else if (en.field('Odberateľ')) {
        html += en.field('Odberateľ');
      } else {
        html += 'Client Name';
      }

      html += '</p>';
      html += '<p><strong>Due Date:</strong> ' + new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString() + '</p>';
      html += '</div>';

      // Add items table
      html += '<table>';
      html += '<tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>';

      // Try to get items
      var items = [];
      var total = 0;

      if (en.field('Položky') && Array.isArray(en.field('Položky'))) {
        items = en.field('Položky');
      }

      if (items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var description = item.field ? item.field('Popis') || item.field('Názov') || 'Item ' + (i + 1) : 'Item ' + (i + 1);
          var quantity = item.field ? item.field('Množstvo') || 1 : 1;
          var unitPrice = item.field ? item.field('Cena') || 0 : 0;
          var amount = quantity * unitPrice;
          total += amount;

          html += '<tr>';
          html += '<td>' + description + '</td>';
          html += '<td>' + quantity + '</td>';
          html += '<td>' + unitPrice.toFixed(2) + ' €</td>';
          html += '<td>' + amount.toFixed(2) + ' €</td>';
          html += '</tr>';
        }
      } else {
        // Add a default item
        html += '<tr>';
        html += '<td>Service</td>';
        html += '<td>1</td>';
        html += '<td>0.00 €</td>';
        html += '<td>0.00 €</td>';
        html += '</tr>';
      }

      html += '</table>';

      // Add total
      html += '<div class="total">';
      html += '<p>Subtotal: ' + total.toFixed(2) + ' €</p>';
      html += '<p>VAT (20%): ' + (total * 0.2).toFixed(2) + ' €</p>';
      html += '<p>Total: ' + (total * 1.2).toFixed(2) + ' €</p>';
      html += '</div>';

      // Add footer
      html += '<p><em>Thank you for your business!</em></p>';

      html += '</body></html>';

      return html;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions._generateGenericInvoice", false);
      }

      return '<h1>Error generating invoice</h1><p>' + e.toString() + '</p>';
    }
  },

  /**
   * Generate a generic price quote for an entry
   * @param {Object} en - The entry to generate a price quote for
   * @returns {String} - The generated HTML
   * @private
   */
  _generateGenericPriceQuote: function(en) {
    try {
      if (!en) {
        return '<h1>Error: No entry provided</h1>';
      }

      // Get the current library
      var currentLib = en.lib();
      var libName = currentLib.title;

      // Generate HTML
      var html = '<html><head><title>Price Quote</title>';
      html += '<style>';
      html += 'body { font-family: Arial, sans-serif; margin: 20px; }';
      html += 'h1 { color: #333; }';
      html += '.quote-header { display: flex; justify-content: space-between; margin-bottom: 20px; }';
      html += '.quote-details { margin-bottom: 20px; }';
      html += 'table { border-collapse: collapse; width: 100%; }';
      html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
      html += 'th { background-color: #f2f2f2; }';
      html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
      html += '.total { font-weight: bold; text-align: right; margin-top: 20px; }';
      html += '</style></head><body>';

      // Add header
      html += '<div class="quote-header">';
      html += '<div><h1>PRICE QUOTE</h1></div>';
      html += '<div><p>Date: ' + new Date().toLocaleDateString() + '</p>';
      html += '<p>Quote #: ';

      // Try to get quote number
      if (en.field('Číslo')) {
        html += en.field('Číslo');
      } else {
        html += 'QUOTE-' + new Date().getFullYear() + '-' + en.id();
      }

      html += '</p></div>';
      html += '</div>';

      // Add quote details
      html += '<div class="quote-details">';
      html += '<p><strong>From:</strong> Your Company Name</p>';
      html += '<p><strong>To:</strong> ';

      // Try to get client name
      if (en.field('Klient')) {
        html += en.field('Klient');
      } else if (en.field('Zákazník')) {
        html += en.field('Zákazník');
      } else if (en.field('Odberateľ')) {
        html += en.field('Odberateľ');
      } else {
        html += 'Client Name';
      }

      html += '</p>';

      // Calculate validity date
      var validityPeriod = 10; // Default validity period in days
      if (en.field('Platnosť ponuky')) {
        validityPeriod = parseInt(en.field('Platnosť ponuky'), 10) || validityPeriod;
      }

      html += '<p><strong>Valid Until:</strong> ' + new Date(new Date().getTime() + validityPeriod * 24 * 60 * 60 * 1000).toLocaleDateString() + '</p>';
      html += '</div>';

      // Add items table
      html += '<table>';
      html += '<tr><th>Description</th><th>Quantity</th><th>Unit Price</th><th>Amount</th></tr>';

      // Try to get items
      var items = [];
      var total = 0;

      if (en.field('Položky') && Array.isArray(en.field('Položky'))) {
        items = en.field('Položky');
      }

      if (items.length > 0) {
        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var description = item.field ? item.field('Popis') || item.field('Názov') || 'Item ' + (i + 1) : 'Item ' + (i + 1);
          var quantity = item.field ? item.field('Množstvo') || 1 : 1;
          var unitPrice = item.field ? item.field('Cena') || 0 : 0;
          var amount = quantity * unitPrice;
          total += amount;

          html += '<tr>';
          html += '<td>' + description + '</td>';
          html += '<td>' + quantity + '</td>';
          html += '<td>' + unitPrice.toFixed(2) + ' €</td>';
          html += '<td>' + amount.toFixed(2) + ' €</td>';
          html += '</tr>';
        }
      } else {
        // Add a default item
        html += '<tr>';
        html += '<td>Service</td>';
        html += '<td>1</td>';
        html += '<td>0.00 €</td>';
        html += '<td>0.00 €</td>';
        html += '</tr>';
      }

      html += '</table>';

      // Add total
      html += '<div class="total">';
      html += '<p>Subtotal: ' + total.toFixed(2) + ' €</p>';
      html += '<p>VAT (20%): ' + (total * 0.2).toFixed(2) + ' €</p>';
      html += '<p>Total: ' + (total * 1.2).toFixed(2) + ' €</p>';
      html += '</div>';

      // Add terms and conditions
      html += '<h2>Terms and Conditions</h2>';
      html += '<p>1. This quote is valid for ' + validityPeriod + ' days from the date of issue.</p>';
      html += '<p>2. Payment terms: 50% advance payment, 50% upon completion.</p>';
      html += '<p>3. Delivery time: To be agreed upon acceptance of the quote.</p>';

      // Add footer
      html += '<p><em>Thank you for your interest in our services!</em></p>';

      html += '</body></html>';

      return html;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions._generateGenericPriceQuote", false);
      }

      return '<h1>Error generating price quote</h1><p>' + e.toString() + '</p>';
    }
  },

  /**
   * Convert a Memento entry to a plain JavaScript object
   * @param {Object} en - The entry to convert
   * @returns {Object} - The converted object
   * @private
   */
  _entryToObject: function(en) {
    try {
      if (!en) {
        return {};
      }

      // Get the current library
      var currentLib = en.lib();

      // Get field names
      var fields = currentLib.fields();

      // Create the data object
      var data = {
        id: en.id(),
        library: currentLib.title
      };

      // Add fields to the data object
      for (var i = 0; i < fields.length; i++) {
        var fieldName = fields[i].name;

        // Skip internal fields
        if (fieldName === 'view' || fieldName === 'appMsg') {
          continue;
        }

        try {
          var value = en.field(fieldName);

          // Format value based on type
          if (value instanceof Date) {
            // Store both formatted and raw date
            data[fieldName + '_raw'] = value;
            data[fieldName] = value.toLocaleDateString() + ' ' + value.toLocaleTimeString();
          } else if (typeof value === 'object') {
            if (Array.isArray(value)) {
              // For arrays of entries, convert each entry to an object
              if (value.length > 0 && value[0].field) {
                var items = [];
                for (var j = 0; j < value.length; j++) {
                  items.push(this._entryToObject(value[j]));
                }
                data[fieldName] = items;
              } else {
                data[fieldName] = value;
              }
            } else {
              data[fieldName] = value;
            }
          } else {
            data[fieldName] = value;
          }
        } catch (e) {
          data[fieldName] = null;
        }
      }

      return data;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "std.Actions._entryToObject", false);
      }

      return {};
    }
  }
};

// For backward compatibility
var std_Actions = std.Actions;

// Make actions available globally for Memento Database
// These are the functions that will be called directly by Memento
function generateReport() {
  return std.Actions.generateReport();
}

function generateInvoice() {
  return std.Actions.generateInvoice();
}

function generatePriceQuote() {
  return std.Actions.generatePriceQuote();
}

function exportToCSV() {
  return std.Actions.exportToCSV();
}

function sendEmail() {
  return std.Actions.sendEmail();
}
