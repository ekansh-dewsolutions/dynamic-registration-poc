import mongoose from 'mongoose';

/**
 * Tenant Database Connection Manager
 * 
 * This utility manages separate database connections for each tenant.
 * Each tenant gets their own database: tenant_xyz, tenant_abc, etc.
 * 
 * Benefits:
 * - Complete database-level isolation between tenants
 * - Easier to backup/restore individual tenant data
 * - Better for enterprise clients with strict data isolation requirements
 */

// Cache for tenant database connections
const tenantConnections = {};

/**
 * Get or create a database connection for a specific tenant
 * 
 * @param {string} tenantId - The tenant identifier (e.g., 'xyz', 'abc')
 * @returns {Promise<mongoose.Connection>} - Mongoose connection to tenant's database
 */
export const getTenantConnection = async (tenantId) => {
  // Normalize tenant ID to create valid database name
  const normalizedTenantId = tenantId.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Return cached connection if it exists and is connected
  if (tenantConnections[normalizedTenantId]) {
    const conn = tenantConnections[normalizedTenantId];
    if (conn.readyState === 1) { // 1 = connected
      return conn;
    }
  }

  try {
    // Get the base MongoDB URI from environment
    const baseUri = process.env.MONGODB_URI;
    
    // Extract the base URI without database name
    // Example: mongodb://localhost:27017/dynamic-registration -> mongodb://localhost:27017
    const uriParts = baseUri.split('/');
    const baseUriWithoutDb = uriParts.slice(0, -1).join('/');
    
    // Create tenant-specific database name
    const tenantDbName = `tenant_${normalizedTenantId}`;
    
    // Build full connection URI for this tenant
    const tenantUri = `${baseUriWithoutDb}/${tenantDbName}`;
    
    console.log(`📊 Creating connection to tenant database: ${tenantDbName}`);
    
    // Create new connection for this tenant
    const connection = mongoose.createConnection(tenantUri, {
      // Connection options
      maxPoolSize: 10, // Max 10 connections per tenant
      minPoolSize: 2,  // Keep at least 2 connections alive
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Wait for connection to be established
    await new Promise((resolve, reject) => {
      connection.once('open', resolve);
      connection.once('error', reject);
    });

    console.log(`✅ Connected to tenant database: ${tenantDbName}`);
    
    // Cache the connection
    tenantConnections[normalizedTenantId] = connection;
    
    return connection;
    
  } catch (error) {
    console.error(`❌ Error connecting to tenant database for ${tenantId}:`, error);
    throw new Error(`Failed to connect to tenant database: ${error.message}`);
  }
};

/**
 * Close a specific tenant's database connection
 * 
 * @param {string} tenantId - The tenant identifier
 */
export const closeTenantConnection = async (tenantId) => {
  const normalizedTenantId = tenantId.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (tenantConnections[normalizedTenantId]) {
    await tenantConnections[normalizedTenantId].close();
    delete tenantConnections[normalizedTenantId];
    console.log(`🔌 Closed connection to tenant database: tenant_${normalizedTenantId}`);
  }
};

/**
 * Close all tenant database connections
 * Useful for graceful shutdown
 */
export const closeAllTenantConnections = async () => {
  console.log('🔌 Closing all tenant database connections...');
  
  const closePromises = Object.keys(tenantConnections).map(async (tenantId) => {
    try {
      await tenantConnections[tenantId].close();
      console.log(`✅ Closed connection: tenant_${tenantId}`);
    } catch (error) {
      console.error(`❌ Error closing connection for tenant_${tenantId}:`, error);
    }
  });
  
  await Promise.all(closePromises);
  
  // Clear the cache
  Object.keys(tenantConnections).forEach(key => delete tenantConnections[key]);
  
  console.log('✅ All tenant connections closed');
};

/**
 * Get list of all active tenant connections
 * 
 * @returns {Array} - Array of tenant IDs with active connections
 */
export const getActiveTenantConnections = () => {
  return Object.keys(tenantConnections).filter(
    tenantId => tenantConnections[tenantId].readyState === 1
  );
};

export default getTenantConnection;
