import { useState } from 'react'
import axios from 'axios'

function DynamicForm({ fields, tenantId, apiUrl }) {
  // State to store form values
  const [formData, setFormData] = useState({})
  
  // State to store validation errors
  const [errors, setErrors] = useState({})
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Handle input changes
  const handleChange = (fieldId, value) => {
    setFormData({
      ...formData,
      [fieldId]: value
    })
    
    // Clear error for this field when user starts typing
    if (errors[fieldId]) {
      setErrors({
        ...errors,
        [fieldId]: null
      })
    }
  }

  // Client-side validation
  const validateForm = () => {
    const newErrors = {}
    
    fields.forEach(field => {
      const value = formData[field.id] || ''
      
      // Check if required field is empty
      if (field.validation.required && !value.trim()) {
        newErrors[field.id] = field.errorMessage || `${field.label} is required`
        return
      }
      
      // Skip further validation if field is empty and not required
      if (!value.trim()) {
        return
      }
      
      // Validate minimum length
      if (field.validation.minLength && value.length < field.validation.minLength) {
        newErrors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`
        return
      }
      
      // Validate maximum length
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        newErrors[field.id] = `${field.label} must not exceed ${field.validation.maxLength} characters`
        return
      }
      
      // Validate email format
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors[field.id] = field.errorMessage || 'Please enter a valid email address'
          return
        }
      }
      
      // Validate phone format
      if (field.type === 'phone') {
        const phoneRegex = /^[0-9]{10,15}$/
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors[field.id] = field.errorMessage || 'Please enter a valid phone number'
          return
        }
      }
      
      // Validate custom regex pattern
      if (field.validation.pattern) {
        try {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(value)) {
            newErrors[field.id] = field.errorMessage || `${field.label} format is invalid`
            return
          }
        } catch (e) {
          console.error('Invalid regex pattern:', field.validation.pattern)
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    try {
      setSubmitting(true)
      setSubmitError(null)
      
      console.log('Submitting registration:', formData)
      
      // Submit to backend API
      const response = await axios.post(`${apiUrl}/register/${tenantId}`, formData)
      
      console.log('Registration successful:', response.data)
      
      // Show success state
      setSubmitted(true)
      
    } catch (err) {
      console.error('Registration error:', err)
      
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
        setSubmitError('Please fix the errors and try again')
      } else {
        setSubmitError(err.response?.data?.message || 'Registration failed. Please try again.')
      }
      
      setSubmitting(false)
    }
  }

  // Render input field based on type
  const renderField = (field) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]
    
    const commonProps = {
      id: field.id,
      name: field.id,
      value: value,
      onChange: (e) => handleChange(field.id, e.target.value),
      placeholder: field.placeholder || '',
      disabled: submitting
    }

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} />
      
      case 'email':
        return <input type="email" {...commonProps} />
      
      case 'phone':
        return <input type="tel" {...commonProps} />
      
      case 'number':
        return <input type="number" {...commonProps} />
      
      default:
        return <input type="text" {...commonProps} />
    }
  }

  // Show success screen after successful registration
  if (submitted) {
    return (
      <div className="registration-card">
        <div style={{ textAlign: 'center' }}>
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
            </div>
          </div>
          <h1 style={{ color: '#28a745', marginBottom: '15px' }}>Success!</h1>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
            Your registration has been completed successfully.
          </p>
          <button 
            className="btn-submit"
            onClick={() => {
              setSubmitted(false)
              setFormData({})
              setErrors({})
            }}
          >
            Register Another User
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="registration-card">
      <h1>Registration</h1>
      <p className="subtitle">Please fill in the required information</p>

      {/* Show submission error if any */}
      {submitError && (
        <div className="alert alert-error">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Dynamically render all fields */}
        {fields.map((field) => (
          <div 
            key={field.id} 
            className={`form-group ${errors[field.id] ? 'error' : ''}`}
          >
            <label htmlFor={field.id}>
              {field.label}
              {field.validation.required && (
                <span className="required">*</span>
              )}
            </label>
            
            {renderField(field)}
            
            {errors[field.id] && (
              <span className="error-message">
                {errors[field.id]}
              </span>
            )}
          </div>
        ))}

        {/* Submit button */}
        <button 
          type="submit" 
          className="btn-submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default DynamicForm
