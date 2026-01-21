# Validation Flow Documentation

## Overview
The system uses **dynamic validation** where validation rules are defined in the backend and consumed by the frontend. There are **NO hardcoded validation checks** in the frontend.

## How It Works

### 1. Admin Defines Validation Rules
When creating/editing fields in the Admin Panel, administrators can specify:
- `required` - Whether the field is mandatory
- `minLength` - Minimum character length
- `maxLength` - Maximum character length
- `pattern` - Custom regex pattern for validation
- `errorMessage` - Custom error message to show users

### 2. Backend Stores Validation Rules
The `FieldSchema` model stores these validation rules in MongoDB:
```javascript
{
  tenantId: "projectA",
  fields: [
    {
      id: "email",
      label: "Email Address",
      type: "email",
      validation: {
        required: true,
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      },
      errorMessage: "Please enter a valid email address"
    }
  ]
}
```

### 3. Frontend Fetches Fields with Validation
When the registration form loads, it calls:
```
GET /api/fields/:tenantId
```

The response includes all field definitions **with their validation rules**:
```json
{
  "fields": [
    {
      "id": "email",
      "label": "Email Address",
      "type": "email",
      "validation": {
        "required": true,
        "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
      },
      "errorMessage": "Please enter a valid email address"
    }
  ]
}
```

### 4. Frontend Validates Dynamically
The `DynamicForm` component validates each field based on the rules received:

```javascript
const validateForm = () => {
  const newErrors = {}
  
  fields.forEach(field => {
    const value = formData[field.id] || ''
    const stringValue = String(value).trim()
    
    // Check required (if rule exists)
    if (field.validation?.required && !stringValue) {
      newErrors[field.id] = field.errorMessage
      return
    }
    
    // Check minLength (if rule exists)
    if (field.validation?.minLength && stringValue.length < field.validation.minLength) {
      newErrors[field.id] = field.errorMessage
      return
    }
    
    // Check maxLength (if rule exists)
    if (field.validation?.maxLength && stringValue.length > field.validation.maxLength) {
      newErrors[field.id] = field.errorMessage
      return
    }
    
    // Check custom pattern (if rule exists)
    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern)
      if (!regex.test(stringValue)) {
        newErrors[field.id] = field.errorMessage
        return
      }
    }
  })
  
  return Object.keys(newErrors).length === 0
}
```

### 5. Backend Validates Again
When the form is submitted, the backend performs server-side validation using the same rules:

```javascript
// backend/utils/validation.js
export const validateFields = (schemaFields, submittedData) => {
  const errors = {}
  
  for (const field of schemaFields) {
    const value = submittedData[field.id]
    
    // Same validation checks as frontend
    if (field.validation.required && !value) {
      errors[field.id] = field.errorMessage
    }
    
    if (field.validation.minLength && value.length < field.validation.minLength) {
      errors[field.id] = field.errorMessage
    }
    
    // ... etc
  }
  
  return { isValid: Object.keys(errors).length === 0, errors }
}
```

## Key Benefits

### ✅ Single Source of Truth
- Validation rules are defined **once** in the database
- Both frontend and backend use the **same rules**
- No duplication of validation logic

### ✅ Fully Dynamic
- Add/remove validation rules without code changes
- Customize error messages per field
- Different validation for different tenants

### ✅ Type-Agnostic
- No hardcoded checks for email, phone, etc.
- Everything is driven by the `pattern` field
- Frontend doesn't need to know about field types for validation

### ✅ Easy to Extend
- Want to add a new validation rule? Add it to the schema
- Frontend automatically picks it up
- No frontend code changes needed

## Example: Adding a New Validation Rule

If you want to add a new validation rule (e.g., `minValue` for numbers):

1. **Update the FieldSchema model** to include `minValue`:
```javascript
validation: {
  required: Boolean,
  minLength: Number,
  maxLength: Number,
  pattern: String,
  minValue: Number,  // NEW RULE
  maxValue: Number   // NEW RULE
}
```

2. **Update backend validation** (`backend/utils/validation.js`):
```javascript
if (field.validation.minValue && Number(value) < field.validation.minValue) {
  errors[field.id] = `${field.label} must be at least ${field.validation.minValue}`
}
```

3. **Update frontend validation** (`DynamicForm.jsx`):
```javascript
if (field.validation?.minValue && Number(stringValue) < field.validation.minValue) {
  newErrors[field.id] = field.errorMessage
}
```

That's it! The validation flows automatically through the system.

## Validation Flow Diagram

```
┌─────────────────┐
│  Admin Panel    │
│  (Define Rules) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB        │
│  (Store Rules)  │
└────────┬────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Frontend       │    │  Backend        │
│  (Fetch Rules)  │    │  (Fetch Rules)  │
└────────┬────────┘    └────────┬────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│  Client-Side    │    │  Server-Side    │
│  Validation     │    │  Validation     │
└─────────────────┘    └─────────────────┘
```

## Testing the Validation

1. Create a field with validation rules in the Admin Panel
2. Open the registration form - it automatically uses those rules
3. Try submitting invalid data - see the validation errors
4. Change the validation rules in Admin Panel
5. Refresh the form - new rules are applied automatically

**No code deployment needed!** 🎉
