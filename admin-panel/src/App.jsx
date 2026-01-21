import { useState, useEffect } from 'react'
import axios from 'axios'
import SchemaBuilder from './pages/SchemaBuilder'

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [tenants, setTenants] = useState([])
  const [schemas, setSchemas] = useState([])
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddTenant, setShowAddTenant] = useState(false)
  const [newTenant, setNewTenant] = useState({ tenantId: '', name: '', description: '' })
  const [addingTenant, setAddingTenant] = useState(false)
  const [addTenantError, setAddTenantError] = useState(null)

  // Fetch all tenants and schemas when component mounts
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call the admin API to get all schemas and tenants
      const response = await axios.get(`${API_URL}/admin/schemas`)
      
      setTenants(response.data.data.tenants)
      setSchemas(response.data.data.schemas)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Make sure the backend server is running.')
      setLoading(false)
    }
  }

  // When a tenant is selected, find its schema
  const handleTenantSelect = (tenantId) => {
    const schema = schemas.find(s => s.tenantId === tenantId)
    const tenant = tenants.find(t => t.tenantId === tenantId)
    
    setSelectedTenant({
      ...tenant,
      schema: schema || null
    })
  }

  // After schema is saved, refresh the data
  const handleSchemaSaved = () => {
    fetchData()
    setSelectedTenant(null)
  }

  // Handle adding a new tenant
  const handleAddTenant = async () => {
    try {
      setAddingTenant(true)
      setAddTenantError(null)

      // Validate inputs
      if (!newTenant.tenantId || !newTenant.name) {
        setAddTenantError('Tenant ID and Name are required')
        setAddingTenant(false)
        return
      }

      // Create the tenant
      await axios.post(`${API_URL}/admin/tenants`, {
        tenantId: newTenant.tenantId,
        name: newTenant.name,
        description: newTenant.description
      })

      // Reset form and close modal
      setNewTenant({ tenantId: '', name: '', description: '' })
      setShowAddTenant(false)
      setAddingTenant(false)

      // Refresh data
      await fetchData()
    } catch (error) {
      console.error('Error adding tenant:', error)
      setAddTenantError(error.response?.data?.message || 'Failed to add tenant')
      setAddingTenant(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="container">
          <h1>Admin Panel</h1>
          <p>Manage field schemas for different tenants</p>
        </div>
      </div>

      <div className="container">
        {/* Show error if any */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Show loading state */}
        {loading ? (
          <div className="loading">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* If no tenant is selected, show tenant list */}
            {!selectedTenant ? (
              <div className="card">
                <div className="flex-between mb-20">
                  <h2>Select a Tenant to Edit Schema</h2>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddTenant(true)}
                  >
                    + Add New Tenant
                  </button>
                </div>
                
                {tenants.length === 0 ? (
                  <div className="alert alert-info">
                    No tenants found. Click "Add New Tenant" to create one.
                  </div>
                ) : (
                  <div className="tenant-list">
                    {tenants.map(tenant => {
                      const hasSchema = schemas.find(s => s.tenantId === tenant.tenantId)
                      
                      return (
                        <div
                          key={tenant.tenantId}
                          className="tenant-card"
                          onClick={() => handleTenantSelect(tenant.tenantId)}
                        >
                          <h3>{tenant.name}</h3>
                          <p>{tenant.description}</p>
                          <span className="tenant-badge">
                            Tenant ID: {tenant.tenantId}
                          </span>
                          {hasSchema && (
                            <p style={{ marginTop: '10px', color: '#28a745', fontSize: '0.9rem' }}>
                              ✓ Schema configured ({hasSchema.fields.length} fields)
                            </p>
                          )}
                          {!hasSchema && (
                            <p style={{ marginTop: '10px', color: '#dc3545', fontSize: '0.9rem' }}>
                              ✗ No schema configured
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Show schema builder when a tenant is selected */
              <SchemaBuilder
                tenant={selectedTenant}
                onBack={() => setSelectedTenant(null)}
                onSave={handleSchemaSaved}
              />
            )}
          </>
        )}

        {/* Add Tenant Modal */}
        {showAddTenant && (
          <div className="modal-overlay" onClick={() => setShowAddTenant(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Add New Tenant</h2>
              
              {addTenantError && (
                <div className="alert alert-error mb-20">
                  {addTenantError}
                </div>
              )}

              <div className="form-group">
                <label>Tenant ID *</label>
                <input
                  type="text"
                  value={newTenant.tenantId}
                  onChange={(e) => setNewTenant({ ...newTenant, tenantId: e.target.value })}
                  placeholder="e.g., projectC, client123"
                />
                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  Unique identifier for the tenant (lowercase, no spaces)
                </small>
              </div>

              <div className="form-group">
                <label>Tenant Name *</label>
                <input
                  type="text"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  placeholder="e.g., Project C"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTenant.description}
                  onChange={(e) => setNewTenant({ ...newTenant, description: e.target.value })}
                  placeholder="Optional description"
                  rows="3"
                />
              </div>

              <div className="flex gap-10">
                <button 
                  className="btn btn-primary"
                  onClick={handleAddTenant}
                  disabled={addingTenant}
                >
                  {addingTenant ? 'Adding...' : 'Add Tenant'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddTenant(false)
                    setNewTenant({ tenantId: '', name: '', description: '' })
                    setAddTenantError(null)
                  }}
                  disabled={addingTenant}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
