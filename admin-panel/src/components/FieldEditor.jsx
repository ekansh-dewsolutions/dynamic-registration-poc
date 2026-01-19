import { useState } from 'react'

function FieldEditor({ field, index, onUpdate, onRemove }) {
  // Local state for the field being edited
  const [isExpanded, setIsExpanded] = useState(false)

  // Handle input changes
  const handleChange = (property, value) => {
    const updatedField = { ...field }
    
    if (property.startsWith('validation.')) {
      // Handle nested validation properties
      const validationKey = property.split('.')[1]
      updatedField.validation = {
        ...updatedField.validation,
        [validationKey]: value
      }
    } else {
      updatedField[property] = value
    }
    
    onUpdate(index, updatedField)
  }

  return (
    <div className="field-item">
      <div className="field-item-header">
        <h4>
          {field.label || `Field ${index + 1}`} 
          <span style={{ color: '#999', fontWeight: 'normal', fontSize: '0.9rem', marginLeft: '10px' }}>
            ({field.type})
          </span>
        </h4>
        <div className="field-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button 
            className="btn btn-danger"
            onClick={() => onRemove(index)}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Remove
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid">
          {/* Field ID */}
          <div className="form-group">
            <label>Field ID *</label>
            <input
              type="text"
              value={field.id}
              onChange={(e) => handleChange('id', e.target.value)}
              placeholder="e.g., email, phone, name"
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Used in code (no spaces, lowercase recommended)
            </small>
          </div>

          {/* Field Label */}
          <div className="form-group">
            <label>Field Label *</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="e.g., Email Address"
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Displayed to users
            </small>
          </div>

          {/* Field Type */}
          <div className="form-group">
            <label>Field Type *</label>
            <select
              value={field.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
            </select>
          </div>

          {/* Placeholder */}
          <div className="form-group">
            <label>Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => handleChange('placeholder', e.target.value)}
              placeholder="Enter placeholder text"
            />
          </div>

          {/* Required Checkbox */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={field.validation.required}
                onChange={(e) => handleChange('validation.required', e.target.checked)}
              />
              Required Field
            </label>
          </div>

          {/* Min Length */}
          <div className="form-group">
            <label>Min Length</label>
            <input
              type="number"
              value={field.validation.minLength || ''}
              onChange={(e) => handleChange('validation.minLength', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Minimum characters"
              min="0"
            />
          </div>

          {/* Max Length */}
          <div className="form-group">
            <label>Max Length</label>
            <input
              type="number"
              value={field.validation.maxLength || ''}
              onChange={(e) => handleChange('validation.maxLength', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Maximum characters"
              min="0"
            />
          </div>

          {/* Pattern (Regex) */}
          <div className="form-group">
            <label>Pattern (Regex)</label>
            <input
              type="text"
              value={field.validation.pattern || ''}
              onChange={(e) => handleChange('validation.pattern', e.target.value)}
              placeholder="e.g., ^[A-Za-z]+$"
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Optional: JavaScript regex pattern
            </small>
          </div>

          {/* Error Message */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Error Message</label>
            <input
              type="text"
              value={field.errorMessage || ''}
              onChange={(e) => handleChange('errorMessage', e.target.value)}
              placeholder="Custom error message for validation failures"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldEditor
