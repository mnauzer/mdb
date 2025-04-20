// Standardized Attendance Module for Memento Database
// Compatible with JavaScript 1.7
// Prefix: std_

/**
 * Business logic module for attendance-related operations
 * Provides standardized methods for working with attendance records
 */
var std_Attendance = {
  /**
   * Calculate work hours for an attendance record
   * @param {Object} entry - Attendance entry
   * @returns {Object} - Calculated totals
   */
  calculateWorkHours: function(entry) {
    if (!entry) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createValidationError('Entry is null or undefined', null, 'std_Attendance.calculateWorkHours', true);
      }
      return null;
    }
    
    try {
      var arrivalField = std_Constants.FIELDS.ATTENDANCE.ARRIVAL;
      var departureField = std_Constants.FIELDS.ATTENDANCE.DEPARTURE;
      
      var arrivalValue = std_Utils.Field.getValue(entry, arrivalField);
      var departureValue = std_Utils.Field.getValue(entry, departureField);
      
      // Handle string time values (e.g. "7:30")
      var arrival, departure;
      
      if (typeof arrivalValue === 'string') {
        arrival = std_Utils.Date.parseTime(arrivalValue);
      } else if (arrivalValue instanceof Date) {
        arrival = arrivalValue;
      } else {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createValidationError('Invalid arrival time', arrivalField, 'std_Attendance.calculateWorkHours', true);
        }
        return null;
      }
      
      if (typeof departureValue === 'string') {
        departure = std_Utils.Date.parseTime(departureValue);
      } else if (departureValue instanceof Date) {
        departure = departureValue;
      } else {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createValidationError('Invalid departure time', departureField, 'std_Attendance.calculateWorkHours', true);
        }
        return null;
      }
      
      // Validate times
      if (!arrival || !departure) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createValidationError('Missing arrival or departure time', null, 'std_Attendance.calculateWorkHours', true);
        }
        return null;
      }
      
      // Round times to nearest quarter hour
      arrival = std_Utils.Date.roundToQuarter(arrival);
      departure = std_Utils.Date.roundToQuarter(departure);
      
      // Ensure departure is after arrival
      if (departure <= arrival) {
        if (typeof std_ErrorHandler !== 'undefined') {
          std_ErrorHandler.createValidationError('Departure time must be after arrival time', null, 'std_Attendance.calculateWorkHours', true);
        }
        return null;
      }
      
      // Calculate work hours
      var workHours = std_Utils.Date.calculateHours(arrival, departure);
      
      // Calculate project hours from linked work records
      var projectHours = this.calculateProjectHours(entry);
      
      // Calculate idle time
      var idleTime = Math.max(0, workHours - projectHours);
      
      return {
        arrival: arrival,
        departure: departure,
        workHours: workHours,
        projectHours: projectHours,
        idleTime: idleTime
      };
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createBusinessError(e, 'std_Attendance.calculateWorkHours', true);
      } else {
        message('Error calculating work hours: ' + e.toString());
      }
      return null;
    }
  },
  
  /**
   * Calculate project hours from linked work records
   * @param {Object} entry - Attendance entry
   * @returns {Number} - Total project hours
   */
  calculateProjectHours: function(entry) {
    if (!entry) {
      return 0;
    }
    
    try {
      var workField = std_Constants.FIELDS.ATTENDANCE.WORK;
      var workRecords = std_DataAccess.getLinked(entry, workField);
      
      if (!workRecords || workRecords.length === 0) {
        return 0;
      }
      
      var totalHours = 0;
      
      for (var i = 0; i < workRecords.length; i++) {
        var startField = std_Constants.FIELDS.WORK_RECORD.START_TIME;
        var endField = std_Constants.FIELDS.WORK_RECORD.END_TIME;
        
        var startValue = std_Utils.Field.getValue(workRecords[i], startField);
        var endValue = std_Utils.Field.getValue(workRecords[i], endField);
        
        var start, end;
        
        if (typeof startValue === 'string') {
          start = std_Utils.Date.parseTime(startValue);
        } else if (startValue instanceof Date) {
          start = startValue;
        } else {
          continue;
        }
        
        if (typeof endValue === 'string') {
          end = std_Utils.Date.parseTime(endValue);
        } else if (endValue instanceof Date) {
          end = endValue;
        } else {
          continue;
        }
        
        if (start && end && end > start) {
          totalHours += std_Utils.Date.calculateHours(start, end);
        }
      }
      
      return totalHours;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createBusinessError(e, 'std_Attendance.calculateProjectHours', false);
      }
      return 0;
    }
  },
  
  /**
   * Calculate labor costs for an attendance record
   * @param {Object} entry - Attendance entry
   * @returns {Number} - Total labor costs
   */
  calculateLaborCosts: function(entry) {
    if (!entry) {
      return 0;
    }
    
    try {
      var employeesField = std_Constants.FIELDS.ATTENDANCE.EMPLOYEES;
      var employees = std_DataAccess.getLinked(entry, employeesField);
      
      if (!employees || employees.length === 0) {
        return 0;
      }
      
      var workHoursResult = this.calculateWorkHours(entry);
      if (!workHoursResult) {
        return 0;
      }
      
      var totalCosts = 0;
      var workHours = workHoursResult.workHours;
      
      for (var i = 0; i < employees.length; i++) {
        var hourlyRate = this.getEmployeeRate(employees[i]);
        var hourlyBonus = std_Utils.Field.getAttr(employees[i], std_Constants.EMPLOYEE_ATTRIBUTES.HOURLY_BONUS) || 0;
        var fixedBonus = std_Utils.Field.getAttr(employees[i], std_Constants.EMPLOYEE_ATTRIBUTES.FIXED_BONUS) || 0;
        var penalty = std_Utils.Field.getAttr(employees[i], std_Constants.EMPLOYEE_ATTRIBUTES.PENALTY) || 0;
        
        var employeeCost = workHours * (hourlyRate + hourlyBonus) + fixedBonus - penalty;
        totalCosts += employeeCost;
        
        // Update employee attributes
        std_Utils.Field.setAttr(employees[i], std_Constants.EMPLOYEE_ATTRIBUTES.HOURS_WORKED, workHours);
        std_Utils.Field.setAttr(employees[i], std_Constants.EMPLOYEE_ATTRIBUTES.HOURLY_RATE, hourlyRate);
        std_Utils.Field.setAttr(employees[i], std_Constants.EMPLOYEE_ATTRIBUTES.DAILY_WAGE, employeeCost);
      }
      
      return totalCosts;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createBusinessError(e, 'std_Attendance.calculateLaborCosts', true);
      } else {
        message('Error calculating labor costs: ' + e.toString());
      }
      return 0;
    }
  },
  
  /**
   * Get the hourly rate for an employee
   * @param {Object} employee - Employee entry
   * @returns {Number} - Hourly rate
   */
  getEmployeeRate: function(employee) {
    if (!employee) {
      return 0;
    }
    
    try {
      var date = new Date();
      var rateEntries = std_DataAccess.getLinkedFrom(
        employee, 
        std_Constants.LIBRARIES.DATABASES.EMPLOYEE_RATES, 
        std_Constants.FIELDS.EMPLOYEE.EMPLOYEE
      );
      
      if (!rateEntries || rateEntries.length === 0) {
        return 0;
      }
      
      // Filter by date and sort by date descending
      var validRates = [];
      for (var i = 0; i < rateEntries.length; i++) {
        var validFrom = std_Utils.Field.getValue(rateEntries[i], std_Constants.FIELDS.EMPLOYEE.VALID_FROM);
        if (validFrom instanceof Date && validFrom <= date) {
          validRates.push(rateEntries[i]);
        }
      }
      
      if (validRates.length === 0) {
        return 0;
      }
      
      validRates.sort(function(a, b) {
        var dateA = std_Utils.Field.getValue(a, std_Constants.FIELDS.EMPLOYEE.VALID_FROM);
        var dateB = std_Utils.Field.getValue(b, std_Constants.FIELDS.EMPLOYEE.VALID_FROM);
        return dateB - dateA;
      });
      
      // Get the most recent rate
      return std_Utils.Field.getValue(validRates[0], std_Constants.FIELDS.EMPLOYEE.RATE, 0);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createBusinessError(e, 'std_Attendance.getEmployeeRate', false);
      }
      return 0;
    }
  },
  
  /**
   * Process an attendance record
   * @param {Object} entry - Attendance entry
   * @param {Boolean} isEdit - Whether this is an edit of an existing entry
   * @returns {Boolean} - True if successful
   */
  processAttendanceRecord: function(entry, isEdit) {
    if (!entry) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createValidationError('Entry is null or undefined', null, 'std_Attendance.processAttendanceRecord', true);
      }
      return false;
    }
    
    try {
      // Calculate work hours
      var workHoursResult = this.calculateWorkHours(entry);
      if (!workHoursResult) {
        return false;
      }
      
      // Update entry with calculated values
      std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.ARRIVAL, workHoursResult.arrival);
      std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.DEPARTURE, workHoursResult.departure);
      std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.WORKING_HOURS, std_Utils.Number.round(workHoursResult.workHours, 2));
      std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.HOURS_WORKED, std_Utils.Number.round(workHoursResult.workHours, 2));
      std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.PROJECT_HOURS, std_Utils.Number.round(workHoursResult.projectHours, 2));
      std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.IDLE_TIME, std_Utils.Number.round(workHoursResult.idleTime, 2));
      
      // Calculate labor costs
      var laborCosts = this.calculateLaborCosts(entry);
      std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.LABOR_COSTS, std_Utils.Number.round(laborCosts, 2));
      
      // Set warning if project hours exceed work hours
      if (workHoursResult.projectHours > workHoursResult.workHours) {
        std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.APP_MESSAGE, std_Constants.MESSAGES.REQUIRES_ATTENTION);
      } else {
        std_Utils.Field.setValue(entry, std_Constants.FIELDS.ATTENDANCE.APP_MESSAGE, null);
      }
      
      // Generate liabilities if needed
      var generateLiabilities = std_Utils.Field.getValue(entry, std_Constants.FIELDS.ATTENDANCE.GENERATE_LIABILITIES, false);
      if (generateLiabilities) {
        this.generateLiabilities(entry, isEdit);
      }
      
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createBusinessError(e, 'std_Attendance.processAttendanceRecord', true);
      } else {
        message('Error processing attendance record: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Generate liabilities for an attendance record
   * @param {Object} entry - Attendance entry
   * @param {Boolean} isEdit - Whether this is an edit of an existing entry
   * @returns {Boolean} - True if successful
   */
  generateLiabilities: function(entry, isEdit) {
    if (!entry) {
      return false;
    }
    
    try {
      var employeesField = std_Constants.FIELDS.ATTENDANCE.EMPLOYEES;
      var employees = std_DataAccess.getLinked(entry, employeesField);
      
      if (!employees || employees.length === 0) {
        return false;
      }
      
      // If editing, delete existing liabilities
      if (isEdit) {
        var existingLiabilities = std_DataAccess.getLinkedFrom(
          entry,
          std_Constants.LIBRARIES.ADMIN.LIABILITIES,
          std_Constants.FIELDS.LIABILITY.ATTENDANCE
        );
        
        for (var i = 0; i < existingLiabilities.length; i++) {
          std_DataAccess.delete(existingLiabilities[i]);
        }
      }
      
      // Create new liabilities for each employee
      for (var j = 0; j < employees.length; j++) {
        var employee = employees[j];
        var dailyWage = std_Utils.Field.getAttr(employee, std_Constants.EMPLOYEE_ATTRIBUTES.DAILY_WAGE, 0);
        
        if (dailyWage <= 0) {
          continue;
        }
        
        var description = std_Utils.String.format(
          std_Constants.MESSAGES.WAGE_FOR_DAY,
          employee.name
        );
        
        var liabilityData = {};
        liabilityData[std_Constants.FIELDS.LIABILITY.TYPE] = std_Constants.WAGE_TYPES.WAGES;
        liabilityData[std_Constants.FIELDS.LIABILITY.AMOUNT] = dailyWage;
        liabilityData[std_Constants.FIELDS.LIABILITY.DESCRIPTION] = description;
        liabilityData[std_Constants.FIELDS.LIABILITY.INFO] = std_Constants.MESSAGES.AUTO_GENERATED;
        liabilityData[std_Constants.FIELDS.LIABILITY.ATTENDANCE] = entry;
        liabilityData[std_Constants.FIELDS.EMPLOYEE.EMPLOYEE] = employee;
        
        std_DataAccess.createStandardEntry(std_Constants.LIBRARIES.ADMIN.LIABILITIES, liabilityData);
      }
      
      return true;
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createBusinessError(e, 'std_Attendance.generateLiabilities', true);
      } else {
        message('Error generating liabilities: ' + e.toString());
      }
      return false;
    }
  },
  
  /**
   * Create a new attendance record with default values
   * @returns {Object} - Created entry or null if failed
   */
  createNewAttendanceRecord: function() {
    try {
      var data = {};
      data[std_Constants.FIELDS.ATTENDANCE.ARRIVAL] = std_Constants.DEFAULTS.ATTENDANCE.ARRIVAL;
      data[std_Constants.FIELDS.ATTENDANCE.DEPARTURE] = std_Constants.DEFAULTS.ATTENDANCE.DEPARTURE;
      
      return std_DataAccess.createStandardEntry(std_Constants.LIBRARIES.RECORDS.ATTENDANCE, data);
    } catch (e) {
      if (typeof std_ErrorHandler !== 'undefined') {
        std_ErrorHandler.createBusinessError(e, 'std_Attendance.createNewAttendanceRecord', true);
      } else {
        message('Error creating new attendance record: ' + e.toString());
      }
      return null;
    }
  }
};

// Make available globally
this.std_Attendance = std_Attendance;
