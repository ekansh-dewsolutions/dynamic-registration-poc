import express from 'express';
import FieldSchema from '../models/FieldSchema.js';
import { getUserModel } from '../models/DynamicUser.js';
import { validateFields } from '../utils/validation.js';

const router = express.Router();

// POST /api/register/:tenantId
// Generic registration endpoint that validates and stores users in tenant-specific collections
// Collections created: registereduser_xyz, registereduser_abc, etc.
router.post('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const submittedData = req.body;
    
    console.log(`📝 Registration request for tenant: ${tenantId}`);
    
    // Step 1: Get the field schema for this tenant
    const schema = await FieldSchema.findOne({ tenantId });
    
    if (!schema) {
      return res.status(404).json({ 
        success: false,
        message: `No field schema found for tenant: ${tenantId}` 
      });
    }
    
    // Step 2: Validate the submitted data against the schema
    const validation = validateFields(schema.fields, submittedData);
    
    // Step 3: If there are validation errors, return them
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    // Step 4: Get the tenant-specific User model (connects to tenant's database)
    // This creates/uses databases like: tenant_xyz, tenant_abc, tenant_projectc
    const UserModel = await getUserModel(tenantId);
    
    const newUser = new UserModel({
      tenantId,
      fields: validation.validatedFields
    });
    
    await newUser.save();
    
    console.log(`✅ User registered successfully in database: tenant_${tenantId}`);
    
    // Step 5: Return success response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        userId: newUser._id,
        tenantId: newUser.tenantId,
        fields: newUser.fields,
        databaseName: `tenant_${tenantId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        collectionName: 'registeredusers',
        createdAt: newUser.createdAt
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

// GET /api/register/:tenantId/users
// Retrieve all registered users for a specific tenant
router.get('/:tenantId/users', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    console.log(`📊 Fetching users for tenant: ${tenantId}`);
    
    // Get the tenant-specific User model (connects to tenant's database)
    const UserModel = await getUserModel(tenantId);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch users with pagination
    const users = await UserModel
      .find({ tenantId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count for pagination info
    const totalUsers = await UserModel.countDocuments({ tenantId });
    
    console.log(`✅ Found ${users.length} users in database: tenant_${tenantId}`);
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          limit: parseInt(limit)
        },
        databaseName: `tenant_${tenantId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        collectionName: 'registeredusers'
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching registered users',
      error: error.message 
    });
  }
});

// GET /api/register/:tenantId/users/:userId
// Retrieve a specific registered user by ID
router.get('/:tenantId/users/:userId', async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    
    // Get the tenant-specific User model
    const UserModel = getUserModel(tenantId);
    
    // Find the user by ID
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user',
      error: error.message 
    });
  }
});

export default router;
