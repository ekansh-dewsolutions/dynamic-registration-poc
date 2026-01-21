import { useState, useEffect } from 'react'
import axios from 'axios'
import DynamicForm from './components/DynamicForm'

// Get configuration from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TENANT_ID = 'projectC'

function App() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch field schema when component mounts
  useEffect(() => {
    fetchFieldSchema()
  }, [])

  const fetchFieldSchema = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`Fetching schema for tenant: ${TENANT_ID}`)
      
      // Call the backend API to get field schema for this tenant
      const response = await axios.get(`${API_URL}/fields/${TENANT_ID}`)
      
      console.log('Schema received:', response.data)
      
      setFields(response.data.data.fields)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching field schema:', err)
      setError('Failed to load registration form. Please try again later.')
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Show loading state */}
      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading registration form...</p>
        </div>
      )}

      {/* Show error if any */}
      {error && (
        <div className="registration-card">
          <div className="alert alert-error">
            {error}
          </div>
          <button 
            className="btn-submit" 
            onClick={fetchFieldSchema}
          >
            Retry
          </button>
        </div>
      )}

      {/* Show the dynamic form once loaded */}
      {!loading && !error && (
        <DynamicForm 
          fields={fields} 
          tenantId={TENANT_ID}
          apiUrl={API_URL}
        />
      )}
    </div>
  )
}

export default App
