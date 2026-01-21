import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import fieldRoutes from './routes/fieldRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Import models for seeding
import Tenant from './models/Tenant.js';
import FieldSchema from './models/FieldSchema.js';

// Import tenant connection utilities
import { closeAllTenantConnections } from './utils/tenantConnection.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());  // Enable CORS for frontend to connect
app.use(express.json());  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies

// Routes
app.use('/api/fields', fieldRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Dynamic Registration API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      getFields: 'GET /api/fields/:tenantId',
      register: 'POST /api/register/:tenantId',
      admin: {
        listSchemas: 'GET /api/admin/schemas',
        getSchema: 'GET /api/admin/schemas/:tenantId',
        createSchema: 'POST /api/admin/schemas',
        updateSchema: 'PUT /api/admin/schemas/:tenantId',
        deleteSchema: 'DELETE /api/admin/schemas/:tenantId',
        createTenant: 'POST /api/admin/tenants'
      }
    }
  });
});

// Function to seed initial data (Project A and Project B)
async function seedInitialData() {
  try {
    // Check if data already exists
    const existingTenants = await Tenant.countDocuments();
    
    if (existingTenants > 0) {
      console.log('✓ Database already has data. Skipping seed.');
      return;
    }
    
    console.log('📝 Seeding initial data...');
    
    // Create Tenant A (xyz)
    const tenantA = new Tenant({
      tenantId: 'xyz',
      name: 'Project A',
      description: 'First project with basic fields'
    });
    await tenantA.save();
    
    // Create Tenant B (abc)
    const tenantB = new Tenant({
      tenantId: 'abc',
      name: 'Project B',
      description: 'Second project with extended fields'
    });
    await tenantB.save();
    
    // Create Field Schema for Tenant A (xyz) - name and email
    const schemaA = new FieldSchema({
      tenantId: 'xyz',
      fields: [
        {
          id: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your full name',
          validation: {
            required: true,
            minLength: 2,
            maxLength: 50
          },
          errorMessage: 'Please enter your full name (2-50 characters)'
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'Enter your email',
          validation: {
            required: true
          },
          errorMessage: 'Please enter a valid email address'
        }
      ]
    });
    await schemaA.save();
    
    // Create Field Schema for Tenant B (abc) - name, email, and phone
    const schemaB = new FieldSchema({
      tenantId: 'abc',
      fields: [
        {
          id: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Enter your full name',
          validation: {
            required: true,
            minLength: 2,
            maxLength: 50
          },
          errorMessage: 'Please enter your full name (2-50 characters)'
        },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'Enter your email',
          validation: {
            required: true
          },
          errorMessage: 'Please enter a valid email address'
        },
        {
          id: 'phone',
          label: 'Phone Number',
          type: 'phone',
          placeholder: 'Enter your phone number',
          validation: {
            required: true
          },
          errorMessage: 'Please enter a valid phone number (10-15 digits)'
        }
      ]
    });
    await schemaB.save();
    
    console.log('✓ Initial data seeded successfully!');
    console.log('  - Tenant A (xyz): name, email');
    console.log('  - Tenant B (abc): name, email, phone');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✓ Connected to MongoDB');
    
    // Seed initial data
    await seedInitialData();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ API documentation available at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  // Close all tenant database connections
  await closeAllTenantConnections();
  
  // Close main database connection
  await mongoose.connection.close();
  
  console.log('✅ All connections closed. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  
  // Close all tenant database connections
  await closeAllTenantConnections();
  
  // Close main database connection
  await mongoose.connection.close();
  
  console.log('✅ All connections closed. Goodbye!');
  process.exit(0);
});
