import express from 'express';
import FieldSchema from '../models/FieldSchema.js';
import User from '../models/User.js';

const router = express.Router();

// POST /api/register/:tenantId
// This endpoint handles user registration with dynamic validation
// It validates the submitted data against the tenant's field schema
router.post('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const submittedData = req.body;
    
    // Step 1: Get the field schema for this tenant
    const schema = await FieldSchema.findOne({ tenantId });
    
    if (!schema) {
      return res.status(404).json({ 
        success: false,
        message: `No field schema found for tenant: ${tenantId}` 
      });
    }
    
    // Step 2: Validate the submitted data against the schema
    const errors = {};
    const validatedFields = {};
    
    // Loop through each field in the schema and validate
    for (const field of schema.fields) {
      const value = submittedData[field.id];
      
      // Check if required field is missing
      if (field.validation.required && (!value || value.trim() === '')) {
        errors[field.id] = field.errorMessage || `${field.label} is required`;
        continue;
      }
      
      // If field is not required and empty, skip further validation
      if (!value || value.trim() === '') {
        continue;
      }
      
      // Check minimum length
      if (field.validation.minLength && value.length < field.validation.minLength) {
        errors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
        continue;
      }
      
      // Check maximum length
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        errors[field.id] = `${field.label} must not exceed ${field.validation.maxLength} characters`;
        continue;
      }
      
      // Check pattern/regex validation
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          errors[field.id] = field.errorMessage || `${field.label} format is invalid`;
          continue;
        }
      }
      
      // Validate email format for email type fields
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.id] = field.errorMessage || 'Please enter a valid email address';
          continue;
        }
      }
      
      // Validate phone format for phone type fields
      if (field.type === 'phone') {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          errors[field.id] = field.errorMessage || 'Please enter a valid phone number';
          continue;
        }
      }
      
      // If validation passed, add to validated fields
      validatedFields[field.id] = value;
    }
    
    // Step 3: If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Step 4: Save the user to database
    const newUser = new User({
      tenantId,
      fields: validatedFields
    });
    
    await newUser.save();
    
    // Step 5: Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        userId: newUser._id,
        tenantId: newUser.tenantId,
        fields: newUser.fields
      }
    });
    
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing registration',
      error: error.message 
    });
  }
});

export default router;
