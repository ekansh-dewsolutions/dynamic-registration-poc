import express from 'express';
import FieldSchema from '../models/FieldSchema.js';

const router = express.Router();

// GET /api/fields/:tenantId
// This endpoint returns the field schema for a specific tenant
// Frontend will call this to know which fields to render in the registration form
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Find the field schema for this tenant
    const schema = await FieldSchema.findOne({ tenantId });
    
    if (!schema) {
      return res.status(404).json({ 
        success: false,
        message: `No field schema found for tenant: ${tenantId}` 
      });
    }
    
    // Return the schema with tenant ID and fields
    res.json({
      success: true,
      data: {
        tenantId: schema.tenantId,
        fields: schema.fields
      }
    });
    
  } catch (error) {
    console.error('Error fetching field schema:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching field schema',
      error: error.message 
    });
  }
});

export default router;
