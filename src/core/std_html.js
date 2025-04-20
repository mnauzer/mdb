// Standardized HTML Generator for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * HTML generation and template processing module for the ASISTANTO STD framework
 * Provides functions for generating HTML and working with templates
 */

// Create namespace if it doesn't exist
if (typeof std === 'undefined') {
  var std = {};
}

// HTML module
std.HTML = {
  /**
   * Generate HTML from a template and data
   * @param {String} template - The HTML template with placeholders
   * @param {Object} data - The data to fill the placeholders
   * @returns {String} - The generated HTML
   */
  renderTemplate: function(template, data) {
    try {
      if (!template) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.logError("HTML", "renderTemplate", "Template is null or undefined");
        }
        return "";
      }
      
      if (!data) {
        data = {};
      }
      
      // Replace placeholders in the template
      var result = template;
      
      // Replace simple placeholders {{key}}
      result = result.replace(/\{\{([^}]+)\}\}/g, function(match, key) {
        var value = std.HTML._getValueFromData(data, key.trim());
        return value !== undefined ? value : match;
      });
      
      // Replace conditional blocks {{#if key}} content {{/if}}
      result = this._processConditionalBlocks(result, data);
      
      // Replace loop blocks {{#each key}} content {{/each}}
      result = this._processLoopBlocks(result, data);
      
      return result;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML.renderTemplate", false);
      }
      return template || "";
    }
  },
  
  /**
   * Load a template from a file
   * @param {String} templateName - The name of the template
   * @returns {String} - The template content
   */
  loadTemplate: function(templateName) {
    try {
      if (!templateName) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.logError("HTML", "loadTemplate", "Template name is null or undefined");
        }
        return "";
      }
      
      // Try to load the template from the templates directory
      var templatePath = "templates/" + templateName + ".html";
      
      // Check if the template exists
      var templateFile = file(templatePath);
      if (!templateFile.exists()) {
        // Try to load the template from the current directory
        templatePath = templateName + ".html";
        templateFile = file(templatePath);
        
        if (!templateFile.exists()) {
          if (typeof std !== 'undefined' && std.ErrorHandler) {
            std.ErrorHandler.logError("HTML", "loadTemplate", "Template not found: " + templateName);
          }
          return "";
        }
      }
      
      // Read the template content
      var templateContent = templateFile.readText();
      
      return templateContent;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML.loadTemplate", false);
      }
      return "";
    }
  },
  
  /**
   * Generate a table from data
   * @param {Array} data - The data to display in the table
   * @param {Array} columns - The columns to display
   * @param {Object} options - The options for the table
   * @returns {String} - The generated HTML table
   */
  generateTable: function(data, columns, options) {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.logError("HTML", "generateTable", "Data is null, undefined, or empty");
        }
        return "";
      }
      
      if (!columns || !Array.isArray(columns) || columns.length === 0) {
        // Generate columns from the first data item
        columns = [];
        for (var key in data[0]) {
          if (data[0].hasOwnProperty(key)) {
            columns.push({
              field: key,
              title: key
            });
          }
        }
      }
      
      // Default options
      options = options || {};
      options.tableClass = options.tableClass || "table table-striped";
      options.tableId = options.tableId || "data-table";
      options.headerClass = options.headerClass || "thead-dark";
      options.rowClass = options.rowClass || "";
      options.cellClass = options.cellClass || "";
      
      // Generate the table
      var html = '<table id="' + options.tableId + '" class="' + options.tableClass + '">';
      
      // Generate the header
      html += '<thead class="' + options.headerClass + '"><tr>';
      for (var i = 0; i < columns.length; i++) {
        html += '<th>' + columns[i].title + '</th>';
      }
      html += '</tr></thead>';
      
      // Generate the body
      html += '<tbody>';
      for (var j = 0; j < data.length; j++) {
        html += '<tr class="' + options.rowClass + '">';
        for (var k = 0; k < columns.length; k++) {
          var value = std.HTML._getValueFromData(data[j], columns[k].field);
          html += '<td class="' + options.cellClass + '">' + (value !== undefined ? value : '') + '</td>';
        }
        html += '</tr>';
      }
      html += '</tbody>';
      
      html += '</table>';
      
      return html;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML.generateTable", false);
      }
      return "";
    }
  },
  
  /**
   * Generate a form from a schema
   * @param {Object} schema - The form schema
   * @param {Object} data - The data to fill the form
   * @param {Object} options - The options for the form
   * @returns {String} - The generated HTML form
   */
  generateForm: function(schema, data, options) {
    try {
      if (!schema || typeof schema !== 'object') {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.logError("HTML", "generateForm", "Schema is null, undefined, or not an object");
        }
        return "";
      }
      
      // Default options
      options = options || {};
      options.formClass = options.formClass || "form";
      options.formId = options.formId || "data-form";
      options.labelClass = options.labelClass || "form-label";
      options.inputClass = options.inputClass || "form-control";
      options.buttonClass = options.buttonClass || "btn btn-primary";
      options.submitUrl = options.submitUrl || "#";
      options.submitMethod = options.submitMethod || "post";
      options.submitText = options.submitText || "Submit";
      
      // Generate the form
      var html = '<form id="' + options.formId + '" class="' + options.formClass + '" action="' + options.submitUrl + '" method="' + options.submitMethod + '">';
      
      // Generate the fields
      for (var key in schema) {
        if (schema.hasOwnProperty(key)) {
          var field = schema[key];
          var value = data && data[key] !== undefined ? data[key] : field.default || '';
          
          html += '<div class="form-group">';
          html += '<label for="' + key + '" class="' + options.labelClass + '">' + field.label + '</label>';
          
          switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
            case 'date':
              html += '<input type="' + field.type + '" id="' + key + '" name="' + key + '" class="' + options.inputClass + '" value="' + value + '"';
              if (field.required) {
                html += ' required';
              }
              if (field.placeholder) {
                html += ' placeholder="' + field.placeholder + '"';
              }
              if (field.min !== undefined) {
                html += ' min="' + field.min + '"';
              }
              if (field.max !== undefined) {
                html += ' max="' + field.max + '"';
              }
              html += '>';
              break;
            case 'textarea':
              html += '<textarea id="' + key + '" name="' + key + '" class="' + options.inputClass + '"';
              if (field.required) {
                html += ' required';
              }
              if (field.placeholder) {
                html += ' placeholder="' + field.placeholder + '"';
              }
              if (field.rows) {
                html += ' rows="' + field.rows + '"';
              }
              html += '>' + value + '</textarea>';
              break;
            case 'select':
              html += '<select id="' + key + '" name="' + key + '" class="' + options.inputClass + '"';
              if (field.required) {
                html += ' required';
              }
              html += '>';
              if (field.options) {
                for (var i = 0; i < field.options.length; i++) {
                  var option = field.options[i];
                  var optionValue = option.value !== undefined ? option.value : option;
                  var optionText = option.text !== undefined ? option.text : option;
                  var selected = optionValue == value ? ' selected' : '';
                  html += '<option value="' + optionValue + '"' + selected + '>' + optionText + '</option>';
                }
              }
              html += '</select>';
              break;
            case 'checkbox':
              html += '<div class="form-check">';
              html += '<input type="checkbox" id="' + key + '" name="' + key + '" class="form-check-input" value="1"';
              if (value) {
                html += ' checked';
              }
              if (field.required) {
                html += ' required';
              }
              html += '>';
              html += '<label for="' + key + '" class="form-check-label">' + field.label + '</label>';
              html += '</div>';
              break;
            case 'radio':
              if (field.options) {
                for (var j = 0; j < field.options.length; j++) {
                  var radioOption = field.options[j];
                  var radioValue = radioOption.value !== undefined ? radioOption.value : radioOption;
                  var radioText = radioOption.text !== undefined ? radioOption.text : radioOption;
                  var radioChecked = radioValue == value ? ' checked' : '';
                  html += '<div class="form-check">';
                  html += '<input type="radio" id="' + key + '_' + j + '" name="' + key + '" class="form-check-input" value="' + radioValue + '"' + radioChecked;
                  if (field.required) {
                    html += ' required';
                  }
                  html += '>';
                  html += '<label for="' + key + '_' + j + '" class="form-check-label">' + radioText + '</label>';
                  html += '</div>';
                }
              }
              break;
            default:
              html += '<input type="text" id="' + key + '" name="' + key + '" class="' + options.inputClass + '" value="' + value + '"';
              if (field.required) {
                html += ' required';
              }
              if (field.placeholder) {
                html += ' placeholder="' + field.placeholder + '"';
              }
              html += '>';
              break;
          }
          
          html += '</div>';
        }
      }
      
      // Generate the submit button
      html += '<button type="submit" class="' + options.buttonClass + '">' + options.submitText + '</button>';
      
      html += '</form>';
      
      return html;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML.generateForm", false);
      }
      return "";
    }
  },
  
  /**
   * Generate a card from data
   * @param {Object} data - The data to display in the card
   * @param {Object} options - The options for the card
   * @returns {String} - The generated HTML card
   */
  generateCard: function(data, options) {
    try {
      if (!data) {
        if (typeof std !== 'undefined' && std.ErrorHandler) {
          std.ErrorHandler.logError("HTML", "generateCard", "Data is null or undefined");
        }
        return "";
      }
      
      // Default options
      options = options || {};
      options.cardClass = options.cardClass || "card";
      options.cardId = options.cardId || "data-card";
      options.headerClass = options.headerClass || "card-header";
      options.bodyClass = options.bodyClass || "card-body";
      options.footerClass = options.footerClass || "card-footer";
      options.titleClass = options.titleClass || "card-title";
      options.subtitleClass = options.subtitleClass || "card-subtitle";
      options.textClass = options.textClass || "card-text";
      
      // Generate the card
      var html = '<div id="' + options.cardId + '" class="' + options.cardClass + '">';
      
      // Generate the header
      if (data.header) {
        html += '<div class="' + options.headerClass + '">' + data.header + '</div>';
      }
      
      // Generate the body
      html += '<div class="' + options.bodyClass + '">';
      
      // Generate the title
      if (data.title) {
        html += '<h5 class="' + options.titleClass + '">' + data.title + '</h5>';
      }
      
      // Generate the subtitle
      if (data.subtitle) {
        html += '<h6 class="' + options.subtitleClass + '">' + data.subtitle + '</h6>';
      }
      
      // Generate the text
      if (data.text) {
        html += '<p class="' + options.textClass + '">' + data.text + '</p>';
      }
      
      // Generate the content
      if (data.content) {
        html += data.content;
      }
      
      html += '</div>';
      
      // Generate the footer
      if (data.footer) {
        html += '<div class="' + options.footerClass + '">' + data.footer + '</div>';
      }
      
      html += '</div>';
      
      return html;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML.generateCard", false);
      }
      return "";
    }
  },
  
  /**
   * Process conditional blocks in a template
   * @param {String} template - The template with conditional blocks
   * @param {Object} data - The data to evaluate the conditions
   * @returns {String} - The processed template
   * @private
   */
  _processConditionalBlocks: function(template, data) {
    try {
      var result = template;
      
      // Process if blocks
      var ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
      result = result.replace(ifRegex, function(match, condition, content) {
        var value = std.HTML._getValueFromData(data, condition.trim());
        return value ? content : '';
      });
      
      // Process if-else blocks
      var ifElseRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g;
      result = result.replace(ifElseRegex, function(match, condition, ifContent, elseContent) {
        var value = std.HTML._getValueFromData(data, condition.trim());
        return value ? ifContent : elseContent;
      });
      
      return result;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML._processConditionalBlocks", false);
      }
      return template;
    }
  },
  
  /**
   * Process loop blocks in a template
   * @param {String} template - The template with loop blocks
   * @param {Object} data - The data to iterate over
   * @returns {String} - The processed template
   * @private
   */
  _processLoopBlocks: function(template, data) {
    try {
      var result = template;
      
      // Process each blocks
      var eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
      result = result.replace(eachRegex, function(match, key, content) {
        var items = std.HTML._getValueFromData(data, key.trim());
        if (!items || !Array.isArray(items) || items.length === 0) {
          return '';
        }
        
        var result = '';
        for (var i = 0; i < items.length; i++) {
          var itemData = items[i];
          var itemContent = content;
          
          // Replace item placeholders
          itemContent = itemContent.replace(/\{\{@index\}\}/g, i);
          itemContent = itemContent.replace(/\{\{@first\}\}/g, i === 0);
          itemContent = itemContent.replace(/\{\{@last\}\}/g, i === items.length - 1);
          
          // Replace item properties
          itemContent = itemContent.replace(/\{\{([^}]+)\}\}/g, function(match, itemKey) {
            var value = std.HTML._getValueFromData(itemData, itemKey.trim());
            return value !== undefined ? value : match;
          });
          
          result += itemContent;
        }
        
        return result;
      });
      
      return result;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML._processLoopBlocks", false);
      }
      return template;
    }
  },
  
  /**
   * Get a value from a data object using a dot notation path
   * @param {Object} data - The data object
   * @param {String} path - The path to the value
   * @returns {*} - The value at the path
   * @private
   */
  _getValueFromData: function(data, path) {
    try {
      if (!data || !path) {
        return undefined;
      }
      
      // Handle simple property access
      if (data[path] !== undefined) {
        return data[path];
      }
      
      // Handle dot notation
      var parts = path.split('.');
      var current = data;
      
      for (var i = 0; i < parts.length; i++) {
        if (current === null || current === undefined) {
          return undefined;
        }
        
        current = current[parts[i]];
      }
      
      return current;
    } catch (e) {
      if (typeof std !== 'undefined' && std.ErrorHandler) {
        std.ErrorHandler.createSystemError(e, "HTML._getValueFromData", false);
      }
      return undefined;
    }
  }
};

// For backward compatibility
var std_HTML = std.HTML;
