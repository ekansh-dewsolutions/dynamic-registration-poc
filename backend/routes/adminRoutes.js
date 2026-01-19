import express from 'express';
import Tenant from '../models/Tenant.js';
import FieldSchema from '../models/FieldSchema.js';

const router = express.Router();

// GET /api/admin/schemas
// Get all field schemas (for listing all tenants in admin panel)
router.get('/schemas', async (req, res) => {
  try {
    const schemas = await FieldSchema.find();
    const tenants = await Tenant.find();
    
    res.json({
      success: true,
      data: {
        schemas,
        tenants
      }
    });
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching schemas',
      error: error.message 
    });
  }
});

// GET /api/admin/schemas/:tenantId
// Get a specific field schema for editing
router.get('/schemas/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const schema = await FieldSchema.findOne({ tenantId });
    
    if (!schema) {
      return res.status(404).json({ 
        success: false,
        message: `Schema not found for tenant: ${tenantId}` 
      });
    }
    
    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    console.error('Error fetching schema:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching schema',
      error: error.message 
    });
  }
});

// POST /api/admin/schemas
// Create a new field schema for a tenant
router.post('/schemas', async (req, res) => {
  try {
    const { tenantId, fields } = req.body;
    
    // Validate input
    if (!tenantId || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ 
        success: false,
        message: 'tenantId and fields array are required' 
      });
    }
    
    // Check if schema already exists
    const existingSchema = await FieldSchema.findOne({ tenantId });
    if (existingSchema) {
      return res.status(400).json({ 
        success: false,
        message: `Schema already exists for tenant: ${tenantId}. Use PUT to update.` 
      });
    }
    
    // Create new schema
    const newSchema = new FieldSchema({
      tenantId,
      fields
    });
    
    await newSchema.save();
    
    res.status(201).json({
      success: true,
      message: 'Field schema created successfully',
      data: newSchema
    });
    
  } catch (error) {
    console.error('Error creating schema:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating schema',
      error: error.message 
    });
  }
});

// PUT /api/admin/schemas/:tenantId
// Update an existing field schema
router.put('/schemas/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { fields } = req.body;
    
    // Validate input
    if (!fields || !Array.isArray(fields)) {
      return res.status(400).json({ 
        success: false,
        message: 'fields array is required' 
      });
    }
    
    // Update the schema
    const updatedSchema = await FieldSchema.findOneAndUpdate(
      { tenantId },
      { fields },
      { new: true, runValidators: true }
    );
    
    if (!updatedSchema) {
      return res.status(404).json({ 
        success: false,
        message: `Schema not found for tenant: ${tenantId}` 
      });
    }
    
    res.json({
      success: true,
      message: 'Field schema updated successfully',
      data: updatedSchema
    });
    
  } catch (error) {
    console.error('Error updating schema:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating schema',
      error: error.message 
    });
  }
});

// DELETE /api/admin/schemas/:tenantId
// Delete a field schema
router.delete('/schemas/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const deletedSchema = await FieldSchema.findOneAndDelete({ tenantId });
    
    if (!deletedSchema) {
      return res.status(404).json({ 
        success: false,
        message: `Schema not found for tenant: ${tenantId}` 
      });
    }
    
    res.json({
      success: true,
      message: 'Field schema deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting schema:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting schema',
      error: error.message 
    });
  }
});

// POST /api/admin/tenants
// Create a new tenant
router.post('/tenants', async (req, res) => {
  try {
    const { tenantId, name, description } = req.body;
    
    if (!tenantId || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'tenantId and name are required' 
      });
    }
    
    const newTenant = new Tenant({
      tenantId,
      name,
      description
    });
    
    await newTenant.save();
    
    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: newTenant
    });
    
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating tenant',
      error: error.message 
    });
  }
});

export default router;
