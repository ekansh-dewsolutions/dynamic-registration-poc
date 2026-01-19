import mongoose from 'mongoose';

// Tenant Model - Represents different projects (Project A, Project B, etc.)
const tenantSchema = new mongoose.Schema({
  // Unique identifier for the tenant (e.g., 'xyz' for Project A, 'abc' for Project B)
  tenantId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Display name of the project
  name: {
    type: String,
    required: true
  },
  
  // Description of the project
  description: {
    type: String,
    default: ''
  },
  
  // Whether this tenant is active
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
