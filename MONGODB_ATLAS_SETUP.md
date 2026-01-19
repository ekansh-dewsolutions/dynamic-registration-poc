# MongoDB Atlas Setup Guide (Free Online MongoDB)

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (or use Google/GitHub login)
3. Choose **FREE** tier (M0 Sandbox - completely free forever)

## Step 2: Create a Cluster

1. After login, click **"Build a Database"** or **"Create"**
2. Choose **FREE** tier (M0)
3. Select a cloud provider (AWS/Google/Azure - any is fine)
4. Choose a region close to you (e.g., Mumbai for India)
5. Keep default cluster name or change it
6. Click **"Create Cluster"** (takes 3-5 minutes to provision)

## Step 3: Set Up Database Access

1. Click **"Database Access"** in left sidebar (under Security)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `admin` (or any username you like)
5. Password: Click **"Autogenerate Secure Password"** and **COPY IT**
   - Or create your own password (save it somewhere!)
6. Database User Privileges: Choose **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Set Up Network Access

1. Click **"Network Access"** in left sidebar (under Security)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - This adds `0.0.0.0/0` which allows all IPs (safe for development)
4. Click **"Confirm"**

## Step 5: Get Connection String

1. Go back to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANT**: Replace `<password>` with your actual password from Step 3

## Step 6: Update Backend Configuration

Your connection string should look like:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dynamic-registration?retryWrites=true&w=majority
```

**Note**: Added `/dynamic-registration` before the `?` to specify database name

## Example

If your username is `admin` and password is `MyPass123`, your connection string would be:
```
mongodb+srv://admin:MyPass123@cluster0.abc123.mongodb.net/dynamic-registration?retryWrites=true&w=majority
```

---

## Quick Troubleshooting

**Can't connect?**
- Make sure you replaced `<password>` with actual password
- Check Network Access allows your IP (or 0.0.0.0/0)
- Wait 2-3 minutes after creating user/network rules

**Password has special characters?**
- URL encode them: `@` → `%40`, `#` → `%23`, etc.
- Or use a simpler password without special characters
