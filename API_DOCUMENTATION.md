# Generic Registration API Documentation

## Overview

This API provides a generic registration system that validates fields dynamically and stores users in **tenant-specific collections**. Each tenant gets their own MongoDB collection for registered users.

### Collection Naming Convention
- **Project A (xyz)** → `registereduser_xyz`
- **Project B (abc)** → `registereduser_abc`
- **Project C (custom)** → `registereduser_custom`

---

## API Endpoints

### 1. Register a New User

**Endpoint:** `POST /api/register/:tenantId`

**Description:** Validates user data against the tenant's field schema and saves the user to a tenant-specific collection.

**URL Parameters:**
- `tenantId` (string, required) - The tenant identifier (e.g., 'xyz', 'abc')

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```
*Note: Fields vary based on tenant's schema configuration*

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "tenantId": "xyz",
    "fields": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "collectionName": "registereduser_xyz"
  }
}
```

**Validation Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Please enter a valid email address",
    "name": "Full Name is required"
  }
}
```

**Schema Not Found Response (404):**
```json
{
  "success": false,
  "message": "No field schema found for tenant: xyz"
}
```

---

### 2. Get All Registered Users for a Tenant

**Endpoint:** `GET /api/register/:tenantId/users`

**Description:** Retrieves all registered users from the tenant-specific collection with pagination support.

**URL Parameters:**
- `tenantId` (string, required) - The tenant identifier

**Query Parameters:**
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Number of users per page (default: 10)

**Example Request:**
```
GET /api/register/xyz/users?page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "tenantId": "xyz",
        "fields": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2026-01-20T10:30:00.000Z",
        "updatedAt": "2026-01-20T10:30:00.000Z"
      },
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "tenantId": "xyz",
        "fields": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        },
        "createdAt": "2026-01-20T11:00:00.000Z",
        "updatedAt": "2026-01-20T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 47,
      "limit": 10
    },
    "collectionName": "registereduser_xyz"
  }
}
```

---

### 3. Get a Specific Registered User

**Endpoint:** `GET /api/register/:tenantId/users/:userId`

**Description:** Retrieves a specific registered user by their ID from the tenant-specific collection.

**URL Parameters:**
- `tenantId` (string, required) - The tenant identifier
- `userId` (string, required) - The MongoDB ObjectId of the user

**Example Request:**
```
GET /api/register/xyz/users/65a1b2c3d4e5f6g7h8i9j0k1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "tenantId": "xyz",
    "fields": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2026-01-20T10:30:00.000Z",
    "updatedAt": "2026-01-20T10:30:00.000Z"
  }
}
```

**User Not Found Response (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Validation Rules

The API automatically validates submitted data based on the tenant's field schema. Validation includes:

### 1. **Required Fields**
- Fields marked as required must be provided and non-empty

### 2. **Field Types**
- **text**: Basic text input
- **email**: Validates email format (pattern: `user@domain.com`)
- **phone**: Validates phone numbers (10-15 digits, allows spaces, dashes, parentheses)
- **number**: Validates numeric values
- **textarea**: Multi-line text input
- **select**: Validates against predefined options

### 3. **Length Validation**
- **minLength**: Minimum character length
- **maxLength**: Maximum character length

### 4. **Pattern Validation**
- Custom regex patterns can be defined for each field

### 5. **Select Validation**
- Ensures selected value matches one of the predefined options

---

## Example Usage

### Registering a User for Project A (xyz)

**1. First, check the field schema:**
```bash
curl http://localhost:5000/api/fields/xyz
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "xyz",
    "fields": [
      {
        "id": "name",
        "label": "Full Name",
        "type": "text",
        "placeholder": "Enter your full name",
        "validation": { "required": true, "minLength": 2 }
      },
      {
        "id": "email",
        "label": "Email Address",
        "type": "email",
        "placeholder": "Enter your email",
        "validation": { "required": true }
      }
    ]
  }
}
```

**2. Register the user:**
```bash
curl -X POST http://localhost:5000/api/register/xyz \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

**3. Retrieve registered users:**
```bash
curl http://localhost:5000/api/register/xyz/users?page=1&limit=10
```

---

## Database Collections

Each tenant automatically gets their own collection when the first user registers:

```
MongoDB Collections:
├── fieldschemas          (stores field configurations)
├── tenants               (stores tenant information)
├── registereduser_xyz    (Project A users)
├── registereduser_abc    (Project B users)
└── registereduser_custom (Custom project users)
```

---

## Architecture

### Dynamic User Model Factory

The system uses a **dynamic model factory** pattern (`DynamicUser.js`) that:

1. Creates tenant-specific Mongoose models on-the-fly
2. Caches models to avoid recreating them
3. Uses the same schema structure for all tenants
4. Stores data in separate collections

```javascript
// Example: Getting a model for tenant 'xyz'
const UserModel = getUserModel('xyz');
// Creates/retrieves model for 'registereduser_xyz' collection

// Example: Getting a model for tenant 'abc'
const UserModel = getUserModel('abc');
// Creates/retrieves model for 'registereduser_abc' collection
```

### Validation Utilities

Centralized validation logic (`utils/validation.js`) provides:

- Field-level validation
- Type-specific validation
- Custom error messages
- Reusable validation functions

---

## Error Handling

The API returns consistent error responses:

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Error message"
  }
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

---

## Benefits of This Approach

1. **Data Isolation**: Each tenant's users are stored in separate collections
2. **Scalability**: Easy to manage and query tenant-specific data
3. **Flexibility**: Same validation logic works for all tenants
4. **Performance**: Direct queries to specific collections (no filtering needed)
5. **Maintainability**: Centralized validation and model management
6. **Security**: Natural data separation between tenants

---

## Testing the API

### Using cURL:

```bash
# Register a user for Project A
curl -X POST http://localhost:5000/api/register/xyz \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'

# Get all users for Project A
curl http://localhost:5000/api/register/xyz/users

# Get a specific user
curl http://localhost:5000/api/register/xyz/users/USER_ID
```

### Using JavaScript (fetch):

```javascript
// Register a user
const registerUser = async () => {
  const response = await fetch('http://localhost:5000/api/register/xyz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bob',
      email: 'bob@example.com'
    })
  });
  const data = await response.json();
  console.log(data);
};

// Get users
const getUsers = async () => {
  const response = await fetch('http://localhost:5000/api/register/xyz/users?page=1&limit=10');
  const data = await response.json();
  console.log(data);
};
```

---

## Next Steps

1. **Authentication**: Add authentication to protect endpoints
2. **Authorization**: Implement role-based access control
3. **Data Export**: Add endpoints to export user data
4. **Analytics**: Add endpoints for user statistics per tenant
5. **Webhooks**: Notify external systems when users register
