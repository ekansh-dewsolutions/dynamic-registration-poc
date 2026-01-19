import { useState, useEffect } from 'react'
import axios from 'axios'
import FieldEditor from '../components/FieldEditor'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function SchemaBuilder({ tenant, onBack, onSave }) {
  // State for all fields in the schema
  const [fields, setFields] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  // Load existing schema when component mounts
  useEffect(() => {
    if (tenant.schema && tenant.schema.fields) {
      setFields(tenant.schema.fields)
    } else {
      // Start with an empty array if no schema exists
      setFields([])
    }
  }, [tenant])

  // Add a new field to the schema
  const handleAddField = () => {
    const newField = {
      id: `field_${Date.now()}`, // Generate unique ID
      label: '',
      type: 'text',
      placeholder: '',
      validation: {
        required: false,
        minLength: null,
        maxLength: null,
        pattern: null
      },
      errorMessage: ''
    }
    
    setFields([...fields, newField])
  }

  // Update a specific field
  const handleFieldUpdate = (index, updatedField) => {
    const newFields = [...fields]
    newFields[index] = updatedField
    setFields(newFields)
  }

  // Remove a field from the schema
  const handleFieldRemove = (index) => {
    const newFields = fields.filter((_, i) => i !== index)
    setFields(newFields)
  }

  // Save the schema to the backend
  const handleSave = async () => {
    try {
      // Validate that all fields have required properties
      const invalidFields = fields.filter(f => !f.id || !f.label || !f.type)
      
      if (invalidFields.length > 0) {
        setMessage({ type: 'error', text: 'Please fill in all required fields (ID, Label, Type)' })
        return
      }

      setSaving(true)
      setMessage(null)

      // Check if this is a create or update operation
      const isUpdate = tenant.schema !== null

      let response
      if (isUpdate) {
        // Update existing schema
        response = await axios.put(`${API_URL}/admin/schemas/${tenant.tenantId}`, {
          fields
        })
      } else {
        // Create new schema
        response = await axios.post(`${API_URL}/admin/schemas`, {
          tenantId: tenant.tenantId,
          fields
        })
      }

      setMessage({ 
        type: 'success', 
        text: `Schema ${isUpdate ? 'updated' : 'created'} successfully!` 
      })
      
      // Wait a bit then call onSave callback
      setTimeout(() => {
        onSave()
      }, 1500)

    } catch (error) {
      console.error('Error saving schema:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save schema' 
      })
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="card">
        <div className="flex-between mb-20">
          <div>
            <h2>Edit Schema: {tenant.name}</h2>
            <p style={{ color: '#666', marginTop: '5px' }}>
              Tenant ID: <strong>{tenant.tenantId}</strong>
            </p>
          </div>
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to List
          </button>
        </div>

        {/* Show success/error messages */}
        {message && (
          <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
            {message.text}
          </div>
        )}

        {/* Instructions */}
        <div className="alert alert-info mb-20">
          <strong>Instructions:</strong> Add fields that users need to fill during registration. 
          Each field needs an ID (used in code), Label (shown to users), and Type.
        </div>

        {/* List of fields */}
        <div className="mb-20">
          <h3 style={{ marginBottom: '15px', color: '#333' }}>Registration Fields</h3>
          
          {fields.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>
              No fields added yet. Click "Add Field" to create your first field.
            </div>
          ) : (
            fields.map((field, index) => (
              <FieldEditor
                key={index}
                field={field}
                index={index}
                onUpdate={handleFieldUpdate}
                onRemove={handleFieldRemove}
              />
            ))
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-10">
          <button 
            className="btn btn-primary" 
            onClick={handleAddField}
          >
            + Add Field
          </button>
          
          <button 
            className="btn btn-success" 
            onClick={handleSave}
            disabled={saving || fields.length === 0}
          >
            {saving ? 'Saving...' : 'Save Schema'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SchemaBuilder
