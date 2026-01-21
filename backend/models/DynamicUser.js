import mongoose from 'mongoose';
import getTenantConnection from '../utils/tenantConnection.js';

/**
 * Dynamic User Model for Multi-Database Multi-Tenancy
 * 
 * Each tenant gets their own database:
 * - tenant_xyz (Project A) -> Collection: registeredusers
 * - tenant_abc (Project B) -> Collection: registeredusers
 * - tenant_projectc (Project C) -> Collection: registeredusers
 * 
 * Benefits:
 * - Complete database-level isolation
 * - Easy to backup/restore individual tenant data
 * - Better for enterprise clients
 */

// User Schema - Same structure for all tenants
const userSchema = new mongoose.Schema({
  // Which tenant/project this user belongs to
  tenantId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  
  // Dynamic fields - stores whatever fields the tenant requires
  // This is flexible and can store any key-value pairs
  // Example for Project A (xyz): { name: 'John Doe', email: 'john@example.com' }
  // Example for Project B (abc): { name: 'Jane', email: 'jane@example.com', phone: '1234567890' }
  fields: {
    type: mongoose.Schema.Types.Mixed,  // Allows any structure
    required: true
  }
}, {
  timestamps: true,  // Automatically adds createdAt and updatedAt fields
  collection: 'registeredusers'  // Collection name in tenant database
});

// Create indexes for better query performance
userSchema.index({ createdAt: -1 });
userSchema.index({ 'fields.email': 1 }, { sparse: true });

// Cache for tenant-specific models to avoid recreating them
const tenantUserModels = {};

/**
 * Get or create a User model for a specific tenant's database
 * 
 * @param {string} tenantId - The tenant identifier (e.g., 'xyz', 'abc')
 * @returns {Promise<mongoose.Model>} - The Mongoose model for this tenant's users
 */
export const getUserModel = async (tenantId) => {
  // Normalize tenant ID
  const normalizedTenantId = tenantId.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Return cached model if it exists
  if (tenantUserModels[normalizedTenantId]) {
    return tenantUserModels[normalizedTenantId];
  }
  
  // Get connection to tenant's database
  const tenantConnection = await getTenantConnection(tenantId);
  
  // Create or get model from this connection
  let model;
  if (tenantConnection.models.RegisteredUser) {
    model = tenantConnection.models.RegisteredUser;
  } else {
    model = tenantConnection.model('RegisteredUser', userSchema);
  }
  
  // Cache the model
  tenantUserModels[normalizedTenantId] = model;
  
  return model;
};

export default getUserModel;
