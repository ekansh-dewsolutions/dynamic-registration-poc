import mongoose from 'mongoose';

// FieldSchema Model - Stores the dynamic field configuration for each tenant
const fieldSchemaSchema = new mongoose.Schema({
  // Tenant this schema belongs to (e.g., 'xyz' for Project A)
  tenantId: {
    type: String,
    required: true,
    unique: true,  // Each tenant can only have one field schema
    trim: true
  },
  
  // Array of fields that users need to fill during registration
  fields: [{
    // Unique field identifier (e.g., 'email', 'phone', 'name')
    id: {
      type: String,
      required: true
    },
    
    // Display label for the field (e.g., 'Email Address', 'Full Name')
    label: {
      type: String,
      required: true
    },
    
    // Input type: 'text', 'email', 'phone', 'number', 'textarea', 'select'
    type: {
      type: String,
      required: true,
      enum: ['text', 'email', 'phone', 'number', 'textarea', 'select'],
      default: 'text'
    },
    
    // Placeholder text for the input field
    placeholder: {
      type: String,
      default: ''
    },
    
    // For 'select' type fields - array of options
    options: [{
      label: String,
      value: String
    }],
    
    // Validation rules for this field
    validation: {
      // Is this field required?
      required: {
        type: Boolean,
        default: false
      },
      
      // Minimum length for text inputs
      minLength: {
        type: Number,
        default: null
      },
      
      // Maximum length for text inputs
      maxLength: {
        type: Number,
        default: null
      },
      
      // Regex pattern for validation (e.g., for email or phone)
      pattern: {
        type: String,
        default: null
      }
    },
    
    // Custom error message to show when validation fails
    errorMessage: {
      type: String,
      default: 'This field is invalid'
    }
  }]
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const FieldSchema = mongoose.model('FieldSchema', fieldSchemaSchema);

export default FieldSchema;
