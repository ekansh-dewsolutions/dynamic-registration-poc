/**
 * Shared Validation Utilities
 * Can be used by both frontend and backend to ensure consistent validation
 */

/**
 * Validates submitted data against a field schema
 * 
 * @param {Array} schemaFields - Array of field definitions from FieldSchema
 * @param {Object} submittedData - Data submitted by the user
 * @returns {Object} - Object with isValid flag, errors, and validated fields
 */
export const validateFields = (schemaFields, submittedData) => {
  const errors = {};
  const validatedFields = {};
  
  // Loop through each field in the schema and validate
  for (const field of schemaFields) {
    const value = submittedData[field.id];
    
    // Check if required field is missing
    if (field.validation.required && (!value || String(value).trim() === '')) {
      errors[field.id] = field.errorMessage || `${field.label} is required`;
      continue;
    }
    
    // If field is not required and empty, skip further validation
    if (!value || String(value).trim() === '') {
      continue;
    }
    
    // Convert to string for validation
    const stringValue = String(value);
    
    // Check minimum length
    if (field.validation.minLength && stringValue.length < field.validation.minLength) {
      errors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
      continue;
    }
    
    // Check maximum length
    if (field.validation.maxLength && stringValue.length > field.validation.maxLength) {
      errors[field.id] = `${field.label} must not exceed ${field.validation.maxLength} characters`;
      continue;
    }
    
    // Check pattern/regex validation
    if (field.validation.pattern) {
      try {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(stringValue)) {
          errors[field.id] = field.errorMessage || `${field.label} format is invalid`;
          continue;
        }
      } catch (e) {
        console.error('Invalid regex pattern:', field.validation.pattern);
      }
    }
    
    // Type-specific validation
    const typeValidationError = validateByType(field, stringValue);
    if (typeValidationError) {
      errors[field.id] = typeValidationError;
      continue;
    }
    
    // If validation passed, add to validated fields
    validatedFields[field.id] = value;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    validatedFields
  };
};

/**
 * Validates a field value based on its type
 * 
 * @param {Object} field - Field definition from schema
 * @param {string} value - The value to validate
 * @returns {string|null} - Error message if validation fails, null otherwise
 */
const validateByType = (field, value) => {
  switch (field.type) {
    case 'email':
      return validateEmail(value, field.errorMessage || 'Please enter a valid email address');
    
    case 'phone':
      return validatePhone(value, field.errorMessage || 'Please enter a valid phone number');
    
    case 'number':
      return validateNumber(value, field.errorMessage || 'Please enter a valid number');
    
    case 'select':
      return validateSelect(value, field.options, field.errorMessage || 'Please select a valid option');
    
    default:
      return null;
  }
};

/**
 * Validates email format
 */
const validateEmail = (value, errorMessage) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates phone number format
 */
const validatePhone = (value, errorMessage) => {
  // Remove common phone formatting characters
  const cleanedPhone = value.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^[0-9]{10,15}$/;
  
  if (!phoneRegex.test(cleanedPhone)) {
    return errorMessage;
  }
  return null;
};

/**
 * Validates number format
 */
const validateNumber = (value, errorMessage) => {
  if (isNaN(value) || value === '') {
    return errorMessage;
  }
  return null;
};

/**
 * Validates select field value against options
 */
const validateSelect = (value, options, errorMessage) => {
  if (!options || options.length === 0) {
    return null; // No options defined, skip validation
  }
  
  const validValues = options.map(opt => opt.value);
  if (!validValues.includes(value)) {
    return errorMessage;
  }
  return null;
};
