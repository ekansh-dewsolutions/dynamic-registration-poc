import mongoose from 'mongoose';

// User Model - Stores registered users with dynamic fields
const userSchema = new mongoose.Schema({
  // Which tenant/project this user belongs to
  tenantId: {
    type: String,
    required: true,
    trim: true
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
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

// Create an index on tenantId for faster queries
userSchema.index({ tenantId: 1 });

const User = mongoose.model('User', userSchema);

export default User;
