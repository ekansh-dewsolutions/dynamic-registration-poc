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
                <h2>Select a Tenant to Edit Schema</h2>
                
                {tenants.length === 0 ? (
                  <div className="alert alert-info">
                    No tenants found. The backend should seed initial data automatically.
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
      </div>
    </div>
  )
}

export default App
