# Dynamic Multi-Tenant Registration System - POC

A proof-of-concept for a dynamic registration system where different tenants (projects) can have different registration form fields configured through an admin panel.

## 🎯 Project Overview

This POC demonstrates:
- **Multi-tenancy**: Different projects (A & B) with unique tenant IDs
- **Dynamic Fields**: Each tenant can have different registration fields
- **Admin Panel**: Create and manage field schemas without code changes
- **Validation**: Both client-side and server-side validation
- **MERN Stack**: MongoDB, Express, React, Node.js

## 📁 Project Structure

```
dynamic-registration-poc/
├── backend/              # Express API server
├── admin-panel/          # React app for managing schemas
├── registration-app/     # React app for user registration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

### 1. Install MongoDB

**Option A: Local MongoDB**
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# The connection string will be: mongodb://localhost:27017/dynamic-registration
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Update `backend/.env` with your connection string

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# The .env file is already configured for local MongoDB
# If using MongoDB Atlas, edit backend/.env and update MONGODB_URI

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000` and automatically seed demo data for:
- **Project A (tenant: xyz)**: Fields - name, email
- **Project B (tenant: abc)**: Fields - name, email, phone

### 3. Setup Admin Panel

Open a new terminal window:

```bash
# Navigate to admin panel directory
cd admin-panel

# Install dependencies
npm install

# Start the admin panel
npm run dev
```

The admin panel will start on `http://localhost:3001`

### 4. Setup Registration App

Open another terminal window:

```bash
# Navigate to registration app directory
cd registration-app

# Install dependencies
npm install

# Start the registration app
npm run dev
```

The registration app will start on `http://localhost:3000`

## 🎮 How to Use

### Step 1: View/Edit Field Schemas (Admin Panel)

1. Open `http://localhost:3001` in your browser
2. You'll see two tenants: Project A (xyz) and Project B (abc)
3. Click on any tenant to view/edit its field schema
4. You can:
   - Add new fields
   - Edit existing fields (ID, label, type, validations)
   - Remove fields
   - Save changes

### Step 2: Test Registration (Registration App)

1. Open `http://localhost:3000` in your browser
2. By default, it shows Project A's registration form (name + email)
3. Fill in the form and submit
4. The form dynamically validates based on the schema

### Step 3: Switch Between Tenants

To test Project B's registration form:

```bash
# In registration-app directory
cp .env.projectB .env

# Restart the registration app
# Press Ctrl+C to stop, then run:
npm run dev
```

Now the registration form will show Project B's fields (name + email + phone)

## 📡 API Endpoints

### Public Endpoints (Used by Registration App)

- `GET /api/fields/:tenantId` - Get field schema for a tenant
- `POST /api/register/:tenantId` - Register a new user

### Admin Endpoints (Used by Admin Panel)

- `GET /api/admin/schemas` - Get all schemas and tenants
- `GET /api/admin/schemas/:tenantId` - Get specific schema
- `POST /api/admin/schemas` - Create new schema
- `PUT /api/admin/schemas/:tenantId` - Update schema
- `DELETE /api/admin/schemas/:tenantId` - Delete schema
- `POST /api/admin/tenants` - Create new tenant

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```
MONGODB_URI=mongodb://localhost:27017/dynamic-registration
PORT=5000
```

**Admin Panel** (`admin-panel/.env`):
```
VITE_API_URL=http://localhost:5000/api
```

**Registration App** (`registration-app/.env`):
```
VITE_API_URL=http://localhost:5000/api
VITE_TENANT_ID=xyz
```

## 💡 Key Features

### 1. Dynamic Form Generation
The registration form is generated dynamically based on the field schema fetched from the backend.

### 2. Validation
- **Client-side**: Instant feedback as users type
- **Server-side**: Final validation before saving to database
- Supports: required, minLength, maxLength, email format, phone format, regex patterns

### 3. Field Types Supported
- Text
- Email
- Phone
- Number
- Textarea

### 4. Admin Panel Features
- Visual schema builder
- Add/Edit/Remove fields
- Configure validations per field
- Preview changes before saving

## 📊 Demo Data

The backend automatically seeds two tenants:

**Tenant A (xyz)**:
- Name (required, 2-50 chars)
- Email (required, valid email)

**Tenant B (abc)**:
- Name (required, 2-50 chars)
- Email (required, valid email)
- Phone (required, 10-15 digits)

## 🛠️ Customization

### Adding a New Tenant

1. Use admin panel to create a new tenant (not yet implemented in UI, but API exists)
2. Or add directly in backend `server.js` seed function
3. Configure its field schema through the admin panel

### Adding New Field Types

Edit `backend/models/FieldSchema.js` and add to the enum:
```javascript
type: {
  type: String,
  enum: ['text', 'email', 'phone', 'number', 'textarea', 'date', 'checkbox'],
  //     ^^^^^ Add new types here
}
```

## 🧪 Testing the Flow

1. **Start all three applications** (backend, admin-panel, registration-app)
2. **Open admin panel** → Edit Project A → Add a new field (e.g., "Age")
3. **Refresh registration app** → The new field appears automatically
4. **Submit registration** → Data is validated and saved to MongoDB

## 📝 Notes for Frontend Developers

- **Backend code is well-commented** - Check the comments in each file
- **React components are simple** - Easy to customize styling
- **API responses follow consistent format**:
  ```javascript
  {
    success: true/false,
    message: "...",
    data: { ... }
  }
  ```

## 🎨 Styling

The project uses plain CSS. You can easily:
- Replace with TailwindCSS
- Use Material-UI or Ant Design
- Customize the existing styles in `src/index.css`

## 🐛 Troubleshooting

**Backend won't start:**
- Make sure MongoDB is running
- Check if port 5000 is available

**Can't connect to backend:**
- Verify backend is running on http://localhost:5000
- Check CORS settings in `backend/server.js`

**Form not loading:**
- Check browser console for errors
- Verify tenant ID in `.env` matches a tenant in database
- Make sure backend has seeded the initial data

## 🚀 Next Steps

Potential enhancements:
- Add more field types (date, checkbox, radio, dropdown)
- Implement multi-step forms
- Add file upload support
- Create tenant management in admin panel
- Add authentication/authorization
- Deploy to production (Vercel + MongoDB Atlas)

## 📄 License

This is a POC project for learning purposes.

---

**Happy Coding!** 🎉

If you have questions, check the inline comments in the code - they explain everything step by step.
